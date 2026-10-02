/**
 * 统一出卷器 —— 一次 seed 贯通 Q3/Q4/Q5，按真实考法组卷
 *
 * 许可：AGPL-3.0-only
 *
 * ## 这个模块解决什么问题
 *
 * 之前的实现里三个题型各自出题：
 *  - Q3 朗读取 `readings[0]`
 *  - Q4 情景问答用写死的默认 seed
 *  - Q5 话题取 `topics[0]`
 *
 * 结果是**永远第一篇朗读 + 永远第一个话题**，学生刷几次就背下来了，
 * 而且三个模块拼不成「一份卷」，没有 seed 贯通、没有时间盘校验。
 *
 * 本模块把出题收敛成一次：给一个 seed，产出一整份卷。
 *
 * ## 真实考法（据江苏省中考英语听力口语自动化考试要求）
 *
 *   Q1 听对话回答问题      听力 12 分钟 · 客观题
 *   Q2 听对话和短文答题    听力 12 分钟 · 客观题
 *   Q3 朗读短文            口语 10 分钟 · 1 篇 · 有标准原文
 *   Q4 情景问答            口语 10 分钟 · 2 题 · 半开放
 *   Q5 话题简述            口语 10 分钟 · 1 题 · 开放 · 必须说满 7 句
 *
 * 考生实际作答 22 分钟 = 听力 12 + 口语 10。
 *
 * 听力两节（Q1/Q2）已编排进来，材料来自 data/listening-materials.json，
 * 音频由 scripts/build-listening-audio.ts 在**构建期**离线渲染，
 * 学生端不加载任何 TTS 模型。
 * 听力小题的子结构假设集中在 src/suzhou/listening-spec.ts 一处，改结构不动本文件。
 */
/* ------------------------------------------------------------------ *
 * 一、可复现随机数
 * ------------------------------------------------------------------ */

/**
 * mulberry32：32 位状态、周期足够、实现极简。
 * 同 seed 必得同序列，这是「同 seed 必得同卷」的基础。
 */
export interface Rng {
  next(): number;
  int(n: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  const next = function (): number {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next: next,
    int: function (n: number) { return Math.floor(next() * n); },
    pick: function <T>(items: readonly T[]): T { return items[Math.floor(next() * items.length)]; },
    shuffle: function <T>(items: readonly T[]): T[] {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i]; out[i] = out[j]; out[j] = tmp;
      }
      return out;
    },
  };
}
/* ------------------------------------------------------------------ *
 * 二、输入类型
 * ------------------------------------------------------------------ */

/** 朗读材料（对应 data/readings.json） */
export interface ReadingInput {
  id: string;
  textbook: string;
  text: string;
  wordCount: number;
  difficulty: number;
  positionSource: string;
}

/** 情景问答（对应 data/qa.json + data/qa-keywords.json） */
export interface QaInput {
  id: string;
  category: string;
  question: string;
  keyPoints: string[];
  /** 每个要点的英文关键词 */
  enKeywords: string[][];
  difficulty: number;
}

/** 话题简述（对应 data/topics.json） */
export interface TopicInput {
  id: string;
  name: string;
  hint: string;
  keywords: string[];
  sampleAnswer: string[];
  keyExpressions: Array<{ group: string; items: string[] }>;
}
/* ------------------------------------------------------------------ *
 * 三、考法常量（真实考法，不可随意改）
 * ------------------------------------------------------------------ */

export const EXAM_MINUTES = 22;
export const LISTENING_MINUTES = 12;
export const SPEAKING_MINUTES = 10;

/** 口语段内各题用时权重（相对值，出卷时归一化） */
export const SPEAKING_WEIGHTS = {
  reading: 0.20,
  qa: 0.30,
  topic: 0.50,
} as const;

export const READING_COUNT = 1;
export const QA_COUNT = 2;
export const TOPIC_COUNT = 1;

/* ------------------------------------------------------------------ *
 * 四、产出
 * ------------------------------------------------------------------ */

