# 复核报告：A1.md 修复后复核（V）

> 复核者：修复后复核员
> 复核对象：仅限最新一轮改动过的 5 题 —— **A1-03 / A1-05 / A1-07 / A1-14 / A1-15**
> 复核依据：`reviews/R2-A1.md`（改动说明） + `data/item-bank/A1.md`（当前文件） + `REVIEW-RUBRIC.md`（规范）
> 声明：本轮**未读取** `reviews/R1-A1.md` 及 `fixes/` 下任何文件；未修改任何题目文件。

## 结论

- 复核题数：**5**（A1-03 / A1-05 / A1-07 / A1-14 / A1-15）
- 发现新缺陷：**1 条**（A1-15，格式类轻微）；4 题零问题
- 是否可归档：**暂不可**。本轮改动**没有破坏任何一道题的答案可判性、内部自洽或角色方向**，唯一遗留是 A1-15 的一行说话人标注瑕疵，**修掉 V-1 即可归档**。

---

## 一、本轮改动落点核对（对照 R2-A1.md 的 6 条中等）

| R2 条目 | R2 建议 | 当前文件实际 | 落点判定 |
|---|---|---|---|
| 中等 #1（A1-03） | 第 31 行 finish → hand it in | 第 31 行 "Please hand it in before four this afternoon." | 已落地 |
| 中等 #2（A1-07） | 第 88 行 We'll start → It will leave | 第 88 行 "It will leave ten minutes later." | 已落地 |
| 中等 #3（A1-05） | 第 65 行 C 改为 Write the note himself. | 第 65 行 "- C. Write the note himself." | 已落地 |
| 中等 #4（A1-14） | 第 183 行改 Boy、184/186 行改 Teacher/Ms. Chen | 第 183 行 "Boy:"、184/186 行 "Ms. Chen:" | 已落地 |
| 中等 #5（A1-15） | 标题改「课间活动」或改对话 | 第 195 行 "## A1-15 课间活动"（取方案 A） | 已落地 |
| 中等 #6（A1-15） | 反转提议方：Girl 提议 / Boy 回应 | 第 199-200 行已对调 | 已落地，但**衍生 V-1** |

R2 的 6 条中等**全部落地，无遗漏、无改出别的岔子**。唯一副作用见 V-1。

---

## 二、复核清单（逐条回答）

### 1. 改动后是否出现新的二解？—— **通过**

- **A1-03**：hand it in 与题干 hand in 动作已对齐，材料原句 "before four this afternoon" 直接给出 A。B（At nine tomorrow morning）是男孩被驳回的提议、C（At four on Friday）被 before 排除、D 无依据。推理缺口已闭合，无二解。
- **A1-05**："You should talk to him yourself" 只支持 B。C（Write the note himself）与材料**方向相反**——Mr. Li 拒绝写条子，且只给了「你自己去谈」一条建议，从未要求男孩自己写条子，无从推出。A/D 无材料依据。
- **A1-07**："It leaves at seven" + "It will leave ten minutes later" = 7:10 = C（At ten past seven）。A（At five thirty）是返程时间，B/D 无依据。
- **A1-14**："You can put two tables in the school hall" 唯一指向 B；A/C/D 三个地点材料零提及。
- **A1-15**：Boy 明说 "I'd rather read in the reading room" → C；A 是 Girl 的提议且被婉拒，B/D 无依据。

### 2. 材料内部是否仍自洽（时间/数字/人物/场所/指代链）？—— **通过**

- **A1-03**：时间链 上午提问 → 老师改判「今天下午四点前」→ 男孩「现在回图书馆」。it（= my history project）指代清晰。
- **A1-05**：him → the head teacher（上一句唯一男性宾语），指代链无歧义。
- **A1-07**：It 在第 86、88 行均指校车，主语统一；7:00 + 10 分钟 = 7:10，换算正确（ten past seven 而非 half past）。
- **A1-14**："It's empty then"（下周礼堂空）/ "take it down"（撤下大通知栏）指代均唯一，无冲突。
- **A1-15**：10:00 打铃 + 40 分钟长课间 → 10:40 上课，内部自洽。

### 3. 说话人标注是否仍全篇统一？有没有同一角色被拆成两个人？—— **有问题（V-1，1 题）**

