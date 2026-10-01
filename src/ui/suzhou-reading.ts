/**
 * 朗读短文界面（苏州中考题型）
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 本界面的每一个数字都带「近似模拟」标识，不得移除。
 * 见 spec/suzhou-listening-speaking.spec.md 第 0 节。
 *
 * 职责：
 *  1. 从 24 篇中取一题，显示原文与材料来源（官方公布 vs 本项目推定）
 *  2. 录音（浏览器 MediaRecorder，音频只在内存，不上传）
 *  3. 转写：优先用引擎的 Whisper，未就绪时退化为手动输入
 *  4. 跑近似评分，逐词反馈
 *
 * 零服务端：不发起任何业务请求。LLM 建议走 BYOK，失败不影响本流程。
 */

import { scoreReading, toReadingTask, type ReadingTask, type ReadingApproxResult } from '../suzhou/reading-section.ts';
import { disclaimerBlock, DIMENSION_LABELS } from '../suzhou/disclaimer.ts';
import { EXAM_SPEC } from '../suzhou/spec-config.ts';
import type { RawReading } from '../suzhou/reading-section.ts';

export interface RecordingLike {
  start(): Promise<void>;
  stop(): Promise<Float32Array>;
  durationMs(): number;
}

export interface EngineLike2 {
  /** 能否自动转写；false 时界面显示手动输入框 */
  canTranscribe(): boolean;
  transcribe(samples: Float32Array, sampleRate: number): Promise<string>;
}

export interface SuzhouReadingDeps {
  recordings: readonly RawReading[];
  recorder?: RecordingLike | null;
  engine?: EngineLike2 | null;
  /** 指定题号；不传则第一篇 */
  taskId?: string;
}

/* ------------------------------------------------------------------ *
 * 一、纯逻辑：状态机（可单测，不碰 DOM）
 * ------------------------------------------------------------------ */

export type ReadingPhase =
  | 'idle'        // 未开始
  | 'recording'   // 录音中
  | 'transcribing'// 转写中
  | 'manual'      // 等待手动输入（ASR 未就绪）
  | 'scored'      // 已出分
  | 'error';      // 出错

export interface ReadingState {
  phase: ReadingPhase;
  task: ReadingTask | null;
  result: ReadingApproxResult | null;
  manualText: string;
  error: string | null;
}

export function initialState(tasks: readonly RawReading[], taskId?: string): ReadingState {
  const raw = taskId ? tasks.find(function (t) { return t.id === taskId; }) : tasks[0];
  return {
    phase: 'idle',
    task: raw ? toReadingTask(raw) : null,
    result: null,
    manualText: '',
    error: null,
  };
}
/* ------------------------------------------------------------------ *
 * 二、纯逻辑：分数到视图模型的转换
 * ------------------------------------------------------------------ */

export interface ViewRow {
  index: number;
  reference: string;
  spoken: string | null;
  verdict: 'exact' | 'fuzzy' | 'omitted';
}

export interface DimensionView {
  label: string;
  valueText: string;
  weightText: string;
  note: string;
  /** 用于进度条宽度 0-100 */
  percent: number;
}

export interface FeedbackView {
  kind: string;
  message: string;
  words: string[];
}

export interface ScoreView {
  /** 已带「近似分」标签 */
  label: string;
  value: number;
  badge: string;
  disclaimer: string[];
  limits: string[];
  dimensions: DimensionView[];
  feedback: FeedbackView[];
  /** 逐词明细 */
  rows: ViewRow[];
  /** 原文分段，便于高亮 */
  reference: string;
  meta: {
    textbook: string;
    sourceLabel: string;
    sourceNote: string;
    sourceOfficial: boolean;
    wordCount: number;
  };
}

export function toScoreView(task: ReadingTask, result: ReadingApproxResult): ScoreView {
  const d = disclaimerBlock();
  return {
    label: d.scoreLabel,
    value: result.approximateScore,
    badge: d.badge,
    disclaimer: d.paragraphs,
    limits: d.limits,
    dimensions: result.dimensions.map(function (x) {
      return {
        label: DIMENSION_LABELS[x.key],
        valueText: Math.round(x.value * 100) + '%',
        weightText: '权重 ' + Math.round(x.weight * 100) + '%（假设值）',
        note: x.note,
        percent: Math.round(x.value * 100),
      };
    }),
    feedback: result.feedback.map(function (f) {
      return { kind: f.type, message: f.message, words: f.words };
    }),
    rows: result.alignment.words.map(function (w) {
      return {
        index: w.index,
        reference: w.reference,
        spoken: w.spoken,
        verdict: w.verdict,
      };
    }),
    reference: task.text,
    meta: {
      textbook: task.textbook,
      sourceLabel: task.source.label,
      sourceNote: task.source.note,
      sourceOfficial: task.source.official,
      wordCount: task.wordCount,
    },
  };
}

