/**
 * L1 音素层 —— wav2vec2-lv-60（ONNX）+ espeak G2P + DTW 对齐
 *
 * 许可：AGPL-3.0-only
 *
 * 职责：把「你实际发出的音」与「参考文本应该发出的音」逐音素对齐，
 * 检出三类错误：替换 S / 删除 D（漏读）/ 插入 I（多读）。
 *
 * 关键设计：
 * 1. 模型与 G2P 都是「可选增强」。任一加载失败都抛 EngineUnavailable，
 *    由 pipeline 降级，L0 反馈必须照常给出（ARCHITECTURE.md 第 4 条）。
 * 2. Transformers.js 只在浏览器有意义，因此所有 import 都是动态的；
 *    Node 测试环境没有这些包，靠 try/catch 保证测试能跑（见 assessPhonemes）。
 * 3. 对齐算法（IPA 归一化 / 音素距离 / DTW / 逐词归并）是纯函数，
 *    与模型无关，可以直接在 Node 里测试。
 *
 * 依赖说明：
 * onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX 为 Apache-2.0；
 * espeak-phonemizer 为 GPL-3.0-only，与 AGPL-3.0-only 兼容（同族传染式许可）。
 */

import {
  EngineUnavailable,
  getModelState,
  setModelState,
  pickDevice,
} from './capabilities.ts';
import { preprocessForModel, TARGET_SAMPLE_RATE, audioQuality } from './audio.ts';

export const PHONEME_MODEL_ID = 'onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX';

/* ================================================================== *
 * 第一部分：IPA 音素表与归一化（纯逻辑，Node 可测）
 * ================================================================== */

/**
 * 音素清单（espeak 英式 IPA 的常用子集）。
 * 作用有两个：把 espeak 输出的「连写的词」切成音素序列，以及
 * 给 DTW 一个统一的相似度判定依据。
 */
const PHONES: string[] = [
  // 双音素 / 长音优先（贪婪匹配时长的排前面）
  'eɪ', 'aɪ', 'ɔɪ', 'əʊ', 'oʊ', 'aʊ', 'ɪə', 'eə', 'ʊə', 'ɪɹ', 'ʊɹ', 'ɜɹ', 'eɚ', 'əɚ',
  'tʃ', 'dʒ', 'iː', 'uː', 'ɔː', 'ɑː', 'ɜː', 'ɪə', 'ɑɹ', 'ɔɹ', 'ɝ',
  // 单元音
  'a', 'æ', 'ə', 'ɚ', 'ɵ', 'ɘ', 'ɛ', 'e', 'ɪ', 'i', 'ɔ', 'ɒ', 'ʊ', 'u', 'ʌ', 'ɐ',
  // 辅音
  'p', 'b', 't', 'd', 'k', 'ɡ', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h', 'm', 'n', 'ŋ', 'l', 'ɹ', 'r', 'j', 'w', 'ʔ', 't͡s', 'd͡z',
];
// 长音优先：按长度降序排序后做贪心匹配，保证 "eɪ" 不会被切成 "e"+"ɪ"
const PHONES_BY_LEN = PHONES.slice().sort((a, b) => b.length - a.length);

/** 重音/次重音：两个码位是同一个符号的不同写法，都要去掉 */
const STRESS_MARKS = /[\u02c8\u02cc]/g;

/**
 * 归一化一个音素：去掉重音、次重音、连音符与词分隔符。
 * 注意长度符 ː 不能去 —— 英语里 /iː/ 与 /i/ 是两个不同音素，
 * 长音没读够是中国学生最常见的错误之一，去掉长度符会把错误掩盖掉。
 */
export function normalizeIpa(p: string): string {
  return p
    .replace(STRESS_MARKS, '')
    .replace(/[.͡|]/g, '')
    .toLowerCase()
    .trim();
}

/** 只去掉「可读性修饰」，保留音段本身（用于判断 /iː/ 与 /i/ 是否同族） */
export function stripIpaMarks(p: string): string {
  return p.replace(/[ːˑ͡|]/g, '');
}

/** 判断是否元音 */
function isVowelPhone(p: string): boolean {
  return /^[aeiouæɑɒɔɪɛəɜʌʊɝɐɘɵy]+$/.test(p);
}

/**
 * 音素类别：同类别之间距离更近。
 * 例如 /s/ 与 /ʃ/ 都是摩擦音，学生读错时更可能是「口型没到位」而不是「完全不会」，
 * 对齐时给一个中间距离，比判成完全不同更合理。
 */
