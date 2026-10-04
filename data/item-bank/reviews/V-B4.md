# 修复后复核报告：B4.md 二轮修复（V-B4）

> 复核对象：`data/item-bank/prod/B4.md`（当前磁盘版）
> 复核依据：`data/item-bank/reviews/R2-B4.md`（二轮报告，仅此一份）
> 独立性声明：本轮**未**读取 reviews 下任何其他报告、**未**读取 fixes 下任何文件、**未**对 docs/pipeline 做任何检索（仅按必查项要求**执行**了 `docs/pipeline/wordcount-gate.ps1`，未读取其源码）。所有结论均由本轮独立重读原文、重新计数、重新计算得出，**未采信修复方的自检结论**。

## 0. 字节级读取与 MD5 核对（所见 = 磁盘）

先用 `[System.IO.File]::ReadAllBytes` 做字节读取并计算 MD5，再用行读取工具复读全文比对，两次结果一致。

| 文件 | 字节数 | 行数 | MD5 | 与行读取工具一致 |
|---|---|---|---|---|
| `data/item-bank/prod/B4.md` | 9,297 | 167 | `599490b69589c58246b5bdb9e86d2c49` | ✅ 一致 |
| `data/item-bank/reviews/R2-B4.md` | 30,460 | 421 | `f0c5fe856e4a49e42226bebcbc6a26ac` | ✅ 一致 |

**基线对照**：R2 报告记录的审核前基线为 MD5 `75e0ff7ff30fe41d3c2aede45a9a1f93` / 9,633 字节。当前文件 MD5 已变化、字节减少 336 字节，**确认修复确已落盘**。本轮全部判定以当前磁盘文件为准。

---

## 1. 结论

- 复核题数：**12**（6 段 × 2 题，逐题逐选项核对，未抽样）
- 通过题数：**12**（12/12 均满足「有且仅有一个完全正确选项」与「材料内部自洽」两项硬指标）
- 发现问题题数：**3**（B4-02 Q2、B4-06 Q1、B4-06 Q2），**全部为轻微级，不构成不通过**
- 另发现 **2 项申报/流程问题**（F1、F2），均不改动答案
- 严重缺陷：**0** 条｜中等缺陷：**0** 条｜轻微：**3** 条｜流程申报：**2** 条
- 修复方声明的两项（M1 已修、裁剪未丢选项依据）**均已独立证实成立**；同时发现**一处未申报的越界改动（B4-06）**与**一处词数申报数字错误**。

**最终判定：通过（无严重、无中等）。** 可直接进入下一环节；F1/F2 与 3 条轻微项建议择机一并处理，但**均不构成返工理由**。

---

## 2. 必查项速览

| # | 必查项 | 结果 | 详见 |
|---|---|---|---|
| 1 | 结构比 2:1（12 题 ÷ 6 段），每段 2 题 | **PASS** | §3 |
| 2 | 跑 `docs/pipeline/wordcount-gate.ps1` | **PASS**（原文见 §4.1） | §4 |
| 3 | 12 题逐选项代入验证 + 裁剪段依据可定位 | **PASS**（45/45 锚点逐字命中） | §5、§6 |
| 4 | 6 段时间链与数字运算重算 | **PASS** | §7 |
| 5 | 说话人标注/称谓一致；悬空并列全卷扫描 | **PASS**（0 处悬空） | §8 |
| 6 | Q1/Q2 考点不同；裁剪未破坏推理链 | **PASS** | §9 |
| 7 | 答案序列：周期/连号/四字母覆盖/位置偏斜 | **PASS**（四项全阴） | §10 |
| 8 | 开场白归一化、结尾 key 唯一性、话轮相似度、相邻同说话人 | **PASS**（阈值 0.6 下 0 命中） | §11 |

---

## 3. 结构比（题数比门禁）

程序化计数：

| 指标 | 计数 |
|---|---|
| `## 段标题` | **6**（B4-01 … B4-06，编号连续无缺号无重号） |
| `**Q1**` 标记 | 6 |
| `**Q2**` 标记 | 6 |
| `**Answer**` 行 | **12** |
| 选项行（`- A.` … `- D.`） | **48** = 12 × 4 |

**比值 = 12 ÷ 6 = 2.0**，与 B 类「1 段对话配 2 题」吻合。逐段核对：**6 段每段恰好 2 题**，无一段多配或少配。

文件末尾汇总行 `段数：6 ／题目数：12 ／比值：2` 与实测一致。

**PASS。**

---

## 4. 词数门禁（必查项 2 —— 本批次刚做过大幅裁剪，重点复验）

### 4.1 门禁脚本实测输出（原样粘贴）

```text
PS> & docs/pipeline/wordcount-gate.ps1
PASS: no material block exceeds its limit
PS> $LASTEXITCODE
0
```

加 `-Verbose` 与 `-WhatIf` 各跑一次，输出一致，均为该单行 PASS，退出码 0。**词数门禁 PASS。**

### 4.2 本轮独立复算（不依赖门禁，自行双口径计数）

口径 A（**剥离说话人标注**，按空白分词）；口径 B（**保留说话人标注**，按空白分词，即修复方与 R2 报告中争论过的「标注计 2 词」口径）。两个口径一并给出，用以消除 R2 遗留的口径分歧。

