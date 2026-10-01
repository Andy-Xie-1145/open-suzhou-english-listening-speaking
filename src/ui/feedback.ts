/**
 * 反馈可视化 —— 逐音素对照 / 漏读定位 / 音高-能量双轨 / L0 五项进度
 *
 * 许可：AGPL-3.0-only
 *
 * 定位（ARCHITECTURE 第 3.1 节 + 硬性要求）：本模块输出的是**能力诊断**，
 * 不是考场估分。界面必须始终显式声明这一点，避免学生把诊断分当成分数。
 *
 * 降级：本文件所有转换函数都是纯函数，输入缺字段不抛错、返回空结构而非崩溃。
 * 由 resolveDegradation(capabilities) 驱动 UI 隐藏/替换相应区块。
 */

import type { RuleReport, Diagnostic, CheckResult } from '../rules/types.ts';
import { levenshtein } from '../rules/text/normalize.ts';
import type { PitchFrame, PauseSpan } from './recorder.ts';

/* ------------------------------------------------------------------ *
 * 一、能力（Capabilities）与引擎结果的结构镜像
 *
 * 说明：src/engine 由 engine 组维护，UI 只读 ARCHITECTURE.md 3.3 的契约。
 * 这里声明**结构上等价**的最小镜像，避免 UI 反向依赖引擎实现细节。
 * ------------------------------------------------------------------ */

export interface CapabilitiesLike {
  webgpu: boolean;
  /** 音素模型是否就绪 */
  phoneme: boolean;
  /** ASR 是否就绪 */
  asr: boolean;
  /** 用户是否配置了 key */
  llm: boolean;
}

/** 单个音素对齐片段 */
export interface PhonemeSegment {
  /** 实际发音出的音素，如 "y" */
  phoneme: string;
  /** 参考音素，如 "x"；缺失表示该位置无有效读音（漏读） */
  expected?: string;
  /** 置信度 0..1 */
  confidence: number;
  word?: string;
  startMs?: number;
  endMs?: number;
}

export interface PhonemeReportLike {
  segments: PhonemeSegment[];
  /** 整体发音准确度 0..100 */
  accuracy?: number;
}

export interface LLMAdviceLike {
  overall?: string;
  strengths?: string[];
  improvements?: string[];
  sampleAnswer?: string;
}

export interface AnalysisResultLike {
  /** L0，永远有 */
  rules: RuleReport;
  transcript?: string;
  phonemes?: PhonemeReportLike;
  advice?: LLMAdviceLike | null;
  warnings?: string[];
}

/** 音素模型下载体积估算（MB），用于「点击加载」文案 */
export const PHONEME_MODEL_MB = 95;

/* ------------------------------------------------------------------ *
 * 二、降级状态机（纯函数 · 测试重点）
 * ------------------------------------------------------------------ */

/** 反馈层级：L3+L2+L1+L0 / L2+L0 / 仅 L0 */
export type FeedbackLevel = 'full' | 'partial' | 'minimal';

export interface DegradationNotice {
  level: 'info' | 'warn';
  text: string;
}

export interface DegradationState {
  level: FeedbackLevel;
  /** 无 GPU → 较慢模式 */
  slowMode: boolean;
  slowModeText: string;
  /** 音素对照区是否展示 */
  showPhonemePanel: boolean;
  /** 音素区隐藏时显示「点击加载」按钮 */
  showPhonemeLoader: boolean;
  phonemeLoaderText: string;
  phonemeModelMb: number;
  /** ASR 缺失 → 需要学生手动输入转写文本 */
  needManualInput: boolean;
  manualInputText: string;
  /** LLM 建议区 */
  showLLMPanel: boolean;
  llmLockedText: string;
  /** L0 永远可用 */
  l0AlwaysAvailable: boolean;
  notices: DegradationNotice[];
  /** 一句话状态摘要 */
  summary: string;
}

/**
 * 纯函数：Capabilities → 降级状态。
 * 任何一项缺失都只降低粒度，L0 恒定可用；本函数永不抛错。
 */
