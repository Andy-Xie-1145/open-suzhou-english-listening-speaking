/**
 * 朗读短文 —— 取题与近似评分（苏州中考题型专用）
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 这是**近似模拟**，不是官方评分。见 spec/suzhou-listening-speaking.spec.md。
 *
 * 为什么这一题型能立住：朗读是五种题型里唯一有标准原文的封闭题，
 * 因此「有没有读全」可以完全确定地判定，不需要模型，也不需要主观判断。
 * 评分结果可逐词追溯，学生看得懂每一分扣在哪里。
 *
 * 权重与阈值全部来自 spec-config.ts，各自注明了来源与不确定性。
 */

import { tokenize, normalizeWord, levenshtein } from '../rules/text/normalize.ts';
import {
  READING_WEIGHTS,
  FUZZY_TOLERANCE,
  PACE_RANGE,
  describeSource,
  type SourceInfo,
} from './spec-config.ts';
import { DIMENSION_LABELS } from './disclaimer.ts';
import { evaluateProsody, type ProsodyInput, type ProsodyResult } from './prosody.ts';

/* ------------------------------------------------------------------ *
 * 一、词级对齐
 * ------------------------------------------------------------------ */

export type WordVerdict = 'exact' | 'fuzzy' | 'omitted';

export interface WordAlignment {
  /** 参考词（原形） */
  index: number;
  reference: string;
  /** 考生实际说出/说成的词；漏读时为 null */
  spoken: string | null;
  verdict: WordVerdict;
}

export interface AlignmentResult {
  words: WordAlignment[];
  total: number;
  /** 精确命中 */
  exact: number;
  /** 容错命中：读到了但拼写有偏差 */
  fuzzy: number;
  /** 漏读 */
  omitted: number;
  /** 多说的词 */
  insertions: string[];
}

export function toleranceFor(word: string): number {
  return word.length <= FUZZY_TOLERANCE.shortWordMax
    ? FUZZY_TOLERANCE.shortTol
    : FUZZY_TOLERANCE.longTol;
}

export function alignWords(reference: string, spoken: string): AlignmentResult {
  const ref = tokenize(reference);
  const hyp = tokenize(spoken).map(normalizeWord);

  const words: WordAlignment[] = [];
  const used = new Set<number>();
  let exact = 0, fuzzy = 0, omitted = 0;
  let cursor = 0;

  for (let i = 0; i < ref.length; i++) {
    const r = normalizeWord(ref[i]);
    const tol = toleranceFor(r);
    let best = -1;
    let bestDist = Infinity;

    for (let k = cursor; k < hyp.length; k++) {
      if (used.has(k)) continue;
      const h = hyp[k];
      if (h === r) { best = k; bestDist = 0; break; }
      if (Math.abs(h.length - r.length) > tol) continue;
      const d = levenshtein(h, r);
      if (d <= tol && d < bestDist) { best = k; bestDist = d; }
    }

    if (best >= 0 && bestDist === 0) {
      used.add(best);
      words.push({ index: i, reference: ref[i], spoken: hyp[best], verdict: 'exact' });
      exact++;
      cursor = best + 1;
    } else if (best >= 0) {
      used.add(best);
      words.push({ index: i, reference: ref[i], spoken: hyp[best], verdict: 'fuzzy' });
      fuzzy++;
      cursor = best + 1;
    } else {
      words.push({ index: i, reference: ref[i], spoken: null, verdict: 'omitted' });
      omitted++;
    }
  }

  const insertions: string[] = [];
  for (let k = 0; k < hyp.length; k++) {
    if (!used.has(k)) insertions.push(hyp[k]);
  }

  return { words: words, total: ref.length, exact: exact, fuzzy: fuzzy, omitted: omitted, insertions: insertions };
}
/* ------------------------------------------------------------------ *
 * 二、近似评分
 * ------------------------------------------------------------------ */

export interface ReadingTask {
  id: string;
  /** 教材位置，如「七上 U2 Reading」 */
  textbook: string;
  book: string;
  title: string;
  text: string;
  wordCount: number;
  difficulty: number;
  /** 材料位置来源：官方公布 vs 本项目推定 */
  source: SourceInfo;
}

