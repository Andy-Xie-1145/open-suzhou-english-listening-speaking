# 复核报告：prod/C2.md 二轮修复后复核（修复后复核员，独立重读原文）

> 复核人：修复后复核员 ｜ 复核日期：2026-10-03
> 独立性声明：本轮**未读取** `reviews/` 下 R2-C2.md 以外的任何报告、**未读取** `fixes/` 下任何文件（含 `fixes/F2-C2.md`、`fixes/F3-C2.md`）、**未检索** `docs/pipeline/`。所有结论均由本轮自行编写的脚本在磁盘文件上重算得出，**未采信修复方的任何自检结论**。

---

## 0. 前置校验：所见内容与磁盘一致性

| 项 | 值 |
|---|---|
| 审核对象 | `data/item-bank/prod/C2.md` |
| 磁盘 MD5 | `3B982F8178487CCD62CDE60A9ACB07CA` |
| 字节数 | **11889** |
| 字符数 | 11805（UTF-8，含 33 个汉字标题/尾行） |
| BOM | 无（前 3 字节 `35 35 32` = "## "） |
| 行尾 | 纯 LF（LF = 196，CRLF = 0） |
| 结构 | 196 个内容行 + 1 个末尾换行（按 \n 切分为 197 段，末段为空） |
| 回环校验 | UTF-8 解码后再编码，MD5 不变 → 无隐藏字节 |

**一致性核对**：先用 `[System.IO.File]::ReadAllBytes` + MD5 + UTF-8 解码做字节级读取，再用 `read` 工具逐行读取同一文件并比对。
**结论：read 工具所见内容与磁盘逐行一致，唯一差异是末尾换行被 split 产生的空元素（工具返回 196 行，磁盘切分为 197 段）。未发现任何一处文本与磁盘不符。**

> 参考：R2-C2.md 记录的磁盘 MD5 为 `0DDCA5A251A8778C0E04742503E0E1CC`、11825 字节。本轮读到 `3B982F8178487CCD62CDE60A9ACB07CA`、11889 字节，**+64 字节**，与"改了几处文本"的预期一致。

---

## 1. 结论

- **复核题数：25 / 25（逐题复核，未抽样）**
- **通过题数：25 / 25**
- **本轮修复新引入的缺陷：0 条**
- **严重缺陷 1（篇内答案旋转）是否消除：按 R2 的判定口径（5 答案恒定步长）已消除，0 / 5 篇命中**
- **残留观察（非新引入）：2 篇仍有 4 答案恒定步长块，见 §4**
- **C2 是否可归档：可归档**（附一条非阻断性残留说明）

---

## 2. 第一要务：篇内答案旋转 —— 独立穷举验证

### 2.1 读盘后的 25 个答案（逐题 `**Answer**` 行解析所得，非抄写）

```
C2-01  A B C B A
C2-02  B C D A C
C2-03  D C B C D
C2-04  C D A B D
C2-05  A B D A B
全卷    A B C B A ｜ B C D A C ｜ D C B C D ｜ C D A B D ｜ A B D A B
```

### 2.2 基准率独立重算（4^5 = 1024 全空间穷举，本轮自行跑出）

| 模式 | 命中条数 | 单篇随机基准率 |
|---|---|---|
| 步长恒定（任何步长，含 step 0） | **16 / 1024** | 1/64 |
| 步长恒定且为 +1 或 −1（"纯旋转"） | **8 / 1024** | **1/128 = 0.781%** |
| 含 ≥3 个连等步（≥4 字母恒定块） | **112 / 1024** | 0.109 |
| 含 ≥2 个连等步（≥3 字母恒定块） | **592 / 1024** | 0.578 |

8 条纯旋转（本轮穷举输出，非引用）：`ABCDA / ADCBA / BADCB / BCDAB / CBADC / CDABC / DABCD / DCBAD`。

**二项分布本轮复算**：P(≥3 篇纯旋转, p=8/1024) = **4.713e-6**；P(≥2 篇含 4 字母块, p=112/1024) = **0.0955**；P(≥3) = **0.0110**；P(≥4) = **6.53e-4**。
（与 R2 报告的 4.71e-6 一致，说明双方口径相同。）

