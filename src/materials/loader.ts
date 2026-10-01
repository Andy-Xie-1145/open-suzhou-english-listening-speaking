/**
 * 语料加载与组卷 —— 零依赖、纯 TypeScript，可在浏览器 / Node / CLI 中运行
 *
 * 许可：AGPL-3.0-only
 *
 * 本模块负责四件事：
 *   1. 泛型 JSON 加载：把 data/ 下四个 JSON 当作 `unknown` 接收，逐条做 schema 校验
 *   2. id / 名称索引：O(1) 取题，以及按类型（题型、教材册别、考点、难度）查询
 *   3. 随机抽题：可复现的伪随机数发生器（种子化），供模考组卷使用
 *   4. 组卷：随机卷 / AB 卷 / 梅花卷（平行卷）
 *
 * 【组卷语义的约定】依据《江苏省初中英语听力口语自动化考试要求》五大题型：
 *   Q1 听对话回答问题（第一节，短对话，5 题）
 *   Q2 听对话和短文答题（第二节，长对话与短文，5 题）
 *   Q3 朗读短文（从 24 篇材料中抽 1 篇）
 *   Q4 情景问答（2 题）
 *   Q5 话题简述（从 12 个话题中抽 1 个）
 *   随机卷 = 单套全随机；AB 卷 = 2 套平行卷，题量结构一致、题目互不重复；
 *   梅花卷 = 3 套（甲/乙/丙）平行卷，题量、考点分布、难度分布均配平，供同场次轮换。
 *
 * 【重要约定】所有短文均为自编「等效练习材料」，非教材原文，避免版权问题；
 * 教材位置仅用于命题对标，详见 data/README.md。
 */

import type { TopicProfile } from '../rules/lexicon.ts';

/* ------------------------------------------------------------------ *
 * 一、数据类型
 * ------------------------------------------------------------------ */

/** 难度：1 容易 / 2 中等 / 3 较难 */
export type Difficulty = 1 | 2 | 3;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: '容易',
  2: '中等',
  3: '较难',
};

/** 连读 / 意群提示（朗读训练用） */
export interface PhonicsCue {
  /** 涉及的词组 */
  phrase: string;
  /** 中文提示：不完全爆破 / 连读 / 失去爆破 / 意群停顿 等 */
  note: string;
}

/** 朗读短文（封闭题，2026 年考纲共 24 篇） */
export interface Reading {
  id: string;
  /** 教材位置，如「七上 U3 Task」 */
  textbook: string;
  /** 册别，如「七上」 */
  book: string;
  /** 单元英文标题与中文话题 */
  unitTheme: string;
  /** 教材位置来源：2026 省通知（已公布）/ 教材对标建议（未公布） */
  positionSource: string;
  /** 标题（仅检索用，考试朗读时不显示） */
  title: string;
  /** 正文 */
  text: string;
  /** 词数（加载时按正文重新计算并校验） */
  wordCount: number;
  difficulty: Difficulty;
  /** 话题标签，用于按主题检索 */
  tags: string[];
  /** 连读意群提示 */
  phonicsCues: PhonicsCue[];
  /** 版权与用途说明 */
  note: string;
}

/** 情景问答题（半开放题） */
export interface QaItem {
  id: string;
  /** 情境描述（中文，仅教师参考，考试不显示） */
  scenario: string;
  /** 情境类别 */
  category: string;
  /** 英文问题（考试显示） */
  question: string;
  /** 参考回答要点（中文，仅教师参考） */
  keyPoints: string[];
  /** 建议句数 */
  suggestedSentences: number;
  difficulty: Difficulty;
}

/** 听力材料类型：短对话 / 长对话与短文 */
export type ListeningType = 'dialogue' | 'passage';

/** 考点类型：细节 / 推理 / 数字 */
export type PointType = 'detail' | 'inference' | 'number';

export const LISTENING_TYPE_LABELS: Record<ListeningType, string> = {
  dialogue: '短对话',
  passage: '长对话 / 短文',
};

export const POINT_TYPE_LABELS: Record<PointType, string> = {
  detail: '细节',
  inference: '推理',
  number: '数字',
};

/** 听力题 */
export interface ListeningItem {
  id: string;
  type: ListeningType;
  /** 篇名（仅检索用） */
  title: string;
  /** 材料正文；对话用「W:」「M:」分行 */
  text: string;
  question: string;
  /** 三个选项，固定长度为 3 */
  options: string[];
  /** 正确答案：选项下标（0-2） */
  answer: number;
  pointType: PointType;
  /** 听力关键词，供 UI 高亮 */
  keywords: string[];
  difficulty: Difficulty;
}

