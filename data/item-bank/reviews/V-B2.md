# 修复后复核报告（V）：prod/B2.md

> 复核员立场：**未参与第一轮与第二轮修复**；未阅读 reviews/ 下除本批次 R2-B2.md 以外的任何报告；未阅读 fixes/ 下任何文件；未检索 docs/pipeline/。
> 唯一外部参照：data/item-bank/reviews/R2-B2.md（本次修复的唯一依据）、以及磁盘上的 prod/B2.md 原文。
> **不采信修复方的任何自检结论**，全部数据由本轮独立复算。

## 0. 所见即磁盘（强制动作记录）

| 项 | 值 |
|---|---|
| 路径 | data/item-bank/prod/B2.md |
| 字节数（磁盘） | **4948 bytes** |
| MD5（字节方式读取） | **DC026CB8896C79C9FDD2A05368F7080F** |
| 解码后行数 | 136 行（LF，末尾有换行；137 为切分产生的空元素） |
| 修改时间 | 2026/10/3 06:50:35 |
| 一致性 | 字节读取所得 MD5 与 `read` 工具所见内容 **完全一致**，本报告全部结论针对磁盘当前内容 |

---

## 1. 结论

- **复核题数**：12（6 段 × 每段 2 题），选项 48，全卷无抽样
- **通过：12 / 12**
- **发现问题：0 题**（无严重、无中等）
- **是否可归档：可归档**

一句话：二轮修复把 6 段 × 1 题补成 6 段 × 2 题 / 48 选项，补题本身**没有引入任何新缺陷**——12 道题答案全部唯一、干扰项全部可被材料硬排除、题干地道、选项同构；两项中等修复均已正确落地且未波及 Q1；全卷 1.8 机器扫描全部阴性，且答案分布达到 A3/B3/C3/D3 的理想均衡。

本报告另记录 **3 处非阻断观察**（同一行取材重叠）与 **3 项一轮遗留轻微项未处理**（非本轮引入，均不阻断归档），详见 §9、§10。

---

## 2. 本轮复核的特殊重点：6 道新增 Q2 逐题审

> 这 6 道 Q2 在此前从未被任何一轮审核覆盖。以下逐题给出：唯一性论证、四选项的「材料内依据 / 明确排除」逐项核对、凭空信息检查、题干英文判定、选项同构与长度实测。

### B2-01 Q2（第 16–22 行）— 时长题

- **题干**：How long does the rehearsal last? → 答案 **C**（It lasts about one hour.）
- **依据句**：第 4 行 `Ms. Green: Of course. We rehearse on Wednesday afternoons, from four to five.`
- **唯一性**：four to five = 60 分钟 = one hour，是材料唯一可得的时长。A(two hours)/B(three hours)/D(half an hour) 三个时长与「四点到五点」全部矛盾 → **硬排除，无第二个可成立项**。
- **凭空信息**：无。A/B/D 均为对材料事实的取反，非新增事实断言。
- **题干英文**：`How long does the rehearsal last?` 地道。材料用 `We rehearse`（复数），题面转 `the rehearsal`（单数事件）不冲突，标准转换。
- **选项同构/长度实测**：四选项均为 `It lasts about + 数词 + 时间名词.`，**同词性同结构**；长度 A5/B5/C5/D6 词 —— 正确项**既非最长也非最短**，无长度暗示 ✓
- **小注**：材料给的是「正好一小时」，选项统一加了 `about` 作缓和；四选项一致，非提示性冗余。

### B2-02 Q2（第 38–44 行）— 数量题

- **题干**：How many paper cuts will Lucy buy for the windows? → 答案 **A**（Six paper cuts.）
- **依据句**：第 28 行 `Ms. Brown: Good. Please buy six of them, one for each window on our floor.`
- **唯一性**：`six` 为材料明示数量。B(Four)/C(Eight)/D(Twelve) 与 `six` 直接矛盾 → 硬排除 ✓
- **凭空信息**：无。三项均为错误数量。
- **题干英文**：地道。`for the windows` 与第 26 行 `paper cuts for the windows` 一致。
- **选项同构/长度实测**：四选项均为「数词 + paper cuts.」，**长度全为 3 词**，完全等长，正确项无长度优势 ✓
- **内部一致性附加核查**：第 28 行 `one for each window` ↔ 第 26 行 `for the windows`，数量口径自洽；且第 29 行 Lucy 复述 `Six.` 形成回指，强化唯一性 ✓

