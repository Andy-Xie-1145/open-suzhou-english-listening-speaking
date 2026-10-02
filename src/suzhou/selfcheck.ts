/**
 * 真机自检 —— 把「麦克风 → 采集 → 录音 → 模型 → 转写 → 拿到文本」逐环串一遍
 *
 * 许可：AGPL-3.0-only
 *
 * 为什么需要这个：
 * 单元测试全部使用桩实现，**真实浏览器里的麦克风权限、MediaRecorder 解码、
 * WASM 初始化、模型下载完整性从未被验证过**。没有这个入口，
 * 「能不能用」只能靠推测。本模块让任何人点一次就知道真机通不通。
 *
 * 设计要点：
 *  1. 六环各自独立报告，一环失败不阻断后续可测的环（比如麦克风被拒仍可测 WASM）。
 *  2. 失败必须区分原因类别，并给出**用户能执行**的补救步骤，不能只说「失败」。
 *  3. 纯逻辑（结果归类、文案生成）可在 Node 单测；浏览器 API 全部动态访问。
 */

export type CheckId =
  | 'environment'   // 运行环境
  | 'microphone'    // 麦克风授权
  | 'capture'       // 实际采集到音频
  | 'recording'     // MediaRecorder 产出可解码数据
  | 'wasm'          // ONNX Runtime 可用
  | 'model'         // Whisper 模型加载
  | 'transcribe'    // 转写产出非空文本
  | 'network';      // 模型下载连通性

export type CheckStatus = 'pass' | 'fail' | 'skip' | 'pending';

export interface CheckResultItem {
  id: CheckId;
  /** 环节中文名 */
  label: string;
  status: CheckStatus;
  /** 结论一句话 */
  summary: string;
  /** 技术细节，出问题时给开发者看 */
  detail?: string;
  /** 用户可以照做的补救步骤 */
  remedies: string[];
  /** 耗时（毫秒） */
  ms?: number;
}

export interface SelfCheckReport {
  items: CheckResultItem[];
  /** 是否全部通过（skip 不算失败） */
  allPassed: boolean;
  /** 首个失败的环节，用于界面定位 */
  firstFailure: CheckId | null;
  /** 总体结论 */
  verdict: string;
}
/* ------------------------------------------------------------------ *
 * 纯逻辑：失败归类与文案（可在 Node 单测，不碰任何浏览器 API）
 * ------------------------------------------------------------------ */

export const CHECK_LABELS: Record<CheckId, string> = {
  environment: '运行环境',
  microphone: '麦克风授权',
  capture: '音频采集',
  recording: '录音与解码',
  wasm: 'WASM 运行时',
  model: '语音模型加载',
  transcribe: '语音转写',
  network: '模型下载',
};

/** 网络错误归类：区分「下载没下完」与「根本没连上」 */
export type NetFailure =
  | 'offline'        // 浏览器报告离线
  | 'blocked'        // 被扩展/防火墙拦截
  | 'incomplete'     // 连接中断，文件没下完
  | 'notfound'       // 404 / 模型已下线
  | 'forbidden'      // 403 / 限流
  | 'unknown';

export function classifyNetworkFailure(e: unknown): NetFailure {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  if (nav && nav.onLine === false) return 'offline';
  const msg = (e instanceof Error ? e.message : String(e ?? '')).toLowerCase();
  if (/failed to fetch|networkerror|load failed|network/.test(msg)) return 'incomplete';
  if (/blocked|csp|extension/.test(msg)) return 'blocked';
  if (/404|not found|notfound/.test(msg)) return 'notfound';
  if (/403|forbidden|rate limit|429/.test(msg)) return 'forbidden';
  return 'unknown';
}

export const NETWORK_REMEDIES: Record<NetFailure, string[]> = {
  offline: [
    '设备当前处于离线状态，请先联网后重试。',
    '如果网线/热点刚断开，等系统识别到网络后再点一次。',
  ],
  blocked: [
    '请求被浏览器扩展或安全策略拦截。',
    '试试在无痕窗口打开，或暂时关闭广告拦截类扩展。',
  ],
  incomplete: [
    '模型文件下载中途断开，通常是网络不稳。',
    '请检查网络后重新点击加载；模型支持断点续传，不会从头开始。',
  ],
  notfound: [
    '模型地址返回 404，可能模型已被上游下线。',
    '请改用其他规格（如 tiny 或 base）再试。',
  ],
  forbidden: [
    '访问被拒绝（403）或触发限流（429）。',
    '等几分钟再试，或切换到其他规格。',
  ],
  unknown: [
    '无法归类的错误，请把下面的技术详情反馈给开发者。',
  ],
};

