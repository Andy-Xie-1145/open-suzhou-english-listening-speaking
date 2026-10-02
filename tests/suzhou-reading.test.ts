/**
 * 朗读短文近似评分 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 本文件测的是**近似规则**，不是官方算法。
 *
 * 除常规功能断言外，本文件还承担一条特殊职责：
 * **用测试锁死措辞红线**，防止任何人把近似分写成「得分」或声称对标官方引擎。
 */

import { alignWords, scoreReading, toReadingTask, toleranceFor } from '../src/suzhou/reading-section.ts';
import { READING_WEIGHTS, WEIGHTS_SUM_IS_ONE, describeSource, SOURCE_OFFICIAL, SOURCE_INFERRED } from '../src/suzhou/spec-config.ts';
import { disclaimerBlock, BADGE, SCORE_LABEL, KNOWN_LIMITS } from '../src/suzhou/disclaimer.ts';
import readingsJson from '../data/readings.json' with { type: 'json' };

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const RAW: any[] = (readingsJson as any).readings ?? (Array.isArray(readingsJson) ? readingsJson : []);
const ref = RAW[0].text;

console.log('=== 朗读短文 · 近似模拟测试 ===\n');

/* ---------------- 1. 对齐 ---------------- */
console.log('[1] 词级对齐');
const a1 = alignWords(ref, ref);
check('完美朗读无漏读', a1.omitted === 0, String(a1.omitted));
check('完美朗读全精确命中', a1.exact === a1.total && a1.fuzzy === 0, a1.exact + '/' + a1.total);

const a2 = alignWords(ref, 'Last Sunday our class played football');
check('只读前 6 词检出漏读', a2.omitted > 10, String(a2.omitted));
check('前 6 词标为精确', a2.exact === 6, String(a2.exact));

const a3 = alignWords('I like basketball', 'I like basketbal');
check('近音误读判为 fuzzy', a3.fuzzy === 1, JSON.stringify(a3.words.map(w => w.verdict)));
check('fuzzy 不算漏读', a3.omitted === 0);

const a4 = alignWords('I like basketball', 'I really like basketball so much');
check('多说词被检出', a4.insertions.length >= 2, String(a4.insertions.length));
check('多说不影响完整度', a4.omitted === 0 && a4.exact === 3);

check('短词容差为 1', toleranceFor('cat') === 1);
check('长词容差为 2', toleranceFor('basketball') === 2);

/* ---------------- 2. 评分 ---------------- */
console.log('\n[2] 近似评分');
const s1 = scoreReading({ reference: ref, spoken: ref, durationMs: ref.split(/\s+/).length * 500 });
console.log('  完美朗读 → 近似分 ' + s1.approximateScore);
// 韵律性未实现、恒取中性分 0.5，故完美朗读的上限是 95*0.5 + 5*0.5 = 100 中的 97.5→98
check('完美朗读得 98（韵律性未实现拉低 2 分）', s1.approximateScore === 98, String(s1.approximateScore));
check('四个维度齐全（含未实现的韵律性）', s1.dimensions.length === 4, String(s1.dimensions.length));
check('维度标签带解释', s1.dimensions.every(d => d.label.length > 0));

const words = ref.split(/\s+/);
const half = words.filter(function (_: string, i: number) { return i % 2 === 0; }).join(' ');
const s2 = scoreReading({ reference: ref, spoken: half, durationMs: 40000 });
console.log('  漏读一半 → 近似分 ' + s2.approximateScore + '，漏读 ' + s2.alignment.omitted + ' 词');
check('漏读显著降分', s2.approximateScore < 60, String(s2.approximateScore));
check('漏读反馈列出具体词', s2.feedback.some(f => f.type === 'omission' && f.words.length > 0));

const s3 = scoreReading({ reference: 'I like basketball', spoken: 'I like basketbal', durationMs: 3000 });
console.log('  近音误读 → 近似分 ' + s3.approximateScore);
check('误读完整度仍满分', s3.dimensions[0].value === 1, String(s3.dimensions[0].value));
check('误读准确度被扣', s3.dimensions[1].value < 1, String(s3.dimensions[1].value));
check('误读反馈提示音素局限', s3.feedback.some(f => f.type === 'mispronounce' && f.message.includes('音素')));

const s4 = scoreReading({ reference: ref, spoken: ref, durationMs: 1000 });
check('语速过快被惩罚', s4.dimensions[2].value < 1, String(s4.dimensions[2].value));
check('语速过快有反馈', s4.feedback.some(f => f.type === 'pace'));

const s5 = scoreReading({ reference: ref, spoken: ref });
check('无时长不惩罚流利度', s5.dimensions[2].value === 1);
check('无时长时说明无法评估', s5.dimensions[2].note.includes('未记录时长'));

/* ---------------- 3. 权重与配置 ---------------- */
console.log('\n[3] 权重配置');
check('权重和为 1', WEIGHTS_SUM_IS_ONE === true);
check('完整度权重 0.70', READING_WEIGHTS.completeness === 0.70);
check('准确度权重 0.20', READING_WEIGHTS.accuracy === 0.20);
check('流利度权重 0.05（机构图解口径）', READING_WEIGHTS.fluency === 0.05, String(READING_WEIGHTS.fluency));