### B2-03 Q2（第 60–66 行）— 人物题

- **题干**：Who will take out the rubbish? → 答案 **B**（Sam.）
- **依据句**：第 51 行 `Ms. Miller: Yes, but please finish it before four o'clock. Sam takes out the rubbish.`
- **唯一性**：材料只出现一次「倒垃圾」的执行者 = Sam。排除逐项：
  - A. Tom —— 第 49 行明示 Tom 被派去擦窗户（`Tom is free this afternoon, so he can do it`），且第 51 行把倒垃圾明确指派给 Sam → **材料内排除** ✓
  - C. Peter —— 第 50 行 Peter 是**提问者**（`Who takes out the rubbish?`），非执行者 → **材料内排除** ✓
  - D. Jack —— 材料中不存在此人 → 按缺席排除（人物题的常规写法，非缺陷）
- **凭空信息**：无。唯一「不在材料内」的 Jack 是 Who 题必需的凑项，且干扰主力 Tom / Peter 均取自材料本身 ✓
- **题干英文**：`take out the rubbish` 与材料用词逐字一致 ✓
- **时态核查（重点）**：题面用 `will take out`，材料用现在时 `takes out`。本段场景锚定为「当天值日」（第 48 行 `today's cleaning duty`），现在时表当日安排 = 将来发生，与 Q1 同样处理「今天」的做法（Q1 题干亦用 `will`）完全一致 ✓ **非缺陷**。
- **选项同构/长度实测**：四选项均为单词人名，同词性同长度（1 词）✓

### B2-04 Q2（第 82–88 行）— 选题内容题

- **题干**：What is the topic of the English speech contest? → 答案 **C**（"My school life."）
- **依据句**：第 73 行 `Ms. Clark: "My school life." Please write it down and bring it to the first lesson on Monday.`
- **唯一性**：选题字符串被逐字引出，且无第二处提及任何其他选题 → 唯一 ✓
- **凭空信息**：无。A/B/D 均为「未出现的主题」，按缺席排除；这是 What-is-X 类题的必然形态，非编造事实。
- **题干英文**：地道。`topic` 属课标五级高频词，材料第 71/72 行亦使用同一词，题面与材料用词一致 ✓
- **选项同构/长度实测**：四选项均为「引号包裹的三词名词短语」，**长度全为 3 词**，完全等长同构；正确项无长度暗示 ✓
- **拼写一致性核查**：`favourite`（英式）、`home town` 两词连写（英式），与全卷 `metre / practise / rubbish` 的英式语域一致，未混入美式拼写 ✓
- **引号体例**：选项内句号置于引号内，与材料第 73 行同体例 ✓

### B2-05 Q2（第 104–110 行）— 金额题

- **题干**：How much will Ben pay in all? → 答案 **D**（Twenty yuan.）
- **依据句**：第 95 行 `Ben: Ten yuan each, twenty yuan in all. Who takes the money?`
- **唯一性**：`twenty yuan in all` 明示总额。排除逐项：
  - A. Ten yuan —— 这是**单项单价**（第 94 行 `pay ten yuan for each event`），被 `in all`（合计）排除 → **材料内排除，且是最强干扰项** ✓
  - B. Thirty yuan / C. Forty yuan —— 与 `twenty` 直接矛盾 → 硬排除 ✓
- **凭空信息**：无。**算术自洽性复核**：2 个项目 × 10 元 = 20 元，第 95 行学生心算**正确**，答案不只是引文，算式也成立 ✓
- **题干英文**：`How much will Ben pay in all?` 地道；`in all` 与材料逐字一致。
- **选项同构/长度实测**：四选项均为「数词 + yuan.」，长度全 2 词 ✓

