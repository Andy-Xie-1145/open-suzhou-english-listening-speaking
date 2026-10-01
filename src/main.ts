/**
 * 应用入口
 *
 * 许可：AGPL-3.0-only
 *
 * 当前入口挂载的是**朗读短文（苏州中考题型 · 近似模拟）**，
 * 这是目前唯一完整实现的地基题型：取题 → 录音 → 转写 → 近似评分 → 逐词反馈。
 *
 * ⚠️ 输出的所有数字都是近似模拟，不是考场评分。见 spec/suzhou-listening-speaking.spec.md。
 *
 * 架构约束（ARCHITECTURE.md 第 1 节）：
 *  - 零服务端：不发起任何业务网络请求
 *  - 音频不出浏览器：录音数据仅在内存流转
 *  - 优雅降级：无麦克风或无 ASR 时退化为手动输入，闭环照常
 */

import { loadTheme, applyTheme } from './ui/app.ts';
import { mountSuzhouReading } from './ui/suzhou-reading.ts';
import { createEngineRecorder, createEngineAsr } from './suzhou/recorder-bridge.ts';
import readingsJson from '../data/readings.json' with { type: 'json' };

function bootstrap() {
  const mount = document.getElementById('app');
  if (!mount) {
    console.error('找不到挂载点 #app');
    return;
  }

  applyTheme(loadTheme());

  // ---- 朗读短文（苏州中考题型 · 近似模拟）----
  // 取题 → 录音 → 转写 → 近似评分 → 逐词反馈。
  // recorder / asr 由桥接层构造，任一不可用都会自动降级到手动输入。
  const rawReadings: any[] = (readingsJson as any).readings ?? [];
  mountSuzhouReading(mount, {
    recordings: rawReadings,
    recorder: createEngineRecorder(),
    asr: createEngineAsr(),
  });
}

/** 只在浏览器环境启动；Node 下 import 本文件应无副作用 */
function isBrowser(): boolean {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
}

if (isBrowser()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { bootstrap(); });
  } else {
    bootstrap();
  }
}
