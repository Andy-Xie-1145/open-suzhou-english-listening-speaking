/**
 * 话题简述界面（Q5，苏州中考题型）
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 所有分数带「近似模拟」标识。见 spec/suzhou-listening-speaking.spec.md 第 0 节。
 *
 * 2025 年起考试**只显示话题名，不给中文提示**，因此界面上 displayText 只有英文。
 * 中文 hint 仅供教师/家长复盘，默认折叠。
 *
 * 降级设计与朗读题一致：无麦克风 / 无 ASR / 模型未加载 → 手动输入。
 */

import { scoreTopic, toTopicTask, type RawTopic, type TopicTask, type TopicResult } from '../suzhou/topic-section.ts';
import { disclaimerBlock } from '../suzhou/disclaimer.ts';
import type { RecorderPort, AsrPort } from '../suzhou/recorder-bridge.ts';

export type TopicPhase =
  | 'idle'
  | 'loading-asr'
  | 'recording'
  | 'transcribing'
  | 'manual'
  | 'scored'
  | 'error';

export interface TopicDeps {
  topics: readonly RawTopic[];
  recorder?: RecorderPort | null;
  asr?: AsrPort | null;
  topicIndex?: number;
}

export interface TopicState {
  phase: TopicPhase;
  task: TopicTask | null;
  result: TopicResult | null;
  manualText: string;
  error: string | null;
}