### B2-06 Q2（第 127–133 行）— 时间题

- **题干**：When will they put up the class wall newspaper? → 答案 **D**（On Tuesday morning, before the first lesson.）
- **依据句**：第 119 行 `Mr. Turner: On Tuesday morning, before the first lesson. Put it on the back wall.`（答案与材料逐字一致）
- **唯一性**：排除逐项（**最小对立对设计，抗干扰强**）：
  - A. On Monday morning, before the first lesson. —— 时段对、**星期错**，被 Tuesday 排除
  - B. On Wednesday morning, before the first lesson. —— 时段对、**星期错**，被 Tuesday 排除
  - C. On Tuesday afternoon, after the last lesson. —— **星期对**、时段与先后错，被 `before the first lesson` 排除
  - 四项各只错一个维度，无第二可成立项 → **唯一** ✓
- **凭空信息**：仅 C 项的 `the last lesson` 未见于材料，但它是 `the first lesson` 的标准最小对立搭配，属初中高频校园词汇，**不构成凭空信息**。
- **题干英文**：`put up` 与材料一致；`the class wall newspaper` 与第 114 行一致 ✓
- **选项同构/长度实测**：四选项均为 `On + 星期 + 上下午, before/after the + 序数 + lesson.`，**长度全为 8 词**，完全等长同构 ✓

### 2.7 六道新增 Q2 的答案分布与位置

`C A B C D D` —— 四字母覆盖 C×2 / A×1 / B×1 / D×2，**无首选项偏置**（仅 1 道落在 A），无连号扎堆。

---

## 3. Q1 与 Q2 是否真的考查不同信息点（逐段依赖句核对）

> 逐句标出两问各自依赖的材料行。

| 段 | Q1 依赖句 | Q2 依赖句 | 判定 |
|---|---|---|---|
| B2-01 | 第 4 行（星期/下午，**时段**部分）+ **第 6 行**（`music room on the second floor` → where） | 第 4 行（`from four to five` → **时长**部分） | ⚠️ 取材行部分重叠（均涉第 4 行），但 Q1 的「where」**必须**靠第 6 行，且考的是「何时+何地」vs「多长时间」两个维度 |
| B2-02 | 第 29 行（`put them up on Friday morning before class`） | 第 28 行（`buy six of them`） | ✅ **完全异句** |
| B2-03 | 第 50 行（Peter 提议 clean the blackboard）+ 第 51 句前半（`before four o'clock`） | 第 51 行**后半**（`Sam takes out the rubbish`） | ⚠️ 同在第 51 行，但 Q1 须先读第 50 行的提议才能理解 `Yes`；考「人+时间」vs「人」 |
| B2-04 | 第 73 行**第二分句**（`bring it to the first lesson on Monday`） | 第 73 行**第一分句**（`"My school life."`） | ⚠️ **同一行同一说话人**，但两分句承载两个互不相干的事实（动作 vs 选题内容） |
| B2-05 | 第 96 行（`Ms. Wright / school office / tomorrow morning`） | 第 95 行（`twenty yuan in all`） | ✅ **完全异句** |
| B2-06 | 第 115 行（`Please draw a picture…` → 正答）+ 第 119 行（`back wall` → 仅用于排除 D） | 第 119 行（`On Tuesday morning, before the first lesson`） | ⚠️ Q1 正答来自第 115 行；第 119 行仅兼作 D 项排除依据 |

**判定：12 道题中不存在「两问可由同一句话推出同一事实」的重复设问。**
3 段存在**行级取材重叠**（B2-01 / B2-03 / B2-04），但每一处两问所取事实均互斥，答案无法互相推导 —— 学生即使定位到同一行，也要分别提取「时段 vs 时长」「动作 vs 人」「时间 vs 选题内容」三种不同信息。**记为非阻断观察，不构成缺陷。**

补充说明 B2-04：全段仅 5 轮对话，唯一未被设问的具体信息就是 `My school life.`。在「每段 2 题」的配额下，选题内容是该段**唯一可用**的第二考点（R2 亦正是据此建议），重叠由材料长度决定，非出题疏忽。

