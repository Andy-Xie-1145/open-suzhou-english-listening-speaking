/**
 * 录音控件 —— MediaRecorder 采集 + 实时波形 / 电平 / 计时
 *
 * 许可：AGPL-3.0-only
 *
 * 硬约束（ARCHITECTURE 第 1 节）：音频只存内存，不上传、不落盘、用完即弃。
 * 本模块从不调用 fetch / XMLHttpRequest，也不创建 <a download>。
 *
 * 降级：必须处理三种失败 —— 权限被拒 / 无麦克风 / 浏览器不支持，
 * 每一项都给出中文提示，且不抛未捕获异常。
 */

import { formatClock } from './exam.ts';

/* ------------------------------------------------------------------ *
 * 一、纯逻辑：支持性探测与错误分类（可在 Node 单测）
 * ------------------------------------------------------------------ */

/** 录音可用性判定结果 */
export type RecorderSupport = 'ok' | 'no-microphone' | 'unsupported' | 'insecure-context';

export interface SupportResult {
  support: RecorderSupport;
  /** 面向学生的中文说明 */
  text: string;
  /** 学生该做什么 */
  action: string;
  /** 是否还能继续答题（否 → 只能手动输入文本） */
  canRecord: boolean;
}

/** 用于探测的可注入环境（便于 Node 单测，浏览器传 typeof 检查后的真值） */
export interface RecorderEnv {
  hasMediaDevices: boolean;
  hasMediaRecorder: boolean;
  hasAudioContext: boolean;
  isSecureContext: boolean;
}

/** 读取当前环境（Node 下全部为 false，绝不崩） */
export function readRecorderEnv(): RecorderEnv {
  const g = typeof globalThis === 'undefined' ? undefined : (globalThis as Record<string, unknown>);
  const nav = g ? (g['navigator'] as Record<string, unknown> | undefined) : undefined;
  const md = nav ? (nav['mediaDevices'] as Record<string, unknown> | undefined) : undefined;
  const sc = g ? (g['isSecureContext'] as boolean | undefined) : undefined;
  return {
    hasMediaDevices: !!md && typeof md['getUserMedia'] === 'function',
    hasMediaRecorder: !!g && typeof g['MediaRecorder'] !== 'undefined',
    hasAudioContext:
      !!g && (typeof g['AudioContext'] !== 'undefined' || typeof g['webkitAudioContext'] !== 'undefined'),
    isSecureContext: sc === undefined ? true : !!sc,
  };
}

/** 中文提示文案（三种失败 + 正常） */
export const SUPPORT_TEXT: Record<RecorderSupport, { text: string; action: string; canRecord: boolean }> = {
  ok: {
    text: '录音功能可用。',
    action: '点击「开始录音」，大声作答即可。录音只保存在内存中，不会上传。',
    canRecord: true,
  },
  'insecure-context': {
    text: '当前页面不是安全环境，浏览器禁止访问麦克风。',
    action: '请用 http://localhost 或 https:// 打开本页面后重试；也可以在答题页手动输入朗读内容，其余反馈不受影响。',
    canRecord: false,
  },
  unsupported: {
    text: '当前浏览器不支持录音（缺少 MediaRecorder API）。',
    action: '建议使用最新版 Chrome / Edge / Safari。你仍然可以在答题页手动输入你朗读的内容，其余反馈照常。',
    canRecord: false,
  },
  'no-microphone': {
    text: '没有检测到麦克风设备。',
    action: '请插入麦克风后刷新页面；在设备设置里允许本站使用麦克风。你也可以手动输入朗读内容。',
    canRecord: false,
  },
};

/** 纯函数：给定环境判定可用性。测试友好。 */
export function detectRecorderSupport(env: RecorderEnv): SupportResult {
  let support: RecorderSupport;
  if (!env.isSecureContext) support = 'insecure-context';
  else if (!env.hasMediaRecorder || !env.hasAudioContext) support = 'unsupported';
  else if (!env.hasMediaDevices) support = 'no-microphone';
  else support = 'ok';
  const t = SUPPORT_TEXT[support];
  return { support, text: t.text, action: t.action, canRecord: t.canRecord };
}

/** 错误分类：把 getUserMedia 抛出的错误翻译成中文 */
export type RecorderErrorKind =
  | 'permission-denied'
  | 'not-found'
  | 'not-readable'
  | 'overconstrained'
  | 'unsupported'
  | 'unknown';

