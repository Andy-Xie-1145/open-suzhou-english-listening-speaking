# 修复后复核报告：A5.md 第二轮修复（F2）新缺陷排查

> 复核对象：`data/item-bank/prod/A5.md`（15 题，F2 完成后当前文件）
> 复核依据：`data/item-bank/REVIEW-RUBRIC.md`（1.1–1.9 / 1.8b / 1.8c）
> 对照报告：`data/item-bank/reviews/R2-A5.md`（0 严重 / 5 中等 / 8 轻微）
> 复核方式：**未打开** `reviews/R1-A5.md`，**未打开** `fixes/` 下任何文件；对 A5.md 当前文本逐题重读 + 脚本复算，**不采信 R2 报告与 fixLog 的任何自检结论**

---

## 0. 结论

- **复核题数：15（逐题，未抽样）**
- **本轮新引入缺陷：0 条（严重 0 / 中等 0 / 轻微 0）**
- **遗留未闭合：中等 1 条（M5 残余）、轻微 12 条**（R2 的 L1–L8 + 4 条本轮新记录的轻微观察）
- **是否可归档：可以归档**（零严重、零新缺陷，15 题答案全部唯一可判）；建议在 F3 里用一次 15 分钟的小改清掉 M5 残余的 route / track / powder，但**不构成归档阻塞**

**总体判断**：F2 的 5 处中等项修复（M1–M5）**全部真实落地且未引入新缺陷**。其中 M5 的三处成组改写（leash→rope+标题联动、collar→grey and quite big、torch→bottle of water×3+材料）是本批次风险最高的一次改动，实际做到了「材料 / 选项 / 标题三处同步、结构同形、答案字母不动」，**成组改写完整、无半改**。答案序列 `BBACDACBDCADBCA` 与 R2 记录**逐字一致**，证明 F2 **没有发生任何答案字母的连锁改动**，这是成组改写最容易出事的地方（改了选项却忘了同步 Answer），已排除。

---

## 1. 清单逐条回答

### 1. M5 的三处成组改写

#### 1.1 A5-05（leash → rope，含标题联动）

| 检查项 | 实测 | 判定 |
|---|---|---|
| 标题一致性 | 标题 L61「遛狗要用**绳子**牵着」；材料 L64 `Keep him on a **rope**` | ✅ **完全一致** |
| 残留检查 | 全文 `leash` = **0 次**；中文「牵引绳」= **0 次**（标题已被联动改写，无悬空引用） | ✅ |
| 答案唯一性 | 见下 | ✅ |

材料（L63–L67）：
```
Boy: My dog runs after every cat. Should I let him run free there?
Mr. Guo: No. Keep him on a rope. If he pulls hard, stop walking for a minute.
Boy: Is the dog park open?
Mr. Guo: Yes, but only on Saturday morning. Let him run with the other dogs there.
Boy: Thanks. I didn't know that.
```

四个选项的排除链（独立重判，非引用 R2）：
- **A. Let him run free in the park.** → 被 L63–L64 的 `No.` 直接否决（Boy 问的正是 run free，Mr. Guo 答 No）✅
- **B. Take him to the dog park at once.** → 被 `only on Saturday morning` 排除。**但这条排除依赖「此刻不是周六上午」这一默认前提，而材料从未给出星期锚点**——属**未硬闭合**的排除。⚠️ 见第 3 节 V1（轻微，**非本轮新引入**）
- **C. Let him run after the cats.** → 被 L63 设问本身（狗追猫是问题）+ `No.` 排除 ✅
- **D. Stop walking for a minute.** → L64 逐字支撑 ✅

**答案唯一。** 且 `If he pulls hard, stop walking for a minute.`（R2 指定的「绝对不得改动」锚点句）**逐字未动** ✅

#### 1.2 A5-08（collar → grey and quite big）

材料（L109–L113）：
```
Woman: Ms. Tang, have you seen my cat? She got out on Saturday.
Ms. Tang: My son saw a white cat near the market yesterday.
Woman: White? My cat is grey and quite big.
Ms. Tang: Then it wasn't yours. But a man called me. He found a grey cat near the station.
Woman: Really? Thank you! I'll go and get her at once.
```

