# 审核报告：A6.md 第 2 轮（独立审核）

> 审核员：第二轮独立审核员（未参与第一轮，未查阅第一轮结论，仅依调度方转述的批次背景）
> 审核时间基准：以磁盘当前内容为准
> 文件完整性：`data/item-bank/A6.md` MD5 = `638BB764BA5599FEC57D684DEDEE5025`（字节方式读取 `[System.IO.File]::ReadAllBytes` 取哈希，与调度方给定值**一致**），字节长度 8043。所见内容与磁盘一致。
> 独立性约束遵守：未读取 `reviews/` 下任何其他报告（仅新建本文件）、未读取 `fixes/` 下任何文件、未 grep `docs/pipeline`。
> 本轮**只写本报告**，未修改或创建任何其他文件。

---

## 0. 词数口径声明（依 REVIEW-RUBRIC 1.10，全文唯一定义）

本报告所有词数一律采用 REVIEW-RUBRIC 1.10「唯一口径」：

1. **按空白分词计数**（连续的非空白字符序列计 1 个词）；
2. **只数 Dialogue 正文**——不含题号标题、Question 题干、A/B/C/D 选项、`**Answer**` 行、文件头 `> A6 健康与运动（15 题）`、末尾答案汇总行；
3. **剥离说话人标注**（`Boy:` / `Girl:` / `Ms. Wu:` / `Mr. Liu:` 等一律不计；注意 `Ms. Wu` 在空白分词下占 2 个 token，故必须先剥离标签再计数）；
4. A 类短对话单段上限 **60 词**（含 60，不含 61）。

**口径边界与耦合声明**：1.10 的字面表述「连续的非空白字符序列计 1 个词」会把**独立成词的纯标点符号**（本卷仅 A6-15 的破折号 `—`）计入词数。本报告因此**同时给出两个读数**：

| 读法 | A6-15 | 说明 |
|---|---|---|
| 严格字面读法（1.10 原文，破折号计 1 词） | **61** | 超上限 1 词 |
| 排除纯标点 token 的读法 | **60** | 恰好触上限，零余量 |

除 A6-15 外，全卷 15 题**无任何一题含独立成词的纯标点 token**，两种读法结果完全一致，故该歧义只影响 A6-15 一题。修复方报出的 60–61 与本独立重算**吻合**，确认其口径认知正确。

### 全卷词数实测表（1.10 口径）

| 题号 | 词数 | 判定 |
|---|---|---|
| A6-01 | 51 | 合规 |
| A6-02 | 50 | 合规 |
| A6-03 | 53 | 合规 |
| A6-04 | 59 | 合规（高位） |
| A6-05 | **60** | 合规（**恰好触上限，零余量**） |
| A6-06 | 52 | 合规 |
| A6-07 | 51 | 合规 |
| A6-08 | 54 | 合规 |
| A6-09 | 51 | 合规 |
| A6-10 | 47 | 合规 |
| A6-11 | 48 | 合规 |
| A6-12 | 45 | 合规 |
| A6-13 | 48 | 合规 |
| A6-14 | 47 | 合规 |
| A6-15 | **61 / 60** | **超限 / 触限零余量** |

最大值 61，最小值 45，均值 51.8。**超 60 者：仅 A6-15（1 题）。**

---

## 1. 结论

- 审核题数：**15（逐题，未抽样）**
- 严重缺陷：**2 条**｜中等：**2 条**｜轻微：**7 条**
- 是否通过：**需修复后复审**
- 判定要点：一条修复（A6-02 的 5+5=10）已复验通过；但本轮**独立新发现** 1 条严重语法缺陷（A6-12）与 1 条严重超限（A6-15 词数 61 > 60），另有 2 条中等缺陷需处理。

### 缺陷速览

| 级别 | # | 题号 | 问题 |
|---|---|---|---|
| 严重 | 1 | **A6-12** | 并列陈述句误用疑问号 + 逗号误置，语法/标点错误 |
| 严重 | 2 | **A6-15** | 词数 61（1.10 严格口径）超 60 上限；去标点口径 60 亦零余量 |
| 中等 | 3 | **A6-11** | 「The clinic is closed too」的 `too` 前指缺失（悬空并列）+ 关门与「take the medicine」之间的取药来源逻辑张力 |
| 中等 | 4 | **A6-07** | 「How long do you do your homework every evening?」非地道（以 do 动词直接提问时长），带中式痕迹 |

---

## 2. 严重缺陷

### 严重 1. A6-12 —— 并列陈述句误用疑问号、逗号误置（语法/标点错误）

- **位置**：A6-12，第 3 话轮（`## A6-12 改在体育馆打球`）
- **原文**：

  ```
  Girl: The classroom is too small, and the hall is booked?
  ```

- **为什么是问题**：
  1. **疑问句倒装缺失**：`The hall is booked?` 是一个陈述语序的陈述句（`the hall` 主语在前、`is booked` 谓语在后）却以问号收尾。书面英语中问号要求疑问语序（`Is the hall booked?`）或附加疑问（`..., isn't it?`）。
  2. **逗号误置**：`too small,` 后的逗号把两个**非并列**分句强行连成 `and` 连接的并列结构——一个是尺寸描述，一个是场地预订状态，两者不对称。
  3. 三个句子连排后，下一句 `Ms. He: That's right.` 又依赖这个问句成立，说明**原作者本意就是提问**，形式与意图不符，属可判定的形式错误而非风格偏好。
  4. 依 REVIEW-RUBRIC 1.3「是否有语法错误（时态、主谓一致、单复数、冠词、介词）？→ 严重」，书面测试材料中的句法/标点错误属必须修复项。
  - **反方读法（已评估，仍判严重）**：口语中确有「上升语调确认句」传统（*The hall's booked?* = 确认），理论上可为此开脱。但：(a) 书面材料不应依赖未标注的语调；(b) 即使接受该读法，`too small,` 后的逗号**仍然错误**（并列不成立），缺陷照样成立。因此无论采哪种读法都需修改。
- **建议改法**（替换 A6-12 第 3 话轮整行）：

  原：
  ```
  Girl: The classroom is too small, and the hall is booked?
  ```

  改为：
  ```
  Girl: The classroom is too small. Is the hall booked?
  ```

