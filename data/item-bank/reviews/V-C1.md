# 复核报告：C-batch1.md 二轮修复后复核（修复后复核员）

> 复核对象：`data/item-bank/C-batch1.md`（8 篇 / 40 题）
> 对照依据：`data/item-bank/reviews/R2-C1.md`（二轮审核报告）
> 独立性声明：本轮**未读取** `reviews/R1-C1.md`，**未读取** `fixes/` 下任何文件，未读取 `PIPELINE.md`；除本文件外未打开题库目录内其他文件。所有结论均由本人重新通读 8 篇原文 + 40 题题干选项后独立得出，**未采信任何修复方自检**。
> 复核性质：只验「二轮修复是否引入新缺陷」+ 全量清单复核；**未修改任何题目文件**，本轮唯一写入为本报告。

---

## 结论

- **复核题数：40**（C-01…C-08 × Q1–Q5，无抽样）
- **通过：40**（40 题答案唯一性全部成立，无需再次修复）
- **发现问题：0 题**（无严重、无中等、无新增可判性缺陷）
- 附带记录：**6 条轻微观察**（其中 1 条系二轮修复的口径副作用、5 条为遗留/边界项，见「五」）+ **23 条未落地轻微项**（见「六」，均为 R2 已列的轻微项，不影响本轮可判性判定）
- **二轮修复总体判定：全部落地且未引入新缺陷。C-07 Q3 的「材料内同源干扰项」没有再次发生。**

---

## 一、最高危项 C-07 Q3：已修复，且未再翻车（重点复核）

### 1.1 改后原文

- 题干（第 260 行）：`According to the passage, why is the coat worn only twice?`
- A（第 261 行）：`The student should have waited one day before buying it.`
- B（第 262 行）：`The student should ask the shop assistant for a smaller size.`
- C（第 263 行）：`The student should check the price on the front of the packet.`
- D（第 264 行）：`The student probably bought it without thinking.`
- 标注答案：**D**

### 1.2 材料依据（第 244 行，本轮逐句重读原文）

- `The third rule is to wait one day before buying clothes.`（→ 指向 A）
- `Clothes are the easiest things to buy too many of, and a coat bought in a hurry is often a coat that is never worn again.`（→ 指向 D）
- `Most unplanned things in a shopping bag were bought without a need.`（→ 指向 D）
- `If you tell them how much you want to spend, they can show you the smaller and cheaper size...`（→ 指向 B）
- `The second rule is to look at the price per hundred grams instead of the price on the front of the packet.`（→ 反向否定 C）

### 1.3 逐项判定

| 项 | 是否材料同源 | 是否是「原因句」 | 排除依据 |
|---|---|---|---|
| A | **是**（third rule 就是针对 clothes 的） | 否，`should have done` 是补救建议 | 题干预设：why 问因，A/B/C 三项全部是「该做什么」，不构成对 why 的回答 |
| B | **是**（shop assistant 确实会 show you the smaller size） | 否，`should ask` 是补救建议 | 同上，且 smaller size 与「穿得少」无因果关系 |
| C | **是**（但方向相反） | 否 | 双重排除：①题干预设；②材料原句 `instead of the price on the front of the packet` 明确否定 |
| D | **是** | **是** | —— 唯一正确项 |

**结论：D 唯一可推。** 关键在于 B 和 A 虽然**材料同源**，但被「why 引导的原因问句」这一题干预设**干净地整体排除**——三项全为 `should + 动词` 的建议句，一项为 `probably bought` 的原因陈述，类型对立明确，不存在「同源且同类型」的第二个可推答案。

**逐一排查「是否出现新的材料内同源干扰项」：全篇材料另有两处可能构成原因的表述，均已核对，未被任何干扰项或答案错误占用：**
1. `Clothes are the easiest things to buy too many of` —— 可推出「因为外套买多了所以不穿」，但**该推论未被写成任何一个选项**，不构成二解；
2. `old things in good condition can be a good choice` —— 与「穿两次」无因果链，不影响本题。
3. 另有 C-07 Q4 的正确项 `Bought without a plan or a real need` 与本题 D `bought it without thinking` 语义高度接近（见 V-04），属同篇内的呼应而非本题的二解。

