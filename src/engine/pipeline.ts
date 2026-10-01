/**
 * 编排层 —— analyze() 把 L0/L1/L2/L3 串成一次调用
 *
 * 许可：AGPL-3.0-only
 *
 * 这是 ARCHITECTURE.md 第 3.2 条定义给 UI 的统一出口。核心不变量：
 *
 *   L0 永远存在。任何一层缺失只能体现在 warnings 上，不能体现在异常上。
 *
 * 因此这里每一层都独立 try/catch：某一层挂了就把它的结果置空、往 warnings
 * 里写一句中文说明，然后继续跑下一层。analyze() 本身不抛错。
 */

import { evaluate } from '../rules/evaluate.ts';
import type { EvalInput } from '../rules/evaluate.ts';
import type { RuleReport } from '../rules/types.ts';
import type { TopicProfile } from '../rules/lexicon.ts';
import { capabilities, isEngineUnavailable } from './capabilities.ts';
import type { Capabilities, LlmSettings } from './capabilities.ts';
import { transcribe } from './asr.ts';
import type { TranscriptResult } from './asr.ts';
import { assessPhonemes } from './phoneme.ts';
import type { PhonemeReport } from './phoneme.ts';
import { enhance } from './llm.ts';
import type { LLMAdvice, LlmCallOptions, LlmInput } from './llm.ts';

/* ------------------------------------------------------------------ *
 * 对外类型（ARCHITECTURE.md 3.2 / 3.3）
 * ------------------------------------------------------------------ */

export type AnalyzeKind = "reading" | "qa" | "topic";

export interface AnalyzeInput {
  /** 录音得到的单声道 PCM；手动输入模式下可传空 */
  audio: Float32Array;
  /** audio 的采样率 */
  sampleRate: number;
  /** reading=朗读短文，qa=情景问答，topic=话题简述 */
  kind: AnalyzeKind;
  /** reading 必填 */
  reference?: string;
  topic?: TopicProfile | null;
  durationMs: number;
}

export interface AnalysisResult {
  /** L0，永远有 */
  rules: RuleReport;
  /** L2 */
  transcript?: string;
  /** L1 */
  phonemes?: PhonemeReport;
  /** L3 */
  advice?: LLMAdvice | null;
  /** 降级说明，每一条都是可直接展示的中文 */
  warnings: string[];
}

export interface AnalyzeOptions {
  /** 覆盖 LLM 设置（测试 / 单次试用） */
  llmSettings?: Partial<LlmSettings>;
  /** 手动输入的转写文本。有值时跳过 L2 */
  manualTranscript?: string;
  /** 注入 fetch */
  fetchImpl?: typeof fetch;
}

/* ------------------------------------------------------------------ *
 * 依赖注入：让上层可替换任意一层（测试与降级共用同一套接口）
 * ------------------------------------------------------------------ */

export interface EngineDeps {
  /** 当前能力 */
  capabilities(): Capabilities;
  /** L2 */
  transcribe(audio: Float32Array, sampleRate: number): Promise<TranscriptResult>;
  /** L1 */
  assessPhonemes(audio: Float32Array, sampleRate: number, reference: string): Promise<PhonemeReport>;
  /** L3。签名与 llm.enhance 一致，默认依赖可原样透传 */
  enhance(input: LlmInput, opts?: LlmCallOptions): Promise<LLMAdvice | null>;
}

export interface AnalyzeDeps extends EngineDeps {
  /** 运行规则层（默认用 L0 的 evaluate） */
  evaluate(input: EvalInput): RuleReport;
}

/** 默认依赖：全部指向真实实现 */
export function defaultDeps(): EngineDeps {
  return { capabilities, transcribe, assessPhonemes, enhance };
}

function fullDeps(): AnalyzeDeps {
  return { ...defaultDeps(), evaluate };
}

/** Engine 出口（ARCHITECTURE.md 3.2） */
export interface Engine {
  capabilities(): Capabilities;
  transcribe(audio: Float32Array, sampleRate: number): Promise<TranscriptResult>;
  assessPhonemes(audio: Float32Array, sampleRate: number, refText: string): Promise<PhonemeReport>;
  enhance(transcript: string, topic: TopicProfile | null, opts?: LlmCallOptions): Promise<LLMAdvice | null>;
  analyze(input: AnalyzeInput, opts?: AnalyzeOptions): Promise<AnalysisResult>;
}