- **改后自查（是否真的修到问题点）**：
  - ✅ 疑问句倒装到位（`Is the hall booked?`），问号合法；
  - ✅ 逗号误置消除，改为句号断句；
  - ✅ 篇幅 10 词 → 9 词，全题 45 → **44 词**，仍在 60 上限内；
  - ✅ **四个选项的材料依据全部保留**：
    - A `On the playground.` ← 第 2 话轮 `Not on the playground. It may rain tomorrow.` 未改动；
    - B `In the gym.` ← 第 4 话轮 `Meet in the gym at four` 未改动；
    - C `In the classroom.` ← 依据由陈述 `The classroom is too small` 变为**提问** `Is the classroom...` 不成立（原文为 `The classroom is too small.` 仍是陈述），排除依据强度**不变**；
    - D `In the school hall.` ← 依据由陈述 `the hall is booked` 变为问答 `Is the hall booked?` / `Ms. He: That's right.`，**反而更明确地确认了 hall 已被预订**，排除依据强度**增强**。
  - **上下文边界**：仅改动第 3 话轮，第 4 话轮 `Ms. He: That's right.` 无需同步修改（问句成立后它成为对该问句的肯定回答，衔接反而更顺）。
  - **耦合**：无其他话轮与该句存在语法耦合；`Thank you, Ms. He.` 与称谓标注不受影响。
  - 无新增生词、无完成体、无超纲词。

### 严重 2. A6-15 —— 词数 61 超 60 上限（1.10 口径）

- **位置**：A6-15 `## A6-15 四百米跑步节奏` 整段 Dialogue（5 话轮）
- **实测词数**（1.10 口径，逐话轮）：
  ```
  话轮1  Girl    : Ms. | Pan, | in | the | 400-metre | race, | should | we | start | fast?          = 10
  话轮2  Ms. Pan : No. | Start | slowly | and | run | fast | in | the | last | hundred | metres.      = 11
  话轮3  Girl    : My | friend | always | runs | fast | at | the | beginning, | and | then | he | gets | tired. = 13
  话轮4  Ms. Pan : Practise | that | on | Monday | and | Wednesday. | Not | on | Friday | — | you'll | still | be | tired | from | the | sports | meeting | on | Thursday | morning. = 21
  话轮5  Girl    : I | see. | Slow | first, | then | fast.                                   =  6
  合计 = 61（严格 1.10 字面读法）；排除独立成词的破折号「—」后 = 60
  ```
- **为什么是问题**：
  - REVIEW-RUBRIC 1.10 裁定：**上限即上限，超出即需处理**，不得以「另一口径下未超」为由放过。
  - 严格字面读法 **61 > 60**，明确超限；
  - 宽松读法 **60 = 上限**，虽未超但**零余量**，且 1.10 同时规定「修改材料后必须重新计数」，任何后续微调都会立刻翻越上限；
  - **根因**：设问 `When will they practise for the 400-metre race?` 只考**练习日期**（话轮 4），而话轮 1–3 共 34 词全部在讲**配速策略**，话轮 5 是 6 词的纯附和句——**37 词（约占 61%）对设问零贡献**。这正是溢出的来源。
  - 注意：该条**不在一轮缺陷清单内**，故一轮未越权改动；本轮独立判定为**确实超限**，需处理。
- **建议改法（最小改动：只改第 3 话轮，−4 词）**：

  原：
  ```
  Girl: My friend always runs fast at the beginning, and then he gets tired.
  ```

  改为：
  ```
  Girl: My friend always starts fast and then gets tired.
  ```

- **改后自查（是否真的修到问题点）**：
  - ✅ 13 词 → 9 词，全题 **61 → 57 词**（排除破折号口径 **60 → 56**），距 60 上限留出 3 词余量；
  - ✅ 删掉的 `at the beginning, and then he` 是与 `and then` 重复的赘语，`always`（习惯性）与 `and then`（时间因果）全部保留，语义等价；
  - ✅ **四个选项的材料依据 100% 保留**——本方案**只动第 3 话轮**，而四个选项的依据**全部位于第 4 话轮，该话轮逐字未改**（脚本已验证 `orig[3] === fixed[3]` 为 true）；
    - D `On Monday and Wednesday.` ← `Practise that on Monday and Wednesday.`（Monday ✅ / Wednesday ✅ 均在）；
    - B `On Friday afternoon.` ← `Not on Friday`（Friday 明确被排除 ✅）；
    - C `On Wednesday and Friday.` ← Wednesday 有、Friday 无，构不成该组合 ✅；
    - A `On Thursday morning.` ← `the sports meeting on Thursday morning`（Thursday morning 完整保留，作为「是运动会而非练习」的对照锚点 ✅）。
  - **上下文边界**：第 3 话轮的功能是「陈述朋友的错误配速习惯 → 引出第 4 话轮的练习安排」。改动后该因果链完好，第 5 话轮 `I see. Slow first, then fast.` 呼应的是**第 2 话轮**的配速建议（`Start slowly and run fast in the last hundred metres.`），**不是**第 3 话轮，故不存在呼应断裂。
  - **耦合**：无其他话轮引用第 3 话轮的 `at the beginning` / `he` 指代；代词 `he`（指朋友）已从该句移除，但 `My friend` 已明示性别无关语境，且第 3 话轮是他处唯一提及「朋友」的句子，删除 `he` 不产生悬空指代（第 4 话轮的 `you'll` 指向听者 Ms. Pan 语境下的学生，非该朋友）。
  - 无新增生词、无完成体、语法完全正确、表达地道。

- **备选（若需更大余量）**：同时删除第 5 话轮 `Girl: I see. Slow first, then fast.`（6 词），全题降至 **51 词**。改后话轮数为 4，与 A6-03/04/07/10/11/14 的 4 话轮结构一致，不破坏交替规范；A6-15 仍以 Girl 开口、以 Ms. Pan 收尾，场景完整。**不推荐作为首选**，因第 5 话轮提供了自然的确认收尾，且并非词数问题的必要改动。

---

## 3. 中等缺陷

### 中等 1. A6-11 —— `The clinic is closed too` 的 `too` 前指缺失 + 取药来源逻辑张力

- **位置**：A6-11 `## A6-11 发烧在家休息`，第 4 话轮
- **原文**：

  ```
  Ms. Xu: Then stay home and miss PE class. The clinic is closed too. Take the medicine after breakfast and rest.
  ```

