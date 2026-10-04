# 复核报告：A-batch0.md 二轮修复后（V-A0）

> 复核对象：`data/item-bank/A-batch0.md`（A-01 ~ A-20，共 20 题）当前内容
> 复核基准：`reviews/R2-A0.md` 提出的 9 条中等缺陷（M1–M9，共 13 处 edit）
> 复核立场：**不采信修复方自检**，全部逐行重读原文独立判断；未查阅 `reviews/R1-A0.md`，未查阅 `fixes/` 下任何文件；**未修改任何题目文件**

## 结论

| 指标 | 数值 |
|---|---|
| 复核题数 | **20（逐题过，无抽样）** |
| 答案唯一性通过 | **20 / 20** |
| 二轮 9 条中等缺陷落地核验 | **9 / 9 全部落地，13 / 13 处 edit 逐行比对一致** |
| **新引入缺陷** | **严重 0、中等 0、轻微 2** |
| 残留缺陷（二轮未处理的轻微项） | 11 条（全部为 R2 已列的 L 项，非本轮新增） |
| 是否通过 | **通过，可归档**（残留项均为 R2 已记录的轻微设计取舍，不阻塞归档） |

---

## 一、13 处 edit 落地核验（逐行比对当前文件）

| 条目 | 行 | 当前内容 | 状态 |
|---|---|---|---|
| M1 | L113 | Mum: Near the community entrance, beside the small garden. | 已改 |
| M2 | L104 | - C. One and a half years. | 已改 |
| M3 | L145 | - B. See the doctor after school. | 已改 |
| M4-a | L23 | Man: Excuse me, can I help you? | 已改 |
| M4-b | L25 | Man: Sorry, we don't have M today. We only have L and S. | 已改 |
| M5-a | L153 | Boy: Mum, I always get a free plastic bag at the shop. | 已改 |
| M5-b | L155 | Boy: What else can I do? | 已改 |
| M5-c（连带） | L156 | Mum: Please say no to the plastic bag. You can also walk to the market. | 已改，it 已消除 |
| M6 | L210 | Man: Hello, where's the post office? | 已改 |
| M7 | L212 | Man: Is there anything near it? | 已改 |
| M8 | L286 | Boy: How many trees will each student plant? Who will bring the tools? | 已改 |
| M9 | L261 | - A. He puts them in his other bag. | 已改 |
| L6（与 M5 耦合而被拉入的轻微项） | L161 | - C. He gets a free plastic bag from the shop. | 已改 |

> 13 处全部在文件中找到，无遗漏、无改错行、无半途落地。

## 二、清单 1：答案唯一性 20/20

改动过的 8 题（A-02 / A-07 / A-08 / A-10 / A-11 / A-15 / A-18 / A-20）逐题重读，未发现第二个可推出答案；未改动的 12 题同时复查，同样唯一。