export interface DimensionResult {
  key: 'completeness' | 'accuracy' | 'fluency' | 'prosody';
  label: string;
  /** 0-1 */
  value: number;
  weight: number;
  /** 该维度贡献的加权分（0-100 标度） */
  weighted: number;
  /** 面向学生的说明 */
  note: string;
}

export interface ReadingFeedback {
  /** 用哪条信息解释扣分 */
  type: 'omission' | 'mispronounce' | 'insertion' | 'pace' | 'ok';
  message: string;
  /** 涉及的词 */
  words: string[];
}

export interface ReadingApproxResult {
  /** ⚠️ 近似分，不是考场得分。0-100。 */
  approximateScore: number;
  dimensions: DimensionResult[];
  alignment: AlignmentResult;
  feedback: ReadingFeedback[];
  /** 实测语速（词/秒），未提供时长时为 null */
  pace: number | null;
}

export interface ScoreInput {
  reference: string;
  /** 转写文本（来自 ASR 或学生手动输入） */
  spoken: string;
  /** 作答时长（毫秒） */
  durationMs?: number;
  /**
   * 韵律性所需的音频特征。不提供时该维度退化为中性分 0.5（不奖不罚）。
   * 由调用方（引擎层）从 PCM 计算后传入。
   */
  prosody?: ProsodyInput;
}

function pct(x: number): string {
  return Math.round(x * 100) + '%';
}

/**
 * 朗读短文近似评分。
 *
 * ⚠️ 返回的 approximateScore 是本项目的近似规则计算结果，
 * **不是**苏州市中考听力口语考试的评分，两者无实现层面的关系。
 */
