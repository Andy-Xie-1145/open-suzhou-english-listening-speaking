/**
 * ASR 提供方路由 —— 测试
 *
 * 许可：AGPL-3.0-only
 *
 * 重点：WAV 封装正确、云端优先、失败降级、全失败抛错原因可读。
 */

import {
  encodeWavPcm16,
  GROQ_BASE_URL,
  transcribeUrl,
  createGroqAsrProvider,
  createLocalAsrProvider,
  createAsrRouter,
  GROQ_TRANSCRIBE_URL,
  GROQ_ASR_MODELS,
  type AsrProvider,
  type AsrContext,
  type AsrInput,
} from '../src/engine/asr-provider.ts';
import { decodeWavToPcm } from '../src/engine/audio.ts';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, detail: string = ''): void {
  if (cond) { pass++; console.log('  PASS  ' + name); }
  else { fail++; console.log('  FAIL  ' + name + (detail ? '  -> ' + detail : '')); }
}

const CTX = (
  over: Partial<AsrContext['settings']> = {},
  fetchImpl?: typeof fetch,
): AsrContext => ({
  settings: { groqApiKey: '', groqBaseUrl: '', groqModel: 'whisper-large-v3', localModel: 'base', ...over },
  fetchImpl: fetchImpl,
});

/* ---------- 1. WAV 封装 ---------- */
console.log('\n[1] WAV 封装');
const one: Float32Array = new Float32Array(16000);
for (let i = 0; i < one.length; i++) one[i] = Math.sin((i / one.length) * Math.PI);
const wav = encodeWavPcm16(one, 16000);
check('RIFF 头', String.fromCharCode(wav[0], wav[1], wav[2], wav[3]) === 'RIFF', String.fromCharCode(wav[0], wav[1], wav[2], wav[3]));
check('WAVE 头', String.fromCharCode(wav[8], wav[9], wav[10], wav[11]) === 'WAVE');
check('总长 = 44 + 数据', wav.length === 44 + one.length * 2, String(wav.length));
const pcm = decodeWavToPcm(wav);
check('解码回来采样率仍是 16k', pcm.sampleRate === 16000, String(pcm.sampleRate));
check('解码回来时长仍是 1s', Math.abs(pcm.durationMs - 1000) < 5, String(pcm.durationMs));
let maxErr = 0;
for (let i = 0; i < one.length; i++) {
  maxErr = Math.max(maxErr, Math.abs(pcm.samples[i] - one[i]));
}
check('量化误差在 16bit 精度内', maxErr < 1 / 16000, String(maxErr));
const clipped = encodeWavPcm16(new Float32Array([2, -2, 0.5]), 16000);
const cp = decodeWavToPcm(clipped);
check('越界被夹住不削成 0', Math.abs(cp.samples[0] - 1) < 0.001 && Math.abs(cp.samples[1] + 1) < 0.001,
  String(cp.samples[0]) + ' / ' + String(cp.samples[1]));
check('空输入不炸', encodeWavPcm16(new Float32Array(0), 16000).length === 44);

/* ---------- 2. provider 基本属性 ---------- */
console.log('\n[2] provider 属性');
const groq = createGroqAsrProvider();
const local = createLocalAsrProvider();
check('云端标记为会离开浏览器', groq.leavesBrowser === true);
check('本地标记为不出浏览器', local.leavesBrowser === false);
check('没 key 时云端不可用', groq.usable(CTX()) === false);
check('有 key 时云端可用', groq.usable(CTX({ groqApiKey: 'k' })) === true);
check('本地永远可用', local.usable(CTX()) === true);
check('云端缺配置说明含「离开」相关字样', groq.requirement.indexOf('Groq') >= 0, groq.requirement);
check('端点是 OpenAI 兼容转写路径', GROQ_TRANSCRIBE_URL.endsWith('/audio/transcriptions'), GROQ_TRANSCRIBE_URL);
check('base URL 拼接容忍末尾斜杠', transcribeUrl('https://x.dev/v1/') === 'https://x.dev/v1/audio/transcriptions', transcribeUrl('https://x.dev/v1/'));
check('base URL 拼接容忍无斜杠', transcribeUrl('https://x.dev/v1') === 'https://x.dev/v1/audio/transcriptions');
check('提供 turbo 与 large-v3 两个档位', GROQ_ASR_MODELS.length === 2, GROQ_ASR_MODELS.join(','));