### 2.3 逐篇步长检测（A=0 B=1 C=2 D=3，mod 4；3 记为 −1）

| 篇 | 答案 | 步长序列 | 5 答案恒定步长？ | 最长连等步 |
|---|---|---|---|---|
| C2-01 | A B C B A | +1, +1, −1, −1 | **否** | 2 |
| C2-02 | B C D A C | +1, +1, +1, +2 | **否** | **3** |
| C2-03 | D C B C D | −1, −1, +1, +1 | **否** | 2 |
| C2-04 | C D A B D | +1, +1, +1, +2 | **否** | **3** |
| C2-05 | A B D A B | +1, +2, +1, +1 | **否** | 2 |

**结论：5 篇中 0 篇存在"5 个答案恒定步长旋转"。R2 判定的严重缺陷 1，在其判定口径下已彻底消除。**

### 2.4 整卷周期检测（p = 2…6，只统计至少 2 对可比对的周期）

| 周期 p | 可比对对数 | 违例数 | 命中？ |
|---|---|---|---|
| p=2 | 23 | 17 | 否 |
| p=3 | 22 | 14 | 否 |
| p=4 | 21 | 14 | 否 |
| p=5 | 20 | 18 | 否 |
| p=6 | 19 | 13 | 否 |

**全卷无任何周期。** ✅

### 2.5 最长连续相同 / 四字母覆盖 / 逐题位置偏斜

| 项 | 结果 | 判定 |
|---|---|---|
| 全卷最长连续相同字母 | **1**（无任何相邻重复） | ✅ |
| 四字母覆盖 | A=6 B=7 C=6 D=6，合计 25 | ✅ 四字母全部用到 |
| Q1 列 | A B D C A → 最高 A 40% | ✅ |
| Q2 列 | B C C D B → 最高 B 40% | ✅ |
| Q3 列 | C D B A D → 最高 D 40% | ✅ |
| Q4 列 | B A C B A → 最高 B 40% | ✅ |
| Q5 列 | A C D D B → 最高 D 40% | ✅ |
| 按题位最高频盲猜 | **10 / 25 = 40%** | ✅ 远低于 70% 阈值 |

**全卷层面完全干净，无扎堆、无偏斜、无缺字母。**

---

## 3. 尾行一致性（本类修复最容易犯的错误）—— 逐位核对通过 ✅

磁盘尾行原文（`ReadAllText` 取出的真实字符串，非截图）：

```
本批答案序列：A B C B A　B C D A C　D C B C D　C D A B D　A B D A B
```

逐篇逐位比对结果：

| 篇 | 逐题 Answer | 尾行对应 5 位 | 结果 |
|---|---|---|---|
| C2-01 | ABCBA | ABCBA | ✅ MATCH |
| C2-02 | BCDAC | BCDAC | ✅ MATCH |
| C2-03 | DCBCD | DCBCD | ✅ MATCH |
| C2-04 | CDABD | CDABD | ✅ MATCH |
| C2-05 | ABDAB | ABDAB | ✅ MATCH |

**尾行解析出 25 个字母，与 25 个 `**Answer**` 行逐位一致，无一错位。尾行未被漏改 —— 这是"只换答案字母"类修复的头号风险点，本轮已确认未发生。** ✅

补充：尾行使用 4 个全角空格（U+3000）分隔 5 篇，格式与本仓库既有约定一致；全文 CJK 仅出现在 5 个 `##` 标题和尾行，材料与题目正文无中文混入。

---

## 4. 改动的 3 处：是否只动了答案标签、选项文本一字未改？—— 是 ✅

把磁盘上这 3 题的 12 个选项行与 R2 报告给出的替换文本做**逐字符串相等**比较：

| 题号 | 结果 |
|---|---|
| C2-01 Q2（A/B/C/D 四行） | **OPTION TEXT IDENTICAL** |
| C2-03 Q2（A/B/C/D 四行） | **OPTION TEXT IDENTICAL** |
| C2-04 Q5（A/B/C/D 四行） | **OPTION TEXT IDENTICAL** |

**只有字母标签与 `**Answer**` 行发生了位移，没有任何一处选项正文被误改，因此不存在"答案与选项错位"的风险。**

三个换过字母的答案仍与各自的正确项对齐：