| 段 | 口径A（剥离标注） | 口径B（含标注） | 上限 200 余量（取更严的 B） | R2 记录值（A / B） | A 变化 | B 变化 |
|---|---|---|---|---|---|---|
| B4-01 | 180 | 195 | +5 | 194 / 209 | **−14** | **−14** |
| B4-02 | 178 | 191 | +9 | 195 / 208 | **−17** | **−17** |
| B4-03 | 179 | 195 | +5 | 186 / 202 | **−7** | **−7** |
| B4-04 | 173 | **197** | **+3** | 190 / 214 | **−17** | **−17** |
| B4-05 | 182 | 195 | +5 | 198 / 211 | **−16** | **−16** |
| B4-06 | **171** | 193 | +7 | 169 / 191 | **+2** | **+2** |

**结论**：

1. **修复方「另有裁剪」的声明属实**——B4-01 至 B4-05 五段实测确有 −7 至 −17 词的削减，且修复方给出的裁剪前数值（209/208/202/214/211）与 R2 报告 §8 表格第 4 列（保留标注、空白分词、标注计 2 词）**逐个吻合**，交叉印证成立。
2. **裁剪后两套口径全部合规**：口径 A 最紧余量 +18（B4-04 173），口径 B 最紧余量 **+3（B4-04 = 197）**。R2 担心的「若全库采用保留标注口径则 5 段超限」的批次级风险**已消除**。
3. **⚠️ 但 B4-06 是 +2 词，不是 0。** 详见 §12 的 F1。
4. 余量风险提示（**当前不构成缺陷**）：**B4-04 仅剩 3 词余量**（口径 B），是全卷最紧的一段；后续任何微调都应先复算。

---

## 5. 逐题逐选项代入验证（必查项 3）

判定方法：对每题的 A/B/C/D 四个选项，逐字回原文检索其**依据**（有据）或**反证**（可排除）。

### 5.1 裁剪段（B4-01 … B4-05）选项依据的逐字可定位性复验

对修复方声明「不得丢失」的 11 组依据 + 其余共 **45 个锚点**做程序化逐字检索：

```text
锚点总数 = 45   缺失 = 0
```

| 声明要求保留的依据 | 当前原文 | 位置 |
|---|---|---|
| 45 元 | `Three hours at fifteen yuan is only forty-five yuan.` | B4-05 话轮 7 |
| 6h×15 | `…from ten in the morning until four in the afternoon, so six hours, at fifteen yuan an hour.` | B4-05 话轮 3 |
| three hours（三处） | `no more than three hours a week` / `That is exactly three hours.` / `Three hours at fifteen yuan…` | B4-05 话轮 4、6、7 |
| permission in writing | `you need your parents' permission in writing` | B4-05 话轮 6 |
| form must stay at the school office | `the form must stay at the school office` | B4-05 话轮 6 |
| letter for the head teacher | `I'll write you a letter for the head teacher.` | B4-05 话轮 8 |
| Saturday 属周末 | `may work only at weekends`（+ `a job on Saturdays`） | B4-05 话轮 4、3 |
| show the same slides | `I'll show the same slides in my classroom.` / `the same slides` | B4-04 话轮 8、10 |
| cannot be moved | `I'm afraid it cannot be moved` | B4-04 话轮 8 |
| 七点下班 | `on Fridays I often don't finish until seven o'clock.` | B4-04 话轮 3 |
| 会议 16:30 到 18:00 | `The meeting starts at half past four and usually ends about six` | B4-04 话轮 4 |

**11 组依据 100% 逐字保留，无一丢失。修复方的核心承诺成立。**

### 5.2 12 题 × 4 选项逐条判定

