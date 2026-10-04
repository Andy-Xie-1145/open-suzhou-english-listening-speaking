# 复核报告：A3.md 二轮修复后复核（V）

> 复核员未参与修复；除 `reviews/R2-A3.md` 外未读取 `reviews/`、`fixes/` 下任何文件。
> 所有脚本扫描均为本次独立重跑，未采信修复方自检结论。
> 参考规范：`data/item-bank/REVIEW-RUBRIC.md`。

---

## 结论

- **审核文件**：`data/item-bank/A3.md`
- **复核题数**：15（A3-01 ~ A3-15，**逐题复核，无抽样**）
- **本轮新发现的缺陷：严重 0 条｜中等 0 条｜轻微 11 条**（全部为 R2 已列而本轮仍未修的残留项，或新写法的细微瑕疵，无一影响答案可判性）
- **是否通过：通过**（可用；建议下一轮清理 11 条轻微项）

**判定摘要**：二轮修复的三大目标（答案重排、全卷开场白改写、A3-15 时间线）**均已真正落地且落地正确**，**未发现修复引入的新缺陷**。原先的整卷级构造缺陷（BCAD 严格周期、15/15 `Excuse me` 起头、A3-15 时间矛盾）经独立复测**确认全部消除**。全部 15 题的答案唯一性、答案字母—选项对应关系、材料内部一致性、题干—材料衔接**均成立**。

---

## 一、复核清单逐条回答

### 1. 答案唯一性（15/15 通过）

每题均做三步排查：① 材料是否有唯一支撑句；② 其余三项是否被材料明确否定或无任何依据；③ 是否存在第二个同样合理、无法排除的选项。

| 题号 | 标答 | 材料唯一支撑句 | 干扰项排除依据 | 判定 |
|---|---|---|---|---|
| A3-01 | B | `Yes, the number 5 bus will take you right there.` | `Line 2` 是地铁线路非车号；8/15 全文未出现 | 通过 |
| A3-02 | C | `it closes at five thirty` | 5:00 / 5:15 / 6:00 全文未出现 | 通过 |
| A3-03 | C | `your bag is just under the weight limit` | B 与 `under` 直接矛盾；D 与 `No...pay` 矛盾；A 无依据 | 通过 |
| A3-04 | D | `The last bus leaves at eight forty.` | 8:10 / 8:20 / 8:30 未出现 | 通过 |
| A3-05 | D | `At nine thirty.`（= 10:00 − 0:30，算术自洽） | C 是旧时刻、B 反向、A 无依据 | 通过 |
| A3-06 | A | `buy it at the machine` + `Can I pay with my phone? Yes.` | B 支付方式错、C 两项错、D 地点错 | 通过 |
| A3-07 | B | `About twenty-five minutes` | 35 / 45 / 15 未出现 | 通过 |
| A3-08 | A | `your plane starts boarding when they call your name` + `Gate 6` | B 与「登机即开始」矛盾；C 材料无 friend；D 与设问时点不符 | 通过 |
| A3-09 | B | `Three stops, and then walk for five minutes.` | 2 / 4 / 5 未作为「换乘后站数」出现 | 通过 |
| A3-10 | B | `What about Sunday afternoon? / There's a seat on the six o'clock flight.` | A 与 `all the Friday flights are full` 矛盾；C / D 未询问 | 通过 |
| A3-11 | C | `it's about five minutes' walk` | 10 / 15 / 20 未出现 | 通过 |
| A3-12 | D | `boarding starts fifteen minutes before it leaves` | 10 / 20 / 30 未出现 | 通过 |
| A3-13 | A | `The subway is quicker` | B 与 quicker 矛盾；C 未提价格；D 与「要换乘两次」矛盾 | 通过 |
| A3-14 | A | `You'll see a big blue sign.` | 小/白、红、绿三项与 `big blue` 逐项相反 | 通过 |
| A3-15 | D | `Just show this card at the desk any time before ten.` | A / B 材料无依据；C 是「问人」而非「出示卡片」，方式不同 | 通过 |

**重点复核的改动题**：A3-03、A3-06、A3-08、A3-11、A3-12、A3-13、A3-15 —— 七题答案均唯一，且均**必须**从材料推出，不依赖常识外推。