- **C2-01 Q2 → B**：`The air was colder and the rocks gave out water.` ← 材料 `the air on the hill was much colder, and water came out of the rocks all year round`，字面对应。✅
- **C2-03 Q2 → C**：`Because village paper always shows rivers and bridges.` ← 材料 `the paper in his village is full of rivers and bridges`。✅
- **C2-04 Q5 → D**：`How a nurse made her work easier for old people.` ← 全篇主线（画图 + 放慢语速 + 等回答）。✅

### 4.1 ⚠️ 残留（**不是新缺陷**，但严重缺陷 1 未完全闭合）

R2 严重缺陷 1 的"问题"栏里，除 3 篇 5 答案纯旋转外，**自己还写了**："C2-02 前 4 题亦为 B C D A（+1 旋转，Q5 才断裂）；C2-05 后 3 题为 D A B（+1）。即 5 篇中有 4 篇含 ≥4 字母恒定块。"

而 R2 开的药方只动了 3 个字母（C2-01 Q2、C2-03 Q2、C2-04 Q5），**从未触碰 C2-02**。结果：

- **C2-02 = B C D A C**：Q1–Q4 仍是 `B C D A` 的**严格 +1 旋转**，只有 Q5 才断裂（最长连等步 = 3）。
- **C2-04 = C D A B D**：Q1–Q4 仍是 `C D A B` 的**严格 +1 旋转**，改 Q5 只是把断裂点后移（最长连等步 = 3）。

| 篇 | 5 答案恒定旋转 | 4 字母恒定块 | 套 +1 规则（Q1 做对时）得分 |
|---|---|---|---|
| C2-01 | 否 | 否（2） | 4/5（巧合，非真规则） |
| C2-02 | 否 | **是（B C D A）** | **4/5（真规则）** |
| C2-03 | 否 | 否（2） | 4/5（巧合） |
| C2-04 | 否 | **是（C D A B）** | **4/5（真规则）** |
| C2-05 | 否 | 否（2） | 2/5 |

**判读（本轮立场）：**

1. **统计上已回到随机。** 观测 2/5 含 4 字母块，P(≥2)=0.0955——完全落在随机波动内；原状态的 4/5 对应 P(≥4)=6.5e-4，那个"极小概率"指纹已经消失。
2. **可利用性已大幅下降。** 原来的"肉眼可见整篇在 A→B→C→D 打转"变成了只有 2 篇的**前 4 题**在转、第 5 题断裂；触发门槛从"一看就中"升到"要先做对 Q1 + 注意到只有 4 题在转"。
3. **但漏洞没有归零。** 学生只要在 C2-02 或 C2-04 做对 Q1，仍可用 +1 规则白拿该篇 Q2/Q3/Q4 三题，合计 **6 题**仍有结构可套。

**处置建议：定为"残留 · 非阻断"，不作为归档阻断项。** 若后续做打磨轮，最小侵入的做法是**再各换一个干扰项的字母标签**（不要动正确项的正文），打断 C2-02 Q1–Q4 与 C2-04 Q1–Q4 的 +1 块，同时同步重生成尾行。**本轮不建议为消除一个统计上已属正常的残留而再做一次"换字母"手术**——尾行漏改、选项与答案错位的风险，比残留本身的收益更高。

### 4.2 换字母带来的两处**良性**形式巧合（非缺陷，仅登记）

- **C2-02 与 C2-04 现在是严格 +1 等价序列**：`BCDAC` 每位 +1 = `CDABD`。
- **C2-01 与 C2-03 现在是严格镜像序列**：`ABCBA` 在 A↔D / B↔C 映射下 = `DCBCD`。

两者都**不可利用**（闭卷考试中学生手里没有任一篇的答案，无法跨篇搬运），也不构成任何题的可判性问题。仅作为"答案是被设计出来的、不是被推导出来的"这一事实的痕迹登记在此。

---

## 5. M5 / M6 两条结构泄露：是否真的闭合

### 5.1 M5 — C2-02 Q2（项数不齐）

磁盘上四选项逐项数成分：

| 选项 | 成分拆分 | 项数 |
|---|---|---|
| A | The **date**, the **distance**, the **name of each race** | **3** |
| B | The **weather**, the **time**, the **speed of each run** | **3** |
| C ← 答案 | The **date**, the **distance**, **how she felt** | **3** |
| D | The **judges**, the **prizes**, the **teams of the race** | **3** |