export interface PaperReading {
  task: ReadingInput;
  /** 本题建议用时（毫秒） */
  budgetMs: number;
}

export interface PaperQa {
  task: QaInput;
  /** 第几题（0 起） */
  order: number;
}

export interface PaperTopic {
  task: TopicInput;
}

/** 一个听力材料 + 它承载的小题 + 这段该给多少时间 */
export interface PaperListeningGroup {
  material: ListeningMaterial;
  questions: ListeningQuestion[];
  budgetMs: number;
}

export interface PaperListening {
  /** 第一节「听对话回答问题」：一段一题 */
  dialogue: PaperListeningGroup[];
  /** 第二节「听对话和短文答题」：一段多题，题数按布局顺序 */
  passage: PaperListeningGroup[];
  /** 听力段总时长（毫秒） */
  totalMs: number;
  /** 两个大题的时长 */
  sectionMs: { dialogue: number; passage: number };
}

export interface SuzhouPaper {
  seed: number;
  reading: PaperReading;
  qa: PaperQa[];
  topic: PaperTopic;
  listening: PaperListening;
  /** 口语段总时长（毫秒） */
  speakingMs: number;
  /** 各题用时合计，应等于 speakingMs */
  allocatedMs: number;
  /** 题号（便于「换一套卷」时排除重复） */
  ids: { reading: string; qa: string[]; topic: string; listening: string[] };
}
/* ------------------------------------------------------------------ *
 * 五、组卷
 * ------------------------------------------------------------------ */

export interface PaperBank {
  readings: readonly ReadingInput[];
  qa: readonly QaInput[];
  topics: readonly TopicInput[];
  /** 听力材料库。缺省时 dealPaper 抛错，绝不出半张卷 */
  listening?: ListeningBank;
}

export interface DealOptions {
  seed: number;
  /** 排除的题目 id，用于「换一套卷」避免重复 */
  exclude?: { readingIds?: string[]; qaIds?: string[]; topicIds?: string[]; listeningIds?: string[] };
}

import { allocate, allocateList } from './allocate.ts';
export { allocate } from './allocate.ts';
import {
  LISTENING_LAYOUT,
  flattenRules,
  allocateListeningMs,
  allocateGroupMs,
  isListeningLayoutUsable,
  type ListeningLayout,
  type ListeningGroupRule,
} from './listening-spec.ts';
import {
  poolOf,
  type ListeningBank,
  type ListeningKind,
  type ListeningMaterial,
  type ListeningQuestion,
} from './listening-bank.ts';
function filterOut<T extends { id: string }>(items: readonly T[], exclude?: readonly string[]): T[] {
  if (!exclude || exclude.length === 0) return items.slice();
  const bad = new Set(exclude);
  return items.filter(function (x) { return !bad.has(x.id); });
}

function pickOne<T extends { id: string }>(
  pool: readonly T[],
  rng: Rng,
): T | null {
  if (pool.length === 0) return null;
  return pool[Math.floor(rng.next() * pool.length)];
}

/**
 * 按组规则从题库抽材料。
 *
 * 编排逻辑就这么点：每个「size × count」规则，就去对应的组大小池里抽 count 段。
 * 抽到的材料**整段用**，不截题 —— 所以题目和材料永远对得上。
 *
 * 编排的复杂度全在题库里：想让某套卷好，就得把题库按 1/2/3/4/5 题分池备齐。
 * 代码这边只有 13 次独立抽样，没有配平、没有平衡、没有难度调度。
 */
