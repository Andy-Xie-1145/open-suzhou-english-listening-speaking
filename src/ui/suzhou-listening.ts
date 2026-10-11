/**
 * 听力作答界面（苏州中考题型）
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 本界面的每一个数字都带「近似模拟」标识，不得移除。
 * 见 spec/suzhou-listening-speaking.spec.md 第 0 节。
 *
 * 流程：听前浏览（5 秒 × n）→ 播放 2 遍 → 作答（5 秒 × n）→ 自动进入下一段。
 *
 * 没有任何「下一段 / 跳过」按钮：每一步都有倒计时，归零自动前进。
 * n = 本段小题数，本段所有小题同时展示。
 *
 * 音频来自**构建期渲染**的静态 mp3/wav（见 scripts/build-listening-audio.ts），
 * 浏览器不加载任何 TTS 模型。音频必须在加载页全部下完并注入 cache 进来；
 * 考试中不再发起任何网络请求。
 */

import {
  buildSteps,
  initialSession,
  currentStep,
  advance,
  markPlayFinished,
  chooseAnswer,
  settle,
  totalPoints,
  phaseDuration,
  prefetchAudio,
  PLAY_TIMES,
  type ListeningSession,
  type ListeningStep,
  type ListeningOutcome,
  type ListeningPhase,
  type FetchLike,
  type AudioCache,
  type BlobLike,
} from '../suzhou/listening-session.ts';
import { LISTENING_SECTIONS } from '../suzhou/listening-spec.ts';
import { BADGE, BANNER, SCORE_LABEL } from '../suzhou/disclaimer.ts';
import type { PaperListening } from '../suzhou/paper.ts';
import type { ListeningOption } from '../suzhou/listening-bank.ts';
import { AUDIO_EXT } from '../suzhou/listening-audio.ts';

/* ------------------------------------------------------------------ *
 * 一、纯逻辑：视图模型（可单测，不碰 DOM）
 * ------------------------------------------------------------------ */

export interface OptionView {
  label: string;
  text: string;
  selected: boolean;
}

export interface QuestionView {
  /** 全卷题号，从 1 开始 */
  no: number;
  id: string;
  prompt: string;
  options: OptionView[];
}

export interface ListeningView {
  phase: ListeningPhase;
  /** 「听对话回答问题」或「听对话和短文答题」 */
  sectionName: string;
  /** 第几段 / 共几段 */
  stepNo: number;
  stepTotal: number;
  /** 第几题 / 共几题（本段内） */
  stageTitle: string;
  stageHint: string;
  questions: QuestionView[];
  /** 播放阶段显示「第几遍」 */
  playLabel: string;
  /** 本阶段倒计时（毫秒）。播放阶段音频时长未知时为 -1，界面显示占位 */
  remainingMs: number;
  /** 本阶段总时长（毫秒）；未知为 -1 */
  totalMs: number;
  audioUrl: string;
  /** 音频没下下来时的提示 */
  audioMissing: boolean;
}

/** 全卷题号：把每段的小题连起来编号 */
export function numberQuestions(steps: readonly ListeningStep[]): Map<string, number> {
  const out = new Map<string, number>();
  let n = 0;
  for (const s of steps) {
    for (const q of s.questions) out.set(q.id, ++n);
  }
  return out;
}

function stageOf(phase: ListeningPhase, step: ListeningStep): { title: string; hint: string } {
  const n = step.questions.length;
  if (phase === 'preview') {
    return { title: '听前浏览', hint: '请利用 ' + (5 * n) + ' 秒阅读本段 ' + n + ' 道题，倒计时结束后自动播放。' };
  }
  if (phase === 'playing') {
    return { title: '正在播放', hint: '仔细听，材料共播放 ' + PLAY_TIMES + ' 遍。' };
  }
  if (phase === 'answering') {
    return {
      title: '作答',
      hint: (n > 1 ? '本段共 ' + n + ' 道题，' : '') + '请在 ' + (5 * n) + ' 秒内选完，倒计时结束后自动进入下一段。',
    };
  }
  return { title: '听力结束', hint: '' };
}

/** 本阶段还剩多少毫秒；播放阶段音频未知时返回 -1 */
function remainingOf(s: ListeningSession, phaseElapsedMs: number, audioMs: number): { remaining: number; total: number } {
  const total = phaseDuration(s, audioMs);
  if (s.phase === 'playing' && total <= 0) return { remaining: -1, total: -1 };
  return { remaining: Math.max(0, total - phaseElapsedMs), total: total };
}

