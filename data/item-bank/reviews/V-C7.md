# V 轮复核报告：C7（V-C7）

## 一、当前基线（MD5 与题目名同行，供 check-integrity 强匹配锚定）

| 批次题目名 | 路径 | MD5 | 字节数 | 行数 | 末尾字节 | 两次读取一致 |
|---|---|---|---|---|---|---|
| **C7.md** | data/item-bank/prod/C7.md | **d53b94b406ac126cdee1050a4655b147** | 15069 | 241 | 0x0A | 一致 |

- 计算方式：用 [System.IO.File]::ReadAllBytes 取 MD5 与字节数，行读取复读全文逐行比对，两次一致才继续。
- 编码附加项：无 BOM｜无 CRLF（CR 计数 0）｜无 U+FFFD｜末尾有换行。
- 本行是全文**第一条**同时含「C7.md」与 32 位十六进制串、且不含 reviews/ 或 fixes/ 的行。

## 二、结论

- 复核题数：**30**（C7-01 至 C7-06，每篇 Q1–Q5，逐题把 Answer 字母所指选项拿回材料找依据）
- **严重缺陷：0 条｜中等缺陷：1 条｜轻微缺陷：0 条**
- 是否通过：**不通过（中等缺陷未消）**
- **可否归档：暂不可。** V-SPEC 第四节六项中，**shortcut-audit 的单类阈值未达标**：
  本批「正确项是最长的那个选项」为 **20/30 ＝ 66.7%**，远高于 35% 验收线（详见第五节与第六节）。
- 修复后状态：**C7-03 的严重缺陷已修复且确实「消除」了矛盾，不是制造矛盾**（详见第四节，含调度方点名的那条）。

---

## 三、逐题重新独立核验（30/30）

| 题号 | 答案 | 材料逐字依据（我自己重算） | 判定 |
|---|---|---|---|
| C7-01 Q1 | A | the dial only means something after the set has been on **about ten minutes** | 通过 |
| C7-01 Q2 | C | stood in a cupboard… **for eleven years** | 通过 |
| C7-01 Q3 | B | the station **two thousand kilometres** away sends its reading **at nine** | 通过 |
| C7-01 Q4 | D | a **broken set hums** and an **off station is silent** | 通过 |
| C7-01 Q5 | A | 全篇＝男孩为电台记读数，爷爷也记了十一年 | 通过 |
| C7-02 Q1 | D | the **chain** gets thin… the **brake blocks** get small… the **pedal ends** go flat | 通过 |
| C7-02 Q2 | B | He charges **eight yuan** for a full service | 通过 |
| C7-02 Q3 | A | not because people ride less, **but because they ride further**；最近像样的车铺在 **four kilometres** 外 | 通过 |
| C7-02 Q4 | C | the **frame was sound** and one wheel needed **a new spoke** | 通过 |
| C7-02 Q5 | B | 全篇＝四十一年修车师傅看什么、收多少 | 通过 |
| C7-03 Q1 | C | 剩面包 nine 点送到 **the door of the primary school** | 通过 |
| C7-03 Q2 | A | made once a day, at **two in the morning**, and there are **ninety loaves by six** | 通过 |
| C7-03 Q3 | D | by the way they **look at the shelf first, before they look at her** | 通过 |
| C7-03 Q4 | B | never sold a thing that was **not baked in that building**, and **this is the only rule** | 通过 |
| C7-03 Q5 | D | **the queue for the red bean bun reached the corner**, and she did not make more than **ninety** | 通过（**修复后唯一**，见第四节） |
| C7-04 Q1 | B | a coach in that pool **only ever taught the shallow end** | 通过 |
| C7-04 Q2 | D | never held by the arms; **held under the chest, so that the arms stay free** | 通过 |
| C7-04 Q3 | C | not that the pool closed… but that more children came **with an adult on each side** | 通过 |
| C7-04 Q4 | A | he wrote down the names of children who could not yet swim and **one of the mothers filled them in** | 通过 |
| C7-04 Q5 | C | a list is only useful **if you can still read it** | 通过 |
| C7-05 Q1 | A | a shop on his street **gave away its packing cases** | 通过 |
| C7-05 Q2 | B | A car takes him about **forty minutes** | 通过 |
| C7-05 Q3 | D | made **seventy-four** last year and **gave sixty-one** away | 通过 |
| C7-05 Q4 | C | **a child must be able to reach the floor**，高度固定不改 | 通过 |
| C7-05 Q5 | A | 全篇＝老人用丢弃的纸箱做玩具车 | 通过 |
| C7-06 Q1 | C | there is **no room in the van for a bicycle** as well | 通过 |
| C7-06 Q2 | D | the cakes go in first **because they are light and nothing can be put under them** | 通过 |
| C7-06 Q3 | A | If he finds the bag still there on the way back, he knows **it was not taken** | 通过 |
| C7-06 Q4 | B | wrote a new time on the same bag **six times in one morning** | 通过 |
| C7-06 Q5 | D | **a shop that cannot open is not his business** | 通过 |

