/**
 * 真机自检 —— 逻辑测试
 *
 * 许可：AGPL-3.0-only
 *
 * 能测的：失败归类、补救文案、报告组装、「失败不阻断后续」。
 * **不能测的：真实 getUserMedia / MediaRecorder / Whisper 推理**——
 * 那些必须在真浏览器里点一次，测试用桩替代不代表真机可用。
 */

import {
  classifyMicFailure,
  classifyNetworkFailure,
  classifyWasmFailure,
  MIC_REMEDIES,
  NETWORK_REMEDIES,
  WASM_REMEDIES,
  buildReport,
  runSelfCheck,
  CHECK_LABELS,
  type CheckResultItem,
  type MicFailure,
  type NetFailure,
  type WasmFailure,
  type CheckId,
  type CheckStatus,
} from '../src/suzhou/selfcheck.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

function errWithName(n: string, msg?: string): Error {
  const e: any = new Error(msg === undefined ? n : msg);
  e.name = n;
  return e;
}
console.log('=== 真机自检 · 逻辑测试 ===');

/* ---------------- 1. 麦克风失败归类 ---------------- */
console.log('[1] 麦克风失败归类');
check('权限被拒 → denied', classifyMicFailure(errWithName('NotAllowedError')) === 'denied');
check('无设备 → notfound', classifyMicFailure(errWithName('NotFoundError')) === 'notfound');
check('设备被占 → inuse', classifyMicFailure(errWithName('NotReadableError')) === 'inuse');
check('安全上下文 → insecure', classifyMicFailure(errWithName('SecurityError')) === 'insecure');
check('中文消息也能归类', classifyMicFailure(new Error('麦克风权限被拒绝')) === 'denied');
check('未知错误 → unknown', classifyMicFailure(new Error('something else')) === 'unknown');
const micKeys: MicFailure[] = ['denied','notfound','inuse','insecure','unsupported','unknown'];
check('每类麦克风失败都有补救', micKeys.every(function (k) { return MIC_REMEDIES[k].length > 0; }));
check('权限被拒的补救提到设置', MIC_REMEDIES.denied.some(function (s) { return s.includes('允许') || s.includes('设置'); }));
check('无设备的补救提到麦克风', MIC_REMEDIES.notfound.some(function (s) { return s.includes('麦克风'); }));
check('设备被占的补救提到关闭程序', MIC_REMEDIES.inuse.some(function (s) { return s.includes('关闭'); }));
check('非安全上下文的补救提到 https', MIC_REMEDIES.insecure.some(function (s) { return s.includes('https') || s.includes('localhost'); }));

/* ---------------- 2. 网络失败归类 ---------------- */
console.log('\n[2] 网络失败归类');
check('fetch 失败 → incomplete', classifyNetworkFailure(new Error('Failed to fetch')) === 'incomplete');
check('404 → notfound', classifyNetworkFailure(new Error('404')) === 'notfound');
check('403/限流 → forbidden', classifyNetworkFailure(new Error('403 rate limit')) === 'forbidden');
check('中断的补救提到断点续传', NETWORK_REMEDIES.incomplete.some(function (s) { return s.includes('断点续传'); }));
const netKeys: NetFailure[] = ['offline','blocked','incomplete','notfound','forbidden','unknown'];
check('每类网络失败都有补救', netKeys.every(function (k) { return NETWORK_REMEDIES[k].length > 0; }));

/* ---------------- 3. WASM 失败归类 ---------------- */
console.log('\n[3] WASM 失败归类');
check('内存不足 → memory', classifyWasmFailure(new Error('Out of memory')) === 'memory');
check('编译错误 → notsupported', classifyWasmFailure(new Error('failed to compile wasm')) === 'notsupported');
check('下载问题 → network', classifyWasmFailure(new Error('network error during download')) === 'network');
check('CompileError → notsupported', classifyWasmFailure(errWithName('CompileError')) === 'notsupported');
check('内存不足的补救提到 tiny', WASM_REMEDIES.memory.some(function (s) { return s.includes('tiny'); }));
check('WASM 不可用的补救提到版本', WASM_REMEDIES.notsupported.some(function (s) { return s.includes('更新') || s.includes('版本'); }));

/* ---------------- 4. 报告组装 ---------------- */
console.log('\n[4] 报告组装');
const mk = function (id: CheckId, status: CheckStatus): CheckResultItem {
  return { id: id, label: CHECK_LABELS[id], status: status, summary: 's', remedies: [] };
};

const empty = buildReport([]);
check('空报告未通过', empty.allPassed === false);
check('空报告提示未运行', empty.verdict.indexOf('尚未运行') >= 0, empty.verdict);

