/**
 * 话题简述（Q5）—— 取题与近似评分，苏州中考题型专用
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 这是**近似模拟**，不是官方评分。见 spec/suzhou-listening-speaking.spec.md。
 *
 * 为什么这一题型值得单独做：
 *  2025 年改革取消中文提示后，学生只看到话题名（如 My favourite sport），
 *  必须围绕话题**连续说满 7 句**。这是硬门槛，可以用确定性规则判定。
 *  同时考察要点覆盖与连接词——都能解释、能逐条指出。
 *
 * 与朗读短文的区别：朗读有标准原文可对齐；话题简述是**自由表达**，
 *  没有原文，所以只能做「规则性判定」，做不了逐词比对。
 */

import { evaluate, MIN_SENTENCES } from '../rules/evaluate.ts';
import type { RuleReport, Diagnostic } from '../rules/types.ts';
import { disclaimerBlock } from './disclaimer.ts';
import type { TopicProfile } from '../rules/lexicon.ts';

export { MIN_SENTENCES };

/* ------------------------------------------------------------------ *
 * 一、话题任务
 * ------------------------------------------------------------------ */

export interface ExpressionGroup {
  group: string;
  items: string[];
}

export interface RawTopic {
  name: string;
  hint: string;
  keywords: string[];
  bonusPhrases: string[];
  keyExpressions: ExpressionGroup[];
  sampleAnswer: string[];
}

export interface TopicTask {
  id: string;
  /** 考试时屏幕上显示的内容 —— 只有话题名，没有中文提示 */
  displayText: string;
  /** 中文提示。**考试不显示**，仅供教师/家长复盘参考 */
  hint: string;
  /** 传给 L0 的要点定义 */
  profile: TopicProfile;
  /** 常用句式，按功能分组 */
  keyExpressions: ExpressionGroup[];
  /** 范例回答（每句一条），仅供学习者参考 */
  sampleAnswer: string[];
}
export function toTopicTask(raw: RawTopic, index: number): TopicTask {
  return {
    id: 'topic-' + String(index + 1).padStart(2, '0'),
    displayText: raw.name,
    hint: raw.hint,
    profile: {
      name: raw.name,
      hint: raw.hint,
      keywords: raw.keywords.slice(),
      bonusPhrases: raw.bonusPhrases.slice(),
    },
    keyExpressions: raw.keyExpressions.slice(),
    sampleAnswer: raw.sampleAnswer.slice(),
  };
}

/* ------------------------------------------------------------------ *
 * 二、近似评分
 * ------------------------------------------------------------------ */

export interface TopicInput {
  /** 转写文本（来自 ASR 或手动输入） */
  transcript: string;
  task: TopicTask;
  /** 作答时长（毫秒），用于流利度判定 */
  durationMs?: number;
}

export interface TopicDimensionView {
  key: string;
  label: string;
  /** 0-1 */
  value: number;
  /** 面向学生的说明 */
  note: string;
}

export interface TopicResult {
  /** ⚠️ 近似分，不是考场得分。0-100 */
  approximateScore: number;
  /** 硬门槛是否通过（说满 7 句） */
  passedMinSentences: boolean;
  sentenceCount: number;
  requiredSentences: number;
  /** 四个分项 */
  dimensions: TopicDimensionView[];
  /** L0 原始诊断 */
  ruleReport: RuleReport;
  /** 给学生的改进建议 */
  advice: string[];
}
function pct(x: number): string {
  return Math.round(x * 100) + '%';
}

/**
 * 话题简述近似评分。
 *
 * ⚠️ 返回的 approximateScore 是本项目的近似规则结果，**不是**中考评分。
 *
 * 与朗读不同，这里**没有标准原文**，因此：
 *  - 完整度 = 句数门槛 + 要点覆盖（不是逐词比对）
 *  - 准确度只能做拼写层面的近似，无法评估音素
 *  - 逻辑结构完全依赖确定性启发式，不做语义判断
 */
