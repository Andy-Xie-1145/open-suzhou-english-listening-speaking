/**
 * 音频工具 —— MediaRecorder → Float32Array → 16kHz 单声道 PCM
 *
 * 许可：AGPL-3.0-only
 *
 * ARCHITECTURE.md 第 1.2 条：音频不出浏览器。
 * 本模块是唯一的音频入口，所有解码都发生在内存里，返回的 Float32Array 用完即弃，
 * 全文件没有任何 fetch/XHR/文件写入。
 *
 * 为什么把「纯函数」和「浏览器 API」放在同一个文件：
 * DSP 部分（重采样、WAV 解码、静音裁剪、能量统计）不依赖任何浏览器 API，
 * 因此可以在 Node 里被 tests/engine.test.ts 直接验证；而浏览器部分全部做 typeof 守卫，
 * 在 Node 下调用会抛 EngineUnavailable 而不是 ReferenceError。
 */

/* 本模块不 import 兄弟模块以外的东西，EngineUnavailable 来自能力中枢 */
import { EngineUnavailable } from './capabilities.ts';

/** 所有模型（wav2vec2 / whisper）都吃 16kHz，统一在这里对齐 */
export const TARGET_SAMPLE_RATE = 16000;

/** 解码结果 */
export interface DecodedAudio {
  /** [-1, 1] 区间单声道 PCM */
  samples: Float32Array;
  sampleRate: number;
  durationMs: number;
}

/* ------------------------------------------------------------------ *
 * 纯 DSP：全部可在 Node 测试
 * ------------------------------------------------------------------ */

/** 时长（毫秒） */
export function durationMsOf(samples: Float32Array, sampleRate: number): number {
  if (!samples || samples.length === 0 || !sampleRate) return 0;
  return (samples.length / sampleRate) * 1000;
}

/** 多声道 → 单声道（取平均，避免相位抵消导致的声音被抵消） */
export function toMono(channels: Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array(0);
  if (channels.length === 1) return channels[0].slice();
  const len = channels[0].length;
  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    let sum = 0;
    for (let c = 0; c < channels.length; c++) sum += channels[c][i] ?? 0;
    out[i] = sum / channels.length;
  }
  return out;
}

/**
 * 线性插值重采样。
 * 为什么用线性插值而不是浏览器原生：模型推理前必须保证输入采样率精确为 16k，
 * 而 decodeAudioData 的输出采样率由采集设备决定（44.1k/48k 都常见）。
 * 语速学习类场景对重采样保真度要求不高，线性插值足够，且纯 JS、可测试、零依赖。
 */
export function resample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (input.length === 0 || !fromRate || !toRate) return new Float32Array(0);
  if (fromRate === toRate) return input.slice();

  const ratio = fromRate / toRate;
  const outLen = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(outLen);
  const last = input.length - 1;

  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    if (i0 >= last) {
      out[i] = input[last];
      continue;
    }
    const frac = pos - i0;
    out[i] = input[i0] * (1 - frac) + input[i0 + 1] * frac;
  }
  return out;
}

/** 重采样到模型要求的目标采样率 */
export function resampleToTarget(
  input: Float32Array,
  fromRate: number,
  toRate: number = TARGET_SAMPLE_RATE,
): Float32Array {
  return resample(input, fromRate, toRate);
}

/** 峰值归一化。麦克风增益差异很大，不归一化会让模型的 logits 分布漂移 */
export function normalizePeak(input: Float32Array, target = 0.95): Float32Array {
  if (input.length === 0) return input;
  let peak = 0;
  for (let i = 0; i < input.length; i++) {
    const v = Math.abs(input[i]);
    if (v > peak) peak = v;
  }
  if (peak <= 1e-6) return input.slice(); // 静音：原样返回，避免放大噪声
  const gain = target / peak;
  const out = new Float32Array(input.length);
  for (let i = 0; i < input.length; i++) out[i] = input[i] * gain;
  return out;
}

