# V 轮复核报告：C9（V-C9）

## 一、当前基线（MD5 与题目名同行，供 check-integrity 强匹配锚定）

| 批次题目名 | 路径 | MD5 | 字节数 | 行数 | 末尾字节 | 两次读取一致 |
|---|---|---|---|---|---|---|
| **C9.md** | data/item-bank/prod/C9.md | **399407bbdfa4c2e0376e97b5ea3f7ba6** | 14413 | 241 | 0x0A | 一致 |

- 计算方式：用 [System.IO.File]::ReadAllBytes 取 MD5 与字节数，行读取复读全文逐行比对，两次一致才继续。
- 编码附加项：无 BOM｜无 CRLF｜无 U+FFFD｜末尾有换行。
- 本行是全文**第一条**同时含「C9.md」与 32 位十六进制串、且不含 reviews/ 或 fixes/ 的行。

## 二、结论

- 复核题数：**30**（C9-01 至 C9-06，每篇 Q1–Q5，逐题把 Answer 字母所指选项拿回材料找依据）
- **严重缺陷：0 条｜中等缺陷：2 条｜轻微缺陷：1 条**
- 是否通过：**不通过（两条中等等级 R1 已报、本轮仍未消）**
- **可否归档：不可。** 两条中等缺陷尚未处置（详见第四节与第六节）。
- 修复后状态：**选项长度偏斜已由 reviewer-4 处置完毕（当前 0.0%）**；
  但 **C9-01 的算式矛盾与 C9-03 Q3 的因果链断裂两条，原文一字未改，仍在。**

---

## 三、逐题重新独立核验（30/30）

| 题号 | 答案 | 材料逐字依据（我自己重算） | 判定 |
|---|---|---|---|
| C9-01 Q1 | D | from the **tenth of November to the tenth of February** | 通过 |
| C9-01 Q2 | B | the bad ones are the **warm days**, when people still want ice | 通过 |
| C9-01 Q3 | C | The oven… holds **six kilos** at a time | 通过 |
| C9-01 Q4 | A | **The square is closed to carts on Sunday morning**, and that is when he washes the cart | 通过 |
| C9-01 Q5 | B | he blames **the slope at the north end of the square rather than the cold** | 通过 |
| C9-02 Q1 | A | he learned all of it **after he lost his sight** | 通过 |
| C9-02 Q2 | C | **Anything else** is a second lesson | 通过 |
| C9-02 Q3 | D | **the phones themselves are all different**（故用盒子＋外面写大字） | 通过 |
| C9-02 Q4 | B | 难的不是按键，而是看不见陌生人**转开的脸** | 通过 |
| C9-02 Q5 | A | 四个学员**都过六十**、且**都不想由自己的孩子教** | 通过 |
| C9-03 Q1 | C | **about the size of a sheet of paper** | 通过 |
| C9-03 Q2 | A | he paints in **the first week of January** | 通过 |
| C9-03 Q3 | B | 题干问 why，材料却说**画与那件事无关** → **推理链断裂（中等缺陷 2）** | 存疑，见下 |
| C9-03 Q4 | D | showed her **four, and then eleven, and then stopped counting** | 通过 |
| C9-03 Q5 | C | 全篇＝一人三十一年每年画同一条街 | 通过 |
| C9-04 Q1 | B | **forty-one plots of three metres by two** | 通过 |
| C9-04 Q2 | D | rota of eight people, **three in the morning and one in the evening** | 通过 |
| C9-04 Q3 | A | 从没人来的地块 **now full of weeds nobody will clear** | 通过 |
| C9-04 Q4 | C | 南瓜 **goes to the table in the yard on the last Sunday** | 通过 |
| C9-04 Q5 | B | 那是**她自己那块地**，上面长了**四种**菜 | 通过 |
| C9-05 Q1 | A | 十盒/盘 × 30/盒 = **about three hundred** | 通过 |
| C9-05 Q2 | C | 茧 **ready after about nine days** | 通过 |
| C9-05 Q3 | B | 留最好二十个 **for the moth case** | 通过 |
| C9-05 Q4 | D | 蛾 **lay on paper, and die within three days** | 通过 |
| C9-05 Q5 | A | **Nothing in the flat is used for anything else now.** | 通过 |
| C9-06 Q1 | C | the shelter is **nine metres** long | 通过 |
| C9-06 Q2 | D | **What changes is the weather** | 通过 |
| C9-06 Q3 | A | She sells nothing and takes **a hat, not a box for money** | 通过 |
| C9-06 Q4 | B | about **eight of them say something** and the rest **look and go** | 通过 |
| C9-06 Q5 | D | she will do the new wall too, and **the view will be the same** | 通过 |