### 1.4 上轮翻车原因已消除

R2 记录的严重缺陷成因是：**上一轮把原干扰项升级成了材料内同源项，导致 A（wait one day，材料直给的建议）与 D（bought without thinking，材料改写句）同时可推**。本轮修复走的是 R2 推荐的「改题干」路线，A 未被再次升级，B/C 也未被改写成原因句，题干类型筛选干净。**该严重缺陷不再成立。**

---

## 二、C-04 Q3：材料与选项双改后答案仍唯一，材料与选项互证成立

- 材料（第 126 行）：`If a book has been there for more than a month, he reads it and then pushes it down to the lower shelf, where a reader can still find it and take it to the next one.`
- 选项与答案：A `new readers like old books more` / B `sell it to new readers` / **C `Because he hopes readers can still find it there`（答案）** / D `Because he wants to keep the old books for his own family`

| 项 | 材料依据 | 判定 |
|---|---|---|
| A | 无 | 排除 ✓ |
| B | 无（材料无售卖情节） | 排除 ✓ |
| C | `where a reader can still find it and take it to the next one` —— 直接对位 | 正确 ✓ |
| D（新改） | 材料 `Anyone may take a book from it`、`At first only his family used it`（后文已扩展为全社区共用） | 排除 ✓ |

- **互证成立**：C 的措辞「hopes readers can still find it there」与材料补入的「where a reader can still find it」为同源对位，材料确实「交代了理由」，不再需要学生自行补推理。
- **原二解风险已消除**：旧 D「Because there is no space at the top」正是靠 `Today most of the shelves are always full` 起推理链；新 D 与该句无任何关联，二解通道关闭。
- **新 D 的干扰效力反而更强**：`his own family` 挂钩了材料里真实存在的 `At first only his family used it`，是「材料同源但被材料后文推翻」的高质量干扰项，符合好干扰项标准。
- 本题对同篇其他题无连带影响：Q1（March）、Q2（名字＋读完日期）、Q4（one good bookcase vs four empty ones）、Q5（主旨）逐条复核仍唯一。

---

## 三、C-08 Q4：`nobody washed up alone` 不再支持任何干扰项

- 题干（第 306 行）：`In the passage, the youngest "helper" is a person who ______.`
- A `Pays for the meal.` / B `Comes to watch the cooking.` / **C `Does some of the work with the others.`（答案）** / D（新改）`Stays at home and waits for the dinner to be over.`

**逐项回查材料（第 283 行）：**

| 项 | 与「nobody washed up alone … People cleaned the tables together, put the bowls away, and swept the square」的关系 | 判定 |
|---|---|---|
| A | 全文无任何「付钱」情节（十二户各带一道自做菜品） | 排除 ✓ |
| B | 该句要求人人参与收拾，六岁孩子不属于「只看不帮」的人 | 至多被材料否定，不被支持 ✓ |
| C | **该句正是 C 的直接依据**（「和别人一起干一部分活」＝helper 的定义） | 正确 ✓ |
| D（新改） | 材料写 youngest helper 就在现场（八十一岁大厨、六岁帮手同句），「待在家里」与在场矛盾 | 排除 ✓ |

**结论：新 D 与「nobody washed up alone」零关联，该句现在只支持正确项 C，不支持任何干扰项。二解风险关闭。** 四个选项均为第三人称单数动词短语，结构同构，无一眼可排除的类别错配项。

---

## 四、清单逐项复核结果

### 4.1 词数（150–220）——8 篇全部达标

| 篇 | 空格分词 | 词母计数（仅字母词） | 判定 |
|---|---|---|---|
| C-01 | 192 | 189 | ✓ |
| C-02 | 187 | 187 | ✓ |
| C-03 | **219** | **219** | ✓（**缓冲仅 1 词，见 V-05**） |
| C-04 | 205 | 203 | ✓ |
| C-05 | 196 | 193 | ✓ |
| C-06 | 191 | 190 | ✓ |
| C-07 | 203 | 203 | ✓ |
| C-08 | 181 | 181 | ✓ |

两种计数口径结论一致，无口径争议。C-03 已由 229 降至 219，二轮删句落地且**未越下界**（其余七篇 181–205）。