/** 均方根能量，用于判断「有没有在说话」 */
export function rms(input: Float32Array): number {
  if (input.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < input.length; i++) sum += input[i] * input[i];
  return Math.sqrt(sum / input.length);
}

/** 峰值绝对值 */
export function peakAbs(input: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < input.length; i++) {
    const v = Math.abs(input[i]);
    if (v > peak) peak = v;
  }
  return peak;
}

/** 是否（近似）静音。阈值 0.01 ≈ -40dBFS，低于此基本是环境噪声底 */
export function isSilent(input: Float32Array, threshold = 0.01): boolean {
  return rms(input) < threshold;
}

/**
 * 录音质量分（0~1），用于音素报告的置信度打折。
 * 只看两个可解释指标：有没有声音（RMS）、是否削波（峰值贴近 1）。
 */
export function audioQuality(input: Float32Array): number {
  if (input.length === 0) return 0;
  const level = Math.min(1, rms(input) / 0.05);   // 0.05 RMS 视为「正常说话」
  const peak = peakAbs(input);
  const clipping = peak > 0.99 ? 0.7 : 1;         // 削波要扣分：录音已经失真
  return Math.max(0, Math.min(1, level * clipping));
}

/** 语音活动区间 */
export interface ActivityWindow {
  startMs: number;
  endMs: number;
  speechMs: number;
  /** 全段近似静音 */
  silent: boolean;
}

/**
 * 能量阈值 VAD。
 * 为什么需要：录音开头结尾通常有 1~2 秒静默，直接送进 CTC 模型会产生大量空插入，
 * 让「多读」的判定失真。裁掉静音后对齐结果才可信。
 */
export function detectSpeechActivity(
  samples: Float32Array,
  sampleRate: number,
  opts: { frameMs?: number; minRms?: number } = {},
): ActivityWindow {
  const frameMs = opts.frameMs ?? 25;
  const hopMs = frameMs / 2;
  if (samples.length === 0 || !sampleRate) {
    return { startMs: 0, endMs: 0, speechMs: 0, silent: true };
  }
  const frameLen = Math.max(1, Math.round((frameMs / 1000) * sampleRate));
  const hopLen = Math.max(1, Math.round((hopMs / 1000) * sampleRate));
  const frames: number[] = [];
  for (let i = 0; i + frameLen <= samples.length; i += hopLen) {
    frames.push(rms(samples.subarray(i, i + frameLen)));
  }
  if (frames.length === 0) {
    return { startMs: 0, endMs: durationMsOf(samples, sampleRate), speechMs: 0, silent: true };
  }

  // 噪声底取 10 分位数：比平均值更抗「大部分时间在说话」的情况
  const sorted = frames.slice().sort((a, b) => a - b);
  const noiseFloor = sorted[Math.floor(sorted.length * 0.1)] ?? 0;
  const threshold = Math.max(noiseFloor * 3, opts.minRms ?? 0.008);

  let first = -1;
  let last = -1;
  for (let i = 0; i < frames.length; i++) {
    if (frames[i] >= threshold) {
      if (first < 0) first = i;
      last = i;
    }
  }
  if (first < 0) {
    return { startMs: 0, endMs: durationMsOf(samples, sampleRate), speechMs: 0, silent: true };
  }
  const startMs = first * hopMs;
  const endMs = Math.min(durationMsOf(samples, sampleRate), (last + 1) * frameMs);
  return { startMs, endMs, speechMs: Math.max(0, endMs - startMs), silent: false };
}

/** 按 VAD 裁掉首尾静音；静音或参数异常时原样返回 */
export function trimSilence(
  samples: Float32Array,
  sampleRate: number,
  opts: { frameMs?: number; minRms?: number } = {},
): Float32Array {
  const w = detectSpeechActivity(samples, sampleRate, opts);
  if (w.silent || w.speechMs <= 0) return samples.slice();
  const start = Math.max(0, Math.floor((w.startMs / 1000) * sampleRate));
  const end = Math.min(samples.length, Math.ceil((w.endMs / 1000) * sampleRate));
  return samples.slice(start, end);
}

