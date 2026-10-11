/**
 * 听力段 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点：组大小硬约束（绝不跨池凑题）、时长守恒、同 seed 同卷、
 * 换结构只改一处、题库缺池必须抛错。
 */

import { readFileSync } from 'node:fs';
import {
  LISTENING_LAYOUT,
  LISTENING_SECTIONS,
  flattenRules,
  dialogueQuestionCount,
  passageQuestionCount,
  listeningQuestionCount,
  checkListeningLayout,
  isListeningLayoutUsable,
  allocateListeningMs,
  allocateGroupMs,
  describeListeningLayout,
  requiredGroupSizes,
  type ListeningLayout,
} from '../src/suzhou/listening-spec.ts';
import {
  createListeningBank,
  poolOf,
  checkBankForLayout,
  isBankUsable,
  stripOptionPrefix,
  toMaterial,
  type ListeningBank,
} from '../src/suzhou/listening-bank.ts';
import { dealPaper, LISTENING_MINUTES, type PaperBank } from '../src/suzhou/paper.ts';
import { buildListeningMaterials } from '../src/suzhou/bank-import.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

/* ---------- 1. 子结构 ---------- */
console.log('\n[1] 子结构自洽');
const problems = checkListeningLayout(LISTENING_LAYOUT);
check('子结构无错误', problems.every(function (p) { return p.level !== 'error'; }), JSON.stringify(problems));
check('子结构可用', isListeningLayoutUsable(LISTENING_LAYOUT));
check('第一节 12 小题', dialogueQuestionCount(LISTENING_LAYOUT) === 12, String(dialogueQuestionCount(LISTENING_LAYOUT)));
check('第二节 3+5=8 小题', passageQuestionCount(LISTENING_LAYOUT) === 8, String(passageQuestionCount(LISTENING_LAYOUT)));
check('听力合计 20 小题', listeningQuestionCount(LISTENING_LAYOUT) === 20, String(listeningQuestionCount(LISTENING_LAYOUT)));
check('第一节规则是 10×1 题 + 1×2 题', JSON.stringify(flattenRules(LISTENING_LAYOUT.dialogue)) === '[{"size":1,"count":10},{"size":2,"count":1}]', JSON.stringify(flattenRules(LISTENING_LAYOUT.dialogue)));
check('第二节规则是 3/5 各 1 段', JSON.stringify(flattenRules(LISTENING_LAYOUT.passage)) === '[{"size":3,"count":1},{"size":5,"count":1}]', JSON.stringify(flattenRules(LISTENING_LAYOUT.passage)));
check('用到的组大小是 1/2/3/5', JSON.stringify(requiredGroupSizes(LISTENING_LAYOUT)) === '[1,2,3,5]', JSON.stringify(requiredGroupSizes(LISTENING_LAYOUT)));
check('描述带未核实标记', describeListeningLayout(LISTENING_LAYOUT).indexOf('🟡') === 0, describeListeningLayout(LISTENING_LAYOUT));

/* ---------- 2. 结构改错会被抓出来 ---------- */
console.log('\n[2] 结构非法时报错');
const badLayout: ListeningLayout = {
  dialogue: [],
  passage: [{ size: 3, count: 1 }, { size: 5, count: 1 }],
};
const badProblems = checkListeningLayout(badLayout);
check('空结构时报错', badProblems.some(function (p) { return p.level === 'error'; }), JSON.stringify(badProblems));
check('非法结构标记为不可用', !isListeningLayoutUsable(badLayout));
const offLayout: ListeningLayout = {
  dialogue: [{ size: 1, count: 8 }],
  passage: [{ size: 2, count: 1 }, { size: 3, count: 1 }, { size: 5, count: 1 }],
};
const offProblems = checkListeningLayout(offLayout);
check('小计不等于官方分值时降为 warn', offProblems.some(function (p) { return p.level === 'warn'; }), JSON.stringify(offProblems));
check('小计偏离但非空时仍可用', isListeningLayoutUsable(offLayout));

