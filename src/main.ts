/**
 * 应用入口 —— 装配引擎、语料库、界面
 *
 * 许可：AGPL-3.0-only
 *
 * 架构约束（ARCHITECTURE.md 第 1 节）：
 *  - 零服务端：本文件不发起任何业务网络请求
 *  - 音频不出浏览器：录音数据仅在内存中流转
 *  - 优雅降级：引擎或语料任一不可用，应用仍可启动
 *
 * 集成说明：
 *  src/ui/app.ts 刻意不静态 import src/engine（避免引擎缺失导致构建失败），
 *  由本文件在运行时注入。若引擎构造失败，界面会自动回退到 L0 纯规则评估。
 */

import { createApp, loadTheme, applyTheme } from './ui/app.ts';
import type { AppDeps, EngineLike } from './ui/app.ts';
import { MATERIALS, createRng } from './materials/index.ts';
import type { ExamPaper } from './materials/loader.ts';
import { toPaperSource } from './adapter.ts';

/** 引擎按需加载：失败时返回 null，界面据此降级 */
async function loadEngine(): Promise<EngineLike | null> {
  try {
    const mod = await import('./engine/index.ts');
    const engine = mod.createEngine();
    return engine as unknown as EngineLike;
  } catch (e) {
    console.warn('引擎不可用，已降级为 L0 纯规则评估：', e);
    return null;
  }
}

/** 每次组一套新卷：随机卷，走 Materials.buildPaper */
function dealPaper(): ReturnType<typeof toPaperSource> {
  try {
    const rng = createRng(Math.floor(Math.random() * 0x7fffffff));
    const paper: ExamPaper = MATERIALS.buildPaper({ seed: rng.next() });
    return toPaperSource(paper);
  } catch (e) {
    console.warn('组卷失败，使用占位题：', e);
    return {};
  }
}

function bootstrap() {
  const mount = document.getElementById('app');
  if (!mount) {
    console.error('找不到挂载点 #app');
    return;
  }

  applyTheme(loadTheme());

  const deps: AppDeps = {
    engine: null,
    loadPaper: function () { return dealPaper(); },
    onEngineUnavailable: function (reason) {
      console.info('引擎降级：' + reason);
    },
  };

  void loadEngine().then(function (engine) {
    deps.engine = engine;
    createApp(mount, deps);
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
