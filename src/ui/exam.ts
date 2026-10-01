/**
 * 模考流程 —— 严格复刻「江苏省初中英语听力口语自动化考试」考场时间轴
 *
 * 许可：AGPL-3.0-only
 *
 * 时间轴来源：research/suzhou-grade9-exam-deep-dive.md 第 3.3 节 + ARCHITECTURE.md。
 *   考前30min  准备室签到 + 考前培训
 *   考前15min  候考室待考
 *   考前10min  系统操作员点击[准备考试]，按时段自动加载试卷
 *   考前 5min  进考场就座，核对准考证 → 输入准考证号 → 核对姓名/性别/照片 → 确定
 *              → 设备测试 → 等待考试开始
 *   开考时刻   下达「开始考试」指令 → 开考倒计时 → 正式开始
 *   正式考试   22 分钟 = 听力 12 + 口语 10
 *   结束       交卷
 *
 * 本文件分两部分：
 *   1) 纯逻辑（Timeline / ExamPaper）—— 可在 Node 中直接单测，不触碰任何浏览器 API
 *   2) DOM 渲染 —— 所有 document 访问都在函数体内并做 typeof 检查
 */

import type { TopicProfile } from '../rules/lexicon.ts';

/* ------------------------------------------------------------------ *
 * 一、时间轴常量
 * ------------------------------------------------------------------ */

/** 考场阶段 */
export type StageKind =
  | 'prep-room'
  | 'waiting-room'
  | 'prepare-exam'
  | 'seat-check'
  | 'identity-check'
  | 'device-test'
  | 'awaiting-start'
  | 'countdown'
  | 'listening'
  | 'speaking'
  | 'submit';

/** 时间轴阶段 */
export interface TimelineStep {
  /** 稳定 id，DOM 用作 key */
  id: string;
  kind: StageKind;
  /** 中文标题 */
  title: string;
  /** 屏幕上给考生看的说明 */
  detail: string;
  /** 相对开考时刻（nowMs = 0）的毫秒偏移；考前为负 */
  startMs: number;
  endMs: number;
  durationMs: number;
  phase: 'pre-exam' | 'exam' | 'post-exam';
  /** 是否为不可跳过的硬性环节（真实考场不可自行提前进入） */
  blocking: boolean;
}

/** 正考规格（真实考场：22 分钟 = 听力 12 + 口语 10） */
export const FULL_EXAM = {
  /** 考生实际作答总时长：22 分钟 */
  totalMs: 22 * 60_000,
  /** 听力测试：12 分钟 */
  listeningMs: 12 * 60_000,
  /** 口语测试：10 分钟 */
  speakingMs: 10 * 60_000,
  /** 考前 30 分钟进入准备室 */
  prepRoomAtMs: -30 * 60_000,
} as const;

/** 开考倒计时长度（秒） */
export const COUNTDOWN_MS = 30_000;

/** 正式测试用的缩短版（默认 7 分 30 秒：听力 4 分 + 口语 3 分 30 秒） */
export const PRACTICE_EXAM = {
  totalMs: 7.5 * 60_000,
  listeningMs: 4 * 60_000,
  speakingMs: 3.5 * 60_000,
} as const;

/** 组卷/时长方案 */
export interface ExamPlan {
  mode: 'full' | 'practice';
  listeningMs: number;
  speakingMs: number;
  /** 是否包含考前 30 分钟签到/候考/设备测试全流程 */
  includeCheckin: boolean;
  /** 是否逐题建议用时 */
  perQuestionBudget: boolean;
}

/** 正考方案 */
export function fullPlan(): ExamPlan {
  return {
    mode: 'full',
    listeningMs: FULL_EXAM.listeningMs,
    speakingMs: FULL_EXAM.speakingMs,
    includeCheckin: true,
    perQuestionBudget: true,
  };
}

/** 练习方案：可自定义压缩比例（0 < ratio <= 1） */
export function practicePlan(ratio = 1): ExamPlan {
  const r = Math.min(1, Math.max(0.05, Number.isFinite(ratio) ? ratio : 1));
  return {
    mode: 'practice',
    listeningMs: Math.round(PRACTICE_EXAM.listeningMs * r),
    speakingMs: Math.round(PRACTICE_EXAM.speakingMs * r),
    includeCheckin: false,
    perQuestionBudget: true,
  };
}

/**
 * 按权重把总时长分配给各题，保证「分配合计 === 总量」（最大余数法）。
 * 纯函数，是组卷时长计算的基础。
 */
