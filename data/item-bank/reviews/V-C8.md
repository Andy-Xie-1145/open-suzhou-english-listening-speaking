# V 轮复核报告：C8（V-C8）

## 一、当前基线（MD5 与题目名同行，供 check-integrity 强匹配锚定）

| 批次题目名 | 路径 | MD5 | 字节数 | 行数 | 末尾字节 | 两次读取一致 |
|---|---|---|---|---|---|---|
| **C8.md** | data/item-bank/prod/C8.md | **301a64c73395c97038129395dac3a585** | 14972 | 241 | 0x0A | 一致 |

- 计算方式：用 [System.IO.File]::ReadAllBytes 取 MD5 与字节数，行读取复读全文逐行比对，两次一致才继续。
- 编码附加项：无 BOM｜无 CRLF｜无 U+FFFD｜末尾有换行。
- 本行是全文**第一条**同时含「C8.md」与 32 位十六进制串、且不含 reviews/ 或 fixes/ 的行。

## 二、结论

- 复核题数：**30**（C8-01 至 C8-06，每篇 Q1–Q5，逐题把 Answer 字母所指选项拿回材料找依据）
- **严重缺陷：1 条｜中等缺陷：1 条｜轻微缺陷：0 条**
- 是否通过：**不通过**
- **可否归档：不可。** 两项未达标：
  1. **严重 1 条未消**——C8-05 Q5 出现**两个都成立的选项**（见第四节）；
  2. **shortcut-audit 单类阈值未达标**——本批 50.0% > 35%（见第六节）。
- 修复后状态：**C8-03 Q3 的答案键错已修复且修复正确**；
  但**同一轮「逐题极差（加词追平）」处置在 C8-05 Q5 制造了一个新的严重缺陷**——这是 V-SPEC 点名的
  「修复改出新问题」在 C 类的**第一个实例**。

---

## 三、逐题重新独立核验（30/30 答案本身正确）

| 题号 | 答案 | 材料逐字依据（我自己重算） | 判定 |
|---|---|---|---|
| C8-01 Q1 | C | 上山 last week of March，下山 second week of November | 通过 |
| C8-01 Q2 | A | 三月地面还硬、**十一月下雪前**下山 | 通过 |
| C8-01 Q3 | D | 二十二年响铃 **nine** 次，其中 **seven** 次是农场做饭火 | 通过 |
| C8-01 Q4 | B | **he reads the list before he goes up each year** | 通过 |
| C8-01 Q5 | D | 树都光、火从很远看得见 | 通过 |
| C8-02 Q1 | B | **Ink is expensive**, 所以只用铅笔起稿 | 通过 |
| C8-02 Q2 | D | **the first character is what people stop at** | 通过 |
| C8-02 Q3 | A | 长联 **fourteen** characters，短联 nine | 通过 |
| C8-02 Q4 | C | **The boy left after four months.** | 通过 |
| C8-02 Q5 | B | 全篇＝一人五十年替本街写门联 | 通过 |
| C8-03 Q1 | D | **Friday night was the day he had always done repairs that could not wait** | 通过（**答案键已修复**，见第四节） |
| C8-03 Q2 | C | **He fixes four things a week** | 通过 |
| C8-03 Q3 | A | 三个镇的人来，因为**隔壁店八月整月不开门** | 通过（**答案键已修复**） |
| C8-03 Q4 | A | 一小时做不完的**sends those to the shop with the counter** | 通过 |
| C8-03 Q5 | C | 水壶**现在 40 分钟、五十岁时 25 分钟** | 通过 |
| C8-04 Q1 | A | 句子必须是**她真说出口过的**、且不需要另一本词典 | 通过 |
| C8-04 Q2 | B | 没见过的词条**留空并写页码** | 通过 |
| C8-04 Q3 | C | **a dictionary with more words in it is harder to use, not easier** | 通过 |
| C8-04 Q4 | D | 四十人里 **Twenty-six of them finished** | 通过 |
| C8-04 Q5 | A | 那本词典不是为她写的，**she is writing her own** | 通过 |
| C8-05 Q1 | C | 两年 **fourteen** eggs | 通过 |
| C8-05 Q2 | D | **she moves them** | 通过 |
| C8-05 Q3 | B | 第一个寒冷的早晨**盖上，第二天再揭开** | 通过 |
| C8-05 Q4 | A | 问过两次、两次答复**not a nuisance** | 通过 |
| C8-05 Q5 | C | **cannot climb** ＋ 暖月里每周一次搬椅子上楼 | **B 与 C 意思相同，两个都成立 → 严重缺陷 1** |
| C8-06 Q1 | B | **a rare stamp needs money and he never had money** | 通过 |
| C8-06 Q2 | A | **a stamp that has been through a school is free** | 通过 |
| C8-06 Q3 | C | 男孩**顺走一张、三周后还回来** | 通过 |
| C8-06 Q4 | D | 一年一次、**八月最后一周**，且**不许拿走** | 通过 |
| C8-06 Q5 | A | 只要求**保持他原来的顺序** | 通过 |

