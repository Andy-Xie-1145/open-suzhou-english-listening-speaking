/**
 * L0 规则层自测 —— 零依赖、零 API
 * 许可：AGPL-3.0-only
 */

import { evaluate, MIN_SENTENCES } from '../src/rules/evaluate.ts';
import { TOPICS } from '../src/rules/lexicon.ts';

let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

console.log('=== L0 规则层自测 ===');


const good = [
  'I like playing basketball very much.',
  'First, I am a member of our school basketball team.',
  'Second, I often play with my friends after school.',
  'Also, basketball helps me keep fit and healthy.',
  'However, it is hard when we lose a game.',
  'But my friends and I keep training every weekend.',
  'In my opinion, sport makes our school life more fun and happy.',
].join(' ');

const r1 = evaluate({ transcript: good, topic: 'my favourite sport', durationMs: 46000 });
console.log('\n[用例1] 理想话题简述');
console.log('  诊断分:', r1.score, '| 句数:', r1.checks.length.value, '| 覆盖:', r1.checks.coverage.message, '| 连接词:', r1.checks.connectors.value);
check('句数达标', r1.checks.length.ok, String(r1.checks.length.value));
check('要点覆盖达标', r1.checks.coverage.ok, r1.checks.coverage.message);
check('连接词达标', r1.checks.connectors.ok, String(r1.checks.connectors.value));
check('诊断分较高(>=80)', r1.score >= 80, String(r1.score));
check('无 error 级诊断', !r1.diagnostics.some(d => d.severity === 'error'));

const bad = 'I like it. It is very good.';
const r2 = evaluate({ transcript: bad, topic: 'my favourite sport', durationMs: 6000 });
console.log('\n[用例2] 严重不足作答');
console.log('  诊断分:', r2.score, '| 句数:', r2.checks.length.value, '| 进度:', (r2.progress*100).toFixed(0) + '%');
check('句数不达标被识别', !r2.checks.length.ok);
check('要点覆盖低被识别', !r2.checks.coverage.ok, r2.checks.coverage.message);
check('产生 LENGTH_SHORT error', r2.diagnostics.some(d => d.code === 'LENGTH_SHORT'));
check('诊断分较低(<50)', r2.score < 50, String(r2.score));

const messy = 'Um, my number is 13812345678 and I um like uh playing. Also my email is a@b.com. Because sport is good. And it is fun. Then I play. So I am happy. Very happy indeed.';
const r3 = evaluate({ transcript: messy, topic: 'my favourite sport', durationMs: 8000 });
console.log('\n[用例3] 隐私+停顿+语速过快');
console.log('  诊断分:', r3.score, '| 诊断项:', r3.diagnostics.length);
check('检出隐私信息', r3.diagnostics.some(d => d.code === 'PII_LEAK'));
check('检出停顿词', r3.diagnostics.some(d => d.code === 'FILLER_HIGH'));
check('检出语速过快', r3.diagnostics.some(d => d.code === 'PACE_FAST'));

const qa = 'Yes, I go to school by bike. First it is good for the environment. Second it saves money. Also it helps me exercise every morning. However sometimes it rains. But I still like riding my bike to school because it is fast and healthy.';
const r4 = evaluate({ transcript: qa, topic: null, durationMs: 38000 });
console.log('\n[用例4] 情景问答（无话题）');
console.log('  诊断分:', r4.score, '| 句数:', r4.checks.length.value);
check('句数合理(>=5; 7句门槛仅适用话题简述)', r4.checks.length.value >= 5, String(r4.checks.length.value));
check('无话题时不误报覆盖', r4.checks.coverage.message === 'n/a');

const noPunct = 'first i like sport very much it is healthy and fun also i play with my friends every weekend because it is good for me however sometimes it is hard but i keep training';
const r5 = evaluate({ transcript: noPunct, topic: 'my favourite sport' });
console.log('\n[用例5] 无句号的松散转写');
console.log('  句数(松散切分):', r5.checks.length.value);
check('松切分能按连接词切出多句(>=4)', r5.checks.length.value >= 4, String(r5.checks.length.value));
check('用到了 MIN_SENTENCES 常量', MIN_SENTENCES === 7, String(MIN_SENTENCES));

console.log('\n[词表]');
check('话题库非空', TOPICS.length > 0, String(TOPICS.length));
check('含 my favourite sport', TOPICS.some(t => t.name === 'my favourite sport'));

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
