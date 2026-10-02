/**
 * 话题简述界面（Q5）—— 闭环测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点验证 7 句硬门槛在界面上直说，且降级路径保留红线。
 */

import { mountSuzhouTopic, initialTopicState, toTopicScoreView } from '../src/ui/suzhou-topic.ts';
import { scoreTopic, toTopicTask } from '../src/suzhou/topic-section.ts';
import topicsJson from '../data/topics.json' with { type: 'json' };

const RAW: any[] = (topicsJson as any).topics ?? (Array.isArray(topicsJson) ? topicsJson : []);

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

interface N { className: string; textContent: string; children: N[]; attrs: Record<string,string>; style: Record<string,string>; disabled: boolean; type: string; rows: number; value: string; handlers: Record<string, Array<() => void>>; parentNode: N | null; firstChild: N | null; }
function mk(tag: string): N {
  const n: any = { tagName: tag.toUpperCase(), className: '', textContent: '', children: [], attrs: {}, style: {}, disabled: false, type: '', rows: 0, value: '', handlers: {}, parentNode: null, firstChild: null };
  n.setAttribute = (k: string, v: string) => { n.attrs[k] = v; };
  n.getAttribute = (k: string) => n.attrs[k] ?? null;
  n.appendChild = (c: N) => { c.parentNode = n; n.children.push(c); n.firstChild = n.children[0]; return c; };
  n.removeChild = (c: N) => { n.children = n.children.filter(function (x: N) { return x !== c; }); n.firstChild = n.children[0] ?? null; return c; };
  n.addEventListener = (ev: string, fn: () => void) => { (n.handlers[ev] = n.handlers[ev] || []).push(fn); };
  return n as N;
}
const fakeDoc: any = { createElement: (t: string) => mk(t) };
function newMount(): N { const m: any = mk('div'); m.ownerDocument = fakeDoc; return m as N; }
function allText(n: N): string { let s = n.textContent || ''; for (const c of n.children) s += ' ' + allText(c); return s; }

