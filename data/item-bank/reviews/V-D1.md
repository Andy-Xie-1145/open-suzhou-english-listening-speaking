# 复核报告：D-batch1.md 二轮修复回归验证

> 复核人：修复后复核员（未参与撰写 R2 报告与修复；未查阅 reviews/R1-D1.md 与 fixes/ 下任何文件）
> 复核范围：data/item-bank/D-batch1.md，10 份 / 30 空，**逐份逐空独立重读原文**
> 复核对象：二轮修复是否**引入新缺陷**；并对修复员给出的 **D-03 无解数学论证**做独立验证

## 结论

- **复核题数**：10 / 10；**复核空数**：30 / 30（无抽样）
- **修复引入的新阻塞缺陷：0 条**
- **修复后仍残留的非阻塞问题：2 份**（D-03 ② 结构性下限；D-06 长度分层未被真正消除）
- **结论：10 / 10 份均可归档**，其中 8 份无遗留关注项
- **D-03 无解论证：成立**（(a)(b)(c) 三项均独立复核通过，且已证修复达到了该约束下的最优解）

---

## 清单 1 · D-03 无解论证的独立验证（重点）

修复员主张：三空答案类型两两不相交，覆盖 3 类各需 2 个候选共 6 槽位，词库仅 5 项，故必有一类只有 1 个候选。

### (a) 三空类型是否真的两两不相交 —— **是**

| 空 | 行头 | 所要求的答案类型 |
|---|---|---|
| ① | The first turning on the way | 转向指令（turn + 方向 + 参照物） |
| ② | The bus to take | 公交线路 / 乘车方式 |
| ③ | The time needed on foot | 时长表达 |

三类的语义槽位互斥：任何「转向」短语都无法回答「坐哪路车」或「走路多久」，反之亦然。
进一步验证**不可通过改写选项绕开**：

- 若某选项同时是转向与时长，需一个短语既含 turn 又含时间量，无此类自然表达；
- 若某选项同时是公交与时长，"About five minutes on foot" 类表达不含线路信息，行头 "The bus to take" 无法容纳；
- 行头本身锁死了类型（"The bus to take" 这一问句只接受线路/方式类答案）。

**结论：类型不相交成立，且该性质由行头决定，与词库内容无关。**

### (b) 改后词库 5 项的类型分布 —— **与修复员所述完全一致**

改后词库（D-batch1.md:58-62）：

| 选项 | 原文 | 类型 | 词数 |
|---|---|---|---|
| A | Turn left at the second crossing | 转向 | 6 |
| B | Take Bus 12 there | 公交线路 | 4 |
| C | Turn right at the second crossing | 转向 | 6 |
| D | About five minutes | 时长 | 3 |
| E | About half an hour | 时长 | 4 |

分布：**转向 2（A/C）｜公交 1（B）｜时长 2（D/E）** —— 5 项覆盖 3 类，每类 ≥2 需 6 项，鸽笼原理成立，**必有一类只有 1 个候选**，本项即公交类。修复员未点名是哪一类，但实际缺口落在 ②，与其自检「D-03 ②类别可锁定」自洽。

### (c) ①②③ 各自是否仍可仅凭类别锁定 —— **①③ 已不可，②仍可**

| 空 | 全库同类型候选 | 是否可仅凭类别锁定 | 独立判定 |
|---|---|---|---|
| ① | A、C（转向） | **否** —— B（公交）与 D/E（时长）被类别直接排除，须在 A/C 间读出 passage 的 turn left | 通过 |
| ② | 仅 B | **是** —— 全库唯一公交类选项，类别即答案 | 未消除（结构下限） |
| ③ | D、E（时长） | **否** —— 须读出 about five minutes，排除 E | 通过 |

### 论证成立性与「修复是否已达最优」

论证**成立**，且我进一步确认它没有被夸大：

