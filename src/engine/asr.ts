/**
 * L2 语音识别层 —— Whisper ONNX 转写
 *
 * 许可：AGPL-3.0-only
 *
 * 职责：把 16kHz 单声道 PCM 转成文本，作为 L0 规则层的输入。
 * 降级定位（ARCHITECTURE.md 第 4 条）：Whisper 不可用时 UI 应回退到
 * 「请手动输入你朗读的内容」，因此本模块任何失败都抛 EngineUnavailable，
 * 绝不返回半成品文本 —— 半成品会让 L0 给出错误诊断，比没有诊断更有害。
 */

import { EngineUnavailable, setModelState, getModelState, pickDevice } from './capabilities.ts';
import { preprocessForModel, TARGET_SAMPLE_RATE, isSilent, decodeBlobToPcm } from './audio.ts';
import type { DecodedAudio } from './audio.ts';

/** 可选 Whisper 模型。base 是质量/体积折中，tiny 给低端机 */
export const ASR_MODELS = {
  tiny: 'onnx-community/whisper-tiny',
  base: 'onnx-community/whisper-base',
  small: 'onnx-community/whisper-small',
} as const;

export type AsrModelKey = keyof typeof ASR_MODELS;

export interface AsrSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface TranscriptResult {
  text: string;
  segments: AsrSegment[];
  durationMs: number;
  model: string;
  /** true 表示音频太短或近似静音 */
  empty?: boolean;
}

/** ASR 模型是否就绪 */
export function isAsrModelReady(): boolean {
  return asrSession !== null && getModelState('asr') === 'ready';
}

/* ------------------------------------------------------------------ *
 * Transformers.js（仅浏览器）
 * ------------------------------------------------------------------ */

interface TransformersApi {
  pipeline: (task: string, model: string, opts?: Record<string, unknown>) => Promise<(audio: Float32Array, opts?: Record<string, unknown>) => Promise<unknown>>;
  env?: { allowLocalModels?: boolean };
}

interface WhisperOutput {
  text?: string;
  chunks?: Array<{ timestamp?: [number, number]; text?: string }>;
}

/** Transformers.js 的 ASR pipeline 调用签名 */
export type AsrSession = (audio: Float32Array, opts?: Record<string, unknown>) => Promise<WhisperOutput>;

let asrSession: AsrSession | null = null;
let asrLoading: Promise<unknown> | null = null;
let asrModelKey: AsrModelKey | string = 'base';

export interface LoadProgress {
  status: string;
  file?: string;
  progress?: number;
}

/** 载入 Whisper。失败抛 EngineUnavailable，供 UI 提示「请手动输入」 */
export async function loadAsrModel(
  opts: { model?: AsrModelKey | string; device?: 'webgpu' | 'wasm'; onProgress?: (p: LoadProgress) => void } = {},
): Promise<void> {
  if (asrSession) return;
  if (asrLoading) return asrLoading.then(() => undefined);

  const modelKey = opts.model ?? asrModelKey;
  asrLoading = (async (): Promise<void> => {
    setModelState('asr', 'loading');
    try {
      // @ts-ignore —— 可选重量级依赖，未安装时统一降级
      const lib = (await import('@huggingface/transformers')) as unknown as TransformersApi;
      const device = opts.device ?? pickDevice(true);
      const modelId = (ASR_MODELS as Record<string, string>)[modelKey] ?? String(modelIdOf(modelKey));
      const progress_callback = opts.onProgress
        ? (p: unknown) => {
            try {
              opts.onProgress?.(p as LoadProgress);
            } catch {
              /* ignore */
            }
          }
        : undefined;

      asrSession = (await lib.pipeline('automatic-speech-recognition', modelId, {
        device,
        // WebGPU 用 fp32 编码器更稳，WASM 用 q8 压体积换速度
        dtype: device === 'webgpu' ? { encoder_model: 'fp32', decoder_model_merged: 'q4' } : 'q8',
        progress_callback,
      })) as AsrSession;
      asrModelKey = modelKey;
      setModelState('asr', 'ready');
    } catch (e) {
      setModelState('asr', 'failed');
      throw new EngineUnavailable(
        '语音识别模型加载失败（请手动输入你朗读的内容）：' + String(e),
        'L2',
        'model_load_failed',
      );
    } finally {
      asrLoading = null;
    }
  })();

  return asrLoading.then(() => undefined);
}

function modelIdOf(key: AsrModelKey | string): string {
  return (ASR_MODELS as Record<string, string>)[key] ?? String(key);
}

/** 仅供测试：释放会话 */
export function resetAsrModel(): void {
  asrSession = null;
  asrLoading = null;
  setModelState('asr', 'idle');
}

/** 内部：确保模型可用，否则抛 EngineUnavailable */
async function requireSession(): Promise<AsrSession> {
  if (asrSession) return asrSession;
  if (getModelState('asr') === 'failed') {
    throw new EngineUnavailable('语音识别模型上次加载失败，请手动输入内容或点击重试。', 'L2', 'model_failed');
  }
  await loadAsrModel({ model: asrModelKey });
  if (!asrSession) throw new EngineUnavailable('语音识别模型不可用。', 'L2', 'model_unavailable');
  return asrSession;
}

/** 把模型的原始输出整理成 TranscriptResult */
export function parseWhisperOutput(raw: unknown, durationMs: number): TranscriptResult {
  const out = (raw ?? {}) as WhisperOutput;
  const text = (out.text ?? '').toString().trim();
  const segments: AsrSegment[] = (out.chunks ?? [])
    .filter((c) => c && typeof c.text === 'string')
    .map((c) => ({
      startMs: Math.round((c.timestamp?.[0] ?? 0) * 1000),
      endMs: Math.round((c.timestamp?.[1] ?? 0) * 1000),
      text: c.text ?? '',
    }));
  return { text, segments, durationMs, model: 'whisper', empty: text.length === 0 };
}

/**
 * 转写入口。
 * @param audio   单声道 PCM
 * @param sampleRate 原始采样率（内部会重采样到 16k）
 */
export async function transcribe(audio: Float32Array, sampleRate: number): Promise<TranscriptResult> {
  if (!audio || audio.length === 0) {
    return { text: '', segments: [], durationMs: 0, model: 'whisper', empty: true };
  }
  const session = await requireSession();
  const prepared = preprocessForModel(audio, sampleRate, TARGET_SAMPLE_RATE);

  // 近似静音：直接给空结果，让上层提示「没听到声音」，而不是让模型幻觉出一段话
  if (prepared.durationMs < 250 || isSilent(prepared.samples)) {
    return { text: '', segments: [], durationMs: prepared.durationMs, model: 'whisper', empty: true };
  }

  try {
    const raw = await session(prepared.samples, {
      language: 'english',
      task: 'transcribe',
      chunk_length_s: 30, // 超过 30 秒的作答需要分块，否则 Whisper 会截断
      stride_length_s: 5,
      return_timestamps: true,
    });
    return parseWhisperOutput(raw, prepared.durationMs);
  } catch (e) {
    throw new EngineUnavailable('语音识别失败：' + String(e), 'L2', 'infer_failed');
  }
}

/** 便捷入口：直接对 Blob 录音解码并转写 */
export async function transcribeBlob(blob: Blob): Promise<TranscriptResult> {
  const decoded: DecodedAudio = await decodeBlobToPcm(blob);
  return transcribe(decoded.samples, decoded.sampleRate);
}