| 题号 | 答案 | 材料依据 | 排除其余三项的理由 | 结论 |
|---|---|---|---|---|
| A-01 | B | L10 on the third floor | C (beside the school gate) 是**图书馆**的位置（L12），问的是音乐教室 | 唯一 |
| **A-02** | C | L26 I'll take L + L24 a blue shirt | A size S：明说只拿 L；B size M：we don't have M；D white shirt：明说 blue | 唯一 |
| A-03 | D | L40 About ten minutes on foot | B 与 L38 turn left 矛盾；C 时间错；A by bus 与 on foot 矛盾 | 唯一 |
| A-04 | A | L55 Some pears | 材料无 apples/biscuits/rice | 唯一 |
| A-05 | B | L70 practises at five | A four 是比赛时间（L68）；C/D 无依据 | 唯一 |
| A-06 | C | L85 moon cakes and make fruit salad | A/B/D 全无出现 | 唯一 |
| **A-07** | D | L99 For about two years | A/B 差太远；C one and a half 无依据。改后四项**同为 years 单位**，C 不再因"月/年"单位不同而可一眼排除 | 唯一 |
| **A-08** | A | L111 Take them to the recycling bin | B kitchen bin、C classmates、D post office 材料均无 | 唯一 |
| A-09 | C | L125 platform three + L127 the slow one | A/D 车速错，B 站台错 | 唯一 |
| **A-10** | B | L141 I'll see the doctor after school | A 科目错（dentist）；C/D 无依据。改后 A/B/D 同带 after school，**正确项不再是被排除的"异类"** | 唯一 |
| **A-11** | C | L153 I always get a free plastic bag at the shop | A cloth bag 是 Mum 的**建议**（L154）而非他的**习惯**；B paper bag、D bus 材料均无 | 唯一（且比修前更稳，见第三节） |
| A-12 | A | L168 watching a video | B/C/D 均无出现 | 唯一 |
| A-13 | A | L184 before nine o'clock + L183 tomorrow morning | B 与 L182 need it tonight 矛盾；C 与 before 矛盾；D 无依据 | 唯一 |
| A-14 | D | L198 Four kilos + L196 bananas | B 是"两个纸袋"的袋数陷阱，与"几公斤"无关；A/C 品类错 | 唯一 |
| **A-15** | B | L213 right beside the city library | A/C/D 均无出现 | 唯一 |
| A-16 | C | L228 Wednesday and Friday afternoon | A/B/D 日期时段全错 | 唯一 |
| A-17 | A | L241 sweep it + L243 clean the table | B 是 Dad 的事；C mother's room 材料无；D 与 L240 矛盾 | 唯一 |
| **A-18** | B | L258 leave them at the counter | C/D 材料无；A other bag **材料从未提及第二只包**，不构成可推出答案（见第四节观察项） | 唯一 |
| A-19 | D | L273 Saturday + half past seven | A/B 日期错；C at eight 是活动开始时间而非到场时间 | 唯一 |
| **A-20** | D | L287 Two or three trees each | A/B/C 数量无依据 | 唯一 |

**结论：20/20 答案唯一，本轮修复未在任何一题制造第二答案。**

---

## 三、清单 2 / 3：M4 人物标注、M5 指代链

### 3.1 M4 人物标注 —— 全卷扫描通过

**A-02 现状**（L23/L25 均为 Man:），**A-14 现状**（L195/L197/L199 均为 Woman:），两题店员均为成年角色，标注统一落在 Man/Woman 一类，**不再自相矛盾**。R2 提出的"两条路只能选一条、绝不能只改一题"约束已满足。

**全卷 20 题说话人清单（脚本提取）**：

| 题 | 说话人序列 | 题 | 说话人序列 |
|---|---|---|---|
| A-01 | Girl/Boy/Girl/Boy | A-11 | Boy/Mum/Boy/Mum |
| A-02 | Man/Girl/Man/Girl | A-12 | Mum/Tom/Mum/Tom |
| A-03 | Man/Woman/Man/Woman | A-13 | Boy/Lily/Boy/Lily |
| A-04 | Mum/Jack/Mum/Jack/Mum | A-14 | Woman/Man/Woman/Man/Woman |
| A-05 | Boy/Girl/Boy/Girl/Boy | A-15 | Man/Woman/Man/Woman |
| A-06 | Girl/Boy/Girl/Boy/Girl | A-16 | Girl/Tom/Girl/Tom/Girl |
| A-07 | Boy/Girl/Boy/Girl | A-17 | Dad/Tom/Dad/Tom/Dad |
| A-08 | Boy/Mum/Boy/Mum | A-18 | Woman/Man/Woman/Man/Woman |
| A-09 | Woman/Man/Woman/Man | A-19 | Woman/Man/Woman/Man/Woman |
| A-10 | Mum/Tom/Mum/Tom | A-20 | Boy/Girl/Boy/Girl |

- **同一角色被拆成两种标注：0 处。** 文件级约定清晰自洽：家长 → Mum/Dad；成年陌生人/店员 → Man/Woman；同龄学生 → Boy/Girl。跨题人名 Tom（A-10/A-12/A-16/A-17）、Jack（A-04）、Lily（A-13）标注跨题保持一致，无改名、无漂移。
- **相邻同说话人标注：0 命中**（脚本全文件扫描）。M4 的两处改动没有制造 Man: → Man:。
- **新的标注冲突：0 处。**

### 3.2 M5 的 it 指代链 —— 闭合

A-11 现状：

| 行 | 内容 |
|---|---|
| 153 | Boy: Mum, I always get a free plastic bag at the shop. |
| 154 | Mum: You can use a cloth bag when you go shopping. |
| 155 | Boy: What else can I do? |
| 156 | Mum: Please say no to the plastic bag. You can also walk to the market. |

