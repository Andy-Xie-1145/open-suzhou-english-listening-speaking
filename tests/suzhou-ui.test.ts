import { mountSuzhouReading, initialState, toScoreView } from '../src/ui/suzhou-reading.ts';
import { scoreReading, toReadingTask } from '../src/suzhou/reading-section.ts';
import readingsJson from '../data/readings.json' with { type: 'json' };

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const RAW: any[] = (readingsJson as any).readings ?? (Array.isArray(readingsJson) ? readingsJson : []);

console.log('=== 朗读短文界面 · 闭环测试 ===');
async function main(): Promise<void> {
/* ---------------- 1. 取题 ---------------- */
console.log('[1] 取题');
const s0 = initialState(RAW);
check('默认取第一篇', s0.task !== null && s0.task!.id === RAW[0].id, s0.task?.id);
check('初始为 idle', s0.phase === 'idle');
check('任务带原文', (s0.task?.text.length ?? 0) > 200);

const sOff = initialState(RAW, 'rd-02');
check('可按 id 取题', sOff.task?.id === 'rd-02', sOff.task?.id);
check('rd-02 为官方公布篇', sOff.task?.source.official === true);

const sBad = initialState(RAW, 'not-exist');
check('id 不存在时安全降级', sBad.task === null);

const sEmpty = initialState([]);
check('空语料不崩', sEmpty.task === null && sEmpty.phase === 'idle');

/* ---------------- 2. 视图模型 ---------------- */
console.log('\n[2] 视图模型');
const task = toReadingTask(RAW[0]);
const result = scoreReading({ reference: task.text, spoken: task.text, durationMs: 40000 });
const view = toScoreView(task, result);
check('分数标签为近似分', view.label === '近似分', view.label);
check('徽标为近似模拟', view.badge === '近似模拟', view.badge);
check('带三条声明', view.disclaimer.length === 3, String(view.disclaimer.length));
check('带已知局限清单', view.limits.length >= 5, String(view.limits.length));
check('三个分项', view.dimensions.length === 3);
check('分项权重标注为假设值', view.dimensions.every(d => d.weightText.includes('假设值')));
check('逐词明细完整', view.rows.length === result.alignment.total, view.rows.length + '/' + result.alignment.total);
check('元信息含来源标记', view.meta.sourceOfficial === task.source.official);
check('元信息含教材位置', view.meta.textbook === task.textbook);

/* ---------------- 3. 漏读的视图表现 ---------------- */
console.log('\n[3] 漏读与误读的视图表现');
const half2 = task.text.split(/\s+/).filter((_, i) => i % 2 === 0).join(' ');
const bad = scoreReading({ reference: task.text, spoken: half2, durationMs: 40000 });
const badView = toScoreView(task, bad);
const omittedRows = badView.rows.filter(r => r.verdict === 'omitted');
check('漏读词在视图中标出', omittedRows.length > 0, String(omittedRows.length));
check('漏读反馈存在', badView.feedback.some(f => f.kind === 'omission'));
check('漏读时分数下降', badView.value < view.value, badView.value + ' < ' + view.value);
check('完整度进度条 < 100', badView.dimensions[0].percent < 100, String(badView.dimensions[0].percent));
/* ---------------- 4. 无 DOM 环境下的安全性 ---------------- */
console.log('\n[4] Node 环境安全性');
check('initialState 不碰 DOM', (() => { try { initialState(RAW); return true; } catch { return false; } })());
check('scoreReading 不碰 DOM', (() => { try { scoreReading({ reference: 'a b c', spoken: 'a b c' }); return true; } catch { return false; } })());
check('toScoreView 不碰 DOM', (() => { try { toScoreView(toReadingTask(RAW[0]), result); return true; } catch { return false; } })());

/* ---------------- 5. 最小 DOM 桩 ---------------- */
interface FakeNode { tagName: string; className: string; textContent: string; children: FakeNode[]; attrs: Record<string, string>; style: Record<string, string>; disabled: boolean; type: string; rows: number; value: string; title: string; handlers: Record<string, Array<() => void>>; parentNode: FakeNode | null; firstChild: FakeNode | null; }

function mkNode(tag: string): FakeNode {
  const n: any = { tagName: tag.toUpperCase(), className: '', textContent: '', children: [], attrs: {}, style: {}, disabled: false, type: '', rows: 0, value: '', title: '', handlers: {}, parentNode: null, firstChild: null };
  n.setAttribute = (k: string, v: string) => { n.attrs[k] = v; };
  n.getAttribute = (k: string) => n.attrs[k] ?? null;
  n.appendChild = (c: FakeNode) => { c.parentNode = n; n.children.push(c); n.firstChild = n.children[0]; return c; };
  n.removeChild = (c: FakeNode) => { n.children = n.children.filter(function (x: FakeNode) { return x !== c; }); n.firstChild = n.children[0] ?? null; return c; };
  n.addEventListener = (ev: string, fn: () => void) => { (n.handlers[ev] = n.handlers[ev] || []).push(fn); };
  return n as FakeNode;
}

const fakeDoc: any = { createElement: (tag: string) => mkNode(tag) };
function newMount(): any { const m: any = mkNode('div'); m.ownerDocument = fakeDoc; return m; }
function allText(n: FakeNode): string { let s = n.textContent || ''; for (const c of n.children) s += ' ' + allText(c); return s; }

/* ---------------- 6. 极端降级：无录音无引擎 ---------------- */
console.log('\n[5] 极端降级（无麦克风、无 ASR）');
const mount: any = newMount();
const app = mountSuzhouReading(mount as any, { recordings: RAW, taskId: 'rd-01', recorder: null, asr: null });
check('极端降级下挂载不崩', app.view() !== null);
check('初始为 idle', app.state().phase === 'idle');
const rendered = allText(mount);
check('渲染出近似声明横幅', rendered.includes('近似模拟'));
check('渲染出材料位置', rendered.includes('七上') || rendered.includes('八上') || rendered.includes('九上'));
check('无录音器时提示手动输入', rendered.includes('手动输入'));

// 手动输入闭环
const refText = app.state().task!.text;
const r = app.submitText(refText, 40000);
check('手动提交返回结果', r !== null);
check('提交后进入 scored', app.state().phase === 'scored');
check('满分朗读得 100 近似分', r?.approximateScore === 100, String(r?.approximateScore));

const scored = allText(mount);
check('分数区出现「近似分」标签', scored.includes('近似分'));
check('分数区出现「近似模拟」徽标', scored.includes('近似模拟'));
check('渲染出「不是苏州市中考听力口语考试的评分」', scored.includes('不是苏州市中考听力口语考试的评分'));
check('渲染出已知局限（音素/语调）', scored.includes('音素') && scored.includes('语调'));
check('渲染出三个维度', scored.includes('完整度') && scored.includes('准确度') && scored.includes('流利度'));
check('权重标注为假设值', scored.includes('假设值'));

const half3 = refText.split(/\s+/).filter(function (_, i) { return i % 2 === 0; }).join(' ');
const r2 = app.submitText(half3, 30000);
check('漏读降分', (r2?.approximateScore ?? 100) < 60, String(r2?.approximateScore));
check('漏读反馈已渲染', allText(mount).includes('漏读'));

const r3 = app.submitText('   ');
check('空输入被拒绝', r3 === null);
check('空输入给出错误提示', app.state().error !== null);
check('错误后仍保留题目', allText(mount).includes('朗读短文'));

/* ---------------- 7. 录音 + ASR 链路 ---------------- */
console.log('\n[6] 录音 + ASR 链路（桩实现）');
const mount2: any = newMount();
let started: boolean = false;
let stopped: boolean = false;
/** 符合 RecorderPort 契约的录音桩。opts.canRecord=false 模拟无麦克风。 */
function makeRecorder(opts: { canRecord?: boolean; failStart?: boolean; failStop?: boolean; emptyAudio?: boolean } = {}): any {
  let running = false;
  let cancelled = false;
  return {
    canRecord: function () { return opts.canRecord !== false; },
    start: async function () {
      if (opts.failStart) throw new Error('麦克风被占用');
      started = true;
      running = true;
    },
    stop: async function () {
      if (opts.failStop) { running = false; throw new Error('解码失败'); }
      stopped = true;
      running = false;
      const samples = opts.emptyAudio ? new Float32Array(0) : new Float32Array([0.1, 0.2, 0.3]);
      return { samples: samples, sampleRate: 16000, durationMs: 42000 };
    },
    elapsedMs: function () { return running ? 42000 : 0; },
    cancel: function () { cancelled = true; running = false; },
    isCancelled: function () { return cancelled; },
  };
}
const fakeRecorder: any = makeRecorder();
/**
 * 符合 AsrPort 契约的转写桩。
 *  opts.ready  —— 初始是否就绪
 *  opts.fail   —— transcribe 是否抛错（模拟模型崩溃）
 *  opts.loadFails —— load 是否失败（模拟断网/存储不可用）
 */
function makeAsr(opts: { ready?: boolean; fail?: boolean; loadFails?: boolean } = {}): any {
  let ready = opts.ready === true;
  let st = {
    status: ready ? 'ready' : 'idle',
    percent: ready ? 100 : 0,
    message: ready ? '语音转写已就绪。' : '语音转写未加载。',
  };
  let loadCalls = 0;
  return {
    ready: function () { return ready; },
    status: function () { return st; },
    loadCalls: function () { return loadCalls; },
    load: async function () {
      loadCalls++;
      if (opts.loadFails) {
        st = { status: 'failed', percent: 0, message: '模型加载失败：网络中断' };
        return false;
      }
      ready = true;
      st = { status: 'ready', percent: 100, message: '语音转写已就绪，录音后会自动转写。' };
      return true;
    },
    transcribe: async function () {
      if (opts.fail) throw new Error('模型未加载');
      if (!ready) throw new Error('语音转写模型未加载');
      return refText;
    },
    unload: function () { ready = false; st = { status: 'idle', percent: 0, message: '语音转写已卸载。' }; },
  };
}
const fakeEngine: any = makeAsr({ ready: true });
const app2 = mountSuzhouReading(mount2 as any, { recordings: RAW, taskId: 'rd-01', recorder: fakeRecorder, asr: fakeEngine });
await app2.start();
check('录音已开始', Boolean(started));
check('进入 recording 状态', app2.state().phase === 'recording');
await app2.stop();
check('录音已停止', Boolean(stopped));
check('ASR 转写后进入 scored', app2.state().phase === 'scored', app2.state().phase);
check('转写内容参与评分', app2.state().result !== null);
check('满分转写得 100', app2.state().result?.approximateScore === 100, String(app2.state().result?.approximateScore));

/* ---------------- 8. ASR 失败降级 ---------------- */
console.log('\n[7] ASR 失败降级');
const mount3: any = newMount();
const failEngine: any = makeAsr({ ready: true, fail: true });
const app3 = mountSuzhouReading(mount3 as any, { recordings: RAW, taskId: 'rd-01', recorder: fakeRecorder, asr: failEngine });
await app3.start();
await app3.stop();
check('ASR 失败后进入 manual', app3.state().phase === 'manual', app3.state().phase);
check('给出失败原因', (app3.state().error ?? '').includes('转写失败'));
check('降级后仍可手动评分', (function () { const x = app3.submitText(refText, 40000); return x !== null && x.approximateScore === 100; })());

/* ---------------- 9. 无 ASR 引擎 ---------------- */
console.log('\n[8] 无 ASR 引擎');
const mount4: any = newMount();
const app4 = mountSuzhouReading(mount4 as any, { recordings: RAW, taskId: 'rd-01', recorder: fakeRecorder, asr: null });
await app4.start();
await app4.stop();
check('无 ASR 时进 manual', app4.state().phase === 'manual', app4.state().phase);
check('提示需加载语音转写模型', (app4.state().error ?? '').includes('语音转写未加载'), app4.state().error ?? '');

/* ---------------- 10. 空语料不白屏 ---------------- */
console.log('\n[9] 空语料');
const mount5: any = newMount();
const app5 = mountSuzhouReading(mount5 as any, { recordings: [], recorder: null, asr: null });
check('空语料挂载成功', app5.view() !== null);
check('空语料给出提示', allText(mount5).includes('语料未加载'));
check('空语料时提交返回 null', app5.submitText('anything') === null);
check('空语料仍显示近似横幅', allText(mount5).includes('近似模拟'));

/* ---------------- 11. ASR 模型加载与断网降级 ---------------- */
console.log('\n[10] ASR 模型加载');

// 11.1 初始未加载时，界面应出现加载入口与替代方案说明
const m1: any = newMount();
const idleAsr: any = makeAsr({ ready: false });
const rec1: any = makeRecorder();
const app1 = mountSuzhouReading(m1 as any, { recordings: RAW, taskId: 'rd-01', recorder: rec1, asr: idleAsr });
let txt1 = allText(m1);
check('未加载时显示转写说明', txt1.includes('语音转写'), txt1.slice(0, 80));
check('提供模型加载按钮', txt1.includes('加载语音转写模型'));
check('明确告知不加载也能用', txt1.includes('不加载也可以'));
check('未就绪时不显示录音按钮? (应可用但会降级)', txt1.includes('开始录音'));

// 11.2 加载成功后，录音可自动转写出分
const ok = await app1.loadAsr('base');
check('加载返回 true', ok === true);
check('模型实际被调用过', idleAsr.loadCalls() === 1, String(idleAsr.loadCalls()));
check('就绪后状态为 ready', idleAsr.status().status === 'ready', idleAsr.status().status);
await app1.start();
await app1.stop();
check('加载后录音可自动出分', app1.state().phase === 'scored', app1.state().phase);
check('自动转写得分满分', app1.state().result?.approximateScore === 100, String(app1.state().result?.approximateScore));

// 11.3 加载失败（断网 / 无痕模式存储不可用）
console.log('\n[11] 模型加载失败（断网）');
const m2: any = newMount();
const badAsr: any = makeAsr({ ready: false, loadFails: true });
const app2f = mountSuzhouReading(m2 as any, { recordings: RAW, taskId: 'rd-01', recorder: makeRecorder(), asr: badAsr });
const ok2 = await app2f.loadAsr('base');
check('加载失败返回 false', ok2 === false);
check('状态标记为 failed', badAsr.status().status === 'failed', badAsr.status().status);
check('界面提示加载失败原因', (app2f.state().error ?? '').includes('加载失败'), app2f.state().error ?? '');
check('失败后回到 idle 而非卡死', app2f.state().phase === 'idle', app2f.state().phase);
check('失败后仍可手动输入出分', (function () { const r = app2f.submitText(app2f.state().task!.text, 40000); return r !== null && r.approximateScore === 100; })());
check('失败后页面未崩，题目仍在', allText(m2).includes('朗读短文'));

/* ---------------- 12. 录音异常降级 ---------------- */
console.log('\n[12] 录音异常');

// 12.1 无麦克风
const m3: any = newMount();
const noMic: any = makeRecorder({ canRecord: false });
const app3f = mountSuzhouReading(m3 as any, { recordings: RAW, taskId: 'rd-01', recorder: noMic, asr: makeAsr({ ready: true }) });
await app3f.start();
check('无麦克风进 manual', app3f.state().phase === 'manual', app3f.state().phase);
check('提示未检测到麦克风', (app3f.state().error ?? '').includes('麦克风'), app3f.state().error ?? '');
check('仍可手动出分', (function () { const r = app3f.submitText(app3f.state().task!.text, 40000); return r !== null; })());

// 12.2 录音启动失败（设备被占用）
const m4: any = newMount();
const busy: any = makeRecorder({ failStart: true });
const app4f = mountSuzhouReading(m4 as any, { recordings: RAW, taskId: 'rd-01', recorder: busy, asr: makeAsr({ ready: true }) });
await app4f.start();
check('启动失败进 manual', app4f.state().phase === 'manual', app4f.state().phase);
check('给出具体原因', (app4f.state().error ?? '').includes('麦克风被占用'), app4f.state().error ?? '');
check('明确告知可手动输入', (app4f.state().error ?? '').includes('手动输入'));

// 12.3 录音结束/解码失败
const m5: any = newMount();
const badStop: any = makeRecorder({ failStop: true });
const app5f = mountSuzhouReading(m5 as any, { recordings: RAW, taskId: 'rd-01', recorder: badStop, asr: makeAsr({ ready: true }) });
await app5f.start();
await app5f.stop();
check('解码失败进 manual', app5f.state().phase === 'manual', app5f.state().phase);
check('提示解码失败', (app5f.state().error ?? '').includes('解码失败'), app5f.state().error ?? '');

// 12.4 采集到空音频（设备被静音/权限异常）
const m6: any = newMount();
const silent: any = makeRecorder({ emptyAudio: true });
const app6f = mountSuzhouReading(m6 as any, { recordings: RAW, taskId: 'rd-01', recorder: silent, asr: makeAsr({ ready: true }) });
await app6f.start();
await app6f.stop();
check('空音频不进转写', app6f.state().phase === 'manual', app6f.state().phase);
check('空音频给出提示', (app6f.state().error ?? '').includes('没有采集到音频'), app6f.state().error ?? '');

// 12.5 ASR 已就绪但转写时崩溃（内存不足 / 格式不支持）
const m7: any = newMount();
const crashAsr: any = makeAsr({ ready: true, fail: true });
const app7f = mountSuzhouReading(m7 as any, { recordings: RAW, taskId: 'rd-01', recorder: makeRecorder(), asr: crashAsr });
await app7f.start();
await app7f.stop();
check('转写崩溃进 manual', app7f.state().phase === 'manual', app7f.state().phase);
check('提示自动转写失败', (app7f.state().error ?? '').includes('自动转写失败'), app7f.state().error ?? '');
check('崩溃后仍可手动出分', (function () { const r = app7f.submitText(app7f.state().task!.text, 40000); return r !== null && r.approximateScore === 100; })());

// 12.6 每一个降级场景都必须保留近似声明
console.log('\n[13] 降级不丢红线');
for (const [name, node] of [['无麦克风', m3], ['启动失败', m4], ['解码失败', m5], ['空音频', m6], ['转写崩溃', m7]] as Array<[string, any]>) {
  const t = allText(node);
  check(name + '：横幅仍在', t.includes('近似模拟'));
}

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
}

void main();
