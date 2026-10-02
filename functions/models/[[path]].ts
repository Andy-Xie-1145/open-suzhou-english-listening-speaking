/**
 * 同源模型代理 —— Pages Function 挂 R2 binding
 *
 * 许可：AGPL-3.0-only
 *
 * ## 存在理由
 *
 * transformers.js 拉权重用的是 `fetch()`，跨源。
 * 若开启 COEP: require-corp，跨源子资源要么发 CORP，要么同源。
 * ModelScope / hf-mirror 都不发 `Cross-Origin-Resource-Policy`，
 * 靠它们的响应头做 CORP 放行，等于把可用性押在别人身上。
 *
 * 把权重放进自己的 R2、由 Pages Function 转发，路径就变成**同源**，
 * COEP 下无条件放行，不依赖任何第三方响应头。
 *
 * ## 键名约定
 *
 * R2 key 与 ModelScope 的 URL 路径**逐字一致**：
 *
 *     ModelScope: https://www.modelscope.cn/models/{model}/resolve/master/{file}
 *     R2 key:     models/{model}/resolve/master/{file}
 *
 * 切换源只需换 host，模板一个字不用改，缓存也不用迁移。
 *
 * ## 安全
 *
 * - `..`、空前缀一律拒绝
 * - 只读：没有 PUT/DELETE 分支，改桶只能走 CLI
 * - CORP: cross-origin —— 即使将来退回跨源部署，这行也让 COEP 放行
 *
 * 类型全部取自 @cloudflare/workers-types，不自造接口，
 * 这样 `npm run typecheck:fn` 才真的在校验 R2 API 用法对不对。
 */

interface Env {
  MODELS?: R2Bucket;
}

const MIME: Record<string, string> = {
  json: 'application/json; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
  onnx: 'application/octet-stream',
  bin: 'application/octet-stream',
  data: 'application/octet-stream',
};

function mimeOf(key: string): string {
  const dot = key.lastIndexOf('.');
  const ext = dot < 0 ? '' : key.slice(dot + 1).toLowerCase();
  return MIME[ext] ?? 'application/octet-stream';
}

/** 跨源读取 + COEP 放行所需的头 */
const ALLOW: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, ETag, Last-Modified',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...ALLOW, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * 解析 Range 头。
 *
 * R2 的 `get(key, { range })` 要的是 `R2Range` **对象**，不是原始字符串，
 * 也不能直接塞 Headers。所以必须自己解析 `bytes=start-end`。
 * 忽略非法 Range（返回 undefined = 当作整段取）比抛 416 更稳。
 */
function parseRange(header: string): R2Range | undefined {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return undefined;
  const start = m[1];
  const end = m[2];
  if (start === '' && end === '') return undefined;
  if (start === '') return { suffix: Number(end) };
  return { offset: Number(start), length: end === '' ? undefined : Number(end) - Number(start) + 1 };
}

/**
 * 拼 Content-Range 响应头。
 *
 * 注意 `R2ObjectBody.range` 是**请求回显的对象**，不是 Content-Range 字符串，
 * 直接 headers.set 会塞进 "[object Object]"。所以只能自己按
 * 「请求的范围 + 本次实际返回的字节数」算。
 */
function contentRange(want: R2Range, size: number): string {
  const r = want as { offset?: number; length?: number; suffix?: number };
  const off = typeof r.offset === 'number'
    ? r.offset
    : Math.max(0, size - (typeof r.suffix === 'number' ? r.suffix : size));
  const end = off + Math.max(0, size) - 1;
  return 'bytes ' + off + '-' + end;
}

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { ...ALLOW, 'Access-Control-Max-Age': '86400' } });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { ...ALLOW, Allow: 'GET, HEAD, OPTIONS' },
    });
  }

  const bucket = env.MODELS;
  if (!bucket) {
    return json(503, {
      error: 'models_bucket_missing',
      message: 'R2 桶尚未开通，或 wrangler.jsonc 里没有绑定 MODELS。',
    });
  }

  // [[path]] 的 params 在不同 runtime 版本里可能是 string 或 string[]
  const raw = params.path as string | string[] | undefined;
  const parts = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const key = parts.join('/');
  if (!key || key.startsWith('/') || key.includes('..')) {
    return json(400, { error: 'bad_key', key });
  }

  const range = request.headers.get('Range');
  const want = range ? parseRange(range) : undefined;
  let object: R2ObjectBody | null = null;
  try {
    object = want ? await bucket.get(key, { range: want }) : await bucket.get(key);
  } catch (e) {
    // R2 对非法 Range 抛 RangeNotSatisfiableError
    return json(416, { error: 'range_not_satisfiable', range, detail: String(e) });
  }
  if (!object) return json(404, { error: 'not_found', key });

  const headers = new Headers(ALLOW);
  headers.set('Content-Type', object.httpMetadata?.contentType ?? mimeOf(key));
  headers.set('Accept-Ranges', 'bytes');
  headers.set('ETag', object.httpEtag);
  headers.set('Last-Modified', object.uploaded.toUTCString());
  // key 里带的是 master（可移动分支），内容不保证永不变，故不给 immutable。
  // 靠 ETag 条件请求省流量就够了。
  headers.set('Cache-Control', object.httpMetadata?.cacheControl ?? 'public, max-age=600, s-maxage=86400');

  // 带 Range 取到的是切片：object.size 是这一段的长度，不是整文件长度
  if (want) {
    headers.set('Content-Range', contentRange(want, object.size));
    headers.set('Content-Length', String(object.size));
    return new Response(request.method === 'HEAD' ? null : object.body, { status: 206, headers });
  }

  headers.set('Content-Length', String(object.size));
  return new Response(request.method === 'HEAD' ? null : object.body, { status: 200, headers });
};