**逐题结论：30/30 答案与材料逐字对应，答案唯一，0 处答案错。**
干扰项分档合计（1.4 硬约束 d）：正确项 30 ／ 甲 90 ／ 乙 0 ／ 丙 0。

---

### 逐题复核清单（按篇汇总，每篇 5 题，全 30 题已逐题核验）

| 篇 | 题数 | 严重 | 中等 | 轻微 | 说明 |
|---|---|---|---|---|---|
| C7-01 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C7-02 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C7-03 | 5 | 0 | 0 | 0 | **Q5 的严重缺陷已由修复消除**，答案唯一 |
| C7-04 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C7-05 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C7-06 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| **批次级（全批 30 题）** | 30 | 0 | **1** | 0 | 选项长度偏斜 66.7%，见第六节 |
| **合计** | **30** | **0** | **1** | **0** | 逐题逐选项均已核验，无抽样 |

## 四、修复有没有改出新问题（本节是 V 轮重点）

### C7-03 —— 调度方点名的那一处：修复是**消除**矛盾，不是制造矛盾

调度方明确提醒：有人把「被拒清单里没有红豆包、但末句说红豆包排队长到拐角」判为材料不自洽，**那是误报**。
我按要求把**改动前后两份都摆出来**看，结论是：**那次改动正是为了消除矛盾，改后材料自洽，不判缺陷。**

| | 被拒清单的第三项 | 末段的红豆包 | 是否矛盾 |
|---|---|---|---|
| **改动前** | a **sweet bun with red bean** in it | queue for the **red bean bun** reached the corner | **矛盾**：同一件东西既被拒绝又在排队热销；Q5 的 A/C/D 三项都有逐字依据，无法排除任何一个 |
| **改动后（当前磁盘）** | a **roll with olives** in it | queue for the **red bean bun** reached the corner | **不矛盾**：被拒的是橄榄卷，红豆包是正常在售品 |

- **当前 Q5 逐项复核**：清单第三项已换成橄榄卷，**红豆包不在清单上**。
  - A「It is the kind Auntie Mo refuses to bake, and her bread is made at two in the morning」→ 前半句**为假**（不在清单上），合取式不成立 ✓ 可排除
  - B「takes longest to make…」→ 材料未提耗时，**无依据** ✓ 可排除
  - C「Auntie Mo has written it on her refused list…」→ **为假** ✓ 可排除
  - D「brings a queue, but she still did not bake more than ninety that day」→ **材料直接陈述** ✓ 唯一正确
- **判定：这是「修复消除矛盾」的教科书案例。修复有效，未引入新缺陷。**
  **若有人在本轮再把 C7-03 报成「材料不自洽」，那是把已消除的矛盾当成新问题重复上报，属误报。**

### 逐题极差处置（选项加词追平）复核