- **问题（两个层面）**：

  **(a) 悬空并列词 —— `too` 前指偏弱。**
  全卷扫描 `too / also / as well / either` 共命中 4 处，逐条判读：

  | 题号 | 原文 | `too/either` 前指 | 判定 |
  |---|---|---|---|
  | A6-04 | `The gym is closed today, so there is no swimming either.` | `swimming` 由 Girl 第 3 话轮 `go to the gym and swim after school` 明示 | **前指明确，正常** |
  | A6-07 | `Reading in the car is bad too.` | `too` 追加于紧邻的护眼建议 `Look away for a minute...`，为命题层面并列 | **可接受**（虽非名词并列，但有明确命题锚点） |
  | **A6-11** | `The clinic is closed too.` | **`the clinic` 在本对话中从未出现过**，前一项 `miss PE class` 是「不上体育课」，与「诊所关门」不同类 | **前指缺失（悬空）** |
  | A6-12 | `The classroom is too small` | 命中的是 `too`（=「太」，程度副词），**非并列连词**，属误报 | **正常** |

  即：A6-11 的 `too` 要求读者回指一个**不存在的先行项**，属必查项第 5 条所指的「说了 A 又说 B 也如何，而 B 从未被提及」。

  **(b) 关门与「服药」的逻辑张力。**
  同一话轮先宣布 `The clinic is closed`，紧接着要求 `Take the medicine`，但全段**从未说明药从何而来**。读者需要自行补全「家里已有药」这一未言明前提。依 1.2「任何读起来『说不通』之处 → 严重」有升级空间，但该补全在生活语境下足够自然（家长常备药），**未达到必须否定题目成立的程度**。
- **级别判定**：**中等**，不判严重的理由——
  - 唯一最佳答案不受影响：`stay home` + `rest` 明示 D；`miss PE class` 否定 B；`stay home` 否定 A；`clinic is closed` 否定 C。四项排除链完整，**不构成 1.1 的「答案不唯一」严重缺陷**；
  - 悬空的是**参照项**而非**并列结构本身**，补全成本低；
  - 依审核纪律第 5 条「拿不准的，标为中等并写明不确定的理由」，此处定级为**中等**。
  - 若修复方认为「诊所关门 → 拿不到药 → 却要服药」已达「说不通」，可自行上调为严重；本审核给出可直接落地的改法一并解决两个层面，故级别之争不影响修复动作。
- **建议改法**（替换 A6-11 第 4 话轮整行）：

  原：
  ```
  Ms. Xu: Then stay home and miss PE class. The clinic is closed too. Take the medicine after breakfast and rest.
  ```

  改为：
  ```
  Ms. Xu: Then stay home and miss PE class. The school clinic is closed this afternoon, so take your medicine at home after breakfast and rest.
  ```

- **改后自查（是否真的修到问题点）**：
  - ✅ **层面 (a)**：删去悬空的 `too`（以及它所依附的 `also` 义），改用因果连词 `so`，`The school clinic` 成为由前句 `miss PE class` 直接导出的**同一所指**（校医室），前指链完整；
  - ✅ **层面 (b)**：`take your medicine **at home**` 明写服药地点在**家**，与「诊所关门」彻底解耦，取药来源的逻辑张力消除；
  - ✅ **同时强化了选项 C 的排除**：原文的 `The clinic` 未限定是否校诊所，选项 C 写的是 `at the school clinic`，排除依据略偏弱；改后 `The **school** clinic is closed this afternoon` 与选项 C 的 `the school clinic` 逐字对应，排除依据**由隐含变为显式**，有助于守住唯一最佳答案；
  - ✅ 19 词 → 24 词，全题 48 → **53 词**，仍在 60 上限内；
  - ✅ **四个选项的材料依据全部保留**：`stay home`（D ✅）、`miss PE class`（B ✅）、`clinic is closed`（C ✅）、A `Play basketball with her friends` 由第 3 话轮 `My friends want to play basketball` + `stay home` 否定 ✅；
  - **上下文边界**：仅第 4 话轮；第 3 话轮 `Since last night. My friends want to play basketball after school.` 无需改动；第 2 话轮 `How long have you had the fever?` 与改后内容无冲突；
  - **耦合**：`this afternoon` 与设问 `What will the girl do this afternoon?` 的时间框架一致（新增而非冲突），并顺带使「诊所下午关门」与「下午在家休息」的时段自洽；
  - 无新增生词（`clinic`、`afternoon` 均在课标五级内）、无完成体。

### 中等 2. A6-07 —— `How long do you do your homework every evening?` 非地道

- **位置**：A6-07 `## A6-07 看手机后护眼`，第 2 话轮
- **原文**：

  ```
  Ms. Yuan: How long do you do your homework every evening?
  ```

- **为什么是问题**：英语中**时长不能与具体动作动词直接搭配提问**。`do one's homework` 是过程性动词，不是可被「长时间持续」的动词；母语者会说：
  - `How long do you **spend on** your homework every evening?`
  - `How long **does it take you to do** your homework every evening?`

  现句 `How long do you do...` 是汉语「你每天做作业做多久」的直接语序移植，属 REVIEW-RUBRIC 1.3 所指的中式表达/非地道搭配。

  **同卷对照可证这是可修的**：A6-02 的同类设问 `How long should the warm-up last?`（`last` 为时长动词）完全地道，说明本批有能力写对，A6-07 属个别失手而非全批风格。
- **级别判定**：**中等**（审核纪律第 5 条）。
  - 严读 REVIEW-RUBRIC 1.3「不地道的搭配？→ 严重」可上调为严重；但该表达在真实英语学习材料中偶有出现、语义可无歧义解码、学生可正常作答，且**不影响答案可判性与材料内部一致性**，故取中间档并明确写出：*若修复方按严读执行，本条应升级为严重*。
- **建议改法**（替换 A6-07 第 2 话轮整行）：

  原：
  ```
  Ms. Yuan: How long do you do your homework every evening?
  ```

  改为：
  ```
  Ms. Yuan: How long do you spend on your homework every evening?
  ```

