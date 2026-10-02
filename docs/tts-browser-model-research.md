# 纯浏览器端英语听说评测 TTS 选型调研

调研日期：2026-10-02  
体积数据来源：HuggingFace blob API（?blobs=true，逐文件 size 字节数换算）  
Elo 来源：Artificial Analysis — Text to Speech / Open Weights Leaderboard

> **取证方式说明**：本机 huggingface.co 被 DNS 污染（解析到 Meta IP 段 108.160.170.41 / face:b00c），直连超时。
> 所有 HF 体积、许可、文件清单均通过 **hf-mirror.com**（同一套 blob API 的镜像）取得，数字为真实 HF blob 大小，非估算。

---

## 一、对比表（按量化后实际体积升序）

| # | 候选 | 量化后 ONNX 体积 | 参数量 | 许可（限商用？） | 英文音色 | Elo / MOS | JS 绑定 | 最近维护 |
|---|---|---|---|---|---|---|---|---|
| 1 | **KittenTTS Nano 0.1**<br>onnx-community/kitten-tts-nano-0.1-ONNX | **22.69 MB**<br>(onnx/model_quantized.onnx) | ~15M | Apache-2.0 ✅ 不限 | 8（4女4男）<br>expr-voice-2/3/4/5 × f/m | **未查到** | ❌ 无浏览器包 | 2025-08-06 |
| 2 | **KittenTTS Nano 0.8 int8**<br>KittenML/kitten-tts-nano-0.8-int8 | **23.24 MB**<br>+ voices.npz 3.13 MB<br>= **26.37 MB** | ~15M | Apache-2.0 ✅ 不限 | 8（4女4男）<br>Bella/Jasper/Luna/Bruno/Rosie/Hugo/Kiki/Leo<br>另含每音色语速先验 | **未查到** | ❌ npm「kitten-tts」是 Node 调 Python，非浏览器 | 2026-02-20 |
| 3 | **KittenTTS Micro 0.8**<br>KittenML/kitten-tts-micro-0.8 | **39.47 MB** + 3.13 MB | ~15M | Apache-2.0 ✅ 不限 | 同上 | **未查到** | ❌ | 2026-02-19 |
| 4 | **Piper en_US**<br>rhasspy/piper-voices | **19.67–26.83 MB** (x_low)<br>**60.18–73.4 MB** (low/medium)<br>108–130 MB (high) | ~15–20M | ⚠️ 仓库标 MIT，但**每个音色 MODEL_CARD 各自不同**（见 §四） | 38 个英音 voice-model 组合<br>en_US 21 / en_GB 9 | **未查到** | ✅ piper-tts-web 1.1.2 (MIT, 2025-07)<br>✅ @diffusionstudio/vits-web 1.0.3 (MIT, 2024-09) | 2026-09-17（仓库仍更新） |
| 5 | **Kokoro-82M v1.0**<br>onnx-community/Kokoro-82M-v1.0-ONNX | **82.05 MB** (q8f16)<br>**88.08 MB** (q8=quantized)<br>147.43 MB (q4f16)<br>155.67 MB (fp16)<br>310.45 MB (fp32) | 82M | **Apache-2.0** ✅ 不限 | **28 英文**<br>美音女 11 / 美音男 9<br>英音女 4 / 英音男 4<br>（全库 55 音色） | **Elo 1063 ±11**<br>AA 开源榜 **第 5–6 名**<br>5263 样本 / 8 voices / Jan 2025 | ✅ **kokoro-js 1.2.1** (Apache-2.0, 2025-05-03)<br>✅ Transformers.js 原生目录结构 | 2025-04-10（**已 18 个月未更新**） |
| 6 | **KittenTTS Mini 0.8**<br>KittenML/kitten-tts-mini-0.8 | **74.64 MB** | ~35M | Apache-2.0 ✅ 不限 | 同 Nano 系列 | **未查到** | ❌ | 2026-02-19 |
| 7 | **Pocket TTS (kyutai)**<br>soniqo/Pocket-TTS-100M-ONNX-INT8 | **120.07 MB**（⚠️ 社区 INT8，官方无 ONNX）<br>官方 languages/english/model.safetensors = 208.88 MB | ~100M | **CC-BY-4.0** ✅ 不限商用 | 29 个英文 speaker embedding（各 3.5–7.9 MB） | **未查到** | ❌ 无官方绑定 | 上游 **2026-10-01**（活跃） |
| 8 | **Supertonic 3**（社区 INT8）<br>soniqo/Supertonic-3-ONNX-INT8 | **97.36 MB**（⚠️ 社区，45 次下载）<br>Q4 版 126.33 MB（0 次下载） | — | **OpenRAIL-M** ⚠️ | 官方 6 个 speaker | **未查到** | ⚠️ supertonic 0.0.1 (MIT, 2025-12) | 2026-06-21 |
| 9 | **Supertonic 2**<br>Supertone/supertonic-2 | **250.65 MB** ❌ 超标 | — | **OpenRAIL-M** ⚠️ | 10（5女5男） | **未查到** | 同上 | 2026-01-06 |
| 10 | **Supertonic 3**（官方）<br>Supertone/supertonic-3 | **379.63 MB** ❌ 超标 2.5× | — | **OpenRAIL-M** ⚠️ | 6 | **未查到** | 同上 | 2026-05-18 |
| 11 | **Chatterbox**<br>onnx-community/chatterbox-ONNX | **4744 MB** ❌ 超标 31×<br>最小可用组合 ≈1950 MB | ~0.5B | MIT ✅ | — | Elo **1023 ±12**（第 10 名） | ❌ | 2025-10-20 |
| 12 | **Zonos v0.1 / ZONOS2** | **无 ONNX 构建** ❌ | — | Apache-2.0 ✅ | — | Zonos v0.1 = **Elo 1000（榜单锚点/垫底）** | ❌ | 2026-06-22 |

