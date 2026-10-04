# 二轮修复后复核报告：prod/C3.md

> 复核员未参与第 1、2 轮修复，未查阅 `reviews/` 下任何其他报告，未查阅 `fixes/` 下任何文件，未检索 `docs/pipeline`。以下全部结论由当前磁盘文件独立推出，不采信修复方的任何自检结论。

## 0. 前置校验

| 项 | 值 |
|---|---|
| 文件 | data/item-bank/prod/C3.md |
| 读取方式 | 字节方式（`[System.IO.File]::ReadAllBytes`） |
| 字节数 | 11557 B |
| MD5 | `453de170a2432d7412230cf680437eaa` ✅ **与预期一致**，所见内容即磁盘内容 |
| 行数 | 196 |

## 1. 结论

- 复核题数：**25（逐题，不抽样）**
- 逐题判定：**25 / 25 通过**（每题正确项均唯一可判、答案行与尾行逐位一致、每题恰好 4 个选项）
- 缺陷：**严重 0 ｜ 中等 2 ｜ 轻微 9 ｜ 仅记录不定级 1**，合计 12 条
- 是否可放行：**否**。二轮四处声明中 3 处成立、1 处（C3-02 的 M1）**未真正闭合**——修复后的文本把布袋与被称重的 180 kg **显式绑定**，与该条要消除的量级矛盾方向相反。C3-05 的考点配比（残留 R1）本轮亦未处理。**建议第 3 轮仅处理这两条中等缺陷。**

---

## 2. 对本批次四处声明的独立验证（不采信其结论）

### 声明 1 ｜M1「未照抄」——**结论：声明与磁盘不符，且该条缺陷未闭合**

修复方称：报告原句会让第 2 句与第 3 句当场互斥，故改写为「布袋只装从箱里取出并交还物主的错放物」，180 kg 只由红箱称量。

逐项核验：

| 核验项 | 独立结果 |
|---|---|
| 是否真的没照抄 | **仅字面不同，实质照抄**。报告原句 `and he now carries two cloth bags for the things he takes out of the box`；磁盘实为 `and the bags are for the wrong things he takes out of the box`。主干结构、指称对象、语义指向完全一致，只把「he now carries」改成「the bags are」，把「the things」改成「the wrong things」。 |
| 声明的「互斥」理由是否成立 | **不成立**。第 3 句 `People should not put used batteries, old medicine or broken lamps in the normal rubbish bin.` 只是在**划定红箱的收纳类别**（这些东西不该进普通垃圾桶，因此该进红箱），从未声称布袋里装的是什么。第 2 句说布袋用于「从箱里取出的错放物」，与第 3 句**完全相容**，不存在当场互斥。 |
| 声明的「交还物主」是否在文内 | **不在**。磁盘第 2 句无「并交还物主」任何表述；「交还物主」出现在第 9 句 `He simply takes each one out and shows it to its owner at the next gate.`，与布袋用途无绑定关系。声明把自己写的文本描述得比实际更完整。 |
| 「180 kg 只由红箱称量」是否成立 | **不成立，见 F1**。 |

**核心问题（F1，中等）**：M1 要消除的是「步行老人 + 两只布袋 vs. 180 kg/周」的量级矛盾。修复后的第 2 句把布袋的用途**锚定在「从箱里取出的错放物」上**，而第 5 句 `the man takes everything out and weighs it` 与第 7 句 `His record for one week is a hundred and eighty kilograms` 所称重的，**正是同一批物**。三句在磁盘上并列可查：

```text
S1  Every Wednesday an old man walks slowly around the block with two cloth bags.
S2  He has done this for six years, and the bags are for the wrong things he takes out of the box.
S5  The box is often full by the end of the week, and the man takes everything out and weighs it.
S7  His record for one week is a hundred and eighty kilograms, ...
```

即：布袋装的就是那 180 kg 的用旧电池、旧药、旧灯。**新句非但没有让重量与布袋脱钩，反而把这条绑定写成了明示**。一位 `walks slowly` 的老人无法用两只布袋搬 180 kg，学生算出量级后仍会怀疑材料——R2 的 M1 原样存活。

- **真正的根因在第 5 句的 `takes everything out`**：只要「一次性把箱内全部东西取出」与「布袋随身携带」并存，量级矛盾就无法消除。
- **建议改法（任选其一，且需重新做等量压缩以守住 214 → ≤220）**：
  1. 把称重对象改为不落袋：`the box is often full by the end of the week, and the city weighs it and tells him the number`（他只被告知数字，重量与布袋彻底脱钩）；或
  2. 明确他分批取、袋内至多一两件：`He never takes more than two of them back at a time, because the weight is too much for the bags.` 并把 180 kg 的归属改成「箱内累计」，而非「他搬走的量」；或
  3. 把 180 kg 改为一件重物的量级，使「步行 + 布袋」在物理上成立。
- **不要采用**：仅把布袋用途改成「从箱里取出的东西」——这正是报告 M1 与本轮修复共同踩中的陷阱。

### 声明 2 ｜M3 采用报告括号中的彻底版——**结论：成立 ✅**

