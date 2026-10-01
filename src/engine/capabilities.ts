/**
 * 能力中枢 —— WebGPU 检测 / 模型就绪状态 / 偏好持久化 / 统一异常
 *
 * 许可：AGPL-3.0-only
 *
 * 为什么单独一个文件：
 * ARCHITECTURE.md 第 3.2 条要求「引擎必须允许部分组件缺失」。要做到这点，
 * 全项目需要同一个「当前到底能做什么」的真相来源，以及同一个表示「这东西现在不可用」
 * 的异常类型。把它们放在这里可以避免 capabilities/phoneme/asr/llm 之间互相 import 形成环。
 *
 * 设计约束：
 * 1. 本文件是引擎层唯一的「基础设施」，不得 import 任何兄弟模块（避免循环依赖）
 * 2. 任何浏览器 API（localStorage / navigator.gpu）访问前都做 typeof 检查，Node 下不炸
 * 3. 偏好与 key 只存 localStorage，永不出网（ARCHITECTURE.md 第 6 条）
 */

/* ------------------------------------------------------------------ *
 * 统一异常
 * ------------------------------------------------------------------ */

/** 引擎分层标识：UI 依据它决定降级文案 */
export type EngineLayer = 'L1' | 'L2' | 'L3' | 'audio' | 'other';

/**
 * 「本该可用却不可用」。
 *
 * 为什么不是普通 Error：UI 需要区分「模型没加载/下载失败」（提示降级并继续 L0）
 * 和「代码 bug」（提示重试）。普通 Error 会被 catch-all 吞掉，诊断信息就丢了。
 */
export class EngineUnavailable extends Error {
  /** 出问题的层 */
  layer: EngineLayer;
  /** 机器可读的失败原因，便于测试与日志 */
  reason: string;

  constructor(message: string, layer: EngineLayer = 'other', reason = 'unknown') {
    super(message);
    this.name = 'EngineUnavailable';
    this.layer = layer;
    this.reason = reason;
  }
}

/** 类型守卫：catch 之后用它决定「降级」还是「报错」 */
export function isEngineUnavailable(e: unknown): e is EngineUnavailable {
  return e instanceof EngineUnavailable;
}

/* ------------------------------------------------------------------ *
 * 存储：localStorage 的安全包装
 * ------------------------------------------------------------------ */

/** 最小键值存储接口（localStorage 与内存回退共用） */
export interface KVStore {
  /** true 表示只是内存存储（Node / 无痕模式），刷新即丢 */
  readonly memoryOnly: boolean;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** 内存实现：Node 测试环境、无 localStorage 的环境全部落到这里 */
class MemoryStore implements KVStore {
  readonly memoryOnly = true;
  private map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

/** localStorage 适配器 */
class WebStore implements KVStore {
  readonly memoryOnly = false;
  // 显式字段声明：node --experimental-strip-types 只擦除类型，
  // 不支持构造函数参数属性（constructor(private x)），必须这样写。
  private ls: Storage;

  constructor(ls: Storage) {
    this.ls = ls;
  }

  getItem(key: string): string | null {
    try {
      return this.ls.getItem(key);
    } catch {
      // Safari 无痕模式偶发抛错：读失败当作「没有值」，绝不让 UI 崩
      return null;
    }
  }
  setItem(key: string, value: string): void {
    try {
      this.ls.setItem(key, value);
    } catch {
      /* 配额满 / 无痕模式：静默丢弃，用户体验优先于设置持久化 */
    }
  }
  removeItem(key: string): void {
    try {
      this.ls.removeItem(key);
    } catch {
      /* 同上 */
    }
  }
}

let storeCache: KVStore | null = null;

/** 取一个「一定可用」的存储句柄。结果缓存，避免每次录音都探测一遍 */
export function safeStorage(): KVStore {
  if (storeCache) return storeCache;
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      // 必须做一次写探测：无痕模式 getItem 正常但 setItem 抛错
      const probe = '__dsh_probe__';
      localStorage.setItem(probe, '1');
      localStorage.removeItem(probe);
      storeCache = new WebStore(localStorage);
      return storeCache;
    }
  } catch {
    /* 落到内存存储 */
  }
  storeCache = new MemoryStore();
  return storeCache;
}