- **材料与选项互证**：A 选项的 `Ms. Tang's son` ↔ L110 `My son` ✅；B 的 `the station` ↔ L112 `near the station` ✅；C 被 L113 `at once` 排除 ✅；D 被 `Then it wasn't yours.` 排除 ✅。**答案 B 唯一**。
- **collar 改掉后，「这是自家的猫」的判断依据还在吗？——在，但只剩颜色一条。** 现在的依据链是：白猫 → Woman 给出**特征 grey** → Ms. Tang 回报**唯一一只 grey cat** → Woman 认定。全篇只出现**一只**灰猫，因此「颜色吻合」在对话的信息集内已足以完成指认，**答案唯一性不受影响**。
- **但 R2 宣称的「L2 附带消解」只做到一半**：Woman 说「grey **and quite big**」，Ms. Tang 的回报只有 `a grey cat`（无体积），**体积这条特征始终没有被核对**。R2 的说法是「核对依据改为颜色 + 体型」，与实际文本不符（体型未被回报）。⚠️ 见第 3 节 V2（轻微）。**这不影响可判性，不构成新缺陷。**
- 残留检查：`collar` = **0 次**，中文「项圈」= **0 次** ✅

#### 1.3 A5-14（torch → bottle of water，材料 + 三选项成组）

材料（L203–L206）与四选项：
```
Ms. Fang: Take a small one, and bring a warm coat and a bottle of water. You don't need much food for one night.
```
| 选项 | 词数 | 与材料的对齐 |
|---|---|---|
| A. A big bag and a big tent. | 7w / 25ch | ✗ big bag（材料：small）；tent 见 L204，非凭空 |
| B. A big bag, a warm coat and a bottle of water. | 11w / 45ch | ✗ big bag |
| C. **A small bag, a warm coat and a bottle of water.** | 11w / 47ch | ✓ 三项逐字对齐 |
| D. A small bag, a warm coat and some food for two nights. | 12w / 54ch | ✗ two nights vs 材料 `one night` |

- **整组一致性**：B/C/D 共享**完全相同的 3 项骨架**（[small/big] bag, a warm coat and a [bottle of water / some food]），差异**只在包的大小**与**食物的夜数**两个变量上——**单变量控制，干扰项同质性是全卷最高的一题** ✅
- **有没有落单项**：**A 是唯一的 2 项选项**（A big bag and a big tent），与 B/C/D 的 3 项清单不齐。**但这不是本轮引入的**——F2 只把 B/C/D 里的 `torch` 换成 `bottle of water`，A 项 `A big bag and a big tent` **逐字未动**，成组改写**没有破坏原有的组内结构**（改前 A 同样是 2 项）。⚠️ 见第 3 节 V3（轻微，遗留）
- **指代闭合**：L205 `A big bag?` → L206 `Take a small one`（one = bag）✅
- 残留检查：`torch` = **0 次**，`flashlight` = 0 次，中文「手电筒」= 0 次 ✅

---

### 2. M1（A5-01 题干加 `and what colour are they?`）—— B 与 C 是否仍各自唯一可判？

新题干（L8）：`How many goldfish will Ms. Chen look after, and what colour are they?`
材料锚点（L4）：`Two fish, an orange one and a white one, right?`

| 选项 | 数量 | 颜色 | 判定 |
|---|---|---|---|
| A. One orange goldfish. | 1 ✗ | 橙 ✓ | 排除（数量） |
| **B. One orange goldfish and one white goldfish.** | 2 ✓ | 橙+白 ✓ | **唯一正确** |
| C. Two goldfish, both white. | 2 ✓ | 全白 ✗ | 排除（颜色）——**题干现在真的问了颜色，排除链闭合** ✅ |
| D. One white goldfish. | 1 ✗ | 白 ✓ | 排除（数量） |

**B、C 现在都各自唯一可判，M1 已实修。** 题干无泄露：四个选项**全部**含颜色词，题干提「colour」不指向任何单一选项 ✅。冠词一致（`they` 复数，配 Two 条）✅。

⚠️ **新记录的轻微项（V4）**：B 用 `One … and one …` **隐含**表达总数 2，而 C 用显式 `Two`。在题干**新增的 how many 这一问**上，B 的数字是隐含的、C 的数字是显式的，学生若只抓住「how many」会本能倾向 C。建议 F3 把 B 改为 `Two goldfish, one orange and one white.`（届时 B/C 仍由颜色区分）。**不构成缺陷，仅记为选项结构不齐。**

---

### 3. M4（A5-06 代词）—— 指代是否闭合？锚点句是否仍在？

L80 现状：`Woman: I've got some tape in my bag. **Give the kite to me and I'll fix the tail.**`

