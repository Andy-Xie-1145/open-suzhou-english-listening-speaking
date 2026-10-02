/**
 * 模考主界面 —— 「打开即出一份完整卷」
 *
 * 许可：AGPL-3.0-only
 *
 * ## 设计目标：零配置
 *
 * 用户打开页面就拿到一份完整的口语卷（Q3 朗读 + Q4 情景问答 + Q5 话题简述），
 * 不需要注册、不需要配置、不需要先选「练哪一题」。
 *
 * 各题型的细分界面（录音、转写、逐条反馈）仍在自己的模块里，
 * 本文件只负责：出卷 → 展示卷面 → 把答题结果汇总。
 *
 * ## 红线
 *
 * 每个近似分旁必须有「近似模拟」标识；降级分支也必须保留声明横幅。
 * 见 spec/suzhou-listening-speaking.spec.md 第 0 节。
 */

import { dealPaper, dealNextPaper, type PaperBank, type SuzhouPaper } from '../suzhou/paper.ts';
import { disclaimerBlock } from '../suzhou/disclaimer.ts';
import { SPEAKING_WEIGHTS, SPEAKING_MINUTES, QA_COUNT } from '../suzhou/paper.ts';
import type { RecorderPort, AsrPort } from '../suzhou/recorder-bridge.ts';

export type SectionKind = 'reading' | 'qa' | 'topic';

export interface SectionAnswer {
  /** 学生作答内容（转写或手动输入） */
  text: string;
  durationMs?: number;
  /** 该题近似分；未作答为 null */
  approximateScore: number | null;
}
export interface ExamDeps {
  bank: PaperBank;
  recorder?: RecorderPort | null;
  asr?: AsrPort | null;
  /** 评分回调：由各题型模块注入 */
  scoreReading?: (text: string, task: any, durationMs?: number) => number | null;
  scoreQa?: (text: string, task: any, durationMs?: number) => number | null;
  scoreTopic?: (text: string, task: any, durationMs?: number) => number | null;
  /** 默认 seed；不传则用日期生成，保证每天换一套卷 */
  seed?: number;
}

export interface ExamState {
  paper: SuzhouPaper | null;
  answers: Record<SectionKind, SectionAnswer>;
  active: SectionKind;
  /** 当前题在 qa 两题中的次序（0/1）；朗读与话题恒为 0 */
  qaOrder: number;
  /** 组卷失败原因 */
  error: string | null;
  /** 各题状态，供 UI 决定按钮可用性 */
  phase: Record<SectionKind, 'idle' | 'recording' | 'transcribing' | 'manual' | 'scored'>;
}
function emptyAnswer(): SectionAnswer {
  return { text: '', approximateScore: null };
}

