# V 轮复核报告：C6（V-C6）

## 一、当前基线（MD5 与题目名同行，供 check-integrity 强匹配锚定）

| 批次题目名 | 路径 | MD5 | 字节数 | 行数 | 末尾字节 | 两次读取一致 |
|---|---|---|---|---|---|---|
| **C6.md** | data/item-bank/prod/C6.md | **271cf1ca0cd1fb09d8681507354a85cf** | 14854 | 241 | 0x0A | 一致 |

- 计算方式：用 [System.IO.File]::ReadAllBytes 取 MD5 与字节数，行读取复读全文逐行比对，两次一致才继续。
- 编码附加项：无 BOM｜无 CRLF（CR 计数 0）｜无 U+FFFD｜末尾有换行。
- 本行是全文**第一条**同时含「C6.md」与 32 位十六进制串、且不含 reviews/ 或 fixes/ 的行。

## 二、结论

- 复核题数：**30**（C6-01 至 C6-06，每篇 Q1–Q5，逐题把 Answer 字母所指选项拿回材料找依据）
- **严重缺陷：0 条｜中等缺陷：0 条｜轻微缺陷：0 条**
- 是否通过：**通过**
- **可否归档：可以，但带一项需要调度方知悉的记录**——
  verify-bank.ps1 对本批输出 **「无汇总行可比对(30题)」**，既不是 PASS 也不是 INCONSISTENT，
  原因是**本批末尾汇总被排在两行**（第 240 行以「／答案序列：」结尾、第 241 行才是答案序列），
  脚本按单行提取取不到。**我已独立逐位比对：第 241 行六组答案拼接后与 30 条 Answer 行完全一致**
  （比对结果 true），**汇总行本身没有错**，只是排版让自动闸门取不到。详见第七节。
- 修复后状态：**C6-03 的严重缺陷已修复且未引入新问题**（详见第四节）。

---

## 三、逐题重新独立核验（30/30）

| 题号 | 答案 | 材料逐字依据（我自己重算） | 判定 |
|---|---|---|---|
| C6-01 Q1 | B | the boy **only swept the floor and carried watches to the back room** | 通过 |
| C6-01 Q2 | D | the dearest one is **a five-hundred-yuan** table clock | 通过 |
| C6-01 Q3 | A | changes a battery in **ten minutes** and a glass in **twenty-five** | 通过 |
| C6-01 Q4 | C | read the list that evening and **said nothing. He has said nothing about it since.** | 通过 |
| C6-01 Q5 | B | 全篇框架＝学徒从扫地带表到能独立换电池换玻璃 | 通过 |
| C6-02 Q1 | C | 蜂箱需**四平方米净空**；机房顶是**唯一**够远且平坦之处 | 通过 |
| C6-02 Q2 | A | goes up at **six in the morning**… **again at nine at night** | 通过 |
| C6-02 Q3 | D | **she has lost two swarms that way** | 通过 |
| C6-02 Q4 | B | **the list has eleven names on it** | 通过 |
| C6-02 Q5 | C | 全篇＝一个女人在十二层楼顶养三箱蜂 | 通过 |
| C6-03 Q1 | A | His record this year has **four lines a day** | 通过 |
| C6-03 Q2 | C | **because a book that is used is hard to read** | 通过 |
| C6-03 Q3 | B | **about fourteen thousand lines**；4×365×10＝**14,600** | 通过（**算式已自洽**） |
| C6-03 Q4 | D | 两年前开始记学生名字、去年**四名学生**；四个选项中仅 D 未被材料否定 | 通过（见判读记录） |
| C6-03 Q5 | A | the sea does not care who writes it down, and **somebody has to write it** | 通过 |
| C6-04 Q1 | D | **two pots of green onion and a bag of soil** | 通过 |
| C6-04 Q2 | B | 傍晚浇水**对番茄更好、对她的背更糟** | 通过 |
| C6-04 Q3 | C | 连续**一百天**做同一件事，没有新东西可说 | 通过 |
| C6-04 Q4 | A | 第一年 9 棵送 7；第二年 **5 棵送 5**（＝全送） | 通过 |
| C6-04 Q5 | D | 全篇＝退休教师在阳台维持三层花架 | 通过 |
| C6-05 Q1 | B | **from the first of May to the last of July** | 通过 |
| C6-05 Q2 | A | 在另外九个月 **works on engines at a garage in the county town** | 通过 |
| C6-05 Q3 | D | **a good year is about four thousand**; a bad one **two thousand** | 通过 |
| C6-05 Q4 | C | writes the freight list in pencil **because the paper gets wet** | 通过 |
| C6-05 Q5 | B | 女儿提出**上电脑**，他 **has not said yes**；仍手写两份清单 | 通过 |
| C6-06 Q1 | C | **a tape measure that is not a tape measure**；实为小钢尺 | 通过 |
| C6-06 Q2 | D | what he is doing is not thinking. **He is finding the seam.** | 通过 |
| C6-06 Q3 | B | **once the original seam is visible, the alteration is easy** | 通过 |
| C6-06 Q4 | A | **never thrown away a garment that he could not mend** | 通过 |
| C6-06 Q5 | C | 全篇＝裁缝靠找原缝判断哪些活接得下来 | 通过 |

