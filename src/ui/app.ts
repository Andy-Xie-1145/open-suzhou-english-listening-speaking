/**
 * 应用装配 —— 把考场流程、录音、反馈、BYOK 串成一个不依赖后端的纯前端应用
 *
 * 许可：AGPL-3.0-only
 *
 * 设计要点：
 *  1. **不静态 import src/engine** —— 引擎由 Lead 在 src/main.ts 注入，
 *     这样引擎缺失时本模块仍可独立运行、构建也不会因缺文件而失败。
 *  2. **没有引擎也能用** —— 自动回退到 src/rules 的 L0 纯规则评估，
 *     保证「任何一层缺失都不白屏」。
 *  3. 全部 DOM 访问带 typeof 守卫，Node 下 import 本模块不会崩。
 */

import { evaluate, MIN_SENTENCES } from '../rules/evaluate.ts';
import type { TopicProfile } from '../rules/lexicon.ts';
import {
  buildTimeline,
  buildExamPaper,
  stepAt,
  nextStageId,
  isExamOver,
  fullPlan,
  practicePlan,
  renderExamView,
  formatClock,
  formatDurationCn,
  type ExamPlan,
  type PaperSource,
  type TimelineStep,
} from './exam.ts';
import {
  AudioRecorder,
  renderRecorder,
  detectRecorderSupport,
  readRecorderEnv,
  pitchTrack,
  type RecordedClip,
} from './recorder.ts';
import {
  toFeedbackView,
  renderFeedback,
  resolveDegradation,
  emptyCapabilities,
  type AnalysisResultLike,
  type CapabilitiesLike,
  type FeedbackView,
} from './feedback.ts';
import { renderByokPanel, hasUsableKey, loadConfig, type ByokView } from './byok.ts';

/* ------------------------------------------------------------------ *
 * 一、能力探测
 * ------------------------------------------------------------------ */

/** 用于探测的可注入环境（测试友好） */
export interface CapEnv {
  isSecureContext: boolean;
  hasMediaDevices: boolean;
  hasAudioContext: boolean;
  hasWebGpu: boolean;
  hasLocalStorage: boolean;
  hasSt: boolean; // SpeechRecognition 兜底（仅作展示，不参与分析）
}

/** 读取真实环境（Node 下全部 false） */
export function readCapEnv(): CapEnv {
  const g = typeof globalThis === 'undefined' ? undefined : (globalThis as Record<string, unknown>);
  const nav = g ? (g['navigator'] as Record<string, unknown> | undefined) : undefined;
  const md = nav ? (nav['mediaDevices'] as Record<string, unknown> | undefined) : undefined;
  return {
    isSecureContext: !!(g && g['isSecureContext']),
    hasMediaDevices: !!md && typeof md['getUserMedia'] === 'function',
    hasAudioContext: !!g && (typeof g['AudioContext'] !== 'undefined' || typeof g['webkitAudioContext'] !== 'undefined'),
    hasWebGpu: !!g && typeof g['navigator'] !== 'undefined' && !!(nav?.['gpu'] as unknown),
    hasLocalStorage: (() => {
      try {
        return typeof localStorage !== 'undefined' && !!localStorage;
      } catch {
        return false;
      }
    })(),
    hasSt: !!g && ('SpeechRecognition' in g || 'webkitSpeechRecognition' in g),
  };
}

/**
 * 纯函数：环境 → Capabilities（ARCHITECTURE 3.3 的四项）。
 * phoneme / asr / llm 由上层注入（模型是否已加载、用户是否配了 key），
 * 这里只负责 webgpu 这种环境事实。
 */
export function detectCapabilities(env: CapEnv, loaded?: Partial<CapabilitiesLike>): CapabilitiesLike {
  const caps: CapabilitiesLike = {
    webgpu: !!env.hasWebGpu,
    phoneme: !!loaded?.phoneme,
    asr: !!loaded?.asr,
    llm: !!loaded?.llm,
  };
  if (!env.hasMediaDevices || !env.hasAudioContext) {
    // 没有录音能力时，音素分析也不可能工作
    caps.phoneme = false;
  }
  return caps;
}