/** 默认 seed：同一天内保持稳定，换天自动换卷 */
export function defaultSeed(now: number = Date.now()): number {
  const d = new Date(now);
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function initialExamState(deps: ExamDeps): ExamState {
  const seed = typeof deps.seed === 'number' ? deps.seed : defaultSeed();
  let paper: SuzhouPaper | null = null;
  let error: string | null = null;
  try {
    paper = dealPaper(deps.bank, { seed: seed });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return {
    paper: paper,
    answers: { reading: emptyAnswer(), qa: emptyAnswer(), topic: emptyAnswer() },
    active: 'reading',
    qaOrder: 0,
    error: error,
    phase: { reading: 'idle', qa: 'idle', topic: 'idle' },
  };
}

/** 当前激活题对应的题目数据 */
export function activeTask(state: ExamState): { kind: SectionKind; title: string; body: string; budgetMs: number; raw: any } | null {
  const p = state.paper;
  if (!p) return null;
  if (state.active === 'reading') {
    return {
      kind: 'reading',
      title: '第三题 朗读短文',
      body: p.reading.task.text,
      budgetMs: p.reading.budgetMs,
      raw: p.reading.task,
    };
  }
  if (state.active === 'qa') {
    const item = p.qa[state.qaOrder] ?? p.qa[0];
    if (!item) return null;
    return {
      kind: 'qa',
      title: '第四题 情景问答（第 ' + (item.order + 1) + ' / ' + p.qa.length + ' 题）',
      body: item.task.question,
      budgetMs: Math.floor((SPEAKING_MINUTES * 60_000 * SPEAKING_WEIGHTS.qa) / Math.max(1, p.qa.length)),
      raw: item.task,
    };
  }
  return {
    kind: 'topic',
    title: '第五题 话题简述',
    body: p.topic.task.name,
    budgetMs: SPEAKING_MINUTES * 60_000 * SPEAKING_WEIGHTS.topic,
    raw: p.topic.task,
  };
}
function resolveDoc(mount: Element): Document {
  const owner = mount.ownerDocument as Document | undefined;
  const g = typeof document === 'undefined' ? undefined : document;
  const found: Document | undefined = owner ?? g;
  if (found === undefined) throw new Error('需要 DOM 环境');
  return found;
}

function fmtMs(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m + ' 分 ' + (s < 10 ? '0' : '') + s + ' 秒';
}

export interface ExamApp {
  state(): ExamState;
  view(): Element | null;
  /** 换一套卷（排除已出过的题） */
  nextPaper(): void;
  /** 切换到某题型；qa 可带 order 切第几题 */
  focus(kind: SectionKind, order?: number): void;
  /** 开始录音 */
  start(): Promise<void>;
  /** 停止录音并评分 */
  stop(): Promise<void>;
  /** 手动输入作答并评分 */
  submitText(text: string, durationMs?: number): number | null;
  destroy(): void;
}
export function mountSuzhouExam(mount: Element, deps: ExamDeps): ExamApp {
  const doc = resolveDoc(mount);
  let state = initialExamState(deps);
  let viewEl: Element | null = null;

  function canRecord(): boolean {
    const r = deps.recorder;
    if (!r) return false;
    try { return r.canRecord(); } catch { return false; }
  }

  function asrReady(): boolean {
    const a = deps.asr;
    if (!a) return false;
    try { return a.ready(); } catch { return false; }
  }
  function renderBanner(): HTMLElement {
    const b = doc.createElement('div');
    b.className = 'sz-banner';
    b.setAttribute('role', 'note');
    b.textContent = disclaimerBlock().banner;
    return b;
  }

  /** 分数展示：标签 + 徽标 + 声明，缺一不可 */
  function renderScore(kind: SectionKind): HTMLElement | null {
    const ans = state.answers[kind];
    if (ans.approximateScore === null) return null;
    const d = disclaimerBlock();
    const box = doc.createElement('div');
    box.className = 'sz-score-inline';
    const num = doc.createElement('strong');
    num.className = 'sz-score-num';
    num.textContent = String(ans.approximateScore);
    const lab = doc.createElement('span');
    lab.className = 'sz-score-label';
    lab.textContent = d.scoreLabel;
    const badge = doc.createElement('span');
    badge.className = 'sz-badge';
    badge.textContent = d.badge;
    box.appendChild(num);
    box.appendChild(lab);
    box.appendChild(badge);
    return box;
  }
  function render(): void {
    while (mount.firstChild) mount.removeChild(mount.firstChild);
    mount.appendChild(renderBanner());

    const h = doc.createElement('h2');
    h.textContent = '苏州中考英语听力口语 · 口语部分模考（近似模拟）';
    mount.appendChild(h);

    const lead = doc.createElement('p');
    lead.className = 'sz-sc-lead';
    lead.textContent = '打开即出一份完整口试卷。考生实际作答 22 分钟，本页只含口语 10 分钟部分（听力因音频不可得暂缺）。';
    mount.appendChild(lead);

    if (state.error || !state.paper) {
      const e = doc.createElement('p');
      e.className = 'sz-error';
      e.textContent = state.error ?? '组卷失败';
      mount.appendChild(e);
      viewEl = mount;
      return;
    }
    const paper = state.paper;
    // 卷面信息
    const info = doc.createElement('p');
    info.className = 'sz-paper-meta';
    info.textContent = '试卷编号 seed=' + paper.seed
      + '　|　口语 ' + SPEAKING_MINUTES + ' 分钟'
      + '　|　朗读 ' + fmtMs(paper.reading.budgetMs)
      + ' / 问答 ' + fmtMs(Math.floor(paper.speakingMs * SPEAKING_WEIGHTS.qa / Math.max(1, paper.qa.length)))
      + ' / 话题 ' + fmtMs(paper.speakingMs * SPEAKING_WEIGHTS.topic);
    mount.appendChild(info);

    // 换卷按钮
    const nextBtn = doc.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'sz-btn sz-btn-sm';
    nextBtn.textContent = '换一套卷';
    nextBtn.addEventListener('click', function () { app.nextPaper(); });
    mount.appendChild(nextBtn);

    // 三个题型的进度与跳转
    const tabs = doc.createElement('div');
    tabs.className = 'sz-tabs';
    const kinds: SectionKind[] = ['reading', 'qa', 'topic'];
    const names: Record<SectionKind, string> = { reading: '朗读短文', qa: '情景问答', topic: '话题简述' };
    for (const k of kinds) {
      const ans = state.answers[k];
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'sz-tab' + (state.active === k ? ' active' : '');
      b.textContent = names[k] + (ans.approximateScore !== null ? ' ✓' : '');
      b.addEventListener('click', function () { app.focus(k); });
      tabs.appendChild(b);
    }
    mount.appendChild(tabs);
    // 当前题
    const cur = activeTask(state);
    if (!cur) {
      const e2 = doc.createElement('p');
      e2.className = 'sz-error';
      e2.textContent = '题目数据缺失。';
      mount.appendChild(e2);
    } else {
      const pane = doc.createElement('section');
      pane.className = 'sz-task';

      const qh = doc.createElement('h3');
      qh.textContent = cur.title;
      pane.appendChild(qh);

      const budget = doc.createElement('p');
      budget.className = 'sz-paper-meta';
      budget.textContent = '本题建议用时：' + fmtMs(cur.budgetMs);
      pane.appendChild(budget);

      if (cur.kind === 'topic') {
        const note = doc.createElement('p');
        note.className = 'sz-src sz-src-inferred';
        note.textContent = '2025 年起考试只显示话题名，不给中文提示。';
        pane.appendChild(note);
      }

      const body = doc.createElement('blockquote');
      body.className = 'sz-text';
      body.textContent = cur.body;
      pane.appendChild(body);
      // 情景问答：第 1/2 题切换
      if (cur.kind === 'qa' && paper.qa.length > 1) {
        const sw = doc.createElement('div');
        sw.className = 'sz-tabs';
        for (let i = 0; i < paper.qa.length; i++) {
          const sb = doc.createElement('button');
          sb.type = 'button';
          sb.className = 'sz-tab' + (state.qaOrder === i ? ' active' : '');
          sb.textContent = '第 ' + (i + 1) + ' 题';
          sb.addEventListener('click', function () { app.focus('qa', i); });
          sw.appendChild(sb);
        }
        pane.appendChild(sw);
      }

      // 录音 / 手动输入
      const ctrl = doc.createElement('div');
      ctrl.className = 'sz-controls';
      const recordable = canRecord();
      const st = state.phase[cur.kind];

      const b1 = doc.createElement('button');
      b1.type = 'button';
      b1.className = 'sz-btn';
      b1.textContent = st === 'recording' ? '录音中…' : '开始录音';
      b1.disabled = !recordable || st === 'recording' || st === 'transcribing';
      if (recordable) {
        b1.addEventListener('click', function () { void app.start(); });
      }
      ctrl.appendChild(b1);

      const b2 = doc.createElement('button');
      b2.type = 'button';
      b2.className = 'sz-btn';
      b2.textContent = '结束并评分';
      b2.disabled = st !== 'recording';
      if (recordable) {
        b2.addEventListener('click', function () { void app.stop(); });
      }
      ctrl.appendChild(b2);
      if (!recordable) {
        const hn = doc.createElement('span');
        hn.className = 'sz-hint';
        hn.textContent = deps.recorder
          ? '未检测到可用麦克风，请在下方手动输入。'
          : '当前环境不支持录音，请在下方手动输入。';
        ctrl.appendChild(hn);
      }
      pane.appendChild(ctrl);

      // 手动输入：所有降级路径的兜底，也是默认路径
      const wrap = doc.createElement('div');
      wrap.className = 'sz-manual';
      const lab = doc.createElement('label');
      lab.textContent = '写下你说的内容（录音后会自动填入，也可直接手写）：';
      const ta = doc.createElement('textarea');
      ta.className = 'sz-textarea';
      ta.rows = 5;
      ta.value = state.answers[cur.kind].text;
      ta.addEventListener('input', function () { state.answers[cur.kind].text = ta.value; });
      const go = doc.createElement('button');
      go.type = 'button';
      go.className = 'sz-btn';
      go.textContent = '评分（近似）';
      go.addEventListener('click', function () { app.submitText(ta.value); });
      wrap.appendChild(lab);
      wrap.appendChild(ta);
      wrap.appendChild(go);
      pane.appendChild(wrap);

      const sc = renderScore(cur.kind);
      if (sc) pane.appendChild(sc);

      mount.appendChild(pane);
    }

    viewEl = mount;
  }
  const app: ExamApp = {
    state: function () { return state; },
    view: function () { return viewEl; },

    nextPaper: function () {
      if (!state.paper) return;
      try {
        state.paper = dealNextPaper(deps.bank, state.paper);
        state.error = null;
        state.answers = { reading: emptyAnswer(), qa: emptyAnswer(), topic: emptyAnswer() };
        state.active = 'reading';
        state.qaOrder = 0;
        state.phase = { reading: 'idle', qa: 'idle', topic: 'idle' };
      } catch (e) {
        state.error = e instanceof Error ? e.message : String(e);
      }
      render();
    },

    focus: function (kind: SectionKind, order?: number) {
      state.active = kind;
      if (kind === 'qa' && typeof order === 'number') state.qaOrder = order;
      render();
    },

    start: async function () {
      const cur = activeTask(state);
      if (!cur) return;
      if (!canRecord()) {
        state.phase[cur.kind] = 'manual';
        render();
        return;
      }
      state.phase[cur.kind] = 'recording';
      render();
      try {
        await deps.recorder!.start();
      } catch {
        state.phase[cur.kind] = 'manual';
        render();
      }
    },
    stop: async function () {
      const cur = activeTask(state);
      if (!cur || !canRecord()) return;
      let decoded: { samples: Float32Array; sampleRate: number; durationMs: number };
      try {
        decoded = await deps.recorder!.stop();
      } catch {
        state.phase[cur.kind] = 'manual';
        render();
        return;
      }
      const durationMs = decoded.durationMs > 0 ? decoded.durationMs : deps.recorder!.elapsedMs();
      if (!decoded.samples || decoded.samples.length === 0) {
        state.phase[cur.kind] = 'manual';
        render();
        return;
      }
      if (!asrReady()) {
        state.phase[cur.kind] = 'manual';
        render();
        return;
      }
      state.phase[cur.kind] = 'transcribing';
      render();
      let text = '';
      try {
        text = await deps.asr!.transcribe(decoded.samples, decoded.sampleRate);
      } catch {
        state.phase[cur.kind] = 'manual';
        render();
        return;
      }
      app.submitText(text, durationMs);
    },

    submitText: function (text: string, durationMs?: number): number | null {
      const cur = activeTask(state);
      if (!cur) return null;
      const ans = state.answers[cur.kind];
      ans.text = text;
      ans.durationMs = durationMs;
      let score: number | null = null;
      if (cur.kind === 'reading') {
        score = deps.scoreReading ? deps.scoreReading(text, cur.raw, durationMs) : null;
      } else if (cur.kind === 'qa') {
        score = deps.scoreQa ? deps.scoreQa(text, cur.raw, durationMs) : null;
      } else {
        score = deps.scoreTopic ? deps.scoreTopic(text, cur.raw, durationMs) : null;
      }
      ans.approximateScore = score;
      state.phase[cur.kind] = 'scored';
      render();
      return score;
    },

    destroy: function () {
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      viewEl = null;
    },
  };

  render();
  return app;
}
