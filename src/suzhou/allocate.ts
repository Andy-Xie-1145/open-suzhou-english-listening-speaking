/**
 * 最大余数法分配 —— 时长在题量之间按权重整分
 *
 * 许可：AGPL-3.0-only
 *
 * ## 为什么要单独成文件
 *
 * `paper.ts`（组卷）与 `listening-spec.ts`（听力子结构）都要用它。
 * 若放在 paper.ts 里让后者 import，会形成环 —— 后者会被前者 import。
 * 中立模块两侧都能依赖，没有环。
 *
 * ## 为什么不用简单除法
 *
 * 直接按比例取整必然丢或多，合计对不上总时长。
 * 考场时间轴要求 **合计严格等于总量**，所以必须用最大余数法补齐。
 */

export function allocate<T extends string>(
  weights: Record<T, number>,
  total: number,
): Record<T, number> {
  const keys = Object.keys(weights) as T[];
  const sum = keys.reduce(function (a, k) { return a + Math.max(0, weights[k]); }, 0);
  const out = {} as Record<T, number>;
  if (sum <= 0 || total <= 0) {
    for (const k of keys) out[k] = 0;
    return out;
  }

  const exact = keys.map(function (k) {
    return { k: k, v: (Math.max(0, weights[k]) / sum) * total };
  });

  let acc = 0;
  for (const e of exact) {
    const v = Math.floor(e.v);
    out[e.k] = v;
    acc += v;
  }

  const rest = exact
    .map(function (e) { return { k: e.k, frac: e.v - Math.floor(e.v), i: keys.indexOf(e.k) }; })
    .sort(function (a, b) { return b.frac - a.frac || a.i - b.i; });

  let i = 0;
  let leftover = Math.round(total) - acc;
  while (leftover > 0 && rest.length > 0) {
    out[rest[i % rest.length].k] += 1;
    i++;
    leftover--;
  }
  return out;
}

/** 权重数组版的 allocate：返回与输入等长的数组 */
export function allocateList(weights: number[], total: number): number[] {
  const keys = weights.map(function (_w, i) { return 'k' + i; });
  const rec = {} as Record<string, number>;
  for (let i = 0; i < weights.length; i++) rec[keys[i]] = weights[i];
  const out = allocate(rec, total);
  return keys.map(function (k) { return out[k] ?? 0; });
}
