/**
 * 口语作答 —— 考试中只录音，交卷后一次性转写评分
 *
 * 许可：AGPL-3.0-only
 *
 * ## 为什么这样改
 *
 * 原来每答完一题就当场转写 + 评分。问题有两个：
 *
 *  1. **卡顿落在考试时间里。** 首次转写要加载模型，题库里的音素模型更是 303 MB。
 *     学生正答着题，页面突然不动 —— 这是最不能接受的失败模式。
 *  2. **转写结果会倒逼学生改答案。** 当场看到转写文本才发现读错，
 *     就还有机会重录一次，这不是真实考场。
 *
 * 改成：考试中**只录音**，音频留在内存里；交卷后一次性转写 + 评分。
 * 于是答题路径上的依赖只剩麦克风，模型和网络全部不在考试时间里。
 *
 * 这也更接近真实考场：考生答完最后一句是坐着等交卷，不是当场出分。
 *
 * ## 降级不变
 *
 * 转写失败（没 key、模型没加载、音频坏了）仍然落回手动输入，
 * 评估结果与录音路径完全相同。
 */

export type SpeakingKind = 'reading' | 'qa' | 'topic';

export const SPEAKING_KINDS: SpeakingKind[] = ['reading', 'qa', 'topic'];

export type SpeakPhase =
  | 'idle'        // 未开始
  | 'recording'   // 录音中
  | 'recorded'    // 录音已存，待交卷后处理
  | 'transcribing'// 交卷后转写中
  | 'manual'      // 转写不可用，退化为手动输入
  | 'scored'      // 已出分
  | 'error';

export interface RecordedClip {
  samples: Float32Array;
  sampleRate: number;
  durationMs: number;
}

export interface SpeakingSession {
  phase: Record<SpeakingKind, SpeakPhase>;
  /** 考试中录到的原始音频。只在内存，用完即弃，不上传、不落盘 */
  clips: Partial<Record<SpeakingKind, RecordedClip>>;
  /** 手写内容（手动路径或转写后回填） */
  text: Record<SpeakingKind, string>;
  /** 近似分；未评分为 null */
  score: Record<SpeakingKind, number | null>;
  /** 每题的转写/评分失败原因，供界面说明为什么这题没分 */
  errors: Partial<Record<SpeakingKind, string>>;
}

export function emptyPhase(): Record<SpeakingKind, SpeakPhase> {
  return { reading: 'idle', qa: 'idle', topic: 'idle' };
}

export function initialSpeaking(): SpeakingSession {
  return {
    phase: emptyPhase(),
    clips: {},
    text: { reading: '', qa: '', topic: '' },
    score: { reading: null, qa: null, topic: null },
    errors: {},
  };
}

export function startRecording(s: SpeakingSession, kind: SpeakingKind): SpeakingSession {
  return { ...s, phase: { ...s.phase, [kind]: 'recording' }, errors: omit(s.errors, kind) };
}

export function cancelRecording(s: SpeakingSession, kind: SpeakingKind): SpeakingSession {
  return { ...s, phase: { ...s.phase, [kind]: s.clips[kind] ? 'recorded' : 'idle' } };
}

/**
 * 存下录音。**不转写、不评分** —— 这是本次改动的核心。
 * 只要音频是空的就不算数，静默丢弃比存一个空 clip 更好。
 */
export function putClip(s: SpeakingSession, kind: SpeakingKind, clip: RecordedClip): SpeakingSession {
  if (!clip || !clip.samples || clip.samples.length === 0) {
    return { ...s, phase: { ...s.phase, [kind]: s.clips[kind] ? 'recorded' : 'idle' } };
  }
  return {
    ...s,
    phase: { ...s.phase, [kind]: 'recorded' },
    clips: { ...s.clips, [kind]: clip },
    errors: omit(s.errors, kind),
  };
}

/** 学生手写内容。手动路径，或者转写后回填 */
export function setText(s: SpeakingSession, kind: SpeakingKind, text: string): SpeakingSession {
  return { ...s, text: { ...s.text, [kind]: text } };
}

export function setScore(s: SpeakingSession, kind: SpeakingKind, score: number | null): SpeakingSession {
  return {
    ...s,
    score: { ...s.score, [kind]: score },
    phase: { ...s.phase, [kind]: score === null ? 'manual' : 'scored' },
  };
}

export function fail(s: SpeakingSession, kind: SpeakingKind, reason: string): SpeakingSession {
  return {
    ...s,
    errors: { ...s.errors, [kind]: reason },
    phase: { ...s.phase, [kind]: 'manual' },
  };
}

/** 交卷后需要处理的题：有录音但还没出分 */
export function pendingKinds(s: SpeakingSession): SpeakingKind[] {
  return SPEAKING_KINDS.filter(function (k) {
    return !!s.clips[k] && s.score[k] === null && s.phase[k] !== 'manual';
  });
}