/** 仅供测试：清掉缓存句柄（换成新的存储环境后需要） */
export function resetStorage(): void {
  storeCache = null;
}

/* ------------------------------------------------------------------ *
 * 偏好设置
 * ------------------------------------------------------------------ */

/** LLM（BYOK）设置。字段刻意全部可序列化，便于整体存 localStorage */
export interface LlmSettings {
  enabled: boolean;
  /** 服务商 id，对应 llm.ts 的 PROVIDERS[].id */
  provider: string;
  /** 用户自己的 key，绝不外传 */
  apiKey: string;
  /** 覆盖服务商默认 baseUrl（本地代理/自建服务需要） */
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  /** 单次请求超时（毫秒）。LLM 挂了就必须放弃，不能拖住主流程 */
  timeoutMs: number;
}

/** 引擎偏好 */
export interface EnginePrefs {
  /** L1 音素模型开关 */
  enablePhoneme: boolean;
  /** L2 Whisper 开关 */
  enableAsr: boolean;
  /** L3 LLM 开关 */
  enableLlm: boolean;
  /** 有 WebGPU 时是否优先用（关掉可强制 WASM，便于排障） */
  preferWebGPU: boolean;
  /** whisper 模型规格：tiny / base / small */
  asrModel: string;
  llm: LlmSettings;
}

export const DEFAULT_PREFS: EnginePrefs = {
  enablePhoneme: true,
  enableAsr: true,
  enableLlm: true,
  preferWebGPU: true,
  asrModel: 'base',
  llm: {
    enabled: false,
    provider: 'zhipu',
    apiKey: '',
    baseUrl: '',
    model: '',
    temperature: 0.4,
    maxTokens: 700,
    timeoutMs: 15000,
  },
};

const PREFS_KEY = 'dsh:prefs:v1';

let prefsCache: EnginePrefs | null = null;

function clampNumber(v: unknown, min: number, max: number, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}

/**
 * 逐字段合并：宁可丢掉脏字段也不整体回退。
 * 场景：用户手工改了 localStorage 或跨版本升级导致字段缺失，
 * 如果整体覆盖默认值，用户之前配好的 key 会被冲掉。
 */
function mergePrefs(base: EnginePrefs, raw: unknown): EnginePrefs {
  if (!raw || typeof raw !== 'object') return { ...base };
  const r = raw as Record<string, unknown>;
  const rawLlm = (r.llm && typeof r.llm === 'object' ? r.llm : {}) as Record<string, unknown>;
  return {
    enablePhoneme: typeof r.enablePhoneme === 'boolean' ? r.enablePhoneme : base.enablePhoneme,
    enableAsr: typeof r.enableAsr === 'boolean' ? r.enableAsr : base.enableAsr,
    enableLlm: typeof r.enableLlm === 'boolean' ? r.enableLlm : base.enableLlm,
    preferWebGPU: typeof r.preferWebGPU === 'boolean' ? r.preferWebGPU : base.preferWebGPU,
    asrModel: typeof r.asrModel === 'string' ? r.asrModel : base.asrModel,
    llm: {
      enabled: typeof rawLlm.enabled === 'boolean' ? rawLlm.enabled : base.llm.enabled,
      provider: typeof rawLlm.provider === 'string' ? rawLlm.provider : base.llm.provider,
      apiKey: typeof rawLlm.apiKey === 'string' ? rawLlm.apiKey : base.llm.apiKey,
      baseUrl: typeof rawLlm.baseUrl === 'string' ? rawLlm.baseUrl : base.llm.baseUrl,
      model: typeof rawLlm.model === 'string' ? rawLlm.model : base.llm.model,
      temperature: clampNumber(rawLlm.temperature, 0, 2, base.llm.temperature),
      maxTokens: clampNumber(rawLlm.maxTokens, 128, 8192, base.llm.maxTokens),
      timeoutMs: clampNumber(rawLlm.timeoutMs, 1000, 120000, base.llm.timeoutMs),
    },
  };
}