- **改后自查（是否真的修到问题点）**：
  - ✅ 直接命中语病点：以 `spend on` 替换过程动词直接提问，句式地道；
  - ✅ 9 词 → 10 词，全题 51 → **52 词**，仍远低于 60；
  - ✅ **材料其余部分与四个选项依据完全未动**：第 3 话轮 `About two hours. Half an hour of that is looking at my phone.` 提供选项 C（Every half an hour）与 D（Once every two hours）的依据；第 4 话轮 `Look away for a minute every twenty minutes, not every ten.` 提供选项 B（正确）与 A（Every ten minutes）的依据；
  - **上下文边界**：仅第 2 话轮的提问方式改变，第 3 话轮的 `About two hours.` 仍然是对「时长」的回答，**问答逻辑比原句更贴合**（原句 `About two hours` 回答 `How long do you do...` 已属勉强贴合）；
  - **耦合**：无其他话轮引用该问句的形式；`spend on` 在课标五级词表内，无超纲词；未引入完成体。

---

## 4. 轻微缺陷

| # | 题号 | 位置 | 问题 | 建议 |
|---|---|---|---|---|
| L1 | A6-06 | 设问 | 题干 `Which test will the students do first?` 用**复数 students**，但对话只涉及一名女生。可由 Ms. Gao 的泛指 `A blood test first` 与学生的 `what shall **we** do` 圆场，故不判缺陷。 | 保持不变亦可；若求严谨可改 `Which test will the girl do first?` |
| L2 | A6-12 | 话轮 1 | 说话人标注 `Ms. He`——`He` 作英文姓氏在英语世界极为罕见（源自汉语「何」），英语读者可能误读为代词。**非真实人名，无 1.5 违规**。 | 若求稳妥可改为 `Ms. He` → `Ms. Hu` 或 `Ms. Zhou` |
| L3 | A6-13 | 话轮 1 | ①本卷 14/15 题以学生（Boy/Girl）开口，仅 A6-13 由教师 `Ms. Kong` 开口陈述安排，开场模式不一致；②`Ms. Kong` 以第三人称提及 `The nurse`，其本人身份（体育教师/校医）未明示。①②均**不产生矛盾**（教师≠校医可自洽），仅记档。 | 保持不变亦可；若求一致可加一句称谓问候 |
| L4 | A6-05 / A6-04 | 全题 | 词数高位：A6-05 = **60（恰好触上限，零余量）**、A6-04 = 59。依 1.10「上限即上限」，60 **未超**，判合规，仅记录以提示后续任何微调都会立刻翻越。 | 保持不变；后续若需改动 A6-05，必须重新计数 |
| L5 | A6-02 | 选项 B | 选项 B `Three minutes.`（朋友的错误说法）的排除**依赖隐含推理**：Mr. Liu 未显式否定「三分钟」，而是用自己的 10 分钟方案取而代之。听力理解中「权威方给出更正数值」即构成排除，推理链成立，故不判缺陷；仅记录其排除强度弱于 A6-01（`not at twelve` 为显式否定）。 | 保持不变；若求更严密可显式加否定 |
| L6 | A6-03 | 话轮 2 | `Ms. Chen: Yes, but look at the date on the milk box. The orange juice is for the picnic.` —— 第二句与「有无牛奶」的问答衔接突兀，且 `the picnic` 全段再无回指。该句功能是给选项 A（`Drink the orange juice now`）提供排除锚点，故**不是无用信息**，仅记为衔接生硬。 | 保持不变亦可 |
| L7 | A6-15 | 标题 | 标题 `四百米跑步节奏` 指向配速策略，而设问 `When will they practise...?` 考的是练习日期，标题与设问侧重不一致。 | 保持不变亦可；或改标题为「四百米练习安排」 |

### 跨题观察（不计入缺陷计数）

- **「生活原型答案」现象**：A6-04（膝伤→冰敷休息）、A6-10（早餐→面包鸡蛋）、A6-11（发烧→在家休息）三题的正确项同时也是**最具生活原型性的答案**，生活常识可提供先验倾向。但三题的三个干扰项（`Go to the gym`/`Go swimming`、`An apple only`/`A glass of milk`/`Nothing`、`Play basketball`/`Go to the PE class`）**在现实中同样各有合理性**，常识**不能**唯一锁定答案，且四个选项全部在材料中有对应出处。故依 1.1「靠常识就能猜对」判据不成立，**不记为缺陷**，仅提示：健康类题材天然存在此倾向，若后续追求更高区分度，可让正确项偏离原型。
- **答案位置分布极佳**（详见第 5 节），无需调整。

---

## 5. 机械检查结果（整卷级）

### 5.1 结构比（1.9）

`##` 段数 = **15**，`**Answer**` 行数 = **15**，比值 = **15/15 = 1**，A 类短对话单选约定为 1 段对话配 1 题 → **✅ 合规**。15 题均为独立 `## A6-xx` 段，编号 A6-01…A6-15 **连续无缺号**，每题均为 1 段 Dialogue + 4 个 A/B/C/D 选项 + 1 个 Answer。

### 5.2 格式合规（1.6）

- 结构标记：15 题**全部**具备 `**Dialogue**` / `**Question**` / `**Answer**`，单问选择题**统一使用 `Question`**（未混入 Q1/Q2 形式）→ ✅ 合规。
- 每题选项数均为 4（15/15）→ ✅ 合规。
- 未混入说明性文字、注释、思考过程；文件头 `> A6 健康与运动（15 题）` 与末尾汇总行 `本批答案序列：C A D B A C B D A C D B C A D` 为允许的卷级元信息，且二者均**未计入词数**。

### 5.3 答案序列（1.8 / 1.8b）

答案序列（按题序）：`C A D B A C B D A C D B C A D`

**(a) 周期性检测 p = 2–6（要求 seq[i] == seq[i+p] 对全部 i 成立）**

| p | 结论 | 首个违例 | 随机基准率 P(周期 p) |
|---|---|---|---|
| 2 | 阴性 | i=0 (C≠D) | 4⁻² = 1/16 = 6.25% |
| 3 | 阴性 | i=0 (C≠B) | 4⁻³ = 1/64 = 1.56% |
| 4 | 阴性 | i=0 (C≠A) | 4⁻⁴ = 1/256 = 0.39% |
| 5 | 阴性 | i=1 (A≠B) | 4⁻⁵ = 1/1024 = 0.098% |
| 6 | 阴性 | i=0 (C≠B) | 4⁻⁶ = 1/4096 = 0.024% |

**p = 2–6 全部阴性 → 无周期性缺陷。**

**(b) 扩窗 p = 7–13（附概率上界与实际套利收益）**

