
# 修复后复核报告：A2.md 第二轮修复验证

> 复核者：修复后复核员 ｜ 独立验证，不参考 R1 结论与 fixes/ 目录
> 依据：`data/item-bank/reviews/R2-A2.md`（改动清单）+ `data/item-bank/A2.md`（当前文件）
> 复核范围：重点 10 题（A2-01/02/03/04/06/10/12/13/14/15）逐题人工精读 + 全卷 15 题脚本扫描
> 写入范围：**仅本文件**，未修改任何题目文件

## 结论

- **本轮修复未引入语法错误、中式表达、说话人错配或答案错位等破坏性缺陷。**
- R2 列出的 **1 条严重 + 12 条中等**，逐条核对后**已全部落地**。
- 但「系统性情境去重」**未完全到位**：发现 **1 处由本轮去重新产生的副作用**（A2-07~A2-12 开场句骨架重合）与 **3 处残留重合**，其中 A2-03~A2-15 的价格句式在 R2 报告中已被明确点名（「完全同框」），本轮未处理。
- 重点 10 题：**通过 8 题，有问题 2 题**（A2-12、A2-15）；另在跨题层面查出 **2 处残留**（涉 A2-02、A2-08）。

---

## 一、复核清单逐条结论

### 1. 整题替换的 3 题是否与相邻题仍有骨架雷同？—— **有问题（1 处新副作用 + 1 处残留）**

对全卷 15 题做内容词 Jaccard 相似度与 3/4-gram 跨题重合扫描，最高相似对如下：

| 题对 | Jaccard | 跨题共享 n-gram | 判定 |
|---|---|---|---|
| **A2-07 ~ A2-12** | **0.250（全卷最高）** | 4-gram: `i'd like to change`、`like to change this` | **有问题（本轮去重新产生的副作用）** |
| **A2-03 ~ A2-15** | **0.235（全卷第二）** | 价格句式逐字同框（见下） | **有问题（R2 已点名，未修）** |
| A2-02 ~ A2-04 | 0.194 | 3-gram×5: `too small for`、`small for me`、`here it is`、`it is i`、`is i bought` | 残留（R2 明示保留，知情） |
| A2-08 ~ A2-11 | — | 3-gram×2: `thank you here`、`you here are` | 残留（轻微，超出本轮范围，知情） |
| A2-09 ~ A2-14 | 低 | 仅 `can i try`（3 词） | **通过** |

**A2-13 —— 通过。** 与相邻的 A2-12（缺货问补货时间）、A2-14（裙子腰带）无任何骨架重合；与全卷任意题最近的一对仅 0.111。R2 第 11 条要求把「索票」一拍改成指向实物，已落地（L179 `Could I take a look at the pen?` → L180 `Sure. Here it is.`），与 A2-04 的小票问答彻底脱钩；`receipt` 在本题清零。

**A2-14 —— 通过。** R2 第 9 条要求删掉「太长→换短」这一拍，已落地：本题现骨架为「请求试穿 → 店员指更衣室 → 腰带太大 → 店员收腰 → 同意」，与 A2-09（抱怨太长 → 店员推荐短的 → 问在哪试）**拍序、解决方式、考点题型均不同**（A2-09 考行为预测，A2-14 考观点细节）。两题仅剩 `can i try` 与 `changing room` 两处词面共享，属可接受残留（`changing room` 本身是 R2 第 12 条指定的替换词）。新标题「试一条红裙子」不泄露答案，较原建议的「裙子的腰带太宽」更优。

**A2-15 —— 有问题。** R2 第 10 条要求的「删掉逐字同框的重述算术一拍」已落地（L209 `Ninety yuan, please. I'll take it.` 已去掉 `So ... now`），但 **R2 第 8 条点名的价格句式同框未处理**：

```
L35  A2-03  Assistant: These running shoes are 260 yuan, but they are half price today.
L208 A2-15  Assistant: It's 120 yuan, but it's thirty yuan off today.
```