> **对比 R2 的关键改善**：A3-08 旧答案 `Board the plane.` 依赖「机场叫名字 = 登机」的常识外推；现答案 `Leave the café and go to Gate 6.` 由 `starts boarding when they call your name` + `Gate 6` 双句直接支撑，**已彻底消除常识外推类缺陷**。

---

### 2. 答案序列（通过）

```
A3-01 B | 02 C | 03 C | 04 D | 05 D | 06 A | 07 B | 08 A | 09 B | 10 B | 11 C | 12 D | 13 A | 14 A | 15 D
序列： B C C D D A B A B B C D A A D
```

**与要求序列 B C C D D A B A B B C D A A D 逐位一致。**

独立检测结果：

| 检测项 | 要求 | 实测 | 判定 |
|---|---|---|---|
| 周期性 p=2 | 无 | 无 | 通过 |
| 周期性 p=3 | 无 | 无 | 通过 |
| 周期性 p=4 | 无 | 无 | 通过 |
| 周期性 p=5 | 无 | 无 | 通过 |
| 周期性 p=6 | 无 | 无 | 通过 |
| 最长连续相同 | 小于等于 2 | **2**（3 处：02-03 = C C、09-10 = B B、13-14 = A A） | 通过 |
| 四字母分布 | 大致均等 | **A×4 B×4 C×3 D×4** | 通过 |
| 首字母与末字母不同 | 是 | B 与 D 不同 | 通过 |

**答案字母与选项的对应关系**

- 15 题的选项字母集合**全部为完整的 {A, B, C, D}**，无缺项、无重复。
- **不存在标答指向不存在的选项**：逐题核对 15 个 `**Answer**` 字母，均有同名选项。
- **不存在错位标答**：15 题标答字母所指的选项文本，与材料支撑句**逐条对应正确**（非仅核对字母，已核对文本内容）。
- 15 题内**无重复选项**（每题 4 个选项文本互不相同）。

> 旧的 `BCADBCADBCADBCA` 周期（学生可套规律答对 14/15）**已彻底消除**。

---

### 3. 开场句改写的语义连贯性（15/15 通过）

R2 提出的 15 条首行改写方案**已全部落地**。逐题核对「首句问什么 → 第二句答什么」：

| 题号 | 改后首句 | 第二句 | 连贯性 |
|---|---|---|---|
| A3-01 | `Hello, could you tell me how to get to the museum?` | `Take the subway on Line 2 and get off at the third stop.` | 问路 → 指路 |
| A3-02 | `Hi, where exactly is the ticket office?` | `Go straight and turn left at the second crossing.` | 问位置 → 给方位 |
| A3-03 | `I'd like to leave this big bag. Where should I take it?` | `Please take it to the check-in desk over there.` | 陈述需求 + 问去处 → 指明地点 |
| A3-04 | `Good evening. Which bus goes to the city library?` | `The number 12 bus stops right in front of it.` | 时段问候 + 问车 → 答车号 |
| A3-05 | `Does the train to the lake still leave at ten?` | `It used to, but now it leaves half an hour earlier.` | 无开场白，直接问 → 答 |
| A3-06 | `Sorry to trouble you, but how can I buy a subway ticket here?` | `You can buy it at the machine near the door.` | 致歉式 → 正面作答 |
| A3-07 | `Hi, which subway line should I take to the railway station?` | `Line 3 goes straight there. It's the last stop.` | 问线号 → 答线号 |
| A3-08 | `What time should I get to the gate?` | `Half an hour before your flight. Gate 6 opens then.` | 无开场白，问时间 → 答时间 |
| A3-09 | `Good afternoon. Can I get to the park by bus?` | `Yes, take the number 5 bus and change at the second stop.` | 问候 + 问可达性 → 答线路 |
| A3-10 | `Hello, can I change my flight to Friday morning?` | `I'm afraid all the Friday flights are full.` | 问改签 → 答无座 |
| A3-11 | `Could you help me? I'm trying to find the gym.` | `Head up towards the clock tower and turn right after the bank.` | 请求帮助 → 给指路（新句已正确承接） |
| A3-12 | `Hi, which platform does the train to the coast leave from?` | `Platform 6, but please check the board; it may change.` | 问站台 → 答站台 |
| A3-13 | `I have a flight to catch. How long does it take to the airport by taxi?` | `It depends on the traffic. Usually about forty minutes.` | 情境交代 + 问时长 → 答时长 |
| A3-14 | `Excuse me, could you tell me where the nearest subway station is?` | `It's behind the bookstore. Just walk down the narrow street there.` | 唯一保留的 Excuse me，衔接正常 |
| A3-15 | `Hello, I'd like to leave my bags here. Is that possible?` | `Certainly. Our storage room is beside the front desk.` | 问候 + 问可行性 → 答可行 |

