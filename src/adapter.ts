/**
 * 集成适配层 —— 把语料库的数据结构翻译成 L0 规则层与 UI 需要的形状
 *
 * 许可：AGPL-3.0-only
 *
 * 为什么需要这一层：
 *  1. materials 的 ListeningItem 用**选项下标**（answer: 0|1|2），
 *     而 L0 的 ListeningQuestion 用**选项标签**（answer: 'A'|'B'|'C'）。
 *     若直接混用，听力判分会永远为 0。
 *  2. materials 的 ExamPaper 是「一套卷」的完整语义（卷型/seed/layout），
 *     ui 的 PaperSource 是「界面可直接渲染」的扁平结构。
 *  两侧都不该为对方改接口，因此统一在中间做转换。
 */

import type { ExamPaper as MaterialsPaper, ListeningItem } from './materials/loader.ts';
import type { PaperSource } from './ui/exam.ts';
import type { ListeningQuestion } from './rules/listening.ts';

/** 选项下标 → 标签 */
export const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

/** 语料题 → L0 客观题（含考点归类） */
export function toListeningQuestion(it: ListeningItem): ListeningQuestion {
  const options = it.options.map(function (text, i) {
    return { label: OPTION_LABELS[i] ?? String(i), text: text };
  });
  return {
    id: it.id,
    // materials 用 pointType 表达考点，L0 用 skill；主旨题归为 mainidea
    skill: it.pointType,
    prompt: it.question,
    options: options,
    answer: OPTION_LABELS[it.answer] ?? String(it.answer),
    script: it.text,
  };
}

/** 批量转换 */
export function toListeningQuestions(items: readonly ListeningItem[]): ListeningQuestion[] {
  return items.map(toListeningQuestion);
}

/** 把 materials 的一张卷转成 UI 可渲染的 PaperSource */
export function toPaperSource(paper: MaterialsPaper): PaperSource {
  const short = paper.listening.short.map(function (it) { return it.id; });
  const long = paper.listening.long.map(function (it) { return it.id; });

  return {
    listenDialogue: {
      id: 'listen-dialogue',
      title: '第一节 短对话（' + short.length + ' 题）',
      questions: short,
    },
    listenPassage: {
      id: 'listen-passage',
      title: '第二节 长对话与短文（' + long.length + ' 题）',
      questions: long,
    },
    readAloud: {
      id: paper.reading.id,
      title: paper.reading.textbook + ' · ' + paper.reading.unitTheme,
      text: paper.reading.text,
    },
    qa: {
      id: 'qa-' + paper.summary.qaCount,
      title: '情景问答（' + paper.qa.length + ' 题）',
      questions: paper.qa.map(function (q) { return q.id; }),
    },
    topic: {
      id: 'topic-' + paper.topic.name.replace(/\s+/g, '-'),
      title: paper.topic.name,
      profile: paper.topic,
    },
  };
}