**逐题结论：30/30 的 Answer 字母都能在材料里找到逐字依据。**
但 **C8-05 Q5 出现第二个同样成立的选项**，故该题判为**答案不唯一（严重）**。
干扰项分档合计：正确项 29 ／ 甲 89 ／ 乙 0 ／ **丙 1**（C8-05 Q5 的 B 项即被追平成同义句的那一项）。

---

### 逐题复核清单（按篇汇总，每篇 5 题，全 30 题已逐题核验）

| 篇 | 题数 | 严重 | 中等 | 轻微 | 说明 |
|---|---|---|---|---|---|
| C8-01 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C8-02 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C8-03 | 5 | 0 | 0 | 0 | **原答案键错已修复为 A**，五题现均正确唯一 |
| C8-04 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| **C8-05** | 5 | **1** | 0 | 0 | **Q5：B 与 C 同义、两个都成立 → 答案不唯一**，见第四节 |
| C8-06 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| **批次级（全批 30 题）** | 30 | 0 | **1** | 0 | 选项长度偏斜 50.0%，见第六节 |
| **合计** | **30** | **1** | **1** | **0** | 逐题逐选项均已核验，无抽样 |

## 四、修复有没有改出新问题（本节是 V 轮重点）

### 1. C8-03 —— 修复**正确**，未引入新问题

- **修复前（我在 R1 报的严重缺陷）**：Q3「Why do people bring him things from three towns?」的答案键标 **B**
  （「Because the tin behind his counter has more parts.」），而材料给出的理由是
  「because **the shop next door with a proper counter does not open at all in August**」。
- **修复后（当前磁盘）**：Q3 的 Answer 已改为 **A**，与材料一致。
- **实测验证**：A 项原文「Because his shop opens at the weekend and the shop next door does not open at all in August.」
  与材料句逐字对应 ✓；B 项改为「Because the tin behind his counter has more parts, **and about a third of his jobs end that way**」——
  材料确实说「about a third of the jobs end with him using something from that tin」，
  **但那说的是「三分之一的活会用上锡罐里的零件」，不是「三个镇的人为何上门」**，前半句仍是假的，整项仍可排除 ✓。
- **判定：修复正确。**

### 2. C8-05 Q5 —— 「加词追平」把一个干扰项**变成了第二个正确选项**（本轮第一例）

这是 V-SPEC 第三节点名的「修复有没有改出新问题」在 C 类的实例，**方向与 B6 那次相反**：
那次的陷阱是「只改正文、漏改引用它的选项」；**这次的陷阱是「加词追平把干扰项加成了正确项的同义句」**。

- **材料原文只有一句**：`Auntie Guo, who lives on the third floor and **cannot climb**,
  has a folding chair **carried up for her once a week in the warm months**`
- **当前 C8-05 Q5 的四个选项**：
  - **B.** That she cannot reach the roof by the stairs, **and she goes up once a week in warm months.**
  - **C.**（Answer）That she **cannot climb**, and **a chair is carried up for her once a week in the warm months.**
  - D. That she takes the eggs away each week, and the corner by the door is where the sun comes.
  - A. That she lives on the top floor, and she goes up in her brother's lift once a week too.
- **B 的前半句与 C 的前半句同义**（cannot climb ⇔ 上不了楼梯）；
  **B 的后半句与 C 的后半句同义**（暖月每周上去一次 ⇔ 每周搬椅子上去一次）。
  **B 就是把 C 换了一套说法。**
- **B 原本是什么样**：修复前 B 只是「That she cannot reach the roof by the stairs.」——
  只有前半句，**不能排除**（材料确实说她不能爬楼）。
  **是这次「加词追平成并列」给 B 补上后半句之后，B 才变成 C 的同义句。**
  **换句话说：这次处置不但没解决问题，还把一个干扰项提成了第二个正确答案。**