/* ------------------------------------------------------------------ *
 * 二、L0 回退分析（无引擎也能给出反馈）
 * ------------------------------------------------------------------ */

export interface LocalAnalyzeInput {
  transcript: string;
  durationMs: number;
  topic?: TopicProfile | string | null;
  reference?: string;
  kind?: 'reading' | 'qa' | 'topic';
}

/**
 * 纯函数式回退：只用 L0 规则层产出 AnalysisResultLike。
 * 保证在「音素未加载 / ASR 未就绪 / 无 LLM key」时依然有完整的基础反馈。
 */
export function analyzeL0Only(input: LocalAnalyzeInput): AnalysisResultLike {
  const rules = evaluate({
    transcript: input.transcript ?? '',
    topic: input.topic ?? null,
    durationMs: input.durationMs,
  });
  const warnings: string[] = [];
  if (input.kind === 'topic') warnings.push('仅规则诊断：未加载发音分析与语音转写模型。');
  if (input.kind === 'reading') warnings.push('朗读题本次只评估内容完整度，逐音素对照需要先加载发音分析模型。');
  return { rules, transcript: input.transcript ?? '', warnings };
}

/* ------------------------------------------------------------------ *
 * 三、依赖注入的引擎契约（只读镜像，engine 组实现）
 * ------------------------------------------------------------------ */

export interface AnalyzeRequest {
  audio: Float32Array;
  sampleRate: number;
  kind: 'reading' | 'qa' | 'topic';
  reference?: string;
  topic?: TopicProfile | string | null;
  durationMs: number;
}

export interface EngineLike {
  capabilities(): CapabilitiesLike;
  analyze(input: AnalyzeRequest): Promise<AnalysisResultLike>;
}

export interface AppDeps {
  engine?: EngineLike | null;
  /** 语料加载（缺失时组卷用占位题） */
  loadPaper?: () => PaperSource | Promise<PaperSource>;
  /** 引擎不可用时的降级回调 */
  onEngineUnavailable?: (reason: string) => void;
}

export type AppTab = 'exam' | 'feedback' | 'settings';

export interface AppController {
  setTab(tab: AppTab): void;
  setPlan(plan: ExamPlan): void;
  startExam(): void;
  submit(): void;
  /** 手动输入转写文本（ASR 未就绪时的路径） */
  submitManualText(text: string): void;
  capabilities(): CapabilitiesLike;
  degradation(): ReturnType<typeof resolveDegradation>;
  destroy(): void;
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'exam', label: '模拟考场' },
  { id: 'feedback', label: '能力诊断' },
  { id: 'settings', label: 'AI 教练设置' },
];

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

/* ------------------------------------------------------------------ *
 * 四、创建应用
 * ------------------------------------------------------------------ */