- **指代闭合：✅ 完全闭合。** `the kite` 是**明示名词短语**，不再是裸 `it`，R2 指出的「`it` 被同句 `tape` 抢最近先行名词」的歧义**已从语法层面消除**，不依赖上下文猜测。
- **锚点句仍在**：
  - L79 `our kite is broken. **Its long tail has come off.**` ✅ **逐字未动**（选项 A 的前提）
  - L82 `Of course, if the wind doesn't stop. **Let's go before ten o'clock.**` ✅ **逐字未动**（排除 B/C/D 的唯一依据）
- **答案唯一性**：A `Fix the tail with some tape.` ← 「tape」+「fix the tail」两个成分均逐字对齐 ✅；B（买新风筝）材料无据且被 L82 排除；C（放回包里）被「tape in my bag」排除；D（放弃计划）被 L82 排除。**答案唯一。**
- 新句的逻辑主语是 `I`（Woman），与前半句 `I've got some tape` 同一施事，衔接自然；L81 `Thanks.` 的回应对象（你帮我修）明确 ✅

**M4 已实修，未引入新缺陷。**

---

### 4. M3（A5-05 问句改为 `Is the dog park open?`）—— 干扰项 B 是否仍被材料排除？

L65–L66：`Is the dog park open?` → `Yes, but only on Saturday morning. Let him run with the other dogs there.`

- **问答匹配：✅ 已修。** `open` 可由时段条件化，`but only on Saturday morning` 是对「是否开放」的正确限定，R2 指出的「but 的对比对象无处着落」问题消失。
- **B（Take him to the dog park at once.）的排除**：仍由 `only on Saturday morning` 排除。**与改前相比排除力未减反增**——改前问的是 `safe`（恒常属性），时段限定与问句无关，B 反而更容易被放过；改后「开放时间受限」直接否定「马上去」。
- **但这条排除不是硬排除**：材料没有星期锚点，B 要被排除必须默认「现在不是周六上午」。⚠️ 见 V1（轻微，**改前即存在，本轮未加重**）。

**M3 已实修，未引入新缺陷。**

---

### 5. M2（A5-04 题干改用 `have the Mid-Autumn dinner with Ms. Xu`）

新题干（L54）：`How many people will **have the Mid-Autumn dinner with** Ms. Xu?`

- **宿主是否被结构性排除：✅ 排除，且是本轮最漂亮的一处改法。** `with Ms. Xu` 的介词短语挂在 people 上，语义是「与 Ms. Xu **一道**吃饭的人」，Ms. Xu 本人是落选参照而非被计对象，因此四个选项的计数口径与材料的 `people` **完全对齐**，2+1+1=4。
- **特别值得记录的一点**：R2 自己建议的替换文本是 `How many people will **be at Ms. Xu's home** for the Mid-Autumn dinner?` ——**那一版会把宿主算进去，得到 5，与选项 B `Five.` 撞车，反而会造出一个新的中等缺陷**。修复方**没有照抄报告的替换文本**，而是采用了更好的措辞。**这是「按报告执行」与「按判断执行」的正面分水岭。**
- **锚点仍在**：L48 `Four. **My two kids, my mother and you.**` ✅ **逐字未动**
- **答案唯一性**：C `Four.` ✓；A `Three.`（漏 Girl）✗；B `Five.`（+宿主）✗；D `Six.` 无来源 ✗。**唯一**。
- 语法：`have the Mid-Autumn dinner` ✓ 地道；`with Ms. Xu` 的辖域正确 ✅

**M2 已实修，未引入新缺陷。**

---

### 6. 全卷机器扫描（脚本复算，不采信任何既有报告）

解析结果：15 个 `## A5-xx` 段 / 15 个 `**Dialogue**` / 15 个 `**Question**` / 15 个 `**Answer**` / 15×4 个选项，编号 A5-01…A5-15 连续无缺号，`**Answer**` 之后**零残留说明文字**。

