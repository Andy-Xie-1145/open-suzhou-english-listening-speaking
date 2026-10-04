/**
 * 听力音频计划 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点：音色分配、时长估算、指纹失效判定、开考前置清单。
 */

import { readFileSync } from 'node:fs';
import {
  AUDIO_EXT,
  MP3_BYTES_PER_SECOND,
  planSegments,
  planMaterial,
  planAll,
  estimateMs,
  fingerprintOf,
  audioUrl,
  audioFileName,
  toManifest,
  staleEntries,
  prefetchFor,
  DEFAULT_VOICES,
  WORDS_PER_SECOND,
  AUDIO_SEGMENT_GAP_MS,
} from '../src/suzhou/listening-audio.ts';
import { createListeningBank } from '../src/suzhou/listening-bank.ts';
import type { PaperListeningGroup } from '../src/suzhou/paper.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const SCRIPT = [
  { speaker: 'W' as const, text: 'Excuse me, where is the reading room?' },
  { speaker: 'M' as const, text: 'It is on the second floor.' },
  { speaker: 'N' as const, text: 'A short narration line here.' },
];

/* ---------- 1. 音色分配 ---------- */
console.log('\n[1] 音色分配');
const segs = planSegments(SCRIPT);
check('每段都拆开了', segs.length === 3, String(segs.length));
check('女声用 af_heart', segs[0].voiceId === 'af_heart', segs[0].voiceId);
check('男声用 am_michael', segs[1].voiceId === 'am_michael', segs[1].voiceId);
check('旁白用女声（与第一节一致）', segs[2].voiceId === 'af_heart', segs[2].voiceId);
check('下标连续', segs.map(function (s) { return s.index; }).join(',') === '0,1,2');
check('不用 am_adam（听感 Grade F+）', !Object.values(DEFAULT_VOICES).includes('am_adam'),
  Object.values(DEFAULT_VOICES).join(','));
check('空白台词被丢掉', planSegments([{ speaker: 'W', text: '   ' }]).length === 0);
const custom = planSegments(SCRIPT, { W: 'af_bella', M: 'am_x', N: 'af_bella' });
check('音色可覆盖', custom[0].voiceId === 'af_bella' && custom[1].voiceId === 'am_x');

/* ---------- 2. 时长估算 ---------- */
console.log('\n[2] 时长估算');
const same = estimateMs(planSegments([
  { speaker: 'W', text: 'one two three four five six seven eight' },
  { speaker: 'W', text: 'nine ten eleven twelve' },
]));
check('同一说话人之间不插静音', same === Math.round(12 / WORDS_PER_SECOND * 1000), String(same));
const diff = estimateMs(planSegments([
  { speaker: 'W', text: 'one two three four five six seven eight' },
  { speaker: 'M', text: 'nine ten eleven twelve' },
]));
check('换说话人插一段静音', diff - same === AUDIO_SEGMENT_GAP_MS, String(diff - same));
check('空脚本估 0', estimateMs([]) === 0);
const twelve = estimateMs(planSegments([{ speaker: 'N', text: 'one two three four five six seven eight nine ten eleven twelve' }]));
check('12 个词按语速折算', Math.abs(twelve - Math.round(12 / WORDS_PER_SECOND * 1000)) <= 1, String(twelve));

/* ---------- 3. 指纹 ---------- */
console.log('\n[3] 指纹');
const f1 = fingerprintOf(['a', 'b']);
const f2 = fingerprintOf(['a', 'b']);
const f3 = fingerprintOf(['a', 'c']);
check('同内容指纹稳定', f1 === f2, f1 + ' vs ' + f2);
check('改内容指纹变', f1 !== f3, f1 + ' vs ' + f3);
check('定长十六进制', /^[0-9a-f]{8}$/.test(f1), f1);
check('分隔符防止拼接歧义', fingerprintOf(['ab', 'c']) !== fingerprintOf(['a', 'bc']));

/* ---------- 4. 路径 ---------- */
console.log('\n[4] 产物路径');
check('文件名带 id 与扩展名', audioFileName('lsq-01', 'mp3') === 'lsq-01.mp3', audioFileName('lsq-01', 'mp3'));
check('URL 在 audio/listening 下', audioUrl('lsq-01', 'mp3') === 'audio/listening/lsq-01.mp3', audioUrl('lsq-01', 'mp3'));
check('扩展名可切换', audioUrl('lsq-01', 'wav') === 'audio/listening/lsq-01.wav');

/* ---------- 5. 真实题库 ---------- */
console.log('\n[5] 真实题库');
const bank = createListeningBank(JSON.parse(readFileSync('data/listening-materials.json', 'utf8')));
const plans = planAll(bank.all, { ext: 'mp3' });
check('每段材料都有一条计划', plans.length === bank.all.length, String(plans.length));
check('每条计划都有分段', plans.every(function (p) { return p.segments.length > 0; }));
check('台词与题库一致', plans.every(function (p) {
  const m = bank.all.find(function (x) { return x.id === p.materialId; });
  return !!m && m.questions.length === m.groupSize;
}));
check('空台词会抛错', (() => {
  try { planMaterial({ id: 'x', kind: 'dialogue', title: '', script: [], questions: [], groupSize: 0, difficulty: 1 }); return false; }
  catch { return true; }
})());