export function createApp(mount: HTMLElement, deps: AppDeps = {}): AppController {
  const d = getDoc();
  const env = readCapEnv();
  const recEnv = readRecorderEnv();
  const recSupport = detectRecorderSupport(recEnv);

  let caps: CapabilitiesLike = detectCapabilities(env, {});
  let plan: ExamPlan = fullPlan();
  let timeline: TimelineStep[] = buildTimeline(plan);
  let paper = buildExamPaper({}, plan);
  let tab: AppTab = 'exam';
  /** 考试钟：相对开考时刻的毫秒偏移 */
  let nowMs = plan.includeCheckin ? -30 * 60_000 : -COUNTDOWN_HINT;
  let started = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let lastClip: RecordedClip | null = null;
  let manualText = '';
  let currentQuestion = 1;
  let byokView: ByokView | null = null;
  let recorderView: { destroy(): void } | null = null;

  if (!d) {
    return {
      setTab() {},
      setPlan() {},
      startExam() {},
      submit() {},
      submitManualText() {},
      capabilities: () => caps,
      degradation: () => resolveDegradation(caps),
      destroy() {},
    };
  }

  mount.textContent = '';
  mount.className = 'app';

  /* ---------- 顶栏 ---------- */
  const header = el('header', 'app__header');
  const brand = el('div', 'app__brand');
  brand.appendChild(el('h1', 'app__title', '英语听力口语 · 模拟考场'));
  brand.appendChild(el('p', 'app__tagline', '按江苏中考听说考试的真实流程练习，反馈是「能力诊断」不是考场估分。'));
  header.appendChild(brand);

  const modeSel = el('select', 'app__mode');
  const fullOpt = el('option', '', '完整模考（22 分钟，含考前流程）');
  fullOpt.value = 'full';
  const pracOpt = el('option', '', '快速练习（' + formatDurationCn(7.5 * 60_000) + '）');
  pracOpt.value = 'practice';
  modeSel.appendChild(fullOpt);
  modeSel.appendChild(pracOpt);
  modeSel.value = plan.mode;
  modeSel.addEventListener('change', () => {
    setPlan(modeSel.value === 'full' ? fullPlan() : practicePlan());
  });
  header.appendChild(modeSel);
  mount.appendChild(header);

  /* ---------- 能力条 ---------- */
  const capBar = el('div', 'app__caps');
  mount.appendChild(capBar);

  /* ---------- 标签页 ---------- */
  const nav = el('nav', 'app__nav');
  const tabBtns = new Map<AppTab, HTMLButtonElement>();
  for (const t of TABS) {
    const b = el('button', 'app__tab', t.label);
    b.type = 'button';
    b.addEventListener('click', () => setTab(t.id));
    tabBtns.set(t.id, b);
    nav.appendChild(b);
  }
  mount.appendChild(nav);

  const body = el('div', 'app__body');
  mount.appendChild(body);

  const examPane = el('section', 'app__pane app__pane--exam');
  const feedbackPane = el('section', 'app__pane app__pane--feedback');
  const settingsPane = el('section', 'app__pane app__pane--settings');
  body.appendChild(examPane);
  body.appendChild(feedbackPane);
  body.appendChild(settingsPane);

  /* ---------- 能力条渲染 ---------- */
  function renderCaps(): void {
    const dg = resolveDegradation(caps);
    capBar.textContent = '';
    capBar.className = 'app__caps' + (dg.slowMode ? ' is-slow' : '');
    capBar.appendChild(el('span', 'app__caps-level', '反馈层级：' + LEVEL_CN[dg.level]));
    for (const n of dg.notices) {
      capBar.appendChild(el('span', 'app__caps-chip app__caps-chip--' + n.level, n.text));
    }
    if (!recSupport.canRecord) {
      capBar.appendChild(el('span', 'app__caps-chip app__caps-chip--warn', recSupport.text + ' ' + recSupport.action));
    }
    if (!env.hasWebGpu) {
      capBar.appendChild(el('span', 'app__caps-chip app__caps-chip--info', dg.slowModeText));
    }
  }

  const LEVEL_CN: Record<string, string> = {
    full: '完整（L0 + L1 + L2 + L3）',
    partial: '基础（L0 + L2）',
    minimal: '最简（L0 规则诊断）',
  };

  /* ---------- 标签切换 ---------- */
  function setTab(next: AppTab): void {
    tab = next;
    for (const [id, b] of tabBtns) b.classList.toggle('is-active', id === next);
    examPane.classList.toggle('is-active', next === 'exam');
    feedbackPane.classList.toggle('is-active', next === 'feedback');
    settingsPane.classList.toggle('is-active', next === 'settings');
    if (next === 'exam') renderExam();
    if (next === 'feedback') renderFeedbackPane();
    if (next === 'settings') renderSettings();
  }

  /* ---------- 语料加载 ---------- */
  async function loadPaperIfPossible(): Promise<void> {
    if (!deps.loadPaper) return;
    try {
      const src = await deps.loadPaper();
      if (src) paper = buildExamPaper(src, plan);
    } catch (err) {
      deps.onEngineUnavailable?.('题库加载失败：' + String(err));
    }
  }

  /* ---------- 考场渲染 ---------- */
  function renderExam(): void {
    if (recorderView) {
      recorderView.destroy();
      recorderView = null;
    }
    examPane.textContent = '';
    const state = stepAt(timeline, nowMs);
    if (state.step.phase === 'exam') {
      currentQuestion = currentQuestionIndexSafe(paper, nowMs);
    }
    renderExamView(examPane, timeline, state, paper, {
      onEnterStage: () => {
        const nid = nextStageId(timeline, state.step.id);
        if (!nid) return;
        const i = timeline.findIndex(s => s.id === nid);
        nowMs = Math.max(nowMs, timeline[i].startMs);
        started = true;
        renderExam();
      },
      onSubmit: () => submit(),
      onBack: () => {
        const i = timeline.findIndex(s => s.id === state.step.id);
        if (i > 0) {
          nowMs = timeline[i - 1].startMs;
          renderExam();
        }
      },
    });

    // 作答区：录音 + 手动输入兜底
    if (state.step.phase === 'exam') {
      const q = paper.questions.find(x => x.index === currentQuestion) ?? null;
      const work = el('div', 'exam-work');
      if (q) {
        work.appendChild(el('h2', 'exam-work__q', '第 ' + q.index + ' 题 · ' + q.title));
        work.appendChild(el('p', 'exam-work__hint', '本题 ' + (q.budgetMs > 0 ? '建议用时 ' + formatDurationCn(q.budgetMs) : '不计时') + '。'));
        if (q.reference) {
          const refBox = el('div', 'exam-work__reference', q.reference);
          work.appendChild(refBox);
        }
      }
      const recBox = el('div', 'exam-work__recorder');
      recorderView = renderRecorder(recBox, {
        limitMs: q?.budgetMs ?? null,
        onRecorded: clip => {
          lastClip = clip;
          analyzeCurrent(clip);
        },
      });
      work.appendChild(recBox);

      if (!recSupport.canRecord) {
        const manual = el('div', 'exam-work__manual');
        manual.appendChild(el('p', 'notice notice--warn', '录音不可用，请手动输入你刚才朗读/回答的内容，L0 反馈依然有效。'));
        const ta = el('textarea', 'feedback__textarea');
        ta.rows = 3;
        ta.placeholder = '在此输入英文内容';
        manual.appendChild(ta);
        const btn = el('button', 'btn btn--primary', '提交并查看诊断');
        btn.type = 'button';
        btn.addEventListener('click', () => submitManualText(ta.value));
        manual.appendChild(btn);
        work.appendChild(manual);
      }
      examPane.appendChild(work);
    }
  }

  /** 与 exam.currentQuestionIndex 同义（段内累计），此处保留一份以便内联调用 */
  function currentQuestionIndexSafe(p: typeof paper, ms: number): number {
    const listeningMs = Math.max(0, Math.round(p.plan.listeningMs));
    const t = Math.max(0, ms);
    let sectionOffset = 0;
    let current = 'listening';
    for (const q of p.questions) {
      if (q.section !== current) {
        current = q.section;
        sectionOffset = q.section === 'listening' ? 0 : listeningMs;
      }
      if (q.budgetMs <= 0) continue;
      const start = sectionOffset;
      sectionOffset += q.budgetMs;
      if (t >= start && t < start + q.budgetMs) return q.index;
    }
    return p.questions.length ? p.questions[p.questions.length - 1].index : 1;
  }

  /* ---------- 分析 ---------- */
  async function analyzeCurrent(clip: RecordedClip | null): Promise<void> {
    const q = paper.questions.find(x => x.index === currentQuestion) ?? null;
    const durationMs = clip?.durationMs ?? 0;
    manualText = manualText.trim();
    const transcript = manualText;
    const kind = q?.kind === 'read-aloud' ? 'reading' : q?.kind === 'qa' ? 'qa' : 'topic';

    let result: AnalysisResultLike;
    if (deps.engine && clip) {
      try {
        const fresh = deps.engine.capabilities();
        caps = { ...fresh };
        renderCaps();
        result = await deps.engine.analyze({
          audio: clip.samples,
          sampleRate: clip.sampleRate,
          kind,
          reference: q?.reference,
          topic: q?.topic ?? null,
          durationMs,
        });
      } catch (err) {
        deps.onEngineUnavailable?.(String(err));
        result = analyzeL0Only({ transcript, durationMs, topic: q?.topic ?? null, reference: q?.reference, kind });
        result.warnings = [...(result.warnings ?? []), '分析引擎部分功能不可用，已回退到规则诊断。'];
      }
    } else {
      result = analyzeL0Only({ transcript, durationMs, topic: q?.topic ?? null, reference: q?.reference, kind });
      result.warnings = [...(result.warnings ?? []), '未接入分析引擎，当前为规则诊断（L0）模式。'];
    }

    lastView = toFeedbackView(
      result,
      caps,
      clip ? pitchTrack(clip.samples, clip.sampleRate) : undefined,
      clip?.pauses,
      durationMs,
    );
    lastReference = q?.reference ?? '';
    setTab('feedback');
  }

  let lastView: FeedbackView | null = null;
  let lastReference = '';

  function submitManualText(text: string): void {
    manualText = typeof text === 'string' ? text : '';
    void analyzeCurrent(lastClip);
  }

  function submit(): void {
    started = false;
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    if (!lastView) {
      void analyzeCurrent(lastClip);
    } else {
      setTab('feedback');
    }
  }

  /* ---------- 反馈渲染 ---------- */
  function renderFeedbackPane(): void {
    feedbackPane.textContent = '';
    if (!lastView) {
      feedbackPane.appendChild(
        el('p', 'notice notice--info', '还没有作答记录。完成任意一道口语题后，这里会显示能力诊断报告。'),
      );
      // 仍然展示静态的降级说明，让学生知道当前可用能力
      const dg = resolveDegradation(caps);
      feedbackPane.appendChild(el('p', 'feedback__disclaimer', '这是能力诊断，不是考场估分。'));
      feedbackPane.appendChild(el('p', 'notice notice--info', dg.summary));
      return;
    }
    renderFeedback(feedbackPane, lastView, {
      reference: lastReference,
      callbacks: {
        onManualInput: t => submitManualText(t),
        onOpenByok: () => setTab('settings'),
        onLoadPhoneme: () => {
          feedbackPane.appendChild(
            el('p', 'notice notice--info', '正在加载发音分析模型（约 ' + resolveDegradation(caps).phonemeModelMb + ' MB）…加载完成后本区会自动启用。'),
          );
        },
      },
    });
  }

  /* ---------- 设置渲染 ---------- */
  function renderSettings(): void {
    settingsPane.textContent = '';
    byokView = renderByokPanel(settingsPane, {
      onChange: cfg => {
        const usable = hasUsableKey(cfg);
        caps = { ...caps, llm: usable };
        renderCaps();
        if (lastView) lastView = toFeedbackView(toResultLike(lastView), caps);
      },
    });
    const cfg = loadConfig();
    caps = { ...caps, llm: hasUsableKey(cfg) };
    renderCaps();
  }

  function toResultLike(v: FeedbackView): AnalysisResultLike {
    return {
      rules: {
        score: v.score,
        checks: {
          length: { ok: v.bars[0]?.ok ?? false, value: v.bars[0]?.value ?? 0, threshold: v.bars[0]?.threshold ?? MIN_SENTENCES, message: v.bars[0]?.message ?? '' },
          coverage: { ok: v.bars[1]?.ok ?? false, value: v.bars[1]?.value ?? 0, threshold: v.bars[1]?.threshold ?? 0.5, message: v.bars[1]?.message ?? '' },
          connectors: { ok: v.bars[2]?.ok ?? false, value: v.bars[2]?.value ?? 0, threshold: v.bars[2]?.threshold ?? 2, message: v.bars[2]?.message ?? '' },
          fillers: { ok: v.bars[3]?.ok ?? false, value: v.bars[3]?.value ?? 0, threshold: 0, message: v.bars[3]?.message ?? '' },
          pace: { ok: v.bars[4]?.ok ?? false, value: v.bars[4]?.value ?? 0, threshold: 3.2, message: v.bars[4]?.message ?? '' },
        },
        diagnostics: v.cards.map(c => ({ code: c.code, severity: c.severity, message: c.message, suggestion: c.suggestion })),
        progress: v.bars[0]?.ratio ?? 0,
      },
      transcript: v.transcript,
      warnings: v.warnings,
    };
  }

  /* ---------- 方案切换 ---------- */
  function setPlan(next: ExamPlan): void {
    plan = next;
    timeline = buildTimeline(plan);
    paper = buildExamPaper(paper && paper.questions.length ? toSource(paper) : {}, plan);
    nowMs = plan.includeCheckin ? -30 * 60_000 : -COUNTDOWN_HINT;
    started = false;
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    modeSel.value = plan.mode;
    if (tab === 'exam') renderExam();
  }

  /** 已有题目 → 还原成 PaperSource 以便切换模式时保留题库 */
  function toSource(p: typeof paper): PaperSource {
    const by = (k: string) => p.questions.find(q => q.kind === k);
    const q1 = by('listen-dialogue');
    const q2 = by('listen-passage');
    const q3 = by('read-aloud');
    const q4 = by('qa');
    const q5 = by('topic');
    return {
      listenDialogue: q1 ? { id: q1.id, title: q1.title } : null,
      listenPassage: q2 ? { id: q2.id, title: q2.title } : null,
      readAloud: q3 ? { id: q3.id, title: q3.title, text: q3.reference } : null,
      qa: q4 ? { id: q4.id, title: q4.title } : null,
      topic: q5 ? { id: q5.id, title: q5.title, profile: q5.topic } : null,
    };
  }

  /* ---------- 计时器 ---------- */
  function startExam(): void {
    started = true;
    if (timer !== null) return;
    timer = setInterval(() => {
      nowMs += 250;
      if (isExamOver(timeline, nowMs)) {
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
        submit();
        return;
      }
      if (tab === 'exam' && started) {
        // 只更新倒计时与阶段，避免打断录音
        updateClock();
      }
    }, 250);
  }

  function updateClock(): void {
    const clock = examPane.querySelector('.exam-clock__value');
    if (!clock) return;
    const st = stepAt(timeline, nowMs);
    clock.textContent = st.step.durationMs > 0 ? formatClock(st.remainingMs) : '--:--';
    clock.classList.toggle('is-urgent', st.remainingMs <= 30_000 && st.step.durationMs > 0);
  }

  /* ---------- 首次进入下一环节 ---------- */
  const firstStep = timeline[0];
  if (firstStep && nowMs >= firstStep.endMs) {
    const i = timeline.findIndex(s => s.startMs > nowMs);
    if (i > 0) nowMs = timeline[i - 1].endMs;
  }
  if (plan.includeCheckin) {
    nowMs = Math.min(nowMs, -COUNTDOWN_HINT);
  }

  renderCaps();
  setTab('exam');
  void loadPaperIfPossible().then(() => {
    if (tab === 'exam') renderExam();
  });
  startExam();

  return {
    setTab,
    setPlan,
    startExam,
    submit,
    submitManualText,
    capabilities: () => caps,
    degradation: () => resolveDegradation(caps),
    destroy() {
      if (timer !== null) clearInterval(timer);
      recorderView?.destroy();
    },
  };
}