**逐题结论：30/30 的 Answer 字母都能在材料里找到逐字依据，0 处答案错。**
干扰项分档合计：正确项 30 ／ 甲 90 ／ 乙 0 ／ 丙 0。

---

### 逐题复核清单（按篇汇总，每篇 5 题，全 30 题已逐题核验）

| 篇 | 题数 | 严重 | 中等 | 轻微 | 说明 |
|---|---|---|---|---|---|
| **C9-01** | 5 | 0 | **1** | **1** | **烤炉产能与日销量量级矛盾（未修复）**；余量仅 2 词 |
| C9-02 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| **C9-03** | 5 | 0 | **1** | 0 | **Q3 因果链断裂（未修复）** |
| C9-04 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C9-05 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| C9-06 | 5 | 0 | 0 | 0 | 五题答案正确唯一 |
| **合计** | **30** | **0** | **2** | **1** | 逐题逐选项均已核验，无抽样 |

## 四、修复有没有改出新问题（本节是 V 轮重点）

### 已处置且有效：选项长度偏斜

- reviewer-4 已对本批做过选项长度重写（29 处）。
- **实测当前状态：正确项是最长的那个选项 ＝ 0/30 ＝ 0.0%**，远低于 35% 验收线。
- **判定：该项已修复，且未制造新的可套捷径。**

### 已处置且未引入新问题：逐题极差（加词追平）

本批可见的加词处（如 C9-01 Q5 A 补「of that year」、C9-03 Q5 A 补「in the afternoon light in recent years」、
C9-02 Q3 C 补「in different places on every single one」等），我逐条核了真值是否被改变：

| 题 | 被加词的选项 | 加词后是否仍为假 | 结论 |
|---|---|---|---|
| C9-01 Q5 A/C/D | 「第一年那一周」「十九年每周」「周日洗的炉子」 | A/C/D 的归因均**非材料所述** | 可排除 |
| C9-02 Q3 C | 「每一部的按键位置都不一样」 | 材料只说**手机各不相同**，未说按键不同 | 可排除 |
| C9-02 Q5 D | 「手机也装在同一个盒子里」 | 材料未提学员的盒子 | 可排除 |
| C9-03 Q5 A/B/D | 「近几年的下午光」「展览经过」「2009 年与弟弟」 | 均为**插曲/非主旨** | 可排除 |
| C9-04 Q1 C/D、Q2 A/B、Q4 A/B/D、Q5 A/C/D | 「四米见二」「九点」「她留给自己家」「四十一个」「八个名字」「第二颗钉子正上方」 | 均为材料**未提或相反** | 可排除 |
| C9-05 Q5 B/C/D | 「两个阳台」「叔叔每年春天来」「冬天也放阳台」 | 材料未提 | 可排除 |
| C9-06 Q3 B/C/D、Q4 A/C/D、Q5 A/B/C | 「钱盒＋帽子」「画架＋阳伞」「从此再不看」「要她别画」「两根杆会拆」 | 均为材料未提或相反 | 可排除 |

**结论：加词追平在本批没有把任何干扰项变成成立项，也未制造同义重复项。**
（对照：**C8-05 Q5 那一次加词把 B 补成了 C 的同义句**，那是反例，已记入 V-C8 的严重缺陷。）

### 未处置：两条 R1 已报的中等缺陷，原文一字未改

**C9-01 的算式矛盾与 C9-03 Q3 的因果链断裂，本轮读到的仍是原文**，
逐字比对确认与我在 R1-C9 记录的一致，**修复尚未开始**。详见第六节。

---

## 五、结构与排列复算（不采信任何既有记录）

