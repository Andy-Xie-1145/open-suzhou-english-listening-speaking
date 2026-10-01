# Open English Listening and Speaking

开源自托管的英语听说评测工具。**零服务端、纯浏览器端、BYOK。**

对标考试：江苏省初中英语听力口语自动化考试（九年级，30 分计入中考）。

---

## 1. 为什么做这个

这个赛道的商业产品定价如下：

| 形态 | 价格 | 供应商 |
|---|---|---|
| 校级系统采购 | 240,000 元/套 | 驰声教考练平台 V5.0 |
| 校级系统采购 | 345,000 元/套 | 外研在线 U听说 |
| C 端年费 | 308 – 460 元/年/账号 | 讯飞 E听说中学 |

价格里算法不是主要成本，主要成本是十几年积累的评分标定数据、考务关系和教研团队。
**算法层本身已有成熟开源实现**（见第 4 节），因此完全可以用零成本方式重建一套。

---

## 2. 核心约束：我们的开销趋近于零

这不是口号，是架构硬约束（ARCHITECTURE.md 第 1 节）：

| 成本项 | 承担方 | 说明 |
|---|---|---|
| LLM 推理 | **用户** | BYOK，用户填自己的 key |
| ASR 转写 | **用户浏览器** | Whisper ONNX，WebGPU 或 WASM |
| 音素识别评分 | **用户浏览器** | wav2vec2 ONNX |
| G2P（文本转音素） | **用户浏览器** | espeak-ng WASM |
| 规则层 | **用户浏览器** | 纯 TypeScript，零推理 |
| 音频存储 | **无人** | 不出浏览器，用完即弃 |
| CDN + 域名 | 我们 | **唯一的真实支出** |

**音频完全不出用户浏览器** —— 对面向未成年人的产品，这比省钱更重要。

### 附带的合规优势

AGPL-3.0-only 让许可问题消失：
- espeak-ng（GPL-3.0）、espeak-phonemizer（GPL-3.0-only）可直接并入，无障碍
- 唯一义务是开源 —— 而项目本来就是开源的
- AGPL 覆盖网络交互场景，未来加自建后端或付费 API 都不受限制

---

## 3. 分层与降级阶梯

    L3  LLM      用户自带 key      → 逻辑评价、语法建议
    L2  ASR      Whisper ONNX      → 转写文本，驱动 L0
    L1  音素     wav2vec2 ONNX     → 逐音素对照、错读定位
    L0  规则     纯 TS             → 句数/覆盖/连接词/漏读/停顿/语速

**已全部实现**。L0 完全不依赖模型，L1/L2/L3 均为动态 import，任一缺失自动降级。

**任何一层缺失，产品都必须仍能给出 L0 反馈。** 降级是正常路径，不是故障。

### 五道题型的评测归属

| 题型 | L0 规则 | L1 音素 | L2 ASR | L3 LLM |
|---|---|---|---|---|
| 听对话回答问题 | 客观题判分 | — | — | — |
| 听对话和短文答题 | 客观题判分 | — | — | — |
| 朗读短文 | 漏读/误读定位 | 逐音素对照 | 转写 | 建议 |
| 情景问答 | 句数/流利度 | 逐音素对照 | 转写 | 建议 |
| 话题简述 | 7 句门槛/要点覆盖/连接词 | — | 转写 | 逻辑评价 |

听力两题完全不需要 AI。朗读短文是**有标准原文的封闭题**，可做确定性判定。
只有话题简述的逻辑评价真正需要 LLM，且可以降级。

---

## 4. 组件与许可

| 层 | 组件 | 许可 | 用途 |
|---|---|---|---|
| 运行时 | Transformers.js v4 + ONNX Runtime Web | Apache-2.0 / MIT | 浏览器端推理 |
| 加速 | WebGPU（有则用），WASM 回退 | W3C 标准 | — |
| 音素模型 | onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX | Apache-2.0 | 识别实际发出的音素 |
| ASR 模型 | onnx-community/whisper-base | MIT | 转写 |
| G2P | espeak-phonemizer 0.1.2 | GPL-3.0-only | 文本→音素（espeak-ng 的 WASM 轻量版） |
| 评分算法参考 | OpenPronounce | MIT | 音素级评估的公式与实现思路 |
| 训练数据 | speechocean762 | CC BY 4.0 | 评分模型训练与验证基准 |
| 本项目 | — | **AGPL-3.0-only** | L0 规则层、编排、界面、语料 |

### 关于 speechocean762

5000 条非母语英语朗读语音，250 名说话人**全部为普通话母语者**，其中一半是儿童，
5 位专家标注 accuracy / completeness / fluency / prosodic 四个维度。
**这是与苏州中考考生画像最接近的公开数据集。**

---

## 5. BYOK 支持的 LLM 服务商