1. **不可绕开性**：唯一能消除 ② 类别锁定的办法是让 6 个候选进入 5 槽词库，或把表格三行改成同一类型 / 放宽行头语义 —— 三者都超出了「仅替换 Word Bank、Passage / Table / Answers 一字不改」的既定约束。论证的适用范围被正确限定在「给定约束下」。
2. **修复已达该约束下的最优**：在 5 项 / 3 类不相交的前提下，最好情况就是 **2 空有同类竞争 + 1 空单候选**（5 = 2+2+1）。改后恰好是「转向 2 / 时长 2 / 公交 1」，即 ①③ 双竞争、② 单点，**已达理论最优**，不存在更优词库。
3. **附带改善（修复员未提及，我实测）**：改前 A 为 6 词、其余 3-4 词，A 是唯一最长项且恰为 ① 答案，构成第二条提示信号；改后 A 与 C 同为 6 词（同为转向类），**「唯一最长」这一离群提示已消除**。该项是净收益。

**判定：D-03 无解论证成立，改后词库是该约束下的最优解，无残留可修复项。**

---

## 清单 2 · 两处有意偏离是否正确 + 词库长度极差复核

### D-01 选项 D：去掉 "in the reading room" —— **偏离正确**

- R2 建议为 "practise speaking English with his classmates in the reading room"，修复员实际采用 "practise speaking English with his classmates"。
- **逐字性**：passage 为 "On Wednesday afternoon he practises speaking English with his classmates in the reading room."；改后 D 与 passage 中 "practise speaking English with his classmates" **连续逐字重合**（仅第三人称 -s → 原形，与全卷词库惯例一致，如 D-04 B "run 800 metres" / D-08 D "clean the playground"）。可回原文定位 ✓
- **地道性**：practise speaking English 是母语者标准搭配，原 practise spoken English 的半生硬问题已消除 ✓
- **不选长版反而更好**：若按 R2 原建议，D 为 7 词会与 E（7 词）并列成为最长项，重新引入长度提示；采用短版使 D-01 词数维持 5/5/6/6/7，极差 2，**未制造新的长度缺陷** ✓

### D-06 的 art room 对齐方向 —— **偏离正确**

- R2 建议把选项 E 改成 "in the **school** art room" 去迁就 passage；修复员反其道而行，把 passage 的 school 删掉，使双方统一为 "in the art room"。
- 现状：D-batch1.md:107 "She goes there on Wednesday afternoon in the art room."；D-batch1.md:119 "go to the photography club in the art room on Wednesday afternoon" —— **材料与选项已一致** ✓
- 两个方向都能达成对齐，取舍无误。删除 school 的代价仅为「哪个美术教室」略含糊，且表格行头只有 Person 列，不影响答案唯一性。**未引入新缺陷**。

### 10 份词库长度实测（我独立计数，与 R2 部分计数有出入，见下）

| 题号 | 词数 A/B/C/D/E | 极差 | 三空答案长度 | 长度提示 |
|---|---|---|---|---|
| D-01 | 5/5/6/6/7 | 2 | 5, 6, 5 | 两个最短项恰为①③，但②在 6/6/7 中有并列，长度无法定案 → 弱 |
| D-02 | 2/2/3/2/2 | 1 | 3, 2, 2 | 唯一 3 词项为①，其余四项并列 → 很弱 |
| D-03 | 6/4/6/3/4 | 3 | 6, 4, 3 | ①与C并列最长（同类），③为唯一最短 → 弱 |
| D-04 | 8/7/7/5/7 | 3 | 7, 7, 7 | **最短 D、最长 A 均为干扰项，完全无提示** ✓ |
| D-05 | 5/5/6/8/7 | 3 | 8, 5, 6 | ①为唯一最长 → 弱（修复员已自检） |
| D-06 | **10/8/10/8/12** | 4 | 12, 8, 8 | **见下方专门发现** |
| D-07 | 6/4/3/7/7 | 4 | 3, 6, 7 | ①为唯一最短 → 弱 |
| D-08 | 7/6/3/3/4 | 4 | 3, 6, 7 | ③为唯一最长 → 弱（修复员已自检） |
| D-09 | 4/4/6/5/5 | 2 | 5, 6, 4 | 长度交错带并列，无提示 ✓ |
| D-10 | 6/8/6/7/8 | 2 | 6, 8, 7 | 答案 6/7/8 与干扰项 6/8 完全并列交错，无提示 ✓ |

