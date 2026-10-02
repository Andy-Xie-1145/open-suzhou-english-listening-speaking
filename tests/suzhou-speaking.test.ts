/**
 * 口语后置处理 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * 核心断言：**考试中存录音时绝不会调用转写或评分**。
 * 这正是本次改动的目的，所以单独用「调用次数 = 0」钉死。
 */

import {
  initialSpeaking,
  startRecording,
  cancelRecording,
  putClip,
  setText,
  setScore,
  fail as markFailed,
  pendingKinds,
  allDone,
  answeredKinds,
  unansweredKinds,
  memoryBytes,
  processAll,
  releaseClip,
  releaseAllClips,
  summarize,
  SPEAKING_KINDS,
  type SpeakingSession,
  type RecordedClip,
} from '../src/suzhou/speaking-session.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

function clip(ms = 1000): RecordedClip {
  return {
    samples: new Float32Array(16000 * (ms / 1000)).fill(0.1),
    sampleRate: 16000,
    durationMs: ms,
  };
}

/* ---------- 1. 初始状态 ---------- */
console.log('\n[1] 初始状态');
const s0 = initialSpeaking();
check('三题都在', SPEAKING_KINDS.length === 3 && SPEAKING_KINDS.join(',') === 'reading,qa,topic');
check('初始没有分', SPEAKING_KINDS.every(function (k) { return s0.score[k] === null; }));
check('初始没有录音', SPEAKING_KINDS.every(function (k) { return !s0.clips[k]; }));
check('初始没有待处理', pendingKinds(s0).length === 0);
check('初始视为全部处理完', allDone(s0));
check('初始三题都未作答', unansweredKinds(s0).length === 3, String(unansweredKinds(s0).length));
check('初始不占内存', memoryBytes(s0) === 0);

/* ---------- 2. 考试中只录音 ---------- */
console.log('\n[2] 考试中只录音，不转写不评分');
let calls = 0;
const spyTranscribe = async (): Promise<string> => { calls++; return 'Hello'; };
const spyScore = (): number => { calls++; return 9; };

let s: SpeakingSession = startRecording(s0, 'reading');
check('进入录音中', s.phase.reading === 'recording');
s = putClip(s, 'reading', clip(3000));
check('存下录音', !!s.clips.reading);
check('状态是「已录音待处理」', s.phase.reading === 'recorded', s.phase.reading);
check('**没有调用转写或评分**', calls === 0, '调用了 ' + calls + ' 次');
check('还没有分数', s.score.reading === null);
check('还没有文本', s.text.reading === '');

s = putClip(s, 'qa', clip(2000));
s = putClip(s, 'topic', clip(4000));
check('三题都录完', answeredKinds(s).length === 3, String(answeredKinds(s).length));
check('仍未作答 0 题', unansweredKinds(s).length === 0);
check('待处理 3 题', pendingKinds(s).length === 3, String(pendingKinds(s).length));
check('**仍然没有调用转写或评分**', calls === 0, '调用了 ' + calls + ' 次');
check('内存已占用', memoryBytes(s) > 0, String(memoryBytes(s)));

/* ---------- 3. 空录音被丢弃 ---------- */
console.log('\n[3] 空录音');
const emptyPut = putClip(initialSpeaking(), 'qa', clip(0));
check('空 clip 不入库', !emptyPut.clips.qa);
check('空 clip 回到 idle', emptyPut.phase.qa === 'idle', emptyPut.phase.qa);
const nullPut = putClip(initialSpeaking(), 'qa', null as unknown as RecordedClip);
check('null clip 不炸', !nullPut.clips.qa);

/* ---------- 4. 交卷后一次性处理 ---------- */
console.log('\n[4] 交卷后一次性处理');
const progress: string[] = [];
const out = await processAll(s, {
  transcribe: spyTranscribe,
  score: spyScore,
  onProgress: function (k) { progress.push(k); },
});
check('三题都转写了', calls >= 6, String(calls));
check('进度回调三次', progress.length === 3, String(progress.length));
check('三题都出分', SPEAKING_KINDS.every(function (k) { return out.score[k] === 9; }), JSON.stringify(out.score));
check('三题状态都是 scored', SPEAKING_KINDS.every(function (k) { return out.phase[k] === 'scored'; }), JSON.stringify(out.phase));
check('转写文本已回填', SPEAKING_KINDS.every(function (k) { return out.text[k] === 'Hello'; }));
check('处理完没有待办', pendingKinds(out).length === 0);
check('**处理完即释放内存**', memoryBytes(out) === 0, String(memoryBytes(out)));
check('clip 已从内存移除', SPEAKING_KINDS.every(function (k) { return !out.clips[k]; }));

