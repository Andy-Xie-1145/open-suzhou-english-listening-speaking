/**
 * 听力音频 —— 构建期渲染的「计划」与开考前的前置清单
 *
 * 许可：AGPL-3.0-only
 *
 * ## 为什么要构建期渲染，而不是浏览器现场合成
 *
 * 听力材料是我们自己的固定文本，音频是**静态资源**。让学生浏览器现场跑 TTS
 * 意味着每台设备都要下 88 MB 的 Kokoro 模型并逐段合成，等于把「所有工作前置」
 * 这条要求又推回给了考前的几分钟。
 *
 * 构建期渲染后，学生端只剩「下载一个 mp3」，零模型、零合成等待。
 * 也顺带绕开了 kokoro-js 锁在 transformers 3.x 的版本冲突 ——
 * 那个依赖只装在 scripts/ 侧，不进浏览器产物。
 *
 * 代价：改了题目文本必须重新渲染。本模块产出的 manifest 记录了
 * 「题目内容的指纹」，scripts/build-listening-audio.ts 用它判断哪些需要重渲。
 *
 * ## 时长与体积只能估算
 *
 * 这里的 estimatedMs / estimatedBytes 是**估算值**，用于：
 *  - 开考前进度条显示「还要下多久」
 *  - 检查题库整体体积是否失控
 *
 * 真实时长以渲染产物为准，plan 里刻意不假装精确。
 */

import type { ListeningMaterial, ListeningSpeaker, ListeningUtterance } from './listening-bank.ts';
import type { PaperListeningGroup } from './paper.ts';

/* ------------------------------------------------------------------ *
 * 音色
 * ------------------------------------------------------------------ */

/**
 * 说话人 → 音色。
 *
 * 选型依据见 src/engine/tts.ts 头部：Kokoro-82M，Apache-2.0，28 个英文音色。
 * - af_heart：女声，Grade A
 * - am_michael：男声
 * - 不用 am_adam：Grade F+，听感明显偏差
 *
 * N（旁白/短文）用女声，与第一节的 W 保持一致，学生不会以为换了段材料。
 */
export const DEFAULT_VOICES: Record<ListeningSpeaker, string> = {
  W: 'af_heart',
  M: 'am_michael',
  N: 'af_heart',
};

/* ------------------------------------------------------------------ *
 * 估算参数
 * ------------------------------------------------------------------ */

/** 正常语速。Kokoro 偏快，取 2.8 词/秒偏保守（宁可估长不估短） */
export const WORDS_PER_SECOND = 2.8;

/** 说话人切换处插入的静音，与 src/engine/tts.ts 的 SPEAKER_GAP_MS 保持一致 */
export const AUDIO_SEGMENT_GAP_MS = 250;

/** mp3 @128kbps 的字节率 */
export const MP3_BYTES_PER_SECOND = 16_000;

/* ------------------------------------------------------------------ *
 * 计划
 * ------------------------------------------------------------------ */

export interface AudioSegment {
  index: number;
  speaker: ListeningSpeaker;
  voiceId: string;
  text: string;
}

export interface AudioPlan {
  materialId: string;
  /** 静态产物里的相对路径，例如 audio/listening/lsq-01.mp3 */
  url: string;
  fileName: string;
  segments: AudioSegment[];
  /** 估算时长（毫秒） */
  estimatedMs: number;
  /** 估算体积（字节） */
  estimatedBytes: number;
  /** 题目内容的指纹：script 一改，指纹就变，渲染脚本据此判断要不要重渲 */
  fingerprint: string;
}

export interface PlanOptions {
  voices?: Record<ListeningSpeaker, string>;
  ext?: string;
}

