/**
 * 构建期听力音频渲染 —— 把 data/listening-materials.json 的台词合成为 mp3/wav
 *
 * 许可：AGPL-3.0-only（脚本与产物均适用）
 *
 * ## 为什么在构建期渲染，而不是浏览器里跑
 *
 * 听力材料是固定文本，音频是静态资源。在学生浏览器里现场合成意味着
 * 每台设备都要下 88 MB 的 Kokoro 模型并逐段等待 —— 那等于把
 * 「所有工作前置」又推回考前几分钟。构建期渲染后，学生端只剩下载音频。
 *
 * 顺带解决依赖冲突：kokoro-js 锁在 @huggingface/transformers ^3.5.1，
 * 而本项目用的是 4.3.0。把 kokoro-js 装在 scripts/ 侧（见 scripts/package.json），
 * 就不会污染浏览器产物。两套 transformers 互不干扰。
 *
 * ## 用法
 *
 *     npm run audio:check          # 只报告哪些需要重渲，不合成
 *     npm run audio:build          # 全量合成
 *     npm run audio:build -- --only lsq-01
 *     npm run audio:build -- --format mp3     # 需要 PATH 上有 ffmpeg
 *
 * 默认输出 mp3，用纯 JS 的 LAME 移植编码，**不需要系统装 ffmpeg**。
 * 语音用 64 kbps 单声道足够：193 秒约 1.5 MB，WAV 是 8.84 MB。
 *
 * 注意运行时默认就是按 .mp3 取音频（buildSteps 的 ext 默认值），
 * 所以 mp3 不是可选项 —— 输出 wav 会导致运行时 404。
 *
 * ## 改了题目怎么办
 *
 * 改**台词**必须重渲（指纹会变）；只改题干/选项/答案不必重渲。
 * `--check` 会分别列出来。
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import lamejsPkg from '@breezystack/lamejs';

import { createListeningBank, type ListeningMaterial } from '../src/suzhou/listening-bank.ts';
import { buildListeningMaterials } from '../src/suzhou/bank-import.ts';
import {
  planAll,
  toManifest,
  staleEntries,
  DEFAULT_VOICES,
  AUDIO_SEGMENT_GAP_MS,
  type AudioPlan,
  type AudioManifest,
} from '../src/suzhou/listening-audio.ts';

const lamejs = lamejsPkg as unknown as { Mp3Encoder: new (c: number, r: number, k: number) => { encodeBuffer(b: Float32Array): Int8Array; flush(): Int8Array } };

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'public', 'audio', 'listening');
const BANK_FILE = join(ROOT, 'data', 'bank', 'items.json');
const MANIFEST_FILE = join(OUT_DIR, 'manifest.json');

interface Args {
  check: boolean;
  only: string | null;
  format: 'mp3' | 'wav';
}
function parseArgs(argv: string[]): Args {
  const out: Args = { check: false, only: null, format: 'mp3' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') out.check = true;
    else if (a === '--only') out.only = argv[++i] ?? null;
    else if (a === '--format') out.format = (argv[++i] === 'wav' ? 'wav' : 'mp3');
  }
  return out;
}

/* ---------- WAV 写出 ---------- */

function writeWav(samples: Float32Array, sampleRate: number): Buffer {
  const dataBytes = samples.length * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8, 'ascii');
  buf.write('fmt ', 12, 'ascii');
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36, 'ascii');
  buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s < 0 ? s * 0x8000 : s * 0x7fff), 44 + i * 2);
  }
  return buf;
}

/**
 * Float32 PCM → MP3 字节。
 *
 * 用纯 JS 的 LAME 移植（@breezystack/lamejs），**不依赖系统 ffmpeg**。
 * 构建期脚本，产物不进浏览器，许可无冲突。
 *
 * 64 kbps 单声道足够承载 TTS 语音：193 秒约 1.5 MB，
 * 而 24kHz/16bit WAV 是 8.84 MB，差 5.8 倍。
 */
export const MP3_KBPS = 64;

