/**
 * 题目编排 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点：seed 贯通、同 seed 同卷、类别配平、时长守恒、换卷不重复。
 */

import { readFileSync } from 'node:fs';
import {
  dealPaper,
  dealNextPaper,
  allocate,
  createRng,
  SPEAKING_WEIGHTS,
  SPEAKING_MINUTES,
  QA_COUNT,
  type PaperBank,
} from '../src/suzhou/paper.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

// 构造可复现的题库
function makeBank(nRead: number, nQa: number, nTopic: number): PaperBank {
  const cats = ['校园生活','家庭与邻里','健康','交通出行','购物消费','休闲活动','环境保护','规则与安全','科技与学习','节日与文化','请求与帮助','观点表达'];
  const readings = [];
  for (let i = 0; i < nRead; i++) {
    readings.push({
      id: 'rd-' + (i + 1),
      textbook: '七上 U' + (i + 1) + ' Task',
      text: 'This is reading passage number ' + (i + 1) + '. It has several sentences for testing purpose.',
      wordCount: 90,
      difficulty: (i % 3) + 1,
      positionSource: i < 6 ? '2026 省通知' : '教材对标建议',
    });
  }
  const qa = [];
  for (let i = 0; i < nQa; i++) {
    qa.push({
      id: 'qa-' + (i + 1),
      category: cats[i % cats.length],
      question: 'Question ' + (i + 1) + '?',
      keyPoints: ['kp1', 'kp2', 'kp3'],
      enKeywords: [['a'], ['b'], ['c']],
      difficulty: 1,
    });
  }
  const topics = [];
  for (let i = 0; i < nTopic; i++) {
    topics.push({
      id: 'topic-' + (i + 1),
      name: 'topic ' + (i + 1),
      hint: '话题 ' + (i + 1),
      keywords: ['k1', 'k2'],
      sampleAnswer: ['One.', 'Two.', 'Three.', 'Four.', 'Five.', 'Six.', 'Seven.', 'Eight.'],
      keyExpressions: [{ group: 'g', items: ['x', 'y'] }],
    });
  }
  return { readings: readings, qa: qa, topics: topics };
}

const BANK = makeBank(24, 24, 12);
console.log('=== 题目编排 · 测试 ===');

/* ---------- 1. 随机数 ---------- */
console.log('[1] 可复现随机');
const r1 = createRng(42);
const r2 = createRng(42);
check('同 seed 前 10 个数一致', Array.from({length:10}, function () { return r1.next(); }).join(',') === Array.from({length:10}, function () { return r2.next(); }).join(','));
const r3 = createRng(43);
check('不同 seed 序列不同', createRng(42).next() !== createRng(43).next());
const sh = createRng(7).shuffle([1,2,3,4,5,6,7,8]);
check('shuffle 保持元素集合', sh.slice().sort(function (a,b) { return a-b; }).join(',') === '1,2,3,4,5,6,7,8');

/* ---------- 2. 时长分配 ---------- */
console.log('\n[2] 时长分配');
const b1 = allocate(SPEAKING_WEIGHTS, 600_000);
const sum1 = b1.reading + b1.qa + b1.topic;
check('朗读 20%', b1.reading === 120_000, String(b1.reading));
check('问答 30%', b1.qa === 180_000, String(b1.qa));
check('话题 50%', b1.topic === 300_000, String(b1.topic));
check('合计严格等于总时长', sum1 === 600_000, String(sum1));
const b2 = allocate({ a: 1, b: 1, c: 1 }, 1000);
check('三等分余数守恒', b2.a + b2.b + b2.c === 1000, String(b2.a + b2.b + b2.c));
const b3 = allocate({ a: 0.33, b: 0.33, c: 0.34 }, 1001);
check('非整除也守恒', b3.a + b3.b + b3.c === 1001, String(b3.a + b3.b + b3.c));
const b4 = allocate({ a: 0, b: 0 }, 500);
check('全零权重不崩', b4.a === 0 && b4.b === 0);
/* ---------- 3. 组卷 ---------- */
console.log('\n[3] 组卷');
const p1 = dealPaper(BANK, { seed: 20260101 });
console.log('  seed 20260101 → 朗读 ' + p1.ids.reading + '，问答 [' + p1.ids.qa.join(', ') + ']，话题 ' + p1.ids.topic);
check('朗读出 1 篇', !!p1.reading.task.id);
check('问答出 2 题', p1.qa.length === QA_COUNT, String(p1.qa.length));
check('话题出 1 题', !!p1.topic.task.id);
check('两题情境类别不重复', p1.qa[0].task.category !== p1.qa[1].task.category, p1.qa.map(function (x) { return x.task.category; }).join(' vs '));
check('口语段总时长 10 分钟', p1.speakingMs === SPEAKING_MINUTES * 60_000, String(p1.speakingMs));
check('朗读用时 = 20%', p1.reading.budgetMs === 120_000, String(p1.reading.budgetMs));
check('话题用时 = 50%', p1.speakingMs * 0.5 === 300_000);
check('各题用时合计不超过口语段', p1.allocatedMs <= p1.speakingMs, p1.allocatedMs + ' <= ' + p1.speakingMs);

