/**
 * 测试运行器 —— 按文件发现，不再维护一份手写清单
 *
 * 许可：AGPL-3.0-only
 *
 * ## 为什么要改
 *
 * 原来 `test:all` 是一长串手写的测试文件名。这份清单已经**至少两次**悄悄漏项：
 *
 *   - suzhou-paper / suzhou-prosody / tts 长期没跑过（这就是编排 bug 反复漏过的原因）
 *   - 后来新增的 5 个套件又没被注册进去，而 test:all 仍然是绿的
 *
 * 一份需要手工同步的清单，本身就是缺陷来源。所以改成从 tests/ 目录自动发现。
 *
 * ## 用法
 *
 *     node scripts/run-tests.mjs            跑全部
 *     node scripts/run-tests.mjs suzhou-    只跑文件名含 suzhou- 的
 *
 * 任一套件失败即以非零码退出，与原来行为一致。
 */

import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const filter = process.argv[2] ?? '';
const dir = 'tests';

const files = readdirSync(dir)
  .filter(function (n) { return n.endsWith('.test.ts'); })
  .filter(function (n) { return !filter || n.includes(filter); })
  .sort();

if (files.length === 0) {
  console.error('没有找到匹配的测试文件' + (filter ? '（过滤词：' + filter + '）' : ''));
  process.exit(1);
}

console.log('运行 ' + files.length + ' 个测试套件' + (filter ? '（过滤词：' + filter + '）' : ''));
console.log('');

let failed = 0;
const failedNames = [];
const started = Date.now();

for (const f of files) {
  const r = spawnSync(process.execPath, ['--experimental-strip-types', join(dir, f)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  const ok = r.status === 0;
  if (!ok) {
    failed++;
    failedNames.push(f);
  }
  const out = (r.stdout || '') + (r.stderr || '');
  const summary = out.split(/\r?\n/)
    .filter(function (l) { return /通过 \d+ \/ 失败|=== 结果:|passed, \d+ failed/.test(l); })
    .pop() || '';
  console.log((ok ? '  PASS  ' : '  FAIL  ') + f + (summary ? '   ' + summary.trim() : ''));
  if (!ok) {
    const detail = out.split(/\r?\n/).filter(function (l) { return /FAIL|Error/.test(l); });
    for (const d of detail.slice(0, 8)) console.log('          ' + d.trim().slice(0, 140));
  }
}

const secs = ((Date.now() - started) / 1000).toFixed(1);
console.log('');
console.log(files.length + ' 个套件，失败 ' + failed + ' 个，用时 ' + secs + 's');
if (failed > 0) {
  console.log('失败：' + failedNames.join(', '));
  process.exit(1);
}
