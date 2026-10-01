# 架构契约 ARCHITECTURE.md

> 所有并行开发方必须遵守此契约。修改前先读，修改后同步。

## 1. 不可动摇的约束

1. **零服务端** —— 交付物是纯静态文件。没有后端、没有数据库、没有云函数。
2. **音频不出浏览器** —— MediaRecorder 采集，内存处理，用完即弃，不上传、不落盘。
3. **BYOK** —— LLM 调用由用户填写自己的 API key，浏览器直连用户选定的服务商。
4. **优雅降级** —— 无 GPU / 无模型 / 无 LLM key 时，产品仍须可用，只是反馈粒度递减。
5. **AGPL-3.0-only** —— 所有新增代码与依赖必须兼容该许可。

## 2. 分层与目录（写作用域划分）

    src/rules/      L0 规则层        【已完成，勿改】 types.ts lexicon.ts evaluate.ts text/normalize.ts
    src/engine/      L1/L2/L3 引擎    【engine 组】  phoneme.ts  asr.ts  llm.ts  pipeline.ts  index.ts
    src/materials/   语料加载         【materials 组】 loader.ts  index.ts
    data/            语料内容 JSON     【materials 组】
    src/ui/          界面             【ui 组】  app.ts  exam.ts  recorder.ts  feedback.ts  styles.css
    src/core/        录音/音频工具    【engine 组】  audio.ts
    docs/            文档             【docs 组】
    tests/           测试             按各自模块分文件

根配置文件（package.json / tsconfig.json / vite.config.ts / index.html）由 Lead 独占维护。

## 3. 模块间契约（必须严格遵守）

### 3.1 L0 规则层入口（已冻结，engine 与 ui 均不得修改 src/rules/）

    import { evaluate, MIN_SENTENCES } from './src/rules/evaluate.ts';
    import type { EvalInput, RuleReport } from './src/rules/types.ts';
    import { TOPICS, type TopicProfile } from './src/rules/lexicon.ts';

    // EvalInput
    interface EvalInput {
      transcript: string;
      topic?: TopicProfile | string | null;
      durationMs?: number;
      words?: WordToken[];
    }
    // RuleReport: { score, checks:{length,coverage,connectors,fillers,pace}, diagnostics:Diagnostic[], progress }

### 3.2 引擎层对 UI 的统一出口

    // src/engine/index.ts
    export interface Engine {
      /** 当前可用能力，驱动 UI 的降级提示 */
      capabilities(): Capabilities;
      /** L2：转写音频 */
      transcribe(audio: Float32Array, sampleRate: number): Promise<TranscriptResult>;
      /** L1：音素级发音比对 */
      assessPhonemes(audio: Float32Array, sampleRate: number, refText: string): Promise<PhonemeReport>;
      /** L3：LLM 增强，可未配置 */
      enhance(transcript: string, topic: TopicProfile | null): Promise<LLMAdvice | null>;
      /** 统一编排：跑完 L0 + 可用的 L1/L2/L3 */
      analyze(input: AnalyzeInput): Promise<AnalysisResult>;
    }

引擎必须允许部分组件缺失：Whisper 没加载时 transcribe() 应抛 EngineUnavailable，UI 捕获后降级为「请手动输入你朗读的内容」。

### 3.3 关键类型（engine 组定义，ui 组只读）

    interface Capabilities {
      webgpu: boolean;
      phoneme: boolean;   // 音素模型是否就绪
      asr: boolean;       // Whisper 是否就绪
      llm: boolean;       // 用户是否配置了 key
    }

    interface AnalyzeInput {
      audio: Float32Array;
      sampleRate: number;
      kind: 'reading' | 'qa' | 'topic';   // 朗读短文 / 情景问答 / 话题简述
      reference?: string;                  // reading 必填
      topic?: TopicProfile | null;
      durationMs: number;
    }

    interface AnalysisResult {
      rules: RuleReport;                   // L0，永远有
      transcript?: string;                 // L2
      phonemes?: PhonemeReport;            // L1
      advice?: LLMAdvice | null;           // L3
      warnings: string[];                  // 降级说明
    }

## 4. 降级阶梯（必须逐级实现并测试）

    L3 LLM      用户自带 key        → 逻辑评价、语法建议、个性化提示
    L2 ASR      Whisper ONNX        → 转写文本，驱动 L0
    L1 音素     wav2vec2 ONNX       → 逐音素对照、错读定位
    L0 规则     纯 TS               → 句数/覆盖/连接词/停顿/语速

目标：**任何一层缺失都必须仍能给出 L0 反馈。**

## 5. 浏览器端技术选型（已定，不需再论证）

- 运行时：Transformers.js v4 + ONNX Runtime Web
- 加速：WebGPU 优先，WASM 回退
- 音素模型：onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX（Apache-2.0）
- ASR 模型：onnx-community/whisper-base（tiny/base 可配）
- G2P：espeak-phonemizer 0.1.2（GPL-3.0-only）
- 构建：Vite，产出纯静态

## 6. BYOK 支持的 LLM 服务商（UI 需提供选择器）

| 服务商 | base URL | 模型 | 备注 |
|---|---|---|---|
| 智谱 GLM | https://open.bigmodel.cn/api/paas/v4 | glm-4-flash | 永久免费无 token 限制，首选推荐 |
| 硅基流动 | https://api.siliconflow.cn/v1 | Qwen/Qwen2-7B-Instruct 等 | 有完全免费模型 |
| Groq | https://api.groq.com/openai/v1 | gpt-oss-120b | 免费额度高 |
| Google AI Studio | https://generativelanguage.googleapis.com/v1beta/openai | gemini-2.5-flash | 注意 CORS |
| 本地 Ollama | http://localhost:11434/v1 | qwen3:4b | 完全离线 |

key 存 localStorage，绝不上报。


## 8. Node strip-types 兼容性约束（重要）

项目用 `node --experimental-strip-types` 直接运行 TypeScript 测试，
**这意味着只能用「类型擦除」语法，不能用需要代码生成的语法**。

### 禁止使用

| 语法 | 原因 | 替代 |
|---|---|---|
| 构造函数参数属性 `constructor(private x: T)` | 需生成赋值代码 | 显式字段 + 手动赋值 |
| 枚举 `enum X {}` | 需生成对象 | `const X = {...} as const` |
| 命名空间 `namespace X {}` | 需编译 | 用模块 + 对象 |
| 装饰器 `@dec class` | 需编译 | 显式调用 |
| `declare` 合并（部分场景） | — | 避免使用 |

### 正确写法示例

```ts
// 错误
class EngineUnavailable extends Error {
  constructor(private layer: Layer) { super('x'); }
}

// 正确
class EngineUnavailable extends Error {
  layer: Layer;
  constructor(layer: Layer) { super('x'); this.layer = layer; }
}
```

### 自检方法

```bash
node --experimental-strip-types -e "import('./src/engine/index.ts').then(()=>console.log('OK'))"
```

**任何模块在提交前必须能这样被 Node 加载成功**，否则测试无法运行。

## 9. 硬性质量要求

- TypeScript strict 模式通过
- 每个模块有可运行的自测
- 降级路径必须有测试覆盖
- 不引入任何需要后端配合的依赖
- 所有用户可见文案为中文
