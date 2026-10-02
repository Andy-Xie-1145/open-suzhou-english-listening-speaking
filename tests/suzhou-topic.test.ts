/**
 * 话题简述（Q5）—— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 测的是**近似规则**，不是官方算法。
 *
 * 重点：7 句硬门槛必须被准确判定，且明显反映在近似分上。
 */

import { scoreTopic, toTopicTask, MIN_SENTENCES } from '../src/suzhou/topic-section.ts';
import { disclaimerBlock } from '../src/suzhou/disclaimer.ts';
import topicsJson from '../data/topics.json' with { type: 'json' };

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const RAW: any[] = (topicsJson as any).topics ?? (Array.isArray(topicsJson) ? topicsJson : []);
const tasks = RAW.map(function (r, i) { return toTopicTask(r, i); });

console.log('=== 话题简述 · 近似模拟测试 ===');

/* ---------------- 1. 话题任务 ---------------- */
console.log('[1] 话题任务');
check('话题共 12 个', tasks.length === 12, String(tasks.length));
check('displayText 只有话题名（无中文提示）', tasks.every(function (t) { return t.displayText.indexOf('\u4e00') < 0; }), tasks[0].displayText);
check('hint 保留中文供参考', tasks.every(function (t) { return typeof t.hint === 'string' && t.hint.length > 0; }));
check('profile 带 keywords', tasks.every(function (t) { return t.profile.keywords.length > 0; }));
check('范例回答至少 7 句', tasks.every(function (t) { return t.sampleAnswer.length >= MIN_SENTENCES; }), tasks.map(function (t) { return t.sampleAnswer.length; }).join(','));
check('每题有常用句式分组', tasks.every(function (t) { return t.keyExpressions.length > 0; }));

/* ---------------- 2. 7 句硬门槛 ---------------- */
console.log('\n[2] 7 句硬门槛');
check('门槛为 7 句', MIN_SENTENCES === 7, String(MIN_SENTENCES));

const t0 = tasks[0];
const full = t0.sampleAnswer.join(' ');
const rFull = scoreTopic({ transcript: full, task: t0, durationMs: 45000 });
console.log('  范例回答（' + rFull.sentenceCount + ' 句）→ 近似分 ' + rFull.approximateScore);
check('范例回答通过门槛', rFull.passedMinSentences === true);
check('范例句数 >= 7', rFull.sentenceCount >= MIN_SENTENCES, String(rFull.sentenceCount));

// 3 句：必须被判不通过，且近似分显著低
const three = ['I like basketball.', 'It is very fun.', 'We play every day.'].join(' ');
const r3 = scoreTopic({ transcript: three, task: t0, durationMs: 12000 });
console.log('  只说 3 句 → 近似分 ' + r3.approximateScore + '（句数 ' + r3.sentenceCount + '）');
check('3 句被判未通过', r3.passedMinSentences === false);
check('分数显著低于完整回答', r3.approximateScore < rFull.approximateScore - 25, r3.approximateScore + ' vs ' + rFull.approximateScore);
check('句数维度给出差额', r3.dimensions[0].note.indexOf('还差') >= 0, r3.dimensions[0].note);
check('建议明确写出差几句', r3.advice.some(function (a) { return a.indexOf('还') >= 0 || a.indexOf('补') >= 0; }), r3.advice[0]);

// 6 句：差一句也要判不通过
const six = t0.sampleAnswer.slice(0, 6).join(' ');
const r6 = scoreTopic({ transcript: six, task: t0, durationMs: 38000 });
check('6 句仍未通过门槛', r6.passedMinSentences === false, String(r6.sentenceCount));
check('6 句分数介于两者之间', r6.approximateScore > r3.approximateScore && r6.approximateScore < rFull.approximateScore, r6.approximateScore + ' in (' + r3.approximateScore + ',' + rFull.approximateScore + ')');

// 恰好 7 句：通过
const seven = t0.sampleAnswer.slice(0, 7).join(' ');
const r7 = scoreTopic({ transcript: seven, task: t0, durationMs: 42000 });
check('恰好 7 句通过门槛', r7.passedMinSentences === true, String(r7.sentenceCount));

