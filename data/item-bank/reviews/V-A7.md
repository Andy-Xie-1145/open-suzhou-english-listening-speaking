# 审核报告：data/item-bank/prod/A7.md 修复后独立复核（V-A7）

## 结论

- **审核范围**：15 题 / 60 个选项，**逐题逐选项全判，未抽样**。
- **当前磁盘版本能否归档**：**可以归档**。两轮修复（F1 四处、F2 一处）**均已真正落盘**，**未引入任何新的严重或中等缺陷**；15 题 15 个答案全部正确且唯一，45 个干扰项 **45/45 可由本段材料中的一句原文直接排除**。
- **缺陷计数：严重 0 条｜中等 1 条｜轻微 15 条。**
- 唯一的中等缺陷是本轮**新发现**的（A7-01 选项同类性，R2 未记录），属表达层，**不影响判分有效性**，按 REVIEW-RUBRIC §4.5「拿不准的标为中等并写明理由」处理。
- **R2-A7 遗留的中等 M5（A7-12 第 203 行 `Who do we play in the final?`）已由 F2 真正修好**，当前原文为 `Who do we play against in the final?`，语法与搭配均正确。
- **词数**：A 类上限 60，实测 min 46（A7-10）／max 59（A7-15），**超限 0 段、贴线 0 段**。**A7-15 确为 59/60（余量 1 词），且 F1、F2 两轮均未触碰该段**（见第 2 节字节级反证）。
- **答案排列**：严格周期检测（p=2…6）全部阴性；最长连续相同 = 1；四字母覆盖 A4/B4/C3/D4 完整。**位置偏斜不成立**，本次用**精确穷举全部 15,765,750 种排列**（两种独立实现互校）重做检验，四项统计量在 α=0.05 下全部不显著。
- **闸门**：`verify-bank.ps1` → A7 行 **PASS(15题)**，退出码 0；`check-integrity.ps1` → A7 行 **MISMATCH**（R2 记录 85c0ed…／当前 eeb1e0…），**这正是 F2 已落盘的证据**，本报告全部判定针对当前字节作出；`wordcount-gate.ps1` → **FAIL，但 FAIL 段落全部属于 A8，不属于 A7**（见第 1.1 节的并发写入反证）。
- **与任务书描述不符之处 1 处（可证明的算术错误）**：任务书第 31 行「R2 曾用精确枚举 **15,766,500** 种排列」与 R2-A7 §7.4 同源数字**均不正确**；正确值为 **15,765,750**，差 750（见第 7 节 D1）。
- **本轮未对 prod/A7.md 做任何写入**（收尾复算 MD5 仍为 eeb1e0a39a93b94a3f9a5c3263bce892，与开工时一致）。除授权的 R2-A7.md 外，**未人工阅读 reviews/ 与 fixes/ 下任何文件**。

---

## 0. 字节级前置校验（_COMMON.md §1）

| 项目 | 值 |
|---|---|
| 文件路径 | D:\Projects\Open English Listening and Speaking\data\item-bank\prod\A7.md |
| 字节数 | **6957** |
| 行数 | 270 行内容（LF 270，CR 0，以 LF 结尾，split 长度 271） |
| MD5 | **EEB1E0A39A93B94A3F9A5C3263BCE892** |
| BOM / CRLF | 无 BOM（首三字节 62,32,65）；无 CR，纯 LF |
| HTML 注释块 | 0 个 |
| 是否一致 | **一致** |

两次独立读取结果逐位一致：

1. PowerShell `[System.IO.File]::ReadAllBytes()` + `MD5.Create().ComputeHash()` → 6957 字节，MD5 `eeb1e0a39a93b94a3f9a5c3263bce892`，LF 270 / CR 0，末字节 10。
2. Node `fs.readFileSync()` + `crypto.createHash('md5')` → 6957 字节，同一 MD5，split 长度 271。
3. 同一 Node 进程内二次 `readFileSync` → `buf.equals(buf2) === true`，MD5 相同。
4. 行读取工具复读全文 270 行，与字节流的 LF 计数吻合。

**基线对照（R2-A7 §0 记录的 MD5，为授权可引的唯一上游基线）**：

| | MD5 | 字节数 |
|---|---|---|
| R2-A7 实测基线 | 85C0EDAD35BD6CBD91DEFB44FD39FA34 | 6949 |
| 本轮实测 | EEB1E0A39A93B94A3F9A5C3263BCE892 | 6957 |
| 差异 | **已变化（+8 字节）** | |

**+8 字节的反证**：`" against"` 恰为 1 个空格 + 7 个字母 = 8 字节。这与「F2 只把 A7-12 第 203 行半句改成 `Who do we play against in the final?`」**逐字节吻合**，且 15 段的词数除 A7-12 外与 R2 记录**逐段完全相同**（见第 2 节），构成 F2 改动半径被限制在单行的字节级证明。

---

## 1. 必跑门禁（原样粘贴）

### 1.1 wordcount-gate.ps1

    pwsh -Command "& docs/pipeline/wordcount-gate.ps1"

第 1 次运行原始输出：

    OVER-LIMIT BLOCKS: 3
      A8         ## A8-03 请邻居代喂狗                         63 > 60
      A8         ## A8-06 钢琴课练到几点                        62 > 60
      A8         ## A8-14 搬家上五楼                          66 > 60
    EXITCODE=1

时间戳：2026-10-03 23:16:13（第一次）/ 2026-10-03 23:16:16（重跑）。
prod/A7.md LastWriteTime = 2026/10/3 23:08:19；prod/A8.md LastWriteTime = 2026/10/3 23:15:18。

重跑一次原始输出：

    OVER-LIMIT BLOCKS: 3
      A8         ## A8-03 请邻居代喂狗                         63 > 60
      A8         ## A8-06 钢琴课练到几点                        62 > 60
      A8         ## A8-14 搬家上五楼                          66 > 60
    EXITCODE=1

**判读（按 _COMMON.md §2 处理）**：该脚本为全库扫描、不接受路径参数。FAIL 指向的三段**全部属于 A8 批次，没有一段属于 A7**。A8.md 的最后写入时间（23:15:18）晚于 A7.md（23:08:19）且落在本轮作业窗口内，属并发批次写入造成的时间差。**已按规约记录时间戳并重跑一次，结论不变。A7 的 0 段超限由我在第 2 节按 1.10 口径独立逐段复算确证。** 本条不计为本轮缺陷。

### 1.2 check-integrity.ps1

    pwsh -Command "& docs/pipeline/check-integrity.ps1"

A7 行原文与脚本结尾原文：

    A7 | R2-A7.md | 弱匹配(同行含MD5字样) | 85c0edad35bd6cbd91defb44fd39fa34 | eeb1e0a39a93b94a3f9a5c3263bce892 | MISMATCH
    ...
    总计 26 个批次；需关注 4 个。
    EXITCODE=1

**判读**：A7 行 MISMATCH = 最新报告（R2-A7）记录的 MD5 与当前不一致，说明 R2 之后文件被改过，**即 F2 已落盘**。本报告全部判定基于当前实测 MD5 `eeb1e0a3…`，**故本轮结论有效**。退出码 1 来自其余 3 个需关注批次（E1 UNVERIFIED+被改动、C5 MISMATCH、D6 MISMATCH）与 1 个无报告批次（A8），**均不属本轮授权范围，不是 A7 的缺陷**。（批次总数由 R2 时的 25 增至 26，是 A8/C5/D6 等 prod 批次落盘所致，非 R2 错误。）