| 题号 | 选项 | 判定 | 依据 / 反证（逐字） |
|---|---|---|---|
| **B4-01 Q1**<br>下月社团时间<br>标答 **C** | A | ✗ 排除 | 材料 `from next month the club will meet on **Thursday** afternoon` —— 星期错 |
| | B | ✗ 无据 | `at four o'clock` 在本段**不出现**（B4-03 的 `four o'clock` 属另一段，不可跨段取证） |
| | **C** | ✓ **有据** | `meet on Thursday afternoon instead` + `meets in Room 302 at **half past four**`（时刻由 turn 3 承接，`instead` 只换日不换时） |
| | D | ✗ 无据 | `half past three` 全卷未出现于本段 |
| **B4-01 Q2**<br>错过班车之因<br>标答 **B** | A | ✗ 反证 | `It's **only** a five-minute walk to the bus stop` |
| | **B** | ✓ **有据** | `but we clean the room for **ten minutes** after the club` |
| | C | ✗ 反证 | `I've **left** your class five minutes **early**`（早退非晚退，且「晚五分钟」亦不能解释「经常」错过） |
| | D | ✗ 无据 | Mr. Li 全段只说换日，`stay for questions` 无出处 |
| **B4-02 Q1**<br>同组同学周二去向<br>标答 **D** | A | ✗ 无据 | `not feeling well` 全卷无此说 |
| | B | ✗ 无据 | `parents' meeting` 只出现在 B4-04 |
| | C | ✗ 无据 | `city museum` 全卷无 |
| | **D** | ✓ **有据** | `two girls… are going to **music class**, and the three boys are **playing in the school football match**` |
| **B4-02 Q2**<br>值日如何了结<br>标答 **A** | **A** | ✓ **有据** | `I'll **move** your name to Friday's line. You'll clean with **Group One**` |
| | B | ✗ 排除 | `Mr. Xu doesn't need to sign anything.`（该选项已被教师当场否掉） |
| | C | ✗ 排除 | 教师明确改判到周五；且 `My bus only gets me here at ten to eight`（**表述有瑕疵，见 V-L1，但排除结论不依赖它**） |
| | D | ✗ 反证 | 规则是「找同学替我」，非「我替同学做」；且 `All five busy?` 无人可替 |
| **B4-03 Q1**<br>何时知结果<br>标答 **C** | A | ✗ 反证 | `The list was **closed** last Friday`（名单已截止，不会周五出结果） |
| | B | ✗ 反证 | 学生自述的错误猜测 `I thought the new list would go up on Tuesday` 被教师当场纠正 `It goes up on **Monday**` —— **该依据逐字完好，未被裁剪波及** |
| | **C** | ✓ **有据** | `The club teacher decides on **Monday morning**` |
| | D | ✗ 排除 | 周三仅 `The club meets on Wednesday afternoons`（活动日，非公布日） |
| **B4-03 Q2**<br>借相机的义务<br>标答 **A** | **A** | ✓ **有据** | `you must **sign your name in the book by the door**` |
| | B | ✗ 无据 | `Buy a new camera` 无出处 |
| | C | ✗ 无据 | `schoolbag` 无出处 |
| | D | ✗ 无据 | 材料只说 `the room is locked at five`，从未提到钥匙 |
| **B4-04 Q1**<br>缺席原因<br>标答 **B** | A | ✗ 无据 | `football match` 属 B4-02 |
| | **B** | ✓ **有据** | `on Fridays I often **don't finish until seven o'clock**`（配合会议 `usually ends about six`，19:00 晚于 18:00，反证成立） |
| | C | ✗ 无据 | `away on a trip` 只出现在 B4-06（且非 Mr. Zhao） |
| | D | ✗ 无据 | `shop` 无出处 |
| **B4-04 Q2**<br>教师的替代安排<br>标答 **D** | A | ✗ 无据 | `by email` 无出处（材料只说 `telephone the office`） |
| | B | ✗ 反证 | `I'm afraid **it cannot be moved**`（+ `head teacher is away until Tuesday`）—— **依据逐字完好** |
| | C | ✗ 无据 | `at the school gate` 无出处 |
| | **D** | ✓ **有据** | `On Monday morning at eight, I'll **show the same slides**` —— **依据逐字完好** |
| **B4-05 Q1**<br>一周六可挣<br>标答 **A** | **A** | ✓ **有据+可重算** | `Three hours at fifteen yuan is only **forty-five** yuan`（3h × 15 = 45） |
| | B | ✗ 可重算排除 | 60 = 4h × 15，与「no more than three hours a week」矛盾 |
| | C | ✗ 可重算排除 | 90 = **6h × 15**，出自材料 `so six hours, at fifteen yuan an hour` —— **该依据逐字完好**（此为最优干扰项） |
| | D | ✗ 可重算排除 | 15 = 1h × 15 |
| **B4-05 Q2**<br>上工前提<br>标答 **C** | A | ✗ 无据 | `from his football coach` 无出处 |
| | B | ✗ 无据 | `sports shoes` 无出处 |
| | **C** | ✓ **有据** | `you need your **parents' permission in writing**` |
| | D | ✗ 部分有据、非前提 | 材料中确有 `the form must stay at the school office` 与 `letter for the head teacher`，但**二者都不是「上工前必须先拿到的东西」**（前者是许可表的存放要求，后者是教师事后代写给校长的信） |
| **B4-06 Q1**<br>周四下午缺哪两科<br>标答 **B** | A | ✗ 无据 | `Music and art` 中 music 属 B4-02、art 属 B4-01 |
| | **B** | ✓ **有据** | `Only the last two, **maths and physics**, are in the afternoon` |
| | C | ✗ 无据 | `Chinese and history` 无出处 |
| | D | ✗ 无据 | PE 属 B4-01，English 属 B4-01 |
| **B4-06 Q2**<br>如何拿到笔记<br>标答 **D** | A | ✗ 无据 | `desk-mate` 无出处 |
| | B | ✗ 无据 | `school website` 无出处 |
| | C | ✗ 无据 | `photos of the board` 无出处 |
| | **D** | ✓ **有据** | `**I'll lend him my notes**, and he can use the study room at lunchtime on **Monday**` |

**12/12 题：存在且仅存在一个完全正确选项；四选项互不相同；无重复项。裁剪未使任何一个选项失去可判依据。**

**⚠️ 跨段串扰检查**：B4-01 Q1 的干扰项 B「four o'clock」在 B4-03 中确实出现。本卷 6 段是 6 个独立场景、逐题逐段作答，跨段不能取证；若将来改为全卷通读式命题，该项会失效。**当前题制下无影响，仅记录。**

---

## 6. 裁剪是否损坏了「推理链」（必查项 6 的后半）

裁剪最容易破坏的不是答案依据，而是**让干扰项失去排除理由的那一步推理**。逐题复验：