**判定：15/15 首句与后续对话连贯，未发现「问候之后话接不上」或「首句答非所问」。**

两处由改写带来的正向效果（非缺陷）：
- **A3-11**：旧指路句与 A3-02 共用骨架，改后 `Head up towards the clock tower...` 与 A3-02 的 Jaccard 从 0.54 降至 **0.18**，且新句准确回应了新首句的求助请求。
- **A3-13**：`I have a flight to catch.` 为后文 `The subway is quicker` 建立了「赶时间」的合理动机，答案 A 的比较级 `quicker` 有了语境依据。

**开场策略多样性实测**：Hello×3（A3-01/10/15）、Hi×3（A3-02/07/12）、时段问候×2（A3-04/09）、无开场白×3（A3-05/08/13）、致歉式×1（A3-06）、请求帮助×1（A3-11）、保留 Excuse me×1（A3-14）。共 8 类，最大重复 3 次。

---

### 4. A3-06 / A3-07 标题与材料互证（通过）

修复方选择了 R2 建议的 **B 方案（补材料）**，而非改标题。核对结果：

**A3-06　标题「地铁怎样买票」**
- 首句已改为 `Sorry to trouble you, but how can I buy a subway ticket here?`
- 标题关键词「地铁」与材料 `subway ticket` **直接互证**
- 副标题信息「怎样买票」与 `You can buy it at the machine near the door.` 一致
- **无新错配**：补入 `subway` 后，材料其余内容（machine / reader / counter）均为地铁站通用设施，未与新词冲突

**A3-07　标题「坐地铁去火车站」**
- 首句已改为 `Hi, which subway line should I take to the railway station?`
- 标题「坐地铁」与 `subway line` 互证；「去火车站」与 `the railway station` 互证，**双关键词均直接可证**
- **无新错配**：`Line 3 goes straight there. It's the last stop.` 与地铁语境一致，且答案（时长）不受影响

> 附带影响：`subway` 一词在本卷出现 4 次（A3-06/07/13/14），均为五级常见出行词，**未抬高词汇难度**。

---

### 5. A3-08 整题替换后的自洽性（通过）

**新题干**：`What should the boy do when they call his name?`
**新选项与标答**：
- A. `Leave the café and go to Gate 6.` ← **Answer**
- B. `Stay at the café until the plane leaves.`
- C. `Meet a friend at Gate 6.`
- D. `Buy a coffee before boarding.`

| 维度 | 核对结果 |
|---|---|
| 题干与材料 | 设问源 `your plane starts boarding when they call your name` 逐字对应 |
| 题干与标答 | 「叫到我名字时该做什么」= 去登机口，时点完全对齐 |
| 标答与材料 | `Gate 6`（第 2 行）+ `starts boarding`（第 4 行）双句支撑，**不需常识外推** |
| 选项结构同构 | 四项均为「动词原形 + 地点/时间补语」同一框架（R2 旧版 A/B/C 全是 café 类、D 是孤立离群项，已解决） |
| 选项互异 | 四项文本互不相同，无重复 |
| 干扰项有效性 | B 与材料矛盾；C 材料无 friend；D 时点错（叫名字时非登机前）—— 三项各有独立排除依据 |
| 与标题 | `登机口前等候` 与 `get to the gate` / `Gate 6` 一致 |

**判定：新对话、题干、四选项、标答四者全部自洽**，R2 中等缺陷 1 已真正修复。