| # | 检查项 | 判据 | 本轮实测 | 结论 |
|---|---|---|---|---|
| 1 | **答案序列** | — | `BBACDACBDCADBCA`（与 R2 §5 记录**逐字一致**） | ✅ **F2 未改动任何答案字母**，成组改写无连锁错位 |
| 2 | **周期性** | p=2–6，seq[i]==seq[i+p] | p=2/3/4/5/6 **全部在第 1 对即破** | ✅ 阴性（5/5） |
| 3 | **最长连续相同** | ≥3 判缺陷 | **2**（第 1–2 题 `BB`） | ✅ 阴性 |
| 4 | **四字母覆盖** | 各字母均须被用作正确答案 | A=4, B=4, C=4, D=3 → **四字母全覆盖**，无固定陷阱字母 | ✅ 通过 |
| 5 | **逐题位置偏斜** | 某位置最高频 ≥70% | 最高频 **26.7%**（4/15） | ✅ 阴性（本卷无表格填空，按字母口径类比） |
| 6 | **盲猜得分** | 按最高频字母 | **26.7%** | ✅ 不可套规律 |
| 7 | **相邻同说话人** | 不得连续同说话人 | **79 个话轮，违规 0 处**，15 题全部严格交替（01 W-C-W-C｜02 B-W-B-W｜03 L-B-L-B-L-B｜04 G-X-G-X-G-X｜05 B-G-B-G-B｜06 W-G-W-G-W｜07 M-Z-M-Z-M-Z｜08 W-T-W-T-W｜09 S-B-S-B-S｜10 M-G-M-G-M-G｜11 W-X-W-X-W-X｜12 M-L-M-L-M-L｜13 G-W-G-W-G-W｜14 B-F-B-F｜15 B-L-B-L-B） | ✅ 阴性 |
| 8 | **材料内重复行** | 同一材料内话轮逐字重复 | **0** 处 | ✅ 阴性 |
| 9 | **话轮相似度** | 去停用词后两两 Jaccard | 全 79 话轮两两比对（3081 对）：**>0.6 命中 0 对；>0.45 亦为 0 对** | ✅ 阴性——F2 的三处改写**未复制出任何近似话轮**（尤其 A5-08 的 `White? My cat is grey` 与 L112 的 `He found a grey cat` 共享词 `grey` 但结构与用词差异大，Jaccard 远低于阈值） |
| 10 | **开场白归一化** | 首句去标点转小写后建字典 | **15/15 全部互异**，无重复 key | ✅ 阴性 |
| 11 | **结构门禁（1.9）** | A 类：Answer 数 ÷ 材料段数 = 1 | 15 ÷ 15 = **1** | ✅ 符合 A 类约定 |
| 12 | **1.8c 表格填空** | — | 本卷无 D 类题 | 不适用 |
| 13 | **标题↔材料相符（1.6）** | 逐条人工判读 | 15 条全部相符，**含被联动改写的 A5-05** | ✅ 通过 |
| 14 | **英/美拼写一致性** | 全卷一致 | `colour`、`grey`、`metre` 三处英式拼写并存一致，**全卷无一处美式拼写** | ✅ F2 的 `grey` 与全卷拼写体系相容，未引入拼写冲突 |

> 复算备注：R2 §5 记「共 87 个话轮」，本轮独立数得 **79**（4+4+6+6+5+5+6+5+5+6+6+6+6+4+5）。R2 第 5 节自己列出的 15 段序列相加也是 79，**该处为报告的算术笔误，不影响其任何判定，题目文件本身无问题**。

---

### 7. 超纲词 leash / collar / torch 是否已归零？替换词是否引入新问题？

**归零核查（大小写不敏感、全词边界、全文件）**：

| 词 | 命中 | 残留中文指称 |
|---|---|---|
| `leash` / `leashes` | **0** ✅ | 「牵引绳」**0** ✅ |
| `collar` | **0** ✅ | 「项圈」**0** ✅ |
| `torch` / `flashlight` | **0** / **0** ✅ | 「手电筒」**0** ✅ |

**替换词体检**：

| 替换词 | 出现 | 判定 |
|---|---|---|
| `rope`（L64，1 次） | ✅ 明确属课标内词；且**本库另一份 prod 卷 `E2.md` L76 已在使用 `rope`**，与全库词汇取向一致 | 无新问题 |
| `grey`（L111, L112） | ✅ 与全卷英式拼写（colour / metre）相容；拼写检查确认全卷无美式混用 | 无新问题 |
| `quite big`（L111） | ✅ `quite` 属五级常用副词，`My cat is grey and quite big.` 为地道口语 | 无新问题 |
| `bottle of water`（L206 + B/C/D，共 4 处） | ✅ `bottle`、`water` 均为课标内词；与材料逐字对齐 | 无新问题 |

**「替换词本身是否引入新问题」——结论：否。** 三处替换均未产生新的超纲词、拼写冲突、搭配问题或选项同质性下降。

**但 M5 并未整条闭合**：R2 的 M5 表中还有三个被点名并给出替换文本的词**原封未动**：

