/**
 * 情景问答界面（Q4，苏州中考题型）
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 所有分数带「近似模拟」标识。见 spec/suzhou-listening-speaking.spec.md 第 0 节。
 *
 * 界面要求（对应用户需求）：
 *  - **每题单独出分**，不合并成一个数字
 *  - 直接写清**是哪一条要点没覆盖、哪个关键词没命中**，不只给覆盖率
 *  - 中文 scenario 不显示，仅供教师参考
 *  - 降级路径与前两轮一致，且每个降级分支都保留近似声明横幅
 */

import { toQaTask, scoreQa, drawQaPair, type QaTask, type QaResult, type RawQa } from '../suzhou/qa-section.ts';
import { disclaimerBlock } from '../suzhou/disclaimer.ts';
import type { RecorderPort, AsrPort } from '../suzhou/recorder-bridge.ts';
import {
  resolveDoc, canRecord as canRecordWith, asrReady as asrReadyWith,
  bannerBlock, asrBlock, manualBlock, scoreHead, dimsBlock, limitsDetails,
} from './suzhou-section-kit.ts';

export type QaPhase =
  | 'idle'
  | 'loading-asr'
  | 'recording'
  | 'transcribing'
  | 'manual'
  | 'scored'
  | 'error';

export interface QaItemState {
  task: QaTask;
  /** 学生为该题输入/转写的内容 */
  text: string;
  durationMs?: number;
  result: QaResult | null;
  phase: QaPhase;
  error: string | null;
}

export interface QaDeps {
  questions: readonly RawQa[];
  /** 每题的 enKeywords，key 为题目 id */
  enKeywords: Record<string, string[][]>;
  recorder?: RecorderPort | null;
  asr?: AsrPort | null;
  seed?: number;
}

export interface QaState {
  items: QaItemState[];
  /** 当前聚焦的题号 0/1 */
  active: number;
}

export function initialQaState(deps: QaDeps): QaState {
  const tasks: QaTask[] = [];
  for (const raw of deps.questions) {
    const kws = deps.enKeywords[raw.id];
    if (!kws) continue;
    try {
      tasks.push(toQaTask(raw, kws));
    } catch {
      // 关键词数量不匹配的题直接跳过，不让整个模块挂掉
    }
  }
  const picked = drawQaPair(tasks, typeof deps.seed === 'number' ? deps.seed : 20260101);
  return {
    items: picked.map(function (t) {
      return { task: t, text: '', result: null, phase: 'idle' as QaPhase, error: null };
    }),
    active: 0,
  };
}

/* ------------------------------------------------------------------ *
 * 视图模型
 * ------------------------------------------------------------------ */

export interface KeyPointView {
  index: number;
  label: string;
  covered: boolean;
  hit: string[];
  missed: string[];
}

export interface QaScoreView {
  question: string;
  /** 分数标签：固定为「近似分」 */
  label: string;
  value: number;
  badge: string;
  responded: boolean;
  respondedText: string;
  coverageText: string;
  dimensions: Array<{ label: string; valueText: string; percent: number; note: string }>;
  keyPoints: KeyPointView[];
  advice: string[];
}