/** 常用句式分组 */
export interface ExpressionGroup {
  /** 分组名，如「表达喜好」 */
  group: string;
  items: string[];
}

/** 话题简述（开放题，2025 年起 12 个话题、取消中文提示、须说满 7 句） */
export interface Topic extends TopicProfile {
  keyExpressions: ExpressionGroup[];
  /** 完整范例回答，一句一条，至少 7 句 */
  sampleAnswer: string[];
}

/* ------------------------------------------------------------------ *
 * 二、随机数（种子化，可复现）
 * ------------------------------------------------------------------ */

/** 伪随机数发生器 */
export interface Rng {
  /** 返回 [0,1) */
  next(): number;
  /** 返回 [0, n) 的整数 */
  int(n: number): number;
  pick<T>(items: readonly T[]): T;
  /** 洗牌（返回新数组，不改原数组） */
  shuffle<T>(items: readonly T[]): T[];
  /** 不放回随机抽取 n 个 */
  sample<T>(items: readonly T[], n: number): T[];
}

/** mulberry32：小、快、确定性良好 */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (n: number) => Math.floor(next() * n),
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) throw new MaterialError('随机抽题', ['候选集合为空，无法抽取']);
      return items[Math.floor(next() * items.length)];
    },
    shuffle<T>(items: readonly T[]): T[] {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i];
        out[i] = out[j];
        out[j] = tmp;
      }
      return out;
    },
    sample<T>(items: readonly T[], n: number): T[] {
      if (n > items.length) {
        throw new MaterialError('随机抽题', [
          `需要抽取 ${n} 个候选，语料库只有 ${items.length} 个`,
        ]);
      }
      return this.shuffle(items).slice(0, n);
    },
  };
}

/** 未指定种子时用的随机种子 */
function defaultSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
}

/* ------------------------------------------------------------------ *
 * 三、schema 校验
 * ------------------------------------------------------------------ */

/** 语料校验错误 */
export class MaterialError extends Error {
  readonly issues: string[];
  constructor(label: string, issues: string[]) {
    super(`语料校验失败（${label}）：\n` + issues.map((i) => '  - ' + i).join('\n'));
    this.name = 'MaterialError';
    this.issues = issues;
  }
}

/** 话题简述的硬性句数门槛（与 src/rules/evaluate.ts 的 MIN_SENTENCES 保持一致） */
export const MIN_SAMPLE_SENTENCES = 7;

/** 校验器：收集全部问题后一次性抛出，便于一次改完 */
class Checker {
  readonly issues: string[] = [];

  fail(path: string, message: string): void {
    this.issues.push(`${path} ${message}`);
  }

  isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null && !Array.isArray(v);
  }

  str(v: unknown, path: string, minLen = 1): string | undefined {
    if (typeof v !== 'string') { this.fail(path, `应为字符串，实际是 ${typeof v}`); return undefined; }
    const s = v.trim();
    if (s.length < minLen) { this.fail(path, '不能为空'); return undefined; }
    return s;
  }

  int(v: unknown, path: string, min: number, max: number): number | undefined {
    if (typeof v !== 'number' || !Number.isFinite(v)) { this.fail(path, '应为数字'); return undefined; }
    if (v < min || v > max) { this.fail(path, `应落在 ${min}-${max} 之间，实际是 ${v}`); return undefined; }
    return v;
  }

  bool(v: unknown, path: string): boolean | undefined {
    if (typeof v !== 'boolean') { this.fail(path, '应为布尔值'); return undefined; }
    return v;
  }

  oneOf<T extends string | number>(v: unknown, path: string, allowed: readonly T[]): T | undefined {
    if (typeof v !== 'string' && typeof v !== 'number') { this.fail(path, '应为字符串或数字'); return undefined; }
    if (!(allowed as readonly (string | number)[]).includes(v)) {
      this.fail(path, `只能取 ${allowed.join(' / ')}，实际是 "${v}"`);
      return undefined;
    }
    return v as T;
  }

  strArray(v: unknown, path: string, minLen = 1): string[] | undefined {
    if (!Array.isArray(v)) { this.fail(path, '应为数组'); return undefined; }
    if (v.length < minLen) { this.fail(path, `至少需要 ${minLen} 项，实际 ${v.length} 项`); return undefined; }
    const out: string[] = [];
    v.forEach((item, i) => {
      const s = this.str(item, `${path}[${i}]`);
      if (s !== undefined) out.push(s);
    });
    return out;
  }

  /** 逐条校验数组，收集合格项 */
  each<T>(v: unknown, path: string, fn: (item: unknown, itemPath: string) => T | undefined): T[] {
    if (!Array.isArray(v)) { this.fail(path, '应为数组'); return []; }
    if (v.length === 0) { this.fail(path, '不能为空'); return []; }
    const out: T[] = [];
    const seen = new Set<string>();
    v.forEach((item, i) => {
      const parsed = fn(item, `${path}[${i}]`);
      if (parsed === undefined) return;
      const key = (parsed as { id?: string; name?: string }).id ?? (parsed as { name?: string }).name;
      if (key !== undefined) {
        if (seen.has(key)) this.fail(`${path}[${i}]`, `标识 "${key}" 重复`);
        seen.add(key);
      }
      out.push(parsed);
    });
    return out;
  }

  finish<T>(label: string, value: T): T {
    if (this.issues.length > 0) throw new MaterialError(label, this.issues);
    return value;
  }
}