export function resolveDegradation(caps: CapabilitiesLike): DegradationState {
  const c: CapabilitiesLike = {
    webgpu: !!caps?.webgpu,
    phoneme: !!caps?.phoneme,
    asr: !!caps?.asr,
    llm: !!caps?.llm,
  };

  const level: FeedbackLevel = c.phoneme && c.asr && c.llm ? 'full' : c.asr ? 'partial' : 'minimal';

  const slowMode = !c.webgpu;
  const slowModeText = c.webgpu
    ? '已启用 GPU 加速，分析速度更快。'
    : '未检测到可用的 GPU 加速，本次分析将使用较慢模式（结果完全一致，只是等待更久）。';

  const showPhonemePanel = c.phoneme;
  const showPhonemeLoader = !c.phoneme;
  const phonemeLoaderText = c.phoneme
    ? ''
    : `点击加载发音分析（约 ${PHONEME_MODEL_MB} MB，仅首次下载，之后会缓存）。不加载也能完成整场模考，只是不显示逐音素对照。`;

  const needManualInput = !c.asr;
  const manualInputText = c.asr
    ? ''
    : '语音转写模型未加载。请在下方文本框中手动输入你刚才朗读/回答的内容，其余反馈照常生成。';

  const showLLMPanel = c.llm;
  const llmLockedText = c.llm
    ? ''
    : '未配置大模型 API key，已隐藏 AI 建议区。规则诊断（L0）与发音分析（L1）照常工作。';

  const notices: DegradationNotice[] = [];
  if (!c.webgpu) notices.push({ level: 'info', text: '未检测到 GPU 加速，将使用较慢模式（结果不受影响）。' });
  if (!c.phoneme) notices.push({ level: 'info', text: '发音分析模型未加载，逐音素对照暂不可用。' });
  if (!c.asr) notices.push({ level: 'warn', text: '语音转写未就绪，将使用手动输入的方式评估内容。' });
  if (!c.llm) notices.push({ level: 'info', text: '未配置 AI 服务商，个性化建议暂不可用。' });

  const bits: string[] = [];
  bits.push(c.llm ? 'AI 建议' : 'AI 建议（未配置）');
  bits.push(c.asr ? '语音转写' : '手动输入');
  bits.push(c.phoneme ? '逐音素对照' : '音素对照（未加载）');

  return {
    level,
    slowMode,
    slowModeText,
    showPhonemePanel,
    showPhonemeLoader,
    phonemeLoaderText,
    phonemeModelMb: PHONEME_MODEL_MB,
    needManualInput,
    manualInputText,
    showLLMPanel,
    llmLockedText,
    l0AlwaysAvailable: true,
    notices,
    summary: '当前可用：' + bits.join(' · ') + '；规则诊断始终可用。',
  };
}

/** 全空能力 → 必须是 minimal 且不崩（回归测试点） */
export function emptyCapabilities(): CapabilitiesLike {
  return { webgpu: false, phoneme: false, asr: false, llm: false };
}

/* ------------------------------------------------------------------ *
 * 三、逐音素对照表
 * ------------------------------------------------------------------ */

export interface PhonemeRow {
  index: number;
  word: string;
  /** 应该发出的音素 */
  expected: string;
  /** 实际识别到的音素 */
  actual: string;
  /** 置信度 0..100 */
  confidence: number;
  /** 是否错读 */
  mispronounced: boolean;
  /** 是否漏读（没有发出来） */
  dropped: boolean;
  /** 中文说明 */
  note: string;
}

/** 常见中式音对，给出中文提示（比只显示 IPA 更有用） */
const PHONEME_HINTS: Record<string, string> = {
  x: '舌面音 /x/：舌前部靠近上齿龈，注意不要发成 /y/',
  y: '半元音 /y/：常见于「我」——中文里读作 u-ou，学习时要从收圆的 /u/ 滑到 /ɪ/',
  θ: '清齿擦音 /θ/：舌尖轻抵上齿间，不能读成 /s/ 或 /d/',
  ð: '浊齿擦音 /ð/：舌尖轻抵上齿间并震动声带',
  v: '浊辅音 /v/：上齿轻咬下唇并出声，不能读成 /w/',
  l: '暗舌边音 /l/：词尾舌尖要抵住上齿龈',
  r: '卷舌 /r/：舌尖卷起不碰上颚，别读成汉语「日」',
  ŋ: '鼻音 /ŋ/：声音从鼻腔出，舌根抬起',
  aɪ: '双元音 /aɪ/：从 /a/ 滑向 /ɪ/，前重后轻',
  əʊ: '双元音 /əʊ/：从 /ə/ 滑向 /ʊ/，嘴唇由扁变圆',
  ɪ: '短元音 /ɪ/：短促放松，不能读成长音 /iː/',
  iː: '长元音 /iː/：拉长、嘴角向两侧展开',
};

/**
 * 纯函数：音素报告 → 对照表行。
 * 输入 null/undefined/空数组都返回空数组，不抛错。
 */
export function buildPhonemeRows(report: PhonemeReportLike | null | undefined): PhonemeRow[] {
  if (!report || !Array.isArray(report.segments)) return [];
  const segs = report.segments;
  return segs.map((s, i) => {
    const actual = typeof s?.phoneme === 'string' ? s.phoneme : '';
    const expected = typeof s?.expected === 'string' && s.expected ? s.expected : actual;
    const conf = clamp01(num(s?.confidence));
    const dropped = !actual;
    const mispronounced = !dropped && expected !== actual;
    let note = dropped ? '这个位置没有发出声音' : mispronounced ? '这里读错了' : '读得不错';
    const hint = PHONEME_HINTS[expected] ?? PHONEME_HINTS[actual];
    if (mispronounced && hint) note = expected + ' → 实际读成了 ' + actual + '。' + hint;
    else if (mispronounced) note = '这里应该是 ' + expected + '，你读成了 ' + actual + '。放慢速度对照着多读几遍。';
    return {
      index: i + 1,
      word: typeof s?.word === 'string' ? s.word : '',
      expected,
      actual: actual || '（未发出）',
      confidence: Math.round(conf * 100),
      mispronounced,
      dropped,
      note,
    };
  });
}