### 新发现：D-06 的长度缺陷**未被真正修复**

- R2 给出的改后计数是「A=9、B=8、C=9、D=8、E=12，答案 8/10/12 不与干扰项 9/9 分层」。**R2 的词数计算有误**（A、C 实为 10 词，E 实为 12 词），修复员照单执行未复测。
- 改后实测 10/8/10/8/12，答案 = {E=12, B=8, D=8}，干扰项 = {A=10, C=10}。
- 结果：**最长项恰为 ① 答案 E，最短两项恰为 ②③ 答案 B、D，而两个干扰项整齐地卡在中间 10 词。** 一条「最长 → ①、最短两项 → ②③」的长度规则可以**不读材料拿满 3 / 3**。
- 公平比较：改前（7/7/8/8/12）同样是「最长 → ①、两个 8 → ②③」，也是完整长度捷径。**所以这不是修复新引入的缺陷，而是原缺陷修了一半**：唯一离群项（12 vs 7-8，近两倍）确实消除了，但「答案整体落在长度两端」这一层没动，严重度由「明显挑最长」降为「需组合两条长度规则」。
- **不阻塞归档**（材料判别链完整，且这条规则需要学生事先猜中组合策略），但建议后续一处微调打断它：加长 B 或 D（例如 B → "play chess after school with his friends on Tuesday and Thursday"、D → "practise the guitar at home for an hour on Friday evening"），或把 A/C 从 10 拉开到 9/11，使答案不同时占据最长与最短。
- 其余 9 份：**均未出现新的「挑最长 / 挑最短」缺陷**，D-04、D-09、D-10 三份长度完全中性或交错，D-01 因 D 取短版而维持原有平衡。

---

## 清单 3 · D-08 方案取舍是否正确

修复员拒绝了 R2 的第一方案（"Kate lives on the **fourth floor**, so she often helps an old neighbour **on the fifth floor** carry water upstairs"），理由是会拦腰截断 ② 空正确答案的原文切片。**我逐字核对，该理由成立。**

- 若采用被拒方案，passage 变为 "…she often helps an old neighbour on the fifth floor carry water upstairs."
- 选项 B 为 "help an old neighbour carry water"
- 在新文本中，B 的连续子串被 "on the fifth floor" 打断，**不再是逐字切片**；且 passage 用 helps（三单）而选项用 help（原形），形态也对不上 → 学生无法回原文定位 ②。
- 修复员实际采用 "His classmate Kate is strong and helpful, so she plans to help an old neighbour carry water upstairs."

**改后逐字核验：**

| 空 | 选项 | passage 对应片段 | 逐字？ |
|---|---|---|---|
| ① | D. clean the playground | "Peter will clean the playground in the morning" | ✓ |
| ② | B. help an old neighbour carry water | "she plans to help an old neighbour carry water upstairs" | ✓ **连续逐字，未被截断** |
| ③ | A. put up a notice about saving water | "they will put up a notice about saving water near the building" | ✓ |

- 因果链："is strong and helpful, so she plans to help an old neighbour carry water upstairs" —— 强壮的 Kate 帮人提水，逻辑通顺 ✓，R2 的因果缺陷已消除。
- 干扰项 C（water the flowers）、E（clean the waiting room）材料中不存在，其中 E 与 D 同为 clean X 结构构成真实竞争 ✓
- **判定：取舍正确，B 仍可在材料中逐字找到，无新缺陷。**

---

## 清单 4 · D-10 及 30 空「是否仍需读材料」逐空核对

### D-10 专项