**四项全部 3 个并列成分，项数线索消失 ✅。** 逐个代入材料：
- A 含真实成分 date / distance，但第三项 `the name of each race` 材料零出现 → 否证 ✅
- B 的 weather / time / speed 材料零出现 → 否证 ✅
- D 的 judges / prizes / teams 材料零出现 → 否证 ✅
- C 与材料 `the date, the distance and how she felt` **逐字对应** → 锁定 ✅

**唯一答案成立，未引入二解。**

*微观察（不判缺陷）*：C 的第三项 `how she felt` 是从句，A/B/D 的第三项是名词短语。改前 C 也已经是从句，故非本次引入；且 C 是材料的逐字命中，干扰项全无材料依据，该结构差异不足以支撑误选。

### 5.2 M6 — C2-03 Q4（时态不齐）

磁盘上四选项时态逐个确认：

| 选项 | 时态 | 排除依据（回查材料） |
|---|---|---|
| A `He wants to stop working now that he is old.` | 现在时 | 68 岁仍把剪刀交给"我"、此后剪了三幅带人的窗花 → 与"想停工"相反 ✅ |
| B `He believes faces are impossible to cut.` | 现在时 | `a face is the difficult part`（难 ≠ 不可能），且此后剪出人窗花 → 否证 ✅ |
| C ← 答案 `He takes his time before he changes his art.` | 现在时 | `Tan Bo was quiet for a long time. Then he said…` → 久思后才改 ✅ |
| D `He prefers to work without anybody's advice.` | 现在时 | 设计师提问后他沉默并作出改变 → 与"不要别人的意见"相反 ✅ |

**四项统一为"主语 He + 现在时动词"，时态线索消失 ✅。** 四个选项逐个代入材料仍各自可判，A/B/D 的排除理由与改前完全一致，**未引入二解**。

---

## 6. M3 — C2-04 Q2（材料零覆盖 + 唯一动词短语）

### 6.1 材料是否补上了图画内容

磁盘材料：`That night she began to draw a small picture of how to take the medicine on the label of every bottle she handed out…`

**已补上"图画什么" ✅**，且与正确项 `shows the way to use it` 构成**语义**对应（非逐字对应，仍需一次转述推理，不是照抄字符串）。

### 6.2 四个选项是否同类同构

| 选项 | 结构 | 材料依据 |
|---|---|---|
| A `A small picture that shows the price.` | NP + that-从句 | 材料零出现 → 否证 ✅ |
| B `A small picture that shows the maker.` | NP + that-从句 | 材料零出现 → 否证 ✅ |
| C `A small picture that shows the year.` | NP + that-从句 | 材料零出现 → 否证 ✅ |
| D ← 答案 `A small picture that shows the way to use it.` | NP + that-从句 | ← 材料"how to take the medicine" ✅ |

**四个选项句法完全同类，"唯一的动词短语"这一结构泄露已消除 ✅。区分四个选项所需的信息在材料中已有覆盖 ✅。M3(a)(b) 两处均已落地。**

*微观察（不判缺陷）*：D 的词长为 10，其余三项为 7。跨度 3，学生不会靠数字词长定位答案，且 A/B/C 材料零依据，无实际风险。

---

## 7. M1 / M2 — 材料内部张力是否消解

### 7.1 M1 — C2-01 `the plant had not failed`

磁盘现文：`He understood at last that nothing had gone wrong in his own work; the plant needed cool air and clean water, and a pot in a room could give it neither.`

上文 `Within a week the valley plants were dead, and so were the hill plants.` 与"nothing had gone wrong in his own work"（错不在他的工作）之间**不再冲突** ✅。原文 `the plant had not failed` 已从磁盘上彻底消失（全串检索无命中）。

*连带核对*：Q4 答案 B `He believes careful watching can turn a wrong answer right.` 仍可判——材料独立保留了 `Gao Wei noticed something he had missed before`（他先前漏看了什么）＋ 26 年持续观察，"错误认知被仔细观察纠正"的链条完整。**M1 未削弱 Q4 的材料支撑，答案字母也未变。** ✅

