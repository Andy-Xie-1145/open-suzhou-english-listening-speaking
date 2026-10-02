/**
 * 听力题库 —— 材料 / 题目类型、schema 校验、按组大小分池
 *
 * 许可：AGPL-3.0-only
 *
 * ## 核心规则：组大小是硬约束，绝不跨池凑题
 *
 * 听力不是「一堆题 + 几篇文章」，而是**若干个组**：一段材料 + 固定几道小题，
 * 且这几道题必须出在这段材料上。所以题库按**组大小分池**：
 *
 *     1 题池 · 2 题池 · 3 题池 · 4 题池 · 5 题池
 *
 * 布局要 2+3+5，就是从 2 题池抽 1 段、3 题池抽 1 段、5 题池抽 1 段。
 * 绝不允许「从题库随机挑两道题，再随便配一篇文章」—— 那样题目和材料对不上，
 * 听力就退化成纯猜。原实现曾允许 5 题材料截前 2 题去填 2 题组，已废除。
 *
 * ## 出题时怎么写（两种选项写法都吃）
 *
 *     { "options": ["On the first floor.", "On the second floor.", "Next to the playground."] }
 *     { "options": ["A. On the first floor.", "B. On the second floor.", "C. Next to ..."] }
 *
 * 都归一成 `{ label: "A", text: "On the first floor." }`，前缀被剥掉。
 *
 * ## 说话人只有三种
 *
 * `W`（女）/ `M`（男）/ `N`（旁白，短文用）。
 * 姓名不进数据，界面也不显示 —— 听力题给名字等于给提示。
 *
 * ## 为什么不用 src/materials/listening.json 那套
 *
 * 那边是「一段材料 → 一道题」的老结构（DEFAULT_LAYOUT 5+5），来源是外省体例。
 * 本模块用「一段材料 → N 道题」，才表达得了「长对话 2 题 + 短文 3 题 + 短文 5 题」。
 */

import {
  LISTENING_LAYOUT,
  flattenRules,
  type ListeningLayout,
  type ListeningGroupRule,
} from './listening-spec.ts';

export type ListeningKind = 'dialogue' | 'passage';

export const LISTENING_KIND_LABELS: Record<ListeningKind, string> = {
  dialogue: '听对话回答问题',
  passage: '听对话和短文答题',
};

export type ListeningSpeaker = 'W' | 'M' | 'N';

export const SPEAKER_GENDER: Record<ListeningSpeaker, 'female' | 'male' | 'neutral'> = {
  W: 'female',
  M: 'male',
  N: 'neutral',
};

export interface ListeningUtterance {
  speaker: ListeningSpeaker;
  text: string;
}

export interface ListeningOption {
  label: string;
  text: string;
}

/** 考点类型，决定考后复盘的话术 */
export type ListeningSkill = 'detail' | 'inference' | 'number' | 'mainidea';

export const LISTENING_SKILL_LABELS: Record<ListeningSkill, string> = {
  detail: '细节捕捉',
  inference: '推理判断',
  number: '数字信息',
  mainidea: '主旨大意',
};

export interface ListeningQuestion {
  id: string;
  skill: ListeningSkill;
  /** 题干 */
  prompt: string;
  /** 固定 3 个选项 */
  options: ListeningOption[];
  /** 正确选项的 label */
  answer: string;
  /** 考后复盘高亮用 */
  keywords: string[];
}

export interface ListeningMaterial {
  id: string;
  kind: ListeningKind;
  title: string;
  script: ListeningUtterance[];
  questions: ListeningQuestion[];
  /**
   * 组大小 = 这段材料承载的小题数。由 questions.length 推导，不单独存字段 ——
   * 存了就会和实际题数漂移，漂了就会出现「材料 5 题却按 2 题组用」的错配。
   */
  groupSize: number;
  difficulty: 1 | 2 | 3;
}

export interface ListeningBank {
  all: readonly ListeningMaterial[];
  byKind: Readonly<Record<ListeningKind, readonly ListeningMaterial[]>>;
}