/* ------------------------------------------------------------------ *
 * 降级文案：集中管理，避免各处硬编码后措辞不一致
 * ------------------------------------------------------------------ */

const WARN = {
  asrMissing: "语音识别模型不可用，已跳过转写，请在下方手动输入你朗读的内容。",
  asrEmpty: "没有识别到语音内容，请确认麦克风权限与录音音量。",
  asrSilent: "录音几乎全是静音，请靠近麦克风重试。",
  manualUsed: "已使用你手动输入的内容参与规则评估。",
  referenceFallback: "未获得转写文本，L0 反馈基于原文朗读文本，仅供结构参考。",
  noTranscript: "没有可用于评估的文本，L0 反馈为零。",
  phonemeMissing: "音素模型不可用，已跳过逐音素比对。",
  phonemeNoReference: "缺少参考文本，无法进行音素比对。",
  llmMissing: "未配置 API key，AI 建议已跳过。",
  llmFailed: "AI 服务无响应，本次仅提供规则反馈。",
  internal: "分析过程出现异常，已按规则层结果返回。",
};

/** 兜底 RuleReport：只在 evaluate 本身抛错时使用，保证 AnalysisResult.rules 永远存在 */
function fallbackRules(note: string): RuleReport {
  const na = { ok: false, value: 0, threshold: 0, message: "无法评估" };
  return {
    score: 0,
    checks: {
      length: { ok: false, value: 0, threshold: 7, message: "无法评估" },
      coverage: na,
      connectors: na,
      fillers: na,
      pace: na,
    },
    diagnostics: [
      { code: "ENGINE_INTERNAL", severity: "error", message: note, suggestion: "请重试一次。" },
    ],
    progress: 0,
  };
}

/** 把 L0/L1 结果压成给 LLM 看的短摘要：控制 token，也降低模型跑偏的概率 */
function summarizeForLlm(rules: RuleReport, phonemes?: PhonemeReport): { ruleSummary: string; phonemeSummary?: string } {
  const c = rules.checks;
  const ruleSummary = [
    "句数 " + c.length.message,
    "覆盖 " + c.coverage.message,
    "连接词 " + c.connectors.message,
    "停顿词 " + c.fillers.message,
    "语速 " + c.pace.message,
  ].join("；");
  const phonemeSummary = phonemes
    ? "错读 " + phonemes.summary.substitutions + " 处，漏读 " + phonemes.summary.deletions +
      " 处，多读 " + phonemes.summary.insertions + " 处"
    : undefined;
  return { ruleSummary, phonemeSummary };
}

