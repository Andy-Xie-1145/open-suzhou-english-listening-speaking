/**
 * 情景问答界面（Q4）—— 闭环测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点：每题单独出分、逐条要点摊开、降级路径保留横幅。
 */

import { mountSuzhouQa, initialQaState } from '../src/ui/suzhou-qa.ts';
import { scoreQa, toQaTask } from '../src/suzhou/qa-section.ts';
import qaJson from '../data/qa.json' with { type: 'json' };
import kwJson from '../data/qa-keywords.json' with { type: 'json' };

const RAW: any[] = (qaJson as any).qa ?? (Array.isArray(qaJson) ? qaJson : []);
const KW: any = kwJson as any;

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
console.log('=== 情景问答界面 · 闭环测试 ===');

/* ---------- 1. 组题 ---------- */
console.log('\n[1] 组题');
const st = initialQaState({ questions: RAW, enKeywords: KW, seed: 20260101 });
check('抽出 2 题', st.items.length === 2, String(st.items.length));
check('两题类别不同', st.items[0].task.category !== st.items[1].task.category);
check('每题带英文问句', st.items.every(function (i) { return i.task.question.length > 0; }));
check('每题带 3 个要点与关键词', st.items.every(function (i) { return i.task.enKeywords.length === 3; }));
check('每题带中文情境（教师参考）', st.items.every(function (i) { return i.task.scenario.length > 0; }));
const st2 = initialQaState({ questions: RAW, enKeywords: KW, seed: 20260101 });
check('同种子得同卷', st2.items[0].task.id === st.items[0].task.id);
const stBad = initialQaState({ questions: RAW, enKeywords: {}, seed: 1 });
check('关键词缺失时安全降级', stBad.items.length === 0);

/* ---------- 2. 挂载闭环 ---------- */
console.log('\n[2] 挂载闭环');
const m1 = newMount();
const app = mountSuzhouQa(m1 as any, { questions: RAW, enKeywords: KW, seed: 20260101, recorder: null, asr: null });
check('挂载不崩', app.view() !== null);
let t = allText(m1);
check('渲染近似横幅', t.indexOf('近似模拟') >= 0);
check('渲染题型标题', t.indexOf('情景问答') >= 0);
check('说明半开放题性质', t.indexOf('半开放题') >= 0);
check('渲染第 1 题标记', t.indexOf('第 1 题') >= 0);
check('渲染第 2 题标记', t.indexOf('第 2 题') >= 0);
check('中文情境标注仅教师参考', t.indexOf('仅教师参考') >= 0);
check('无麦克风时提示手动输入', t.indexOf('手动输入') >= 0);

// 第 1 题：完整回答
const it0 = app.state().items[0];
const full = it0.task.enKeywords.map(function (k) { return k[0]; }).join('. ');
const r1 = app.submitText(full, 20000);
check('第 1 题提交成功', r1 !== null);
check('第 1 题全覆盖', r1 !== null && r1.coverage === 1, r1 ? String(r1.coverage) : 'null');
const t2 = allText(m1);
check('渲染「近似分」标签', t2.indexOf('近似分') >= 0);
check('渲染「近似模拟」徽标', t2.indexOf('近似模拟') >= 0);
check('渲染回应判定', t2.indexOf('已对问句作出回应') >= 0);
check('渲染覆盖计数', t2.indexOf('3 / 3 个要点已覆盖') >= 0);
check('渲染要点序号', t2.indexOf('要点 1') >= 0 && t2.indexOf('要点 3') >= 0);
check('渲染命中关键词', t2.indexOf('命中：') >= 0);
/* ---------- 3. 每题单独出分 ---------- */
console.log('\n[3] 每题单独出分');
const item0Before = app.state().items[0].result;
const item1Before = app.state().items[1].result;
check('第 2 题此时仍无结果（第 1 题已单独评过分）', item1Before === null && item0Before !== null);
app.focus(1);
check('切换到第 2 题', app.state().active === 1);
const it1 = app.state().items[1];
const full1 = it1.task.enKeywords.map(function (k) { return k[0]; }).join('. ');
const r2 = app.submitText(full1, 22000);
check('第 2 题提交成功', r2 !== null);
check('第 1 题结果未被覆盖', app.state().items[0].result !== null);
check('第 1 题分数与首次一致', app.state().items[0].result?.approximateScore === item0Before?.approximateScore);
check('两题分数独立存储', app.state().items[0].result?.approximateScore !== undefined && app.state().items[1].result?.approximateScore !== undefined);