export function initialTopicState(topics: readonly RawTopic[], index?: number): TopicState {
  const i = typeof index === 'number' && index >= 0 && index < topics.length ? index : 0;
  return {
    phase: 'idle',
    task: topics.length > 0 ? toTopicTask(topics[i], i) : null,
    result: null,
    manualText: '',
    error: null,
  };
}
export interface TopicScoreView {
  label: string;
  value: number;
  badge: string;
  disclaimer: string[];
  limits: string[];
  /** 硬门槛判定结果 */  passed: boolean;
  /** 界面必须直说的那句话，如「只说了 3 句，要求至少 7 句」 */  gateMessage: string;
  dimensions: Array<{
 label: string;
 valueText: string;
 percent: number;
 note: string }
>;
  advice: string[];
  meta: {
    displayText: string;
    hint: string;
    required: number;
    actual: number;
  };
}
export function toTopicScoreView(task: TopicTask, result: TopicResult): TopicScoreView {
  const d = disclaimerBlock();
  return {
    label: d.scoreLabel,
    value: result.approximateScore,
    badge: d.badge,
    disclaimer: d.paragraphs,
    limits: d.limits,
    passed: result.passedMinSentences,
    gateMessage: result.passedMinSentences
      ? '已达硬门槛（' + result.sentenceCount + ' / ' + result.requiredSentences + ' 句）'
      : '只说了 ' + result.sentenceCount + ' 句，要求至少 ' + result.requiredSentences + ' 句',
    dimensions: result.dimensions.map(function (x) {
      return {
        label: x.label,
        valueText: Math.round(x.value * 100) + '%',
        percent: Math.round(x.value * 100),
        note: x.note,
      };
    }),
    advice: result.advice.slice(),
    meta: {
      displayText: task.displayText,
      hint: task.hint,
      required: result.requiredSentences,
      actual: result.sentenceCount,
    },
  };
}
/* ------------------------------------------------------------------ * * 装配 * ------------------------------------------------------------------ */
function resolveDoc(mount: Element): Document {
  const owner = mount.ownerDocument as Document | undefined;
  const g = typeof document === 'undefined' ? undefined : document;
  const found: Document | undefined = owner ?? g;
  if (found === undefined) throw new Error('需要 DOM 环境');
  return found;
}
export interface TopicApp {
  state(): TopicState;
  view(): Element | null;
  loadAsr(modelKey?: string): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
  submitText(text: string, durationMs?: number): TopicResult | null;
  destroy(): void;
}
export function mountSuzhouTopic(mount: Element, deps: TopicDeps): TopicApp {
  const doc = resolveDoc(mount);
  let state = initialTopicState(deps.topics, deps.topicIndex);
  let viewEl: Element | null = null;
  function canRecord(): boolean {
    const r = deps.recorder;
    if (!r) return false;
    try {
 return r.canRecord();
 }
 catch {
 return false;
 }
  }
  function asrReady(): boolean {
    const a = deps.asr;
    if (!a) return false;
    try {
 return a.ready();
 }
 catch {
 return false;
 }
  }
  function render(): void {    while (mount.firstChild) mount.removeChild(mount.firstChild);

    const banner = doc.createElement('div');
    banner.className = 'sz-banner';
    banner.setAttribute('role', 'note');
    banner.textContent = disclaimerBlock().banner;
    mount.appendChild(banner);

    if (state.error) {
      const e0 = doc.createElement('p');
      e0.className = 'sz-error';
      e0.textContent = state.error;
      mount.appendChild(e0);
    }

    const task = state.task;
    if (!task) {
      const e1 = doc.createElement('p');
      e1.className = 'sz-error';
      e1.textContent = '语料未加载，无法出题。';
      mount.appendChild(e1);
      viewEl = mount;
      return;
    }

    const h = doc.createElement('h2');
    h.textContent = '话题简述（苏州中考题型 · 近似模拟）';
    mount.appendChild(h);

    const q = doc.createElement('p');
    q.className = 'sz-topic-q';
    q.textContent = task.displayText;
    mount.appendChild(q);

    const hintBox = doc.createElement('details');
    hintBox.className = 'sz-hint-box';
    const sum = doc.createElement('summary');
    sum.textContent = '中文意思与常用句式（仅供参考，考试不显示）';
    hintBox.appendChild(sum);
    const hintP = doc.createElement('p');
    hintP.textContent = task.hint;
    hintBox.appendChild(hintP);
    for (const g of task.keyExpressions) {
      const gp = doc.createElement('p');
      gp.className = 'sz-expr';
      gp.textContent = g.group + '：' + g.items.join('　/　');
      hintBox.appendChild(gp);
    }
    mount.appendChild(hintBox);

    const recordable = canRecord();
    const ctrl = doc.createElement('div');
    ctrl.className = 'sz-controls';
    const b1 = doc.createElement('button');
    b1.type = 'button';
    b1.className = 'sz-btn';
    b1.textContent = state.phase === 'recording' ? '录音中…' : '开始录音';
    b1.disabled = !recordable || state.phase === 'recording' || state.phase === 'transcribing' || state.phase === 'loading-asr';
    if (recordable) {
      b1.addEventListener('click', function () { void app.start(); });
    }
    ctrl.appendChild(b1);
    const b2 = doc.createElement('button');
    b2.type = 'button';
    b2.className = 'sz-btn';
    b2.textContent = '结束并评分';
    b2.disabled = state.phase !== 'recording';
    if (recordable) {
      b2.addEventListener('click', function () { void app.stop(); });
    }
    ctrl.appendChild(b2);
    if (!recordable) {
      const hn = doc.createElement('span');
      hn.className = 'sz-hint';
      hn.textContent = deps.recorder ? '未检测到可用麦克风，请在下方手动输入。' : '当前环境不支持录音，请在下方手动输入。';
      ctrl.appendChild(hn);
    }
    mount.appendChild(ctrl);
    if (recordable && deps.asr && !asrReady()) {
      const ab = doc.createElement('div');
      ab.className = 'sz-asr';
      const msg = doc.createElement('p');
      msg.className = 'sz-asr-msg';
      try {
        msg.textContent = deps.asr.status().message;
      } catch {
        msg.textContent = '语音转写未加载。';
      }
      ab.appendChild(msg);
      const bl = doc.createElement('button');
      bl.type = 'button';
      bl.className = 'sz-btn sz-btn-sm';
      bl.textContent = state.phase === 'loading-asr' ? '加载中…' : '加载语音转写模型';
      bl.disabled = state.phase === 'loading-asr';
      bl.addEventListener('click', function () { void app.loadAsr(); });
      ab.appendChild(bl);
      const alt = doc.createElement('p');
      alt.className = 'sz-hint';
      alt.textContent = '不加载也可以：直接在下方手动输入，评估结果完全相同。';
      ab.appendChild(alt);
      mount.appendChild(ab);
    }

    if (state.phase === 'manual' || !recordable) {
      const wrap = doc.createElement('div');
      wrap.className = 'sz-manual';
      const lab = doc.createElement('label');
      lab.textContent = '手动输入你说的内容：';
      const ta = doc.createElement('textarea');
      ta.className = 'sz-textarea';
      ta.rows = 6;
      ta.value = state.manualText;
      ta.addEventListener('input', function () { state.manualText = ta.value; });
      const go = doc.createElement('button');
      go.type = 'button';
      go.className = 'sz-btn';
      go.textContent = '按我的表达评分（近似）';
      go.addEventListener('click', function () { app.submitText(ta.value); });
      wrap.appendChild(lab);
      wrap.appendChild(ta);
      wrap.appendChild(go);
      mount.appendChild(wrap);
    }
    if (state.result) {
      const view = toTopicScoreView(task, state.result);
      const pane = doc.createElement('section');
      pane.className = 'sz-score';

      const head2 = doc.createElement('div');
      head2.className = 'sz-score-head';
      const num = doc.createElement('strong');
      num.className = 'sz-score-num';
      num.textContent = String(view.value);
      const lab2 = doc.createElement('span');
      lab2.className = 'sz-score-label';
      lab2.textContent = view.label;
      const badge = doc.createElement('span');
      badge.className = 'sz-badge';
      badge.textContent = view.badge;
      head2.appendChild(num);
      head2.appendChild(lab2);
      head2.appendChild(badge);
      pane.appendChild(head2);

      const gate = doc.createElement('p');
      gate.className = view.passed ? 'sz-gate ok' : 'sz-gate bad';
      gate.textContent = view.gateMessage;
      pane.appendChild(gate);

      for (const p1 of view.disclaimer) {
        const d1 = doc.createElement('p');
        d1.className = 'sz-disclaimer';
        d1.textContent = p1;
        pane.appendChild(d1);
      }

      const dims = doc.createElement('div');
      dims.className = 'sz-dims';
      for (const d2 of view.dimensions) {
        const row = doc.createElement('div');
        row.className = 'sz-dim';
        const top = doc.createElement('div');
        top.className = 'sz-dim-top';
        const n1 = doc.createElement('span');
        n1.textContent = d2.label;
        const v1 = doc.createElement('span');
        v1.className = 'sz-dim-val';
        v1.textContent = d2.valueText;
        top.appendChild(n1);
        top.appendChild(v1);
        const bar = doc.createElement('div');
        bar.className = 'sz-bar';
        const fill = doc.createElement('div');
        fill.className = 'sz-bar-fill';
        fill.style.width = d2.percent + '%';
        bar.appendChild(fill);
        const nt = doc.createElement('div');
        nt.className = 'sz-dim-note';
        nt.textContent = d2.note;
        row.appendChild(top);
        row.appendChild(bar);
        row.appendChild(nt);
        dims.appendChild(row);
      }
      pane.appendChild(dims);
      if (view.advice.length > 0) {
        const ul1 = doc.createElement('ul');
        ul1.className = 'sz-feedback';
        for (const a1 of view.advice) {
          const li1 = doc.createElement('li');
          li1.textContent = a1;
          ul1.appendChild(li1);
        }
        pane.appendChild(ul1);
      }

      const lim = doc.createElement('details');
      lim.className = 'sz-limits';
      const sum2 = doc.createElement('summary');
      sum2.textContent = '本工具做不到的事（' + view.limits.length + ' 项）';
      lim.appendChild(sum2);
      const ul2 = doc.createElement('ul');
      for (const l2 of view.limits) {
        const li2 = doc.createElement('li');
        li2.textContent = l2;
        ul2.appendChild(li2);
      }
      lim.appendChild(ul2);
      pane.appendChild(lim);
      mount.appendChild(pane);
    }

    viewEl = mount;
  }
  const app: TopicApp = {
    state: function () { return state; },
    view: function () { return viewEl; },

    loadAsr: async function (modelKey?: string): Promise<boolean> {
      const a = deps.asr;
      if (!a) return false;
      state.error = null;
      state.phase = 'loading-asr';
      render();
      let ok = false;
      try {
        ok = await a.load((modelKey as never) ?? undefined);
      } catch (e) {
        ok = false;
        state.error = '模型加载异常：' + (e instanceof Error ? e.message : String(e));
      }
      state.phase = 'idle';
      if (!ok) {
        try {
          if (!state.error) state.error = a.status().message;
        } catch { /* ignore */ }
      }
      render();
      return ok;
    },
    start: async function () {
      if (!state.task) return;
      if (!canRecord()) {
        state.phase = 'manual';
        state.error = '未检测到可用麦克风。请在下方手动输入，评估流程完全相同。';
        render();
        return;
      }
      state.error = null;
      state.phase = 'recording';
      render();
      try {
        await deps.recorder!.start();
      } catch (e) {
        state.phase = 'manual';
        state.error = '无法开始录音：' + (e instanceof Error ? e.message : String(e)) + '　请在下方手动输入，评估流程完全相同。';
        render();
      }
    },

    stop: async function () {
      if (!canRecord() || !state.task) return;
      let decoded: { samples: Float32Array; sampleRate: number; durationMs: number };
      try {
        decoded = await deps.recorder!.stop();
      } catch (e) {
        state.phase = 'manual';
        state.error = '录音结束失败：' + (e instanceof Error ? e.message : String(e)) + '　请在下方手动输入。';
        render();
        return;
      }
      const durationMs = decoded.durationMs > 0 ? decoded.durationMs : deps.recorder!.elapsedMs();
      if (!decoded.samples || decoded.samples.length === 0) {
        state.phase = 'manual';
        state.error = '没有采集到音频，可能是麦克风被占用或权限异常。请手动输入。';
        render();
        return;
      }
      if (!asrReady()) {
        state.phase = 'manual';
        state.error = '录音已完成，但语音转写未加载，无法自动识别文字。请在下方手动输入。';
        render();
        return;
      }
      state.phase = 'transcribing';
      render();
      let text = '';
      try {
        text = await deps.asr!.transcribe(decoded.samples, decoded.sampleRate);
      } catch (e) {
        state.phase = 'manual';
        state.error = '自动转写失败：' + (e instanceof Error ? e.message : String(e)) + '　请在下方手动输入，评估流程完全相同。';
        render();
        return;
      }
      app.submitText(text, durationMs);
    },
    submitText: function (text: string, durationMs?: number): TopicResult | null {
      if (!state.task) {
        state.error = '语料未加载，无法评分。';
        render();
        return null;
      }
      if (!text || !text.trim()) {
        state.error = '没有可评分的内容。';
        render();
        return null;
      }
      state.error = null;
      state.result = scoreTopic({ transcript: text, task: state.task, durationMs: durationMs });
      state.phase = 'scored';
      render();
      return state.result;
    },

    destroy: function () {
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      viewEl = null;
    },
  };

  render();
  return app;
}
