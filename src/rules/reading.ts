/**
 * 朗读短文评测 —— L0 规则层扩展
 *
 * 许可：AGPL-3.0-only
 *
 * 朗读短文是「有标准原文」的封闭题，因此可做漏读/错读的确定性判定。
 * 这正是完整度（口语分大头）的核心判定。
 */

import { tokenize, levenshtein, normalizeWord } from './text/normalize.ts';
import type { Diagnostic, CheckResult } from './types.ts';

export interface ReadingAlignment {
  reference: string[];
  spoken: string[];
  spokenFlags: boolean[];
  omissions: number[];
  insertions: string[];
  misreads: Array<{ index: number; ref: string; got: string }>;
}

export function alignReading(reference: string, spoken: string): ReadingAlignment {
  const ref = tokenize(reference);
  const hyp = tokenize(spoken).map(normalizeWord);
  const spokenFlags: boolean[] = new Array(ref.length).fill(false);
  const omissions: number[] = [];
  const misreads: Array<{ index: number; ref: string; got: string }> = [];
  const insertions: string[] = [];
  const used = new Set<number>();
  let j = 0;
  for (let i = 0; i < ref.length; i++) {
    const r = normalizeWord(ref[i]);
    let found = -1;
    let dist = Infinity;
    for (let k = j; k < hyp.length; k++) {
      if (used.has(k)) continue;
      const h = hyp[k];
      if (h === r) { found = k; dist = 0; break; }
      const d = levenshtein(h, r);
      const tol = r.length <= 4 ? 1 : 2;
      if (d <= tol && d < dist) { found = k; dist = d; }
    }
    if (found >= 0) {
      used.add(found);
      spokenFlags[i] = true;
      j = found + 1;
      if (dist > 0) misreads.push({ index: i, ref: ref[i], got: hyp[found] });
    } else {
      omissions.push(i);
    }
  }
  for (let k = 0; k < hyp.length; k++) { if (!used.has(k)) insertions.push(hyp[k]); }
  return { reference: ref, spoken: hyp, spokenFlags, omissions, insertions, misreads };
}

export interface ReadingInput { reference: string; spoken: string; durationMs?: number; }

export interface ReadingReport {
  score: number;
  completeness: number;
  accuracy: number;
  checks: { completeness: CheckResult; accuracy: CheckResult; pace: CheckResult; };
  alignment: ReadingAlignment;
  diagnostics: Diagnostic[];
}

const PACE_SLOW = 0.8;
const PACE_FAST = 3.4;

export function evaluateReading(input: ReadingInput): ReadingReport {
  const alignment = alignReading(input.reference, input.spoken);
  const total = alignment.reference.length;
  const diagnostics: Diagnostic[] = [];
  const spokenCount = alignment.spokenFlags.filter(Boolean).length;
  const completeness = total > 0 ? spokenCount / total : 0;
  const accuracy = spokenCount > 0 ? (spokenCount - alignment.misreads.length) / total : 0;
  if (completeness < 1) {
    const omitted = alignment.omissions.map(function (i) { return alignment.reference[i]; });
    const list = omitted.slice(0, 8).join('、');
    diagnostics.push({ code: 'READ_OMISSION', severity: 'error',
      message: '漏读 ' + alignment.omissions.length + ' 个词：' + list,
      suggestion: '完整度是口语分的大头，先把每个词都读全。' });
  }
  if (alignment.misreads.length > 0) {
    const detail = alignment.misreads.slice(0, 5).map(function (m) { return m.ref + '→' + m.got; }).join('、');
    diagnostics.push({ code: 'READ_MISPRONOUNCE', severity: 'warn',
      message: '疑似读错 ' + alignment.misreads.length + ' 个词：' + detail,
      suggestion: '放慢速度，把这些词单独练几遍。' });
  }
  if (alignment.insertions.length > 2) {
    const n = alignment.insertions.length;
    diagnostics.push({ code: 'READ_INSERTION', severity: 'info',
      message: '多说了 ' + n + ' 个词。',
      suggestion: '照着原文读，不要自行添加。' });
  }

  let pace = 0;
  let paceOk = true;
  if (input.durationMs && input.durationMs > 0 && total > 0) {
    pace = total / (input.durationMs / 1000);
    paceOk = pace >= PACE_SLOW && pace <= PACE_FAST;
    if (!paceOk) {
      const fast = pace > PACE_FAST;
      diagnostics.push({ code: fast ? 'READ_PACE_FAST' : 'READ_PACE_SLOW',
        severity: 'info',
        message: fast ? '朗读偏快，注意咬字。' : '朗读偏慢，保持连贯。',
        suggestion: '跟读标准音频，保持匀速。' });
    }
  }

  let score = completeness * 70 + Math.max(0, accuracy) * 25 + (paceOk ? 5 : 2);
  score = Math.round(Math.max(0, Math.min(100, score)));

  return {
    score,
    completeness,
    accuracy: Math.max(0, accuracy),
    checks: {
      completeness: { ok: completeness >= 0.95, value: completeness, threshold: 0.95, message: Math.round(completeness * 100) + '% 读全' },
      accuracy: { ok: accuracy >= 0.9, value: accuracy, threshold: 0.9, message: Math.round(Math.max(0, accuracy) * 100) + '% 读对' },
      pace: { ok: paceOk, value: pace, threshold: PACE_FAST, message: input.durationMs ? pace.toFixed(1) + ' 词/秒' : '未提供时长' },
    },
    alignment,
    diagnostics,
  };
}
