/**
 * 全局措辞红线 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * ## 为什么单独一个文件
 *
 * 之前的扫描只覆盖 4 个文件（reading-section / spec-config / disclaimer / SPEC），
 * 范围窄到 src/ui 下所有用户可见文案、src/rules 全部、README 与 ARCHITECTURE 都在扫描之外。
 * 于是「不是考场估分」这种话长期留在界面上，而测试一直是绿的 ——
 * 红线不是不存在，是靠一张不完整的清单保证的。
 *
 * 本文件把扫描范围提到「src 全部 + 全部对外文档」，让清单与红线本身对齐。
 *
 * ## 例外
 *
 * - research/ 是历史调研记录，允许原样引用被禁表述，不扫
 * - data/ 是语料数据，字段名不面向用户，不扫
 * - spec/ 的「禁止条款」本身要列出这些词，属正当引用
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** 把近似说成真实的表述。一旦出现就是在误导考生。 */
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
];

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

/**
 * 递归收集文件。**目录不存在时返回空数组，不抛。**
 *
 * 一个会因为「目录被删了」而崩掉的扫描器，比没有扫描器更糟 ——
 * 它会让人误以为红线已经检查过了。
 */
function walk(dir: string, out: string[] = []): string[] {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    const p = join(dir, name);
    let isDir = false;
    try { isDir = statSync(p).isDirectory(); } catch { continue; }
    if (isDir) walk(p, out);
    else if (p.endsWith('.ts') || p.endsWith('.css') || p.endsWith('.html')) out.push(p);
  }
  return out;
}

const targets: string[] = [
  ...walk('src'),
  ...walk('functions'),
  'README.md',
  'ARCHITECTURE.md',
  'index.html',
];
for (const d of ['docs', 'spec']) {
  try {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isFile() && p.endsWith('.md')) targets.push(p);
    }
  } catch { /* 目录不存在就跳过 */ }
}

console.log('=== 措辞红线 · 扫描 ' + targets.length + ' 个文件 ===');

/** spec 的禁止条款本身要列出这些词，属正当引用 */
function isRedlineQuote(path: string, text: string): boolean {
  // 路径分隔符要归一化：Windows 下 join() 产生的是反斜杠，
  // 直接 startsWith('spec/') 会恒为 false，豁免整个失效。
  const norm = path.replace(/\\/g, '/');
  if (!norm.startsWith('spec/')) return false;
  return /禁止|不得|红线/.test(text);
}

const hits: string[] = [];
for (const path of targets) {
  let text = '';
  try { text = readFileSync(path, 'utf8'); } catch { continue; }
  if (isRedlineQuote(path, text)) continue;
  for (const phrase of BANNED) {
    if (!text.includes(phrase)) continue;
    // 逐行报告，方便直接定位
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(phrase)) {
        hits.push(path + ':' + (i + 1) + '  「' + phrase + '」  ' + lines[i].trim().slice(0, 70));
      }
    }
  }
}

if (hits.length > 0) {
  console.log('\n  违规 ' + hits.length + ' 处：');
  for (const h of hits) console.log('    ' + h);
}
check('src / 对外文档 无禁用表述', hits.length === 0, hits.length + ' 处');

// 反向自检：扫描器本身不能是坏的
const sample = { path: 'x.md', text: '这不是估分' };
check('扫描器对违规样例确实报警', BANNED.some(function (p) { return sample.text.includes(p); }));
check('扫描器对正常文本不误报', !BANNED.some(function (p) { return '能力诊断，不是分数预测'.includes(p); }));
check('目录不存在时扫描器不崩（不存在的路径应被静默跳过）', walk('这个目录不存在').length === 0);

console.log('\n  通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);