/** 音素报告整体准确度 0..100；无数据返回 0 */
export function phonemeAccuracy(report: PhonemeReportLike | null | undefined): number {
  if (!report) return 0;
  if (typeof report.accuracy === 'number' && Number.isFinite(report.accuracy)) {
    return Math.max(0, Math.min(100, Math.round(report.accuracy)));
  }
  const rows = buildPhonemeRows(report);
  if (!rows.length) return 0;
  const good = rows.filter(r => !r.mispronounced && !r.dropped).length;
  return Math.round((good / rows.length) * 100);
}

/* ------------------------------------------------------------------ *
 * 四、漏读定位（词级对齐）
 * ------------------------------------------------------------------ */

export type AlignStatus = 'hit' | 'near' | 'missed' | 'extra';

export interface WordAlignItem {
  word: string;
  status: AlignStatus;
  /** 在参考文本中的字符区间 [start, end) */
  span: [number, number];
  /** 在学习者文本中的字符区间，可为 null */
  hypSpan: [number, number] | null;
}

interface TokenSpan {
  word: string;
  start: number;
  end: number;
}

/** 抽取英文词及其字符位置（保留大小写原文位置） */
export function tokenizeWithSpans(text: string): TokenSpan[] {
  const out: TokenSpan[] = [];
  if (typeof text !== 'string' || !text) return out;
  const re = /[A-Za-z][A-Za-z']*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ word: m[0].toLowerCase().replace(/'s$/, '').replace(/'$/, ''), start: m.index, end: m.index + m[0].length });
  }
  return out;
}

/** 拼写容错阈值：短词 1，长词 2 */
export function toleranceOf(word: string): number {
  return word.length <= 4 ? 1 : 2;
}

/**
 * 纯函数：参考文本 vs 实际说出的文本 → 词级对齐。
 * hit=命中, near=拼写接近(可能读错), missed=漏读, extra=多读(不在原文里)。
 * 用于在原文上高亮「哪些词没读出来」。
 */
export function alignWords(reference: string, hypothesis: string): WordAlignItem[] {
  const ref = tokenizeWithSpans(reference);
  const hyp = tokenizeWithSpans(hypothesis);
  const out: WordAlignItem[] = [];
  let j = 0;
  for (let i = 0; i < ref.length; i++) {
    const r = ref[i];
    let matched = -1;
    for (let k = j; k < Math.min(hyp.length, j + 4); k++) {
      const d = levenshtein(r.word, hyp[k].word);
      if (d === 0) { matched = k; break; }
    }
    let status: AlignStatus = 'missed';
    let hypSpan: [number, number] | null = null;
    if (matched >= 0) {
      status = 'hit';
      hypSpan = [hyp[matched].start, hyp[matched].end];
      j = matched + 1;
    } else {
      for (let k = j; k < Math.min(hyp.length, j + 4); k++) {
        if (levenshtein(r.word, hyp[k].word) <= toleranceOf(r.word)) {
          status = 'near';
          hypSpan = [hyp[k].start, hyp[k].end];
          j = k + 1;
          break;
        }
      }
    }
    out.push({ word: r.word, status, span: [r.start, r.end], hypSpan });
  }
  // 多读出来的词（学习者说了但原文没有）
  const consumed = new Set(out.filter(o => o.hypSpan).map(o => hyp.findIndex(h => h.start === o.hypSpan![0])));
  for (let k = 0; k < hyp.length; k++) {
    if (consumed.has(k)) continue;
    // 只有当它前后都没能匹配上参考词时才算多读
    out.push({ word: hyp[k].word, status: 'extra', span: [-1, -1], hypSpan: [hyp[k].start, hyp[k].end] });
  }
  out.sort((a, b) => (a.span[0] < 0 ? Number.MAX_SAFE_INTEGER : a.span[0]) - (b.span[0] < 0 ? Number.MAX_SAFE_INTEGER : b.span[0]));
  return out;
}

export interface MissedWord {
  word: string;
  /** 参考文本字符区间 */
  span: [number, number];
  /** near = 大概率读错，missed = 没读出来 */
  status: 'missed' | 'near';
  text: string;
}

/** 纯函数：只挑出漏读/错读词 */
export function buildMissedWords(reference: string, hypothesis: string): MissedWord[] {
  return alignWords(reference, hypothesis)
    .filter(a => a.status === 'missed' || a.status === 'near')
    .map(a => ({
      word: a.word,
      span: a.span,
      status: a.status as 'missed' | 'near',
      text: a.status === 'missed' ? '这个词没有读出来' : '这个词可能读错了',
    }));
}

/** 按对齐结果给原文加高亮标记（返回带 HTML 的字符串，调用方负责转义策略） */
export function renderReferenceWithMarks(reference: string, hypothesis: string): string {
  const items = alignWords(reference, hypothesis);
  if (!items.length) return escapeHtml(reference);
  let out = '';
  let cursor = 0;
  for (const it of items) {
    if (it.span[0] < 0) continue;
    const start = it.span[0];
    if (start > cursor) out += escapeHtml(reference.slice(cursor, start));
    const wordHtml = escapeHtml(reference.slice(start, it.span[1]));
    if (it.status === 'missed') out += `<mark class="ref-mark ref-mark--missed" title="漏读">${wordHtml}</mark>`;
    else if (it.status === 'near') out += `<mark class="ref-mark ref-mark--near" title="可能读错">${wordHtml}</mark>`;
    else out += wordHtml;
    cursor = it.span[1];
  }
  if (cursor < reference.length) out += escapeHtml(reference.slice(cursor));
  return out;
}