> 说明：按 _COMMON.md §2b 第 40–46 行的裁定，本次运行 `check-integrity.ps1` 属**闸门运行**（脚本只提取 MD5 并与磁盘比对，不输出审核内容），**不是人工阅读 reviews/ 目录**。

### 1.3 verify-bank.ps1

    pwsh -Command "& docs/pipeline/verify-bank.ps1"

A7 行与结尾原文：

    A7 | A | prod | PASS(15题)
    ...
    共 26 个批次；答案序列不一致 0 个。
    ALL CONSISTENT
    EXITCODE=0

---

## 2. A 类 60 词上限逐段复算（REVIEW-RUBRIC §1.10 唯一口径：空白分词、只数 Dialogue 正文、**含说话人标注**）

| 题号 | 含标注（判定口径） | 去标注（对照） | 上限 | 余量 | R2-A7 记录 | 差值 | R2 记的 R1 基线 | 相对 R1 差值 |
|---|---|---|---|---|---|---|---|---|
| A7-01 课间借尺 | **57** | 50 | 60 | 3 | 57 | 0 | 57 | 0 |
| A7-02 早餐两杯茶 | **47** | 42 | 60 | 13 | 47 | 0 | 47 | 0 |
| A7-03 买十二元的本子 | **53** | 46 | 60 | 7 | 53 | 0 | 53 | 0 |
| A7-04 米饭要炒的 | **56** | 50 | 60 | 4 | 56 | 0 | 56 | 0 |
| A7-05 周六坐公交 | **51** | 46 | 60 | 9 | 51 | 0 | 53 | −2 |
| A7-06 周五上午看牙 | **50** | 45 | 60 | 10 | 50 | 0 | 50 | 0 |
| A7-07 借书两周 | **58** | 52 | 60 | 2 | 58 | 0 | 58 | 0 |
| A7-08 平寄五日到 | **58** | 53 | 60 | 2 | 58 | 0 | 57 | +1 |
| A7-09 周一上午报名 | **48** | 42 | 60 | 12 | 48 | 0 | 48 | 0 |
| A7-10 周四交历史作业 | **46** | 40 | 60 | 14 | 46 | 0 | 44 | +2 |
| A7-11 雨伞不要帽子 | **47** | 43 | 60 | 13 | 47 | 0 | 47 | 0 |
| A7-12 决赛对手 | **55** | 48 | 60 | 5 | 54 | **+1（F2）** | 51 | +4 |
| A7-13 七月十五夏令营 | **47** | 43 | 60 | 13 | 47 | 0 | 47 | 0 |
| A7-14 周六校门集合 | **47** | 41 | 60 | 13 | 47 | 0 | 47 | 0 |
| A7-15 家长会提前半小时 | **59** | 52 | 60 | **1** | 59 | 0 | 59 | 0 |

实测：**min 46（A7-10）／max 59（A7-15）／超 60 段数 = 0／恰好贴 60 的段数 = 0**。去标注口径 min 40／max 53，同样 0 段超限。

**三点关键结论：**

1. **A7-15 = 59/60，余量 1 词，现仍未超限。** 该段词数相对 R1 基线 **delta = 0**、相对 R2 实测 **delta = 0**，加上全文件只增加了 8 字节且逐段落点在 A7-12，**三重证据证明 F1 与 F2 都没有触碰 A7-15**。任务书该条陈述成立。
2. **A7-12 由 54 → 55**，与 F2 的最小改动预测一致；55 ≤ 60，余量 5，无降词必要。
3. **F1 的改动半径被限制在 A7-05 / 08 / 10 / 12 四段**：其余 11 段相对 R2 实测 **delta 全为 0**，且相对 R1 基线 delta 也全为 0。**没有旁及修改、没有连带降词。**

余量最小的三段：A7-15 = 1 词、A7-07 = 2 词、A7-08 = 2 词（按 §1.7b「零余量/小余量记录但不判缺陷」处理）。

---

## 3. 两轮修复的 5 处改动点：连带检查（任务书重点核查项 1）

先把 5 处当前原文逐字列出（含周边句与逐句词数）：

**A7-05（F1 · M3 推理链）**
    L79 (10词): Boy: Excuse me. How can I get to the museum?
    L80 (12词): Man: Take bus No. 15 and get off at the third stop.
    L81 ( 7词): Boy: Is there a train as well?
    L82 (15词): Man: Yes. It leaves from the north station, but it does not run on Saturdays.
    L83 ( 7词): Boy: Saturday. Then I take the bus.

**A7-08（F1 · M1 选项 A 无出处）**
    L134 (13词): Boy: Hello. I want to send this box to my aunt in Nanjing.
    L135 (11词): Clerk: It weighs three kilos. Do you want express or post?
    L136 ( 8词): Boy: Post, please. I have no express money.
    L137 (15词): Clerk: Then it will take five days. Express takes one day, the train two days.
    L138 (11词): Boy: Five days is fine. My aunt's birthday is on Sunday.

**A7-10（F1 · M2 选项 C 无出处）**
    L169 ( 9词): Girl: Ms. Fang, when is our history paper due?
    L170 (16词): Ms. Fang: On Thursday. Not on Friday, and Monday or Wednesday is too early for me.
    L171 (10词): Girl: Shall I give it to you in the office?
    L172 (11词): Ms. Fang: No, come to Room 3 at nine on Thursday.

**A7-12（F1 · M4 班别缺失 + F2 · M5 搭配缺失）**
    L203 (16词): Boy: Ms. Pei, our class is Class Two. Who do we play against in the final?
    L204 (14词): Ms. Pei: Class Two against Class Five. The match starts at three on Friday.
    L205 ( 7词): Boy: Is it on the big playground?
    L206 (14词): Ms. Pei: No, the small one. The big one is under repair this week.
    L207 ( 4词): Boy: Fine. Friday, then.

**A7-15（两轮均未触碰，列作对照）**
    L255 (14词): Teacher: Ms. Li, the parents' meeting is on Tuesday at four. Can you come?
    L256 (11词): Ms. Li: I work on Tuesday evening. Is there another meeting?
    L257 (12词): Teacher: No, only one. But you can come at half past three.
    L258 ( 8词): Ms. Li: Then I'll come early. Which room?
    L259 (14词): Teacher: Room 2 on the second floor, not Room 5 on the ground floor.

### 3.1 五处逐点判定

