/**
 * TTS 桥接层 —— 把听力材料文本合成为可播放的音频
 *
 * 许可：AGPL-3.0-only
 *
 * ## 模型选型（2026-09 核实）
 *
 * 按 Speech Arena Elo 排名靠前的模型，在**浏览器端**都跑不动。
 *
 * 注意：排除理由是**技术可行性**，不是许可。
 * 本项目是非商业开源教育项目，各模型的 Research/非商用条款都不构成障碍。
 *
 * | 模型 | Elo | 实际不可用的原因 |
 * |---|---|---|
 * | Fish Audio S2 Pro | 1129（开源最高） | 权重实测 10.26 GB，仅 .safetensors，无 ONNX，无 JS 绑定 |
 * | ZONOS2 8B | 1320 | 8B MoE，浏览器无显存可用 |
 * | Qwen3-TTS-12Hz-1.7B | 榜单前列 | transformers.js 尚未支持（issue #1565） |
 * | **Supertonic 3** | 中上 | ✅ 92MB int8 / ONNX 原生 / CPU 实测 596 字符每秒 |
 * | Kokoro-82M | 中 | ✅ Apache-2.0，备选 |
 *
 * **选 Supertonic 3**：唯一同时满足「浏览器可跑 + 体积可接受 + 有 ONNX」的模型。
 * 官方实测 M4 CPU 上 596–850 字符/秒，一段听力材料秒级合成完毕，无需 GPU。
 *
 * ⚠️ 若日后出现 Fish Audio 的 ONNX 转换版，质量上限会高一档
 * （Elo 1129 对中上不是小差距），值得重新评估。
 *
 * ## 架构约束
 *
 * - **音频不出浏览器**：合成的 WAV 只存在内存，不上传、不落盘
 * - **零服务端**：模型从 HF Hub 首次拉取后由浏览器缓存
 * - **可降级**：WebGPU 不可用时自动退回 WASM/CPU
 * - **不绑定运行时**：具体 ONNX 推理库（sherpa-onnx / onnxruntime-web）
 *   通过适配器注入，本模块只定义契约与调度
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