- **A1-15**：标注序列为 Boy → Girl → **Girl** → Boy，第 198、199 行连续两轮都是 Girl，一个角色被拆成两轮。详见 V-1。
- A1-03（Boy → Ms. Green → Boy）、A1-05（Boy → Man → Boy → Man）、A1-07（Boy → Girl → Boy → Girl）、A1-14（Boy → Ms. Chen → Boy → Ms. Chen）**全部通过**，无连续同标注、无角色拆分。
- 全库横向实测：A1-15 是 data/item-bank/ 下 10 个题目文件中**唯一**出现「相邻同说话人标注」的一份（A1 / A2 / A3 / A-batch0 / B-batch1 / C-batch1 / E-batch1 / prod·A4 / prod·A5 / prod·B2 均为 0 处）。

### 4. 标题与正文是否仍矛盾？—— **通过**

- **A1-15**：标题已由「课间十分钟」改为「课间活动」，与正文 forty minutes 不再打架（原中等 #5 关闭）。
- A1-03「交作业的时间」vs 正文交作业；A1-05「请老师写条子」vs 正文写条子；A1-07「校车晚点了」vs 正文 road is being repaired；A1-14「班级义卖」vs 正文 book sale——均相符。
- 备注（不判为缺陷）：A1-14 标题用「义卖」、正文用 book sale，属中文习惯的宽松对应，正文并未出现与「义卖」相斥的表述，不构成矛盾。

### 5. 是否引入重复轮次？（规范 1.7 相似度扫描实测）—— **通过**

对 data/item-bank/A1.md 全文件（15 题）跑了两项脚本扫描：

- **话轮相似度扫描**（分词后 Jaccard，阈值 > 0.6 命中）
  - 材料内两两比对：**0 命中**。全文件最高一对为 A1-09 "How many classes do you have this morning?" / "When do you have PE?" = **0.30**，远低于阈值。
  - 跨材料两两比对：**0 命中**。
- **开场白归一化扫描**（去标点、转小写后建字典，同 key 出现 > 1 次命中）：**0 命中**，15 题开场句互不相同。
- 5 道改动题内部最高相似对分别约为 0.30 / 0.14 / 0.14 / 0.14 / 0.06 量级，无复制粘贴痕迹。
- 附带核查：行尾空格 0 处、双空格 0 处、编号 A1-01~A1-15 连续无缺号、每题 4 个选项齐全且互不重复、答案字母均在 A~D 范围内。

### 6. 答案字母是否仍与材料对应？—— **通过**

| 题号 | 答案 | 对应材料原文 |
|---|---|---|
| A1-03 | A | Please hand it in before four this afternoon. |
| A1-05 | B | You should talk to him yourself. |
| A1-07 | C | It leaves at seven + ten minutes later = 7:10 |
| A1-14 | B | You can put two tables in the school hall. |
| A1-15 | C | Sorry, I'd rather read in the reading room today. |

5 题答案字母全部有效、与材料字面对应；答案分布仍为 A×4 / B×4 / C×4 / D×3，与上轮记录一致，未因改动发生位移。

### 7. 有没有引入新的语法错误、超纲词或中式表达？—— **通过**

逐句核过本轮新增/改写的 8 处文本，**无一处语法错误**（时态、主谓一致、冠词、介词全对），无中式表达，改入词均在课标五级内：

- hand it in（材料与题干同步，A2 级）、It will leave ten minutes later（一般将来时，A2）、himself（反身代词，A1）、Ms. Chen（与本文件 Ms. Green / Ms. Wang 命名风格一致）、The bell rang（一般过去时，A2）。
- 材料中既有的 the road is being repaired（被动进行时）、I'd rather read、take it down 均为中学高频表达，无超纲词。

### 8. 情景提示 / 问句 / 考点三者角色方向是否一致？—— **通过（本项目高危项，5 题逐一排查）**

| 题号 | 材料中的提问者 | 问句主语 / 考点所指 | 判定 |
|---|---|---|---|
| A1-03 | Boy（问 Ms. Green） | 问句问 the boy，无人称 | 通过 |
| A1-05 | Boy（问 Mr. Li） | 问句问 Mr. Li；材料 You 指 Boy、him 指 head teacher | 通过 |
| A1-07 | Boy（问 Girl） | 问句问 school bus，第三人称 | 通过 |
| A1-14 | Boy（问 Ms. Chen） | 问句问 book sale，第三人称；You can put two tables 指 Boy | 通过 |
| A1-15 | Girl 提意 → Boy 应答 | 问句 What will the boy do 指 Boy，答案 C 正是 Boy 的选择 | 通过 |

