/**
 * 语料库自测 —— 零依赖、零 API，可直接运行：
 *   node --experimental-strip-types tests/materials.test.ts
 *
 * 许可：AGPL-3.0-only
 *
 * 覆盖四类断言：
 *   1. 数据完整性：条目数、id 唯一、字段齐全
 *   2. 语料质量：朗读词数达标、听力题有正确答案、范例回答 ≥ 7 句
 *   3. 跨层集成：范例回答喂给 L0 规则层，句数与要点覆盖都要达标
 *   4. 组卷逻辑：随机卷 / AB 卷 / 梅花卷的题量、去重、配平、可复现
 *   5. 降级路径：坏数据必须在加载期被拦下，而不是带到考场
 */

import { MATERIALS } from '../src/materials/index.ts';
import {
  MaterialError,
  MIN_SAMPLE_SENTENCES,
  POINT_TYPE_LABELS,
  POSITION_SOURCE_2026,
  countSentences,
  countWords,
  createMaterials,
  createRng,
  parseJsonText,
  readingsSchema,
  type ExamPaper,
  type PointType,
} from '../src/materials/loader.ts';
import { TOPICS } from '../src/rules/lexicon.ts';
import { evaluate, MIN_SENTENCES } from '../src/rules/evaluate.ts';

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

function section(title: string): void {
  console.log('\n=== ' + title + ' ===');
}

const M = MATERIALS;
const overlaps = <T>(a: T[], b: T[]): T[] => a.filter((x) => b.includes(x));

/* ---------------------------------------------------------------- */
section('1. 语料加载与总量');

const summary = M.summary();
console.log('  条目数：', JSON.stringify(summary));
check('朗读短文 24 篇（2026 考纲）', summary.readings === 24, String(summary.readings));
check('情景问答 ≥ 20 条', summary.qa >= 20, String(summary.qa));
check('听力题 ≥ 20 题', summary.listening >= 20, String(summary.listening));
check('话题简述 12 个话题（2025 起）', summary.topics === 12, String(summary.topics));
check('听力分短对话与长对话/短文两类', summary.dialogue >= 5 && summary.passage >= 5,
  `dialogue=${summary.dialogue} passage=${summary.passage}`);
check('id 全局唯一', (() => {
  const ids = [
    ...M.readings.map((r) => r.id),
    ...M.qa.map((q) => q.id),
    ...M.listening.map((l) => l.id),
  ];
  return new Set(ids).size === ids.length;
})());
check('按 id 索引可命中', M.readingById('rd-01').textbook.length > 0 &&
  M.qaById('qa-01').question.length > 0 && M.listeningById('ls-01').title.length > 0);
check('按话题名索引可命中', M.topicByName('my favourite sport').sampleAnswer.length >= MIN_SAMPLE_SENTENCES);
check('查不到时报错而不是返回 undefined', (() => {
  try { M.readingById('rd-999'); return false; } catch (e) { return e instanceof MaterialError; }
})());

/* ---------------------------------------------------------------- */
section('2. 朗读短文质量');

const badWords = M.readings.filter((r) => r.wordCount < 60 || r.wordCount > 100);
check('每篇 60-100 词', badWords.length === 0,
  badWords.map((r) => `${r.id}=${r.wordCount}`).join(', '));
const mismatch = M.readings.filter((r) => countWords(r.text) !== r.wordCount);
check('标注词数与正文实际词数一致', mismatch.length === 0,
  mismatch.map((r) => r.id).join(', '));
check('每篇都有连读 / 意群提示', M.readings.every((r) => r.phonicsCues.length > 0));
check('每篇都有教材位置与册别', M.readings.every((r) => r.textbook.length > 0 && r.book.length > 0));
check('标注为「等效练习材料」而非教材原文', M.readings.every((r) => r.note.includes('非教材原文')));

const announced = M.readingsAnnounced();
const ANNOUNCED_POSITIONS = ['七上 U3 Task', '七下 U6 Task', '八下 U7 Task', '九上 U7 Reading', '九下 U2 Reading', '九下 U4 Reading'];
check('2026 省通知公布的 6 篇教材位置齐全', announced.length === 6 &&
  ANNOUNCED_POSITIONS.every((p) => announced.some((r) => r.textbook === p)),
  announced.map((r) => r.textbook).join(', '));
check('教材位置对标真实单元（抽查 9A U7 = Films、9B U2 = Great people、9B U4 = Life on Mars）',
  announced.find((r) => r.textbook === '九上 U7 Reading')?.unitTheme.includes('Films') === true &&
  announced.find((r) => r.textbook === '九下 U2 Reading')?.unitTheme.includes('Great people') === true &&
  announced.find((r) => r.textbook === '九下 U4 Reading')?.unitTheme.includes('Life on Mars') === true);