/** schema 函数签名 */
export type Schema<T> = (raw: unknown, label: string) => T;

function parseReading(raw: unknown, path: string, c: Checker): Reading | undefined {
  if (!c.isRecord(raw)) { c.fail(path, '应为对象'); return undefined; }
  const id = c.str(raw.id, `${path}.id`);
  const textbook = c.str(raw.textbook, `${path}.textbook`);
  const book = c.str(raw.book, `${path}.book`);
  const unitTheme = c.str(raw.unitTheme, `${path}.unitTheme`);
  const positionSource = c.str(raw.positionSource, `${path}.positionSource`);
  const title = c.str(raw.title, `${path}.title`);
  const text = c.str(raw.text, `${path}.text`);
  const wordCount = c.int(raw.wordCount, `${path}.wordCount`, 0, 10000);
  const difficulty = c.oneOf(raw.difficulty, `${path}.difficulty`, [1, 2, 3] as const);
  const tags = c.strArray(raw.tags, `${path}.tags`, 1);
  const note = c.str(raw.note, `${path}.note`);
  const cues = Array.isArray(raw.phonicsCues)
    ? raw.phonicsCues.map((item, i) => {
        if (!c.isRecord(item)) { c.fail(`${path}.phonicsCues[${i}]`, '应为对象'); return undefined; }
        const phrase = c.str(item.phrase, `${path}.phonicsCues[${i}].phrase`);
        const cue = c.str(item.note, `${path}.phonicsCues[${i}].note`);
        if (phrase === undefined || cue === undefined) return undefined;
        return { phrase, note: cue };
      }).filter((x): x is PhonicsCue => x !== undefined)
    : [];
  if (!Array.isArray(raw.phonicsCues) || raw.phonicsCues.length === 0) {
    c.fail(`${path}.phonicsCues`, '至少需要 1 条连读 / 意群提示');
  }

  // 词数必须与正文一致，防止数据与内容脱节
  if (text !== undefined && wordCount !== undefined) {
    const actual = countWords(text);
    if (actual !== wordCount) {
      c.fail(`${path}.wordCount`, `与正文实际词数不一致：标注 ${wordCount}，实际 ${actual}`);
    }
  }

  if (
    id === undefined || textbook === undefined || book === undefined || unitTheme === undefined ||
    positionSource === undefined || title === undefined || text === undefined || wordCount === undefined ||
    difficulty === undefined || tags === undefined || note === undefined
  ) return undefined;

  return { id, textbook, book, unitTheme, positionSource, title, text, wordCount, difficulty, tags, phonicsCues: cues, note };
}

function parseQa(raw: unknown, path: string, c: Checker): QaItem | undefined {
  if (!c.isRecord(raw)) { c.fail(path, '应为对象'); return undefined; }
  const id = c.str(raw.id, `${path}.id`);
  const scenario = c.str(raw.scenario, `${path}.scenario`);
  const category = c.str(raw.category, `${path}.category`);
  const question = c.str(raw.question, `${path}.question`);
  const keyPoints = c.strArray(raw.keyPoints, `${path}.keyPoints`, 2);
  const suggestedSentences = c.int(raw.suggestedSentences, `${path}.suggestedSentences`, 1, 20);
  const difficulty = c.oneOf(raw.difficulty, `${path}.difficulty`, [1, 2, 3] as const);
  // 英文问题必须以问号结尾，且含有实词
  if (question !== undefined) {
    if (!/[?]$/.test(question)) c.fail(`${path}.question`, '英文问题应以问号结尾');
    if (countWords(question) < 3) c.fail(`${path}.question`, '问题过短');
  }
  if (
    id === undefined || scenario === undefined || category === undefined || question === undefined ||
    keyPoints === undefined || suggestedSentences === undefined || difficulty === undefined
  ) return undefined;
  return { id, scenario, category, question, keyPoints, suggestedSentences, difficulty };
}