/* ------------------------------------------------------------------ *
 * 归一化
 * ------------------------------------------------------------------ */

const LABELS = ['A', 'B', 'C', 'D', 'E'];

/** 剥掉 "A." / "A、" / "（A）" 这类前缀 */
export function stripOptionPrefix(raw: string): string {
  return raw
    .trim()
    .replace(/^[（(]?[A-Ea-e][)）]?\s*[.、:：]\s*/, '')
    .trim();
}

export function toOptions(raw: unknown, where: string): ListeningOption[] {
  if (!Array.isArray(raw) || raw.length < 2) {
    throw new Error(where + '：options 至少要 2 项');
  }
  return raw.map(function (v, i) {
    const text = stripOptionPrefix(String(v ?? ''));
    if (!text) throw new Error(where + '：第 ' + (i + 1) + ' 个选项为空');
    return { label: LABELS[i] ?? '?' + i, text: text };
  });
}

/** 答案既可写 label（"B"），也可写下标（1），两种都收 */
export function toAnswerLabel(raw: unknown, options: ListeningOption[], where: string): string {
  if (typeof raw === 'number' && Number.isInteger(raw) && raw >= 0 && raw < options.length) {
    return options[raw].label;
  }
  const s = String(raw ?? '').trim().toUpperCase();
  if (options.some(function (o) { return o.label === s; })) return s;
  throw new Error(
    where + '：答案 ' + JSON.stringify(raw) + ' 不在选项 '
    + options.map(function (o) { return o.label; }).join('/') + ' 内',
  );
}

export function toUtterances(raw: unknown, where: string): ListeningUtterance[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(where + '：script 不能为空');
  }
  return raw.map(function (v, i) {
    const o = v as { speaker?: unknown; text?: unknown };
    const sp = String(o?.speaker ?? '').trim().toUpperCase();
    if (sp !== 'W' && sp !== 'M' && sp !== 'N') {
      throw new Error(where + '：第 ' + (i + 1) + ' 句 speaker 必须是 W/M/N，实际 ' + JSON.stringify(o?.speaker));
    }
    const text = String(o?.text ?? '').trim();
    if (!text) throw new Error(where + '：第 ' + (i + 1) + ' 句台词为空');
    return { speaker: sp as ListeningSpeaker, text: text };
  });
}

export function toQuestions(raw: unknown, where: string, materialId: string): ListeningQuestion[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(where + '：questions 不能为空');
  }
  return raw.map(function (v, i) {
    const o = v as Record<string, unknown>;
    const at = where + ' 第 ' + (i + 1) + ' 题';
    const options = toOptions(o?.options, at);
    const skill = String(o?.skill ?? 'detail') as ListeningSkill;
    if (!LISTENING_SKILL_LABELS[skill]) {
      throw new Error(at + '：skill 只能是 ' + Object.keys(LISTENING_SKILL_LABELS).join('/'));
    }
    const prompt = String(o?.prompt ?? '').trim();
    if (!prompt) throw new Error(at + '：题干为空');
    return {
      id: String(o?.id ?? materialId + '-q' + (i + 1)),
      skill: skill,
      prompt: prompt,
      options: options,
      answer: toAnswerLabel(o?.answer, options, at),
      keywords: Array.isArray(o?.keywords) ? o.keywords.map(String) : [],
    };
  });
}

/* ------------------------------------------------------------------ *
 * 装配与分池
 * ------------------------------------------------------------------ */

export function toMaterial(raw: unknown, where: string): ListeningMaterial {
  const o = raw as Record<string, unknown>;
  const id = String(o?.id ?? '').trim();
  if (!id) throw new Error(where + '：缺 id');
  const kind = String(o?.kind ?? 'dialogue');
  if (kind !== 'dialogue' && kind !== 'passage') {
    throw new Error(id + '：kind 只能是 dialogue / passage');
  }
  const questions = toQuestions(o?.questions, id, id);
  const difficulty = Number(o?.difficulty ?? 2);
  return {
    id: id,
    kind: kind as ListeningKind,
    title: String(o?.title ?? '').trim(),
    script: toUtterances(o?.script, id),
    questions: questions,
    groupSize: questions.length,
    difficulty: (difficulty === 1 || difficulty === 3 ? difficulty : 2) as 1 | 2 | 3,
  };
}