- **A-11 内已无任何悬空 it**：L156 的 it 被替换为 the plastic bag，其先行词即 L153 同句出现的 a free plastic bag——**同句内、隔一轮指代，链条最短、指向唯一**，不存在"隔三轮还指不明"的风险。R2 提出的两种方案中风险更高的那种被避开了。
- **A-15 的 it 亦闭合**（M7 连带）：L212 的 it → L210 的 the post office；L213 的 it → 同为 the post office（若解为 the library，则成"图书馆在图书馆旁"，语义自洽性反证其指向前者）。两条 it 均有唯一先行词。
- 全文件再无其它裸 it（A-12 L169 put it away、L170 use it 指 L167 的 phone，闭合，属未改动项）。

### 3.3 M5/L6 选项 C 改动后是否仍可判 —— 可判，且比修前更稳

- 选项 C 现为 `- C. He gets a free plastic bag from the shop.`，材料 L153 动词为 get，**动词完全对齐**，L6 指出的"选项比材料多一层推断"已消除。
- 四个选项结构统一为 He + 动词 + 宾语 + 地点（takes a cloth bag to the shop / buys a paper bag at the shop / gets a free plastic bag from the shop / takes a bus to the market），无形式线索。
- **A 项 cloth bag 的诱惑力未被本轮改动放大**：修前 L155 已写明 I usually get a free plastic bag，修后 L153 说的是同一件事，只是提前一轮；"他实际带着什么袋"与"他被建议带什么袋"的区分在修前修后一致。题干问 usually do（习惯），材料用 always 呼应，指向 C 无歧义。

---

## 四、清单 4：M9 超纲词与 A-18 材料/选项对应

### 4.1 被保留的四个词是否构成问题 —— 不构成，保留成立

> **诚实的口径声明**：本次未能取到权威的《义务教育英语课程标准（2022年版）》五级词汇表原文（教育部 PDF 与各聚合页分别返回 403 / 无该词条目），因此以下判断**基于题目设计层面**（是否不可避免、是否透明可推、是否属听力中只需听辨的功能性名词），**不是**基于官方词表逐条比对。

| 词 | 位置 | 判断 |
|---|---|---|
| platform（站台） | A-09 材料 L125 + 选项 L130/L132/L133 | **保留成立。** 该词是本题"车速 × 站台"2×2 网格的**区分轴本身**，删除即需重做整题。且本题是**听力**题，学生只需听辨该功能名词，无需拼写；交通站点语境下该词几乎不可避免。R2 关于"只改材料或只改选项会使答案失去依据"的分析成立。 |
| recycling bin（回收箱） | A-08 材料 L111/L112 + **选项 A L116（正确项）** | **保留成立。** recycle + bin 均为小学高段词，构成透明复合词；正确项即含该词，替换必然波及答案。 |
| counter（柜台） | A-18 材料 L258 + **选项 B L262（正确项）** | **保留成立。** at the counter 是固定常见搭配，词频高、非专业术语；正确项即含该词，替换必然波及答案。 |
| patient（有耐心的） | A-16 材料 L226 | **保留成立。** 与"耐心"完全对应，学生无理解障碍；且它是 A-16 中**与考题无关的陪衬信息**（该题只考上课时间），删之无收益。 |

**结论：四个被保留的词均不构成阻塞性问题，R2 的"保留"判断成立，本轮未在此处引入新问题。**

### 4.2 A-18 材料与选项对应关系 —— 仍一致

- 正确项 B（He leaves them at the counter.）↔ 材料 L258（You can leave them at the counter and get them on Monday.）：**动词、宾语、地点三要素逐项对应**，未因 coat bag 的替换而受影响。
- 干扰项 A 改后为 He puts them in his other bag.：**材料中确实不存在"另一只包"的字样**，因此 A 不构成可推出答案。
- **观察项（非缺陷，供下轮留意）**：材料 L256 的 Twenty kilos for each bag 用了 each bag（复数概念），理论上给 A 项"分装到另一只包"留了一条很弱的推理路径。但 L254 的 Your bag is too heavy 为单数、L256 的 Yours is twenty-three kilos 紧承单数主语，且材料已明确给出 leave them at the counter 的**唯一行动方案**——该路径不足以支撑第二个答案，**不判为缺陷**。
- **数字复核**：20 公斤限额 / 实重 23 公斤 / 每袋 20 公斤，运算无误、前后自洽。