check('官方来源标记为 official', describeSource(SOURCE_OFFICIAL).official === true);
check('推定来源标记为非 official', describeSource(SOURCE_INFERRED).official === false);
check('推定来源说明含「非考纲事实」', describeSource(SOURCE_INFERRED).label.includes('非考纲事实'));
/* ---------------- 4. 措辞红线（关键） ---------------- */
console.log('\n[4] 措辞红线 —— 防止把近似分说成真分数');

const block = disclaimerBlock();
check('短标识为「近似模拟」', BADGE === '近似模拟', BADGE);
check('分数标签为「近似分」而非「得分」', SCORE_LABEL === '近似分', SCORE_LABEL);
check('声明含「不是苏州市中考听力口语考试的评分」', block.paragraphs[0].includes('不是苏州市中考听力口语考试的评分'));
check('声明说明真实引擎不对外', block.paragraphs[1].includes('算法不对外'));
check('声明说明只用于发现问题', block.paragraphs[2].includes('只用于发现'));

// 已知的具体局限必须写出来，不能只给套话
check('局限含「不评估音素级」', KNOWN_LIMITS.some(l => l.includes('音素')));
check('局限含「不评估语调」', KNOWN_LIMITS.some(l => l.includes('语调')));
check('局限含「转写会掩盖错读」', KNOWN_LIMITS.some(l => l.includes('掩盖')));
check('局限含「不折算中考 30 分」', KNOWN_LIMITS.some(l => l.includes('30 分')));
check('局限含语料非教材原文', KNOWN_LIMITS.some(l => l.includes('非教材原文')));

/* ---------------- 5. 全局禁用表述扫描 ---------------- */
console.log('\n[5] 全局禁用表述扫描');

// 这些表述一旦出现，就是把近似说成真实。红线由测试强制，不靠自觉。
const BANNED = [
  '对标讯飞',
  '等同正考',
  '等同官方',
  '与考场一致',
  '与正考一致',
  '准确预测分数',
  '预测你的分数',
  '估分',
  '官方评分算法',
  '超过多少人',
  '排名',
];

interface FileRef { path: string; text: string; }
const filesToScan: FileRef[] = [
  { path: 'src/suzhou/reading-section.ts', text: await import('node:fs/promises').then(m => m.readFile('src/suzhou/reading-section.ts', 'utf8')) },
  { path: 'src/suzhou/spec-config.ts', text: await import('node:fs/promises').then(m => m.readFile('src/suzhou/spec-config.ts', 'utf8')) },
  { path: 'src/suzhou/disclaimer.ts', text: await import('node:fs/promises').then(m => m.readFile('src/suzhou/disclaimer.ts', 'utf8')) },
  { path: 'spec/suzhou-listening-speaking.spec.md', text: await import('node:fs/promises').then(m => m.readFile('spec/suzhou-listening-speaking.spec.md', 'utf8')) },
];

let bannedHits = 0;
for (const f of filesToScan) {
  for (const phrase of BANNED) {
    if (f.text.includes(phrase)) {
      // spec 里允许出现在「禁止」条款的描述中
      const isSpecRedline = f.path.startsWith('spec/')
        && (f.text.includes('禁止') || f.text.includes('不得') || f.text.includes('红线'));
      if (!isSpecRedline) {
        console.log('      违规: ' + f.path + ' 含「' + phrase + '」');
        bannedHits++;
      }
    }
  }
}
check('源码与界面文案无禁用表述', bannedHits === 0, bannedHits + ' 处');

// 近似分必须命名为 approximateScore，不允许叫 score
const src = filesToScan[0].text;
check('分数字段名为 approximateScore', src.includes('approximateScore'));
check('不使用裸 score 作为结果字段', !/\bscore:\s*number/.test(src));

/* ---------------- 6. 语料联动 ---------------- */
console.log('\n[6] 语料联动');
check('语料共 24 篇', RAW.length === 24, String(RAW.length));
const official = RAW.filter(r => r.positionSource === SOURCE_OFFICIAL);
check('官方公布位置 6 篇', official.length === 6, String(official.length));
check('推定位置 18 篇', RAW.length - official.length === 18, String(RAW.length - official.length));

const task = toReadingTask(RAW[0]);
check('任务带原文', task.text.length > 200, String(task.text.length));
check('任务带来源说明', typeof task.source.label === 'string' && task.source.label.length > 0);
check('推定篇来源标记为非官方', task.source.official === false);
check('官方篇来源标记为官方', toReadingTask(official[0]).source.official === true);

// 端到端：语料原文 → 近似评分
const e2e = scoreReading({ reference: task.text, spoken: task.text, durationMs: task.wordCount * 480 });
check('语料原文得 98（韵律性未实现）', e2e.approximateScore === 98, String(e2e.approximateScore));

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