export function toView(
  s: ListeningSession,
  phaseElapsedMs: number,
  audioMs: number,
  audioReady: boolean,
): ListeningView {
  const step = currentStep(s);
  const stepTotal = s.steps.length;

  if (!step || s.phase === 'done') {
    return {
      phase: 'done',
      sectionName: '',
      stepNo: stepTotal,
      stepTotal: stepTotal,
      stageTitle: '听力测试结束',
      stageHint: '本部分作答完毕。',
      questions: [],
      playLabel: '',
      remainingMs: 0,
      totalMs: 0,
      audioUrl: '',
      audioMissing: false,
    };
  }

  const nums = numberQuestions(s.steps);
  const stage = stageOf(s.phase, step);
  const clock = remainingOf(s, phaseElapsedMs, audioMs);

  return {
    phase: s.phase,
    sectionName: LISTENING_SECTIONS[step.section === 0 ? 'dialogue' : 'passage'].name,
    stepNo: step.index + 1,
    stepTotal: stepTotal,
    stageTitle: stage.title,
    stageHint: stage.hint,
    questions: step.questions.map(function (q) {
      return {
        no: nums.get(q.id) ?? 0,
        id: q.id,
        prompt: q.prompt,
        options: q.options.map(function (o) {
          return { label: o.label, text: o.text, selected: s.answers[q.id] === o.label };
        }),
      };
    }),
    playLabel: s.phase === 'playing' ? '第 ' + Math.min(PLAY_TIMES, s.plays + 1) + ' / ' + PLAY_TIMES + ' 遍' : '',
    remainingMs: clock.remaining,
    totalMs: clock.total,
    audioUrl: step.audioUrl,
    audioMissing: !audioReady,
  };
}

/** 成绩视图 */
export interface OutcomeView {
  dialogue: { got: number; max: number };
  passage: { got: number; max: number };
  total: number;
  max: number;
  unanswered: number;
  rows: Array<{
    no: number;
    prompt: string;
    chosen: string;
    answer: string;
    ok: boolean;
  }>;
}

export function toOutcomeView(o: ListeningOutcome, steps: readonly ListeningStep[]): OutcomeView {
  const nums = numberQuestions(steps);
  return {
    dialogue: { got: o.points.dialogue, max: LISTENING_SECTIONS.dialogue.points },
    passage: { got: o.points.passage, max: LISTENING_SECTIONS.passage.points },
    total: totalPoints(o),
    max: LISTENING_SECTIONS.dialogue.points + LISTENING_SECTIONS.passage.points,
    unanswered: o.unanswered.length,
    rows: o.detail.map(function (d) {
      return {
        no: nums.get(d.questionId) ?? 0,
        prompt: d.prompt,
        chosen: d.chosen,
        answer: d.answer,
        ok: d.ok,
      };
    }),
  };
}

/* ------------------------------------------------------------------ *
 * 二、播放器与音频端口
 * ------------------------------------------------------------------ */

export interface PlayerPort {
  load(src: string): void;
  play(): Promise<void> | void;
  pause(): void;
  durationMs(): number;
  onEnded(cb: () => void): void;
}

export interface SuzhouListeningDeps {
  listening: PaperListening;
  /** 音频格式，与构建期产物一致 */
  ext?: string;
  fetchImpl?: FetchLike;
  /** 加载页已预取好的音频缓存。给了就不再发任何请求 —— 考试中不允许加载 */
  cache?: AudioCache | null;
  player?: PlayerPort | null;
  onFinish?: (outcome: ListeningOutcome) => void;
}

/* ------------------------------------------------------------------ *
 * 三、DOM
 * ------------------------------------------------------------------ */

function el(tag: string, className: string, text?: string): HTMLElement {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}

/** 按钮要设 type=button，否则放在 form 里默认是 submit */
function btn(className: string, text: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = className;
  b.type = 'button';
  b.textContent = text;
  return b;
}

function fmt(ms: number): string {
  const t = Math.max(0, Math.ceil(ms / 1000));
  return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
}

/** 倒计时文案。每个阶段都强制显示，归零即自动前进 */
function countdownText(v: ListeningView): string {
  if (v.phase === 'done' || v.phase === 'idle') return '';
  if (v.remainingMs < 0) return '准备播放…';
  const s = Math.ceil(v.remainingMs / 1000);
  if (v.phase === 'preview') return '浏览倒计时 ' + s + ' 秒';
  if (v.phase === 'playing') return '播放结束倒计时 ' + fmt(v.remainingMs);
  if (v.phase === 'answering') return '作答倒计时 ' + s + ' 秒';
  return '';
}

export interface SuzhouListeningApp {
  /** 根元素。主界面重绘会清空挂载点，需要时用这个把它接回去 */
  el(): HTMLElement;
  view(): ListeningView;
  outcome(): ListeningView | null;
  start(): Promise<void>;
  pick(questionId: string, label: string): void;
  stop(): void;
  destroy(): void;
}