两句共用同一模版 `<N> yuan, but <折扣> today`，R2 原文即判为「**完全同框**」。这是全卷第二相似的题对。R2 优先级建议第 3 条写的是「价格折扣骨架去重（保留 03/10/15 中**两题**）」，本轮保留了 3 题且未错开 03/15 的句式模版。**注：A2-10 已被成功错开**（`They were forty-five yuan. Now they are ten yuan cheaper.`，独立成句、非 `yuan, but... today` 模版），说明去重做了一半。

**A2-12 —— 有问题（本轮去重的副作用）。**

```
L93  A2-07  Girl: I'd like to change this blue skirt for a black one.
L164 A2-12  Girl: I'd like to change this notebook for a thicker one.
L94  A2-07  Assistant: I'm afraid we don't have this one in black.
L165 A2-12  Assistant: I'm sorry. We don't have a thicker one in stock right now.
```

修复前 A2-07 以 `Excuse me.` 起句、A2-12 以 `I'd like to` 起句，第 0 个 token 有区分度；R2 第 8 条要求删掉 A2-07 的 `Excuse me.` 后，**两题开场句改为逐词同构**（仅换名词），共享 4-gram `i'd like to change` / `like to change this`，相似度成为全卷最高（0.250）。店员下一拍的 `we don't have`（缺货拒绝）也同框。缓释因素：两题考点不同（A2-07 问「她想要什么」→ A，A2-12 问「何时补货」→ D），答案不冲突，第 3 拍起即分叉。判定为中等，但成因明确是本轮操作。

**开场句统计复核（达标）**：`Excuse me.` 起句 **1/15**（仅 A2-02），与本轮宣称的目标一致；无任何两题共享同一开场句模版（3-gram 签名全部唯一）。

### 2. 每题是否仍只有一个最佳答案？整题替换后答案字母是否仍与材料对应？—— **通过（15/15）**

脚本核对：15 题答案字母均存在对应选项，无重复选项文本。人工逐题判唯一性：

| 题号 | 答案 | 材料中的直接依据 | 三个干扰项的排除路径 |
|---|---|---|---|
| A2-01 | C `Ten yuan` | L6 `a new card costs ten yuan` | A 与 10 元矛盾；B/D 全卷无据 |
| A2-02 | C `Size thirty-eight` | L24 `I'll try thirty-eight, then.`（明说） | A 未被选中；B 缺货；D 未报出 |
| A2-03 | A `130 yuan` | L37 店员明说 `One hundred and thirty yuan` | D 260=原价；B/C 无据 |
| **A2-04** | **D** | **L53 `I'd rather have my money back.`** | A 已出示小票(L51)；B 被 `No, thanks` 明确否决；C 全卷无据 |
| A2-06 | C | L80 `It is only 280 yuan here, and the cloth is better, too.` | A/D 各只中「便宜」一半；B 只中「布料好」一半 |
| A2-10 | C `35 yuan` | 45−10 | A 10=减额；B/D 无据 |
| A2-12 | D `Next Monday` | L167 `Next Monday.` | A/B/C 均与「下周一」矛盾 |
| A2-13 | A | L178 `one of them doesn't work` | B/C/D 材料均未提 |
| A2-14 | B | L194 `the belt is too big for me` | A 尺码小、C 颜色、D 价格，均未提 |
| A2-15 | C `90 yuan` | 120−30 | D 120=原价；A/B 无据 |

**A2-04 严重缺陷已确认修复。** 现行 D 项 `Ask the assistant to give her money back.` 由 L53 直接支持，与题干 `What is the girl going to do now?`、与标题「退掉小外套」、与 L49 `I'd like to return this jacket.` 四者对齐；R2 指出的「退款意图不在选项中」「D 的字面义与场景冲突」两个问题均已消除。整题替换后答案字母与材料对应无误。