### 4.2 每篇 5 题唯一答案 —— 40/40 成立

| 篇 | Q1 | Q2 | Q3 | Q4 | Q5 | 唯一性 |
|---|---|---|---|---|---|---|
| C-01 | B | C | D | A | A | 5/5 ✓ |
| C-02 | C | D | A | B | B | 5/5 ✓ |
| C-03 | D | A | C | B | C | 5/5 ✓ |
| C-04 | A | B | C | D | D | 5/5 ✓ |
| C-05 | B | A | D | C | B | 5/5 ✓ |
| C-06 | D | C | B | A | B | 5/5 ✓ |
| C-07 | B | A | D | C | A | 5/5 ✓ |
| C-08 | C | A | D | C | D | 5/5 ✓ |

**分布：A10 / B10 / C10 / D10，总计 40。**（注：R2 报告写作 A10/B10/**C11**/D10，是其报告的计数笔误，题库本身的分布一直就是 10/10/10/10；本轮实测确认。）

**周期检测：**
- 无「同篇连续两题同字母」以外的规律性泄漏；仅 C-01 Q4–Q5（AA）、C-02 Q4–Q5（BB）、C-04 Q4–Q5（DD）三处篇末相邻重复，与 C-08 Q4–Q5（CD）不同，属个别现象，未形成模式（3/8 篇，不是系统性）。
- 无任何一篇出现某字母 ≥3 次；C-08 是唯一 0 个 B 的篇（B=0，C=2、D=2），但该篇 4 个非 B 项分散在 Q1/Q2/Q3/Q5，不构成可利用规律。
- 8 次 `What is the passage mainly about?` 固定在 Q5，属结构设计，非缺陷。

### 4.3 逐个干扰项回查材料（120 个干扰项全量回溯）

对全部 40 题的 120 个干扰项逐条回材料核对，**无任何一个干扰项现在也构成材料支持的答案**。以下 12 项是「**部分同源、但被材料明确否定或被题干预设排除**」的高风险项，全部复核通过：

| 题号 | 干扰项 | 同源点 | 排除机制 | 判定 |
|---|---|---|---|---|
| C-01 Q2 B | 付钱买阅读室的餐食 | 材料有 reading room | 材料说买的是 books | ✓ |
| C-01 Q3 B | 给本校图书馆弄钱 | 材料有 money + library | 钱是给 Green Middle School 的阅读室买书 | ✓ |
| C-01 Q4 B/C/D | 三项同向否定 | — | 与材料全篇正面取向冲突（L04 未修，仍为轻微） | ✓ |
| C-02 Q3 A | for free | 材料有 ninety-one things for free | 限定于上学期的 91 件（R2 已判为合理推断） | ✓ |
| C-02 Q4 A | 愿意给别人花钱 | 与 patience 无词义关联 | 材料只写为他人**免费**修，未涉金钱 | ✓ |
| C-03 Q1 A | 变得更大更强 | 材料有 grows | 「stronger」无依据；且为半支持项（L12 未修） | ✓ |
| C-03 Q3 A/D | 睡前长时间看书 | — | 材料从未提阅读 | ✓ |
| C-04 Q3 D（新） | 把旧书留给自家 | 材料有 only his family used it | 材料明写 anyone may take a book | ✓ |
| C-06 Q3 A | 慢火车太贵 | 材料有 costs less | 反向矛盾 | ✓ |
| C-07 Q2 D | 包装大的总是更好 | 材料有 holds less powder | 直接矛盾 | ✓ |
| C-07 Q3 A/B | 两条材料直给建议 | **材料同源** | **why 题干预设排除**（见一） | ✓ |
| C-08 Q1 D | 带一张大桌子 | 材料有 another brought a table | 题干限定 each family，材料只是一户 | ✓ |

**另需说明一处「看着像二解、实则唯一」的题（本轮独立复核，非引用 R2）：** C-08 Q5 的 C `How Longhua Community manages its shared kitchen`。材料确实写了「社区厨房下午开放、十二户各做一道菜」，但全文没有任何关于**如何管理**该厨房的规则、人员或安排（管理类信息为零），且材料重心（起因、共享、清扫、来年加入）在**年夜饭本身**而非厨房场地。C 属「地点化窄读」干扰项，D `How a neighbourhood shares a New Year dinner` 仍是唯一主旨答案。判定通过。