/* ---------- 3. 时长守恒 ---------- */
console.log('\n[3] 时长守恒');
const listeningMs = LISTENING_MINUTES * 60_000;
const secMs = allocateListeningMs(listeningMs, LISTENING_LAYOUT);
check('两个大题合计 === 听力总时长', secMs.dialogue + secMs.passage === listeningMs, String(secMs.dialogue + secMs.passage));
const dSum = allocateGroupMs(LISTENING_LAYOUT.dialogue, secMs.dialogue).reduce(function (a, b) { return a + b; }, 0);
const pSum = allocateGroupMs(LISTENING_LAYOUT.passage, secMs.passage).reduce(function (a, b) { return a + b; }, 0);
check('第一节每段时长合计 === 第一节省额', dSum === secMs.dialogue, String(dSum));
check('第二节每段时长合计 === 第二节省额', pSum === secMs.passage, String(pSum));
const pBudget = allocateGroupMs(LISTENING_LAYOUT.passage, secMs.passage);
check('第二节时长按题数分配（5 题段 > 3 题段）', pBudget[1] > pBudget[0], JSON.stringify(pBudget));

/* ---------- 4. 真实题库 ---------- */
console.log('\n[4] data/bank/items.json');
const rawItems = JSON.parse(readFileSync('data/bank/items.json', 'utf8'));
const bank: ListeningBank = createListeningBank(buildListeningMaterials(rawItems));
const bankChecks = checkBankForLayout(bank, LISTENING_LAYOUT);
check('真实题库可出卷', isBankUsable(bank, LISTENING_LAYOUT), JSON.stringify(bankChecks));
check('dialogue 1 题池 >= 10 段', poolOf(bank, 'dialogue', 1).length >= 10, String(poolOf(bank, 'dialogue', 1).length));
check('dialogue 2 题池至少 1 段', poolOf(bank, 'dialogue', 2).length >= 1, String(poolOf(bank, 'dialogue', 2).length));
check('passage 3 题池至少 1 段', poolOf(bank, 'passage', 3).length >= 1, String(poolOf(bank, 'passage', 3).length));
check('passage 5 题池至少 1 段', poolOf(bank, 'passage', 5).length >= 1, String(poolOf(bank, 'passage', 5).length));
check('groupSize === questions.length', bank.all.every(function (m) { return m.groupSize === m.questions.length; }));
check('选项 label 一律 A 开头且 >= 3 项', bank.all.every(function (m) {
  return m.questions.every(function (q) { return q.options.length >= 3 && q.options[0].label === 'A'; });
}));
check('答案都落在选项内', bank.all.every(function (m) {
  return m.questions.every(function (q) { return q.options.some(function (o) { return o.label === q.answer; }); });
}));
check('题干非空', bank.all.every(function (m) {
  return m.questions.every(function (q) { return q.prompt.length > 0; });
}));

/* ---------- 5. 归一化 ---------- */
console.log('\n[5] 出题格式归一化');
check('剥掉 A. 前缀', stripOptionPrefix('A. On the first floor.') === 'On the first floor.', stripOptionPrefix('A. On the first floor.'));
check('剥掉 B、 前缀', stripOptionPrefix('B、On the second floor.') === 'On the second floor.', stripOptionPrefix('B、On the second floor.'));
check('无前缀原样', stripOptionPrefix('On the second floor.') === 'On the second floor.');
const mIdx = toMaterial({ id: 'x1', kind: 'dialogue', script: [{ speaker: 'W', text: 'Hi.' }],
  questions: [{ prompt: 'Who?', options: ['A. Ann', 'B. Ben'], answer: 1 }] }, 'x1');
const mLab = toMaterial({ id: 'x2', kind: 'dialogue', script: [{ speaker: 'W', text: 'Hi.' }],
  questions: [{ prompt: 'Who?', options: ['Ann', 'Ben'], answer: 'B' }] }, 'x2');
check('答案写下标与写 label 结果相同', mIdx.questions[0].answer === 'B' && mLab.questions[0].answer === 'B',
  mIdx.questions[0].answer + ' / ' + mLab.questions[0].answer);
check('groupSize 由题数推导为 1', mIdx.groupSize === 1, String(mIdx.groupSize));
let dup = '';
try { createListeningBank([mIdx, mIdx]); } catch (e) { dup = e instanceof Error ? e.message : String(e); }
check('材料 id 重复会抛错', dup.indexOf('重复') >= 0, dup);
let badSp = '';
try { createListeningBank([{ id: 'z', kind: 'dialogue', script: [{ speaker: 'Woman', text: 'Hi.' }], questions: [{ prompt: 'q', options: ['a', 'b'], answer: 0 }] }]); } catch (e) { badSp = e instanceof Error ? e.message : String(e); }
check('speaker 不是 W/M/N 会抛错', badSp.indexOf('W/M/N') >= 0, badSp);