export function phoneClass(p: string): string {
  const s = stripIpaMarks(normalizeIpa(p));
  if (!s) return 'sil';
  if (isVowelPhone(s)) return 'vowel';
  if (s.startsWith('tʃ') || s.startsWith('dʒ') || s.startsWith('t͡s') || s.startsWith('d͡z')) return 'affricate';
  if ('pbtkdgqʔ'.includes(s[0])) return 'plosive';
  if ('fvθðszʃʒhxɣχ'.includes(s[0])) return 'fricative';
  if ('mnŋɲ'.includes(s[0])) return 'nasal';
  if ('lrɹɫ'.includes(s[0])) return 'liquid';
  if ('jwʍɥʲ'.includes(s[0])) return 'glide';
  return 'other';
}

/**
 * 音素距离 ∈ [0, 1]：
 * 0    完全一致
 * 0.25 只有长度/修饰符号不同（如 /iː/ vs /i/）
 * 0.5  同类别
 * 1.0  完全不同
 */
export function phoneDistance(a: string, b: string): number {
  const na = normalizeIpa(a);
  const nb = normalizeIpa(b);
  if (!na || !nb) return 1;
  if (na === nb) return 0;
  if (stripIpaMarks(na) === stripIpaMarks(nb)) return 0.25;
  if (phoneClass(na) === phoneClass(nb)) return 0.5;
  return 1;
}

/**
 * 把 espeak 输出的一段连写 IPA 切成音素序列（贪婪最长匹配）。
 * espeak 的 --ipa 输出是 "dʒˈɛm" 这种连写形式，必须切分才能与模型输出对齐。
 */
export function splitIpaToPhones(text: string): string[] {
  const cleaned = text.replace(/[ˈˌ]/g, '');
  const out: string[] = [];
  let i = 0;
  while (i < cleaned.length) {
    const ch = cleaned[i];
    if (ch === ' ' || ch === '_' || ch === '|') {
      i++;
      continue;
    }
    let matched = '';
    for (const p of PHONES_BY_LEN) {
      if (cleaned.startsWith(p, i)) {
        matched = p;
        break;
      }
    }
    if (matched) {
      out.push(matched);
      i += matched.length;
    } else {
      i++; // 未知字符：跳过（例如 espeak 的非 IPA 标记）
    }
  }
  return out;
}

/* ================================================================== *
 * 第二部分：DTW 对齐（纯逻辑，Node 可测）
 * ================================================================== */

/** 操作类型：M 匹配 / S 替换 / D 删除（漏读）/ I 插入（多读） */
export type PhonemeOpKind = 'M' | 'S' | 'D' | 'I';

export interface PhonemeStep {
  op: PhonemeOpKind;
  /** 参考音素（D 时有值） */
  expected: string | null;
  /** 实际音素（I 时有值） */
  actual: string | null;
  cost: number;
}

export interface SequenceAlignment {
  steps: PhonemeStep[];
  totalCost: number;
  /** 0~1，越大越接近 */
  similarity: number;
}

const SUB_COST = 1.0;   // 替换
const INS_COST = 0.7;   // 插入：多读
const DEL_COST = 0.7;   // 删除：漏读
// SUB < INS+DEL，保证「读错一个音」判为替换，而不是「漏一个 + 多一个」

/**
 * 动态时间规整（DTW）对齐参考序列与实际序列。
 *
 * 为什么必须用 DTW 而不是逐位比较：学生语速快慢、连读吞音都会让序列「错位」，
 * 逐位比较会把整段都判成错误。DTW 允许插入/删除路径自然地吸收这种伸缩。
 *
 * 带状约束（band）把复杂度从 O(n*m) 压到 O(n*band)：
 * 参考音素与实际音素的偏差不会超过总长的 20% 才有诊断价值，
 * 超出这个范围多半是「读漏了一整段」，那属于 L0 的覆盖率问题，不是音素问题。
 */
export function alignPhonemeSequences(expected: string[], actual: string[], band?: number): SequenceAlignment {
  const n = expected.length;
  const m = actual.length;
  if (n === 0 && m === 0) return { steps: [], totalCost: 0, similarity: 1 };
  if (n === 0) {
    return {
      steps: actual.map((a) => ({ op: 'I' as const, expected: null, actual: a, cost: INS_COST })),
      totalCost: m * INS_COST,
      similarity: 0,
    };
  }
  if (m === 0) {
    return {
      steps: expected.map((e) => ({ op: 'D' as const, expected: e, actual: null, cost: DEL_COST })),
      totalCost: n * DEL_COST,
      similarity: 0,
    };
  }

  const w = band ?? Math.max(24, Math.ceil(0.2 * Math.max(n, m)));
  const result = dtw(expected, actual, w);
  // 带状约束可能把最优路径挡在带外（极端输入），退化为全矩阵再算一次
  return result ?? dtw(expected, actual, Number.POSITIVE_INFINITY) ?? emptyAlignment();
}