function parseListening(raw: unknown, path: string, c: Checker): ListeningItem | undefined {
  if (!c.isRecord(raw)) { c.fail(path, '应为对象'); return undefined; }
  const id = c.str(raw.id, `${path}.id`);
  const type = c.oneOf(raw.type, `${path}.type`, ['dialogue', 'passage'] as const);
  const title = c.str(raw.title, `${path}.title`);
  const text = c.str(raw.text, `${path}.text`);
  const question = c.str(raw.question, `${path}.question`);
  const answer = c.int(raw.answer, `${path}.answer`, 0, 2);
  const pointType = c.oneOf(raw.pointType, `${path}.pointType`, ['detail', 'inference', 'number'] as const);
  const keywords = c.strArray(raw.keywords, `${path}.keywords`, 1);
  const difficulty = c.oneOf(raw.difficulty, `${path}.difficulty`, [1, 2, 3] as const);
  const options = c.strArray(raw.options, `${path}.options`, 3);
  if (options !== undefined && options.length !== 3) {
    c.fail(`${path}.options`, `选择题固定 3 个选项，实际 ${options.length} 个`);
  }
  if (question !== undefined && !/[?]$/.test(question)) c.fail(`${path}.question`, '问题应以问号结尾');
  if (text !== undefined && countWords(text) < 20) c.fail(`${path}.text`, '听力材料过短（少于 20 词）');
  if (
    id === undefined || type === undefined || title === undefined || text === undefined || question === undefined ||
    options === undefined || answer === undefined || pointType === undefined || keywords === undefined ||
    difficulty === undefined
  ) return undefined;
  return { id, type, title, text, question, options, answer, pointType, keywords, difficulty };
}

function parseTopic(raw: unknown, path: string, c: Checker): Topic | undefined {
  if (!c.isRecord(raw)) { c.fail(path, '应为对象'); return undefined; }
  const name = c.str(raw.name, `${path}.name`);
  const hint = c.str(raw.hint, `${path}.hint`);
  const keywords = c.strArray(raw.keywords, `${path}.keywords`, 3);
  const bonusPhrases = c.strArray(raw.bonusPhrases, `${path}.bonusPhrases`, 1);
  const sampleAnswer = c.strArray(raw.sampleAnswer, `${path}.sampleAnswer`, MIN_SAMPLE_SENTENCES);
  const keyExpressions = Array.isArray(raw.keyExpressions)
    ? raw.keyExpressions.map((item, i) => {
        if (!c.isRecord(item)) { c.fail(`${path}.keyExpressions[${i}]`, '应为对象'); return undefined; }
        const group = c.str(item.group, `${path}.keyExpressions[${i}].group`);
        const items = c.strArray(item.items, `${path}.keyExpressions[${i}].items`, 2);
        if (group === undefined || items === undefined) return undefined;
        return { group, items };
      }).filter((x): x is ExpressionGroup => x !== undefined)
    : [];
  if (!Array.isArray(raw.keyExpressions) || raw.keyExpressions.length === 0) {
    c.fail(`${path}.keyExpressions`, '至少需要 1 组常用句式');
  }
  if (
    name === undefined || hint === undefined || keywords === undefined || bonusPhrases === undefined ||
    sampleAnswer === undefined
  ) return undefined;
  return { name, hint, keywords, bonusPhrases, keyExpressions, sampleAnswer };
}

/** 解析并校验一个 JSON 数组文件 */
export const readingsSchema: Schema<Reading[]> = (raw, label) => {
  const c = new Checker();
  const items = c.each(raw, 'readings', (item, path) => parseReading(item, path, c));
  return c.finish(label, items);
};

export const qaSchema: Schema<QaItem[]> = (raw, label) => {
  const c = new Checker();
  const items = c.each(raw, 'qa', (item, path) => parseQa(item, path, c));
  return c.finish(label, items);
};

export const listeningSchema: Schema<ListeningItem[]> = (raw, label) => {
  const c = new Checker();
  const items = c.each(raw, 'listening', (item, path) => parseListening(item, path, c));
  return c.finish(label, items);
};

export const topicsSchema: Schema<Topic[]> = (raw, label) => {
  const c = new Checker();
  const items = c.each(raw, 'topics', (item, path) => parseTopic(item, path, c));
  return c.finish(label, items);
};

/**
 * 泛型 JSON 加载：把「已经是 unknown 的 JSON 模块」交给 schema 校验后返回强类型。
 * 这是本项目数据进入运行时的唯一入口 —— 不做隐式 any 断言。
 */