### Artificial Analysis 开源权重榜（完整 15 行，实测抓取）

```
 1  Breeze TTS 2                   1206 +/-16
 2  Fish Audio S2 Pro              1117 +/-12
 3-4 Step Audio EditX (Mar 2026)   1092 +/-13
 3-4 Voxtral TTS                   1079 +/-13
 5-6 Kokoro 82M v1.0            << 1063 +/-11   <-- 100M 参数以下唯一上榜
 5-6 Magpie-Multilingual 357M      1062 +/-13
 7-9 Maya1                         1046 +/-12
 6-10 OpenAudio S1 Mini            1042 +/-20
 7-9 Higgs Audio V3 TTS            1036 +/-13
10  Chatterbox                     1023 +/-12
11  Zonos-v0.1                     1000  (anchor)
12-13 VibeVoice 1.5B               955 +/-14
12-13 OpenVoice v2                 952 +/-13
14  XTTS v2                        915 +/-15
15  StyleTTS 2                     893 +/-15
```

**KittenTTS / Piper / Supertonic / Pocket TTS 均未出现在该榜单 → 其客观分为「未查到」。**  
旁证（非实测分）：KittenTTS 自述架构基于 StyleTTS 2，而 StyleTTS 2 在同一榜单为 893 ±15（第 15 名）。仅作参考，不作为 KittenTTS 的分数。

---

## 二、首选：Kokoro-82M v1.0 ONNX（q8，88.08 MB）

**理由三条：**

1. **唯一同时满足 5 条硬约束、且有客观分背书的小模型。** 88.08 MB < 150 MB；Apache-2.0 不限商用；28 个英文音色（美音女 11 / 美音男 9），W:/M: 双人对话选材绰绰有余；Elo 1063 ±11，是 AA 开源榜上**参数规模低于 100M 的唯一上榜模型** —— 也就是说在「小模型」这个池子里它就是榜首。其余候选要么无分、要么体积/许可/ONNX 缺项。
2. **与你们的 Transformers.js + ORT Web 栈零改造对接。** onnx-community/Kokoro-82M-v1.0-ONNX 本身就是 Transformers.js 目录规范（config.json + tokenizer.json + onnx/ + voices/），且有官方 kokoro-js（Apache-2.0，源自 hexgrad/kokoro 仓库）封装。对比 KittenTTS / Pocket TTS 都要自己手写 ORT 调用和 phonemize 前处理，工程量差一个量级。
3. **音色数量带来的实际收益。** 11 个美音女声 + 9 个美音男声，意味着 W: 和 M: 两侧各能挑一个稳定音色，还能按角色（老师/学生、同伴对话 A/B）做音色映射，不用靠语速硬凑区分度。对比 KittenTTS 只有 4 女 4 男。

### ⚠️ 首选的两点必须先验证的风险