5 题问句均为**第三人称**，无「问句里的 I/my 指考生」或「you/your 指错人」的情形；情景中提问者与应答者未发生互换——A1-15 交换的是**提议方 / 回应方**，考点仍牢牢锁在 Boy 身上，方向正确。

### 9. 超纲词有没有漏网的（题干/选项里的同源生词）？—— **通过**

逐词比对「材料中被改写的那个词」是否在题干、选项留下同源残留：

| 改动词 | 题干 | 选项 | 结论 |
|---|---|---|---|
| hand it in（A1-03） | hand in（同源同义，题干与材料已统一） | Before four this afternoon. | 无残留 |
| It will leave（A1-07） | 无 | At ten past seven. | 无残留 |
| himself（A1-05） | 无 | Speak to the head teacher himself. / Write the note himself. | himself 为 A1 反身代词，非生词 |
| Ms. Chen（A1-14） | 无 | 无 | 无残留 |
| reading room / basketball（A1-15） | the boy、the break | Read in the reading room. / Play basketball with the girl. | 材料与选项用词完全一致 |

另：选项面用词（history project、head teacher、school hall、notice board、playground、reading room）均为教材常见词，未见上表以外的生词。

---

## 三、缺陷

### V-1. A1-15 —— 相邻两轮同一说话人被拆成两行 Girl 标签（轻微 / 格式）

- **位置**：第 198–199 行
- **原文**：

      Girl: Yes. We have forty minutes before the next class.
      Girl: Let's play basketball on the playground.

- **问题**：修复方按 R2 中等 #6 建议对调提议方/回应方时，只替换了第 199–200 行，未处理第 198 行本就存在的 Girl 标签，结果同一角色连续出现两轮，剧本上读起来像笔误。
- **为什么是问题**：不影响答案（C 仍唯一）、不影响角色方向；但破坏本文件「一轮一人」的书写惯例，且脚本实测显示这是 data/item-bank/ 全部 10 个题目文件中**唯一**一处连续同标注，属于本轮改动引入的新瑕疵。
- **成因说明（供下一轮修复参考）**：R2 中等 #6 的建议改法本身只列出被对调的 2 行、未包含第 198 行，修复方照抄即会得到同样结果——不是修复方笔误，是建议改法不完整。
- **建议改法（二选一，只改这一处）**：
  - 方案 A（合并，推荐）：把第 198–199 行合并为一行 —— "Girl: Yes. We have forty minutes before the next class. Let's play basketball on the playground."
  - 方案 B（换人）：第 198 行改为 "Boy: Yes. We have forty minutes before the next class." —— 会让 Boy 在自己的提问后连续两轮发言，不推荐。

---

## 四、遗留未修项（**非本轮引入**，仅登记，不计入本轮发现数）

上轮的 2 条轻微项在本轮未落地，复核确认仍然存在，但**都不是本轮改动造成的**，不作为「修复引入的新缺陷」计数：

| 来源 | 题号 | 内容 | 当前状态 |
|---|---|---|---|
| R2 轻微 L5 | A1-03 | 干扰项 D "In two days." 与 A/B/C 不同类（时长 vs 钟点） | 未修，仍在第 38 行 |
| R2 轻微 L8 | A1-05 | 第 58、60 行标 "Man:"，题干却称 "Mr. Li" | 未修，仍在第 58、60 行 |

（A1-14 的 L12「题干泄露答案 / 排除法可解」属规范 1.1 允许的轻微形态，R2 明确判为设计良好、仅作提示，无需处理。）

---

## 五、复核覆盖证明

已复核题号清单（本轮改动集）：**A1-03、A1-05、A1-07、A1-14、A1-15** —— 5 / 5，覆盖率 100%，无抽样。

另对**全文件 15 题**跑了规范 1.7 的两项相似度扫描（用于验证「是否引入重复轮次」），覆盖 15 题全部 57 个话轮，结果如第 5 条所列。

本轮**未修改** data/item-bank/A1.md 或任何题目文件，唯一写入为本报告 reviews/V-A1.md。
