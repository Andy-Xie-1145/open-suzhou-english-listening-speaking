# 复核报告：A6.md 二轮修复后复核（V-A6）

> 复核员：修复后复核员。**未查阅** `reviews/` 下任何其他报告（R2-A6.md 除外）、**未查阅** `fixes/` 下任何文件、**未检索** `docs/pipeline/`。全部结论来自对题目原文的独立重读 + 独立机检脚本复算，**不采信修复方的任何自检结论**。
> 复核对象：`data/item-bank/prod/A6.md`
> 日期：2026-10-03

## 0. 开篇强制动作：字节校验

| 项 | 值 |
|---|---|
| MD5 | `B23D7A522737602A92ADACC7110E0245` |
| 文件大小 | 8,044 bytes |
| 行数 | 222（PowerShell `[System.IO.File]::ReadAllLines`） |
| 一致性 | 三路独立读取（read 工具 / PowerShell 字节读 / Node `fs.readFileSync`）**逐行完全一致**，与 md5 `B23D7A52…` 对应内容一致，所见即磁盘 |

> R2 报告曾在开篇提示「读取工具返回可能与磁盘漂移」。本轮复核复核了三路读取，且对本轮全部改动行（36/37/41/49/51/52/64/66/67/200/212）做了逐行二次复读，**未发现漂移**。

## 1. 结论摘要

- **复核题数**：15（全覆盖，逐题人工 + 全卷机检，无抽样）
- **通过：15 / 15**
- **本轮修复引入的新缺陷：0 条**（严重 0 / 中等 0 / 轻微 0）
- **R2 的 6 条中等缺陷：6 / 6 全部真正闭合**，其中 A6-04 的闭合方案**优于** R2 给出的「首选」
- **1 条统计性命中**（答案序列 p=12 周期，3 对可比）经复算判定为**小样本巧合、非缺陷、且非本轮引入**（详见 §3）
- **6 条残留观察**（2 条修复前既有、2 条属 R2 处置口径内的遗留、1 条已闭合、1 条无影响），均不阻断归档
- **A6 可归档**

---

## 2. 逐题复核（清单 1–6）

### 2.1 A6-04：修复是否真的闭合了问题？——**闭合，且优于首选**

磁盘原文（第 47–59 行）：

```
## A6-04 扭伤膝盖要冰敷
**Dialogue**
Girl: Mr. Zhao, my knee hurts. I fell off my bike.
Mr. Zhao: Can you walk to the classroom?
Girl: Slowly. I'd like to go to the gym and swim after school.
Mr. Zhao: No. The gym is closed today, so there is no swimming either. Put ice on it for fifteen minutes and rest at home. See a doctor tomorrow if it still hurts.
**Question**
What will the girl do this evening?
- A. Go to the gym after school.
- B. Use ice and rest at home.
- C. Go swimming after school.
- D. See a doctor tomorrow.
**Answer** B
```

#### ① 事实澄清（重要，勿被转述误导）

修复员**并非「弃首选、另写一句」**。逐字比对结果：

- **第 51 行 = R2「首选」的文本，逐字一致**（`I'd like to go to the gym and swim after school.`）
- **第 52 行 = R2「备选」的文本，逐字一致**（`No. The gym is closed today, so there is no swimming either. …`），并删去 `too`

即：**首选的第 51 行 + 备选的第 52 行**的合并方案。这一点必须写明，否则「没照搬首选」的转述会让人误以为第 51 行未改、干扰项 A 仍无来源。

#### ② 四项核对（逐条回答）

| 核对项 | 结果 | 依据（行号） |
|---|---|---|
| gym 是否得一条**明文**理由 | ✅ 是 | L52 `The gym is closed today` → 排除 A |
| swimming 是否得一条**明文**理由 | ✅ 是 | L52 `so there is no swimming either` → 排除 C |
| 干扰项 A 是否重新获**第一等依据（女孩本人之口）** | ✅ 是 | L51 `I'd like to go to the gym and swim after school.` |
| 答案 B 是否仍唯一 | ✅ 是 | B 有直接指令句 L52 `Put ice on it for fifteen minutes and rest at home.`；A 被 closed 明否；C 被 no swimming 明否；D 被题干 `this evening` 的时间域排除（材料另有 `if it still hurts` 条件） |