/* ---------- 6. 组卷 ---------- */
console.log('\n[6] 组卷');
function makeBank(listening: ListeningBank | undefined): PaperBank {
  const readings = [{ id: 'rd-1', textbook: '九上', text: 'A reading passage for testing. '.repeat(4), wordCount: 90, difficulty: 1, positionSource: '2026 省通知' }];
  const qa = [
    { id: 'qa-1', category: '购物消费', question: 'What do you want?', keyPoints: ['a'], enKeywords: [['want']], difficulty: 1, stemZh: '情境', stem: 'What do you want?' },
    { id: 'qa-2', category: '交通出行', question: 'Where is it?', keyPoints: ['b'], enKeywords: [['where']], difficulty: 1, stemZh: '情境', stem: 'Where is it?' },
  ];
  const topics = [{ id: 'tp-1', name: 'My favourite sport', hint: '', keywords: [], sampleAnswer: [], keyExpressions: [] }];
  return { readings: readings, qa: qa, topics: topics, listening: listening };
}
const PB = makeBank(bank);
const p1 = dealPaper(PB, { seed: 7 });
check('第一节 11 组', p1.listening.dialogue.length === 11, String(p1.listening.dialogue.length));
check('第一节前 10 组每组 1 题', p1.listening.dialogue.slice(0, 10).every(function (g) { return g.questions.length === 1; }));
check('第一节最后 1 组 2 题', p1.listening.dialogue[10].questions.length === 2, String(p1.listening.dialogue[10].questions.length));
check('第二节 2 组', p1.listening.passage.length === 2, String(p1.listening.passage.length));
check('第二节按 3/5 顺序', JSON.stringify(p1.listening.passage.map(function (g) { return g.questions.length; })) === '[3,5]',
  JSON.stringify(p1.listening.passage.map(function (g) { return g.questions.length; })));
check('组大小与材料实际题数一致（不跨池凑题）',
  p1.listening.passage.every(function (g) { return g.material.groupSize === g.questions.length; }));
check('抽出的材料互不重复',
  new Set(p1.ids.listening).size === p1.ids.listening.length, JSON.stringify(p1.ids.listening));
check('听力共 20 题', p1.listening.dialogue.reduce(function (a, g) { return a + g.questions.length; }, 0)
  + p1.listening.passage.reduce(function (a, g) { return a + g.questions.length; }, 0) === 20);
check('每段都有时长预算', p1.listening.dialogue.every(function (g) { return g.budgetMs > 0; })
  && p1.listening.passage.every(function (g) { return g.budgetMs > 0; }));
check('ids.listening 长度 = 13', p1.ids.listening.length === 13, String(p1.ids.listening.length));
const p2 = dealPaper(PB, { seed: 7 });
check('同 seed 同卷', JSON.stringify(p2.ids.listening) === JSON.stringify(p1.ids.listening));

/* ---------- 7. 换卷 ---------- */
console.log('\n[7] 换卷：排除是软偏好，池不够时必须能出卷');
// 池恰好等于一份卷用量（单题池正好 10 段）时，排除必然落空，但仍必须出得了卷
const p3 = dealPaper(PB, { seed: 8, exclude: { listeningIds: p1.ids.listening } });
check('池用尽时仍出满 13 段（不因排除而失败）', p3.ids.listening.length === 13, String(p3.ids.listening.length));
check('池用尽时允许重复但不报错', p3.listening.passage.length === 2, String(p3.listening.passage.length));
// 池有余量时排除应当生效
function materialOfSize(id: string, kind: 'dialogue' | 'passage', n: number) {
  const qs = [];
  for (let i = 0; i < n; i++) qs.push({ id: id + '-q' + (i + 1), prompt: 'Q' + (i + 1), options: ['a', 'b'], answer: 0 });
  return { id: id, kind: kind, title: id, script: [{ speaker: kind === 'dialogue' ? 'W' : 'N', text: 'Some short text.' }], questions: qs };
}
const extras = [];
for (let i = 1; i <= 10; i++) extras.push(materialOfSize('extra-d' + i, 'dialogue', 1));
for (let i = 1; i <= 2; i++) {
  extras.push(materialOfSize('extra-2q' + i, 'passage', 2));
  extras.push(materialOfSize('extra-3q' + i, 'passage', 3));
  extras.push(materialOfSize('extra-5q' + i, 'passage', 5));
}
const roomyBank = createListeningBank([...bank.all, ...extras]);
const q1 = dealPaper(makeBank(roomyBank), { seed: 21 });
const q2 = dealPaper(makeBank(roomyBank), { seed: 22, exclude: { listeningIds: q1.ids.listening } });
const overlap2 = q2.ids.listening.filter(function (id) { return q1.ids.listening.indexOf(id) >= 0; });
check('池有余量时排除生效（不与上一份重叠）', overlap2.length === 0, overlap2.join(','));
check('真实题库无错误项', checkBankForLayout(bank, LISTENING_LAYOUT).every(function (c) { return c.level !== 'error'; }),
  JSON.stringify(checkBankForLayout(bank, LISTENING_LAYOUT)));