/** 读取偏好（带内存缓存，读一次即可） */
export function loadPrefs(): EnginePrefs {
  if (prefsCache) return prefsCache;
  const raw = safeStorage().getItem(PREFS_KEY);
  if (!raw) {
    prefsCache = clonePrefs(DEFAULT_PREFS);
    return prefsCache;
  }
  try {
    prefsCache = mergePrefs(DEFAULT_PREFS, JSON.parse(raw));
  } catch {
    // 偏好文件损坏不能让整个应用起不来
    prefsCache = clonePrefs(DEFAULT_PREFS);
  }
  return prefsCache;
}

/** 写入偏好并刷新缓存 */
export function savePrefs(patch: Partial<EnginePrefs>): EnginePrefs {
  const next = mergePrefs(loadPrefs(), { ...loadPrefs(), ...patch });
  prefsCache = next;
  safeStorage().setItem(PREFS_KEY, JSON.stringify(next));
  return next;
}

/** 恢复默认（用于「清除 API key」） */
export function resetPrefs(): EnginePrefs {
  prefsCache = clonePrefs(DEFAULT_PREFS);
  safeStorage().removeItem(PREFS_KEY);
  return prefsCache;
}

function clonePrefs(p: EnginePrefs): EnginePrefs {
  return { ...p, llm: { ...p.llm } };
}

/** 仅供测试：丢弃内存缓存 */
export function resetPrefsCache(): void {
  prefsCache = null;
}

/* ------------------------------------------------------------------ *
 * 模型就绪状态
 * ------------------------------------------------------------------ */

/** 可选模型 */
export type ModelId = 'phoneme' | 'asr';

/**
 * 模型状态机：idle → loading → ready | failed
 * UI 据此显示「模型加载中…」，失败时显示重试按钮。
 */
export type ModelState = 'idle' | 'loading' | 'ready' | 'failed';

const modelStates: Record<ModelId, ModelState> = { phoneme: 'idle', asr: 'idle' };

export function getModelState(id: ModelId): ModelState {
  return modelStates[id];
}

export function isModelReady(id: ModelId): boolean {
  return modelStates[id] === 'ready';
}

/** 状态变更入口。phoneme/asr 在加载成功或失败时调用 */
export function setModelState(id: ModelId, state: ModelState): void {
  if (modelStates[id] === state) return;
  modelStates[id] = state;
  emitCapabilities();
}

/** 仅供测试：重置为初始态 */
export function resetModelStates(): void {
  modelStates.phoneme = 'idle';
  modelStates.asr = 'idle';
}

/* ------------------------------------------------------------------ *
 * 能力快照
 * ------------------------------------------------------------------ */

/** ARCHITECTURE.md 3.3 定义的能力契约（ui 组只读） */
export interface Capabilities {
  webgpu: boolean;
  /** 音素模型是否就绪 */
  phoneme: boolean;
  /** Whisper 是否就绪 */
  asr: boolean;
  /** 用户是否配置了 key */
  llm: boolean;
}

// WebGPU 需要 requestAdapter 探测，结果缓存起来；先给一个「只看标志位」的乐观初值
let webgpuFlag = false;

/** 零成本探测：只判断浏览器是否声明了 navigator.gpu，不触发权限/适配器申请 */
export function hasWebGPUFlag(): boolean {
  try {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as unknown as { gpu?: unknown };
    return !!nav.gpu;
  } catch {
    return false;
  }
}

/** 真实探测：真的去要一次 GPUAdapter。失败一律视为不可用，绝不抛错 */
export async function detectWebGPU(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as unknown as {
      gpu?: { requestAdapter(options?: unknown): Promise<unknown> };
    };
    if (!nav.gpu || typeof nav.gpu.requestAdapter !== 'function') {
      webgpuFlag = false;
      return false;
    }
    const adapter = await nav.gpu.requestAdapter();
    webgpuFlag = !!adapter;
  } catch {
    webgpuFlag = false;
  }
  emitCapabilities();
  return webgpuFlag;
}