- 磁盘实文：`One week later the family had used one unit less than in the week before.`
- R2 括号称彻底版为 `In that week they had used one unit less than in the week before.`；本轮把主语由 `they` 换成前句已确立的 `the family`，语义等价且先行词更明确。
- **根因确已消除**：比较对象由「表上的累计读数」改为「一段时间的**用电量**」，累计表读数变小这一物理错误消失。全文已无 `the number on the meter … lower` 类表述（脚本扫描 = false）。
- **R2 担心的耦合未发生**：Q2 四个选项 `Ten units less / Exactly the same as / One unit less than / One unit more than the week before` 仍各自可判——A 的「十」材料中不存在；B 被原文否证；D 方向相反；C 是材料中唯一的数量。答案 C 不变，篇内串与尾行不变。
- **副作用已核对**：该替换为 **−1 词**（旧句核心 13 词 → 新句核心 12 词），C3-04 因此由 176 → **175 词**，仍在区间内。R2 曾预计 +1 词（177），实际方向相反但结果无碍。

### 声明 3 ｜连带改动——**部分成立，附带引入 1 处新指代问题**

| 声明 | 独立核验 |
|---|---|
| M1 删掉「一只装电池、另一只装药品」的区分 | ✅ 成立。磁盘材料中已无该区分，Q1 干扰项 A 也确已换为 `He puts it back into the red box.`，不再无所指。 |
| 新干扰项 A 本身是否可判 | ✅ 可排除。材料只出现「取出」与「交还物主」两个方向，无任何「放回红箱」的表述；且 `the box is often full … takes everything out` 与之方向相反。 |
| 四选项格式一致性 | ✅ 四项均为 `He + 动词` 原形，句式统一。 |
| 新建 `prod/C3.meta.md` 承接注释块 | ✅ 成立（见第 10 节）。 |
| 连带改动是否零副作用 | ❌ **不成立**。M1 新增的 `the bags are for the wrong things he takes out of the box` 中的 `the box` 是**前指（cataphora）**：红箱要到第 4 句 `The city has put a small red box at the corner of the block` 才首次引入。修复前的第 2 句为 `He has done this for six years.`，**不含任何前指**。这是本轮新引入的指代瑕疵 → F3。 |

### 声明 4 ｜级联——**成立 ✅**

- M1 + M4 合并落地并配压缩，终点 **C3-02 = 214 词**（脚本按规范口径独立复算，与声明一致），落在 150–220 内，距上限 6 词。
- M4 已落地：`He simply takes each one out and shows it to its owner at the next gate.` —— `each one / it / its owner` 与前句 `many neighbours … a paper cup or a broken phone` 的单复数已完全对齐 ✅。
- M5 已同步尾行：C3-02 Q4 位 A→B，篇内串由 `CBDAC` 改为 `CBDBC`，尾行第 2 组同步为 `C B D B C`，**25 位逐位一致** ✅。
- M2、S1 亦均已落地（见第 7、9 节）。
- 注：修复方所称「配 16 词等量压缩」**无法从 R2 报告反推验证**（R2 只引用了片段、未给出整段原文）。可验证的只有终点 214 词，本报告对终点判定通过。

---

## 3. 必查 1 ｜结构比 5 : 1

脚本统计：

| 项 | 结果 |
|---|---|
| 段数 | **5** |
| Q 标记 | **25**（每篇 5，无缺号无跳号） |
| **Answer** 行 | **25**（每篇 5） |
| 选项行 | **100**（每篇 20 = 5 题 × 4） |
| 题数 ÷ 篇数 | **25 ÷ 5 = 5 : 1** ✅ |

**结论：5 : 1，完全符合 C 类约定 ✅**

## 4. 必查 2 ｜尾行答案序列 vs 逐题 Answer

- 逐题拼接：`BCADACBDBCDBACDACBDACABDC`
- 尾行（本批答案序列：B C A D A　C B D B C　D B A C D　A C B D A　C A B D C）：`BCADACBDBCDBACDACBDACABDC`
- **逐位比对：25 / 25 全等，错位 0、漏位 0** ✅

篇内串：`BCADA | CBDBC | DBACD | ACBDA | CABDC`

## 5. 必查 3 ｜25 题逐个干扰项回查（25 × 3 = 75 项）

### C3-01 会走的水（190 词）

**Q1（B）** 依据 `They came in early every morning, read the number, and wrote it down.`
- A `Once a week, in the school hall.` — 材料无 school hall，无「每周」✅
- C `Twice a day, at noon and after school.` — 只有「清早」，无中午/放学后 ✅
- D `Once a month, on the first day of term.` — 无依据 ✅ → **唯一**，四选项均为「频率 + 地点」同构 ✅

**Q2（C）** 依据 `a tap dripping once a second loses about thirty litres a day.`（逐字）
- A/B/D 三数值材料中均不存在；四项全带 `About` ✅ → **唯一**

**Q3（A）** 依据 `The class went on reading the meter for one more month.`
- B `They waited for winter to check the taps.` — 与 `Before winter came, they also checked every other tap` 时序相反 ✅
- C `They walked to the toilets with the manager.` — 在换龙头**之前** ✅
- D `They counted the cups of water in the school.` — 材料无 ✅ → **唯一**（`every` 弱线索见 F9）

**Q4（D）** 依据 `The four students asked to see the manager, and they walked with him to the toilets. He heard the sound himself`
- A `hoped to win a prize` — 全篇无 prize ✅
- B `planned to sell the water that was lost` — 与「请经理换龙头」反向 ✅
- C `were unhappy with the manager's help` — 被 `a new one fitted the next day` 否证 ✅ → **唯一**

**Q5（A）** 主旨
- B 定价 / C 自建浴室 / D 水表工作原理 — 材料均无 ✅ → **唯一**，四项均为 How + 从句 ✅

### C3-02 楼下的红箱子（214 词）

