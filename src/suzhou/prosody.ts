/**
 * 韵律性评估 —— 朗读短文的三个子维度
 *
 * 许可：AGPL-3.0-only
 *
 * ## 官方口径
 *
 * 2019 年《江苏省初中英语听力口语自动化考试纲要》原文对朗读短文的考察点：
 * 「语音语调、句子重音、连读、不完全爆破、合理断句」
 * 机评四维中的第四维「韵律性」对应：意群停顿、重读弱读、语气语调。
 *
 * ## 本模块做到了什么、没做到什么
 *
 * **重读音节检测**：可做，且**不需要参考录音**。
 *   依据是英语的突重节奏（stress-timed）——重读音节在时长和能量上都显著突出。
 *   音素级对齐已给出每音素时间戳，聚合到音节后比对即可。
 *
 * **重读弱读**：可做。同上，功能词（the/a/of/to）重读即为错误。
 *
 * **意群停顿**：可做，不需要参考录音。
 *   停顿**位置**是信号，停顿**时长**是噪声——长停顿不等于分句。
 *
 * **语气语调**：**只做启发式，不做母语者对比**。
 *   句末基频的升降方向可以判定陈述/疑问，但拿不到母语者参照，
 *   因此只能给「句末是否有明显语调变化」这类粗指标。
 *
 * ⚠️ **即便如此，得到的也只是与母语者朗读习惯的相似度，不是官方韵律性分。**
 * 见 spec 第 5.1 节：本工具无法复刻官方评分引擎。
 */
/* ------------------------------------------------------------------ *
 * 一、音节聚合与重音检测
 * ------------------------------------------------------------------ */

export interface Syllable {
  /** 音节在音频中的时间范围 */
  startMs: number;
  endMs: number;
  /** 该音节对应的参考词 */
  word: string;
  /** 平均时长（毫秒） */
  durationMs: number;
  /** 平均能量 0..1 */
  energy: number;
  /** 音高轨迹的均值 Hz；无浊音时 0 */
  meanHz: number;
}

export interface StressResult {
  /** 每音节是否判为重读 */
  stressed: boolean[];
  /** 重读比例 0..1 */
  stressRatio: number;
  /** 重读是否落在该重的地方 */
  /** 位置准确度 0..1（对参考重音表而言） */
  placementScore: number;
  /** 功能词被误重读的次数 */
  functionWordStressed: number;
}

/** 英语常见功能词：这些词永远不该重读 */
export const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for',
  'from', 'by', 'with', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'am',
  'do', 'does', 'did', 'have', 'has', 'had', 'can', 'could', 'will', 'would',
  'shall', 'should', 'may', 'might', 'must', 'that', 'this', 'these', 'those',
  'it', 'he', 'she', 'they', 'we', 'you', 'i', 'my', 'your', 'his', 'her',
  'their', 'our', 'its', 'not', 'no', 'so', 'if', 'than', 'then', 'there',
  'up', 'out', 'about', 'into', 'over', 'after', 'before', 'when', 'while',
  'which', 'who', 'what', 'where', 'how', 'all', 'some', 'any', 'each', 'every',
].map(function (w) { return w; }));
/**
 * 判断哪些音节被判为重读。
 *
 * 三个信号取或（任一显著即认为重读），阈值是可调的常数：
 *  1. 时长 —— 重读音节通常长于同句中位数 1.35 倍
 *  2. 能量 —— 重读音节能量高于同句中位数 1.25 倍
 *  3. 音高 —— 重读音节基频更高（英语重音伴随 F0 抬升）
 *
 * 只用同句内做相对比较，不跟外部参考比——这正是不需要参考录音的原因。
 */
