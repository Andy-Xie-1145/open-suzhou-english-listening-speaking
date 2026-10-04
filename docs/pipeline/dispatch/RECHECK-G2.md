# 任务 RECHECK-G2：B1、C1、D1 轻量结构复核

## 输入

- `data/item-bank/B-batch1.md`（B 类，8 段 16 题）
- `data/item-bank/C-batch1.md`（C 类，8 篇 40 题）
- `data/item-bank/D-batch1.md`（D 类，10 份 30 空）
- 口径文件：docs/pipeline/dispatch/LIGHT-CHECK.md（**必读**）
- D 类规格：docs/pipeline/dispatch/D-SPEC.md（D1 必读）

## 为什么做这件事

`check-integrity.ps1` 判这三个批次为 `UNVERIFIED+被改动`：
V-B1（06:07:55）早于 B-batch1.md（06:08:49）、V-C1（06:21:37）早于 C-batch1.md（06:22:13）、
V-D1（06:28:01）早于 D-batch1.md（06:29:21），三者差 36 到 72 秒。

## 你的任务

对这三个批次各做一次轻量结构复核，按 LIGHT-CHECK.md 的五项执行。

**额外要求**：
1. **C-batch1 是本库最大的批次，40 题。** 题数比 5、词数区间 150 到 220，必须逐篇复算，不许抽查。
2. **D-batch1 用 D-SPEC.md 的口径**：空数 ÷ 份数 = 3；每份词库 5 项、恰 2 个干扰项；30 空命中 30 条；A 到 E 五字母全批都被用作答案。
3. B-batch1 的结构比是 2，词数上限 200。
4. **抽查答案唯一性时，C-batch1 至少抽 5 题**（该批次体量最大）。
5. 报告里必须写明每个批次的实测 MD5。

## 输出

写入 `data/item-bank/reviews/RECHECK-G2.md`，三个批次各一节。