export function allocateBudgets<T extends string>(weights: Record<T, number>, totalMs: number): Record<T, number> {
  const keys = Object.keys(weights) as T[];
  const sum = keys.reduce((a, k) => a + Math.max(0, weights[k]), 0);
  const out = {} as Record<T, number>;
  if (sum <= 0) {
    for (const k of keys) out[k] = 0;
    return out;
  }
  const exact = keys.map(k => ({ k, v: (Math.max(0, weights[k]) / sum) * totalMs, i: keys.indexOf(k) }));
  let acc = 0;
  for (const e of exact) {
    const v = Math.floor(e.v);
    out[e.k] = v;
    acc += v;
  }
  // 余数按小数部分从大到小补齐
  const rest = exact
    .map(e => ({ k: e.k, frac: e.v - Math.floor(e.v), i: e.i }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  let i = 0;
  let leftover = Math.round(totalMs) - acc;
  while (leftover > 0 && rest.length) {
    out[rest[i % rest.length].k] += 1;
    i++;
    leftover--;
  }
  return out;
}

/** 考前各环节的固定偏移（相对开考时刻） */
const CHECKIN_LAYOUT: ReadonlyArray<{
  id: string;
  kind: StageKind;
  title: string;
  detail: string;
  startMs: number;
  endMs: number;
}> = [
  { id: 'checkin', kind: 'prep-room', title: '准备室签到', detail: '签到、考前培训，请保持安静。', startMs: -30 * 60_000, endMs: -15 * 60_000 },
  { id: 'waiting', kind: 'waiting-room', title: '候考室待考', detail: '请在候考室就座，等待叫号。', startMs: -15 * 60_000, endMs: -10 * 60_000 },
  { id: 'prepare', kind: 'prepare-exam', title: '[准备考试]', detail: '系统按时段自动加载试卷，请不要操作设备。', startMs: -10 * 60_000, endMs: -5 * 60_000 },
  { id: 'seat', kind: 'seat-check', title: '进考场就座', detail: '按准考证座位号就座，准考证放醒目位置，监考员核对。', startMs: -5 * 60_000, endMs: -3 * 60_000 },
  { id: 'identity', kind: 'identity-check', title: '核对准考证', detail: '输入准考证号，核对姓名/性别/准考证号/照片后点击确定。', startMs: -3 * 60_000, endMs: -2 * 60_000 },
  { id: 'device', kind: 'device-test', title: '设备测试', detail: '请大声朗读屏幕上的句子，测试麦克风与扬声器。', startMs: -2 * 60_000, endMs: -60_000 },
  { id: 'awaiting', kind: 'awaiting-start', title: '等待考试开始', detail: '一切就绪，请坐好等待开考指令。', startMs: -60_000, endMs: -COUNTDOWN_MS },
];

/**
 * 构建完整时间轴。
 * 返回的 steps 按时间升序；startMs/endMs 相对开考时刻。
 */
export function buildTimeline(plan: ExamPlan = fullPlan()): TimelineStep[] {
  const steps: TimelineStep[] = [];

  if (plan.includeCheckin) {
    for (const s of CHECKIN_LAYOUT) {
      steps.push({
        id: s.id,
        kind: s.kind,
        title: s.title,
        detail: s.detail,
        startMs: s.startMs,
        endMs: s.endMs,
        durationMs: s.endMs - s.startMs,
        phase: 'pre-exam',
        blocking: true,
      });
    }
  }

  steps.push({
    id: 'countdown',
    kind: 'countdown',
    title: '开考倒计时',
    detail: '请看着屏幕，准备开考。',
    startMs: -COUNTDOWN_MS,
    endMs: 0,
    durationMs: COUNTDOWN_MS,
    phase: 'pre-exam',
    blocking: true,
  });

  const listening = Math.max(0, Math.round(plan.listeningMs));
  const speaking = Math.max(0, Math.round(plan.speakingMs));

  steps.push({
    id: 'listening',
    kind: 'listening',
    title: '第一部分 听力测试',
    detail: '共 2 题，请仔细听录音并作答。',
    startMs: 0,
    endMs: listening,
    durationMs: listening,
    phase: 'exam',
    blocking: false,
  });

  steps.push({
    id: 'speaking',
    kind: 'speaking',
    title: '第二部分 口语测试',
    detail: '共 3 题，请对着麦克风大声作答。',
    startMs: listening,
    endMs: listening + speaking,
    durationMs: speaking,
    phase: 'exam',
    blocking: false,
  });

  steps.push({
    id: 'submit',
    kind: 'submit',
    title: '交卷',
    detail: '考试结束，请点击「交卷」并等待监考员确认。',
    startMs: listening + speaking,
    endMs: listening + speaking,
    durationMs: 0,
    phase: 'post-exam',
    blocking: true,
  });

  return steps;
}

/** 时间轴查询结果 */
export interface StepState {
  step: TimelineStep;
  index: number;
  /** 已进行毫秒（不小于 0） */
  elapsedMs: number;
  /** 剩余毫秒（提交阶段为 0） */
  remainingMs: number;
  /** 阶段内进度 0..1 */
  progress: number;
  status: 'before' | 'running' | 'done';
}

/**
 * 给定时刻求当前所处阶段。
 * 未到第一个环节返回 before；考试已结束返回最后一个阶段 done。
 * 纯函数 —— 这是时间轴计算的核心，被 tests/ui.test.ts 覆盖。
 */
export function stepAt(timeline: TimelineStep[], nowMs: number): StepState {
  if (!timeline.length) {
    throw new Error('buildTimeline 返回了空时间轴');
  }
  let index = 0;
  for (let i = 0; i < timeline.length; i++) {
    if (nowMs >= timeline[i].startMs) index = i;
    else break;
  }
  const step = timeline[index];
  const elapsedMs = Math.max(0, nowMs - step.startMs);
  const remainingMs = Math.max(0, step.endMs - nowMs);
  const progress = step.durationMs > 0 ? Math.min(1, elapsedMs / step.durationMs) : nowMs >= step.startMs ? 1 : 0;
  let status: StepState['status'] = 'running';
  if (nowMs < step.startMs) status = 'before';
  else if (step.durationMs > 0 && nowMs >= step.endMs) status = 'done';
  return { step, index, elapsedMs, remainingMs, progress, status };
}

/** 是否已到交卷时刻 */
export function isExamOver(timeline: TimelineStep[], nowMs: number): boolean {
  const last = timeline[timeline.length - 1];
  return !!last && nowMs >= last.startMs;
}

/** 整场剩余毫秒（含交卷时刻） */
export function examRemainingMs(timeline: TimelineStep[], nowMs: number): number {
  const last = timeline[timeline.length - 1];
  return last ? Math.max(0, last.endMs - nowMs) : 0;
}

/** 下一阶段 id；已是最后一个返回 null */
export function nextStageId(timeline: TimelineStep[], currentId: string): string | null {
  const i = timeline.findIndex(s => s.id === currentId);
  if (i < 0) return timeline.length ? timeline[0].id : null;
  return i + 1 < timeline.length ? timeline[i + 1].id : null;
}

/** 毫秒 → mm:ss（负数显示 -mm:ss；超过 1 小时显示 h:mm:ss） */
export function formatClock(ms: number): string {
  const neg = ms < 0;
  const total = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const body = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return neg ? '-' + body : body;
}

/** 中文口语化时长，如「1 分 30 秒」 */
export function formatDurationCn(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return s + ' 秒';
  if (s === 0) return m + ' 分钟';
  return m + ' 分 ' + s + ' 秒';
}

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

/** 时间轴的可读摘要（调试 / 单测用） */
export function describeTimeline(timeline: TimelineStep[]): string {
  return timeline
    .map(s => `${s.id}[${formatClock(s.startMs)}~+${formatClock(s.endMs)}] ${s.title}`)
    .join('\n');
}

/* ------------------------------------------------------------------ *
 * 二、组卷（五道题）
 * ------------------------------------------------------------------ */

/** 五道题的题型 */
export type QuestionKind = 'listen-dialogue' | 'listen-passage' | 'read-aloud' | 'qa' | 'topic';

export interface ExamQuestion {
  id: string;
  /** 第几题，1..5 */
  index: number;
  kind: QuestionKind;
  /** 中文题目标题 */
  title: string;
  /** 所属部分 */
  section: 'listening' | 'speaking';
  /** 屏幕提示语 */
  prompt: string;
  /** 朗读短文原文（仅 read-aloud） */
  reference?: string;
  /** 话题名（仅 topic） */
  topic?: string;
  /** 建议用时（毫秒）；perQuestionBudget=false 时为 0 */
  budgetMs: number;
  /** 需要的反馈层级 */
  needsFeedback: 'none' | 'reading' | 'open';
}

/** 各题在所属部分内的时长权重 */
export const QUESTION_WEIGHTS: Record<QuestionKind, number> = {
  'listen-dialogue': 0.3,
  'listen-passage': 0.7,
  'read-aloud': 0.2,
  qa: 0.3,
  topic: 0.5,
};

/** 题型 → 中文 */
export const QUESTION_TITLES: Record<QuestionKind, string> = {
  'listen-dialogue': '第一题 听对话回答问题',
  'listen-passage': '第二题 听对话和短文答题',
  'read-aloud': '第三题 朗读短文',
  qa: '第四题 情景问答',
  topic: '第五题 话题简述',
};

/** 题型 → 屏幕提示语 */
export const QUESTION_PROMPTS: Record<QuestionKind, string> = {
  'listen-dialogue': '请听录音，从 A/B/C 三个选项中选出最佳答案。',
  'listen-passage': '请听短文，根据所听内容回答问题。',
  'read-aloud': '请在听到提示后，用自然语速大声朗读下面的短文。',
  qa: '请根据情景，用完整的句子回答问题。',
  topic: '请围绕话题连续表达，说满 7 句以上，不要说中文提示。',
};

/** 题目顺序（考试固定顺序） */
export const QUESTION_ORDER: QuestionKind[] = [
  'listen-dialogue',
  'listen-passage',
  'read-aloud',
  'qa',
  'topic',
];

/** 组卷素材（结构上兼容 src/materials 的产出；缺失即用占位，绝不崩） */
export interface PaperSource {
  listenDialogue?: { id?: string; title?: string; questions?: string[] } | null;
  listenPassage?: { id?: string; title?: string; questions?: string[] } | null;
  readAloud?: { id?: string; title?: string; text?: string } | null;
  qa?: { id?: string; title?: string; questions?: string[] } | null;
  topic?: { id?: string; title?: string; profile?: string | TopicProfile | null } | null;
}

export interface ExamPaper {
  plan: ExamPlan;
  totalMs: number;
  questions: ExamQuestion[];
  /** 与时间轴的阶段 id 对应 */
  stageIdOf: Record<QuestionKind, string>;
  /** 已加载的素材数，用于提示「题库未加载」 */
  loadedMaterials: number;
}

/** 取话题名：兼容 string / TopicProfile / 缺失 */
function topicName(src: PaperSource): string {
  const t = src.topic;
  if (!t) return '（题库未加载：话题简述）';
  if (typeof t.title === 'string' && t.title) return t.title;
  const p = t.profile;
  if (typeof p === 'string' && p) return p;
  if (p && typeof p === 'object' && typeof p.name === 'string' && p.name) return p.name;
  return '（题库未加载：话题简述）';
}

/**
 * 组卷：把素材 + 时长方案组装成 5 道题。
 * 素材缺失时生成占位题（prompt 说明题库未加载），保证界面永不白屏。
 */
export function buildExamPaper(src: PaperSource = {}, plan: ExamPlan = fullPlan()): ExamPaper {
  const listening = Math.max(0, Math.round(plan.listeningMs));
  const speaking = Math.max(0, Math.round(plan.speakingMs));
  const q = plan.perQuestionBudget;

  const listenBudget = q
    ? allocateBudgets({ 'listen-dialogue': QUESTION_WEIGHTS['listen-dialogue'], 'listen-passage': QUESTION_WEIGHTS['listen-passage'] }, listening)
    : { 'listen-dialogue': 0, 'listen-passage': 0 };
  const speakBudget = q
    ? allocateBudgets({ 'read-aloud': QUESTION_WEIGHTS['read-aloud'], qa: QUESTION_WEIGHTS.qa, topic: QUESTION_WEIGHTS.topic }, speaking)
    : { 'read-aloud': 0, qa: 0, topic: 0 };

  const dialogue = src.listenDialogue ?? null;
  const passage = src.listenPassage ?? null;
  const reading = src.readAloud ?? null;
  const qa = src.qa ?? null;
  const topic = src.topic ?? null;

  const loaded =
    (dialogue ? 1 : 0) + (passage ? 1 : 0) + (reading ? 1 : 0) + (qa ? 1 : 0) + (topic ? 1 : 0);

  const missing = (what: string) => `（题库未加载：${what}）`;

  const questions: ExamQuestion[] = [
    {
      id: 'q1',
      index: 1,
      kind: 'listen-dialogue',
      title: QUESTION_TITLES['listen-dialogue'],
      section: 'listening',
      prompt: dialogue ? `${dialogue.title ?? '听对话回答问题'}\n${(dialogue.questions ?? []).map((t, i) => `${i + 1}. ${t}`).join('\n') || ''}`.trim() : missing('听对话'),
      budgetMs: listenBudget['listen-dialogue'],
      needsFeedback: 'none',
    },
    {
      id: 'q2',
      index: 2,
      kind: 'listen-passage',
      title: QUESTION_TITLES['listen-passage'],
      section: 'listening',
      prompt: passage ? `${passage.title ?? '听对话和短文答题'}\n${(passage.questions ?? []).map((t, i) => `${i + 1}. ${t}`).join('\n') || ''}`.trim() : missing('听力短文'),
      budgetMs: listenBudget['listen-passage'],
      needsFeedback: 'none',
    },
    {
      id: 'q3',
      index: 3,
      kind: 'read-aloud',
      title: QUESTION_TITLES['read-aloud'],
      section: 'speaking',
      prompt: reading ? reading.title ?? '朗读短文' : missing('朗读短文'),
      reference: reading?.text ?? '',
      budgetMs: speakBudget['read-aloud'],
      needsFeedback: 'reading',
    },
    {
      id: 'q4',
      index: 4,
      kind: 'qa',
      title: QUESTION_TITLES.qa,
      section: 'speaking',
      prompt: qa ? `${qa.title ?? '情景问答'}\n${(qa.questions ?? []).map((t, i) => `${i + 1}. ${t}`).join('\n') || ''}`.trim() : missing('情景问答'),
      budgetMs: speakBudget.qa,
      needsFeedback: 'open',
    },
    {
      id: 'q5',
      index: 5,
      kind: 'topic',
      title: QUESTION_TITLES.topic,
      section: 'speaking',
      prompt: topicName(src),
      topic: topicName(src),
      budgetMs: speakBudget.topic,
      needsFeedback: 'open',
    },
  ];

  return {
    plan,
    totalMs: listening + speaking,
    questions,
    stageIdOf: {
      'listen-dialogue': 'listening',
      'listen-passage': 'listening',
      'read-aloud': 'speaking',
      qa: 'speaking',
      topic: 'speaking',
    },
    loadedMaterials: loaded,
  };
}

/** 取某阶段的题目 */
export function questionsOfStage(paper: ExamPaper, stageId: string): ExamQuestion[] {
  return paper.questions.filter(q => paper.stageIdOf[q.kind] === stageId);
}

/** 取指定序号的题（1..5） */
export function questionAt(paper: ExamPaper, index: number): ExamQuestion | null {
  return paper.questions.find(q => q.index === index) ?? null;
}

/** 在组卷内部按已用时长定位当前题（纯逻辑，便于单测） */
export function currentQuestionIndex(paper: ExamPaper, elapsedInExamMs: number): number {
  const listeningMs = Math.max(0, Math.round(paper.plan.listeningMs));
  const t = Math.max(0, elapsedInExamMs);
  // 同一部分内的题必须按预算**累计**推进，而不是每题都从本部分起点算
  let sectionOffset = 0;
  let current = 'listening';
  for (const q of paper.questions) {
    if (q.section !== current) {
      current = q.section;
      sectionOffset = q.section === 'listening' ? 0 : listeningMs;
    }
    if (q.budgetMs <= 0) continue;
    const start = sectionOffset;
    sectionOffset += q.budgetMs;
    if (t >= start && t < start + q.budgetMs) return q.index;
  }
  return paper.questions.length ? paper.questions[paper.questions.length - 1].index : 1;
}

/* ------------------------------------------------------------------ *
 * 三、DOM 渲染（浏览器专用；Node 下不会被调用）
 * ------------------------------------------------------------------ */

function getDoc(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

/** 轻量 DOM 构造助手（不引入任何框架） */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children: (Node | string)[] = [],
): HTMLElementTagNameMap[K] {
  const d = getDoc();
  if (!d) throw new Error('h() 只能在浏览器环境调用');
  const el = d.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v);
  }
  for (const c of children) el.appendChild(typeof c === 'string' ? d.createTextNode(c) : c);
  return el;
}