export function detectStress(sylls: Syllable[]): StressResult {
  const n = sylls.length;
  const empty: StressResult = {
    stressed: [], stressRatio: 0, placementScore: 0, functionWordStressed: 0,
  };
  if (n === 0) return empty;

  const durs = sylls.map(function (x) { return x.durationMs; });
  const es = sylls.map(function (x) { return x.energy; });
  const medDur = median(durs);
  const medE = median(es);
  const voiced = sylls.filter(function (x) { return x.meanHz > 0; }).map(function (x) { return x.meanHz; });
  const medHz = voiced.length > 0 ? median(voiced) : 0;

  // 离散度：这段朗读到底有没有轻重区分
  const cvDur = coefficientOfVariation(durs);
  const cvE = coefficientOfVariation(es);
  // 三个维度都很平 => 没有重音起伏，把每个音节都算重读，
  // 等价于「全文平读」，会让重读比例高、位置分低，符合真实诊断
  const flat = cvDur < 0.18 && cvE < 0.22;

  const stressed = sylls.map(function (x) {
    if (flat) return true;
    const byDur = medDur > 0 && x.durationMs > medDur * 1.35;
    const byE = medE > 0 && x.energy > medE * 1.25;
    const byHz = medHz > 0 && x.meanHz > medHz * 1.10;
    return byDur || byE || byHz;
  });

  const count = stressed.filter(Boolean).length;
  const stressRatio = count / n;

  let functionWordStressed = 0;
  for (let i = 0; i < n; i++) {
    if (stressed[i] && FUNCTION_WORDS.has(sylls[i].word.toLowerCase())) {
      functionWordStressed++;
    }
  }

  const placementScore = estimatePlacement(stressRatio, functionWordStressed, n);

  return {
    stressed: stressed,
    stressRatio: stressRatio,
    placementScore: placementScore,
    functionWordStressed: functionWordStressed,
  };
}
/**
 * 重读位置质量。
 *
 * 没有母语者参照，只能用两条可解释的代理指标：
 *  1. **重读比例** —— 英语实词重读约占音节数 30–45%.
 *   全部重读（>70%）是「每个字都使劲」，全部不重读（<10%）是「平读」，都扣分。
 *  2. **功能词误重读** —— the/a/of 被重读是最典型的中式英语特征，直接扣。
 */
function estimatePlacement(stressRatio: number, functionWordStressed: number, total: number): number {
  if (total === 0) return 0;
  const IDEAL_LOW = 0.30;
  const IDEAL_HIGH = 0.45;
  let ratioScore: number;
  if (stressRatio >= IDEAL_LOW && stressRatio <= IDEAL_HIGH) {
    ratioScore = 1;
  } else if (stressRatio < IDEAL_LOW) {
    ratioScore = Math.max(0, 1 - (IDEAL_LOW - stressRatio) / IDEAL_LOW);
  } else {
    ratioScore = Math.max(0, 1 - (stressRatio - IDEAL_HIGH) / (1 - IDEAL_HIGH));
  }
  // 每个功能词误重读扣 15%，最多扣到 0
  const funcPenalty = Math.min(1, (functionWordStressed * 0.15));
  return Math.max(0, Math.min(1, ratioScore * (1 - funcPenalty)));
}

/** 变异系数 CV = 标准差 / 均值，衡量离散程度 */
function coefficientOfVariation(xs: number[]): number {
  const m = mean(xs);
  if (m <= 0) return 0;
  let acc = 0;
  for (const x of xs) acc += (x - m) * (x - m);
  return Math.sqrt(acc / xs.length) / m;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const a = xs.slice().sort(function (p, q) { return p - q; });
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}
/* ------------------------------------------------------------------ *
 * 二、意群停顿
 * ------------------------------------------------------------------ */

export interface PauseLike {
  startMs: number;
  endMs: number;
  durationMs: number;
}

export interface PhrasingResult {
  /** 是否在句读边界处有停顿 */
  boundaryHit: boolean[];
  /** 句读边界命中率 0..1 */
  boundaryRate: number;
  /** 该在断的地方没断的次数 */
  missingBreak: number;
  /** 不该断却断了的次数（误切） */
  falseBreak: number;
  /** 分项质量 0..1 */
  score: number;
}

export interface Boundary {
  /** 边界应落在音频的哪个时刻 */
  atMs: number;
  /** 该边界处允许的停顿窗口（毫秒） */
  toleranceMs: number;
}