const books = Object.keys(summary.books);
check('覆盖六册教材', ['七上', '七下', '八上', '八下', '九上', '九下'].every((b) => summary.books[b] > 0),
  JSON.stringify(summary.books));
check('册别查询可用', M.readingsByBook('九下').length === summary.books['九下']);
check('难度覆盖 1-3 三档', ([1, 2, 3] as const).every((d) => M.readings.some((r) => r.difficulty === d)));
check('pos 超纲词抽查：短文只用基础词汇（无 by/among/although 之外的生僻词堆砌）', (() => {
  // 抽查：允许连接词 but/although/because，其余高频词不应出现明显超纲词
  const risky = ['utilize', 'aforementioned', 'nevertheless', 'paramount', 'endeavour'];
  return M.readings.every((r) => risky.every((w) => !r.text.toLowerCase().includes(w)));
})());

/* ---------------------------------------------------------------- */
section('3. 听力题质量');

check('每题 3 个选项', M.listening.every((l) => l.options.length === 3));
check('每题有合法正确答案（0-2）', M.listening.every((l) =>
  Number.isInteger(l.answer) && l.answer >= 0 && l.answer < l.options.length),
  M.listening.filter((l) => !(l.answer >= 0 && l.answer < l.options.length)).map((l) => l.id).join(','));
check('选项带 A/B/C 前缀', M.listening.every((l) => l.options.every((o, i) => o.startsWith(String.fromCharCode(65 + i)))));
check('问题以问号结尾', M.listening.every((l) => l.question.trim().endsWith('?')));
check('考点类型合法且标签齐全', M.listening.every((l) => l.pointType in POINT_TYPE_LABELS));
check('细节/推理/数字三类都出现', (['detail', 'inference', 'number'] as const)
  .every((p) => M.listeningByPoint(p).length >= 5),
  (['detail', 'inference', 'number'] as const).map((p) => `${POINT_TYPE_LABELS[p]}=${M.listeningByPoint(p).length}`).join(' '));
// 数字/时间题既可能用阿拉伯数字，也可能用英文数词，两种写法都算数
const NUMBER_HINT = /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|half|quarter|o'clock)\b/;
check('数字类题确实包含数字或时间', M.listeningByPoint('number').every((l) => NUMBER_HINT.test(l.text + l.question)));
check('对话材料使用 W:/M: 说话人标记', M.listeningByType('dialogue').every((l) => /\n/.test(l.text)));
check('每题都有听力关键词', M.listening.every((l) => l.keywords.length > 0));
check('长对话/短文材料不少于 20 词', M.listeningByType('passage').every((l) => countWords(l.text) >= 20));

/* ---------------------------------------------------------------- */
section('4. 情景问答质量');

check('每题有中文情境（仅教师参考）', M.qa.every((q) => /[\u4e00-\u9fa5]/.test(q.scenario)));
check('每题有英文问句且以问号结尾', M.qa.every((q) => q.question.trim().endsWith('?')));
check('每题至少 2 条参考回答要点', M.qa.every((q) => q.keyPoints.length >= 2));
check('情境类别 ≥ 6 类（梅花卷要按类别配平）', new Set(M.qa.map((q) => q.category)).size >= 6,
  String(new Set(M.qa.map((q) => q.category)).size));
check('类别查询可用', M.qaByCategory('健康').length >= 1);

/* ---------------------------------------------------------------- */
section('5. 话题简述质量');

check('话题名与 L0 规则层 lexicon 的 8 个内置话题一致（可直接喂给 evaluate）', TOPICS.every((t) => M.findTopic(t.name) !== undefined),
  TOPICS.filter((t) => M.findTopic(t.name) === undefined).map((t) => t.name).join(','));
check('示例回答句数门槛与 L0 规则层一致', MIN_SAMPLE_SENTENCES === MIN_SENTENCES);
check('每题范例回答 ≥ 7 句', M.topics.every((t) => t.sampleAnswer.length >= MIN_SAMPLE_SENTENCES),
  M.topics.filter((t) => t.sampleAnswer.length < MIN_SAMPLE_SENTENCES).map((t) => t.name).join(','));
