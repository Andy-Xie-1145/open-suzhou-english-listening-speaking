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
import { SPEAKING_WEIGHTS, SPEAKING_MINUTES, LISTENING_MINUTES, QA_COUNT } from '../suzhou/paper.ts';
import { mountSuzhouListening, type SuzhouListeningApp } from './suzhou-listening.ts';
import { totalPoints, type ListeningOutcome } from '../suzhou/listening-session.ts';
import {
  initialSpeaking,
  startRecording as speakStart,
  cancelRecording as speakCancel,
  putClip,
  setText as speakSetText,
  setScore as speakSetScore,
  processAll,
  releaseAllClips,
  summarize as speakSummarize,
  pendingKinds as speakPending,
  SPEAKING_KINDS,
  type SpeakingSession,
  type SpeakingKind,
  type RecordedClip,
} from '../suzhou/speaking-session.ts';
import type { RecorderPort, AsrPort } from '../suzhou/recorder-bridge.ts';

/** 试卷的两个大部分：先听力后口语，与真实考场顺序一致 */
export type ExamPart = 'listening' | 'speaking';

export type SectionKind = SpeakingKind;

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
  /** 当前处于哪个大部分。听力必须先做完才进口语，与真实考场一致 */
  part: ExamPart;
  /** 听力结算结果；交卷前先出，供卷面显示 */
  listeningOutcome: ListeningOutcome | null;
  /** 口语三题的作答状态。考试中只录音，交卷后一次性转写评分 */
  speaking: SpeakingSession;
  active: SectionKind;
  /** 当前题在 qa 两题中的次序（0/1）；朗读与话题恒为 0 */
  qaOrder: number;
  /** 组卷失败原因 */
  error: string | null;
  /** 交卷处理中 */
  submitting: boolean;
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
    part: paper ? 'listening' : 'speaking',
    listeningOutcome: null,
    speaking: initialSpeaking(),
    active: 'reading',
    qaOrder: 0,
    error: error,
    submitting: false,
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
  /** 交卷：一次性把录音转写并评分 */
  submit(): Promise<void>;
  /** 当前作答汇总 */
  summary(): ReturnType<typeof speakSummarize>;
  destroy(): void;
}
export function mountSuzhouExam(mount: Element, deps: ExamDeps): ExamApp {
  const doc = resolveDoc(mount);
  let state = initialExamState(deps);
  let viewEl: Element | null = null;
  // 听力界面自带内部状态（当前第几段、选了哪些选项），
  // 不能跟着 render() 一起重建，否则学生选的答案会被冲掉。
  let lzApp: SuzhouListeningApp | null = null;
  let lzSeed = -1;
  // 口语总倒计时；听力部分不计入
  let timer: ReturnType<typeof setInterval> | null = null;
  let examEndsAt = 0;

  function canRecord(): boolean {
    const r = deps.recorder;
    if (!r) return false;
    try { return r.canRecord(); } catch { return false; }
  }

  /** 按题型分发评分回调 */
  function scoreOf(kind: SectionKind, text: string, durationMs: number): number | null {
    const cur = activeTask(state);
    const raw = cur && cur.kind === kind ? cur.raw : null;
    if (kind === 'reading') return deps.scoreReading ? deps.scoreReading(text, raw, durationMs) : null;
    if (kind === 'qa') return deps.scoreQa ? deps.scoreQa(text, raw, durationMs) : null;
    return deps.scoreTopic ? deps.scoreTopic(text, raw, durationMs) : null;
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
    const sc = state.speaking.score[kind];
    if (sc === null) return null;
    const d = disclaimerBlock();
    const box = doc.createElement('div');
    box.className = 'sz-score-inline';
    const num = doc.createElement('strong');
    num.className = 'sz-score-num';
    num.textContent = String(sc);
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
  /** 交卷栏：待处理几题 + 交卷按钮 + 交卷后的汇总 */
  function renderSubmitBar(): HTMLElement {
    const box = doc.createElement('div');
    box.className = 'sz-submitbar';

    const pending = speakPending(state.speaking);
    const sum = speakSummarize(state.speaking);

    if (pending.length > 0) {
      const h = doc.createElement('p');
      h.className = 'sz-hint';
      h.textContent = '还有 ' + pending.length + ' 题的录音待处理。交卷后会一次性转写并评分，考试过程中不做这件事。';
      box.appendChild(h);
    } else if (SPEAKING_KINDS.some(function (k) { return state.speaking.score[k] !== null; })) {
      const h = doc.createElement('p');
      h.className = 'sz-hint';
      h.textContent = '口语近似分合计 ' + sum.total + ' 分（满分 10）　' + disclaimerBlock().badge;
      box.appendChild(h);
      if (sum.needsManual.length > 0) {
        const w = doc.createElement('p');
        w.className = 'sz-hint';
        w.textContent = '这 ' + sum.needsManual.length + ' 题没能自动处理，可点开对应题型手动补写内容再评分。';
        box.appendChild(w);
      }
    }

    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'sz-btn';
    btn.textContent = state.submitting ? '正在处理…' : '交卷并统一评分';
    btn.disabled = state.submitting;
    btn.addEventListener('click', function () { void app.submit(); });
    box.appendChild(btn);
    return box;
  }

  function render(): void {
    while (mount.firstChild) mount.removeChild(mount.firstChild);
    mount.appendChild(renderBanner());

    const h = doc.createElement('h2');
    h.textContent = '苏州中考英语听力口语 · 全卷模考（近似模拟）';
    mount.appendChild(h);

    const lead = doc.createElement('p');
    lead.className = 'sz-sc-lead';
    lead.textContent = '打开即出一份完整卷。考生实际作答 22 分钟 = 听力 ' + LISTENING_MINUTES + ' 分钟 + 口语 ' + SPEAKING_MINUTES + ' 分钟，先听力后口语。';
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
      + '　|　听力 ' + LISTENING_MINUTES + ' 分钟'
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

    // ---- 听力部分：独立界面，渲染在口语之前 ----
    if (state.part === 'listening') {
      if (lzSeed !== paper.seed) {
        if (lzApp) lzApp.destroy();
        lzApp = null;
        lzSeed = paper.seed;
        const host = doc.createElement('div');
        host.className = 'sz-task';
        mount.appendChild(host);
        lzApp = mountSuzhouListening(host, {
          listening: paper.listening,
          onFinish: function (o) {
            state.listeningOutcome = o;
            state.part = 'speaking';
            render();
          },
        });
        void lzApp.start();
      } else if (lzApp) {
        // 重绘把挂载点清空了，把听力根元素接回去，内部状态不丢
        mount.appendChild(lzApp.el());
      }
      viewEl = mount;
      return;
    }

    // 听力已结束：显示得分，然后才是口语三个题型
    if (state.listeningOutcome && lzApp) {
      const ls = doc.createElement('p');
      ls.className = 'sz-score-inline';
      const ln = doc.createElement('strong');
      ln.textContent = String(totalPoints(state.listeningOutcome));
      ls.appendChild(ln);
      ls.appendChild(doc.createTextNode(' / 20 听力　'));
      const lb = doc.createElement('span');
      lb.className = 'sz-badge';
      lb.textContent = disclaimerBlock().badge;
      ls.appendChild(lb);
      mount.appendChild(ls);
    }

    // 三个题型的进度与跳转
    const tabs = doc.createElement('div');
    tabs.className = 'sz-tabs';
    const kinds: SectionKind[] = ['reading', 'qa', 'topic'];
    const names: Record<SectionKind, string> = { reading: '朗读短文', qa: '情景问答', topic: '话题简述' };
    for (const k of kinds) {
      const b = doc.createElement('button');
      b.type = 'button';
      b.className = 'sz-tab' + (state.active === k ? ' active' : '');
      const ph = state.speaking.phase[k];
      b.textContent = names[k] + (ph === 'recorded' ? ' ●' : state.speaking.score[k] !== null ? ' ✓' : '');
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
      const st = state.speaking.phase[cur.kind];

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
      b2.textContent = '结束录音';
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
      lab.textContent = st === 'recorded'
        ? '录音已保存在内存里，交卷后统一转写评分。也可以直接手写：'
        : '写下你说的内容（也可以直接手写）：';
      const ta = doc.createElement('textarea');
      ta.className = 'sz-textarea';
      ta.rows = 5;
      ta.value = state.speaking.text[cur.kind];
      ta.addEventListener('input', function () { state.speaking = speakSetText(state.speaking, cur.kind, ta.value); });
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

      // 该题转写失败时给出可执行提示
      const err = state.speaking.errors[cur.kind];
      if (err) {
        const ep = doc.createElement('p');
        ep.className = 'sz-error';
        ep.textContent = err;
        pane.appendChild(ep);
      }

      mount.appendChild(pane);
      mount.appendChild(renderSubmitBar());
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
        if (lzApp) { lzApp.destroy(); lzApp = null; lzSeed = -1; }
        state.part = 'listening';
        state.listeningOutcome = null;
        releaseAllClips(state.speaking);
        state.speaking = initialSpeaking();
        state.active = 'reading';
        state.qaOrder = 0;
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
        state.speaking = { ...state.speaking, phase: { ...state.speaking.phase, [cur.kind]: 'manual' } };
        render();
        return;
      }
      state.speaking = speakStart(state.speaking, cur.kind);
      render();
      try {
        await deps.recorder!.start();
      } catch {
        state.speaking = speakCancel(state.speaking, cur.kind);
        render();
      }
    },
    /**
     * 结束录音：**只存音频，当场不转写、不评分。**
     *
     * 第一次作答时就要下模型，这一下卡顿落在考试时间里是最糟的。
     * 转写与评分全部推迟到交卷后由 submit() 一次性做。
     */
    stop: async function () {
      const cur = activeTask(state);
      if (!cur || !canRecord()) return;
      let decoded: { samples: Float32Array; sampleRate: number; durationMs: number };
      try {
        decoded = await deps.recorder!.stop();
      } catch {
        state.speaking = { ...state.speaking, phase: { ...state.speaking.phase, [cur.kind]: 'manual' } };
        render();
        return;
      }
      const durationMs = decoded.durationMs > 0 ? decoded.durationMs : deps.recorder!.elapsedMs();
      const clip: RecordedClip = {
        samples: decoded.samples,
        sampleRate: decoded.sampleRate,
        durationMs: durationMs,
      };
      state.speaking = putClip(state.speaking, cur.kind, clip);
      render();
    },

    /** 交卷：一次性把录到的音频全部转写并评分 */
    submit: async function () {
      if (!asrReady() && speakPending(state.speaking).length > 0) {
        // 没有 ASR 就别硬跑，交卷会把手写题正常评分，录音题转人工
        for (const k of speakPending(state.speaking)) {
          state.speaking = {
            ...state.speaking,
            phase: { ...state.speaking.phase, [k]: 'manual' },
            errors: { ...state.speaking.errors, [k]: '未加载语音转写模型，无法自动转写。可在下方手动补写内容。' },
          };
        }
        render();
        return;
      }
      state.submitting = true;
      render();
      state.speaking = await processAll(state.speaking, {
        transcribe: async function (samples, sampleRate) {
          return deps.asr!.transcribe(samples, sampleRate);
        },
        score: function (kind, text, durationMs) {
          return scoreOf(kind, text, durationMs);
        },
      });
      state.submitting = false;
      render();
    },

    /** 汇总当前全部作答（含未交卷时的预览） */
    summary: function () {
      return speakSummarize(state.speaking);
    },

    submitText: function (text: string, durationMs?: number): number | null {
      const cur = activeTask(state);
      if (!cur) return null;
      state.speaking = speakSetText(state.speaking, cur.kind, text);
      const score = scoreOf(cur.kind, text, durationMs ?? 0);
      state.speaking = speakSetScore(state.speaking, cur.kind, score);
      render();
      return score;
    },

    destroy: function () {
      if (lzApp) { lzApp.destroy(); lzApp = null; }
      if (timer) clearInterval(timer);
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      viewEl = null;
    },
  };

  render();
  return app;
}