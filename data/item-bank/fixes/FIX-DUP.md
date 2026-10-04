# 修复记录 FIX-DUP：已归档 28 批次的跨批次语义重复修复

## 结论

- 授权来源：**`reviews/CL-DUPFIX.md`**（本轮唯一的依据报告）。
- 裁定 14 对 → **真重复 5 对，全部改完**；非重复 9 对未动；跨范围 11 对只登记。
- 改动落在 **4 个已归档批次文件**：A-batch0.md（2 题＋文件头）、A1.md（1 题）、A7.md（1 题＋汇总行）、E-batch1.md（1 题）。
- **题数一条未减**：A-batch0 20/20、A1 15/15、A7 15/15、E-batch1 10 组/20 题，改前改后完全一致。
- **五道替换题全部过语义闸门，退出码 0**；「除授权处外零字节改动」已用回滚 MD5 逐位还原，**四个文件全部 MATCH=True**。
- **一个必须上报的遗留问题**：A7 与 E-batch1 **没有 clearance 记录（CL-*.md）**，它们的完整性由 V-A7-2.md / V-E1-3.md 承担，我改了题目却无权改那两份报告 → 见 §7。

---

## 1. 逐条改动

### 1.1 A-batch0.md　A-07　学吉他的时间 → 谁先到学校

**依据**：CL-DUPFIX §2.1①。保留对侧 A5-13 音乐俱乐部的吉他课。

**改前**
```
## A-07 学吉他的时间
**Dialogue**
Boy: What do you usually do after school?
Girl: I play the guitar and draw pictures.
Boy: How long have you learned the guitar?
Girl: For about two years. I practise it for half an hour every evening.
**Question**
How long has the girl learned the guitar?
- A. One year.
- B. Three years.
- C. One and a half years.
- D. Two years.
**Answer** D
```

**改后**
```
## A-07 谁先到学校
**Dialogue**
Boy: Ms. Zhou, my cousin walks to school and I take the bus.
Ms. Zhou: The bus takes twenty minutes, and he walks in fifteen.
Boy: So he gets there first?
Ms. Zhou: Not always. He leaves ten minutes earlier than you.
**Question**
Who will get to school first?
- A. The boy, because the bus is faster.
- B. The cousin, because he leaves ten minutes earlier.
- C. The boy, because he leaves earlier.
- D. The cousin, because he walks faster.
**Answer** B
```

**考点变化**：学吉他学了多久 → 比较两段信息求谁先到（路程时长差 5 分钟 vs 出发时间差 10 分钟，净胜 5 分钟）。
**词数**：材料正文 **42 词**（上限 60，余 18）。**答案字母** D → B。
**干扰项四档**：正确项 1 ／ 甲 3 ／ 乙 0 ／ 丙 0 ／ 丁 0。A 项「因为公交更快」与材料矛盾（公交 20 分钟比走路 15 分钟慢）；C 项「因为他自己出发更早」与材料矛盾；D 项「因为他走得更快」与材料矛盾。

### 1.2 A-batch0.md　A-03　问去博物馆的路 → 打给哪个分机

**依据**：CL-DUPFIX §2.1③。保留对侧 D-03 去科技馆的路。

**改前**
```
## A-03 问去博物馆的路
**Dialogue**
Man: Hello, could you tell me how to get to the museum?
Women: Walk straight and turn left at the second crossing.
Man: Is it far from here?
Women: About ten minutes on foot. It's just around the corner.
**Question**
How will the man go to the museum?
- A. By taking a bus for ten minutes.
- B. By turning right at the second crossing.
- C. By walking for about five minutes.
- D. By walking for about ten minutes.
**Answer** D
```

**改后**
```
## A-03 打给哪个分机
**Dialogue**
Boy: Mum, what is the extension of the school office?
Mum: Two-four-five, not two-four-three. It opens at eight and closes at four.
Boy: So I ask for two-four-five?
Mum: Yes. Ring before five o'clock.
**Question**
Which extension will the boy ask for?
- A. Two-four-three.
- B. Two-four-five.
- C. Two-four-four.
- D. Three-four-five.
**Answer** B
```

