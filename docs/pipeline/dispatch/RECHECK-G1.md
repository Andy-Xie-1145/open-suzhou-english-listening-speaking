# 任务 RECHECK-G1：A1、A2、A5 轻量结构复核

## 输入

- `data/item-bank/A1.md`（A 类，15 题）
- `data/item-bank/A2.md`（A 类，15 题）
- `data/item-bank/A5.md`（A 类，15 题）
- 口径文件：docs/pipeline/dispatch/LIGHT-CHECK.md（**必读**）

## 为什么做这件事

`check-integrity.ps1` 判这三个批次为 `UNVERIFIED+被改动`：
它们的 V 报告（V-A1.md 06:07:44、V-A2.md 06:15:36、V-A5.md 06:44:14）都早于题目文件本身的修改时间
（A1 06:08:15、A2 06:16:28、A5 07:42:03）。

**已知线索**：A5 的那次改动是 `fixes/F-word-A5.md` 记录的词数修复（把超 60 词的段落压回上限），属预期内改动。
A1 与 A2 改了什么已无记录可查。

## 你的任务

对这三个批次各做一次轻量结构复核，按 LIGHT-CHECK.md 的五项执行。

**额外要求**：
1. A 类词数上限 60 是硬约束。**A5 曾出过 15 段里 10 段超 60 词的事故**，这一批要逐段算，不许抽查。
2. 报告里必须写明每个批次的实测 MD5，供后续销案留痕。
3. 若五项全过，明确写「结构完好，可销案」，并把这三个批次标记为已销案。

## 输出

写入 `data/item-bank/reviews/RECHECK-G1.md`，三个批次各一节。