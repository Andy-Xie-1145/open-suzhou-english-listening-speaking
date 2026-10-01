/**
 * 引擎桥接 —— 把 src/engine 的真实接口适配成朗读模块需要的形状
 *
 * 许可：AGPL-3.0-only
 *
 * 为什么要桥接而不是直接传引擎进去：
 *  engine 层的签名是为通用评测设计的（MicrophoneRecorder 返回 DecodedAudio，
 *  elapsedMs 而非 durationMs，transcribe 要求模型已就绪）。
 *  朗读模块应该只依赖它自己需要的小接口，这样：
 *  1. 朗读模块的测试可以用桩实现，不依赖浏览器与模型权重；
 *  2. engine 层将来重构，只要桥接层跟着改，朗读模块不受影响。
 *
 * ⚠️ 本文件不做任何近似分计算，只做接口适配。近似性质见 spec。
 */

import { MicrophoneRecorder, isRecordingSupported } from '../engine/audio.ts';
import {
  isAsrModelReady,
  loadAsrModel,
  transcribe as engineTranscribe,
  resetAsrModel,
  ASR_MODELS,
  type AsrModelKey,
} from '../engine/asr.ts';

/** 朗读模块需要的录音器形状 */
export interface RecorderPort {
  /** 能否录音。false 时界面应显示手动输入 */
  canRecord(): boolean;
  start(): Promise<void>;
  /** 停止并返回 PCM 与时长 */
  stop(): Promise<{ samples: Float32Array; sampleRate: number; durationMs: number }>;
  /** 已录音时长（毫秒） */
  elapsedMs(): number;
  /** 放弃录音，熄灭麦克风指示灯 */
  cancel(): void;
}

class EngineRecorderAdapter implements RecorderPort {
  private rec: MicrophoneRecorder | null = null;

  canRecord(): boolean {
    return isRecordingSupported();
  }

  start(): Promise<void> {
    this.rec = new MicrophoneRecorder();
    return this.rec.start();
  }

  async stop() {
    if (!this.rec) throw new Error('当前没有在录音。');
    const decoded = await this.rec.stop();
    this.rec = null;
    return decoded;
  }

  elapsedMs(): number {
    return this.rec ? this.rec.elapsedMs() : 0;
  }

  cancel(): void {
    if (this.rec) {
      this.rec.cancel();
      this.rec = null;
    }
  }
}

/** 引擎朗读器（仅在浏览器支持 MediaRecorder 时可用） */
export function createEngineRecorder(): RecorderPort | null {
  return isRecordingSupported() ? new EngineRecorderAdapter() : null;
}
/* ------------------------------------------------------------------ *
 * ASR 桥接
 * ------------------------------------------------------------------ */

export type AsrModelStatus =
  | 'idle'        // 尚未加载
  | 'loading'     // 加载中
  | 'ready'       // 可用
  | 'failed'      // 加载失败（网络/存储/不支持）
  | 'unsupported';// 浏览器不支持

export interface AsrProgress {
  status: AsrModelStatus;
  /** 0-100，仅 loading 时有意义 */
  percent: number;
  /** 面向用户的中文说明 */
  message: string;
}

export interface AsrPort {
  /** 模型是否已就绪 */
  ready(): boolean;
  /** 当前状态（用于渲染） */
  status(): AsrProgress;
  /** 主动加载模型。失败时 resolve 为 false，不抛异常。 */
  load(key?: AsrModelKey): Promise<boolean>;
  /** 转写。**模型未就绪时必须抛错**，由调用方降级。 */
  transcribe(samples: Float32Array, sampleRate: number): Promise<string>;
  /** 卸载模型，释放内存 */
  unload(): void;
}

const MODEL_LABEL: Record<string, string> = {
  tiny: 'Whisper tiny（最快，体积最小）',
  base: 'Whisper base（推荐，均衡）',
  small: 'Whisper small（最准，体积最大）',
};

const FAIL_HINTS: string[] = [
  '可能是网络中断，模型未下载完成。',
  '若浏览器处于无痕模式，本地存储不可用，模型无法缓存。',
  '可以先手动输入朗读内容，不影响完整度与准确度评估。',
];

class EngineAsrAdapter implements AsrPort {
  private st: AsrProgress = { status: 'idle', percent: 0, message: '语音转写未加载。加载后可自动把你朗读的内容转成文字。' };
  private key: AsrModelKey = 'base';

  ready(): boolean {
    try {
      return isAsrModelReady();
    } catch {
      return false;
    }
  }

  status(): AsrProgress {
    if (this.st.status === 'ready' && !this.ready()) {
      // 外部重置过模型（例如其他标签页），同步状态
      this.st = { status: 'idle', percent: 0, message: '语音转写已被重置，请重新加载。' };
    }
    return this.st;
  }

  async load(key?: AsrModelKey): Promise<boolean> {
    if (typeof window === 'undefined') {
      this.st = { status: 'unsupported', percent: 0, message: '当前环境不支持模型加载，请在浏览器中打开。' };
      return false;
    }
    if (this.st.status === 'loading') return false;
    if (key) this.key = key;

    const self = this;
    this.st = {
      status: 'loading',
      percent: 0,
      message: '正在加载 ' + (MODEL_LABEL[this.key] ?? this.key) + '，首次需要下载模型，请稍候…',
    };

    try {
      await loadAsrModel({
        model: this.key,
        onProgress: function (p: { status?: string; progress?: number; file?: string }) {
          const pct = typeof p.progress === 'number' ? Math.round(p.progress) : 0;
          const file = p.file ? '（' + p.file.split('/').pop() + '）' : '';
          const phase = p.status === 'progress' ? '下载'
            : p.status === 'done' ? '初始化'
            : p.status === 'ready' ? '完成' : '处理';
          self.st = {
            status: 'loading',
            percent: pct,
            message: phase + ' ' + (MODEL_LABEL[self.key] ?? self.key) + file + ' ' + pct + '%',
          };
        },
      });

      if (!isAsrModelReady()) {
        this.st = { status: 'failed', percent: 0, message: '模型加载完成但不可用。' + FAIL_HINTS.join('') };
        return false;
      }

      this.st = { status: 'ready', percent: 100, message: '语音转写已就绪，录音后会自动转写。' };
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.st = { status: 'failed', percent: 0, message: '模型加载失败：' + msg + '。' + FAIL_HINTS.join('') };
      return false;
    }
  }

  async transcribe(samples: Float32Array, sampleRate: number): Promise<string> {
    if (!this.ready()) {
      throw new Error('语音转写模型未加载，无法自动转写。');
    }
    const r = await engineTranscribe(samples, sampleRate);
    const text = (r.text ?? '').trim();
    if (!text) throw new Error('没有识别到语音内容。');
    return text;
  }

  unload(): void {
    try {
      resetAsrModel();
    } catch {
      /* ignore */
    }
    this.st = { status: 'idle', percent: 0, message: '语音转写已卸载。' };
  }
}

/** 可选模型列表，供界面渲染选择器 */
export const ASR_OPTIONS = [
  { key: 'tiny' as AsrModelKey, label: 'tiny（最快，约 40MB）' },
  { key: 'base' as AsrModelKey, label: 'base（推荐，约 80MB）' },
  { key: 'small' as AsrModelKey, label: 'small（最准，约 250MB）' },
];

/** 统一出口：任何构造失败都返回 null，界面据此降级 */
export function createEngineAsr(): AsrPort | null {
  try {
    return new EngineAsrAdapter();
  } catch {
    return null;
  }
}