/**
 * 意群停顿评估。
 *
 * 关键判断：**停顿位置是信号，停顿时长是噪声**。
 * 学生朗读时的犹豫常表现为「该停的地方停了 1.5 秒」——
 * 只看时长会误判成节奏问题，看位置才是断句问题。
 */
export function evaluatePhrasing(pauses: PauseLike[], boundaries: Boundary[]): PhrasingResult {
  const b = boundaries.length;
  const p = pauses.length;
  if (b === 0) {
    return {
      boundaryHit: [],
      boundaryRate: 0,
      missingBreak: 0,
      falseBreak: 0,
      // 无参考边界时给中性分，不奖不罚
      score: 0.5,
    };
  }
  const boundaryHit = boundaries.map(function (bd) {
    const tol = bd.toleranceMs > 0 ? bd.toleranceMs : 600;
    return pauses.some(function (pause) {
      const mid = pause.startMs + pause.durationMs / 2;
      return Math.abs(mid - bd.atMs) <= tol;
    });
  });

  const hitCount = boundaryHit.filter(Boolean).length;
  const boundaryRate = hitCount / b;
  const missingBreak = b - hitCount;

  // 误切：落在所有边界窗口之外的停顿
  let falseBreak = 0;
  for (const pause of pauses) {
    const mid = pause.startMs + pause.durationMs / 2;
    const nearAny = boundaries.some(function (bd) {
      const tol = bd.toleranceMs > 0 ? bd.toleranceMs : 600;
      return Math.abs(mid - bd.atMs) <= tol;
    });
    if (!nearAny) falseBreak++;
  }

  // 分项：命中率是主项，误切小幅扣分
  let score = boundaryRate;
  if (b > 0) {
    score -= Math.min(0.25, (falseBreak / b) * 0.5);
  }
  score = Math.max(0, Math.min(1, score));

  return {
    boundaryHit: boundaryHit,
    boundaryRate: boundaryRate,
    missingBreak: missingBreak,
    falseBreak: falseBreak,
    score: score,
  };
}
/* ------------------------------------------------------------------ *
 * 三、语调（仅启发式，不做母语者对比）
 * ------------------------------------------------------------------ */

export interface PitchFrameLike {
  tMs: number;
  hz: number;
  voiced: boolean;
}

export interface IntonationResult {
  /** 有浊音的句子比例 0..1 */
  voicedRatio: number;
  /** 句末基频走向：>0 升调，<0 降调，约 0 平直 */
  finalSlope: number;
  /** 有语调变化的句子比例 0..1 —— 平读则低 */
  expressiveRatio: number;
  /** 分项质量 0..1 */
  score: number;
}

/**
 * 语调评估。
 *
 * 只判三件不需要母语者参照也能判的事：
 *  1. 有没有真的在发声（voicedRatio）
 *  2. 句末基频是升是降（finalSlope）
 *  3. 有没有句与句之间的语调变化（expressiveRatio）
 *
 * **明确做不到**：判断这个语调「像不像母语者」。那需要真人朗读参照。
 * 本项得分只能理解为「有没有语调意识」，不是「语调是否地道」。
 */