export function toQaScoreView(result: QaResult): QaScoreView {
  const d = disclaimerBlock();
  return {
    question: '',
    label: d.scoreLabel,
    value: result.approximateScore,
    badge: d.badge,
    responded: result.responded,
    respondedText: result.responded
      ? '已对问句作出回应'
      : '未对问句作出实质回应',
    coverageText: result.keyPoints.filter(function (k) { return k.covered; }).length
      + ' / ' + result.keyPoints.length + ' 个要点已覆盖',
    dimensions: result.dimensions.map(function (x) {
      return {
        label: x.label,
        valueText: Math.round(x.value * 100) + '%',
        percent: Math.round(x.value * 100),
        note: x.note,
      };
    }),
    keyPoints: result.keyPoints.map(function (k) {
      return {
        index: k.index,
        label: k.label,
        covered: k.covered,
        hit: k.hit.slice(),
        missed: k.missed.slice(),
      };
    }),
    advice: result.advice.slice(),
  };
}
export interface QaApp {
  state(): QaState;
  view(): Element | null;
  loadAsr(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
  submitText(text: string, durationMs?: number): QaResult | null;
  /** 切换到第 index 题（0 起） */
  focus(index: number): void;
  destroy(): void;
}

export function mountSuzhouQa(mount: Element, deps: QaDeps): QaApp {
  const doc = resolveDoc(mount);
  let state = initialQaState(deps);
  let viewEl: Element | null = null;

  function canRecord(): boolean {
    return canRecordWith(deps.recorder);
  }

  function asrReady(): boolean {
    return asrReadyWith(deps.asr);
  }

  function renderOne(doc2: Document, idx: number): HTMLElement {
    const it = state.items[idx];
    const box = doc2.createElement('div');
    box.className = 'sz-qa-item';

    const h = doc2.createElement('h3');
    h.textContent = '第 ' + (idx + 1) + ' 题（共 ' + state.items.length + ' 题）';
    box.appendChild(h);

    const q = doc2.createElement('p');
    q.className = 'sz-qa-q';
    q.textContent = it.task.question;
    box.appendChild(q);

    const cat = doc2.createElement('p');
    cat.className = 'sz-qa-cat';
    cat.textContent = '情境类别：' + it.task.category;
    box.appendChild(cat);

    // 中文情境默认折叠，标注仅教师参考
    const sc = doc2.createElement('details');
    sc.className = 'sz-hint-box';
    const scSum = doc2.createElement('summary');
    scSum.textContent = '中文情境（仅教师参考，界面默认不显示）';
    sc.appendChild(scSum);
    const scP = doc2.createElement('p');
    scP.textContent = it.task.scenario;
    sc.appendChild(scP);
    box.appendChild(sc);

    if (it.error) {
      const e = doc2.createElement('p');
      e.className = 'sz-error';
      e.textContent = it.error;
      box.appendChild(e);
    }

    const recordable = canRecord();
    const ctrl = doc2.createElement('div');
    ctrl.className = 'sz-controls';
    const b1 = doc2.createElement('button');
    b1.type = 'button';
    b1.className = 'sz-btn';
    b1.textContent = it.phase === 'recording' ? '录音中…' : '开始录音';
    b1.disabled = !recordable || it.phase === 'recording' || it.phase === 'transcribing' || it.phase === 'loading-asr';
    if (recordable) {
      b1.addEventListener('click', function () { void app.start(); });
    }
    ctrl.appendChild(b1);
    const b2 = doc2.createElement('button');
    b2.type = 'button';
    b2.className = 'sz-btn';
    b2.textContent = '结束并评分';
    b2.disabled = it.phase !== 'recording';
    if (recordable) {
      b2.addEventListener('click', function () { void app.stop(); });
    }
    ctrl.appendChild(b2);
    if (!recordable) {
      const hn = doc2.createElement('span');
      hn.className = 'sz-hint';
      hn.textContent = '未检测到可用麦克风，请在下方手动输入。';
      ctrl.appendChild(hn);
    }
    box.appendChild(ctrl);

    if (it.phase === 'manual' || !recordable) {
      box.appendChild(manualBlock(doc2, {
        label: '手动输入你的回答：',
        submitLabel: '按我的回答评分（近似）',
        initial: it.text,
        onInput: function (v) { it.text = v; },
        onSubmit: function (v) { app.submitText(v); },
      }));
    }

    return box;
  }
  function renderResult(doc2: Document, idx: number): HTMLElement {
    const it = state.items[idx];
    if (!it.result) return doc2.createElement('div');
    const view = toQaScoreView(it.result);
    view.question = it.task.question;

    const pane = doc2.createElement('section');
    pane.className = 'sz-score';

    pane.appendChild(scoreHead(doc2, view));

    const resp = doc2.createElement('p');
    resp.className = view.responded ? 'sz-gate ok' : 'sz-gate bad';
    resp.textContent = view.respondedText;
    pane.appendChild(resp);

    const cov = doc2.createElement('p');
    cov.className = 'sz-qa-cov';
    cov.textContent = view.coverageText;
    pane.appendChild(cov);

    // 逐条要点：命中了哪个词、漏了哪个词，全部摊开
    const kpBox = doc2.createElement('div');
    kpBox.className = 'sz-kp';
    for (const k of view.keyPoints) {
      const row = doc2.createElement('div');
      row.className = k.covered ? 'sz-kp-row ok' : 'sz-kp-row bad';
      const head2 = doc2.createElement('div');
      head2.className = 'sz-kp-head';
      const mark = doc2.createElement('span');
      mark.className = 'sz-kp-mark';
      mark.textContent = k.covered ? '✓' : '✕';
      const label = doc2.createElement('span');
      label.className = 'sz-kp-label';
      label.textContent = '要点 ' + (k.index + 1) + '：' + k.label;
      head2.appendChild(mark);
      head2.appendChild(label);
      row.appendChild(head2);
      const hitLine = doc2.createElement('div');
      hitLine.className = 'sz-kp-detail';
      hitLine.textContent = k.covered
        ? ('命中：' + k.hit.join('、'))
        : ('未命中，可试试这些说法：' + k.missed.slice(0, 8).join(' / '));
      row.appendChild(hitLine);
      kpBox.appendChild(row);
    }
    pane.appendChild(kpBox);
    pane.appendChild(dimsBlock(doc2, view.dimensions));

    if (view.advice.length > 0) {
      const ul = doc2.createElement('ul');
      ul.className = 'sz-feedback';
      for (const a of view.advice) {
        const li = doc2.createElement('li');
        li.textContent = a;
        ul.appendChild(li);
      }
      pane.appendChild(ul);
    }

    pane.appendChild(limitsDetails(doc2));

    return pane;
  }
  function render(): void {
    while (mount.firstChild) mount.removeChild(mount.firstChild);

    mount.appendChild(bannerBlock(doc));

    const h = doc.createElement('h2');
    h.textContent = '情景问答（苏州中考题型 · 近似模拟）';
    mount.appendChild(h);

    const lead = doc.createElement('p');
    lead.className = 'sz-sc-lead';
    lead.textContent = '本题为半开放题：有明确的问句必须回应，但回答内容自由。';
    mount.appendChild(lead);

    if (state.items.length === 0) {
      const e = doc.createElement('p');
      e.className = 'sz-error';
      e.textContent = '题库未加载或关键词不匹配，无法出题。';
      mount.appendChild(e);
      viewEl = mount;
      return;
    }

    // ASR 模型加载（只在能录音且未就绪时出现）
    if (canRecord() && deps.asr && !asrReady()) {
      mount.appendChild(asrBlock(doc, {
        asr: deps.asr,
        onLoad: function () { void app.loadAsr(); },
        altText: '不加载也可以：手动输入，评估结果完全相同。',
        buttonLabel: '加载语音转写模型',
      }));
    }

    // 两题分别渲染，各自独立出分
    for (let i = 0; i < state.items.length; i++) {
      mount.appendChild(renderOne(doc, i));
      if (state.items[i].result) mount.appendChild(renderResult(doc, i));
    }

    viewEl = mount;
  }
  const app: QaApp = {
    state: function () { return state; },
    view: function () { return viewEl; },
    focus: function (index: number) {
      if (index >= 0 && index < state.items.length) {
        state.active = index;
        render();
      }
    },

    loadAsr: async function (): Promise<boolean> {
      const a = deps.asr;
      if (!a) return false;
      for (const it of state.items) {
        it.error = null;
        it.phase = 'loading-asr';
      }
      render();
      let ok = false;
      try {
        ok = await a.load();
      } catch (e) {
        ok = false;
        for (const it of state.items) {
          it.error = '模型加载异常：' + (e instanceof Error ? e.message : String(e));
        }
      }
      for (const it of state.items) {
        it.phase = 'idle';
        if (!ok && !it.error) {
          try { it.error = a.status().message; } catch { /* ignore */ }
        }
      }
      render();
      return ok;
    },

    start: async function () {
      const it = state.items[state.active];
      if (!it) return;
      if (!canRecord()) {
        it.phase = 'manual';
        it.error = '未检测到可用麦克风。请在下方手动输入，评估流程完全相同。';
        render();
        return;
      }
      it.error = null;
      it.phase = 'recording';
      render();
      try {
        await deps.recorder!.start();
      } catch (e) {
        it.phase = 'manual';
        it.error = '无法开始录音：' + (e instanceof Error ? e.message : String(e)) + '　请手动输入。';
        render();
      }
    },
    stop: async function () {
      const it = state.items[state.active];
      if (!it || !canRecord()) return;
      let decoded: { samples: Float32Array; sampleRate: number; durationMs: number };
      try {
        decoded = await deps.recorder!.stop();
      } catch (e) {
        it.phase = 'manual';
        it.error = '录音结束失败：' + (e instanceof Error ? e.message : String(e)) + '　请手动输入。';
        render();
        return;
      }
      const durationMs = decoded.durationMs > 0 ? decoded.durationMs : deps.recorder!.elapsedMs();
      if (!decoded.samples || decoded.samples.length === 0) {
        it.phase = 'manual';
        it.error = '没有采集到音频，请手动输入。';
        render();
        return;
      }
      if (!asrReady()) {
        it.phase = 'manual';
        it.error = '录音已完成，但语音转写未加载。请在下方手动输入。';
        render();
        return;
      }
      it.phase = 'transcribing';
      render();
      let text = '';
      try {
        text = await deps.asr!.transcribe(decoded.samples, decoded.sampleRate);
      } catch (e) {
        it.phase = 'manual';
        it.error = '自动转写失败：' + (e instanceof Error ? e.message : String(e)) + '　请手动输入，评估流程完全相同。';
        render();
        return;
      }
      app.submitText(text, durationMs);
    },

    submitText: function (text: string, durationMs?: number): QaResult | null {
      const it = state.items[state.active];
      if (!it) {
        return null;
      }
      if (text === undefined || text === null) {
        return null;
      }
      it.text = text;
      it.durationMs = durationMs;
      it.error = null;
      it.result = scoreQa({ transcript: text, task: it.task, durationMs: durationMs });
      it.phase = 'scored';
      render();
      return it.result;
    },

    destroy: function () {
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      viewEl = null;
    },
  };

  render();
  return app;
}