- ① in class：新增干扰项 A "keep the classroom clean after school"（**含 classroom，与 C 同为课堂场景**），必须读 passage 的 "use both sides of the paper in class" 才能在 A/C 间定案 ✓
- ② at home：新增干扰项 B "help my parents wash the vegetables after supper"（**家庭场景，与 E 同类**），必须读 "turn off the tap when we brush our teeth" ✓
- ③ on Friday afternoon：D "put the rubbish in the right place"，须读 "Every Friday afternoon one student checks the bins and puts the rubbish in the right place"；A 带时间标记 after school、B 带 after supper 被时间排除，但 ①② 必须先靠材料定案，本空才随之确定 → **三空整体必须读材料** ✓
- 长度：6/8/6/7/8，答案 6/7/8 与干扰项 6/8 并列交错，**无长度提示** ✓
- 修复员「新 A/B 让 ③ 也需读材料」的说法**成立**。

### 30 空「是否可仅凭常识 / 类别 / 形态排除」逐空表

| 空 | 需读材料？ | 同类型竞争项 | 独立判定 |
|---|---|---|---|
| D-01① | 是 | B/C/D/E 均非同类型，须读 Monday | ✓ |
| D-01② | 是 | C（library 场景）可竞争，须读 Wednesday | ✓ |
| D-01③ | 是 | 无同类，须读 Friday | ✓ |
| D-02① | 是 | **B（three bottles，同为瓶装油）** | ✓ |
| D-02② | **否（全库唯一重量单位）** | 无 | ⚠ 残留，**修复前既有**，本轮未触及 |
| D-02③ | 是 | **D（three bags，同为袋装茶）** | ✓ |
| D-03① | 是 | **C（转向镜像项）** | ✓ 已修复 |
| D-03② | **否（全库唯一公交项）** | 无 | ⚠ 结构性下限，见清单 1 |
| D-03③ | 是 | **E（同类时长）** | ✓ 已修复 |
| D-04① | 是 | **A（均为游泳/跑步类距离项目）** | ✓ |
| D-04② | 是 | D（play basketball，需读 Tuesday and Thursday） | ✓ |
| D-04③ | 是 | **D（均含 Class）** | ✓ |
| D-05① | 是 | E（class party，同为集体活动） | ✓ |
| D-05② | 是 | B（fly kites，可安插任意时段） | ✓ |
| D-05③ | 是 | **B（周六上午放风筝，典型同类诱饵）** | ✓ 本批最佳设计之一 |
| D-06① | 是 | **A / C（均为 join X club on Y）** | ✓ |
| D-06② | 是 | **A / C（同为 club 加入型）** | ✓ |
| D-06③ | 是 | A / C / E | ✓ |
| D-07① | 是 | **B（take the rubbish out，同为晨间家务）** | ✓ |
| D-07② | 是 | D（同为家务） | ✓ |
| D-07③ | **部分（形态已修复，剩常识残留）** | **D 已改为并列双谓语短语，形态排除消除** | ⚠ 见下 |
| D-08① | 是 | **E（clean the waiting room，同构）** | ✓ |
| D-08② | 是（半可） | 无同类型项；行头 Kate 为人称，A/C/D/E 皆为泛指动作 → 弱提示 | 弱，不构成可仅凭类别锁定的判据（③ 的 A 亦可指代「两人」） |
| D-08③ | 是 | 无 | ✓ |
| D-09① | 是 | C（take a bus）、D（take a plane） | ✓ |
| D-09② | 是 | E（train） | ✓ |
| D-09③ | 是 | **A（walk along the lake，材料明写 in the evening）** | ✓ |
| D-10① | 是 | **A（classroom，同类）** | ✓ |
| D-10② | 是 | **B（家庭场景，同类）** | ✓ |
| D-10③ | 是 | A / B 被时间标记排除，但依赖①②先由材料定案 | ✓ |

**统计：30 空中 27 空必须读材料；3 空存在「不读材料也能选中」的成分 —— D-02②（结构性，极弱，修复前既有）、D-03②（结构性，已证不可消除）、D-07③（生活常识，内容固有）。其余 27 空均无。**

---

## 清单 5 · 「恰好 2 个干扰项未使用」逐份核对