export const ERROR_TEXT: Record<RecorderErrorKind, { text: string; action: string }> = {
  'permission-denied': {
    text: '麦克风权限被拒绝。',
    action: '请点击地址栏左侧的锁形图标 → 允许本站使用麦克风，然后刷新页面。也可以改为手动输入朗读内容。',
  },
  'not-found': {
    text: '没有找到麦克风设备。',
    action: '请插入麦克风并检查系统声音设置；或在答题页手动输入朗读内容。',
  },
  'not-readable': {
    text: '麦克风被其他程序占用，无法读取。',
    action: '请关闭正在使用麦克风的程序（视频会议、录音软件等）后重试。',
  },
  overconstrained: {
    text: '设备参数不满足要求。',
    action: '请更换一个麦克风，或降低设备采样率后重试。',
  },
  unsupported: {
    text: '当前浏览器不支持录音。',
    action: '请改用最新版 Chrome / Edge / Safari；或手动输入朗读内容。',
  },
  unknown: {
    text: '录音时发生未知错误。',
    action: '请重试；若持续失败，请改用手动输入朗读内容，其余反馈不受影响。',
  },
};

/** 把任意异常归类（读 DOMException.name，做 typeof 安全访问） */
export function classifyRecorderError(err: unknown): RecorderErrorKind {
  const name =
    err && typeof err === 'object' && typeof (err as { name?: unknown }).name === 'string'
      ? (err as { name: string }).name
      : '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return 'permission-denied';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'not-found';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'not-readable';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'overconstrained';
    case 'NotSupportedError':
      return 'unsupported';
    default:
      return 'unknown';
  }
}

export interface RecorderIssue {
  kind: RecorderErrorKind;
  text: string;
  action: string;
  /** 是否仍可继续（手动输入路径） */
  canFallback: boolean;
}

/** 纯函数：错误 → 中文提示 */
export function describeRecorderError(err: unknown): RecorderIssue {
  const kind = classifyRecorderError(err);
  const t = ERROR_TEXT[kind];
  return { kind, text: t.text, action: t.action, canFallback: true };
}

/* ------------------------------------------------------------------ *
 * 二、纯逻辑：波形 / 电平 / 音高 / 停顿（全部纯函数，可 Node 单测）
 * ------------------------------------------------------------------ */

/** RMS 电平 → dBFS，范围 [-60, 0] */
export function computeLevelDb(samples: Float32Array): number {
  if (!samples.length) return -60;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  const rms = Math.sqrt(sum / samples.length);
  if (rms <= 1e-6) return -60;
  const db = 20 * Math.log10(rms);
  return Math.max(-60, Math.min(0, db));
}

/** dBFS → 0..1 的电平条高度 */
export function levelToBar(db: number): number {
  return Math.max(0, Math.min(1, (db + 60) / 60));
}

/**
 * 波形降采样：把样本压成 buckets 个 0..1 的柱高（取每个桶的绝对值峰值）。
 * 纯函数，用于画波形图。
 */
export function downsampleWaveform(samples: Float32Array, buckets: number): number[] {
  const n = Math.max(1, Math.floor(buckets));
  if (!samples.length) return new Array(n).fill(0);
  const out: number[] = [];
  const per = samples.length / n;
  for (let b = 0; b < n; b++) {
    const start = Math.floor(b * per);
    const end = Math.min(samples.length, Math.max(start + 1, Math.floor((b + 1) * per)));
    let peak = 0;
    for (let i = start; i < end; i++) {
      const v = Math.abs(samples[i]);
      if (v > peak) peak = v;
    }
    out.push(Math.max(0, Math.min(1, peak)));
  }
  return out;
}

export interface PauseSpan {
  startMs: number;
  endMs: number;
  durationMs: number;
}

/**
 * 停顿检测：能量低于阈值且持续超过 minMs 的片段。
 * 纯函数，是波形上「停顿标记」的依据。
 */
