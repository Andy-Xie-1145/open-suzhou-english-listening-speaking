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
import { mountSelfCheck } from './ui/selfcheck-ui.ts';
import { mountSuzhouTopic } from './ui/suzhou-topic.ts';
import topicsJson from '../data/topics.json' with { type: 'json' };
import { mountSuzhouQa } from './ui/suzhou-qa.ts';
import qaJson from '../data/qa.json' with { type: 'json' };
import qaKwJson from '../data/qa-keywords.json' with { type: 'json' };
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
  const recorder = createEngineRecorder();
  const asr = createEngineAsr();

  mountSuzhouReading(mount, {
    recordings: rawReadings,
    recorder: recorder,
    asr: asr,
  });

  // 真机自检：让任何人点一次就知道麦克风与浏览器端转写通不通。
  mount.appendChild(mountSelfCheck(document, { recorder: recorder, asr: asr }));

  // 话题简述（Q5）：取题 → 录音 → 转写 → 近似评分 → 7 句硬门槛判定。
  const rawTopics: any[] = (topicsJson as any).topics ?? [];
  const topicHost = document.createElement('div');
  mount.appendChild(topicHost);
  mountSuzhouTopic(topicHost, { topics: rawTopics, recorder: recorder, asr: asr });

  // 情景问答（Q4）：2 题、情境类别配平，每题单独出分。
  const rawQa: any[] = (qaJson as any).qa ?? [];
  const qaHost = document.createElement('div');
  mount.appendChild(qaHost);
  mountSuzhouQa(qaHost, {
    questions: rawQa,
    enKeywords: qaKwJson as unknown as Record<string, string[][]>,
    recorder: recorder,
    asr: asr,
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
