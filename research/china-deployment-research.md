# 纯浏览器端教育工具 · 中国大陆上线调研报告

调研日期：2026-09。**本次调研的工作机位于中国大陆境内网络**，下文「实测」均为从大陆网络发起的真实请求，不是二手资料。这让很多原本只能靠社区传闻的问题有了硬证据。

---

## 0. 先说三个改变结论的发现

**发现 1（最关键）：模型体积比预估大 3 倍。**
你给的 wav2vec2 音素模型「约 100MB」是错的。实测 `onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX` 的全部 ONNX 变体（数据来自 ModelScope files API，带 sha256）：

| 文件 | 大小 |
|---|---|
| model.onnx (fp32) | 1,205.45 MB |
| model_fp16.onnx | 603.04 MB |
| **model_quantized.onnx (q8)** | **302.99 MB** |
| model_q4.onnx | 230.50 MB |
| model_bnb4.onnx | 212.44 MB |
| model_q4f16.onnx | 187.79 MB |

项目代码 `src/engine/phoneme.ts:797` 写的是 `dtype: device === 'webgpu' ? 'fp32' : 'q8'` → WASM 路径下会拉 **303MB**，不是 100MB。这是全流程最大的单块，也是首屏体验的瓶颈。

**发现 2：Cloudflare Pages 单文件 25 MiB 上限，你已经超了。**
官方 Limits 页：「The maximum file size for a single Cloudflare Pages site asset is 25 MiB」= 26,214,400 字节。
当前产物 `dist/assets/ort-wasm-simd-threaded.asyncify-CxOG5pUO.wasm` = **26,861,777 字节（25.62 MiB），超限 647,377 字节**。
**现状直接部署到 Pages 会失败**，这不是理论风险，是已在产物里量出来的。

**发现 3：模型分发有「两行代码」的正解，且已实测跑通。**
`env.remoteHost` + `env.remotePathTemplate` 指向国内 ModelScope，无需自建任何服务。

---

## 1. Cloudflare Pages + 自定义域名：结论 = **有条件可行，但不建议作为唯一承载路径**

### 1.1 pages.dev 在大陆的实际状况

**Cloudflare 官方从未说 pages.dev 被 GFW 干扰。** 官方 China Network FAQ 里唯一相关的表述是：