唯一遗留（轻微）：四项长度 32/40/24/29，跨度 16 字符，C 项偏短 8 字符；但**正确项 A 位居第 3 长，不构成长度线索**，不构成缺陷。

---

### 6. A3-15 时间线与标答（通过）

**现文**：
```
Girl: Hello, I'd like to leave my bags here. Is that possible?
Man:  Certainly. Our storage room is beside the front desk.
Girl: Can I have them back in the evening?
Man:  Yes. Just show this card at the desk any time before ten.
```

| 时间要素 | 值 | 核对 |
|---|---|---|
| 女孩提出 | `in the evening`（傍晚 / 晚上） | — |
| 工作人员答 | `Yes` | 与请求一致 |
| 取件截止 | `any time before ten` | 晚上（17:00–21:00）**必然早于 22:00** |
| R2 旧文 | `before seven`（= 19:00） | 女孩问「傍晚」、答「七点前」，`Yes` 与之矛盾 |

**判定：`Yes` + `any time before ten` 与「傍晚取件」完全自洽，原时间矛盾已消除。**

**标答案仍成立**：`How will the girl get her bags back in the evening?` 对应 `Just show this card at the desk` → D `She will show the card at the desk.`
- 标答支撑句**未被时间线修复改动**，仍逐字对应
- C `She will ask the man at the front desk.` 已按 R2 建议改为材料内指称（`front desk` 见于第 2 行），**不再是凭空造人**
- C 与 D 构成「问人」与「出示卡片」的有效方式之争，D 唯一正确

---

### 7. 相邻同说话人标注（通过）

全文件脚本扫描：**0 处**

- 15 题均为 4 话轮；说话人序列：BGBG / BWBW / MWMW / GMGM / GMGM / MWMW / GBGB / BMBM / GMGM / MWMW / BGBG / GMGM / GMGM / BGBG / GMGM
- **无任何相邻两轮同标注**
- 人物标注集合仍为 `Boy / Girl / Man / Woman`；`Ms. / Mr. / Mrs. / Miss / Sir / Madam / Dad / Mom / Tom / Jack` 出现次数**全部为 0**，不存在成年人与身份称谓混用

---

### 8. 材料内重复轮次（通过）

- 比对话轮对总数：**90 对**（15 题 × C(4,2)=6）
- **Jaccard 大于 0.6 命中：0 对**
- 材料内最高值仅 **0.20**（A3-01 T3 对 T4：`Is there a bus after that?` / `Yes, the number 5 bus...`），远低于阈值

**判定：材料内部无重复话轮，历史遗留的「问公交站被复制两遍」问题确认仍不存在。**

---

### 9. 跨题首句相似度（通过）

15 题首句两两比对（105 对），去停用词后取 Jaccard：

| 排名 | 对 | Jaccard |
|---|---|---|
| 1 | A3-03 与 A3-15 | **0.21** |
| 2 | A3-05 与 A3-12 | 0.20 |
| 3 | A3-04 与 A3-09 | 0.18 |
| 4 | A3-07 与 A3-14 | 0.17 |

- **大于等于 0.4 的对数：0**
- **大于等于 0.35 的对数：0**
- **最高值 0.21**，较 R2 记录的旧最高 0.80 下降约 74%，**已降到 0.4 以下且余量充足**

补充扫描（15 题全部 60 个话轮跨题全量比对）：
- 唯一大于 0.35 的对：`A3-01T4 与 A3-09T2` = **0.45**（`Yes, the number 5 bus will take you right there.` / `Yes, take the number 5 bus and change at the second stop.`）—— 低于 0.5 验收线，成因是 R2 轻微项 6（两题复用 5 路车号）未修，见第二节。
- 开场白归一化：**严格口径 0 处重复**；**分句口径**最高重复 2 次（仅 `idliketol`，即 A3-03 与 A3-15）；**`Excuse me` 起头仅 1 题**（A3-14，为刻意保留）—— R2 验收要求「小于等于 3」已大幅超额满足。

---

### 10. 语法 / 超纲词 / 中式表达（通过）

