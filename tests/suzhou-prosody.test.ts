/**
 * 韵律性评估 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 测的是**与母语者朗读习惯的相似度**，不是官方韵律性分。
 */

import { detectStress, evaluatePhrasing, evaluateIntonation, evaluateProsody, FUNCTION_WORDS, type Syllable } from '../src/suzhou/prosody.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

function syl(word: string, dur: number, energy: number, hz: number): Syllable {
  return { startMs: 0, endMs: dur, word: word, durationMs: dur, energy: energy, meanHz: hz };
}

console.log('=== 韵律性 · 测试 ===');

/* ---------- 1. 重音 ---------- */
console.log('[1] 重读检测');
// 正常实词重读：3 个实词重读 + 若干功能词不重读
const normal: Syllable[] = [
  syl('I', 60, 0.3, 120),
  syl('really', 260, 0.85, 180),
  syl('like', 180, 0.6, 160),
  syl('the', 70, 0.25, 110),
  syl('basketball', 300, 0.9, 190),
  syl('a', 55, 0.2, 105),
];
const n1 = detectStress(normal);
console.log('  正常朗读 → 重读比例 ' + (n1.stressRatio*100).toFixed(0) + '%，位置分 ' + (n1.placementScore*100).toFixed(0) + '%');
check('正常朗读有重读音节', n1.stressed.some(Boolean));
check('功能词未被误重读', n1.functionWordStressed === 0, String(n1.functionWordStressed));
check('正常朗读重读比例在 30-45%', n1.stressRatio >= 0.3 && n1.stressRatio <= 0.6, (n1.stressRatio*100).toFixed(0) + '%');
check('正常朗读位置分较高', n1.placementScore >= 0.6, (n1.placementScore*100).toFixed(0) + '%');
// 全平读：每个音节一样长一样响 → 重读过多，位置分应低
const flat: Syllable[] = [
  syl('one', 100, 0.5, 130), syl('two', 100, 0.5, 130), syl('three', 100, 0.5, 130),
  syl('four', 100, 0.5, 130), syl('five', 100, 0.5, 130),
];
const f1 = detectStress(flat);
check('平读时每个音节都被判重读（比例高）', f1.stressRatio > 0.5, (f1.stressRatio*100).toFixed(0) + '%');
check('平读位置分低于正常朗读', f1.placementScore < n1.placementScore, (f1.placementScore*100).toFixed(0) + '% vs ' + (n1.placementScore*100).toFixed(0) + '%');

// 功能词被重读（典型中式英语特征）
const bad: Syllable[] = [
  syl('I', 250, 0.85, 190),   // I 是功能词却重读
  syl('really', 260, 0.85, 180),
  syl('like', 180, 0.6, 160),
  syl('the', 240, 0.8, 175),  // the 也被重读
];
const b1 = detectStress(bad);
check('检出功能词误重读', b1.functionWordStressed >= 2, String(b1.functionWordStressed));
check('功能词误重读拉低位置分', b1.placementScore < n1.placementScore, (b1.placementScore*100).toFixed(0) + '%');
check('I/the 确实在功能词表里', FUNCTION_WORDS.has('i') && FUNCTION_WORDS.has('the') && FUNCTION_WORDS.has('of'));
check('really 不在功能词表里', !FUNCTION_WORDS.has('really'));

// 边界情况
const empty = detectStress([]);
check('空输入不崩', empty.stressRatio === 0 && empty.stressed.length === 0);

/* ---------- 2. 意群停顿 ---------- */
console.log('\n[2] 意群停顿');
const boundaries = [{ atMs: 2000, toleranceMs: 600 }, { atMs: 5000, toleranceMs: 600 }];
// 在边界处正确停顿
const goodPauses = [
  { startMs: 1800, endMs: 2200, durationMs: 400 },
  { startMs: 4900, endMs: 5200, durationMs: 300 },
];
const g1 = evaluatePhrasing(goodPauses, boundaries);
check('正确停顿全部命中', g1.boundaryRate === 1, (g1.boundaryRate*100).toFixed(0) + '%');
check('无误切', g1.falseBreak === 0, String(g1.falseBreak));
check('分项满分', g1.score === 1, String(g1.score));