| p | 可比较对数 n−p | 实际吻合数 | 结论 | 随机基准率 |
|---|---|---|---|---|
| 7 | 8 | 3/8 | 阴性（首违例 i=0 C≠D） | 1/65536 |
| 8 | 7 | 2/7 | 阴性（首违例 i=0 C≠A） | 1/16384 |
| 9 | 6 | 2/6 | 阴性（首违例 i=1 A≠D） | 1/4096 |
| 10 | 5 | 0/5 | 阴性（首违例 i=0 C≠D） | 1/1024 |
| 11 | 4 | 0/4 | 阴性（首违例 i=0 C≠B） | 1/256 |
| **12** | **3** | **3/3** | **形式命中（可比较 3 对 ≥ 2 对）→ 判定为随机巧合，不构成缺陷** | **1/64 = 1.56%** |
| 13 | 2 | 0/2 | 阴性（首违例 i=0 C≠A） | 1/16 = 6.25% |

**p = 12 的命中为何不判缺陷（三重论证）：**
1. **概率上界**：p = 12 时需 3 次 token 独立吻合，随机基准率 1/64 = 1.56%。在 p = 7–13 这 7 个候选窗口上做**族系校正**，至少命中一次的偶然概率 ≈ 1/64 + 1/256 + 1/1024 + … ≈ **2.1%**。即：在 15 题、4 选项的量级下，「p=12 命中」是**约 2% 概率的必然噪声**，不应视为设计信号。
2. **结构上不可利用**：p = 12 > n/2 = 7.5，规则 `答案[i] = 答案[i−12]` 仅覆盖第 13/14/15 题这 **3 个位置**，且它们重复的是第 1/2/3 题。学生在**听完前 3 题之前无法知道**该规则成立（可比较对数只有 3，且这 3 题的答案本身必须靠听材料获得），因此该规则**没有可利用的预测价值**——按此作答所得分数与不按此作答**完全相同**。
3. **实际套利收益 = 0**：见 (c) 实测，全序列最高频字母盲猜仅得 **26.7%**，相对随机基准 25% 的套利空间只有 **+1.7 个百分点**；不存在任何「按周期套规律即可答对 N 题」的可能。

**综合结论：p = 2–13 全窗口无有效周期性缺陷。**

**(c) 连续扎堆**

最长连续相同答案 = **1**（即全序列无任何两个相邻答案相同）→ ✅ 阴性，无 ≥3 连扎堆。

**(d) 四字母覆盖**

`A=4, B=3, C=4, D=4`，**A/B/C/D 四个字母全部作为正确答案出现**，无固定陷阱字母，极差仅 1 → ✅ 合规。卡方均匀性检验 χ² = 0.200（df=3，0.05 临界值 7.815）→ **分布高度均匀**。

**(e) 盲猜得分（可套规律程度指标）**

按最高频字母（`，`， `A` 与 `C`、`D` 并列 4 次）盲填：**4/15 = 26.7%**，随机基准 **25%**，**实际套利收益 +1.7 个百分点**。对照 REVIEW-RUBRIC 1.8b 所记载的缺陷卷（闭卷约 70%–87% 得分），本卷**不存在任何可套规律空间** → ✅ 合规。

**(f) 逐题位置偏斜**

- 分段分布：第 1–5 题 `CADBA`（最高占比 40%）、第 6–10 题 `CBDAC`（40%）、第 11–15 题 `DBCAD`（40%），**三段均远低于 1.8b 的 ≥70% 判定门槛** → ✅ 合规。
- 逐字母位置分布：A = {2,5,9,14}、B = {4,7,12}、C = {1,6,10,13}、D = {3,8,11,15}。各字母的位置无聚集模式（相邻间距均在 2–5 之间，无固定偏移量）。**注：1.8b 的逐空偏斜检测是为「表格填空类」设计的，A 类选择题无「空」这一维度，故此处按分段/逐字母位置作等价检查。** → ✅ 合规。

### 5.4 重复扫描（1.7）

**(a) 话轮相似度扫描（Jaccard > 0.6，同材料内两两比对）**

全卷共比对 **126 对**话轮，**命中 0 对**（阈值 0.6 下无一超阈）→ ✅ 阴性，未发现修复过程可能引入的重复轮次。
*统计说明：126 对的比对样本量足以覆盖卷内所有「问 X 答 X 被复制两遍」型缺陷（此类缺陷的相似度通常 > 0.8），但不足以支撑任何关于「全卷话轮多样性」的统计推断，故仅作定向排查使用。*

**(b) 开场白归一化扫描（首话轮去标点、转小写后建字典）**

15 题生成 **15 个互不相同**的 key，**无重复** → ✅ 阴性，未发现同文件情境雷同。

**首话轮明细**：

```
A6-01  Ms. Wu, I stayed up until twelve last night. I feel sleepy now.
A6-02  Mr. Liu, can I run on the track right now?
A6-03  Hi, Ms. Chen. Is there any milk in your fridge?
A6-04  Mr. Zhao, my knee hurts. I fell off my bike.
A6-05  Ms. Wang, where and when shall we train for the relay race?
A6-06  Ms. Gao, what shall we do at the health check?
A6-07  Hello, Ms. Yuan. My eyes hurt after I finish my homework.
A6-08  Ms. Yang, I'm so nervous about tomorrow's test that I can't sleep.
A6-09  Ms. Shen, my toothbrush is nearly a year old. Should I buy a new one?
A6-10  Hi, Mr. Guo. I often skip breakfast on school days.
A6-11  Excuse me, Ms. Xu. I have a fever and a headache.
A6-12  Hello, Ms. He. Where shall we play basketball tomorrow?
A6-13  The nurse checks your feet at seven on Monday morning, before your high jump on Tuesday.
A6-14  Hi, Mr. Sun. My friend looks unhappy today.
A6-15  Ms. Pan, in the 400-metre race, should we start fast?
```

**(c) `Excuse me` 起句占比**

**1/15 = 6.7%**（仅 A6-11）→ ✅ 远低于 REVIEW-RUBRIC 1.7 所记载的缺陷卷（15 题里 14 题以 `Excuse me` 开头）。
补充：`Hello/Hi` 起句 5/15（A6-03、07、10、12、14），**无招呼语直入正题 9/15** → 招呼语使用分布正常，无单一模板化。

**(d) 主题分布（情境雷同粗查）**