| # | 改动点 | 语法 | 与周边句自洽 | 词数 | 干扰项依据是否被削弱 | 推理链是否塌缩成单句直取 | 判定 |
|---|---|---|---|---|---|---|---|
| 1 | A7-05 L82 | ✓ 正确（does not run on Saturdays 地道） | ✓ 与 L80 的公交方案、L81 的提问一致 | 15 词，全批第三长 | ✗ 未削弱：A/B/C/D 四值全部仍可由 L80+L82+L83 排除 | ✗ 未塌缩：公交方案 → 问火车 → 火车周六不开 → 认定当天是周六 → 决定坐公交，**三步推理** | **修复有效，无新缺陷** |
| 2 | A7-05 L83 | ✓ 语法正确（省略式） | ✓ 承接 L82 的周六因果 | 7 词 | ✗ 未削弱：C/D 的 `Sunday` 由「当天 = Saturday」反证 | ✗ 未塌缩 | 修复有效；省略式记轻微 E3 |
| 3 | A7-08 L137 | ✓ 正确 | △ 与 L135「express or post」二选一不完全闭合（追加 the train） | 15 词 | ✗ 未削弱：one/two/five 三值全部由本行给出，A/B/D 仍各自可溯源 | — | 修复有效；衔接记轻微 E7 |
| 4 | A7-10 L170 | ✓ 正确（or 就近一致 is，合法） | ✓ 与 L172 的 Room 3 at nine on Thursday 一致 | 16 词（全批最长单轮） | ✗ 未削弱：四个日期值全部有出处 | — | 修复有效；理由反直觉记轻微 E9 |
| 5 | A7-12 L203 | ✓ **F2 后已完全正确**（`play against` 规范搭配） | ✓ 与 L204 的完整赛程、L207 的「Friday, then」一致 | 16 词，本段 55/60 | ✗ 未削弱：Class One/Three/Six 仍被 L204 的完整赛程零出现地排除 | ✗ 未塌缩 | **F2 修复有效，M5 消失** |
| 对照 | A7-15 L255–259 | ✓ | ✓ 时间线自洽 | 59/60 | — | — | 两轮均未改动 |

### 3.2 「有没有改动使干扰项失去依据 / 使两步推理塌缩」的专项结论

- **没有任何一处改动使干扰项失去依据。** 45 个干扰项在本轮复算中仍 **45/45 可由本段材料原句排除**（见第 4 节）。
- **没有任何一处两步推理塌缩成单句直取。** 5 段中真正需要跨句推理的三段——A7-05（公交 vs 火车 vs 周六）、A7-08（选了 post → 五天）、A7-12（本班 Class Two → 对手 Class Five）——都保持了至少两步。
- **答案字母序列未被任何一轮修复改动**：当前 `D B C A B D A C B D A C A D B`，与第 270 行汇总行逐位一致。
- **F1/F2 均未产生新的语法错误、新的零命中选项、新的材料矛盾。**

---

## 4. 15 题 × 4 选项逐项判定（60/60 全覆盖，未抽样）

判定方法：先用脚本对 60 个选项做「内容词在**本段**对话中的出现」扫描，再对每个干扰项人工给出**可将其排除的那一句材料原话**。★ 为正确答案。

### A7-01 课间借尺（Answer D）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据（材料原话） |
|---|---|---|---|
| A | At ten fifteen. | — | L8 `The bell rings at ten. Class Two begins at ten fifteen.` + L7 `give it back before the bell`：归还必须在十点前，十点十五必晚于铃 |
| B | At ten thirty. | thirty | 同上；且 `thirty` 在本段零出现 |
| C | After Class Two. | after | 同上；二班十点十五才开始，「二班之后」远晚于铃 |
| D ★ | Before the bell rings at ten. | — | L7 + L8，**唯一** |

### A7-02 早餐两杯茶（Answer B）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | Ben and his father. | — | L28 `two cups. One is for your father and one for me`：第二杯已指派给 Mum，没有 Ben 的 |
| B ★ | Ben's father and Mum. | — | 同上，**唯一** |
| C | Mum and Ben. | — | 同上：第一杯已指派给 father，不是 Ben |
| D | Ben's father and his sister. | sister | 同上，且全段零出现第三人 |

### A7-03 买十二元的本子（Answer C）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | Four yuan. | — | L44 `My friend buys the four yuan one`（那是朋友）+ L45/L46 选十二元 |
| B | Twenty yuan. | — | L43 有售但 L45 `Take the twelve yuan one` 排除 |
| C ★ | Twelve yuan. | — | L45 + L46 `Twelve yuan, please.`，**唯一** |
| D | Five yuan. | — | 同 B |

### A7-04 米饭要炒的（Answer A）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A ★ | Fried. | — | L63 `Fried, please.`，**唯一** |
| B | Boiled. | — | L63 `Fried, please.` + `Boiled rice is too plain for me` |
| C | Fried with soup. | — | L63 锁定 fried，L65 `Without soup.` 锁定无汤（原文的 soup 修饰 chicken，见 E2） |
| D | Boiled with soup. | — | L63（boiled）+ L65（without soup）双反证 |

### A7-05 周六坐公交（Answer B）—— F1 修复段

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | By train today. | today | L82 `it does not run on Saturdays` + L83（当天即周六且已决定坐公交） |
| B ★ | By bus. | — | L80 `Take bus No. 15` + L83 `Then I take the bus.`，**唯一** |
| C | By bus on Sunday. | sunday | L83 确立「当天 = Saturday」并当场决定乘公交，`on Sunday` 与当天事实冲突 |
| D | By train on Sunday. | sunday | L82（火车周六不开）+ L83（决定乘公交）双反证 |

### A7-06 周五上午看牙（Answer D）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | On Friday afternoon. | — | L98 `Come back on Friday morning` + L99 `I have a maths test on Friday afternoon` |
| B | On Thursday morning. | thursday | 与 L98 直接矛盾 |
| C | On Monday afternoon. | monday | 与 L98 直接矛盾 |
| D ★ | On Friday morning. | — | L98 + L101，**唯一** |

### A7-07 借书两周（Answer A）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A ★ | Two weeks. | — | L119 `You may keep it for two weeks.`，**唯一** |
| B | One week. | — | L119 `One week is too short` |
| C | One month. | — | L119 `one month is too long` |
| D | Three weeks. | three | L119 只给出 two weeks 一个可借期；three 在本段零出现 |

### A7-08 平寄五日到（Answer C）—— F1 修复段

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | One day. | — | L137 `Express takes one day`；L136 选的是 `Post`，未选快递 |
| B | Two days. | — | L137 `the train two days`；未选火车 |
| C ★ | Five days. | — | L137 `Then it will take five days.`（接 L136 的 post）+ L138，**唯一** |
| D | Three days. | — | 本段 three 只出现在 L135 `It weighs three kilos`（重量），与天数无关；平寄天数已由 L137 锁定为 five |

### A7-09 周一上午报名（Answer B）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | On Tuesday morning. | tuesday | 与 L153 `on Monday morning` 矛盾 |
| B ★ | On Monday morning. | — | L153 + L155 `At nine, before lunch.`，**唯一** |
| C | On Monday after lunch. | — | L155 `before lunch` + `After nine it is busy` |
| D | On Friday morning. | friday | 与 L153 矛盾 |

### A7-10 周四交历史作业（Answer D）—— F1 修复段

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | On Wednesday. | — | L170 `Monday or Wednesday is too early for me` |
| B | On Friday. | — | L170 `Not on Friday` |
| C | On Monday. | — | L170 同上（**M2 修复后 Monday 已补上出处**） |
| D ★ | On Thursday. | — | L170 `On Thursday.` + L172，**唯一** |

### A7-11 雨伞不要帽子（Answer A）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A ★ | An umbrella. | — | L187 `Take an umbrella, not a hat`，**唯一** |
| B | A hat. | — | L187 `not a hat` |
| C | His thick coat. | — | L188 提问 + L189 `No. It's only fifteen degrees.` |
| D | His new shoes. | — | L189 `Wear your old shoes, not the new ones` |