export function encodeMp3(samples: Float32Array, sampleRate: number): Buffer {
  const enc = new lamejs.Mp3Encoder(1, sampleRate, MP3_KBPS);
  const blocks: Buffer[] = [];
  const BLOCK = 1152;
  const pcm = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = Math.round(s < 0 ? s * 0x8000 : s * 0x7fff);
  }
  for (let i = 0; i < pcm.length; i += BLOCK) {
    const buf = enc.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (buf.length > 0) blocks.push(Buffer.from(buf));
  }
  const tail = enc.flush();
  if (tail.length > 0) blocks.push(Buffer.from(tail));
  return Buffer.concat(blocks);
}

function concatWithGaps(
  parts: Array<{ samples: Float32Array; speaker: string }>,
  sampleRate: number,
): Float32Array {
  const gap = Math.round((AUDIO_SEGMENT_GAP_MS / 1000) * sampleRate);
  let total = 0;
  for (let i = 0; i < parts.length; i++) {
    total += parts[i].samples.length;
    if (i < parts.length - 1 && parts[i + 1].speaker !== parts[i].speaker) total += gap;
  }
  const out = new Float32Array(total);
  let off = 0;
  for (let i = 0; i < parts.length; i++) {
    if (i > 0 && parts[i].speaker !== parts[i - 1].speaker) off += gap;
    out.set(parts[i].samples, off);
    off += parts[i].samples.length;
  }
  return out;
}

/* ---------- 运行时（kokoro-js，装在 scripts/ 侧） ---------- */

/**
 * kokoro-js 的 generate() 返回 transformers.js 的 `RawAudio`。
 * 实测这个类型只有 `.audio`（Float32Array）、`.sampling_rate`、`toWav()`、`toBlob()`，
 * **没有 `toRaw()`** —— 之前写错就是这个报错。
 */
interface RawAudioLike {
  audio: Float32Array;
  sampling_rate: number;
}
interface KokoroTTS {
  generate(text: string, opts: { voice: string }): Promise<RawAudioLike>;
}
interface KokoroModule {
  KokoroTTS: { from_pretrained(id: string, opts: { dtype: string }): Promise<KokoroTTS> };
}

const KOKORO_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

/**
 * 把模型远端切到 ModelScope。
 *
 * 与浏览器侧是同一个理由：huggingface.co 在大陆被 DNS 投毒到
 * 199.16.156.7（Twitter 网段），TCP 443 不通。
 * kokoro-js 内部用 @huggingface/transformers 的默认 remoteHost，
 * 这里在加载之前改掉 —— scripts/ 只有一份 transformers，改了 kokoro-js 也吃到。
 */
async function useDomesticModelSource(): Promise<string> {
  try {
    const spec = '@huggingface/transformers';
    const tf = (await import(spec)) as unknown as {
      env: { remoteHost: string; remotePathTemplate: string };
    };
    tf.env.remoteHost = 'https://www.modelscope.cn/';
    tf.env.remotePathTemplate = 'models/{model}/resolve/master/';
    return 'ModelScope（modelscope.cn）';
  } catch {
    return '未切换，沿用默认远端';
  }
}

async function loadKokoro(): Promise<KokoroTTS> {
  const source = await useDomesticModelSource();
  console.log('  模型源：' + source);
  try {
    const spec = 'kokoro-js';
    const mod = (await import(spec)) as unknown as KokoroModule;
    return await mod.KokoroTTS.from_pretrained(KOKORO_ID, { dtype: 'q8' });
  } catch (e) {
    throw new Error(
      '无法加载 kokoro-js。请先在 scripts/ 目录安装依赖：\n' +
      '    cd scripts && npm install\n' +
      '原始错误：' + (e instanceof Error ? e.message : String(e)),
    );
  }
}

/* ---------- 主流程 ---------- */

