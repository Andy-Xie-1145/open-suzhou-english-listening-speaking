/**
 * 端到端集成冒烟测试 —— 串起 语料库 → 适配层 → L0 评分 → 成绩汇总
 *
 * 许可：AGPL-3.0-only
 *
 * 目的：验证各层真实协作，而不是各自单测都过但接不上。
 *
 * 用真实语料（data/*.json）+ 真实参考答案，模拟一个学生完成整套模考。
 */
import { MATERIALS } from '../src/materials/index.ts';
import { createRng } from '../src/materials/index.ts';
import { toPaperSource, toListeningQuestions } from '../src/adapter.ts';
import { buildExamPaper } from '../src/ui/exam.ts';
import { evaluateReading } from '../src/rules/reading.ts';
import { evaluate } from '../src/rules/evaluate.ts';
import { evaluateListening } from '../src/rules/listening.ts';
import { summarize } from '../src/rules/summary.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}
console.log('=== 端到端集成冒烟测试 ===\n');

// ---- 1. 组卷（真实语料 + 种子） ----
const rng = createRng(20260101);
const paper = MATERIALS.buildPaper({ seed: 20260101 });
console.log('[1] 组卷');
console.log('  卷型:', paper.formLabel, '| 朗读:', paper.reading.textbook, '| 听力:', paper.listening.short.length + '+' + paper.listening.long.length, '| 话题:', paper.topic.name);
check('组卷成功', !!paper.reading && !!paper.topic && paper.listening.short.length > 0);
check('听力题量符合', paper.listening.short.length === 5 && paper.listening.long.length === 5, paper.listening.short.length + '+' + paper.listening.long.length);
check('话题有 8 句范例', paper.topic.sampleAnswer.length >= 7, String(paper.topic.sampleAnswer.length));

// ---- 2. 适配层 → UI 纸卷 ----
const source = toPaperSource(paper);
const uiPaper = buildExamPaper(source);
console.log('\n[2] 适配层 → UI');
console.log('  UI 题目数:', uiPaper.questions.length, '| 已加载素材:', uiPaper.loadedMaterials);
check('UI 纸卷含 5 道题', uiPaper.questions.length === 5, String(uiPaper.questions.length));
check('朗读正文非空', (source.readAloud?.text || '').length > 100, String((source.readAloud?.text||'').length));
check('五类题都有', uiPaper.questions.every(function (q) { return !!q.kind; }));

// ---- 3. 模拟学生作答：听力全对（走真实适配层） ----
const shortQs = toListeningQuestions(paper.listening.short);
const longQs = toListeningQuestions(paper.listening.long);
const lisDialogue = evaluateListening(shortQs, shortQs.map(function (q) {
  return { questionId: q.id, chosen: q.answer };
}));
const lisPassage = evaluateListening(longQs, longQs.map(function (q) {
  return { questionId: q.id, chosen: q.answer };
}));
console.log('\n[3] 听力（模拟全对，走适配层）');
console.log('  短对话:', lisDialogue.score + '% (' + lisDialogue.correct + '/' + lisDialogue.total + ')', '| 长对话短文:', lisPassage.score + '% (' + lisPassage.correct + '/' + lisPassage.total + ')');
check('听力满分', lisDialogue.score === 100 && lisPassage.score === 100, lisDialogue.score + '/' + lisPassage.score);
check('选项标签已转换', shortQs.every(function (q) { return q.options.length === 3 && q.answer.length === 1; }), JSON.stringify(shortQs[0]?.answer));

// ---- 4. 朗读：用真实原文测满分路径 ----
const reading = evaluateReading({
  reference: paper.reading.text,
  spoken: paper.reading.text,
  durationMs: paper.reading.wordCount * 450,
});
console.log('\n[4] 朗读（原文照读）');
console.log('  分数:', reading.score, '| 读全:', Math.round(reading.completeness*100) + '%', '| 词数:', paper.reading.wordCount);
check('朗读满分', reading.score >= 98, String(reading.score));
check('无漏读', reading.alignment.omissions.length === 0, String(reading.alignment.omissions.length));

// ---- 5. 朗读：故意漏读 20% 词 ----
const words = paper.reading.text.split(/\s+/);
const partial = words.filter(function (_, i) { return i % 5 !== 0; }).join(' ');
const readingBad = evaluateReading({ reference: paper.reading.text, spoken: partial, durationMs: paper.reading.wordCount * 300 });
console.log('\n[5] 朗读（故意漏读 20%）');
console.log('  分数:', readingBad.score, '| 漏读:', readingBad.alignment.omissions.length, '个');
check('漏读被检出', readingBad.alignment.omissions.length > 0);
check('分数明显下降', readingBad.score < reading.score - 10, readingBad.score + ' vs ' + reading.score);

// ---- 6. 话题简述：用真实范例测满分路径 ----
const topicGood = evaluate({
  transcript: paper.topic.sampleAnswer.join(' '),
  topic: paper.topic.name,
  durationMs: paper.topic.sampleAnswer.length * 3500,
});
console.log('\n[6] 话题简述（范例回答）');
console.log('  分数:', topicGood.score, '| 句数:', topicGood.checks.length.value, '| 连接词:', topicGood.checks.connectors.value, '| 覆盖:', topicGood.checks.coverage.message);
check('句数达标', topicGood.checks.length.ok);
check('连接词达标', topicGood.checks.connectors.ok, String(topicGood.checks.connectors.value));
check('分数高', topicGood.score >= 90, String(topicGood.score));

// ---- 7. 情景问答 ----
const qaQuestions = paper.qa.map(function (q) { return q.question; }).join(' ');
const qaTail = 'First I think it is useful. Also it helps me a lot. However it takes time. But I still like it because it is interesting.';
const qaText = qaQuestions + ' ' + qaTail;
const qa = evaluate({ transcript: qaText, topic: null, durationMs: 40000 });
console.log('\n[7] 情景问答');
console.log('  分数:', qa.score, '| 连接词:', qa.checks.connectors.value);
check('问答连接词达标', qa.checks.connectors.ok, String(qa.checks.connectors.value));

// ---- 8. 成绩汇总 ----
const result = summarize({
  listening: { dialogue: lisDialogue, passage: lisPassage },
  reading: reading,
  qa: qa,
  topic: topicGood,
});
console.log('\n[8] 成绩汇总');
console.log('  百分制:', result.percent, '| 30分制:', result.total);
console.log('  结论:', result.verdict);
result.sections.forEach(function (s) { console.log('    - ' + s.title + ': ' + s.score + ' — ' + s.headline); });
check('完整答卷', result.complete === true);
check('总分在有效区间', result.total > 0 && result.total <= 30, String(result.total));
check('有 4 个 section', result.sections.length === 4, String(result.sections.length));

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