### A7-12 决赛对手（Answer C）—— F1 + F2 两轮修复段

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | Class One. | one | L204 完整赛程 `Class Two against Class Five` 只含两个班别；one 在本段零出现 |
| B | Class Three. | three | 同上；three 在本段零出现 |
| C ★ | Class Five. | — | L203 `our class is Class Two` + L204，**唯一** |
| D | Class Six. | six | 同上；six 在本段零出现 |

> **注（对 R2-A7 §5 的更正）**：R2 在 A7-12 行把 A/B/D 三项都写成「全命中」，其中 A 行还自相矛盾地加了括注「（本段无 one）」。实测 A/B/D **各有零命中词**（one / three / six），故 R2「零命中选项共 15 个」应为 **16 个**。结论（三项均可由 L204 排除）不受影响。

### A7-13 七月十五夏令营（Answer A）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A ★ | On the fifteenth of July. | — | L222 + L224，**唯一** |
| B | On the first of July. | — | L222 `not on the first` |
| C | On the fifth of July. | — | L223 是 cousin 的日子 + L224 `No.` 拒绝 |
| D | On the tenth of July. | — | L224 `You have an exam on the tenth`（考试在十日，夏令营在十五日，不冲突） |

### A7-14 周六校门集合（Answer D）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | At the library. | — | L239 `Not at the library or the bus stop` |
| B | At the bus stop. | — | 同上 |
| C | At the children's park. | park | L239 `At the school gate at eight` 已把地点唯一锁定；children 在 L241 指旧人院里的孩子，与 park 无关 |
| D ★ | At the school gate. | — | L238 + L239，**唯一** |

### A7-15 家长会提前半小时（Answer B）

| 选项 | 文本 | 零命中词 | 排除 / 成立依据 |
|---|---|---|---|
| A | On Monday at four. | monday | 与 L255 `on Tuesday at four` 矛盾 |
| B ★ | On Tuesday at half past three. | — | L255（周二）+ L257 `But you can come at half past three` + L258 `Then I'll come early`，**唯一** |
| C | On Tuesday at four. | — | L257 把时间改到三点半 + L258 接受，双反证 |
| D | On Wednesday at four. | wednesday | 与 L255 矛盾 |

### 4.1 溯源汇总

- 选项总数 **60**，正确项 15，干扰项 **45**，全部逐项判定完毕，**无一抽样**。
- **45/45 干扰项均可被本段材料中的一句原文直接反证**，无一项只能靠常识/生活经验排除。
- 含零命中词的选项共 **16** 个（A7-01×2、A7-02×1、A7-05×3、A7-06×2、A7-07×1、A7-09×2、A7-12×3、A7-14×1、A7-15×2），**正确项一个都没有零命中词**。上述 16 项已全部在对应表格中给出直接反证句。
- 逐题零命中数最多的是 **A7-05 = 3**（today / sunday / sunday）。三者均能由 L82 + L83 的原文因果链直接排除，**不属「只能靠生活常识排除」**的缺陷性质，故不判严重。
  > 关于「两个以上选项无出处即判严重」这一判据：其出处是 R1 转述的更上游派单文本，我**未获授权阅读**该派单，故按 R2 的转述口径处理并在此声明。R2 把该判据降为轻微的理由（排除依据仍在材料内）我独立复核后**成立**。
- **未发现任何一题答案不唯一、答案错误、材料自相矛盾、选项重复或题干泄底。**

---

## 5. 答案排列（任务书重点核查项 4，全部穷举，未抽样）

答案序列：**`D B C A B D A C B D A C A D B`**（与第 270 行汇总行逐位一致）

### 5.1 周期性（REVIEW-RUBRIC §1.8 第 1 项，p = 2…6）

| p | 判定 | 相同位数 / 应有位数 | 首个失配位 |
|---|---|---|---|
| 2 | 非周期 | 1 / 13 | i=0 |
| 3 | 非周期 | 2 / 12 | i=0 |
| 4 | 非周期 | 5 / 11 | i=0 |
| 5 | 非周期 | 2 / 10 | i=1 |
| 6 | 非周期 | 2 / 9 | i=0 |

**阴性。** 五种周期全部不成立。

### 5.2 连续扎堆（§1.8 第 2 项）

**最长连续相同 = 1**，**无任何两个相邻答案相同**，3 连及以上：无。

### 5.3 四字母覆盖

**A=4　B=4　C=3　D=4**。四个字母全部被用作正确答案，**不存在「某字母从不作答案 = 固定陷阱」的键位缺陷**。

### 5.4 位置偏斜 —— 精确穷举（L-83）

**零假设空间**：多重集 {A4, B4, C3, D4} 的全部排列，共 **15!/(4!·4!·3!·4!) = 15,765,750** 种。
**穷举方式**：递归全枚举（非抽样），**另用第二种独立实现复算，两者逐格完全一致**（总数、分布、均值三项均相同）。

| 统计量 | 本卷实测 | 精确零分布 | P 值 | α=0.05 |
|---|---|---|---|---|
| 严格周期（p∈{2..6}） | 无 | 6 / 15,765,750 | 0.00004% | 不显著（阴性） |
| 最长连续相同 ≥ 3 | **1**（无 ≥3） | 4,638,504 / 15,765,750 | P = **29.4214%** | 不显著（阴性） |
| p=4 最佳周期套用得分 | **9 / 15** | 均值 **7.4791**；P(=9)=12.6265%，**P(≥9)=96.4946%** | 实测值位于第 96.5 百分位，**远未达尾部** | 不显著 |
| p=2..6 最佳套用得分 | **9 / 15** | 均值 **9.0230**；**P(≥9)=71.0384%** | 低于零假设均值 | 不显著 |
| p=4 残差类单一字母众数 | **3 / 4**（类1 = B,D,D,D） | P(=3) = **28.8921%**；P(=4) = 0.6554% | 恰为分布主体 | 不显著 |

**残差类明细（p=4）**：

| 类 | 题号 | 序列 | 明细 | 众数 |
|---|---|---|---|---|
| 0 | Q1/5/9/13 | D B B A | D×1, B×2, A×1 | B×2 |
| 1 | Q2/6/10/14 | B D D D | B×1, D×3 | **D×3** |
| 2 | Q3/7/11/15 | C A A B | C×1, A×2, B×1 | A×2 |
| 3 | Q4/8/12 | A C C | A×1, C×2 | C×2 |

**额外做的一项更贴近「学生实际套规律」检验——固定答案版式盲套**（同样穷举全部 15,765,750 种排列）：

| 学生可能套用的版式 | 本卷实测命中 | 精确零分布 |
|---|---|---|
| DCBA… | 4/15 = 26.67% | P(≥4) = 53.1056% |
| ABCD… | 3/15 = 20.00% | P(≥3) = 75.2325% |
| BCAD… | 4/15 = 26.67% | P(≥4) = 53.1056% |
| DBCA… | 4/15 = 26.67% | P(≥4) = 53.1056% |
| CBDA… / ACBD… | 2/15 = 13.33% | P(≥2) = 91.1569% |

**六种常见版式中盲套最好得分 = 4/15 = 26.67%（精确 P(≥4) = 97.8613%）**，与「四选一随机期望 25%」和「最高频字母盲猜 4/15 = 26.67%」**同一水平线**。学生无论套周期还是套版式，**都没有可利用的超额收益**。