/** 能力快照的防御性读取 */
function safeCapabilities(deps: EngineDeps): Capabilities {
  try {
    return deps.capabilities();
  } catch {
    return { webgpu: false, phoneme: false, asr: false, llm: false };
  }
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

/**
 * 统一分析入口。执行顺序刻意是 L2 → L0 → L1 → L3：
 * 转写要最先拿到，L0 才能评估；L1 需要音频与参考文本，与 L0 互不依赖；
 * L3 放最后，因为它同时吃 L0 与 L1 的结论，这样 AI 建议才有上下文。
 *
 * 本函数不抛错：任何一层的失败都只体现为 warnings 里的一条中文。
 */
export async function analyzeWith(
  input: AnalyzeInput,
  deps: AnalyzeDeps = fullDeps(),
  opts: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  const warnings: string[] = [];
  const result: AnalysisResult = { rules: fallbackRules(WARN.internal), warnings };

  // ---- L2：转写 ----
  let transcript = "";
  const manual = (opts.manualTranscript ?? "").trim();
  if (manual) {
    transcript = manual;
    warnings.push(WARN.manualUsed);
  } else {
    try {
      const hasAudio = !!input.audio && input.audio.length > 0;
      if (!hasAudio) {
        warnings.push(WARN.asrMissing);
      } else {
        const t = await deps.transcribe(input.audio, input.sampleRate);
        if (t.empty) {
          warnings.push(input.durationMs < 1000 ? WARN.asrSilent : WARN.asrEmpty);
        } else {
          transcript = t.text;
          result.transcript = t.text;
        }
      }
    } catch (e) {
      // Whisper 没加载 / 下载失败 / 推理出错：统一降级为「请手动输入」
      warnings.push(isEngineUnavailable(e) ? WARN.asrMissing : WARN.internal);
    }
  }

  // ---- 转写兜底：没有转写就用原文（仅朗读题），并明确告知这是结构参考 ----
  if (!transcript) {
    const referenceText = (input.reference ?? "").trim();
    if (input.kind === "reading" && referenceText) {
      transcript = referenceText;
      warnings.push(WARN.referenceFallback);
    } else {
      warnings.push(WARN.noTranscript);
    }
  }

  // ---- L0：规则层（永远要有）----
  let rules: RuleReport;
  try {
    rules = deps.evaluate({ transcript, topic: input.topic ?? null, durationMs: input.durationMs });
  } catch (e) {
    rules = fallbackRules("规则评估失败：" + String(e));
    warnings.push(WARN.internal);
  }
  result.rules = rules;

  // ---- L1：音素比对（仅朗读题，且必须有音频与参考文本）----
  const reference = (input.reference ?? "").trim();
  if (input.kind === "reading") {
    if (!reference) {
      warnings.push(WARN.phonemeNoReference);
    } else if (!input.audio || input.audio.length === 0) {
      warnings.push(WARN.phonemeMissing);
    } else {
      try {
        result.phonemes = await deps.assessPhonemes(input.audio, input.sampleRate, reference);
      } catch (e) {
        warnings.push(isEngineUnavailable(e) ? WARN.phonemeMissing : WARN.internal);
      }
    }
  }

  // ---- L3：AI 建议（永不抛错）----
  const caps = safeCapabilities(deps);
  if (!caps.llm) {
    warnings.push(WARN.llmMissing);
  } else {
    try {
      const summary = summarizeForLlm(rules, result.phonemes);
      // 把 L0/L1 摘要并入提示词上下文：enhance 的入参类型固定为 (transcript, topic)
      const llmInput = {
        transcript,
        topicName: input.topic?.name ?? null,
        kind: input.kind,
        ruleSummary: summary.ruleSummary,
        phonemeSummary: summary.phonemeSummary,
      };
      const advice = await deps.enhance(llmInput, { settings: opts.llmSettings, fetchImpl: opts.fetchImpl });
      result.advice = advice ?? null;
      if (!advice) warnings.push(WARN.llmFailed);
    } catch {
      warnings.push(WARN.llmFailed);
    }
  }

  return result;
}

/** 创建引擎实例。overrides 可替换任意一层（测试、实验性降级） */
export function createEngine(overrides: Partial<AnalyzeDeps> = {}): Engine {
  const deps: AnalyzeDeps = { ...fullDeps(), ...overrides };
  return {
    capabilities: () => deps.capabilities(),
    transcribe: (a, sr) => deps.transcribe(a, sr),
    assessPhonemes: (a, sr, ref) => deps.assessPhonemes(a, sr, ref),
    // 对外暴露 ARCHITECTURE.md 的签名，内部再补齐 LlmInput 的其它字段
    enhance: (t, topic, o) =>
      deps.enhance({ transcript: t, topicName: topic?.name ?? null, kind: 'topic' }, o),
    analyze: (input, opts) => analyzeWith(input, deps, opts),
  };
}

let shared: Engine | null = null;

/** 单例：UI 只取一次，模型状态在引擎层共享，避免重复下载权重 */
export function getEngine(): Engine {
  if (!shared) shared = createEngine();
  return shared;
}

/** 仅供测试：清空单例 */
export function resetEngine(): void {
  shared = null;
}

/** 便捷导出：不持有实例的一次性分析 */
export function analyze(input: AnalyzeInput, opts: AnalyzeOptions = {}): Promise<AnalysisResult> {
  return analyzeWith(input, fullDeps(), opts);
}