| 题号 | 三空答案 | 词库 5 项 | 已用 | **未使用干扰项** | 个数 | 判定 |
|---|---|---|---|---|---|---|
| D-01 | ①A ②D ③B | A-E | A,B,D | **C、E** | 2 | ✓ |
| D-02 | ①C ②E ③A | A-E | A,C,E | **B、D** | 2 | ✓ |
| D-03 | ①A ②B ③D | A-E | A,B,D | **C、E** | 2 | ✓ |
| D-04 | ①B ②C ③E | A-E | B,C,E | **A、D** | 2 | ✓ |
| D-05 | ①D ②A ③C | A-E | A,C,D | **B、E** | 2 | ✓ |
| D-06 | ①E ②B ③D | A-E | B,D,E | **A、C** | 2 | ✓ |
| D-07 | ①C ②A ③E | A-E | A,C,E | **B、D** | 2 | ✓ |
| D-08 | ①D ②B ③A | A-E | A,B,D | **C、E** | 2 | ✓ |
| D-09 | ①E ②C ③B | A-E | B,C,E | **A、D** | 2 | ✓ |
| D-10 | ①C ②E ③D | A-E | C,D,E | **A、B** | 2 | ✓ |

**10 / 10 份均为恰好 2 个，且每份 5 项全为短语、无重复项、三空答案互不冲突（无同一选项被两空共用）。**

---

## 清单 6 · 答案字母分布与位置偏斜

### 字母频次（30 空全量）

| 字母 | A | B | C | D | E |
|---|---|---|---|---|---|
| 出现次数 | 6 | 6 | 6 | 6 | 6 |

- 合计 30 ✓；头注「答案字母 A–E 各 6 次」**属实** ✓
- 与 R2 报告所列逐份答案逐字比对：**10 份 / 30 空无一处字母变动**，修复未重排答案 ✓

### 逐空位置偏斜

| 位置 | A | B | C | D | E | 最高频 | 占比 | <70%？ |
|---|---|---|---|---|---|---|---|---|
| ① | 2 | 1 | 3 | 2 | 2 | C | 30% | ✓ |
| ② | 2 | 3 | 2 | 1 | 2 | B | 30% | ✓ |
| ③ | 2 | 2 | 1 | 3 | 2 | D | 30% | ✓ |

**最高频 30% << 70%，无位置偏斜 ✓。无同一字母在同一份的相邻空重复。**

---

## 清单 7 · 30 空材料依据 / 凭空信息

| 题号 | ①依据 | ②依据 | ③依据 | 逐字？ |
|---|---|---|---|---|
| D-01 | goes to the chess club | practises speaking English with his classmates（修复新增） | plays basketball on the playground | 三处逐字 ✓ |
| D-02 | a big bottle of cooking oil | a kilo of sugar | two packets of tea | ②为同义改写（one kilo vs a kilo，**修复前既有的术语不一致**） |
| D-03 | turn left at the second crossing | You can take Bus 12 there | about five minutes on foot | 三处逐字 ✓ |
| D-04 | run 800 metres on the sports field | practises the high jump with his classmates | a practice match against Class Three | 逐字 / 近逐字 ✓ |
| D-05 | watch the dragon boat races（at the river） | buy some rice and bamboo leaves | grandma will teach us how to make zongzi | ②③为同义改写（grounded） |
| D-06 | photography club + Wednesday + art room（**压缩换序**） | plays there after school on Tuesday and Thursday | practises the guitar at home … Friday evening | ①为忠实压缩（grounded） |
| D-07 | wash the car on Saturday morning | cut the grass in the yard | do the dishes and clean the table | 三处逐字 ✓ |
| D-08 | clean the playground | help an old neighbour carry water（修复后） | put up a notice about saving water | 三处逐字 ✓ |
| D-09 | The train leaves at seven in the morning + going to Hangzhou | take a bus to the hotel | visit the West Lake | ①为**合理推断，非逐字**（修复前既有） |
| D-10 | use both sides of the paper in class | turn off the tap when we brush our teeth | puts the rubbish in the right place | ②为人称改写（grounded） |