**§1.8b「逐空位置偏斜 ≥70% 即判缺陷」的适用性**：该条明文限定为「**表格填空类**的逐空位置偏斜」。A 类是四选一选择题，只有单一答案槽，其位置维度即答案字母本身，而字母覆盖 A4/B4/C3/D4 已均衡。**本项对 A7 不适用，不作为判定依据**（不按「不适用即写 PASS」的纪律处理，此处明确写「不适用」并给出理由）。

**一项需要如实记录的反向尾部读数**：实测最长连续相同 = 1，在零分布中的精确占比为 **4.4006%**（低于 5%）。但该判据是**单侧**的（只惩罚 ≥3 连扎堆），1 意味着**完全没有相邻重复 = 过度分散**，方向对题目有利。故**不判缺陷**，仅在此如实记录该读数与方向，避免读者误以为漏查。

**综合判定：位置偏斜不成立。** 本结论由本轮独立穷举作出，不引用 R1 或 R2 的任何数字。

---

## 6. 开场白去重、话轮相似度与语义同构（任务书重点核查项 5）

### 6.1 开场白归一化去重

| 题号 | 行 | 说话人 | 开场白 |
|---|---|---|---|
| A7-01 | L6 | Boy | Ms. Hu, may I use your ruler? Mine is in my bag. |
| A7-02 | L24 | Mum | Ben, it's Saturday. Get up, or we'll miss the train. |
| A7-03 | L42 | Boy | Good afternoon, Mr. Sun. I need a notebook for science. |
| A7-04 | L60 | Waiter | Good evening. What would you like to eat? |
| A7-05 | L79 | Boy | Excuse me. How can I get to the museum? |
| A7-06 | L97 | Boy | Doctor, my tooth hurts, and I love ice cream. |
| A7-07 | L115 | Librarian | Can I help you? |
| A7-08 | L134 | Boy | Hello. I want to send this box to my aunt in Nanjing. |
| A7-09 | L152 | Girl | Mr. Li, how can I join the photography club? |
| A7-10 | L169 | Girl | Ms. Fang, when is our history paper due? |
| A7-11 | L186 | Boy | Mum, may I wear my new shoes and a hat today? |
| A7-12 | L203 | Boy | Ms. Pei, our class is Class Two. Who do we play against in the final? |
| A7-13 | L221 | Girl | Mum, when does the summer camp start? |
| A7-14 | L238 | Boy | Ms. Wei, where do the volunteers meet on Saturday? |
| A7-15 | L255 | Teacher | Ms. Li, the parents' meeting is on Tuesday at four. Can you come? |

**前 3 词 key / 前 6 词 key / 整句归一化三档扫描：均 15/15 互不相同，重复命中 0。** 无「N 题同一开场」形态。

### 6.2 全话轮 Jaccard（阈值 0.6）

**72 个话轮 / 2556 对，J ≥ 0.6 命中 0；J ≥ 0.4 的对数也为 0。**

最高一对：

| Jaccard | 话轮 A | 话轮 B |
|---|---|---|
| 0.3333 | A7-06:101 `All right. Friday morning, then.` | A7-12:207 `Fine. Friday, then.` |

该最高值完全来自 `All right./Fine.` 与 `Friday…then.` 这类招呼语和功能词的重合，属噪声，**不构成重复轮次**。

**句级精确重复扫描**：131 个句子中仅 3 组重复，全部是 `Ms`(×5)、`All right`(×3)、`No`(×2) 这类称谓/应答语的切分假象，**无一处复制粘贴**。
（与 R2-A7 §8.1 记的「145 个句子」口径不同；R2 未写明其切分口径，结论「无复制粘贴」双方一致。）

### 6.3 语义同构专项（任务书点名要查）

**逐项人工判读结果：**

- **人物配对 15 种，无一对重复**：Boy+Ms. Hu / Mum+Ben / Boy+Mr. Sun / Waiter+Girl / Boy+Man / Boy+Doctor / Librarian+Boy / Boy+Clerk / Girl+Mr. Li / Girl+Ms. Fang / Boy+Mum / Boy+Ms. Pei / Girl+Mum / Boy+Ms. Wei / Teacher+Ms. Li。与 Boy 搭配的成对方 7 例（Ms. Hu / Mr. Sun / Man / Doctor / Clerk / Ms. Pei / Ms. Wei）对象各异。
- **情境两两互异**：借尺 / 早餐 / 买本子 / 点餐 / 问路 / 看牙 / 借书 / 寄件 / 社团报名 / 交作业 / 出门穿带 / 班级赛 / 夏令营 / 志愿服务 / 家长会。**无任何两段情境重合**，按 REVIEW-RUBRIC §1.7「情境高度雷同」判据，**不构成雷同缺陷**。
- **但句式骨架确实高度同构，实测如下（记为轻微 E14）**：
  - **11/15 段**由学生（Boy 8 段 / Girl 3 段）开口向成人提问；
  - **8/15 段**恰为 5 话轮（分布：4 话轮 5 段、5 话轮 8 段、6 话轮 2 段）；
  - **7/15 段**以学生复述/确认决定收尾（A7-03/04/05/06/07/08/12）；
  - **12/15 段**使用「显式否定/排除备选项」装置（not cereal、not the beef、too plain、Without soup、does not run on Saturdays、Eat no ice cream、can't/only、no express money、Not on Friday、too early、not a hat、not the new ones、not on the first、Not at the library or the bus stop、No/only one、not Room 5）。
- **判定**：这是**表达层面的模板化**，考点类型与情境均不重复，不属「考点重复」，**判轻微**。若日后需要提升，可把 2–3 段的骨架改为非「问答—确认」形态。

---

## 7. 与 R2-A7 任务书、依据报告的逐条核验与反证（_COMMON.md §7）

**本节的每一条都回到题目原文重新计算，不采信上游自证。**

### 7.1 任务书陈述中**成立**的

| 任务书陈述 | 核验结果 |
|---|---|
| 「A7-12 第 203 行 `Who do we play in the final?` 结构不完整，play 缺 against」 | **已被 F2 修好**：当前 L203 为 `Who do we play against in the final?`，语法与搭配均正确 |
| 「F2-A7 已改：只把这半句改成 …，A7-12 由 54 词变 55 词」 | **成立**：L203 逐字命中，16 词；本段 55/60；全文件仅 +8 字节 = `" against"` |
| 「A7-15 只剩 1 词余量，F1 与 F2 都没有碰它」 | **成立**：本轮实测 59/60；相对 R2 实测 delta=0、相对 R1 基线 delta=0；+8 字节落在 A7-12 |
| 「实测 min 46（A7-10）／max 59（A7-15）」 | **成立**，与本轮实测逐位一致 |
| 「A 类上限 60」 | **成立**：超限 0 段、贴线 0 段 |

### 7.2 任务书/R2 中**不成立**的陈述（反证）

**D1（可证明的算术错误）——排列总数 15,766,500 是错的。**
任务书第 31 行与 R2-A7 §7.4 均写「精确枚举 **15,766,500** 种排列」。实算：

    15! / (4! · 4! · 3! · 4!) = 1,307,674,368,000 / 82,944 = 15,765,750

**差 750 种。** 本轮的递归全枚举与第二种独立实现**都恰好产出 15,765,750**，与公式一致。因此 **15,766,500 这一数字在任何排列口径下都不成立**，**该声明不成立**。（结论方向不受影响：真实分母更小，尾部概率只微增。）