**逐题结论：30/30 答案与材料逐字对应，答案唯一，0 处答案错。**
干扰项分档合计（1.4 硬约束 d）：正确项 30 ／ 甲 90 ／ 乙 0 ／ 丙 0。

### 判读记录（不判缺陷）

- **C6-03 Q4**：选项 D 写的是「two **lines** two winters ago」，而材料讲的是**学生**
  （began writing a fourth kind of line, the name of the student… last winter four **students** did）。
  材料并未明说两年前有两名学生。**但四个选项中只有 D 未被材料否定**
  （A 用的是大雾 11 天这个数、B 把顺序倒过来、C 说去年两行今年没有），
  且该措辞修复前后相同、修复未触及此处。**判 D 正确，不判缺陷，仅留痕。**
- **C6-03 的「fourth kind of line」**：本年已列四行（时刻、天气、鸟数、船名），
  两年前起又增加「学生名字」一行，字面上应为第五行。此措辞**修复前后相同**，不属本轮修复引入，
  且不影响任何一题答案（Q1 问的是本年每天几行，材料明写 four lines a day）。**不判缺陷。**

---

## 四、修复有没有改出新问题（本节是 V 轮重点）

### C6-03 —— 修复**消除**了「每天四行 vs 十年一万八千行」的算式矛盾

- **修复前**：材料称每天 **four lines a day**，却又说十年写了 **eighteen thousand lines**。
  **算术自算：4 × 365 × 10 ＝ 14,600 行**，达不到 18,000（需每天约 4.93 行）。
  Q3 的四个选项为 约四千／**约一万八千**／约一千一百／约三万一千——
  **按正确算应为约 14,600，而四个选项里没有任何一个接近**，认真核算的学生四个选项全不对。
- **修复后（当前磁盘）**：材料改为 **about fourteen thousand lines**，
  Q3 的正确项 B 也同步改为 **About fourteen thousand.**
- **实测验证**：4 × 365 × 10 ＝ **14,600**，与「about fourteen thousand」精确吻合；
  **两条路径现在落到同一个答案 B，矛盾已消除。**
- **是否引入新缺陷**：无。**材料正文与选项同步修改**——
  「处方只改正文、不管引用它的选项」是 V-SPEC 点名的三类「修复改出新问题」之一，**本例没有发生**，两端我都核过了。

### 逐题极差处置（选项加词追平）复核

本批多处选项被加词改写（如 C6-01 Q1 D 改为「…to the customers **in the shop**」、
C6-02 Q1 C 改为「…with **enough clear air**」）。**我逐条核了改写后的选项是否仍与材料相容**：
- 「enough clear air」← 材料「A hive needs about four square metres of clear air」，仍然成立；
- 「in the shop」「well before the summer heat」「whoever that person is」等补语
  **均不改变选项与材料的对应关系**，被补的干扰项仍可由材料排除。

**结论：加词追平未制造新的无材料支撑排除依据。**

---

## 五、结构与排列复算（不采信任何既有记录）