**Q1（C）** 依据 `He simply takes each one out and shows it to its owner at the next gate.`
- A `He puts it back into the red box.`（本轮新换）— 材料无「放回」，且 `takes everything out` 方向相反 ✅
- B `He writes it in his book with the weight.` — 书记的是**整批重量**，不是单件纸杯 ✅
- D `He leaves it at the gate for a week.` — 与「当场交还」时点冲突 ✅ → **唯一**（正确项语法瑕疵见 F5；格式一致性 ✅）

**Q2（B）** 依据 `His record for one week is a hundred and eighty kilograms`
- A `Less than fifty kilograms.` — 是**第一年**记录，时点错 ✅
- C `About one hundred kilograms.` — 无材料 ✅
- D `More than four hundred kilograms.` — 混淆末句 four hundred **families** ✅ → **唯一**（形式线索见 F4）

**Q3（D）** 依据 `Last year four hundred families learned to use the box correctly`
- A 四十 / B 九十 / C 九百 — 材料唯一家族数即 400 ✅ → **唯一**，四项均 `About + 数词 + families` ✅

**Q4（B）**｜**推断（本轮已改造）** 依据需**跨四句合并**：`He does not get angry.` + `He simply takes each one out and shows it to its owner` + `those short talks` + `four hundred families learned to use the box correctly`
- A `He wants to show that he has done his job well.` — 与 `not because the numbers are important`（他不看重数字成绩）**方向对立** ✅
- C `The city pays him for every kilogram.` — 与 `free of charge` 及上句双重冲突 ✅
- D `His family wants him to collect more.` — 全篇无家庭 ✅ → **唯一，不再是逐字检索题 ✅**

**Q5（C）** 主旨
- A `How a city office measures the rubbish each year.` — 主体是老人，且为周非年 ✅
- B `How two cloth bags can be used every Wednesday.` — 仅覆盖细节，且材料并未描述布袋「如何使用」✅
- D `How old medicine should be given to a shop.` — 无依据 ✅ → **唯一**，四项均 How + 从句 ✅

### C3-03 十六次日出的地方（183 词）— 本轮未改动，仍全量复核

**Q1（D）**｜计算型推断 依据 `about sixteen times in twenty-four hours` → 24 ÷ 16 = 1.5 h = **90 分钟**
- A（24÷8）/ C（24÷6）学生可自行验算排除 ✅；B `About twice in twenty-four hours` 与 sixteen times 直接矛盾 ✅ → **唯一**，四项全带 About ✅

**Q2（B）** 依据 `Every drop is packed in a small bag, and the crew drinks it through a straw.`
- A `From an open cup on a table.` 与 `They do not pour water from a jug` 矛盾 ✅
- C `From a bottle with a wide mouth.` 无依据 ✅
- D `From a pipe fixed to the wall.` — 固定在墙上的其实是**睡袋**（`sleeping bags fixed to a wall`），跨句干扰，优质 ✅ → **唯一**，四项均 From + 名词短语 ✅

**Q3（A）** 依据 `it is never served on a plate, because anything loose would slowly float to the ceiling`
- B `Because there is no table in the station.` 与 `nobody leaves the table` 直接矛盾 ✅
- C `Because the crew eats much faster than usual.` 与 `one of the quietest meals` 矛盾 ✅
- D `Because the plates cannot be washed in space.` 无依据 ✅ → **唯一**，四项均 Because + 从句 ✅

**Q4（C）**｜推断 依据 `the crew first count the boxes together and then sit down to eat at the same time … nobody leaves the table until everyone has finished`
- A 与 at the same time 矛盾 ✅；B 与 count（≠ empty）矛盾 ✅；D 与 quietest meals 矛盾 ✅ → **唯一** ✅

**Q5（D）** 主旨
- A `How the sun moves around the earth each day.` — 材料明说是**空间站**绕地球转、且十六次而非一次；弱干扰项，见 F10
- B `How a supply ship is filled by the crew.` 只覆盖末句 ✅
- C `How the crew grows fresh fruit in space.` 与 `Fresh fruit … are the things they miss most` 语义相反，优质 ✅ → **唯一** ✅

### C3-04 拔掉的插头（175 词）

**Q1（A）** 依据 `they pulled out the plug of every machine in the living room except the fridge`
- B kitchen / C bedroom — 地点错 ✅；D `The old meter on the ground floor.` — 类别错（Building Six 是住户楼）✅ → **唯一**，三项均 `The plug of …` ✅

**Q2（C）** 依据（本轮彻底版）`the family had used one unit less than in the week before`
- A 十单位 — 无材料 ✅；B `Exactly the same as the week before.` — 被原文否证 ✅；D `One unit more` — 方向相反 ✅ → **唯一** ✅

**Q3（B）** 依据逐字 `so that they can answer at once when you press a button`
- A 与首段「待机并非不耗电」方向对立 ✅；C 因果倒置（省电是拔插头的**结果**）✅；D 会制冷的是冰箱且冰箱被 `except the fridge` 排除 ✅ → **唯一**，四项均 `So that + 从句` ✅

**Q4（D）**｜推断 依据 `The family had expected a much bigger number, so the father went back through the old bills in the box and found that the numbers matched.`
- A 与「在意结果、回头翻旧账单核对」矛盾 ✅；B 无依据 ✅；C 与冰箱整周运行矛盾 ✅ → **唯一** ✅（本轮已用 M7 改写，歧义消除 ✅）

**Q5（A）** 主旨：A 核心事件 ✅ / B 人物行为均不符 ✅ / C 只覆盖一句 ✅ / D 无依据 ✅ → **唯一** ✅

