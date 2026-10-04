# 修复执行记录：A6.md 第二轮（严重 2 条 + 中等 2 条）

> 修复员：第二轮题目修复员（依 `reviews/R2-A6-true.md` 执行，未参与该报告撰写）
> 文件完整性（开工前，字节方式读取 `[System.IO.File]::ReadAllBytes` 取哈希）：
> `data/item-bank/A6.md` MD5 = `638BB764BA5599FEC57D684DEDEE5025`，字节长度 8043 —— 与调度方给定基线**完全一致**，所见内容与磁盘一致。
> 写入保护：开工前已确认 `data/item-bank/fixes/F2-A6-true.md` **不存在**（`Test-Path` = False）后才动手。
> 独立性约束遵守：未读取 `reviews/` 下任何其他报告（仅本轮指定的 R2-A6-true.md）、未读取 `fixes/` 下任何文件、未 grep `docs/pipeline`。
> 修改范围：**仅 `data/item-bank/A6.md`**（4 行），外加新建本文件。未创建、未覆盖、未删除任何其他文件。

---

## 0. 命名与覆盖声明

本批次 `fixes/` 下已存在两个易混文件：**`F1-A6-true.md`**（第一轮修复记录）与 **`F2-A6.md`**（历史命名的第二轮修复记录）。
本记录写入的是**第三个不同路径** `data/item-bank/fixes/F2-A6-true.md`。开工前后均未对 `F1-A6-true.md` / `F2-A6.md` 做任何读写操作，二者内容未被触碰。

## 1. 词数口径声明（依 REVIEW-RUBRIC 1.10）

本次全部词数采用同一口径，并**同时给出两个读数**：

1. **字面读数（1.10 原文口径）**：按空白分词，连续的非空白字符序列计 1 词；只数 Dialogue 正文（不含题号标题、`**Question**` 题干、A/B/C/D 选项、`**Answer**` 行、文件头 `> A6 健康与运动（15 题）`、末尾答案汇总行）；**先剥离说话人标注再计数**（`Boy` / `Girl` / `Ms. Wu` 等一律不计，注意 `Ms. Wu` 在空白分词下占 2 个 token）。
2. **去纯标点读数**：在字面读数基础上，剔除**独立成词的纯标点 token**（本卷仅 A6-15 话轮 4 的破折号 `—` 计 1 词）。

**上限**：A 类短对话单段 **60 词**（含 60，超 61 即违规）。

---

## 2. 严重 1 — A6-12 话轮 3：并列陈述句误用疑问号 + 逗号误置

**位置**：`## A6-12 改在体育馆打球`，话轮 3

```
原：Girl: The classroom is too small, and the hall is booked?
新：Girl: The classroom is too small. Is the hall booked?
```

**根因与修复对应关系（假修复自检：根因要素是否被消除，而非该行是否被改掉）**

| 根因要素 | 消除方式 | 验证 |
|---|---|---|
| 疑问句倒装缺失（陈述语序配问号） | 改为疑问语序 `Is the hall booked?` | 脚本断言匹配该问句 = 通过 |
| 逗号误置（把非对称的两句强行并成 `and` 并列） | 逗号 → 句号断句 | 脚本断言该行**不含逗号** = 通过 |

两处根因均被消除，而非仅“重写了一行”。

**改后自查**

- **话轮数仍为 5** ✅（脚本断言 turns === 5）
- **说话人交替未被破坏** ✅（`Girl → Ms. He → Girl → Ms. He → Girl`，脚本断言无相邻同说话人）
- **上下文衔接**：话轮 4 `Ms. He: That's right.` 现成为对 `Is the hall booked?` 的肯定回答，衔接比原文更顺，无需同步改话轮 4（已保持逐字未改）
- **四个选项依据全部保留** ✅
  - A `On the playground.` ← 话轮 2 `Not on the playground. It may rain tomorrow.`（未动）
  - B `In the gym.` ← 话轮 4 `Meet in the gym at four`（未动）
  - C `In the classroom.` ← `The classroom is too small.` 仍是陈述句，**排除依据强度不变**
  - D `In the school hall.` ← 由陈述 `the hall is booked` 变为**问答确认**（`Is the hall booked?` / `That's right.`），**排除依据由“被陈述”增强为“被问答确认”**
- **词数**：话轮 3 10 → 9 词；**全题 45 → 44**（两读数均为 44）
- 无新增生词、无完成体、称谓 `Ms. He` 未受影响

---

## 3. 严重 2 — A6-15 词数 61 超 60 上限