async function main(): Promise<void> {
console.log('=== 话题简述界面 · 闭环测试 ===');

/* ---------- 1. 取题 ---------- */
console.log('\n[1] 取题');
const s0 = initialTopicState(RAW);
check('默认取第一个话题', s0.task !== null && s0.task!.displayText === RAW[0].name, s0.task?.displayText);
check('初始 idle', s0.phase === 'idle');
check('带 displayText', (s0.task?.displayText.length ?? 0) > 0);
check('带 hint', (s0.task?.hint.length ?? 0) > 0);
check('带常用句式', (s0.task?.keyExpressions.length ?? 0) > 0);
const s2 = initialTopicState(RAW, 2);
check('可按 index 取题', s2.task?.displayText === RAW[2].name, s2.task?.displayText);
const sBad = initialTopicState(RAW, 999);
check('越界 index 安全降级', sBad.task?.displayText === RAW[0].name);
const sEmpty = initialTopicState([]);
check('空语料不崩', sEmpty.task === null);

/* ---------- 2. 视图模型：7 句门槛直说 ---------- */
console.log('\n[2] 视图模型与硬门槛');
const t0 = toTopicTask(RAW[0], 0);
const full = t0.sampleAnswer.join(' ');
const rFull = scoreTopic({ transcript: full, task: t0, durationMs: 45000 });
const vFull = toTopicScoreView(t0, rFull);
check('label 为近似分', vFull.label === '近似分', vFull.label);
check('badge 为近似模拟', vFull.badge === '近似模拟', vFull.badge);
check('声明含不是中考评分', vFull.disclaimer[0].indexOf('不是苏州市中考听力口语考试的评分') >= 0, vFull.disclaimer[0]);
check('通过时 gate 消息含达标', vFull.passed === true && vFull.gateMessage.indexOf('已达硬门槛') >= 0, vFull.gateMessage);
check('通过时 gate 给出实际句数', vFull.gateMessage.indexOf(String(rFull.sentenceCount)) >= 0, vFull.gateMessage);
check('meta 带 required', vFull.meta.required === 7, String(vFull.meta.required));
check('四个分项', vFull.dimensions.length === 4);

const short3 = ['I like basketball.', 'It is fun.', 'We play every day.'].join(' ');
const r3 = scoreTopic({ transcript: short3, task: t0, durationMs: 12000 });
const v3 = toTopicScoreView(t0, r3);
check('3 句时 passed 为 false', v3.passed === false);
check('3 句时 gate 直说「只说了 3 句，要求至少 7 句」', v3.gateMessage === '只说了 3 句，要求至少 7 句', v3.gateMessage);
check('3 句时近似分显著低于完整回答', v3.value < vFull.value - 25, v3.value + ' vs ' + vFull.value);
/* ---------- 3. 挂载闭环 ---------- */
console.log('\n[3] 挂载闭环（无麦克风无 ASR）');
const m1 = newMount();
const app1 = mountSuzhouTopic(m1 as any, { topics: RAW, topicIndex: 0, recorder: null, asr: null });
check('挂载不崩', app1.view() !== null);
let t1 = allText(m1);
check('渲染近似横幅', t1.indexOf('近似模拟') >= 0);
check('渲染话题标题', t1.indexOf('话题简述') >= 0);
check('只显示英文话题名', t1.indexOf(RAW[0].name) >= 0);
check('提示考试不显示中文', t1.indexOf('考试不显示') >= 0);
check('无录音器时提示手动输入', t1.indexOf('手动输入') >= 0);

const res1 = app1.submitText(full, 45000);
check('手动提交返回结果', res1 !== null);
check('提交后 scored', app1.state().phase === 'scored');
check('满分表达得 100', res1?.approximateScore === 100, String(res1?.approximateScore));
const after1 = allText(m1);
check('渲染「近似分」标签', after1.indexOf('近似分') >= 0);
check('渲染「近似模拟」徽标', after1.indexOf('近似模拟') >= 0);
check('渲染硬门槛达标提示', after1.indexOf('已达硬门槛') >= 0);
check('渲染四个维度', after1.indexOf('完整') >= 0 || after1.indexOf('句数') >= 0);
check('渲染已知局限', after1.indexOf('音素') >= 0 && after1.indexOf('语调') >= 0);

const res2 = app1.submitText(short3, 12000);
check('改提交 3 句后降分', (res2?.approximateScore ?? 100) < 60, String(res2?.approximateScore));
const after2 = allText(m1);
check('界面直写「只说了 3 句」', after2.indexOf('只说了 3 句') >= 0, 'gate 文案');
check('界面直写「要求至少 7 句」', after2.indexOf('至少 7 句') >= 0);
check('未通过时仍保留近似横幅', after2.indexOf('近似模拟') >= 0);

check('空输入被拒绝', app1.submitText('  ') === null);
check('空输入后题目仍在', allText(m1).indexOf('话题简述') >= 0);
/* ---------- 4. 录音 + ASR 链路 ---------- */
console.log('\n[4] 录音 + ASR（桩）');
let started = false;
let stopped = false;
const rec = {
  canRecord: function () { return true; },
  start: async function () { started = true; },
  stop: async function () { stopped = true; return { samples: new Float32Array([0.1,0.2]), sampleRate: 16000, durationMs: 45000 }; },
  elapsedMs: function () { return 45000; },
  cancel: function () {},
};
function mkAsr(opts: { ready?: boolean; fail?: boolean } = {}): any {
  let ready = opts.ready === true;
  let st = { status: ready ? 'ready' : 'idle', percent: ready ? 100 : 0, message: ready ? '已就绪' : '未加载' };
  return {
    ready: function () { return ready; },
    status: function () { return st; },
    load: async function () { if (opts.fail) { st = { status: 'failed', percent: 0, message: '加载失败' }; return false; } ready = true; st = { status: 'ready', percent: 100, message: '已就绪' }; return true; },
    transcribe: async function () { if (opts.fail) throw new Error('模型崩了'); if (!ready) throw new Error('未加载'); return full; },
    unload: function () {},
  };
}

const m2 = newMount();
const app2 = mountSuzhouTopic(m2 as any, { topics: RAW, topicIndex: 0, recorder: rec, asr: mkAsr({ ready: true }) });
await app2.start();
check('录音已开始', Boolean(started));
check('进入 recording', app2.state().phase === 'recording');
await app2.stop();
check('录音已停止', Boolean(stopped));
check('ASR 后进入 scored', app2.state().phase === 'scored', app2.state().phase);
check('自动转写满分', app2.state().result?.approximateScore === 100, String(app2.state().result?.approximateScore));
/* ---------- 5. 降级路径 ---------- */
console.log('\n[5] 降级路径');
const m3 = newMount();
const app3 = mountSuzhouTopic(m3 as any, { topics: RAW, topicIndex: 0, recorder: rec, asr: mkAsr({ ready: true, fail: true }) });
await app3.start();
await app3.stop();
check('ASR 崩溃进 manual', app3.state().phase === 'manual', app3.state().phase);
check('提示自动转写失败', (app3.state().error ?? '').indexOf('自动转写失败') >= 0, app3.state().error ?? '');
check('崩溃后仍可手动评分', (function () { const r = app3.submitText(full, 45000); return r !== null && r.approximateScore === 100; })());
check('降级后横幅仍在', allText(m3).indexOf('近似模拟') >= 0);

const m4 = newMount();
const app4 = mountSuzhouTopic(m4 as any, { topics: RAW, topicIndex: 0, recorder: rec, asr: null });
await app4.start();
await app4.stop();
check('无 ASR 进 manual', app4.state().phase === 'manual', app4.state().phase);
check('提示转写未加载', (app4.state().error ?? '').indexOf('语音转写未加载') >= 0, app4.state().error ?? '');

const m5 = newMount();
const app5 = mountSuzhouTopic(m5 as any, { topics: RAW, topicIndex: 0, recorder: null, asr: mkAsr({ ready: true }) });
await app5.start();
check('无麦克风进 manual', app5.state().phase === 'manual', app5.state().phase);
check('提示未检测到麦克风', (app5.state().error ?? '').indexOf('麦克风') >= 0);

const m6 = newMount();
const app6 = mountSuzhouTopic(m6 as any, { topics: [], recorder: null, asr: null });
check('空语料挂载成功', app6.view() !== null);
check('空语料给出提示', allText(m6).indexOf('语料未加载') >= 0);
check('空语料仍显示横幅', allText(m6).indexOf('近似模拟') >= 0);

/* ---------- 6. ASR 模型加载 ---------- */
console.log('\n[6] ASR 模型加载');
const m7 = newMount();
const asr7 = mkAsr({ ready: false });
const app7 = mountSuzhouTopic(m7 as any, { topics: RAW, topicIndex: 0, recorder: rec, asr: asr7 });
check('未加载时显示加载按钮', allText(m7).indexOf('加载语音转写模型') >= 0);
const okLoad = await app7.loadAsr('base');
check('加载返回 true', okLoad === true);
check('就绪后状态 ready', asr7.status().status === 'ready');

const m8 = newMount();
const asr8 = mkAsr({ ready: false, fail: true });
const app8 = mountSuzhouTopic(m8 as any, { topics: RAW, topicIndex: 0, recorder: rec, asr: asr8 });
const failLoad = await app8.loadAsr();
check('加载失败返回 false', failLoad === false);
check('失败后仍可手动评分', (function () { const r = app8.submitText(full, 45000); return r !== null; })());
check('失败后横幅仍在', allText(m8).indexOf('近似模拟') >= 0);

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
}

void main();