### C3-05 树荫下的地面（207 词）

**Q1（C）** 依据 `the playground was eleven degrees hotter than the ground under the tree`
- A = 草地 +2 ✅；D = 墙边 +4 ✅；B `Seven degrees` = 操场−墙边（11−4，学生可自行算出）✅ → **唯一**。全卷质量最高一题：三个干扰项都能在材料中找到真实数字却都不是所问差值 ✅

**Q2（A）** 依据 `at one o'clock, two o'clock, three o'clock and four o'clock` → 四次
- B 一次 / C 两次 — 与四个时间点矛盾 ✅；D `Every half hour from ten to four` — 材料只列四点 ✅ → **唯一** ✅

**Q3（B）** 依据 `Now they measure the same four places every May`
- A `In every July.` — **优质干扰项**：July 是本次测试时间（`last July`），但「再测」是 May，学生须区分两个时间层 ✅；C January / D September — 无依据 ✅ → **唯一**，四项均 `In every + 月份` ✅

**Q4（D）**｜**事实（本轮未改）** 依据 `Nobody in the club had known this before.` — **近乎逐字** ❌ 见 F2
- A 与上句**逐字相反** ✅；B 与 `Now they measure … every May`（仍在坚持）矛盾 ✅；C 同 ✅ → **唯一** ✅

**Q5（C）** 主旨 依据 `Then the teacher showed them how a tree cools the ground … When water turns into gas, it takes heat away from the leaf and from the ground around it.`
- A 只覆盖末句 ✅；B 无关 ✅；D 只覆盖测温部分 ✅ → **唯一**，How/Why 各 2 项 ✅（措辞对齐见 F6）

### 必查 3 小结

**75 个干扰项全部回查材料，未发现第二个同样合理、无法排除的选项 ✅。**

C3-02 与 C3-03 因删除内容而新产生的指代与依据复核结论：
- **C3-02**：`Block Nine` → `the block` 后，第 1 句 `around the block` 与第 4 句 `at the corner of the block` 指称一致 ✅；Q1 新干扰项已有材料指向且可排除 ✅；Q1 正确项与 M4 改写后的 `each one / it / its owner` 同构 ✅。**唯一新增问题是第 2 句 `the box` 的前指（F3）**。
- **C3-03**：本轮无删改，全量复核无新增指代问题 ✅。

## 6. 必查 4 ｜篇内旋转穷举（4⁵ = 1024）

穷举 4 个字母的 5 次方**全部 1024** 个五字母串（集合大小脚本回验 = 1024），与 5 个篇内串逐一比对：

| 篇 | 篇内串 | 是 ABCD 严格 4 旋转？ | 首尾字母相同？ |
|---|---|---|---|
| C3-01 | BCADA | 否 | 否 |
| C3-02 | CBDBC | 否 | 是 |
| C3-03 | DBACD | 否 | 是 |
| C3-04 | ACBDA | 否 | 是 |
| C3-05 | CABDC | 否 | 是 |

- **严格 4 循环形态全集 = 4 种**：ABCDA、BCDAB、CDABC、DABCD（脚本在 1024 枚举中只回收到这 4 个）
- **命中数 = 0 / 5**
- **随机基准率 = 4/1024 = 0.391%**，**期望命中数 = 5 × 0.391% = 0.0195**

**判定：阴性，无恒定旋转 ✅**

篇内局部周期 p=2、p=3：**命中 0 / 5** ✅（样本量 5 篇，随机基准 4⁻³ = 6.25%，期望 0.31，观测 0 低于基准）

## 7. 必查 5 ｜整卷周期 / 扎堆 / 覆盖 / 偏斜 / 盲填

整卷 25 字母序列：`B C A D A C B D B C D B A C D A C B D A C A B D C`

### （a）周期性 p = 2 – 6

| p | 可比较对数 | 成立？ | 不符处数 | 首个不符位 | 概率上界 |
|---|---|---|---|---|---|
| 2 | 23 | 否 | 20 | i=0 | 4⁻²³ = 1.42e-14 |
| 3 | 22 | 否 | 18 | i=0 | 4⁻²² = 5.68e-14 |
| 4 | 21 | 否 | 12 | i=0 | 4⁻²¹ = 2.27e-13 |
| 5 | 20 | 否 | 17 | i=0 | 4⁻²⁰ = 9.10e-13 |
| 6 | 19 | 否 | 16 | i=1 | 4⁻¹⁹ = 3.64e-12 |

**判定：全部阴性 ✅**（每周期可比较 ≥19 对，远超「至少 2 对」门槛）

### （b）扩窗 p = 7 – 13

| p | 可比较对数 | 成立？ | 不符处数 | 随机概率上界 | 若成立可套利题数 |
|---|---|---|---|---|---|
| 7 | 18 | 否 | 13 | 4⁻¹⁸ = 1.46e-11 | 0/18（不成立） |
| 8 | 17 | 否 | 11 | 4⁻¹⁷ = 5.82e-11 | 0/17（不成立） |
| 9 | 16 | 否 | 13 | 4⁻¹⁶ = 2.33e-10 | 0/16（不成立） |
| 10 | 15 | 否 | 14 | 4⁻¹⁵ = 9.31e-10 | 0/15（不成立） |
| 11 | 14 | 否 | 5 | 4⁻¹⁴ = 3.73e-09 | 0/14（不成立） |
| 12 | 13 | 否 | 12 | 4⁻¹³ = 1.49e-08 | 0/13（不成立） |
| 13 | 12 | 否 | 10 | 4⁻¹² = 5.96e-08 | 0/12（不成立） |