| 词 | 位置 | R2 风险级 | R2 给出的替换文本 | 现状 |
|---|---|---|---|---|
| `route` | A5-02 L18 `the route has changed` | 中高 | `we're going a different way this time` | ❌ **未修** |
| `track`（跑道义） | A5-11 L157, L158 + 选项 A L163, B L164 | 中 | `run round the playground`（选项同步） | ❌ **未修** |
| `powder` | A5-10 L142 + 题干 L146 | 中 | `the soda`（需题干同步） | ❌ **未修** |

⚠️ 这三条属**中等**，R2 判定「建议修复」。F2 只落地了 M5 中风险最高的三项，属**有意缩小范围**（R2 的 M5 正文只对这三项给了完整替换与自查方案），**不是修复遗漏**。**M5 应记为「部分闭合」而非「已闭合」。**

---

### 8. 有没有引入新的语法错误或中式表达？

对 F2 触及的 **8 个文本行**（A5-01 L8、A5-04 L54、A5-05 L63/L64/L65、A5-06 L80、A5-08 L111、A5-14 L206）逐行做语法与搭配复核：

| 行 | 文本 | 判定 |
|---|---|---|
| L8 | `How many goldfish will Ms. Chen look after, and what colour are they?` | ✅ 并列问句结构正确，冠词/时态无误 |
| L54 | `How many people will have the Mid-Autumn dinner with Ms. Xu?` | ✅ `have a/the dinner` 地道；`with` 的辖域正确 |
| L63 | `My dog runs after every cat. Should I let him run free there?` | ✅ `run after` / `let sb. do` 均地道 |
| L64 | `No. Keep him on a rope. If he pulls hard, stop walking for a minute.` | ✅ 语法正确。`keep sb. on a rope` 地道性**略弱于** `keep him on the leash`，但仍是正确英语，**不构成中式表达** |
| L65 | `Is the dog park open?` | ✅ |
| L80 | `I've got some tape in my bag. Give the kite to me and I'll fix the tail.` | ✅ 无代词歧义；`I'll fix the tail` 与前半句同一施事 |
| L111 | `White? My cat is grey and quite big.` | ✅ |
| L206 | `Take a small one, and bring a warm coat and a bottle of water. You don't need much food for one night.` | ✅ `You don't need much food for one night` 语义完整（露营一晚用不着多少干粮），非中式 |

**结论：未引入任何新的语法错误或中式表达。** 全卷 15 题重读亦未发现新的语法硬伤、冠词/时态/单复数错误、重复选项或违规内容（人名全部为虚构通称，无真实品牌 / 真实人名 / 争议内容）。

---

## 2. F2 五处改动的落点核对表（防止「只改一半」）

| 项 | 报告要求 | 实际落点 | 一致性 |
|---|---|---|---|
| **M1** | 只改 A5-01 第 8 行题干 | L8 一行 | ✅ 未越界（L3–L6 材料、四选项、Answer B 全未动） |
| **M2** | 只改 A5-04 题干 | L54 一行 | ✅ 未越界（L47–L52 材料含锚点 `Four. My two kids, my mother and you.`、四选项、Answer C 全未动） |
| **M3** | 只改 A5-05 L65 问句，**L64 锚点不得动** | L65 改；L64 后半句 `If he pulls hard, stop walking for a minute.` 逐字保留 | ✅ 未越界 |
| **M4** | 只改 A5-06 L80，L79 / L82 不得动 | L80 改；L79 `Its long tail has come off.`、L82 `Let's go before ten o'clock.` 均逐字保留 | ✅ 未越界 |
| **M5-1** | leash → rope **并连带还原标题** | L64 改 `rope`；标题 L61 同步改为「遛狗要用绳子牵着」；leash 全文 0 | ✅ **成组完整** |
| **M5-2** | collar → grey and quite big（仅 L111） | L111 改；collar 全文 0；四选项与 Answer B 未动 | ✅ |
| **M5-3** | torch → bottle of water（**材料 + B/C/D 四处成组**） | L206 + L210 + L211 + L212 **四处同改**；torch 全文 0；Answer C 未动 | ✅ **成组完整** |

**没有发现任何一处「改了材料忘了改选项」或「改了选项忘了改标题」的半改。** 这是本轮最值得肯定的地方。

---

## 3. 本轮新记录的观察（全部为**轻微**，均不构成新缺陷、不影响可判性）