**D2 —— R2 §7.4 的两个零假设概率在本文写明的定义下无法复现。**
我把定义写清楚以便复核：「p = q 的最佳周期套用得分 = 把 15 题按位置 mod q 分成 q 个残差类，每类取该类字母的**众数**作猜测，命中数求和」（允许 p=2..6 各取一套模板，逐 p 取最优）。
在此定义下的精确穷举结果为：

| 统计量 | R2 所称 | 本轮实测（定义见上） |
|---|---|---|
| p=4 最佳得分 9/15 的 P(≥9) | 16.1319% | **96.4946%** |
| p=4 最佳得分 9/15 的 P(≥8) | 49.3626% | **83.8681%** |
| p=4 零假设均值 | 7.243 / 7.4791 | **7.4791**（与 R2 后一个数字一致） |
| p=4 残差类众数 ≥75% | 29.5475% | **28.8921%**（P(众数 = 3/4)） |

均值能对上而尾部对不上，说明**定义基本相同、计数环节有误**。R2 未写出其统计量定义，故其数字**不可原样沿用**。**但两轮的结论方向一致，且本轮的结论更强**：实测值 9/15 位于零分布第 96.5 百分位、低于「p=2..6 取最优」时的零假设均值 9.0230，**比 R2 的结论更明确地否定位置偏斜**。

**D3 —— R2 §5 A7-12 行的「出处扫描」栏与它自己的括注自相矛盾。**
R2 把 A/B/D 三项全写为「全命中」，A 行却又括注「（本段无 one）」。实测：A 的 `one`、B 的 `three`、D 的 `six` **在本段材料中全部零出现**。因此 R2 §5 的「零命中选项共 15 个」**应为 16 个**（本轮实测 16）。结论（三项均可由 L204 排除）不受影响。

**D4 —— R2 §8.1 的句子总数与实测不符。**
R2 记 145 个句子，本轮实测 **131 个**（口径：去掉说话人标注后按句末标点切分）。R2 未写明口径，不判定为错误，仅记录差异；双方结论「无复制粘贴」一致。

### 7.3 R2-A7 中**经本轮独立验证成立**的关键结论

- 45 个干扰项全部可由材料原句排除 —— **本轮复算 45/45，成立**；
- R1 的 M1（材料补 one day）、M2（材料补 Monday）、M3（推理链闭合）、M4（交代 Class Two）**四处修复现象均已消失**，F2 未使任何一处回退；
- R2 遗留的唯一中等 M5 **已由 F2 消除**；
- 答案序列、字母计数、`##` 段数、Answer 行数、题数比、编号连续、无 HTML 注释块、无 `#` 元数据区块 —— **本轮逐项复算，全部一致**。

---

## 8. 材料自洽专项（任务书重点核查项 6）

| 题号 | 时间线 | 数字 | 人物/称谓 | 结论 |
|---|---|---|---|---|
| A7-01 | 铃 10:00 / 二班 10:15 → 归还须在铃前 | 10:00、10:15 | Boy ↔ Ms. Hu | 自洽（`it` 指代问题见 E1） |
| A7-02 | 周六 7:20 发车 | 两杯茶 | Mum / Ben / father | 自洽 |
| A7-03 | — | 4/5/12/20 元，选 12 | Boy ↔ Mr. Sun | 自洽 |
| A7-04 | — | — | Girl ↔ Waiter | 自洽 |
| A7-05 | 当天 = 周六；火车周六不开 | Bus No.15 / 第三站 | Boy ↔ Man | **因果闭合**（M3 修复有效） |
| A7-06 | 周五上午复诊 / 周五下午测验 / 15℃ 语境 | — | Boy ↔ Doctor | 自洽 |
| A7-07 | 两周 | 1 周 / 1 月 / 2 周 | Librarian ↔ Boy | 自洽 |
| A7-08 | 生日周日 / 平寄 5 天 | 3 公斤 / 1 天 / 2 天 / 5 天 | Boy ↔ Clerk | 见 E8（轻微逻辑张力，材料未给「今天」，不构成矛盾） |
| A7-09 | 周一 9:00 / 12:00 午饭 / 9 点后忙 | Room 6 / 9 点 | Girl ↔ Mr. Li | 自洽 |
| A7-10 | 周一、周三太早 / 周五太晚 / 周四 | Room 3 / 9 点 | Girl ↔ Ms. Fang | 自洽 |
| A7-11 | 下午有雨 / 15℃ | 15 度 | Boy ↔ Mum | 自洽 |
| A7-12 | 周五 3:00 开赛 / 本周大操场维修 | Class Two vs Class Five | Boy ↔ Ms. Pei | 自洽（F1+F2 修复段） |
| A7-13 | 初一/初五/初十/十五 | — | Girl ↔ Mum | 自洽（考试初十 < 夏令营十五，不冲突） |
| A7-14 | 周六 8:00 集合 / 11:00 结束 | — | Boy ↔ Ms. Wei | 自洽 |
| A7-15 | 周二 16:00 家长会 / 改 15:30 / 二楼 Room 2 | 4 点 / 3 点半 / Room 2 / Room 5 | Teacher ↔ Ms. Li | 自洽 |

**角色错标专项检测（家长与教师不得被错标成 Boy 或 Girl）**：

- 说话人标注共 **17 种**：Ben, Boy, Clerk, Doctor, Girl, Librarian, Man, Mr. Li, Mr. Sun, Ms. Fang, Ms. Hu, Ms. Li, Ms. Pei, Ms. Wei, Mum, Teacher, Waiter。
- 出现频次：Boy 25、Girl 9、Mum 7、Waiter 3、Librarian 3、Teacher 3，其余各 2。
- 家长一律标 **Mum**，教师一律标 **Teacher / Ms. + 姓**，店员、服务员、医生、图书管理员、陌生人各用其职业标注。
- 专项脚本扫描「Boy/Girl 口中出现 Mum / mother / parents / Teacher / 亲属称谓」的组合：**仅命中 A7-11 L186 与 A7-13 L221 两处，均为「儿子/女儿称呼 Mum」，属正确用法，不是错标**。
- **结论：家长与教师 0 处被错标为 Boy 或 Girl。**

**词汇等级**：对话中长度 ≥6 字母的词共 68 个（afraid, afternoon, against, another, aunt's, before, begins, birthday, boiled, borrow, camera, cereal, chicken, children, cousin, degrees, doctor, eleven, enough, evening, excuse, express, father, fifteen, fifteenth, finish, friday, friend, ground, history, leaves, library, medicine, meeting, monday, morning, museum, nanjing, notebook, office, parents', people's, photography, playground, please, printed, repair, saturday, saturdays, school, science, second, should, starts, station, subject, summer, sunday, thanks, thursday, tuesday, twelve, twenty, umbrella, volunteers, wednesday, weighs, without），**逐个筛查未发现超出课标五级的生词（超纲词 0 条）**。全部为课标五级及以内词汇，其中 express / volunteers / photography / librarian 等属课标话题词。

**风险内容**：真实品牌 **0**；真实人名 **0**（Ms. Hu / Mr. Sun / Ms. Fang / Ms. Pei / Ms. Wei / Mr. Li / Ms. Li / Ben 均为虚构称谓名，Nanjing 为地名不属该清单）；争议内容 **0**；性别刻板印象 **0**（男女均有独立场景，无「某性别只能做某事」的表述）；对话中**无中文残留、无过程记录行**。