**p = 7…13 任一周期成立的概率上界 ≤ 5.96e-08（最松的 p=13）；实际套利收益 = 0 题（无任何周期成立）。**

### （c）最长连续相同

全卷 **1**（相邻相同对 = 0）→「≥3 连扎堆」检测**阴性** ✅

### （d）四字母覆盖

A=6、B=6、C=7、D=6，合计 25。卡方 = **0.120**（df=3，p=0.05 临界 7.815）→ **不显著**，四个字母全部被用作正确答案，**无固定陷阱字母** ✅

### （e）逐题位置偏斜

| 位置 | 字母列 | 众数 | 众数占比 | ≥70%？ |
|---|---|---|---|---|
| Q1 位 | B C D A C | C | 2/5 = 40% | 否 |
| Q2 位 | C B B C A | B | 2/5 = 40% | 否 |
| Q3 位 | A D A B B | A | 2/5 = 40% | 否 |
| Q4 位 | D B C D D | **D** | **3/5 = 60%** | 否 |
| Q5 位 | A C D A C | A | 2/5 = 40% | 否 |

**样本量与基准率**：对 4⁵ = 1024 全枚举得众数分布 {2: 600, 3: 360, 4: 60, 5: 4}，E[众数] = **2.480**，SD = **0.625**。5 个位置众数之和**观测 11**，随机下**期望 12.40**、独立和 **SD = √5 × 0.625 = 1.397** → **z = −1.00**。

即本卷位置集中度**低于**随机基准，方向上与「偏斜」相反。**n = 5 时不足以支撑任何缺陷判定，不成立。**

### 留一法盲填得分率

| 预测方式 | 命中 | 得分率 | 随机基准 |
|---|---|---|---|
| 单位置众数（由其余 4 篇估计） | 3 / 25 | **12.0%** | 25% |
| 全卷字母频率众数（由其余 24 题估计） | 0 / 25 | **0.0%** | 25% |
| 单一最优字母 | — | 24.0%（A/B/D 各 6） | 25% |

**两种留一法盲填均低于 25% 随机基准率，本卷不可通过套规律获利 ✅**

## 8. 必查 6 ｜五篇词数（规范口径复算）

口径：**空白分词计数**（连续非空白字符序列计 1 词）；**只数 Passage 紧邻的正文一行**；**不含**编号标题、题干、A–D 选项、Answer 行、尾行汇总、HTML 注释（本题库无说话人标注，该项 N/A）。

| 篇 | 改后词数 | 区间 150–220 | 相对 R2 |
|---|---|---|---|
| C3-01 会走的水 | **190** | ✅ | 186 → 190（S1 改写 +4 词） |
| C3-02 楼下的红箱子 | **214** | ✅ | 215 → 214 |
| C3-03 十六次日出的地方 | **183** | ✅ | 183（未改） |
| C3-04 拔掉的插头 | **175** | ✅ | 176 → 175（M3 彻底版 −1 词） |
| C3-05 树荫下的地面 | **207** | ✅ | 207（未改） |

**合计 969 词，五篇全部落在 150–220 内 ✅**

> 口径校准说明：R2 预估 S1 修复后 C3-01 为 197 词，实测 +4 而非 +11（`That reading was almost the same as the January one` = 10 词 → `The number rose by only about the same amount as in an ordinary month` = 14 词）。R2 预估 M3 修复后 C3-04 为 177 词，实测 −1（13 → 12 词）。两处偏差方向相反且不影响区间判定，**R2 级联清单的余量估算应以本表为准**。

## 9. 必查 7 ｜材料内部自洽逐项复核

| 复核项 | 结果 |
|---|---|
| **2700 L 乘法**（C3-01） | `loses about thirty litres a day` × `In three months` = 30 × 90 = **2700** = 原文 `close to two thousand seven hundred litres` ✅ **吻合**。`more than twenty small bathtubs` → 2700/20 = 135 L/桶，小浴缸可满足 ✅ |
| **16 次日出 ↔ 90 分钟**（C3-03） | `about sixteen times in twenty-four hours` → 24 ÷ 16 = 1.5 h = **90 分钟** = Q1 选项 D `About once every ninety minutes` ✅ **吻合** |
| **温度层级 0 / +2 / +4 / +11**（C3-05） | 树荫=0、grass field=+2、beside the wall=+4、playground=+11。`The place beside the wall was cooler than the playground` ✅（4 < 11）、`four degrees warmer than the tree` ✅、`two degrees warmer than the tree` ✅、`eleven degrees hotter` ✅。**7 度差（11−4）可由学生自行算出，正是 Q1 干扰项 B** ✅ 层级完全自洽 |
| **累计表矛盾 ①**（C3-01，R2 的 S1） | 第 4 句 `the gap was far larger than any change they had seen before`（Jan→Mar **增量**异常大）与第 10 句 `The number rose by only about the same amount as in an ordinary month`（换新龙头后**增量**恢复正常）——两句比较对象已统一为**增量**，互斥消除 ✅ |
| **累计表矛盾 ②**（C3-04，R2 的 M3） | 比较对象已由「表上读数」改为「一段时间的用电量」✅。脚本确认全文已无 `number on the meter … lower/more` 类表述 ✅ |
| **单复数**（C3-02 第 9 句） | `each one / it / its owner` 与前句 `many neighbours … a paper cup or a broken phone` 对齐 ✅ |
| **因果方向**（C3-04 第 3 句） | `the computer slowly goes to sleep` 与「等信号 / 指示灯常亮」同向 ✅（M2 已闭合） |
| **物名跳换扫描** | `the block`（C3-02）跨句一致 ✅；`the station / the crew`（C3-03）一致 ✅；`Building Six / the fridge / the meter`（C3-04）一致 ✅；`the tree / the playground / the wall / the grass field`（C3-05）一致 ✅；**0 处跳换** |
| **量级矛盾**（C3-02） | ❌ **未消除** → **F1** |