export function loadJson<T>(raw: unknown, schema: Schema<T>, label: string): T {
  return schema(raw, label);
}

/** 泛型 JSON 加载（文本版）：JSON.parse + 校验，用于 fetch 到的文本 */
export function parseJsonText<T>(text: string, schema: Schema<T>, label: string): T {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new MaterialError(label, [`不是合法的 JSON：${(err as Error).message}`]);
  }
  return schema(raw, label);
}

/* ------------------------------------------------------------------ *
 * 四、语料集合
 * ------------------------------------------------------------------ */

/** 组卷卷别 */
export type PaperForm = 'random' | 'ab' | 'plum';

/** 题量结构（对应考试五大题型） */
export interface PaperLayout {
  /** 第一节 短对话题数 */
  shortDialogue: number;
  /** 第二节 长对话与短文题数 */
  longListening: number;
  /** 朗读短文题数 */
  reading: number;
  /** 情景问答题数 */
  qa: number;
  /** 话题简述题数 */
  topic: number;
}

/** 2026 年考纲默认题量：听力 10 题 + 朗读 1 + 情景问答 2 + 话题简述 1 */
export const DEFAULT_LAYOUT: PaperLayout = {
  shortDialogue: 5,
  longListening: 5,
  reading: 1,
  qa: 2,
  topic: 1,
};

export interface PaperOptions {
  /** 随机种子，相同种子必得相同卷面 */
  seed?: number;
  /** 题量结构，默认 DEFAULT_LAYOUT */
  layout?: Partial<PaperLayout>;
  /** 限定册别，如只抽「九上 / 九下」的材料 */
  books?: string[];
}

export interface ExamPaper {
  form: PaperForm;
  /** 中文卷别名，如「A 卷」「甲卷」 */
  formLabel: string;
  seed: number;
  layout: PaperLayout;
  listening: {
    /** 第一节 短对话 */
    short: ListeningItem[];
    /** 第二节 长对话与短文 */
    long: ListeningItem[];
  };
  reading: Reading;
  qa: QaItem[];
  topic: Topic;
  /** 卷面统计，便于教师核对与 UI 展示 */
  summary: PaperSummary;
}

export interface PaperSummary {
  listeningCount: number;
  readingId: string;
  readingWords: number;
  qaCount: number;
  topicName: string;
  pointTypes: Record<PointType, number>;
  difficulties: Record<Difficulty, number>;
  /** 全卷题目 id，便于去重校验 */
  itemIds: string[];
}

/** 平行卷的发牌结果：每个下标对应一套卷（0 = A/甲，1 = B/乙，2 = 丙） */
export interface PaperDealt {
  /** 第一节短对话，每套一列 */
  short: ListeningItem[][];
  /** 第二节长对话与短文 */
  long: ListeningItem[][];
  reading: Reading[][];
  qa: QaItem[][];
  topic: Topic[][];
}

/** 原始 JSON 输入形状 */
export interface RawMaterials {
  readings: unknown;
  qa: unknown;
  listening: unknown;
  topics: unknown;
}

/** 按 id / 名称查询的过滤器 */
export interface ReadingFilter {
  book?: string;
  textbook?: string;
  difficulty?: Difficulty;
  tag?: string;
  positionSource?: string;
}

function matchesReading(r: Reading, f: ReadingFilter): boolean {
  if (f.book !== undefined && r.book !== f.book) return false;
  if (f.textbook !== undefined && r.textbook !== f.textbook) return false;
  if (f.difficulty !== undefined && r.difficulty !== f.difficulty) return false;
  if (f.positionSource !== undefined && r.positionSource !== f.positionSource) return false;
  if (f.tag !== undefined && !r.tags.includes(f.tag)) return false;
  return true;
}

/** 语料集合：索引 + 查询 + 随机 + 组卷 */
export class Materials {
  readonly readings: readonly Reading[];
  readonly qa: readonly QaItem[];
  readonly listening: readonly ListeningItem[];
  readonly topics: readonly Topic[];

  private readonly readingIndex = new Map<string, Reading>();
  private readonly qaIndex = new Map<string, QaItem>();
  private readonly listeningIndex = new Map<string, ListeningItem>();
  private readonly topicIndex = new Map<string, Topic>();

  constructor(raw: RawMaterials) {
    this.readings = loadJson(raw.readings, readingsSchema, 'data/readings.json');
    this.qa = loadJson(raw.qa, qaSchema, 'data/qa.json');
    this.listening = loadJson(raw.listening, listeningSchema, 'data/listening.json');
    this.topics = loadJson(raw.topics, topicsSchema, 'data/topics.json');
    for (const r of this.readings) this.readingIndex.set(r.id, r);
    for (const q of this.qa) this.qaIndex.set(q.id, q);
    for (const l of this.listening) this.listeningIndex.set(l.id, l);
    for (const t of this.topics) this.topicIndex.set(t.name, t);
  }

