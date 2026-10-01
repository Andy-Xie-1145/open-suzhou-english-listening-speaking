/**
 * L3 大模型层 —— BYOK 客户端（OpenAI 兼容协议）
 *
 * 许可：AGPL-3.0-only
 *
 * 契约（ARCHITECTURE.md 第 1.3 / 第 6 条）：
 * 1. key 由用户自己填写，浏览器直连用户选定的服务商，零服务端中转
 * 2. key 只存 localStorage，永不写入日志、永不上报
 * 3. 五家服务商全部走 OpenAI 兼容的 /chat/completions，所以只需一个请求函数
 *
 * 最重要的行为约束（ARCHITECTURE.md 第 4 条）：
 * LLM 挂了就返回 null，绝不能影响主流程。
 * 任何异常（超时 / 401 / 配额耗尽 / 网络不通 / 返回格式不对）都必须在
 * enhance() 内部被吞掉并降级成 null。LLM 是锦上添花，不是主链路。
 */

import type { LlmSettings } from './capabilities.ts';
import { EngineUnavailable, loadPrefs } from './capabilities.ts';

/* ------------------------------------------------------------------ *
 * 服务商目录（ARCHITECTURE.md 第 6 节）
 * ------------------------------------------------------------------ */

export interface ProviderSpec {
  id: string;
  label: string;
  /** OpenAI 兼容 base url（不含 /chat/completions） */
  baseUrl: string;
  /** 默认模型 */
  model: string;
  /** 是否需要 key。本地 Ollama 不需要 */
  needsKey: boolean;
  /** 中文备注，展示给用户 */
  note: string;
  /** key 的获取地址 */
  consoleUrl?: string;
}

export const PROVIDERS: ProviderSpec[] = [
  {
    id: 'zhipu',
    label: '智谱 GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    needsKey: true,
    note: '永久免费无 token 限制，首选推荐',
    consoleUrl: 'https://open.bigmodel.cn/dev/api',
  },
  {
    id: 'siliconflow',
    label: '硅基流动',
    baseUrl: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2-7B-Instruct',
    needsKey: true,
    note: '有完全免费模型',
    consoleUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  {
    id: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'gpt-oss-120b',
    needsKey: true,
    note: '免费额度高，速度快',
    consoleUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'gemini',
    label: 'Google AI Studio',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.5-flash',
    needsKey: true,
    note: '注意浏览器 CORS 与地区限制',
    consoleUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'ollama',
    label: '本地 Ollama',
    baseUrl: 'http://localhost:11434/v1',
    model: 'qwen3:4b',
    needsKey: false,
    note: '完全离线，录音与文本都不出本机',
  },
];

/** 按 id 取服务商；未配置时回退到智谱（首选推荐） */
export function providerById(id: string | undefined | null): ProviderSpec {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0];
}

/** 把设置里的空串当作「用默认值」，方便 UI 只让用户填 key */
export function resolveSettings(settings?: Partial<LlmSettings>): LlmSettings {
  const base = loadPrefs().llm;
  const merged: LlmSettings = { ...base, ...(settings ?? {}) };
  const spec = providerById(merged.provider);
  const baseUrl = (merged.baseUrl ?? '').trim() || spec.baseUrl;
  return {
    enabled: typeof merged.enabled === 'boolean' ? merged.enabled : true,
    provider: spec.id,
    apiKey: (merged.apiKey ?? '').trim(),
    baseUrl,
    model: (merged.model ?? '').trim() || spec.model,
    temperature: typeof merged.temperature === 'number' ? merged.temperature : 0.4,
    maxTokens: typeof merged.maxTokens === 'number' ? merged.maxTokens : 700,
    timeoutMs: typeof merged.timeoutMs === 'number' ? merged.timeoutMs : 15000,
  };
}

/** 是否已经配置好（key 存在，或服务商本来就不需要 key） */
export function isLlmConfigured(settings?: Partial<LlmSettings>): boolean {
  const s = resolveSettings(settings);
  const spec = providerById(s.provider);
  return !!s.enabled && (!!s.apiKey || !spec.needsKey);
}