export function mountSuzhouListening(
  container: HTMLElement,
  deps: SuzhouListeningDeps,
): SuzhouListeningApp {
  const ext = deps.ext ?? AUDIO_EXT;
  const steps = buildSteps(deps.listening, ext);
  let session: ListeningSession = initialSession(steps);
  let phaseStart = 0;
  let cache: AudioCache | null = null;
  let audio: HTMLAudioElement | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  let finished: ListeningView | null = null;

  const root = el('section', 'lz');
  const banner = el('p', 'lz__banner', BANNER);
  const head = el('div', 'lz__head');
  const sec = el('span', 'lz__section', '');
  const prog = el('span', 'lz__progress', '');
  const stage = el('h3', 'lz__stage', '');
  const hint = el('p', 'lz__hint', '');
  const playLabel = el('p', 'lz__play', '');
  const audioBox = el('div', 'lz__audio');
  const list = el('ol', 'lz__questions');
  const cd = el('p', 'lz__countdown', '');
  const warn = el('p', 'lz__warn', '');

  head.appendChild(sec);
  head.appendChild(prog);
  audioBox.appendChild(playLabel);
  root.appendChild(banner);
  root.appendChild(head);
  root.appendChild(stage);
  root.appendChild(hint);
  root.appendChild(audioBox);
  root.appendChild(list);
  root.appendChild(cd);
  root.appendChild(warn);
  container.appendChild(root);

  if (typeof Audio !== 'undefined') audio = new Audio();

  const view = (): ListeningView => toView(session, elapsed(), audioMs(), audioReady());
  const elapsed = (): number => (timer ? Date.now() - phaseStart : 0);
  const audioMs = (): number => (audio && isFinite(audio.duration) ? audio.duration * 1000 : 0);
  const audioReady = (): boolean => (cache ? cache.urlFor(currentStep(session)?.audioUrl ?? '') !== null : false);

  function src(): string {
    const step = currentStep(session);
    if (!step) return '';
    const hit = cache ? cache.urlFor(step.audioUrl) : null;
    return hit ?? step.audioUrl;
  }

  function render(): void {
    const v = view();
    sec.textContent = v.sectionName;
    prog.textContent = v.stepTotal ? '第 ' + v.stepNo + ' / ' + v.stepTotal + ' 段' : '';
    stage.textContent = v.stageTitle;
    hint.textContent = v.stageHint;
    playLabel.textContent = v.playLabel;
    cd.textContent = countdownText(v);

    warn.textContent = v.audioMissing
      ? '这段的音频没有预先加载成功。请退出本场考试并重新进加载页。'
      : '';

    list.textContent = '';
    for (const q of v.questions) {
      const li = el('li', 'lz__q');
      li.appendChild(el('p', 'lz__qtitle', q.no + '. ' + q.prompt));
      const ul = el('ul', 'lz__opts');
      for (const o of q.options) {
        const li2 = el('li', 'lz__opt' + (o.selected ? ' is-on' : ''));
        const ob = btn('lz__optbtn', o.label + '. ' + o.text);
        ob.addEventListener('click', function () { pick(q.id, o.label); });
        li2.appendChild(ob);
        ul.appendChild(li2);
      }
      li.appendChild(ul);
      list.appendChild(li);
    }

    if (v.phase === 'playing' && audio) {
      const s = src();
      if (s && audio.dataset.src !== s) {
        audio.dataset.src = s;
        audio.src = s;
        void audio.play().catch(function () { /* 自动播放被拦时让学生手点 */ });
      }
    }
    if (v.phase !== 'playing' && audio) audio.pause();
  }

  function tick(): void {
    const before = session.phase;
    const next = advance(session, elapsed(), audioMs(), false);
    if (next !== session || before !== next.phase) {
      if (next.phase !== before) {
        session = next;
        phaseStart = Date.now();
        if (audio) audio.pause();
        if (next.phase === 'done') return finish();
      } else {
        session = next;
      }
    }
    render();
  }

  function startTimer(): void {
    if (timer) return;
    phaseStart = Date.now();
    timer = setInterval(tick, 250);
  }

  async function start(): Promise<void> {
    if (deps.cache) {
      // 正路：加载页已经把全部音频下完并注入。考试中一个请求都不发。
      cache = deps.cache;
    } else {
      // 兜底（测试 / 未走加载页直接挂载）：现场预取
      const urls = steps.map(function (s) { return s.audioUrl; });
      const doFetch: FetchLike = deps.fetchImpl
        || (async function (u: string) {
          const r = await fetch(u);
          return { ok: r.ok, status: r.status, blob: async () => r.blob() as unknown as BlobLike };
        });
      cache = await prefetchAudio(urls, doFetch, undefined, function (u) { return u; });
    }
    startTimer();
    render();
  }

  function pick(questionId: string, label: string): void {
    session = chooseAnswer(session, questionId, label);
    render();
  }

  function finish(): void {
    finished = view();
    const o = settle(session);
    stage.textContent = '听力测试结束';
    hint.textContent = '本部分作答完毕，交卷后统一出分。';
    playLabel.textContent = '';
    cd.textContent = '';
    list.textContent = '';
    const score = el('p', 'lz__score', '近似分 ' + totalPoints(o) + ' / 20　（' + BADGE + '）');
    root.appendChild(score);
    warn.textContent = '';
    render();
    if (deps.onFinish) deps.onFinish(o);
  }

  render();

  return {
    el: function () { return root; },
    view: view,
    outcome: function () { return finished; },
    start: start,
    pick: pick,
    stop: function () {
      if (timer) clearInterval(timer);
      timer = null;
      if (audio) audio.pause();
      if (cache) cache.releaseAll();
    },
    destroy: function () {
      if (timer) clearInterval(timer);
      timer = null;
      if (audio) audio.pause();
      if (cache) cache.releaseAll();
      if (root.parentNode) root.parentNode.removeChild(root);
    },
  };
}