function loadManifest(): AudioManifest | null {
  if (!existsSync(MANIFEST_FILE)) return null;
  try { return JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')) as AudioManifest; }
  catch { return null; }
}

function existingBytes(ext: string): Record<string, { bytes: number }> {
  const out: Record<string, { bytes: number }> = {};
  if (!existsSync(OUT_DIR)) return out;
  for (const f of readdirSync(OUT_DIR)) {
    if (!f.endsWith('.' + ext)) continue;
    out[f.slice(0, -(ext.length + 1))] = { bytes: statSync(join(OUT_DIR, f)).size };
  }
  return out;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const ext = args.format;

  const raw = JSON.parse(readFileSync(BANK_FILE, 'utf8'));
  const bank = createListeningBank(buildListeningMaterials(raw));
  const plans = planAll(bank.all, { ext: ext });
  const manifest = loadManifest();
  const have = existingBytes(ext);

  const stale = staleEntries(plans, manifest, have)
    .filter(function (p) { return !args.only || p.materialId === args.only; });

  const totalEst = plans.reduce(function (a, p) { return a + p.estimatedBytes; }, 0);
  console.log('题库：' + bank.all.length + ' 段材料，' +
    bank.all.reduce(function (a, m) { return a + m.questions.length; }, 0) + ' 小题');
  console.log('音色：' + Object.entries(DEFAULT_VOICES).map(function (e) { return e[0] + '=' + e[1]; }).join('  '));
  console.log('产物目录：public/audio/listening/（' + ext + '）');
  console.log('估算总体积：' + (totalEst / 1048576).toFixed(2) + ' MB');
  console.log('需要重渲：' + stale.length + ' / ' + plans.length);

  if (args.check) {
    for (const p of stale) {
      console.log('  · ' + p.materialId + '  ' + (p.segments.length) + ' 段  估 ' +
        (p.estimatedMs / 1000).toFixed(1) + 's  ' + (p.estimatedBytes / 1024).toFixed(0) + ' KB  [' + p.fingerprint + ']');
    }
    return;
  }

  if (stale.length === 0) {
    console.log('已是最新，无需渲染。');
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });
  console.log('加载 Kokoro（首次会下载约 88 MB 模型）…');
  const tts = await loadKokoro();

  const byId = new Map<string, ListeningMaterial>(bank.all.map(function (m) { return [m.id, m]; }));
  const freshEntries = new Map<string, import('../src/suzhou/listening-audio.ts').AudioManifestEntry>(
    (manifest?.entries ?? []).map(function (e) { return [e.id, e]; }),
  );
  const freshManifest = () => toManifest(plans);
  for (let i = 0; i < stale.length; i++) {
    const plan: AudioPlan = stale[i];
    const material = byId.get(plan.materialId);
    if (!material) throw new Error('找不到材料 ' + plan.materialId);

    const parts: Array<{ samples: Float32Array; speaker: string }> = [];
    let sampleRate = 24000;
    for (const seg of plan.segments) {
      const audio = await tts.generate(seg.text, { voice: seg.voiceId });
      sampleRate = audio.sampling_rate || sampleRate;
      parts.push({ samples: audio.audio, speaker: seg.speaker });
    }
    const merged = concatWithGaps(parts, sampleRate);
    const outPath = join(OUT_DIR, plan.materialId + '.' + ext);
    writeFileSync(outPath, ext === 'mp3' ? encodeMp3(merged, sampleRate) : writeWav(merged, sampleRate));

    const done = i + 1;
    process.stdout.write('  [' + done + '/' + stale.length + '] ' + plan.materialId + '  ' +
      (merged.length / sampleRate).toFixed(1) + 's\n');

    // 每完成一段就落 manifest，中断后重跑能从断点续上
    freshEntries.set(plan.materialId, {
      id: plan.materialId,
      url: plan.url,
      fingerprint: plan.fingerprint,
      estimatedMs: plan.estimatedMs,
      estimatedBytes: plan.estimatedBytes,
      bytes: statSync(outPath).size,
      actualMs: Math.round((statSync(outPath).size / (ext === 'mp3' ? MP3_KBPS * 125 : 48000)) * 1000),
    });
    writeFileSync(MANIFEST_FILE, JSON.stringify({
      ...freshManifest(),
      entries: freshManifest().entries.map(function (e) { return freshEntries.get(e.id) ?? e; }),
    }, null, 2) + '\n');
  }

  // manifest 回填实际体积与实际时长
  const fresh = toManifest(plans);
  for (const e of fresh.entries) {
    const path = join(OUT_DIR, e.id + '.' + ext);
    if (existsSync(path)) {
      const bytes = statSync(path).size;
      e.bytes = bytes;
      e.actualMs = Math.round((bytes / (ext === 'mp3' ? MP3_KBPS * 125 : 48000)) * 1000);
    }
  }
  writeFileSync(MANIFEST_FILE, JSON.stringify(fresh, null, 2) + '\n');
  console.log('完成。manifest 已更新：public/audio/listening/manifest.json');
}

main().catch(function (e) {
  console.error('失败：' + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});