排除力现已**三足鼎立**：A/C 各有一条明文否定，B 有明文指令，D 有时间域 + 条件双重否定。原缺陷中「干扰项与正确项可听性不对等」的问题已消除。

#### ③ 独立裁定：修复员的判断（「No. 是一次拒绝而非『已关闭』的事实」）是否成立？

**成立。** 理由如下（本复核独立推演，未采信修复员说法）：

1. `too` 是**附加焦点词**，要求 discourse 中已存在一个**谓语相同**的前项。
2. `No.` 是对女孩请求的**拒绝**，其蕴含内容是「不许可 / 做不到」，**不是「已关闭」**。谓语不匹配，`too` 的并列项在语义上仍然缺位。
3. **一致性检验**：R2 对 A6-11 的 `The clinic is closed too.` 用的正是「本句前无同谓语并列项」这一判据。既然该判据对 A6-11 成立，就必须对 A6-04 同样成立——否则同卷两处同型结构会得到两种结论。

#### ④ 独立裁定：R2 的「首选」是否真的只是把问题挪了位置？

**基本成立，但 R2 的描述与实际病灶略有错位，修复员的标签宜修正。**

- 首选（保留 `too`，只在女孩台词里加 gym）**修好的是「gym 无来源」**，**没有修好 `too`**。`too` 的悬空**原地保留**，只是从「完全无来源」弱化为「谓语不匹配的弱来源」。
- 严格说它不是「换了位置」，而是**同一个位置只修了一半**。修复员说「换了位置的假修复」在实质结论上正确，在措辞上略偏。

#### ⑤ 合并方案的优越性（本次复核的独立增量判断）

合并方案优于 R2 给出的两条方案中的任何一条：

- **单用备选**（只改第 52 行，女孩仍只说 swimming）：干扰项 A「Go to the gym after school」的唯一依据将只剩老师那句**否定性**提及 `The gym is closed today`，女孩从未表达过想去 gym。R2 备选自查中「gym 一词仍在，选项 A 依旧『有依据且被排除』」的说法，强度**弱于**其自己对首选的分析。
- **单用首选**：见 ④，`too` 未解。
- **合并**：A 获第一等依据 + `too` 彻底消失，两个病灶同时闭合，且耦合面仍限于同一题的 2 行。

**判定：闭合。**

#### ⑥ 残留观察（不计缺陷）

1. 「gym 关闭 → 因此也不能游泳」隐含「泳池在馆内」的**共享场地假设**，句子是断言而非说明。听力题中可接受：学生**无需依赖该假设**即可作答（A/C 均被明文排除，答案 B 不受影响）。
2. `No.` 已拒绝两项请求，后接 `either` 略有冗余，但属地道口语。
3. `The gym is closed today` 与 A6-05 的 `The gym is free then`（周三早七点）、`In the gym tomorrow at four` 若被读作同一时间线存在软张力。但**新增的 `today` 反而缩小了修复前的张力**（修复前 `The gym is closed too` 无时间限定），故本轮是净改善。

### 2.2 ankle → knee 并同步改标题：三处是否一致？——**一致，无残留**

| 位置 | 内容 | 判定 |
|---|---|---|
| 标题（L47） | `## A6-04 扭伤膝盖要冰敷` | ✅ 与 knee 一致 |
| 材料（L49） | `Girl: Mr. Zhao, my knee hurts. I fell off my bike.` | ✅ |
| 选项 A/B/C/D（L55–58） | gym / ice+rest / swimming / doctor — **无一提及身体部位** | ✅ 无第三处需改 |
| 后续指代 | `Put ice on it for fifteen minutes` 的 `it` → knee | ✅ 链条闭合 |

- **全卷 `ankle` 正则计数 = 0**（`\bankle\w*` 全文件扫描）；`knee` 计数 = 1（仅 L49）。
- 连带面核对：题干 `this evening`、答案 B `Use ice and rest at home`、`See a doctor tomorrow` 均与部位无关，**换词零连带**。
- **判定：三处一致，全卷无 ankle 残留。**

### 2.3 A6-05：跑道关闭 → 改在室内训练的因果是否成立？——**成立**

磁盘原文（第 61–74 行）：

