/**
 * 界面层自测 —— 纯逻辑函数，零浏览器依赖
 * 许可：AGPL-3.0-only
 *
 * 运行：node --experimental-strip-types tests/ui.test.ts
 *
 * 覆盖：
 *   1. 时间轴计算（考场流程与真实考试 22 分钟一致性）
 *   2. 组卷渲染（五道题、时长分配、降级占位）
 *   3. 录音纯函数（电平/波形/停顿/音高）与三种降级
 *   4. 反馈数据结构转换（音素表/漏读/双轨/进度条/诊断）
 *   5. 降级状态机（16 种 Capabilities 组合均不崩、L0 恒可用）
 *   6. BYOK（5 家服务商、key 不外传的请求构造）
 */

import {
  buildTimeline,
  stepAt,
  nextStageId,
  isExamOver,
  examRemainingMs,
  formatClock,
  formatDurationCn,
  allocateBudgets,
  fullPlan,
  practicePlan,
  buildExamPaper,
  questionsOfStage,
  questionAt,
  currentQuestionIndex,
  describeTimeline,
  FULL_EXAM,
  COUNTDOWN_MS,
  QUESTION_ORDER,
  PRACTICE_EXAM,
} from '../src/ui/exam.ts';

import {
  computeLevelDb,
  levelToBar,
  downsampleWaveform,
  findPauses,
  pitchTrack,
  detectRecorderSupport,
  classifyRecorderError,
  describeRecorderError,
  readRecorderEnv,
  SUPPORT_TEXT,
  type RecorderEnv,
} from '../src/ui/recorder.ts';

import {
  resolveDegradation,
  emptyCapabilities,
  buildPhonemeRows,
  phonemeAccuracy,
  alignWords,
  buildMissedWords,
  tokenizeWithSpans,
  toleranceOf,
  buildTracks,
  buildCheckBars,
  buildDiagnosticCards,
  toFeedbackView,
  renderReferenceWithMarks,
  escapeHtml,
  PHONEME_MODEL_MB,
  CHECK_LABELS,
  type CapabilitiesLike,
  type PhonemeReportLike,
} from '../src/ui/feedback.ts';

import {
  PROVIDERS,
  getProvider,
  defaultProviderId,
  chatCompletionsUrl,
  maskKey,
  validateKey,
  loadConfig,
  saveConfig,
  clearStoredConfig,
  hasUsableKey,
  buildConnectionRequest,
  describeTestOutcome,
  runConnectionTest,
  STORAGE_KEY,
  PRIVACY_PROMISE,
} from '../src/ui/byok.ts';

import { evaluate, MIN_SENTENCES } from '../src/rules/evaluate.ts';
import { TOPICS } from '../src/rules/lexicon.ts';

/* ------------------------------------------------------------------ */

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    pass++;
    console.log('  PASS  ' + name);
  } else {
    fail++;
    console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : ''));
  }
}

function section(title: string) {
  console.log('\n=== ' + title + ' ===');
}

function approx(a: number, b: number, tol = 1e-6): boolean {
  return Math.abs(a - b) <= tol;
}

console.log('=== 界面层自测 ===');

/* ================================================================== *
 * 1. 时间轴计算
 * ================================================================== */

section('[1] 考场时间轴');

const full = buildTimeline(fullPlan());
console.log(describeTimeline(full));

check('时间轴非空', full.length > 0, String(full.length));
check('正考总时长 22 分钟', examRemainingMs(full, 0) === FULL_EXAM.totalMs, String(examRemainingMs(full, 0)));
check('听力 12 分钟 / 口语 10 分钟', FULL_EXAM.listeningMs === 720000 && FULL_EXAM.speakingMs === 600000);
check('阶段顺序严格递增', full.every((s, i) => i === 0 || s.startMs >= full[i - 1].startMs));
check('无负时长阶段', full.every(s => s.durationMs >= 0));

// 完整考场流程的 11 个环节
const ids = full.map(s => s.id).join(',');
console.log('  阶段:', ids);
check(
  '流程含准备室→候考→[准备考试]→就座→核对→设备测试→等待→倒计时→听力→口语→交卷',
  ids === 'checkin,waiting,prepare,seat,identity,device,awaiting,countdown,listening,speaking,submit',
  ids,
);
check('考前 30 分钟进入准备室', full[0].startMs === -30 * 60_000, String(full[0].startMs));
check('考前 15 分钟进入候考室', full[1].startMs === -15 * 60_000);
check('考前 10 分钟[准备考试]', full[2].startMs === -10 * 60_000);
check('考前 5 分钟进考场核对准考证', full[3].startMs === -5 * 60_000);
check('开考前 30 秒倒计时', full.find(s => s.id === 'countdown')!.startMs === -COUNTDOWN_MS);
check('考前环节均不可跳过', full.filter(s => s.phase === 'pre-exam').every(s => s.blocking));

// stepAt 边界
const at0 = stepAt(full, 0);
check('now=0 处于听力阶段', at0.step.id === 'listening', at0.step.id);
check('听力阶段剩余 12 分钟', at0.remainingMs === 720000, String(at0.remainingMs));