### 4.4 语法与超纲词 —— 改动文本专项体检

**本轮 10 处改动文本逐句语法复核，无一处语法错误：**

| 改动 | 语法判定 |
|---|---|
| C-01 `They ask people walking past to put empty bottles and used paper into the bags` | ✓ |
| C-01 `two primary schools nearby have asked to join it next year` | ✓ |
| C-01 `sells the bottles to a small recycling shop` | ✓ |
| C-03 `will make it harder to fall asleep at night` | ✓ 原「make the night harder to fall asleep」搭配不通已消除 |
| C-03 `the body never gets used to the daily pattern` | ✓ |
| C-03 删除 `Sleeping late at night also changes the day itself.` 后衔接 | ✓ 删除点前后文连贯，无悬空 |
| C-04 `pushes it down to the lower shelf, where a reader can still find it and take it to the next one` | ✓ where 指地点，合法（略松但非错误） |
| C-04 D `Because he wants to keep the old books for his own family.` | ✓ |
| C-07 Q3 题干 `According to the passage, why is the coat worn only twice?` | ✓ |
| C-08 Q4 D `Stays at home and waits for the dinner to be over.` | ✓ |

**超纲词专项：改动文本中新增的词汇全部为降档替换或课标内词**（people walking past / nearby / daily pattern / where / stays at home），**未引入任何新的超纲词**。3 处边界生词（passers-by、neighbouring、rhythm）已全部替换完毕。

**唯一带语法性质的遗留问题（非本轮引入、非修复所致，为 R2 L09 未落地项）：** C-03 第 87 行 `…than students who sleep only six.` 缺单位，`sleep only six` 在标准书面英语中不成句（须 `six hours`）。该处与本篇 `nine hours` 及 C-03 Q3 题干 `about nine hours` 不一致。**不影响任何题目的可判性**（C-03 Q1/Q2/Q3 均不依赖该分句），判为轻微，建议下一批顺手改掉。

### 4.5 格式合规

编号 C-01…C-08 连续无缺号；每篇均为 `## 编号 中文标题` + `**Passage**` + `**Q1**`–`**Q5**` + `**Answer**`，8 篇各 5 题共 40 个 `**Answer**`，选项均为 4 个 A/B/C/D，无缺标记、正文未混入说明性文字。✓

---

## 五、本轮记录的 6 条轻微观察（均不影响可判性判定，不构成「发现问题题」）

| 编号 | 位置 | 性质 | 说明与建议 |
|---|---|---|---|
| **V-01** | C-01 材料第 9 行 + Q2 题干第 18 行 | **二轮修复的口径副作用（本轮唯一与修复直接相关的一条）** | L02 只改了一半：`sells` 只修饰 bottles，纸仍是 `sends` 给纸厂、不产生收入，紧接着的 `The money` 按字面只指卖瓶所得；而 Q2 题干问 `the money from the bottles and paper`。**改动前的歧义被这次部分修复收窄成了一处可指认的口径不一致**。答案唯一性不受影响（C 仍是唯一与 `buy books for the reading room` 对位的选项），但题干与材料口径不齐，建议二选一：材料改为 `sells the paper to a paper factory and the bottles to a small recycling shop`，或题干改为 `the money from the bottles`。 |
| **V-02** | C-07 Q3 题干第 260 行 | 遗留（源自 R2 建议原文，改后固化） | 材料原话是 `never worn again`，题干写 `worn only twice`，二者字面不等（穿两次＝还是穿过）。D 的推断链（`bought in a hurry` → 很少穿 → 只穿两次）仍成立且唯一，A/B/C 仍被类型排除，故不影响判定；若要彻底干净，题干可改为 `why is the coat almost never worn again?`。 |
| **V-03** | C-04 材料第 126 行 | 遗留＋修复后张力略增 | 前句 `Books stay about two weeks before they travel to the next reader` 与本句 `more than a month` 仍是表面张力；补入的 `take it to the next one` 让「一周转到下一位读者」的承诺在此句再次出现，张力略微放大，但**逻辑上仍可解释**（两周是常态，无人取的书才会滞留），不构成新矛盾。若要消除，可把 `more than a month` 改为 `more than three weeks`（该数字未被任何题目引用，改动零风险）。 |
| **V-04** | C-07 Q3 答案 D × Q4 答案 C | 设计观察 | D `bought it without thinking` 与 Q4 正确项 C `Bought without a plan or a real need` 语义高度重合，同一篇内形成「答案互证」路径（先做 Q4 可能反推 Q3）。不影响唯一性，属可接受的呼应，但命题人若追求篇内独立性可留意。 |
| **V-05** | C-03 材料 | 边界 | 词数 219，距上限 220 只剩 **1 词**缓冲，是 8 篇中最紧的一篇（R2 记录为 229，经删句后达标）。后续任何一处增词都会越界，建议把该篇当作「只减不加」处理。 |
| **V-06** | C-08 Q4 干扰项 D（新改） | 设计观察 | 新 D 与在场事实矛盾过远，接近「送分项」，排除力强但区分度低。与 C-08 Q4 的原 D 相比是难度下降、排除力上升的明确取舍，符合 R2 的修复意图，记录备查。 |

