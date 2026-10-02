/**
 * ASR 提供方路由 —— 优先用云端（Groq whisper-large-v3），失败降级到浏览器本地 Whisper
 *
 * 许可：AGPL-3.0-only
 *
 * ## ⚠️ 这条红线破了，必须让用户看见
 *
 * ARCHITECTURE §1.2 原文是「**音频不出浏览器**」。
 * 一旦启用云端 ASR，录音会**离开设备**，上传给服务商。
 * 所以：
 *
 *  - 默认不启用。本地 Whisper 永远是兜底，且不配 key 就能跑。
 *  - 启用与否是**用户自己的选择**，界面必须写明「录音会发送到 <服务商>」。
 *  - README / SPEC 里的「音频不出浏览器」要改成有条件的说法，不能继续无条件宣称。
 *
 * 理由与代价对比（不是谁更好的问题，是场景取舍）：
 *
 * | | 云端 whisper-large-v3 | 本地 whisper-base |
 * |---|---|---|
 * | 识别质量 | 明显更好，初中英语场景尤其 | base 档勉强 |
 * | 学生等待 | 几乎没有 | 首跑要下模型 |
 * | 隐私 | ❌ 音频出设备 | ✅ 不出 |
 * | 依赖 | 第三方在线 + 额度 | ModelScope 在线 |
 *
 * 质量换隐私是用户的取舍，不该由产品替用户做。
 *
 * ## 为什么 Groq 用 OpenAI 兼容协议
 *
 * Groq 的转写端点就是 OpenAI 兼容的 /audio/transcriptions，
 * 所以加新服务商只要再加一条配置，不需要新的调用代码。
 *
 * ## 尚未验证的
 *
 * **Groq 转写端点的 CORS 策略未经实测。** 浏览器直连需要
 * `Access-Control-Allow-Origin` 放行。若不允许，就只能走自建中转，
 * 那会破坏「零服务端」，届时必须回头告知用户而不是默默失败。
 * 本模块把 fetch 注入点留出来，便于加中转。
 */

import { transcribe as engineTranscribe, ASR_MODELS, type AsrModelKey } from './asr.ts';

export type AsrProviderId = 'groq' | 'local';

export interface AsrInput {
  samples: Float32Array;
  sampleRate: number;
}

export interface AsrOutput {
  text: string;
  durationMs: number;
  providerId: string;
  providerName: string;
  /** 服务端原始返回，排障用 */
  raw?: unknown;
}

export interface AsrSettings {
  /** 云端 key；为空则该 provider 不参与路由 */
  groqApiKey: string;
  /**
   * 云端 base URL，**必须可配**。
   *
   * 直连 api.groq.com 在中国大陆**必然 403 Forbidden**（实测：
   * 不带任何认证也返回 403，而正常 OpenAI 兼容端点无认证应是 401），
   * DNS 解析到 Cloudflare 正常 IP，不是投毒 —— 是边缘层面的地域拦截。
   * 本项目用户全在苏州，所以必须走反代，把这里填成反代地址即可。
   */
  groqBaseUrl: string;
  /** whisper-large-v3 / whisper-large-v3-turbo / 等服务端支持的档位 */
  groqModel: string;
  localModel: AsrModelKey;
}

export interface AsrContext {
  settings: AsrSettings;
  /** 注入点：换域、加重试、或将来加中转都走这里 */
  fetchImpl?: typeof fetch;
}

export interface AsrProvider {
  id: AsrProviderId;
  name: string;
  /** 音频是否会离开浏览器。UI 必须据此提示用户 */
  leavesBrowser: boolean;
  usable(ctx: AsrContext): boolean;
  /** 没配置好时，告诉用户缺什么 */
  requirement: string;
  transcribe(input: AsrInput, ctx: AsrContext): Promise<AsrOutput>;
}

/* ------------------------------------------------------------------ *
 * WAV 封装（云端上传要用）
 * ------------------------------------------------------------------ */

/**
 * Float32 PCM → 16bit WAV 容器（单声道）。
 *
 * 纯函数，无浏览器 API，Node 里可完整验证。
 * 云端转写端点只收 WAV/FLAC/MP3 等封装格式，不收裸 PCM。
 */
export function encodeWavPcm16(samples: Float32Array, sampleRate: number): Uint8Array {
  const dataBytes = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buf);

  const str = (off: number, s: string): void => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  str(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  view.setUint32(16, 16, true);        // fmt chunk 固定 16 字节
  view.setUint16(20, 1, true);         // PCM
  view.setUint16(22, 1, true);         // 单声道
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate = 采样率 × 声道 × 2
  view.setUint16(32, 2, true);         // block align
  view.setUint16(34, 16, true);        // 位深
  str(36, 'data');
  view.setUint32(40, dataBytes, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++) {
    // 夹到 [-1,1] 再放大，否则越界会被截成削波失真
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Uint8Array(buf);
}

/* ------------------------------------------------------------------ *
 * 云端 provider（OpenAI 兼容）
 * ------------------------------------------------------------------ */

/** 官方直连地址。国内直连必 403，仅作默认值。 */
export const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/** 拼转写端点。base 末尾有无斜杠都能用。 */
export function transcribeUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '') + '/audio/transcriptions';
}

/** 默认直连的转写端点（保留旧名，供测试与文档引用） */
export const GROQ_TRANSCRIBE_URL = transcribeUrl(GROQ_BASE_URL);

/** Groq 上可选的转写模型。turbo 大约快 4 倍、体积小，优先推荐。 */
export const GROQ_ASR_MODELS = ['whisper-large-v3-turbo', 'whisper-large-v3'] as const;

export interface GroqOptions {
  id?: AsrProviderId;
  name?: string;
  url?: string;
}