### 7.2 M2 — C2-03 `Most` vs `most often`

磁盘现文：`Many show animals and plants, but he says the paper in his village is full of rivers and bridges, so bridges are what he cuts most often.`

`Many`（较多）与 `most often`（最常）不再构成"多数 = 最常"的字面顶牛 ✅。Q2 题干 `Why does Tan Bo cut bridges more often than animals?` 的立题前提稳固，答案 C 由材料因果句直接支撑 ✅。

---

## 8. 逐题唯一答案复核（25 / 25，逐个干扰项回查材料）

| 题号 | 答案 | 正确项材料依据 | 3 个干扰项各自排除理由 | 唯一？ |
|---|---|---|---|---|
| C2-01-Q1 | A | `Then his teacher took him back to the hill` | B classmates 无据 / C 换专业无据 / D 找工作无据 | ✅ |
| C2-01-Q2 | B | `the air…much colder`＋`water came out of the rocks` | A wind/soil 无据且与"有水"相反 / C warmer/sand 与材料相反 / D soil/plants 无据 | ✅ |
| C2-01-Q3 | C | `only about four hundred` | A/B/D 纯数字，材料中无 | ✅ |
| C2-01-Q4 | B | 26 年持续观察＋"noticed something he had missed before" | A 与"每年仍上山"相反 / C "数完就够了"被"work is slow"否证 / D 无据 | ✅ |
| C2-01-Q5 | A | 全篇弧线：失败→回山→26 年 | B/C/D 三个主题材料均未涉及 | ✅ |
| C2-02-Q1 | B | `no bus went there` | A 11 岁尚未进队 / C 无据 / D 无据 | ✅ |
| C2-02-Q2 | C | 逐字命中 `the date, the distance and how she felt` | A/B/D 第三项均无材料依据 | ✅ |
| C2-02-Q3 | D | `Last autumn she ran her first half-marathon and finished in under two hours` | A 时间错（第二学年）/ B 无据 / C 时间错（This spring） | ✅ |
| C2-02-Q4 | A | `honest about what she could and could not do` | B/C/D 无据 | ✅ |
| C2-02-Q5 | C | 全篇弧线：11 岁起步→市队 | A/B 无据 / D 只是子话题且 Mei Lin 本人否定 | ✅ |
| C2-03-Q1 | D | `drew his first birds on old newspapers` | A 时间错（factory waste paper 是 Later）/ B/C 无据 | ✅ |
| C2-03-Q2 | C | `the paper in his village is full of rivers and bridges, so bridges are what he cuts most often` | A 祖父只"去世"无桥样 / B 无据 / D 设计师问的是"人"不是"桥" | ✅ |
| C2-03-Q3 | B | `Since then he has cut three windows with people in them` | A/C 无据 / D 无据 | ✅ |
| C2-03-Q4 | C | `Tan Bo was quiet for a long time. Then he said…` | A/B/D 见 §5.2 | ✅ |
| C2-03-Q5 | D | 全篇弧线：十岁起剪→四十年持续改变 | A/B 是次要人物/道具 / C 是子话题非主旨 | ✅ |
| C2-04-Q1 | C | `he could not read the instructions on the boxes` | A 纸袋未丢 / B 无据 / D 无据 | ✅ |
| C2-04-Q2 | D | `a small picture of how to take the medicine` | A/B/C 材料零出现 | ✅ |
| C2-04-Q3 | A | `she noticed that old people often said yes too quickly` | B/C 无据 / D 是"认字"不是"认药名" | ✅ |
| C2-04-Q4 | B | 画图＋复述＋放慢语速＋等回答，一整套务实做法 | A 与"11 年未换工作"相反 / C 与做法相反 / D 与"让病人复述"相反 | ✅ |
| C2-04-Q5 | D | 全篇主线：护士为老人改造工作方式 | A 无据 / B 只是纸袋道具 / C 无据 | ✅ |
| C2-05-Q1 | A | `his hands shook too much to hold a pen` | B 无据 / C 无据 / D 时间错（儿子停写是"现在"） | ✅ |
| C2-05-Q2 | B | `she has learnt to ask the right questions` | A/C/D 无据 | ✅ |
| C2-05-Q3 | D | `sixteen years` | A/B/C 纯数字（7 年是送信年数、43 是每天件数） | ✅ |
| C2-05-Q4 | A | `a letter that says only hello makes people worry` | B 无据 / C 与"她代写"相反 / D 与"她亲自送"相反 | ✅ |
| C2-05-Q5 | B | 全篇弧线：日常送信 → 七年承诺 | A 无据 / C 无据 / D 只是日常送货框架，主旨未覆盖"替老人写信" | ✅ |