```
Boy: Ms. Wang, where and when shall we train for the relay race?
Ms. Wang: The track is closed for repairs all week, so we'll train indoors. In the gym tomorrow at four.
Boy: What about Wednesday morning? I have no classes then.
Ms. Wang: Good. The gym is free then. Meet in it at seven in the morning.
Boy: Four tomorrow, then seven on Wednesday. Understood.
**Question**
How will they train on Wednesday?
- A. In the gym at seven in the morning.   ← Answer A
- B. On the track at four in the afternoon.
- C. In the gym at four in the afternoon.
- D. On the track at seven in the morning.
```

| 核对项 | 结果 | 依据 |
|---|---|---|
| 因果是否成立 | ✅ | L64 `The track is closed for repairs all week, **so** we'll train indoors.` —— 显式因果连接词，因果方向与时间方向一致 |
| 原①室内外矛盾（怕太阳晒） | ✅ 已消除 | `before the sun gets hot` 全卷计数 = 0 |
| 原②接力赛与跑道不匹配 | ✅ 已消除 | 改为「跑道整周维修 → 室内训练」，室内接力/节奏训练场景成立 |
| 「seven in the morning」是否**逐字**在材料中 | ✅ **逐字命中** | L66 `Meet in it at seven in the morning.` 与选项 A `In the gym at seven in the morning` 的时间短语完全一致 |
| 「In the gym」是否逐字 | ✅ | L64 `In the gym tomorrow at four` + L66 `The gym is free then` |
| 答案 A 是否仍唯一 | ✅ | B/D 的 `On the track` 被 L64 `closed for repairs all week` **明文**排除；C 的 `four in the afternoon` 被「四点是**明天**」（L64）+「周三定在早七点」（L65–66）**明文**排除 |
| 收尾复述是否自洽 | ✅ | L67 `Four tomorrow, then seven on Wednesday.` 与新台词逐项对齐 |

**残留（不计缺陷）**：接力赛在体育馆内训练属「室内交接/节奏训练」，R2 已判定可接受且四选项均不点名项目，无风险。

**跨题软张力（修复前既有，非本轮引入）**：A6-02 让女孩「right now」在跑道上跑，A6-05 说跑道整周维修关闭。修复前原文已含「The track is closed all week」，本轮仅补了原因词 `for repairs`，张力**非本轮新增**；且各题为独立情境。

### 2.4 A6-03：指代是否闭合？话题漂移是否消除？——**均已闭合**

```
Boy: Hi, Ms. Chen. Is there any milk in your fridge?
Ms. Chen: Yes, but look at the date on the milk box. The orange juice is for the picnic.
Boy: The milk says the tenth, and today is the eighteenth.
Ms. Chen: Then you can't drink it. Buy a small box at the shop, not a big bottle.
**Question**
What will the boy do now?
- A. Drink the orange juice now.
- B. Buy a big bottle of milk at the shop.
- C. Drink the milk in Ms. Chen's fridge.
- D. Buy a small box of milk at the shop.   ← Answer D
```

- **指代闭合 ✅**：L36 明文点名 `the date on the **milk box**`；L37 明文点名 `**The milk** says the tenth`；L38 的 `it` 其最近前项为 `the milk`，且牛奶盒与冰箱牛奶同指牛奶，**全链唯一**。原「读到的是牛奶盒还是果汁盒的日期」的歧义**已消除**。
- **话题漂移消除 ✅**：老师先用 `Yes, but look at the date on the milk box.` **正面回答**了关于牛奶的提问，橙汁句降为附带补充，不再是「答非所问」。
- **答案唯一 ✅**：D 有直接指令句支撑；B 被 `not a big bottle` 明否；C 被 `you can't drink it` 明否；A 被题干 `now` + 同句 `for the picnic` 否。

**残留（不计缺陷）**：`The orange juice is for the picnic.` 仍是老师主动交代的插入句（无人问津），但不引发误指代；对 A 的排除依赖「for the picnic ⇒ 不是现在」这一**时间推断**而非明文否定，是本题排除力最弱的一环，与 B/C 的明否不对称——但仍在可听辨范围内，且 D 有直接指令句兜底。

### 2.5 A6-14：now 与 later 是否构成显式时间对立？C 是否被明文排除？——**是**

- 题干 L200：`What should the girl do **now**?`
- 材料 L198：`Talk about the test **later**, when she is ready.`