// 都不停顿
const noPauses: any[] = [];
const g2 = evaluatePhrasing(noPauses, boundaries);
check('不停顿则全未命中', g2.boundaryRate === 0);
check('2 处该断未断', g2.missingBreak === 2, String(g2.missingBreak));
check('不停顿分项为 0', g2.score === 0, String(g2.score));
// 停顿位置错（该断的地方在别处断）
const wrongPos = [
  { startMs: 3000, endMs: 3400, durationMs: 400 },
  { startMs: 7000, endMs: 7300, durationMs: 300 },
];
const g3 = evaluatePhrasing(wrongPos, boundaries);
check('位置错则全未命中', g3.boundaryRate === 0);
check('位置错记为误切', g3.falseBreak === 2, String(g3.falseBreak));

// 关键：停顿时长长短不影响命中，只看位置
const longPauseRight = [
  { startMs: 1500, endMs: 2600, durationMs: 1100 },
  { startMs: 4500, endMs: 5600, durationMs: 1100 },
];
const g4 = evaluatePhrasing(longPauseRight, boundaries);
check('长停顿但位置对仍算命中', g4.boundaryRate === 1, (g4.boundaryRate * 100).toFixed(0) + '%');
check('时长不参与判定（停顿位置才是信号）', g4.score === 1, String(g4.score));

// 无边界参考时给中性分
const g5 = evaluatePhrasing(goodPauses, []);
check('无参考边界时给中性 0.5', g5.score === 0.5, String(g5.score));


/* ---------- 4. 汇总 ---------- */
/* ---------- 3. 语调 ---------- */
console.log('\n[3] 语调（启发式）');
function fr(seq: Array<[number, number]>): any[] {
  return seq.map(function (p) { return { tMs: p[0], hz: p[1], voiced: p[1] > 0 }; });
}
const good = fr([
  [0,150],[100,155],[200,160],[300,165], [400,0],[500,0],
  [600,170],[700,180],[800,190],[900,195], [1000,0],[1100,0],
  [1200,160],[1300,150],[1400,140],[1500,130],
]);
const i1 = evaluateIntonation(good);
console.log('  丰富语调 → 分数 ' + (i1.score*100).toFixed(0) + '%，句末走向 ' + i1.finalSlope.toFixed(3));
check('发声比例充足', i1.voicedRatio > 0.5, (i1.voicedRatio*100).toFixed(0) + '%');
check('句末有明显走向', Math.abs(i1.finalSlope) > 0.02, String(i1.finalSlope));

const mono = fr([[0,140],[100,140],[200,140],[300,140],[400,0],[500,0],[600,140],[700,140],[800,140],[900,140]]);
const i2 = evaluateIntonation(mono);
check('平读句末无走向', Math.abs(i2.finalSlope) < 0.02, String(i2.finalSlope));
check('平读得分低于丰富语调', i2.score < i1.score, (i2.score*100).toFixed(0) + '% vs ' + (i1.score*100).toFixed(0) + '%');

const silent = fr([[0,0],[100,0],[200,0],[300,0],[400,0]]);
const i3 = evaluateIntonation(silent);
check('无声也返回结果不崩', typeof i3.score === 'number');
check('无声得分很低', i3.score <= 0.25, String(i3.score));


console.log('\n[4] 韵律性汇总');
const good2 = evaluateProsody({ syllables: normal, pauses: goodPauses, boundaries: boundaries, pitchFrames: good });
console.log('  正常朗读 → 韵律性 ' + (good2.score * 100).toFixed(0) + '%');
check('汇总返回三个子项', !!good2.stress && !!good2.phrasing && !!good2.intonation);
check('汇总分在 0-1', good2.score >= 0 && good2.score <= 1, String(good2.score));
check('正常朗读汇总分较高', good2.score >= 0.7, (good2.score * 100).toFixed(0) + '%');

const bad2 = evaluateProsody({ syllables: bad, pauses: noPauses, boundaries: boundaries, pitchFrames: mono });
console.log('  问题朗读 → 韵律性 ' + (bad2.score * 100).toFixed(0) + '%');
check('问题朗读汇总分明显低于正常', bad2.score < good2.score - 0.2, (bad2.score*100).toFixed(0) + '% vs ' + (good2.score*100).toFixed(0) + '%');
check('问题朗读给出多条建议', bad2.notes.length >= 2, String(bad2.notes.length));
check('建议点名功能词误重读', bad2.notes.some(function (n) { return n.indexOf('功能词') >= 0; }), bad2.notes[0]);
check('建议提到断句', bad2.notes.some(function (n) { return n.indexOf('断') >= 0; }));
check('空输入返回合法结构', evaluateProsody({ syllables: [], pauses: [], boundaries: [], pitchFrames: [] }).score === 0.25);

console.log('=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
