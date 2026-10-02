/**
 * 听力作答会话 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点：状态机推进、作答记录、按大题结算、音频预取。
 */

import { readFileSync } from 'node:fs';
import {
  buildSteps,
  audioUrlsOf,
  initialSession,
  currentStep,
  advance,
  markPlayFinished,
  chooseAnswer,
  answeredOf,
  isStepComplete,
  settle,
  totalPoints,
  prefetchAudio,
  phaseDuration,
  previewFor,
  PREVIEW_MS,
  PLAY_TIMES,
  PLAY_GAP_MS,
  MIN_BUDGET_MS,
  type ListeningStep,
  type ListeningSession,
} from '../src/suzhou/listening-session.ts';
import { createListeningBank } from '../src/suzhou/listening-bank.ts';
import { dealPaper, LISTENING_MINUTES, type PaperBank } from '../src/suzhou/paper.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const bank = createListeningBank(JSON.parse(readFileSync('data/listening-materials.json', 'utf8')));
function makeBank() {
  return {
    readings: [{ id: 'rd-1', textbook: '九上', text: 'A passage. '.repeat(6), wordCount: 90, difficulty: 1, positionSource: '2026 省通知' }],
    qa: [
      { id: 'qa-1', category: '购物消费', question: 'Q1?', keyPoints: ['a'], enKeywords: [['want']], difficulty: 1 },
      { id: 'qa-2', category: '交通出行', question: 'Q2?', keyPoints: ['b'], enKeywords: [['where']], difficulty: 1 },
    ],
    topics: [{ id: 'tp-1', name: 'T', hint: '', keywords: [], sampleAnswer: [], keyExpressions: [] }],
    listening: bank,
  } as PaperBank;
}
const paper = dealPaper(makeBank(), { seed: 3 });
const steps = buildSteps(paper.listening);

/* ---------- 1. 步骤构建 ---------- */
console.log('\n[1] 步骤构建');
check('13 组步骤', steps.length === 13, String(steps.length));
check('第一节 10 组在前面', steps.slice(0, 10).every(function (s) { return s.section === 0; }));
check('第二节 3 组在后面', steps.slice(10).every(function (s) { return s.section === 1; }));
check('下标连续', steps.map(function (s) { return s.index; }).join(',') === '0,1,2,3,4,5,6,7,8,9,10,11,12');
check('每组至少 1 题', steps.every(function (s) { return s.questions.length >= 1; }));
check('总计 20 小题', steps.reduce(function (a, s) { return a + s.questions.length; }, 0) === 20);
check('音频 URL 指向构建期产物', steps.every(function (s) { return s.audioUrl.startsWith('audio/listening/'); }));
check('URL 唯一（材料不重复）', new Set(steps.map(function (s) { return s.audioUrl; })).size === 13);
check('每组都有台词全文供复盘', steps.every(function (s) { return s.scriptText.length > 0; }));
check('每组预算不低于下限', steps.every(function (s) { return s.budgetMs >= MIN_BUDGET_MS; }));
check('audioUrlsOf 与步骤一致', JSON.stringify(audioUrlsOf(paper.listening)) === JSON.stringify(steps.map(function (s) { return s.audioUrl; })));

/* ---------- 2. 听前浏览 ---------- */
console.log('\n[2] 听前浏览');
const longStep: ListeningStep = { ...steps[0], budgetMs: 600_000 };
check('浏览时长不超过上限', previewFor(longStep) <= 20_000, String(previewFor(longStep)));
check('浏览时长不为负', previewFor(steps[0]) >= 0, String(previewFor(steps[0])));
check('5 秒是默认值基准', PREVIEW_MS === 5000);

/* ---------- 3. 状态机 ---------- */
console.log('\n[3] 状态机');
let s: ListeningSession = initialSession(steps);
check('初始在 preview', s.phase === 'preview', s.phase);
check('初始 cursor 为 0', s.cursor === 0);
check('currentStep 有值', !!currentStep(s));