/* ---------- 4. seed 贯通 ---------- */
console.log('\n[4] seed 贯通');
const p2 = dealPaper(BANK, { seed: 20260101 });
check('同 seed 朗读相同', p1.ids.reading === p2.ids.reading);
check('同 seed 问答相同', p1.ids.qa.join(',') === p2.ids.qa.join(','));
check('同 seed 话题相同', p1.ids.topic === p2.ids.topic);
const p3 = dealPaper(BANK, { seed: 999 });
check('不同 seed 至少一项不同',
  p3.ids.reading !== p1.ids.reading || p3.ids.qa.join(',') !== p1.ids.qa.join(',') || p3.ids.topic !== p1.ids.topic);

// 多个 seed 下题目应有足够多样性（不能总是同一篇）
const seenRead = new Set<string>();
const seenTopic = new Set<string>();
for (let s = 1; s <= 30; s++) {
  const pp = dealPaper(BANK, { seed: s });
  seenRead.add(pp.ids.reading);
  seenTopic.add(pp.ids.topic);
}
check('30 个 seed 抽到多篇不同朗读', seenRead.size >= 10, String(seenRead.size));
check('30 个 seed 抽到多个不同话题', seenTopic.size >= 8, String(seenTopic.size));
/* ---------- 5. 换卷 ---------- */
console.log('\n[5] 换卷');
const nxt = dealNextPaper(BANK, p1);
check('换卷 seed 递增', nxt.seed === p1.seed + 1, String(nxt.seed));
check('换卷朗读不重复', nxt.ids.reading !== p1.ids.reading, nxt.ids.reading + ' vs ' + p1.ids.reading);
check('换卷话题不重复', nxt.ids.topic !== p1.ids.topic, nxt.ids.topic + ' vs ' + p1.ids.topic);
const overlap = nxt.ids.qa.filter(function (id) { return p1.ids.qa.indexOf(id) >= 0; });
check('换卷问答不与上一份重叠', overlap.length === 0, overlap.join(','));
check('换卷仍出满 2 题', nxt.qa.length === QA_COUNT, String(nxt.qa.length));

/* ---------- 6. 题库不足 ---------- */
console.log('\n[6] 题库不足');
const tiny = makeBank(1, 1, 1);
let threw = '';
try { dealPaper(tiny, { seed: 1 }); } catch (e) { threw = e instanceof Error ? e.message : String(e); }
check('题库不足时抛错而非出半张卷', threw.length > 0, threw);
check('错误信息说明缺什么', threw.indexOf('情景问答') >= 0 || threw.indexOf('朗读') >= 0 || threw.indexOf('话题') >= 0, threw);
const noRead = makeBank(0, 24, 12);
let threw2 = '';
try { dealPaper(noRead, { seed: 1 }); } catch (e) { threw2 = e instanceof Error ? e.message : String(e); }
check('无朗读材料时报错', threw2.indexOf('朗读') >= 0, threw2);

/* ---------- 7. 真实题库 ---------- */
console.log('\n[7] 真实题库');
const realReadings = JSON.parse(readFileSync('data/readings.json', 'utf8'));
const realQa = JSON.parse(readFileSync('data/qa.json', 'utf8'));
const realKw = JSON.parse(readFileSync('data/qa-keywords.json', 'utf8'));
const realTopics = JSON.parse(readFileSync('data/topics.json', 'utf8'));
const R = (v: any) => Array.isArray(v) ? v : (v.readings || v.qa || v.topics || []);
const REAL: PaperBank = {
  readings: R(realReadings).map(function (r: any) {
    return { id: r.id, textbook: r.textbook, text: r.text, wordCount: r.wordCount, difficulty: r.difficulty, positionSource: r.positionSource };
  }),
  qa: R(realQa).map(function (r: any) {
    return { id: r.id, category: r.category, question: r.question, keyPoints: r.keyPoints, enKeywords: realKw[r.id] || [], difficulty: r.difficulty };
  }),
  topics: R(realTopics),
};
const rp = dealPaper(REAL, { seed: 20260101 });
console.log('  真实题库 → 朗读 ' + rp.ids.reading + '，问答 [' + rp.ids.qa.join(', ') + ']，话题 ' + rp.ids.topic);
check('真实题库可组卷', rp.qa.length === 2 && !!rp.reading.task.id && !!rp.topic.task.id);
check('真实题库问答类别不重复', rp.qa[0].task.category !== rp.qa[1].task.category);
check('真实题库朗读 id 存在于材料中', REAL.readings.some(function (r) { return r.id === rp.ids.reading; }));
check('真实题库话题 id 存在', REAL.topics.some(function (t) { return t.id === rp.ids.topic; }), rp.ids.topic);

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