**A2-06 选项结构已对齐（复算通过）**：A/B/C/D 现全为「一个真理由 + 一个假理由」双分句；正确项 C 反而是**最短**（8 词，A/B 各 11 词、D 12 词），长度不再构成提示。

### 3. 相邻同说话人标注 —— **通过（脚本全卷扫描 0 处）**

脚本对全卷 15 题逐行提取说话人标签并两两比对相邻行：

- 15 题共 **68 行台词**，**相邻同说话人标注 0 处**，全部严格交替。
- 台词行数：A2-02 为 7 行、A2-14 为 5 行，其余 4~5 行；无空转、无孤立答句、无漏标说话人。
- 三道整题替换的 A2-13/14/15 均严格 Boy/Girl ↔ Assistant 交替，未出现替换时常见的「上一段说话人残留」。

### 4. 材料内部自洽 + 数字运算 —— **通过**

| 校验 | 期望 | 实际 | 结论 |
|---|---|---|---|
| A2-03 260÷2 | 130 | 130，选项 A | 通过 |
| A2-10 45−10 | 35 | 35，选项 C | 通过 |
| A2-11 20−12 | 8 | 8，选项 A | 通过 |
| A2-15 120−30 | 90 | 90，选项 C | 通过 |
| A2-08 4×4 vs 套餐 | 16 vs 15 | 选项 C=16、D=15，答案 D | 通过 |
| A2-02 尺码 | 37→38 | 37 缺货，明说试 38 | 通过 |
| A2-06 320 vs 280 | 同时态 | `is 320` / `is only 280` | 通过（时态已统一） |
| A2-01 | 卡费 10 元 | `costs ten yuan` | 通过 |

**其他自洽项复核通过：**
- A2-01 `Is something wrong with it? … on the machine` —— 逻辑成立、搭配地道（R2 中等 1 已修）。
- A2-02 `What size do you need?` + `thirty-seven is out of stock today` —— `now` 歧义已消除，缺货说明地道（R2 中等 2 已修）。
- A2-03 `Then I'll take a pair.` —— `too` 残留已清除，全段仅 Girl/Assistant 两人，无第三人所指（R2 中等 4 已修）。
- A2-12 `We don't have a thicker one in stock right now.` —— `this kind` 指代歧义已消除（R2 中等 7 已修）。
- A2-02 D 项 `Size thirty-nine` 与 36/37/38 同量级，不再一眼可排除（R2 中等 3 已修）。

### 5. 答案分布 —— **通过**

```
A2-01:C  A2-02:C  A2-03:A  A2-04:D  A2-05:B
A2-06:C  A2-07:A  A2-08:D  A2-09:B  A2-10:C
A2-11:A  A2-12:D  A2-13:A  A2-14:B  A2-15:C

A×4 (03,07,11,13) ｜ B×3 (05,09,14) ｜ C×5 (01,02,06,10,15) ｜ D×3 (04,08,12) ｜ 合计 15
```

与 R2 要求完全一致，整题替换后分布未被破坏。

### 6. 超纲词与 receipt —— **通过**

| 词 | 状态 | 证据 |
|---|---|---|
| `fitting room(s)` | **已清零** | 全卷 0 次；A2-09 L124、A2-14 L193 均改为 `changing room(s)` |
| `meal card` | **已清零** | 全卷 0 次；A2-05 D 改为 `With a school card.` |
| `receipt` | **仅 3 处，全在 A2-02 / A2-04** | L19（A2-02 `Do you have the receipt with you?`）、L50（A2-04 `May I see your receipt?`）、L56（A2-04 **选项 A** `Look for her receipt.`） |

**receipt 保留理由已验证成立**：A2-04 选项 A `Look for her receipt.` 是**必须保留**的排除依据——她已在 L51 `Here it is.` 当场出示小票，该动作在对话时点上已经完成、不可再作为「接下来要做的事」，因此 A 被排除。学生必须理解 `receipt` 才能完成这一步排除；若把该词换成别的，A 的排除力随之失效。A2-02 的 `receipt` 属「换货需小票」情境的必需词，且与 A2-04 分处不同题、不同考点（尺码库存 vs 退货退款），R2 明示保留。**两项超纲词清零 + receipt 保留范围与理由均符合报告裁决。**