/* ------------------------------------------------------------------ *
 * LLM 输出结构
 * ------------------------------------------------------------------ */

export interface LLMAdvice {
  /** 一句话总体评价 */
  summary: string;
  /** 语法/用词问题 */
  grammar: string[];
  /** 流利度与口语习惯 */
  fluency: string[];
  /** 可直接模仿的示范句 */
  examples: string[];
  /** 下一步练习建议 */
  practice: string[];
  /** 原始模型输出，排障用 */
  raw?: string;
}

/* ------------------------------------------------------------------ *
 * 请求构造（纯逻辑，可测试）
 * ------------------------------------------------------------------ */

const SYSTEM_PROMPT = [
  '你是一位耐心的初中英语口语教练，正在点评一名九年级学生的英语口语表现。',
  '规则：',
  '1. 只输出 JSON，不要输出任何解释文字或 Markdown 代码块。',
  '2. 评价要具体、可执行，避免空话套话。',
  '3. 全部使用简体中文书写；例句保留英文原文。',
  '4. 学生水平有限，句式示例要用初中词汇。',
  'JSON 结构：summary(一句话评价) / grammar(语法用词问题) / fluency(流利度问题) / examples(示范句) / practice(练习建议)，后四项是字符串数组。',
].join('\n');

export interface LlmInput {
  transcript: string;
  topicName?: string | null;
  kind: 'reading' | 'qa' | 'topic';
  /** 规则层诊断摘要，喂给模型能显著提升针对性 */
  ruleSummary?: string;
  /** 音素错读摘要（若有 L1） */
  phonemeSummary?: string;
}

export function buildUserPrompt(input: LlmInput): string {
  const parts: string[] = [];
  parts.push('题型：' + (input.kind === 'reading' ? '朗读短文' : input.kind === 'qa' ? '情景问答' : '话题简述'));
  if (input.topicName) parts.push('话题：' + input.topicName);
  if (input.ruleSummary) parts.push('规则层诊断：' + input.ruleSummary);
  if (input.phonemeSummary) parts.push('音素层诊断：' + input.phonemeSummary);
  parts.push('学生转写内容：\n' + input.transcript);
  parts.push('请按 JSON 结构输出评价。');
  return parts.join('\n');
}

/** 从任意文本里抠出第一个配平的 JSON 对象（正确处理字符串与转义） */
export function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      if (inStr) escaped = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * 把模型输出解析成 LLMAdvice。
 *
 * 为什么这么防御式：小模型经常在 JSON 外面裹 Markdown 代码块、或者多写一句解释、
 * 或者干脆返回自然语言。任何一种都必须能救回来；救不回来就返回 null 降级，
 * 绝不能把脏数据丢给 UI 渲染。
 */
export function parseAdvice(raw: string): LLMAdvice | null {
  if (!raw) return null;
  const json = extractJsonObject(raw);
  if (!json) return null;

  let obj: unknown;
  try {
    obj = JSON.parse(json);
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;
  const o = obj as Record<string, unknown>;

  // 只接受字符串与有限数字：模型偶尔把建议写成数字，保留；对象/null 一律丢弃，
  // 否则会渲染出 [object Object] 这种脏内容
  const strList = (v: unknown): string[] =>
    Array.isArray(v)
      ? v
          .filter((x) => typeof x === 'string' || (typeof x === 'number' && Number.isFinite(x)))
          .map((x) => String(x).trim())
          .filter((s) => s.length > 0)
      : [];

  const summary = typeof o.summary === 'string' ? o.summary.trim() : '';
  const grammar = strList(o.grammar);
  const fluency = strList(o.fluency);
  const examples = strList(o.examples);
  const practice = strList(o.practice);

  // 全部字段都空 = 等于没返回有效内容，按失败处理
  if (!summary && !grammar.length && !fluency.length && !examples.length && !practice.length) return null;

  return { summary, grammar, fluency, examples, practice, raw };
}

/** 组装最终请求体（OpenAI 兼容） */
export function buildRequestBody(settings: LlmSettings, input: LlmInput): Record<string, unknown> {
  return {
    model: settings.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(input) },
    ],
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
    stream: false,
  };
}