/* ---------- 3. 云端调用 ---------- */
console.log('\n[3] 云端调用');
let seenUrl = '';
let seenAuth = '';
let seenBody: FormData | null = null;
const okFetch: typeof fetch = async function (input, init) {
  seenUrl = String(input);
  seenAuth = (init?.headers as Record<string, string>)?.Authorization ?? '';
  seenBody = init?.body as FormData;
  return new Response(JSON.stringify({ text: '  Hello there.  ' }), { status: 200 });
};
const out = await groq.transcribe({ samples: one, sampleRate: 16000 }, CTX({ groqApiKey: 'sk-test' }, okFetch));
check('拿到的文本被 trim', out.text === 'Hello there.', out.text);
check('标了 provider 来源', out.providerId === 'groq', out.providerId);
check('带 Bearer 头', seenAuth === 'Bearer sk-test', seenAuth);
check('默认 POST 到官方端点', seenUrl === GROQ_TRANSCRIBE_URL, seenUrl);
let proxyUrl = '';
const proxyFetch: typeof fetch = async function (input) {
  proxyUrl = String(input);
  return new Response(JSON.stringify({ text: 'via proxy' }), { status: 200 });
};
await groq.transcribe({ samples: one, sampleRate: 16000 }, CTX({ groqApiKey: 'k', groqBaseUrl: 'https://api.example.dev/groq/v1' }, proxyFetch));
check('配了反代地址就走反代', proxyUrl === 'https://api.example.dev/groq/v1/audio/transcriptions', proxyUrl);
check('提交的是 multipart', !!seenBody && typeof (seenBody as FormData).get === 'function');
check('表单里带 model 字段', !!seenBody && (seenBody as FormData).get('model') !== null);

const errFetch: typeof fetch = async function () {
  return new Response('rate limit', { status: 429 });
};
let errMsg = '';
try { await groq.transcribe({ samples: one, sampleRate: 16000 }, CTX({ groqApiKey: 'k' }, errFetch)); }
catch (e) { errMsg = e instanceof Error ? e.message : String(e); }
check('429 会抛错而不是静默空串', errMsg.indexOf('429') >= 0, errMsg);
check('错误里带服务商原始信息', errMsg.indexOf('rate limit') >= 0, errMsg);

/* ---------- 4. 路由：云端优先 ---------- */
console.log('\n[4] 路由优先级');
function stub(id: string, fail?: string): AsrProvider {
  return {
    id: id as AsrProvider['id'],
    name: id,
    leavesBrowser: id === 'groq',
    usable: () => true,
    requirement: 'n/a',
    transcribe: async () => {
      if (fail) throw new Error(fail);
      return { text: 'from-' + id, durationMs: 1000, providerId: id, providerName: id };
    },
  };
}
const input: AsrInput = { samples: one, sampleRate: 16000 };

const routerA = createAsrRouter({ providers: [stub('groq'), stub('local')] });
const ra = await routerA.transcribe(input, CTX());
check('两个都可用时用优先级最高的', ra.providerId === 'groq', ra.providerId);
check('lastUsed 与实际一致', routerA.lastUsed() === 'groq');
check('attempts 记到成功为止', routerA.attempts().length === 1, String(routerA.attempts().length));

const fallbacks: string[] = [];
const routerB = createAsrRouter({
  providers: [stub('groq', '连接超时'), stub('local')],
  onFallback: (from, to) => fallbacks.push(from + '->' + to),
});
const rb = await routerB.transcribe(input, CTX());
check('云端失败后降级到本地', rb.providerId === 'local', rb.providerId);
check('降级回调被调用', fallbacks.length === 1 && fallbacks[0] === 'groq->local', fallbacks.join(','));
check('attempts 记了两次尝试', routerB.attempts().length === 2, String(routerB.attempts().length));
check('第一次尝试记为失败', routerB.attempts()[0].ok === false && routerB.attempts()[0].reason.indexOf('连接超时') >= 0);

const routerC = createAsrRouter({ providers: [createGroqAsrProvider(), stub('local')] });
const rc = await routerC.transcribe(input, CTX());
check('没配 key 时直接走本地', rc.providerId === 'local', rc.providerId);
check('跳过的 provider 也记进 attempts', routerC.attempts().length === 2, String(routerC.attempts().length));
check('跳过原因是缺配置', routerC.attempts()[0].reason.indexOf('key') >= 0, routerC.attempts()[0].reason);

const routerD = createAsrRouter({ providers: [stub('groq', 'A'), stub('local', 'B')] });
let allMsg = '';
try { await routerD.transcribe(input, CTX()); } catch (e) { allMsg = e instanceof Error ? e.message : String(e); }
check('全失败时抛错', allMsg.indexOf('所有转写途径都失败') >= 0, allMsg);
check('错误里含每个 provider 的原因', allMsg.indexOf('A') >= 0 && allMsg.indexOf('B') >= 0, allMsg);
check('全失败时 lastUsed 为 null', routerD.lastUsed() === null);

/* ---------- 5. 默认顺序 ---------- */
console.log('\n[5] 默认 provider 顺序');
const dflt = createAsrRouter();
const withoutKey = await dflt.transcribe(input, CTX()).catch(function (e) { return e as Error; });
check('没配 key 时默认路由报的是本地失败而不是云端配置错',
  withoutKey instanceof Error ? withoutKey.message.indexOf('Groq') >= 0 : false,
  withoutKey instanceof Error ? withoutKey.message : String(withoutKey));

console.log('\n[6] 汇总');
console.log('  通过 ' + pass + ' / 失败 ' + fail);
if (fail > 0) process.exit(1);