function emptyAlignment(): SequenceAlignment {
  return { steps: [], totalCost: Number.POSITIVE_INFINITY, similarity: 0 };
}

function dtw(expected: string[], actual: string[], band: number): SequenceAlignment | null {
  const n = expected.length;
  const m = actual.length;
  const INF = Number.POSITIVE_INFINITY;
  const cost: Float64Array[] = [];
  const back: Uint8Array[] = []; // 1=对角 2=删除 3=插入
  for (let i = 0; i <= n; i++) {
    cost.push(new Float64Array(m + 1).fill(INF));
    back.push(new Uint8Array(m + 1));
  }
  cost[0][0] = 0;
  for (let j = 1; j <= m; j++) {
    cost[0][j] = cost[0][j - 1] + INS_COST;
    back[0][j] = 3;
  }
  for (let i = 1; i <= n; i++) {
    cost[i][0] = cost[i - 1][0] + DEL_COST;
    back[i][0] = 2;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (Math.abs(i - j) > band) continue; // 带外不计算
      const sub = cost[i - 1][j - 1] + phoneDistance(expected[i - 1], actual[j - 1]);
      const del = cost[i - 1][j] + DEL_COST;
      const ins = cost[i][j - 1] + INS_COST;
      // 顺序即优先级：对角 > 删除 > 插入，保证回溯稳定、结果可复现
      if (sub <= del && sub <= ins) {
        cost[i][j] = sub;
        back[i][j] = 1;
      } else if (del <= ins) {
        cost[i][j] = del;
        back[i][j] = 2;
      } else {
        cost[i][j] = ins;
        back[i][j] = 3;
      }
    }
  }

  const total = cost[n][m];
  if (!Number.isFinite(total)) return null;

  // 回溯
  const rev: PhonemeStep[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    const d = back[i][j];
    if (i > 0 && j > 0 && d === 1) {
      const e = expected[i - 1];
      const a = actual[j - 1];
      const dist = phoneDistance(e, a);
      rev.push({ op: dist === 0 ? 'M' : 'S', expected: e, actual: a, cost: dist });
      i--;
      j--;
    } else if (i > 0 && (d === 2 || j === 0)) {
      rev.push({ op: 'D', expected: expected[i - 1], actual: null, cost: DEL_COST });
      i--;
    } else if (j > 0) {
      rev.push({ op: 'I', expected: null, actual: actual[j - 1], cost: INS_COST });
      j--;
    } else {
      // i>0 且 j===0 一定走删除分支；这里只是防御，正常不会命中
      rev.push({ op: 'D', expected: expected[i - 1], actual: null, cost: DEL_COST });
      i--;
    }
  }
  const steps = rev.reverse();
  // similarity：以最长序列为分母，短的一方全对也只能拿到比例分
  const denom = Math.max(n, m);
  return { steps, totalCost: total, similarity: Math.max(0, 1 - total / (denom * SUB_COST)) };
}

/* ================================================================== *
 * 第三部分：G2P（参考音素）
 * ================================================================== */

export interface G2PResult {
  /** 每个词的参考音素序列 */
  words: string[][];
  source: 'espeak' | 'fallback';
}

/** 词切分：与 L0 的 tokenize 保持一致的最小依赖（只用 a-z 与撇号） */
function splitWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/** espeak-phonemizer 的最小接口（只用 toIPA） */
interface EspeakModule {
  toIPA?: (text: string, options?: unknown) => string | Promise<string>;
  default?: { toIPA?: (text: string, options?: unknown) => string | Promise<string> };
}

let espeakCache: EspeakModule | null = null;

/**
 * 载入 espeak-phonemizer（GPL-3.0-only）。
 * 只在真正需要 G2P 时动态 import：它带 WASM，有几百 KB，
 * 不该拖慢首屏，也不能进 Node 测试路径。
 */
async function loadEspeak(): Promise<EspeakModule> {
  if (espeakCache) return espeakCache;
  const g = globalThis as unknown as { window?: unknown };
  if (typeof g.window === 'undefined') {
    // 没有 window 说明不是浏览器（Node/测试），espeak-phonemizer 的 WASM 在这里没有意义
    throw new EngineUnavailable('当前环境不支持 espeak G2P。', 'L1', 'g2p_unsupported');
  }
  try {
    // @ts-ignore —— 可选依赖：未安装时由 fallbackG2p 接管，安装后自动生效
    const mod = (await import('espeak-phonemizer')) as EspeakModule;
    const api = mod?.toIPA ? mod : mod?.default;
    if (!api?.toIPA) throw new Error('espeak-phonemizer 未导出 toIPA');
    espeakCache = api as EspeakModule;
    return espeakCache;
  } catch (e) {
    throw new EngineUnavailable(
      'espeak-phonemizer 加载失败（参考音素将退化为近似值）：' + String(e),
      'L1',
      'g2p_load_failed',
    );
  }
}