- **量化会掉分，掉多少未查到。** Elo 1063 是在（很可能是 fp32/fp16 的）服务端配置上投出来的，**不是 q8 浏览器配置**。q8 = 88 MB 与 fp32 = 310 MB 是完全不同的产物。上线前务必用 q8 在真机做 A/B（至少 af_heart / am_adam），确认听感可接受。
- **集成层陈旧 17 个月。** 上游 hexgrad/Kokoro-82M 最后提交 2025-04-10；kokoro-js 最后发布 2025-05-03，且锁在 @huggingface/transformers ^3.5.1，而当前是 **4.3.0**（2026-09-16）。3.x → 4.x 大版本跨代，大概率要自己适配 API。**建议不要依赖 kokoro-js 封装，直接用 Transformers.js v4 + ORT Web 调 onnx-community 目录**，kokoro-js 仅作参考实现来抄 phonemize 与 voice 加载逻辑。
- 反过来讲，「停滞」对浏览器端也意味着**产物冻结**，不会突然变更破坏构建 —— 这是隐性优点。

---

## 三、降级备选：KittenTTS Nano 0.8（int8，26.37 MB）

**什么情况下用：**

- **150 MB 预算需要腾地方** —— 比如同页还要跑 ASR 打分模型（Whisper 类）、或缓存听力原文音频、或要塞多语言变体。Kokoro 单模型就吃掉 88 MB，KittenTTS 只要 26 MB，小 3.3 倍。
- **低配设备 / 弱网** —— KittenTTS 是单文件自包含 .onnx（23 MB）+ voices.npz（3 MB），加载路径最简单。
- **需要调语速** —— KittenTTS 0.8 的 config.json 内置 speed_priors，每个音色可单独设语速先验（0.8–0.9）。这对「慢速朗读便于学习者听清」是直接可用的旋钮，Kokoro 没有等价物。

**代价（必须先接受）：**

- **零客观分**：未上任何公开榜单，完全靠自测。
- **零浏览器绑定**：npm 上的 kitten-tts 是 Node 包、调用 Python wheel，不是浏览器方案，要自己写 ONNX Runtime 调用。好消息是结构简单（单 onnx + npz）。
- **音色只有 8 个**（4 女 4 男）。模型 2026-02 才更新，相对新、风险低，但生态也薄。

**第二备选：Piper**（若还要更小，x_low 仅 19.67–26.83 MB）。仅在你愿意逐音色做许可尽调、且能接受音质下降时使用 —— 见下。

---

## 四、⚠️ Piper 的许可陷阱（本次调研最易踩的坑）

rhasspy/piper-voices 仓库 README 写的是 license: mit，**但这只是仓库元数据**。每个音色目录下的 MODEL_CARD 各自声明许可，实际是混合的。英文音色实测结果：

| 类别 | 音色 | 数量 |
|---|---|---|
| ✅ 最干净（CC0 / public domain） | joe, kathleen, mike, reza_ibrahim（CC0）；bryce, john, kristin, norman, ljspeech（public domain） | 9 |
| ✅ Apache-2.0 | **sam**（唯一一个 Apache-2.0 英音） | 1 |
| ⚠️ 需署名 | libritts, libritts_r, alba, aru, vctk（CC BY 4.0） | 5 |
| ⚠️ 传染性 copyleft | northern_english_male, southern_english_female（CC BY-SA 4.0） | 2 |
| ⚠️ 非商用 + 传染 | **ryan**（CC BY-NC-SA 4.0）；hfc_female, hfc_male（CC BY-NC-SA 4.0）；semaine（CC BY-NC-SA）；l2arctic（CC BY-NC 4.0） | 5 |
| ⚠️ 自定义 / 需逐个查 | lessac（Blizzard 2013 自定义条款）；amy, danny, kusal, alan, jenny_dioco（标注「See URL」） | 6 |

对你们（非营利教育）而言：CC BY-NC-SA 那几个**非商用是允许的**，但 SA（相同方式共享）意味着音频衍生物有传染性义务，分发前要过法务。CC0 / public domain 那 9 个最省事。

---

## 五、热门但实际不可用 —— 具体卡在哪一条

### ❌ Supertonic 3 / Supertonic 2 —— 卡在第 2 条（体积）+ 许可类型

- **体积**：Supertonic 3 官方 ONNX = **379.63 MB**，超预算 2.5 倍；光 vector_estimator.onnx 就 244.65 MB + vocoder.onnx 96.73 MB。Supertonic 2 官方 = 250.65 MB，同样超标。**官方从未发布量化版。**
- 网上能找到的 97.36 MB INT8 / 126.33 MB Q4 全是**第三方社区量化**（soniqo 45 次下载、nadare **0 次下载**），来源不可信，不建议生产使用。
- **许可**：**BigScience Open RAIL-M**，不是 Apache/MIT。全文已拉取核对：非商用是**允许**的，所以第 4 条字面上不违反；但它带 **Attachment A 的 13 条用途限制 (a)–(m)**（禁止违法用途、剥削未成年人、生成有害虚假信息、冒充他人、歧视、医疗建议、司法/执法用途等），且 **§4.a 强制要求你把第 5 段的使用限制作为可执行条款写进你自己的许可协议**。对非营利项目不是阻断项，但是要落地的法务义务。
- **补充**：Supertonic 3 **未查到任何 Elo/MOS 分数**。

