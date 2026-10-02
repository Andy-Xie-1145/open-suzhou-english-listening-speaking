/**
 * 模型源配置 —— 把 transformers.js 的默认远端从 huggingface.co 改为国内可达源
 *
 * 许可：AGPL-3.0-only
 *
 * ## 背景
 *
 * transformers.js 默认从 https://huggingface.co/ 拉模型权重。
 * 实测（2026-09，大陆网络）：huggingface.co 的 DNS 被投毒到 199.16.156.7（Twitter 网段），
 * TCP 443 不通 —— 默认配置在国内完全不可用。
 *
 * ## 为什么不需要自己托管权重
 *
 * 本项目从不打包模型权重（dist 里没有任何 onnx/bin 文件）。
 * 权重体积大（音素模型 q8 就 303MB），自建托管要 ICP 备案、要担带宽、
 * 还要做完整性校验，而公开源已经提供直链 + CDN + Range 支持。
 * 自己存一份是纯粹的重复劳动。
 *
 * 调研实测的三个候选：
 *
 * | 源 | 实测 | 结论 |
 * |---|---|---|
 * | huggingface.co | DNS 投毒，443 不通 | 不可用 |
 * | modelscope.cn | 5-9 MB/s，ACAO=*，支持 Range | 主用 |
 * | hf-mirror.com | 3.13-13.19 MB/s，ACAO 正确回显 | 备用（志愿者服务，无 SLA） |
 *
 * ## 三级降级
 *
 * 主源失败自动切备用，再失败给出手动指定入口。
 * 不做硬绑定 —— 某个源挂了不该让整个产品不可用。
 */

import { env } from '@huggingface/transformers';

export interface ModelSource {
  name: string;
  host: string;
  /** 路径模板，{model} 会被替换成 onnx-community/xxx 这类仓库名 */
  template: string;
}

/** 按优先级排列的模型源 */
export const MODEL_SOURCES: ModelSource[] = [
  {
    name: 'ModelScope（国内）',
    host: 'https://www.modelscope.cn/',
    template: 'models/{model}/resolve/master/',
  },
  {
    name: 'hf-mirror（备用）',
    host: 'https://hf-mirror.com/',
    template: '{model}/resolve/{revision}/',
  },
];

/** 当前生效的源下标 */
let active = 0;

export function activeSource(): ModelSource {
  return MODEL_SOURCES[Math.min(active, MODEL_SOURCES.length - 1)];
}

/** 把 transformers.js 的远端切到指定源 */
export function applySource(index: number): ModelSource {
  const clamped = Math.max(0, Math.min(index, MODEL_SOURCES.length - 1));
  const src = MODEL_SOURCES[clamped];
  env.remoteHost = src.host;
  env.remotePathTemplate = src.template;
  active = clamped;
  return src;
}

/** 初始化：默认用主源（国内可达） */
export function initModelSource(): ModelSource {
  return applySource(0);
}
/**
 * 下载失败时切到下一个源并重试。
 *
 * 背景：调研实测 Cloudflare 在大陆存在非确定性阻断 ——
 * 同一个 25MB 请求，第一次 45 秒超时、第二次 11.53 MB/s 成功；
 * GFW 也会做概率性 TCP RST 注入。换源 + 重试是对这类抖动最直接的对策。
 */
export async function withSourceRetry<T>(fn: () => Promise<T>, attempts: number = 2): Promise<T> {
  let lastErr: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (active + 1 < MODEL_SOURCES.length) applySource(active + 1);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}