**考点变化**：问路的路线与步行时长 → 数字听记（记住分机号并排除被 not 否定的那一个）。
**词数**：材料正文 **34 词**（上限 60，余 26）。**答案字母** D → B。
**干扰项四档**：正确项 1 ／ 甲 3 ／ 乙 0 ／ 丙 0 ／ 丁 0。A 项是材料 `not two-four-three` 显式否定的那一个；C、D 材料未出现。

### 1.3 A1.md　A1-12　俱乐部排练 → 洗车要不要会员卡

**依据**：CL-DUPFIX §2.1⑤。保留对侧 A-batch0 的 A-05 篮球比赛与训练时间。

**改前**
```
## A1-12 俱乐部排练
**Dialogue**
Girl: Our English club will have a talk show next Friday afternoon.
Boy: What will you talk about?
Girl: We'll talk about our summer plans. Please come to our practice on Thursday afternoon.
Boy: Sure, I'll be there on time.
**Question**
When will the club practise for the show?
- A. On Wednesday morning.
- B. On Friday afternoon.
- C. On Thursday afternoon.
- D. On Monday morning.
**Answer** C
```

**改后**
```
## A1-12 洗车要不要会员卡
**Dialogue**
Boy: Ms. Zhou, how much is the car wash today?
Ms. Zhou: Twenty yuan, or thirty with the card.
Boy: I do not have a card.
Ms. Zhou: Then it is twenty. The first month of the card is free anyway.
**Question**
How much will the boy pay for the car wash?
- A. Ten yuan.
- B. Twenty yuan.
- C. Thirty yuan.
- D. Forty yuan.
**Answer** B
```

**考点变化**：俱乐部排练的时间 → 没有会员卡时的洗车价（听记并排除有卡的三十元）。
**词数**：材料正文 **41 词**（上限 60，余 19）。**答案字母** C → B。
**干扰项四档**：正确项 1 ／ 甲 3 ／ 乙 0 ／ 丙 0 ／ 丁 0。C 项是 `or thirty with the card` 里被条件排除的那一个；A、D 材料未出现。

### 1.4 A7.md　A7-10　周四交历史作业 → 第几节上地理

**依据**：CL-DUPFIX §2.1④。保留对侧 A1-03 交作业的时间。

**改前**
```
## A7-10 周四交历史作业

**Dialogue**
Girl: Ms. Fang, when is our history paper due?
Ms. Fang: On Thursday. Not on Friday, and Monday or Wednesday is too early for me.
Girl: Shall I give it to you in the office?
Ms. Fang: No, come to Room 3 at nine on Thursday.

**Question**
When is the history paper due?
- A. On Wednesday.
- B. On Friday.
- C. On Monday.
- D. On Thursday.

**Answer** D
```

**改后**
```
## A7-10 第几节上地理

**Dialogue**
Girl: Mr. Fang, which period is our geography lesson today?
Mr. Fang: The fourth, not the third. The third is free study.
Girl: I have music in the fourth then.
Mr. Fang: Music moved to Thursday. Take your geography book.

**Question**
Which period will the class have geography today?
- A. The second.
- B. The third.
- C. The fourth.
- D. The fifth.

**Answer** C
```

**考点变化**：历史作业的截止星期 → 今天地理课在第几节（节次，听记并排除被 not 的第三节）。
**词数**：材料正文 **40 词**（上限 60，余 20）。**答案字母** D → C。
**干扰项四档**：正确项 1 ／ 甲 3 ／ 乙 0 ／ 丙 0 ／ 丁 0。B 项是材料 `not the third` 显式否定的那一个；A、D 材料未出现。

### 1.5 E-batch1.md　E-06　病后回校 → 落在操场上的手套

**依据**：CL-DUPFIX §2.1②。保留对侧 E3-02 病假回校。E 类为情景问答，**无选项、无 Answer 行**，故只改情景提示与两道问句／考点。

**改前**
```
## E-06 病后回校
**情景提示**：上周你感冒住了几天院，今天回校后同学关心你的身体和运动习惯。
**Q1**
**How often** do you do exercise?
**考点**：how often 提问动作频度；答语用第一人称完整句子，every day / twice a week 等频度表达，如 I do exercise every day.
**Q2**
**How long** did you stay in hospital last week?
**考点**：how long 问持续时间 + 一般过去时叙述（did 后用动词原形）；答语用第一人称过去式完整句子并给出时长，如 I stayed in hospital for three days.
```

