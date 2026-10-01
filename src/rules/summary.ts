/**
 * 成绩汇总 —— 把五大题型的分项结果合成一份完整成绩单
 *
 * 许可：AGPL-3.0-only
 *
 * 对标：江苏省中考英语听力口语自动化考试，满分 30 分。
 * 听力 12 分钟 + 口语 10 分钟 = 考生实际考试 22 分钟。
 */

import type { RuleReport } from './types.ts';
import type { ListeningReport } from './listening.ts';
import type { ReadingReport } from './reading.ts';

export type SectionKind =
  | 'listening-dialogue'
  | 'listening-passage'
  | 'reading'
  | 'qa'
  | 'topic';

export interface SectionScore {
  kind: SectionKind;
  title: string;
  score: number;
  weight: number;
  headline: string;
}

/**
 * 五大题型权重分配。
 *
 * 注意：这是本项目的**合理默认分配**，不是官方公布的分值划分。
 * 官方只公布总分 30 分，未公开每题具体分值。
 * 依据「听力 12 分钟 / 口语 10 分钟」的时间配比做近似分配。
 * 接入生产前应向苏州市教育考试院核实官方分值表。
 */
export const DEFAULT_WEIGHTS: Record<SectionKind, number> = {
  'listening-dialogue': 0.15,
  'listening-passage': 0.15,
  reading: 0.25,
  qa: 0.20,
  topic: 0.25,
};

export const TOTAL_POINTS = 30;

export const SECTION_TITLES: Record<SectionKind, string> = {
  'listening-dialogue': '听对话回答问题',
  'listening-passage': '听对话和短文答题',
  reading: '朗读短文',
  qa: '情景问答',
  topic: '话题简述',
};

export interface ExamResultInput {
  listening?: { dialogue: ListeningReport; passage: ListeningReport };
  reading?: ReadingReport;
  qa?: RuleReport;
  topic?: RuleReport;
  skipped?: SectionKind[];
}

export interface ExamResult {
  total: number;
  percent: number;
  sections: SectionScore[];
  verdict: string;
  complete: boolean;
}

function listeningCombined(input: ExamResultInput): { score: number; ok: boolean } | null {
  if (!input.listening) return null;
  const d = input.listening.dialogue;
  const p = input.listening.passage;
  return { score: (d.score + p.score) / 2, ok: d.total + p.total > 0 };
}

export function summarize(input: ExamResultInput, weights = DEFAULT_WEIGHTS): ExamResult {
  const sections: SectionScore[] = [];

  const lis = listeningCombined(input);
  if (lis) {
    const hl = lis.score >= 80 ? '听力表现良好' : lis.score >= 60 ? '听力有提升空间' : '听力是当前短板';
    const t1 = SECTION_TITLES['listening-dialogue'];
    const t2 = SECTION_TITLES['listening-passage'];
    sections.push({
      kind: 'listening-dialogue',
      title: t1 + ' + ' + t2,
      score: Math.round(lis.score),
      weight: weights['listening-dialogue'] + weights['listening-passage'],
      headline: hl,
    });
  }

  if (input.reading) {
    const r = input.reading;
    const om = r.alignment.omissions.length;
    const mr = r.alignment.misreads.length;
    let hl: string;
    if (om > 0) hl = '漏读 ' + om + ' 个词，完整度是朗读分的大头';
    else if (mr > 0) hl = '有 ' + mr + ' 个词发音待纠正';
    else hl = '朗读完整、发音到位';
    sections.push({
      kind: 'reading',
      title: SECTION_TITLES.reading,
      score: r.score,
      weight: weights.reading,
      headline: hl,
    });
  }

  if (input.qa) {
    const q = input.qa;
    const hl = q.checks.fillers.ok ? '表达连贯' : '有卡壳，建议先想好再说';
    sections.push({
      kind: 'qa',
      title: SECTION_TITLES.qa,
      score: q.score,
      weight: weights.qa,
      headline: hl,
    });
  }

  if (input.topic) {
    const t = input.topic;
    const lenOk = t.checks.length.ok;
    const n = t.checks.length.value;
    const covOk = t.checks.coverage.ok;
    let hl: string;
    if (!lenOk) hl = '只说了 ' + n + ' 句，话题简述必须说满 7 句';
    else if (!covOk) hl = '句数够了，但要说的内容还不够全';
    else hl = '句数达标、要点覆盖良好';
    sections.push({
      kind: 'topic',
      title: SECTION_TITLES.topic,
      score: t.score,
      weight: weights.topic,
      headline: hl,
    });
  }

  const totalWeight = sections.reduce(function (a, s) { return a + s.weight; }, 0);
  const weighted = sections.reduce(function (a, s) { return a + s.score * s.weight; }, 0);
  const percent = totalWeight > 0 ? Math.round(weighted / totalWeight) : 0;
  const total = Math.round((percent / 100) * TOTAL_POINTS * 10) / 10;
  // 听力两题在展示层合并为一个 section，故完整答卷为 4 个 section
  const complete = sections.length >= 4;

  let weakest: SectionScore | null = null;
  for (const s of sections) {
    if (!weakest || s.score < weakest.score) weakest = s;
  }

  let verdict: string;
  if (sections.length === 0) {
    verdict = '尚未作答';
  } else if (!complete) {
    verdict = '已完成部分题型；缺考部分按 0 计，正式考试中缺考会直接影响总分';
  } else if (percent >= 90) {
    verdict = '整体优秀，保持练习';
  } else if (percent >= 75) {
    verdict = '良好；' + weakest!.title + ' 还有提升空间';
  } else if (percent >= 60) {
    verdict = '及格；优先补强' + weakest!.title;
  } else {
    verdict = '需重点突破' + weakest!.title + '，建议从漏读与句数两个硬指标开始';
  }

  return { total, percent, sections, verdict, complete };
}