export function findPauses(
  samples: Float32Array,
  sampleRate: number,
  opts: { frameMs?: number; thresholdDb?: number; minMs?: number } = {},
): PauseSpan[] {
  const frameMs = opts.frameMs ?? 20;
  const thresholdDb = opts.thresholdDb ?? -40;
  const minMs = opts.minMs ?? 300;
  const sr = sampleRate > 0 ? sampleRate : 16000;
  const frameLen = Math.max(1, Math.round((sr * frameMs) / 1000));
  const out: PauseSpan[] = [];
  let runStart = -1;
  const frames = Math.floor(samples.length / frameLen);
  for (let f = 0; f < frames; f++) {
    const off = f * frameLen;
    let sum = 0;
    for (let i = 0; i < frameLen; i++) {
      const v = samples[off + i];
      sum += v * v;
    }
    const db = 20 * Math.log10(Math.max(1e-6, Math.sqrt(sum / frameLen)));
    const quiet = db <= thresholdDb;
    if (quiet && runStart < 0) runStart = f;
    if ((!quiet || f === frames - 1) && runStart >= 0) {
      const endFrame = quiet ? f + 1 : f;
      const dur = (endFrame - runStart) * frameMs;
      if (dur >= minMs) {
        out.push({ startMs: runStart * frameMs, endMs: endFrame * frameMs, durationMs: dur });
      }
      runStart = -1;
    }
  }
  return out;
}

export interface PitchFrame {
  /** 帧起始毫秒 */
  tMs: number;
  /** 基频 Hz；无有效值时为 0 */
  hz: number;
  /** 该帧 RMS 能量 0..1 */
  energy: number;
  /** 是否浊音（有基频） */
  voiced: boolean;
}

/**
 * 音高轨：自相关基频估计（纯 JS，无 Web Audio）。
 * 帧长 40ms / 步长 20ms，搜索基频范围 70..400Hz（人声范围）。
 * 无 Web Audio 也能跑，因此可直接 Node 单测。
 */