/**
 * WAV（RIFF）解码 —— 纯函数，不依赖任何浏览器 API。
 * 为什么自己写：测试需要在 Node 里喂一段「已知内容的 PCM」来验证重采样/单声道逻辑，
 * 而且部分设备录出来就是 wav，双路径比单路径更稳。
 */
export function decodeWavToPcm(
  bytes: Uint8Array,
  opts: { targetSampleRate?: number } = {},
): DecodedAudio {
  const target = opts.targetSampleRate ?? TARGET_SAMPLE_RATE;
  const fail = (reason: string): never => {
    throw new EngineUnavailable('音频解析失败：' + reason, 'audio', reason);
  };

  if (bytes.byteLength < 44) fail('文件过短，不是有效的 WAV');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (o: number): string =>
    String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3]);
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') fail('不是 RIFF/WAVE 容器');

  let format = 0;
  let channels = 0;
  let sampleRate = 0;
  let bits = 0;
  let blockAlign = 0;
  let dataOffset = -1;
  let dataLength = 0;

  // 遍历 chunk：RIFF 里 chunk 顺序不保证，data 可能在中间（LIST 之后）
  let pos = 12;
  while (pos + 8 <= bytes.byteLength) {
    const id = tag(pos);
    const size = view.getUint32(pos + 4, true);
    const body = pos + 8;
    if (id === 'fmt ') {
      format = view.getUint16(body, true);
      channels = view.getUint16(body + 2, true);
      sampleRate = view.getUint32(body + 4, true);
      blockAlign = view.getUint16(body + 12, true);
      bits = view.getUint16(body + 14, true);
      // WAVE_FORMAT_EXTENSIBLE：真实格式藏在 SubFormat GUID 的头两字节
      if (format === 0xfffe && size >= 40) format = view.getUint16(body + 24, true);
    } else if (id === 'data') {
      dataOffset = body;
      // 文件被截断时按实际剩余长度处理，不要越界读
      dataLength = Math.max(0, Math.min(size, bytes.byteLength - body));
    }
    pos = body + size + (size % 2); // chunk 按 2 字节对齐
  }

  if (dataOffset < 0 || dataLength <= 0) fail('缺少 data 块');
  if (!channels || !sampleRate || !bits) fail('缺少 fmt 参数');
  if (format !== 1 && format !== 3) fail('不支持的编码格式（' + format + '）');

  const bytesPerSample = bits >> 3;
  if (!blockAlign) blockAlign = bytesPerSample * channels;
  const frameCount = Math.floor(dataLength / blockAlign);
  if (frameCount <= 0) fail('没有可解码的采样点');

  const buf: Float32Array[] = [];
  for (let c = 0; c < channels; c++) buf.push(new Float32Array(frameCount));

  let p = dataOffset;
  for (let i = 0; i < frameCount; i++) {
    for (let c = 0; c < channels; c++) {
      let v = 0;
      if (format === 3 && bits === 32) v = view.getFloat32(p, true);
      else if (format === 3 && bits === 64) v = view.getFloat64(p, true);
      else if (bits === 8) v = (view.getUint8(p) - 128) / 128;
      else if (bits === 16) v = view.getInt16(p, true) / 32768;
      else if (bits === 24) {
        // 24bit 有符号：取三字节后手动符号扩展
        const b0 = view.getUint8(p);
        const b1 = view.getUint8(p + 1);
        const b2 = view.getUint8(p + 2);
        let n = b0 | (b1 << 8) | (b2 << 16);
        if (n & 0x800000) n |= ~0xffffff;
        v = n / 8388608;
      } else if (bits === 32) v = view.getInt32(p, true) / 2147483648;
      else if (bits === 64) v = view.getFloat64(p, true) / 2147483648;
      else fail('不支持的位深 ' + bits);
      buf[c][i] = v;
      p += bytesPerSample;
    }
  }

  const mono = toMono(buf);
  const samples = resampleToTarget(mono, sampleRate, target);
  return { samples, sampleRate: target, durationMs: durationMsOf(samples, target) };
}