/** 组装请求头。Ollama 没 key 时完全不带 Authorization，避免本地服务收到垃圾头 */
export function buildHeaders(settings: LlmSettings): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (settings.apiKey) headers['Authorization'] = 'Bearer ' + settings.apiKey;
  return headers;
}

/** 请求地址 = baseUrl + /chat/completions（去掉尾部斜杠） */
export function resolveEndpoint(settings: LlmSettings): string {
  return settings.baseUrl.replace(/\/+$/, '') + '/chat/completions';
}

/* ------------------------------------------------------------------ *
 * 请求执行（唯一会接触网络的代码）
 * ------------------------------------------------------------------ */

export interface LlmCallOptions {
  /** 覆盖偏好，便于测试注入 */
  settings?: Partial<LlmSettings>;
  /** 注入 fetch，便于测试与自建代理 */
  fetchImpl?: typeof fetch;
  /** 外部取消信号（用户切页时取消） */
  signal?: AbortSignal;
}

/** 底层调用：失败一律抛 EngineUnavailable（由上层决定是否降级） */
export async function requestAdvice(input: LlmInput, opts: LlmCallOptions = {}): Promise<LLMAdvice> {
  const settings = resolveSettings(opts.settings);
  const spec = providerById(settings.provider);

  if (!settings.enabled) {
    throw new EngineUnavailable('LLM 未启用。', 'L3', 'disabled');
  }
  if (spec.needsKey && !settings.apiKey) {
    throw new EngineUnavailable('尚未配置 API key。', 'L3', 'missing_key');
  }
  const fetchImpl = opts.fetchImpl ?? (typeof fetch === 'function' ? fetch : null);
  if (!fetchImpl) {
    throw new EngineUnavailable('当前环境没有 fetch，无法调用 LLM。', 'L3', 'no_fetch');
  }

  const url = resolveEndpoint(settings);
  const headers = buildHeaders(settings);

  // 超时是硬性要求：本地 Ollama 没启动、或服务商排队时 fetch 可能永远挂着，
  // 没有超时的话学生点一次评价就要干等 —— 那比没有 AI 评价更糟。
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  if (controller) {
    timer = setTimeout(() => controller.abort(), settings.timeoutMs);
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener('abort', () => controller.abort());
    }
  }

  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(buildRequestBody(settings, input)),
      signal: controller?.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new EngineUnavailable(
        'LLM 请求失败（HTTP ' + res.status + '）：' + (detail.slice(0, 200) || res.statusText),
        'L3',
        'http_' + res.status
      );
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? '';
    const advice = parseAdvice(content);
    if (!advice) {
      throw new EngineUnavailable('LLM 返回内容无法解析。', 'L3', 'bad_content');
    }
    return advice;
  } catch (e) {
    if (e instanceof EngineUnavailable) throw e;
    const msg = String(e);
    const reason = /abort/i.test(msg) ? 'timeout' : 'network';
    throw new EngineUnavailable('LLM 调用异常：' + msg, 'L3', reason);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * 面向 UI 的安全入口：任何失败都返回 null。
 * pipeline 只调这个函数，从设计上保证 L3 永远不炸主流程。
 */
export async function enhance(input: LlmInput, opts: LlmCallOptions = {}): Promise<LLMAdvice | null> {
  const settings = resolveSettings(opts.settings);
  if (!isLlmConfigured(settings)) return null;
  try {
    return await requestAdvice(input, { ...opts, settings });
  } catch {
    // 静默降级：这是设计意图，不是遗漏
    return null;
  }
}

/** 把 key 打码，用于设置页回显（真实 key 不应出现在任何可见文本里） */
export function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 8) return '********';
  return key.slice(0, 4) + '****' + key.slice(-4);
}


