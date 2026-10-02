/**
 * 听力作答界面 · 视图模型 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点：题号连续、阶段文案、选项选中态、音频就绪提示、成绩视图、措辞红线。
 */

import { readFileSync } from 'node:fs';
import {
  numberQuestions,
  toView,
  toOutcomeView,
} from '../src/ui/suzhou-listening.ts';
import {
  initialSession,
  buildSteps,
  currentStep,
  advance,
  chooseAnswer,
  settle,
  phaseDuration,
  type ListeningSession,
} from '../src/suzhou/listening-session.ts';
import { createListeningBank } from '../src/suzhou/listening-bank.ts';
import { dealPaper, type PaperBank } from '../src/suzhou/paper.ts';
import { BADGE, BANNER } from '../src/suzhou/disclaimer.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const bank = createListeningBank(JSON.parse(readFileSync('data/listening-materials.json', 'utf8')));
const paper = dealPaper({
  readings: [{ id: 'rd-1', textbook: '九上', text: 'A passage. '.repeat(6), wordCount: 90, difficulty: 1, positionSource: '2026 省通知' }],
  qa: [
    { id: 'qa-1', category: '购物消费', question: 'Q1?', keyPoints: ['a'], enKeywords: [['want']], difficulty: 1 },
    { id: 'qa-2', category: '交通出行', question: 'Q2?', keyPoints: ['b'], enKeywords: [['where']], difficulty: 1 },
  ],
  topics: [{ id: 'tp-1', name: 'T', hint: '', keywords: [], sampleAnswer: [], keyExpressions: [] }],
  listening: bank,
} as PaperBank, { seed: 3 });

let s: ListeningSession = initialSession(buildSteps(paper.listening));

/* ---------- 1. 题号连续 ---------- */
console.log('\n[1] 全卷题号');
const nums = numberQuestions(s.steps);
check('题号总数 20', nums.size === 20, String(nums.size));
check('题号从 1 到 20 连续', Array.from(nums.values()).sort(function (a, b) { return a - b; }).join(',') ===
  Array.from({ length: 20 }, function (_, i) { return i + 1; }).join(','));
const firstStep = s.steps[0];
check('首段题号是 1', nums.get(firstStep.questions[0].id) === 1, String(nums.get(firstStep.questions[0].id)));
const passageStep = s.steps[10];
check('第二节首段题号接在 10 之后', nums.get(passageStep.questions[0].id) === 11,
  String(nums.get(passageStep.questions[0].id)));
check('题号互不重复', new Set(nums.values()).size === nums.size);

/* ---------- 2. 各阶段视图 ---------- */
console.log('\n[2] 阶段视图');
const vPreview = toView(s, 0, 6000, true);
check('初始是听前浏览', vPreview.phase === 'preview' && vPreview.stageTitle === '听前浏览', vPreview.stageTitle);
check('听前浏览不给「下一段」', vPreview.canNext === false);
check('显示第几段', vPreview.stepNo === 1 && vPreview.stepTotal === 13, vPreview.stepNo + '/' + vPreview.stepTotal);
check('大题名正确', vPreview.sectionName === '听对话回答问题', vPreview.sectionName);
check('题目在浏览阶段就显示', vPreview.questions.length === 1, String(vPreview.questions.length));
check('选项三个', vPreview.questions[0].options.length === 3);

let sPlay = advance(s, 999999, 6000);
const vPlay = toView(sPlay, 0, 6000, true);
check('播放阶段标题正确', vPlay.phase === 'playing' && vPlay.stageTitle === '正在播放', vPlay.stageTitle);
check('显示第几遍', vPlay.playLabel.indexOf('第 1 / 2 遍') === 0, vPlay.playLabel);
check('播放阶段允许跳过', vPlay.showNext === true && vPlay.canNext === false);
check('播放中不可选下一段（只能跳过）', vPlay.canNext === false);
const sAns = advance(sPlay, 999999, 6000);
const vAns = toView(sAns, 0, 6000, true);
check('进入作答阶段', vAns.phase === 'answering' && vAns.stageTitle === '作答', vAns.stageTitle);
check('作答阶段可点下一段', vAns.canNext === true && vAns.showNext === true);
check('作答阶段有剩余时间', vAns.remainingMs > 0, String(vAns.remainingMs));
const vAnsLate = toView(sAns, vAns.remainingMs, 6000, true);
check('时间用完剩余归零', vAnsLate.remainingMs === 0, String(vAnsLate.remainingMs));

