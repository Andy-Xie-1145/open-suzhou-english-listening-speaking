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
const app = mountSuzhouReading(mount as any, { recordings: RAW, taskId: 'rd-01', recorder: null, engine: null });
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
const fakeRecorder: any = {
  start: async function () { started = true; },
  stop: async function () { stopped = true; return new Float32Array([0.1, 0.2, 0.3]); },
  durationMs: function () { return 42000; },
};
const fakeEngine: any = {
  canTranscribe: function () { return true; },
  transcribe: async function () { return refText; },
};
const app2 = mountSuzhouReading(mount2 as any, { recordings: RAW, taskId: 'rd-01', recorder: fakeRecorder, engine: fakeEngine });
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
const failEngine: any = {
  canTranscribe: function () { return true; },
  transcribe: async function () { throw new Error('模型未加载'); },
};
const app3 = mountSuzhouReading(mount3 as any, { recordings: RAW, taskId: 'rd-01', recorder: fakeRecorder, engine: failEngine });
await app3.start();
await app3.stop();
check('ASR 失败后进入 manual', app3.state().phase === 'manual', app3.state().phase);
check('给出失败原因', (app3.state().error ?? '').includes('转写失败'));
check('降级后仍可手动评分', (function () { const x = app3.submitText(refText, 40000); return x !== null && x.approximateScore === 100; })());

/* ---------------- 9. 无 ASR 引擎 ---------------- */
console.log('\n[8] 无 ASR 引擎');
const mount4: any = newMount();
const app4 = mountSuzhouReading(mount4 as any, { recordings: RAW, taskId: 'rd-01', recorder: fakeRecorder, engine: null });
await app4.start();
await app4.stop();
check('无 ASR 时进 manual', app4.state().phase === 'manual', app4.state().phase);
check('提示需加载语音模型', (app4.state().error ?? '').includes('语音模型'));

/* ---------------- 10. 空语料不白屏 ---------------- */
console.log('\n[9] 空语料');
const mount5: any = newMount();
const app5 = mountSuzhouReading(mount5 as any, { recordings: [], recorder: null, engine: null });
check('空语料挂载成功', app5.view() !== null);
check('空语料给出提示', allText(mount5).includes('语料未加载'));
check('空语料时提交返回 null', app5.submitText('anything') === null);
check('空语料仍显示近似横幅', allText(mount5).includes('近似模拟'));

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
}

void main();
