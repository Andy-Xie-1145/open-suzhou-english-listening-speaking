/**
 * 听力作答会话 —— 纯逻辑状态机，不碰 DOM、不碰浏览器 API
 *
 * 许可：AGPL-3.0-only
 *
 * ## 流程（每组材料重复）
 *
 *     听前浏览 → 播放第 1 遍 → 间隔 → 播放第 2 遍 → 作答 → 下一组
 *
 * 播放 2 遍、听前浏览 5 秒，都是**未经证实的格式假设**，见 listening-spec.ts 文件头。
 * 常量集中在下方，改格式只改这里。
 *
 * ## 为什么音频必须先下完
 *
 * 开考前把本卷要用到的音频全部 fetch 成 Blob，考试中只剩播放。
 * 中途网络抖动不会让某一段材料卡住不响 —— 那正是考生最不能接受的失败模式。
 *
 * ## 时钟是注入的
 *
 * 本模块没有 `Date.now()`、没有 `setTimeout`。时间由调用方以「本阶段已过毫秒」
 * 传进来，所以整条流程在 Node 里可以逐步驱动、逐步断言。
 */

import type { ListeningQuestion, ListeningMaterial } from './listening-bank.ts';
import type { PaperListening, PaperListeningGroup } from './paper.ts';
import { audioUrl, AUDIO_EXT } from './listening-audio.ts';

/* ------------------------------------------------------------------ *
 * 一、格式假设常量
 * ------------------------------------------------------------------ */

/** 听前浏览时长。格式未经证实 */
export const PREVIEW_MS = 5_000;

/** 两遍之间的停顿 */
export const PLAY_GAP_MS = 1_000;

/** 材料播几遍。格式未经证实 */
export const PLAY_TIMES = 2;

export const MAX_PREVIEW_MS = 20_000;
export const MAX_PLAYS = 3;
export const MIN_BUDGET_MS = 30_000;

/** 开考前浏览时长必须占本组预算的一定比例，否则 5 秒会把短材料挤掉 */
export function previewFor(step: ListeningStep): number {
  return Math.max(0, Math.min(MAX_PREVIEW_MS, Math.floor(step.budgetMs * 0.15)));
}

/* ------------------------------------------------------------------ *
 * 二、步骤
 * ------------------------------------------------------------------ */

export interface ListeningStep {
  index: number;
  /** 0 = 第一节，1 = 第二节 */
  section: 0 | 1;
  materialId: string;
  title: string;
  /** 构建期渲染的音频相对路径 */
  audioUrl: string;
  questions: ListeningQuestion[];
  budgetMs: number;
  /** 台词全文，仅用于考后复盘 */
  scriptText: string;
}

export function toStep(
  group: PaperListeningGroup,
  index: number,
  section: 0 | 1,
  ext: string,
): ListeningStep {
  return {
    index: index,
    section: section,
    materialId: group.material.id,
    title: group.material.title || group.material.id,
    audioUrl: audioUrl(group.material.id, ext),
    questions: group.questions.slice(),
    budgetMs: Math.max(MIN_BUDGET_MS, Math.round(group.budgetMs)),
    scriptText: group.material.script
      .map(function (u) { return u.text; })
      .join(' '),
  };
}

export function buildSteps(listening: PaperListening, ext = AUDIO_EXT): ListeningStep[] {
  const out: ListeningStep[] = [];
  listening.dialogue.forEach(function (g) {
    out.push(toStep(g, out.length, 0, ext));
  });
  listening.passage.forEach(function (g) {
    out.push(toStep(g, out.length, 1, ext));
  });
  return out;
}

/** 本卷需要预取的音频清单 */
export function audioUrlsOf(listening: PaperListening, ext = AUDIO_EXT): string[] {
  return buildSteps(listening, ext).map(function (s) { return s.audioUrl; });
}

/* ------------------------------------------------------------------ *
 * 三、状态机
 * ------------------------------------------------------------------ */

export type ListeningPhase =
  | 'idle'        // 还没进第 1 组
  | 'preview'     // 听前浏览
  | 'playing'     // 放音频
  | 'answering'   // 作答
  | 'done';       // 全部结束