| 题号 | 需要的推理步骤 | 裁剪后是否完好 |
|---|---|---|
| B4-01 Q1 | `instead` 只换「星期」不换「时刻」→ 16:30 顺延到周四 | ✅ `Thursday afternoon instead` 保留 |
| B4-01 Q2 | 早退 5 min ≠ 晚 5 min（反证 C） | ✅ `left your class five minutes early` 保留 |
| B4-02 Q2 | 两个选项被否 + 改判周五 | ✅ `All five busy?`、`two choices… or…`、`move your name to Friday's line` 全部保留 |
| B4-03 Q1 | 周二是学生的**错误猜测**，须被教师纠正 | ✅ `I thought… Tuesday` / `It goes up on Monday` 保留 |
| B4-04 Q1 | 19:00 下班 vs 会议 18:00 散会 | ✅ 两个时间点都保留 |
| B4-04 Q2 | 「不能改期」+「另有办法」两条腿 | ✅ `cannot be moved` / `there's another way` 保留 |
| B4-05 Q1 | 3h × 15 元 = 45（需两步） | ✅ 限 3 小时与时薪均在 |
| B4-05 Q2 | 区分「前提」(permission) 与「后续手续」(form/letter) | ✅ 三者俱在 |
| B4-06 Q2 | 排除「周六返校」（locked / closed） | ✅ 保留 |

**9 个需要多步推理的题目，推理链 9/9 完好。裁剪未把任何一道需要推理的题降级为「单句直取」。**

---

## 7. 时间链与数字运算逐段重算（必查项 4）

### B4-01 调课

| 步骤 | 材料依据 | 时点 |
|---|---|---|
| 社团开始 | `meets in Room 302 at half past four` | 16:30 |
| 早退 | `left your class five minutes early` | 16:25 结束 |
| 打扫 | `clean the room for ten minutes after the club` | 16:30 + 10 = 16:40 |
| 步行 | `only a five-minute walk` | 16:40 + 5 = 16:45 |
| 到站 | `I get there at a quarter to five` | **16:45** ✓ 与算式吻合 |
| 车次 | `the quarter-to-five bus` | 16:45（= a quarter to five）✓ |

**16:30 + 10 + 5 = 16:45 = 车次时刻**，即「踩点到站、经常被甩下」，与 `often leaves without me`、`I missed it twice last month` 三者自洽。R2 判定的旧缺陷（16:45 抵达却断言赶不上 17:00 车）**仍完全闭合，裁剪未回退**。

**记录（不计缺陷）**：社团本身的时长材料未给，`after the club` 的起点需按「16:30 到场即开始打扫」理解。但材料**显式写出了到站时刻 16:45**，无论采用哪种理解都不改变结论，故不影响任何选项。

### B4-02 值日

- 值日 `next Tuesday`（放学后）↔ 门诊 `next Tuesday afternoon` → 冲突成立 ✓
- 人数：**2 girls + 3 boys = 5**，与 `All five busy?` 完全吻合 ✓（必查清单「人数 2+3=5」✅）
- 清洁窗口 `before the first lesson on Tuesday morning` = 08:00 前；到校 `ten to eight` = 07:50
  → **⚠️ 逻辑瑕疵，见 V-L1**（07:50 本就早于 8 点，"so I cannot…" 不严格成立；但 Q2 正确答案由教师改判排除，不依赖此步）
- 时序：`booked it last Friday` → `asked this morning` → 改到 `Friday's line`，先后自洽 ✓

### B4-03 候补名单

- **24 − 2 − 18 = 4** ⇔ `That leaves **four** students still waiting for places.` ✅（必查清单「候补 24−2−18=4」✅）
- 公布链：名单 `closed last Friday` → 教师 `decides on Monday morning` → `go up on the door at once`（= 周一决定后当场）→ 学生 `I'll check the list on Monday`
- 三日线无冲突：周一公布 / 周二 `sports meeting… so nothing changes` / 周三 `club meets` ✓
- 器材窗口：社团 `at four o'clock`(16:00) → `Cameras have to be back before five` / `room is locked at five`(17:00) → **可用窗口 16:00–17:00 = 1 小时，自洽** ✅（必查清单「器材窗口 16:00 到 17:00」✅）

### B4-04 家长会

- 会议 **16:30 开始（`starts at half past four`）→ 约 18:00 结束（`usually ends about six`）** ✅（必查清单「会议 16:30 到 18:00」✅）
- Mr. Zhao **19:00 才收班（`don't finish until seven o'clock`）** ✅（必查清单「七点下班」✅）
- 19:00 > 18:00 → 整场缺席，反证成立 ✓
- `head teacher is away until Tuesday` → 不可改期 ✓
- 替代方案：周一 **08:00**；名单周一**下午**贴门上，需**八点前**打电话 → 衔接一致 ✓

### B4-05 零工

| 量 | 材料 | 复算 |
|---|---|---|
| 姑妈需求时段 | `from ten in the morning until four in the afternoon, so **six hours**` | 10:00–16:00 = **6 h** ✅ |
| 姑妈时薪 × 时长 | `at **fifteen** yuan an hour` × 6 h | 6×15 = **90** ✅（选项 C 依据，逐字保留） |
| 校规上限 | `no more than **three hours** a week` | 3 h |
| 训练 | `football practice from nine to half past ten` | 09:00–10:30 |
| 打工（合规方案） | `from eleven to two on Saturday` | 11:00–14:00 = **3 h** ✅；10:30 收操、11:00 上工，衔接成立 |
| 校规下收入 | `Three hours at fifteen yuan is only **forty-five** yuan` | 3×15 = **45** ✅（选项 A 依据） |
| 装备费用 | `our football kit costs **eighty** yuan` | 80 |
| 缺口 | `I still need **thirty-five** yuan` | **80 − 45 = 35** ✅（必查清单「补助差额 80−45=35」✅） |
| 缺口补足 | `a fund for sports kits` + `letter for the head teacher` | ✓ |