export function pitchTrack(
  samples: Float32Array,
  sampleRate: number,
  opts: { frameMs?: number; hopMs?: number } = {},
): PitchFrame[] {
  const frameMs = opts.frameMs ?? 40;
  const hopMs = opts.hopMs ?? 20;
  const sr = sampleRate > 0 ? sampleRate : 16000;
  const frameLen = Math.max(8, Math.round((sr * frameMs) / 1000));
  const hopLen = Math.max(1, Math.round((sr * hopMs) / 1000));
  const minLag = Math.max(2, Math.floor(sr / 400));
  const maxLag = Math.min(frameLen - 2, Math.ceil(sr / 70));
  const out: PitchFrame[] = [];
  if (samples.length < frameLen) return out;

  for (let start = 0; start + frameLen <= samples.length; start += hopLen) {
    let rms = 0;
    for (let i = 0; i < frameLen; i++) {
      const v = samples[start + i];
      rms += v * v;
    }
    rms = Math.sqrt(rms / frameLen);
    const energy = Math.max(0, Math.min(1, rms * 3));

    const corr = new Float64Array(maxLag + 1);
    let bestCorr = 0;
    if (rms > 0.008 && maxLag > minLag) {
      for (let lag = minLag; lag <= maxLag; lag++) {
        let sum = 0;
        let e1 = 0;
        let e2 = 0;
        for (let i = 0; i + lag < frameLen; i++) {
          sum += samples[start + i] * samples[start + i + lag];
          e1 += samples[start + i] * samples[start + i];
          e2 += samples[start + i + lag] * samples[start + i + lag];
        }
        const denom = Math.sqrt(e1 * e2);
        const norm = denom > 1e-9 ? sum / denom : 0;
        corr[lag] = norm;
        if (norm > bestCorr) bestCorr = norm;
      }
    }
    // 防八度误判：纯音在整数倍周期处相关度同样接近 1，直接取全局最大相关
    // 会选中 1/2、1/3 子谐波（把 300Hz 听成 100Hz）。
    // 取「第一个达到峰值 90% 的**局部极大值**」——只看是否够高会误取峰的左沿
    // （把 200Hz 听成 213Hz），必须同时要求它左右都不高于自己。
    let bestLag = 0;
    if (bestCorr > 0) {
      const thresh = bestCorr * 0.9;
      for (let lag = minLag; lag <= maxLag; lag++) {
        const prev = lag > minLag ? corr[lag - 1] : 0;
        const next = lag < maxLag ? corr[lag + 1] : 0;
        if (corr[lag] >= thresh && corr[lag] >= prev && corr[lag] >= next) {
          bestLag = lag;
          break;
        }
      }
    }
    const voiced = bestLag > 0 && bestCorr >= 0.35;
    out.push({
      tMs: Math.round((start / sr) * 1000),
      hz: voiced ? Math.round(sr / bestLag) : 0,
      energy,
      voiced,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 三、录音器（浏览器）
 * ------------------------------------------------------------------ */

export interface RecordedClip {
  /** 单声道 PCM，-1..1 —— 只存在于内存 */
  samples: Float32Array;
  sampleRate: number;
  durationMs: number;
  pauses: PauseSpan[];
}

export interface RecorderEvents {
  /** 每帧电平（dBFS） */
  onLevel?: (db: number) => void;
  /** 波形柱（0..1 数组） */
  onWaveform?: (bars: number[]) => void;
  /** 录音时长 */
  onTick?: (elapsedMs: number, remainingMs: number | null) => void;
  /** 状态变化 */
  onStateChange?: (state: RecorderState) => void;
  /** 出错（已转成中文） */
  onError?: (issue: RecorderIssue) => void;
  /** 权限/设备问题（探测阶段） */
  onUnsupported?: (result: SupportResult) => void;
}

export type RecorderState = 'idle' | 'recording' | 'stopped' | 'denied';

const TARGET_SR = 16000;
const RING_FRAMES = 512;

/**
 * 录音器。用 AudioContext + MediaRecorder 采集，
 * 同时用 ScriptProcessor/Analyser 维护 PCM 环形缓冲与电平。
 */
export class AudioRecorder {
  private readonly events: RecorderEvents;
  private maxMs: number;
  private state: RecorderState = 'idle';
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private recorder: MediaRecorder | null = null;
  private pcm: Float32Array | null = null;
  private filled = 0;
  private startedAt = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private analyser: AnalyserNode | null = null;
  private raf = 0;
  private tail = new Float32Array(0);

  constructor(events: RecorderEvents = {}, maxMs = 120_000) {
    this.events = events;
    this.maxMs = maxMs;
  }

  get currentState(): RecorderState {
    return this.state;
  }

  /** 探测环境并给出中文提示；不可录音时回调 onUnsupported 且不抛错 */
  probe(): SupportResult {
    const result = detectRecorderSupport(readRecorderEnv());
    if (!result.canRecord) this.events.onUnsupported?.(result);
    return result;
  }

  /** 申请权限并开始录音；任何失败都转为中文 onError，不 reject */
  async start(): Promise<boolean> {
    const support = this.probe();
    if (!support.canRecord) {
      this.state = 'denied';
      this.events.onStateChange?.(this.state);
      return false;
    }
    const g = globalThis as Record<string, unknown>;
    const nav = g['navigator'] as { mediaDevices?: { getUserMedia(c: unknown): Promise<MediaStream> } };
    try {
      this.stream = await nav.mediaDevices!.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
    } catch (err) {
      const issue = describeRecorderError(err);
      this.state = issue.kind === 'permission-denied' ? 'denied' : 'idle';
      this.events.onError?.(issue);
      this.events.onStateChange?.(this.state);
      return false;
    }

    try {
      this.setupGraph();
      const MR = g['MediaRecorder'] as typeof MediaRecorder | undefined;
      if (!MR) throw new Error('MediaRecorder unavailable');
      const mime = pickMimeType();
      this.recorder = mime ? new MR(this.stream, { mimeType: mime }) : new MR(this.stream);
      this.chunks = [];
      this.recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };
      this.recorder.start(250);
    } catch (err) {
      const issue = describeRecorderError(err);
      this.events.onError?.(issue);
      this.cleanup();
      return false;
    }

    this.pcm = new Float32Array(TARGET_SR * (Math.ceil(this.maxMs / 1000) + 1));
    this.filled = 0;
    this.startedAt = Date.now();
    this.state = 'recording';
    this.events.onStateChange?.(this.state);
    this.timer = setInterval(() => this.tick(), 100);
    return true;
  }

  /** 建立 AudioContext 图并开始抽取 PCM + 电平 */
  private setupGraph(): void {
    const g = globalThis as Record<string, unknown>;
    const ACtor =
      (g['AudioContext'] as typeof AudioContext | undefined) ??
      (g['webkitAudioContext'] as typeof AudioContext | undefined);
    if (!ACtor || !this.stream) return;
    const ctx: AudioContext = new ACtor();
    this.ctx = ctx;
    const src = ctx.createMediaStreamSource(this.stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    src.connect(analyser);
    this.analyser = analyser;

    // 用 ScriptProcessor（兼容性最好）抽取 PCM
    const proc = ctx.createScriptProcessor(RING_FRAMES, 1, 1);
    proc.onaudioprocess = (ev: AudioProcessingEvent) => {
      const input = ev.inputBuffer.getChannelData(0);
      this.appendPcm(input);
    };
    src.connect(proc);
    // ScriptProcessor 需要连到 destination 才会被调度；增益置 0 防止回放自己声音
    const mute = ctx.createGain();
    mute.gain.value = 0;
    proc.connect(mute);
    mute.connect(ctx.destination);

    // 电平轮询
    const buf = new Float32Array(analyser.fftSize);
    const loop = () => {
      if (this.analyser) {
        this.analyser.getFloatTimeDomainData(buf);
        const db = computeLevelDb(buf);
        this.events.onLevel?.(db);
        this.events.onWaveform?.(downsampleWaveform(this.tail, 48));
      }
      this.raf = requestAnimationFrameCompat(loop);
    };
    this.raf = requestAnimationFrameCompat(loop);
  }

  /** 累积 PCM，维护一个短尾用于实时波形 */
  private appendPcm(input: Float32Array): void {
    if (!this.pcm) return;
    let remaining = input.length;
    let offset = 0;
    while (remaining > 0 && this.filled < this.pcm.length) {
      const n = Math.min(remaining, this.pcm.length - this.filled);
      this.pcm.set(input.subarray(offset, offset + n), this.filled);
      this.filled += n;
      offset += n;
      remaining -= n;
    }
    // 短尾（最近 1024 点）供波形显示
    const keep = 1024;
    if (input.length >= keep) {
      this.tail = input.slice(input.length - keep);
    } else {
      const merged = new Float32Array(keep);
      merged.set(this.tail.subarray(keep - this.tail.length), 0);
      merged.set(input, this.tail.length);
      this.tail = merged;
    }
  }

  private tick(): void {
    const elapsed = Date.now() - this.startedAt;
    this.events.onTick?.(elapsed, this.maxMs > 0 ? Math.max(0, this.maxMs - elapsed) : null);
    if (this.maxMs > 0 && elapsed >= this.maxMs) void this.stop();
  }

  /** 停止录音，返回内存中的片段（若已解出 PCM） */
  async stop(): Promise<RecordedClip | null> {
    if (this.state !== 'recording') return null;
    this.state = 'stopped';
    this.events.onStateChange?.(this.state);
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.raf) cancelAnimationFrameCompat(this.raf);

    const recorder = this.recorder;
    if (recorder) {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        try {
          recorder.stop();
        } catch {
          resolve();
        }
      });
    }
    const durationMs = Date.now() - this.startedAt;
    this.cleanup();

    if (!this.pcm || this.filled === 0) return null;
    const samples = this.pcm.slice(0, this.filled);
    return {
      samples,
      sampleRate: TARGET_SR,
      durationMs,
      pauses: findPauses(samples, TARGET_SR),
    };
  }

  /** 释放所有资源（麦克风指示灯熄灭） */
  cleanup(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.raf) cancelAnimationFrameCompat(this.raf);
    this.raf = 0;
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.analyser = null;
    this.recorder = null;
    this.pcm = null;
    this.filled = 0;
  }
}