/* ---------------- 3. 分项与建议 ---------------- */
console.log('\n[3] 分项与建议');
check('四个分项齐全', rFull.dimensions.length === 4, String(rFull.dimensions.length));
check('分项含四个 key', ['length','coverage','logic','fluency'].every(function (k) { return rFull.dimensions.some(function (d) { return d.key === k; }); }));
check('分项值均在 0-1', rFull.dimensions.every(function (d) { return d.value >= 0 && d.value <= 1; }));
check('完整回答各分项都有说明', rFull.dimensions.every(function (d) { return d.note.length > 0; }));

// 无连接词 -> logic 维度低分 + 建议
const noConn = [
  'Basketball is my favourite sport.',
  'I am a member of our school team.',
  'I play with my friends every weekend.',
  'It helps me keep fit.',
  'Training is sometimes hard.',
  'My friends and I never give up.',
  'School life is more fun now.',
].join(' ');
const rNC = scoreTopic({ transcript: noConn, task: t0, durationMs: 40000 });
console.log('  无连接词 → 逻辑分项 ' + Math.round(rNC.dimensions[2].value * 100) + '%');
check('无连接词时逻辑维度偏低', rNC.dimensions[2].value < 1, String(rNC.dimensions[2].value));
check('给出连接词建议', rNC.advice.some(function (a) { return a.indexOf('连接') >= 0 || a.indexOf('First') >= 0; }), rNC.advice.join(' | '));

// 卡壳 -> fluency 维度低分
const fillers = [
  'Um I like basketball.',
  'It is um fun.',
  'We play er every weekend.',
  'My friends also like it.',
  'It helps me keep fit.',
  'Training is uh hard.',
  'I am happy.',
].join(' ');
const rF = scoreTopic({ transcript: fillers, task: t0, durationMs: 30000 });
check('卡壳时流利度维度偏低', rF.dimensions[3].value < 1, String(rF.dimensions[3].value));
check('给出停顿相关建议', rF.advice.some(function (a) { return a.indexOf('停顿') >= 0 || a.indexOf('口头语') >= 0; }), rF.advice.join(' | '));

// 跑题：说够 7 句但与话题无关
const offTopic = [
  'My name is Tom.',
  'I am twelve years old.',
  'I live in a small city.',
  'The weather is nice today.',
  'I have a little dog.',
  'I like reading books.',
  'My school is big.',
].join(' ');
const rOT = scoreTopic({ transcript: offTopic, task: t0, durationMs: 35000 });
console.log('  跑题但满 7 句 → 覆盖 ' + Math.round(rOT.dimensions[1].value * 100) + '%');
check('跑题时句数仍算通过', rOT.passedMinSentences === true, String(rOT.sentenceCount));
check('跑题时覆盖维度明显偏低', rOT.dimensions[1].value < 0.5, String(rOT.dimensions[1].value));
check('跑题分数低于同话题回答', rOT.approximateScore < rFull.approximateScore, rOT.approximateScore + ' vs ' + rFull.approximateScore);
/* ---------------- 4. 红线 ---------------- */
console.log('\n[4] 红线');
const d = disclaimerBlock();
check('声明仍可用', d.paragraphs.length === 3);
check('声明提到不是中考评分', d.paragraphs[0].indexOf('不是苏州市中考听力口语考试的评分') >= 0);
check('分数字段名为 approximateScore', typeof rFull.approximateScore === 'number');

/* ---------------- 5. 12 个话题冒烟 ---------------- */
console.log('\n[5] 12 个话题冒烟');
let allPass = true;
let minScore = 100;
for (const t of tasks) {
  const r = scoreTopic({ transcript: t.sampleAnswer.join(' '), task: t, durationMs: 45000 });
  if (!r.passedMinSentences || r.approximateScore < 80) {
    allPass = false;
    console.log('    异常: ' + t.displayText + ' 句数=' + r.sentenceCount + ' 分=' + r.approximateScore);
  }
  if (r.approximateScore < minScore) minScore = r.approximateScore;
}
check('12 个话题范例回答均过门槛且 >=80', allPass === true, '最低分 ' + minScore);
console.log('  最低近似分：' + minScore);

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