/* ---------- 4. 逐条要点摊开 ---------- */
console.log('\n[4] 未覆盖要点逐条展示');
app.focus(0);
const partial = 'I am sorry about that.';
const rp = app.submitText(partial, 8000);
check('部分回答未全覆盖', rp !== null && rp.coverage < 1, rp ? String(rp.coverage) : 'null');
const t3 = allText(m1);
check('界面写出「未命中，可试试这些说法」', t3.indexOf('未命中，可试试这些说法') >= 0);
check('界面写出要点未覆盖', t3.indexOf('要点 2') >= 0 || t3.indexOf('要点 3') >= 0);
check('未通过时仍有近似横幅', t3.indexOf('近似模拟') >= 0);
check('未通过时分数明显降低', (rp?.approximateScore ?? 100) < (r1?.approximateScore ?? 0), (rp?.approximateScore ?? 0) + ' vs ' + (r1?.approximateScore ?? 0));
/* ---------- 5. 录音 + ASR ---------- */
console.log('\n[5] 录音 + ASR（桩）');
let started = false;
let stopped = false;
const rec = {
  canRecord: function () { return true; },
  start: async function () { started = true; },
  stop: async function () { stopped = true; return { samples: new Float32Array([0.1,0.2]), sampleRate: 16000, durationMs: 20000 }; },
  elapsedMs: function () { return 20000; },
  cancel: function () {},
};
function mkAsr(opts: { ready?: boolean; fail?: boolean } = {}): any {
  let ready = opts.ready === true;
  let stt = { status: ready ? 'ready' : 'idle', percent: ready ? 100 : 0, message: ready ? '已就绪' : '未加载' };
  return {
    ready: function () { return ready; },
    status: function () { return stt; },
    load: async function () { if (opts.fail) { stt = { status: 'failed', percent: 0, message: '加载失败' }; return false; } ready = true; stt = { status: 'ready', percent: 100, message: '已就绪' }; return true; },
    transcribe: async function () { if (opts.fail) throw new Error('模型崩了'); if (!ready) throw new Error('未加载'); return 'zzz'; },
    unload: function () {},
  };
}

const m2 = newMount();
const app2 = mountSuzhouQa(m2 as any, { questions: RAW, enKeywords: KW, seed: 5, recorder: rec, asr: mkAsr({ ready: true }) });
app2.focus(0);
await app2.start();
check('录音已开始', Boolean(started));
await app2.stop();
check('录音已停止', Boolean(stopped));
check('ASR 后该题已评分', app2.state().items[0].result !== null);
check('第 2 题未被影响', app2.state().items[1].result === null);
/* ---------- 6. 降级路径 ---------- */
console.log('\n[6] 降级路径');
const m3 = newMount();
const app3 = mountSuzhouQa(m3 as any, { questions: RAW, enKeywords: KW, seed: 5, recorder: rec, asr: mkAsr({ ready: true, fail: true }) });
await app3.start();
await app3.stop();
check('ASR 崩溃进 manual', app3.state().items[0].phase === 'manual', app3.state().items[0].phase);
check('提示自动转写失败', (app3.state().items[0].error ?? '').indexOf('自动转写失败') >= 0, app3.state().items[0].error ?? '');
check('崩溃后仍可手动评分', app3.submitText(app3.state().items[0].task.enKeywords.map(function (k) { return k[0]; }).join('. '), 20000) !== null);
check('降级后横幅仍在', allText(m3).indexOf('近似模拟') >= 0);

const m4 = newMount();
const app4 = mountSuzhouQa(m4 as any, { questions: RAW, enKeywords: KW, seed: 5, recorder: rec, asr: null });
await app4.start();
await app4.stop();
check('无 ASR 进 manual', app4.state().items[0].phase === 'manual', app4.state().items[0].phase);
check('提示转写未加载', (app4.state().items[0].error ?? '').indexOf('语音转写未加载') >= 0);
check('无 ASR 时横幅仍在', allText(m4).indexOf('近似模拟') >= 0);

const m5 = newMount();
const app5 = mountSuzhouQa(m5 as any, { questions: RAW, enKeywords: KW, seed: 5, recorder: null, asr: mkAsr({ ready: true }) });
await app5.start();
check('无麦克风进 manual', app5.state().items[0].phase === 'manual', app5.state().items[0].phase);
check('提示未检测到麦克风', (app5.state().items[0].error ?? '').indexOf('麦克风') >= 0);
check('无麦克风时横幅仍在', allText(m5).indexOf('近似模拟') >= 0);

const m6 = newMount();
const app6 = mountSuzhouQa(m6 as any, { questions: [], enKeywords: {}, seed: 1, recorder: null, asr: null });
check('空题库挂载成功', app6.view() !== null);
check('空题库给出提示', allText(m6).indexOf('题库未加载') >= 0);
check('空题库仍显示横幅', allText(m6).indexOf('近似模拟') >= 0);

/* ---------- 7. 模型加载 ---------- */
console.log('\n[7] 模型加载');
const m7 = newMount();
const asr7 = mkAsr({ ready: false });
const app7 = mountSuzhouQa(m7 as any, { questions: RAW, enKeywords: KW, seed: 5, recorder: rec, asr: asr7 });
check('未加载时显示加载按钮', allText(m7).indexOf('加载语音转写模型') >= 0);
check('加载成功', (await app7.loadAsr()) === true);
check('就绪后状态 ready', asr7.status().status === 'ready');
const m8 = newMount();
const app8 = mountSuzhouQa(m8 as any, { questions: RAW, enKeywords: KW, seed: 5, recorder: rec, asr: mkAsr({ ready: false, fail: true }) });
check('加载失败返回 false', (await app8.loadAsr()) === false);
check('失败后仍可手动评分', app8.submitText('sorry', 5000) !== null);
check('失败后横幅仍在', allText(m8).indexOf('近似模拟') >= 0);

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
}

void main();