export interface ExamViewCallbacks {
  /** 开始 / 继续流程 */
  onEnterStage?: (step: TimelineStep) => void;
  /** 交卷 */
  onSubmit?: () => void;
  /** 返回上一步（练习模式允许） */
  onBack?: () => void;
}

/**
 * 渲染考场屏幕：左侧倒计时 + 阶段列表，右侧当前阶段内容。
 * 任何一步缺素材/缺回调都只影响对应区块，不会抛错。
 */
export function renderExamView(
  container: HTMLElement,
  timeline: TimelineStep[],
  state: StepState,
  paper: ExamPaper | null,
  cb: ExamViewCallbacks = {},
): void {
  const d = getDoc();
  if (!d) return;
  container.textContent = '';
  container.className = 'exam-view';

  const { step } = state;

  // --- 左侧时间轴 ---
  const aside = h('aside', { class: 'exam-timeline' });
  aside.appendChild(h('h2', { class: 'exam-timeline__title', text: '考场流程' }));
  const ol = h('ol', { class: 'exam-timeline__list' });
  timeline.forEach((s, i) => {
    const cls =
      'exam-step' + (i === state.index ? ' is-current' : i < state.index ? ' is-done' : ' is-future');
    const li = h('li', { class: cls }, [
      h('span', { class: 'exam-step__name', text: s.title }),
      h('span', { class: 'exam-step__time', text: formatClock(s.startMs) }),
    ]);
    if (i === state.index && s.blocking && s.startMs < 0) {
      li.appendChild(h('span', { class: 'exam-step__badge', text: '不可跳过' }));
    }
    ol.appendChild(li);
  });
  aside.appendChild(ol);
  container.appendChild(aside);

  // --- 右侧主区域 ---
  const main = h('section', { class: 'exam-main' });

  const clock = h('div', { class: 'exam-clock' }, [
    h('div', { class: 'exam-clock__label', text: step.phase === 'pre-exam' ? '距离开考' : step.phase === 'exam' ? '本部分剩余' : '考试已结束' }),
    h('div', {
      class: 'exam-clock__value' + (state.remainingMs <= 30_000 && step.durationMs > 0 ? ' is-urgent' : ''),
      text: step.durationMs > 0 ? formatClock(state.remainingMs) : '--:--',
    }),
  ]);
  main.appendChild(clock);

  main.appendChild(h('h1', { class: 'exam-main__title', text: step.title }));
  main.appendChild(h('p', { class: 'exam-main__detail', text: step.detail }));

  if (step.phase === 'pre-exam') {
    main.appendChild(h('p', { class: 'exam-main__note', text: '真实考场中，此环节由监考/系统统一控制，不可自行跳过。' }));
    const btn = h('button', { class: 'btn btn--primary', type: 'button', text: paper ? '进入下一环节' : '继续' });
    btn.addEventListener('click', () => cb.onEnterStage?.(step));
    main.appendChild(btn);
    const onBack = cb.onBack;
    if (paper && onBack) {
      const back = h('button', { class: 'btn btn--ghost', type: 'button', text: '返回上一步' });
      back.addEventListener('click', () => onBack());
      main.appendChild(back);
    }
  } else if (step.phase === 'exam') {
    main.appendChild(renderQuestionBlock(paper, step.id));
  } else {
    main.appendChild(h('p', { class: 'exam-main__note', text: '本次模拟作答已结束，接下来查看反馈报告。' }));
    const btn = h('button', { class: 'btn btn--primary', type: 'button', text: '交卷' });
    btn.addEventListener('click', () => cb.onSubmit?.());
    main.appendChild(btn);
  }

  container.appendChild(main);
}