export function createGroqAsrProvider(opts: GroqOptions = {}): AsrProvider {
  const id = opts.id ?? 'groq';
  const name = opts.name ?? 'Groq 云端转写';
  // 优先级：settings 里配的 baseUrl（反代） > 构造参数 > 官方直连
  const baseOf = (s: { groqBaseUrl?: string }): string =>
    (s.groqBaseUrl && s.groqBaseUrl.trim()) || opts.url || GROQ_BASE_URL;

  return {
    id: id,
    name: name,
    leavesBrowser: true,

    usable(ctx) {
      return ctx.settings.groqApiKey.trim().length > 0;
    },
    requirement: '需要填写 Groq API key。录音会发送到 Groq 服务器。',

    async transcribe(input, ctx) {
      const doFetch = ctx.fetchImpl ?? globalThis.fetch;
      if (typeof doFetch !== 'function') {
        throw new Error('当前环境没有 fetch，无法调用云端转写。');
      }
      const form = new FormData();
      const wav = encodeWavPcm16(input.samples, input.sampleRate);
      // 显式拷进新的 ArrayBuffer：encodeWavPcm16 的返回类型带 ArrayBufferLike，
      // TS 的 BlobPart 要求 BufferSource，这里不接受可能是 SharedArrayBuffer 的视图。
      const wavBytes = new Uint8Array(wav.byteLength);
      wavBytes.set(wav);
      form.append('file', new Blob([wavBytes.buffer], { type: 'audio/wav' }), 'answer.wav');
      form.append('model', ctx.settings.groqModel || GROQ_ASR_MODELS[0]);
      form.append('response_format', 'json');

      const res = await doFetch(transcribeUrl(baseOf(ctx.settings)), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + ctx.settings.groqApiKey.trim() },
        body: form,
      });

      if (!res.ok) {
        const detail = await safeText(res);
        // 429 = 免费额度用尽/限流；401 = key 不对。都应触发降级而不是直接崩
        throw new Error(name + ' 返回 ' + res.status + (detail ? '：' + detail.slice(0, 160) : ''));
      }

      const json = (await res.json()) as { text?: unknown };
      const text = typeof json.text === 'string' ? json.text.trim() : '';
      return {
        text: text,
        durationMs: Math.round((input.samples.length / input.sampleRate) * 1000),
        providerId: id,
        providerName: name,
        raw: json,
      };
    },
  };
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ''; }
}

/* ------------------------------------------------------------------ *
 * 本地 provider
 * ------------------------------------------------------------------ */

export function createLocalAsrProvider(): AsrProvider {
  return {
    id: 'local',
    name: '浏览器本地 Whisper',
    leavesBrowser: false,

    // 不需要 key，随时可用 —— 这正是它作为兜底的意义
    usable() { return true; },
    requirement: '无需配置。首次使用需下载模型。',

    async transcribe(input, ctx) {
      const r = await engineTranscribe(input.samples, input.sampleRate);
      const text = (r.text ?? '').trim();
      return {
        text: text,
        durationMs: r.durationMs ?? Math.round((input.samples.length / input.sampleRate) * 1000),
        providerId: 'local',
        providerName: '浏览器本地 Whisper',
        raw: r,
      };
    },
  };
}

/** 本地 provider 的模型清单，供设置页展示 */
export function localModelOptions(): Array<{ key: AsrModelKey; label: string; model: string }> {
  return (Object.keys(ASR_MODELS) as AsrModelKey[]).map(function (k) {
    return { key: k, label: k, model: ASR_MODELS[k] };
  });
}

/* ------------------------------------------------------------------ *
 * 路由
 * ------------------------------------------------------------------ */

export interface AsrAttempt {
  id: string;
  name: string;
  ok: boolean;
  reason: string;
}

export interface AsrRouter {
  /** 依次尝试直到有一个成功；全失败则抛，错误里带全部原因 */
  transcribe(input: AsrInput, ctx: AsrContext): Promise<AsrOutput>;
  attempts(): AsrAttempt[];
  /** 上一次实际用上的 provider；未成功则 null */
  lastUsed(): AsrProviderId | null;
}

export interface RouterOptions {
  /** 按优先级排列。默认：云端优先，本地兜底 */
  providers?: AsrProvider[];
  /** 每换一次 provider 回调一次，UI 可提示「已降级到本地」 */
  onFallback?: (from: AsrProviderId, to: AsrProviderId, reason: string) => void;
}

export function createAsrRouter(opts: RouterOptions = {}): AsrRouter {
  const providers = opts.providers ?? [createGroqAsrProvider(), createLocalAsrProvider()];
  const log: AsrAttempt[] = [];
  let used: AsrProviderId | null = null;

  return {
    async transcribe(input, ctx) {
      log.length = 0;
      used = null;
      const reasons: string[] = [];

      for (let i = 0; i < providers.length; i++) {
        const p = providers[i];
        if (!p.usable(ctx)) {
          log.push({ id: p.id, name: p.name, ok: false, reason: p.requirement });
          reasons.push(p.name + '：' + p.requirement);
          continue;
        }
        try {
          const out = await p.transcribe(input, ctx);
          used = p.id;
          log.push({ id: p.id, name: p.name, ok: true, reason: '' });
          return out;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          log.push({ id: p.id, name: p.name, ok: false, reason: msg });
          reasons.push(p.name + '：' + msg);
          const next = providers[i + 1];
          if (next && opts.onFallback) opts.onFallback(p.id, next.id, msg);
        }
      }
      throw new Error('所有转写途径都失败：' + reasons.join('；'));
    },
    attempts() { return log.slice(); },
    lastUsed() { return used; },
  };
}