`gym/PE/sport` 相关 6/15、`sleep/tired` 4/15、`food/meal` 4/15、`clinic/doctor` 3/15、`phone/screen` 1/15。与文件头声明的主题范围「健康与运动」**完全一致**，无超范围题目。
*统计说明：15 题的样本量可支撑「是否存在某一情境被 ≥6 题重复使用」的粗查（未见），但不足以支撑更细的相似度统计推断。*

**(e) 相邻同说话人标注**

15 题全部**严格交替**，无任何相邻同说话人：

```
A6-01  Boy → Ms. Wu → Boy → Ms. Wu → Boy
A6-02  Girl → Mr. Liu → Girl → Mr. Liu → Girl
A6-03  Boy → Ms. Chen → Boy → Ms. Chen
A6-04  Girl → Mr. Zhao → Girl → Mr. Zhao
A6-05  Boy → Ms. Wang → Boy → Ms. Wang → Boy
A6-06  Girl → Ms. Gao → Girl → Ms. Gao → Girl
A6-07  Girl → Ms. Yuan → Girl → Ms. Yuan
A6-08  Boy → Ms. Yang → Boy → Ms. Yang → Boy
A6-09  Girl → Ms. Shen → Girl → Ms. Shen → Girl
A6-10  Boy → Mr. Guo → Boy → Mr. Guo
A6-11  Girl → Ms. Xu → Girl → Ms. Xu
A6-12  Girl → Ms. He → Girl → Ms. He → Girl
A6-13  Ms. Kong → Boy → Ms. Kong → Boy → Ms. Kong
A6-14  Girl → Mr. Sun → Girl → Mr. Sun
A6-15  Girl → Ms. Pan → Girl → Ms. Pan → Girl
```

→ ✅ 合规。话轮数分布：5 话轮 9 题、4 话轮 6 题，无异常。

**(f) 说话人标注与称谓一致性（必查第 4 条）**

**检查方法**：对每题取「被标注为 `Ms./Mr.` 的说话人」，再扫描全卷被称呼的 `Ms./Mr. X`，验证**被称呼者就是该题中以该头衔标注的说话人**（而非反之）。

| 题号 | 头衔说话人 | 被称呼者 | 判定 |
|---|---|---|---|
| A6-01 | Ms. Wu | Ms. Wu | ✅ |
| A6-02 | Mr. Liu | Mr. Liu | ✅ |
| A6-03 | Ms. Chen | Ms. Chen | ✅ |
| A6-04 | Mr. Zhao | Mr. Zhao | ✅ |
| A6-05 | Ms. Wang | Ms. Wang | ✅ |
| A6-06 | Ms. Gao | Ms. Gao | ✅ |
| A6-07 | Ms. Yuan | Ms. Yuan | ✅ |
| A6-08 | Ms. Yang | Ms. Yang | ✅ |
| A6-09 | Ms. Shen | Ms. Shen | ✅ |
| A6-10 | Mr. Guo | Mr. Guo | ✅ |
| A6-11 | Ms. Xu | Ms. Xu | ✅ |
| A6-12 | Ms. He | Ms. He | ✅ |
| A6-13 | Ms. Kong | （无） | ✅ |
| A6-14 | Mr. Sun | Mr. Sun | ✅ |
| A6-15 | Ms. Pan | Ms. Pan | ✅ |

**全卷 15 题无一处「喊 Ms. X / Mr. X 的人被标成 Boy / Girl」**。全部 14 位被称呼者（Ms. Wu / Mr. Liu / Ms. Chen / Mr. Zhao / Ms. Wang / Ms. Gao / Ms. Yuan / Ms. Yang / Ms. Shen / Mr. Guo / Ms. Xu / Ms. He / Mr. Sun / Ms. Pan）在其所属对话中**均以对应头衔标注**；其余 14 位说话人（Boy/Girl）为学生，彼此不冲突。
*A6-13 的 `Boy` 未参与称谓互动，`Ms. Kong` 全程未被称呼，一致性无冲突。*
→ ✅ **必查第 4 条通过，15/15 合规**。

### 5.5 完成体预设答案检测（必查第 6 条）

全卷 Dialogue 正文扫描 `has/have/had + 过去分词`、`has/have/had been` 形态，**15 题全部未命中完成体**。

唯一一处相关形式为 A6-11 话轮 2 的 `How long have you had the fever?`——该完成体用于**提问持续时长**，属英语标准用法，**并非用完成体预设答案**。

→ ✅ **必查第 6 条通过，15/15 无完成体预设答案**。

全卷时态分布：过去时（叙事已发生事实）为主，无一处以完成时暗示「某选项为既定事实」。

### 5.6 选项质量（1.4）

- **互异性**：15 题的 4 个选项**题题互不相同**（脚本比对，15/15 通过）→ ✅ 无重复选项。
- **同类性**：
  - A6-01（At about _ o'clock ×4）、A6-02（N 分钟 ×4）、A6-06（The _ test/check ×4）、A6-07（Every _ ×4）、A6-13（At _ on _ morning ×4）、A6-15（On _ ×4）→ **完全同构**；
  - A6-05（{gym, track} × {7am, 4pm}）、A6-09（{soft, hard} × {big, small}）→ **完整 2×2 设计，无一眼可排除项**；
  - A6-03、A6-04、A6-08、A6-11、A6-12、A6-14 → 均为**同词性、同句法结构**的动词短语组 ✅。
- **一眼可排除检查**：15 题中**无任何一题**存在「其余三项同类、正确项异类」的形态（正确项与其余三项在词性/结构上同构）。
→ ✅ 合规。

### 5.7 数字与时间算术重算（必查第 2 条，逐段重算）