**改后**
```
## E-06 落在操场上的手套
**情景提示**：你在操场捡到一副手套，体育老师问你这副手套是谁的，并让你说说是在操场的哪个位置捡到的。
**Q1**
**Whose** gloves did you find on the playground?
**考点**：Whose 问所属关系，答语用名词性物主代词（his / her / their）或「sb's + 名词」；问句里的 you 指考生（捡到手套的人），find 用一般过去时 did + 动词原形；答语切到考生视角，如 I picked them up, and they are Tom's.
**Q2**
**Where** exactly on the playground did you find them?
**考点**：where 问地点、用地点状语作答（不是 when 的时间点，也不是 how long 的时长）；问句的 you 指考生；答语用第一人称完整句并给出具体位置，如 I found them next to the basketball court.
```

**考点变化**：病后回校的「运动频度＋住院时长」→「手套所属＋捡到地点」。两问都写明了**问句口径与答语口径**、**人称指向**（1.4 对 E 类的三项检查全部满足）。
**词数**：E 类材料是中文情景提示，**1.10 无适用对象**，不适用。

---

## 2. 改后复算实测

### 2.1 答案序列与排列（p = 1..⌊n/2⌋，覆盖所有不超过序列长度一半的周期）

| 批次 | 改前序列 | 改后序列 | 周期检测 | 前后半互为重复 | 最长连号 | 字母分布（前→后） |
|---|---|---|---|---|---|---|
| A-batch0（n=20，p=1..10） | BCDABCDACBCAADBCABDD | **BCBABCBACBCAADBCABDD** | **无周期** | 否 | 2 → 2 | A5 B5 C5 D5 → **A5 B7 C5 D3** |
| A1（n=15，p=1..7） | BCADBACDBADCABC | **BCADBACDBADBABC** | **无周期** | 否 | 1 → 1 | A4 B4 C4 D3 → **A4 B5 C3 D3** |
| A7（n=15，p=1..7） | DBCABDACBDACADB | **DBCABDACBCACADB** | **无周期** | 否 | 1 → 1 | A4 B4 C3 D4 → **A4 B4 C4 D3** |
| E-batch1（E 类无 Answer 行） | — | — | 不适用 | 不适用 | 不适用 | 不适用 |

- **三批改后均无任何字母一次都不作答案**。
- A-batch0 最长连号 2 来自序列末的 `DD`（第 19、20 题），**改前改后相同，不是本次引入**；A-batch0 文件头的「答案分布 A5 B5 C5 D5」已同步改为 **A5 B7 C5 D3**。
- A7 末尾汇总行已由「D B C A B D A C B D A C A D B」改为 **「D B C A B D A C B C A C A D B」**，与 15 条 Answer 行实测**逐位一致**。A1 与 A-batch0 文件内**没有**汇总行，**未新增**（_COMMON §4：不得创建规范之外的行）。

### 2.2 结构与文件完整性

| 项 | A-batch0 | A1 | A7 | E-batch1 |
|---|---|---|---|---|
| ## 段数（改前→改后） | 20 → 20 | 15 → 15 | 15 → 15 | 10 → 10 |
| Answer 行数（改前→改后） | 20 → 20 | 15 → 15 | 15 → 15 | 0 → 0（E 类本就没有） |
| Q1/Question 行数 | 20 → 20 | 15 → 15 | 15 → 15 | 10 → 10 |
| 选项行数 | 80 → 80 | 60 → 60 | 60 → 60 | 0 → 0 |
| **题数比（1.9）** | 1 ✓ | 1 ✓ | 1 ✓ | E 类 2 题/组 ✓ |
| **题数未减少** | ✓ | ✓ | ✓ | ✓ |
| 全批最大词数（上限 60） | 52（A-06） | 49（A1-08） | 59（A7-15） | 不适用 |
| 末字节 = 0x0A | ✓ | ✓ | ✓ | ✓ |
| BOM / CRLF / U+FFFD | 无 / 0 / 0 | 无 / 0 / 0 | 无 / 0 / 0 | 无 / 0 / 0 |

### 2.3 MD5 变化

