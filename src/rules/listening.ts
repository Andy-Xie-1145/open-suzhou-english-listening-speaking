/**
 * 听力题评测 —— 客观题，完全不需要 AI
 *
 * 许可：AGPL-3.0-only
 *
 * 五大题型中的前两题（听对话回答问题、听对话和短文答题）是纯客观题，
 * 评分 = 答题正确率 + 是否涂卡完整。工作量在题库，不在算法。
 */

export interface ListeningOption {
  label: string;      // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface ListeningQuestion {
  id: string;
  /** 考点类型，决定反馈话术 */
  skill: 'detail' | 'inference' | 'number' | 'mainidea';
  prompt: string;
  options: ListeningOption[];
  answer: string;    // 正确选项 label
  /** 听力原文，供考后复盘 */
  script: string;
}

export interface ListeningAnswer { questionId: string; chosen: string; }

export interface ListeningReport {
  score: number;          // 0-100
  correct: number;
  total: number;
  accuracy: number;
  /** 逐题对错与考点归因 */
  detail: Array<{
    questionId: string;
    skill: ListeningQuestion['skill'];
    correct: boolean;
    chosen: string;
    answer: string;
  }>;
  /** 薄弱考点 */
  weakSkills: Array<{ skill: string; missed: number; total: number; }>;
  /** 是否漏答 */
  unanswered: string[];
}

const SKILL_LABEL: Record<ListeningQuestion['skill'], string> = {
  detail: '细节捕捉',
  inference: '推理判断',
  number: '数字信息',
  mainidea: '主旨大意',
};

/** 供 UI 展示的考点中文名 */
export function skillLabel(s: ListeningQuestion['skill']): string {
  return SKILL_LABEL[s] ?? s;
}

export function evaluateListening(
  questions: ListeningQuestion[],
  answers: ListeningAnswer[],
): ListeningReport {
  const map = new Map<string, string>();
  for (const a of answers) {
    if (a.chosen) map.set(a.questionId, a.chosen);
  }

  let correct = 0;
  const detail: ListeningReport['detail'] = [];
  const unanswered: string[] = [];
  const bySkill = new Map<string, { missed: number; total: number }>();

  for (const q of questions) {
    const chosen = map.get(q.id) ?? '';
    const ok = chosen === q.answer;
    if (ok) correct++;
    else unanswered.push(q.id);

    const cur = bySkill.get(q.skill) ?? { missed: 0, total: 0 };
    cur.total++;
    if (!ok) cur.missed++;
    bySkill.set(q.skill, cur);

    detail.push({
      questionId: q.id,
      skill: q.skill,
      correct: ok,
      chosen,
      answer: q.answer,
    });
  }

  const total = questions.length;
  const accuracy = total > 0 ? correct / total : 0;

  const weakSkills = Array.from(bySkill.entries())
    .filter(function (e) { return e[1].missed > 0; })
    .map(function (e) { return { skill: e[0], missed: e[1].missed, total: e[1].total }; })
    .sort(function (a, b) { return (b.missed / b.total) - (a.missed / a.total); });

  return {
    score: Math.round(accuracy * 100),
    correct,
    total,
    accuracy,
    detail,
    weakSkills,
    unanswered,
  };
}