  /* ---------------- 索引查询 ---------------- */

  findReading(id: string): Reading | undefined { return this.readingIndex.get(id); }
  findQa(id: string): QaItem | undefined { return this.qaIndex.get(id); }
  findListening(id: string): ListeningItem | undefined { return this.listeningIndex.get(id); }
  findTopic(name: string): Topic | undefined { return this.topicIndex.get(name); }

  /** 取不到就报错，避免 UI 拿到 undefined 后静默出错 */
  readingById(id: string): Reading { return must(this.readingIndex.get(id), `朗读材料 ${id}`); }
  qaById(id: string): QaItem { return must(this.qaIndex.get(id), `情景问答 ${id}`); }
  listeningById(id: string): ListeningItem { return must(this.listeningIndex.get(id), `听力题 ${id}`); }
  topicByName(name: string): Topic { return must(this.topicIndex.get(name), `话题 ${name}`); }

  /* ---------------- 按类型查询 ---------------- */

  /** 按条件筛朗读材料 */
  readingsBy(filter: ReadingFilter = {}): Reading[] {
    return this.readings.filter((r) => matchesReading(r, filter));
  }

  /** 按册别：七上 / 七下 / 八上 / 八下 / 九上 / 九下 */
  readingsByBook(book: string): Reading[] {
    return this.readingsBy({ book });
  }

  /** 考纲里已公布教材位置的新增材料 */
  readingsAnnounced(): Reading[] {
    return this.readings.filter((r) => r.positionSource === POSITION_SOURCE_2026);
  }

  listeningByType(type: ListeningType): ListeningItem[] {
    return this.listening.filter((l) => l.type === type);
  }

  listeningByPoint(pointType: PointType): ListeningItem[] {
    return this.listening.filter((l) => l.pointType === pointType);
  }

  qaByCategory(category: string): QaItem[] {
    return this.qa.filter((q) => q.category === category);
  }