/** getUserMedia 的 DOMException 归类 —— 用户最常见的三种失败 */
export type MicFailure =
  | 'denied'        // 权限被拒
  | 'notfound'      // 没有麦克风设备
  | 'inuse'         // 设备被占用
  | 'insecure'      // 非安全上下文
  | 'unsupported'   // 浏览器不支持
  | 'unknown';

export function classifyMicFailure(e: unknown): MicFailure {
  const name = (e && typeof e === 'object' && 'name' in e) ? String((e as { name?: unknown }).name) : '';
  // SecurityError 在实践中主要来自「非安全上下文」或 permissions-policy 拦截，
  // 不是用户拒绝了权限。归到 denied 会给出错误补救（让人去改浏览器设置），
  // 而真正要做的是改用 https / localhost，所以单独归为 insecure。
  if (name === 'SecurityError') return 'insecure';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return 'denied';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'notfound';
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') return 'inuse';
  const msg = (e instanceof Error ? e.message : String(e ?? '')).toLowerCase();
  if (/permission|denied|权限|拒绝/.test(msg)) return 'denied';
  if (/not found|找不到|设备/.test(msg)) return 'notfound';
  if (/in use|already|占用/.test(msg)) return 'inuse';
  if (/https|secure|安全上下文|localhost/.test(msg)) return 'insecure';
  if (/not supported|不支持/.test(msg)) return 'unsupported';
  return 'unknown';
}
export const MIC_REMEDIES: Record<MicFailure, string[]> = {
  denied: [
    '浏览器已拒绝麦克风权限。',
    '点击地址栏左侧的锁形图标 → 网站设置 → 麦克风 → 改为「允许」，然后刷新本页。',
  ],
  notfound: [
    '系统没有检测到可用的麦克风设备。',
    '请确认麦克风已插好；在系统设置里检查输入设备是否被禁用。',
    '如果用的是蓝牙耳机，先确保它已连接并设为默认输入设备。',
  ],
  inuse: [
    '麦克风正被其他程序占用。',
    '请关闭正在使用麦克风的程序（视频会议、录屏、语音聊天等）后重试。',
  ],
  insecure: [
    '当前页面不是安全上下文，浏览器禁止访问麦克风。',
    '请通过 https:// 或 http://localhost 打开本页，直接双击 html 文件无效。',
  ],
  unsupported: [
    '当前浏览器不支持录音所需的 MediaRecorder。',
    '请改用较新版本的 Chrome、Edge 或 Safari。',
  ],
  unknown: [
    '无法归类的错误，请把下面的技术详情反馈给开发者。',
  ],
};

/** WASM / 模型加载失败的归类 */
export type WasmFailure =
  | 'notsupported'   // 浏览器不给 WASM
  | 'memory'         // 内存不足
  | 'network'        // 下载问题
  | 'unknown';

export function classifyWasmFailure(e: unknown): WasmFailure {
  const msg = (e instanceof Error ? e.message : String(e ?? '')).toLowerCase();
  const name = (e && typeof e === 'object' && 'name' in e) ? String((e as { name?: unknown }).name) : '';
  if (/out of memory|allocation failed|memory access|内存/.test(msg)) return 'memory';
  if (/wasm|simd|instantiate|compile/.test(msg)) return 'notsupported';
  if (/fetch|network|download|下载/.test(msg)) return 'network';
  if (name === 'CompileError' || name === 'LinkError') return 'notsupported';
  return 'unknown';
}

export const WASM_REMEDIES: Record<WasmFailure, string[]> = {
  notsupported: [
    '浏览器未能初始化 WebAssembly，可能是浏览器过旧或禁用了 WASM。',
    '请更新浏览器到最新版；企业环境请检查是否被安全策略禁用 WASM。',
    '若浏览器支持 WebGPU，页面会自动优先使用它来跑推理。',
  ],
  memory: [
    '模型加载时内存不足。',
    '请关闭其他占用内存的程序/标签页后重试。',
    '如果仍然失败，请改用最小规格 tiny（体积最小）。',
  ],
  network: [
    '模型文件未能下载完成。',
    '请检查网络连接后重新加载；断点续传会复用已下载的部分。',
  ],
  unknown: [
    '无法归类的错误，请把下面的技术详情反馈给开发者。',
  ],
};

