/**
 * 情景问答（半开放题）—— 取题与近似评分，苏州中考题型专用
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 这是**近似模拟**，不是官方评分。见 spec/suzhou-listening-speaking.spec.md。
 *
 * 这一题型在三类口语题里居中：
 *  - 朗读短文（Q3）是**封闭题**：有标准原文，可逐词对齐
 *  - 话题简述（Q5）是**开放题**：只给话题名，回答完全自由
 *  - 情景问答（Q4）是**半开放题**：有明确的问句必须回应，但回答自由
 *
 * 因此**不能套用朗读的逐词对齐**——回答没有原文可比。
 * 改为做「是否正面回应问句」+「要点覆盖」两类判定，都可解释。
 *
 * 踩过的坑（已修）：「完全不说话」时 splitSentencesLoose 返回 ['']，
 * 导致表达量与流利度两个维度都拿到非零分（白送 10 分）。
 * 现在两个维度都显式以 spokeSomething 为前提。
 */

import { splitSentencesLoose, tokenize, normalizeWord } from '../rules/text/normalize.ts';
import { disclaimerBlock } from './disclaimer.ts';

/* ------------------------------------------------------------------ *
 * 一、任务
 * ------------------------------------------------------------------ */

export interface RawQa {
  id: string;
  category: string;
  /** 中文情境，仅供教师参考，界面不显示 */
  scenario: string;
  /** 英文问句，考试时显示 */
  question: string;
  keyPoints: string[];
  suggestedSentences?: string[];
  difficulty: number;
}

export interface QaTask {
  id: string;
  /** 情境类别，用于梅花卷配平 */
  category: string;
  /** 考试时显示的英文问句 */
  question: string;
  /** 中文情境，仅教师参考 */
  scenario: string;
  /** 要点（中文原文，供教师理解评分点） */
  keyPoints: string[];
  /**
   * 每个要点对应的英文关键词。**这是本项目人工编写的**，
   * 一个要点列多种可能说法，覆盖学生实际会用的表达。
   * 见 SPEC 第 7 节：这是假设词表，不是官方评分标准。
   */
  enKeywords: string[][];
  difficulty: number;
}export function toQaTask(raw: RawQa, enKeywords: string[][]): QaTask {
  if (raw.keyPoints.length !== enKeywords.length) {
    const msg = '要点与英文关键词数量不一致：' + raw.id + '（' + raw.keyPoints.length + ' vs ' + enKeywords.length + '）';
    throw new Error(msg);
  }
  return {
    id: raw.id,
    category: raw.category,
    question: raw.question,
    scenario: raw.scenario,
    keyPoints: raw.keyPoints.slice(),
    enKeywords: enKeywords.map(function (a) { return a.slice(); }),
    difficulty: raw.difficulty,
  };
}

/* ------------------------------------------------------------------ *
 * 二、关键词匹配（含词形变化）
 * ------------------------------------------------------------------ */
/**
 * 极简英文词干提取。
 *
 * 目的不是语言学正确，只是让常见变形能对上：
 *   apologize / apologise / apologised / apologizing
 *   throw / threw / throws
 *   study / studied / studies
 *
 * 刻意保持简单可预测——评分规则必须能被人看懂，
 * 不能藏一个学生看不懂的 NLP 黑盒。
 */
