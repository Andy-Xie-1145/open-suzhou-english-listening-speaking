import { normalize, tokenize, splitSentencesLoose } from '../src/rules/text/normalize.ts';
import { evaluate } from '../src/rules/evaluate.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}
console.log('=== normalize 回归测试 ===\n');

// 这些用例曾因正则缺陷而失败：字符类 [^a-z0-9'-s] 被解析成 0x27-0x73 范围，
// 导致 b-k、m 等字母被剥离；\s 写成字面量 s 导致单词被误切。
check('usually 不被切断', JSON.stringify(tokenize('usually is so')) === JSON.stringify(['usually','is','so']), JSON.stringify(tokenize('usually is so')));
check('basketball 不被切断', JSON.stringify(tokenize('I like basketball very much.')) === JSON.stringify(['i','like','basketball','very','much']), JSON.stringify(tokenize('I like basketball very much.')));
check('句首连接词去标点', tokenize('However, I agree.')[0] === 'however', JSON.stringify(tokenize('However, I agree.')));
check('句末标点剥离', tokenize('I agree.')[1] === 'agree', JSON.stringify(tokenize('I agree.')));
check('缩写撇号保留', tokenize("I don't like it.")[1] === "don't", JSON.stringify(tokenize("I don't like it.")));
check('弯引号归一', normalize('\u2018hello\u2019') === "'hello'", normalize('\u2018hello\u2019'));
check('中文标点剥离', !normalize('你好，world').includes('\uff0c'), normalize('你好，world'));

// 连接词漏判回归
const connText = 'First I like it. Also I play with friends. However it is hard. Because I want to be healthy.';
const r = evaluate({ transcript: connText, topic: null, durationMs: 20000 });
check('多连接词正确识别(>=3)', r.checks.connectors.value >= 3, String(r.checks.connectors.value));
check('连接词检查通过', r.checks.connectors.ok, String(r.checks.connectors.value));

// 切句回归
const noPunct = 'first i like sport it is healthy also i play with friends every weekend because it is good for me';
check('无句号可切出多句', splitSentencesLoose(noPunct).length >= 3, String(splitSentencesLoose(noPunct).length));

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