---

## 9. 结构与编号（任务书重点核查项 7）

| 检查项 | 实测 | 判定 |
|---|---|---|
| `##` 段数 | **15** | ✔ |
| `**Answer**` 行数 | **15** | ✔ |
| 选项总数 | **60**（15 题 × 4） | ✔ |
| 每题 A/B/C/D 各 1 | 15/15 | ✔ |
| 无重复选项 | 15/15 | ✔ |
| 答案均在选项中 | 15/15 | ✔ |
| 编号 A7-01…A7-15 | 连续、无缺号、无重号 | ✔ |
| `**Dialogue**` × 15 | ✔ | ✔ |
| `**Question**` × 15 | ✔ | ✔ |
| `**Passage**` / `**Table**` / `**Word Bank**` / `**Answers**` | 0 / 0 / 0 / 0（A 类正确缺省） | ✔ |
| 题数比（§1.9）Answer 行 ÷ ## 段数 | **15 ÷ 15 = 1** | ✔ 符合 A 类约定 |
| HTML 注释块 | 0 | ✔ |
| 以 `#` 开头的行 | 共 15 行，**全部是 `##` 题号标题**，无一级元数据区块 | ✔ |
| 第 1 行 `> A7 生活场景（15 题）` | `>` 引用块形式的批次出处说明行 | ✔ **允许**（_COMMON §4 明文允许，判据是「是否计入 1.9 段数统计」——它不是 `#` 行，不计入） |
| 文件末行 | `本批答案序列：D B C A B D A C B D A C A D B`，其后无多余内容 | ✔ |
| 题干泄露答案（§1.1） | 15 题题干均只问 When/Who/How/How long/How much/What/On which day/Where 之一，四个选项同质 | **0 条** |
| 选项质量（§1.4）个数/互异/同类性 | 个数 15/15 ✔；互异 15/15 ✔；同类性见 M1 与 E4/E13 | 见第 10 节 |

---

## 10. 缺陷清单

### 严重缺陷：0 条

15 题答案全部正确且唯一；材料无时间/数字/人物矛盾；无语法硬错；无重复选项；无题干泄底；无越界内容；词数 0 段超限；结构与编号全部合规；三个闸门中与 A7 相关的一项 PASS、一项 MISMATCH（F2 已落盘的证据）、一项 FAIL 但 FAIL 段落全属 A8。**不判严重。**

### 中等缺陷：1 条

#### M1. A7-01 正确项与三个干扰项**不同类**（唯一的小句形式 + 唯一的长选项）

- **位置**：A7-01，选项 D（第 17 行）vs 选项 A/B/C（第 14–16 行）
- **问题原文**：
      - A. At ten fifteen.        （3 词，介词 + 时间名词短语）
      - B. At ten thirty.          （3 词，介词 + 时间名词短语）
      - C. After Class Two.        （3 词，介词 + 时间名词短语）
      - D. Before the bell rings at ten.   （6 词，时间状语从句）
- **为什么是问题**：REVIEW-RUBRIC §1.4 明列「干扰项是否与正确项**同类**（词性一致、**结构一致**、**长度相近**）？→ 中等」。本项三个干扰项共享同一个「介词 + 时间名词短语」框架，而唯一正确项是全批 15 题中**仅有的 3 个小句式选项之一**，且长度是其余三项的 2 倍。这是一条**纯表层、与解题方法无关的辨识线索**：学生只扫选项的形态（谁是唯一的从句、谁特别长），不读对话也能把 D 挑出来，且不必承担「异形项通常是陷阱」的反向风险。其余 14 题的选项长度分布为 A7-02[4,4,3,5]、A7-04[1,1,3,3]、A7-05[3,2,4,4]、A7-06[3,3,3,3]、A7-07/08/10/12/03/13 全等长、A7-09[3,3,4,3]、A7-11[2,2,3,3]、A7-14[3,4,4,4]，**正确项均为并列最短/最长或全等长，无唯一极端**——本项是该批唯一的「结构不同类」实例。
- **不影响判分有效性**：D 仍可由 L7 + L8 唯一推出，答案正确且唯一。
- **分级理由（按 REVIEW-RUBRIC §4.5 写明）**：§1.4 把「同类性差」直接列为中等；§2 把「风格 / 极小表达瑕疵」列为轻微。本项处于两者边界，**未达「一眼可排除干扰项」或「答案不唯一」的严重线**，但已越过纯风格线，故按 §4.5 **判为中等并在此写明不确定的理由**：若调度方认为「唯一小句形式」属于 1.6 节的结构标记（`**Question**` 之类）所允许的正常书写差异，也可降为轻微，**该裁量不影响本批的归档结论**。
- **建议改法（最小改动，二选一，均不动材料、不动答案）**：
  1. **改干扰项形态**（推荐，材料一字不动）：把 D 改为 `Before ten.`（2 词），同时把 A/B/C 改为同形态的完整时间状语——例如 A. `After ten fifteen.` / B. `At ten thirty.` / C. `After Class Two.` / D. `Before ten.`。这样四者同为「介词 + 时间名词短语」，长度 3/3/3/2，正确项不再唯一异形。
  2. **改正确项措辞**（同样只动选项行）：D 改为 `Before ten.`，A 改为 `At ten fifteen.`、B 改为 `At ten thirty.`、C 改为 `After Class Two.`。
  - **两种改法都只触及 A7-01 的 4 个选项行，不改 Dialogue，因此 A7-01 的词数（57/60）完全不受影响，A7-15 的 1 词余量也不会被牵连。**

### 轻微缺陷：15 条（记录即可，可择机修）