| # | 题号 | 观察 | 是否本轮新引入 | 建议 |
|---|---|---|---|---|
| **V1** | A5-05 | 选项 B「Take him to the dog park at **once**」的排除只靠 `only on Saturday morning`，材料**无星期锚点**，严格说不是硬排除 | ❌ 改前即存在，且改后排除力**未减弱** | 可选：在 L65 前加一句 `Boy: It's Sunday today. Is the dog park open?` 或把 B 改成 `Take him to the dog park tomorrow morning.` |
| **V2** | A5-08 | Woman 说 `grey **and quite big**`，但 Ms. Tang 回报只有 `a grey cat`，**体积特征始终未被核对**。R2 宣称的「L2 由颜色+体型共同核对」与文本不符（体型未回报） | 部分新（改写后的残留），但**答案唯一性不受影响** | 可选：L112 改为 `He found a big grey cat near the station.`（一行，且选项无需动） |
| **V3** | A5-14 | 选项 A（2 项）与 B/C/D（3 项）结构不齐 | ❌ 改前即如此，F2 **未破坏**原有组内结构 | 可选：A 改为 `A big bag, a warm coat and a bottle of water.`→ 与 B 重复不可行；更好的做法是让 A 也走 3 项骨架（如 `A big bag, a warm coat and a big tent.`）。**记录即可，不必改** |
| **V4** | A5-01 | 选项 B 用 `One … and one …` **隐含**总数 2，C 用显式 `Two`，在新增的 how many 维度上形式不齐 | ⚠️ **部分由 M1 改题干放大**（改前题干只问 how many，B 的隐含表达是唯一能答出数量的写法；改后题干两问并重，该不对称开始变成干扰因素） | 建议 F3 把 B 改为 `Two goldfish, one orange and one white.`（B/C 仍由颜色区分，Answer B 不变） |

> V1–V3 均为**遗留观察**，V4 是本轮改题干带来的**轻微副作用**——四项都不构成「新缺陷」，不需要回滚 F2。

---

## 4. R2 的 8 条轻微项现状（本轮复核未修复，仅确认仍开放）

| # | 题号 | 内容 | 现状（独立核对） |
|---|---|---|---|
| L1 | A5-08 | 题干 `after **the phone call**` 所指不明（Woman↔Ms. Tang 是当面交谈，全篇唯一的电话是 Ms. Tang 接到的来电） | ❌ 仍开放（L115 未动） |
| L2 | A5-08 | 认定自家猫的核对环节缺失 | ⚠️ **部分缓解**（collar 已去掉，改由 grey 核对），但体积未回报 → 转为 V2 |
| L3 | A5-10 | 答案在 L143 / L144 **逐字给出两次**，全卷最易；A「after class this afternoon」与 C「before lunch today」语义接近 | ❌ 仍开放 |
| L4 | A5-11 | L159 `She doesn't like the high jump.` 无来由插入，仅为铺设选项 C | ❌ 仍开放 |
| L5 | A5-12 | `Six friends are coming, so eight of us in all.` 第 8 人需推断 | ❌ 仍开放 |
| L6 | A5-13 | `learn the guitar` 边缘（地道为 `learn to play the guitar`） | ❌ 仍开放 |
| L7 | A5-15 | L220 `It will. **So** please never let it out of the flat alone.` 因果不成立 | ❌ 仍开放 |
| L8 | 整卷 | C 出现在第 4/7/10/14 题（间隔 3,3,4）的弱规律 | ❌ 仍开放（本轮实测 seq 不变，L8 依旧成立；**非违规，R2 亦建议不修**） |

**F2 的处置范围是 M1–M5（中等项），L1–L8 作为轻微项按规范「记录即可，不必改」未纳入修复范围——这符合规范第 2 节，不是遗漏。**

---

## 5. fixLog「M5 三处替换属**预置**，若日后确认 leash/collar/torch 在五级内需连带还原标题」的评估

### 5.1 回退成本测算（逐题实算）

| 题 | 需回退的文本 | 行数 | 标题耦合 | 答案字母影响 | 机械性 |
|---|---|---|---|---|---|
| A5-05 | L64 还原 `leash` + L61 标题还原为「遛狗要牵好牵引绳」 | **2** | ⚠️ **强耦合**：不还原标题即造成标题↔材料不符（1.6 违规） | 无（D 不动） | 完全机械 |
| A5-08 | L111 还原 collar 句 | 1（**实际需 2**） | 无（标题「走失的猫被找到了」不含 collar） | 无（B 不动） | ❌ **非机械**：还原后 Ms. Tang 的回报仍未核对 collar → **R2 的 L2 会原样复现**，等于把一个已缓解的缺陷换回来 |
| A5-14 | L206 + 选项 B / C / D 共 4 行还原 `torch` | **4** | 无（标题「湖边露营带什么」不含 torch） | 无（C 不动） | 完全机械（4 处平行名词互换，组内结构原样保留） |