### ❌ Chatterbox —— 卡在第 2 条（体积超标 13–31 倍）

MIT 许可、AA Elo 1023 ±12（第 10 名）都合格，但 ONNX 总体积 **4744 MB**。即便只取最小可用组合（language_model_fp16 992 MB + speech_encoder 564 MB + decoder 6 MB）也约 **1950 MB**。且它是自回归 LM 结构，WASM 上生成极慢。

### ❌ Zonos v0.1 / ZONOS2 —— 卡在第 3 条（根本没有 ONNX），且客观分垫底

HF 上只有 GGUF 和 safetensors，**零 ONNX 构建**。Zonos v0.1 在 AA 榜上是 **Elo 1000 的锚点基准位**（榜单参照原点，实测排最末）。

### ❌ Pocket TTS (kyutai) —— 额外发现的候选，很有潜力但卡在第 3 条的「官方性」

- 许可 **CC-BY-4.0**（明确允许商用，非营利当然没问题），上游**极其活跃**（最后提交 2026-10-01，就是昨天），29 个英文 speaker。
- **但官方没有 ONNX。** 只有 GGUF（q8 = 117.91 MB，但不是 ONNX）。HF 上散落 20+ 个社区转换版本，质量参差：IgnitiveLabs 558 MB、ottomate 779 MB（都含 fp32+int8+q4 全套），最小的 soniqo/Pocket-TTS-100M-ONNX-INT8 是 120.07 MB 但只有 22 次下载、无任何 Transformers.js 绑定。
- 官方权重 languages/english/model.safetensors = **208.88 MB**，本身就超标。
- 结论：**值得持续观察，不建议今天上线。** 若 2026 下半年出官方 ONNX 量化版，它会是最有力的挑战者。

### ❌ 你已排除的大模型 —— 确认同意你的判断

Fish Audio S2 Pro（Elo 1117，AA 第 2）、Voxtral TTS、Maya1、OpenAudio S1 Mini、Higgs Audio V3 TTS、VibeVoice 1.5B、XTTS v2 —— 对纯浏览器端均无意义，体量或架构都不可能塞进 150 MB。

---

## 六、明确「未查到」的信息汇总

| 项 | 状态 |
|---|---|
| KittenTTS（Nano/Micro/Mini 全部版本）Elo/MOS | **未查到** —— 均不在 AA 开源榜，Arena 无记录 |
| Piper 客观分 / MOS | **未查到** |
| Supertonic 2 / 3 客观分 | **未查到** |
| Pocket TTS 客观分 | **未查到** |
| Kokoro 的 **q8 量化版**客观分 | **未查到** —— 1063 ±11 是非量化配置分数，量化掉分幅度无公开数据 |
| TTS-Arena (TTS-AGI) 与 TTS Spaces Arena 当前排名 | **未查到** —— TTS-Arena 站点已改为「The Wordcab TTS Challenge」上传投票制，无公开榜；HF Space 域名被本机网络阻断 |
| Kokoro 的正式 MOS（非 Elo） | **未查到** —— EVAL.md 只有 2025-02-26 的三张榜单截图，无数字 |
| 浏览器端页面总开销（ORT Web WASM runtime 本身约 10–20 MB） | 未查到官方精确值，实测时需自行计入 150 MB 预算 |

---

## 七、关键引用

- Artificial Analysis 开源权重榜：https://artificialanalysis.ai/text-to-speech/leaderboard/open-weights
- Kokoro 模型卡（Apache-2.0 声明）：https://hf-mirror.com/hexgrad/Kokoro-82M/blob/main/README.md
- Supertonic 3 LICENSE（Open RAIL-M 全文，14959 字符）：https://hf-mirror.com/Supertone/supertonic-3/blob/main/LICENSE
- Piper 英音音色许可清单：https://hf-mirror.com/rhasspy/piper-voices/tree/main/en
- KittenTTS Nano 0.8 config（音色别名 + 语速先验）：https://hf-mirror.com/KittenML/kitten-tts-nano-0.8-int8/blob/main/config.json
- kokoro-js npm：https://registry.npmjs.org/kokoro-js