**语法**：逐题逐句过筛 15 题 60 个话轮 + 15 个题干 + 60 个选项，未发现时态、主谓一致、单复数、冠词、介词、比较级错误。改写引入的新句子（15 条首句 + A3-11 指路句）单独复查，**全部语法正确**。

**超纲词**：对话正文独立成词表 **220 词**，人工过筛**无课标五级以上词汇**。五级边缘词清单：`boarding`(A3-08/12)、`platform`(A3-12)、`reader`(A3-06)、`subway`(A3-06/07/13/14)、`storage`(A3-15)、`narrow`(A3-14)、`towards`(A3-11)、`crossing`(A3-02) —— 均为出行 / 购物语境高频词，上下文充分支撑理解，不判为超纲。新补入的 `subway` 属常见词，未抬高难度。

**中式表达 / 不地道搭配**：未发现严重级。改写新句地道度复查：`Could you help me? I'm trying to find the gym.`、`I have a flight to catch.`、`Sorry to trouble you, but how can I buy...`、`Good afternoon. Can I get to the park by bus?` 均地道。残留 2 处轻微不地道见第二节（A3-06 `put it near the reader`、A3-15 `have them back`），均为 R2 已列而未修项，**非本轮新引入**。

---

## 二、本轮发现的问题（全部为轻微，共 11 条）

**无严重、无中等缺陷。以下均为 R2 已列而本轮仍未修复的残留项，或新写法的细微瑕疵，无一影响答案可判性。**

| # | 题号 | 级别 | 问题 | 建议改法 |
|---|---|---|---|---|
| 1 | A3-08 | 轻微 | 四选项长度 32/40/24/29，跨度 16；C `Meet a friend at Gate 6.` 比次短项短 8 字符（R2 建议稿本身即如此）。因正确项 A 位居第 3 长，**不构成答案长度线索** | C 改为 `Go and meet a friend waiting at Gate 6.` |
| 2 | A3-08 / A3-12 | 轻微 | `Gate 6` 与 `Platform 6` 数字撞车（R2 轻微 7，未修） | A3-08 改为 `Gate 12` |
| 3 | A3-11 | 轻微 | `Head up towards the clock tower` 中 `up` 与 `towards` 语义重复；地道说法为 `Head towards the clock tower` 或 `Head up the street towards the clock tower` | 二选一 |
| 4 | A3-11 | 轻微 | 标题「问体育馆的路」措辞不成句（R2 轻微 2，未修） | `去体育馆的路` 或 `问路：体育馆` |
| 5 | A3-12 | 轻微 | `boarding starts fifteen minutes before it leaves` 中 `it` 回指（R2 中等 8，未修）。**本轮降级判轻微**：`boarding` 不可能 `leave` 某个时刻，回指 train 无循环读法，实际不构成歧义 | `before the train leaves` |
| 6 | A3-15 | 轻微 | `Can I have them back in the evening?` 中 `have` 偏中式，母语常用 `get`（R2 轻微 3，未修） | `Can I get them back in the evening?` |
| 7 | A3-06 | 轻微 | `Just put it near the reader.` 把手机 `put near` 读卡器搭配略生硬（R2 轻微 4，未修） | `Just hold your phone near the reader.` |
| 8 | A3-01 / A3-09 | 轻微 | 两题复用 `the number 5 bus` 服务两个不同目的地；且材料用英式 `the number 5 bus`、A3-01 选项用美式 `Bus No. 5`，同卷两种写法混用（R2 轻微 5、6，未修）。二者共同造成全卷唯一大于 0.35 的跨题话轮对（0.45） | A3-09 改为 `the number 21 bus`；并全卷统一写法 |
| 9 | A3-01 | 轻微 | `Is there a bus after that?` 中 `after that` 参照点不清（R2 轻微 11，未修） | `Is there a bus from the third stop?` |
| 10 | A3-11 / A3-14 | 轻微 | 两题复用 `five minutes' walk` 计量短语（R2 轻微 8，未修；跨题 Jaccard 0.33，低于阈值） | A3-14 改为 `No more than a five-minute walk.` |
| 11 | A3-14 | 轻微 | `How far is it from the cinema?` 的回答 `Less than five minutes' walk.` 未回锚「从电影院算起」（R2 轻微 10，未修） | `From the cinema? Less than five minutes' walk.` |