---

## 五、清单 5：M1（green house → beside the small garden）—— 无残留冲突

- A-08 全题（L108–L120）重读：材料 L111、L112、L113，题干 L115 与选项 L116–L119 **均不再出现 greenhouse / green house**，全题无任何残留。
- 按 R2 提示的"上调后的严重"口径复查：beside the small garden 句意完整、语法正确、地标合理（回收箱放在小花园旁），**不再产生"绿色的房子作地标"的句意不通**，严重级问题解除。
- 下游一致性：L112 是对 L111 原词的复现，选项 A（Put them in a recycling bin.）与之一致，**三处用词仍统一**（R2 要求 L111/L112/L116 同改；本轮虽未改词，但三者本就一致，无隐患）。

---

## 六、清单 6：开场白撞车 —— are you free × 2 **不阻塞归档**

### 6.1 现状（脚本归一化实测：首句去标点 + 小写，取前 3 词建字典）

| 模板 | 命中 |
|---|---|
| excuse me where | **0 组**（M6 已消除） |
| **are you free** | **1 组 × 2 题**：A-04 L51 / A-06 L81 |
| 跨题开场内容词相似度（阈值 0.30） | **零命中**——R2 报告的 0.40 一对（A-02 × A-11，即 M5 所指）与 excuse me where 归一化撞车均已解除 |

### 6.2 判定：不阻塞归档，理由四点

1. **它是 R2 已列的 L4（轻微），不是本轮新引入的缺陷。** 本轮 9 条中等全部落地，are you free 从修前到修后**状态未变**，既不构成"二轮引入新问题"，也不构成"二轮未完成"。
2. **实际危害极低。** 两题除首句三词外，人物关系（Mum→Jack vs Girl→Boy）、场景（家庭采购 vs 中秋邀约）、后半内容、考点、答案位置（A vs C）**全不相同**。20 题里出现两次 Are you free…? 的邀约式开场，是题库中最常见的自然现象，不构成规范 1.7 所指的"情境雷同"。
3. **L2 与 L4 的耦合风险尚未被激活。** L2 要求同改 A-06 的 L79（标题）与 L87（题干 dinner），L4 要求改 L81，三处需连读校对。本轮 A-06 **一行未动**，L79/L81/L87 保持原有自洽状态，**不存在"改了一半"的中间态**，也未制造新的连读冲突。若将来处理，一次性连改三行即可，风险可控。
4. **轻微项本就属"记录并延后"档。** 按 R2 自定分级（轻微 = 记录/可选），归档时应作为**已知待办**登记，而非阻塞项。

**建议（不阻塞，可延后）**：将 A-06 的 L81 改为 Do you have plans on Friday evening?（仅一行，A-04 不动），即可与 A-04 彻底分开；届时与 L2 的 L79/L87 一并连读校对。

---

## 七、清单 7 / 8：序列、分布与话轮结构（脚本实测）

### 7.1 答案分布

| 题 | A-01 | A-02 | A-03 | A-04 | A-05 | A-06 | A-07 | A-08 | A-09 | A-10 |
|---|---|---|---|---|---|---|---|---|---|---|
| 答案 | B | C | D | A | B | C | D | A | C | B |

| 题 | A-11 | A-12 | A-13 | A-14 | A-15 | A-16 | A-17 | A-18 | A-19 | A-20 |
|---|---|---|---|---|---|---|---|---|---|---|
| 答案 | C | A | A | D | B | C | A | B | D | D |

- **A5 B5 C5 D5**，与文件头 L3 声明"共 20 题｜答案分布 A5 B5 C5 D5"**完全一致**。
- 本轮 9 条修改中**没有任何一处改动 Answer 行**，分布与二轮修复前完全相同——修复未扰动分布。

### 7.2 周期检测（p = 2 … 6）

| p | 结果 | 首个断裂点 |
|---|---|---|
| 2 | 无纯周期 | A-01(B) vs A-03(D) |
| 3 | 无纯周期 | A-01(B) vs A-04(A) |
| 4 | 无纯周期 | A-05(B) vs A-09(C) |
| 5 | 无纯周期 | A-01(B) vs A-06(C) |
| 6 | 无纯周期 | A-01(B) vs A-07(D) |

**结论：p=2..6 均无纯周期序列，答案序列不存在可被背下来的规律。**