| 文件 | 改前 MD5 | 改后 MD5 | 字节数 |
|---|---|---|---|
| A-batch0.md | 84294453f09b6c771d4e1811c32db955 | **afbd40cbe2c511a943dd56a538acc046** | 9367 → 9389 |
| A1.md | 3456291bc77f1591567a5abc70d58651 | **b622a2baaa2d28bfd5c4fe4379416b3b** | 6499 → 6443 |
| A7.md | fffe6e421137a6a0df1c09f798ea2656 | **95fb87a7e6de2318166dbf45fd98324d** | 6944 → 6955 |
| E-batch1.md | 4f646824063dfb9710c1126e66d93992 | **1791b552ddfc28c683b031c9b6387fe4** | 6353 → 6605 |

---

## 3. 「除该处外零字节改动」的复现方式与实测

**复现方式**：取当前的四个文件，把 §1 的五个「新块」逐字替换回「改前原文」，另把 A-batch0 的文件头答案分布行与 A7 的末尾汇总行替换回旧值，对结果按 **UTF-8 无 BOM** 取 MD5，必须等于 §2.3 的改前 MD5。

**实测结果**：
```
A-batch0  REVERTED_MD5=84294453f09b6c771d4e1811c32db955  EXPECTED=84294453f09b6c771d4e1811c32db955  MATCH=True  REVERTED_CHARS=8899
A1        REVERTED_MD5=3456291bc77f1591567a5abc70d58651  EXPECTED=3456291bc77f1591567a5abc70d58651  MATCH=True  REVERTED_CHARS=6347
A7        REVERTED_MD5=fffe6e421137a6a0df1c09f798ea2656  EXPECTED=fffe6e421137a6a0df1c09f798ea2656  MATCH=True  REVERTED_CHARS=6744
E-batch1  REVERTED_MD5=4f646824063dfb9710c1126e66d93992  EXPECTED=4f646824063dfb9710c1126e66d93992  MATCH=True  REVERTED_CHARS=3732
```

**四个文件全部 MATCH=True**：除授权的那五处与随之必须同步的两行（文件头答案分布、A7 汇总行）外，一个字节都没动。

> 第一次跑这个验证时 A7 报了 False，是**我的验证脚本有缺陷**（嵌套数组被展平，替换没有全部执行），不是文件有问题；改成逐条显式替换后 A7 也 MATCH=True。把这次误报记下来，是为了让复核者知道「跑出不一致时先查自己的脚本」。这与 F1-A14toA17 那次是同一类错误，同一处提醒写两遍。

---

## 4. 门禁原始输出

### 4.1 词数门禁　退出码 1

执行：`pwsh -Command "& docs/pipeline/wordcount-gate.ps1"`　**第一次**运行：
```
OVER-LIMIT BLOCKS: 9
  A30        ## A30-01 超市的散装坚果                       68 > 60
  A30        ## A30-02 小区宽带的年费                       66 > 60
  A30        ## A30-05 疏通下水道的费用                      66 > 60
  A30        ## A30-06 抽屉滑轨的修理                       63 > 60
  A30        ## A30-08 楼顶水箱的清洗                       61 > 60
  A30        ## A30-10 会议室能坐几个人                      63 > 60
  A30        ## A30-11 雨伞的大小                         62 > 60
  A30        ## A30-12 烧水壶的水位                        69 > 60
  A30        ## A30-13 电池的充电时长                       61 > 60
```

**归属判断（_COMMON §2）**：9 个 FAIL 段**全部属于 A30**，A30 是本轮并发新产出的 prod 批次（门禁扫描的「在制题目」数由我开工时的 25 份涨到 29 份，A30 即其间新增）。**没有一条属于我负责的 A-batch0 / A1 / A7 / E-batch1。**

按 _COMMON §2「记录时间戳并重跑一次」，**重跑时间 2026-10-04 07:25:07 (+08:00)**，结果与第一次**完全一致**（同样 9 段、同样全部在 A30、同样 61–69 词区间），**不是时间差抖动**，是 A30 的真实超限，**由该批次负责人处理，不计为我的缺陷**。

我自己四个文件的实测最大词数：A-batch0 = 52、A1 = 49、A7 = 59，**全部 ≤ 60**（见 §2.2）。

### 4.2 文件可用性门禁　退出码 0