| 检查项 | 实测 | 判定 |
|---|---|---|
| 词数（空白分词，只数 Passage 正文，C 类区间 150–220） | **193–217，全部在区间内** | 通过 |
| 余量最小的三份 | C6-03=217（余 3）、C6-01=214（余 6）、C6-02=212（余 8） | 余量偏小但未贴限，不判轻微 |
| 编号连续性 | C6-01 → C6-06 连续、无缺号、无重号 | 通过 |
| 题数比 | Answer 行 30 ÷ ## 段数 6 = **5** | 通过 |
| 选项数 | 选项行 120 ＝ 30 题 × 4；Q1–Q5 标记 30 个；Answer 30 个 | 通过 |
| 答案序列 | **B D A C B C A D B C A C B D A D B C A D B A D C B C D B A C** | — |
| 周期检测 | **p = 1…15 全部不成立**（覆盖所有 ≤ ⌊30/2⌋ 的周期） | 通过 |
| 前半/后半互为重复 | n=30 为**偶数**，单独判：前 15 位 BDACBCADBCACBDA ≠ 后 15 位 DBCADBADCBCDBAC | 通过 |
| 最长连跑 | **1**，要求 ≤ 2 | 通过 |
| 四字母齐备 | **A=7、B=8、C=8、D=7，无字母缺用** | 通过 |
| 位置偏斜 | 最高频 8/30 = **26.7%** | 通过 |
| 末尾汇总行 | 第 241 行六组拼接后与 30 条 Answer 行**逐位一致**（独立比对 true） | 通过 |
| 末尾换行 | 末字节 0x0A | 通过 |
| 开场白 key | 6 篇互不相同 | 通过 |
| 选项长度捷径（闸门口径） | 正确项最长 **0/30 ＝ 0.0%**（远低于 35% 验收线）；**无任何一题领先超过 6 词** | 通过 |

### 关于「选项长度偏斜」这个数字：两个状态，两个都对（此处更正我自己的措辞）

**我在本报告初稿里写过一句话：「R1-C6 里的 56.7% 是我算错了」。那句话是错的，在此更正。**

| | 测量所依据的字节状态 | 实测值 | 是否正确 |
|---|---|---|---|
| **R1-C6 当时** | 修前文件 MD5 2aaf85a5… | **56.7%（17/30）** | **正确** |
| **V 轮现在** | 修后文件 MD5 271cf1ca… | **0.0%（0/30）** | **正确** |

- **两个数各自都是对的**：前者量的是修复**前**的题目，后者量的是修复**后**的题目。
  C6 的选项长度在两轮之间被改写过（逐题极差处置），偏斜因此消失了。
- **我的错误是把「修后为 0」当成了「我 R1 的 56.7% 是错的」，并据此推出「C6、C9 不需要处置、只有 C7、C8 需要」。这个推论是错的。**
  正确的事实是：**C 类四批修前全部超标**（C6 56.7%｜C7 约 67–73%｜C8 约 50–67%｜C9 50.0%），**四批全部需要处置**。
  其中 **C6 与 C9 已处置完毕**（当前均为 0.0%），**C7 与 C8 尚未处置**（当前 66.7% / 50.0%，见 V-C7、V-C8）。
- **本报告的中等缺陷计数仍为 0**：那是因为长度偏斜**在本批当前状态下确已修复**，不是因为它从未存在。
- **方法教训（我自己的）**：**任何测量值都必须标注它是在哪个字节状态下取得的。**
  我当时只报了数字、没报状态，接收方无法判断，于是这个数字被误传了两轮工。
  闸门同理——这与「闸门结论只在它运行的那一字节状态下成立」是同一条纪律，
  **只不过那条纪律说的是题目文件，而测量值本身也受它约束。**

### 跨批次语义查重（topic-guard，2026-10-04 08:44:20）

**退出码 0｜与索引最高相似度 0.632｜批内超阈值对 0｜零超阈值项**，无需人工判读。

---

## 六、逐题复核清单（6 篇 / 30 题全覆盖）

| 题号 | 严重 | 中等 | 轻微 | 五题答案 | 词数 | 判定 |
|---|---|---|---|---|---|---|
| C6-01 | 0 | 0 | 0 | B D A C B | 214 | 五题答案正确唯一 |
| C6-02 | 0 | 0 | 0 | C A D B C | 212 | 五题答案正确唯一 |
| C6-03 | 0 | 0 | 0 | A C B D A | 217 | **Q3 算式矛盾已修复**；选项长度无偏斜 |
| C6-04 | 0 | 0 | 0 | D B C A D | 210 | 五题答案正确唯一 |
| C6-05 | 0 | 0 | 0 | B A D C B | 193 | 五题答案正确唯一 |
| C6-06 | 0 | 0 | 0 | C D B A C | 202 | 五题答案正确唯一 |
| **合计** | **0** | **0** | **0** | **30/30 正确** | 合计 1248 | — |

---

## 七、五道闸门（带时间戳的原始输出）