/* ------------------------------------------------------------------ *
 * 五、音高 / 能量双轨与停顿标记
 * ------------------------------------------------------------------ */

export interface TrackPoint {
  /** 归一化时间 0..1 */
  x: number;
  /** 归一化高度 0..1（0 = 底部） */
  y: number;
  /** 原始 Hz（音高轨有值，能量轨为 0） */
  raw: number;
}

export interface PauseMark {
  x: number;
  width: number;
  startMs: number;
  durationMs: number;
  text: string;
}

export interface TrackData {
  durationMs: number;
  pitch: TrackPoint[];
  energy: TrackPoint[];
  pauses: PauseMark[];
  /** 浊音帧占比 0..1，反映开口度 */
  voicedRatio: number;
  /** 音高范围（Hz） */
  pitchRange: { min: number; max: number };
  /** 音高跨度（半音近似），越大语调越丰富 */
  pitchSpanSemitones: number;
}

const PITCH_FLOOR = 80;
const PITCH_CEIL = 320;

/**
 * 纯函数：音高帧 + 停顿 → 可直接画图的数据（全部归一化到 0..1）。
 * 无音高帧/无时长时返回空轨道结构而不是 null，渲染层无需判空。
 */
export function buildTracks(
  frames: PitchFrame[],
  pauses: PauseSpan[],
  durationMs: number,
): TrackData {
  const dur = Math.max(1, Math.round(durationMs || 0));
  const list = Array.isArray(frames) ? frames : [];
  const pitch: TrackPoint[] = [];
  const energy: TrackPoint[] = [];
  let voiced = 0;
  let minHz = Number.POSITIVE_INFINITY;
  let maxHz = 0;

  for (const f of list) {
    const x = clamp01(f.tMs / dur);
    energy.push({ x, y: clamp01(f.energy), raw: f.energy });
    if (f.voiced && f.hz > 0) {
      voiced++;
      if (f.hz < minHz) minHz = f.hz;
      if (f.hz > maxHz) maxHz = f.hz;
      // 频率 → 高度（越高音在图上越高 → y 越小）
      const y = 1 - clamp01((f.hz - PITCH_FLOOR) / (PITCH_CEIL - PITCH_FLOOR));
      pitch.push({ x, y, raw: f.hz });
    } else {
      pitch.push({ x, y: 0, raw: 0 });
    }
  }

  const marks: PauseMark[] = (Array.isArray(pauses) ? pauses : []).map(p => ({
    x: clamp01(p.startMs / dur),
    width: clamp01(p.durationMs / dur),
    startMs: p.startMs,
    durationMs: p.durationMs,
    text: '停顿 ' + (p.durationMs / 1000).toFixed(1) + ' 秒',
  }));

  const lo = Number.isFinite(minHz) ? Math.round(minHz) : 0;
  const hi = maxHz ? Math.round(maxHz) : 0;

  return {
    durationMs: dur,
    pitch,
    energy,
    pauses: marks,
    voicedRatio: list.length ? Math.round((voiced / list.length) * 100) / 100 : 0,
    pitchRange: { min: lo, max: hi },
    pitchSpanSemitones: hi > 0 && lo > 0 ? Math.round(12 * Math.log2(hi / lo)) : 0,
  };
}

/* ------------------------------------------------------------------ *
 * 六、L0 五项检查进度条 + 诊断卡片
 * ------------------------------------------------------------------ */

export type CheckKey = keyof RuleReport['checks'];

/** 进度条方向：up=越大越好，band=区间内最好 */
export const METER_DIR: Record<CheckKey, 'up' | 'band'> = {
  length: 'up',
  coverage: 'up',
  connectors: 'up',
  fillers: 'up',
  pace: 'band',
};

/** 面向学生的中文标签 */
export const CHECK_LABELS: Record<CheckKey, string> = {
  length: '句数（要求 ≥ 7 句）',
  coverage: '话题要点覆盖',
  connectors: '连接词使用',
  fillers: '停顿词 / 卡壳',
  pace: '语速与节奏',
};

/** 语速舒适区间（与 rules/evaluate.ts 的 PACE_SLOW / PACE_FAST 对齐） */
const PACE_SLOW = 0.9;
const PACE_FAST = 3.2;

export interface CheckBar {
  key: CheckKey;
  label: string;
  ok: boolean;
  /** 填充比例 0..1 */
  ratio: number;
  /** 原始检查结果的中文说明 */
  message: string;
  /** 针对初三学生的改进建议 */
  advice: string;
  value: number;
  threshold: number;
}

