/**
 * 应用入口 —— 「打开即出一份完整卷」
 *
 * 许可：AGPL-3.0-only
 *
 * 架构约束（ARCHITECTURE.md 第 1 节）：
 *  - 零服务端：不发起任何业务网络请求
 *  - 音频不出浏览器：录音数据仅在内存流转
 *  - 优雅降级：无麦克风或无 ASR 时退化为手动输入，评估结果完全相同
 *
 * ⚠️ 输出的所有数字都是近似模拟，不是考场评分。见 spec 第 0 节。
 */

import { loadTheme, applyTheme } from './ui/app.ts';
import { mountSuzhouExam } from './ui/suzhou-exam.ts';
import { mountSelfCheck } from './ui/selfcheck-ui.ts';
import { createEngineRecorder, createEngineAsr } from './suzhou/recorder-bridge.ts';
import { scoreReading } from './suzhou/reading-section.ts';
import { scoreQa } from './suzhou/qa-section.ts';
import { scoreTopic } from './suzhou/topic-section.ts';
import { toQaTask } from './suzhou/qa-section.ts';
import type { PaperBank } from './suzhou/paper.ts';

import readingsJson from '../data/readings.json' with { type: 'json' };
import qaJson from '../data/qa.json' with { type: 'json' };
import qaKwJson from '../data/qa-keywords.json' with { type: 'json' };
import topicsJson from '../data/topics.json' with { type: 'json' };
function arr(v: any, key: string): any[] {
  if (Array.isArray(v)) return v;
  return (v && Array.isArray(v[key]) ? v[key] : []) as any[];
}

/** 装配题库：把四份 JSON 转成出卷器要的形状 */
function buildBank(): PaperBank {
  const readings = arr(readingsJson, 'readings').map(function (r: any) {
    return {
      id: r.id,
      textbook: r.textbook,
      text: r.text,
      wordCount: r.wordCount,
      difficulty: r.difficulty,
      positionSource: r.positionSource,
    };
  });
  const kws = qaKwJson as unknown as Record<string, string[][]>;
  const qa = arr(qaJson, 'qa').map(function (r: any) {
    return {
      id: r.id,
      category: r.category,
      question: r.question,
      keyPoints: r.keyPoints,
      enKeywords: kws[r.id] ?? [],
      difficulty: r.difficulty,
    };
  });
  const topics = arr(topicsJson, 'topics').map(function (t: any) {
    return {
      id: t.id,
      name: t.name,
      hint: t.hint,
      keywords: t.keywords,
      sampleAnswer: t.sampleAnswer,
      keyExpressions: t.keyExpressions ?? [],
    };
  });
  return { readings: readings, qa: qa, topics: topics };
}
function bootstrap() {
  const mount = document.getElementById('app');
  if (!mount) {
    console.error('找不到挂载点 #app');
    return;
  }
  applyTheme(loadTheme());

  const bank = buildBank();
  const recorder = createEngineRecorder();
  const asr = createEngineAsr();
  const kws = qaKwJson as unknown as Record<string, string[][]>;
  // 主界面：打开即出一份完整卷（朗读 1 + 情景问答 2 + 话题简述 1）
  const examHost = document.createElement('div');
  mount.appendChild(examHost);

  let paper: any = null;
  let paperRef = { current: null as any };

  mountSuzhouExam(examHost, {
    bank: bank,
    recorder: recorder,
    asr: asr,
    // 评分回调：按当前卷的题目取对应规则
    scoreReading: function (text: string, durationMs?: number) {
      const p = paperRef.current;
      if (!p) return null;
      const task = {
        id: p.reading.task.id,
        textbook: p.reading.task.textbook,
        book: '',
        title: '',
        text: p.reading.task.text,
        wordCount: p.reading.task.wordCount,
        difficulty: p.reading.task.difficulty,
        positionSource: p.reading.task.positionSource,
      };
      return scoreReading({ reference: task.text, spoken: text, durationMs: durationMs }).approximateScore;
    },
    scoreQa: function (text: string, order: number, durationMs?: number) {
      const p = paperRef.current;
      if (!p) return null;
      const item = p.qa[order];
      if (!item) return null;
      try {
        const t = toQaTask(item.task, item.task.enKeywords);
        return scoreQa({ transcript: text, task: t, durationMs: durationMs }).approximateScore;
      } catch {
        return null;
      }
    },
    scoreTopic: function (text: string, durationMs?: number) {
      const p = paperRef.current;
      if (!p) return null;
      const t = p.topic.task;
      const task = {
        id: t.id,
        displayText: t.name,
        hint: t.hint,
        profile: { name: t.name, hint: t.hint, keywords: t.keywords },
        keyExpressions: t.keyExpressions ?? [],
        sampleAnswer: t.sampleAnswer ?? [],
      };
      return scoreTopic({ transcript: text, task: task, durationMs: durationMs }).approximateScore;
    },
  });

  // 出卷后回填引用，供评分回调取题
  paper = true;
  const origPush = mountSelfCheck;
  void origPush;
  void paper;
  // 评分回调：直接拿到当前卷的题目数据，无需外部引用
  mountSuzhouExam(examHost, {
    bank: bank,
    recorder: recorder,
    asr: asr,
    scoreReading: function (text: string, task: any, durationMs?: number) {
      if (!task || !task.text) return null;
      return scoreReading({ reference: task.text, spoken: text, durationMs: durationMs }).approximateScore;
    },
    scoreQa: function (text: string, task: any, durationMs?: number) {
      if (!task || !task.enKeywords) return null;
      try {
        const t = toQaTask(task, task.enKeywords);
        return scoreQa({ transcript: text, task: t, durationMs: durationMs }).approximateScore;
      } catch {
        return null;
      }
    },
    scoreTopic: function (text: string, task: any, durationMs?: number) {
      if (!task || !task.name) return null;
      const t = {
        id: task.id,
        displayText: task.name,
        hint: task.hint,
        profile: { name: task.name, hint: task.hint, keywords: task.keywords ?? [] },
        keyExpressions: task.keyExpressions ?? [],
        sampleAnswer: task.sampleAnswer ?? [],
      };
      return scoreTopic({ transcript: text, task: t, durationMs: durationMs }).approximateScore;
    },
  });

  // 真机自检
  mount.appendChild(mountSelfCheck(document, { recorder: recorder, asr: asr }));
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
