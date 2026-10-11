/**
 * 各口语小节共享的视图积木。
 *
 * reading / qa / topic / exam 内联段共用同一套「免责条 + ASR 加载框 +
 * 手动输入块 + 评分头 + 维度条 + 限制说明」的 DOM 结构；抽到这里后，
 * 改一处就全部生效。文案与 class 名保持和旧实现逐字一致。
 */

import { disclaimerBlock } from '../suzhou/disclaimer.ts';
import type { RecorderPort, AsrPort } from '../suzhou/recorder-bridge.ts';

export type SectionPhase =
  | 'idle'
  | 'loading-asr'
  | 'recording'
  | 'transcribing'
  | 'manual'
  | 'scored'
  | 'error';

export function resolveDoc(mount: Element): Document {
  const owner = mount.ownerDocument as Document | undefined;
  const g = typeof document === 'undefined' ? undefined : document;
  const found: Document | undefined = owner ?? g;
  if (found === undefined) throw new Error('需要 DOM 环境');
  return found;
}

export function canRecord(recorder: RecorderPort | null | undefined): boolean {
  if (!recorder) return false;
  try { return recorder.canRecord(); } catch { return false; }
}

export function asrReady(asr: AsrPort | null | undefined): boolean {
  if (!asr) return false;
  try { return asr.ready(); } catch { return false; }
}

export function bannerBlock(doc: Document): HTMLElement {
  const banner = doc.createElement('div');
  banner.className = 'sz-banner';
  banner.setAttribute('role', 'note');
  banner.textContent = disclaimerBlock().banner;
  return banner;
}

export function errorLine(doc: Document, msg: string): HTMLElement {
  const e = doc.createElement('p');
  e.className = 'sz-error';
  e.textContent = msg;
  return e;
}

export interface AsrBlockOpts {
  asr: AsrPort;
  onLoad: () => void;
  /** 未加载时可用的替代说明 */
  altText: string;
  /** 加载按钮文案（loading 时传「加载中…」） */
  buttonLabel: string;
  buttonDisabled?: boolean;
}

export function asrBlock(doc: Document, opts: AsrBlockOpts): HTMLElement {
  const ab = doc.createElement('div');
  ab.className = 'sz-asr';
  const msg = doc.createElement('p');
  msg.className = 'sz-asr-msg';
  try {
    msg.textContent = opts.asr.status().message;
  } catch {
    msg.textContent = '语音转写未加载。';
  }
  ab.appendChild(msg);
  const bl = doc.createElement('button');
  bl.type = 'button';
  bl.className = 'sz-btn sz-btn-sm';
  bl.textContent = opts.buttonLabel;
  if (opts.buttonDisabled) bl.disabled = true;
  bl.addEventListener('click', function () { opts.onLoad(); });
  ab.appendChild(bl);
  const alt = doc.createElement('p');
  alt.className = 'sz-hint';
  alt.textContent = opts.altText;
  ab.appendChild(alt);
  return ab;
}

export interface ManualBlockOpts {
  label: string;
  submitLabel: string;
  initial: string;
  rows?: number;
  onInput?: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function manualBlock(doc: Document, opts: ManualBlockOpts): HTMLElement {
  const wrap = doc.createElement('div');
  wrap.className = 'sz-manual';
  const lab = doc.createElement('label');
  lab.textContent = opts.label;
  const ta = doc.createElement('textarea');
  ta.className = 'sz-textarea';
  ta.rows = opts.rows ?? 5;
  ta.value = opts.initial;
  ta.addEventListener('input', function () { if (opts.onInput) opts.onInput(ta.value); });
  const go = doc.createElement('button');
  go.type = 'button';
  go.className = 'sz-btn';
  go.textContent = opts.submitLabel;
  go.addEventListener('click', function () { opts.onSubmit(ta.value); });
  wrap.appendChild(lab);
  wrap.appendChild(ta);
  wrap.appendChild(go);
  return wrap;
}

export interface ScoreHeadView {
  value: number;
  label: string;
  badge: string;
}

export function scoreHead(doc: Document, view: ScoreHeadView): HTMLElement {
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
  return head;
}

export interface DimView {
  label: string;
  valueText: string;
  percent: number;
  note: string;
}

export function dimsBlock(doc: Document, dimensions: readonly DimView[]): HTMLElement {
  const dims = doc.createElement('div');
  dims.className = 'sz-dims';
  for (const d of dimensions) {
    const row = doc.createElement('div');
    row.className = 'sz-dim';
    const top = doc.createElement('div');
    top.className = 'sz-dim-top';
    const n1 = doc.createElement('span');
    n1.textContent = d.label;
    const v1 = doc.createElement('span');
    v1.className = 'sz-dim-val';
    v1.textContent = d.valueText;
    top.appendChild(n1);
    top.appendChild(v1);
    const bar = doc.createElement('div');
    bar.className = 'sz-bar';
    const fill = doc.createElement('div');
    fill.className = 'sz-bar-fill';
    fill.style.width = d.percent + '%';
    bar.appendChild(fill);
    const nt = doc.createElement('div');
    nt.className = 'sz-dim-note';
    nt.textContent = d.note;
    row.appendChild(top);
    row.appendChild(bar);
    row.appendChild(nt);
    dims.appendChild(row);
  }
  return dims;
}

export function limitsDetails(doc: Document): HTMLElement {
  const lim = doc.createElement('details');
  lim.className = 'sz-limits';
  const sum = doc.createElement('summary');
  sum.textContent = '本工具做不到的事';
  lim.appendChild(sum);
  const ul2 = doc.createElement('ul');
  const d2 = disclaimerBlock();
  for (const p of d2.paragraphs) {
    const li = doc.createElement('li');
    li.textContent = p;
    ul2.appendChild(li);
  }
  for (const l of d2.limits) {
    const li = doc.createElement('li');
    li.textContent = l;
    ul2.appendChild(li);
  }
  lim.appendChild(ul2);
  return lim;
}