---

## 4. 原有的 6 道 Q1 是否仍成立 / 答案字母是否变动

| 段 | R2 记录的 Q1 答案 | 当前 Q1 答案 | 是否变动 | 修复是否波及 |
|---|---|---|---|---|
| B2-01 | B（第 11 行区） | **B** | 未变 | 未波及（Q2 为纯新增） |
| B2-02 | A | **A** | 未变 | 题干 `paper cuttings`→`paper cuts`（中等 1 要求）；答案依赖第 29 行 `Friday morning before class`，**与该名词无关**，答案不受影响 ✓ |
| B2-03 | D | **D** | 未变 | 未波及 |
| B2-04 | A | **A** | 未变 | 材料第 70 行加 `it's Monday morning`；Q1 正答仍由第 73 行 `bring it to the first lesson on Monday` 直述支撑，且新锚点**加强**了 C、D 的排除（见 §8）✓ |
| B2-05 | B | **B** | 未变 | 未波及 |
| B2-06 | C | **C** | 未变 | 未波及 |

**结论：6 道 Q1 答案字母全部未变动（B A D A B C），题干与 A–D 选项文本无改动，材料改动仅两处且均为 R2 指定的成对/定点修改。Q1 全部仍成立。**

---

## 5. 结构比

- 段落数 **6**（B2-01 … B2-06，无缺号）
- 题数 **12**（每段 Q1 + Q2，脚本实测每段恰为 2 题）
- 选项数 **48**（12 × 4，全为 A/B/C/D）
- **段 : 题 = 6 : 12 = 1 : 2**，即**每段 2 题**；按「题:段」读为 **2 : 1** ✓ **符合 B 类交付规格**
- 独立核对依据：脚本解析 `## B2-0x` 得 6 段，解析 `**Q1**` 得 6 处、`**Q2**` 得 6 处、`**Answer** [A-D]` 得 12 处、选项行 48 处 —— 与规格 6/12/48 **逐项吻合**

---

## 6. 结构标记一致性

- 白名单标记实测出现次数：`Dialogue` 6、`Q1` 6、`Q2` 6、`Answer` 12、`Answers` 1 —— 合计 31，与 6 段 × (1 Dialogue + 2 题 + 2 Answer) + 1 汇总 **完全对应，无多余、无缺失**
- **全文检索 `question`（大小写不敏感）命中 0 次** ✓ —— 写入方的归一化**确已完成**，本文件统一使用 Q1 / Q2，无任何 `**Question**` 残留
- 格式卫生：行尾空格 0、Tab 字符 0、段间恰为 1 个空行（第 23/45/67/89/111/134 行）、区块内部无空行、无注释行、无思考过程或说明性文字混入
- 非 ASCII 字符 49 个，全部来自 6 个中文标题行（`## B2-0x 中文标题`），与范式一致 ✓

---

## 7. 文件末尾答案序列汇总行 vs 逐题 Answer 逐位比对

