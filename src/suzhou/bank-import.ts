/**
 * data/bank/items.jsonl（主库）→ 各运行时形状的适配层。
 *
 * main（运行时）、tests（fixture）、scripts/build-listening-audio.ts（构建期渲染）
 * 三处共用，保证口径一致。改题只改 JSONL，导出 items.json 后此处不用动。
 */

/* ------------------------------------------------------------------ *
 * 听力材料 → ListeningMaterial（按小题数自动分池）
 * ------------------------------------------------------------------ */

const FEMALE_NAMES = new Set(['girl','woman','mother','mum','mom','grandma','ann','amy','alice','anna','betty','cherry','emma','emily','gina','helen','jane','kate','laura','lily','lisa','lucy','mary','nancy','sarah','sara','tina','julia','miss','ms','mrs','hostess','waitress']);
const MALE_NAMES = new Set(['boy','man','father','dad','grandpa','leo','tom','tim','bob','john','james','mike','mr','david','peter','jack','sam','ben','henry','host','waiter']);

function speakerFor(name: string, fallback: 'W' | 'M'): 'W' | 'M' {
  const n = name.trim().toLowerCase().replace(/[:：]$/, '');
  if (FEMALE_NAMES.has(n)) return 'W';
  if (MALE_NAMES.has(n)) return 'M';
  return fallback;
}

export function dialogueToScript(material: string): Array<{ speaker: 'W' | 'M' | 'N'; text: string }> {
  const lines = material.split('\n').map((s) => s.trim()).filter(Boolean);
  const out: Array<{ speaker: 'W' | 'M' | 'N'; text: string }> = [];
  let fallback: 'W' | 'M' = 'W';
  for (const line of lines) {
    const m = line.match(/^([A-Za-z][A-Za-z\s'.-]{0,20}?)\s*[:：]\s*(.+)$/);
    if (m) {
      const sp = speakerFor(m[1], fallback);
      fallback = sp === 'W' ? 'M' : 'W';
      out.push({ speaker: sp, text: m[2].trim() });
    } else {
      out.push({ speaker: 'N', text: line });
    }
  }
  return out;
}

export function passagesScript(material: string): Array<{ speaker: 'N'; text: string }> {
  return [{ speaker: 'N', text: material.replace(/\s*\n\s*/g, ' ').trim() }];
}

export function listeningQuestions(qs: any[], materialId?: string): any[] {
  return qs.map((q: any, i: number) => {
    const rawOpts = q.options;
    const options = Array.isArray(rawOpts)
      ? rawOpts
      : Object.keys(rawOpts).sort().map((k) => rawOpts[k]);
    return {
      id: q.id ?? ((materialId ?? 'm') + '-q' + (i + 1)),
      skill: 'detail',
      prompt: q.question ?? q.prompt ?? '',
      options: options,
      answer: q.answer,
      keywords: Array.isArray(q.keywords) ? q.keywords : [],
    };
  });
}

export function buildListeningMaterials(items: any[]): any[] {
  return items
    .filter((it) => it.type.startsWith('listening.'))
    .map((it) => {
      const isDialogue = it.type.startsWith('listening.dialogue');
      const kind = isDialogue ? 'dialogue' : 'passage';
      return {
        id: it.id,
        kind: kind,
        title: it.title ?? '',
        script: isDialogue ? dialogueToScript(it.material) : passagesScript(it.material),
        questions: listeningQuestions(it.questions ?? [], it.id),
        difficulty: 2,
      };
    });
}

/* ------------------------------------------------------------------ *
 * 问答 / 话题 → RawQa / RawTopic
 * ------------------------------------------------------------------ */

export function mapQaItem(it: any): any {
  return {
    id: it.id,
    category: it.title ?? '',
    scenario: it.scenario ?? '',
    question: (it.questions ?? [])
      .map((q: any) => String(q.q ?? '').replace(/\*\*/g, ''))
      .join('\n'),
    keyPoints: it.points ?? [],
    enKeywords: it.keywords ?? [],
    difficulty: 2,
  };
}

export function mapTopicItem(t: any): any {
  return {
    id: t.id,
    name: t.title,
    hint: t.prompt ?? '',
    keywords: t.keywords ?? [],
    bonusPhrases: [] as string[],
    sampleAnswer: [t.modelAnswer],
    keyExpressions: [] as Array<{ group: string; items: string[] }>,
  };
}