- **30 / 30 空全部有材料依据，零凭空信息。**
- 修复**未引入任何新的凭空信息**：本轮新增的 7 个选项（D-03 C/E、D-06 A/C、D-07 D、D-10 A/B）全部是**干扰项**，不受「答案须材料支撑」约束，且均属合理诱饵。
- 修复改动的 5 处正文/答案（D-01 passage+D、D-06 passage、D-08 passage）**全部与材料自洽**，无新增数字/时间/人称矛盾。
- 材料内部旧有张力 1 处仍在（D-08 "Our neighbourhood is clean and green" vs "too much rubbish under the trees"，R2 列为轻微，未修）—— 属修复前既有，不阻塞。

---

## 清单 8 · 新语法错误 / 超纲词

本轮新增或改写的全部文本：

| 位置 | 新文本 | 语法 | 地道性 | 词汇是否超纲 |
|---|---|---|---|---|
| D-01 passage | he practises **speaking** English with his classmates in the reading room | ✓ | ✓ 母语者标准搭配 | speaking ✓ 课标 |
| D-01 D | practise speaking English with his classmates | ✓ | ✓ | 同上 |
| D-03 C | Turn right at the second crossing | ✓ | ✓ 与 A 完美镜像 | ✓ |
| D-03 E | About half an hour | ✓ | ✓ | half / hour / half an hour 均在 2011 课标五级词表 |
| D-06 passage | …Wednesday afternoon in the art room | ✓ | ✓ | ✓ |
| D-06 A | join the swimming club **with his friends** on Monday morning | ✓ | ✓ | ✓ |
| D-06 C | join the drama club **with some classmates** on Saturday afternoon | ✓ | ✓ | ✓ |
| D-07 D | make the beds **and water the flowers** | ✓ | ✓ water the flowers 为标准搭配 | ✓ |
| D-08 passage | His classmate Kate **is strong and helpful**, so she plans to help… | ✓ | ✓ 因果自然 | helpful ✓ |
| D-10 A | keep the classroom clean after school | ✓ | ✓ | ✓ |
| D-10 B | help my parents wash the vegetables after supper | ✓ | ✓ | supper ✓ 课标 |

- **新语法错误：0 处**；**超纲词：0 处**。
- D-01 原有的 practise spoken English 半生硬搭配已彻底消除 ✓
- 轻微残留 1 处（修复带来的语域不齐）：D-10 同一词库内 B 用第一人称 my parents、E 用第三人称 their teeth，人称不统一。此为 distractors 与答案并列时的语域瑕疵，不影响答案唯一性，**建议后续统一为第三人称**（R2 轻微项 L17 的根因同源，未修）。

---

## 修复员自检残留项的独立判断

| # | 修复员自检残留 | 我的独立判断 | 是否阻塞归档 |
|---|---|---|---|
| 1 | **D-05 ①答案为最长项** | **属实**。D = 8 词为全库唯一最长，确为 ① 答案。但干扰项 B=5、E=7 与答案 5/6 交错，长度无法凑齐答案集；且本份长度分布修复前后未变。**属修复前既有，弱** | **否** |
| 2 | **D-08 ③答案为最长项、极差 4** | **属实**。A=7 唯一最长且为 ③ 答案；极差 7-3=4 确为全批最大之一。但 ① 答案 D=3 与干扰项 C=3 并列，最短项不指向答案，长度最多给 1/3。**属修复前既有（R2 L15 已记），弱** | **否** |
| 3 | **D-03 ②类别可锁定** | **属实且不可消除**。我已用鸽笼原理论证这是 5 选项 / 3 类不相交约束下的下限，且改后已达最优（2 空双竞争 + 1 空单点）。**约束性下限，非执行缺陷** | **否**（建议写入出题规范备注） |
| 4 | **D-07 ③属内容固有常识** | **部分成立**。修复确实消除了更硬的「唯一并列谓语 → 形态排除」漏洞（新 D make the beds and water the flowers 与 E 同构）✓。但「饭后 → 洗碗」的生活常识仍可猜中，**该判断我认同为内容固有**；进一步提升须更换第③空所考内容（wash up 类动作在中文教材中与 after dinner 绑定过紧） | **否** |

**修复员未自检、但由我独立查出的残留（均为非阻塞）：**