const atMid = stepAt(full, 360000); // 开考后 6 分钟
check('开考后 6 分钟仍在听力', atMid.step.id === 'listening', atMid.step.id);
check('开考后 6 分钟剩余 6 分钟', atMid.remainingMs === 360000, String(atMid.remainingMs));
check('听力阶段进度 50%', approx(atMid.progress, 0.5), String(atMid.progress));

const atSpeak = stepAt(full, 720000); // 12 分钟 → 口语
check('12 分钟切入口语阶段', atSpeak.step.id === 'speaking', atSpeak.step.id);

const atEnd = stepAt(full, 1320000); // 22 分钟
check('22 分钟进入交卷阶段', atEnd.step.id === 'submit', atEnd.step.id);
check('22 分钟即考试结束', isExamOver(full, 1320000));
check('21 分钟尚未结束', !isExamOver(full, 1319999));

const before = stepAt(full, -29 * 60_000);
check('考前 29 分钟处于准备室', before.step.id === 'checkin', before.step.id);
check('阶段进行中 status=running', before.status === 'running', before.status);

const future = stepAt(full, -31 * 60_000);
check('早于整个流程 status=before', future.status === 'before', future.status);
check('before 时剩余不为负', future.remainingMs >= 0);

check('进度单调不越界', (() => {
  let prev = -1;
  for (let t = -31 * 60_000; t <= 23 * 60_000; t += 7000) {
    const s = stepAt(full, t);
    if (s.progress < 0 || s.progress > 1) return false;
    if (s.index < prev) return false;
    prev = s.index;
  }
  return true;
})());

check('nextStageId 顺着流程走', nextStageId(full, 'checkin') === 'waiting' && nextStageId(full, 'speaking') === 'submit' && nextStageId(full, 'submit') === null);
check('未知 id 返回首个阶段', nextStageId(full, 'nope') === 'checkin');
check('formatClock 基本格式', formatClock(65000) === '01:05' && formatClock(0) === '00:00' && formatClock(-30000) === '-00:30');
check('formatClock 超过一小时', formatClock(3725000) === '1:02:05', formatClock(3725000));
check('formatDurationCn 中文', formatDurationCn(90000) === '1 分 30 秒' && formatDurationCn(60000) === '1 分钟' && formatDurationCn(20000) === '20 秒');
check('空时间轴抛错而非静默', (() => {
  try {
    stepAt([], 0);
    return false;
  } catch {
    return true;
  }
})());

// 缩短版
const prac = buildTimeline(practicePlan());
check('练习版不含考前流程', !prac.some(s => s.id === 'checkin'));
check('练习版总时长 < 正考', examRemainingMs(prac, 0) < examRemainingMs(full, 0));
check('练习版听力+口语=总量', examRemainingMs(prac, 0) === prac[prac.length - 1].endMs);
check('练习版压缩比例仍为 22 分钟的比例', approx(practicePlan(0.5).listeningMs, 120000) && approx(practicePlan(0.5).speakingMs, 105000));
check('练习比例超界被夹紧', practicePlan(99).listeningMs === PRACTICE_EXAM.listeningMs && practicePlan(-3).listeningMs > 0 && practicePlan(-3).speakingMs > 0);

// 权重分配
const alloc = allocateBudgets({ a: 0.3, b: 0.7 }, 1000);
check('权重分配守恒', alloc.a + alloc.b === 1000, JSON.stringify(alloc));
check('权重分配按比例', alloc.a === 300 && alloc.b === 700, JSON.stringify(alloc));
const alloc3 = allocateBudgets({ a: 1, b: 1, c: 1 }, 100);
check('三等分配守恒', alloc3.a + alloc3.b + alloc3.c === 100, JSON.stringify(alloc3));
const alloc0 = allocateBudgets({ a: 0 }, 500);
check('零权重分得 0', alloc0.a === 0);

/* ================================================================== *
 * 2. 组卷渲染
 * ================================================================== */

section('[2] 组卷渲染');

const paper = buildExamPaper(
  {
    listenDialogue: { id: 'd1', title: '听对话回答问题', questions: ['What time is it?', 'Where are they?'] },
    listenPassage: { id: 'p1', title: '听短文', questions: ['Q1', 'Q2', 'Q3'] },
    readAloud: { id: 'r1', title: 'A Green Weekend', text: 'Last Saturday I went to the park with my classmates.' },
    qa: { id: 'q1', title: '情景问答', questions: ['How do you go to school?'] },
    topic: { id: 't1', title: 'My favourite sport' },
  },
  fullPlan(),
);

check('五道题', paper.questions.length === 5, String(paper.questions.length));
check('题目顺序为考试固定顺序', paper.questions.map(q => q.kind).join(',') === QUESTION_ORDER.join(','));
check('编号 1..5', paper.questions.map(q => q.index).join('') === '12345');
check('前两题属听力', paper.questions[0].section === 'listening' && paper.questions[1].section === 'listening');
check('后三题属口语', paper.questions.slice(2).every(q => q.section === 'speaking'));
check('朗读题带原文', (questionAt(paper, 3)?.reference ?? '').includes('Last Saturday'));
check('话题题带话题名', questionAt(paper, 5)?.topic === 'My favourite sport');
check('听力阶段含 2 题', questionsOfStage(paper, 'listening').length === 2);
check('口语阶段含 3 题', questionsOfStage(paper, 'speaking').length === 3);
check('素材齐全标记为 5', paper.loadedMaterials === 5, String(paper.loadedMaterials));