**位置**：`## A6-15 四百米跑步节奏`，仅话轮 3

```
原：Girl: My friend always runs fast at the beginning, and then he gets tired.
新：Girl: My friend always starts fast and then gets tired.
```

**根因**：设问 `When will they practise for the 400-metre race?` 只考练习日期（依据全在话轮 4），话轮 1–3 共 34 词讲配速、话轮 5 共 6 词纯附和，约 37 词（约占 61%）对设问零贡献。采用报告的**最小降词方案**：只压缩话轮 3 的赘语，**−4 词**。

**假修复自检：确认溢出源头被削减，而非仅动了一行**

- 删除的是 `at the beginning, and then he` —— 其中 `and then` 与句末 `and then` 重复、`at the beginning` 与 `starts` 语义重叠的赘语；`always`（习惯性）与 `and then`（时间因果）**全部保留**，语义等价，**设问所考内容（练习日期）零删减**。
- 溢出量从「超 1 词 / 触限零余量」变为**余量 3 词**（字面 57 ≤ 60），根因（对设问零贡献的冗余配速叙述）被实质削减。

**改后自查（按指令逐项确认）**

| 必查项 | 结果 |
|---|---|
| 话轮 4（四选项依据所在）**逐字未改** | ✅ 脚本比对整行与基线完全相同 |
| `Monday` 锚点在 | ✅ |
| `Wednesday` 锚点在 | ✅ |
| `Not on Friday`（Friday 被排除）在 | ✅ |
| `Thursday morning`（A 项对照锚点）在 | ✅ |
| 第 5 话轮呼应对象 | `I see. Slow first, then fast.` 呼应的是**话轮 2** `Start slowly and run fast in the last hundred metres.`，**不是**话轮 3 → **无呼应断裂** |
| 无新增生词 | `starts` 已在话轮 1 `should we start fast?` 中出现，未超纲 |
| 无完成体 | ✅ |
| 话轮数 / 交替 | 5 话轮、`Girl → Ms. Pan → Girl → Ms. Pan → Girl` 严格交替未变 |
| 四个选项依据 | D=周一+周三明示；B=Friday 被显式否定；C=有 Wednesday 无 Friday 组合不成立；A=Thursday morning 为运动会非练习 —— 四条依据全部来自未改动的话轮 4 |

**改后对话全文**

```
Girl: Ms. Pan, in the 400-metre race, should we start fast?
Ms. Pan: No. Start slowly and run fast in the last hundred metres.
Girl: My friend always starts fast and then gets tired.
Ms. Pan: Practise that on Monday and Wednesday. Not on Friday — you'll still be tired from the sports meeting on Thursday morning.
Girl: I see. Slow first, then fast.
```

**词数**：话轮 3 13 → 9 词；**全题 61 → 57（字面）／60 → 56（去纯标点）**

---

## 4. 中等 1 — A6-11 话轮 4：`too` 悬空并列 + 取药来源未交代

**位置**：`## A6-11 发烧在家休息`，话轮 4

```
原：Ms. Xu: Then stay home and miss PE class. The clinic is closed too. Take the medicine after breakfast and rest.
新：Ms. Xu: Then stay home and miss PE class. The school clinic is closed this afternoon, so take your medicine at home after breakfast and rest.
```

**两个层面一并解决（假修复自检）**

| 层面 | 根因要素 | 消除方式 |
|---|---|---|
| (a) `too` 前指悬空 | `the clinic` 全段从未出现，`too` 要求回指不存在的先行项 | 删去 `too`，改用因果连词 `so`；`The school clinic` 由前句 `miss PE class`（学校）直接导出同一所指，前指链完整 |
| (b) 取药来源张力 | 同句先说诊所关门又要求服药，却从未交代药从何而来 | `take your medicine **at home**` 明写服药地点在家，与诊所彻底解耦 |

两个层面**均**被消除，非只动了 `too` 一处。

**改后三项扫描复跑（按指令要求）**

- **悬空并列扫描**：全题 `too/also/either/as well` 命中 **0** ✅（原为 1 处悬空 `too`）
- **完成体扫描**：全题 Dialogue 正文无 `have/has/had + 过去分词` 预设答案；唯一相关形式仍是话轮 2 `How long have you had the fever?` —— 用于提问持续时长的标准用法，非预设答案 ✅
- **称谓扫描**：被称呼者 `Ms. Xu` = 该题头衔说话人 `Ms. Xu:` ✅

**改后自查**