export interface ListeningSession {
  steps: ListeningStep[];
  phase: ListeningPhase;
  /** 当前第几组 */
  cursor: number;
  /** 本组已播了几遍 */
  plays: number;
  /** 题号 → 选中的选项 label。未选则不在表里 */
  answers: Record<string, string>;
  /** 音频预取失败的 URL */
  audioErrors: string[];
}

export function initialSession(steps: readonly ListeningStep[]): ListeningSession {
  return {
    steps: steps.slice(),
    phase: steps.length === 0 ? 'done' : 'preview',
    cursor: 0,
    plays: 0,
    answers: {},
    audioErrors: [],
  };
}

export function currentStep(s: ListeningSession): ListeningStep | null {
  return s.cursor < s.steps.length ? s.steps[s.cursor] : null;
}

/** 本阶段要占多久 */
export function phaseDuration(s: ListeningSession, audioMs: number): number {
  if (s.phase === 'preview') {
    const step = currentStep(s);
    return step ? previewFor(step) : 0;
  }
  if (s.phase === 'playing') {
    if (audioMs <= 0) return 0;
    return PLAY_TIMES * audioMs + (PLAY_TIMES - 1) * PLAY_GAP_MS;
  }
  return 0;
}

/**
 * 推进状态。
 *
 * @param elapsedMs 本阶段已过毫秒
 * @param audioMs   本组音频时长；未知传 0，此时播放阶段不会自行结束
 * @param force     学生点了「下一段」。作答阶段据此提前进入下一组
 */
export function advance(
  s: ListeningSession,
  elapsedMs: number,
  audioMs = 0,
  force = false,
): ListeningSession {
  if (s.phase === 'done') return s;
  const step = currentStep(s);
  if (!step) return { ...s, phase: 'done' };

  if (s.phase === 'preview') {
    if (elapsedMs >= phaseDuration(s, audioMs)) {
      return { ...s, phase: 'playing', plays: 0 };
    }
    return s;
  }

  if (s.phase === 'playing') {
    // 音频时长未知时不自作主张，等播放结束事件或学生点「跳过播放」
    if (audioMs <= 0) return s;
    if (elapsedMs < phaseDuration(s, audioMs)) return s;
    return { ...s, phase: 'answering' };
  }

  // answering
  if (force || elapsedMs >= step.budgetMs) {
    if (s.cursor + 1 >= s.steps.length) {
      return { ...s, phase: 'done' };
    }
    return { ...s, phase: 'preview', cursor: s.cursor + 1, plays: 0 };
  }
  return s;
}

/**
 * 播放器的 `ended` 事件回调：记一次已播完，仅供 UI 显示「第几遍」。
 * 阶段推进只看时间，不看这个计数 —— 两者混用会出现「数字到了但音频没停」。
 */
export function markPlayFinished(s: ListeningSession): ListeningSession {
  return { ...s, plays: Math.min(PLAY_TIMES, s.plays + 1) };
}

/** 选一个选项。label 为空表示取消选择 */
export function chooseAnswer(
  s: ListeningSession,
  questionId: string,
  label: string,
): ListeningSession {
  const answers = { ...s.answers };
  if (label) answers[questionId] = label;
  else delete answers[questionId];
  return { ...s, answers: answers };
}

export function answeredOf(s: ListeningSession, step: ListeningStep): number {
  return step.questions.filter(function (q) { return !!s.answers[q.id]; }).length;
}

export function isStepComplete(s: ListeningSession, step: ListeningStep): boolean {
  return answeredOf(s, step) === step.questions.length;
}

/* ------------------------------------------------------------------ *
 * 四、结算
 * ------------------------------------------------------------------ */

export interface ListeningOutcome {
  /** 每个大题得分（官方各 10 分） */
  points: { dialogue: number; passage: number };
  correct: { dialogue: number; passage: number };
  total: { dialogue: number; passage: number };
  /** 未作答的题号 */
  unanswered: string[];
  /** 逐题明细，供复盘 */
  detail: Array<{
    questionId: string;
    materialId: string;
    section: 0 | 1;
    prompt: string;
    chosen: string;
    answer: string;
    ok: boolean;
    scriptText: string;
  }>;
}