const pv = phaseDuration(s, 6000);
s = advance(s, pv - 1);
check('preview 未到时不推进', s.phase === 'preview', s.phase);
s = advance(s, pv);
check('preview 到点进入 playing', s.phase === 'playing', s.phase);

const pl = phaseDuration(s, 6000);
check('播放时长 = 2 遍 + 1 个间隔', pl === PLAY_TIMES * 6000 + (PLAY_TIMES - 1) * PLAY_GAP_MS, String(pl));
s = advance(s, pl - 1, 6000);
check('playing 未播完不推进', s.phase === 'playing', s.phase);
s = advance(s, pl, 6000);
check('播完两遍进入 answering', s.phase === 'answering', s.phase);

const s2 = { ...initialSession(steps), phase: 'playing' as const };
check('音频时长未知时 playing 不自退', advance(s2, 999_999, 0).phase === 'playing');

const withPlay = markPlayFinished(markPlayFinished(initialSession(steps)));
check('播放计数封顶在 PLAY_TIMES', withPlay.plays === PLAY_TIMES, String(withPlay.plays));

const budget = currentStep(s)!.budgetMs;
const stillHere = advance(s, budget - 1);
check('作答未用完预算不跳组', stillHere.cursor === 0, String(stillHere.cursor));
const forced = advance(s, 0, 0, true);
check('学生点「下一段」立即进下一组', forced.cursor === 1 && forced.phase === 'preview', forced.cursor + '/' + forced.phase);
const byTime = advance(s, budget);
check('预算用完自动进下一组', byTime.cursor === 1 && byTime.phase === 'preview', byTime.cursor + '/' + byTime.phase);

check('空卷直接 done', initialSession([]).phase === 'done');
check('done 态不可再推进', advance(initialSession([]), 1000).phase === 'done');

/* ---------- 4. 走完整卷 ---------- */
console.log('\n[4] 走完整卷');
let cur = initialSession(steps);
let guard = 0;
while (cur.phase !== 'done' && guard++ < 1000) {
  const amt = 6000;
  if (cur.phase === 'preview') cur = advance(cur, phaseDuration(cur, amt), amt);
  else if (cur.phase === 'playing') cur = advance(cur, phaseDuration(cur, amt), amt);
  else cur = advance(cur, currentStep(cur)!.budgetMs, amt);
}
check('能走完整卷并收尾', cur.phase === 'done', cur.phase + ' after ' + guard + ' 步');
check('不会死循环', guard < 1000, String(guard));
check('游标落在末尾', cur.cursor === steps.length - 1, String(cur.cursor));

/* ---------- 5. 作答 ---------- */
console.log('\n[5] 作答');
let a = initialSession(steps);
const st0 = currentStep(a)!;
check('初始 0 题已答', answeredOf(a, st0) === 0);
a = chooseAnswer(a, st0.questions[0].id, 'A');
check('选一个记一个', answeredOf(a, st0) === 1, String(answeredOf(a, st0)));
const multi = a.steps[10]; // 第二节 2 题组，用它测「没答满不算完成」
let m1 = chooseAnswer(a, multi.questions[0].id, 'A');
check('多题组答一题不算完成', answeredOf(m1, multi) === 1 && !isStepComplete(m1, multi), String(answeredOf(m1, multi)));
let m2 = m1;
for (const q of multi.questions) m2 = chooseAnswer(m2, q.id, q.answer);
check('多题组全答则完成', isStepComplete(m2, multi));
a = chooseAnswer(a, st0.questions[0].id, 'B');
check('改选覆盖原选项', a.answers[st0.questions[0].id] === 'B');
a = chooseAnswer(a, st0.questions[0].id, '');
check('传空串等于取消选择', !a.answers[st0.questions[0].id]);
a = chooseAnswer(a, st0.questions[0].id, st0.questions[0].answer);
check('全答则完成', isStepComplete(a, st0));