| 题号 | 算式 | 重算结果 |
|---|---|---|
| **A6-02** | `Run slowly for **five** minutes, then **five** minutes of jumping. **Ten** minutes in all.` | **5 + 5 = 10 ✅ 一致**（详见 §6 专项复验） |
| A6-01 | 熬夜至 twelve（00:00）→ 六点离家（06:00）→ 八点上课（08:00）；建议十点上床 | 22:00–06:00 = **8 小时**，合理；「ten ≠ twelve」显式区分 ✅ |
| A6-03 | 保质期 **the tenth**（10 日），今天 **the eighteenth**（18 日） | 18 > 10 → **已过期**，与 `you can't drink it` 一致 ✅ |
| A6-04 | 冰敷 **fifteen minutes**；见医生 **tomorrow** | 时间锚点明确，与设问 `this evening` 不冲突 ✅ |
| A6-05 | 明天 **4 点**（体育馆）；周三 **早上 7 点**（体育馆）；跑道整周维修 | 不同日期，无冲突；「整周维修」与「周三也在体育馆」自洽 ✅ |
| A6-06 | **seven forty**（7:40）到达；抽血后供面包鸡蛋 | 无算术冲突 ✅ |
| A6-07 | 作业 **two hours**（120 分）；其中看手机 **half an hour**（30 分）→ 手机占比 **30/120 = 1/4** | 比例合理，与选项 C/D 对应 ✅ |
| A6-10 | **six fifty** 起床（6:50）→ **seven ten** 离家（7:10）= **20 分钟**；闹钟提前 **ten minutes**（10 分）→ 多出 10 分钟用早餐 | 20 分钟赶路+洗漱确实紧张，提前 10 分钟闹钟**合理且被材料明确支持** ✅ |
| A6-11 | 昨晚起发烧；`stay home` + `miss PE class` + `rest` | 无时间算术冲突（取药来源张力见中等 1）✅ |
| A6-12 | 明天 **four**（下午 4 点）体育课后；可能下雨 | 无冲突 ✅ |
| A6-13 | 周一早 **7 点**体检；第一节课 **8 点**；**9 点**校医室忙；周二跳高 | 「7 点体检 → 8 点上课」不迟到；「9 点忙」用来排除 9 点；周二为比赛日 ✅ |
| A6-14 | `later, when she is ready` | 无算术冲突 ✅ |
| A6-15 | 400 米赛跑，最后 **hundred metres**（100 米）冲刺 → 后 1/4 加速 | **100/400 = 1/4**，与「后 100 米冲刺」配速策略自洽 ✅ |

→ **15/15 数字与时间算术全部自洽**，本轮未发现任何算术矛盾。

### 5.8 难度适配与合规（1.5）

- 全部 15 题均为译林版七上至九下生活语境（作息、体检、运动、护眼、换牙刷、早餐、发烧、场馆、体测、情绪、跑步）→ ✅ 符合课标（2011 年版）语言技能五级。
- **无真实品牌**（无 Nike / 可口可乐 / 某药厂名）、**无真实人名**（Ms. Wu / Ms. Chen / Mr. Liu 等均为虚构通称）、**无争议内容**、**无地域刻板印象**。
- **性别刻板印象检查**：14 题采用「Boy/Girl + Ms./Mr.」师生对话结构。**角色分配与话题无刻板绑定**——A6-01（熬夜）、A6-02（跑步）、A6-03（牛奶）、A6-05（接力）、A6-08（考前紧张）、A6-10（早饭）、A6-13（跳高）为 Boy，A6-04（膝盖）、A6-06（体检）、A6-07（护眼）、A6-09（牙刷）、A6-11（发烧）、A6-12（打球）、A6-14（同伴情绪）、A6-15（跑步节奏）为 Girl，**男女各题型的分布基本均衡且与话题性质无关**；14 位教师中 10 位 Ms.、4 位 Mr.，未见「男性只教体育、女性只教保健」的模式（A6-02 跑道 Mr. Liu、A6-05 接力 Ms. Wang、A6-15 跑步节奏 Ms. Pan 均已打破该刻板）→ ✅ 无性别刻板印象。
- 超纲词扫描：**未发现**超出课标五级的生词。已核词均属五级常见词：relay / warm-up / fridge / clinic / nurse / toothbrush / handle / ice / bruise 类（hurt, fall）/ practi**se** / **metres** / maths / hall / snacks。拼写统一为英式（practise, metres, maths），与译林版（南京）教材体系一致 ✅。

---

## 6. A6-02 专项复验（必查第 2 条重点）

调度方说明该题曾因 **3 + 5 ≠ 10** 的矛盾被压在考点上，一轮已改为 **5 + 5 = 10**。本轮**独立**复验如下：

**当前原文（`## A6-02 跑前热身十分钟`）**：

```
Girl: Mr. Liu, can I run on the track right now?
Mr. Liu: Not yet. Do some warm-up exercises first.
Girl: How long should the warm-up last? My friend says three minutes.
Mr. Liu: Run slowly for five minutes, then five minutes of jumping. Ten minutes in all.
Girl: Then I'll run for twenty minutes and stop.
```

**(a) 算术重算**：
- 慢跑热身 = **5 分钟**（five minutes）
- 跳跃 = **5 分钟**（five minutes）
- 合计 = **5 + 5 = 10**（`Ten minutes in all`）→ ✅ **数值自洽，一轮修复正确**

**(b) 四个选项的材料依据逐项代入**：

| 选项 | 材料依据 | 判定 |
|---|---|---|
| A `Ten minutes.` | `Ten minutes in all.` 且 = 5+5，**双重锚定** | ✅ **正确**，唯一 |
| B `Three minutes.` | `My friend says three minutes.` —— 同学的说法，被 Mr. Liu 用自己的 10 分钟方案**隐含更正** | ✅ 排除（见轻微 L5：排除为隐含推理，强度略弱） |
| C `Five minutes.` | `five minutes`（慢跑段）**与** `five minutes`（跳跃段）——真实出现在材料中，是**分量而非总量**，被 `in all` 明确排除 | ✅ 排除，且排除依据强 |
| D `Twenty minutes.` | `Then I'll run for twenty minutes` —— 是**跑的时间**，不是热身时间；设问 `warm up **before running**` 的时间范围界定将其排除 | ✅ 排除，且排除依据强 |

**(c) 唯一最佳答案验证**：✅ 成立。C（5 分钟）是最强的干扰项——它字面出现在材料中、是答案的一半分量、与 A 仅差「分项 vs 总量」一层推理；B 是被更正的同学错误值；D 是时段错位。三者排除依据各自独立且充分，**无第二个同样合理的选项**。

**(d) 一轮修复副作用检查**：
- 修复**未**破坏对话逻辑：`Not yet. Do some warm-up exercises first.` 仍与后续具体热身方案衔接 ✅；
- 修复**未**引入完成体（`Run` / `Ten minutes in all` 均为现在时）✅；
- 修复**未**产生悬空并列词（全题无 too/also/either）✅；
- 修复**未**改变词数压力：50 词，距 60 上限余 10 词 ✅。

