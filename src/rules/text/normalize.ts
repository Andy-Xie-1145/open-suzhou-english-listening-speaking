import { CONNECTOR_PHRASES } from '../lexicon.ts';

/**
 * 文本规范化与分句
 *
 * 许可：AGPL-3.0-only
 */

/** 英文句子终结符（含全角） */
const SENTENCE_END = /[.!?。！？]+/;

/**
 * 规范化：转小写、去除多余空白与标点（保留字母、数字、连字符、撇号）
 */
/**
 * 规范化：转小写、弯引号归一、剥离标点、压缩空白。
 *
 * 注意字符类 [^a-z0-9'-] 里的 '-' 必须放在**末尾**。
 * 若写成 [^a-z0-9'-s] 会被解析成 0x27–0x73 的**范围**，
 * 导致 'a'..'s' 之间的字符（包括 b-k、m 等字母）全部被剥离。
 * 同样 \s 必须转义，写成 s 会把单词里的字母 s 当作待折叠的字符。
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
    .replace(/[^a-z0-9'-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 分词（规范化后） */
export function tokenize(text: string): string[] {
  const n = normalize(text);
  if (!n) return [];
  return n.split(' ').filter(Boolean);
}

/**
 * 按句切分。口语评测必须切句，因为「说够 N 句」是硬性要求。
 * 保留原文片段，便于回显给学生。
 */
export function splitSentences(text: string): string[] {
  const parts: string[] = [];
  let buf = '';

  for (const ch of text) {
    buf += ch;
    if (SENTENCE_END.test(ch)) {
      const t = buf.trim();
      if (t) parts.push(t);
      buf = '';
    }
  }
  const tail = buf.trim();
  if (tail) parts.push(tail);

  return parts.filter((s) => tokenize(s).length > 0);
}

/**
 * 切句的宽松版本：口语转写常常缺少句号。
 * 此时按「连接词/逻辑标记」优先切分，退化为按长度上限切分。
 *
 * 改进点：口语中最可靠的句子边界信号就是 first / second / also /
 * then / however / but / because 等——这正是考试要求学生使用的连接词，
 * 因此优先按这些标记切，比纯按长度切更贴近真实语义边界。
 */
export function splitSentencesLoose(text: string, maxWords = 30): string[] {
  const strict = splitSentences(text);
  if (strict.length > 1) return strict;

  // 无句号：以连接词作为句子边界信号
  const markers = new Set([
    ...CONNECTOR_PHRASES,
    'first', 'firstly', 'second', 'secondly', 'third', 'thirdly',
    'next', 'then', 'finally', 'lastly', 'also', 'besides', 'moreover',
    'furthermore', 'however', 'but', 'because', 'since', 'so', 'while',
    'in addition', 'additionally',
  ]);

  const tokens = text.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const out: string[] = [];
  let buf: string[] = [];

  for (const tok of tokens) {
    const key = tok.toLowerCase().replace(/[^a-z']/g, '');
    // 连接词出现且当前缓冲区已有内容 => 视为新句起点
    if (markers.has(key) && buf.length >= 3) {
      out.push(buf.join(' '));
      buf = [tok];
    } else {
      buf.push(tok);
    }
    // 兜底：超过长度上限强制切分
    if (buf.length >= maxWords) {
      out.push(buf.join(' '));
      buf = [];
    }
  }
  if (buf.length) out.push(buf.join(' '));

  return out.length ? out : [text];
}

/** 词形归一：处理常见屈折与缩写，便于词表匹配 */
export function normalizeWord(w: string): string {
  let x = w.toLowerCase();
  x = x.replace(/'s$/, '').replace(/'$/, '');
  return x;
}

/** 编辑距离（Levenshtein），用于拼写容错匹配 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = new Array(b.length + 1);
  let cur = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}