/* ------------------------------------------------------------------ *
 * 浏览器部分：全部带 typeof 守卫，Node 下抛 EngineUnavailable
 * ------------------------------------------------------------------ */

/** 录音是否可用 */
export function isRecordingSupported(): boolean {
  return detectAudioInputSafe().supported;
}

function detectAudioInputSafe(): { supported: boolean; mimeType: string | null } {
  try {
    if (typeof navigator === 'undefined' || typeof MediaRecorder === 'undefined') {
      return { supported: false, mimeType: null };
    }
    const md = (navigator as unknown as { mediaDevices?: { getUserMedia?: unknown } }).mediaDevices;
    if (!md || typeof md.getUserMedia !== 'function') return { supported: false, mimeType: null };
    return { supported: true, mimeType: pickMimeTypeSafe() };
  } catch {
    return { supported: false, mimeType: null };
  }
}

function pickMimeTypeSafe(): string | null {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return null;
  }
  for (const c of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/aac']) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* 继续试 */
    }
  }
  return null;
}

/** 拿到一个 AudioContext 构造器（兼容旧 WebKit 前缀） */
function audioContextCtor(): (new () => AudioContext) | null {
  const g = globalThis as unknown as {
    AudioContext?: new () => AudioContext;
    webkitAudioContext?: new () => AudioContext;
  };
  return g.AudioContext ?? g.webkitAudioContext ?? null;
}

/**
 * Blob → 16kHz 单声道 PCM。
 * 优先用 AudioContext.decodeAudioData（能解 webm/opus/mp4），
 * 浏览器不支持时退回 WAV 解析器。音频只存在于内存变量里，用完即弃。
 */
export async function decodeBlobToPcm(blob: Blob, targetSampleRate = TARGET_SAMPLE_RATE): Promise<DecodedAudio> {
  if (!blob || typeof blob.arrayBuffer !== 'function') {
    throw new EngineUnavailable('没有可解码的音频数据。', 'audio', 'no_blob');
  }
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const Ctor = audioContextCtor();

  if (Ctor) {
    const ctx = new Ctor();
    try {
      // 新版浏览器返回 Promise；旧 Safari 用回调形式，这里统一走 Promise
      const decoded = await ctx.decodeAudioData(bytes.buffer.slice(0));
      const channels: Float32Array[] = [];
      for (let c = 0; c < decoded.numberOfChannels; c++) channels.push(decoded.getChannelData(c));
      const samples = resampleToTarget(toMono(channels), decoded.sampleRate, targetSampleRate);
      return { samples, sampleRate: targetSampleRate, durationMs: durationMsOf(samples, targetSampleRate) };
    } catch (e) {
      // 某些 webm 片段解不开，退回 WAV 解析再试一次
      try {
        return decodeWavToPcm(bytes, { targetSampleRate });
      } catch {
        throw new EngineUnavailable('音频解码失败：' + String(e), 'audio', 'decode_failed');
      }
    } finally {
      try {
        await ctx.close();
      } catch {
        /* 关闭失败无所谓 */
      }
    }
  }

  return decodeWavToPcm(bytes, { targetSampleRate });
}

export interface RecorderOptions {
  mimeType?: string;
  /** 分片写盘间隔（毫秒）。给 1000ms 可以顺带拿到时长元数据 */
  timesliceMs?: number;
  /** 采集参数：默认关掉回声消除与降噪，保证发音细节不被算法抹平 */
  audioConstraints?: MediaTrackConstraints;
}

/**
 * 麦克风录制器。
 *
 * 为什么不用 AudioWorklet 直接取 PCM：AudioWorklet 需要单独的模块文件与安全上下文，
 * 会破坏「纯静态单页」和「Node 可测」的约束；MediaRecorder + decodeAudioData
 * 在所有目标浏览器上都可用，且音频天然只留在内存。
 */