## 10. 必查 8 ｜C3.meta.md 内容审查

全文 18 行，逐行审查：

- 第 3–5 行：来源说明（由 R2 报告 M6 拆出、依据规范 1.6、声明非题面不参与统计）——**审核元数据，非答案、非推理** ✅
- 第 9 行：`篇数：5 ／题目数：25 ／比值：5` —— 即 R2 M6 点名的原注释统计，**纯计数** ✅
- 第 13 行：库内无课标五级官方词表，无法核对，单列备查 —— 说明性文字 ✅
- 第 15–16 行：`thermometer`、`plug` 两个词条 —— **纯词表** ✅
- 第 18 行：指向 R2-C3.md L9 的指针

**结论：内容仅为被移出的注释与统计，不含任何未公开的答案（无答案字母序列、无答案选项文本、无干扰项分析）、不含推理过程 ✅**
题面文件 `prod/C3.md` 中 HTML 注释块计数 = **0**（脚本确认），M6 的删除动作确已落地 ✅

**但存在一处文档完整性瑕疵 → F8**：R2 L9 的存疑词共 10 个（litres、bathtubs、jug、settings、crew、supply ship、kilograms、batteries、thermometer、plug），本文件只列 2 个；其中 **jug、crew、supply ship、kilograms、batteries、litres、bathtubs 七个词当前仍在题面中**却未列出（仅以指针引向审核报告，而审核报告的寿命短于题库），且指针指向的 `settings` 已因 M2 修复而不在题面，**指针内容已部分过时**。

## 11. 必查 9 ｜考点错开核对（逐篇考点类型重判）

| 篇 | Q1 | Q2 | Q3 | Q4 | Q5 | 配比 | 判定 |
|---|---|---|---|---|---|---|---|
| C3-01 | 事实 | 事实 | 事实 | **推断** | 主旨 | 3 / 1 / 1 | ✅ |
| C3-02 | 事实 | 事实 | 事实 | **推断** | 主旨 | **3 / 1 / 1** | ✅ **本轮已由 4/0/1 修正** |
| C3-03 | 计算型推断 | 事实 | 事实 | **推断** | 主旨 | 2 / 2 / 1 | ⚠️ 推断超配 |
| C3-04 | 事实 | 事实 | 事实 | **推断** | 主旨 | 3 / 1 / 1 | ✅ |
| C3-05 | 事实 | 事实 | 事实 | **事实** | 主旨 | **4 / 0 / 1** | ❌ **见 F2** |

- **C3-02 改造核验**：Q4 现需由 `He does not get angry` + `takes each one out and shows it to its owner` + `those short talks` + `four hundred families learned to use the box correctly` **跨句合并**推出，已非单句检索 → **含推断层 ✅ 声明成立**。
- **C3-05 现状确认**：Q1/Q2/Q3 为事实；**Q4 正确项 `They did not know the answer before the talk.` 与原文 `Nobody in the club had known this before.` 近乎逐字，不构成推断** → **确为 4 事实 + 0 推断 + 1 主旨**，修复方的上报属实 ✅。

### 统计严谨性说明

「每篇 3 事实 + 1 推断 + 1 主旨」是**逐篇的确定性符合性规则**（要求每篇至少含 1 道推断题，容差为 0），**不是概率判据**，因此无需也不应引入随机基准率；其判定完全由该篇 5 题的实际考点类型决定，**不依赖样本量推断**。C3-05 的 Q4 为逐字细节题这一点可由文本直接读出，属确定性违反。

作为参照，整卷推断题**总数** = 5 道（C3-01 Q4、C3-02 Q4、C3-03 Q1、C3-03 Q4、C3-04 Q4），恰好等于目标值 25 × (1/5) = 5 ✅。但分布为 {1, 1, 2, 1, 0}——**总数达标带有偶然性，逐篇规则仍被 C3-03（超配）与 C3-05（缺配）两篇违反**。

## 12. 其余必查项

**格式泄露扫描（25 题 × 11 类表层特征自动化 + 人工判读）**：
- **无「唯一带 About」** ✅ —— C3-01 Q2、C3-02 Q3、C3-03 Q1 四项全带 About
- **无「唯一时态」** ✅ —— 25 题选项的时态逐题一致
- **无「唯一词性」** ✅ —— 逐题选项词性与句式结构一致
- **「唯一含数值」** —— 2 处候选，人工判读：C3-03 Q4 为**假阳性**（C 的 `one another` 被数字正则误收）；C3-02 Q2 经复核亦为**假阳性**（四项各含数字，仅数量不同）
- **「唯一缺前置限定词」** —— C3-02 Q2 命中，**真阳性但属规范未点名的第五类** → F4

**重复与雷同扫描**：跨篇 6-gram 完全重复 = **0** ✅；选项文本完全重复 = **0** ✅；开场白归一化后 5 篇首句 key 互不相同（唯一数 = 5）✅；情境互不重合（漏水查表 / 废品回收 / 空间站 / 待机耗电 / 树荫测温）✅

