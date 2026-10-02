/**
 * 情景问答（Q4）—— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 测的是**近似规则**，不是官方算法。
 *
 * 重点：要点覆盖判定必须能逐条说明命中了哪个词、漏了哪个词。
 */

import { toQaTask, scoreQa, drawQaPair, stem, stemSet, phrasePresent, stemsOf } from '../src/suzhou/qa-section.ts';
import { disclaimerBlock } from '../src/suzhou/disclaimer.ts';
import qaJson from '../data/qa.json' with { type: 'json' };
import kwJson from '../data/qa-keywords.json' with { type: 'json' };

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const RAW: any[] = (qaJson as any).qa ?? (Array.isArray(qaJson) ? qaJson : []);
const KW: any = kwJson as any;
const TASKS = RAW.map(function (r) { return toQaTask(r, KW[r.id]); });

console.log('=== 情景问答 · 近似模拟测试 ===');

/* ---------------- 1. 词干 ---------------- */
console.log('[1] 词干与匹配');
check('英式美式拼写归一', stem('apologise') === stem('apologize'), stem('apologise') + ' vs ' + stem('apologize'));
check('过去式归一', stem('runs') === stem('run'), stem('runs') + ' vs ' + stem('run'));
check('进行时归一', stem('running') === stem('run'), stem('running') + ' vs ' + stem('run'));
check('不规则过去式 break/broke', stemSet('broke').has('break'), [...stemSet('broke')].join(','));
check('不规则过去式 throw/threw', stemSet('threw').has('throw'), [...stemSet('threw')].join(','));

const st1 = stemsOf('I was running and I said sorry to the teacher.');
check('单词匹配 run', phrasePresent('run', st1) === true);
check('单词匹配 sorry', phrasePresent('sorry', st1) === true);
check('未出现的词不匹配', phrasePresent('pollution', st1) === false);
check('多词短语连续匹配', phrasePresent('said sorry', st1) === true);
check('多词短语不乱序', phrasePresent('sorry said', st1) === false);
/* ---------------- 2. 任务装配 ---------------- */
console.log('\n[2] 任务装配');
check('题目共 24 条', TASKS.length === 24, String(TASKS.length));
check('每条有英文问句', TASKS.every(function (t) { return t.question.length > 0; }));
check('每条有 3 个要点', TASKS.every(function (t) { return t.keyPoints.length === 3; }), String(TASKS[0].keyPoints.length));
check('每条 enKeywords 数量匹配要点', TASKS.every(function (t) { return t.enKeywords.length === t.keyPoints.length; }));
check('每个要点都有英文关键词', TASKS.every(function (t) { return t.enKeywords.every(function (k) { return k.length > 0; }); }));
check('关键词全部小写', TASKS.every(function (t) { return t.enKeywords.flat().every(function (w) { return w === w.toLowerCase(); }); }));

/* ---------------- 3. 要点覆盖逐条判定 ---------------- */
console.log('\n[3] 要点覆盖');
const t0 = TASKS[0];
console.log('  题干: ' + t0.question);

// 覆盖全部三个要点的回答
const full = 'I was running and chasing with my friend in the classroom. I am sorry for that. In class we should listen to the teacher quietly. I promise I will not do it again.';
const rFull = scoreQa({ transcript: full, task: t0, durationMs: 22000 });
console.log('  完整回答 → 近似分 ' + rFull.approximateScore + '，覆盖 ' + rFull.keyPoints.filter(function (k) { return k.covered; }).length + '/3');
check('完整回答有实质回应', rFull.responded === true);
check('完整回答覆盖 3 个要点', rFull.keyPoints.every(function (k) { return k.covered; }), String(rFull.keyPoints.filter(function (k) { return k.covered; }).length));
check('覆盖率 100%', rFull.coverage === 1, String(rFull.coverage));
check('每条要点都记录了命中词', rFull.keyPoints.every(function (k) { return k.hit.length > 0; }));

// 只覆盖第一个要点
const partial = 'I was running in the classroom and I am sorry.';
const rPart = scoreQa({ transcript: partial, task: t0, durationMs: 12000 });
const uncovered = rPart.keyPoints.filter(function (k) { return !k.covered; });
console.log('  部分回答 → 近似分 ' + rPart.approximateScore + '，未覆盖 ' + uncovered.length + ' 个');
check('未覆盖要点被识别', uncovered.length >= 1, String(uncovered.length));
check('未覆盖要点给出中文标签', uncovered.every(function (k) { return k.label.length > 0; }));
check('未覆盖要点列出未命中关键词', uncovered.every(function (k) { return k.missed.length > 0; }), uncovered[0] ? uncovered[0].missed.slice(0,3).join(',') : '');
check('建议逐条点名未覆盖要点', rPart.advice.some(function (a) { return a.indexOf('未覆盖') >= 0; }), rPart.advice[0]);
check('部分回答分数低于完整回答', rPart.approximateScore < rFull.approximateScore, rPart.approximateScore + ' vs ' + rFull.approximateScore);
/* ---------------- 4. 半开放题的特有判定 ---------------- */
console.log('\n[4] 半开放题判定');

