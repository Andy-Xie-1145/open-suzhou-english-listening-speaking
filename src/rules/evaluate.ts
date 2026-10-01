/**
 * 零成本规则层（L0）—— 话题简述 / 情景问答 的确定性评分
 *
 * 许可：AGPL-3.0-only
 *
 * 本模块不依赖任何模型、不调用任何 API，可纯 TypeScript 运行于浏览器/Node/CLI。
 * 覆盖考试话题简述的 5 个硬性/可判定考察点：
 *   1. 句数是否达 7 句（硬门槛）
 *   2. 要点覆盖率（围绕话题）
 *   3. 是否使用逻辑连接词
 *   4. 填充词/卡壳密度
 *   5. 语速与节奏（若提供时间戳）
 *
 * 设计约束：输出的是「能力诊断」，不是「考场估分」，不对标讯飞正考引擎。
 */

import {
  CONNECTORS,
  ALL_CONNECTORS,
  CONNECTOR_PHRASES,
  FILLERS,
  CORE_VOCABULARY,
  PII_PATTERNS,
  TOPICS,
  type TopicProfile,
} from './lexicon.ts';
import {
  tokenize,
  splitSentencesLoose,
  normalizeWord,
  levenshtein,
} from './text/normalize.ts';
import type {
  RuleReport,
  Diagnostic,
  CheckResult,
  WordToken,
} from './types.ts';

/** 考试硬性要求：话题简述至少 7 句 */
export const MIN_SENTENCES = 7;

/** 要点覆盖率阈值 */
const COVERAGE_THRESHOLD = 0.5;

/** 连接词至少使用次数 */
const MIN_CONNECTORS = 2;

/** 语速区间（音节/秒的粗略代理：词/秒），初中生舒适区间 */
const PACE_SLOW = 0.9;   // 词/秒
const PACE_FAST = 3.2;   // 词/秒

/** 评估输入 */
export interface EvalInput {
  /** 学习者实际说出的内容（来自 ASR 或人工输入） */
  transcript: string;
  /** 话题；情景问答可传 null */
  topic?: TopicProfile | string | null;
  /** 总时长（毫秒），若上游有词级时间戳请传入 durationMs */
  durationMs?: number;
  /** 可选的词级对齐结果（用于更精确的漏读/语速分析） */
  words?: WordToken[];
}

/** 归一化话题：支持传字符串或 TopicProfile */
function resolveTopic(topic: EvalInput['topic']): TopicProfile | null {
  if (!topic) return null;
  if (typeof topic !== 'string') return topic;
  const key = topic.trim().toLowerCase();
  return TOPICS.find(t => t.name.toLowerCase() === key) ?? null;
}

/** 检连接词（短语优先），返回命中列表 */
function findConnectors(text: string): string[] {
  const lower = ' ' + text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const found = new Set<string>();
  for (const p of CONNECTOR_PHRASES) {
    if (lower.includes(' ' + p + ' ')) found.add(p);
  }
  const tokens = tokenize(text);
  for (const t of tokens) {
    if (ALL_CONNECTORS.includes(t)) found.add(t);
  }
  return Array.from(found);
}

/** 检测填充词 */
function findFillers(text: string): string[] {
  const lower = text.toLowerCase();
  return FILLERS.filter(f =>
    lower.includes(f) || lower.includes(new RegExp('\\b' + f + '\\b').source)
  );
}

/** 要点覆盖率：话题关键词命中比例（含词形容错） */
function coverageOf(transcript: string, topic: TopicProfile): { rate: number; hits: string[]; missed: string[] } {
  const tokens = tokenize(transcript).map(normalizeWord);
  const bag = new Set(tokens);
  const hits: string[] = [];
  const missed: string[] = [];
  for (const kw of topic.keywords) {
    const k = normalizeWord(kw);
    let hit = bag.has(k);
    if (!hit) {
      // 拼写容错：允许编辑距离 <= 1（短词）或 <= 2（长词）
      const tol = k.length <= 4 ? 1 : 2;
      hit = tokens.some(t => t.length > 2 && Math.abs(t.length - k.length) <= tol && levenshtein(t, k) <= tol);
    }
    if (hit) hits.push(kw); else missed.push(kw);
  }
  const rate = topic.keywords.length ? hits.length / topic.keywords.length : 0;
  return { rate, hits, missed };
}

/** 抽取超纲词（不在课标核心词表的实词） */
function findOffSyllabus(transcript: string): string[] {
  const tokens = tokenize(transcript).map(normalizeWord);
  const out = new Set<string>();
  for (const t of tokens) {
    if (t.length <= 3) continue;      // 短词多为功能词，放行
    if (CORE_VOCABULARY.has(t)) continue;
    out.add(t);
  }
  return Array.from(out);
}

/** 检测真实个人信息（考试要求避免） */
function findPII(transcript: string): boolean {
  return PII_PATTERNS.some(re => re.test(transcript));
}

