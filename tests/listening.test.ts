import { evaluateListening } from '../src/rules/listening.ts';
import type { ListeningQuestion } from '../src/rules/listening.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}
console.log('=== 听力题评测自测 ===\n');

const opt = (l: string, t: string) => ({ label: l, text: t });

const qs: ListeningQuestion[] = [
  { id: 'q1', skill: 'detail', prompt: 'When will they meet?',
    options: [opt('A','At 8:00'), opt('B','At 9:00'), opt('C','At 10:00')],
    answer: 'B', script: 'Shall we meet at nine? Sure.' },
  { id: 'q2', skill: 'inference', prompt: 'How does the speaker feel?',
    options: [opt('A','Happy'), opt('B','Tired'), opt('C','Angry')],
    answer: 'A', script: 'I got the first place! That is wonderful!' },
  { id: 'q3', skill: 'number', prompt: 'How many students are there?',
    options: [opt('A','30'), opt('B','40'), opt('C','50')],
    answer: 'C', script: 'There are fifty students in our class.' },
  { id: 'q4', skill: 'mainidea', prompt: 'What is the passage mainly about?',
    options: [opt('A','Sports'), opt('B','Environment'), opt('C','Music')],
    answer: 'B', script: 'We should protect the environment and recycle rubbish.' },
];

const all = evaluateListening(qs, [
  { questionId: 'q1', chosen: 'B' },
  { questionId: 'q2', chosen: 'A' },
  { questionId: 'q3', chosen: 'C' },
  { questionId: 'q4', chosen: 'B' },
]);
console.log('[用例1] 全对');
console.log('  分:', all.score, '| 正确:', all.correct + '/' + all.total);
check('满分100', all.score === 100, String(all.score));
check('无漏答', all.unanswered.length === 0);
check('无薄弱考点', all.weakSkills.length === 0);

const mixed = evaluateListening(qs, [
  { questionId: 'q1', chosen: 'A' },
  { questionId: 'q2', chosen: 'A' },
  { questionId: 'q3', chosen: 'A' },
]);
console.log('\n[用例2] 错2漏1');
console.log('  分:', mixed.score, '| 正确:', mixed.correct + '/' + mixed.total);
console.log('  薄弱:', mixed.weakSkills.map(s => s.skill + '(' + s.missed + '/' + s.total + ')').join(' '));
check('分数=25 (1/4 正确)', mixed.score === 25, String(mixed.score));
check('检出漏答', mixed.unanswered.includes('q4'));
check('检出薄弱考点', mixed.weakSkills.length >= 2, String(mixed.weakSkills.length));
check('数字类为薄弱', mixed.weakSkills.some(s => s.skill === 'number'));

const none = evaluateListening(qs, []);
console.log('\n[用例3] 全漏答');
check('0分', none.score === 0, String(none.score));
check('全部标记漏答', none.unanswered.length === 4);

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