| # | 位置 | 问题 |
|---|---|---|
| 5 | **D-06 全库** | 长度分层未真正解除：最长 = ① 答案、最短两项 = ②③ 答案、干扰项整齐居中，可组合成长度捷径（详见清单 2）。R2 给出的词数 9/9/8/10/12 计算有误，修复员未复测。**降级为轻微，不阻塞** |
| 6 | **D-02②** | 全库唯一重量单位，仍可凭类别锁定。修复前既有，R2 已判为该题型结构下限。**不阻塞** |
| 7 | **D-10 词库** | B（my parents，第一人称）与 E（their teeth，第三人称）语域不齐。**不阻塞** |
| 8 | D-01 / D-05 / D-08 / D-06 | R2 轻微项 L2 / L6 / L7 / L8 / L9 / L10 / L11 / L12 / L13 / L14 / L17 / L19 本轮未处理，均为修复前既有的措辞级问题，与本轮修复目标无关，**不阻塞** |
| 9 | D-05 段末 | D-05 与 D-06 之间有两个空行（格式不一致），纯排版，无影响 |

---

## 逐份最终结论

| 题号 | 材料支撑 | 判别度 | 长度中性 | 干扰项=2 | 结构 | 判定 |
|---|---|---|---|---|---|---|
| D-01 | 3/3 | 3/3 需读材料 | 极差 2，无新缺陷 | ✓ CE | ✓ | **通过**（仅 L2 标题措辞等修复前轻微项） |
| D-02 | 3/3 | ①③ 有同类竞争；② 为结构下限 | 极差 1 | ✓ BD | ✓ | **通过**（残留：② 类别锁定、a kilo/one kilo） |
| D-03 | 3/3 | ①③ 双竞争（已修复）；② 结构下限 | 极差 3，**原离群已消除** | ✓ CE | ✓ | **通过**（残留：② 类别锁定 = 已证不可消除；已达最优） |
| D-04 | 3/3 | 3/3 全有同类竞争 | **长度完全中性** | ✓ AD | ✓ | **通过（本批最干净）** |
| D-05 | 3/3 | 3/3，③ 的 fly kites 为强诱饵 | 极差 3，①为唯一最长 | ✓ BE | ✓ | **通过**（残留：① 长度提示，弱） |
| D-06 | 3/3 | 3/3 全有同类竞争 | 极差 4，**答案居两端** | ✓ AC | ✓ | **通过**（残留：长度分层未解除；L11/L12 旧轻微） |
| D-07 | 3/3 | ①② 有同类竞争；③ 形态排除已消除 | 极差 4，①为唯一最短 | ✓ BD | ✓ | **通过**（残留：③ 生活常识，内容固有） |
| D-08 | 3/3，② **逐字可定位** | 3/3；② 的人物行头不构成唯一锁定 | 极差 4，③为唯一最长 | ✓ CE | ✓ | **通过**（残留：③ 长度提示；L14 旧轻微） |
| D-09 | 3/3 | 3/3 全有同类竞争 | 极差 2，交错无提示 | ✓ AD | ✓ | **通过** |
| D-10 | 3/3 | **3/3 全需读材料（修复生效）** | 极差 2，交错无提示 | ✓ AB | ✓ | **通过**（残留：B/E 人称不齐；L17/L18 旧轻微） |

**覆盖率证明：10 / 10 份、30 / 30 空独立复核，无抽样、无省略。本轮未修改任何题目文件，仅新增本报告。**

---

## 给归档方的三句话

1. **D-03 无解论证成立**，且改后词库已是 5 选项 / 3 类不相交约束下的最优解 —— ② 的类别锁定不必再改，要彻底解决只能改表格行头或扩到 6 个选项。
2. **本轮修复未引入任何新缺陷**：30 空全部有材料依据，10 份全部恰好 2 个干扰项，A6 B6 C6 D6 E6 与逐空最高频 30% 均达标，新文本无语法错误、无超纲词，D-01 与 D-06 两处有意偏离方向均正确。
3. **建议归档，但留两条尾巴**：D-06 长度分层未真正解除（可微调一处打断），D-10 词库人称语域不齐（可微调一处）。