export function scoreTopic(input: TopicInput): TopicResult {
  const task = input.task;
  const report = evaluate({
    transcript: input.transcript,
    topic: task.profile,
    durationMs: input.durationMs,
  });

  const sentenceCount = report.checks.length.value;
  const passedMin = report.checks.length.ok;
  const coverage = report.checks.coverage.ok ? 1 : report.checks.coverage.value;
  const connectors = report.checks.connectors.value;
  const connOk = report.checks.connectors.ok;
  const fillers = report.checks.fillers.value;

  // ---- 硬门槛：说满 7 句 ----
  // 这是考试明确要求，不满足时应显著反映在近似分上
  const lengthRatio = Math.min(1, sentenceCount / MIN_SENTENCES);

  // ---- 四个分项 ----
  const dims: TopicDimensionView[] = [
    {
      key: 'length',
      label: '句数（硬门槛：至少 ' + MIN_SENTENCES + ' 句）',
      value: lengthRatio,
      note: passedMin
        ? '说了 ' + sentenceCount + ' 句，达到要求'
        : '只说了 ' + sentenceCount + ' 句，要求至少 ' + MIN_SENTENCES + ' 句，还差 ' + (MIN_SENTENCES - sentenceCount) + ' 句',
    },
    {
      key: 'coverage',
      label: '要点覆盖（有没有围绕话题说全）',
      value: coverage,
      note: report.checks.coverage.ok
        ? '要点覆盖 ' + pct(coverage)
        : '要点覆盖 ' + pct(coverage) + '，偏低——只说到部分角度',
    },
    {
      key: 'logic',
      label: '逻辑连接（有没有把句子串起来）',
      value: connOk ? 1 : Math.min(1, connectors / 2),
      note: connOk
        ? '用了 ' + connectors + ' 个连接词，逻辑清楚'
        : '只用了 ' + connectors + ' 个连接词，建议用 first / also / because 把句子串起来',
    },
    {
      key: 'fluency',
      label: '流利度（有没有卡壳）',
      value: report.checks.fillers.ok ? 1 : Math.max(0, 1 - fillers * 0.25),
      note: report.checks.fillers.ok
        ? (input.durationMs ? '语速 ' + (report.checks.pace.value).toFixed(1) + ' 词/秒，无明显停顿' : '无明显停顿')
        : '出现 ' + fillers + ' 处停顿（um / 那个 这类），建议先想好再说',
    },
  ];
  // ---- 合成近似分 ----
  //
  // 权重说明：这里把「句数门槛」放得最重，因为它是硬性要求；
  // 其余三项按 L0 的诊断结果折算。
  // ⚠️ 这个权重组合是本项目自定的假设值，不是官方分值表。见 SPEC 第 7 节。
  const W = { length: 0.40, coverage: 0.25, logic: 0.20, fluency: 0.15 };
  const raw = dims.reduce(function (a, d) {
    const w = (W as Record<string, number>)[d.key] ?? 0;
    return a + d.value * w;
  }, 0);
  const approximateScore = Math.round(raw * 100);

  // ---- 改进建议 ----
  const advice: string[] = [];
  if (!passedMin) {
    advice.push(
      '先解决硬门槛：目前只说了 ' + sentenceCount + ' 句，考试要求至少 ' + MIN_SENTENCES + ' 句。',
      '最简单的办法是围绕话题补 3 个角度：为什么喜欢、什么时候做、有什么好处。',
    );
  }
  if (!report.checks.coverage.ok) {
    advice.push(
      '话题只说了一部分。围绕「' + task.displayText + '」再补几个不同的角度：',
      '例如一次经历、一个感受、一个对比。',
    );
  }
  if (!connOk) {
    advice.push(
      '句子之间缺少连接。试着这样串：',
      'First ... / Second ... / Also ... / However ... / In my opinion ...',
    );
  }
  if (!report.checks.fillers.ok) {
    advice.push('停顿较多。可以先在心里把要说的话想好，再开口，减少「那个」「就是」这类口头语。');
  }
  if (input.durationMs && report.checks.pace.value > 0) {
    const p = report.checks.pace.value;
    if (p > 3.4) advice.push('语速偏快。考试建议保持匀速，语速过快容易漏读。');
    else if (p < 0.8) advice.push('语速偏慢。同一话题下保持稳定流利度更重要。');
  }
  if (advice.length === 0) {
    advice.push('本工具未发现问题。注意：本工具不评估语调与逻辑语义，仍需人工判断。');
  }

  return {
    approximateScore: approximateScore,
    passedMinSentences: passedMin,
    sentenceCount: sentenceCount,
    requiredSentences: MIN_SENTENCES,
    dimensions: dims,
    ruleReport: report,
    advice: advice,
  };
}