**B4-05 是全卷算术链条最长、且每一步都可被学生独立重算的题，裁剪后链条 9/9 完整。**

### B4-06 请假

- 周四 `six lessons`，其中 `Only the last two, maths and physics, are in the afternoon` → 上午 4 节 + 下午 2 节 = **6** ✅
- `we will leave school at half past three`(15:30) 晚于下午最后一节，✓
- 时序：周三发作业单 → 周四 15:30 离校 → 周一午休补笔记 → `please don't send him back on Saturday`（`classrooms are locked`、`study room is closed`）✓
- **⚠️ 但周四下午至周六上午的缺席区间内，周五整日课程未被计入，见 V-L2**

**全部算式（人数 2+3=5、候补 24−2−18=4、6h×15=90、3h×15=45、差额 80−45=35、器材窗口 16:00–17:00、下班 19:00、会议 16:30–18:00、上午 4+下午 2=6）——9/9 复算正确，无凑数、无四舍五入、无前后矛盾。**

---

## 8. 说话人标注 / 称谓一致性 / 悬空并列（必查项 5）

### 8.1 说话人标注与称谓

| 段 | 标注 | 被称呼方式 | 判定 |
|---|---|---|---|
| B4-01 | Boy / Ms. Zhou | 男生称 Ms. Zhou | PASS |
| B4-02 | Girl / Ms. Liu | 女生称 Ms. Liu，致谢时仍称 Ms. Liu | PASS |
| B4-03 | Boy / Ms. Huang | 男生称 Ms. Huang | PASS |
| B4-04 | **Mr. Zhao** / Ms. Sun | 家长用 **Mr.** 标注，开口称 Ms. Sun | PASS |
| B4-05 | Boy / Ms. Wu | 男生称 Ms. Wu | PASS |
| B4-06 | **Mr. Wu** / Ms. Deng | 家长用 **Mr.** 标注；Ms. Deng 回称 `Of course, Mr. Wu.` | PASS |

**6/6 段：家长一律用 Mr. 标注（B4-04、B4-06），无任何被称 Ms./Mr. 的人被标成 Boy/Girl，无成年人被标成 Boy/Girl。必查清单「家长用 Mr. 标注」✅**

### 8.2 悬空并列全卷扫描

程序化提取全部 62 个话轮中的 `and / or / but / so / because / than / instead / as well / either / neither`，**共 46 处**，逐处核查两侧是否有实义内容：

- **and**：18 处，**全部两侧完整**（含 `Only the last two, maths and physics, are in the afternoon` 列举—主谓呼应、`the classrooms are locked and the study room is closed` 并列独立小句）
- **but**：6 处，**全部有前项**
- **so**：6 处，**全部有前因**
- **or**：1 处（B4-02 `two choices: …, or …`）—— 两个分句**均完整存在** ✅
- **because**：2 处（B4-03 `room is locked at five`、B4-04 `head teacher is away until Tuesday`）—— 均有明确后果
- **than**：1 处（B4-05 `no more than three hours a week`）—— 比较对象 `three hours` 已在同句 ✅
- **instead / as well / either / neither**：`instead` 2 处（B4-01 社团改期、B4-04 六点到场）均有明确被替代对象；**`as well` 已随 R2 的 L4 修复被 `move…from` 消除**（当前全文 0 次 `as well`）

**62/62 话轮、46 处连接词：未发现悬空并列。PASS。**

---

## 9. Q1 与 Q2 的信息点独立性（必查项 6 前半）

| 段 | Q1 考点 | Q2 考点 | 是否重叠 |
|---|---|---|---|
| B4-01 | 下月社团的**会期（星期+时刻）** | 错过班车的**因果** | 互斥 |
| B4-02 | 同组同学周二下午的**去向** | 本人值日的**了结方式** | 互斥 |
| B4-03 | 结果**公布时间** | 借用相机的**附加义务** | 互斥 |
| B4-04 | 缺席的**原因** | 教师的**替代安排** | 互斥 |
| B4-05 | **收入金额**（需两步重算） | **前置许可**（事实辨认） | 互斥，难度层次互补 |
| B4-06 | 缺席的**科目** | 获取笔记的**途径** | 互斥 |

**6/6 段 Q1 与 Q2 各自落在不同信息点上，无任何一题依赖另一题作答。裁剪未使任一段的两题塌缩到同一句依据上（依据见 §6）。**

---

## 10. 答案序列检测（必查项 7）

答案序列（12 题按题序）：`C B D A C A B D A C B D` → **CBDACABDACBD**
与文件末尾汇总行 `本批答案序列：C B D A C A B D A C B D` **逐位一致** ✅

### 10.1 周期检测（**只接受至少可比较 2 对的周期**；p=2…6 可比对数 6–10，**全部满足 ≥2 对的前置条件**）

| 周期 p | 可比较对数 | 满足 seq[i]=seq[i+p] | 判定 |
|---|---|---|---|
| 2 | 10 | 1 | 否 |
| 3 | 9 | 1 | 否 |
| 4 | 8 | 3 | 否 |
| 5 | 7 | **4** | 否（最接近） |
| 6 | 6 | 0 | 否 |