### 7.3 最长连续相同

- **最长连续相同 = 2**，共两处：**A-12–A-13（均为 A）**、**A-19–A-20（均为 D）**。
- 无 3 连及以上，可接受。

### 7.4 话轮与格式结构

- **相邻同说话人标注：0 命中**（见 3.1）。
- **重复轮次 / 复制粘贴残留：0 处**——全文件话轮文本归一化后无任何一条完全重复。同材料内两两 Jaccard 仅三处超阈值，且全部是**设计性复现**：A-08 L111×L112 = 0.40（Boy 复现 Mum 的原词 recycling bin）、A-20 L286×L287 = 0.36（一问一答紧邻对应）、A-06 L81×L83 = 0.30（专名 Mid-Autumn Festival 复现）。**无一处是"同一问答被复制两遍"**。
- **格式**：20/20 题均具备 Dialogue / Question / Answer 标记，每题**恰好 4 个选项**且键位恒为 A/B/C/D；编号 A-01~A-20 连续无缺号；结构标记全为 Question 单问选择题，无 D/E 类混入。

---

## 八、清单 9：新引入的语法 / 超纲词 / 中式表达（13 处改动逐行扫描）

| 改动行 | 新文本 | 语法 | 超纲词 | 中式表达 |
|---|---|---|---|---|
| L23 / L25 | Man: … | 通过 | 无 | 无 |
| L104 | One and a half years. | 通过 | 无 | 无 |
| L113 | beside the small garden | 通过 | 无（garden 为小学词） | 无 |
| L145 | See the doctor after school. | 通过 | 无 | 无 |
| L153 | I always get a free plastic bag at the shop. | 通过（称呼语 + 独立句） | 无 | 无 |
| L155 | What else can I do? | 通过 | 无 | 无 |
| L156 | Please say no to the plastic bag. | 语法正确 | 无 | 见 R-1 |
| L161 | He gets a free plastic bag… | 通过 | 无 | 无 |
| L210 | Hello, where's the post office? | 通过 | 无 | 无 |
| L212 | Is there anything near it? | 通过 | 无 | 无 |
| L261 | He puts them in his other bag. | 通过 | 无 | 无 |
| L286 | How many trees…? Who will bring the tools? | 通过（两个独立问句） | 无 | 无 |

**新语法错误：0；新超纲词：0**（引入词 garden / cloth bag / other bag / where's / plastic bag 全为课内高频词）；**新中式表达：0 条硬伤，1 条轻微存疑见 R-1。**

---

## 九、本轮新引入的轻微缺陷（2 条，均不阻塞归档）

### R-1（轻微 · A-11 L156）say no to the plastic bag 搭配欠地道

- **现状**：Mum: Please say no to the plastic bag. You can also walk to the market.
- **问题**：say no to 的宾语通常是被**拒绝的提议/请求**（say no to the offer），而非"一个袋子"本身；say no to the plastic bag 有轻微中式痕迹。
- **性质澄清（重要）**：该搭配**并非本轮新造**——修前原文为 Please say no to it.，it = the plastic bag，本就存在同样问题。本轮只是把先行词显式化，**并未加剧**。且 R2 报告 M5 的边界段正是以这句作为**可选**改法给出的，修复员照做，责任不在修复方。
- **可选改法**（仅 L156 一行，不影响答案）：
  - Mum: Please say no when they offer a plastic bag. You can also walk to the market.
  - 或 Mum: Please don't take the plastic bag. You can also walk to the market.
- **判定：轻微，不阻塞归档。**

### R-2（轻微 · A-11 L154/L156）Mum 隔一轮重复同一条建议

- **现状**：L154（You can use a cloth bag when you go shopping.）→ L155（What else can I do?）→ L156（Please say no to the plastic bag.）——L154 与 L156 第一句是同一条建议的两种说法，而 L155 的 What else（"除此之外我还能做什么"）问的是**新信息**，Mum 却先重复旧建议、再补新信息。
- **是否新引入**：**是**。修前为 Mum（You can use a cloth bag…）→ Boy（I usually get a free plastic bag from the shop.）→ Mum（Please say no to it.）——Boy 那轮是在**陈述新事实**（我每次都拿到免费塑料袋），Mum 的 say no to it 是对该新事实的**新回应**，衔接成立；改后 Boy 那轮改成提问，衔接出现轻微打结。
- **可选改法**（仅 L155 一行即可解开，且不破坏 M5 破模板的目的）：
  - Boy: And what about the plastic bag?
  - 或 Boy: What about the free plastic bag?