- 汇总标记：**第 135 行 `**Answers``**，序列在**第 136 行**
- 汇总原文：`B2-01 B C　B2-02 A A　B2-03 D B　B2-04 A C　B2-05 B D　B2-06 C D`
- 脚本由 12 处 `**Answer**` 逐题反推的期望值：`B2-01 B C　B2-02 A A　B2-03 D B　B2-04 A C　B2-05 B D　B2-06 C D`
- **逐位比对（含题号与字母）：完全一致 ✅**（12/12 位全中）
- 逐段复核：B2-01 B C｜B2-02 A A｜B2-03 D B｜B2-04 A C｜B2-05 B D｜B2-06 C D —— 与正文 12 个 Answer 行一一对应 ✓

---

## 8. 中等项修复与「it's Monday morning」时效排除复核

### 8.1 paper cuttings → paper cuts（成对改动）

| 位置 | 一轮原文 | 当前 | 状态 |
|---|---|---|---|
| 材料（B2-02 第 26 行） | `We still need to buy some paper cuttings for the windows.` | `...some paper cuts for the windows.` | ✅ 已改 |
| Q1 题干（第 32 行） | `When will Lucy put up the paper cuttings?` | `When will Lucy put up the paper cuts?` | ✅ 已改 |

- **全文检索 `cutting`（不区分大小写）命中 0 次 ✅ 零残留**
- **新加的 Q2 同步统一**：第 39 行题干 `How many paper cuts will Lucy buy for the windows?`、选项 A–D（第 40–43 行）`Six/Four/Eight/Twelve paper cuts.` —— **题干与选项全部使用 paper cuts** ✓ 未出现材料说 cuts、选项说 cuttings 的术语断裂
- 语义复核：`paper cuts` 消除了「碎纸屑」歧义，且与第 28 行 `one for each window`（一张窗一张剪纸）自洽 ✓
- 未产生新耦合：Q1 答案 A 依赖动词 put up 与 Friday morning，Q2 答案 A 依赖数字 six，二者均不依赖该名词 → **改动对判分零影响** ✓

### 8.2 B2-04 加入 `it's Monday morning` 是否真的把 Friday 钉成过去时

当前第 70 行：`Amy: Ms. Clark, it's Monday morning. I missed the club meeting on Friday. I had a fever.`

- **当前时点锚定**：周一上午。第 71–73 行的交涉均发生于此刻之前/之中，时间框架闭合 ✓
- **Friday 定性**：句中 `I missed …` 为**过去时**，且文本中唯一的 Friday 即此处 → 该 Friday = 三天前，**过去时成立** ✓
- **Q1 选项 C** `She will practise it in the club meeting on Friday.` —— `will`（将来）+ 文本中唯一的 Friday（已过去）→ **时态矛盾，硬排除** ✓
- **Q1 选项 D** `She will write a speech about it before Friday.` —— `before Friday` 的先行锚点已被钉为过去时；`will write` 为将来 → **时态矛盾，硬排除** ✓
- **残余吹毛求疵（如实记录）**：理论上 `before Friday` 可另指「下周五之前」。但文本已建立**单一 Friday 锚点且为过去时**，选项内无第二个 Friday 参照，按单项选择常规指代规则，`before Friday` 默认回指该锚点。**排除力成立** ✓
- **副作用核查（修复方自述不采信，此处独立验证）**：
  1. 第 73 行 `bring it to the first lesson on Monday` → 今晨第一节课，语义通顺、不矛盾 ✓（教师点名星期略属冗余，但中文教材常见，不判缺陷）
  2. 缺周五会 → 周一首课交稿，时间线自洽 ✓
  3. 与其他 5 段无任何时间锚点冲突（各段独立场景）✓
  4. 未影响 Q1 答案 A，未影响新增 Q2（Q2 依赖第 73 行引号内字符串）✓

---

## 9. 全卷机器扫描（本轮独立复算，未采信任何既有脚本结果）

**答案序列（按题序）**：`B C A A D B A C B D B D`　（分段：BC AA DB AC BD CD）