本批 A/B/C 三个选项都被追加了「, and her bread is made at two in the morning」。
**我逐条核了加词是否改变了选项的真值**：
- 追加的子句本身**为真**（面包确实是凌晨两点做），但 A、C 的**前半句为假**、B 的前半句无依据，
  **三个选项的合取式仍然全为假**，真值未被改变 ✓
- 未出现「加词后某个原本为假的干扰项变成可成立」的情况。

**结论：加词追平未制造新的无材料支撑排除依据。**

---

## 五、结构与排列复算（不采信任何既有记录）

| 检查项 | 实测 | 判定 |
|---|---|---|
| 词数（空白分词，只数 Passage 正文，C 类区间 150–220） | **187–211，全部在区间内** | 通过 |
| 余量最小的三份 | C7-03=211（余 9）、C7-06=211（余 9）、C7-02=208（余 12） | 余量充足，不判轻微 |
| 编号连续性 | C7-01 → C7-06 连续、无缺号、无重号 | 通过 |
| 题数比 | Answer 行 30 ÷ ## 段数 6 = **5** | 通过 |
| 选项数 | 选项行 120 ＝ 30 题 × 4；Q1–Q5 标记 30 个；Answer 30 个 | 通过 |
| 答案序列 | **A C B D A D B A C B C A D B D B D C A C A B D C A C D A B D** | — |
| 周期检测 | **p = 1…15 全部不成立**（覆盖所有 ≤ ⌊30/2⌋ 的周期） | 通过 |
| 前半/后半互为重复 | n=30 为**偶数**，单独判：前 15 位 ACBDADBACBCADBD ≠ 后 15 位 BDCACABDCACDABD | 通过 |
| 最长连跑 | **1**，要求 ≤ 2 | 通过 |
| 四字母齐备 | **A=8、B=7、C=7、D=8，无字母缺用** | 通过 |
| 位置偏斜 | 最高频 8/30 = **26.7%** | 通过 |
| 末尾汇总行 | 第 241 行六组拼接后与 30 条 Answer 行**逐位一致**（独立比对 true） | 通过 |
| 末尾换行 | 末字节 0x0A | 通过 |
| **选项长度捷径（闸门口径）** | **正确项最长 20/30 ＝ 66.7%**，远高于 **35%** 验收线；无单题超过 6 词 | **不达标（中等缺陷 1）** |

### 跨批次语义查重（topic-guard，2026-10-04 08:48:48）

**退出码 0｜与索引最高相似度 0.621｜批内超阈值对 0｜零超阈值项**，无需人工判读。

---

## 六、中等缺陷（1 条）

### 1. C7 全批 —— 正确项系统性是最长的那个选项（66.7%，未消）

- **位置**：全批 30 题
- **实测**（逐题口径：正确项长度 − **同一题内**最长干扰项长度 > 0 即计一次）：
  **20 / 30 ＝ 66.7%**。闭卷学生「一律选最长的选项」可得 **66.7 分**，随机基线 25%，**验收线 35%**。
- **为什么是问题**：REVIEW-RUBRIC 1.4「干扰项是否与正确项同类（词性一致、结构一致、**长度相近**）」；
  与 1.8b「盲猜得分」同类。**分布均衡不等于判分不可套规律。**
- **定级**：**中等**。**不判严重**——认真读材料仍能唯一确定答案，**判分有效性未被破坏**，只是多了一条捷径。
- **与调度方更正的关系**：我在 R1-C6 误报的 56.7% 是我的计算错误；**本批 66.7% 是按正确逐题口径量出的，站得住**。
  按正确口径，**C7 与 C8 确实超标，C6 与 C9 干净**，处置范围以那两条为准。
- **建议改法（与调度方定的验收线一致）**：逐题改写使四选项长度彼此相差 ≤4 词，
  **只调整长度、不改任何选项的语义、不动材料、不动 Answer**。
  **验收标准：重跑后「一律选最长」得分回落到 35% 以下。**

---

## 七、五道闸门（带时间戳的原始输出）

> 全部在 **2026-10-04 08:48:48** 前后运行；运行前后两次 Get-FileHash 均为
> **D53B94B406AC126CDEE1050A4655B147**，**期间文件未被改动**。