const totalMs = plans.reduce(function (a, p) { return a + p.estimatedMs; }, 0);
const totalBytes = plans.reduce(function (a, p) { return a + p.estimatedBytes; }, 0);
console.log('  估算：' + (totalMs / 1000).toFixed(1) + ' 秒音频，' + (totalBytes / 1048576).toFixed(2) + ' MB（mp3@64k）');
check('音频总时长在 2–6 分钟量级（听力段 12 分钟，材料播 2 遍）',
  totalMs > 120000 && totalMs < 360000, String(totalMs));
console.log('  对照真实渲染：实际 193.2s（13 段 8.84 MB，24kHz 单声道）');
check('估算与实测差在 25% 以内', Math.abs(totalMs - 193200) / 193200 < 0.25, String(totalMs));
check('音频总体积远小于任何模型（对比音素模型 303 MB）', totalBytes < 5 * 1048576, String(totalBytes));

/* ---------- 6. manifest 与失效判定 ---------- */
console.log('\n[6] manifest');
const manifest = toManifest(plans);
check('manifest 版本为 1', manifest.version === 1);
check('manifest 条目数与计划一致', manifest.entries.length === plans.length);
check('manifest 记了音色映射', manifest.voiceMap.W === 'af_heart' && manifest.voiceMap.M === 'am_michael');
check('无产物时全部待渲', staleEntries(plans, null, {}).length === plans.length);
const fresh: Record<string, { bytes: number }> = {};
for (const p of plans) fresh[p.materialId] = { bytes: 1000 };
check('产物齐全且指纹一致时不重渲', staleEntries(plans, manifest, fresh).length === 0,
  String(staleEntries(plans, manifest, fresh).length));
check('缺一个产物就只渲一个', staleEntries(plans, manifest, { ...fresh, 'lsq-05': {} }).length === 1);
check('改了台词指纹就变', (() => {
  const edited = plans.map(function (p) {
    return p.materialId === 'lsq-01'
      ? { ...p, fingerprint: fingerprintOf(['changed']) }
      : p;
  });
  const stale = staleEntries(edited, manifest, fresh);
  return stale.length === 1 && stale[0].materialId === 'lsq-01';
})());
check('只改选项不重渲（指纹只取台词与音色）', (() => {
  const qm = JSON.parse(readFileSync('data/listening-materials.json', 'utf8'));
  const list = qm.materials ?? qm;
  for (const m of list) { m.questions[0].prompt = '改过的题干'; }
  const b2 = createListeningBank({ materials: list });
  const p2 = planAll(b2.all, { ext: 'mp3' });
  return staleEntries(p2, manifest, fresh).length === 0;
})());

/* ---------- 6.5 扩展名必须对齐（真实踩过的坑） ---------- */
console.log('\n[6.5] 运行时与构建产物扩展名一致');
// 曾出现过：运行时 buildSteps 默认取 .mp3，而构建脚本默认产出 .wav，
// 结果音频全部 404。这里把两个默认值钉在一起，防止再次跑偏。

check('audioUrlFor 默认 mp3', audioUrl('lsq-01') === 'audio/listening/lsq-01.mp3', audioUrl('lsq-01'));
check('MP3 字节率与 64kbps 一致', MP3_BYTES_PER_SECOND === 8000, String(MP3_BYTES_PER_SECOND));
check('唯一默认值 AUDIO_EXT === mp3', AUDIO_EXT === 'mp3', AUDIO_EXT);
check('无参调用得到 mp3 路径', audioUrl('lsq-01') === 'audio/listening/lsq-01.mp3');
check('估算体积在 2MB 内（64kbps 下 193 秒约 1.5MB）', totalBytes < 2 * 1048576, String(totalBytes));

/* ---------- 7. 开考前置清单 ---------- */
console.log('\n[7] 开考前置清单');
const groups: PaperListeningGroup[] = bank.all.slice(0, 4).map(function (m) {
  return { material: m, questions: m.questions.slice(), budgetMs: 1000 };
});
const pf = prefetchFor(groups);
check('每段材料一条 URL', pf.urls.length === 4, String(pf.urls.length));
check('URL 不重复', new Set(pf.urls).size === pf.urls.length, pf.urls.join(','));
check('URL 指向音频目录', pf.urls.every(function (u) { return u.startsWith('audio/listening/'); }));
check('估出体积与时长', pf.estimatedBytes > 0 && pf.estimatedMs > 0);
check('同一份卷重复调用结果稳定', JSON.stringify(prefetchFor(groups)) === JSON.stringify(pf));
check('空卷给空清单', prefetchFor([]).urls.length === 0);

console.log('\n[8] 汇总');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);