/** 主评估入口 */
export function evaluate(input: EvalInput): RuleReport {
  const { transcript, durationMs, words } = input;
  const topic = resolveTopic(input.topic);
  const diagnostics: Diagnostic[] = [];

  // ---- 1. 句数 ----
  const sentences = splitSentencesLoose(transcript);
  const sentenceCount = sentences.length;
  const lengthOk = sentenceCount >= MIN_SENTENCES;
  if (!lengthOk) {
    diagnostics.push({
      code: 'LENGTH_SHORT',
      severity: 'error',
      message: '只说了 ' + sentenceCount + ' 句，要求至少 ' + MIN_SENTENCES + ' 句。',
      suggestion: '围绕话题再补充 ' + (MIN_SENTENCES - sentenceCount) + ' 句，例如加上你的感受或一个例子。',
    });
  }

  // ---- 2. 要点覆盖 ----
  let covRate = 1;
  if (topic) {
    const cov = coverageOf(transcript, topic);
    covRate = cov.rate;
    if (cov.rate < COVERAGE_THRESHOLD) {
      diagnostics.push({
        code: 'COVERAGE_LOW',
        severity: 'warn',
        message: '话题要点覆盖 ' + Math.round(cov.rate * 100) + '%，偏低。',
        suggestion: '试着提到：' + cov.missed.slice(0, 5).join('、'),
      });
    }
  }

  // ---- 3. 连接词 ----
  const connectors = findConnectors(transcript);
  const connOk = connectors.length >= MIN_CONNECTORS;
  if (!connOk) {
    diagnostics.push({
      code: 'CONNECTOR_LOW',
      severity: 'warn',
      message: '只用了 ' + connectors.length + ' 个连接词，逻辑会显得跳跃。',
      suggestion: '用 first / also / because / however 把句子串起来。',
    });
  }

  // ---- 4. 填充词 ----
  const fillers = findFillers(transcript);
  const totalWords = tokenize(transcript).length;
  const fillerDensity = totalWords > 0 ? fillers.length / totalWords : 0;
  const fillerOk = fillerDensity < 0.05;
  if (!fillerOk) {
    diagnostics.push({
      code: 'FILLER_HIGH',
      severity: 'info',
      message: '出现了 ' + fillers.length + ' 处停顿词（' + fillers.join('、') + '）。',
      suggestion: '这些位置是卡壳点，先想好再说。',
    });
  }

  // ---- 5. 语速 ----
  let pace = 0;
  let paceOk = true;
  if (durationMs && durationMs > 0 && totalWords > 0) {
    const seconds = durationMs / 1000;
    pace = totalWords / seconds; // 词/秒
    paceOk = pace >= PACE_SLOW && pace <= PACE_FAST;
    if (!paceOk) {
      const tooFast = pace > PACE_FAST;
      diagnostics.push({
        code: tooFast ? 'PACE_FAST' : 'PACE_SLOW',
        severity: 'info',
        message: tooFast
          ? '语速偏快（' + pace.toFixed(1) + ' 词/秒），考试建议保持匀速。'
          : '语速偏慢（' + pace.toFixed(1) + ' 词/秒），建议流利一些。',
        suggestion: '跟读范读音频，保持匀速，不要忽快忽慢。',
      });
    }
  }

  // ---- 附加：超纲词 / 隐私 ----
  const offSyllabus = findOffSyllabus(transcript);
  if (offSyllabus.length > 3) {
    diagnostics.push({
      code: 'OFF_SYLLABUS',
      severity: 'info',
      message: '疑似超纲词 ' + offSyllabus.length + ' 个（' + offSyllabus.slice(0, 4).join('、') + '）。',
      suggestion: '考试建议用课本句型、少用超纲长难词。',
    });
  }
  if (findPII(transcript)) {
    diagnostics.push({
      code: 'PII_LEAK',
      severity: 'warn',
      message: '检测到可能的真实个人信息（手机号/邮箱/住址等）。',
      suggestion: '考试明确要求避免出现真实个人信息，请删掉。',
    });
  }

  // ---- 汇总诊断分 ----
  const progress = Math.min(1, sentenceCount / MIN_SENTENCES);
  let score = 100;
  score -= (1 - progress) * 40;                      // 句数不达标的惩罚最重
  if (topic) score -= Math.max(0, COVERAGE_THRESHOLD - covRate) * 60;
  score -= Math.max(0, MIN_CONNECTORS - connectors.length) * 6;
  score -= Math.min(15, fillers.length * 3);
  if (!paceOk) score -= 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const report: RuleReport = {
    score,
    checks: {
      length: { ok: lengthOk, value: sentenceCount, threshold: MIN_SENTENCES, message: sentenceCount + ' / ' + MIN_SENTENCES + ' 句' },
      coverage: { ok: !topic || covRate >= COVERAGE_THRESHOLD, value: covRate, threshold: COVERAGE_THRESHOLD, message: topic ? Math.round(covRate * 100) + '% 要点' : 'n/a' },
      connectors: { ok: connOk, value: connectors.length, threshold: MIN_CONNECTORS, message: connectors.length + ' 个连接词' },
      fillers: { ok: fillerOk, value: fillers.length, threshold: 0, message: fillers.length + ' 处停顿' },
      pace: { ok: paceOk, value: pace, threshold: PACE_FAST, message: durationMs ? pace.toFixed(1) + ' 词/秒' : '未提供时长' },
    },
    diagnostics,
    progress,
  };

  return report;
}
