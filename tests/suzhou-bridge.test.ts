/**
 * 引擎桥接 —— 契约测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点验证「不依赖浏览器与模型权重」时也能验证的行为：
 *  - Node 环境下 createEngineRecorder / createEngineAsr 不抛异常
 *  - 未就绪时 transcribe 必须抛错（由调用方降级），绝不能静默返回空串
 *  - load 失败必须 resolve false 而非 reject
 *  - 模型选项与真实引擎的 ASR_MODELS 一致
 */

import { createEngineRecorder, createEngineAsr, ASR_OPTIONS } from '../src/suzhou/recorder-bridge.ts';
import { ASR_MODELS } from '../src/engine/asr.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

async function main(): Promise<void> {
console.log('=== 引擎桥接 · 契约测试 ===\n');

console.log('[1] Node 环境下的构造安全性');
let rec: any = null;
let asr: any = null;
check('createEngineRecorder 不抛异常', (function () { try { rec = createEngineRecorder(); return true; } catch { return false; } })());
check('createEngineAsr 不抛异常', (function () { try { asr = createEngineAsr(); return true; } catch { return false; } })());
check('recorder 可为 null（无 MediaRecorder）', rec === null || typeof rec.canRecord === 'function', String(rec));
check('asr 在 Node 下仍可构造', asr !== null);

if (rec !== null) {
  check('canRecord 返回布尔', typeof rec.canRecord() === 'boolean', String(rec.canRecord()));
} else {
  console.log('  SKIP  Node 无 MediaRecorder，recorder 为 null（符合预期）');
}

console.log('\n[2] ASR 未就绪时的行为契约');
check('初始 ready() 为 false', asr.ready() === false);
const st = asr.status();
check('初始状态为 idle', st.status === 'idle', st.status);
check('状态含中文说明', typeof st.message === 'string' && st.message.length > 0, st.message);

// 关键契约：未就绪时 transcribe 必须抛错，让调用方能降级
let threw = false;
try {
  await asr.transcribe(new Float32Array([0.1, 0.2]), 16000);
} catch (e) {
  threw = true;
  check('未就绪时抛出的是可读错误', String(e).includes('未加载'), String(e));
}
check('未就绪时 transcribe 抛错而非静默返回', threw === true);

console.log('\n[3] Node 下加载模型必须优雅失败');
const ok = await asr.load('tiny');
check('Node 下 load 返回 false 而非抛出', ok === false);
check('状态标记为 unsupported', asr.status().status === 'unsupported', asr.status().status);
check('给出可读原因', asr.status().message.length > 0, asr.status().message);
check('加载失败后仍可查询状态（不崩）', typeof asr.status().status === 'string');

console.log('\n[4] unload 不抛异常');
check('unload 安全', (function () { try { asr.unload(); return true; } catch { return false; } })());
check('unload 后状态可查', typeof asr.status().status === 'string', asr.status().status);

console.log('\n[5] 模型选项与引擎一致');
const keys = ASR_OPTIONS.map(function (o) { return o.key; });
const engineKeys = Object.keys(ASR_MODELS);
check('选项数量与引擎模型数一致', keys.length === engineKeys.length, keys.join(',') + ' vs ' + engineKeys.join(','));
for (const k of keys) {
  check('选项 ' + k + ' 在引擎中存在', engineKeys.indexOf(k) >= 0);
}
check('默认推荐 base', ASR_OPTIONS.some(function (o) { return o.key === 'base'; }));
check('选项标签均含体积提示', ASR_OPTIONS.every(function (o) { return o.label.includes('MB'); }), ASR_OPTIONS.map(o=>o.label).join(' | '));

console.log('\n=== 结果: ' + pass + ' passed, ' + fail + ' failed ===');
if (fail > 0) process.exit(1);
}

void main();