| 核对项 | 结果 | 依据 |
|---|---|---|
| now / later 显式时间对立 | ✅ | 两词在同一材料-题干对中直接对撞，听力可辨 |
| 干扰项 C 被明文排除 | ✅ | C `Talk about the maths test with her.` ↔ `Talk about the test **later**` |
| B 被排除 | ✅ | `Don't say "cheer up"` |
| D 被排除 | ✅ | `not to the library` |
| now 是否泄露答案 | ✅ 否 | 材料中除三项建议外，无第二个「现在做」的动作 |
| 答案 A 唯一 | ✅ | A `Take her friend for a walk` ↔ `Take her for a walk` |

### 2.6 A6-15：补入因果后，A/B/C 的排除路径是否与改前完全相同？——**独立验证：完全相同，属实**

| | 改前：`Not on Friday — the sports meeting is on Thursday morning.` | 改后：`Not on Friday — you'll still be tired from the sports meeting on Thursday morning.` |
|---|---|---|
| **B** `On Friday afternoon` | 被 `Not on Friday` **直接**排除 | 被 `Not on Friday` **直接**排除（**路径不变**） |
| **C** `On Wednesday and Friday` | 合取式被 Friday 分支**直接**排除 | 同上（**路径不变**） |
| **A** `On Thursday morning` | **非**明文排除；依据＝破折号内 `the sports meeting is on Thursday morning`（周四上午被运动会占用）＋首句 `Practise that on Monday and Wednesday` 只点名周一/周三 | 该短语**逐字保留**，排除路径**完全相同** |

- 变化**只有一处，且只加不减**：新增 `you'll still be tired from`，把因果补成「周四运动会 → 周五仍累 → 周五不练」，因果方向与时间方向一致，`be tired from` 搭配地道。
- 答案 D 仍由首句 `Practise that on Monday and Wednesday.` 直接给出，**未受影响**。
- **修复员「排除路径与改前完全相同」的声称，独立验证成立。** 边界控制正确（未擅自扩改）。

**残留（不计缺陷）**：A 仍是全卷唯一**未被明文否定**的干扰项。R2 的建议方案本就不解决这一点，修复员未越界扩改，属正确处置。

---

## 3. 全卷机器扫描（清单 7，独立复算）

> 脚本为本复核独立编写，答案解析兼容 `**Answer** C` 同行写法；话轮解析采用 `^([A-Za-z][A-Za-z. ]*?): ` 以正确识别 `Ms./Mr.` 标签。

**答案序列：C A D B A C B D A C D B C A D**（页脚 L222 与 15 题 Answer **逐题一致** ✅）

| 检查项 | 独立复算结果 | 判定 |
|---|---|---|
| **周期 p=2–6**（每周期可比对 ≥9 对，满足「≥2 对」要求） | p=2 命中 0/13、p=3 4/12、p=4 3/11、p=5 4/10、p=6 0/9 → **5 个周期全部阴性** | ✅ 通过 |
| **周期扩展窗口 p=7–13**（仅纳入可比对 ≥2 对者） | p=7 3/8、p=8 2/7、p=9 2/6、p=10 0/5、p=11 0/4、**p=12 3/3 命中**、p=13 0/2（仅 2 对，勉强够格） | ⚠️ 见下方裁定 |
| **最长连续相同** | **1**（相邻相同答案对 0/14） | ✅ 通过 |
| **四字母覆盖（1.8b）** | A4 / B3 / C4 / D4；A、B、C、D **全部**作过正确答案，**零覆盖字母 0 个** | ✅ 通过 |
| **逐题位置偏斜** | 答案位置分布 A×4、B×3、C×4、D×4，最高占比 26.7%（70% 阈值在 n=15 需 ≥9 次）。**补充检查「正确项恒为最长/最短选项」：最长 1/15、最短 0/15**（随机期望各 3.75）→ 无长度暗示 | ✅ 通过 |
| **相邻同说话人标注** | 54 个相邻话轮对，**命中 0**；每题恰 2 名说话人交替，无第三说话人 | ✅ 通过 |
| **材料内重复轮次（Jaccard ≥ 0.6）** | 比对 **126** 对，命中 **0** | ✅ 通过 |
| **跨材料重复轮次（Jaccard ≥ 0.7）** | 比对 **2,220** 对，命中 **0**（最高一对 J=0.33） | ✅ 通过 |
| **开场白归一化** | 15 个首句 key **互不相同**（15/15 唯一）；**额外追加检查收尾句，亦 15/15 唯一** | ✅ 通过 |
| **结构比（段数 : 题数）** | `**Dialogue**` 段 **15** : 题目 **15** = **1 : 1**（A 类要求）；话轮 **69**（5/5/4/4/5/5/4/5/5/4/4/5/5/4/5） | ✅ 通过 |
| 格式合规 | 15 题齐备 `## 编号 标题` / `**Dialogue**` / `**Question**` / `**Answer**`；编号 01–15 连续；每题恰 4 个 A/B/C/D，选项正文无重复；无混入注释或思考过程 | ✅ 通过 |
| 文件卫生 | 无 tab、无 CR（纯 LF）、无行尾空格、无 TODO/注释/残留标记、文件末尾仅一个换行 | ✅ 通过 |

