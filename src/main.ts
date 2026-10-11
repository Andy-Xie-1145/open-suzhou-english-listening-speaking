/**
 * 应用入口 —— 首页 → 加载门禁 → 完整模考
 *
 * 许可：AGPL-3.0-only
 *
 * ⚠️ 输出的所有数字都是近似模拟，不是考场评分。见 spec 第 0 节。
 */

import { loadTheme, applyTheme } from './ui/theme.ts';
import { mountHome } from './ui/home.ts';
import { mountLoading } from './ui/loading.ts';
import { mountSuzhouExam } from './ui/suzhou-exam.ts';
import { createEngineRecorder, createEngineAsr } from './suzhou/recorder-bridge.ts';
import { initModelSource } from './engine/model-source.ts';
import { scoreReading } from './suzhou/reading-section.ts';
import { scoreQa, toQaTask } from './suzhou/qa-section.ts';
import { scoreTopic } from './suzhou/topic-section.ts';
import { defaultSeed } from './ui/suzhou-exam.ts';
import type { PaperBank } from './suzhou/paper.ts';
import { loadConfig as loadByokConfig } from './ui/byok.ts';
import { loadPrefs, savePrefs } from './engine/capabilities.ts';
import { providerById } from './engine/llm.ts';

import readingsJson from '../data/readings.json' with { type: 'json' };
import bankItemsJson from '../data/bank/items.json' with { type: 'json' };
import { createListeningBank } from './suzhou/listening-bank.ts';
import { buildListeningMaterials, mapQaItem, mapTopicItem } from './suzhou/bank-import.ts';

function arr(v: any, key: string): any[] {
  if (Array.isArray(v)) return v;
  return (v && Array.isArray(v[key]) ? v[key] : []) as any[];
}

/** 装配题库：把五份 JSON 转成出卷器要的形状 */
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
  const items = bankItemsJson as any[];
  const qa = items.filter((it) => it.type === 'speaking.qa').map(mapQaItem);
  const topics = items.filter((it) => it.type === 'speaking.topic').map(mapTopicItem);
  // 听力题库走自己的 schema（按组大小分池），校验失败在这里就抛，不留到考场上
  const listening = createListeningBank(buildListeningMaterials(items));
  return { readings: readings, qa: qa, topics: topics, listening: listening };
}

function bootstrap() {
  const mount = document.getElementById('app');
  if (!mount) {
    console.error('找不到挂载点 #app');
    return;
  }
  applyTheme(loadTheme());

  // index.html 里的静态 loading 占位要去掉
  while (mount.firstChild) mount.removeChild(mount.firstChild);

  // 模型源切到国内可达地址，必须在加载任何模型之前改掉。
  const src = initModelSource();
  console.info('模型源：' + src.name + '（' + src.host + '）');

  const bank = buildBank();
  const recorder = createEngineRecorder();
  const asr = createEngineAsr();
  const seed = defaultSeed();

  // BYOK（本地面板配置）→ 引擎 prefs，让 engine.analyze 真能拿到 key。
  // byok 的 'google' 对应 llm 的 'gemini'，其余同名。
  function syncByok(): void {
    const cfg = loadByokConfig();
    const pid = cfg.providerId === 'google' ? 'gemini' : cfg.providerId;
    const spec = providerById(pid);
    const cur = loadPrefs().llm;
    savePrefs({
      llm: {
        ...cur,
        enabled: true,
        provider: spec.id,
        apiKey: cfg.apiKey,
        baseUrl: spec.baseUrl,
        model: cfg.model || spec.model,
      },
    });
  }
  syncByok();

  const homeEl = mountHome(document, {
    onByokChange: function () { syncByok(); },
    onStart: function () {
      homeEl.remove();
      const loadingEl = mountLoading(document, {
        bank: bank,
        recorder: recorder,
        asr: asr,
        seed: seed,
        onReady: function (audioCache) {
          loadingEl.remove();
          const examHost = document.createElement('div');
          mount.appendChild(examHost);
          mountSuzhouExam(examHost, {
            bank: bank,
            recorder: recorder,
            asr: asr,
            seed: seed,
            audioCache: audioCache,
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
        },
      });
      mount.appendChild(loadingEl);
    },
  });
  mount.appendChild(homeEl);
}

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