/** 仅供测试：清缓存 */
export function resetEspeak(): void {
  espeakCache = null;
}

/**
 * 取得参考文本的音素序列。
 * 优先 espeak（与 wav2vec2-lv-60 的训练目标完全一致），失败则用内置近似规则。
 * 无论走哪条路都会返回结果，不抛错 —— G2P 不是阻断性依赖。
 */
export async function g2pReference(text: string): Promise<G2PResult> {
  const words = splitWords(text);
  if (words.length === 0) return { words: [], source: 'fallback' };

  try {
    const espeak = await loadEspeak();
    const raw = await espeak.toIPA!(words.join(' '));
    const chunks = String(raw).split(/\s+/).filter(Boolean);
    // espeak 的分词与我们的可能不一致（连字符、缩写），数量对不上时逐词回退
    if (chunks.length === words.length) {
      const phones = chunks.map((c) => splitIpaToPhones(c)).filter((p) => p.length > 0);
      if (phones.length === words.length) return { words: phones, source: 'espeak' };
    }
  } catch {
    /* 落到 fallback */
  }
  return { words: words.map((w) => fallbackG2pWord(w)), source: 'fallback' };
}

/* --- 内置近似 G2P ------------------------------------------------- *
 * 规则式字音转换，精度远不如 espeak，只在 espeak 不可用时兜底。
 * 存在的意义：宁可给出「有误差的参考」，也不要让整个音素层罢工。
 * ------------------------------------------------------------------ */

/** 多字符组合优先匹配（长的放前面） */
const DIGRAPHS: Array<[string, string[]]> = [
  ['tion', ['ʃ', 'ə', 'n']],
  ['sion', ['ʒ', 'ə', 'n']],
  ['ture', ['tʃ', 'ə']],
  ['ough', ['ʌ', 'f']],
  ['igh', ['a', 'ɪ']],
  ['air', ['ɛ', 'r']],
  ['ear', ['ɪ', 'r']],
  ['eer', ['ɪ', 'r']],
  ['oor', ['ʊ', 'r']],
  ['ch', ['tʃ']],
  ['sh', ['ʃ']],
  ['th', ['θ']],
  ['ph', ['f']],
  ['wh', ['w']],
  ['ck', ['k']],
  ['ng', ['ŋ']],
  ['qu', ['k', 'w']],
  ['kn', ['n']],
  ['gn', ['n']],
  ['wr', ['r']],
  ['mb', ['m']],
  ['gh', []],
  ['ee', ['iː']],
  ['ea', ['iː']],
  ['ei', ['eɪ']],
  ['ie', ['iː']],
  ['ai', ['eɪ']],
  ['ay', ['eɪ']],
  ['oi', ['ɔɪ']],
  ['oy', ['ɔɪ']],
  ['ou', ['aʊ']],
  ['ow', ['aʊ']],
  ['oa', ['əʊ']],
  ['oo', ['uː']],
  ['ue', ['uː']],
  ['ui', ['uː']],
  ['au', ['ɔː']],
  ['aw', ['ɔː']],
  ['ll', ['l']],
  ['ss', ['s']],
  ['tt', ['t']],
  ['pp', ['p']],
  ['mm', ['m']],
  ['nn', ['n']],
  ['rr', ['r']],
  ['ff', ['f']],
  ['dd', ['d']],
  ['gg', ['ɡ']],
  ['bb', ['b']],
  ['cc', ['k']],
  ['ar', ['ɑː']],
  ['er', ['ə']],
  ['ir', ['ɜː']],
  ['ur', ['ɜː']],
  ['or', ['ɔː']],
];

const SINGLE: Record<string, string> = {
  a: 'æ', e: 'e', i: 'ɪ', o: 'ɒ', u: 'ʌ', y: 'j',
  b: 'b', c: 'k', d: 'd', f: 'f', g: 'ɡ', h: 'h', j: 'dʒ', k: 'k',
  l: 'l', m: 'm', n: 'n', p: 'p', q: 'k', r: 'ɹ', s: 's', t: 't',
  v: 'v', w: 'w', x: 'ks', z: 'z',
};

/** 字母 → 长音（用于 silent-e 规则） */
const LONG_OF: Record<string, string> = {
  æ: 'eɪ', e: 'iː', ɪ: 'aɪ', ɒ: 'əʊ', ʌ: 'juː',
};