function sectionPoints(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 10 * 10) / 10;
}

export function settle(s: ListeningSession): ListeningOutcome {
  const detail: ListeningOutcome['detail'] = [];
  const unanswered: string[] = [];
  const acc = {
    dialogue: { correct: 0, total: 0 },
    passage: { correct: 0, total: 0 },
  };

  for (const step of s.steps) {
    for (const q of step.questions) {
      const chosen = s.answers[q.id] ?? '';
      const ok = !!chosen && chosen === q.answer;
      const bucket = step.section === 0 ? acc.dialogue : acc.passage;
      bucket.total += 1;
      if (ok) bucket.correct += 1;
      if (!chosen) unanswered.push(q.id);
      detail.push({
        questionId: q.id,
        materialId: step.materialId,
        section: step.section,
        prompt: q.prompt,
        chosen: chosen,
        answer: q.answer,
        ok: ok,
        scriptText: step.scriptText,
      });
    }
  }

  return {
    points: {
      dialogue: sectionPoints(acc.dialogue.correct, acc.dialogue.total),
      passage: sectionPoints(acc.passage.correct, acc.passage.total),
    },
    correct: { dialogue: acc.dialogue.correct, passage: acc.passage.correct },
    total: { dialogue: acc.dialogue.total, passage: acc.passage.total },
    unanswered: unanswered,
    detail: detail,
  };
}

/** 听力合计得分，官方满分 20 */
export function totalPoints(o: ListeningOutcome): number {
  return Math.round((o.points.dialogue + o.points.passage) * 10) / 10;
}

/* ------------------------------------------------------------------ *
 * 五、音频预取
 * ------------------------------------------------------------------ */

export interface PrefetchProgress {
  done: number;
  total: number;
  bytes: number;
  failed: string[];
}

export type FetchLike = (url: string) => Promise<{ ok: boolean; status: number; blob(): Promise<BlobLike> }>;

export interface BlobLike {
  size: number;
  close?(): void;
}

/** 缓存键 → ObjectURL。ObjectURL 用完必须 revoke，否则整场都占着内存 */
export interface AudioCache {
  urlFor(audioUrl: string): string | null;
  releaseAll(): void;
}

/**
 * 开考前把本卷音频全部下完。
 *
 * 单个失败不阻断 —— 那一组到时候单独提示「音频加载失败，可重试」，
 * 总好过整段听力都放不出来。
 */
export async function prefetchAudio(
  urls: readonly string[],
  fetchImpl: FetchLike,
  onProgress?: (p: PrefetchProgress) => void,
  resolveUrl?: (u: string) => string,
): Promise<AudioCache> {
  const map = new Map<string, string>();
  let bytes = 0;
  const failed: string[] = [];

  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    let blob: BlobLike | null = null;
    try {
      const res = await fetchImpl(u);
      if (res.ok) blob = await res.blob();
    } catch {
      blob = null;
    }

    if (!blob) {
      // 下载本身失败 —— 这才是「音频不可用」
      failed.push(u);
    } else {
      bytes += blob.size || 0;
      const abs = resolveUrl ? resolveUrl(u) : u;
      // 建 ObjectURL 是**锦上添花**，失败不能把下载成功的音频标成不可用。
      // Node 24 的 URL.createObjectURL 是存在的，传非真 Blob 会抛，
      // 绝不能让那个异常冒到上面把整条记成失败。
      let objUrl = abs;
      try {
        if (
          typeof URL !== 'undefined'
          && typeof URL.createObjectURL === 'function'
          && typeof (blob as { arrayBuffer?: unknown }).arrayBuffer === 'function'
        ) {
          objUrl = URL.createObjectURL(blob as unknown as Blob);
        }
      } catch {
        objUrl = abs;
      }
      map.set(u, objUrl);
    }

    if (onProgress) onProgress({ done: i + 1, total: urls.length, bytes: bytes, failed: failed.slice() });
  }

  return {
    urlFor(u: string) { return map.get(u) ?? null; },
    releaseAll() {
      for (const v of map.values()) {
        if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function' && v.startsWith('blob:')) {
          URL.revokeObjectURL(v);
        }
      }
      map.clear();
    },
  };
}