**25 题全部只有一个最佳答案，未发现二解。** 换过字母的 3 题（C2-01-Q2 / C2-03-Q2 / C2-04-Q5）与改过文本的 4 题（C2-02-Q2 / C2-03-Q4 / C2-04-Q2、C2-04 材料）已全部重新逐项回查，**均未因改动产生二解**。

---

## 9. 词数（本轮空格分词独立计数）

| 篇 | 词数 | 判定 | 距 220 上限余量 |
|---|---|---|---|
| C2-01 | **217** | ✅ | 3 |
| C2-02 | **196** | ✅ | 24 |
| C2-03 | **217** | ✅ | 3 |
| C2-04 | **204** | ✅ | 16 |
| C2-05 | **180** | ✅ | 40 |

**五篇全部落在 150–220 内 ✅。**

两点需要指出的实测偏差（**不影响判定**）：

1. 任务书里"C2-02 尤其紧张"的判断与实测不符 —— C2-02 为 196 词，有 24 词余量，**并不紧张**。真正贴近上限的是 **C2-01（217）与 C2-03（217，各余 3 词）**，后续若再增补材料须优先复核这两篇。
2. R2 报告的自查算术有两处少算 1 词：预测 C2-01 改为 216（实测 217）、预测 C2-04 改为 203（实测 204，因 `of how to take the medicine` 是 6 词而非 5 词）。两处**仍均在区间内**，结论不受影响。

---

## 10. 考点分布（每篇 3 事实 + 1 推断 + 1 主旨）

| 篇 | Q1 | Q2 | Q3 | Q4 | Q5 | 判定 |
|---|---|---|---|---|---|---|
| C2-01 | 事实 | 事实 | 事实 | 推断（What can we learn） | 主旨 | ✅ 3+1+1 |
| C2-02 | 事实 | 事实 | 事实 | 推断（What does … mean） | 主旨 | ✅ 3+1+1 |
| C2-03 | 事实 | 事实 | 事实 | 推断（What can we learn） | 主旨 | ✅ 3+1+1 |
| C2-04 | 事实 | 事实 | 事实 | 推断（What can we learn） | 主旨 | ✅ 3+1+1 |
| C2-05 | 事实 | 事实 | 事实 | 观点（What does … think） | 主旨 | ✅ 3+1+1 |

**5 篇全部满足 3 事实 + 1 推断/观点 + 1 主旨 ✅。**

*改进点*：R2 曾指出 C2-04-Q2 "实为推断"（材料未写图画内容）。M3(a) 补上材料后，该题现在**由材料直接支撑**，是货真价实的事实回查题，C2-04 的考点配比也随之真正达标。

---

## 11. 语法与超纲词：未引入新问题

### 11.1 语法

逐句复读本轮改动的全部英文文本，未发现语法错误、搭配断裂或指代悬空：

- `nothing had gone wrong in his own work; the plant needed cool air and clean water, and a pot in a room could give it neither.` — `neither` 对 `cool air and clean water` 的呼应正确 ✅
- `Many show animals and plants, but he says…` ✅
- `a small picture of how to take the medicine on the label of every bottle` — `of how to take…` 挂 `picture` 正确 ✅
- `A small picture that shows the way to use it.` ✅
- `He wants to stop working now that he is old.` / `He believes faces are impossible to cut.` ✅
- `The weather, the time and the speed of each run.` ✅

撇号全卷统一为直角撇号 `'`（5 处，U+2019 出现 0 次），无直/弯混用 ✅。

### 11.2 超纲词（M4：本轮只登记不修改）

**本轮未改动任何超纲词，已逐词确认：**