- **C 项排除依据由隐含变显式**：改后 `The **school** clinic is closed this afternoon` 与选项 C `Take the medicine at the school clinic.` 的 `school clinic` **逐字对应**，且与 `at home` 构成双重排除
- **D 项（答案）依据不变**：`stay home` + `rest` ✅
- **A/B 项依据不变**：`My friends want to play basketball`（话轮 3，未动）被 `stay home` 否定；`miss PE class` 否定 B
- **时间框架自洽**：新增 `this afternoon` 与设问 `What will the girl do this afternoon?` 一致（新增而非冲突）
- **词数**：话轮 4 19 → 24 词；**全题 48 → 53**（两读数均为 53），距上限余 7 词
- 无新增生词（`clinic`、`afternoon` 均在课标五级内）、无完成体

---

## 5. 中等 2 — A6-07 话轮 2：以过程动词直接提问时长（非地道）

**位置**：`## A6-07 看手机后护眼`，话轮 2

```
原：Ms. Yuan: How long do you do your homework every evening?
新：Ms. Yuan: How long do you spend on your homework every evening?
```

**假修复自检**：语病点在于「时长 + 过程动词 `do` 直接搭配」，改法以 `spend on` 替换该搭配 —— **命中的是搭配本身**，不是仅换了问号或语序。

**改后自查**

- 句式地道：`How long do you spend on ...?` 为母语者标准时长提问句式 ✅
- **问答逻辑比原句更贴合**：话轮 3 `About two hours.` 现在是对「时长」的直接回答（原句回答 `How long do you do...` 属勉强贴合）
- **四个选项依据全部未动**：话轮 3 仍是 C（`Every half an hour`）与 D（`Once every two hours`）的来源；话轮 4 `Look away for a minute every twenty minutes, not every ten.` 仍是 B（正确）与 A（`Every ten minutes`）的来源 —— 两话轮逐字未改
- **词数**：话轮 2 9 → 10 词；**全题 51 → 52**（两读数均为 52），距上限余 8 词
- `spend` 在课标五级内，无完成体

---

## 6. 报告建议本身的复核结论

本项目此前已累计 13 例「报告/指令建议本身有缺陷」的先例，故对 4 条建议文本**逐条独立复核**（含上下文语法、字数、选项耦合、相邻话轮衔接），结论：

| 条目 | 建议是否有缺陷 | 复核要点 |
|---|---|---|
| 严重 1（A6-12） | **无缺陷，照抄即成立** | 拆句后话轮 4 `That's right.` 成为合法回答；话轮数与交替不变 |
| 严重 2（A6-15） | **无缺陷，照抄即成立** | 删除的 `he` 不产生悬空指代（该句是全段唯一提及“朋友”处，且第 3 话轮已由 `My friend` 自足表意）；第 5 话轮呼应话轮 2 而非话轮 3 |
| 中等 1（A6-11） | **无缺陷，照抄即成立** | `so` 引导祈使句合法；`this afternoon` 与设问时段一致而非冲突 |
| 中等 2（A6-07） | **无缺陷，照抄即成立** | 话轮 3 回答在新句式下更自然 |

**报告文字中的一处表述瑕疵（不影响其结论，未据此改动作）**：报告 §2 严重 1「改后自查」中对选项 C 的描述语句自相缠绕（“依据由陈述变为提问……不成立（原文为……仍是陈述）”），但其**最终结论“排除依据强度不变”是正确的**，且经我独立验证成立（`The classroom is too small.` 改后仍为陈述句）。此项属**报告叙述瑕疵**，非材料缺陷，不计入缺陷，也不构成修改材料的依据。

---

## 7. 全卷改后自检（15/15，非抽样）

### 7.1 词数（1.10，两个读数；改前 → 改后）

| 题号 | 改前字面 | 改后字面 | 改前去纯标点 | 改后去纯标点 | 变动 | 判定 |
|---|---|---|---|---|---|---|
| A6-01 | 51 | 51 | 51 | 51 | 0 | 合规 |
| A6-02 | 50 | 50 | 50 | 50 | 0 | 合规 |
| A6-03 | 53 | 53 | 53 | 53 | 0 | 合规 |
| A6-04 | 59 | 59 | 59 | 59 | 0 | 合规（高位） |
| A6-05 | 60 | 60 | 60 | 60 | 0 | 合规（触上限零余量，**轻微 L4，本轮不动**） |
| A6-06 | 52 | 52 | 52 | 52 | 0 | 合规 |
| **A6-07** | 51 | **52** | 51 | 52 | **+1** | 合规 |
| A6-08 | 54 | 54 | 54 | 54 | 0 | 合规 |
| A6-09 | 51 | 51 | 51 | 51 | 0 | 合规 |
| A6-10 | 47 | 47 | 47 | 47 | 0 | 合规 |
| **A6-11** | 48 | **53** | 48 | 53 | **+5** | 合规 |
| **A6-12** | 45 | **44** | 45 | 44 | **−1** | 合规 |
| A6-13 | 48 | 48 | 48 | 48 | 0 | 合规 |
| A6-14 | 47 | 47 | 47 | 47 | 0 | 合规 |
| **A6-15** | **61** | **57** | **60** | **56** | **−4** | **超限已消除** |