const allOk = buildReport([mk('environment','pass'), mk('microphone','pass'), mk('transcribe','pass')]);
check('全通过判定正确', allOk.allPassed === true);
check('全通过无 firstFailure', allOk.firstFailure === null);
check('全通过结论为肯定', allOk.verdict.indexOf('全部通过') >= 0, allOk.verdict);

const withSkip = buildReport([mk('environment','pass'), mk('capture','skip'), mk('transcribe','pass')]);
check('skip 不算失败', withSkip.allPassed === true);
check('skip 时结论提到跳过项', withSkip.verdict.indexOf('跳过') >= 0, withSkip.verdict);

const withFail = buildReport([mk('environment','pass'), mk('microphone','fail'), mk('transcribe','pass')]);
check('有失败则不通过', withFail.allPassed === false);
check('首个失败被定位', withFail.firstFailure === 'microphone', String(withFail.firstFailure));
check('结论点名失败环节', withFail.verdict.indexOf(CHECK_LABELS.microphone) >= 0, withFail.verdict);
/* ---------------- 5. 失败不阻断后续（核心设计） ---------------- */
console.log('\n[5] 失败不阻断后续');

async function main(): Promise<void> {

  // Node 下没有 navigator/window，各环会走 skip 或 fail，
  // 但必须每一环都被报告，不能中途 return。
  const seen: string[] = [];
  const r1 = await runSelfCheck({ recorder: null, asr: null }, function (it) { seen.push(it.id); });
  console.log('  [无浏览器/无依赖] 环节：' + seen.join(', '));
  check('报告覆盖多个环节', seen.length >= 3, String(seen.length));
  check('包含 microphone 环节', seen.indexOf('microphone') >= 0);
  check('包含 capture 环节', seen.indexOf('capture') >= 0);
  check('包含 recording 环节', seen.indexOf('recording') >= 0);
  check('包含 wasm 环节', seen.indexOf('wasm') >= 0);
  check('包含 transcribe 环节', seen.indexOf('transcribe') >= 0);
  check('每项都有中文标签', r1.items.every(function (i) { return typeof i.label === 'string' && i.label.length > 0; }));
  const noRemedy = r1.items.filter(function (i) { return i.status === 'fail' && i.remedies.length === 0; });
  check('失败项必须带补救步骤', noRemedy.length === 0, noRemedy.map(function (i) { return i.id; }).join(','));

  // 录音不可用 + ASR 加载失败：transcribe 应被 skip 而非 fail（依赖关系正确）
  const seen2: string[] = [];
  const noRec = {
    canRecord: function () { return false; },
    start: async function () { throw new Error('not called'); },
    stop: async function () { return { samples: new Float32Array(0), sampleRate: 16000, durationMs: 0 }; },
  };
  const failAsr = {
    ready: function () { return false; },
    status: function () { return { status: 'idle', percent: 0, message: '未加载' }; },
    load: async function () { return false; },
    transcribe: async function () { throw new Error('not called'); },
  };
  const r2 = await runSelfCheck({ recorder: noRec, asr: failAsr }, function (it) { seen2.push(it.id); });
  console.log('  [录音不可用+ASR失败] 环节：' + seen2.join(', '));
  const modelItem = r2.items.filter(function (i) { return i.id === 'model'; })[0];
  check('model 判为失败', Boolean(modelItem && modelItem.status === 'fail'), modelItem ? modelItem.status : 'none');
  check('model 失败带补救', Boolean(modelItem && modelItem.remedies.length > 0));
  const txItem = r2.items.filter(function (i) { return i.id === 'transcribe'; })[0];
  check('transcribe 因依赖失败被 skip', Boolean(txItem && txItem.status === 'skip'), txItem ? txItem.status : 'none');
  check('skip 项说明跳过原因', Boolean(txItem && (txItem.summary.indexOf('模型') >= 0 || txItem.summary.indexOf('依赖') >= 0)), txItem ? txItem.summary : '');

  const throwAsr = {
    ready: function () { return false; },
    status: function () { return { status: 'idle', percent: 0, message: '' }; },
    load: async function () { throw new Error('WASM 崩溃'); },
    transcribe: async function () { throw new Error('never'); },
  };
  const r3 = await runSelfCheck({ recorder: noRec, asr: throwAsr }, function () { /* ignore */ });
  check('load 抛异常被捕获', r3.items.every(function (i) { return typeof i.status === 'string'; }));
  const tModel = r3.items.filter(function (i) { return i.id === 'model'; })[0];
  check('抛异常时 model 判为 fail', Boolean(tModel && tModel.status === 'fail'), tModel ? tModel.status : 'none');
  check('抛异常信息被保留', Boolean(tModel && String(tModel.detail || '').indexOf('WASM') >= 0), tModel ? String(tModel.detail) : '');

  console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
  if (fail > 0) process.exit(1);
}

void main();