**结论：A6-02 一轮修复已正确落地，五个环节（算术、四选项依据、唯一性、副作用、词数）全部通过，本轮判定 A6-02 无严重/中等缺陷。**

---

## 7. 逐题审核明细（15/15）

| 题号 | 词数 | 答案 | 唯一最佳答案 | 算术 | 四选项均有材料依据 | 悬空并列 | 完成体预设 | 称谓一致 | 本轮判定 |
|---|---|---|---|---|---|---|---|---|---|
| A6-01 | 51 | C | ✅ | ✅ | ✅ | 无 | 无 | ✅ | **无问题** |
| A6-02 | 50 | A | ✅ | ✅ 5+5=10 | ✅ | 无 | 无 | ✅ | **无严重/中等**（轻微 L5） |
| A6-03 | 53 | D | ✅ | ✅ 10<18 | ✅ | 无 | 无 | ✅ | **无严重/中等**（轻微 L6） |
| A6-04 | 59 | B | ✅ | ✅ | ✅ | `either` 前指明确 | 无 | ✅ | **无问题** |
| A6-05 | **60** | A | ✅ | ✅ | ✅ 2×2 完整 | 无 | 无 | ✅ | **无严重/中等**（轻微 L4，触上限） |
| A6-06 | 52 | C | ✅ | ✅ | ✅ | 无 | 无 | ✅ | **无严重/中等**（轻微 L1） |
| A6-07 | 51 | B | ✅ | — | ✅ | `too` 可接受 | 无 | ✅ | **中等**（非地道提问） |
| A6-08 | 54 | D | ✅ | — | ✅ | 无 | 无 | ✅ | **无问题** |
| A6-09 | 51 | A | ✅ | — | ✅ 2×2 完整 | 无 | 无 | ✅ | **无问题** |
| A6-10 | 47 | C | ✅ | ✅ 6:50→7:10 | ✅ | 无 | 无 | ✅ | **无问题** |
| A6-11 | 48 | D | ✅ | — | ✅ | ⚠️ `too` 悬空 | 无 | ✅ | **中等**（悬空并列 + 取药张力） |
| A6-12 | 45 | B | ✅ | — | ✅ | 无 | 无 | ✅ | **严重**（语法/标点） |
| A6-13 | 48 | C | ✅ | ✅ 7/8/9 点 | ✅ | 无 | 无 | ✅ | **无严重/中等**（轻微 L3） |
| A6-14 | 47 | A | ✅ | — | ✅ | 无 | 无 | ✅ | **无问题** |
| A6-15 | **61/60** | D | ✅ | ✅ 100/400 | ✅ | 无 | 无 | ✅ | **严重**（词数超限） |

---

## 8. 无问题题目（经审核确认无任何级别问题）

以下 6 题在**严重 / 中等 / 轻微**三个级别上均无问题，第二/三轮复核可优先采信以节省工时：

- **A6-01**（熬夜作息）
- **A6-04**（扭伤冰敷）
- **A6-08**（考前焦虑）
- **A6-09**（换牙刷）
- **A6-10**（早餐）
- **A6-14**（朋友不开心）

---

## 9. 已审核题号清单（证明 15/15 覆盖，逐题未抽样）

本轮对 A6.md 中**全部 15 道题**逐题执行了：① 四个选项逐一代入材料的唯一最佳答案验证、② 数字与时间算术逐段重算、③ 1.10 口径词数重算、④ 说话人标注与称谓一致性核验、⑤ 悬空并列词排查、⑥ 完成体预设答案排查、⑦ 结构比/编号/标记合规核验、⑧ 选项互异性与同类性核验。**无抽样、无跳题。**

| # | 题号 | # | 题号 | # | 题号 |
|---|---|---|---|---|---|
| 1 | A6-01 | 6 | A6-06 | 11 | A6-11 |
| 2 | A6-02 | 7 | A6-07 | 12 | A6-12 |
| 3 | A6-03 | 8 | A6-08 | 13 | A6-13 |
| 4 | A6-04 | 9 | A6-09 | 14 | A6-14 |
| 5 | A6-05 | 10 | A6-10 | 15 | A6-15 |

**已审核题号清单：A6-01, A6-02, A6-03, A6-04, A6-05, A6-06, A6-07, A6-08, A6-09, A6-10, A6-11, A6-12, A6-13, A6-14, A6-15**

**覆盖率：15/15 = 100%** ｜ 文件内 `##` 段数 15，已审核 15，无遗漏、无重复计数。

---

## 10. 修复优先级建议（供单一写入方参考，本审核不执行任何修改）

| 优先级 | 条目 | 动作 |
|---|---|---|
| P0 | **A6-12** 话轮 3 | 改为 `The classroom is too small. Is the hall booked?`（45→44 词） |
| P0 | **A6-15** 话轮 3 | 改为 `My friend always starts fast and then gets tired.`（61→57 词） |
| P1 | **A6-11** 话轮 4 | 改为 `Then stay home and miss PE class. The school clinic is closed this afternoon, so take your medicine at home after breakfast and rest.`（48→53 词） |
| P1 | **A6-07** 话轮 2 | 改为 `How long do you spend on your homework every evening?`（51→52 词） |
| P2 | L1–L7 | 均为记录级，可不改动；若改动 A6-05 / A6-04 / A6-15，**必须按 1.10 重新计数并写明口径** |

**修复后必须做的事**：按 1.10「修改材料后必须重新计数，改前改后都要写明」的要求，对 A6-07 / A6-11 / A6-12 / A6-15 四题**重新执行词数计数并记录改前改后数值与所用口径**（见本报告 §0 表与各条「改后自查」，数值已预置可直接引用）。

**修复后必须重跑的检查**：A6-11 话轮 4 改动新增了 `this afternoon` 与 `at home`，需复跑 ① 悬空并列词扫描（确认无新 `too/also/either`）、② 完成体扫描、③ 称谓一致性扫描；A6-12 话轮 3 拆分后需确认 **5 话轮 → 仍为 5 话轮、说话人交替未被破坏**（拆句不新增话轮，交替不变），并复跑答案唯一性以确认选项 C（`In the classroom`）与 D（`In the school hall`）的排除依据未被削弱。

---

*本报告为第二轮独立审核结论，审核员未参与第一轮、未查阅第一轮任何结论文件。所有替换文本均已自查是否真正命中问题点，并声明了上下文边界与耦合影响。*