/* ------------------------------------------------------------------ *
 * 报告组装（纯函数，可单测）
 * ------------------------------------------------------------------ */

export function buildReport(items: CheckResultItem[]): SelfCheckReport {
  const failures = items.filter(function (x) { return x.status === 'fail'; });
  const first = failures.length > 0 ? failures[0].id : null;
  let verdict: string;
  if (items.length === 0) {
    verdict = '尚未运行自检。';
  } else if (failures.length === 0) {
    const skipped = items.filter(function (x) { return x.status === 'skip'; });
    verdict = skipped.length === 0
      ? '全部通过：真实麦克风与浏览器端语音转写均可用。'
      : '关键环节全部通过（有 ' + skipped.length + ' 项被跳过）。';
  } else {
    verdict = failures.length + ' 项未通过，首个问题：' + CHECK_LABELS[first!] + '。按该环节的补救步骤处理后重试。';
  }
  // 空报告表示「还没跑」，绝不能算作全部通过——那会误导成验证OK
  const allPassed = items.length > 0 && failures.length === 0;
  return { items, allPassed, firstFailure: first, verdict };
}
/* ------------------------------------------------------------------ *
 * 执行器：真跑浏览器 API
 * ------------------------------------------------------------------ */

export interface SelfCheckDeps {
  /** 录音桩或真实录音器；用于 capture / recording 两环 */
  recorder?: {
    canRecord(): boolean;
    start(): Promise<void>;
    stop(): Promise<{ samples: Float32Array; sampleRate: number; durationMs: number }>;
  } | null;
  /** ASR 桩或真实适配器 */
  asr?: {
    ready(): boolean;
    status(): { status: string; percent: number; message: string };
    load(key?: string): Promise<boolean>;
    transcribe(samples: Float32Array, sampleRate: number): Promise<string>;
  } | null;
  /** 记录一段可朗读的提示音时长（毫秒），用于实际采集 */
  captureMs?: number;
}

function ok(id: CheckId, summary: string, ms?: number, detail?: string): CheckResultItem {
  return { id, label: CHECK_LABELS[id], status: 'pass', summary, ms, detail, remedies: [] };
}

function bad(id: CheckId, summary: string, remedies: string[], detail?: string, ms?: number): CheckResultItem {
  return { id, label: CHECK_LABELS[id], status: 'fail', summary, ms, detail, remedies };
}

function skip(id: CheckId, summary: string, detail?: string): CheckResultItem {
  return { id, label: CHECK_LABELS[id], status: 'skip', summary, detail, remedies: [] };
}

/** 运行环境探测：不依赖任何依赖，纯读 navigator/location */
function probeEnvironment(): CheckResultItem {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return bad('environment', '当前不是浏览器环境',
      ['请在浏览器中打开本页面。', 'Node 环境下无法验证麦克风与模型加载。'],
      'window/document undefined');
  }
  const loc = window.location;
  const secure = window.isSecureContext === true
    || loc.protocol === 'https:'
    || loc.hostname === 'localhost'
    || loc.hostname === '127.0.0.1';
  const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === 'function';
  const hasMR = typeof MediaRecorder !== 'undefined';

  const bits: string[] = [];
  bits.push('协议 ' + loc.protocol);
  bits.push('安全上下文 ' + (secure ? '是' : '否'));
  bits.push('getUserMedia ' + (hasMedia ? '可用' : '不可用'));
  bits.push('MediaRecorder ' + (hasMR ? '可用' : '不可用'));
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 0;
  if (cores) bits.push('逻辑核心 ' + cores);

  if (!secure) {
    return bad('environment', '页面不是安全上下文',
      ['浏览器只允许 https:// 或 http://localhost 访问麦克风。',
       '如果你是直接双击打开 html 文件，请改用本地服务器或部署到 https 地址。'],
      bits.join('，'));
  }
  return ok('environment', '运行环境满足要求', undefined, bits.join('，'));
}
export type SelfCheckProgress = (item: CheckResultItem) => void;

/**
 * 逐环执行自检。
 *
 * **关键设计：某环失败不阻断后续可测的环。**
 * 例如麦克风被拒时，仍应测出 WASM 与模型加载是否正常——
 * 用户一次就能看到全部问题，而不是修一个跑一次。
 */