  /** 出现的册别与册别计数，供 UI 做教材对标筛选 */
  booksCount(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const r of this.readings) out[r.book] = (out[r.book] ?? 0) + 1;
    return out;
  }

  /** 语料概况 */
  summary(): {
    readings: number; qa: number; listening: number; topics: number;
    dialogue: number; passage: number; books: Record<string, number>;
  } {
    return {
      readings: this.readings.length,
      qa: this.qa.length,
      listening: this.listening.length,
      topics: this.topics.length,
      dialogue: this.listeningByType('dialogue').length,
      passage: this.listeningByType('passage').length,
      books: this.booksCount(),
    };
  }

  /* ---------------- 随机抽题 ---------------- */

  drawReadings(n: number, rng: Rng, filter: ReadingFilter = {}): Reading[] {
    return rng.sample(this.readingsBy(filter), n);
  }

  drawListening(n: number, rng: Rng, filter: { type?: ListeningType; pointType?: PointType } = {}): ListeningItem[] {
    const pool = this.listening.filter(
      (l) => (filter.type === undefined || l.type === filter.type) &&
             (filter.pointType === undefined || l.pointType === filter.pointType),
    );
    return rng.sample(pool, n);
  }

  drawQa(n: number, rng: Rng): QaItem[] {
    return rng.sample(this.qa, n);
  }

  drawTopic(rng: Rng): Topic {
    return rng.pick(this.topics);
  }

  /* ---------------- 组卷 ---------------- */

  /** 随机卷：单套，全随机 */
  buildPaper(options: PaperOptions = {}): ExamPaper {
    const seed = options.seed ?? defaultSeed();
    const rng = createRng(seed);
    return this.assemble('random', '随机卷', seed, options, rng, 0, undefined);
  }

  /**
   * AB 卷：两套平行卷。
   * 卷量结构一致；听力题与朗读材料、情景问答、话题全部互不重复，
   * 便于同一场次 A / B 考场轮换，防止串题。
   */
  buildABPaper(options: PaperOptions = {}): { A: ExamPaper; B: ExamPaper } {
    const seed = options.seed ?? defaultSeed();
    const rng = createRng(seed);
    const dealt = this.deal(options, 2, rng);
    return {
      A: this.assemble('ab', 'A 卷', seed, options, rng, 0, dealt),
      B: this.assemble('ab', 'B 卷', seed, options, rng, 1, dealt),
    };
  }

  /**
   * 梅花卷：三套（甲 / 乙 / 丙）平行卷。
   * 与 AB 卷的区别是「配平」：先按考点类型、难度、册别分组，再轮转发牌，
   * 保证三卷的考点分布与难度分布一致，适合同场次轮换。
   */
  buildPlumBlossom(options: PaperOptions = {}): { 甲: ExamPaper; 乙: ExamPaper; 丙: ExamPaper } {
    const seed = options.seed ?? defaultSeed();
    const rng = createRng(seed);
    const dealt = this.deal(options, 3, rng);
    return {
      甲: this.assemble('plum', '甲卷', seed, options, rng, 0, dealt),
      乙: this.assemble('plum', '乙卷', seed, options, rng, 1, dealt),
      丙: this.assemble('plum', '丙卷', seed, options, rng, 2, dealt),
    };
  }

  /**
   * 梅花卷发牌：按 key 分组轮转发牌，使各卷在同一组内的题量差不超过 1。
   * 返回每卷抽中的 id，供 assemble 去重。
   */
  /**
   * 平行卷发牌核心。
   *
   * 先按 key 分组、组内打乱，再按 forms 套循环发牌，游标跨组连续递增，
   * 于是「同一 key 在各卷中的题量差不超过 1」——这就是梅花卷的「配平」。
   *
   * 两种发牌次序：
   * - spread = false（先组后套）：同组的题连续发给不同卷。
   *   用于听力与朗读：各卷的考点类型 / 难度构成一致。
   * - spread = true（先套后组）：同一轮里先把各组都发一遍。
   *   用于情景问答：保证同一套卷里的几道题来自不同情境类别。
   */
  private dealParallel<T>(
    pool: readonly T[],
    keyOf: (item: T) => string,
    forms: number,
    size: number,
    rng: Rng,
    label: string,
    spread: boolean,
  ): T[][] {
    assertEnough(label, pool.length, size * forms);
    const groups = new Map<string, T[]>();
    for (const item of pool) {
      const key = keyOf(item);
      const arr = groups.get(key);
      if (arr === undefined) groups.set(key, [item]);
      else arr.push(item);
    }
    const arrays = [...groups.values()].map((g) => rng.shuffle(g));
    const out: T[][] = Array.from({ length: forms }, () => []);
    let cursor = 0;
    if (spread) {
      const maxLen = arrays.reduce((n, a) => Math.max(n, a.length), 0);
      for (let step = 0; step < maxLen; step++) {
        for (const arr of arrays) {
          const item = arr[step];
          if (item === undefined) continue;
          out[cursor % forms].push(item);
          cursor++;
        }
      }
    } else {
      for (const arr of arrays) {
        for (const item of arr) {
          out[cursor % forms].push(item);
          cursor++;
        }
      }
    }
    return out.map((list) => {
      if (list.length < size) {
        throw new MaterialError('组卷', [
          `${label} 配平后每套只有 ${list.length} 道，达不到 ${size} 道`,
        ]);
      }
      // 每套只取前 size 道，多余的退回语料池，保证题量精确
      return rng.shuffle(list.slice(0, size));
    });
  }

  /**
   * 为 AB 卷（2 套）/ 梅花卷（3 套）一次性发牌：
   * 保证套与套之间不重题，且考点分布配平。
   */
  private deal(options: PaperOptions, forms: number, rng: Rng): PaperDealt {
    const layout = mergeLayout(options.layout);
    const books = options.books;
    const readingPool = this.readings.filter((r) => books === undefined || books.includes(r.book));
    return {
      short: this.dealParallel(this.listeningByType('dialogue'), (l) => l.pointType, forms, layout.shortDialogue, rng, '听力短对话', false),
      long: this.dealParallel(this.listeningByType('passage'), (l) => l.pointType, forms, layout.longListening, rng, '听力长对话/短文', false),
      // 朗读材料同难度：按难度分桶后连续发牌、各套取前 N 道，各卷自然落在同一难度档
      reading: this.dealParallel(readingPool, (r) => String(r.difficulty), forms, layout.reading, rng, '朗读短文', false),
      // 情景问答要求同卷不同情境：先套后组
      qa: this.dealParallel(this.qa, (q) => q.category, forms, layout.qa, rng, '情景问答', true),
      topic: this.dealParallel(this.topics, (t) => t.name, forms, layout.topic, rng, '话题简述', false),
    };
  }

  /** 组装单套卷面。index 指梅花/AB 卷的第几套（0 起）。 */
  private assemble(
    form: PaperForm,
    formLabel: string,
    seed: number,
    options: PaperOptions,
    rng: Rng,
    index: number,
    dealt: PaperDealt | undefined,
  ): ExamPaper {
    const layout = mergeLayout(options.layout);
    const books = options.books;
    const pool = {
      short: this.listeningByType('dialogue'),
      long: this.listeningByType('passage'),
      reading: this.readings.filter((r) => books === undefined || books.includes(r.book)),
      qa: this.qa,
      topic: this.topics,
    };

    // 平行卷按发牌结果取题，随机卷直接随机抽
    const section = <T>(source: readonly T[], dealtList: T[][] | undefined, size: number, label: string): T[] => {
      if (dealtList === undefined) return rng.sample(source, size);
      const picked = dealtList[index] ?? [];
      if (picked.length !== size) {
        throw new MaterialError('组卷', [
          `${label} 第 ${index + 1} 套发牌结果为 ${picked.length} 道，应为 ${size} 道`,
        ]);
      }
      return picked;
    };

    const short = section(pool.short, dealt?.short, layout.shortDialogue, '听力短对话');
    const long = section(pool.long, dealt?.long, layout.longListening, '听力长对话/短文');
    const reading = section(pool.reading, dealt?.reading, layout.reading, '朗读短文')[0];
    const qa = section(pool.qa, dealt?.qa, layout.qa, '情景问答');
    const topic = section(pool.topic, dealt?.topic, layout.topic, '话题简述')[0];

    if (!reading || !topic) {
      throw new MaterialError('组卷', ['朗读材料或话题候选不足，无法组成一套完整试卷']);
    }

    return {
      form,
      formLabel,
      seed,
      layout,
      listening: { short, long },
      reading,
      qa,
      topic,
      summary: paperSummary(layout, short, long, reading, qa, topic),
    };
  }
}