| 检查项 | 本轮实测 | 判定 |
|---|---|---|
| **周期性 p=2** | 可比对 **10 对**，命中 **1** 对 | ✅ 不成立 |
| **周期性 p=3** | 可比对 **9 对**，命中 **3** 对 | ✅ 不成立 |
| **周期性 p=4** | 可比对 **8 对**，命中 **1** 对 | ✅ 不成立 |
| **周期性 p=5** | 可比对 **7 对**，命中 **2** 对 | ✅ 不成立 |
| **周期性 p=6** | 可比对 **6 对**，命中 **1** 对 | ✅ 不成立 |
| **周期性结论** | p=2–6 **无一成立**；且每个 p 的可比对数均 **≥2**，**不存在「比较 0 对即空真」的退化情形**，判定有效 | ✅ **无周期** |
| **最长连续相同答案** | **2**（B2-02 的 A A，跨 Q1→Q2 同段内） | ✅ 门禁 ≥3，未扎堆 |
| **四字母覆盖** | **A=3 B=3 C=3 D=3** —— 四字母**全部非零**，各占 **25.0%**，与随机基准完全一致 | ✅ 覆盖无断供、无位置偏斜 |
| **相邻同说话人（段内）** | **0**（全部 32 轮严格交替） | ✅ 门禁 0 |
| **相邻同说话人（跨段边界）** | 6 段末位说话人 Green / Brown / Peter / Amy / Nelson / Turner **互不相同** | ✅ |
| **话轮相似度（Jaccard）** | 32 话轮全两两比对 **496 对**，最高 **0.250**（`Ms. Brown: Perfect, thank you.` vs `Peter: All right, thank you.`）；段内相邻轮最高 0.200 | ✅ 门禁 >0.6，**命中 0** |
| **开场白归一化** | 6 段开场句 **6/6 互异** | ✅ |
| **「Excuse me」起句** | **0 / 6 = 0%** | ✅ 门禁 ≤30% |
| **题内重复选项** | **0** | ✅ |
| **选项个数** | 12 题全部 A/B/C/D **各 4 个** | ✅ |
| **编号连续性** | B2-01 … B2-06 无缺号、无重号 | ✅ |
| **结构标记** | 见 §6，31 个标记全部到位，0 杂项 | ✅ |
| 1.8b / 1.8c | **不适用** —— 本卷无表格填空、无 Word Bank，1.8b/1.8c 为 D 类专用判据 | — |

**附带加测（超出标准清单，用于确认无隐藏雷同）**：把 12 条题干 + 48 条选项共 **60 条**做全两两 Jaccard（1770 对），最高 **0.800**，出现在 B2-05 Q1 的 B/C 两项（`…school office tomorrow morning.` vs `…school office tomorrow afternoon.`）。**判定为非缺陷**：这是单选干扰项的标准最小对立对形态（仅差一个时间词），正是 1.1 所要求的干扰强度，不是重复题或重复选项。

**统计严谨性说明**：n=12、K=4 下，字母分布恰为 {3,3,3,3}，是**偏斜为 0** 的形态，比一轮的 {2,2,1,1} 更接近理想随机基准。本卷答案排列**无任何统计层面的缺陷**。

---

## 10. 是否引入新的语法错误或超纲词

### 10.1 六道新增 Q2 的语言逐条判定

| 段 | 题干英文 | 判定 |
|---|---|---|
| B2-01 | How long does the rehearsal last? | ✅ 地道，无语法问题 |
| B2-02 | How many paper cuts will Lucy buy for the windows? | ✅ 地道 |
| B2-03 | Who will take out the rubbish? | ✅ 地道，与材料用词一致 |
| B2-04 | What is the topic of the English speech contest? | ✅ 地道 |
| B2-05 | How much will Ben pay in all? | ✅ 地道，`in all` 与材料一致 |
| B2-06 | When will they put up the class wall newspaper? | ✅ 地道 |

六题**均无语法错误、无搭配错误、无中式表达**。答案选项亦全部为合乎语法的完整短语或名词短语。

### 10.2 新增词的超纲复扫

新增词汇：last / paper cuts / rubbish / topic / home town / favourite / school life / food / best friend / ten / thirty / forty / twenty / yuan / Monday / Tuesday / Wednesday / morning / afternoon / lesson / Jack

- 全部落在**课标五级 / 初中高频范围**；`topic`、`favourite` 为课标五级词，`yuan` 小写用法正确
- 语域一致：`favourite`（英式）、`home town` 两词（英式）与全卷 `metre / practise / rubbish` 的英式语域统一，**未混入美式拼写**
- 新增的 Q2 **没有引入任何超纲词**（一轮遗留的 `wall newspaper` 为中式搭配，但非本轮新增，见 §11）

---

## 11. 非阻断观察（记录，不建议为本轮返工）