/** 渲染某个听力/口语阶段内的题目 */
function renderQuestionBlock(paper: ExamPaper | null, stageId: string): HTMLElement {
  const box = h('div', { class: 'exam-questions' });
  if (!paper) {
    box.appendChild(h('p', { class: 'notice notice--warn', text: '题库尚未载入，暂用占位流程。' }));
    return box;
  }
  const list = questionsOfStage(paper, stageId);
  if (!list.length) {
    box.appendChild(h('p', { class: 'notice', text: '本部分暂无题目。' }));
    return box;
  }
  for (const q of list) {
    const card = h('article', { class: 'q-card q-card--' + q.kind });
    card.appendChild(h('h2', { class: 'q-card__title', text: q.title }));
    card.appendChild(h('p', { class: 'q-card__prompt', text: q.prompt }));
    if (q.reference) {
      card.appendChild(h('div', { class: 'q-card__reading', text: q.reference }));
    }
    if (q.budgetMs > 0) {
      card.appendChild(h('p', { class: 'q-card__budget', text: '建议用时 ' + formatDurationCn(q.budgetMs) }));
    }
    if (q.needsFeedback !== 'none') {
      card.appendChild(h('p', { class: 'q-card__feedback-hint', text: '本题结束后会生成能力诊断反馈。' }));
    }
    box.appendChild(card);
  }
  return box;
}