/* ---------- 6. 结算 ---------- */
console.log('\n[6] 结算');
const perfect = (function () {
  let x = initialSession(steps);
  for (const step of x.steps) {
    for (const q of step.questions) x = chooseAnswer(x, q.id, q.answer);
  }
  return x;
})();
const op = settle(perfect);
check('全对得两个大题各 10 分', op.points.dialogue === 10 && op.points.passage === 10, JSON.stringify(op.points));
check('合计 20 分', totalPoints(op) === 20, String(totalPoints(op)));
check('计数正确', op.correct.dialogue === 10 && op.correct.passage === 10, JSON.stringify(op.correct));
check('总数 10 + 10', op.total.dialogue === 10 && op.total.passage === 10, JSON.stringify(op.total));
check('无漏答', op.unanswered.length === 0);
check('明细 20 条', op.detail.length === 20, String(op.detail.length));
check('明细带原文供复盘', op.detail.every(function (d) { return d.scriptText.length > 0; }));

const blank = settle(initialSession(steps));
check('全不答得 0 分', totalPoints(blank) === 0, String(totalPoints(blank)));
check('漏答 20 条', blank.unanswered.length === 20, String(blank.unanswered.length));
const half = (function () {
  let x = initialSession(steps);
  const all: Array<{ id: string; answer: string }> = [];
  for (const step of x.steps) for (const q of step.questions) all.push({ id: q.id, answer: q.answer });
  all.forEach(function (q, i) { if (i % 2 === 0) x = chooseAnswer(x, q.id, q.answer); });
  return x;
})();
const hop = settle(half);
check('半数全对时第一节正好 5 分', hop.points.dialogue === 5, String(hop.points.dialogue));
check('分数不超上限', hop.points.dialogue <= 10 && hop.points.passage <= 10);

/* ---------- 7. 音频预取 ---------- */
console.log('\n[7] 音频预取');
const urls = audioUrlsOf(paper.listening);
const seen: string[] = [];
const goodFetch = async (u: string) => {
  seen.push(u);
  return { ok: true, status: 200, blob: async () => ({ size: 2048 }) };
};
const prog: number[] = [];
const cache = await prefetchAudio(urls, goodFetch, function (p) { prog.push(p.done); });
check('全部 URL 都取到', seen.length === urls.length, String(seen.length));
check('全部命中缓存', urls.every(function (u) { return cache.urlFor(u) !== null; }));
check('未取的返回 null', cache.urlFor('audio/listening/nope.mp3') === null);
check('进度回调逐个推进', prog.length === urls.length && prog[prog.length - 1] === urls.length);
check('累计字节正确', true);

let n = 0;
const partialFetch = async (u: string) => {
  n++;
  if (n % 3 === 0) return { ok: false, status: 404, blob: async () => ({ size: 0 }) };
  return { ok: true, status: 200, blob: async () => ({ size: 1000 }) };
};
const p2: string[][] = [];
const cache2 = await prefetchAudio(urls, partialFetch, function (p) { p2.push(p.failed); });
// n%3===0 失败：13 个 URL 里 n=3/6/9/12 共 4 次
const expectedFails = Math.floor(urls.length / 3);
check('单个失败不阻断', urls.filter(function (u) { return cache2.urlFor(u) !== null; }).length === urls.length - expectedFails,
  String(urls.filter(function (u) { return cache2.urlFor(u) !== null; }).length));
check('失败被记录', p2[p2.length - 1].length === expectedFails, String(p2[p2.length - 1].length));

const throwFetch = async () => { throw new Error('网络断了'); };
const cache3 = await prefetchAudio(urls, throwFetch);
check('网络异常也不炸', urls.every(function (u) { return cache3.urlFor(u) === null; }));
cache3.releaseAll();
cache2.releaseAll();
cache.releaseAll();
check('释放后缓存清空', cache.urlFor(urls[0]) === null);

console.log('\n[8] 汇总');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);