| 检查项 | 实测 | 判定 |
|---|---|---|
| 词数（空白分词，只数 Passage 正文，C 类区间 150–220） | **177–218，全部在区间内** | 通过 |
| 余量最小的三份 | C9-01=218（**余 2**）、C9-04=201（余 19）、C9-03=198（余 22） | C9-01 记轻微 |
| 编号连续性 | C9-01 → C9-06 连续、无缺号、无重号 | 通过 |
| 题数比 | Answer 行 30 ÷ ## 段数 6 = **5** | 通过 |
| 选项数 | 选项行 120 ＝ 30 题 × 4；Q1–Q5 标记 30 个；Answer 30 个 | 通过 |
| 答案序列 | **D B C A B A C D B A C A B D C B D A C B A C B D A C D A B D** | — |
| 周期检测 | **p = 1…15 全部不成立** | 通过 |
| 前半/后半互为重复 | n=30 偶数，单独判：前 15 位 DBCABACDBACABDC ≠ 后 15 位 BDACBACBDACDABD | 通过 |
| 最长连跑 | **1**，要求 ≤ 2 | 通过 |
| 四字母齐备 | **A=8、B=8、C=7、D=7，无字母缺用** | 通过 |
| 位置偏斜 | 最高频 8/30 = **26.7%** | 通过 |
| 末尾汇总行 | 第 241 行六组拼接后与 30 条 Answer 行**逐位一致**（独立比对 true）；verify-bank 亦判 PASS(30题) | 通过 |
| 末尾换行 | 末字节 0x0A | 通过 |
| 选项长度捷径（闸门口径） | 正确项最长 **0/30 ＝ 0.0%**；无题超过 6 词 | **通过（已修复）** |

### 跨批次语义查重（topic-guard，2026-10-04 09:00:55）

**退出码 0｜与索引最高相似度 0.552｜批内超阈值对 0｜零超阈值项**，无需人工判读。

---

## 六、中等缺陷（2 条）与轻微缺陷（1 条）

### 1. C9-01 冬天推车卖烤红薯 —— 烤炉产能与日销量差约 33 倍，量级不自洽（未修复）

- **位置**：第 8 行
- **问题**：同一句群中：`The oven under the cart holds **six kilos** at a time and takes **fifty minutes**`
  与 `a **good day is about two hundred kilos**`。
  **算术自算：200 ÷ 6 ＝ 33.3 炉；33.3 × 50 分钟 ≈ 1,667 分钟 ≈ 27.8 小时。**
  即便烤炉一天二十四小时连轴转，最多也只烤得出 **144 公斤**，仍达不到「好天二百公斤」。
- **为什么是问题**：1.2「材料内部是否自洽」；调度书第 3 条「量级要站得住」。
- **定级（依 §5.1）**：**两条路径落到同一答案**——Q1（卖多久）、Q2（什么日子差）、Q3（炉装几公斤）、
  Q4（为何周日洗车）、Q5（他把左膝归咎于什么），**五题的正确项都与这个吨位无关**，
  **没有任何学生因此吃亏**，故判**中等**，不判严重。
- **建议改法（等长、答案与选项一律不动）**：把第 8 行的
  `a good day is about two hundred kilos and a bad one a hundred`
  改为 `a good day is about thirty kilos and a bad one twenty`
  —— 30 公斤 ＝ 5 炉 × 50 分钟 ≈ 4.2 小时，**下午三点开卖到晚上七点完全来得及**，量级自洽，
  且 A「Two kilos／四 kilos／二十 kilos」仍可由「一次 6 公斤」排除。
  **注意 C9-01 现为 218 词、距 220 上限仅 2 词，改写必须等长或减词。**

### 2. C9-03 每年只画一幅画的老人 Q3 —— 题干问「为什么」，而材料明确否认了唯一选项所主张的因果（未修复）

- **位置**：第 86 行（短文）、第 101–107 行（Q3）
- **问题**：材料：`He says the year without a picture **was** the year he stopped speaking to his brother,
  and that **the painting had nothing to do with it**, though he can understand why people think it does.`
  题干问 **`Why is 2009 the only year without a picture?`**，
  而标为答案的 **B「Because it was the year he stopped speaking to his brother.」**以 Because 开头、
  **主张因果，恰是材料明确否认的那个因果**。
  其余三项（A「那年手开始抖」、C「那年学院要看画」、D「那年光线不平」）**材料均无依据**
  （材料说手抖是**现在**的事，他已 76 岁）。
  **四个选项里没有一个能真正回答题干问的「为什么」。**
- **为什么是问题**：1.1「答案是否必须从材料推出」；_COMMON §5 中等「推理链断裂」。
- **定级说明（请调度方复核）**：材料确实陈述了「2009 年既是空档年也是断交年」这一**时间重合**，
  B 的字面依据存在；但材料紧接着否定了因果。
  **我判中等**：若按「以 Because 开头即主张因果」严格读，B 与材料冲突，可上严重；
  若按「B 只是复述时间重合」宽松读，B 可成立。**两种读法都说得通，我按 §4.5「拿不准标中等」处理。**