| 服务商 | base URL | 模型 | 备注 |
|---|---|---|---|
| 智谱 GLM | https://open.bigmodel.cn/api/paas/v4 | glm-4-flash | **永久免费无 token 限制，首选** |
| 硅基流动 | https://api.siliconflow.cn/v1 | Qwen/Qwen2-7B-Instruct 等 | 有完全免费模型 |
| Groq | https://api.groq.com/openai/v1 | gpt-oss-120b | 免费额度高 |
| Google AI Studio | https://generativelanguage.googleapis.com/v1beta/openai | gemini-2.5-flash | 注意 CORS |
| 本地 Ollama | http://localhost:11434/v1 | qwen3:4b | 完全离线 |

key 存 localStorage，**绝不上报**。

---

## 6. 开发

```bash
npm install
npm test        # L0 规则层自测，零依赖零 API
npm run test:all
npm run typecheck
npm run dev     # 本地开发
npm run build   # 产出纯静态文件到 dist/
```

---

## 7. 已知限制

| 限制 | 说明 | 缓解 |
|---|---|---|
| 首次下载 150–300MB | 音素模型 + Whisper | 首屏明示；模型延迟加载；先做不需模型的环节 |
| WebGPU 覆盖不足 | Safari 弱、Firefox 待完善 | WASM CPU 回退路径 |
| 低端设备算力不足 | 可能达不到实时 | 首次使用时做基准测试，提示降级 |
| 无法对齐正考分数 | 讯飞引擎不对外 | **不做估分定位**，只做能力诊断 |
| 开放题无标注数据 | 话题简述是自由表达 | 自建 3000–5000 条标注 |

**关于评分定位**：本项目输出的是「能力诊断」，不是「考场估分」，不对标讯飞正考引擎。
定位是「告诉你离满分别差什么」，而不是「预测你能考多少分」。

---

## 8. 文档

- [ARCHITECTURE.md](../ARCHITECTURE.md) —— 架构契约（所有开发方必读）
- [research/suzhou-grade9-exam-deep-dive.md](../research/suzhou-grade9-exam-deep-dive.md) —— 考试规格与收费结构调研
- [research/opensource-replica-feasibility.md](../research/opensource-replica-feasibility.md) —— 开源复刻可行性
- [research/toc-free-product-architecture.md](../research/toc-free-product-architecture.md) —— To C 免费架构决策
- [USAGE.md](USAGE.md) —— 使用指南
- [CONTRIBUTING.md](CONTRIBUTING.md) —— 参与开发
- [LICENSE](../LICENSE) —— AGPL-3.0-only

---

## 9. 致谢与数据来源

- **speechocean762**（小米 & SpeechOcean 联合发布，CC BY 4.0）—— 评分维度设计的参照
- **OpenPronounce**（MIT）—— 音素级评估的评分公式思路来源
- 江苏省教育厅、苏州市教育局公开文件 —— 考试规格与改革细节

语料为依据课标五级与译林版教材话题范围编写的等效练习材料，非教材原文。

---

## 10. 项目状态

### 交付内容

| 模块 | 文件数 | 测试 |
|---|---|---|
| `src/rules/` L0 规则层 | 8 | rules 18 + reading 11 + listening 9 + summary 11 + normalize 10 = **59** |
| `src/engine/` L1/L2/L3 引擎 | 7 | engine **169** |
| `src/ui/` 界面 | 7 | ui **253** |
| `src/materials/` 语料加载 | 2 | materials **86** |
| `tests/e2e.test.ts` 端到端 | 1 | e2e **19** |
| **合计** | **25** | **586 项断言，全部通过** |

### 语料库

| 文件 | 条目 |
|---|---|
| `data/readings.json` | 24 篇朗读短文（79–92 词/篇，含连读意群提示） |
| `data/qa.json` | 24 条情景问答（12 个情境类别） |
| `data/listening.json` | 30 题（短对话 15 + 长对话短文 15） |
| `data/topics.json` | 12 个话题（每题 8 句范例 + 4 组常用句式） |

支持随机卷 / AB 卷 / 梅花卷（甲乙丙）三种组卷，同种子可复现。

### 端到端验证

`npm run test:e2e` 用真实语料串起完整链路：

    组卷 → 适配层 → 五题型评分 → 成绩汇总

实测满分答卷折算 **29.1 / 30 分**，漏读 20% 的朗读从 100 分掉到 10 分。

### 构建

`npm run build` 产出纯静态文件（无服务端）：

| 产物 | 大小 |
|---|---|
| `index-*.js` 应用逻辑 | 146 KB（gzip 54 KB） |
| `transformers.web-*.js` Transformers.js | 560 KB（gzip 164 KB） |
| `espeak-ng-*.wasm` G2P 引擎 | 299 KB（gzip 125 KB） |
| `ort-wasm-*.wasm` ONNX Runtime | 26 MB（按需加载，不进首屏） |
| `index-*.css` 样式 | 13 KB |

模型权重（wav2vec2 / Whisper）**不打包**，首次使用时从 HF Hub 拉取并缓存。

### 验证命令

```bash
npm run typecheck   # 0 errors
npm run build       # ✓ built
npm run test:all    # 9 suites, 586 assertions
npm run test:e2e    # 端到端
```