/** 近似 G2P：把一个单词切成音素序列（质量有限，够用即可） */
export function fallbackG2pWord(word: string): string[] {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return [];

  // 复数 / 三单
  let body = w;
  const tail: string[] = [];
  if (body.endsWith('ing') && body.length > 4) {
    body = body.slice(0, -3);
    tail.push('ɪ', 'ŋ');
  } else if (body.endsWith('ed') && body.length > 3) {
    body = body.slice(0, -2);
    const last = body[body.length - 1] ?? '';
    tail.push('ptkbdgf'.includes(last) ? 't' : last === 'd' ? 'ɪ' + 'd' : 'd');
  } else if (body.endsWith('es') && body.length > 3) {
    body = body.slice(0, -2);
    tail.push('ɪ', 'z');
  } else if (body.endsWith('s') && body.length > 2) {
    body = body.slice(0, -1);
    const last = body[body.length - 1] ?? '';
    tail.push('ptkfθ'.includes(last) ? 's' : 'z');
  }

  // silent e：词尾 -e 不发音，但它会把前一个元音拉长（make → /meɪk/）。
  // 必须在扫描「之前」把尾字母摘掉，不能扫描完再 pop —— 否则像 three 这种
  // 以 ee 结尾的词，刚由双字母规则生成的 /iː/ 会被当成尾字母删掉。
  const silentE = body.length > 2 && body.endsWith('e') && !body.endsWith('le');
  const scan = silentE ? body.slice(0, -1) : body;

  const out: string[] = [];
  let i = 0;
  while (i < scan.length) {
    let matched = false;
    for (const [k, phones] of DIGRAPHS) {
      if (scan.startsWith(k, i)) {
        out.push(...phones);
        i += k.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = scan[i];
    const isFinal = i === scan.length - 1;
    // 词尾元音有自己的读法：hello → /həˈləʊ/、happy → /ˈhæpi/
    if (isFinal && ch === 'o') {
      out.push('əʊ');
      i++;
      continue;
    }
    if (isFinal && (ch === 'i' || ch === 'y')) {
      out.push('i');
      i++;
      continue;
    }
    // c 在 e/i/y 前读 /s/，g 在 e/i/y 前读 /dʒ/（英式常见读法）
    if (ch === 'c' && 'eiy'.includes(scan[i + 1] ?? '')) {
      out.push('s');
    } else if (ch === 'g' && 'eiy'.includes(scan[i + 1] ?? '')) {
      out.push('dʒ');
    } else {
      const p = SINGLE[ch];
      if (p) out.push(p);
    }
    i++;
  }

  // silent e 的后半段效果：把「最后一个元音」换成它的长音。
  // 注意要找最后一个元音而不是最后一个音素 —— make 的元音在 -ɪk 的中间位置。
  if (silentE) {
    for (let k = out.length - 1; k >= 0; k--) {
      if (phoneClass(out[k]) !== 'vowel') continue;
      if (LONG_OF[out[k]]) out[k] = LONG_OF[out[k]];
      break;
    }
  }

  return [...out, ...tail];
}

/* ================================================================== *
 * 第四部分：错误解释（把 S/D/I 变成学生看得懂的中文）
 * ================================================================== */

export interface PhonemeError {
  type: 'S' | 'D' | 'I';
  /** 出问题或多余的音素 */
  phoneme: string;
  /** 对应的参考音素（S 时有值） */
  expected?: string;
  word: string;
  /** 该词中的位置（音素序号） */
  index: number;
  detail: string;
  tip: string;
}

/** 常见易混音素的中文提示 */
const TIPS: Record<string, string> = {
  'θ|s': '舌尖要轻触上齿边缘送气，不要读成 /s/。',
  'θ|t': '舌尖抵上齿但不通电，送气不出声。',
  'ð|z': '舌尖轻触上齿同时声带要振动，别读成 /z/。',
  'ð|d': '舌尖轻触上齿同时声带要振动，别读成 /d/。',
  'v|w': '上齿咬下唇送气，不要用双唇摩擦。',
  'l|r': '舌尖抵上齿龈；/l/ 不能卷舌。',
  'iː|ɪ': '长音要拉满时长，短音要短促。',
  'ɪ|iː': '短促的 /ɪ/ 不要拖长。',
  'æ|ɛ': '开口更大，舌位更前。',
  'ʃ|s': '双唇略前收、舌面靠近上腭。',
  'ŋ|n': '舌根抵软腭，不要用舌尖抵齿龈。',
  'tʃ|ʃ': '先闭塞再释放，不能漏掉前半段。',
  'dʒ|ʒ': '先闭塞再释放，声带要振动。',
};

function genericTip(type: 'S' | 'D' | 'I', expected: string | null, actual: string | null): string {
  if (type === 'D') return '这个音没读出来（漏读），慢速跟读时把它读完整。';
  if (type === 'I') return '多读了一个音（' + (actual ?? '') + '），注意不要添加多余音。';
  if (expected && actual && phoneClass(expected) === phoneClass(actual)) {
    return '同一个发音部位，口型没有到位，注意舌位与开口度。';
  }
  return '先分清发音部位，再模仿范读音频的口型。';
}

/** 解释一条错误 */
export function describeError(
  type: 'S' | 'D' | 'I',
  expected: string | null,
  actual: string | null,
  word: string,
  index: number,
): PhonemeError {
  const phoneme = type === 'I' ? (actual ?? '') : (expected ?? '');
  const detail =
    type === 'D'
      ? '漏读：' + word + ' 中的 /' + phoneme + '/ 没有发出来'
      : type === 'I'
        ? '多读：' + word + ' 中多出了 /' + phoneme + '/'
        : '错读：' + word + ' 中的 /' + (expected ?? '') + '/ 读成了 /' + (actual ?? '') + '/';
  const key = (expected ?? '') + '|' + (actual ?? '');
  const tip = TIPS[key] ?? genericTip(type, expected, actual);
  return { type, phoneme, expected: expected ?? undefined, word, index, detail, tip };
}

/* ================================================================== *
 * 第五部分：报告结构
 * ================================================================== */

export interface WordPhonemeResult {
  index: number;
  word: string;
  /** 参考音素 */
  expected: string[];
  /** 实际音素（按对齐顺序，取自学生真实输出） */
  actual: string[];
  steps: PhonemeStep[];
  /** 0~1 */
  accuracy: number;
  /** 0~1，在 accuracy 基础上按录音质量与 G2P 来源打折 */
  confidence: number;
  errors: PhonemeError[];
}

export interface PhonemeReport {
  reference: string;
  words: WordPhonemeResult[];
  /** 全局准确率 0~1 */
  accuracy: number;
  /** 全局置信度 0~1 */
  confidence: number;
  summary: {
    substitutions: number;
    deletions: number;
    insertions: number;
    totalErrors: number;
    correct: number;
    expectedTotal: number;
  };
  errors: PhonemeError[];
  g2p: 'espeak' | 'fallback';
  model: string;
  audioQuality: number;
  durationMs: number;
}

/** 逐词对齐：把扁平 DTW 路径按参考词切块 */
export function alignByWord(
  refWords: string[],
  expectedByWord: string[][],
  actualFlat: string[],
  opts: { qualityWeight?: number; g2pSource?: 'espeak' | 'fallback' } = {},
): { words: WordPhonemeResult[]; errors: PhonemeError[]; summary: PhonemeReport['summary']; totalScore: number } {
  const qualityWeight = opts.qualityWeight ?? 1;
  const g2pSource = opts.g2pSource ?? 'espeak';
  const flatExpected: string[] = [];
  const wordOf: number[] = [];
  expectedByWord.forEach((phones, wi) => {
    for (const p of phones) {
      flatExpected.push(p);
      wordOf.push(wi);
    }
  });

  const aligned = alignPhonemeSequences(flatExpected, actualFlat);
  const steps = aligned.steps;

  const words: WordPhonemeResult[] = expectedByWord.map((phones, wi) => ({
    index: wi,
    word: refWords[wi] ?? String(wi),
    expected: phones.slice(),
    actual: [],
    steps: [],
    accuracy: 0,
    confidence: 0,
    errors: [],
  }));

  // 回溯后的 steps 是正向的；I（多读）归属于它前面最近的参考词
  let ei = 0;
  let ai = 0;
  let currentWord = 0;
  let totalScore = 0;
  const summary: PhonemeReport['summary'] = {
    substitutions: 0, deletions: 0, insertions: 0, totalErrors: 0, correct: 0, expectedTotal: flatExpected.length,
  };

  for (const st of steps) {
    if (st.op === 'I') {
      const wi = Math.min(words.length - 1, Math.max(0, currentWord));
      const owner = words[wi];
      if (owner) {
        owner.steps.push(st);
        owner.errors.push(describeError('I', null, st.actual, owner.word, owner.actual.length));
      }
      totalScore -= 0.5;
      summary.insertions++;
      ai++;
      continue;
    }
    const wi = wordOf[ei];
    const owner = words[wi];
    if (owner) {
      owner.steps.push(st);
      if (st.op === 'D') {
        owner.errors.push(describeError('D', st.expected, null, owner.word, owner.expected.length - owner.actual.length - 1));
        summary.deletions++;
      } else {
        owner.actual.push(st.actual as string);
        if (st.op === 'M') {
          owner.actual[owner.actual.length - 1] = st.actual as string;
          summary.correct++;
        } else {
          owner.errors.push(describeError('S', st.expected, st.actual, owner.word, owner.actual.length - 1));
          summary.substitutions++;
        }
      }
      currentWord = wi;
    }
    if (st.op === 'M') totalScore += 1 - st.cost;
    else if (st.op === 'S') totalScore += Math.max(0, 0.5 - st.cost * 0.5);
    ei++;
    if (st.op !== 'D') ai++;
  }

  const errors: PhonemeError[] = [];
  for (const w of words) {
    const n = w.expected.length;
    if (n === 0) {
      w.accuracy = w.actual.length === 0 && w.errors.length === 0 ? 1 : 0;
    } else {
      let score = 0;
      for (const s of w.steps) {
        if (s.op === 'M') score += 1 - s.cost;
        else if (s.op === 'S') score += Math.max(0, 0.5 - s.cost * 0.5);
      }
      score -= 0.5 * w.errors.filter((e) => e.type === 'I').length;
      w.accuracy = Math.max(0, Math.min(1, score / n));
    }
    w.confidence = Math.max(0, Math.min(1, w.accuracy * qualityWeight * (g2pSource === 'fallback' ? 0.75 : 1)));
    errors.push(...w.errors);
  }

  summary.totalErrors = summary.substitutions + summary.deletions + summary.insertions;
  return { words, errors, summary, totalScore };
}

/* ================================================================== *
 * 第六部分：模型（浏览器才有）
 * ================================================================== */

/** Transformers.js 的最小接口面（只声明我们用到的方法） */
interface TransformersApi {
  AutoProcessor: { from_pretrained(id: string, opts?: Record<string, unknown>): Promise<unknown> };
  AutoModelForCTC: { from_pretrained(id: string, opts?: Record<string, unknown>): Promise<unknown> };
  AutoTokenizer: { from_pretrained(id: string, opts?: Record<string, unknown>): Promise<unknown> };
  env?: { allowLocalModels?: boolean; backends?: { onnx?: { wasm?: { numThreads?: number } } } };
}

interface PhonemeSession {
  processor: (audio: Float32Array) => Promise<Record<string, unknown>>;
  // CTC 模型的输出 logits 是一维 Float32Array（batch=1 已隐含）
  model: (inputs: Record<string, unknown>) => Promise<{ logits: Float32Array }>;
  tokenizer: { decode(logits: Float32Array, opts?: Record<string, unknown>): string };
  device: 'webgpu' | 'wasm';
}

let session: PhonemeSession | null = null;
let loading: Promise<PhonemeSession> | null = null;

/** 音素模型是否就绪 */
export function isPhonemeModelReady(): boolean {
  return session !== null && getModelState('phoneme') === 'ready';
}

export interface LoadProgress {
  status: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
}

/**
 * 载入音素模型。失败抛 EngineUnavailable，绝不把异常抛穿到 UI。
 * 同一个 promise 复用，避免用户连点触发多次下载。
 */
export async function loadPhonemeModel(
  opts: { device?: 'webgpu' | 'wasm'; onProgress?: (p: LoadProgress) => void } = {},
): Promise<void> {
  if (session) return;
  if (loading) return loading.then(() => undefined);

  loading = (async (): Promise<PhonemeSession> => {
    setModelState('phoneme', 'loading');
    try {
      // @ts-ignore —— 可选重量级依赖，未安装/不可用时统一降级
      const lib = (await import('@huggingface/transformers')) as unknown as TransformersApi;
      const device = opts.device ?? pickDevice(true);
      const onProgress = opts.onProgress
        ? (p: unknown) => {
            try {
              opts.onProgress?.(p as LoadProgress);
            } catch {
              /* 进度回调异常不能影响加载 */
            }
          }
        : undefined;

      const processor = (await lib.AutoProcessor.from_pretrained(PHONEME_MODEL_ID)) as PhonemeSession['processor'];
      const model = (await lib.AutoModelForCTC.from_pretrained(PHONEME_MODEL_ID, {
        device,
        dtype: device === 'webgpu' ? 'fp32' : 'q8',
        progress_callback: onProgress,
      })) as PhonemeSession['model'];
      const tokenizer = (await lib.AutoTokenizer.from_pretrained(PHONEME_MODEL_ID, {
        progress_callback: onProgress,
      })) as PhonemeSession['tokenizer'];

      session = { processor, model, tokenizer, device };
      setModelState('phoneme', 'ready');
      return session;
    } catch (e) {
      setModelState('phoneme', 'failed');
      throw new EngineUnavailable(
        '音素模型加载失败（本次只提供规则反馈）：' + String(e),
        'L1',
        'model_load_failed',
      );
    } finally {
      loading = null;
    }
  })();

  return loading.then(() => undefined);
}

/** 仅供测试/换模型：释放会话 */
export function resetPhonemeModel(): void {
  session = null;
  loading = null;
  setModelState('phoneme', 'idle');
}

/** 内部：确保模型可用，否则抛 EngineUnavailable */
async function requireSession(): Promise<PhonemeSession> {
  if (session) return session;
  if (getModelState('phoneme') === 'failed') {
    throw new EngineUnavailable('音素模型上次加载失败，请点击重试。', 'L1', 'model_failed');
  }
  await loadPhonemeModel();
  if (!session) throw new EngineUnavailable('音素模型不可用。', 'L1', 'model_unavailable');
  return session;
}

/**
 * 识别音频中实际发出的音素（模型推理）。
 * 模型输出是 espeak 风格的 IPA 串，直接按分隔符切成音素序列；
 * 若模型给出了词分隔符（|），按词分组返回。
 */
export async function recognizePhonemes(samples: Float32Array): Promise<string[]> {
  const s = await requireSession();
  const inputs = await s.processor(samples);
  const out = await s.model(inputs);
  return splitModelOutput(s.tokenizer.decode(out.logits, { skip_special_tokens: true }));
}

/**
 * 把模型输出切成音素。
 * 模型的 tokenizer 通常以空格分隔音素、以 | 分隔词；
 * 两种情况都可能出现，因此这里做宽松处理：
 * 有 | 就按 | 切（去掉分隔符），否则按空白切，都没有就按音素表贪婪切。
 */
export function splitModelOutput(text: string): string[] {
  const raw = String(text ?? '');
  if (!raw.trim()) return [];
  const cleaned = raw.replace(/<\|[^>]*>/g, ' ').trim();
  const byWord = cleaned.split('|').map((s) => s.trim()).filter(Boolean);
  const source = byWord.length > 0 ? byWord : cleaned.split(/\s+/);
  const out: string[] = [];
  for (const chunk of source) {
    if (/^[a-zɐ-ʯːˈˌ]+$/i.test(chunk) && chunk.length <= 3 && splitIpaToPhones(chunk).length === 1) {
      out.push(normalizeIpa(chunk));
    } else {
      out.push(...splitIpaToPhones(chunk));
    }
  }
  return out.filter((p) => p.length > 0);
}

export interface AssessOptions {
  device?: 'webgpu' | 'wasm';
  onProgress?: (p: LoadProgress) => void;
}

/**
 * 入口：比对朗读音频与参考文本的音素。
 *
 * 降级链：
 * 1. 模型加载失败 → EngineUnavailable（UI 隐藏音素面板，L0 照常）
 * 2. 模型可用但 G2P 不可用 → 用内置近似规则，report.g2p 标记为 fallback，置信度打折
 * 3. 音频静音 → 返回一份 accuracy=0 的报告并保留警告，不抛错
 */
export async function assessPhonemes(
  audio: Float32Array,
  sampleRate: number,
  refText: string,
  opts: AssessOptions = {},
): Promise<PhonemeReport> {
  const active = await requireSession();
  const prepared = preprocessForModel(audio, sampleRate, TARGET_SAMPLE_RATE);
  const q = audioQuality(prepared.samples);

  const g2p = await g2pReference(refText);
  const refWords = splitWords(refText);

  const actualFlat = prepared.samples.length > 0 ? await recognizeWithSession(active, prepared.samples) : [];
  const { words, errors, summary, totalScore } = alignByWord(
    refWords,
    g2p.words,
    actualFlat,
    { qualityWeight: 0.6 + 0.4 * q, g2pSource: g2p.source },
  );

  const accuracy = summary.expectedTotal > 0
    ? Math.max(0, Math.min(1, totalScore / summary.expectedTotal))
    : 0;

  return {
    reference: refText,
    words,
    accuracy,
    confidence: Math.max(0, Math.min(1, accuracy * (0.6 + 0.4 * q) * (g2p.source === 'fallback' ? 0.75 : 1))),
    summary,
    errors,
    g2p: g2p.source,
    model: PHONEME_MODEL_ID,
    audioQuality: q,
    durationMs: prepared.durationMs,
  };
}

async function recognizeWithSession(s: PhonemeSession, samples: Float32Array): Promise<string[]> {
  const inputs = await s.processor(samples);
  const out = await s.model(inputs);
  return splitModelOutput(s.tokenizer.decode(out.logits, { skip_special_tokens: true }));
}