/* ---------- 5. 失败降级 ---------- */
console.log('\n[5] 单题失败不阻断其余');
// 三段用不同时长，这样 mock 能只让其中一段失败
const mixed = putClip(
  putClip(putClip(initialSpeaking(), 'reading', clip(1000)), 'qa', clip(2000)),
  'topic', clip(3000),
);
const r2 = await processAll(mixed, {
  transcribe: async function (x) {
    if (x.length === 16000) throw new Error('模型没加载');
    return 'ok';
  },
  score: function () { return 8; },
});
check('转写失败的那题退化为手动', r2.phase.reading === 'manual', r2.phase.reading);
check('失败原因有记录', (r2.errors.reading ?? '').indexOf('转写失败') >= 0, r2.errors.reading ?? '');
check('其余两题照常给分', r2.score.qa === 8 && r2.score.topic === 8, JSON.stringify(r2.score));
check('失败题不占内存', !r2.clips.reading && memoryBytes(r2) === 0);
check('summarize 把它列进待补', summarize(r2).needsManual.join(',') === 'reading', summarize(r2).needsManual.join(','));

const blankText = await processAll(initialSpeaking(), {
  transcribe: async () => '   ',
  score: function () { return 5; },
});
const bs = putClip(initialSpeaking(), 'qa', clip());
const blankOut = await processAll(bs, { transcribe: async () => '  ', score: () => 5 });
check('转写为空也算失败并给提示', blankOut.phase.qa === 'manual', blankOut.phase.qa);
check('提示可执行', (blankOut.errors.qa ?? '').indexOf('手动') >= 0, blankOut.errors.qa ?? '');

const scoreThrows = await processAll(bs, {
  transcribe: async () => 'text',
  score: function () { throw new Error('规则异常'); },
});
check('评分抛错也退化为手动', scoreThrows.phase.qa === 'manual', scoreThrows.phase.qa);
check('评分失败原因有记录', (scoreThrows.errors.qa ?? '').indexOf('评分失败') >= 0, scoreThrows.errors.qa ?? '');
check('但文本已回填可手改', scoreThrows.text.qa === 'text');

/* ---------- 6. 手动路径 ---------- */
console.log('\n[6] 手动路径');
let ms = setText(initialSpeaking(), 'topic', 'I like playing basketball very much.');
ms = setScore(ms, 'topic', 7);
check('手写也能出分', ms.score.topic === 7);
check('手写算已作答', answeredKinds(ms).join(',') === 'topic');
check('未作答只有两题', unansweredKinds(ms).length === 2);
ms = setScore(ms, 'topic', null);
check('评不出分落回 manual', ms.phase.topic === 'manual');

/* ---------- 7. 取消录音 ---------- */
console.log('\n[7] 取消录音');
let c = startRecording(initialSpeaking(), 'reading');
c = cancelRecording(c, 'reading');
check('取消后回 idle', c.phase.reading === 'idle', c.phase.reading);
const withClip = putClip(initialSpeaking(), 'reading', clip());
c = cancelRecording(startRecording(withClip, 'reading'), 'reading');
check('取消时已有录音则保持「已录音」', c.phase.reading === 'recorded', c.phase.reading);

/* ---------- 8. 释放 ---------- */
console.log('\n[8] 释放');
let keep = putClip(putClip(initialSpeaking(), 'reading', clip()), 'qa', clip());
keep = releaseClip(keep, 'reading');
check('单题释放', !keep.clips.reading && !!keep.clips.qa);
keep = releaseAllClips(keep);
check('全部释放', memoryBytes(keep) === 0);

/* ---------- 9. 汇总 ---------- */
console.log('\n[9] 汇总');
const fin = await processAll(
  putClip(putClip(putClip(initialSpeaking(), 'reading', clip()), 'qa', clip()), 'topic', clip()),
  { transcribe: async () => 'x', score: function (k) { return k === 'topic' ? 4.5 : 3; } },
);
const sum = summarize(fin);
check('总分 10.5', sum.total === 10.5, String(sum.total));
check('逐题分可查', sum.perKind.reading === 3 && sum.perKind.qa === 3 && sum.perKind.topic === 4.5);
check('三题都作答', sum.answered.length === 3);
check('没有待补', sum.needsManual.length === 0);
check('结算后不占内存', sum.memoryBytes === 0);
const partial = setScore(
  setScore(setText(setText(initialSpeaking(), 'reading', 'aaa'), 'qa', 'bbb'), 'reading', 2.5),
  'qa', 3,
);
const partSum = summarize(partial);
check('部分作答也汇总', partSum.total === 5.5 && partSum.answered.length === 2 && partSum.unanswered.length === 1,
  JSON.stringify([partSum.total, partSum.answered.length, partSum.unanswered.length]));

console.log('\n[10] 汇总');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);