/** 纯函数：RuleReport → 5 条进度条数据 */
export function buildCheckBars(report: RuleReport | null | undefined): CheckBar[] {
  const empty: CheckBar = { key: 'length', label: CHECK_LABELS.length, ok: false, ratio: 0, message: '暂无数据', advice: '完成录音后即可看到。', value: 0, threshold: 0 };
  if (!report || !report.checks) return [empty];
  const keys: CheckKey[] = ['length', 'coverage', 'connectors', 'fillers', 'pace'];
  return keys.map(key => {
    const c: CheckResult | undefined = report.checks[key];
    if (!c) return { ...empty, key, label: CHECK_LABELS[key] };
    const ratio = ratioOf(key, c);
    return {
      key,
      label: CHECK_LABELS[key],
      ok: !!c.ok,
      ratio,
      message: typeof c.message === 'string' ? c.message : '',
      advice: adviceOf(key, c),
      value: num(c.value),
      threshold: num(c.threshold),
    };
  });
}

function ratioOf(key: CheckKey, c: CheckResult): number {
  const v = num(c.value);
  const t = num(c.threshold);
  if (key === 'pace') {
    // 区间型：0.9~3.2 词/秒为舒适区，越靠边越低
    if (v <= 0) return 0;
    if (v >= PACE_SLOW && v <= PACE_FAST) return 1;
    if (v < PACE_SLOW) return clamp01(v / PACE_SLOW);
    return clamp01(1 - (v - PACE_FAST) / PACE_FAST);
  }
  if (key === 'fillers') {
    // 0 最好，越多越低
    return clamp01(1 - v / 5);
  }
  if (t > 0) return clamp01(v / t);
  return v > 0 ? 0 : 1;
}

function adviceOf(key: CheckKey, c: CheckResult): string {
  const v = num(c.value);
  switch (key) {
    case 'length':
      return v < 7
        ? '再补充 ' + Math.max(1, 7 - Math.round(v)) + ' 句：加一个例子，或说出你的感受。'
        : '句数达标，考场里不要为了凑句数而重复。';
    case 'coverage':
      return c.ok ? '要点覆盖够了，试着再加一个课本里的句型。' : '把话题里的要点逐个说出来，每个要点配一个词。';
    case 'connectors':
      return c.ok
        ? '连接词用得不错，试试用 however / therefore 提升层次。'
        : '用 first、also、because、however 把句子串起来，至少 2 个。';
    case 'fillers':
      return v > 0
        ? '这些停顿词是卡壳点。先在脑子里把下一句想好，再开口。'
        : '表达很流畅，继续保持。';
    case 'pace':
      if (v <= 0) return '这次没有时长数据，语速无法评估。';
      if (v > PACE_FAST) return '慢一点，每个意群读完再换气，别赶。';
      if (v < PACE_SLOW) return '加快一点，试着连贯成串地说，不要一个字一个字蹦。';
      return '语速很稳，保持这个节奏。';
    default:
      return '';
  }
}

export type Severity = 'info' | 'warn' | 'error';

export const SEVERITY_CN: Record<Severity, { label: string; order: number }> = {
  error: { label: '必须改', order: 0 },
  warn: { label: '建议改', order: 1 },
  info: { label: '可以更好', order: 2 },
};

export interface DiagnosticCard {
  code: string;
  severity: Severity;
  severityLabel: string;
  /** 问题 */
  message: string;
  /** 改进建议 */
  suggestion: string;
}

/** 纯函数：Diagnostic[] → 面向学生的卡片（问题 + 建议，按严重度排序） */
export function buildDiagnosticCards(diagnostics: Diagnostic[] | null | undefined): DiagnosticCard[] {
  if (!Array.isArray(diagnostics) || !diagnostics.length) {
    return [{ code: 'ALL_OK', severity: 'info', severityLabel: '做得好', message: '本次没有发现明显问题。', suggestion: '保持语速和句数，换个话题再练一次。' }];
  }
  return diagnostics
    .filter(d => !!d)
    .map(d => {
      const sev: Severity = d.severity === 'error' || d.severity === 'warn' ? d.severity : 'info';
      return {
        code: typeof d.code === 'string' ? d.code : 'UNKNOWN',
        severity: sev,
        severityLabel: SEVERITY_CN[sev].label,
        message: typeof d.message === 'string' ? d.message : '',
        suggestion: typeof d.suggestion === 'string' && d.suggestion ? d.suggestion : '对照参考文本多读几遍，注意句子的重音。',
      };
    })
    .sort((a, b) => SEVERITY_CN[a.severity].order - SEVERITY_CN[b.severity].order);
}

/* ------------------------------------------------------------------ *
 * 七、反馈总装（把引擎结果转成渲染所需的视图模型）
 * ------------------------------------------------------------------ */