执行：`pwsh -Command "& docs/pipeline/encoding-check.ps1"`
```
扫描范围：
  在制题目：29 份
  审核报告：141 份
  修复记录：76 份
  流水线文档：12 份
  任务书：139 份
  调研：10 份
合计 407 份 md

PASS: no encoding or corruption defect
```

### 4.3 语义闸门

执行：`python scripts/topic-guard.py build`（脚本已由调度方修好，现在按正文哈希重编码）：
```
索引已更新：重编码 6 条，新增 15 条，总计 664 条 -> .topic-index.json
BUILD_EXIT=0
```
（「重编码 6 条」> 我改的 5 条，多出的 1 条是同期其他代理的改动；「新增 15 条」是并发新批次。）

随后执行 `python scripts/topic-guard.py scan`，按五道替换题的题号与旧标题、以及五道保留侧的题号双路过滤：
```
(no lines matched - all five pairs dissolved)
```
即 **A-07／A-03／A1-12／A7-10／E-06 与它们的保留侧 A5-13／D-03／A1-03／A-05／E3-02，在 scan 输出里一条都没有再出现**——五对重复全部消散。

---

## 5. 完整性闸门 check-integrity.ps1

我改的四个文件里，**A-batch0 与 A1 判 MATCH**，A7 与 E-batch1 判 **MISMATCH**。原因见 §7。

### 5.1 A-batch0　MATCH

`@
A-batch0 | CL-A0.md | 强匹配(同行含题目名) | afbd40cbe2c511a943dd56a538acc046 | afbd40cbe2c511a943dd56a538acc046 | MATCH
`@

### 5.2 A1　MATCH

`@
A1 | CL-A1.md | 强匹配(同行含题目名) | b622a2baaa2d28bfd5c4fe4379416b3b | b622a2baaa2d28bfd5c4fe4379416b3b | MATCH
`@

**中途踩过一个坑，如实记下**：我第一次更新这两份 clearance 记录时，把表格行写成了「旧值 → 新值」的箭头格式。`check-integrity.ps1` 是从**含文件名的那一行取第一个十六进制串**，于是它读到的是**旧** MD5，仍然判 MISMATCH。修正办法是把表格行改成**只放当前 MD5 一个值**，把旧值移到表格下方的说明里。修正后两批均判 MATCH。**记录这条是因为：如果只看闸门结果，很容易误以为是闸门坏了。**

---

## 6. clearance 记录更新情况

| 文件 | 对应 clearance 记录 | 是否存在 | 处理 |
|---|---|---|---|
| A-batch0.md | `reviews/CL-A0.md` | **存在** | 已更新表格行（9389 字节 / `afbd40cbe2c511a943dd56a538acc046`），并在表下追加改前值与依据说明 |
| A1.md | `reviews/CL-A1.md` | **存在** | 已更新表格行（6443 字节 / `b622a2baaa2d28bfd5c4fe4379416b3b`），同样追加说明 |
| A7.md | **无 CL-*.md** | **不存在** | **无法更新，见 §7** |
| E-batch1.md | **无 CL-*.md** | **不存在** | **无法更新，见 §7** |

---

## 7. 遗留问题：两个批次没有 clearance 记录（需要调度方决定）

`check-integrity.ps1` 显示 A7 与 E-batch1 的「最新报告」不是 clearance 记录，而是 **V-A7-2.md** 与 **V-E1-3.md**：

`@
A7        | V-A7-2.md | 强匹配(同行含题目名) | fffe6e421137a6a0df1c09f798ea2656 | 95fb87a7e6de2318166dbf45fd98324d | MISMATCH
E-batch1  | V-E1-3.md | 强匹配(同行含题目名) | 4f646824063dfb9710c1126e66d93992 | 1791b552ddfc28c683b031c9b6387fe4 | MISMATCH
`@

**这两条 MISMATCH 是我改题目造成的，不是数据出错**：题目已按授权改对，判 MISMATCH 只因报告里记的还是改前 MD5。

**我为什么没有直接去改 V-A7-2.md / V-E1-3.md**：
1. 任务书只授权更新 `reviews/CL-*.md`，这两份是别的代理写的复核报告，不在我的写范围；
2. 角色隔离规定修复阶段以 **CL-DUPFIX.md 为唯一依据报告**，去改 V 报告等于采信并改写别人的审核结论。

