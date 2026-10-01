/**
 * 语料库入口 —— 装配 data/ 下四个 JSON，导出开箱即用的单例
 *
 * 许可：AGPL-3.0-only
 *
 * 说明：
 * 1. JSON 以 unknown 身份进入运行时，由 src/materials/loader.ts 的 schema 校验，
 *    不做任何 `as` 断言；数据有问题时在启动就抛 MaterialError，而不是等到考场上。
 * 2. 用 import attributes 引入 JSON：Node（--experimental-strip-types）与 Vite 都支持，
 *    且四份 JSON 会被直接打包进静态产物，符合「零服务端、纯静态」约束。
 * 3. 重复 id、缺字段、词数与正文不符等问题都在这里被拦下。
 */

import readingsJson from '../../data/readings.json' with { type: 'json' };
import qaJson from '../../data/qa.json' with { type: 'json' };
import listeningJson from '../../data/listening.json' with { type: 'json' };
import topicsJson from '../../data/topics.json' with { type: 'json' };

import { createMaterials, type Materials } from './loader.ts';

export * from './loader.ts';

/** 全局语料单例：24 篇朗读 + 24 条情景问答 + 30 道听力 + 12 个话题 */
export const MATERIALS: Materials = createMaterials({
  readings: readingsJson,
  qa: qaJson,
  listening: listeningJson,
  topics: topicsJson,
});

/** 重新用一份新语料装配（教师自定义题库、热更新、测试用） */
export function loadMaterials(raw: {
  readings: unknown;
  qa: unknown;
  listening: unknown;
  topics: unknown;
}): Materials {
  return createMaterials(raw);
}

export default MATERIALS;