/* ---------- 8. 题库缺池必须抛错 ---------- */
console.log('\n[8] 题库不足');
const noFive = createListeningBank([
  ...bank.byKind.dialogue,
  { id: 'p2', kind: 'passage', title: 't', script: [{ speaker: 'N', text: 'Hello there friends.' }],
    questions: [{ id: 'p2-q1', prompt: 'q1', options: ['a', 'b'], answer: 0 },
      { id: 'p2-q2', prompt: 'q2', options: ['a', 'b'], answer: 0 }] },
  { id: 'p3', kind: 'passage', title: 't', script: [{ speaker: 'N', text: 'Hello there friends.' }],
    questions: [{ id: 'p3-q1', prompt: 'q1', options: ['a', 'b'], answer: 0 },
      { id: 'p3-q2', prompt: 'q2', options: ['a', 'b'], answer: 0 },
      { id: 'p3-q3', prompt: 'q3', options: ['a', 'b'], answer: 0 }] },
]);
check('缺 5 题池时判为不可用', !isBankUsable(noFive, LISTENING_LAYOUT));
check('缺池报错说清缺哪个', checkBankForLayout(noFive, LISTENING_LAYOUT).some(function (c) { return c.message.indexOf('5 题') >= 0; }),
  JSON.stringify(checkBankForLayout(noFive, LISTENING_LAYOUT)));
let threw = '';
try { dealPaper(makeBank(noFive), { seed: 1 }); } catch (e) { threw = e instanceof Error ? e.message : String(e); }
check('缺池时抛错而非出半张卷', threw.indexOf('无法组卷') >= 0 && threw.indexOf('5 题池') >= 0, threw);
let threw2 = '';
try { dealPaper(makeBank(undefined), { seed: 1 }); } catch (e) { threw2 = e instanceof Error ? e.message : String(e); }
check('没有听力题库时抛错', threw2.indexOf('听力题库') >= 0, threw2);

/* ---------- 9. 改结构只动一处 ---------- */
console.log('\n[9] 换子结构只改一个常量');
function materialOf(id: string, n: number) {
  const qs = [];
  for (let i = 0; i < n; i++) qs.push({ id: id + '-q' + (i + 1), prompt: 'Q' + (i + 1), options: ['a', 'b'], answer: 0 });
  return { id: id, kind: 'passage', title: id, script: [{ speaker: 'N', text: 'Some narration text here.' }], questions: qs };
}
const altBank = createListeningBank([...bank.byKind.dialogue, materialOf('a4', 4), materialOf('b3', 3), materialOf('c3', 3)]);
const altLayout: ListeningLayout = {
  dialogue: [{ size: 1, count: 10 }],
  passage: [{ size: 4, count: 1 }, { size: 3, count: 1 }, { size: 3, count: 1 }],
};
check('新结构 4+3+3=10 自洽', isListeningLayoutUsable(altLayout), JSON.stringify(checkListeningLayout(altLayout)));
check('新结构题库可用', isBankUsable(altBank, altLayout), JSON.stringify(checkBankForLayout(altBank, altLayout)));
const dlg = require_pick(altBank, altLayout);
check('按新结构抽出 2/4/3/3 的段数正确', dlg.length === 3, String(dlg.length));
check('按新结构抽出 4/3/3', JSON.stringify(dlg) === '[4,3,3]', JSON.stringify(dlg));
check('官方分值仍是各 10', LISTENING_SECTIONS.dialogue.points === 10 && LISTENING_SECTIONS.passage.points === 10);

function require_pick(b: ListeningBank, layout: ListeningLayout): number[] {
  // 复刻 pickGroups 的选题结果，只验「每组抽到的段题数」
  const out: number[] = [];
  for (const rule of flattenRules(layout.passage)) {
    const pool = poolOf(b, 'passage', rule.size);
    for (let i = 0; i < rule.count; i++) out.push(pool[i].groupSize);
  }
  return out;
}

console.log('\n[10] 汇总');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);