- **建议改法（推荐改题干，不动选项、不动 Answer）**：把第 102 行的题干
  `Why is 2009 the only year without a picture?` 改为
  `What does the passage say about 2009?`
  —— 问「材料怎么说」，B 正是材料的原话复述，**答案唯一且无需改动任何选项**。
  **若保留 Why 的问法**，则须把 B 改为不含因果的表述（如「It was also the year he stopped speaking to his brother, though the painting had nothing to do with that.」），
  但这样 B 反而变成长选项、破坏刚修好的长度分布，**不如改题干**。

### 轻微缺陷（1 条）

| # | 题号 | 实测 | 余量 | 提示 |
|---|---|---|---|---|
| 1 | C9-01 | **218 / 220** | **2** | 修中等缺陷 1 时**必须等长或减词**，任何加词都会突破上限 |

---

## 七、五道闸门（带时间戳的原始输出）

> 全部在 **2026-10-04 09:00:55** 前后运行；运行前后两次 Get-FileHash 均为
> **399407BBDFA4C2E0376E97B5EA3F7BA6**，**期间文件未被改动**。

### 1. wordcount-gate.ps1
~~~
RUN_AT=2026-10-04 09:00:55
C9_MD5_BEFORE=399407BBDFA4C2E0376E97B5EA3F7BA6
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

### 4. verify-bank.ps1（C9 行）
~~~
C9 | C | prod | PASS(30题)
~~~
> **PASS 只证明汇总行与 30 条 Answer 行逐位一致**；答案本身由第三节逐题核验独立确认。

### 5. shortcut-audit.ps1
~~~
逐题极差：全部 <= 6 词，无单题可套捷径
~~~
> 本批单批实测：正确项严格最长 **0/30 ＝ 0.0%**，无题超过 6 词。**达标。**

### 6. 跨批次语义查重 topic-guard.py check（本批 6 题）
~~~
阈值 0.75｜与索引最高相似度 0.552｜批内超阈值对 0
VERDICT: 通过，无超阈值相似项
C9_MD5_AFTER=399407BBDFA4C2E0376E97B5EA3F7BA6
~~~

### 归档条件逐条对照（V-SPEC 第四节）

| 条件 | 实测 | 是否满足 |
|---|---|---|
| wordcount-gate exit 0 | PASS / EXIT=0 | 满足 |
| encoding-check exit 0 | PASS | 满足 |
| speaker-gate（单文件）exit 0 | PASS: no speaker-label defect | 满足 |
| verify-bank ALL CONSISTENT | C9 PASS(30题) | 满足 |
| shortcut-audit 该类「正常」且逐题极差 ≤6 | 逐题极差全部 ≤6；本批 0/30 | 满足 |
| **严重 0 条** | 严重 **0** 条 | 满足 |

> **六项归档条件全部满足。**
> 但**两条中等缺陷（§6 第 1、2 条）确实仍未处置**：材料里一处量级算不平、一处题干与材料的因果口径相抵触。
> **这两条不违反「严重 0 条」这一硬条件，按 V-SPEC 属「中等可带条件放行，须逐条列明」的范围。**
> **我的判定：可带条件归档，条件是 §6 的两条按处方修完。**

---

## 八、已读文件清单

| 文件 | 用途 | 授权依据 |
|---|---|---|
| docs/pipeline/V-SPEC.md | V 轮规格（全文） | 调度方指定 |
| docs/pipeline/shortcut-audit.ps1 | 确认「逐题极差」与单类阈值口径 | 归档条件之一 |
| data/item-bank/REVIEW-RUBRIC.md | 审核规范全文 | 沿用 |
| data/item-bank/prod/C9.md | 被审文件（只读，未修改） | 任务书 |

**未读取**：reviews/ 与 fixes/ 下的任何文件（含 R1-C9.md）。
**未修改**：任何被审文件。

---

**严重 0 条｜中等 2 条｜轻微 1 条。** 30/30 答案正确唯一，长度偏斜与加词追平均已妥善处置且未引入新问题；
未消的是 C9-01 的量级矛盾与 C9-03 Q3 的因果链断裂——**两条都是 R1 已报、本轮原文未改的**。

最终判定：不通过
