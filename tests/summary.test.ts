import { summarize, TOTAL_POINTS } from '../src/rules/summary.ts';
import { evaluateReading } from '../src/rules/reading.ts';
import { evaluate } from '../src/rules/evaluate.ts';
import { evaluateListening } from '../src/rules/listening.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}
console.log('=== 成绩汇总自测 ===\n');

const q = (id: string, skill: any, ans: string) => ({
  id: id, skill: skill, prompt: 'q?',
  options: [{label:'A',text:'a'},{label:'B',text:'b'}], answer: ans, script: 's',
});

const listening = {
  dialogue: evaluateListening([q('d1','detail','A'), q('d2','detail','B')],
    [{questionId:'d1',chosen:'A'},{questionId:'d2',chosen:'A'}]),
  passage: evaluateListening([q('p1','mainidea','B'), q('p2','number','A')],
    [{questionId:'p1',chosen:'B'},{questionId:'p2',chosen:'B'}]),
};

const ref = 'I like playing basketball very much with my friends after school.';
const reading = evaluateReading({ reference: ref, spoken: ref, durationMs: 4500 });

const qaText = 'Yes I go by bike every day. First it is good for our environment. Second it saves money. Also it helps me exercise in the morning. However it is hard when it rains.';
const qa = evaluate({ transcript: qaText, topic: null, durationMs: 30000 });

const topicText = 'I like playing basketball very much. First I am a member of our school team. Second I play with my friends after school. Also it helps me keep fit and healthy. However training is sometimes hard. But we never give up. In my opinion sport makes school life more fun.';
const topic = evaluate({ transcript: topicText, topic: 'my favourite sport', durationMs: 45000 });

const full = summarize({ listening: listening, reading: reading, qa: qa, topic: topic });
console.log('[用例1] 完整答卷');
console.log('  百分制:', full.percent, '| 折算30分制:', full.total);
console.log('  题型数:', full.sections.length, '| complete:', full.complete);
for (const s of full.sections) console.log('    - ' + s.title + ': ' + s.score + ' (' + s.headline + ')');
check('四个 section (听力两题合并展示)', full.sections.length === 4, String(full.sections.length));
check('标记为完整', full.complete === true);
check('百分制在0-100', full.percent >= 0 && full.percent <= 100, String(full.percent));
check('30分制在0-30', full.total >= 0 && full.total <= TOTAL_POINTS, String(full.total));
check('结论非空', typeof full.verdict === 'string' && full.verdict.length > 0);

const empty = summarize({});
console.log('\n[用例2] 空答卷');
check('0分', empty.percent === 0, String(empty.percent));
check('未判定完整', empty.complete === false);
check('结论为尚未作答', empty.verdict === '尚未作答', empty.verdict);

const partial = summarize({ reading: reading, qa: qa });
console.log('\n[用例3] 只做两个口语题');
console.log('  百分制:', partial.percent, '| 结论:', partial.verdict);
check('判定为不完整', partial.complete === false);
check('提示缺考影响', partial.verdict.indexOf('缺考') >= 0, partial.verdict);

const shortTopic = evaluate({ transcript: 'I like basketball. It is fun. We play every day.', topic: 'my favourite sport', durationMs: 12000 });
const withShort = summarize({ listening: listening, reading: reading, qa: qa, topic: shortTopic });
console.log('\n[用例4] 话题简述只说3句');
let topicSection: any = null;
for (const s of withShort.sections) { if (s.kind === 'topic') topicSection = s; }
console.log('  话题分:', topicSection ? topicSection.score : 'n/a', '|', topicSection ? topicSection.headline : '');
check('点名句数不足', (topicSection ? topicSection.headline : '').indexOf('7 句') >= 0, topicSection ? topicSection.headline : '');

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