export function stem(word: string): string {
  let x = word.toLowerCase().replace(/[^a-z0-9']/g, '');
  if (x.length <= 3) return x;

  // 复数 / 第三人称
  if (x.endsWith('ies') && x.length > 4) return x.slice(0, -3) + 'y';
  if (x.endsWith('ses') || x.endsWith('xes') || x.endsWith('zes')
    || x.endsWith('ches') || x.endsWith('shes')) {
    return x.slice(0, -2);
  }
  if (x.endsWith('s') && !x.endsWith('ss') && !x.endsWith('us')) {
    return x.slice(0, -1);
  }

  // 进行时
  if (x.endsWith('ing') && x.length > 5) {
    const b = x.slice(0, -3);
    if (b.length > 2 && b[b.length - 1] === b[b.length - 2]) return b.slice(0, -1);
    return b;
  }

  // 过去式
  if (x.endsWith('ed') && x.length > 4) {
    const b = x.slice(0, -2);
    if (b.length > 2 && b[b.length - 1] === b[b.length - 2]) return b.slice(0, -1);
    return b;
  }

  // 英式 -ise 与美式 -ize 归一：apologise / apologize -> apologis
  if (x.endsWith('ize') && x.length > 4) return x.slice(0, -3) + 'is';
  if (x.endsWith('ise') && x.length > 4) return x.slice(0, -3) + 'is';
  // 副词与比较级
  if (x.endsWith('ly') && x.length > 4) return x.slice(0, -2);
  if (x.endsWith('est') && x.length > 6) return x.slice(0, -3);
  if (x.endsWith('er') && x.length > 5 && x.indexOf('th') !== x.length - 3) {
    return x.slice(0, -2);
  }

  return x;
}
/**
 * 一组等价词干：把同一个词的各种拼写/形态都收进来。
 *
 * 为什么需要它：stem() 无法覆盖所有组合（英式 -ise / 美式 -ize、
 * 不规则过去式 throw/threw）。与其堆规则，不如**两侧都展开成集合**，
 * 只要有一对对上就算命中——规则更简单，也更容易解释。
 */
export function stemSet(word: string): Set<string> {
  const base = word.toLowerCase().replace(/[^a-z0-9']/g, '');
  if (!base) return new Set<string>();
  const out = new Set<string>();
  out.add(base);
  out.add(stem(base));
  // 常见不规则过去式（小学阶段够用）
  const irregular: Record<string, string> = {
    throw: 'threw',
    wrote: 'write',
    wrote_: 'write',
    done: 'do',
    went: 'go',
    came: 'come',
    took: 'take',
    saw: 'see',
    said: 'say',
    told: 'tell',
    gave: 'give',
    got: 'get',
    broke: 'break',
    spoke: 'speak',
    ran: 'run',
    felt: 'feel',
    kept: 'keep',
    left: 'leave',
    brought: 'bring',
  };
  const inv = irregular[base];
  if (inv) { out.add(inv); out.add(stem(inv)); }
  // 反向：如果是变形，还原到原形
  for (const k of Object.keys(irregular)) {
    if (irregular[k] === base) { out.add(k); out.add(stem(k)); }
  }
  return out;
}
/**
 * 转写文本 → 词干数组（保留顺序，用于短语连续匹配）。
 */
export function stemsOf(transcript: string): string[][] {
  return tokenize(transcript).map(function (t) { return Array.from(stemSet(normalizeWord(t))); });
}

/**
 * 短语是否出现在转写中。
 *
 * 单词：任一词干命中即可。
 * 多词：要求**连续**出现（允许中间无间隔），任一词的任一变体都算。
 */
export function phrasePresent(phrase: string, stems: string[][]): boolean {
  const parts = phrase.toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return false;
  const variants = parts.map(function (p) { return stemSet(p); });

  for (let i = 0; i < stems.length; i++) {
    if (!variants[0].has(stems[i][0]) && !contains(stems[i], variants[0])) continue;
    if (variants.length === 1) return true;
    let ok = true;
    for (let j = 1; j < variants.length; j++) {
      const idx = i + j;
      if (idx >= stems.length || !contains(stems[idx], variants[j])) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

function contains(list: string[], set: Set<string>): boolean {
  for (const x of list) {
    if (set.has(x)) return true;
  }
  return false;
}
/* ------------------------------------------------------------------ *
 * 三、评分
 * ------------------------------------------------------------------ */

/** 单个要点的覆盖情况 */
export interface KeyPointResult {
  /** 要点序号（0 起） */
  index: number;
  /** 中文要点原文（教师参考） */
  label: string;
  /** 是否覆盖 */
  covered: boolean;
  /** 命中的关键词 */
  hit: string[];
  /** 未命中的关键词（供界面逐条展示） */
  missed: string[];
}

export interface QaDimension {
  key: string;
  label: string;
  value: number;
  note: string;
}

export interface QaResult {
  /** ⚠️ 近似分，不是考场得分。0-100 */
  approximateScore: number;
  /** 是否对问句作出了正面回应 */
  responded: boolean;
  /** 是否说了至少一句完整的话 */
  spokeSomething: boolean;
  sentenceCount: number;
  /** 逐要点覆盖情况 */
  keyPoints: KeyPointResult[];
  /** 覆盖率 0-1 */
  coverage: number;
  dimensions: QaDimension[];
  advice: string[];
}
/**
 * 权重说明：
 *
 * ⚠️ 以下权重是**本项目自定的假设值**，不是官方分值表。
 * 官方未公开情景问答的评分维度权重。见 SPEC 第 7 节，已标红。
 *
 * 设定逻辑：
 *  - 回应问句 0.25：没说清楚就不算有效回答
 *  - 要点覆盖 0.50：本题考察的核心，看回答是否说全
 *  - 表达量 0.15：句子太少通常意味着没展开
 *  - 流利度 0.10：卡壳影响表达
 */
const W = {
  response: 0.25,
  coverage: 0.50,
  volume: 0.15,
  fluency: 0.10,
} as const;

/** 表达量：本题期望学生说 2 句以上 */
const EXPECTED_MIN_SENTENCES = 2;

export interface QaInput {
  transcript: string;
  task: QaTask;
  durationMs?: number;
}
export function scoreQa(input: QaInput): QaResult {
  const task = input.task;
  const transcript = input.transcript;
  const stems = stemsOf(transcript);

  // ---- 逐要点覆盖 ----
  const results: KeyPointResult[] = task.enKeywords.map(function (kws, idx) {
    const hit: string[] = [];
    const missed: string[] = [];
    for (const kw of kws) {
      if (phrasePresent(kw, stems)) hit.push(kw);
      else missed.push(kw);
    }
    // 一个要点里任一说法命中即算覆盖
    return {
      index: idx,
      label: task.keyPoints[idx],
      covered: hit.length > 0,
      hit: hit,
      missed: missed,
    };
  });

  const coveredCount = results.filter(function (r) { return r.covered; }).length;
  const coverage = results.length > 0 ? coveredCount / results.length : 0;

  // ---- 是否说了话 ----
  const sentences = splitSentencesLoose(transcript);
  const wordCount = tokenize(transcript).length;
  const spokeSomething = wordCount >= 3 && sentences.length >= 1;

  // ---- 是否正面回应问句 ----
  // 半开放题没有唯一答案，无法逐词对齐。
  // 采用可解释的代理判定：**说够内容 + 覆盖到至少一个要点**，
  // 才认为对问句作出了实质回应。
  const responded = spokeSomething && coveredCount >= 1;
  // ---- 流利度：填充词密度 ----
  const fillerWords = ['um', 'uh', 'er', 'ah'];
  const low = transcript.toLowerCase();
  let fillers = 0;
  for (const f of fillerWords) {
    const re = new RegExp('\\b' + f + '\\b', 'g');
    const m = low.match(re);
    if (m) fillers += m.length;
  }
  const fillerDensity = wordCount > 0 ? fillers / wordCount : 0;
  // 没说话就没有「流利」可言：density 为 0 时公式会给出满分 1.0，
  // 必须显式归零，否则「完全不说话」会白拿流利度分。
  const fluency = spokeSomething ? Math.max(0, 1 - fillerDensity * 8) : 0;

  // ---- 分项 ----
  const dims: QaDimension[] = [
    {
      key: 'response',
      label: '正面回应问句',
      value: responded ? 1 : 0,
      note: responded
        ? '有实质回应'
        : (wordCount < 3 ? '几乎没有说话内容' : '说了内容但没有回应问句要求的要点'),
    },
    {
      key: 'coverage',
      label: '要点覆盖（说全了没有）',
      value: coverage,
      note: coveredCount + ' / ' + results.length + ' 个要点已覆盖',
    },
    {
      key: 'volume',
      label: '表达量（说得够不够）',
      // 空转写会得到 sentences=['']（长度 1），必须先判是否真的说了话，
      // 否则「完全不说话」会因为数组非空而拿到 0.5 的表达量分。
      value: spokeSomething ? Math.min(1, sentences.length / EXPECTED_MIN_SENTENCES) : 0,
      note: '说了 ' + sentences.length + ' 句（本题期望至少 ' + EXPECTED_MIN_SENTENCES + ' 句）',
    },
    {
      key: 'fluency',
      label: '流利度（有没有卡壳）',
      value: fluency,
      note: fillers > 0 ? '出现 ' + fillers + ' 处停顿词' : '无明显停顿',
    },
  ];
  const raw = dims.reduce(function (a, d) {
    const w = (W as Record<string, number>)[d.key] ?? 0;
    return a + d.value * w;
  }, 0);
  const approximateScore = Math.round(raw * 100);

  // ---- 建议：逐条指出哪个要点没覆盖、哪些关键词没命中 ----
  const advice: string[] = [];
  if (!spokeSomething) {
    advice.push('几乎没有听到内容。请靠近麦克风并大声回答，不要只说单个词。');
  } else if (!responded) {
    advice.push('说了内容，但没有回应问题要求。请先用一句话直接回答问题，再补充理由。');
  }
  for (const r of results) {
    if (r.covered) continue;
    const some = r.missed.slice(0, 6).join(' / ');
    advice.push('要点 ' + (r.index + 1) + ' 未覆盖（' + r.label + '）。可能的说法例如：' + some + '。');
  }
  if (sentences.length < EXPECTED_MIN_SENTENCES) {
    advice.push('本题建议至少说 ' + EXPECTED_MIN_SENTENCES + ' 句：先直接回答，再给一个理由或例子。');
  }
  if (fillers > 0) {
    advice.push('有 ' + fillers + ' 处停顿（um / uh 一类），可以先想好再说。');
  }
  if (advice.length === 0) {
    advice.push('要点覆盖完整。注意本工具按英文关键词判定要点，无法评估表达是否自然、语法是否地道。');
  }

  return {
    approximateScore: approximateScore,
    responded: responded,
    spokeSomething: spokeSomething,
    sentenceCount: sentences.length,
    keyPoints: results,
    coverage: coverage,
    dimensions: dims,
    advice: advice,
  };
}

/* ------------------------------------------------------------------ *
 * 四、组题：2 题，情境类别配平
 * ------------------------------------------------------------------ */

/**
 * 按类别配平抽 2 题。
 *
 * 梅花卷要求同一套卷内**类别不同**，避免两题落在同一情境上。
 * @param all 已装配的全部题目
 * @param seed 随机种子，同种子必得同卷
 */
export function drawQaPair(all: QaTask[], seed: number): QaTask[] {
  if (all.length === 0) return [];
  // 简易可复现随机（mulberry32 同款）
  let s = seed >>> 0;
  const rnd = function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const pool = all.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  const picked: QaTask[] = [];
  const usedCats = new Set<string>();
  for (const q of pool) {
    if (usedCats.has(q.category)) continue;
    picked.push(q);
    usedCats.add(q.category);
    if (picked.length === 2) break;
  }
  // 类别不足时放宽，补足到 2 题
  for (const q of pool) {
    if (picked.length >= 2) break;
    if (picked.indexOf(q) >= 0) continue;
    picked.push(q);
  }
  return picked.slice(0, 2);
}