**统计严谨性**：最接近的 p=5 为 4/7。零假设二项检验 `P(X≥4 | n=7, p=0.25) = 0.0706`；对 p=2…6 共 5 个周期做 Bonferroni 校正后 `0.0706 × 5 = 0.353`，**远未达 0.05**。
**样本量声明**：n=12 时周期类判据只有 **6–10 对**可比，检测「部分近似周期」的统计功效极低。因此诚实表述为：**规范所列「严格周期」缺陷字面阴性，但本样本量不足以证明「不存在弱周期」**。判定 **无周期性缺陷**。

### 10.2 最长连续相同

CBDACABDACBD 中**不存在任何相邻重复字母**，最长连续相同 = **1**（阈值 ≥3）。**无扎堆。**

### 10.3 四字母覆盖

`A=3, B=3, C=3, D=3` —— **A/B/C/D 全部被用作正确答案，完全均衡。无字母缺失。**

> **⚠️ 更正 R2 报告的统计错误**：R2 §11.3 称该分布的概率为 34.1%，本轮复算 `12!/(3!⁴·4¹²) = 0.0220`，正确值为 **2.20%**，非 34.1%。同理 R2 的 `P(≥5次)=23.6%` 实为 **15.76%**、`P(≥7次)=1.74%` 实为 **1.43%**（`P(≥9次)=3.92×10⁻⁴` 基本正确）。
> **该更正不改变任何判定**：3/3/3/3 的低概率反映的是**刻意均衡编排**（题库设计的正常目标），而规范门禁是「≥70% 位置偏斜」与「某字母永不作答案」，两项均为阴性；且每个字母在 Q1 位与 Q2 位都出现过，不存在位置固定化。

### 10.4 逐题位置偏斜

| 位置 | 分布 | 最高频占比 | 阈值 | 判定 |
|---|---|---|---|---|
| Q1 位（第 1,3,5,7,9,11 题） | `C D C B A B` → C×2, B×2, D×1, A×1 | 2/6 = **33.3%** | 70% | PASS |
| Q2 位（第 2,4,6,8,10,12 题） | `B A A D C D` → A×2, D×2, B×1, C×1 | 2/6 = **33.3%** | 70% | PASS |

另：**6 段中无任何一段的 Q1 与 Q2 标答相同**（`CB / DA / CA / BD / AC / BD`，段内两字母恒异）。**无位置偏斜。**

### 10.5 扩窗套利：概率上界与实际收益

**随机基准率**：n=12、4 字母等概率 → 每字母期望 3 次，闭卷固定押一字母的期望命中 = **3/12 = 25.0%**。

| 套利策略 | 实际收益 | 相对基准的超额 |
|---|---|---|
| 闭卷固定押单一字母（最高频 A/B/C/D 均为 3） | 3/12 = **25.0%** | **0.0%（= 基准）** |
| 只知「奇数题 / 偶数题」（Q1 位 / Q2 位） | 4/12 = **33.3%** | **+1 题（+8.3 pp）** ← **上界** |
| 只知「第 6 题 vs 其他题」等任意单点条件 | ≤ 2/12 + 1/12 | ≤ +1 题 |
| 逐位记忆答案键 | 12/12 | 不属套利范畴，排除 |

**概率上界推导**：任一「不读材料、只按位置作答」的策略，其准确率上界 = 该位置桶内字母的众数频次之和。Q1 位 6 个位置无任何字母出现超过 2 次，Q2 位同样最多 2 次 → **上界 2+2 = 4/12 = 33.3%**，即最多多得 **1 道题**。
**本卷不存在可套规律的答案排列。**

---

## 11. 开场白归一化 / 结尾 key 唯一性 / 话轮相似度 / 相邻同说话人（必查项 8）

### 11.1 开场白归一化（剥离说话人标注、去标点、转小写、前 6 词作 key）

| 段 | key | 段 | key |
|---|---|---|---|
| B4-01 | `i wonder if i` | B4-04 | `i got a note` |
| B4-02 | `could you look at` | B4-05 | `our football kit costs` |
| B4-03 | `i was ill last` | B4-06 | `i hope this is` |

**重复 key：0 个。** 最高两两 Jaccard 仅 **0.222**（B4-01~B4-04、B4-01~B4-06、B4-03~B4-06、B4-04~B4-06），**无「Excuse me」式同质化开场。PASS。**

### 11.2 结尾 key 唯一性（末 6 词）

`come to the club on Thursdays` / `tell our group monitor tonight` / `i ll check the list on monday` / `telephone the office before eight` / `keep the saturday job` / `if anything changes` → **重复 key 0 个**；最高两两 Jaccard **0.200**。**PASS。**

### 11.3 话轮相似度（Jaccard，分词去标点）

- 扫描范围：6 段 × 62 话轮，共 **C(62,2) = 1,891 对**
- **阈值 0.6 命中：0 对 —— PASS**
- 实际最高 5 对：**0.462 / 0.353 / 0.333 / 0.286 / 0.280**

最高一对为 B4-04 与 B4-05 的**教师共情开场**：

> B4-04 `I'm sorry to hear that. Why?`（4 词与其余 2 词）
> B4-05 `I'm sorry to hear that. How will you get the money?`

即 `I'm sorry to hear that.` 这一整句在两段**逐字重复**。