### 7. 人物标注统一性 / 题干称呼同步 —— **通过（含 1 条知情残留）**

**题干↔对话称呼同步：15/15 全部匹配。** 脚本提取每题题干中的人物指称并与该题对话说话人集合求交：

| 题号 | 题干称呼 | 对话说话人 | 结果 |
|---|---|---|---|
| A2-01 | the girl | Girl / Man | 通过 |
| A2-02 | the girl | Girl / Assistant | 通过 |
| A2-04 | the girl | Girl / Assistant | 通过 |
| A2-05 | the boy | Boy / Assistant | 通过 |
| A2-06 | the woman | Man / Woman | 通过 |
| A2-07 / 08 / 11 | the girl | Girl / Assistant | 通过 |
| A2-09 | the woman | Woman / Assistant | 通过 |
| A2-13 | the boy | Boy / Assistant | 通过 |
| A2-14 | the girl | Girl / Assistant | 通过 |
| A2-15 | the girl | Girl / Assistant | 通过 |
| A2-03 / 10 / 12 | 无人物指称（问价格/问补货） | — | 通过（无需同步） |

**无一处题干称呼与对话说话人不符**，无 `Boy/Girl` 残留而题干改称 `Assistant`（或反之）的错配。

**角色标注分布（柜台方）**：12 题用 `Assistant`（02/03/04/05/07/08/09/10/11/12/13/14/15），A2-06 用 `Man`（合理——该题在场无店员，是顾客间比价），**A2-01 仍用 `Man`**。这是 R2 轻微第 1 条，R2 修复优先级第 4 条明确「记录即可：全部 10 条轻微」，本轮 13 条修复不含轻微项，故属**知情残留，非本轮引入**。顾客侧 Girl/Boy/Man/Woman 使用得当（A2-06 的 Man/Woman 为同辈成年人）。

### 8. 新的语法错误或中式表达 —— **通过**

对全部新增/改写文本逐句复核，**未发现语法错误、搭配错误或中式表达**：

- A2-13（整段）：`Could I take a look at the pen?` / `Sure. Here it is.` / `Let me have a look.` —— 三轮话轮自然，且 `Let me have a look` 不再后置 `Thank you`，R2 轻微第 8 条的语序错位已消失。
- A2-14（整段）：`The colour is nice, but the belt is too big for me.` / `Then let me take in the belt for you.` —— `take in` 用于「收窄腰围」为地道服装业表达，无误。
- A2-15（整段）：`Can you tell me the price of this schoolbag?` / `Ninety yuan, please. I'll take it.` / `Right. Here is your bag.` —— 全地道。
- A2-01/02/03/06/12 改写句：均通过语法与搭配复核。

**两处装饰性 nitpick（不计为缺陷，不影响判分）**：
1. A2-14 四个选项介词混用 `The size on it` / `The belt on it` / `The colour of it` / `The price of it`；`The size on it` 略不常用（更自然为 `The size of it`）。此为 R2 第 9 条建议原文，非本轮改动。
2. A2-06 选项 C 写作 `It is cheaper and the cloth is better.`，A/B/D 三项在 `and` 前带逗号，C 独缺。属标点一致性，非结构性提示。

---

## 二、重点 10 题逐题结论