function words(text: string): number {
  const m = text.trim().match(/[A-Za-z0-9'’\-]+/g);
  return m ? m.length : 0;
}

/** 稳定字符串指纹（FNV-1a 32bit）。不追求密码学强度，只求内容变了就变 */
export function fingerprintOf(parts: string[]): string {
  let h = 0x811c9dc5;
  const s = parts.join('\u0001');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** 把一段材料拆成待合成的分段，并给每段分配音色 */
export function planSegments(
  script: readonly ListeningUtterance[],
  voices: Record<ListeningSpeaker, string> = DEFAULT_VOICES,
): AudioSegment[] {
  const out: AudioSegment[] = [];
  script.forEach(function (u, i) {
    const text = u.text.trim();
    if (!text) return;
    out.push({
      index: out.length,
      speaker: u.speaker,
      voiceId: voices[u.speaker] ?? voices.N,
      text: text,
    });
    void i;
  });
  return out;
}

/** 估算一条计划的总时长：每段按词数折算，换说话人处插静音 */
export function estimateMs(segments: readonly AudioSegment[]): number {
  let total = 0;
  let prev: ListeningSpeaker | null = null;
  for (const s of segments) {
    const durMs = (words(s.text) / WORDS_PER_SECOND) * 1000;
    total += durMs;
    if (prev !== null && prev !== s.speaker) total += AUDIO_SEGMENT_GAP_MS;
    prev = s.speaker;
  }
  return Math.round(total);
}

export function audioFileName(materialId: string, ext: string): string {
  return materialId + '.' + ext;
}

export function audioUrl(materialId: string, ext: string): string {
  return 'audio/listening/' + audioFileName(materialId, ext);
}

/** 为一份材料生成音频计划 */
export function planMaterial(
  material: ListeningMaterial,
  opts: PlanOptions = {},
): AudioPlan {
  const ext = opts.ext ?? 'mp3';
  const segments = planSegments(material.script, opts.voices ?? DEFAULT_VOICES);
  if (segments.length === 0) {
    throw new Error(material.id + '：台词为空，无法生成音频计划');
  }
  const ms = estimateMs(segments);
  return {
    materialId: material.id,
    url: audioUrl(material.id, ext),
    fileName: audioFileName(material.id, ext),
    segments: segments,
    estimatedMs: ms,
    estimatedBytes: Math.round((ms / 1000) * MP3_BYTES_PER_SECOND),
    // 只对台词和音色取指纹：改题目选项/答案不需要重渲，改台词才需要
    fingerprint: fingerprintOf(
      segments.map(function (s) { return s.speaker + '|' + s.voiceId + '|' + s.text; }),
    ),
  };
}

export function planAll(materials: readonly ListeningMaterial[], opts: PlanOptions = {}): AudioPlan[] {
  return materials.map(function (m) { return planMaterial(m, opts); });
}

/* ------------------------------------------------------------------ *
 * manifest
 * ------------------------------------------------------------------ */

export interface AudioManifestEntry {
  id: string;
  url: string;
  fingerprint: string;
  estimatedMs: number;
  estimatedBytes: number;
  /** 实际字节数，由渲染脚本回填 */
  bytes?: number;
  /** 实际时长（毫秒），由渲染脚本回填 */
  actualMs?: number;
}

export interface AudioManifest {
  version: 1;
  voiceMap: Record<ListeningSpeaker, string>;
  entries: AudioManifestEntry[];
}

export function toManifest(plans: readonly AudioPlan[]): AudioManifest {
  return {
    version: 1,
    voiceMap: { ...DEFAULT_VOICES },
    entries: plans.map(function (p) {
      return {
        id: p.materialId,
        url: p.url,
        fingerprint: p.fingerprint,
        estimatedMs: p.estimatedMs,
        estimatedBytes: p.estimatedBytes,
      };
    }),
  };
}

/** 找出需要重新渲染的条目：没有产物，或指纹对不上 */
export function staleEntries(
  plans: readonly AudioPlan[],
  manifest: AudioManifest | null,
  existing: Readonly<Record<string, { bytes?: number; actualMs?: number }>> = {},
): AudioPlan[] {
  const known = new Map<string, AudioManifestEntry>();
  for (const e of (manifest && manifest.entries) || []) known.set(e.id, e);
  return plans.filter(function (p) {
    if (known.get(p.materialId)?.fingerprint !== p.fingerprint) return true;
    const got = existing[p.materialId];
    return !got || !(got.bytes && got.bytes > 0);
  });
}

/* ------------------------------------------------------------------ *
 * 开考前的前置
 * ------------------------------------------------------------------ */

/**
 * 一份卷子需要哪些音频。
 *
 * 对应「所有工作全部前置」这条要求：开考前把这份清单全部下完，
 * 考试中就只剩播放，不再有网络请求。
 */
export function prefetchFor(
  groups: readonly PaperListeningGroup[],
  opts: PlanOptions = {},
): { urls: string[]; estimatedBytes: number; estimatedMs: number } {
  const ext = opts.ext ?? 'mp3';
  const urls: string[] = [];
  let bytes = 0;
  let ms = 0;
  for (const g of groups) {
    urls.push(audioUrl(g.material.id, ext));
    const est = estimateMs(planSegments(g.material.script, opts.voices ?? DEFAULT_VOICES));
    ms += est;
    bytes += Math.round((est / 1000) * MP3_BYTES_PER_SECOND);
  }
  return { urls: urls, estimatedBytes: bytes, estimatedMs: ms };
}