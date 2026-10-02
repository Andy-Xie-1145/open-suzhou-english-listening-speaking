/**
 * TTS 桥接层 —— 把听力材料文本合成为可播放的音频
 *
 * 许可：AGPL-3.0-only
 *
 * ## 模型选型（2026-09 核实）
 *
 * 约束：**浏览器端 + 小模型**。搜「TTS 排行榜前列」只会搜到巨兽
 * （Fish Audio S2 Pro 权重实测 10.26 GB、ZONOS2 8B MoE、Qwen3-TTS 1.7B 但
 * transformers.js 未支持 issue #1565），对网页毫无意义。
 * 所以下面只比**浏览器可跑的小模型**。
 *
 * | 模型 | 参数 | Elo | 量化后体积 | 音色 | 许可 |
 * |---|---|---|---|---|---|
 * | **Kokoro-82M** | 82M | **≈1063** | 86–92MB | **54** | Apache-2.0 |
 * | Piper | ~63M | 未入主榜 | 63MB | 100+ | MIT |
 * | Supertonic 3 | 99M | 中上 | 92MB (int8) | 较少 | MIT |
 *
 * **选 Kokoro-82M**，理由：
 *  1. Elo≈1063（Artificial Analysis 现行值，数值随评测波动），小模型里性价比最高
 *  2. **54 个音色** —— 听力材料是 W:/M: 双人对话，需要两个能区分开的音色，这是硬需求
 *  3. 量化后 86–92MB，比 fp32 的 325MB 小 3.5 倍；音色每选一个下 0.5MB（无需全下）
 *  4. Apache-2.0，onnx-community 有现成 ONNX，多档量化可选
 *  5. 2025 年初在 HF Arena 登顶（模型卡 EVAL.md 截图日期 2025-02-26），
 *     截至 2026-10 仍处前列，但已非第一（榜首为 Sonic 3.6 等商用模型）
 *
 * Piper 体积更小、纯 WASM 最稳，但 22kHz 档位自然度不如 Kokoro，作为降级备选。
 * Supertonic 3/2 卡在**体积**不是许可：Open RAIL-M 允许非商用，第 4 条不违反。
 * 但官方 ONNX 是 379.63MB（Supertonic 3）/ 250.65MB（Supertonic 2），**从未发量化版**；
 * 网上 97MB 的 INT8 全是社区量化（仅 45 次下载）。
 * 另：Open RAIL-M §4.a 强制要求把使用限制写进你自己的许可协议 —— 非阻断，但要落地的法务义务。
 *
 * 文件实测（onnx-community/Kokoro-82M-v1.0-ONNX）：
 *   model_q8f16.onnx        86.0 MB   ← 最小可用
 *   model_quantized.onnx    92.4 MB
 *   model_fp16.onnx        163.0 MB
 *   model.onnx (fp32)       325.5 MB   ← 默认，太大，别用
 *   voices/<name>.bin        0.5 MB 每个 —— **只下要用的 2 个**，不用下全部 54 个
 *
 * ## 架构约束
 *
 * - **音频不出浏览器**：合成的 WAV 只存在内存，不上传、不落盘
 * - **零服务端**：模型从 HF Hub 首次拉取后由浏览器缓存
 * - **可降级**：WebGPU 不可用时自动退回 WASM/CPU
 * - **不绑定运行时**：具体 ONNX 推理库（sherpa-onnx / onnxruntime-web）
 *   通过适配器注入，本模块只定义契约与调度
 *
 * ## 接入前必须解决的两个坑（2026-09 核实）
 *
 * 1. **kokoro-js 依赖 `@huggingface/transformers@^3.5.1`，本项目用的是 4.3.0。**
 *    `^3.5.1` 不匹配 4.x，直接装会装出两份 transformers（体积翻倍且可能冲突）。
 *    选项：(a) 不用 kokoro-js，自己写 ONNX Runtime 调用；
 *    (b) 降级 transformers 到 3.x；
 *    (c) fork kokoro-js 改依赖范围。**建议 (a)**，避免为省代码引入版本冲突。
 *    注意 kokoro-js 自带 phonemizer（WASM），unpacked 约 29.7MB，需一并评估。
 *
 * 2. **音色需单独下载**：`voices/*.bin` 共 27.4MB / 55 个。
 *    听力只需 2 个音色（1 女 1 男），**只拉这 2 个**即可，
 *    不要把 55 个全下——那是 27MB 的无谓流量。
 *    推荐 W 用 af_bella（或 af_heart，官方默认），M 用 am_michael 或 am_adam。
 */