| 题号 | 结论 | 证据摘要 |
|---|---|---|
| A2-01 | **通过** | 中等 1 已修（`Is something wrong with it?` + `on the machine`）；答案 C 与 `costs ten yuan` 对应；标注 `Man` 为知情残留 |
| A2-02 | **通过（本体）** | 中等 2/3 已修（`What size do you need?`、`out of stock`、D=thirty-nine）；答案 C 明文支持。残留：与 A2-04 开场近逐字重合 |
| A2-03 | **通过（本体）** | 中等 4 已修（删 `too`）；260÷2=130 与答案 A 对应。残留：与 A2-15 价格句式同框 |
| A2-04 | **通过** | **严重缺陷已修复**：D 项由 `I'd rather have my money back` 直接支持，题干/选项/标题/首行四者对齐，唯一性成立 |
| A2-06 | **通过** | 中等 5/6 已修（`is 320` 统一时态、四选项双分句齐平，C 为最短项无长度提示）；答案 C 两点全中，A/B/D 各中一点 |
| A2-10 | **通过** | 价格句式已成功错开（独立成句，非 `yuan,but...today` 模版）；45−10=35 与答案 C 对应 |
| A2-12 | **有问题** | 中等 7 已修（`a thicker one in stock`）；答案 D 与 `Next Monday` 对应。**但与 A2-07 开场句 4-gram 同构（`i'd like to change`），相似度全卷最高 0.250，系本轮删除 `Excuse me.` 后的副作用** |
| A2-13 | **通过** | 整题替换到位：索票拍改为指向实物，与 A2-04 脱钩，`receipt` 清零；答案 A 与首行直接对应；4 行严格交替 |
| A2-14 | **通过** | 整题替换到位：「太长→换短」骨架已消除，与 A2-09 仅剩 `can i try`(3词)；新标题不泄露答案；答案 B 与 `belt is too big` 对应 |
| A2-15 | **有问题** | 中等 10 已修（删 `So ... now` 重述拍）；120−30=90 与答案 C 对应。**但 `<N> yuan, but <折扣> today` 句式与 A2-03 完全同框，R2 第 8 条已点名「完全同框」，本轮未错开** |

**重点 10 题：通过 8 题，有问题 2 题（A2-12、A2-15）。**

---

## 三、发现的问题清单

### 新引入（本轮去重的副作用）—— 1 处

**[中] A2-07 ~ A2-12 开场句骨架重合**
- 位置：A2-07 L93、A2-12 L164
- 证据：`Girl: I'd like to change this blue skirt for a black one.` / `Girl: I'd like to change this notebook for a thicker one.`；共享 4-gram `i'd like to change`、`like to change this`；Jaccard 0.250（全卷最高）；店员下一拍共享 `we don't have`
- 成因：R2 第 8 条要求删 A2-07 的 `Excuse me.`，删除后两题开场首词变为完全相同
- 建议：将 A2-12 开场改为 `Can I swap this notebook for a thicker one?`，或 A2-07 改为 `I'm looking for a black skirt.`，使两题开场首词错开即可，无需重写全题

### 残留未消除 —— 3 处

**[中] A2-03 ~ A2-15 价格句式完全同框**
- 证据：L35 `These running shoes are 260 yuan, but they are half price today.` / L208 `It's 120 yuan, but it's thirty yuan off today.`
- R2 第 8 条原文已判为「**完全同框**」，本轮只删了重述拍、未错开模版；R2 优先级第 3 条要求「保留 03/10/15 中两题」，实际保留 3 题
- 建议：将 A2-15 改为 `It's 120 yuan today — that is ten yuan off.`（换模版），或保留 A2-03、A2-15 而再错开 A2-10

**[中·知情] A2-02 ~ A2-04 开场近逐字重合**
- 证据：共享 5 个 3-gram（`too small for`、`small for me`、`here it is`、`it is i`、`is i bought`）；L18/L49 同为 `too small for me`；L20/L51 同为 `Here it is. I bought them/it last ...`
- R2 第 11 条明示「A2-02 与 A2-04 保留」，故属报告认可的保留项；但两题仅换物名与星期，且题号相邻（2 与 4），听感接近
- 建议（可选）：把 A2-04 首行改为 `This jacket doesn't fit. I'd like to return it.`