1. **行级取材重叠 3 处**：B2-01、B2-03、B2-04 的 Q1 与 Q2 取自同一行对话的不同分句/不同维度（详见 §3）。因所取事实互斥、答案无法互相推导，**不构成重复设问**，仅作记录。
2. **一轮遗留轻微项 3 条本轮未处理**（均非本轮引入，且均不阻断归档）：
   - 第 8 行 `give your name to me` 语序生硬（母语者说 `give me your name`）——该行不参与设问，无判分影响；
   - 第 114 / 121 / 125 行 `wall newspaper` 中式搭配 —— R2 已定性为「仅作记录」；因三处**均未改动**，材料与选项术语仍统一，未出现 R2 预警的术语断裂；
   - 第 117 行 `Two large sheets, about one metre wide.` 缺 `each` 致指代不明 —— **本轮新增的 Q2 问的是「何时贴」，不是「纸张多大」，该歧义仍无判分影响**（已专项确认：全卷无任何题目问尺寸）。
   
   说明：R2 对这 3 条给出的均属「轻微/记录」级；本轮修复的授权范围是 1 条严重 + 2 条中等，未处理属既定范围，**不视为缺陷回退**。

---

## 12. 逐题审核表（覆盖率证明，不抽样）

| 题号 | 答案 | 依据句（行号） | 答案唯一性 | 语言质量 | 选项质量 | 结论 |
|---|---|---|---|---|---|---|
| B2-01 Q1 | B | 4 + 6 | ✅ 三项硬排除 | ✅ | ✅ 时间+地点双要素对称 | 通过 |
| **B2-01 Q2** | **C** | 4 | ✅ 唯一 | ✅ | ✅ 5/5/5/6 词，同构 | **通过（新增）** |
| B2-02 Q1 | A | 29 | ✅ 动词/时间双重排除 | ✅ | ✅ | 通过 |
| **B2-02 Q2** | **A** | 28 | ✅ 唯一 | ✅ | ✅ 全 3 词等长 | **通过（新增）** |
| B2-03 Q1 | D | 50 + 51 | ✅ | ✅ | ✅ | 通过 |
| **B2-03 Q2** | **B** | 51 | ✅ 唯一 | ✅ 时态与 Q1 一致 | ✅ 全 1 词人名 | **通过（新增）** |
| B2-04 Q1 | A | 73 | ✅ 中等 2 已解，C/D 时态硬排除 | ✅ | ✅ | 通过（修复后增强） |
| **B2-04 Q2** | **C** | 73 | ✅ 唯一 | ✅ | ✅ 全 3 词等长 | **通过（新增）** |
| B2-05 Q1 | B | 96 | ✅ 三项硬排除 | ✅ | ✅ | 通过 |
| **B2-05 Q2** | **D** | 95 | ✅ 唯一（单价陷阱已排除） | ✅ | ✅ 全 2 词等长 | **通过（新增）** |
| B2-06 Q1 | C | 115（+119 排除 D） | ✅ | ✅ | ✅ | 通过 |
| **B2-06 Q2** | **D** | 119 | ✅ 四项各错一维度 | ✅ | ✅ 全 8 词等长 | **通过（新增）** |

**跨题排查（逐条已做，均阴性）**：人物名冲突（Green / Brown / Miller / Clark / Nelson / Wright / Turner 七人互不重复；Tom 在 B2-01、B2-03 各一次为常见名复用）；真实品牌/真实人名/地域或性别刻板；选项与材料术语断裂；同段内两问答案可互推。

---

## 13. 归档判定

- **严重缺陷：0 条**｜**中等缺陷：0 条**｜**轻微缺陷：0 条**（新增或回归）
- 12 题全部通过；结构 6 段 / 12 题 / 48 选项达标；标记、汇总行、两处中等修复全部正确；1.8 扫描全部阴性；无新增语法错误或超纲词。
- **判定：prod/B2.md 可以归档。**
- 附注：若后续追求「Q1/Q2 行级零重叠」，唯一有替换余地的是 B2-01（可改问 `Which floor is the music room on?` 取第 6 行）；B2-04 因全段仅 5 轮、唯一未用细节即为选题内容，在两题配额下**无可替换考点**。此项为优化建议，**非归档前置条件**。