/** 录音相关浏览器能力（给 UI 决定「能不能开始录音」） */
export interface AudioCapabilities {
  supported: boolean;
  /** 浏览器可用的 MediaRecorder MIME（audio/webm;codecs=opus 优先） */
  mimeType: string | null;
  reason: string;
}

export function detectAudioInput(): AudioCapabilities {
  try {
    if (typeof navigator === 'undefined' || typeof MediaRecorder === 'undefined') {
      return { supported: false, mimeType: null, reason: '当前环境不支持 MediaRecorder（需要浏览器环境）' };
    }
    const md = (navigator as unknown as { mediaDevices?: { getUserMedia?: unknown } }).mediaDevices;
    if (!md || typeof md.getUserMedia !== 'function') {
      return { supported: false, mimeType: null, reason: '无法访问麦克风（getUserMedia 不可用，需要 HTTPS 或 localhost）' };
    }
    return { supported: true, mimeType: pickRecorderMimeType(), reason: '' };
  } catch (e) {
    return { supported: false, mimeType: null, reason: '录音能力检测失败：' + String(e) };
  }
}

/** 挑选浏览器支持的录音容器。选不对会让 decodeAudioData 在 Safari 上失败 */
export function pickRecorderMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
    return null;
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/aac',
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch {
      /* 某些浏览器对非法 MIME 抛错，继续试下一个 */
    }
  }
  return null;
}

/** 设备画像：决定默认用哪个 whisper 规格 */
export interface DeviceProfile {
  cores: number;
  /** navigator.deviceMemory，部分浏览器不给（Safari 没有） */
  memoryGb: number | null;
  webgpu: boolean;
}

export function detectDeviceProfile(): DeviceProfile {
  const nav = typeof navigator === 'undefined' ? undefined : (navigator as unknown as { hardwareConcurrency?: number; deviceMemory?: number });
  return {
    cores: typeof nav?.hardwareConcurrency === 'number' && nav.hardwareConcurrency > 0 ? nav.hardwareConcurrency : 4,
    memoryGb: typeof nav?.deviceMemory === 'number' ? nav.deviceMemory : null,
    webgpu: webgpuFlag || hasWebGPUFlag(),
  };
}

/**
 * 选择 ONNX Runtime 的执行设备。
 * WebGPU 优先、WASM 回退（ARCHITECTURE.md 第 5 条）。
 * 用户关掉 preferWebGPU 时强制 WASM，方便排障 WebGPU 兼容问题。
 */
export function pickDevice(preferWebGPU = true): 'webgpu' | 'wasm' {
  return preferWebGPU && webgpuFlag ? 'webgpu' : 'wasm';
}

/** LLM 是否已配置（provider 有效 + key 存在或服务商无需 key） */
export function isLlmConfigured(settings?: LlmSettings): boolean {
  const s = settings ?? loadPrefs().llm;
  return !!s.enabled && (!!s.apiKey.trim() || s.provider === 'ollama');
}

/** 当前能力快照。UI 每次渲染前调用一次即可（同步、无副作用） */
export function capabilities(): Capabilities {
  const prefs = loadPrefs();
  return {
    webgpu: webgpuFlag,
    phoneme: prefs.enablePhoneme && isModelReady('phoneme'),
    asr: prefs.enableAsr && isModelReady('asr'),
    llm: prefs.enableLlm && isLlmConfigured(prefs.llm),
  };
}

/* ------------------------------------------------------------------ *
 * 变更订阅：模型加载完成后 UI 要能刷新提示
 * ------------------------------------------------------------------ */

type CapabilitiesListener = (caps: Capabilities) => void;
const listeners = new Set<CapabilitiesListener>();

export function onCapabilitiesChange(fn: CapabilitiesListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emitCapabilities(): void {
  if (listeners.size === 0) return;
  const caps = capabilities();
  for (const fn of listeners) {
    try {
      fn(caps);
    } catch {
      /* 单个订阅者出错不能影响其它订阅者 */
    }
  }
}

/** 仅供测试：清空订阅者 */
export function clearCapabilityListeners(): void {
  listeners.clear();
}
