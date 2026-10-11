/**
 * 听力段考法常量 —— 全项目**唯一**的听力子结构来源
 *
 * 许可：AGPL-3.0-only
 *
 * ## 🟡 为什么这份常量带着警告
 *
 * 官方只公布过两个听力题型名与各 10 分：
 *
 * 「"听对话回答问题"和"听对话和短文答题"各赋分 10 分」（苏州教基〔2026〕4号）
 *
 * **子结构从未公开。** 「第一节 10 段各 1 题」「第二节 2+3+5」来自未经证实的
 * 记忆版本，检索既不能证实也不能证伪（同平台外省结构完全不同，不能倒推江苏）。
 *
 * 所以这里的每一个数字都必须在 SPEC §7 待核实清单里，界面上要标 🟡。
 *
 * ## 数据模型：组规则
 *
 * 听力不是「一堆题」加「几篇文章」，而是**若干个组**：
 * 每个组 = 一段材料 + 固定几道小题，且**这几道题必须出在这段材料上**。
 *
 * 所以配置的单位是 `{ size, count }`：size = 每段配几题，count = 几段。
 *
 *     dialogue: [{ size: 1, count: 10 }]                    → 10 段 × 1 题
 *     passage:  [{ size: 2, count: 1 }, { size: 3, count: 1 },
 *                 { size: 5, count: 1 }]                      → 2 / 3 / 5 题各 1 段
 *
 * ## ⚠️ 绝不允许跨池凑题
 *
 * 组规则里的 `size` 是**硬约束**：2 题的组只能从「恰好 2 题的材料池」里抽。
 *
 * 不许「从题库随机挑两道题，再随便配一篇文章」—— 那样题目和材料对不上，
 * 听力就变成纯猜。原实现曾允许 5 题材料截前 2 题去填 2 题组，已废除。
 *
 * 因此题库必须**按每种组大小分别建池**：1 题的、2 题的、3 题的、4 题的、5 题的
 * 各准备一批。将来子结构改了，只要那个 size 的池非空就能出卷，不必重做题库。
 *
 * ## 改法
 *
 * 老师问清楚之后结构不一样，**只改这一个对象**：
 *
 * ```ts
 * export const LISTENING_LAYOUT = {
 *   dialogue: [{ size: 1, count: 10 }],
 *   passage:  [{ size: 4, count: 1 }, { size: 3, count: 1 }, { size: 3, count: 1 }],
 * };
 * ```
 *
 * 派生量、时长分配、组卷、UI 标签全部读派生函数，没有第二处硬编码。
 */

import { allocate, allocateList } from './allocate.ts';

/* ------------------------------------------------------------------ *
 * 一、唯一的可调点
 * ------------------------------------------------------------------ */

/** 一组听力材料：每段配几道小题、共几段 */
export interface ListeningGroupRule {
  /** 每段材料承载的小题数。必须与题库中该材料的实际题数一致 */
  size: number;
  /** 这样的材料要几段 */
  count: number;
}

export interface ListeningLayout {
  /** 第一节「听对话回答问题」 */
  dialogue: ListeningGroupRule[];
  /** 第二节「听对话和短文答题」 */
  passage: ListeningGroupRule[];
}

export type ListeningSectionId = 'dialogue' | 'passage';

/** 两个听力大题的官方名称与分值（苏州教基〔2026〕4号，各 10 分） */
export const LISTENING_SECTIONS: Record<ListeningSectionId, { name: string; points: number }> = {
  dialogue: { name: '听对话回答问题', points: 10 },
  passage: { name: '听对话和短文答题', points: 10 },
};

/** 当前采用的听力子结构假设。见文件头的 🟡 说明。 */
export const LISTENING_LAYOUT: ListeningLayout = {
  dialogue: [{ size: 1, count: 10 }, { size: 2, count: 1 }],
  passage: [{ size: 3, count: 1 }, { size: 5, count: 1 }],
};

/* ------------------------------------------------------------------ *
 * 二、派生量
 * ------------------------------------------------------------------ */

/** 某大题下，所有组需要的材料段数 */
export function materialCount(rules: readonly ListeningGroupRule[]): number {
  return rules.reduce(function (a, r) { return a + Math.max(0, r.count); }, 0);
}

/** 某大题下的小题总数 = Σ size × count */
export function questionCount(rules: readonly ListeningGroupRule[]): number {
  return rules.reduce(function (a, r) { return a + Math.max(0, r.size) * Math.max(0, r.count); }, 0);
}

/** 把组规则摊平成「要几段、每段几题」，顺序即卷面顺序 */
export function flattenRules(
  rules: readonly ListeningGroupRule[],
): Array<{ size: number; count: number }> {
  return rules
    .filter(function (r) { return r.size > 0 && r.count > 0; })
    .map(function (r) { return { size: r.size, count: r.count }; });
}