function pickGroups(
  rules: readonly ListeningGroupRule[],
  kind: ListeningKind,
  bank: ListeningBank,
  rng: Rng,
  prefer: Set<string>,
): PaperListeningGroup[] | null {
  const out: PaperListeningGroup[] = [];
  const used = new Set<string>();

  for (const rule of flattenRules(rules)) {
    const pool = poolOf(bank, kind, rule.size).filter(function (m) { return !used.has(m.id); });
    // prefer 是**软偏好**不是硬约束：优先避开上一份卷抽过的，
    // 但池不够时必须放宽 —— 宁可重复，也要把卷出出来。
    // 池刚好等于一份卷用量时（如单题池正好 10 段），排除必然落空，属正常。
    const fresh = pool.filter(function (m) { return !prefer.has(m.id); });
    const candidates = fresh.length >= rule.count ? fresh : pool;
    if (candidates.length < rule.count) return null;

    const picked: ListeningMaterial[] = [];
    const rest = candidates.slice();
    for (let i = 0; i < rule.count; i++) {
      const m = rest.splice(Math.floor(rng.next() * rest.length), 1)[0];
      if (!m) return null;
      used.add(m.id);
      picked.push(m);
    }
    for (const m of picked) {
      out.push({ material: m, questions: m.questions.slice(), budgetMs: 0 });
    }
  }
  return out;
}

/** 题库现状描述，用于「题库不足」报错时说清楚缺什么 */
function describePools(bank: ListeningBank, kind: ListeningKind): string {
  const all = bank.byKind[kind] ?? [];
  const sizes = Array.from(new Set(all.map(function (m) { return m.groupSize; }))).sort();
  if (sizes.length === 0) return '无任何材料';
  return sizes
    .map(function (n) { return n + ' 题池 ' + poolOf(bank, kind, n).length + ' 段'; })
    .join('，');
}

function describeNeed(rules: readonly ListeningGroupRule[]): string {
  return flattenRules(rules)
    .map(function (r) { return r.size + ' 题池需 ' + r.count + ' 段'; })
    .join('，');
}

function dealListening(
  bank: ListeningBank | undefined,
  rng: Rng,
  layout: ListeningLayout,
  exclude?: readonly string[],
): { part: PaperListening; ids: string[] } | { missing: string } {
  if (!isListeningLayoutUsable(layout)) {
    return { missing: '听力子结构与官方两个大题各 10 分不符' };
  }
  if (!bank) return { missing: '听力题库' };

  const bad = new Set(exclude ?? []);
  const dialogue = pickGroups(layout.dialogue, 'dialogue', bank, rng, bad);
  const passage = pickGroups(layout.passage, 'passage', bank, rng, bad);

  if (!dialogue) {
    return { missing: '听对话回答问题材料：' + describePools(bank, 'dialogue') + '，无法满足' + describeNeed(layout.dialogue) };
  }
  if (!passage) {
    return { missing: '听对话和短文答题材料：' + describePools(bank, 'passage') + '，无法满足' + describeNeed(layout.passage) };
  }

  const totalMs = LISTENING_MINUTES * 60_000;
  const sectionMs = allocateListeningMs(totalMs, layout);
  const dBudget = allocateGroupMs(layout.dialogue, sectionMs.dialogue);
  const pBudget = allocateGroupMs(layout.passage, sectionMs.passage);
  for (let i = 0; i < dialogue.length; i++) dialogue[i].budgetMs = dBudget[i] ?? 0;
  for (let i = 0; i < passage.length; i++) passage[i].budgetMs = pBudget[i] ?? 0;

  const all = dialogue.concat(passage);
  return {
    part: { dialogue: dialogue, passage: passage, totalMs: totalMs, sectionMs: sectionMs },
    ids: all.map(function (g) { return g.material.id; }),
  };
}

/**
 * 组一份卷。
 *
 * 组卷规则（对应真实考法）：
 *  - 听力两个大题：按组大小从对应的池里抽，见 pickGroups
 *  - 朗读 1 篇：随机
 *  - 情景问答 2 题：**情境类别不重复**
 *  - 话题简述 1 题：随机
 *  - 各题用时按权重归一化分配，合计严格等于本段总时长
 *
 * 同一 seed + 同一题库 → 同一份卷；换 seed 或传 exclude → 换卷。
 */