- 改后最大值 **60**（A6-05，本轮未动）、最小值 **44**（A6-12）。
- **超 60 者：0 题**（改前 1 题：A6-15）。
- 两个读数的差异**全卷仅 A6-15 一处**（破折号），其余 14 题两读数完全相同。

### 7.2 结构（1.9 / 1.6）

- `##` 段数 **15**、`**Answer**` 行数 **15** → **结构比 15:15 = 1:1** ✅
- 编号 A6-01…A6-15 **连续无缺号** ✅
- 15 题**每题 4 个选项** ✅；`**Dialogue**` / `**Question**` / `**Answer**` 各恰好 1 处，15/15 ✅
- 说话人标注：15 题全部严格交替，**无相邻同说话人** ✅；话轮数分布 5 话轮 9 题、4 话轮 6 题，与改前一致 ✅

### 7.3 答案序列（1.8 / 1.8b）

序列 `C A D B A C B D A C D B C A D`（**与改前完全一致，与文件末尾汇总行一致** —— 本轮改动未触碰任何答案）

- **最长连续相同 = 1**（无任何相邻答案相同）✅
- **四字母覆盖**：A=4、B=3、C=4、D=4，ABCD **全部出现**，无固定陷阱字母 ✅
- **周期检测（p = 2…13，按“只接受至少可比较 2 对”判定）**：

| p | 可比较对 | 吻合 | 结论 |
|---|---|---|---|
| 2 | 13 | 0/13 | 阴性 |
| 3 | 12 | 4/12 | 阴性 |
| 4 | 11 | 3/11 | 阴性 |
| 5 | 10 | 4/10 | 阴性 |
| 6 | 9 | 0/9 | 阴性 |
| 7 | 8 | 3/8 | 阴性 |
| 8 | 7 | 2/7 | 阴性 |
| 9 | 6 | 2/6 | 阴性 |
| 10 | 5 | 0/5 | 阴性 |
| 11 | 4 | 0/4 | 阴性 |
| **12** | **3（≥2，可判定）** | **3/3** | **形式命中** |
| 13 | 2 | 0/2 | 阴性 |

- **p = 12 命中说明（须提请上游注意）**：`答案[i] = 答案[i−12]` 在第 13/14/15 题复现第 1/2/3 题的答案（C/A/D），可比较 3 对全部吻合，**满足“至少可比较 2 对”的接受门槛**。
  但该模式**并非本轮引入**：答案序列改前改后逐字相同，属**基线既有属性**。
  其可利用性极低 —— 该规则只覆盖 3 个位置，且学生必须先听完前 3 题才知道规则是否成立，而前 3 题的答案本身就靠听材料获得；全序列最高频字母（A/C/D 各 4 次）盲猜得 26.7%，相对 25% 随机基准仅 +1.7 个百分点。
  **本轮未改动**（改动它需重写题目内容，远超“修 4 条缺陷”的授权范围，且会破坏已验证的唯一答案），**在此留档提请上游决定**。

### 7.4 15 题逐个选项代入验证（唯一最佳答案）

15 题 × 4 选项 = **60 项全部逐项代入材料**核验，四个选项**均有材料依据**，且每题有且仅有一个最佳答案 ✅

重点复验 4 个改动题：

| 题号 | 正确项依据 | 三项干扰排除依据 |
|---|---|---|
| A6-07 | B `Every twenty minutes.` ← `every twenty minutes` | A ← `not every ten`；C ← `Half an hour of that` 是看手机时长非远眺间隔；D ← `About two hours` 是总时长非间隔 |
| A6-11 | D `Stay at home and rest all day.` ← `stay home`+`rest` | A ← `stay home and miss PE class`；B ← `miss PE class`；C ← **`The school clinic is closed this afternoon` + `take your medicine at home`（双重排除，由隐含变显式）** |
| A6-12 | B `In the gym.` ← `Meet in the gym at four` | A ← `Not on the playground`；C ← `The classroom is too small.`；D ← `Is the hall booked?`+`That's right.`（问答确认） |
| A6-15 | D `On Monday and Wednesday.` ← `Practise that on Monday and Wednesday` | A ← Thursday 为运动会；B ← `Not on Friday`；C ← 有 Wednesday 无 Friday |