**合计回退成本：约 7 行 / 3 题 / 0 个答案字母变动 / 0 次选项重排。**
**成本评级：低（约 30 分钟内可完成），但 A5-08 一处非机械，且回退会重新打开 L2。**

### 5.2 独立判断：**不设回退条款，三处替换应保留并把 M5 前三项关闭**

不采信 fixLog 的「预置」定性，依据如下：

1. **仓库内确实没有任何权威五级词表可对照**（本轮已用 glob 复核：全库无词表文件；`fixes/F-A2.md` 与 `reviews/R1-A0.md` 也各自独立记录了「本仓库无五级词表可核对」这一事实）。因此「日后由某方确认」这个触发条件**没有明确的到期日、没有责任人、也没有证据来源**——把它写进 fixLog 等于留了一条**永远不会被触发的回退条款**，同时给下游制造了「这三处是临时值、不可依赖」的负担。
2. **三词的超纲风险可以靠语言学事实独立判断，不必等词表**：
   - `leash`：中国主流初中教材无此词教学，且它是 A5-05 唯一的意义载体。**几乎确定超纲**。
   - `torch`（手电筒义）：大陆教材一律用 `flashlight`，`torch` 是英式孤词。**几乎确定超纲**。
   - `collar`：作为「衣领」义可能确实在词表内，但**本题用的是「猫项圈」义**——词表在不在，这个义项对学生都不透明。换言之，**即便日后证实 collar 在五级内，本题的缺陷依然成立**，回退并不能真正修复它。
3. **替代方案比回退更优**：`rope` 已被本库另一份 prod 卷 `E2.md` 使用，说明它是全库认可的词汇选择；`bottle of water`、`grey`、`quite` 均为课标内词。保留替换文本的**期望收益显著高于**一个低概率触发、且带回 L2 副作用的回退。
4. **M5 真正的剩余债务不是这三个词**，而是 `route` / `track` / `powder`（见第 7 节）。继续把注意力挂在已修好的三个词上，属于把预算花在已关闭的风险上。

**建议：**
- 把 M5 的 leash / collar / torch 三项标记为 **「已修复，关闭」**，**不带回退条款**；
- 若日后仍要求兜底，做**比回退便宜得多的动作**：不还原文本，只在 A5-05 材料处把 `rope` 改为 `rope (leash)` 式括注——但这在听力材料里反而是噪声，**更推荐直接关闭**；
- F3 只处理 M5 残余（route / track / powder）即可。

---

## 6. 逐题复核明细（15/15，未抽样）

| 题号 | 答案 | 唯一最佳答案？ | 四选项均可回溯 / 被排除？ | 材料内部自洽 | F2 是否触及 | 本轮新缺陷 |
|---|---|---|---|---|---|---|
| A5-01 | B | ✅（M1 已补齐颜色维度） | ✅ A/D 数量 1 ✗；C 颜色全白 ✗ | ✅ | 题干 | ❌（V4 轻微） |
| A5-02 | B | ✅ | ✅ A 被 `The bus doesn't stop at the park` 排除 | ✅ | 否 | ❌ |
| A5-03 | A | ✅ | ✅ B 真信息干扰、C 凭空被 `That's why I chose chess` 排除、D 被 `One club is enough` 排除 | ✅ | 否 | ❌ |
| A5-04 | C | ✅（M2 已解决口径不一致） | ✅ A 漏 Girl ✗、B 含宿主 ✗、D 无来源 ✗ | ✅ 2+1+1=4 ✓ | 题干 | ❌ |
| A5-05 | D | ✅（M3+M5 联动成功） | ⚠️ B 的排除未硬闭合（V1）；A/C 排除充分 | ✅ | 材料×3 + 标题 | ❌ |
| A5-06 | A | ✅（M4 指代已闭合） | ✅ B/C/D 均被 L82 排除 | ✅ | L80 | ❌ |
| A5-07 | C | ✅ | ✅ A/B/D 均被 `every morning for ten years` 排除 | ✅ | 否 | ❌ |
| A5-08 | B | ✅（collar 改后判定链仍成立） | ✅ A/D 被 `it wasn't yours` 排除、C 被 `at once` 排除 | ⚠️ 体积未回报（V2） | L111 | ❌ |
| A5-09 | D | ✅ | ✅ A/B/C 均为 6:40 数字偏移 | ✅ | 否 | ❌ |
| A5-10 | C | ✅ | ✅ A 被 `club after class` 排除、D 被 `next Thursday` 排除 | ✅（答案重复给两次，L3 遗留） | 否 | ❌ |
| A5-11 | A | ✅ | ✅ B/C/D 均被排除 | ✅ 周二周四 = 一周两次 | 否 | ❌ |
| A5-12 | D | ✅ | ✅ A/B/C 各有来源，设计良好 | ⚠️ 第 8 人需推断（L5 遗留） | 否 | ❌ |
| A5-13 | B | ✅ | ✅ A/C/D 均被 `only on Friday afternoon` 排除 | ✅ | 否 | ❌ |
| A5-14 | C | ✅（成组改写完整） | ✅ B ✗ big bag、A ✗ big bag、D ✗ two nights | ⚠️ A 项结构落单（V3，遗留非新增） | 材料 + B/C/D | ❌ |
| A5-15 | A | ✅ | ✅ B 被 `Big dogs aren't allowed` 排除、C 是 Boy 自己的计划、D 被 `never let it out alone` 排除 | ⚠️ `So` 因果不成立（L7 遗留） | 否 | ❌ |