### 1. wordcount-gate.ps1
~~~
RUN_AT=2026-10-04 08:48:48
C7_MD5_BEFORE=D53B94B406AC126CDEE1050A4655B147
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
> 本批为短文体，无说话人标注要求；我另行核对 6 篇均无 # 元数据区块、无过程记录区块。

### 4. verify-bank.ps1（C7 行）
~~~
C7 | C | prod | 无汇总行可比对(30题)
~~~
> 与 C6 同因：本批末尾汇总也排在两行（第 240 行以「／答案序列：」结尾，答案序列在第 241 行），脚本按单行提取取不到。
> **我已独立逐位比对：第 241 行六组拼接后与 30 条 Answer 行完全一致（true）。汇总行内容无误。**

### 5. shortcut-audit.ps1
~~~
逐题极差：全部 <= 6 词，无单题可套捷径
~~~
> **该行只说明「没有哪一题能被单题套中」，不等于批次达标。**
> 按脚本自身的单类阈值（35%），本批单批实测 **20/30 ＝ 66.7%**，**未达标** → 中等缺陷 1。
> 这也正是调度方先前指出的「全库混合会把单类偏差稀释」的同类情形：脚本末尾那行「全部 ≤6」掩盖了批次层面的 66.7%。

### 6. 跨批次语义查重 topic-guard.py check（本批 6 题）
~~~
阈值 0.75｜与索引最高相似度 0.621｜批内超阈值对 0
VERDICT: 通过，无超阈值相似项
C7_MD5_AFTER=D53B94B406AC126CDEE1050A4655B147
~~~

### 归档条件逐条对照（V-SPEC 第四节）

| 条件 | 实测 | 是否满足 |
|---|---|---|
| wordcount-gate exit 0 | PASS / EXIT=0 | 满足 |
| encoding-check exit 0 | PASS | 满足 |
| speaker-gate（单文件）exit 0 | PASS: no speaker-label defect | 满足 |
| verify-bank ALL CONSISTENT | 脚本「无汇总行可比对」；我独立比对**逐位一致** | 见说明 |
| shortcut-audit 该类「正常」且逐题极差 ≤6 | 逐题极差全部 ≤6，**但单类聚合 66.7% > 35%** | **不满足** |
| **严重 0 条** | 严重 0 条 | 满足 |

> **结论：因 shortcut-audit 单类阈值未达标，本批暂不可归档**；其余条件均满足。


> **闸门后续变更说明（补记于 2026-10-04 09:0x）**：本报告第七节粘贴的 verify-bank 输出是
> **我运行当时**（08:44:20／08:48:48）的真实结果，当时脚本因两行汇总行而报「无汇总行可比对」。
> **其后调度方已修复该脚本的回退逻辑**，我在 09:0x 重跑确认：本批现为 **PASS(30题)**，全库 ALL CONSISTENT。
> 上面的原始输出保留不改（它是当时状态的事实记录），**归档时以最新一次重跑结果为准。**

---

## 八、已读文件清单

| 文件 | 用途 | 授权依据 |
|---|---|---|
| docs/pipeline/V-SPEC.md | V 轮规格（全文） | 调度方指定 |
| docs/pipeline/shortcut-audit.ps1 | 确认「逐题极差」与单类阈值的口径 | 归档条件之一 |
| data/item-bank/REVIEW-RUBRIC.md | 审核规范全文 | 沿用 |
| data/item-bank/prod/C7.md | 被审文件（只读，未修改） | 任务书 |

**未读取**：reviews/ 与 fixes/ 下的任何文件（含 R1-C7.md —— V-SPEC 要求「不复用任何人的结论」）。
**未修改**：任何被审文件。

---

**严重 0 条｜中等 1 条｜轻微 0 条。** 30/30 答案正确唯一，C7-03 的严重缺陷**确实消除了矛盾、未引入新问题**；
唯一未消的是全批 66.7% 的选项长度捷径。

最终判定：不通过