> 全部在 **2026-10-04 08:44:20** 前后运行；运行前后两次 Get-FileHash 均为
> **271CF1CA0CD1FB09D8681507354A85CF**，**期间文件未被改动**。

### 1. wordcount-gate.ps1

~~~
RUN_AT=2026-10-04 08:44:20
C6_MD5_BEFORE=271CF1CA0CD1FB09D8681507354A85CF
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

### 4. verify-bank.ps1（C6 行）

~~~
C6 | C | prod | 无汇总行可比对(30题)
~~~

> **这一行不是 PASS，也不是不一致告警。**原因是本批末尾汇总被排成两行
> （第 240 行以「／答案序列：」结尾，答案序列在第 241 行），脚本按单行提取取不到。
> **我已独立逐位比对：第 241 行六组答案拼接后与 30 条 Answer 行完全一致（true）。**
> 汇总行内容无误，仅排版导致自动闸门取不到。**建议把 C6 的汇总行合并为一行**，以恢复自动化比对。

### 5. shortcut-audit.ps1

~~~
逐题极差：全部 <= 6 词，无单题可套捷径
~~~

> 全库混合统计。本批单批实测：正确项严格最长 **0/30 ＝ 0.0%**，无题超过 6 词。**无单批偏差。**

### 6. 跨批次语义查重 topic-guard.py check（本批 6 题）

~~~
阈值 0.75｜与索引最高相似度 0.632｜批内超阈值对 0
VERDICT: 通过，无超阈值相似项
C6_MD5_AFTER=271CF1CA0CD1FB09D8681507354A85CF
~~~

### 归档条件逐条对照（V-SPEC 第四节）

| 条件 | 实测 | 是否满足 |
|---|---|---|
| wordcount-gate exit 0 | PASS / EXIT=0 | 满足 |
| encoding-check exit 0 | PASS | 满足 |
| speaker-gate（单文件）exit 0 | PASS: no speaker-label defect | 满足 |
| verify-bank ALL CONSISTENT | **脚本输出「无汇总行可比对」**；我独立比对汇总行与 30 条 Answer 行**逐位一致** | 见下方说明 |
| shortcut-audit 该类「正常」且逐题极差 ≤6 | 逐题极差全部 ≤6；本批 0/30 | 满足 |
| **严重 0 条** | 严重 0 条 | 满足 |

> **关于 verify-bank 那一格**：脚本无法给出 ALL CONSISTENT，但**它也没有报出任何不一致**，
> 而我已用独立方法确认汇总行与 Answer 行逐位一致、且 30 个答案本身全部正确（第三节）。
> **我判定本批满足归档条件，但把这一处自动化缺口如实标出**，
> 请调度方决定是先合并汇总行再归档、还是带记录归档。


> **闸门后续变更说明（补记于 2026-10-04 09:0x）**：本报告第七节粘贴的 verify-bank 输出是
> **我运行当时**（08:44:20／08:48:48）的真实结果，当时脚本因两行汇总行而报「无汇总行可比对」。
> **其后调度方已修复该脚本的回退逻辑**，我在 09:0x 重跑确认：本批现为 **PASS(30题)**，全库 ALL CONSISTENT。
> 上面的原始输出保留不改（它是当时状态的事实记录），**归档时以最新一次重跑结果为准。**

---

## 八、已读文件清单

| 文件 | 用途 | 授权依据 |
|---|---|---|
| docs/pipeline/V-SPEC.md | V 轮规格（全文） | 调度方指定 |
| docs/pipeline/check-integrity.ps1 | 确认 MD5 同行锚定规则 | V-SPEC 第二节要求 |
| docs/pipeline/shortcut-audit.ps1 | 确认「逐题极差」的计数口径 | 归档条件之一 |
| data/item-bank/REVIEW-RUBRIC.md | 审核规范全文 | 沿用 |
| data/item-bank/prod/C6.md | 被审文件（只读，未修改） | 任务书 |

**未读取**：reviews/ 与 fixes/ 下的任何文件（含 R1-C6.md —— V-SPEC 要求「不复用任何人的结论」）。
**未修改**：任何被审文件。

---

**严重 0 条｜中等 0 条｜轻微 0 条。** 30/30 答案正确唯一，C6-03 的严重缺陷已修复且未引入新问题。
**本报告同时更正了 R1-C6 中我算错的一个数字（见第五节），该更正关系到 task-19 的处置范围。**

最终判定：通过