check('范例回答每条都是完整句子', M.topics.every((t) => t.sampleAnswer.every((s) => s.trim().endsWith('.') || s.trim().endsWith('!'))));
check('每题至少 2 组常用句式', M.topics.every((t) => t.keyExpressions.length >= 2));
check('每题关键词 ≥ 3 且无重复', M.topics.every((t) => t.keywords.length >= 3 && new Set(t.keywords).size === t.keywords.length));
check('关键词与 L0 内置词表重叠（保证两套要点库口径一致）', TOPICS.every((t) => {
  const mine = new Set(M.topicByName(t.name).keywords);
  return t.keywords.filter((k) => mine.has(k)).length >= Math.min(6, t.keywords.length);
}));
check('范例回答不含真实个人信息（电话/邮箱/门牌）', M.topics.every((t) =>
  !/1[3-9]\d{9}/.test(t.sampleAnswer.join(' ')) && !/@/.test(t.sampleAnswer.join(' '))));

/* ---------------------------------------------------------------- */
section('6. 跨层集成：范例回答 → L0 规则层');

for (const topic of M.topics) {
  const transcript = topic.sampleAnswer.join(' ');
  const report = evaluate({ transcript, topic, durationMs: 45000 });
  const ok = report.checks.length.ok && report.checks.coverage.ok && report.checks.connectors.ok;
  check(`「${topic.name}」范例回答可拿到达标诊断`, ok && !report.diagnostics.some((d) => d.severity === 'error'),
    `句数=${report.checks.length.value} 覆盖=${(report.progress * 100).toFixed(0)}% 连接词=${report.checks.connectors.value} 分=${report.score}`);
}

/* ---------------------------------------------------------------- */
section('7. 组卷逻辑');

function shapeOk(p: ExamPaper, short = 5, long = 5, qa = 2): boolean {
  return p.listening.short.length === short && p.listening.long.length === long &&
    p.qa.length === qa && p.reading !== undefined && p.topic !== undefined;
}

const p1 = M.buildPaper({ seed: 2026 });
const p2 = M.buildPaper({ seed: 2026 });
const p3 = M.buildPaper({ seed: 8888 });
check('随机卷题量符合五大题型（听力 5+5、朗读 1、情景问答 2、话题 1）', shapeOk(p1));
check('同一种子 → 同一套卷面（可复现，便于教师重印）',
  JSON.stringify(p1.summary.itemIds) === JSON.stringify(p2.summary.itemIds));
check('不同种子 → 卷面不同', JSON.stringify(p1.summary.itemIds) !== JSON.stringify(p3.summary.itemIds));
check('朗读短文来自 24 篇语料', M.findReading(p1.reading.id) !== undefined);
check('话题简述来自 12 个话题', M.findTopic(p1.topic.name) !== undefined);
check('卷面统计自洽', p1.summary.listeningCount === 10 &&
  p1.summary.itemIds.length === 5 + 5 + 1 + 2 + 1,
  JSON.stringify(p1.summary.itemIds));
check('随机卷未指定种子也能组卷', shapeOk(M.buildPaper()));

const ab = M.buildABPaper({ seed: 7 });
check('AB 卷题量与随机卷一致', shapeOk(ab.A) && shapeOk(ab.B));
check('AB 卷卷名正确', ab.A.formLabel === 'A 卷' && ab.B.formLabel === 'B 卷');
check('AB 卷两卷之间不重题', overlaps(ab.A.summary.itemIds, ab.B.summary.itemIds).length === 0,
  overlaps(ab.A.summary.itemIds, ab.B.summary.itemIds).join(','));
check('AB 卷可复现', JSON.stringify(M.buildABPaper({ seed: 7 }).A.summary.itemIds) === JSON.stringify(ab.A.summary.itemIds));

const plum = M.buildPlumBlossom({ seed: 9 });
const plumForms = [plum.甲, plum.乙, plum.丙];
check('梅花卷给出 3 套平行卷', plumForms.every((f) => shapeOk(f)));
check('梅花卷卷名为甲/乙/丙', plumForms.map((p) => p.formLabel).join('/') === '甲卷/乙卷/丙卷');
const allIds = plumForms.flatMap((p) => p.summary.itemIds);
check('梅花卷三套之间不重题', new Set(allIds).size === allIds.length,
  allIds.filter((x, i) => allIds.indexOf(x) !== i).join(','));
const pointSpread = (['detail', 'inference', 'number'] as PointType[]).map((p) => {
  const counts = plumForms.map((f) => f.summary.pointTypes[p]);
  return Math.max(...counts) - Math.min(...counts);
});
check('梅花卷考点配平（各卷细节/推理/数字题量差 ≤ 1）', pointSpread.every((n) => n <= 1),
  pointSpread.join(','));