/* ------------------------------------------------------------------ *
 * 三、DOM 渲染（全部 typeof 守卫，Node 下不炸）
 * ------------------------------------------------------------------ */

function getDoc(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

/**
 * 解析 Document：优先挂载点的 ownerDocument，退回全局 document。
 *
 * 为什么不直接写 `mount.ownerDocument ?? document`：
 * TypeScript 的 strict 模式不做跨闭包的 throw 收窄，doc 会被一路标记为
 * `Document | undefined`，产生十几处误报。抽成返回 `Document` 的函数后，
 * throw 自然成为返回类型的收窄点。
 */
function resolveDoc(mount: Element): Document {
  const owner = mount.ownerDocument as Document | undefined;
  const globalDoc = typeof document === 'undefined' ? undefined : document;
  const found: Document | undefined = owner ?? globalDoc;
  if (found === undefined) {
    throw new Error('需要 DOM 环境：请在浏览器中打开，或传入带 ownerDocument 的挂载点。');
  }
  return found;
}

function el(tag: string, className: string, text: string): HTMLElement {
  const doc = getDoc();
  if (!doc) throw new Error('no DOM');
  const node = doc.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

/** 顶部横幅：近似声明，任何情况下都必须渲染 */
export function renderBanner(doc: Document): HTMLElement {
  const d = disclaimerBlock();
  const box = doc.createElement('div');
  box.className = 'sz-banner';
  box.setAttribute('role', 'note');
  box.textContent = d.banner;
  return box;
}
/** 题目区：原文 + 材料来源 + 录音区 */
function renderTaskPane(doc: Document, state: ReadingState): HTMLElement {
  const pane = doc.createElement('section');
  pane.className = 'sz-task';

  if (!state.task) {
    const err = doc.createElement('p');
    err.className = 'sz-error';
    err.textContent = '语料未加载，无法出题。';
    pane.appendChild(err);
    return pane;
  }

  const h = doc.createElement('h2');
  h.textContent = '朗读短文（苏州中考题型 · 近似模拟）';
  pane.appendChild(h);

  // 材料来源必须区分官方与推定
  const meta = doc.createElement('p');
  meta.className = state.task.source.official ? 'sz-src sz-src-official' : 'sz-src sz-src-inferred';
  meta.textContent = '材料位置：' + state.task.textbook + '　·　' + state.task.source.label;
  pane.appendChild(meta);

  const note = doc.createElement('p');
  note.className = 'sz-src-note';
  note.textContent = state.task.source.note;
  pane.appendChild(note);

  const stats = doc.createElement('p');
  stats.className = 'sz-stats';
  stats.textContent = '全篇 ' + state.task.wordCount + ' 词　|　考纲共 ' + EXAM_SPEC.readingCount + ' 篇材料'
    + '　|　考生实际作答 ' + EXAM_SPEC.answerMinutes + ' 分钟（听力 '
    + EXAM_SPEC.listeningMinutes + ' + 口语 ' + EXAM_SPEC.speakingMinutes + '）';
  pane.appendChild(stats);

  const text = doc.createElement('blockquote');
  text.className = 'sz-text';
  text.textContent = state.task.text;
  pane.appendChild(text);

  return pane;
}

function renderScorePane(doc: Document, view: ScoreView): HTMLElement {
  const pane = doc.createElement('section');
  pane.className = 'sz-score';

  // 分数区：标签 + 徽标 + 声明三件套，缺一不可
  const head = doc.createElement('div');
  head.className = 'sz-score-head';
  const num = doc.createElement('strong');
  num.className = 'sz-score-num';
  num.textContent = String(view.value);
  const lab = doc.createElement('span');
  lab.className = 'sz-score-label';
  lab.textContent = view.label;
  const badge = doc.createElement('span');
  badge.className = 'sz-badge';
  badge.textContent = view.badge;
  head.appendChild(num);
  head.appendChild(lab);
  head.appendChild(badge);
  pane.appendChild(head);

  for (const p of view.disclaimer) {
    const d = doc.createElement('p');
    d.className = 'sz-disclaimer';
    d.textContent = p;
    pane.appendChild(d);
  }

  // 分项
  const dims = doc.createElement('div');
  dims.className = 'sz-dims';
  for (const d of view.dimensions) {
    const row = doc.createElement('div');
    row.className = 'sz-dim';
    const t = doc.createElement('div');
    t.className = 'sz-dim-top';
    const name = doc.createElement('span');
    name.textContent = d.label;
    const val = doc.createElement('span');
    val.className = 'sz-dim-val';
    val.textContent = d.valueText;
    t.appendChild(name);
    t.appendChild(val);
    const bar = doc.createElement('div');
    bar.className = 'sz-bar';
    const fill = doc.createElement('div');
    fill.className = 'sz-bar-fill';
    fill.style.width = d.percent + '%';
    bar.appendChild(fill);
    const wt = doc.createElement('div');
    wt.className = 'sz-dim-note';
    wt.textContent = d.weightText + '　—　' + d.note;
    row.appendChild(t);
    row.appendChild(bar);
    row.appendChild(wt);
    dims.appendChild(row);
  }
  pane.appendChild(dims);

  // 逐词明细
  const words = doc.createElement('div');
  words.className = 'sz-words';
  for (const w of view.rows) {
    const s = doc.createElement('span');
    s.className = 'sz-w sz-w-' + w.verdict;
    s.title = w.verdict === 'omitted' ? '漏读' : (w.verdict === 'fuzzy' ? '读法有偏差：说了 ' + w.spoken : '正确');
    s.textContent = w.reference;
    words.appendChild(s);
  }
  pane.appendChild(words);

  // 反馈
  const fb = doc.createElement('ul');
  fb.className = 'sz-feedback';
  for (const f of view.feedback) {
    const li = doc.createElement('li');
    li.className = 'sz-fb sz-fb-' + f.kind;
    li.textContent = f.message;
    fb.appendChild(li);
  }
  pane.appendChild(fb);

  // 已知局限
  const lim = doc.createElement('details');
  lim.className = 'sz-limits';
  const sum = doc.createElement('summary');
  sum.textContent = '本工具做不到的事（' + view.limits.length + ' 项）';
  lim.appendChild(sum);
  const ul = doc.createElement('ul');
  for (const l of view.limits) {
    const li = doc.createElement('li');
    li.textContent = l;
    ul.appendChild(li);
  }
  lim.appendChild(ul);
  pane.appendChild(lim);

  return pane;
}
/**
 * 四、装配：把录音/转写/评分串成完整闭环
 *
 * 降级设计（对应 SPEC 第 6.2 条验收条件）：
 *  - 无麦克风或录音失败 → 显示手动输入框，L0 近似评分照常
 *  - ASR 未就绪 → 直接进手动输入
 *  - 转写失败 → 捕获并提示，手动输入兜底
 *  - 语料为空 → 显示错误，不白屏
 *
 * 音频只在内存，不上传、不落盘。
 */
export interface SuzhouReadingApp {
  state(): ReadingState;
  /** 当前渲染的 DOM（Node 下返回 null） */
  view(): Element | null;
  /** 直接用文本评分，不录音。用于测试与手动输入路径。 */
  submitText(text: string, durationMs?: number): ReadingApproxResult | null;
  /** 开始录音 */
  start(): Promise<void>;
  /** 停止录音并跑完转写+评分 */
  stop(): Promise<void>;
  destroy(): void;
}

export function mountSuzhouReading(
  mount: Element,
  deps: SuzhouReadingDeps,
): SuzhouReadingApp {
  const doc = resolveDoc(mount);

  let state = initialState(deps.recordings, deps.taskId);
  let viewEl: Element | null = null;
  let pendingAudio: Float32Array | null = null;

  function render(): void {
    while (mount.firstChild) mount.removeChild(mount.firstChild);

    mount.appendChild(renderBanner(doc));

    if (state.error) {
      const e = doc.createElement('p');
      e.className = 'sz-error';
      e.textContent = state.error;
      mount.appendChild(e);
    }

    mount.appendChild(renderTaskPane(doc, state));

    // 录音区
    const ctrl = doc.createElement('div');
    ctrl.className = 'sz-controls';

    const canRecord = !!(deps.recorder && state.task);
    const btnStart = doc.createElement('button');
    btnStart.type = 'button';
    btnStart.className = 'sz-btn';
    btnStart.textContent = state.phase === 'recording' ? '录音中…' : '开始录音';
    btnStart.disabled = !canRecord || state.phase === 'recording';
    if (canRecord) {
      btnStart.addEventListener('click', function () { void app.start(); });
    }
    ctrl.appendChild(btnStart);

    const btnStop = doc.createElement('button');
    btnStop.type = 'button';
    btnStop.className = 'sz-btn';
    btnStop.textContent = '结束并评分';
    btnStop.disabled = state.phase !== 'recording';
    if (canRecord) {
      btnStop.addEventListener('click', function () { void app.stop(); });
    }
    ctrl.appendChild(btnStop);

    if (!canRecord) {
      const hint = doc.createElement('span');
      hint.className = 'sz-hint';
      hint.textContent = deps.recorder ? '' : '未检测到可用麦克风，请在下方手动输入你朗读的内容。';
      ctrl.appendChild(hint);
    }
    mount.appendChild(ctrl);

    // 手动输入：ASR 未就绪或录音不可用时的兜底
    const needManual = state.phase === 'manual' || !canRecord;
    if (needManual && state.task) {
      const wrap = doc.createElement('div');
      wrap.className = 'sz-manual';
      const lab = doc.createElement('label');
      lab.textContent = '手动输入你朗读的内容：';
      const ta = doc.createElement('textarea');
      ta.className = 'sz-textarea';
      ta.rows = 6;
      ta.value = state.manualText;
      ta.addEventListener('input', function () { state.manualText = ta.value; });
      const go = doc.createElement('button');
      go.type = 'button';
      go.className = 'sz-btn';
      go.textContent = '按我的朗读评分（近似）';
      go.addEventListener('click', function () {
        app.submitText(ta.value);
      });
      wrap.appendChild(lab);
      wrap.appendChild(ta);
      wrap.appendChild(go);
      mount.appendChild(wrap);
    }

    if (state.result && state.task) {
      mount.appendChild(renderScorePane(doc, toScoreView(state.task, state.result)));
    }

    viewEl = mount;
  }
  const app: SuzhouReadingApp = {
    state: function () { return state; },
    view: function () { return viewEl; },

    submitText: function (text: string, durationMs?: number): ReadingApproxResult | null {
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
      state.result = scoreReading({
        reference: state.task.text,
        spoken: text,
        durationMs: durationMs,
      });
      state.phase = 'scored';
      render();
      return state.result;
    },

    start: async function () {
      if (!deps.recorder || !state.task) return;
      state.error = null;
      state.phase = 'recording';
      render();
      try {
        await deps.recorder.start();
      } catch (e) {
        state.phase = 'manual';
        state.error = '无法开始录音：' + (e instanceof Error ? e.message : String(e)) + '。请改用下方手动输入。';
        render();
      }
    },

    stop: async function () {
      if (!deps.recorder || !state.task) return;
      try {
        const samples = await deps.recorder.stop();
        const durationMs = deps.recorder.durationMs();
        pendingAudio = samples;

        // 转写：ASR 未就绪则直接进手动输入
        if (!deps.engine || !deps.engine.canTranscribe()) {
          state.phase = 'manual';
          state.error = '自动转写未就绪（需在设置里加载语音模型），请在下方手动输入你朗读的内容。';
          render();
          return;
        }

        state.phase = 'transcribing';
        render();
        let text = '';
        try {
          text = await deps.engine.transcribe(samples, 16000);
        } catch (e) {
          state.phase = 'manual';
          state.error = '转写失败：' + (e instanceof Error ? e.message : String(e)) + '。请在下方手动输入。';
          render();
          return;
        }
        app.submitText(text, durationMs);
      } catch (e) {
        state.phase = 'manual';
        state.error = '录音结束失败：' + (e instanceof Error ? e.message : String(e));
        render();
      }
    },

    destroy: function () {
      while (mount.firstChild) mount.removeChild(mount.firstChild);
      viewEl = null;
    },
  };

  render();
  return app;
}
