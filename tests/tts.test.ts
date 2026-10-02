/**
 * TTS 桥接层 —— 测试（零依赖，用桩运行时）
 *
 * 许可：AGPL-3.0-only
 *
 * 验证重点：脚本分段、音色分配、拼接与换人间隔、降级行为。
 * **不加载真实模型** —— 那需要在浏览器里做，Node 下用桩。
 */

import {
  parseScript,
  assignVoices,
  concatSegments,
  createTtsEngine,
  SPEAKER_GAP_MS,
  type TtsRuntime,
} from '../src/engine/tts.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

console.log('=== TTS 桥接层 · 测试 ===');

/* ---------- 1. 脚本分段 ---------- */
console.log('[1] 对话脚本分段');
const dialogue = [
  'W: Excuse me, could I book a table for four?',
  "M: I am afraid we are full after six.",
  'W: What about five thirty?',
  'M: That sounds fine.',
].join('\n');
const u = parseScript(dialogue);
check('拆出 4 段', u.length === 4, String(u.length));
check('识别说话人 W', u[0].speaker === 'W', u[0].speaker);
check('识别说话人 M', u[1].speaker === 'M', u[1].speaker);
check('去掉说话人前缀', u[0].text.indexOf('Excuse') === 0, u[0].text);
check('记录行号', u[0].lineNo === 1 && u[3].lineNo === 4, u[0].lineNo + '/' + u[3].lineNo);

const u2 = parseScript('W：你好');
check('全角冒号也能识别', u2.length === 1 && u2[0].speaker === 'W', JSON.stringify(u2[0]));

const passage = parseScript('Next Monday is a special day.\nStudents will meet at 8:15.');
check('无标记文本合并为一段', passage.length === 1, String(passage.length));
check('无标记时说话人记为 N', passage[0].speaker === 'N', passage[0].speaker);
check('多行内容被合并', passage[0].text.indexOf('8:15') >= 0, passage[0].text);

check('空输入返回空数组', parseScript('\n\n  \n').length === 0);
/* ---------- 2. 音色分配 ---------- */
console.log('\n[2] 音色分配');
const assigns = assignVoices(u, ['af_a', 'am_a']);
check('每段都有音色', assigns.length === u.length, String(assigns.length));
check('W 与 M 拿到不同音色', assigns[0].voiceId !== assigns[1].voiceId, assigns[0].voiceId + '/' + assigns[1].voiceId);
check('同一说话人音色一致', assigns[0].voiceId === assigns[2].voiceId, assigns[0].voiceId + '/' + assigns[2].voiceId);
check('同一说话人只分配一次', assigns[0].voiceId === assigns[2].voiceId && assigns[0].voiceId === assigns[0].voiceId);
check('无可用音色时返回空', assignVoices(u, []).length === 0);
check('只有一个音色时全用同一', assignVoices(u, ['only']).every(function (a) { return a.voiceId === 'only'; }));

/* ---------- 3. 拼接 ---------- */
console.log('\n[3] 分段拼接');
const sr = 1000; // 便于换算
const parts = [
  { samples: new Float32Array(500).fill(0.5), sampleRate: sr, speaker: 'W' },
  { samples: new Float32Array(500).fill(0.5), sampleRate: sr, speaker: 'M' },
  { samples: new Float32Array(500).fill(0.5), sampleRate: sr, speaker: 'W' },
];
const joined = concatSegments(parts);
const gapSamples = Math.round((SPEAKER_GAP_MS / 1000) * sr);
check('总长 = 三段 + 两次换人间隔', joined.samples.length === 1500 + gapSamples * 2, joined.samples.length + ' vs ' + (1500 + gapSamples * 2));
check('采样率保持', joined.sampleRate === sr);
check('记录了 3 个分段', joined.segments.length === 3);
check('第二段起始含换人间隔', joined.segments[1].startMs === 500 + SPEAKER_GAP_MS, joined.segments[1].startMs + ' vs ' + (500 + SPEAKER_GAP_MS));
check('同说话人相接无间隔', joined.segments[2].startMs === joined.segments[1].endMs + SPEAKER_GAP_MS, joined.segments[2].startMs + ' vs ' + (joined.segments[1].endMs + SPEAKER_GAP_MS));
check('换人间隔处为静音', joined.samples[500] === 0, String(joined.samples[500]));
check('空输入返回空结果', concatSegments([]).samples.length === 0);
/* ---------- 4. 引擎生命周期与降级 ---------- */
console.log('\n[4] 引擎生命周期');

function makeRuntime(voices: string[]): TtsRuntime {
  return {
    voices: function () { return voices; },
    synth: async function (text: string) {
      const n = Math.max(1, text.length * 10);
      const s = new Float32Array(n);
      for (let i = 0; i < n; i++) s[i] = Math.sin(i * 0.1) * 0.3;
      return { samples: s, sampleRate: 16000 };
    },
  };
}

const eng = createTtsEngine({ createRuntime: async () => makeRuntime(['af_a', 'am_a']) });
check('初始状态 idle', eng.status().status === 'idle', eng.status().status);
check('初始未就绪', eng.ready() === false);

const ok = await eng.load();
check('加载返回 true', ok === true);
check('加载后 ready', eng.ready() === true);
check('状态为 ready', eng.status().status === 'ready', eng.status().status);

const buf = await eng.speak(dialogue);
check('speak 产出非空音频', buf.samples.length > 0, String(buf.samples.length));
check('保留 4 个分段', buf.segments.length === 4, String(buf.segments.length));
check('分段说话人正确', buf.segments[0].speaker === 'W' && buf.segments[1].speaker === 'M');
check('重复 load 幂等', (await eng.load()) === true && eng.ready() === true);

const buf2 = await eng.speak(dialogue, { speakerVoice: { W: 'am_a', M: 'af_a' } });
check('可覆盖说话人音色', buf2.segments.length === 4 && buf2.samples.length > 0);

/* ---------- 5. 加载失败降级 ---------- */
console.log('\n[5] 加载失败降级');
const bad = createTtsEngine({
  createRuntime: async function () { throw new Error('网络中断'); },
});
const badOk = await bad.load();
check('加载失败返回 false', badOk === false);
check('状态为 failed', bad.status().status === 'failed', bad.status().status);
check('失败信息含原因', bad.status().message.indexOf('网络中断') >= 0, bad.status().message);
check('失败后仍可查询状态不崩', typeof bad.status().status === 'string');
check('失败后 ready 为 false', bad.ready() === false);

/* ---------- 6. 边界 ---------- */
console.log('\n[6] 边界');
let threwEmpty = false;
try { await eng.speak('   '); } catch { threwEmpty = true; }
check('空材料抛错', threwEmpty === true);

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