**[轻·知情] A2-08 ~ A2-11 收尾句近逐字重合**
- 证据：L110 `Assistant: Thank you. Here are your four pens.` / L152 `Assistant: Thank you. Here are eight yuan for you.`；共享 3-gram `thank you here`、`you here are`
- R2 轻微第 7 条已指出 A2-11 的 `Here are ... for you` 用于钱时生硬、建议改为 `Here is your change - eight yuan.`，属轻微项、本轮未修
- 建议：改 A2-11 收尾一句即可同时解决两条

---

## 四、知情保留项（超出本轮 13 条修复范围，不计为缺陷）

| 项 | 状态 |
|---|---|
| A2-01 柜台方标注 `Man`（其余 12 题为 `Assistant`） | R2 轻微第 1 条，「记录即可」 |
| A2-02 标题「换一双**旧**鞋」与内容（偏小，非旧）不符 | R2 轻微第 2 条 |
| A2-05 `Here you are.`（回应 show me the code）动作为匹配 | R2 轻微第 3 条 |
| A2-07 `another dark colour` 的 `another` 无前文所指 | R2 轻微第 4 条 |
| A2-08 干扰项 `12 yuan` 无材料依据 | R2 轻微第 5 条，R2 明示「保留（知情记录）」 |
| A2-11 `Here are eight yuan for you.` | R2 轻微第 7 条（见上残留 3） |
| A2-03 干扰项 `160 yuan` 无依据（R2 建议改 280，未改） | R2 轻微第 9 条 |
| A2-10 干扰项 `25 yuan` 无依据（R2 建议改 45，未改） | R2 轻微第 9 条 |
| A2-15 干扰项 60/80 无对应算式 | R2 明示「无需改动」 |
| 标题泄露答案类型（A2-03「半价运动鞋」、A2-08「买四支更划算」、A2-11「集邮册找零」、A2-04「退掉小外套」、A2-15「书包今天打折」） | R2 轻微第 10 条，需确认标题是否随题面呈现给学生 |
| 文件首行直接是 `## A2-01`，无头部主题声明 | R2 轻微第 10 条 |
| A2-14 选项 `The size on it` 略不常用、介词 `on/of` 混用 | R2 第 9 条建议原文，非本轮引入 |
| A2-06 选项 C 缺 `and` 前逗号（A/B/D 有） | 标点一致性，非结构性提示 |

---

## 五、复核覆盖率证明

- **重点题**：A2-01、A2-02、A2-03、A2-04、A2-06、A2-10、A2-12、A2-13、A2-14、A2-15，共 **10 题，逐题人工精读 + 逐句证据引用，无抽样**。
- **全卷扫描**：A2-01~A2-15 共 **15 题**，全部纳入脚本扫描（结构标记、选项字母、答案映射、相邻说话人、词表清零、题干称呼、跨题 n-gram 相似度）。
- **全卷结构复核（脚本）**：15 题各含且仅含 1 个 `**Dialogue**`、`**Question**`（单数，无 `**Questions**`）、`**Answer**`；每题选项恰为 A/B/C/D 四项，无重复选项文本，答案字母均有对应选项 —— **0 处结构问题**。
- **相邻同说话人标注**：68 行台词，**0 处**。
- **数字运算**：6 项复算全部通过。
- **答案分布**：A×4 / B×3 / C×5 / D×3，与要求一致。

---

**总评**：本轮修复质量高——R2 的 1 条严重 + 12 条中等**全部落地且无一修坏**，答案分布、答案唯一性、数字运算、说话人交替、超纲词清零五项硬指标**全部通过**，新写的英文无一处语法或表达问题。唯一的实质性欠缺在于**情境去重只做了一半**：A2-10 成功错开，A2-03 与 A2-15 的价格句式仍完全同框；并且删除 A2-07 的 `Excuse me.` 后，A2-07 与 A2-12 的开场句变为逐词同构，**去重动作本身在一个方向上制造了新的重合**。这两处均属中等，不影响判分有效性，建议下一轮做两处单句级微调即可闭合。