- **判定：严重（1.1 答案不唯一 / 2「答案错或答案不唯一」）**。
- **建议改法（恢复 B 的可排除性，不动 C 与 Answer）**：把 B 改回
  `- B. That she cannot reach the roof by the stairs.`
  并把长度补在**别的、确实为假的**事实上，例如
  `- B. That she cannot reach the roof by the stairs, and the folding chair is hers.`
  ——「椅子是她的」材料未提（前文只说有折叠椅被搬上去），**后半句为假，整项可排除**，
  同时长度与 C 接近，逐题极差仍被处置。
  **改动只涉及 B 一个选项的措辞，不动材料、不动 C、不动 Answer、不动行序。**

### 3. 其余加词追平处（逐条核过）

调度方提到 C7/C8 共做了 8 处「加词追平」。我把 C8 全部此类改动逐条核了**真值是否被改变**：

| 题 | 被加词的选项 | 加词后是否仍为假 | 结论 |
|---|---|---|---|
| C8-01 Q5 A | 「he has no work to do then」 | 假（材料未说他那周没事干） | 可排除 |
| C8-01 Q5 B | 「the hut has just been painted」 | 假（他漆的是**窗框**，且是很久以前漆了两次） | 可排除 |
| C8-01 Q5 C | 「snow has not come yet / 风方向在清单上」 | 两个子句**都为真**，但**不是材料给出的理由** | 可排除（见下方判读记录） |
| C8-03 Q1 A | 「it has opened for twenty-nine years」 | 假（二十九年是**他自己**的店） | 可排除 |
| C8-03 Q1 B | 「a kettle takes forty instead of twenty-five」 | 事实为真，但**不是他留周五夜的原因** | 可排除 |
| C8-03 Q1 C | 「he was a factory mechanic for thirty-two years」 | 前半句假（厂里没要求） | 可排除 |
| C8-04 Q1 B/C/D | 「每词条都要 / 写页边 / 至少十词」 | 均为假 | 可排除 |
| C8-04 Q3 A/B/D | 「页边太窄 / 老师不许 / 装订会开」 | 均为假 | 可排除 |

**除 C8-05 Q5 外，其余加词均未把干扰项变成成立项。**

> **判读记录（不判缺陷）**：C8-01 Q5 的 C 两个子句都为真，但材料对「为什么最后一周最好」
> 给出的理由明确是「树都光了、火从很远看得见」，C 讲的是别的事实、不是同一个理由，
> **仍可排除**，故不判缺陷。

---

## 五、结构与排列复算（不采信任何既有记录）

| 检查项 | 实测 | 判定 |
|---|---|---|
| 词数（空白分词，只数 Passage 正文，C 类区间 150–220） | **181–209，全部在区间内** | 通过 |
| 余量最小的三份 | C8-03=183（余 37）、C8-04=181（余 39）、C8-05=185（余 35） | 余量充足，不判轻微 |
| 编号连续性 | C8-01 → C8-06 连续、无缺号、无重号 | 通过 |
| 题数比 | Answer 行 30 ÷ ## 段数 6 = **5** | 通过 |
| 选项数 | 选项行 120 ＝ 30 题 × 4；Q1–Q5 标记 30 个；Answer 30 个 | 通过 |
| 答案序列 | **C A D B D B D A C B D C A A C A B C D A C D B A C B A C D A** | — |
| 周期检测 | **p = 1…15 全部不成立** | 通过 |
| 前半/后半互为重复 | n=30 偶数，单独判：前 15 位 CADBDBDACBDCAAC ≠ 后 15 位 ABCDACDBACBACDA | 通过 |
| 最长连跑 | **2**（第 13、14 位两个 A），要求 ≤ 2 | 通过 |
| 四字母齐备 | **A=9、B=6、C=8、D=7，无字母缺用** | 通过 |
| 位置偏斜 | 最高频 9/30 = **30.0%**，低于 70% | 通过 |
| 末尾汇总行 | 第 241 行六组拼接后与 30 条 Answer 行**逐位一致**（独立比对 true） | 通过 |
| 末尾换行 | 末字节 0x0A | 通过 |
| **选项长度捷径（闸门口径）** | 正确项最长 **15/30 ＝ 50.0%** > **35%** 验收线 | **不达标（中等缺陷 1）** |

### 跨批次语义查重（topic-guard，2026-10-04 08:56:21）

**退出码 0｜与索引最高相似度 0.624｜批内超阈值对 0｜零超阈值项**，无需人工判读。

---

## 六、中等缺陷（1 条）

