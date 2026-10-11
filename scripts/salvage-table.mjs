// 拯救 listening.table.3blank：每空 3 个独立选项（正确 + 2 个干扰项），各自独立作答。
import fs from 'node:fs';

const path = new URL('../data/bank/items.jsonl', import.meta.url);
const lines = fs.readFileSync(path, 'utf8').trim().split('\n');
let fixed = 0;
const out = lines.map((l) => {
  const o = JSON.parse(l);
  if (o.type !== 'listening.table.3blank') return l;
  fixed++;
  // wordBank: "A. xxx\nB. yyy..." → {A: 'xxx', ...}
  const bank = {};
  for (const line of String(o.wordBank).split('\n')) {
    const m = line.trim().match(/^([A-E])[.、:：]\s*(.+)$/);
    if (m) bank[m[1]] = m[2].trim();
  }
  // answers: "① A　② D　③ B"
  const pairs = [...String(o.answers).matchAll(/([①②③④])\s*([A-E])/g)];
  const circleIndex = { '①': 0, '②': 1, '③': 2, '④': 3 };
  const allTexts = Object.keys(bank).map((k) => bank[k]);
  const questions = pairs.map((p, i) => {
    const correctText = bank[p[2]];
    const pool = allTexts.filter((t) => t !== correctText);
    const ds = [pool[(i * 2) % pool.length], pool[(i * 2 + 1) % pool.length]];
    const opts = [correctText, ...ds];
    const options = {};
    const labels = ['A', 'B', 'C'];
    opts.forEach((t, j) => { options[labels[j]] = t; });
    return {
      n: i + 1,
      question: '表中 ' + p[1] + ' 应填什么？',
      options: options,
      answer: 'A',
    };
  });
  delete o.wordBank;
  delete o.answers;
  o.questions = questions;
  return JSON.stringify(o);
});
fs.writeFileSync(path, out.join('\n') + '\n');
console.log('fixed', fixed);