export function evaluateIntonation(frames: PitchFrameLike[]): IntonationResult {
  const voiced = frames.filter(function (f) { return f.voiced && f.hz > 0; });
  if (voiced.length < 4) {
    return { voicedRatio: voiced.length / Math.max(1, frames.length), finalSlope: 0, expressiveRatio: 0, score: 0.25 };
  }

  const voicedRatio = voiced.length / Math.max(1, frames.length);

  // 句末走向：取最后 1/3 与其前 1/3 的均值差
  const third = Math.max(2, Math.floor(voiced.length / 3));
  const lastSlice = voiced.slice(-third);
  const priorSlice = voiced.slice(-third * 2, -third);
  const lastMean = mean(lastSlice.map(function (f) { return f.hz; }));
  const priorMean = mean(priorSlice.map(function (f) { return f.hz; }));
  const finalSlope = priorMean > 0 ? (lastMean - priorMean) / priorMean : 0;
  // 按静音切句（间隔 >250ms 视为句界），看每句末走向是否一致
  const sentences: number[][] = [];
  let cur: number[] = [];
  let prevT = voiced[0].tMs;
  for (const f of voiced) {
    if (f.tMs - prevT > 250 && cur.length > 0) { sentences.push(cur); cur = []; }
    cur.push(f.hz);
    prevT = f.tMs;
  }
  if (cur.length > 0) sentences.push(cur);

  let expressive = 0;
  for (let i = 1; i < sentences.length; i++) {
    const a = mean(sentences[i - 1]);
    const b = mean(sentences[i]);
    if (a > 0 && Math.abs(b - a) / a > 0.06) expressive++;
  }
  const expressiveRatio = sentences.length > 1 ? expressive / (sentences.length - 1) : 0;

  // 评分：发声充分度 40% + 句末非平直 30% + 句间有变化 30%
  const voicedScore = Math.min(1, voicedRatio / 0.7);
  const slopeScore = Math.min(1, Math.abs(finalSlope) / 0.12);
  const expressiveScore = Math.min(1, expressiveRatio / 0.5);
  const score = Math.max(0, Math.min(1, voicedScore * 0.4 + slopeScore * 0.3 + expressiveScore * 0.3));

  return {
    voicedRatio: voicedRatio,
    finalSlope: finalSlope,
    expressiveRatio: expressiveRatio,
    score: score,
  };
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let s = 0;
  for (const x of xs) s += x;
  return s / xs.length;
}

/* ------------------------------------------------------------------ *
 * 四、汇总
 * ------------------------------------------------------------------ */

export interface ProsodyInput {
  syllables: Syllable[];
  pauses: PauseLike[];
  boundaries: Boundary[];
  pitchFrames: PitchFrameLike[];
}

export interface ProsodyResult {
  /** 韵律性总质量 0..1（三个子项加权） */
  score: number;
  /** 重读位置 */
  stress: StressResult;
  /** 意群停顿 */
  phrasing: PhrasingResult;
  /** 语调（启发式） */
  intonation: IntonationResult;
  /** 给学生看的说明 */
  notes: string[];
}

/**
 * 韵律性总评。
 *
 * 子项权重：重读位置 40% / 意群停顿 40% / 语调 20%。
 * 语调只做启发式，权重压低，避免把「无法判定」当成「表现好」。
 *
 * ⚠️ 本项衡量的是**与母语者朗读习惯的相似度**，不是官方韵律性分。
 * 拿不到母语者参照，语调和重音位置都只能用可解释的代理指标。
 */
export function evaluateProsody(input: ProsodyInput): ProsodyResult {
  const stress = detectStress(input.syllables);
  const phrasing = evaluatePhrasing(input.pauses, input.boundaries);
  const intonation = evaluateIntonation(input.pitchFrames);

  const score = Math.max(0, Math.min(1,
    stress.placementScore * 0.40 + phrasing.score * 0.40 + intonation.score * 0.20));
  const notes: string[] = [];
  if (stress.functionWordStressed > 0) {
    notes.push('有 ' + stress.functionWordStressed + ' 个功能词（the / a / of 等）被重读了——这些词在英语里永远不该重读。');
  }
  if (input.boundaries.length > 0) {
    if (phrasing.missingBreak > 0) {
      notes.push('有 ' + phrasing.missingBreak + ' 处该断句的地方没有停顿，整句一口气读完会显得急促。');
    }
    if (phrasing.falseBreak > 0) {
      notes.push('有 ' + phrasing.falseBreak + ' 处停顿位置不在意群边界上，会把句子切碎。');
    }
  }
  if (intonation.score < 0.4) {
    notes.push('语调偏平，句末升降不明显。朗读时试试让疑问句上扬、陈述句收尾。');
  }
  if (notes.length === 0) {
    notes.push('重读、停顿、语调三项未见明显问题。注意本项无法与母语者朗读逐一对照。');
  }

  return {
    score: score,
    stress: stress,
    phrasing: phrasing,
    intonation: intonation,
    notes: notes,
  };
}