function pickMimeType(): string {
  const g = globalThis as Record<string, unknown>;
  const MR = g['MediaRecorder'] as typeof MediaRecorder | undefined;
  if (!MR || typeof MR.isTypeSupported !== 'function') return '';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return candidates.find(c => MR.isTypeSupported(c)) ?? '';
}

function requestAnimationFrameCompat(cb: FrameRequestCallback): number {
  const g = globalThis as Record<string, unknown>;
  if (typeof g['requestAnimationFrame'] === 'function') {
    return (g['requestAnimationFrame'] as (c: FrameRequestCallback) => number)(cb);
  }
  return setTimeout(() => cb(Date.now()), 100) as unknown as number;
}

function cancelAnimationFrameCompat(id: number): void {
  const g = globalThis as Record<string, unknown>;
  if (typeof g['cancelAnimationFrame'] === 'function') {
    (g['cancelAnimationFrame'] as (i: number) => void)(id);
  } else {
    clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
  }
}

/* ------------------------------------------------------------------ *
 * 四、录音控件渲染
 * ------------------------------------------------------------------ */

function getDoc(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls = '',
  text = '',
): HTMLElementTagNameMap[K] {
  const d = getDoc()!;
  const e = d.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

export interface RecorderViewOptions {
  /** 单题时长上限（毫秒），null = 不限 */
  limitMs?: number | null;
  onRecorded?: (clip: RecordedClip | null) => void;
}

/**
 * 渲染录音控件：电平条 + 实时波形 + 计时 + 开始/停止按钮。
 * 若环境不支持，则渲染降级提示 + 「手动输入」回调（由上层接文本框）。
 */
export function renderRecorder(
  container: HTMLElement,
  opts: RecorderViewOptions = {},
): { destroy(): void } {
  const d = getDoc();
  if (!d) return { destroy() {} };
  container.textContent = '';
  container.className = 'recorder';

  const limit = opts.limitMs ?? null;
  const support = detectRecorderSupport(readRecorderEnv());

  // 计时
  const timeEl = el('div', 'recorder__time', '00:00');
  const levelFill = el('div', 'recorder__level-fill');
  const levelBar = el('div', 'recorder__level', '');
  levelBar.appendChild(levelFill);
  const canvas = el('canvas', 'recorder__wave');
  canvas.width = 480;
  canvas.height = 80;
  const hint = el('p', 'recorder__hint', support.canRecord ? SUPPORT_TEXT.ok.action : support.action);

  let ctx2d: CanvasRenderingContext2D | null = null;
  try {
    ctx2d = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
  } catch {
    ctx2d = null;
  }

  const startBtn = el('button', 'btn btn--primary recorder__btn', '开始录音');
  startBtn.type = 'button';
  const stopBtn = el('button', 'btn btn--danger recorder__btn', '停止');
  stopBtn.type = 'button';
  stopBtn.disabled = true;

  const recorder = new AudioRecorder({
    onLevel: db => {
      levelFill.style.width = (levelToBar(db) * 100).toFixed(1) + '%';
      levelFill.className = 'recorder__level-fill' + (db < -50 ? ' is-silent' : '');
    },
    onWaveform: bars => drawWave(ctx2d, canvas, bars),
    onTick: (elapsed, remaining) => {
      timeEl.textContent = formatClock(elapsed);
      if (remaining !== null) timeEl.classList.toggle('is-urgent', remaining <= 10_000);
    },
    onError: issue => {
      hint.textContent = issue.text + ' ' + issue.action;
      hint.className = 'recorder__hint is-error';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    },
  });

  if (!support.canRecord) {
    startBtn.disabled = true;
    hint.className = 'recorder__hint is-error';
    container.appendChild(el('div', 'notice notice--warn', support.text));
  }

  startBtn.addEventListener('click', () => {
    void recorder.start().then(ok => {
      if (ok) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
        hint.textContent = '正在录音，请对着麦克风大声作答。';
        hint.className = 'recorder__hint';
      }
    });
  });

  stopBtn.addEventListener('click', () => {
    void recorder.stop().then(clip => {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      hint.textContent = '录音结束。音频只保存在内存中，未上传。';
      opts.onRecorded?.(clip);
    });
  });

  container.appendChild(timeEl);
  container.appendChild(levelBar);
  container.appendChild(canvas);
  container.appendChild(startBtn);
  container.appendChild(stopBtn);
  container.appendChild(hint);

  return {
    destroy() {
      recorder.cleanup();
    },
  };
}

function drawWave(ctx: CanvasRenderingContext2D | null, canvas: HTMLCanvasElement, bars: number[]): void {
  if (!ctx) return;
  const { width: w, height: hgt } = canvas;
  ctx.clearRect(0, 0, w, hgt);
  ctx.fillStyle = getComputedStyleSafe(canvas, 'color') || '#2563eb';
  const bw = w / bars.length;
  bars.forEach((v, i) => {
    const bh = Math.max(2, v * hgt * 0.9);
    ctx.fillRect(i * bw, (hgt - bh) / 2, Math.max(1, bw - 1), bh);
  });
}

function getComputedStyleSafe(elp: HTMLElement, prop: string): string {
  const g = globalThis as Record<string, unknown>;
  if (typeof g['getComputedStyle'] !== 'function') return '';
  try {
    return (g['getComputedStyle'] as (e: Element) => Record<string, string>)(elp)[prop] ?? '';
  } catch {
    return '';
  }
}
