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
 * 默认输出 wav（不依赖任何编码器）。mp3 体积约为 1/10，
 * 学生端下载量差别明显，所以正式发布建议用 mp3。
 *
 * ## 改了题目怎么办
 *
 * 改**台词**必须重渲（指纹会变）；只改题干/选项/答案不必重渲。
 * `--check` 会分别列出来。
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

import { createListeningBank, type ListeningMaterial } from '../src/suzhou/listening-bank.ts';
import {
  planAll,
  toManifest,
  staleEntries,
  DEFAULT_VOICES,
  AUDIO_SEGMENT_GAP_MS,
  type AudioPlan,
  type AudioManifest,
} from '../src/suzhou/listening-audio.ts';

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'public', 'audio', 'listening');
const BANK_FILE = join(ROOT, 'data', 'listening-materials.json');
const MANIFEST_FILE = join(OUT_DIR, 'manifest.json');

interface Args {
  check: boolean;
  only: string | null;
  format: 'wav' | 'mp3';
}
function parseArgs(argv: string[]): Args {
  const out: Args = { check: false, only: null, format: 'wav' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') out.check = true;
    else if (a === '--only') out.only = argv[++i] ?? null;
    else if (a === '--format') out.format = (argv[++i] === 'mp3' ? 'mp3' : 'wav');
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

interface KokoroTTS {
  generate(text: string, opts: { voice: string }): Promise<{
    toRaw(): Float32Array;
    sampling_rate: number;
  }>;
}
interface KokoroModule {
  KokoroTTS: { from_pretrained(id: string, opts: { dtype: string }): Promise<KokoroTTS> };
}

const KOKORO_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

async function loadKokoro(): Promise<KokoroTTS> {
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
  const bank = createListeningBank(raw);
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
  for (let i = 0; i < stale.length; i++) {
    const plan: AudioPlan = stale[i];
    const material = byId.get(plan.materialId);
    if (!material) throw new Error('找不到材料 ' + plan.materialId);

    const parts: Array<{ samples: Float32Array; speaker: string }> = [];
    let sampleRate = 24000;
    for (const seg of plan.segments) {
      const audio = await tts.generate(seg.text, { voice: seg.voiceId });
      sampleRate = audio.sampling_rate || sampleRate;
      parts.push({ samples: audio.toRaw(), speaker: seg.speaker });
    }
    const merged = concatWithGaps(parts, sampleRate);
    const wavPath = join(OUT_DIR, plan.materialId + '.wav');
    writeFileSync(wavPath, writeWav(merged, sampleRate));

    if (ext === 'mp3') {
      const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath,
        '-codec:a', 'libmp3lame', '-b:a', '128k', join(OUT_DIR, plan.materialId + '.mp3')], { encoding: 'utf8' });
      if (r.status !== 0) {
        throw new Error('ffmpeg 转 mp3 失败（PATH 上没有 ffmpeg 就退回 --format wav）：\n' + (r.stderr || ''));
      }
    }

    const done = i + 1;
    process.stdout.write('  [' + done + '/' + stale.length + '] ' + plan.materialId + '  ' +
      (merged.length / sampleRate).toFixed(1) + 's\n');
  }

  // manifest 回填实际体积与实际时长
  const fresh = toManifest(plans);
  for (const e of fresh.entries) {
    const path = join(OUT_DIR, e.id + '.' + ext);
    if (existsSync(path)) {
      const bytes = statSync(path).size;
      e.bytes = bytes;
      e.actualMs = Math.round((bytes / (ext === 'mp3' ? 16000 : 48000)) * 1000);
    }
  }
  writeFileSync(MANIFEST_FILE, JSON.stringify(fresh, null, 2) + '\n');
  console.log('完成。manifest 已更新：public/audio/listening/manifest.json');
}

main().catch(function (e) {
  console.error('失败：' + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