export interface FeedbackView {
  level: FeedbackLevel;
  /** 能力诊断分（非考场估分） */
  score: number;
  headline: string;
  /** 必须在界面上可见的免责说明 */
  disclaimer: string;
  transcript: string;
  transcriptSource: 'asr' | 'manual' | 'none';
  bars: CheckBar[];
  cards: DiagnosticCard[];
  phoneme: {
    available: boolean;
    rows: PhonemeRow[];
    accuracy: number;
    missed: MissedWord[];
    referenceHtml: string;
  } | null;
  phonemeLoader: { visible: boolean; text: string; sizeMb: number };
  llm: { visible: boolean; overall: string; strengths: string[]; improvements: string[]; sampleAnswer: string } | null;
  llmLockedText: string;
  manualInput: { required: boolean; text: string; placeholder: string };
  tracks: TrackData | null;
  warnings: string[];
  degradation: DegradationState;
}

const DISCLAIMER = '这是能力诊断，不是考场估分。它告诉你「哪里没练到」，不预测考试得分。';

/** 纯函数：引擎分析结果 + 能力 → 视图模型。缺字段一律降级，不抛错。 */
export function toFeedbackView(
  result: AnalysisResultLike | null | undefined,
  caps: CapabilitiesLike,
  frames?: PitchFrame[],
  pauses?: PauseSpan[],
  durationMs?: number,
): FeedbackView {
  const degradation = resolveDegradation(caps);
  const safeCaps: CapabilitiesLike = {
    webgpu: !!caps?.webgpu,
    phoneme: !!caps?.phoneme,
    asr: !!caps?.asr,
    llm: !!caps?.llm,
  };
  const rules = result?.rules;

  const transcript = typeof result?.transcript === 'string' ? result.transcript : '';
  const transcriptSource: 'asr' | 'manual' | 'none' =
    transcript && safeCaps.asr ? 'asr' : transcript ? 'manual' : 'none';

  const bars = buildCheckBars(rules);
  const cards = buildDiagnosticCards(rules?.diagnostics);

  const reference = '';
  const rows = safeCaps.phoneme ? buildPhonemeRows(result?.phonemes) : [];
  const phonemeAvailable = safeCaps.phoneme && rows.length > 0;
  const refText = reference || '';
  const missed = phonemeAvailable ? buildMissedWords(refText, transcript) : [];

  const dur = num(durationMs) || 0;
  const tracks = frames && frames.length ? buildTracks(frames, pauses ?? [], dur) : null;

  const advice = result?.advice ?? null;

  return {
    level: degradation.level,
    score: rules ? Math.max(0, Math.min(100, Math.round(num(rules.score)))) : 0,
    headline: headlineFor(bars),
    disclaimer: DISCLAIMER,
    transcript,
    transcriptSource,
    bars,
    cards,
    phoneme: {
      available: phonemeAvailable,
      rows,
      accuracy: phonemeAvailable ? phonemeAccuracy(result?.phonemes) : 0,
      missed,
      referenceHtml: phonemeAvailable ? renderReferenceWithMarks(refText, transcript) : '',
    },
    phonemeLoader: {
      visible: degradation.showPhonemeLoader,
      text: degradation.phonemeLoaderText,
      sizeMb: degradation.phonemeModelMb,
    },
    llm: safeCaps.llm
      ? {
          visible: true,
          overall: typeof advice?.overall === 'string' ? advice.overall : '',
          strengths: Array.isArray(advice?.strengths) ? advice.strengths.filter(x => typeof x === 'string') : [],
          improvements: Array.isArray(advice?.improvements) ? advice.improvements.filter(x => typeof x === 'string') : [],
          sampleAnswer: typeof advice?.sampleAnswer === 'string' ? advice.sampleAnswer : '',
        }
      : null,
    llmLockedText: degradation.llmLockedText,
    manualInput: {
      required: degradation.needManualInput,
      text: degradation.manualInputText,
      placeholder: '例如：I like playing basketball with my friends after school.',
    },
    tracks,
    warnings: Array.isArray(result?.warnings) ? result.warnings.filter(w => typeof w === 'string') : [],
    degradation,
  };
}

function headlineFor(bars: CheckBar[]): string {
  const failed = bars.filter(b => !b.ok);
  if (!failed.length) return '五项检查全部通过，保持这个状态。';
  const first = failed[0];
  return '优先改进：' + first.label.replace(/（.*?）/, '');
}

/* ------------------------------------------------------------------ *
 * 八、渲染
 * ------------------------------------------------------------------ */