const listenTotal = paper.questions.filter(q => q.section === 'listening').reduce((a, q) => a + q.budgetMs, 0);
const speakTotal = paper.questions.filter(q => q.section === 'speaking').reduce((a, q) => a + q.budgetMs, 0);
check('听力时长分配守恒 12 分钟', listenTotal === FULL_EXAM.listeningMs, String(listenTotal));
check('口语时长分配守恒 10 分钟', speakTotal === FULL_EXAM.speakingMs, String(speakTotal));
check('朗读题 < 情景问答 < 话题简述', paper.questions[2].budgetMs < paper.questions[3].budgetMs && paper.questions[3].budgetMs < paper.questions[4].budgetMs);

// 按已用时间定位当前题
check('0 时刻在第 1 题', currentQuestionIndex(paper, 0) === 1, String(currentQuestionIndex(paper, 0)));
check('听力中段仍在听力题', currentQuestionIndex(paper, FULL_EXAM.listeningMs - 1000) <= 2);
check('进入口语阶段定位到朗读', currentQuestionIndex(paper, FULL_EXAM.listeningMs + 1000) === 3, String(currentQuestionIndex(paper, FULL_EXAM.listeningMs + 1000)));
check('超时定位到最后一题', currentQuestionIndex(paper, FULL_EXAM.totalMs) === 5);
check('负时刻回退到第 1 题', currentQuestionIndex(paper, -5000) === 1);

// 题库缺失 → 占位题，不崩
const emptyPaper = buildExamPaper({}, practicePlan());
check('空素材仍生成 5 题', emptyPaper.questions.length === 5);
check('空素材标记 0', emptyPaper.loadedMaterials === 0);
check('空素材给出中文占位提示', emptyPaper.questions.every(q => q.prompt.includes('题库未加载')));
check('空素材不产生异常时长', emptyPaper.questions.every(q => q.budgetMs >= 0));
check('不传参数也不崩', buildExamPaper().questions.length === 5);
check('partial 素材也能组卷', buildExamPaper({ readAloud: { text: 'hi' } }).questions.length === 5);

// 全部文案为中文
const hasChinese = (s: string) => /[\u4e00-\u9fa5]/.test(s);
check('题目标题全中文', paper.questions.every(q => hasChinese(q.title)));
check('时间轴标题全中文', full.every(s => hasChinese(s.title) && hasChinese(s.detail)));
check('建议用时为中文', paper.questions[4].budgetMs > 0 && hasChinese(formatDurationCn(paper.questions[4].budgetMs)));

/* ================================================================== *
 * 3. 录音：纯函数与三种降级
 * ================================================================== */

section('[3] 录音控件');

const okEnv: RecorderEnv = { hasMediaDevices: true, hasMediaRecorder: true, hasAudioContext: true, isSecureContext: true };
const deniedEnv: RecorderEnv = { ...okEnv, hasMediaDevices: false };
const noApiEnv: RecorderEnv = { ...okEnv, hasMediaRecorder: false, hasAudioContext: false };
const insecureEnv: RecorderEnv = { ...okEnv, isSecureContext: false };

check('正常环境可录音', detectRecorderSupport(okEnv).support === 'ok' && detectRecorderSupport(okEnv).canRecord);
check('无麦克风 → no-microphone', detectRecorderSupport(deniedEnv).support === 'no-microphone');
check('不支持 → unsupported', detectRecorderSupport(noApiEnv).support === 'unsupported');
check('非安全环境 → insecure-context', detectRecorderSupport(insecureEnv).support === 'insecure-context');
check('四种情况均有中文提示', [okEnv, deniedEnv, noApiEnv, insecureEnv].every(e => hasChinese(detectRecorderSupport(e).text)));
check('三种失败都给手动输入出路', [deniedEnv, noApiEnv, insecureEnv].every(e => detectRecorderSupport(e).action.includes('手动输入') || detectRecorderSupport(e).action.includes('允许')));
check('不可录音时 canRecord=false', [deniedEnv, noApiEnv, insecureEnv].every(e => !detectRecorderSupport(e).canRecord));
check('Node 下环境探测不崩', readRecorderEnv().hasMediaDevices === false);

// 错误分类
check('权限被拒分类正确', classifyRecorderError({ name: 'NotAllowedError' }) === 'permission-denied');
check('无麦克风分类正确', classifyRecorderError({ name: 'NotFoundError' }) === 'not-found');
check('设备占用分类正确', classifyRecorderError({ name: 'NotReadableError' }) === 'not-readable');
check('未知异常兜底', classifyRecorderError(new Error('boom')) === 'unknown' && classifyRecorderError(null) === 'unknown');
check('非对象异常不崩', classifyRecorderError('str') === 'unknown' && classifyRecorderError(undefined) === 'unknown');
check('错误转中文且有出路', describeRecorderError({ name: 'NotAllowedError' }).canFallback && hasChinese(describeRecorderError({ name: 'NotAllowedError' }).action));
check('三种失败都有中文文案', ['permission-denied', 'not-found', 'not-readable'].every(k => hasChinese(describeRecorderError({ name: k === 'permission-denied' ? 'NotAllowedError' : k === 'not-found' ? 'NotFoundError' : 'NotReadableError' }).text)));