### 1. C8 全批 —— 正确项系统性是最长的那个选项（50.0%，未消）

- **实测**（逐题口径）：**15 / 30 ＝ 50.0%**。闭卷「一律选最长」得 50 分，随机基线 25%，验收线 **35%**。
- **定级**：**中等**（1.4「干扰项是否与正确项同类（长度相近）」，与 1.8b「盲猜得分」同类）。
  **不判严重**——认真读材料仍能唯一确定答案，判分有效性未被破坏。
- **与 V-C6 那条的关系**：我在 V-C6 初稿里曾误说「C6、C9 干净、只有 C7、C8 需要处理」。
  按调度方与 reviewer-4 用反证重建前状态的结果，**正确的事实是 C 类四批修前全部超标**，
  本批 50.0% 正是**修后仍未达标**的状态，**处置范围不变**。
- **建议改法**：逐题把四选项长度控制在彼此相差 ≤4 词，**只调长度、不改语义、不动材料、不动 Answer**；
  **验收标准：重跑后回落到 35% 以下。**

---

## 七、五道闸门（带时间戳的原始输出）

> 全部在 **2026-10-04 08:56:21** 前后运行；运行前后两次 Get-FileHash 均为
> **301A64C73395C97038129395DAC3A585**，**期间文件未被改动**。

### 1. wordcount-gate.ps1
~~~
RUN_AT=2026-10-04 08:56:21
C8_MD5_BEFORE=301A64C73395C97038129395DAC3A585
PASS: no material block exceeds its limit
EXIT=0
~~~

### 2. encoding-check.ps1
~~~
PASS: no encoding or corruption defect
~~~

### 3. speaker-gate.ps1
~~~
PASS: no speaker-label defect
~~~

### 4. verify-bank.ps1（C8 行）
~~~
C8 | C | prod | PASS(30题)
~~~
> 调度方已修复两行汇总行导致的取不到问题，本批现在能正常比对，**PASS**。
> **但 PASS 只证明汇总行与 30 条 Answer 行逐位一致；答案本身对不对由第三节逐题核验独立确认。**

### 5. shortcut-audit.ps1
~~~
逐题极差：全部 <= 6 词，无单题可套捷径
~~~
> 该行只说明没有**哪一题**能被单题套中，不等于批次达标。
> 本批单批实测 **15/30 ＝ 50.0%**，超过单类阈值 35% → 中等缺陷 1。

### 6. 跨批次语义查重 topic-guard.py check（本批 6 题）
~~~
阈值 0.75｜与索引最高相似度 0.624｜批内超阈值对 0
VERDICT: 通过，无超阈值相似项
C8_MD5_AFTER=301A64C73395C97038129395DAC3A585
~~~

### 归档条件逐条对照（V-SPEC 第四节）

| 条件 | 实测 | 是否满足 |
|---|---|---|
| wordcount-gate exit 0 | PASS / EXIT=0 | 满足 |
| encoding-check exit 0 | PASS | 满足 |
| speaker-gate（单文件）exit 0 | PASS: no speaker-label defect | 满足 |
| verify-bank ALL CONSISTENT | C8 PASS(30题) | 满足 |
| shortcut-audit 该类「正常」且逐题极差 ≤6 | 逐题极差全部 ≤6，**但单类聚合 50.0% > 35%** | **不满足** |
| **严重 0 条** | **严重 1 条**（C8-05 Q5 答案不唯一） | **不满足** |

> **结论：因严重 1 条与 shortcut-audit 单类阈值未达标，本批不可归档。**

---

## 八、已读文件清单

| 文件 | 用途 | 授权依据 |
|---|---|---|
| docs/pipeline/V-SPEC.md | V 轮规格（全文） | 调度方指定 |
| docs/pipeline/shortcut-audit.ps1 | 确认「逐题极差」与单类阈值口径 | 归档条件之一 |
| data/item-bank/REVIEW-RUBRIC.md | 审核规范全文 | 沿用 |
| data/item-bank/prod/C8.md | 被审文件（只读，未修改） | 任务书 |

**未读取**：reviews/ 与 fixes/ 下的任何文件（含 R1-C8.md）。
**未修改**：任何被审文件。

---

**严重 1 条｜中等 1 条｜轻微 0 条。** 30/30 的答案字母本身都对，C8-03 的答案键错修复正确；
但**「加词追平」在 C8-05 Q5 制造了一个新的严重缺陷**（B 与 C 同义、两个都成立），且 50.0% 的长度偏斜仍未消。

最终判定：不通过