> **统计严谨性 —— 为何不定为缺陷**：
> 设英语校园口语中高频套话约 **K=10** 种（I'm sorry to hear that / Thank you / Thank you very much / That's kind of you / Of course / I see / …），每种在 6 段中独立出现的概率取 **q=0.25**，则「至少在 2 段中重复」的套话种数的期望为
> `10 × P(Bin(6, 0.25) ≥ 2) = 10 × 0.466 ≈ **4.7 种**`。
> 实测只出现 **1 种**（`I'm sorry to hear that.`），**低于期望值**。
> 结论：**该现象是英语礼貌套话的基础率产物，不构成雷同证据。记为观察项，不判缺陷。**

补充：跨段重复的 3-gram 共 21 组（总 3-gram 约 1,000 个，重复率 2.1%），逐条检查后全部为**功能词串**（`i can t`、`then i ll`、`you i ll`、`t need to`）或**校园场景不可避免的机构名词**（`the head teacher` ×3 段、`at half past` ×3 段、`in the afternoon` ×2 段）。无内容性重复。

### 11.4 相邻同说话人

6 段共 **62 个话轮，全部严格双人交替，相邻同说话人 = 0 次**。PASS（双人对话严格交替是体裁惯例，不作为雷同证据）。

---

## 12. 本轮发现的问题

### 严重缺陷：**0 条**
### 中等缺陷：**0 条**

### 轻微缺陷

#### V-L1（轻微）· B4-02 Q2 · 到校时刻与结论方向相反

- **位置**：B4-02 话轮 7
- **原文**：`My bus only gets me here at ten to eight, **so I cannot clean the classroom before eight**.`
- **问题**：`ten to eight` = **07:50，本身就早于 08:00**，因此「不能赶在八点前打扫」并不能由前半句推出；逻辑方向是反的。要成立需改为「到校太晚，只剩十分钟，不够打扫」。
- **对答案的影响：无。** Q2 的 C 项由**教师当场改判**排除（`Then I'll move your name to Friday's line.`），**不依赖**这句；标答 A 由 `You'll clean with Group One` 直接给出。
- **是否本轮新引入**：R2 报告 §3 曾把此处判为「有效反证」（其推理同样是把 07:50<08:00 当作排除依据，方向亦反），说明该瑕疵至少在上一轮已存在；但**无法从 R2 报告判定本轮裁剪是否加重了它**（裁剪前原文不在可读范围内）。**按「可能是新引入也可能不是」从严记录为轻微。**
- **建议改法（+0 词，不影响任何依据）**：`My bus only gets me here at ten to eight, so I cannot clean the classroom **in time**.` 或 `…so ten minutes is not enough to clean the classroom.`

#### V-L2（轻微）· B4-06 Q1 + Q2 · 周五整日课程未被计入缺席

- **位置**：B4-06 话轮 3、5、6
- **原文**：`My family is going to my parents' home on Thursday, and **we will stay there until Saturday morning**. ` → `Ms. Deng: **How many lessons will your son miss?**` → 父亲只答了周四：`He has six lessons on Thursday…`
- **问题**：缺席区间为**周四 15:30 至周六上午**，跨过**整个周五**；但对话从头到尾只清算周四下午两节课，**周五整天课程一字未提**。教师问「会缺多少节」而父亲答的是单日课程，问答不闭合。
- **对答案的影响：无。** Q1 题干已显式限定 `on Thursday afternoon`，标答 B 由 `maths and physics` 直给；Q2 标答 D 由 `I'll lend him my notes… on Monday` 直给。**两道题均不受影响。**
- **是否本轮新引入**：**否，属既有缺陷，R2 报告 §3 判为 PASS 时未发现**。本轮独立重读首次识别。
- **建议改法（+5 词，B4-06 变 176 / 198，仍双口径合规）**：话轮 6 改为 `Then he will miss **Thursday's** two lessons **and all of Friday**, with no homework for them.`
  （若采纳，须按 §4.2 复算 B4-06 词数；现为 171/193，余量 7，可容纳。）

### 流程 / 申报问题（不影响题目正确性）

#### F1（流程）· B4-06 存在**未申报的越界改动**

- 修复方声明裁剪范围为 **B4-01 至 B4-05** 五段，并声称 B4-06 未动。
- **实测反证**：R2 §8 记录 B4-06 = **169**（剥离口径）/ **191**（含标注口径）；本轮独立逐词复算当前 B4-06 = **171 / 193**，**两口径同步 +2**。
- **定位到具体改动**：R2 §轻微 L7 记录的原文为 `Then he will miss two lessons, **but no homework**.`（9 词）；当前原文为 `Then he will miss two lessons, **with no homework for them**.`（11 词）——「but→with」净 0 词，+「for them」**净 +2 词，与实测增量完全吻合**。
- **性质**：这是 R2 的 L7 建议项被实施了，但**修复方未在声明中提及**。改动本身是**改进**（把「无作业」限定到所缺的两节课，消解了与随后「发作业单」的张力），语法正确，**不影响 B4-06 Q1/Q2 的任何选项与答案**。
- **后果**：B4-06 双口径仍在 200 以内（171 / 193），**未破坏词数门禁**。
- **建议**：不需回退；仅需在下一轮变更说明中把 B4-06 纳入申报范围，避免后续复核基线错位。

#### F2（流程）· B4-03 词数申报数字错误

