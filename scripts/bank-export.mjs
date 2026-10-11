// 题库导出：items.jsonl（主库）→ items.json（前端 import）+ manifest.json 统计
import fs from 'node:fs';

const bankDir = new URL('../data/bank/', import.meta.url);
const lines = fs.readFileSync(new URL('items.jsonl', bankDir), 'utf8').trim().split('\n');
const items = lines.map((l) => JSON.parse(l));

fs.writeFileSync(new URL('items.json', bankDir), JSON.stringify(items));

const byType = {};
for (const it of items) byType[it.type] = (byType[it.type] ?? 0) + 1;
const manifestPath = new URL('manifest.json', bankDir);
let manifest = {};
try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { /* new */ }
manifest.total = items.length;
manifest.by_type = byType;
manifest.generated_from = 'data/bank/items.jsonl';
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('exported', items.length, 'by_type', byType);