/* ------------------------------------------------------------------ *
 * 一、文本分段
 * ------------------------------------------------------------------ */

export interface Utterance {
  /** 说话人标记，如 'W' / 'M' / 'N'（旁白） */
  speaker: string;
  /** 该说话人说的内容（已去掉标记与前缀冒号） */
  text: string;
  /** 原文里的行号，便于回溯 */
  lineNo: number;
}

/**
 * 把 `W: Hello` / `M: Hi` 这种脚本拆成结构化分段。
 *
 * 为什么必须拆：TTS 不能读「W:」这种说话人标记，
 * 而且对话需要给不同说话人分配不同音色，否则整段一个声音。
 *
 * 兼容没有说话人标记的纯文本（短文 passage 场景）。
 */
export function parseScript(raw: string): Utterance[] {
  const out: Utterance[] = [];
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const m = /^([A-Za-z]{1,3})\s*[:：]\s*(.+)$/.exec(line);
    if (m) {
      out.push({ speaker: m[1].toUpperCase(), text: m[2].trim(), lineNo: i + 1 });
    } else {
      // 无标记：并入上一段，或作为独立旁白段
      const last = out[out.length - 1];
      if (last) last.text += ' ' + line;
      else out.push({ speaker: 'N', text: line, lineNo: i + 1 });
    }
  }
  return out.filter(function (u) { return u.text.length > 0; });
}
/**
 * 音色分配
 *
 * Supertonic 3 提供多组音色。对话场景按说话人分配不同音色，
 * 短文场景统一用一个音色即可。
 *
 * ⚠️ 音色 ID 需与模型仓库实际提供的一致。接入时以模型自带列表为准，
 * 这里给出的是常用分配策略，实际可用音色列表在运行时探测。
 */
export interface VoiceAssignment {
  speaker: string;
  voiceId: string;
}

/** 默认策略：奇偶交替分配两类音色 */
export function assignVoices(utters: Utterance[], available: string[]): VoiceAssignment[] {
  if (available.length === 0) return [];
  if (available.length === 1) {
    return utters.map(function (u) { return { speaker: u.speaker, voiceId: available[0] }; });
  }
  const seen = new Map<string, string>();
  const out: VoiceAssignment[] = [];
  for (const u of utters) {
    let vid = seen.get(u.speaker);
    if (!vid) {
      vid = available[seen.size % available.length];
      seen.set(u.speaker, vid);
    }
    out.push({ speaker: u.speaker, voiceId: vid });
  }
  return out;
}
/* ------------------------------------------------------------------ *
 * 二、运行时契约
 * ------------------------------------------------------------------ */

export type TtsStatus = 'idle' | 'loading' | 'ready' | 'failed' | 'unsupported';

export interface TtsProgress {
  status: TtsStatus;
  /** 0-100，仅 loading 时有意义 */
  percent: number;
  message: string;
}

/** 合成一段文本，返回 WAV 的 PCM 与采样率 */
export type SynthFn = (text: string, voiceId: string) => Promise<{ samples: Float32Array; sampleRate: number }>;

export interface TtsRuntime {
  /** 可用音色列表；空数组表示运行时不支持音色选择 */
  voices(): string[];
  /** 合成一段 */
  synth: SynthFn;
}

export interface TtsEngine {
  /** 当前状态 */
  status(): TtsProgress;
  /** 加载模型。失败 resolve false，不抛异常 */
  load(onProgress?: (p: TtsProgress) => void): Promise<boolean>;
  /** 合成整段脚本（自动分段、分音色、拼接）。未就绪时抛错。 */
  speak(script: string, opts?: { speakerVoice?: Record<string, string> }): Promise<AudioBufferLike>;
  /** 是否可用 */
  ready(): boolean;
}

/** 合成结果：PCM + 采样率，供播放器或后续分析使用 */
export interface AudioBufferLike {
  samples: Float32Array;
  sampleRate: number;
  /** 各分段时长，用于在播放器里标出 */
  segments: Array<{ startMs: number; endMs: number; speaker: string }>;
}
/**
 * 拼接：把各分段 PCM 首尾相接，中间插入静音模拟说话人换气的间隔。
 *
 * 间隔时长取经验值：换人时给 250ms，连读同一说话人时给 0。
 * 这个间隔直接影响听感与题目的信息密度，需要可调。
 */