- 修复方声明：「B4-03 Q1 at once 已修，**词数 186 降到 185**」。
- **实测**：R2 §8 记录 B4-03 = 186（剥离口径）/ 202（含标注口径）；本轮独立复算当前 = **179 / 195**，**两口径同步 −7**，并非 −1。
- **性质**：M1 的修复本身**确实只动 1 词**（`at once`→`today`），但 B4-03 还被**另外裁剪了 6 词**（该段在「B4-01 到 B4-05 裁剪范围内」，故不属越界，只是**分项数字报错了**）。
- **影响**：无。B4-03 现为 179/195，双口径合规，选项依据 100% 保留。

---

## 13. 对上一轮（R2）问题的核销情况

| R2 编号 | 状态 | 依据 |
|---|---|---|
| **M1（中等，唯一必改）** | ✅ **已闭合** | B4-03 全段 `at once` 现仅出现 **1 次**（话轮 6）；学生问句已改为 `Will you tell me the result **today**?`，教师答 `**Not today.**`，二者与「周一上午决定」一致，不再存在同词反义碰撞。残留的那一次 `at once` 被同句紧邻的 `The club teacher decides on Monday morning` 锚定为「周一决定后当场张贴」，与 `Not today` **不构成冲突**（且已分属两个句子，原「相隔 11 词」的碰撞条件消失）。 |
| L1 题干泄露答案（6 题 7 选项） | 未处理 · 轻微 | 本轮不重复计入缺陷，仅记录材料未写即被排除的选项仍存在 |
| L2 B4-01 but 搭接 | ✅ 已改善 | 现为 `but we clean the room for ten minutes after the club`，与前半句同为「时长」，对比项更齐 |
| L3 B4-01 时刻靠推断 | 仍存在 · 不判缺陷 | 材料仍未复述时刻，但 `half past four` 逐字在段内出现、C 为唯一时段有据的选项，答案唯一 |
| L4 B4-02 `as well` 歧义 | ✅ 已闭合 | 现为 `I'll **move** your name to Friday's line.`，全卷 `as well` 已 0 次 |
| L5 B4-04 双问只答一半 | 仍存在 · 轻微 | 话轮 7 的 `Could I come at six instead, **or** could it be moved to another day?` 仍只正面回答后半句；但新增的 `But there's another way` 已隐含否掉「六点到场」，影响进一步减弱。不影响 Q1/Q2。 |
| L6 B4-05 从句挂靠 | ✅ 已闭合 | 现为 `after football practice from nine to half past ten`，关系挂靠唯一 |
| L7 B4-06 作业语义张力 | ✅ 已闭合（**但未申报，见 F1**） | 现为 `with no homework for them` |
| L8 词数口径分歧 / 余量不足 | ✅ **已消除** | 双口径全部 ≤200；最紧余量由 R2 口径下的 5 词（剥离口径 B4-05）变为 **3 词（含标注口径 B4-04）**；口径分歧通过本报告同时给出两套口径消解 |

---

## 14. 已复核题号清单（覆盖率证明）

**本轮逐题审核 12/12，无抽样。四选项逐条代入 = 48/48。**

| # | 题号 | 段落 | 严重 | 中等 | 轻微 | 结论 |
|---|---|---|---|---|---|---|
| 1 | B4-01 Q1 | 调课 | 0 | 0 | —（L3 记录，不判缺陷） | **通过** |
| 2 | B4-01 Q2 | 调课 | 0 | 0 | — | **通过** |
| 3 | B4-02 Q1 | 值日名单 | 0 | 0 | — | **通过** |
| 4 | B4-02 Q2 | 值日名单 | 0 | 0 | **V-L1** | **通过**（带轻微项） |
| 5 | B4-03 Q1 | 候补名单 | 0 | 0 | — | **通过（M1 已闭合）** |
| 6 | B4-03 Q2 | 候补名单 | 0 | 0 | — | **通过** |
| 7 | B4-04 Q1 | 家长会改期 | 0 | 0 | — | **通过** |
| 8 | B4-04 Q2 | 家长会改期 | 0 | 0 | —（L5 记录，不判缺陷） | **通过** |
| 9 | B4-05 Q1 | 三小时的零工 | 0 | 0 | — | **通过** |
| 10 | B4-05 Q2 | 三小时的零工 | 0 | 0 | — | **通过** |
| 11 | B4-06 Q1 | 请假两天 | 0 | 0 | **V-L2** | **通过**（带轻微项） |
| 12 | B4-06 Q2 | 请假两天 | 0 | 0 | **V-L2** | **通过**（带轻微项） |

**合计：复核 12 题 · 通过 12 题 · 命中轻微项 3 题 · 严重 0 · 中等 0 · 流程申报问题 2 项。**

---

## 15. 最终判定

**通过。**

- 修复方声明的**唯一必改项 M1 已确认闭合**（`at once` 由 2 次降为 1 次，学生问句改为 `today`，语义不再冲突）；
- 修复方声明的**「不得丢失任何选项的材料依据」已确认成立**——45 个锚点逐字检索 100% 命中，48 个选项逐条代入全部可判或可反证，12/12 答案唯一；
- **词数门禁 PASS**，且两套口径均合规，R2 遗留的口径分歧已消除；
- **未发现任何由裁剪引入的新缺陷**：裁剪未破坏 9 条推理链、未制造悬空并列、未改动任何答案或选项、答案序列四项检测全部阴性。

需登记的后续事项：**V-L1、V-L2**（轻微，可择机修）**F1**（B4-06 越界改动应补入变更说明）**F2**（B4-03 词数分项数字报错）。**另请注意 B4-04 在含标注口径下仅余 3 词，是全卷最紧的一段。**
