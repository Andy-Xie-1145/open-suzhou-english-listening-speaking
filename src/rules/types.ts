/**
 * 核心类型定义 —— 零成本规则层（L0）
 *
 * 许可：AGPL-3.0-only
 *
 * 设计原则：
 * 1. 本层不依赖任何模型、不调用任何 API，可在浏览器/Node/CLI 中纯 JS 运行
 * 2. 所有判定均为确定性规则，可解释、可复现
 * 3. 只输出「诊断」而非「权威分数」——定位是能力诊断，不是考场估分
 */

/** 单词级对齐结果（由 ASR 或音素对齐层填充，此处定义契约） */
export interface WordToken {
  /** 规范化后的词形（小写、去标点） */
  word: string;
  /** 原始形态 */
  raw: string;
  /** 是否在参考文本中存在 */
  matched: boolean;
  /** 该词的毫秒偏移（若上游提供时间戳） */
  startMs?: number;
  endMs?: number;
}

/** 句子级对齐结果 */
export interface SentenceAlignment {
  /** 参考文本 */
  reference: string;
  /** 学习者实际说出的文本 */
  hypothesis: string;
  /** 词级对齐 */
  words: WordToken[];
  /** 句子中是否检测到填充词 */
  hasFiller: boolean;
  fillers: string[];
}

/** 诊断条目 */
export interface Diagnostic {
  code: string;
  severity: 'info' | 'warn' | 'error';
  message: string;
  /** 关联的原文位置（字符索引），若适用 */
  span?: [number, number];
  /** 可执行的改进建议 */
  suggestion?: string;
}

/** 规则层评估报告 */
export interface RuleReport {
  /** 总体诊断（0-100，仅作能力参考，非考场分数） */
  score: number;
  /** 各项是否通过 */
  checks: {
    length: CheckResult;
    coverage: CheckResult;
    connectors: CheckResult;
    fillers: CheckResult;
    pace: CheckResult;
  };
  diagnostics: Diagnostic[];
  /** 可视化用：覆盖率进度 */
  progress: number;
}

/** 单项检查结果 */
export interface CheckResult {
  ok: boolean;
  /** 实际值 */
  value: number;
  /** 阈值 */
  threshold: number;
  /** 面向学生的说明 */
  message: string;
}