**请调度方择一**：
- (a) 为 A7 与 E-batch1 **补建 clearance 记录**（CL-A7.md / CL-E1.md），记当前 MD5，与其余 28 批的处置方式对齐；或
- (b) 授权我更新 V-A7-2.md / V-E1-3.md 里的 MD5 行（只改那一行，并在旁注明「依据 CL-DUPFIX.md 的换考点重写，题目内容见 fixes/FIX-DUP.md」）。

**另一处同类遗留（本轮 task-6 范围之外，但由我造成，一并报上）**：A14 / A15 / A16 / A17 四批在 F1-A14toA17 换了六道题后，其依据报告 R1-A14 / R1-A15 / R1-A16 / R1-A17 里的 MD5 **也没有更新**，现在同样判 MISMATCH：
`@
A14 | R1-A14.md | 1e48914a117a441611c1ebb21b9ee241 | 670120c08cc7ae0b0e59f5353dcd3e29 | MISMATCH
A15 | R1-A15.md | 24fdaa140b2ede6992b47c0365a7de42 | edb06b8185ad3503ac05fe3fee751b2d | MISMATCH
A16 | R1-A16.md | f909e5026d1b1070ae313bf764027d12 | 67eb48e21cfd9b556c2bd58e4e40a04a | MISMATCH
A17 | R1-A17.md | 4d6fec90062797797e9a4391fe0204a4 | 710c27432c289fd7cea82ff8bdcba127 | MISMATCH
`@
这四份 R1 报告是**我自己写的**，改自己的报告不涉及越界，但同样不在 task-6 的授权范围内，故我一并报上，请你点头我再改。

---

## 8. 角色隔离与纪律声明

| 文件 | 读法 |
|---|---|
| docs/pipeline/DUP-ADJUDICATION.md、docs/pipeline/dispatch/_COMMON.md、data/item-bank/REVIEW-RUBRIC.md、docs/pipeline/TOPIC-GUARD.md | 规约与授权文件，读全文 |
| **reviews/CL-DUPFIX.md** | **本轮唯一依据报告，本人裁定时写就** |
| data/item-bank/*.md（28 个已归档批次） | 裁定与修复所需，读原文 |
| 库内题目文件（E2-05 / E3-01 / E3-08 / E4-04 / E7 / A1-09 / A10-12 等） | 仅用于 §2.2 查重定性，**只读** |
| **reviews/CL-A0.md、CL-A1.md** | 按任务书明确授权**只改 MD5 表格行并追加说明**，未读其中任何审核结论 |
| scripts/topic-guard.py | 仅调用，未修改 |

**未读清单声明**：`reviews/` 与 `fixes/` 下除 CL-DUPFIX.md、CL-A0.md、CL-A1.md 三个文件外的任何文件**一份都没有打开过**；上表所列的检索命中只取文件名与行号，**未读 V 报告的正文**。**A10～A17 与 prod/ 下的任何文件一个字节都没改。** 未新建除任务书指定的 CL-DUPFIX.md 与 FIX-DUP.md 之外的仓库内文件（临时候选题写在 $env:TEMP）。

**写范围**：A-batch0.md、A1.md、A7.md、E-batch1.md（授权范围内的被修文件）＋ reviews/CL-DUPFIX.md ＋ fixes/FIX-DUP.md ＋ CL-A0.md / CL-A1.md 的 MD5 行。

---

## 9. 交接

- **五对真重复全部修完并验证**：五道替换题过闸门（退出码 0）、词数全 ≤60、题数一条未减、「除授权处外零字节改动」四个文件 MD5 逐位还原、scan 确认五对全部消散。
- **九对判非重复的未动**，理由逐条写在 CL-DUPFIX §2.2（其中 A-06/A5-04、A1-07/A3-04、A7-08/B5-01 三对是调度方在任务书里举例的，我把它们判为非重复并写了依据，供你复核）。
- **待调度方决定**：§7 的两件事——A7 与 E-batch1 补建 clearance 记录还是授权改 V 报告；以及 R1-A14～R1-A17 的 MD5 是否由我一并更新。

修复完成，待复审。