> "Pages is not available in Mainland China due to pages.dev certificate not residing within Mainland China. However, Pages from a global zone may potentially be extended into Mainland China."
> — [China Network FAQ](https://developers.cloudflare.com/china-network/faq/)（Last updated Apr 16, 2026）

注意这句话说的是 **China Network（京东云境内节点）不可用**，原因是证书不在境内，**不是**被墙。这是两个完全不同的问题，你的假设里把两者混在一起了。

**实测（从大陆网络发起）：pages.dev 可以访问，但慢。**

| 目标 | 结果 |
|---|---|
| `https://pages.dev/` | OK, TTFB 2415 ms, 601 KB |
| `https://cnkai.pages.dev/2025/02/16/cloudflare-proxies` | OK, TTFB 2770 ms |
| `pages.dev` TCP:443 | 通 |

**GreatFire 的逐域名数据（关键，说明「pages.dev 整体被墙」不成立，但也不稳定）：**

| 域名 | GreatFire 结论 | 日期 |
|---|---|---|
| bestcf.pages.dev | **50% disrupted** | 2026-08-30 |
| yodhcn.pages.dev | **最近 1 次结论性测试 100% 显示干扰**，自 2026-09-12 起 | 2026-09 |
| 51-voice.pages.dev | 未被封锁 | 2026-09-27 |
| trumpets.pages.dev | 未被封锁 | 2026-08-29 |

→ **结论：pages.dev 不是域名级封锁，但存在非确定性的、逐子域的干扰。** 换自定义域名确实能规避「pages.dev 这个域名本身」的风险（你的判断是对的），但规避不了干扰本身。

### 1.2 自定义域名接入后的真实表现

**这里是最关键的反直觉点：自定义域名解决的是域名问题，解决不了网络问题。**

实测从大陆网络下载 Cloudflare CDN 上的 25MB 文件：

- 成功那次：`Cf-Ray: a445d6a92e334022-LAX`（**落到美国洛杉矶**），TTFB 796ms，11.53 MB/s
- **前一次同样的请求直接超时**（45s 无响应）

→ Cloudflare 免费版在大陆**没有境内节点**，所有流量出海。快的时候能用，慢的时候和断的时候是另一回事。这就是为什么 Cloudflare 官方要单独卖 Enterprise + China Network（京东云节点）。

补充事实：[China Network](https://developers.cloudflare.com/china-network/) 是 **Enterprise 套餐专属的独立订阅**，还要 ICP 备案 + 京东云内容审核，你用不了。

### 1.3 自定义域名是否要求域名托管在 Cloudflare？

**分情况，官方文档写得很清楚**（[Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)）：

> "If you are deploying to a subdomain, it is not necessary for your site to be a Cloudflare zone."
> "If you do not want to point your nameservers to Cloudflare, you must create a custom CNAME record... This record should point to your custom Pages subdomain, for example `<YOUR_SITE>.pages.dev`."

| 场景 | 是否必须托管在 Cloudflare |
|---|---|
| **子域名**（如 `app.example.com`） | **不需要**。阿里云/腾讯云注册的域名直接加一条 CNAME → `<project>.pages.dev` 即可 |
| **根域名**（apex，如 `example.com`） | **需要**。必须把 NS 指向 Cloudflare |

**两个必须注意的坑（官方文档明写）：**

1. **必须先在 Pages 控制台点 "Set up a domain" 关联该域名**，再去 DNS 加 CNAME。顺序反了会一直 **522**。只加 CNAME 不关联 = 必然 522。
2. 如果域名已在 Cloudflare zone 里，CNAME 记录会自动创建，不需要手加。
3. CAA 记录可能阻止 Cloudflare 签发证书，要放行 `letsencrypt.org` / `pki.goog` 等。

→ 阿里云/腾讯云注册域名 → **CNAME 到 Pages，可行**，不需要转移 NS。

### 1.4 ICP 备案要求

**结论：如果站点不落在中国大陆的服务器/CDN 节点上，不需要 ICP 备案。**

依据：

- ICP 是由**大陆接入商**（阿里云/腾讯云等持有 MIIT 牌照的 IDC）强制执行的接入前许可，不是 GFW 的拦截规则。
- Cloudflare 官方文档说「所有网站必须 ICP」，限定在 **China Network 语境**（因为境内节点就是京东云）。
- 阿里云官方《为 OSS 绑定自定义域名时的 ICP 备案场景与要求》明确按「域名是否解析至**中国内地服务器**」来判定：

> 域名是否需要进行 ICP 备案 → 应用场景 → 是否要备案
> 网站域名 → 用于网站访问，且域名解析至**中国内地服务器** → **是**
> OSS 绑定的自定义域名 → 静态文件存 OSS 并绑自定义域名 → **是**

**所以：**

- [OK] Cloudflare Pages 境外节点 → **不需要备案**
- [NO] 走方案 C（国内 OSS/COS + CDN）→ **必须备案**

---

## 2. 模型分发方案对比与推荐

### 2.1 实测可用性（从大陆网络发起）

| 源 | 结果 | 实测数据 |
|---|---|---|
| `huggingface.co` | **完全不可用** | DNS 解析到 **199.16.156.7**（Twitter 网段 = 典型 GFW 投毒地址），TCP 443 **不通**，HTTP 超时 |
| `hf-mirror.com` | 可用 | 3.17–13.19 MB/s；CORS 正确回显 Origin；支持 Range；**无 CORP 头** |
| `www.modelscope.cn` | 可用 | 5.03–9.43 MB/s；重定向到 `cdn-lfs-cn-1.modelscope.cn`（阿里境内 CDN）；**ACAO=***；支持 Range(206) |
| `cdn.jsdelivr.net` | 勉强 | TTFB 1855 ms，跨境绕路 |
| `registry.npmmirror.com` | 可用 | 2.93 MB/s |

### 2.2 方案 B：HuggingFace 运行时拉取 → **直接出局**

huggingface.co 从大陆**DNS 投毒 + 443 不通**，没有讨论空间。

### 2.3 方案 B'：hf-mirror → **可用但不能做主路径**

实测能跑，CORS 也对。但：

- 第三方志愿者服务，**运营主体、SLA、长期存续均未查到**。
- 不返回 `Cross-Origin-Resource-Policy` 头（实测为空）→ 开了 COEP 会被浏览器拦（见 4.2）。
- 随时可能消失，学校场景不能把主链路压在上面。

### 2.4 方案 D（推荐）：ModelScope 作为主源，**两行代码**

transformers.js 的 env 是可配置的（`node_modules/@huggingface/transformers/src/env.js:256-257`）：

```js
// 默认
remoteHost: 'https://huggingface.co/',
remotePathTemplate: '{model}/resolve/{revision}/',

// 改成 ModelScope（实测 URL 格式已验证可用）
env.remoteHost = 'https://www.modelscope.cn/'
env.remotePathTemplate = 'models/{model}/resolve/master/'
```

实测 URL 形态：`https://www.modelscope.cn/models/{model_id}/resolve/master/{path}` → 302 到境内 CDN，**ACAO=*，Range 支持**。

**你需要的四个模型仓库，实测在 ModelScope 上全部存在：**

- [OK] `onnx-community/whisper-tiny`
- [OK] `onnx-community/whisper-base`
- [OK] `onnx-community/wav2vec2-lv-60-espeak-cv-ft-ONNX`
- [OK] `onnx-community/Kokoro-82M-v1.0-ONNX`

**推荐架构（三级降级）：**

```
env.remoteHost → https://www.modelscope.cn/     （主，免费，国内 CDN）
       ↓ 加载失败
       → https://hf-mirror.com/                  （备，无 SLA）
       ↓ 再失败
       → 自有 OSS/COS（可选，需备案）
```

代码侧用一个自定义 fetch 包一层做 fallback 即可（env 也支持 `env.fetch` 覆盖）。

**注意**：ModelScope 上这些是**社区上传的第三方镜像**（committer: "Cherrytest"，commit message: "Upload folder using ModelScope SDK"），非 ModelScope 官方背书。好消息是 files API 返回 **sha256**，可以跟 HF 的 LFS oid 比对做完整性校验——上线前请务必做这一步。

### 2.5 方案 A：打包进静态产物 → **不可行（已被产物卡死）**

两个独立的硬伤：

1. **ORT wasm 26,861,777 > 26,214,400，超 Pages 单文件上限 647,377 字节。** 现状部署必失败。
2. 即使修好 #1，**456 MB 的首屏在移动网络下不可接受**。

关于额度：Pages 静态资源请求是 **free and unlimited**（官方 pricing 页：*"On both free and paid plans, requests to static assets are free and unlimited"*）。所以带宽不是瓶颈，**瓶颈是首屏体积**。Pages Free 计划的真实约束是：20,000 文件/站、500 构建/月、100 自定义域名/项目、**单文件 25 MiB**。

### 2.6 方案 C：国内 OSS/COS + CDN

**成本（官方定价核实）：**

阿里云 CDN 官方定价页（[alibabacloud.com 定价](https://www.alibabacloud.com/zh/product/content-delivery-network/pricing)）按流量阶梯，**中国大陆-CN**：

| 阶梯 | 单价 |
|---|---|
| 0–50 TB | **USD 0.04/GB** |
| 50–100 TB | USD 0.03/GB |
| 100 TB–1 PB | USD 0.03/GB |
| > 1 PB | USD 0.02/GB |

另计增值项：**静态 HTTPS 请求数 USD 0.008/万次**（模型文件请求数很少，可忽略；但小文件资源多时要注意）。

**换算到你的场景：**

- 1000 名学生各首次加载 459 MB ≈ **448 GB ≈ USD 17.94**（一次性）
- 之后走浏览器缓存，增量趋近于 0
- 存储费可忽略：OSS/COS 标准存储约 ¥0.099/GB/月，459MB ≈ ¥0.05/月
- 腾讯云 COS 有**每月 50GB 存储 + 50GB 流量免费额度**

**坑：**

1. **必须 ICP 备案**（域名解析到中国内地服务器，见 1.4）。备案周期 1–2 个月，个人/企业材料不同。
2. **资源包过期作废**（官方明确：*"您未使用完毕的流量包将被作废"*）。
3. 默认带宽上限 10Gbps（防刷流量）。
4. 腾讯云 COS 会按《人工智能生成合成内容标识办法》自动给文件加 AIGC 元数据标识（2025-07/2025-09 更新）。

**性价比判断：** 一次性的 18 美元量级说明 **CDN 带宽根本不是钱的问题**。花钱买的是「确定性 + 备案 + 运维」，不是「省流量」。所以：先走免费方案，等真的出现可用性问题再上 OSS。

---

## 3. 首屏与微信内置浏览器

### 3.1 首屏应该按需加载

**首屏（完全不加载模型）实测构成：**

| 文件 | 字节 |
|---|---|
| `index.html` | 644 |
| `index-B27jb1UH.js` | 118,065 |
| `index-B4SxIQ8H.css` | 17,878 |
| `transformers.web-3RLIHeYK.js` | 574,385 |
| **合计** | **约 0.71 MB** |

**首屏压到 ~0.7 MB 是现实可行的。** 关键是把 ORT wasm（25.6 MiB）也移出首屏——它是第一次点「开始录音」时才需要的，且 transformers.js v4 提供 `env.useWasmCache` 会把 wasm 二进制预缓存到 Cache API。

**完整按需加载的分层：**

| 触发时机 | 内容 | 体积 |
|---|---|---|
| 首屏 | HTML + JS + CSS + transformers.web | ~0.7 MB |
| 首次录音 | ORT wasm | 25.6 MiB |
| 首次录音 | whisper-tiny q8（encoder 9.7 + decoder_merged 29.3 + 配置） | ~40 MB |
| 首次发音评测 | **wav2vec2 q8** | **303 MB** |
| 首次朗读 | Kokoro q8（+ 单个音色 bin ~0.5MB） | ~89 MB |
| **全量累计** | | **约 459 MB** |

若 wav2vec2 改 `q4f16`（187.8 MB），全量降到 **约 344 MB**。

**按实测 5–13 MB/s 的国内链路速度：**

| 模型 | 下载耗时 |
|---|---|
| ORT wasm 25.6 MiB | 2–5 s |
| whisper-tiny q8 (40 MB) | 3–8 s |
| **wav2vec2 q8 (303 MB)** | **23–61 s** |
| wav2vec2 q4f16 (188 MB) | 15–38 s |
| Kokoro q8 (89 MB) | 7–18 s |

**这直接回答了你的问题：首屏该按需加载，但真正的体验杀手是 wav2vec2 那 303 MB。** 建议：音素评测改成用户显式点击才触发 + q4f16 量化 + 明确进度条和「可以先用其他功能」。

### 3.2 微信内置浏览器兼容性

**iOS 微信：官方确认是 WKWebView。**

微信开放文档《[iOS WKWebview 网页适配](https://developers.weixin.qq.com/doc/service/guide/h5/adapt_ios.html)》原文：

> 「微信 iOS 客户端自 2017 年 3 月 1 日起逐步升级为 WKWebView 内核」
> 「切换为 WKWebView 后，微信 WebView 行为与 Safari 高度一致」

**WebGPU 结论：iOS 微信完全不可依赖。**

- Safari 26 才支持 WebGPU（Apple 官方 Safari 26 release notes）。
- 但 **WKWebView 至今没有 WebGPU**。W3C WebView Community Group 的数据（[caniwebview.com](https://caniwebview.com/features/web-feature-webgpu)，2026-09 更新）：WKWebView macOS / iOS 的 WebGPU 均为未支持；只有 Safari Browser iOS 26 勾选支持。
- **→ 微信 iOS 用户 100% 走 WASM 路径**，WebGPU 只能当 PC Chrome 上的加速项。

**Android 微信：X5 Blink 内核**（2016 年起 100% 放量升级）。
Blink 内核理论上支持 WebGPU（Chrome 113+），但 **X5 内核的 Chrome 版本跟进严重滞后**，实际 WebGPU 可用率很低。未查到 X5 的确切内核版本分布数据 —— 建议按「无 WebGPU」设计。

**其他已确认的微信内浏览器限制（官方文档）：**

| 项 | 结论 | 影响 |
|---|---|---|
| localStorage | 可用，**但退出微信账号会被清空**（官方原文：「退出微信账号后，将清空所有 Cookie 和 LocalStorage」） | 学习进度不能只存本地，必须能重置后恢复 |
| 跨域 Cookie | 被 WKWebView 安全策略拦截 | **静态资源务必 cookie-free**（官方明确建议） |
| Cache API / Service Worker | 未查到微信内的明确定论 | 需要 try/catch 兜底 |
| MediaRecorder / getUserMedia | 依赖 secure context（项目 `recorder.ts:82` 已有 `isSecureContext` 检查） | **必须 HTTPS** |

**必须做的降级（按优先级）：**

1. **WASM 单线程保底（最重要）**
   - 探测 `self.crossOriginIsolated && typeof SharedArrayBuffer === 'function'`，否则 `ort.env.wasm.numThreads = 1`
   - ORT 官方文档明确：*"Only when the browser supports WebAssembly multi-threading and crossOriginIsolated mode is enabled, multi-threading will be enabled"*
   - 实测代价（dev.to 实测报告）：**8 线程 2133ms → 无 COOP/COEP 时静默回落单线程 6318ms，约慢 3 倍**
   - **注意「静默回落」**：不探测的话性能悄悄差 3 倍，用户只会觉得「卡」

2. **WebGPU 一律 optional**，WASM 为基线。检测代码项目里已有（`app.ts:92` 的 `env.hasWebGpu`），保持即可。

3. **iOS 内存是最硬的约束**
   - ONNX Runtime 官方 issue [microsoft/onnxruntime#26827](https://github.com/microsoft/onnxruntime/issues/26827) 报告：ONNX Runtime Web 在 iOS Safari/WebKit 上内存从 **1 GB 起涨到 14 GB+，导致进程崩溃**
   - iOS 单进程内存上限约 2 GB
   - **→ 303 MB 的 wav2vec2 在中低端 iPhone 上大概率 OOM**。必须加 try/catch + 友好降级提示，且优先试 q4f16。

4. **localStorage / Cache API 全部 try/catch**，并提供「换设备 / 清缓存后恢复学习进度」路径（服务端不可用的话，至少要能导出/导入 JSON）。

5. **HTTPS 硬要求**（getUserMedia / WebGPU / COOP 都要求 secure context）。Pages 自动签发证书，这条能满足。

---

## 4. 你可能没算进去的坑

### 4.1 Pages 单文件 25 MiB 硬上限 —— 已触发

ORT wasm 超 647,377 字节。**必须换变体**，例如从 `ort-wasm-simd-threaded.asyncify` 换非 asyncify 版本，或用 `ort.env.wasm.wasmPaths` 外链到别处。这条不解决，部署直接失败。

### 4.2 COEP 与跨源模型加载互斥 —— 必须二选一

这是个**架构级决策，必须提前定，否则后期返工**。

要开 ORT 多线程 → Pages `_headers` 加：

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

但 COEP: require-corp 要求**所有跨源子资源带 CORP 头**。实测：

| 源 | ACAO | CORP | 开 COEP 后能从 ModelScope 拉吗 |
|---|---|---|---|
| ModelScope 文件直链 | `*` | **空** | **被拦** |
| hf-mirror 文件 | echo Origin | **空** | **被拦** |
| Pages 静态资源 | * | `cross-origin` | 可以 |

→ **开了 COEP 就必须把模型放同源**（自己 OSS/CDN/R2），不能走免费 ModelScope。
→ **二选一：要么自建 OSS（+备案，多线程快 3 倍），要么走 ModelScope 免费源（放弃多线程，慢 3 倍）。**

顺带：`_headers` **不作用于 Pages Functions 的响应**（官方文档明写）。本项目纯静态，无影响。

### 4.3 GFW 现在会做非确定性的大规模阻断

[gfw.report](https://gfw.report/blog/gfw_unconditional_rst_20250820/zh) 报告：**2025-08-20 GFW 实施了约 74 分钟的无条件 TCP 443 RST 注入**，从境内境外两侧均可观测到，**且非确定性**。GFW 的新规则会限制需要检查的连接数（聚焦源端口 > 目的端口的连接）。

**这意味着：换自定义域名也不能保证 100% 可达。** 这不是 IP/域名黑名单问题，是网络层的概率性事件。

我自己的实测就撞上了：同一个 Cloudflare 25MB 下载请求，**第一次 45 秒超时，第二次 11.53 MB/s 成功**。

→ **产品上必须准备降级话术和「重试」按钮**，而不是假设「换个域名就稳了」。

### 4.4 wav2vec2 没有任何小变体

只有 q4f16(188MB) / q4(231MB) / bnb4(212MB) / q8(303MB) / fp16(603MB) / fp32(1205MB)。**没有 tiny 级别**。要么接受 188MB 下限，要么**换模型**（这是一个值得单独评估的方向，不在本次调研范围）。

### 4.5 微信分享卡片需要服务号认证

分享到微信时想要标题/缩略图，需要公众号 JS-SDK + 已认证服务号。未认证的话分享出去是纯链接，影响初中生之间的传播。

### 4.6 局域网/校园网代理可能破坏 WASM

部分校园网/运营商代理会干扰大文件分片。务必依赖 HTTP Range 支持做断点续传（实测 ModelScope 和 hf-mirror 都支持 Range）。

---

## 5. 最终建议

### 明确结论

**1. Cloudflare Pages + 自定义域名：有条件可行。**

- [OK] 自定义子域名可以直接 CNAME 到 Pages，**不需要把域名托管到 Cloudflare**（根域名才需要）
- [OK] 境外节点**不需要 ICP 备案**
- [!] 无境内节点，流量出海（实测 Cf-Ray 落到 LAX），且 GFW 会做概率性阻断
- [NO] 中国大陆节点需要 Enterprise + China Network，你用不了
- **建议：把 Cloudflare Pages 当「应用壳 + 海外/备用入口」，不要当唯一入口。**

**2. 模型分发：选方案 D（ModelScope），不选 A/C/B。**

- 两行代码搞定，零基建，5–13 MB/s（实测）
- 方案 A 已被 25 MiB 上限卡死，且首屏 456MB 不可接受
- 方案 B 直接出局（DNS 投毒）
- 方案 C 成本可忽略（1000 人约 USD 18），但要备案 —— 等真出可用性问题再上

**3. 首屏约 0.7MB；全流程按需加载约 459MB（wav2vec2 改 q4f16 可降到 344MB）。**

**4. 微信 iOS 无 WebGPU，100% 走 WASM；必须做 SAB 探测降级（否则静默慢 3 倍）+ iOS 内存兜底（303MB 模型有 OOM 风险）。**

**5. 立刻要做的三件事（按顺序）：**

1. 换掉 ORT wasm 变体，解决 Pages 25 MiB 超限
2. 定 COEP 架构决策：自建 OSS（多线程） vs ModelScope 免费源（单线程）
3. wav2vec2 从 q8 降到 q4f16，并做 iOS 真机 OOM 测试

---

## 6. 明确「未查到」的项

按要求，以下**没有找到可靠来源，不做猜测**：

- **未查到** Cloudflare 官方对「pages.dev 是否被 GFW 干扰」的正式声明。官方唯一相关表述是 China Network FAQ 里那句关于证书不在境内的说明，那是另一回事。
- **未查到** hf-mirror.com 的运营主体、维护承诺、SLA 或长期存续保证。
- **未查到** 微信内置浏览器（X5 内核）下 `crossOriginIsolated` / `SharedArrayBuffer` 的明确定论。Android WebView 侧有 Chromium issue 表明不支持跨源隔离；微信 X5 的情况无权威数据。
- **未查到** 微信内置浏览器在中学生群体中的用户占比的权威统计。
- **未查到** 阿里云 CDN **人民币**官方定价页的逐字数据。上面的 USD 0.04/GB 来自阿里云官方国际站定价页，是核实过的；人民币站的约 ¥0.24/GB 来自第三方来源，未逐字核实。
- 所有实测均为**单点、单时段**（一台位于大陆的工作机，未确认具体省份）。可用于判断「可用/不可用」的量级判断，**不足以作为容量规划或 SLA 依据**。正式上线前建议用多省份拨测（如 boce.com / 17ce.com）复测。

---

## 附：主要来源

- [Cloudflare Pages Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Pages Limits（25 MiB 单文件）](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Pages Pricing（静态资源无限量免费）](https://developers.cloudflare.com/pages/functions/pricing/)
- [Cloudflare Pages Headers（_headers）](https://developers.cloudflare.com/pages/configuration/headers/)
- [Cloudflare China Network FAQ（Pages 不在境内可用）](https://developers.cloudflare.com/china-network/faq/)
- [Cloudflare China Network Get started（Enterprise 门槛）](https://developers.cloudflare.com/china-network/get-started/)
- [阿里云 ICP：使用阿里云 OSS 的备案要求](https://help.aliyun.com/zh/icp-filing/basic-icp-service/product-overview/use-oss)
- [阿里云 CDN 定价](https://www.alibabacloud.com/zh/product/content-delivery-network/pricing)
- [微信开放文档：iOS WKWebview 网页适配](https://developers.weixin.qq.com/doc/service/guide/h5/adapt_ios.html)
- [W3C WebView CG：Can I WebView - WebGPU](https://caniwebview.com/features/web-feature-webgpu)
- [ONNX Runtime Web：env flags（多线程需 crossOriginIsolated）](https://onnxruntime.ai/docs/tutorials/web/env-flags-and-session-options.html)
- [microsoft/onnxruntime#26827（iOS 内存问题）](https://github.com/microsoft/onnxruntime/issues/26827)
- [gfw.report：2025-08-20 无条件 RST 阻断](https://gfw.report/blog/gfw_unconditional_rst_20250820/zh)
- [GreatFire: pages.dev 各子域干扰状态](https://zh.greatfire.org/https/pages.dev)
- [Transformers.js env 源码（remoteHost/remotePathTemplate）](https://huggingface.co/docs/transformers.js/en/api/env)