export function dialogueQuestionCount(layout: ListeningLayout = LISTENING_LAYOUT): number {
  return questionCount(layout.dialogue);
}
export function passageQuestionCount(layout: ListeningLayout = LISTENING_LAYOUT): number {
  return questionCount(layout.passage);
}
export function listeningQuestionCount(layout: ListeningLayout = LISTENING_LAYOUT): number {
  return dialogueQuestionCount(layout) + passageQuestionCount(layout);
}
export function dialogueMaterialCount(layout: ListeningLayout = LISTENING_LAYOUT): number {
  return materialCount(layout.dialogue);
}
export function passageMaterialCount(layout: ListeningLayout = LISTENING_LAYOUT): number {
  return materialCount(layout.passage);
}
export function listeningMaterialCount(layout: ListeningLayout = LISTENING_LAYOUT): number {
  return dialogueMaterialCount(layout) + passageMaterialCount(layout);
}

/** 布局里用到过哪些组大小 —— 题库必须为每个都建池 */
export function requiredGroupSizes(layout: ListeningLayout = LISTENING_LAYOUT): number[] {
  const seen = new Set<number>();
  for (const r of layout.dialogue) seen.add(r.size);
  for (const r of layout.passage) seen.add(r.size);
  return Array.from(seen).sort(function (a, b) { return a - b; });
}

/* ------------------------------------------------------------------ *
 * 三、一致性校验
 * ------------------------------------------------------------------ */

export interface LayoutCheck {
  level: 'ok' | 'warn' | 'error';
  message: string;
}

/** 校验子结构自洽。小计偏离官方 10 分降为 warn（定制子结构），0 小题才算 error。 */
export function checkListeningLayout(layout: ListeningLayout = LISTENING_LAYOUT): LayoutCheck[] {
  const out: LayoutCheck[] = [];

  for (const id of ['dialogue', 'passage'] as ListeningSectionId[]) {
    const rules = layout[id];
    if (!Array.isArray(rules) || rules.length === 0) {
      out.push({ level: 'error', message: LISTENING_SECTIONS[id].name + '没有任何组。' });
      continue;
    }
    for (const r of rules) {
      if (!Number.isInteger(r.size) || r.size < 1) {
        out.push({ level: 'error', message: LISTENING_SECTIONS[id].name + '的组大小必须是正整数。' });
      }
      if (!Number.isInteger(r.count) || r.count < 1) {
        out.push({ level: 'error', message: LISTENING_SECTIONS[id].name + '的组份数必须是正整数。' });
      }
    }
    const got = questionCount(rules);
    const want = LISTENING_SECTIONS[id].points;
    if (got !== want) {
      out.push({
        level: 'warn',
        message: LISTENING_SECTIONS[id].name + '按当前子结构是 ' + got + ' 小题，与官方 ' + want + ' 分不符（定制子结构，需人工确认）。',
      });
    }
  }
  return out;
}

export function isListeningLayoutUsable(layout: ListeningLayout = LISTENING_LAYOUT): boolean {
  return checkListeningLayout(layout).every(function (c) { return c.level !== 'error'; });
}

/* ------------------------------------------------------------------ *
 * 四、时长分配
 * ------------------------------------------------------------------ */

/** 每小题的得分占比 —— 小题等值，按小题数摊到官方分值上 */
export function listeningQuestionWeights(
  layout: ListeningLayout = LISTENING_LAYOUT,
): { dialogue: number; passage: number } {
  const total = listeningQuestionCount(layout);
  if (total <= 0) return { dialogue: 0, passage: 0 };
  return {
    dialogue: dialogueQuestionCount(layout) / total,
    passage: passageQuestionCount(layout) / total,
  };
}

/** 把整段听力时长拆到两个大题，合计严格等于 totalMs */
export function allocateListeningMs(
  totalMs: number,
  layout: ListeningLayout = LISTENING_LAYOUT,
): { dialogue: number; passage: number } {
  return allocate(listeningQuestionWeights(layout), Math.max(0, Math.round(totalMs)));
}

/**
 * 把一个大题的时长拆到每一段材料上。
 * 按组内题数摊 —— 5 题的材料要给更多时间，和小题数成正比。
 */
export function allocateGroupMs(rules: readonly ListeningGroupRule[], totalMs: number): number[] {
  const flat = flattenRules(rules);
  const weights: number[] = [];
  for (const f of flat) {
    for (let i = 0; i < f.count; i++) weights.push(f.size);
  }
  return allocateList(weights, Math.max(0, Math.round(totalMs)));
}

/* ------------------------------------------------------------------ *
 * 五、展示
 * ------------------------------------------------------------------ */

function describeRules(rules: readonly ListeningGroupRule[]): string {
  return flattenRules(rules)
    .map(function (r) { return (r.count > 1 ? r.count + ' 段 × ' + r.size + ' 题' : r.size + ' 题'); })
    .join(' + ');
}

/** 一句话描述当前结构，印在界面与 SPEC 上，让人知道这是假设 */
export function describeListeningLayout(layout: ListeningLayout = LISTENING_LAYOUT): string {
  return '🟡 ' + LISTENING_SECTIONS.dialogue.name + '：' + describeRules(layout.dialogue)
    + '；' + LISTENING_SECTIONS.passage.name + '：' + describeRules(layout.passage);
}

/** 第 index 段的标题。第一个组标「长对话」，其余标「短文」—— 仅 UI 用 */
export function groupLabel(index: number, size: number): string {
  const total = listeningMaterialCount();
  if (index >= total) return '材料';
  if (size === 1) return '对话 ' + (index + 1);
  return '材料 ' + (index + 1) + ' · ' + (index === 0 ? '长对话' : '短文');
}