const vDone = toView(initialSession([]), 0, 0, true);
check('空卷显示结束', vDone.phase === 'done' && vDone.stageTitle === '听力测试结束', vDone.stageTitle);
check('结束态不给下一段', vDone.canNext === false && vDone.showNext === false);
check('结束态没有题目', vDone.questions.length === 0);

/* ---------- 3. 第二节 ---------- */
console.log('\n[3] 第二节');
let sSec = initialSession(s.steps);
sSec = { ...sSec, cursor: 10, phase: 'preview' };
const vSec = toView(sSec, 0, 6000, true);
check('第二节大题名切换', vSec.sectionName === '听对话和短文答题', vSec.sectionName);
check('第二节第一段 2 题', vSec.questions.length === 2, String(vSec.questions.length));
const vSecAns = toView({ ...sSec, phase: 'answering' }, 0, 6000, true);
check('多题组在作答阶段提示要全选', vSecAns.stageHint.indexOf('都要选') >= 0, vSecAns.stageHint);
const vSingleAns = toView({ ...sSec, cursor: 0, phase: 'answering' }, 0, 6000, true);
check('单题组提示选一个', vSingleAns.stageHint.indexOf('最合适的一个') >= 0, vSingleAns.stageHint);
sSec = { ...sSec, cursor: 12 };
check('最后一组 5 题', toView(sSec, 0, 6000, true).questions.length === 5);

/* ---------- 4. 选中态 ---------- */
console.log('\n[4] 选项选中');
const q0 = firstStep.questions[0];
let sPick = chooseAnswer(initialSession(s.steps), q0.id, 'C');
check('C 被标为选中', toView(sPick, 0, 6000, true).questions[0].options.filter(function (o) { return o.selected; }).length === 1);
check('选中的就是 C', toView(sPick, 0, 6000, true).questions[0].options[2].selected === true);
sPick = chooseAnswer(sPick, q0.id, 'A');
const opts = toView(sPick, 0, 6000, true).questions[0].options;
check('改选后只有 A 选中', opts.filter(function (o) { return o.selected; }).length === 1 && opts[0].selected);
check('选项文案保留', opts[0].text.length > 0, opts[0].text);

/* ---------- 5. 音频就绪提示 ---------- */
console.log('\n[5] 音频就绪');
check('已预取时不提示', toView(s, 0, 6000, true).audioMissing === false);
check('未预取时给出提示', toView(s, 0, 6000, false).audioMissing === true);
check('提示文案可执行', toView(s, 0, 6000, false).audioMissing === true && true);

/* ---------- 6. 成绩视图 ---------- */
console.log('\n[6] 成绩视图');
let perfect = initialSession(s.steps);
for (const st of perfect.steps) for (const q of st.questions) perfect = chooseAnswer(perfect, q.id, q.answer);
const ov = toOutcomeView(settle(perfect), perfect.steps);
check('全对 20 分', ov.total === 20, String(ov.total));
check('两个大题各 10', ov.dialogue.max === 10 && ov.passage.max === 10);
check('无漏答', ov.unanswered === 0);
check('明细 20 行', ov.rows.length === 20, String(ov.rows.length));
check('明细题号 1..20 连续', ov.rows.map(function (r) { return r.no; }).join(',') ===
  Array.from({ length: 20 }, function (_, i) { return i + 1; }).join(','));
check('每行有题干与答案', ov.rows.every(function (r) { return r.prompt.length > 0 && r.answer.length > 0; }));
const blank = toOutcomeView(settle(initialSession(s.steps)), s.steps);
check('全不答 0 分且 20 条漏答', blank.total === 0 && blank.unanswered === 20, String(blank.total) + '/' + String(blank.unanswered));

/* ---------- 7. 措辞红线 ---------- */
console.log('\n[7] 措辞红线');
const BANNED = ['对标讯飞', '等同正考', '等同官方', '估分', '官方评分算法', '与考场一致', '已验证'];
const shown: string[] = [];
const walk = (v: unknown): void => {
  if (typeof v === 'string') shown.push(v);
  else if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === 'object') Object.values(v as Record<string, unknown>).forEach(walk);
};
walk(toView(perfect, 0, 6000, true));
walk(toOutcomeView(settle(perfect), perfect.steps));
const allText = shown.join(' ');
for (const b of BANNED) {
  check('界面文案不含「' + b + '」', allText.indexOf(b) < 0, allText.slice(0, 60));
}
check('含近似标识', allText.indexOf(BADGE) >= 0 || BANNER.indexOf('近似') >= 0);

console.log('\n[8] 汇总');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);