| # | 题号 | 位置 | 类别 | 说明 |
|---|---|---|---|---|
| E1 | A7-01 | L10 | 指代含混 | `Boy: Thanks. I'll draw the river on it now.` —— `it` 最近的先行名词是 ruler，但「在尺子上画河」不成立，实指应为 L9 的 map test。句法合规、语义可唯一还原到地图，故记轻微；不影响本题作答（问的是归还时间）。**F1 未改。** |
| E2 | A7-04 | 选项 C/D vs L64 | 选项与材料不同源 | `Fried with soup.` / `Boiled with soup.` 的 `with soup` 在原文（L64 `And the chicken — with soup or without?`）修饰的是 **chicken** 而非 **rice**。仍可由 L65 `Without soup.` 排除，不影响唯一性。**F1 未改。** |
| E3 | A7-05 | L82–83 | 表达省略 / 措辞 | L82 `Yes.` 先肯定「有火车」随即说周六不开，略显绕；L83 `Boy: Saturday. Then I take the bus.` 为省略式，「当天 = 周六」这一前提的显式度下降。**M3 的修复本身有效**，此项只记表达层。 |
| E4 | A7-05 | 选项 | 长度不齐 | 选项词长 [3, 2, 4, 4]，正确项 B 是唯一最短项。**但该线索与正当解法同向**（B 是唯一全部用词都能在本段材料中找到出处的选项），且三个干扰项各自另有零命中词可被 L82/L83 直接排除，故只记轻微。 |
| E5 | A7-06 | L100 | 语义含混 | `Eat no ice cream until Friday.` 的 until 未界定开闭区间（到周五开始还是结束）。不影响本题作答（问的是复诊时间）。 |
| E6 | A7-08 | L136 | 措辞不地道 | `I have no express money.` 规范说法为 `I can't afford express postage.` **F1 未改。** |
| E7 | A7-08 | L137 | 衔接生硬 | 职员在 L135 只问了 `express or post` 两个选项，却追加第三种服务 `the train`，逻辑衔接突兀。**M1 的修复本身有效**，此项只记表达层。 |
| E8 | A7-08 | L138 | 轻微逻辑张力 | `Five days is fine. My aunt's birthday is on Sunday.` —— 材料从未交代「今天」是星期几，因此**无法判定为自相矛盾**（不判严重）；但若学生自行假定今天在周日前后，五天必然赶不上生日，`is fine` 与之略有张力。 |
| E9 | A7-10 | L170 | 措辞生硬 | `Monday or Wednesday is too early for me.` —— 教师以「太早」拒收提前交作业，理由反直觉（更自然的是 `I can't take it before Thursday.`）；且该轮 16 词为全批最长单轮。**M2 的修复本身有效**，此项只记表达层。 |
| E10 | A7-12 | L203 | 交代突兀 | `Boy: Ms. Pei, our class is Class Two.` 作为向老师开口的第一句略显突兀，能看出是修补 M4 时加的身份交代句。**M4 的修复本身有效**，不影响作答。 |
| E11 | A7-15 | 题干 vs 材料 | 指代未明说 | 题干称 `the mother`，材料只给出 `Ms. Li` 与 `the parents' meeting`，未明写母子关系。四个选项全为时间，不影响作答。 |
| E12 | A7-15 | L259 | 冗余信息 | `Room 2 on the second floor, not Room 5 on the ground floor.` 与所问的时间无关，是凑话轮的信息。 |
| E13 | A7-15 | 选项 | 长度不齐 | 选项词长 [4, 6, 4, 4]，正确项 B 是唯一最长项。与 E4 同理，该线索与正当解法同向（B 是唯一与 L255+L257+L258 三句一致的时间），只记轻微。 |
| E14 | 全卷 | — | 句式模板化 | 实测：11/15 段由学生开口向成人提问；8/15 段恰为 5 话轮；7/15 段以学生复述/确认决定收尾；12/15 段使用显式否定/排除装置。**考点类型与情境均不重复（15 段情境两两互异），不构成 §1.7 情境雷同，也不构成考点重复**，纯风格层。 |
| E15 | A7-15 / A7-07 / A7-08 | — | 词数余量偏小 | A7-15 = 59/60（余 **1**）、A7-07 = 58/60（余 2）、A7-08 = 58/60（余 2）。未贴满 60，按 §1.7b **不判缺陷**；但这三段后续任何增词都必须重新计数。**任何后续修复都不得把 M5 类的改法施加到这三段上。** |

---

## 11. 已复核题号清单（15 行，逐题逐选项，无抽样）

| 题号 | 答案 | 结构合规 | 词数（上限 60） | 答案唯一性 | 干扰项溯源（3/3） | 材料自洽 | 严重 | 中等 | 轻微 |
|---|---|---|---|---|---|---|---|---|---|
| A7-01 | D | ✔ | 57 ✔ 余 3 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | **1（M1）** | 1（E1） |
| A7-02 | B | ✔ | 47 ✔ 余 13 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 0 |
| A7-03 | C | ✔ | 53 ✔ 余 7 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 0 |
| A7-04 | A | ✔ | 56 ✔ 余 4 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 1（E2） |
| A7-05 | B | ✔ | 51 ✔ 余 9 | ✔ 唯一（M3 已修） | 3/3 有材料原句反证 | ✔ 因果闭合 | 0 | 0 | 2（E3、E4） |
| A7-06 | D | ✔ | 50 ✔ 余 10 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 1（E5） |
| A7-07 | A | ✔ | 58 ✔ 余 2 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 1（E15） |
| A7-08 | C | ✔ | 58 ✔ 余 2 | ✔ 唯一（M1 已修） | 3/3 有材料原句反证 | ✔ | 0 | 0 | 4（E6、E7、E8、E15） |
| A7-09 | B | ✔ | 48 ✔ 余 12 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 0 |
| A7-10 | D | ✔ | 46 ✔ 余 14 | ✔ 唯一（M2 已修） | 3/3 有材料原句反证 | ✔ | 0 | 0 | 1（E9） |
| A7-11 | A | ✔ | 47 ✔ 余 13 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 0 |
| A7-12 | C | ✔ | 55 ✔ 余 5 | ✔ 唯一（M4 + M5 已修） | 3/3 有材料原句反证 | ✔ | 0 | 0 | 1（E10） |
| A7-13 | A | ✔ | 47 ✔ 余 13 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 0 |
| A7-14 | D | ✔ | 47 ✔ 余 13 | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 0 |
| A7-15 | B | ✔ | **59 ✔ 余 1** | ✔ 唯一 | 3/3 有材料原句反证 | ✔ | 0 | 0 | 4（E11、E12、E13、E15） |
| **合计** | — | **15/15** | **0 段超限**，min 46／max 59 | **15/15 唯一** | **45/45 有反证** | **15/15 自洽** | **0** | **1** | **15**（其中 E14 计在全卷） |

---

## 12. 纪律声明

- **未对 data/item-bank/prod/A7.md 做任何写入。** 收尾复算：6957 字节、MD5 `eeb1e0a39a93b94a3f9a5c3263bce892`，与开工时逐位一致。
- **未修改 src/、tests/ 或任何项目代码与配置文件。**
- **唯一写入的文件是本报告 data/item-bank/reviews/V-A7.md。**
- **人工阅读范围**：`_COMMON.md`、`dispatch/V-A7.md`、`reviews/R2-A7.md`（任务书授权）、`REVIEW-RUBRIC.md`、`prod/A7.md`。**未人工阅读 reviews/ 与 fixes/ 下除 R2-A7.md 以外的任何文件**，未检索 docs/pipeline 下的历史文档。运行 `check-integrity.ps1` 时脚本自动读取了 reviews/ 目录以提取 MD5——按 _COMMON.md §2b 第 39–46 行的裁定，这属闸门运行而非人工阅读。
- **修复方的自证一律未采信**：字节数、MD5、词数、出处扫描、Jaccard、零假设概率，全部由本轮独立计算。
- **60 个选项全部实读判定，未抽样。**
- **统计检验全部穷举（15,765,750 种排列，两种独立实现互校），未使用抽样。**

---

## 最终判定

**通过，可归档。** F1 的 4 处与 F2 的 1 处修复**全部真正落盘且未引入任何新的严重或中等缺陷**；R2 遗留的中等 M5（A7-12 搭配缺失）**已消除**；15 题 15 个答案全部正确且唯一，45 个干扰项 **45/45** 可由本段材料原句排除；A 类 60 词上限 **0 段超限**（min 46／max 59，**A7-15 = 59/60 且两轮修复均未触碰**）；结构、编号、格式、角色标注、词汇等级、风险内容全部合规；答案排列经**精确穷举 15,765,750 种排列**检验，周期、扎堆、四字母覆盖、位置偏斜四项全部阴性。缺陷计数为 **严重 0 条｜中等 1 条｜轻微 15 条**，唯一的中等 M1（A7-01 选项同类性）不影响判分有效性，可择机修。**当前磁盘版本（MD5 `eeb1e0a39a93b94a3f9a5c3263bce892`）可归档。**