export function dealPaper(bank: PaperBank, opts: DealOptions): SuzhouPaper {
  const rng = createRng(opts.seed);

  // ---- 朗读：1 篇 ----
  const readingPool = filterOut(bank.readings, opts.exclude?.readingIds);
  const readingTask = pickOne(readingPool, rng);

  // ---- 话题简述：1 题 ----
  const topicPool = filterOut(bank.topics, opts.exclude?.topicIds);
  const topicTask = pickOne(topicPool, rng);

  // ---- 情景问答：2 题，情境类别不重复 ----
  const qaPool = filterOut(bank.qa, opts.exclude?.qaIds);
  const shuffled = rng.shuffle(qaPool);
  const qaPicked: QaInput[] = [];
  const usedCats = new Set<string>();
  for (const q of shuffled) {
    if (usedCats.has(q.category)) continue;
    qaPicked.push(q);
    usedCats.add(q.category);
    if (qaPicked.length >= QA_COUNT) break;
  }
  // 类别数不足时放宽，凑满 QA_COUNT
  for (const q of shuffled) {
    if (qaPicked.length >= QA_COUNT) break;
    if (qaPicked.indexOf(q) >= 0) continue;
    qaPicked.push(q);
  }

  // ---- 听力：两个大题，按组大小分池抽 ----
  const listeningResult = dealListening(bank.listening, rng, LISTENING_LAYOUT, opts.exclude?.listeningIds);
  if ('missing' in listeningResult) {
    throw new Error('题库不足，无法组卷：缺少 ' + listeningResult.missing);
  }

  // ---- 时长分配 ----
  const speakingMs = SPEAKING_MINUTES * 60_000;
  // 情景问答两题共用 qa 的预算，对半分
  const budgets = allocate(SPEAKING_WEIGHTS, speakingMs);

  // 三项都必须齐备：缺任何一项都不能出半张卷
  if (!readingTask || !topicTask || qaPicked.length < QA_COUNT) {
    // 题库不足：抛错而不是静默出半张卷，UI 需要知道出卷失败
    const missing: string[] = [];
    if (!readingTask) missing.push('朗读材料');
    if (!topicTask) missing.push('话题');
    if (qaPicked.length < QA_COUNT) missing.push('情景问答');
    throw new Error('题库不足，无法组卷：缺少 ' + missing.join('、'));
  }
  const qaBudgetEach = Math.floor(budgets.qa / Math.max(1, qaPicked.length));

  const qaItems: PaperQa[] = qaPicked.map(function (task, order) {
    return { task: task, order: order };
  });

  const allocatedMs = budgets.reading + qaBudgetEach * qaPicked.length + budgets.topic;

  return {
    seed: opts.seed,
    reading: { task: readingTask, budgetMs: budgets.reading },
    qa: qaItems,
    topic: { task: topicTask },
    listening: listeningResult.part,
    speakingMs: speakingMs,
    allocatedMs: allocatedMs,
    ids: {
      reading: readingTask.id,
      qa: qaItems.map(function (x) { return x.task.id; }),
      topic: topicTask.id,
      listening: listeningResult.ids,
    },
  };
}

/* ------------------------------------------------------------------ *
 * 六、换卷
 * ------------------------------------------------------------------ */

/**
 * 换一套卷：从上一份卷排除已出过的题，换新 seed。
 *
 * 为什么要排除：24 篇朗读 / 24 条问答 / 12 个话题都不算多，
 * 不排除的话「换一套」很可能抽到同一篇，学生会觉得没换。
 */
export function dealNextPaper(bank: PaperBank, prev: SuzhouPaper): SuzhouPaper {
  return dealPaper(bank, {
    seed: prev.seed + 1,
    exclude: {
      readingIds: prev.ids.reading ? [prev.ids.reading] : undefined,
      qaIds: prev.ids.qa,
      topicIds: prev.ids.topic ? [prev.ids.topic] : undefined,
      listeningIds: prev.ids.listening,
    },
  });
}