### p=12 周期的裁定（本轮唯一统计性命中）

- **事实**：位置 1–3 = `C A D`，位置 13–15 = `C A D`，完全重合，3 对可比对全部满足 `seq[i]==seq[i+12]`。
- **不判为缺陷的理由**：
  1. **统计上是预期内的噪声**：单一周期全中的概率为 (1/4)³ = **1.56%**；p=2..13 全族并集上界 Σ₍ₚ₌₂..₁₃₎ (1/4)^(15−p) ≈ **8.3%**。在 n=15 下观察到 1 次命中完全在期望之内，**不是**「小样本巧合被误当缺陷」的镜像（这里是「小样本巧合被如实报告」）。
  2. **不可利用**：考生无法从任何连续窗口看出步长为 12 的循环；各题为独立听力材料，1–3 题的答案不构成 13–15 题的可推前提。
  3. **非本轮引入**：答案序列在本轮修复中**一字未动**（与 R2 审核时的序列完全相同），该命中在 R2 审核时即已存在。
- **处置建议**：**不计缺陷，不阻断归档**。若日后因其他理由重排本卷答案键，可顺手打散；无需为此单独返工。

### 与 R2 机检数字的记账核对（不影响任何结论）

- R2 正文写「全部 **72** 个话轮」，但其自报的 **126 / 2,220** 两组配对数**恰好对应 69 话轮的分布**（可复算：Σ C(tᵢ,2)=126、(69²−Σtᵢ²)/2=2,220）。说明 **72 是正文笔误**，扫描口径一致，两轮阴性结论不受影响。
- 行数：R2 基线 222 行 / 7,908 bytes → 现 222 行 / 8,044 bytes。**字节 +136 而行数不变**，与「A6-05 补入第 67 行」的直觉预期不符；更合理的推断是第 67 行（男孩收尾）在修复前**已存在**（措辞不同），即本轮 A6-05 的实际改动面为 **64 / 66 / 67 三行**，比 R2 自述的「仅 64、66 两行」多一行。该行改写是**必要的**（须与新台词的 `seven` 对齐），属正确扩改而非越界。
  *说明：该文件未被 git 跟踪（`?? data/item-bank/prod/A6.md`），且 `fixes/` 按纪律不可查阅，故修复前状态**无法对照**，此项仅作记账说明，不构成任何结论依据。*

---

## 4. 新增语言质量检查（清单 8）

对本轮**新增或改写的每一句**逐句审读：

| 行 | 句子 | 判定 |
|---|---|---|
| 36 | `Yes, but look at the date on the milk box.` | ✅ 自然 |
| 37 | `The milk says the tenth, and today is the eighteenth.` | ⚠️ 略压缩（更自然的是 `The date says the tenth`），但语义唯一、可听辨，且「牛奶盒上的日期」正是本题考点 → 不计缺陷（文体偏好） |
| 41 | `Drink the orange juice now.` | ✅ |
| 49 | `my knee hurts` | ✅ |
| 51 | `I'd like to go to the gym and swim after school.` | ✅ |
| 52 | `No. The gym is closed today, so there is no swimming either. …` | ✅ 语法、搭配均正确 |
| 64 | `The track is closed for repairs all week, so we'll train indoors. In the gym tomorrow at four.` | ✅ `we'll` 缩写与全卷风格一致（`I'm / can't / I'll / That's right`）；后半句为省略句，作 where-and-when 的答语可接受 |
| 66 | `Good. The gym is free then. Meet in it at seven in the morning.` | ✅ `Meet in it` 略随意，口语可接受 |
| 67 | `Four tomorrow, then seven on Wednesday. Understood.` | ✅ |
| 200 | `What should the girl do now?` | ✅ |
| 212 | `… you'll still be tired from the sports meeting on Thursday morning.` | ✅ `be tired from` 搭配地道；破折号与英式拼写（`Practise` / `metres`）与全卷一致 |