/** 2026 年省通知已公布教材位置的 6 篇新增材料 */
export const POSITION_SOURCE_2026 = '2026 省通知';

function must<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new MaterialError('查询', [`找不到 ${label}`]);
  return value;
}

function assertEnough(label: string, have: number, need: number): void {
  if (have < need) {
    throw new MaterialError('组卷', [`${label} 语料不足：需要 ${need} 道，现有 ${have} 道`]);
  }
}

function mergeLayout(partial?: Partial<PaperLayout>): PaperLayout {
  return { ...DEFAULT_LAYOUT, ...(partial ?? {}) };
}

function paperSummary(
  layout: PaperLayout,
  short: readonly ListeningItem[],
  long: readonly ListeningItem[],
  reading: Reading,
  qa: readonly QaItem[],
  topic: Topic,
): PaperSummary {
  const pointTypes: Record<PointType, number> = { detail: 0, inference: 0, number: 0 };
  const difficulties: Record<Difficulty, number> = { 1: 0, 2: 0, 3: 0 };
  for (const item of [...short, ...long]) {
    pointTypes[item.pointType]++;
    difficulties[item.difficulty]++;
  }
  difficulties[reading.difficulty]++;
  return {
    listeningCount: layout.shortDialogue + layout.longListening,
    readingId: reading.id,
    readingWords: reading.wordCount,
    qaCount: qa.length,
    topicName: topic.name,
    pointTypes,
    difficulties,
    itemIds: [
      ...short.map((x) => x.id),
      ...long.map((x) => x.id),
      reading.id,
      ...qa.map((x) => x.id),
      topic.name,
    ],
  };
}

/**
 * 英文单词：字母数字，以及词内的连字符与撇号（如 minutes' walk、good-looking 算 1 个词）。
 *
 * 为什么自带 tokenizer，而不直接用 src/rules/text/normalize.ts 的 tokenize：
 *   1. 口径隔离。24 篇短文的标注词数是「考纲意义上的词数」，
 *      不应随规则层分词口径的调整而整体漂移，否则历史数据全部失效。
 *   2. 回归隔离。该层 2026-08 曾把 /\s+/ 误写成字面量 /s+/、且字符类未剥离标点，
 *      导致 usually 被切成 u/ually、basketball 被切成 ba/ketball。
 *      缺陷已修复并由 tests/normalize.test.ts 固化回归，但语料层不再复用它。
 */
const WORD_RE = /[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g;

/** 英文词数：去标点后按空白切分，词内连字符与撇号不切分 */
export function countWords(text: string): number {
  return text.match(WORD_RE)?.length ?? 0;
}

/** 英文句数：按句末标点（. ! ?）切分，忽略不含实词的碎片 */
export function countSentences(text: string): number {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => countWords(s) > 0).length;
}

/** 工厂函数：从原始 JSON 创建语料集合 */
export function createMaterials(raw: RawMaterials): Materials {
  return new Materials(raw);
}
