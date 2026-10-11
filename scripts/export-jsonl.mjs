// export-jsonl.mjs —— 把 data/item-bank/**/*.md 导出成 JSONL 主库。
// 只读源材料，不改任何 md。
// 硬规矩：任何一个题块解析不出内容，立即中止并报出文件与块号——解析失败绝不静默跳过。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BANK = path.join(ROOT, 'data', 'item-bank');

const TYPE = {
  A: 'listening.dialogue.1q',
  B: 'listening.dialogue.2q',
  C: 'listening.passage.5q',
  D: 'listening.table.3blank',
};

const problems = [];
const md5 = s => crypto.createHash('md5').update(s, 'utf8').digest('hex');

const batchFiles = [
  ...fs.readdirSync(BANK).filter(f => f.endsWith('.md') && !/^(INDEX|REVIEW-RUBRIC)/.test(f)).map(f => ({ name: f, dir: BANK })),
  ...fs.readdirSync(path.join(BANK, 'prod')).filter(f => f.endsWith('.md') && !/\.meta\.md$/.test(f)).map(f => ({ name: f, dir: path.join(BANK, 'prod') })),
];

// 题块按空行-tolerant 的方式解析：选项行与 Answer 之间允许一个空行
const Q_RE = /\*\*(?:Question|Q(\d))\*\*\n([^\n]+)\n((?:- [A-D]\..*\n)+)\n?\*\*Answer\*\*\s*([A-D])/g;

function parseFile(name, dir) {
  const full = path.join(dir, name);
  const raw = fs.readFileSync(full, 'utf8');
  const rel = path.relative(ROOT, full).split(path.sep).join('/');
  const cls = name[0];
  const batch = name.replace(/\.md$/, '');
  const out = [];
  const blocks = raw.split(/^## /m).slice(1);

  for (const b of blocks) {
    const hm = b.match(/^([A-E][0-9A-Za-z-]*?)\s+(.+)$/m);
    if (!hm) { problems.push(`${rel}: 有题块但取不到标题`); continue; }
    const id = hm[1], title = hm[2].trim();
    if (!new RegExp('^' + id + '\\b').test(b)) problems.push(`${rel}: 块号与标题不符 ${id}`);

    if (cls === 'E') {
      if (b.includes('话题题目')) {
        const q = b.match(/\*\*话题题目\*\*：([^\n]+)/);
        const a = b.match(/\*\*参考作答\*\*：([^\n]+)/);
        const pts = [...b.matchAll(/^- (.+)$/gm)].map(x => x[1]);
        if (!q || !a || !pts.length) { problems.push(`${rel} ${id}: 话题简述字段缺失`); continue; }
        out.push({ id, batch, type: 'speaking.topic', title, prompt: q[1].trim(),
          modelAnswer: a[1].trim(), rubric: pts, source_md: rel, file_md5: md5(raw) });
      } else {
        const sc = b.match(/\*\*情景提示\*\*：([^\n]+)/);
        const qs = [...b.matchAll(/\*\*Q(\d)\*\*\n([^\n]+)/g)].map(x => ({ n: +x[1], q: x[2].trim() }));
        const ks = [...b.matchAll(/\*\*考点\*\*：([^\n]+)/g)].map(x => x[1].trim());
        if (!sc || qs.length !== 2 || ks.length !== 2) {
          problems.push(`${rel} ${id}: 情景问答 期望 情景1+Q2+考点2，实得 情景${sc?1:0}+Q${qs.length}+考点${ks.length}`); continue; }
        out.push({ id, batch, type: 'speaking.qa', title, scenario: sc[1].trim(),
          questions: qs, points: ks, source_md: rel, file_md5: md5(raw) });
      }
      continue;
    }

    if (cls === 'D') {
      const genre = b.match(/\*\*(Passage|Dialogue)\*\*/)?.[1];
      const table = b.match(/\*\*Table\*\*\n([\s\S]*?)\n\*\*/)?.[1]?.trim();
      const bank = b.match(/\*\*Word Bank\*\*\n([\s\S]*?)\n\*\*/)?.[1]?.trim();
      const ans = b.match(/\*\*Answers\*\*\s*([^\n]+)/)?.[1]?.trim();
      const mat = b.match(/\*\*(?:Passage|Dialogue)\*\*\n([\s\S]*?)\n\*\*Table\*\*/)?.[1]?.trim();
      if (!genre || !table || !bank || !ans || !mat) { problems.push(`${rel} ${id}: D 类字段缺失`); continue; }
      out.push({ id, batch, type: TYPE.D, title, genre, material: mat, table, wordBank: bank,
        answers: ans, source_md: rel, file_md5: md5(raw) });
      continue;
    }

    // A / B / C
    const genre = b.match(/\*\*(Passage|Dialogue)\*\*/)?.[1];
    const qIdx = b.indexOf('**Question**') >= 0 ? b.indexOf('**Question**') : b.indexOf('**Q1**');
    const material = (qIdx >= 0 ? b.slice(0, qIdx) : b)
      .replace(/^[^\n]*\n/, '').replace(/\*\*(Passage|Dialogue)\*\*/, '').trim();
    Q_RE.lastIndex = 0;
    const qs = [...b.matchAll(Q_RE)].map(x => ({
      n: x[1] ? +x[1] : null, question: x[2].trim(),
      options: Object.fromEntries([...x[3].matchAll(/- ([A-D])\. (.*)/g)].map(y => [y[1], y[2].trim()])),
      answer: x[4] }));
    const expect = cls === 'A' ? 1 : cls === 'B' ? 2 : 5;
    if (!genre || !material) { problems.push(`${rel} ${id}: 材料缺失`); continue; }
    if (qs.length !== expect) { problems.push(`${rel} ${id}: 期望 ${expect} 题，实得 ${qs.length}`); continue; }
    if (qs.some(q => Object.keys(q.options).length !== 4)) { problems.push(`${rel} ${id}: 有题不是 4 个选项`); continue; }
    out.push({ id, batch, type: TYPE[cls], title, genre, material, questions: qs,
      source_md: rel, file_md5: md5(raw) });
  }
  return out;
}

const items = [];
for (const f of batchFiles) items.push(...parseFile(f.name, f.dir));

if (problems.length) {
  console.error('解析问题 ' + problems.length + ' 处：');
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

const byType = {};
for (const it of items) byType[it.type] = (byType[it.type] ?? 0) + 1;

fs.mkdirSync(path.join(ROOT, 'data', 'bank'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'bank', 'items.jsonl'),
  items.map(o => JSON.stringify(o)).join('\n') + '\n', 'utf8');
fs.writeFileSync(path.join(ROOT, 'data', 'bank', 'manifest.json'),
  JSON.stringify({
    generated_from: 'data/item-bank/**/*.md',
    note: 'JSONL 是主库；md 是审阅流水线用的源材料，两者必须一致。改 md 后重跑 npm run bank:export。',
    total: items.length,
    by_type: byType,
    batches: batchFiles.map(f => f.name.replace(/\.md$/, '')).sort(),
  }, null, 2), 'utf8');

console.log('total =', items.length);
console.log(JSON.stringify(byType, null, 2));