export function scoreReading(input: ScoreInput): ReadingApproxResult {
  const alignment = alignWords(input.reference, input.spoken);
  const total = alignment.total;

  // ---- 完整度：参考词被说出的比例 ----
  // 精确命中与容错命中都算「读到了」，漏读不计入
  const completeness = total > 0 ? (alignment.exact + alignment.fuzzy) / total : 0;

  // ---- 准确度：拼写完全一致的词占参考词总数的比例 ----
  // 容错命中计入完整度但不计入准确度——对应「读到了但读得不准」
  const accuracy = total > 0 ? alignment.exact / total : 0;

  // ---- 流利度：语速是否落在合理区间 ----
  let pace: number | null = null;
  let fluency = 1;
  if (input.durationMs && input.durationMs > 0 && total > 0) {
    pace = total / (input.durationMs / 1000);
    if (pace < PACE_RANGE.slow || pace > PACE_RANGE.fast) {
      fluency = PACE_RANGE.penaltyFactor;
    }
  }

  // ---- 加权合成 ----
  // ---- 韵律性 ----
  // 有音频特征就真算，没有就退化为中性分。
  const prosodyResult: ProsodyResult = input.prosody
    ? evaluateProsody(input.prosody)
    : {
        score: 0.5,
        stress: { stressed: [], stressRatio: 0, placementScore: 0.5, functionWordStressed: 0 },
        phrasing: { boundaryHit: [], boundaryRate: 0, missingBreak: 0, falseBreak: 0, score: 0.5 },
        intonation: { voicedRatio: 0, finalSlope: 0, expressiveRatio: 0, score: 0.5 },
        notes: [],
      };


  const dims: DimensionResult[] = [
    {
      key: 'completeness',
      label: DIMENSION_LABELS.completeness,
      value: completeness,
      weight: READING_WEIGHTS.completeness,
      weighted: completeness * READING_WEIGHTS.completeness * 100,
      note: alignment.omitted > 0
        ? '漏读 ' + alignment.omitted + ' 个词（占 ' + pct(total > 0 ? alignment.omitted / total : 0) + '）'
        : '全部读全',
    },
    {
      key: 'accuracy',
      label: DIMENSION_LABELS.accuracy,
      value: accuracy,
      weight: READING_WEIGHTS.accuracy,
      weighted: accuracy * READING_WEIGHTS.accuracy * 100,
      note: alignment.fuzzy > 0
        ? alignment.fuzzy + ' 个词读法有偏差'
        : '未发现拼写偏差的词',
    },
    {
      key: 'fluency',
      label: DIMENSION_LABELS.fluency,
      value: fluency,
      weight: READING_WEIGHTS.fluency,
      weighted: fluency * READING_WEIGHTS.fluency * 100,
      note: pace === null
        ? '未记录时长，无法评估语速'
        : (pace >= PACE_RANGE.slow && pace <= PACE_RANGE.fast)
          ? '语速 ' + pace.toFixed(2) + ' 词/秒，在合理区间'
          : '语速 ' + pace.toFixed(2) + ' 词/秒，超出 ' + PACE_RANGE.slow + '–' + PACE_RANGE.fast + ' 区间',
    },
    {
      key: 'prosody',
      label: DIMENSION_LABELS.prosody,
      value: prosodyResult.score,
      weight: READING_WEIGHTS.prosody,
      weighted: prosodyResult.score * READING_WEIGHTS.prosody * 100,
      note: input.prosody
        ? ('重读位置 ' + Math.round(prosodyResult.stress.placementScore * 100)
           + '%、断句 ' + Math.round(prosodyResult.phrasing.score * 100)
           + '%、语调 ' + Math.round(prosodyResult.intonation.score * 100) + '%')
        : '未提供音频特征，按中性分计',
    },
  ];

  const raw = dims.reduce(function (a, d) { return a + d.value * d.weight; }, 0);
  const approximateScore = Math.round(raw * 100);

  // ---- 逐条反馈 ----
  const feedback: ReadingFeedback[] = [];
  const omittedWords = alignment.words
    .filter(function (x) { return x.verdict === 'omitted'; })
    .map(function (x) { return x.reference; });
  const fuzzyWords = alignment.words
    .filter(function (x) { return x.verdict === 'fuzzy'; })
    .map(function (x) { return x.reference; });

  if (omittedWords.length > 0) {
    feedback.push({
      type: 'omission',
      message: '漏读 ' + omittedWords.length + ' 个词。完整度占本近似规则的 ' + pct(READING_WEIGHTS.completeness) + '，漏读是最大的失分来源。',
      words: omittedWords,
    });
  }
  if (fuzzyWords.length > 0) {
    feedback.push({
      type: 'mispronounce',
      message: '有 ' + fuzzyWords.length + ' 个词读法与原文有偏差。注意：本工具只看转写拼写，「把 th 读成 s」这类音素错误检测不到。',
      words: fuzzyWords,
    });
  }
  if (alignment.insertions.length > 0) {
    feedback.push({
      type: 'insertion',
      message: '多说了 ' + alignment.insertions.length + ' 个原文没有的词。照原文朗读时不要自行添加。',
      words: alignment.insertions,
    });
  }
  if (pace !== null && fluency < 1) {
    feedback.push({
      type: 'pace',
      message: pace > PACE_RANGE.fast
        ? '语速偏快。注意咬字，不要为了赶时间漏读。'
        : '语速偏慢。停顿可能是思考，但如果卡在同一个词上会影响完整度。',
      words: [],
    });
  }
  if (feedback.length === 0) {
    feedback.push({
      type: 'ok',
      message: '未发现问题。注意本工具不评估语调与韵律，仍需人工判断。',
      words: [],
    });
  }

  return {
    approximateScore: approximateScore,
    dimensions: dims,
    alignment: alignment,
    feedback: feedback,
    pace: pace,
  };
}

/* ------------------------------------------------------------------ *
 * 三、从语料构造任务
 * ------------------------------------------------------------------ */

export interface RawReading {
  id: string;
  textbook: string;
  book: string;
  title: string;
  text: string;
  wordCount: number;
  difficulty: number;
  positionSource: string;
}

export function toReadingTask(raw: RawReading): ReadingTask {
  return {
    id: raw.id,
    textbook: raw.textbook,
    book: raw.book,
    title: raw.title,
    text: raw.text,
    wordCount: raw.wordCount,
    difficulty: raw.difficulty,
    source: describeSource(raw.positionSource),
  };
}