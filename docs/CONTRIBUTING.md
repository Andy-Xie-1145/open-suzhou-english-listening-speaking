# 参与开发

## 开发环境

```bash
npm install
npm test
npm run typecheck
npm run dev
```

要求 Node 22+（项目使用 `node --experimental-strip-types` 直接运行 TS）。

---

## 目录结构与写作用域

修改前务必阅读 [ARCHITECTURE.md](../ARCHITECTURE.md)。

```
src/rules/      L0 规则层        冻结，任何修改需先讨论
src/engine/      L1/L2/L3 引擎
src/materials/   语料加载
src/ui/          界面
data/            语料 JSON
docs/            文档
tests/           测试
```

---

## 硬性规则

1. **零服务端** —— 不得引入需要后端配合的依赖
2. **音频不出浏览器** —— 不得上传、不得落盘
3. **优雅降级** —— 新增能力必须能在缺失时降级，不能让页面白屏
4. **AGPL-3.0-only 兼容** —— 新依赖的许可必须兼容
5. **Node 兼容** —— 浏览器 API 访问前必须 `typeof` 检查
6. **import 带 .ts 扩展名** —— 项目用 strip-types 直接运行

---

## 测试

每个模块配套一个测试文件，可用 Node 直接运行：

```bash
node --experimental-strip-types tests/rules.test.ts
node --experimental-strip-types tests/reading.test.ts
node --experimental-strip-types tests/listening.test.ts
node --experimental-strip-types tests/engine.test.ts
node --experimental-strip-types tests/materials.test.ts
node --experimental-strip-types tests/ui.test.ts

npm run test:all
```

**测试不得依赖网络、模型权重或 API key。** 模型相关代码用动态 import 保护，
未加载时抛 `EngineUnavailable`，测试只验证这条降级路径。

---

## 加一个新评分维度

1. 在 `src/rules/` 加纯函数（不依赖模型）
2. 产出 `Diagnostic[]`，每条含 `code / severity / message / suggestion`
3. 在 `tests/` 补测试，含**降级/异常路径**
4. 在 `src/ui/feedback.ts` 增加展示

**不要在 UI 里写评分逻辑**，评分逻辑一律放 `src/rules/`。