// 电平 / 波形
const sr = 16000;
const loud = new Float32Array(sr / 10).fill(0.5);
const silence = new Float32Array(sr / 10);
check('响度电平接近 0 dBFS', computeLevelDb(loud) > -10, computeLevelDb(loud).toFixed(2));
check('静音为 -60 dBFS', approx(computeLevelDb(silence), -60));
check('空数组不崩', approx(computeLevelDb(new Float32Array(0)), -60));
check('电平条归一化', approx(levelToBar(0), 1) && approx(levelToBar(-60), 0) && approx(levelToBar(-30), 0.5));
check('电平条夹紧越界', levelToBar(10) === 1 && levelToBar(-99) === 0);

const wave = downsampleWaveform(loud, 40);
check('波形桶数正确', wave.length === 40, String(wave.length));
check('波形值归一化到 0..1', wave.every(v => v >= 0 && v <= 1));
check('恒定信号波形等高', new Set(wave.map(v => v.toFixed(3))).size === 1);
check('空波形不崩', downsampleWaveform(new Float32Array(0), 10).length === 10 && downsampleWaveform(new Float32Array(0), 10).every(v => v === 0));

// 停顿
const withPause = new Float32Array(sr * 2);
for (let i = 0; i < sr / 2; i++) withPause[i] = 0.4;
for (let i = sr / 2; i < sr * 3 / 2; i++) withPause[i] = 0.0;
for (let i = sr * 3 / 2; i < sr * 2; i++) withPause[i] = 0.4;
const pauses = findPauses(withPause, sr);
check('检出 1 处明显停顿', pauses.length === 1, JSON.stringify(pauses));
check('停顿时长约 1 秒', pauses[0] && Math.abs(pauses[0].durationMs - 1000) < 80, JSON.stringify(pauses[0]));
check('纯信号无停顿', findPauses(loud, sr).length === 0);
check('短停顿被 minMs 过滤', findPauses(withPause, sr, { minMs: 5000 }).length === 0);
check('findPauses 非法采样率不崩', Array.isArray(findPauses(withPause, 0)));