| 词 | 期望状态 | 实测 |
|---|---|---|
| county（`county running team`） | 保留 | ✅ 仍在 |
| clinic（`small community clinic`） | 保留 | ✅ 仍在 |
| handwriting（`but handwriting is not`） | 保留 | ✅ 仍在 |
| decoration（`paper is not decoration`） | 保留 | ✅ 仍在 |
| half-marathon（`her first half-marathon`） | 保留 | ✅ 仍在 |
| town running team | 不应出现 | ✅ 未出现 |
| community hospital | 不应出现 | ✅ 未出现 |
| but writing is not | 不应出现 | ✅ 未出现 |

**M4 的处理方式（先补词表、不凭印象改词）与 R2 的建议一致，磁盘状态与之一致 ✅。本轮不重复提出改词建议。**

### 11.3 本轮改动是否引入新超纲词

M5 新增 `speed`、M6 新增 `now that`、M3 新增 `how to take the medicine`、M1/M2 只改既有词。经查均属五级及以下常用词，**未引入新的超纲词** ✅。

---

## 12. M4 登记如实性核对

**约束说明**：按本轮独立性约束，**未打开** `fixes/F2-C2.md` 与 `fixes/F3-C2.md`，因此**无法逐字核对 fixLog 的措辞**。本轮改为对 fixLog 所声称的结果做**实质等价核验**——把磁盘文件与 R2 报告给出的每一条替换文本做字符串级比对，结论如下（可反向验证 fixLog 是否如实）：

| R2 条目 | 建议 | 磁盘实测 | 如实？ |
|---|---|---|---|
| 严重 1 — C2-01 Q2 答案 D→B | 落地 | **Answer B**，选项正文一字未改 | ✅ |
| 严重 1 — C2-03 Q2 答案 A→C | 落地 | **Answer C**，选项正文一字未改 | ✅ |
| 严重 1 — C2-04 Q5 答案 C→D | 落地 | **Answer D**，选项正文一字未改 | ✅ |
| 严重 1 — 尾行重生成 | 落地 | 尾行 25 位与逐题 Answer **逐位一致** | ✅ |
| M1 | 落地 | 新句在，旧句 `the plant had not failed` 已消失 | ✅ |
| M2 | 落地 | `Many` 在，`Most` 已消失 | ✅ |
| M3(a) 材料补图画内容 | 落地 | `of how to take the medicine` 在 | ✅ |
| M3(b) D 改名词短语 | 落地 | `the way to use it` 在，`shows how to use it` 已消失 | ✅ |
| M5 | 落地 | A/B/D 四行与建议逐字相同，答案 C 未动 | ✅ |
| M6 | 落地 | A/B 两行与建议逐字相同，答案 C 未动 | ✅ |
| M4 | **按建议不修改** | 5 个超纲词全保留、3 个替换词全未出现 | ✅ |
| L1（box→bottle） | 未落地 | 3 处 `box` 原样保留（C2-04 段内 box×3 / bottle×2） | 与磁盘一致 |
| L2（Gao Wei's） | 未落地 | `plants like Gao Wei's` 原样保留 | 与磁盘一致 |
| L3（wrong answer） | 未落地 | `turn a wrong answer right` 原样保留 | 与磁盘一致 |
| L4（second year at school） | 未落地 | 原样保留 | 与磁盘一致 |
| L5（mountain village） | 未落地 | 原样保留 | 与磁盘一致 |
| L6（可选整理） | 未落地 | 原样保留（可选项，未做不判缺陷） | 与磁盘一致 |

**判定：磁盘状态与 R2 全部 17 条建议（1 严重 + 6 中等 + 6 轻微，含尾行）**逐条可对应**，无"声称改了但没改"、无"没声称却偷偷改了"的情形。6 条轻微缺陷 L1–L6 为本轮**有意延后**，属修复前的既有状态，非本轮新引入，不计入本轮问题数。**

> 补充登记：仓库中存在 `fixes/F3-C2.md`（第三轮修复记录文件）。若后续还有第三轮改动，本报告的结论只对 MD5 `3B982F8178487CCD62CDE60A9ACB07CA` 的这一版本有效。

---

## 13. 本轮新增缺陷清单

**空。无。**

逐项自查本轮三项改动的副作用：

| 可能的副作用 | 检查结果 |
|---|---|
| 换字母后答案与选项错位 | ✅ 未发生（12 个选项行逐字节比对一致） |
| 换字母后尾行漏改 | ✅ 未发生（25 位逐位一致） |
| M1 改写削弱 Q4 的材料支撑 | ✅ 未发生（`noticed something he had missed before` 独立支撑） |
| M2 改写影响 Q3 干扰项 D（six hundred designs） | ✅ 未发生（该数字句未动） |
| M3(a) 与未做的 L1（box/bottle）冲突 | ✅ 未发生（画图句本就是 bottle，L1 未动，冲突量与改前相同） |
| M5 新建"两个都像"的选项造成二解 | ✅ 未发生（C 为材料逐字命中，A 仅前两项对） |
| M6 时态统一后新排除理由失效 | ✅ 未发生（四项时态与排除理由逐条重查） |
| 改动导致某篇溢出 150–220 | ✅ 未发生（217/196/217/204/180） |
| 改动引入新语法错误 / 新超纲词 | ✅ 未发生 |

---

## 14. 遗留事项（供后续打磨轮，非本轮问题）

| 级别 | 事项 | 说明 |
|---|---|---|
| 残留 · 非阻断 | **C2-02 Q1–Q4（B C D A）与 C2-04 Q1–Q4（C D A B）仍是 4 答案恒定 +1 块** | 严重缺陷 1 按其判定口径已消除；此为 R2 自己列在问题栏、但药方未覆盖的子项。统计上 P(≥2/5)=0.0955 已属随机，可利用性大幅下降但未归零。打磨轮做法见 §4.1。 |
| 轻微 · 既有 | L1 C2-04 道具 box→bottle 未统一（段内 box×3 / bottle×2） | 修复前既有，未改动。 |
| 轻微 · 既有 | L2 `plants like Gao Wei's` 所有格代指 | 修复前既有，未改动。 |
| 轻微 · 既有 | L3 `turn a wrong answer right` 搭配生硬 | 修复前既有，未改动。 |
| 轻微 · 既有 | L4 `In her second year at school` 指代不明 | 修复前既有，未改动。 |
| 轻微 · 既有 | L5 C2-05-Q5 选项 D `mountain village` 材料无据 | 修复前既有，未改动（该项是干扰项，不造成答案泄露）。 |
| 待外部裁决 | M4 超纲词（仓库内无课标五级词表可比对） | 本轮按建议只登记未改词，等官方词表到位后统一裁决。 |