**超纲词筛查（材料 / 题干 / 选项三处逐词）**——本轮新引入的词：`repairs`、`indoors`、`free`（空闲义）、`either`、`still`、`knee`。

- `knee`：课标五级「人体」类内（R2 已确认，本次沿用）→ 合规
- `repairs` / `free` / `either` / `still`：课标常见范围 → 合规
- `ankle`：随本轮替换**全卷计数归零** → 原争议消除
- ⚠️ `indoors`：本轮**唯一新增且无法确认落在课标五级词表内**的词。**本次复核的联网检索通道鉴权失败（HTTP 401），无法核对词表原文，按纪律标注为低置信度**。但它**不承载任何作答信息**：答案 A 只依赖 `gym` 与 `seven in the morning` 两项明文线索，`indoors` 仅交代因果方向，学生不解该词也能选对 → **即便超纲亦不构成理解障碍，不计缺陷**。
  *若追求零风险：零成本替代方案为 L64 改成「…so we'll train in the gym. It's free at four tomorrow.」，但会与现有后半句重复、改动面反而变大，**本次不建议改动**。*

**结论：未发现新的语法错误、搭配问题或影响作答的超纲词。**

---

## 5. 残留观察清单（均不阻断归档）

| # | 位置 | 观察 | 性质 |
|---|---|---|---|
| 1 | 全卷 | R2 的 **7 条轻微项一条未修**（L23 `five minutes of jumping`、L81 `after the test`、L96 `Reading in the car is bad too.`、L154 `The clinic is closed too.`、L160 `rest all day` 与题干 `this afternoon` 范围不一致、L167 陈句与问号混用、A6-04·A6-11 题干与答案语义相近） | **遗留**。在 R2 的处置口径内（中等项本轮必修、轻微项可留），但需记录 |
| 2 | **L154 vs L52** | **口径不一致**：本轮把 A6-04 的同型病灶（同谓语并列项缺失的 `too`）治好了，而 A6-11 的 `The clinic is closed too.` **原样保留**。同卷内出现两种处理尺度 | **遗留**，建议后续卷统一口径时一并处理 |
| 3 | A6-14 C | 全卷唯一靠间接推论排除的干扰项，但已由题干 `now` 补齐为**显式时间对立** | 已闭合 |
| 4 | A6-15 A | 全卷唯一未被明文否定的干扰项（`Not on Thursday` 从未出现） | **遗留**，属 R2 方案范围内未解决，修复员未越界扩改 |
| 5 | A6-02 × A6-05 | 「跑道整周维修关闭」与「女孩此刻在跑道上跑」存在跨题软张力 | **遗留，修复前既有**（「closed all week」原文即有），非本轮引入 |
| 6 | 全卷 `gym` | 对话行中 gym 由 4 处增至 5 处（全卷含选项共 8 → 9）。R2 在首选下注「若当初的改动是为规避 gym 在全卷的出现频次」——该假设在 R2 中即未成立（频次阈值无依据），本轮不构成回退 | 无影响 |

---

## 6. 可归档判定

- R2 的 **6 条中等缺陷全部真正闭合**，且 A6-04 的闭合方案**优于**原「首选」，A6-05、A6-15 的改动边界控制准确。
- **未发现任何由本轮修复引入的新缺陷**（语法 / 搭配 / 超纲 / 答案唯一性 / 材料内部一致性 / 干扰项排除力 / 机检各项均无回归）。
- 残留 6 项全部为**修复前既有**或**R2 处置口径内的遗留**，均不阻断归档；其中 #2（A6-11 同型 `too` 未同步处理）建议在后续批次统一口径时补做，**不必为此重开 A6**。

> **A6 可归档。**

---

*本报告仅新增 `data/item-bank/reviews/V-A6.md`，未修改任何题目文件。*