export async function runSelfCheck(
  deps: SelfCheckDeps,
  onProgress?: SelfCheckProgress,
): Promise<SelfCheckReport> {
  const items: CheckResultItem[] = [];
  const push = (x: CheckResultItem) => { items.push(x); if (onProgress) onProgress(x); };
  const captureMs = deps.captureMs ?? 2500;

  push(probeEnvironment());

  // ---- 麦克风授权：真调 getUserMedia ----
  let stream: MediaStream | null = null;
  const hasGUM = typeof navigator !== 'undefined' && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === 'function';

  if (!hasGUM) {
    push(skip('microphone', '此环境无法请求麦克风权限', '无 getUserMedia'));
  } else {
    const t0 = Date.now();
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const tracks = stream.getAudioTracks();
      const label = tracks.length > 0 ? (tracks[0].label || '（名称未授权时为空）') : '无音轨';
      const res = ok('microphone', '麦克风授权成功', Date.now() - t0, '设备：' + label);
      push(res);
    } catch (e) {
      const kind = classifyMicFailure(e);
      const nm = (e && typeof e === 'object' && 'name' in e) ? String((e as { name?: unknown }).name) : 'Error';
      const res = bad('microphone', '无法使用麦克风', MIC_REMEDIES[kind], nm + ': ' + String(e), Date.now() - t0);
      push(res);
    }
  }

  // ---- 实际采集到音频：对着麦克风出声，看有没有信号 ----
  if (stream) {
    const t0 = Date.now();
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (typeof AC !== 'function') {
        const res = skip('capture', '浏览器没有 AudioContext，无法测量信号', 'webkitAudioContext 不可用');
        push(res);
      } else {
        const ctx = new AC();
        const srcNode = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        srcNode.connect(analyser);
        const buf = new Float32Array(analyser.fftSize);
        let peak = 0;
        const tEnd = Date.now() + captureMs;
        while (Date.now() < tEnd) {
          analyser.getFloatTimeDomainData(buf);
          for (let i = 0; i < buf.length; i++) {
            const v = Math.abs(buf[i]);
            if (v > peak) peak = v;
          }
          await new Promise(function (r) { setTimeout(r, 50); });
        }
        try { srcNode.disconnect(); analyser.disconnect(); await ctx.close(); } catch { /* ignore */ }
        if (peak > 0.0005) {
          const res = ok('capture', '采集到有效音频信号', Date.now() - t0, '峰值 ' + peak.toFixed(4) + '（阈值 0.0005）');
          push(res);
        } else {
          const res = bad('capture', '麦克风已授权，但没有采集到任何声音', [
            '请对着麦克风说话或发出声音，然后重新运行自检。',
            '检查麦克风是否被静音、系统输入音量是否为 0。',
            '若使用耳机，确认它仍是系统默认输入设备。',
          ], '峰值 ' + peak.toFixed(6) + '（几乎为 0）', Date.now() - t0);
          push(res);
        }
      }
    } catch (e) {
      const res = bad('capture', '采集音频时出错', [
        '请检查浏览器是否允许此页面访问麦克风。',
        '刷新页面后重试；无痕模式下请改用普通窗口。',
      ], String(e), Date.now() - t0);
      push(res);
    }
  } else {
    push(skip('capture', '未取得麦克风流，无法采集', '依赖上一环'));
  }

  // ---- 释放麦克风，熄灭指示灯 ----
  if (stream) {
    for (const tr of stream.getTracks()) {
      try { tr.stop(); } catch { /* ignore */ }
    }
  }

  return finishAsrChecks(items, deps, push);
}
/**
 * 后半三环：录音解码 → 模型加载 → 转写产出非空文本。
 * 与前半段解耦：即使麦克风不可用，这三环仍要测（用静音音频或已有模型）。
 */