### 额外观察（非缺陷，供下一轮参考）

- **A3-03 与 A3-15 首句共用 `I'd like to leave ... bag(s)` 框架**（`I'd like to leave this big bag.` / `Hello, I'd like to leave my bags here.`）。实测 Jaccard 仅 **0.21**，远低于 0.4；且此框架**在修复前即已存在**（旧文两句同样共用 `leave this/my bags`），**非本轮新引入**，仅作记录。
- **A3-01 / A3-02 标答为并列最短项、A3-09 / A3-12 标答为并列最长项**，但四题四项均为同一模板（`Bus No. N.` / `At N o'clock.` / `N stops.` / `N minutes before it leaves.`），差异仅 1–2 字符，属噪声级，与 R2 判断一致，**不判为缺陷**。

---

## 三、格式合规

| 检查项 | 结果 |
|---|---|
| `## 编号 标题` 结构 | 15/15 |
| 编号连续无缺号 | A3-01 ~ A3-15 连续 |
| `**Dialogue**` 标记 | 15/15 |
| `**Question**` 标记 | 15/15 |
| `**Answer**` 标记 | 15/15 |
| 每题选项数 = 4（A/B/C/D） | 15/15 |
| 混入说明性文字 / 注释 / 思考过程 | 无 |
| 真实品牌、人名、争议内容、刻板印象 | 无 |

---

## 四、复核验收清单（对照任务要求）

| # | 要求 | 实测 | 判定 |
|---|---|---|---|
| 1 | 15 题逐题确认答案唯一 | 15/15 唯一 | 通过 |
| 2 | 答案序列 = B C C D D A B A B B C D A A D | 逐位一致 | 通过 |
| 2 | 无周期 p=2..6 | p=2/3/4/5/6 全部无 | 通过 |
| 2 | 最长连续相同 小于等于 2 | 2 | 通过 |
| 2 | 四字母次数大致均等 | A4 B4 C3 D4 | 通过 |
| 2 | 标答不指向不存在的选项 | 0 处 | 通过 |
| 3 | 开场白改写与后文连贯 | 15/15 连贯 | 通过 |
| 4 | A3-06/A3-07 标题与材料互证 | 双题均互证，无新错配 | 通过 |
| 5 | A3-08 整题替换自洽 | 题干/选项/标答/材料全自洽 | 通过 |
| 6 | A3-15 时间线自洽且标答成立 | 自洽，标答 D 仍成立 | 通过 |
| 7 | 相邻同说话人标注 = 0 | 0 | 通过 |
| 8 | 材料内重复轮次 | 90 对，大于 0.6 命中 0 | 通过 |
| 9 | 跨题首句相似度小于 0.4 | 最高 0.21，大于等于 0.4 对数 0 | 通过 |
| 10 | 无新语法错误 / 超纲词 / 中式表达 | 无 | 通过 |

---

## 已复核题号清单（覆盖率证明）

**已复核：15 / 15，覆盖率 100%，无抽样**

```
A3-01 y  A3-02 y  A3-03 y  A3-04 y  A3-05 y
A3-06 y  A3-07 y  A3-08 y  A3-09 y  A3-10 y
A3-11 y  A3-12 y  A3-13 y  A3-14 y  A3-15 y
```

每题均完成：答案唯一性（3 步排查）、答案字母与选项文本逐条对应、材料内部时间/数字/人物/场所自洽、首句与次句语义连贯、标题与正文一致性、选项同构性与长度、说话人标注、语法与地道度、词汇级别核查。

**缺陷统计：严重 0 条｜中等 0 条｜轻微 11 条（均为残留项，非本轮修复引入）｜合计 11 条**

---

## 最终判定

**二轮修复成功，验收通过。** 本次整卷级重构（答案位置重排 + 开场白全卷改写 + 1 道整题替换）**未引入任何新缺陷**：15 题全部答案唯一、序列达标、无周期、说话人标注正确、无重复轮次、首句相似度远低于阈值、标题与材料全部互证。遗留 11 条轻微项可择机清理，不阻塞使用。