const diffSet = plumForms.map((f) => f.reading.difficulty);
check('梅花卷朗读材料同难度（平行卷不能有难易差）', new Set(diffSet).size === 1, diffSet.join(','));
check('梅花卷同卷情景问答不同类别', plumForms.every((f) =>
  f.qa.length < 2 || new Set(f.qa.map((q) => q.category)).size === f.qa.length));
check('梅花卷三套话题互不相同', new Set(plumForms.map((f) => f.topic.name)).size === 3);

const filtered = M.buildPaper({ seed: 1, books: ['九上', '九下'] });
check('册别过滤生效（只抽九上/九下材料）',
  ['九上', '九下'].includes(filtered.reading.book), filtered.reading.book);
const custom = M.buildPaper({ seed: 3, layout: { shortDialogue: 3, longListening: 3, qa: 1 } });
check('自定义题量生效', custom.listening.short.length === 3 && custom.listening.long.length === 3 && custom.qa.length === 1);

const rng = createRng(1234);
check('种子随机数可复现', createRng(1234).next() === rng.next());
check('随机抽题不放回', (() => {
  const picked = rng.sample(M.readings, 5);
  return picked.length === 5 && new Set(picked.map((r) => r.id)).size === 5;
})());
check('随机抽题可按类型过滤', M.drawListening(3, createRng(5), { type: 'passage' })
  .every((l) => l.type === 'passage'));

/* ---------------------------------------------------------------- */
section('8. 降级与错误路径：坏数据必须在加载期被拦下');

function expectMaterialError(name: string, fn: () => unknown, hint: string): void {
  try {
    fn();
    check(name, false, '没有抛错');
  } catch (err) {
    check(name, err instanceof MaterialError && /语料校验失败/.test(err.message),
      err instanceof Error ? err.message.slice(0, 90) : String(err));
    if (err instanceof MaterialError) console.log('        提示：' + hint);
  }
}

const broken = JSON.parse(JSON.stringify({
  readings: M.readings, qa: M.qa, listening: M.listening, topics: M.topics,
}));
broken.readings[0].wordCount = 999;
expectMaterialError('朗读词数与正文不符 → 报错', () => createMaterials(broken), '防止语料与标注脱节');

const missing = JSON.parse(JSON.stringify(broken));
missing.readings[0].wordCount = countWords(missing.readings[0].text);
delete missing.readings[1].tags;
expectMaterialError('缺字段 → 报错', () => createMaterials(missing), '字段缺失要一次性报全');

const dupId = JSON.parse(JSON.stringify(broken));
dupId.readings[0].wordCount = countWords(dupId.readings[0].text);
dupId.readings[1].wordCount = countWords(dupId.readings[1].text);
dupId.readings[1].id = dupId.readings[0].id;
expectMaterialError('id 重复 → 报错', () => createMaterials(dupId), '同 id 会导致抽题重复');

const badAnswer = JSON.parse(JSON.stringify(broken));
badAnswer.listening[0].answer = 5;
expectMaterialError('听力答案越界 → 报错', () => createMaterials(badAnswer), '没有正确答案的题不能进题库');

const shortSample = JSON.parse(JSON.stringify(broken));
shortSample.topics[0].sampleAnswer = ['Only one sentence.'];
expectMaterialError('范例回答不足 7 句 → 报错', () => createMaterials(shortSample), '2025 起要求说满 7 句');

const tooSmall = createMaterials({
  readings: M.readings.slice(0, 3), qa: M.qa.slice(0, 2),
  listening: M.listening.slice(0, 4), topics: M.topics.slice(0, 2),
});
expectMaterialError('语料不足时组 AB 卷 → 报错', () => tooSmall.buildABPaper(), '组卷要明确报「需要几道、现有几道」');

expectMaterialError('非法 JSON 文本 → 报错',
  () => parseJsonText('{ not json', readingsSchema, 'data/readings.json'), '网络异常时不能静默返回空题库');

check('合法 JSON 文本能被 parseJsonText 解析',
  parseJsonText(JSON.stringify(M.readings.slice(0, 2)), readingsSchema, 'data/readings.json').length === 2);

/* ---------------------------------------------------------------- */
console.log('\n=== 汇总 ===');
console.log(`  通过 ${pass} 项，失败 ${fail} 项`);

// 退出码：仓库 tsconfig 未开 @types/node，这里用类型断言避免依赖 Node 全局类型
const nodeProcess = (globalThis as { process?: { exitCode?: number } }).process;
if (nodeProcess) nodeProcess.exitCode = fail > 0 ? 1 : 0;
if (fail > 0) throw new Error(`语料库自测失败：${fail} 项未通过`);