**语法与语体**：逐句通读 5 篇全部句子 —— 时态、主谓一致、单复数、冠词、介词均正确，**未发现语法错误**，无中式英语 ✅（唯一例外为 F5 的选项宾语省略）。

**超纲词**：库内无课标五级官方词表，无法定级，仅备查（F8 已记录）。

---

## 13. 缺陷清单

### 严重缺陷

**无（0 条）。** 两处累计表矛盾相关的算式（2700 L、16 次 ↔ 90 分钟）以及 C3-05 温度层级均自洽；C3-01 / C3-04 的累计表矛盾已消除。

### 中等缺陷（2 条）

#### F1. C3-02 布袋仍与 180 kg 直接绑定 —— 量级矛盾**未闭合**，且被新句写成了明示

- **位置**：C3-02 Passage 第 1、2、5、7 句
- **证据**（磁盘原文，逐句可查）：
  - 第 1 句 `Every Wednesday an old man walks slowly around the block with two cloth bags.`
  - 第 2 句（本轮新增）`He has done this for six years, and the bags are for the wrong things he takes out of the box.`
  - 第 5 句 `The box is often full by the end of the week, and the man takes everything out and weighs it.`
  - 第 7 句 `His record for one week is a hundred and eighty kilograms, ...`
- **为什么是问题**：第 2 句把布袋的用途锚定在「从箱里取出的错放物」，而第 5、7 句中被称重的正是**同一批物**。于是「步行老人 + 两只布袋」承载 180 kg 用旧电池、旧药、旧灯这一物理不可能并未消除，反而由新句固化为明示。M1 的修复目标（「重量只由红箱承担，与布袋脱钩」）**在当前文本中不成立**。
- **定级依据**：属规范 1.2「数字/量级前后讲不通」，且与 R2 的 M1 **属完全同一处、同一类缺陷**，未取得实质进展；沿用 R2 定级为**中等**（非严重：并非两句直接打架，而是量级不合常理，认真读者可绕过）。
- **修复方声明与磁盘不符之处**：①「未照抄」仅字面成立、实质照抄；②「照抄会使第 2 句与第 3 句当场互斥」不成立；③「180 kg 只由红箱称量」不成立；④「布袋只装取出并交还物主的错放物」中的「交还物主」不在第 2 句。
- **建议改法**：见第 2 节「声明 1」给出的三种方案（核心是必须处理第 5 句的 `takes everything out`，或让重量不经由布袋）。

#### F2. C3-05 考点配比 4 事实 + 0 推断 + 1 主旨（残留 R1，本轮未处理）

- **位置**：C3-05 Q4
- **证据**：正确项 D `They did not know the answer before the talk.` 与材料 `Nobody in the club had known this before.` **近乎逐字**；Q1/Q2/Q3 亦为三道事实题 → 全篇 **4 事实 + 0 推断 + 1 主旨**。
- **定级依据**：逐篇配比为**确定性符合性规则**（容差 0，不适用概率基准），C3-05 确定违反；R2 将同型缺陷（C3-02 Q4、C3-05 Q4）定为**中等**，C3-02 一半本轮已闭合，本条性质未变 → **维持中等**。
- **叠加影响**：整卷推断题总数虽为 5（达标），但分布 {1,1,2,1,0}，总数达标具偶然性。
- **建议改法**：仿照 C3-02 Q4 的改造，把 Q4 改为需跨句合并的推断题，例如答案指向 `Now they measure the same four places every May` 与 `the school has decided to plant three young trees` 所体现的**坚持与延续**（而非「此前知不知道」）。**注意**：若答案位改动，须同步尾行并重跑整卷周期检测。

### 轻微缺陷（9 条）

| # | 位置 | 问题 | 说明 |
|---|---|---|---|
| F3 | C3-02 第 2 句 | **本轮新引入的前指（cataphora）**：`the bags are for the wrong things he takes out of the box` 中的 `the box` 在此无先行词，红箱要到第 4 句才引入 | 修复前该句为 `He has done this for six years.`，不含任何前指。不阻断理解（第 4 句立即补上），仅记录；建议改为 `out of the red box` 后置或调整语序 |
| F4 | C3-02 Q2 | 正确项 B `A hundred and eighty kilograms.` 是四项中**唯一没有前置限定词/比较级**的选项（A `Less than`、C `About`、D `More than`） | 属规范未点名的第五类形式线索，不在 About/数值/时态/词性四类之内。**样本量 n = 1**，不足以支撑严重/中等定级，仅记录 |
| F5 | C3-02 Q1 | 正确项 C `He takes it out and shows the owner.` 中 `shows` 为及物动词却无宾语 | M4 改造后未同步润色选项。改为 `He takes it out and shows it to its owner.` 即通顺（+2 词，214 → 216，仍在区间内）。排除功能不受影响 |
| F6 | C3-05 Q5 | 正确项说 `the ground below it`，材料末句落在 `the air under a tree stays cool`（R2 L5 残留） | 中段确有 `takes heat away from … the ground around it`，C 仍是唯一最佳答案；仅措辞未与末句完全对齐 |
| F7 | C3-05 末句 | `plant three young trees on both sides of the playground` 中「三棵」是总数还是每侧三棵有歧义（R2 L6 残留） | 无题问及，不影响任何答案 |
| F8 | C3.meta.md | 存疑词表**不完整且部分过时**：仅列 thermometer、plug；而 jug、crew、supply ship、kilograms、batteries、litres、bathtubs 七个词**当前仍在题面中**却未列出；指针指向的 R2 L9 中 settings 已因 M2 修复而不在题面 | 建议把 7 个在用词补进 meta 文件，并删去 settings；指针改为不依赖审核报告寿命的写法 |
| F9 | C3-01 Q3 | 正确项 A 是四选项中唯一含 `every` 的一类（R2 L1 残留） | 题干含 `for one more month`；干扰项 B 含 `winter`（同样的时间标记）部分抵消。**样本量 n = 1**，不定级 |
| F10 | C3-03 Q5 | 干扰项 A `How the sun moves around the earth each day.` 与开篇两段高度重合（R2 L2 残留） | A 断言「太阳绕地球转」、且 each day 与 sixteen times 冲突，认真读者可排除 → 弱干扰项，不定级 |
| F11 | C3-01 第 10 句 | 措辞累赘：`rose by only about the same amount` 中 only、about、the same 三重弱化叠加 | 属可读范围，不判错；如改为 `rose by only about as much as in an ordinary month`（同词数）更自然 |