// 音高（200 Hz 正弦）
function sine(freq: number, seconds: number, rate: number): Float32Array {
  const n = Math.round(rate * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = 0.5 * Math.sin((2 * Math.PI * freq * i) / rate);
  return out;
}
const p200 = pitchTrack(sine(200, 1, sr), sr);
check('产出音高帧', p200.length > 20, String(p200.length));
check('识别基频接近 200Hz', p200.some(f => f.voiced && Math.abs(f.hz - 200) < 12), JSON.stringify(p200.slice(5, 9)));
check('浊音帧能量 > 0', p200.some(f => f.energy > 0));
check('静音无浊音帧', pitchTrack(silence, sr).every(f => !f.voiced));
check('样本太短返回空数组', pitchTrack(new Float32Array(10), sr).length === 0);
check('pitchTrack 不依赖 Web Audio', p200.every(f => typeof f.tMs === 'number' && typeof f.energy === 'number'));

/* ================================================================== *
 * 4. 反馈数据结构转换
 * ================================================================== */

section('[4] 反馈转换');

const refText = 'Last Saturday I went to the park with my classmates.';
const hypText = 'Last Saturday I went to park my classmates.';
const align = alignWords(refText, hypText);
check('词对齐返回结果', align.length >= 9, String(align.length));
check('命中词标为 hit', align.some(a => a.status === 'hit'));
check('漏读词被标出', align.some(a => a.status === 'missed' && a.word === 'the'), JSON.stringify(align.filter(a => a.status !== 'hit')));
check('漏读的 the 让后续对齐仍正确', align.find(a => a.word === 'park')!.status === 'hit');
check('多读词被标为 extra', alignWords('I like apples', 'I really like green apples').filter(a => a.status === 'extra').map(a => a.word).sort().join(',') === 'green,really',
  JSON.stringify(alignWords('I like apples', 'I really like green apples').map(a => a.word + ':' + a.status)));
check('span 为有效区间', align.filter(a => a.span[0] >= 0).every(a => a.span[1] > a.span[0]));
check('span 指向原文正确位置', (() => {
  const the = align.find(a => a.word === 'the');
  return !!the && refText.slice(the.span[0], the.span[1]) === 'the';
})());
check('无漏读时返回空数组', buildMissedWords('a b c', 'a b c').length === 0);
check('空输入不崩', alignWords('', '').length === 0 && buildMissedWords('', '').length === 0);
check('tokenizeWithSpans 带位置', (() => {
  const t = tokenizeWithSpans("Hello, World's end.");
  return t.length === 3 && t[0].start === 0 && t[1].word === 'world';
})());
check('容错阈值短词 1 长词 2', toleranceOf('cat') === 1 && toleranceOf('classroom') === 2);
check('空串 tokenize 不崩', tokenizeWithSpans('').length === 0);

const html = renderReferenceWithMarks(refText, hypText);
check('漏读有红色标记', html.includes('ref-mark--missed'), html.slice(0, 80));
check('高亮不含未转义尖括号', !renderReferenceWithMarks('<script>x</script>', '').includes('<script>'));
check('escapeHtml 转义', escapeHtml('<a href="x">&</a>') === '&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');

// 音素表
const ph: PhonemeReportLike = {
  accuracy: 78,
  segments: [
    { phoneme: 'l', expected: 'l', confidence: 0.95, word: 'last' },
    { phoneme: 'y', expected: 'x', confidence: 0.42, word: 'Saturday' },
    { phoneme: '', expected: 'θ', confidence: 0.1, word: 'the' },
    { phoneme: 'p', expected: 'p', confidence: 0.9, word: 'park' },
  ],
};
const rows = buildPhonemeRows(ph);
check('音素表行数一致', rows.length === 4, String(rows.length));
check('序号从 1 开始', rows[0].index === 1);
check('错读被识别', rows[1].mispronounced && rows[1].expected === 'x' && rows[1].actual === 'y');
check('漏读被识别', rows[2].dropped && rows[2].actual === '（未发出）');
check('正确音素不标错', !rows[0].mispronounced && !rows[3].mispronounced);
check('置信度转为 0..100', rows[0].confidence === 95 && rows[1].confidence === 42);
check('错读给出中文说明', hasChinese(rows[1].note) && rows[1].note.includes('x'));
check('置信度越界被夹紧', buildPhonemeRows({ segments: [{ phoneme: 'a', expected: 'a', confidence: 5 }] })[0].confidence === 100);
check('空音素报告不崩', buildPhonemeRows(null).length === 0 && buildPhonemeRows(undefined).length === 0 && buildPhonemeRows({ segments: [] }).length === 0);
check('音素准确度取报告值', phonemeAccuracy(ph) === 78);
check('无 accuracy 时按行计算', phonemeAccuracy({ segments: [{ phoneme: 'a', expected: 'a', confidence: 1 }, { phoneme: 'b', expected: 'c', confidence: 1 }] }) === 50);
check('空报告准确度为 0', phonemeAccuracy(null) === 0);

// 双轨
const frames = [...p200, ...pitchTrack(silence, sr)];
const tracks = buildTracks(frames, pauses, 2000);
check('轨道 x 归一化到 0..1', tracks.pitch.every(p => p.x >= 0 && p.x <= 1) && tracks.energy.every(p => p.x >= 0 && p.x <= 1));
check('轨道 y 归一化到 0..1', tracks.pitch.every(p => p.y >= 0 && p.y <= 1) && tracks.energy.every(p => p.y >= 0 && p.y <= 1));
check('音高轨与能量轨等长', tracks.pitch.length === tracks.energy.length);
check('停顿被转成标记', tracks.pauses.length === 1 && tracks.pauses[0].width > 0);
check('停顿标记有中文说明', hasChinese(tracks.pauses[0].text));
check('音高范围已统计', tracks.pitchRange.min > 0 && tracks.pitchRange.max >= tracks.pitchRange.min);
check('浊音占比在 0..1', tracks.voicedRatio >= 0 && tracks.voicedRatio <= 1);
check('高音在图上更高（y 更小）', (() => {
  const hi = buildTracks(pitchTrack(sine(300, 0.5, sr), sr), [], 500);
  const lo = buildTracks(pitchTrack(sine(100, 0.5, sr), sr), [], 500);
  const avg = (t: { pitch: { y: number; raw: number }[] }) => {
    const v = t.pitch.filter(p => p.raw > 0).map(p => p.y);
    return v.reduce((a, b) => a + b, 0) / (v.length || 1);
  };
  return avg(hi) < avg(lo);
})());
check('buildTracks 空输入不崩', buildTracks([], [], 0).pitch.length === 0 && buildTracks([], [], 0).durationMs === 1);
check('buildTracks null 输入不崩', buildTracks(undefined as unknown as never, undefined as unknown as never, 0).pauses.length === 0);

// L0 进度条 + 诊断
const goodText = [
  'I like playing basketball very much.',
  'First, I am a member of our school basketball team.',
  'Second, I often play with my friends after school.',
  'Also, basketball helps me keep fit and healthy.',
  'However, it is hard when we lose a game.',
  'But my friends and I keep training every weekend.',
  'In my opinion, sport makes our school life more fun.',
].join(' ');
const goodReport = evaluate({ transcript: goodText, topic: 'my favourite sport', durationMs: 46000 });
const bars = buildCheckBars(goodReport);
check('五条进度条', bars.length === 5);
check('标签全中文', bars.every(b => hasChinese(b.label)));
check('标签覆盖五项', bars.map(b => b.key).join(',') === 'length,coverage,connectors,fillers,pace');
check('ratio 在 0..1', bars.every(b => b.ratio >= 0 && b.ratio <= 1));
check('每条都有改进建议', bars.every(b => hasChinese(b.advice)));
check('理想作答全部通过', bars.every(b => b.ok), JSON.stringify(bars.filter(b => !b.ok).map(b => b.key)));

const badReport = evaluate({ transcript: 'I like it. It is good.', topic: 'my favourite sport', durationMs: 3000 });
const badBars = buildCheckBars(badReport);
check('糟糕作答有未通过项', badBars.some(b => !b.ok));
check('句数不足 ratio<1', badBars[0].ratio < 1);
check('语速过快 ratio<1', (() => {
  const fast = evaluate({ transcript: 'One two three four five six seven eight nine ten eleven twelve.', durationMs: 2000 });
  const fb = buildCheckBars(fast)[4];
  return fb.ratio < 1 && !fb.ok;
})(), String(buildCheckBars(evaluate({ transcript: 'One two three four five six seven eight nine ten eleven twelve.', durationMs: 2000 }))[4].ratio));
check('填充词越多 ratio 越低', (() => {
  const withFillers = evaluate({ transcript: 'Um, I um like uh it. Then I uh play.', durationMs: 20000 });
  const b = buildCheckBars(withFillers);
  return b[3].ratio < 1;
})());
check('语速适中 ratio=1', (() => {
  const r = evaluate({ transcript: 'One two three four five six seven.', durationMs: 5000 });
  return approx(buildCheckBars(r)[4].ratio, 1) && buildCheckBars(r)[4].ok;
})(), String(buildCheckBars(evaluate({ transcript: 'One two three four five six seven.', durationMs: 5000 }))[4].ratio));
check('语速过慢 ratio<1', (() => {
  const slow = evaluate({ transcript: 'One two three four five six seven eight.', durationMs: 30000 });
  const sb = buildCheckBars(slow)[4];
  return sb.ratio < 1 && !sb.ok;
})());
check('无时长时语速 ratio=0', buildCheckBars(evaluate({ transcript: 'Hello there.' }))[4].ratio === 0);
check('空报告返回占位进度条', buildCheckBars(null).length === 1 && buildCheckBars(undefined)[0].label === CHECK_LABELS.length);

const cards = buildDiagnosticCards(badReport.diagnostics);
check('诊断转卡片', cards.length === badReport.diagnostics.length);
check('每条都有问题与建议', cards.every(c => c.message.length > 0 && hasChinese(c.suggestion)));
check('按严重度排序（error 在前）', cards[0].severity === 'error', cards[0].severity);
check('严重度标签中文', cards.every(c => hasChinese(c.severityLabel)));
check('空诊断给出兜底卡片', buildDiagnosticCards([])[0].code === 'ALL_OK');
check('undefined 诊断不崩', buildDiagnosticCards(undefined).length === 1 && buildDiagnosticCards(null).length === 1);

/* ================================================================== *
 * 5. 降级状态机
 * ================================================================== */

section('[5] 降级状态机');

const capsAll: CapabilitiesLike = { webgpu: true, phoneme: true, asr: true, llm: true };
const dgAll = resolveDegradation(capsAll);
check('全能力 → full', dgAll.level === 'full');
check('全能力：无慢模式提示', !dgAll.slowMode && !dgAll.notices.length);
check('全能力：显示音素区', dgAll.showPhonemePanel && !dgAll.showPhonemeLoader);
check('全能力：不需要手动输入', !dgAll.needManualInput);
check('全能力：显示 LLM 区', dgAll.showLLMPanel && !dgAll.llmLockedText);

const dgNone = resolveDegradation(emptyCapabilities());
check('全空 → minimal', dgNone.level === 'minimal');
check('全空：慢模式提示', dgNone.slowMode && hasChinese(dgNone.slowModeText));
check('全空：隐藏音素区并给加载按钮', !dgNone.showPhonemePanel && dgNone.showPhonemeLoader);
check('全空：加载文案含体积与 MB', dgNone.phonemeLoaderText.includes(String(PHONEME_MODEL_MB)) && dgNone.phonemeLoaderText.includes('MB'));
check('全空：要求手动输入', dgNone.needManualInput && hasChinese(dgNone.manualInputText));
check('全空：隐藏 LLM 区并给解锁说明', !dgNone.showLLMPanel && hasChinese(dgNone.llmLockedText));
check('全空：L0 仍可用', dgNone.l0AlwaysAvailable);
check('全空：四条降级提示齐全', dgNone.notices.length === 4, String(dgNone.notices.length));
check('全空：所有文案中文', hasChinese(dgNone.summary));

check('无 GPU 才提示慢模式', resolveDegradation({ ...capsAll, webgpu: false }).slowMode && !resolveDegradation({ ...capsAll, webgpu: true }).slowMode);
check('慢模式不改变反馈层级', resolveDegradation({ ...dgAll ? { ...capsAll, webgpu: false } : capsAll }).level === 'full');
check('无 ASR → minimal', resolveDegradation({ ...capsAll, asr: false }).level === 'minimal');
check('有 ASR 无 LLM → partial', resolveDegradation({ ...capsAll, llm: false }).level === 'partial');
check('无音素 → partial', resolveDegradation({ ...capsAll, phoneme: false }).level === 'partial');

// 穷举 16 种组合
let combos = 0;
let crashed = 0;
for (const webgpu of [false, true]) {
  for (const phoneme of [false, true]) {
    for (const asr of [false, true]) {
      for (const llm of [false, true]) {
        combos++;
        try {
          const d = resolveDegradation({ webgpu, phoneme, asr, llm });
          if (!d.l0AlwaysAvailable || !['full', 'partial', 'minimal'].includes(d.level)) crashed++;
          if (!hasChinese(d.summary)) crashed++;
          if (d.showPhonemePanel === d.showPhonemeLoader) crashed++;
          if (d.needManualInput !== !asr) crashed++;
          if (d.showLLMPanel !== llm) crashed++;
        } catch {
          crashed++;
        }
      }
    }
  }
}
check('16 种能力组合均不崩且 L0 恒可用', combos === 16 && crashed === 0, 'crashed=' + crashed);
check('缺任一层都不会让层级为空', (() => {
  for (const phoneme of [false, true]) for (const asr of [false, true]) for (const llm of [false, true]) {
    const d = resolveDegradation({ webgpu: false, phoneme, asr, llm });
    if (!d.l0AlwaysAvailable) return false;
  }
  return true;
})());
check('resolveDegradation(undefined as any) 不崩', (() => {
  try {
    return resolveDegradation(undefined as unknown as CapabilitiesLike).level === 'minimal';
  } catch {
    return false;
  }
})());

// toFeedbackView 总装
const fullView = toFeedbackView(
  { rules: goodReport, transcript: hypText, phonemes: ph, advice: { overall: '不错', strengths: ['连贯'], improvements: ['加连接词'], sampleAnswer: 'I love sport.' }, warnings: ['ok'] },
  capsAll,
  frames,
  pauses,
  2000,
);
check('全能力视图 level=full', fullView.level === 'full');
check('免责声明强调能力诊断', fullView.disclaimer.includes('能力诊断') && fullView.disclaimer.includes('不是考场估分'));
check('转写来源标记为 asr', fullView.transcriptSource === 'asr');
check('音素区可用', fullView.phoneme?.available === true);
check('双轨已生成', !!fullView.tracks && fullView.tracks!.pitch.length > 0);
check('LLM 建议区可见', fullView.llm?.visible === true && fullView.llm!.strengths.length === 1);
check('五项进度条就绪', fullView.bars.length === 5);

const minView = toFeedbackView({ rules: goodReport, transcript: hypText }, emptyCapabilities(), undefined, undefined, 0);
check('全空视图 level=minimal', minView.level === 'minimal');
check('全空视图仍给 L0 五项', minView.bars.length === 5 && minView.cards.length > 0);
check('全空视图要求手动输入', minView.manualInput.required && hasChinese(minView.manualInput.placeholder || '例如'));
check('全空视图隐藏音素区', minView.phoneme?.available === false && minView.phonemeLoader.visible);
check('全空视图隐藏 LLM 区', minView.llm === null && hasChinese(minView.llmLockedText));
check('全空视图仍给出诊断分与免责', minView.score > 0 && hasChinese(minView.disclaimer));

const partialView = toFeedbackView({ rules: goodReport, transcript: hypText, phonemes: ph }, { webgpu: false, phoneme: true, asr: true, llm: false }, undefined, undefined, 0);
check('partial 视图：音素可用但无 LLM', partialView.level === 'partial' && partialView.phoneme?.available === true && partialView.llm === null);

check('toFeedbackView(null, caps) 不崩', (() => {
  try {
    const v = toFeedbackView(null, emptyCapabilities());
    return v.bars.length >= 1 && v.score === 0 && v.level === 'minimal';
  } catch {
    return false;
  }
})());
check('toFeedbackView 缺 warnings 不崩', (() => {
  try {
    return toFeedbackView({ rules: goodReport }, capsAll).warnings.length === 0;
  } catch {
    return false;
  }
})());
check('无音高帧时 tracks 为 null（不白屏）', toFeedbackView({ rules: goodReport }, capsAll).tracks === null);
check('反馈视图标题为中文', hasChinese(fullView.headline) && hasChinese(fullView.degradation.summary));

/* ================================================================== *
 * 6. BYOK
 * ================================================================== */

section('[6] BYOK 服务商');

check('5 家服务商', PROVIDERS.length === 5, String(PROVIDERS.length));
check('id 齐全', PROVIDERS.map(p => p.id).join(',') === 'zhipu,siliconflow,groq,google,ollama');
check('默认智谱 GLM', defaultProviderId() === 'zhipu' && getProvider('zhipu')!.baseUrl === 'https://open.bigmodel.cn/api/paas/v4');
check('硅基流动 URL 正确', getProvider('siliconflow')!.baseUrl === 'https://api.siliconflow.cn/v1');
check('Groq URL 正确', getProvider('groq')!.baseUrl === 'https://api.groq.com/openai/v1');
check('Google URL 正确', getProvider('google')!.baseUrl === 'https://generativelanguage.googleapis.com/v1beta/openai');
check('Ollama URL 正确', getProvider('ollama')!.baseUrl === 'http://localhost:11434/v1');
check('只有 Ollama 免 key', PROVIDERS.filter(p => !p.requiresKey).map(p => p.id).join(',') === 'ollama');
check('只有 Ollama 离线', PROVIDERS.filter(p => p.offline).map(p => p.id).join(',') === 'ollama');
check('全部服务商有中文名与说明', PROVIDERS.every(p => hasChinese(p.name) && hasChinese(p.note)));
check('Google 带 CORS 提醒', hasChinese(getProvider('google')!.caution ?? ''));
check('未知服务商返回 null', getProvider('nope') === null && getProvider(null) === null && getProvider(undefined) === null);
check('chat/completions 地址拼接', chatCompletionsUrl(getProvider('zhipu')!) === 'https://open.bigmodel.cn/api/paas/v4/chat/completions');

check('key 掩码不泄露原文', !maskKey('sk-abcdefghijklmnop').includes('abcdefgh'));
check('短 key 全掩码', maskKey('123') === '********' && !maskKey('123').includes('1'));
check('空 key 掩码为空', maskKey('') === '' && maskKey(null) === '');

check('空 key 校验失败', !validateKey('zhipu', '').ok);
check('短 key 校验失败', !validateKey('zhipu', 'abc').ok);
check('正常 key 校验通过', validateKey('zhipu', 'sk-1234567890abcdef').ok);
check('含空格 key 校验失败', !validateKey('zhipu', 'sk-1234567890 abcdef').ok);
check('未知服务商校验失败', !validateKey('nope', 'sk-1234567890abcdef').ok);
check('Ollama 无需 key 也通过', validateKey('ollama', '').ok);
check('校验文案中文', hasChinese(validateKey('zhipu', '').message));

// 连接请求：key 只发给选定的服务商
const req = buildConnectionRequest('zhipu', 'sk-1234567890abcdef');
check('构造连接请求', !!req);
check('URL 指向选定服务商', req!.url.startsWith('https://open.bigmodel.cn/'));
check('host 正确', req!.host === 'open.bigmodel.cn', req!.host);
check('Authorization 只含 Bearer', req!.init.headers['Authorization'] === 'Bearer sk-1234567890abcdef');
check('请求方法为 POST', req!.init.method === 'POST');
check('请求体是合法 JSON', (() => {
  try {
    JSON.parse(req!.init.body);
    return true;
  } catch {
    return false;
  }
})());
check('模型用推荐值', JSON.parse(req!.init.body).model === 'glm-4-flash');
check('Ollama 请求不带 Authorization', buildConnectionRequest('ollama', '')!.init.headers['Authorization'] === undefined);
check('无 key 时不构造请求', buildConnectionRequest('zhipu', '') === null);
check('未知服务商不构造请求', buildConnectionRequest('nope', 'x') === null);

check('测试成功文案中文', hasChinese(describeTestOutcome('ok', 200).message));
check('401 → key 无效', describeTestOutcome('failed', 401).message.includes('key'));
check('429 → 额度问题', describeTestOutcome('failed', 429).message.includes('额度'));
check('500 → 服务商不可用', describeTestOutcome('failed', 503).message.includes('不可用'));
check('CORS 失败建议离线方案', describeTestOutcome('failed').hint.includes('Ollama'));
check('所有测试结果均中文', [describeTestOutcome('ok'), describeTestOutcome('failed'), describeTestOutcome('testing')].every(o => hasChinese(o.message) && hasChinese(o.hint)));

// 注入 fetch 验证失败转中文
const okFetch = (async () => new Response('{}', { status: 200 })) as unknown as typeof fetch;
const badFetch = (async () => {
  throw new Error('CORS');
}) as unknown as typeof fetch;
check('注入成功 fetch → ok', (await (async () => {
  const o = await runConnectionTest('zhipu', 'sk-1234567890abcdef', okFetch);
  return o.state === 'ok';
})()));
check('fetch 抛错 → 中文失败', (await (async () => {
  const o = await runConnectionTest('zhipu', 'sk-1234567890abcdef', badFetch);
  return o.state === 'failed' && hasChinese(o.message) && hasChinese(o.hint);
})()));
check('缺 key 时测试直接失败', (await runConnectionTest('zhipu', '', okFetch)).state === 'failed');

// 本地存储：Node 下无 localStorage 也不能崩
check('Node 下 loadConfig 返回默认值', loadConfig().providerId === 'zhipu' && loadConfig().apiKey === '');
check('Node 下 saveConfig 返回 false', saveConfig({ providerId: 'groq', apiKey: '', model: '' }) === false);
check('Node 下 clearStoredConfig 返回 false', clearStoredConfig() === false);
check('Node 下 hasUsableKey 可判定', hasUsableKey({ providerId: 'zhipu', apiKey: '', model: '' }) === false && hasUsableKey({ providerId: 'ollama', apiKey: '', model: '' }) === true);
check('hasUsableKey(undefined) 不崩', hasUsableKey(undefined as never) === false);
check('存储键名稳定', STORAGE_KEY === 'oels.byok.v1');
check('隐私承诺含「不会上传」', PRIVACY_PROMISE.includes('不会上传') && hasChinese(PRIVACY_PROMISE));

/* ================================================================== *
 * 7. 端到端串联（纯逻辑）
 * ================================================================== */

section('[7] 端到端（无引擎降级路径）');

const e2e = evaluate({
  transcript: 'I like playing basketball. Um, I play with my friends.',
  topic: TOPICS[0],
  durationMs: 8000,
});
const e2eView = toFeedbackView({ rules: e2e }, emptyCapabilities());
check('无引擎无模型仍产出完整 L0 反馈', e2eView.bars.length === 5 && e2eView.cards.length > 0);
check('L0 诊断分合理', e2eView.score >= 0 && e2eView.score <= 100, String(e2eView.score));
check('句数门槛引用正确', e2eView.bars[0].threshold === MIN_SENTENCES, String(e2eView.bars[0].threshold));
check('降级路径仍标注「不是考场估分」', hasChinese(e2eView.disclaimer) && e2eView.disclaimer.includes('能力诊断'));

/* ------------------------------------------------------------------ */

console.log('\n=== 结果 ===');
console.log('  通过 ' + pass + ' / ' + (pass + fail));
if (fail > 0) {
  console.log('  失败 ' + fail);
  process.exitCode = 1;
} else {
  console.log('  全部通过 ✅');
}