- **严重度评估**：真实口语中"先澄清再补充"是常见节奏，不影响理解、不影响答案可判性，不构成语法或中式问题。**轻微，不阻塞归档。**

> 除上述两条外，本轮未引入任何新缺陷。

---

## 十、残留缺陷清单（本轮未处理，全部为 R2 已列的轻微项，非本轮新增）

以下各项**均为 R2 报告已记录的轻微缺陷**。二轮范围只修 9 条中等，故状态未变；逐条重读确认现状与 R2 描述一致，**无恶化、无连带损伤**。

| 项 | 题号 | 位置 | 现状确认 | 阻塞 |
|---|---|---|---|---|
| L1 | A-09 | L122 | 标题仍含"车次"，材料确无 G/D/K 车次号 | 否 |
| L2 | A-06 | L79 / L87 | 标题与题干仍用"晚餐/dinner"，材料只说月饼与水果沙拉 | 否 |
| L3 | A-12 × A-17 | L172 × L245 | 两题题干仍只差 going to | 否 |
| L4 | A-04 × A-06 | L51 × L81 | are you free 仍 2 次（见第六节专项判定） | **否** |
| L5 | A-16 | L233 | 选项 C 与材料 L228 仍逐字相同 | 否 |
| L7 | A-12 | L167 | on the phone 与"看视频"仍有张力；四选项介词本就统一为 on the phone，不构成选项不同类 | 否 |
| L8-a | A-16 | L226 | Our teacher is very kind and patient. 仍缺转折词 | 否 |
| L8-b | A-10 | L141 | 破折号连两个信息仍在 | 否 |
| L9 | A-03 | L40 | It's just around the corner. 仍在，与"second crossing + 十分钟"仍有距离感冲突（该句未进入任何选项，不影响答案可判） | 否 |
| L10-a | 文件头 | L5 | （待派）状态标记仍在 | 否 |
| L10-b | 文件级 | L149 / L150 | 双空行仍在 | 否 |

> L6 虽属轻微，但因与 M5 耦合，已被本轮一并修掉（见第一节），故不在残留清单。

---

## 十一、已复核题号清单（覆盖率证明）

逐题复核，**20/20**，无抽样：

1. A-01（唯一性复查）
2. **A-02（M4 · 改动题）**
3. A-03（L9 残留复查）
4. A-04（L4 撞车方复查）
5. A-05
6. A-06（L2 / L4 残留复查）
7. **A-07（M2 · 改动题）**
8. **A-08（M1 · 改动题）**
9. A-09（L1 / M9-platform 残留复查）
10. **A-10（M3 · 改动题）**
11. **A-11（M5 + L6 · 改动题，R-1 / R-2 所在）**
12. A-12（L3 / L7 残留复查）
13. A-13
14. **A-14（M4 标注基准复查）**
15. **A-15（M6 + M7 · 改动题）**
16. A-16（L5 / L8a / M9-patient 残留复查）
17. A-17（L3 残留复查）
18. **A-18（M9 · 改动题）**
19. A-19
20. **A-20（M8 · 改动题）**

**合计：新引入 严重 0 ｜ 中等 0 ｜ 轻微 2（R-1、R-2，均不阻塞）；残留轻微 11 项（均为 R2 已记录）。**

---

## 十二、最终判定

- **二轮 9 条中等缺陷：9/9 落地，13/13 处 edit 逐行比对一致，无遗漏、无改错行、无半途落地。**
- **未引入任何新的严重或中等缺陷。**
- 新引入 2 条轻微（A-11 的搭配地道性 R-1、衔接打结 R-2），均不阻塞，且 R-1 实为修前既有搭配问题的显式化。
- **are you free 撞车是修前既有的轻微项（L4），二轮未触碰 A-06，不阻塞归档**；建议作为已知待办登记，若处理需连读 L79 / L81 / L87 三行。
- 全部脚本项复测通过：格式 20/20、答案分布 A5 B5 C5 D5、p=2..6 无纯周期、最长连续相同 = 2、相邻同说话人 0、无重复轮次、无跨题开场 > 0.30。
- **结论：通过，可归档。**