/** 全部处理完毕（没有待转写的，也没有卡住的） */
export function allDone(s: SpeakingSession): boolean {
  return pendingKinds(s).length === 0;
}

export function answeredKinds(s: SpeakingSession): SpeakingKind[] {
  return SPEAKING_KINDS.filter(function (k) { return !!s.clips[k] || s.text[k].trim().length > 0; });
}

export function unansweredKinds(s: SpeakingSession): SpeakingKind[] {
  return SPEAKING_KINDS.filter(function (k) { return !s.clips[k] && s.text[k].trim().length === 0; });
}

/** 内存占用粗估（字节），用于界面提示与自检 */
export function memoryBytes(s: SpeakingSession): number {
  let n = 0;
  for (const k of SPEAKING_KINDS) {
    const c = s.clips[k];
    if (c) n += c.samples.length * 4;
  }
  return n;
}

/* ------------------------------------------------------------------ *
 * 交卷后处理
 * ------------------------------------------------------------------ */

export interface ProcessDeps {
  /** 传入 Float32Array，返回转写文本；抛错表示不可用 */
  transcribe: (samples: Float32Array, sampleRate: number) => Promise<string>;
  /** 按题型评分；返回 null 表示无法评分 */
  score: (kind: SpeakingKind, text: string, durationMs: number) => number | null;
  onProgress?: (kind: SpeakingKind, done: number, total: number) => void;
}

/**
 * 一次性把待处理的题转写并评分。
 *
 * 单题失败不阻断其余 —— 一题转写不了就退回手动输入，其余照常给分。
 * 音频处理完立刻从内存里释放，录音本来就不该留。
 */
export async function processAll(
  s: SpeakingSession,
  deps: ProcessDeps,
): Promise<SpeakingSession> {
  const todo = pendingKinds(s);
  let cur = s;
  for (let i = 0; i < todo.length; i++) {
    const kind = todo[i];
    const clip = cur.clips[kind];
    if (!clip) continue;
    cur = { ...cur, phase: { ...cur.phase, [kind]: 'transcribing' } };
    if (deps.onProgress) deps.onProgress(kind, i, todo.length);

    let text = '';
    try {
      text = await deps.transcribe(clip.samples, clip.sampleRate);
    } catch (e) {
      cur = fail(cur, kind, '转写失败：' + (e instanceof Error ? e.message : String(e)));
      cur = releaseClip(cur, kind);
      continue;
    }

    text = (text ?? '').trim();
    if (!text) {
      cur = fail(cur, kind, '没有识别到内容，可手动补录或手写。');
      cur = releaseClip(cur, kind);
      continue;
    }

    cur = setText(cur, kind, text);
    let score: number | null = null;
    try {
      score = deps.score(kind, text, clip.durationMs);
    } catch (e) {
      cur = fail(cur, kind, '评分失败：' + (e instanceof Error ? e.message : String(e)));
      cur = releaseClip(cur, kind);
      continue;
    }
    cur = setScore(cur, kind, score);
    cur = releaseClip(cur, kind);
  }
  return cur;
}

/** 释放该题的音频。录音只在内存流转，转写完立即丢弃 */
export function releaseClip(s: SpeakingSession, kind: SpeakingKind): SpeakingSession {
  const clips = { ...s.clips };
  delete clips[kind];
  return { ...s, clips: clips };
}

/** 全部释放，交卷结算完毕后调用 */
export function releaseAllClips(s: SpeakingSession): SpeakingSession {
  return { ...s, clips: {} };
}

/* ------------------------------------------------------------------ *
 * 汇总
 * ------------------------------------------------------------------ */

export interface SpeakingSummary {
  /** 已得近似分之和 */
  total: number;
  perKind: Record<SpeakingKind, number | null>;
  answered: SpeakingKind[];
  unanswered: SpeakingKind[];
  /** 需要学生补的题（转写失败） */
  needsManual: SpeakingKind[];
  /** 录音占用内存（字节） */
  memoryBytes: number;
}

export function summarize(s: SpeakingSession): SpeakingSummary {
  const perKind: Record<SpeakingKind, number | null> = {
    reading: s.score.reading,
    qa: s.score.qa,
    topic: s.score.topic,
  };
  let total = 0;
  for (const k of SPEAKING_KINDS) {
    const v = s.score[k];
    if (typeof v === 'number' && Number.isFinite(v)) total += v;
  }
  return {
    total: Math.round(total * 10) / 10,
    perKind: perKind,
    answered: answeredKinds(s),
    unanswered: unansweredKinds(s),
    needsManual: SPEAKING_KINDS.filter(function (k) { return s.phase[k] === 'manual'; }),
    memoryBytes: memoryBytes(s),
  };
}

function omit<T extends object>(o: T, k: string): T {
  if (!(k in o)) return o;
  const out = { ...o } as Record<string, unknown>;
  delete out[k];
  return out as T;
}