function getDoc(): Document | null {
  return typeof document === 'undefined' ? null : document;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text = ''): HTMLElementTagNameMap[K] {
  const d = getDoc()!;
  const e = d.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

export interface FeedbackViewCallbacks {
  onLoadPhoneme?: () => void;
  onOpenByok?: () => void;
  onManualInput?: (text: string) => void;
}

export interface FeedbackViewOptions {
  /** 朗读短文原文，用于漏读高亮 */
  reference?: string;
  callbacks?: FeedbackViewCallbacks;
}

/**
 * 渲染完整反馈面板。任一区块缺失/不可用时只渲染降级提示，不抛错、不白屏。
 */
export function renderFeedback(
  container: HTMLElement,
  view: FeedbackView,
  opts: FeedbackViewOptions = {},
): void {
  const d = getDoc();
  if (!d) return;
  const cb = opts.callbacks ?? {};
  container.textContent = '';
  container.className = 'feedback';

  // ---- 标题 + 免责 ----
  const head = el('header', 'feedback__head');
  head.appendChild(el('h2', 'feedback__title', '能力诊断报告'));
  head.appendChild(el('p', 'feedback__disclaimer', view.disclaimer));
  head.appendChild(el('p', 'feedback__headline', view.headline));
  container.appendChild(head);

  // ---- 降级提示 ----
  const dg = view.degradation;
  if (dg.notices.length) {
    const box = el('div', 'feedback__notices');
    for (const n of dg.notices) {
      box.appendChild(el('p', 'notice notice--' + n.level, n.text));
    }
    container.appendChild(box);
  }

  // ---- 手动输入（ASR 未就绪）----
  if (view.manualInput.required) {
    const box = el('div', 'feedback__manual');
    box.appendChild(el('p', 'notice notice--warn', view.manualInput.text));
    const ta = el('textarea', 'feedback__textarea');
    ta.rows = 4;
    ta.placeholder = view.manualInput.placeholder;
    box.appendChild(ta);
    const btn = el('button', 'btn btn--primary', '用这段文字重新评估');
    btn.type = 'button';
    btn.addEventListener('click', () => cb.onManualInput?.(ta.value));
    box.appendChild(btn);
    container.appendChild(box);
  }

  // ---- L0 五项进度条 ----
  const bars = el('section', 'feedback__section');
  bars.appendChild(el('h3', 'feedback__section-title', '五项基础检查（规则诊断 L0）'));
  for (const b of view.bars) {
    const row = el('div', 'bar' + (b.ok ? ' is-ok' : ' is-bad'));
    const head2 = el('div', 'bar__head');
    head2.appendChild(el('span', 'bar__label', b.label));
    head2.appendChild(el('span', 'bar__message', b.message));
    row.appendChild(head2);
    const track = el('div', 'bar__track');
    const fill = el('div', 'bar__fill');
    fill.style.width = Math.round(b.ratio * 100) + '%';
    track.appendChild(fill);
    row.appendChild(track);
    row.appendChild(el('p', 'bar__advice', b.advice));
    bars.appendChild(row);
  }
  container.appendChild(bars);

  // ---- 音素对照 / 加载按钮 ----
  const ph = el('section', 'feedback__section');
  ph.appendChild(el('h3', 'feedback__section-title', '逐音素对照（发音分析 L1）'));
  if (view.phoneme?.available) {
    ph.appendChild(el('p', 'feedback__accuracy', '发音准确度 ' + view.phoneme.accuracy + '%'));
    const ref = opts.reference ?? '';
    if (ref && view.phoneme.referenceHtml) {
      const refBox = el('div', 'feedback__reference');
      refBox.innerHTML = view.phoneme.referenceHtml;
      ph.appendChild(refBox);
      ph.appendChild(el('p', 'feedback__legend', '绿色=读对，橙色=可能读错，红色下划线=漏读。'));
    }
    if (view.phoneme.missed.length) {
      const miss = el('div', 'feedback__missed');
      miss.appendChild(el('h4', 'feedback__sub-title', '需要重点练习的词（' + view.phoneme.missed.length + '）'));
      const ul = el('ul', 'missed-list');
      for (const m of view.phoneme.missed) {
        ul.appendChild(el('li', 'missed-list__item missed-list__item--' + m.status, m.word + ' —— ' + m.text));
      }
      miss.appendChild(ul);
      ph.appendChild(miss);
    }
    ph.appendChild(buildPhonemeTable(view.phoneme.rows));
  } else {
    const box = el('div', 'feedback__loader');
    box.appendChild(el('p', 'notice notice--info', view.phonemeLoader.text));
    const btn = el('button', 'btn btn--primary', '点击加载发音分析（约 ' + view.phonemeLoader.sizeMb + ' MB）');
    btn.type = 'button';
    btn.addEventListener('click', () => cb.onLoadPhoneme?.());
    box.appendChild(btn);
    ph.appendChild(box);
  }
  container.appendChild(ph);

  // ---- 音高 / 能量双轨 ----
  if (view.tracks) {
    const t = el('section', 'feedback__section');
    t.appendChild(el('h3', 'feedback__section-title', '语调与节奏（音高 + 音量双轨）'));
    const canvas = el('canvas', 'tracks');
    canvas.width = 720;
    canvas.height = 200;
    t.appendChild(canvas);
    const stat = el('p', 'feedback__track-stat');
    stat.textContent =
      '音高范围 ' + (view.tracks.pitchRange.min || '-') + '~' + (view.tracks.pitchRange.max || '-') +
      ' Hz，跨度约 ' + view.tracks.pitchSpanSemitones + ' 个半音；开口说话时间 ' +
      Math.round(view.tracks.voicedRatio * 100) + '%；停顿 ' + view.tracks.pauses.length + ' 处。';
    t.appendChild(stat);
    t.appendChild(el('p', 'feedback__legend', '蓝色=音高曲线，绿色=音量能量，阴影带=停顿位置。'));
    container.appendChild(t);
    tryDrawTracks(canvas, view.tracks);
  }

  // ---- 诊断列表 ----
  const dg2 = el('section', 'feedback__section');
  dg2.appendChild(el('h3', 'feedback__section-title', '诊断与改进建议'));
  for (const c of view.cards) {
    const card = el('article', 'diag diag--' + c.severity);
    const head3 = el('div', 'diag__head');
    head3.appendChild(el('span', 'diag__sev', c.severityLabel));
    card.appendChild(head3);
    card.appendChild(el('p', 'diag__problem', c.message));
    card.appendChild(el('p', 'diag__suggestion', '建议：' + c.suggestion));
    dg2.appendChild(card);
  }
  container.appendChild(dg2);

  // ---- AI 建议（L3）----
  if (view.llm?.visible) {
    const l = el('section', 'feedback__section feedback__llm');
    l.appendChild(el('h3', 'feedback__section-title', 'AI 教练建议（L3）'));
    if (view.llm.overall) l.appendChild(el('p', 'llm__overall', view.llm.overall));
    if (view.llm.strengths.length) {
      l.appendChild(el('h4', 'feedback__sub-title', '你做得好的地方'));
      const ul = el('ul', 'llm__list');
      for (const s of view.llm.strengths) ul.appendChild(el('li', '', s));
      l.appendChild(ul);
    }
    if (view.llm.improvements.length) {
      l.appendChild(el('h4', 'feedback__sub-title', '下一步提升'));
      const ul = el('ul', 'llm__list');
      for (const s of view.llm.improvements) ul.appendChild(el('li', '', s));
      l.appendChild(ul);
    }
    if (view.llm.sampleAnswer) {
      l.appendChild(el('h4', 'feedback__sub-title', '参考表达（仅供参考，不是标准答案）'));
      l.appendChild(el('blockquote', 'llm__sample', view.llm.sampleAnswer));
    }
    container.appendChild(l);
  } else {
    const l = el('section', 'feedback__section feedback__llm');
    l.appendChild(el('h3', 'feedback__section-title', 'AI 教练建议（L3）'));
    l.appendChild(el('p', 'notice notice--info', view.llmLockedText));
    const btn = el('button', 'btn btn--ghost', '去设置 AI 服务商');
    btn.type = 'button';
    btn.addEventListener('click', () => cb.onOpenByok?.());
    l.appendChild(btn);
    container.appendChild(l);
  }

  // ---- 底部再强调 ----
  container.appendChild(el('p', 'feedback__disclaimer feedback__disclaimer--bottom', view.disclaimer));
}

/** 逐音素对照表（DOM） */
function buildPhonemeTable(rows: PhonemeRow[]): HTMLElement {
  const table = el('table', 'ph-table');
  const thead = el('thead');
  const hr = el('tr');
  for (const h of ['#', '单词', '应该是', '实际读成', '置信度', '说明']) {
    hr.appendChild(el('th', '', h));
  }
  thead.appendChild(hr);
  table.appendChild(thead);
  const tbody = el('tbody');
  for (const r of rows) {
    const tr = el('tr', 'ph-row' + (r.mispronounced ? ' is-wrong' : '') + (r.dropped ? ' is-dropped' : ''));
    tr.appendChild(el('td', '', String(r.index)));
    tr.appendChild(el('td', 'ph-row__word', r.word));
    tr.appendChild(el('td', 'ph-row__phoneme ph-row__phoneme--expect', r.expected));
    tr.appendChild(el('td', 'ph-row__phoneme ph-row__phoneme--actual', r.actual));
    const td = el('td', 'ph-row__conf');
    const bar = el('div', 'conf');
    const fill = el('div', 'conf__fill');
    fill.style.width = r.confidence + '%';
    bar.appendChild(fill);
    td.appendChild(bar);
    td.appendChild(el('span', 'conf__text', r.confidence + '%'));
    tr.appendChild(td);
    tr.appendChild(el('td', 'ph-row__note', r.note));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

/** 双轨绘制（失败时静默降级为图例文本） */
function tryDrawTracks(canvas: HTMLCanvasElement, tracks: TrackData): void {
  try {
    if (typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const half = Math.round(h / 2);
    ctx.clearRect(0, 0, w, h);

    // 停顿阴影带（贯穿全图）
    ctx.fillStyle = 'rgba(148, 163, 184, 0.28)';
    for (const p of tracks.pauses) {
      ctx.fillRect(p.x * w, 0, Math.max(2, p.width * w), h);
    }

    // 能量（下轨）
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
    ctx.lineWidth = 1.5;
    tracks.energy.forEach((p, i) => {
      const x = p.x * w;
      const y = half + (1 - p.y) * (half - 6) + 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 音高（上轨）
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.95)';
    ctx.lineWidth = 2;
    tracks.pitch.forEach((p, i) => {
      const x = p.x * w;
      const y = p.y * (half - 6) + 3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = 'rgba(148,163,184,0.5)';
    ctx.beginPath();
    ctx.moveTo(0, half);
    ctx.lineTo(w, half);
    ctx.stroke();
  } catch {
    /* 绘制失败不影响反馈内容 */
  }
}

/* ------------------------------------------------------------------ *
 * 小工具
 * ------------------------------------------------------------------ */

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