---

## 六、未落地的 R2 轻微项（23 条，均不涉及可判性，供下一轮处理）

本轮逐条比对原文确认，以下 R2 轻微项在当前文件中**仍为原文**：

- **C-01**：L01 `60 kilos`；L03 `A teacher says`；L04 Q4 三干扰项同向（C 仍为 `should stop soon`）
- **C-02**：L05 `old computer room`；L06 `simply not cleaned for years`；L07 Q4 A `Ready to give money`；L08 Q5 B `old machines`
- **C-03**：L09 `sleep only six`（**唯一带语法性质**）；L10 `half an hour before bed`；L11 `Two weeks later`；L12 Q1 A；L13 Q3 D；L14 Q4 B `Takes in and arranges`
- **C-04**：L15 `Today most of the shelves are always full`；L16 `readers take a short note`
- **C-05**：L17 `the wall of the park`；L18 `does not leave the slowest behind`
- **C-06**：L19 `the walk before the first visit`
- **C-07**：L20 `were bought without a need`（现在时说明文中用过去时）
- **C-08**：L21 标题仍为 `一家人的年夜饭`（材料是十二户合做）；L22 `the young cooks` 无先行词
- **文件头第 5 行**：L23 考查点分布声明与实际不符；L24 生产计划待办混在来源声明里

**已落地的修复（本轮逐处确认）**：R2 严重 #1（C-07 Q3 改题干）、中等 #1（C-03 搭配）、中等 #2（C-04 材料＋选项双改）、中等 #3（C-08 Q4 D）、中等 #4（三处生词全部替换）、L02（部分，见 V-01）、L25（C-03 词数 229→219）。

---

## 七、覆盖率证明

| 题号 | Q1 | Q2 | Q3 | Q4 | Q5 |
|---|---|---|---|---|---|
| C-01 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |
| C-02 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |
| C-03 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |
| C-04 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |
| C-05 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |
| C-06 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |
| C-07 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |
| C-08 | 已复核 | 已复核 | 已复核 | 已复核 | 已复核 |

**已复核题号 40/40，无抽样、无遗漏**：C-01 Q1–Q5、C-02 Q1–Q5、C-03 Q1–Q5、C-04 Q1–Q5、C-05 Q1–Q5、C-06 Q1–Q5、C-07 Q1–Q5、C-08 Q1–Q5。
另复核 8 篇材料全文（词数、内部重复句、时间/数字/人物/单位自洽、改动文本语法与词表）。

---

## 八、给上游的一句话

二轮修复**可以收口**：唯一那条严重缺陷（C-07 Q3 双解）已按推荐路线修复，且未重演「升级干扰项 → 新增材料内同源项」的上轮失误；C-04 Q3 与 C-08 Q4 两条二解风险同时关闭；8 篇词数达标、分布 A10/B10/C10/D10、40 题答案全部唯一。**仅需收尾一处**：C-01 Q2 题干「the money from the bottles and paper」与材料「sends the paper / sells the bottles」的口径不一致（V-01），建议在下一批顺手改掉；其余 23 条为已知的轻微遗留，不阻塞出题。