### 仅记录、不定级（1 条）

**F12. 正确项偏长**（自动化测量，Q1–Q4，n = 20）

- 正确项为四项中最长者：**13 / 20**（R2 二轮为 11 / 20）
- **样本量 n = 20，随机基准率 = 25%，E = 5.00，SD = 1.936**
  - 原始口径：`P(X ≥ 13) = 1.84e-04`（z = 4.13）→ **原始统计显著**
  - 加「实质性差异」阈值（正确项比次长项 ≥ 3 字符）：降为 **7 / 20**，`P(X ≥ 7) = 0.214`（z = 1.03）→ **不显著**
- **判定：不构成缺陷。** 长度偏长是「正确项引自材料」与「主旨题为概括句」的构造性副作用；规范点名的四类格式泄露全部阴性。**方向上较二轮略有恶化（11→13），但结论不变**；不建议为此改动选项。

---

## 14. 放行判断

| 必查项 | 结论 |
|---|---|
| 1 结构比 5:1 | ✅ 25 ÷ 5 = 5 |
| 2 尾行 vs 逐题 Answer | ✅ 25/25 逐位一致 |
| 3 干扰项唯一可判 | ✅ 75/75，C3-02 Q4 已升级为推断层 |
| 4 篇内旋转（1024 穷举） | ✅ 0/5（基准 0.391%，期望 0.0195） |
| 5 整卷周期 p=2–6 | ✅ 全阴性 |
| 5 整卷周期 p=7–13 | ✅ 全阴性，上界 ≤5.96e-08，套利收益 0 题 |
| 5 最长连续 / 覆盖 / 偏斜 | ✅ 1；A6B6C7D6 卡方 0.120；z = −1.00（低于基准） |
| 6 留一法盲填 | ✅ 12.0% / 0.0%，均低于 25% 基准 |
| 7 词数 | ✅ 190 / 214 / 183 / 175 / 207（合计 969） |
| 8 材料内部自洽 | ⚠️ 2700 L、90 分钟、0/+2/+4/+11 与 7 度差、两处累计表矛盾**均已消除/自洽**；**C3-02 量级矛盾未消除（F1）** |
| 9 C3.meta.md 洁净度 | ✅ 无答案、无推理；**词表不完整（F8）** |
| 10 考点错开 | ⚠️ C3-02 ✅ 已修正；**C3-05 仍 4/0/1（F2）** |

**总判定：不放行，需第 3 轮修复 2 条中等缺陷（F1、F2）。二轮的四处声明中 3 处成立、1 处（声明 1）不成立。**

---

## 15. 已复核题号清单（25 / 25）

| # | 题号 | 结论 | # | 题号 | 结论 | # | 题号 | 结论 |
|---|---|---|---|---|---|---|---|---|
| 1 | C3-01 Q1 | ✅ | 10 | C3-02 Q5 | ✅ | 19 | C3-04 Q4 | ✅ |
| 2 | C3-01 Q2 | ✅ | 11 | C3-03 Q1 | ✅ | 20 | C3-04 Q5 | ✅ |
| 3 | C3-01 Q3 | ✅（F9 记录） | 12 | C3-03 Q2 | ✅ | 21 | C3-05 Q1 | ✅ |
| 4 | C3-01 Q4 | ✅ | 13 | C3-03 Q3 | ✅ | 22 | C3-05 Q2 | ✅ |
| 5 | C3-01 Q5 | ✅ | 14 | C3-03 Q4 | ✅ | 23 | C3-05 Q3 | ✅ |
| 6 | C3-02 Q1 | ✅（F5 轻微） | 15 | C3-03 Q5 | ✅（F10 记录） | 24 | C3-05 Q4 | ⚠️ F2 |
| 7 | C3-02 Q2 | ✅（F4 轻微） | 16 | C3-04 Q1 | ✅ | 25 | C3-05 Q5 | ✅（F6 轻微） |
| 8 | C3-02 Q3 | ✅ | 17 | C3-04 Q2 | ✅ | | | |
| 9 | C3-02 Q4 | ✅（已升级推断） | 18 | C3-04 Q3 | ✅ | | | |

**覆盖证明：C3-01 (5) + C3-02 (5) + C3-03 (5) + C3-04 (5) + C3-05 (5) = 25 题，逐题复核，未抽样。干扰项回查 25 × 3 = 75 项，逐条回查，无遗漏。**

---

*本报告仅写入 data/item-bank/reviews/V-C3.md。未修改 data/item-bank/prod/C3.md、C3.meta.md 或任何其他文件；全程未读取 reviews 下其他报告、fixes 下任何文件，未检索 docs/pipeline。*