---

## 15. 归档判定

**C2 可以归档。**

依据：

1. **唯一阻断项（严重缺陷 1 篇内答案旋转）在其判定口径下已消除** —— 0/5 篇存在 5 答案恒定步长旋转，全卷无周期、无相邻重复、无位置偏斜、无字母缺失。
2. **本轮修复未引入任何新缺陷** —— 3 处换字母经逐字节验证只动了标签，尾行 25 位逐位一致，6 处文本改写逐条复核未产生二解、未溢出词数、未引入语法或超纲词。
3. **25 题全部唯一可判**，3 事实 + 1 推断 + 1 主旨配比五篇全达标。
4. **M1 / M2 / M3 / M5 / M6 五条中等缺陷全部闭合**，其中 M3(a)(b) 还顺带把 C2-04-Q2 从"排除题"升级为"材料直接支撑的事实题"。
5. **唯一残留（C2-02 / C2-04 的 4 答案 +1 块）统计上已属随机波动**，可利用门槛远高于原状态，不足以作为归档阻断项。

**归档附条件**：若后续做打磨轮，建议一并（a）打断 C2-02 与 C2-04 的 Q1–Q4 +1 块，（b）处理 L1–L5 五条既有轻微缺陷。这两项**均不影响当前归档结论**。

---

## 16. 复核覆盖统计

```
材料 5/5 篇 ｜ 题号 25/25 ｜ 选项 100/100 ｜ Answer 行 25/25
结构标记 ## 5/5 ｜ **Passage** 5/5 ｜ **Qn** 25/25 ｜ 尾行答案序列 1/1（25 位逐位核对）
穷举空间 4^5 = 1024（全空间枚举，非抽样）
```

**本报告只写入 `data/item-bank/reviews/V-C2.md` 一个文件，未修改或创建任何其他文件（题目文件 `prod/C2.md` 全程只读）。**