const COUNTDOWN_HINT = 30_000;

/**
 * 便捷入口：挂载到 #app（若不存在则创建）。
 * Lead 在 src/main.ts 中注入 engine 依赖即可。
 */
export function boot(deps: AppDeps = {}): AppController | null {
  const d = getDoc();
  if (!d) return null;
  let mount = d.getElementById('app');
  if (!mount) {
    mount = d.createElement('div');
    mount.id = 'app';
    d.body.appendChild(mount);
  }
  return createApp(mount, deps);
}

/** 主题切换：浅色 / 深色 / 跟随系统 */
export function applyTheme(theme: 'light' | 'dark' | 'auto'): void {
  const d = getDoc();
  if (!d) return;
  const root = d.documentElement;
  if (theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', theme);
  try {
    if (typeof localStorage !== 'undefined' && localStorage) localStorage.setItem('oels.theme', theme);
  } catch {
    /* 忽略存储失败 */
  }
}

/** 读取已保存主题 */
export function loadTheme(): 'light' | 'dark' | 'auto' {
  try {
    if (typeof localStorage === 'undefined' || !localStorage) return 'auto';
    const v = localStorage.getItem('oels.theme');
    return v === 'light' || v === 'dark' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

/** 纯函数：默认能力（导出供测试） */
export { emptyCapabilities, resolveDegradation };
/** 重新导出录音器类型，方便上层统一引用 */
export type { AudioRecorder };