（A6-01/02/03/04/05/06/08/09/10/13/14 共 11 题的 44 项代入亦逐项通过，明细见报告 §7 与本次脚本输出。）

### 7.5 数字与时间算术逐段重算（15/15）

全部通过，无算术矛盾：

A6-01 22:00→06:00 = 8h 且 08:00 上课｜A6-02 **5 + 5 = 10** ✅｜A6-03 10 < 18 已过期｜A6-04 冰敷 15 分钟、明天看医生（条件句，与 this evening 无冲突）｜A6-05 明天 16:00 vs 周三 07:00，跑道整周维修｜A6-06 7:40 到场｜A6-07 120 分中 30 分看手机 = 1/4｜A6-08 走动 10 分钟｜A6-09 近一年 vs 每三个月｜A6-10 **6:50 → 7:10 = 20 分钟**，闹钟提前 10 分钟｜A6-11 昨晚起烧 + `this afternoon` 与设问时段一致｜A6-12 明天 4 点体育课后｜A6-13 7:00 体检 → 8:00 上课不迟到，9:00 排除｜A6-14 无算术｜A6-15 **100/400 = 1/4** 与“后 100 米冲刺”自洽

### 7.6 全卷三项扫描

- **悬空并列**：命中 3 处，逐条判读后**无悬空**
  - A6-04 `either` ← 前指 `swimming` 由同题 `go to the gym and swim after school` 明示 ✅
  - A6-07 `too` ← 追加于紧邻命题建议，命题层面并列 ✅
  - A6-12 `too` ← 程度副词“太”，非并列连词，误报 ✅
  - （A6-11 原有的悬空 `too` **已消除**，改后该题命中 0）
- **完成体预设答案**：全卷 **0 处**；唯一完成体形态为 A6-11 话轮 2 `How long have you had the fever?`（提问持续时长的标准用法，非预设答案）✅
- **称谓一致性**：15/15 通过 —— 每位被称呼的 `Ms./Mr. X` 都正是该题中以该头衔标注的说话人 ✅

---

## 8. 完整性核验：除 4 行外全文逐字节未变

将 4 处新文本**在内存中逆向还原**为原文本后重算哈希：

| 项 | 值 |
|---|---|
| 修复前 MD5 | `638BB764BA5599FEC57D684DEDEE5025`（8043 字节） |
| 修复后 MD5 | `140F0A904D8EF34BD8831EC663BD3A3B`（8056 字节） |
| 逆向还原后 MD5 | `638BB764BA5599FEC57D684DEDEE5025`（8043 字节）✅ **与基线逐字节相同** |

→ 证明本次改动**精确地只触及 4 行**，无任何附带格式改动。行尾保持 **LF**（222 处）、**无 BOM**、UTF-8 编码不变。

---

## 9. 汇总

| 项 | 数量 |
|---|---|
| 严重缺陷已修复 | **2**（A6-12 语法/标点；A6-15 词数超限） |
| 中等缺陷已修复 | **2**（A6-11 悬空并列 + 取药来源；A6-07 非地道提问） |
| **回退** | **0**（四处改动均经改后自查验证无副作用，无“改完更糟”情形） |
| 轻微缺陷 | **7 条一律未动**（按指令） |
| 修改文件 | `data/item-bank/A6.md`（4 行）+ 新建本文件 |

**A6-15 词数（两个读数）**：改前 **61 / 60** → 改后 **57 / 56**（字面 / 去纯标点），上限 60，超限已消除。

## 10. 留档提请上游注意（未处理）

1. **答案序列 p = 12 形式命中**（3/3，可比较 3 对 ≥ 2）：基线既有，本轮未引入亦未改动，详见 §7.3。
2. **A6-05 恰为 60 词、零余量**：基线既有（轻微 L4），本轮未动；后续任何对该题的微调都会立刻翻越上限，必须重新计数。
3. **报告 §2 严重 1「改后自查」对选项 C 的描述语句自相缠绕**，但其结论正确；属报告叙述瑕疵，不影响材料，详见 §6。