/**
 * 装配题库并做静态校验。数据有问题就在启动时抛，不留到考场上。
 *
 * 两种形状都收：纯数组，或 `{ note, materials: [] }`（带出处说明）。
 */
export function createListeningBank(raw: unknown): ListeningBank {
  const list = Array.isArray(raw)
    ? raw
    : (raw as { materials?: unknown } | null)?.materials;
  if (!Array.isArray(list)) throw new Error('听力题库必须是数组，或 { note, materials: [] }');
  const all = list.map(function (v, i) { return toMaterial(v, '第 ' + (i + 1) + ' 条'); });

  const seen = new Set<string>();
  for (const m of all) {
    if (seen.has(m.id)) throw new Error('听力材料 id 重复：' + m.id);
    seen.add(m.id);
    for (const q of m.questions) {
      if (seen.has(q.id)) throw new Error('听力小题 id 重复：' + q.id);
      seen.add(q.id);
    }
  }

  return {
    all: all,
    byKind: {
      dialogue: all.filter(function (m) { return m.kind === 'dialogue'; }),
      passage: all.filter(function (m) { return m.kind === 'passage'; }),
    },
  };
}

/** 从题库里取某个组大小的池。组大小不同就是不同的池，绝不混用。 */
export function poolOf(
  bank: ListeningBank,
  kind: ListeningKind,
  size: number,
): ListeningMaterial[] {
  return (bank.byKind[kind] ?? []).filter(function (m) { return m.groupSize === size; });
}

export interface BankCheck {
  level: 'warn' | 'error';
  message: string;
}

/**
 * 题库够不够出卷 —— 按布局实际用到的每个 (kind, size) 池逐一检查。
 *
 * 不要求池子很大，1 段就够出卷；但布局要 count 段时必须够 count 段。
 */
export function checkBankForLayout(
  bank: ListeningBank,
  layout: ListeningLayout = LISTENING_LAYOUT,
): BankCheck[] {
  const out: BankCheck[] = [];
  const pairs: Array<{ kind: ListeningKind; rules: readonly ListeningGroupRule[] }> = [
    { kind: 'dialogue', rules: layout.dialogue },
    { kind: 'passage', rules: layout.passage },
  ];

  for (const p of pairs) {
    for (const rule of flattenRules(p.rules)) {
      const pool = poolOf(bank, p.kind, rule.size);
      if (pool.length === 0) {
        out.push({
          level: 'error',
          message: LISTENING_KIND_LABELS[p.kind] + ' 缺 ' + rule.size + ' 题的材料池（一条都没有）。',
        });
      } else if (pool.length < rule.count) {
        out.push({
          level: 'error',
          message: LISTENING_KIND_LABELS[p.kind] + ' 的 ' + rule.size + ' 题池只有 ' + pool.length
            + ' 段，需要 ' + rule.count + ' 段。',
        });
      } else if (pool.length < rule.count * 3) {
        out.push({
          level: 'warn',
          message: LISTENING_KIND_LABELS[p.kind] + ' 的 ' + rule.size + ' 题池只有 ' + pool.length
            + ' 段，「换一套卷」会较快重复。',
        });
      }
    }
  }
  return out;
}

export function isBankUsable(bank: ListeningBank, layout: ListeningLayout = LISTENING_LAYOUT): boolean {
  return checkBankForLayout(bank, layout).every(function (c) { return c.level !== 'error'; });
}

/* ------------------------------------------------------------------ *
 * 音频
 * ------------------------------------------------------------------ */

/** 构建期渲染产物在静态产物里的相对路径 */
export function audioUrlFor(materialId: string, ext = 'mp3'): string {
  return 'audio/listening/' + materialId + '.' + ext;
}