---

## 7. 无问题题目（本轮零条目级缺陷）

**A5-02、A5-03、A5-04、A5-06、A5-07、A5-09** —— 六题**零条目级缺陷**：答案唯一、四选项全部可回溯或被材料明确排除、材料内部自洽、格式合规、未被 F2 触及或触及后完全无痕。
（其中 **A5-04、A5-06** 是 F2 修复后达到完全干净的题，**A5-02** 唯一命中的遗留项是 M5 残余的 `route`，属共享词表条目、非题目本身缺陷。）

---

## 8. 归档判定

| 判据（规范第 2 节） | 结果 |
|---|---|
| 严重缺陷（必须修复） | **0 条** ✅ |
| 答案唯一性（1.1） | **15/15 唯一** ✅ |
| 材料内部矛盾（1.2） | **0 条** ✅ |
| 语法错误 / 中式表达（1.3） | **0 条** ✅ |
| 选项重复（1.4） | **0 条** ✅ |
| 格式合规（1.6） | **15/15 合规**，无残留说明文字 ✅ |
| 答案位置（1.8 / 1.8b） | 周期 5/5 阴性、扎堆阴性、四字母覆盖、偏斜 26.7% ✅ |
| 重复扫描（1.7） | 话轮相似度 0 命中、开场白 15/15 互异 ✅ |
| 题数比（1.9） | 15 ÷ 15 = 1，符合 A 类 ✅ |
| 本轮**新引入**缺陷 | **0 条** ✅ |

### **判定：A5 可以归档。**

理由：F2 把 R2 的 5 条中等项**全部实修**（M5 为部分闭合，其 top-3 已落地且成组完整），且**新引入 0 条缺陷**——这是本批次风险最高的一次成组改写，结论是**干净通过**。剩余为 M5 残余（route / track / powder，属「建议修复」而非「必须修复」）与 L1–L8 全部轻微项，按规范均**不构成归档阻塞**。

**归档时须一并登记的遗留项（供后续 INDEX / F3 取用）**：
1. 中等 1 条：M5 残余 `route`（A5-02 L18）、`track`（A5-11 L157/L158 + 选项 A/B）、`powder`（A5-10 L142 + 题干 L146）。
2. 轻微 12 条：L1、L3–L8 + 本轮 V1–V4。
3. **决策备忘**：M5 的 leash/collar/torch 三项**关闭且不带回退条款**（理由见第 5 节）。

---

## 9. 已复核题号清单（覆盖率证明）

**A5-01、A5-02、A5-03、A5-04、A5-05、A5-06、A5-07、A5-08、A5-09、A5-10、A5-11、A5-12、A5-13、A5-14、A5-15**

**合计 15 题 / 文件内 15 题 = 15/15，逐题复核，无抽样。**

---

## 10. 复核纪律声明

1. 本轮**未打开** `reviews/R1-A5.md`，**未打开** `fixes/` 下任何文件（含 F2-A5.md）。
2. 全部结论来自对 `data/item-bank/prod/A5.md` **当前文本的独立重读**与**本轮重新编写的脚本复算**；R2 报告的数值仅用于比对差异，不作为判定依据（已发现并记录 R2 §5 的一处算术笔误：87 → 实际 79）。
3. **未采信 fixLog 与 R2 的任何自检结论**，包括「M5 三处替换属预置、需连带还原标题」这一声明——已独立评估其回退成本并给出相反建议（见第 5 节）。
4. 本轮**只写本文件**，未修改任何题目文件。
