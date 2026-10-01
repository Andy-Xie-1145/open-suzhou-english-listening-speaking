import { evaluateReading, alignReading } from '../src/rules/reading.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}
console.log('=== 朗读短文评测自测 ===\n');

const ref = 'I like playing basketball very much with my friends after school.';

// 用例1: 完美朗读
const r1 = evaluateReading({ reference: ref, spoken: ref, durationMs: 4000 });
console.log('[用例1] 完美朗读');
console.log('  分:', r1.score, '| 完整度:', (r1.completeness*100).toFixed(0)+'%', '| 准确度:', (r1.accuracy*100).toFixed(0)+'%');
check('无漏读', r1.alignment.omissions.length === 0, String(r1.alignment.omissions.length));
check('完整度100%', r1.completeness === 1);
check('高分(>=95)', r1.score >= 95, String(r1.score));

// 用例2: 漏读 3 个词
const spoken2 = 'I like basketball very with friends school';
const r2 = evaluateReading({ reference: ref, spoken: spoken2, durationMs: 3500 });
console.log('\n[用例2] 漏读');
console.log('  分:', r2.score, '| 漏读:', r2.alignment.omissions.map(i=>r2.alignment.reference[i]).join(','));
check('检出漏读', r2.alignment.omissions.length >= 2, String(r2.alignment.omissions.length));
check('产生 READ_OMISSION', r2.diagnostics.some(d => d.code === 'READ_OMISSION'));
check('完整度<100%', r2.completeness < 1);

// 用例3: 读错词 (spelling near-miss)
const spoken3 = 'I like playing basketbal very much with my freinds after school.';
const r3 = evaluateReading({ reference: ref, spoken: spoken3, durationMs: 4000 });
console.log('\n[用例3] 近音误读');
console.log('  分:', r3.score, '| 误读:', r3.alignment.misreads.map(m=>m.ref+'→'+m.got).join(','));
check('检出误读', r3.alignment.misreads.length >= 1, JSON.stringify(r3.alignment.misreads));

// 用例4: 多说
const spoken4 = ref + ' always every day';
const r4 = evaluateReading({ reference: ref, spoken: spoken4 });
console.log('\n[用例4] 多说');
check('检出多说的词', r4.alignment.insertions.length >= 2, String(r4.alignment.insertions.length));
check('产生 READ_INSERTION', r4.diagnostics.some(d => d.code === 'READ_INSERTION'));

// 用例5: 语速过快
const r5 = evaluateReading({ reference: ref, spoken: ref, durationMs: 1200 });
console.log('\n[用例5] 语速过快');
check('检出语速快', r5.diagnostics.some(d => d.code === 'READ_PACE_FAST'));

// 用例6: 对齐顺序保持
const a6 = alignReading(ref, 'I like playing basketball very much with my friends after school');
check('对齐顺序与原文一致', a6.spokenFlags.every(Boolean), JSON.stringify(a6.spokenFlags));

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