// 完全不说话
const rSilent = scoreQa({ transcript: '', task: t0, durationMs: 5000 });
check('不说话时未回应', rSilent.responded === false);
check('不说话时未说出内容', rSilent.spokeSomething === false);
check('不说话时覆盖率为 0', rSilent.coverage === 0);
check('不说话时近似分为 0', rSilent.approximateScore === 0, String(rSilent.approximateScore));
check('不说话时给出说话提示', rSilent.advice.some(function (a) { return a.indexOf('没有听到') >= 0 || a.indexOf('说话') >= 0; }), rSilent.advice[0]);

// 只说单个词（无关内容）
const rOne = scoreQa({ transcript: 'Hello.', task: t0, durationMs: 3000 });
check('只说单词时未回应', rOne.responded === false, String(rOne.responded));
check('只说单词时近似分很低', rOne.approximateScore < 30, String(rOne.approximateScore));

// 说了很多但完全跑题
const offTopic = 'I like pandas very much. They live in Sichuan. Pandas are black and white. I saw them on TV last year.';
const rOff = scoreQa({ transcript: offTopic, task: t0, durationMs: 20000 });
check('跑题但话多时不判为回应', rOff.responded === false, String(rOff.responded));
check('跑题时覆盖率 0', rOff.coverage === 0, String(rOff.coverage));
check('跑题近似分低于完整回答', rOff.approximateScore < rFull.approximateScore);

// 词形变化应被正确识别
const t2 = TASKS.find(function (t) { return t.keyPoints.some(function (k) { return k.indexOf('道歉') >= 0; }); }) ?? t0;
const rMorph = scoreQa({ transcript: 'I apologise for that. I promise I will not do it again.', task: t2 });
check('英式拼写 apologise 被识别', rMorph.keyPoints.some(function (k) { return k.covered && k.hit.indexOf('apologize') >= 0; }), JSON.stringify(rMorph.keyPoints.map(k=>k.hit.join('|'))));

/* ---------------- 5. 组题配平 ---------------- */
console.log('\n[5] 组题配平');
const pair = drawQaPair(TASKS, 20260101);
check('抽出 2 题', pair.length === 2, String(pair.length));
check('两题类别不同', pair[0].category !== pair[1].category, pair.map(function (p) { return p.category; }).join(' vs '));
const pair2 = drawQaPair(TASKS, 20260101);
check('同种子得同卷', pair[0].id === pair2[0].id && pair[1].id === pair2[1].id);
const pair3 = drawQaPair(TASKS, 777);
check('不同种子通常不同卷', pair3[0].id !== pair[0].id || pair3[1].id !== pair[1].id, pair3.map(function (p) { return p.id; }).join(','));
check('类别不足时仍补足 2 题', drawQaPair([TASKS[0], TASKS[12]], 5).length === 2, String(drawQaPair([TASKS[0], TASKS[12]], 5).length));
check('空题库返回空数组', drawQaPair([], 1).length === 0);
/* ---------------- 6. 全语料冒烟 ---------------- */
console.log('\n[6] 24 条冒烟');
let allOk = true;
let minScore = 100;
let bad: string[] = [];
for (const t of TASKS) {
  // 用该题的 enKeywords 拼一个必然全覆盖的回答
  const built = t.enKeywords.map(function (kws) { return kws[0]; }).join('. ');
  const r = scoreQa({ transcript: built, task: t, durationMs: 20000 });
  if (!r.responded || r.coverage < 1) { allOk = false; bad.push(t.id + '(resp=' + r.responded + ',cov=' + r.coverage.toFixed(2) + ')'); }
  if (r.approximateScore < minScore) minScore = r.approximateScore;
}
check('每题关键词拼成的回答都能全覆盖', allOk === true, bad.join(' '));
console.log('  最低近似分（关键词拼接）：' + minScore);

/* ---------------- 7. 红线 ---------------- */
console.log('\n[7] 红线');
const d = disclaimerBlock();
check('分数字段为 approximateScore', typeof rFull.approximateScore === 'number');
check('声明仍含不是中考评分', d.paragraphs[0].indexOf('不是苏州市中考听力口语考试的评分') >= 0);

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