export const SPEAKER_GAP_MS = 250;

export function concatSegments(
  parts: Array<{ samples: Float32Array; sampleRate: number; speaker: string }>,
): AudioBufferLike {
  if (parts.length === 0) {
    return { samples: new Float32Array(0), sampleRate: 16000, segments: [] };
  }
  const sr = parts[0].sampleRate;
  const gapLen = Math.round((SPEAKER_GAP_MS / 1000) * sr);
  const silent = new Float32Array(gapLen);

  let total = 0;
  for (let i = 0; i < parts.length; i++) {
    total += parts[i].samples.length;
    if (i < parts.length - 1 && parts[i + 1].speaker !== parts[i].speaker) {
      total += gapLen;
    }
  }

  const out = new Float32Array(total);
  const segments: AudioBufferLike['segments'] = [];
  let off = 0;
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && parts[i].speaker !== parts[i - 1].speaker) {
      off += gapLen;
    }
    const s = parts[i].samples;
    out.set(s, off);
    segments.push({
      startMs: Math.round((off / sr) * 1000),
      endMs: Math.round(((off + s.length) / sr) * 1000),
      speaker: parts[i].speaker,
    });
    off += s.length;
  }

  return { samples: out, sampleRate: sr, segments: segments };
}
/* ------------------------------------------------------------------ *
 * 三、引擎实现（运行时注入）
 * ------------------------------------------------------------------ */

export interface CreateTtsOptions {
  /** 运行时工厂。首次调用时加载模型，之后返回缓存实例。 */
  createRuntime: (onProgress: (p: TtsProgress) => void) => Promise<TtsRuntime>;
}

export function createTtsEngine(opts: CreateTtsOptions): TtsEngine {
  let runtime: TtsRuntime | null = null;
  let loading: Promise<boolean> | null = null;
  let st: TtsProgress = {
    status: 'idle',
    percent: 0,
    message: '语音合成未加载。听力题需要先合成音频。',
  };

  function status(): TtsProgress {
    return st;
  }

  function ready(): boolean {
    return st.status === 'ready' && runtime !== null;
  }

  async function load(onProgress?: (p: TtsProgress) => void): Promise<boolean> {
    if (ready()) return true;
    if (loading) return loading;

    st = { status: 'loading', percent: 0, message: '正在加载语音合成模型（约 92MB），请稍候…' };
    if (onProgress) onProgress(st);

    loading = (async function () {
      try {
        const rt = await opts.createRuntime(function (p) {
          st = p;
          if (onProgress) onProgress(p);
        });
        runtime = rt;
        st = { status: 'ready', percent: 100, message: '语音合成已就绪。' };
        if (onProgress) onProgress(st);
        return true;
      } catch (e) {
        runtime = null;
        st = {
          status: 'failed',
          percent: 0,
          message: '语音合成加载失败：' + (e instanceof Error ? e.message : String(e))
            + '。可稍后重试，或换用支持 WebGPU 的浏览器。',
        };
        if (onProgress) onProgress(st);
        return false;
      } finally {
        loading = null;
      }
    })();

    return loading;
  }
  async function speak(script: string, opts?: { speakerVoice?: Record<string, string> }): Promise<AudioBufferLike> {
    if (!runtime) {
      throw new Error('语音合成尚未加载，无法生成听力音频。');
    }
    const utters = parseScript(script);
    if (utters.length === 0) {
      throw new Error('听力材料为空，无法合成。');
    }

    const available = runtime.voices();
    // 优先用调用方指定的说话人音色映射
    let assignments: VoiceAssignment[];
    if (opts?.speakerVoice) {
      assignments = utters.map(function (u) {
        return { speaker: u.speaker, voiceId: opts.speakerVoice![u.speaker] ?? available[0] ?? 'default' };
      });
    } else {
      assignments = assignVoices(utters, available);
    }

    const parts: Array<{ samples: Float32Array; sampleRate: number; speaker: string }> = [];
    for (let i = 0; i < utters.length; i++) {
      const u = utters[i];
      const a = assignments[i];
      const r = await runtime.synth(u.text, a ? a.voiceId : (available[0] ?? 'default'));
      parts.push({ samples: r.samples, sampleRate: r.sampleRate, speaker: u.speaker });
    }

    return concatSegments(parts);
  }

  return {
    status: status,
    load: load,
    speak: speak,
    ready: ready,
  };
}