export class MicrophoneRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private opts: RecorderOptions;
  /** 采集开始时的 performance.now()，用于在没有时间戳时估算时长 */
  private startedAt = 0;

  constructor(opts: RecorderOptions = {}) {
    this.opts = opts;
  }

  /** 'unsupported' 让 UI 能区分「浏览器不支持」和「还没开始录」 */
  get state(): 'inactive' | 'recording' | 'unsupported' {
    if (!isRecordingSupported()) return 'unsupported';
    return this.recorder && this.recorder.state === 'recording' ? 'recording' : 'inactive';
  }

  /** 已录制时长（毫秒），用于录音时的计时器 */
  elapsedMs(): number {
    if (!this.startedAt) return 0;
    const g = globalThis as unknown as { performance?: { now(): number } };
    const now = g.performance ? g.performance.now() : Date.now();
    return Math.max(0, now - this.startedAt);
  }

  async start(): Promise<void> {
    if (!isRecordingSupported()) {
      throw new EngineUnavailable(
        '当前环境无法录音：请在支持 MediaRecorder 的浏览器中，并通过 HTTPS 或 localhost 打开。',
        'audio',
        'unsupported',
      );
    }
    if (this.recorder) throw new EngineUnavailable('已经在录音了。', 'audio', 'already_recording');

    const md = navigator.mediaDevices;
    this.stream = await md.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,   // 口语评测必须听清自己的原声
        noiseSuppression: false,
        autoGainControl: false,
        ...(this.opts.audioConstraints ?? {}),
      },
    });

    const mimeType = this.opts.mimeType ?? pickMimeTypeSafe() ?? undefined;
    try {
      this.recorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);
    } catch (e) {
      releaseStream(this.stream);
      this.stream = null;
      throw new EngineUnavailable('无法创建录音器：' + String(e), 'audio', 'recorder_failed');
    }

    this.chunks = [];
    this.recorder.ondataavailable = (ev: BlobEvent) => {
      if (ev.data && ev.data.size > 0) this.chunks.push(ev.data);
    };
    this.recorder.start(this.opts.timesliceMs ?? 250);
    const g = globalThis as unknown as { performance?: { now(): number } };
    this.startedAt = g.performance ? g.performance.now() : Date.now();
  }

  /** 停止录音并解码。调用方拿到的 PCM 只存在于内存，用完即弃 */
  async stop(): Promise<DecodedAudio> {
    const rec = this.recorder;
    if (!rec) throw new EngineUnavailable('当前没有在录音。', 'audio', 'not_recording');

    const done = new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
    });
    if (rec.state !== 'inactive') rec.stop();
    await done;

    const blob = new Blob(this.chunks, { type: rec.mimeType || 'audio/webm' });
    this.chunks = [];
    this.recorder = null;
    this.startedAt = 0;
    const stream = this.stream;
    this.stream = null;
    releaseStream(stream);

    return decodeBlobToPcm(blob);
  }

  /** 放弃本次录音（不产出数据），确保麦克风指示灯熄灭 */
  cancel(): void {
    try {
      if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
    } catch {
      /* ignore */
    }
    this.recorder = null;
    this.chunks = [];
    this.startedAt = 0;
    releaseStream(this.stream);
    this.stream = null;
  }
}

function releaseStream(stream: MediaStream | null): void {
  if (!stream) return;
  try {
    for (const t of stream.getTracks()) t.stop(); // 必须停，否则麦克风灯一直亮着
  } catch {
    /* ignore */
  }
}

/**
 * 喂给模型前的统一预处理：重采样 16k → 裁静音 → 峰值归一化。
 * asr 与 phoneme 共用，保证两层看到的波形一致，便于对齐调试。
 */
export function preprocessForModel(
  samples: Float32Array,
  sampleRate: number,
  targetSampleRate = TARGET_SAMPLE_RATE,
): DecodedAudio {
  const resampled = resampleToTarget(samples, sampleRate, targetSampleRate);
  const trimmed = trimSilence(resampled, targetSampleRate);
  const safe = trimmed.length > 0 ? trimmed : resampled;
  return {
    samples: normalizePeak(safe),
    sampleRate: targetSampleRate,
    durationMs: durationMsOf(safe, targetSampleRate),
  };
}
