/**
 * 引擎层统一出口 —— ui 组只需要 import 这个文件
 *
 * 许可：AGPL-3.0-only
 *
 * 为什么要 index：ui 组不应该知道引擎内部怎么分层，
 * 他们只应该看到 ARCHITECTURE.md 3.2 的 Engine 接口与 3.3 的类型。
 */

/* --- 异常与能力 --- */
export {
  EngineUnavailable,
  isEngineUnavailable,
  capabilities,
  onCapabilitiesChange,
  detectWebGPU,
  hasWebGPUFlag,
  detectDeviceProfile,
  detectAudioInput,
  pickRecorderMimeType,
  pickDevice,
  setModelState,
  getModelState,
  isModelReady,
  resetModelStates,
  safeStorage,
  resetPrefsCache,
  loadPrefs,
  savePrefs,
  resetPrefs,
} from './capabilities.ts';

export type {
  Capabilities,
  EngineLayer,
  EnginePrefs,
  LlmSettings,
  ModelId,
  ModelState,
  DeviceProfile,
  AudioCapabilities,
} from './capabilities.ts';

/* --- 音频：录音在 ui 组，解码/重采样在这里 --- */
export {
  TARGET_SAMPLE_RATE,
  MicrophoneRecorder,
  decodeBlobToPcm,
  decodeWavToPcm,
  isRecordingSupported,
  durationMsOf,
  toMono,
  resample,
  resampleToTarget,
  normalizePeak,
  rms,
  isSilent,
  audioQuality,
  detectSpeechActivity,
  trimSilence,
  preprocessForModel,
} from './audio.ts';

export type {
  DecodedAudio,
  RecorderOptions,
  ActivityWindow,
} from './audio.ts';

/* --- L1 音素 --- */
export {
  PHONEME_MODEL_ID,
  loadPhonemeModel,
  isPhonemeModelReady,
  assessPhonemes,
  recognizePhonemes,
  g2pReference,
  fallbackG2pWord,
  alignPhonemeSequences,
  alignByWord,
  normalizeIpa,
  phoneDistance,
  phoneClass,
  splitIpaToPhones,
  splitModelOutput,
  describeError,
  resetPhonemeModel,
  resetEspeak,
} from './phoneme.ts';

export type {
  PhonemeReport,
  PhonemeStep,
  PhonemeError,
  PhonemeOpKind,
  WordPhonemeResult,
  SequenceAlignment,
  G2PResult,
  AssessOptions,
} from './phoneme.ts';

/* --- L2 ASR --- */
export {
  ASR_MODELS,
  loadAsrModel,
  isAsrModelReady,
  transcribe,
  transcribeBlob,
  parseWhisperOutput,
  resetAsrModel,
} from './asr.ts';

export type {
  TranscriptResult,
  AsrSegment,
  AsrModelKey,
} from './asr.ts';

/* --- L3 LLM --- */
export {
  PROVIDERS,
  providerById,
  resolveSettings,
  isLlmConfigured,
  requestAdvice,
  enhance,
  parseAdvice,
  extractJsonObject,
  buildRequestBody,
  buildHeaders,
  buildUserPrompt,
  resolveEndpoint,
  maskKey,
} from './llm.ts';

export type {
  LLMAdvice,
  LlmInput,
  LlmCallOptions,
  ProviderSpec,
} from './llm.ts';

/* --- 编排 --- */
export {
  analyze,
  analyzeWith,
  createEngine,
  getEngine,
  resetEngine,
  defaultDeps,
} from './pipeline.ts';

export type {
  Engine,
  EngineDeps,
  AnalyzeDeps,
  AnalyzeInput,
  AnalyzeOptions,
  AnalyzeKind,
  AnalysisResult,
} from './pipeline.ts';
