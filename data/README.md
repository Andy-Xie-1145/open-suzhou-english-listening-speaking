# 语料库（data/）

> 中考英语听力口语自动化考试语料 · 江苏省/苏州市 · 2026 年考纲
> 许可：AGPL-3.0-only

## 一、版权与来源声明（重要）

本目录下 **所有英文正文均为本项目自编的「等效练习材料」，不是教材原文、不是历年真题**。

- 依据：《义务教育英语课程标准（2011 年版）》语言技能五级（听/说）
- 依据：译林牛津版《英语》七上—九下单元话题范围（2024 年审定版）
- 依据：《江苏省初中英语听力口语自动化考试要求》五大题型
- 每条数据都带 `note: "等效练习材料，非教材原文；教材位置用于命题对标"` 字段，界面与打印均应保留该说明
- 如需替换为正版材料：保持 JSON 字段结构不变即可，schema 校验会拦住结构性错误

## 二、四个文件

| 文件 | 条目 | 说明 |
|---|---|---|
| `readings.json` | 24 篇 | 朗读短文（封闭题），每篇 79-92 词，含连读/意群提示 |
| `qa.json` | 24 条 | 情景问答（半开放题），12 个情境类别 |
| `listening.json` | 30 题 | 听力，短对话 15 + 长对话与短文 15，细节/推理/数字各 5 |
| `topics.json` | 12 个 | 话题简述（开放题），每题 8 句范例回答 + 分组句式 |

## 三、24 篇朗读材料的册别分布

| 册别 | 篇数 | 单元对标 |
|---|---|---|
| 七上 | 6 | Let's play sports! / Welcome to our school! / My day / Let's celebrate! / Food and lifestyle / Fashion |
| 七下 | 6 | Home / My hometown / Chinese folk art / Animal friends / Beautiful landscapes / Outdoor fun |
| 八上 | 4 | Friends / School life / Birdwatching / Natural disasters |
| 八下 | 4 | Travelling / Sunshine for all / International charities / A green world |
| 九上 | 2 | Teenage problems / Films |
| 九下 | 2 | Great people / Life on Mars |

**2026 年省通知新增的 6 篇（教材位置已公布，`positionSource: "2026 省通知"`）**

| 教材位置 | 单元主题 |
|---|---|
| 七上 U3 Task | Welcome to our school! |
| 七下 U6 Task | Beautiful landscapes |
| 八下 U7 Task | International charities |
| 九上 U7 Reading | Films |
| 九下 U2 Reading | Great people |
| 九下 U4 Reading | Life on Mars |

其余 18 篇的 `positionSource: "教材对标建议"`：**省通知未公布其教材位置**，
这里按 2024 审定版单元话题给出对标建议，便于教师按单元检索，但不作为考纲事实引用。

## 四、词数口径

`wordCount` 由 `src/materials/loader.ts` 的 `countWords()` 计算并在加载时**强制比对**，
不一致直接抛 `MaterialError`。

口径：字母数字 + 词内连字符/撇号（`minutes' walk`、`good-looking` 各算 1 词），标点不计入。

**为什么 materials 自带 tokenizer，不用 `src/rules/text/normalize.ts` 的 `tokenize`：**
口径隔离——24 篇短文的标注词数是「考纲意义上的词数」，不应随规则层分词口径调整而整体漂移。
该层 2026-08 曾因 `/s+/` 写成字面量 s、字符类未剥离标点而误切单词（`usually` → `u` + `ually`），
缺陷已修复并由 `tests/normalize.test.ts` 固化回归，但语料层不再复用，避免同类问题波及词数。

## 五、维护流程

1. 改 `data/*.json`（保持字段结构；新增条目 id 不重复）
2. 跑 `node --experimental-strip-types tests/materials.test.ts`
3. 跑 `npx tsc --noEmit`（TypeScript strict）

改完语料后 `MATERIALS` 单例会重新校验，结构问题、词数不符、id 重复、答案越界都会在加载期报错。

## 六、组卷口径

- **随机卷**：全随机，题量 = 听力 5+5、朗读 1、情景问答 2、话题简述 1（考生 22 分钟）
- **AB 卷**：2 套平行卷，题量结构一致、题目互不重复
- **梅花卷（甲/乙/丙）**：3 套平行卷，按考点类型配平（各卷细节/推理/数字题量差 ≤ 1）、
  朗读材料同难度、同卷情景问答不同类别，供同场次轮换

同一个 `seed` 必得同一套卷面（教师可重印），不同 `seed` 得不同卷面。