async function finishAsrChecks(
  items: CheckResultItem[],
  deps: SelfCheckDeps,
  push: SelfCheckProgress,
): Promise<SelfCheckReport> {

  // ---- 录音与解码 ----
  let decoded: { samples: Float32Array; sampleRate: number; durationMs: number } | null = null;
  if (!deps.recorder || !deps.recorder.canRecord()) {
    const res = skip('recording', '录音器不可用，跳过录音解码检测', '无 MediaRecorder 或不被支持');
    push(res);
  } else {
    const t0 = Date.now();
    try {
      await deps.recorder.start();
      // 自检时不需要真说话，等一段静音即可验证「录制 + 解码」这条路本身通不通
      await new Promise(function (r) { setTimeout(r, 1200); });
      decoded = await deps.recorder.stop();
      const dur = decoded.durationMs || 0;
      const n = decoded.samples ? decoded.samples.length : 0;
      if (n > 0 && decoded.sampleRate > 0) {
        const res = ok('recording', '录音完成并成功解码为 PCM', Date.now() - t0,
          n + ' 个采样点 @ ' + decoded.sampleRate + 'Hz，时长 ' + dur + 'ms');
        push(res);
      } else {
        const res = bad('recording', '录音结束但没有得到有效音频数据', [
          '请检查麦克风是否被静音，或被其他程序独占。',
          '若浏览器无法解码该音频格式，请改用 Chrome / Edge 最新版。',
        ], '采样点数 ' + n + '，采样率 ' + decoded.sampleRate, Date.now() - t0);
        push(res);
      }
    } catch (e) {
      const res = bad('recording', '录音或解码失败', [
        '请确认浏览器已允许麦克风权限。',
        '关闭占用麦克风的程序后重试。',
        '若使用蓝牙耳机，请先确保它已连接。',
      ], String(e), Date.now() - t0);
      push(res);
    }
  }
  // ---- WASM / 模型加载 ----
  if (!deps.asr) {
    const res = skip('wasm', '未接入语音转写，跳过 WASM 检测', 'asr 适配器为 null');
    push(res);
    const res2 = skip('model', '未接入语音转写，跳过模型检测', 'asr 适配器为 null');
    push(res2);
    const res3 = skip('transcribe', '未接入语音转写，跳过转写检测', 'asr 适配器为 null');
    push(res3);
    return buildReport(items);
  }

  const asr = deps.asr;
  let modelReady = false;

  // 先测 WASM/模型加载
  const tModel = Date.now();
  if (asr.ready()) {
    const res = ok('model', '语音模型已就绪（本次会话已加载过）', undefined, asr.status().message);
    push(res);
    modelReady = true;
  } else {
    try {
      const loaded = await asr.load();
      if (loaded && asr.ready()) {
        modelReady = true;
        const res = ok('model', '语音模型加载成功', Date.now() - tModel, asr.status().message);
        push(res);
        const resWasm = ok('wasm', 'WASM 运行时初始化成功（随模型加载完成）', Date.now() - tModel);
        push(resWasm);
      } else {
        const st = asr.status();
        const kind = classifyWasmFailure(st.message);
        const res = bad('model', '语音模型加载失败', st.message.includes('网络') ? NETWORK_REMEDIES.incomplete : WASM_REMEDIES[kind],
          st.message, Date.now() - tModel);
        push(res);
        const resWasm = skip('wasm', '模型未能加载，无法确认 WASM 是否可用', '依赖上一环');
        push(resWasm);
      }
    } catch (e) {
      const kind = classifyWasmFailure(e);
      const res = bad('model', '加载模型时抛出异常', WASM_REMEDIES[kind], String(e), Date.now() - tModel);
      push(res);
      const resWasm = bad('wasm', '无法确认 WASM 运行时', WASM_REMEDIES[kind], String(e));
      push(resWasm);
    }
  }

  // ---- 转写：必须拿到非空文本 ----
  if (!modelReady) {
    const res = skip('transcribe', '模型未就绪，无法转写', '依赖上一环');
    push(res);
    return buildReport(items);
  }

  let audio = decoded;
  if (!audio) {
    // 没有真实录音时，退化用一段极短静音验证「转写这条路通不通」
    audio = { samples: new Float32Array(16000), sampleRate: 16000, durationMs: 1000 };
  }

  const tTx = Date.now();
  try {
    const text = await asr.transcribe(audio.samples, audio.sampleRate);
    if (typeof text === 'string' && text.trim().length > 0) {
      const preview = text.trim().slice(0, 60);
      const res = ok('transcribe', '转写成功，拿到非空文本', Date.now() - tTx, '识别内容：' + preview);
      push(res);
    } else {
      const res = bad('transcribe', '转写完成，但没有识别到任何文字', [
        '自检使用的是静音音频，这通常是正常的；实际答题时出声即可。',
        '如果你在答题时也拿不到文字，请检查麦克风音量与模型规格。',
      ], '返回空字符串', Date.now() - tTx);
      push(res);
    }
  } catch (e) {
    const res = bad('transcribe', '转写过程抛出异常', [
      '模型可能已失效，请重新加载后再试。',
      '若音频较长或设备内存不足，可改用最小规格 tiny。',
    ], String(e), Date.now() - tTx);
    push(res);
  }

  return buildReport(items);
}
