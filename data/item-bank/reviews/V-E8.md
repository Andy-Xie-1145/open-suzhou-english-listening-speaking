# V 轮复核 · E8（口语·话题简述，全库第一批 12 题）

## 0　本轮定位与独立性声明

V 不复述 R1/R2 的结论。本轮把 E8.md 当作**即将直接交付给使用者**（评分者／任课教师）的成品来审：
独立重跑 facts.ps1 与七道闸门，逐句读 12 篇参考作答，把每条评分要点的命名项独立对回对应作答。

纪律遵守：

- **未修改** E8.md；R1-E8 / F1-E8 / R2-E8 仅读取字节数与 MD5 作参考，未改一字。
- 未把「不符合官方中考口语考纲」当缺陷（本库无考纲，属已知永久边界）。
- 未把「参考作答只有一种写法」当缺陷（话题简述的固有性质）。
- 每个判断落到行号；读不到的写「未核到」。
- 第 6 节（评分要点可执行性）**未因 R2 已查而跳过**，从零重查一遍。

---

## 1　判定

**V = 不通过**

| 严重 | 中等 | 轻微 | 观察 |
|---|---|---|---|
| 0 | 2 | 6 | 3 |

一句话理由：**12 篇作答正文本身干净**——逐句读下来，语法、时态、单复数、冠词、中式英语、拼写体系都没查到错；问题全部落在**评分要点层**和**一处题意对齐**上。其中 2 处会直接把评分者带错：

- E8-12 L131：要点点名「老艺人」，作答里写的是「an old teacher」——评分者按要点逐条核对，会判这一条**未达成**，而作答其实没错。
- E8-07 L78/L79/L81：题目问「你最喜欢的节日」，作答从头到尾没说哪个是自己最喜欢的（favourite/favorite 出现 **0 次**），只说「the most important festival in China」——这是关于国家的客观事实，不是说话人的偏好；而 L81 的要点又被改写成「节日重要性」，于是这个缺口对评分者**完全隐形**，会拿满「信息完整性」。

按「能不能直接交给一个使用它的人」这条标准，这两条都不过。

**修复面很小**：2 处都是单行改写，不需要重写任何一篇作答正文。

---

## 2　基线事实（自己跑的，未采信转述）

题目文件 prod/E8.md　当前 MD5 = 62f2b9422391a4f42c8e5e7290f5c8df　16743 字节　141 行　末字节 0x0A　真 U+FFFD = 0　CR = 0　BOM = 无

scripts/facts.ps1 独立复跑结果与上述一致：

    E8.md   62f2b9422391a4f42c8e5e7290f5c8df  16743  141  0x0A
    归档缺口（别名感知）：archived = 58 / 59，gap = E8
    真 U+FFFD 扫描：files with real U+FFFD = 0

关于 U+FFFD：本轮按纪律用 [regex]::Matches($t,[char]0xFFFD) 实测，**真值 0**。
（未数 0xEF 字节——汉字 UTF-8 首字节全是 0xEF，数它必然误报。）

既有报告（只读）：R1-E8 18828 字节／F1-E8 9221 字节／R2-E8 24313 字节，三者末字节均为 0x0A。

---

## 3　七道闸门实测

| 闸门 | exit | 关键输出 | 对 E8 的证明力 |
|---|---|---|---|
| wordcount-gate | 0 | PASS: no material block exceeds its limit | **零** |
| encoding-check | 0 | 604 份 md，PASS: no encoding or corruption defect | **有** |
| speaker-gate | 0 | 扫 59 份，PASS；22 处 OPTION-REUSED 均不在 E8 | **部分适用** |
| verify-bank | 0 | E8 = 无 Answer/Answers 行(该类别可能本就不含) | **零** |
| shortcut-audit | 0 | 分列表只有 A/B/C/D 四类；1010 题中无 E 类 | **零** |
| sentence-gate | 0 | 12 块全 PASS；分布 9/9/8/9/8/8/8/8/8/8/8/8 | **有（本型唯一的句数证明）** |
| check-integrity | 0 | E8 = MATCH；总计 59，需关注 0 | **有（只证哈希，不证内容）** |

七道全绿。但对 E8 而言，**「全绿」实际是两道绿 + 一道不适用 + 三道空转**：

- **wordcount-gate 零证明力**：两道原因叠加。一是它只量词数，而本型规格是句数；二是脚本第 42 行显式按 E 类 continue，按设计跳过 E 类。它对 E8 的 PASS 不代表任何本型规格已达标。
- **verify-bank 零证明力**：E 类无 Answer/Answers 行可与汇总行比对，E8 直接落在「无 Answer/Answers 行」分支。
- **shortcut-audit 零证明力**：这是选择题的答案位置捷径审计，E 类无选项。它的「按类别分列」表里根本没有 E 行。
- **speaker-gate 部分适用**：SPEAKER-COUNT 只对 A 类生效；E8 无说话人标签、无选项，本型不适用。它扫到的 22 处选项复用全在 A/B 类，与 E8 无关。

### 3.1　sentence-gate 的 PASS 够不够

**不够，但方向是对的。** 它是七道里唯一对本型规格有实质证明力的一道，且设计上很克制：

- 阈值**不写死**，逐文件从题面自己的规格声明里读，读不到就 exit 2 不猜数。E8 命中 L5 与 L140 两处「不少于 7 句」，取最严 = 7。
- 脚本第 44–46 行**故意不采信**文末的实测汇总（L139），理由是「拿它当阈值等于让闸门校验自己的输出，会永远 PASS」。这条设计是对的，本轮确认它确实生效了。
- 判定只用 Strict 下界，不被口径绑架；E8 全 12 块 Strict 与 Loose 一致，无区间提示，说明不受句末缩写点影响。

**但它的 PASS 没有覆盖以下五项**（前两项是脚本第 19–23 行自陈不管的）：

1. **「连续成段」不查**。规格原文是「不少于 N 句、连续成段」，它只证明前半句。
   → 本轮另行实测：12 篇作答各自都只占 1 行，且下一行均为粗体标签行，**0 例外**。所以这半句实际达标，但**达标依据是我手工核的，不是闸门给的**。
2. **评分要点完全不查**。本轮第 6 节的 160 条命名项是我逐条核的。
3. **计的是句号数，不是有效句数**。脚本只认三个终止符；把同一件事拆成两句的短句同样计数，不判句子是否成话、不判长度下限。
   → 本轮另行实测：12 篇每篇 114–138 词（最长 E8-08 138，最短 E8-07 114），闸门不查这一项。
4. **不判作答质量**：语法、拼写、题意对齐、题目间雷同，一律不覆盖。
5. **不判要点与作答是否对得上**：这是本型最容易出事的地方，也是本轮发现 2 个问题的位置。

一句话：sentence-gate 的 PASS 可以证明「句数够了」，不能证明「这份材料能用」。

### 3.2　一个必须记录的观察：闸门红过，但不是 E8

写完本报告后复跑闸门，出现过两次红灯，均已查清并**与 E8 无关**。记录下来是为了让下游复跑时不误判：

1. **check-integrity 一度显示「需关注 1 个」** —— 那是 **D7**，不是 E8。
   E8 行自始至终是：E8 | V-E8.md | 强匹配(同行含题目名) | 62f2b9422391a4f42c8e5e7290f5c8df | 62f2b9422391a4f42c8e5e7290f5c8df | MATCH。
   D7 的成因是 prod/D7.md 被改（其 MD5 在我两次读取之间还变了两次：23c3b539… → a51b83f7…，说明该文件正被并发编辑），而 CL-D7.md 仍记录旧值。本轮未审 D7，也未修改 D7 或其报告。
2. **encoding-check 一度报 6 份 CL-*.md「含 CR」** —— 是**并发写入的瞬时假阳性**：那 6 个文件的 mtime 均为 01:01:11，正处于被另一个写入方创建的时刻；我随即逐份直接实测，CR 均为 0、U+FFFD 均为 0。
   随后连续两次复跑 encoding-check 均为 PASS（exit 0，609 份 md），且 V-E8.md 不在被点名之列。本文件自身实测 CR = 0、真 U+FFFD = 0、末字节 0x0A、无 BOM。

**结论不变**：E8 的七道闸门判定如第 3 节表，全绿。

---

## 4　① 参考作答逐句审读

**结论：未核到语法错误。** 12 篇逐句读过，细节如下（时态处理是每题各自刻意设计的，不是套模板）：

- **E8-01（L19）** 一般现在时贯穿；because / although 从句主谓一致（tells / make / am）。practise 用英式动词拼写，与全篇英式体系一致。
- **E8-02（L29）** Classes begin ... and finish 主谓一致（复数不加 s）；the longest break is the one after lunch 无冠词问题。
- **E8-03（L39）** likes playing with her toys more than studying 介词后动名词 + more than 省略，正确；which means 非限定定语从句，正确。
- **E8-04（L49）** 过去时叙述一致：went / stayed / took / walked / saw / bought / visited / liked。it was the first time I had travelled 过去完成时正确（L55 语法要点点名此结构，作答兑现）。
- **E8-05（L59）** have played ... for about three years 与 I usually play / I run 的完成时—一般现在时对比正确；eight-hundred-metre 连字符正确。
- **E8-06（L69）** I am not fond of 否定正确；tell me not to eat it 不定式否定正确。
- **E8-07（L79）** Last year ... gave / saved 与 This year I hope 时态切换正确。
- **E8-08（L89）** have moved away 现在完成时表现状，合理；which is a real problem 非限定定语从句正确。
- **E8-09（L99）** is done 被动语态正确；a small notebook where I write down 的 where 定语从句正确。
- **E8-10（L109）** my parents hope that I will study science 主句现在时 + 从句将来时，呼应正确；I need to study hard and learn to speak well 正确。
- **E8-11（L119）** whom I would never meet otherwise 的 whom 关系代词，正确；not only ... but also 正确。
- **E8-12（L129）** used to make ... but now she teaches 对照正确；a poet named Qu Yuan 后置定语正确。

**拼写体系（整词匹配实测，非前缀匹配）**

英式一致出现：favourite ×3、centre ×2、metre、neighbourhood、travelled、travellers、programme、practise。
美式变体**全部为 0**：favorite / center / meter / neighborhood / traveled / travelers / program / practice / color / realize / organize / analyze / kilometer。
→ **拼写体系统一，无混用。**

**排版一致性**：ASCII 直撇号 3 处（L49 与 L53 的 Xi'an、L79 的 New Year's Eve），弯撇号 U+2019 为 0。全篇一致，无混用。

**一处可讨论但我判非缺陷**：E8-06（L69）children need three bowls of vegetables a day。母语英语更自然的是 a bowl of vegetables，但这是中式语域下可接受的表达，且 L71 要点明确点名「母亲的每日蔬菜建议」，要点与作答一致。判非缺陷。

---

## 5　② 话题题目与作答的对齐（逐题）

| 题 | 话题域 | 题目第二问 | 作答是否兑现 | 判定 |
|---|---|---|---|---|
| E8-01 | 个人信息与爱好 | 它对你意味着什么 | L19 收尾 make me relaxed | 兑现（但要点未覆盖，见 m-4） |
| E8-02 | 校园生活 | 最喜欢其中哪一部分 | L29 My favourite teacher ... because | 兑现 |
| E8-03 | 家庭 | 你和家人怎样相处 | L39 have dinner together / help them clean / love my family | 兑现 |
| E8-04 | 旅行 | 它给你留下了什么 | L49 只给了「喜欢的理由 + 下年计划」 | 改写后兑现（见 m-6） |
| E8-05 | 运动 | 它带给你的变化 | L59 只给了「今年期望 + 一般益处」 | 改写后兑现（见 m-6） |
| E8-06 | 饮食 | 你对健康饮食的看法 | L69 收尾 a healthy diet is much more important | 兑现 |
| **E8-07** | **节日** | **你最喜欢的节日** | **0 次 favourite；只说 most important in China** | **未兑现（中等）** |
| E8-08 | 环境 | 人们可以做什么 | L89 收尾 duty of every person | 兑现 |
| E8-09 | 网络与阅读 | 网络与纸书的不同 | L99 仅隐含（easier on my eyes） | 弱兑现（见 m-3） |
| E8-10 | 理想与计划 | 为此做了哪些准备 | L109 need to / join the speech club / read every month | 兑现 |
| E8-11 | 志愿服务 | 你从中得到了什么 | L119 I felt useful | 兑现（偏薄） |
| E8-12 | 传统文化 | 现在有什么变化 | L129 used to ... but now / are changing | 兑现 |

「有内容」与「答的是它问的」的差别，就落在 E8-07 上：作答**有内容**（春节的准备、除夕、守岁、压岁钱、中秋、今年愿望），但没有回答**它问的**（最喜欢哪一个）。

---

## 6　③ 评分要点可执行性（V 独立复查，未采信 R2）

把每条评分要点里点名的**每个字串／结构**独立对回本题作答：

| 类别 | 命名项数 | 完全兑现 | 问题 |
|---|---|---|---|
| 信息完整性（L21–L132 各题） | 96 | 95 | E8-12「老艺人」无对应（中等） |
| 语法正确性（23 条要点） | 23 | 22 | E8-02「finish / meet 的第三人称单数」部分兑现（轻微） |
| 发音准确性（41 个词条） | 41 | **41 / 41** | 无 |
| **合计** | **160** | **158** | 1 无对应 + 1 部分兑现 |

**发音词条 41/41 全部整词命中**，逐个确认过（fifteen、hobbies、guitar、drawing；playground、maths、afternoon；nurse、driver、flat、grandmother；Hangzhou、Xi'an、silk；badminton、metre、footwork；vegetables、breakfast、rice、milk；dumplings、envelope、Festival、mooncakes；recycling、rubbish、neighbourhood；internet、dictionary、writer、notebook；teacher、patient、hometown；volunteer、railway、village；traditions、dumplings、Dragon Boat Festival）。

**语法要点 22/23 完全兑现**，逐条对过：E8-01 because/although 主谓一致 ✓、E8-03 which means ✓ 与 only 的位置 ✓、E8-04 过去时一致 ✓ 与 had travelled ✓、E8-05 have played vs I run ✓、E8-06 am not fond of ✓ 与 tell me not to ✓、E8-07 hope to learn vs saved ✓、E8-08 which is a real problem ✓、E8-09 is done ✓ 与 where 从句 ✓、E8-10 hope that 呼应 ✓ 与 I need to ✓、E8-11 whom ✓ 与 not only ... but also ✓、E8-12 used to 对照 ✓ 与 named 后置定语 ✓。

**E8-02（L35）部分兑现的细节**：要点写「have / finish / meet 的第三人称单数」，实测作答里

- has ×2（it has a new library / Our school has three clubs）—— 3sg 形式**存在**；
- finish ×1，出现在 Classes begin ... and finish，主语 Classes 是复数，**不取 3sg**；
- meet ×1，出现在 We meet every Friday afternoon，主语 We，**不取 3sg**；
- 全篇 finishes = 0，meets = 0。

即三个被点名的动词里，只有 have 在本题作答中真有第三人称单数形态可供检查。

---

## 7　④ 三处「教学记号」是否会让评分者产生歧义（独立判断）

**先给实测事实：**

| 记号 | 出现在评分要点的行 | 在 12 篇作答里作为独立词出现 | 作为子串出现 |
|---|---|---|---|
| -ing | L23、L93（**两处**，不是一处） | **0 次** | 0 |
| grand | L43 | **0 次** | grandmother / grandparents |
| moth | L43 | **0 次** | grandmother |
| grand-moth-er | L43 | **0 次** | 0 |

**逐个独立判断：**

- **-ing（L23、L93）——低歧义，writer-a 的说法成立。**
  承载词在作答里都存在：L23 点名 guitar / drawing，作答 L19 有 drawing ×2；L93 点名 recycling / rubbish / neighbourhood，作答 L89 有 recycling ×1、rubbish ×2、neighbourhood ×1。而且「词尾 -ing」四个字**自述是语法范畴（词尾）**，不是词。评分者读到 L23 会去看 drawing 的 -ing，不会去找一个叫 -ing 的词。**不会**被读成「点名了某词但作答里没有」。

- **grand-moth-er（L43）——中等格式风险，但实质不是缺陷。**
  被真正考核的词是 grandmother（原句「grandmother 为三个音节」），它在 E8-03 作答 L39 出现，且确实是三音节。**实质兑现。**
  但 grand-moth-er 整串是**全篇唯一一条在 12 篇作答里零字面出现的评分要点字符串**；grand 与 moth 作为独立词也是 0 次，只在 grandmother 内部可作子串找到。如果下游任何交叉核用整词（空白分词）匹配，会把 moth 与 grand 报成缺失。
  → 我判**轻微（格式风险，非缺陷）**：读者凭连字符能读出是音节切分，被考核的词在场。给一条不改语义的备选写法供下一轮取用：写作 grand · moth · er（间隔号），或 grandmother = grand + moth + er，可让整词匹配与人的读法都不歧义。

**结论**：三处教学记号**没有**构成「评分要点点名了某词但作答里没有」。但 L43 的分隔符写法是全篇唯一一处会在自动整词匹配下误报的格式点，值得记一笔。

---

## 8　⑤ 12 题之间是否雷同

**话题域：12/12 互不重复**（个人信息与爱好／校园生活／家庭／旅行／运动／饮食／节日／环境／网络与阅读／理想与计划／志愿服务／传统文化）。本题的主要问题答案是「不同」。

**作答不是「换背景词的同一模板」**：96 条信息完整性命名点逐条对过，无跨题复用；每题的信息点分布实质不同（个人信息 / 校园作息 / 家庭成员职业 / 行程时间线 / 训练量与比赛成绩 / 三餐与蔬菜摄入 / 节日仪式 / 环保行动 / 阅读载体 / 理想与准备 / 志愿服务 / 传统沿革）。

**但骨架有可测的重复**：

- I think 收尾 **7/12**（L19、L29、L69、L89、L99、L119、L129）
- I hope **7/12**（L29、L39、L49、L59、L79、L109、L129）
- not only ... but also 收尾 **2/12**（作答 L89、L119）
- 句数只落在 8 或 9 两档（12 篇仅两档）
- **奶奶作为「手艺传授者」的写法重复**：E8-07（L79：my grandmother makes dumplings / I hope to make mooncakes with my grandmother，grandmother ×2）与 E8-12（L129：My grandmother used to make them by hand, but now she teaches me）；两题也都写到春节（各 ×1）。
- grandmother 合计出现在 **5/12** 篇作答里（E8-01、E8-03、E8-06、E8-07、E8-12）。

→ 判**观察，不判缺陷**。话题域确实不同，正文也不是换背景词的同一模板；单人首批 12 题出现同类修辞与同一意象锚点属常态，不影响可用性。但若后续加量，建议刻意打散「I think 收尾」与「奶奶教手艺」这两个母题。

---

## 9　V 轮独立发现的新问题

### 中等 2 项

**M-1　E8-12 L131：要点点名「老艺人」，作答写的是「an old teacher」**

- 要点（L131）：……班上向老艺人学剪纸
- 作答（L129）：Our class also learned paper cutting from an old teacher last term.
- 实测：作答含 teacher ×1，artist / artisan / folk 均为 0。
- 后果：评分者按要点逐条核对，找不到「老艺人」，会把这一条判未达成，而作答其实没错。这是**评分要点反向惩罚了正确作答**。
- 归类：③ 类问题（要点命名项在作答里不存在）。

**M-2　E8-07 L78 / L79 / L81：题目问「最喜欢的」，作答与要点都没回答**

- 题目（L78）：介绍一个你最喜欢的节日
- 作答（L79）：The Spring Festival is the most important festival in China —— 这是**关于国家的客观事实**，不是说话人的偏好。实测 favourite/favorite 在本篇作答中出现 **0 次**。
- 更关键：作答随后又写 I also like the Mid-Autumn Festival（L79），引入第二个也喜欢的节日，反而让偏好更不明确；全篇再无任何句子确立「最喜欢」。
- 要点（L81）：节日重要性、年前准备、除夕晚餐、守岁、压岁钱用途 —— 「最重要」被改写成了「**重要性**」。于是评分者按要点逐条打分，会拿满「信息完整性」，而说话人从未回答题目真正问的那一问。
- 后果：**评分结果系统性偏松**，且缺口对评分者完全隐形。

### 轻微 6 项

- **m-1　E8-02 L35**：have / finish / meet 的第三人称单数 —— 三个点名动词中只有 have 有 3sg 形态（has ×2）；finish / meet 在本题作答里均不取 3sg，全篇 finishes / meets 为 0。要点点多了两个无实例可查的项。
- **m-2　E8-11 L124**：Still 引出转折，also 引出补充 —— Still 存在（Still, I felt useful）✓；但本篇作答里 also 只出现 **1 次**，且是 not only ... but also 里的后半截（关联词，功能不同），**不存在独立的补充性 also**。对照：E8-02、E8-08、E8-12 都有真正的独立 also（各 ×2）。E8-11 是 12 篇里唯一只有关联性 also 的一篇。
- **m-3　E8-09 L98 / L102**：题目问「网络与纸书的不同」，但评分要点里**没有任何一条考核这个对比**（L102 只写「上网络的习惯与核对方式、阅读的价值」）。作答仅隐含（because it is easier on my eyes）。题目的三分之一从考核中消失。
- **m-4　E8-01 L18 / L21–L22**：题目问「它对你意味着什么」，作答兑现了（L19 收尾），但 96 条信息完整性要点里**没有一条考核它**。
- **m-5　E8-03 L43**：grand-moth-er 全篇唯一零字面出现的评分要点字符串，grand / moth 整词亦为 0（详见第 7 节）。实质已兑现，属格式风险。
- **m-6　E8-04 L48/L52、E8-05 L58/L62**：要点把题目原问改写成了作答恰好有的东西 —— L48「留下了什么」→ L52「喜欢的理由、下年计划」；L58「带给你的变化」→ L62「今年期望、运动的益处」。改写后一致，但题问与所答的落差被掩盖。

### 观察 3 项（不判缺陷）

- **O-1**　三处教学记号均未构成「点名了却没有」；-ing 低歧义，grand-moth-er 有格式风险（第 7 节）。
- **O-2**　话题域 12/12 互异，正文非同一模板；骨架重复与 07/12 的奶奶重叠记为观察（第 8 节）。
- **O-3**　七道闸门中三道对 E8 零证明力（wordcount-gate / verify-bank / shortcut-audit）。这不是 E8 的缺陷，是闸门覆盖面的事实；但它意味着 E8 的质量保证实际只落在 encoding-check 与 sentence-gate 上。

---

## 10　系统性问题：评分要点是照着作答写的，不是照着题目写的

这是本轮最值得下游知道的一条。把第 5 节与第 6 节合起来看，12 题里有 **5 题**的「题目第二问」在评分要点里被换掉或干脆没有：

| 题 | 题目第二问 | 评分要点对应项 | 作答是否兑现 |
|---|---|---|---|
| E8-07 L78 | 你最喜欢的节日 | L81 改写为「节日重要性」 | **未兑现** |
| E8-09 L98 | 网络与纸书的不同 | 无对应项 | 仅隐含 |
| E8-01 L18 | 它对你意味着什么 | 无对应项 | 兑现 |
| E8-04 L48 | 它给你留下了什么 | L52 改写为「喜欢的理由、下年计划」 | 改写后兑现 |
| E8-05 L58 | 它带给你的变化 | L62 改写为「今年期望、运动的益处」 | 改写后兑现 |

即：要点逐条都能在作答里找到（所以 R2 那类「要点点名但作答没有」的查法查不出来），**但要点考核的是作答已经有的东西，而不是题目要求的东西**。

这一类问题 R1 / R2 在结构上查不到：两轮都是「R1 报的缺陷 writer-a 修好了吗」；而「要点与题目是否对齐」必须同时读题目、要点、作答三样，并且先承认作答本身没错，才看得出来。建议后续轮次把「题目第二问 → 要点 → 作答」的三方对照固化成一道常设检查。

---

## 11　修复方向（只给方向，本轮未代改）

| 编号 | 位置 | 建议 | 我的倾向 |
|---|---|---|---|
| M-1 | L131 | 二选一：要点改为「班上向一位老教师学剪纸」，或作答改为 from an old folk artist | **改要点**（teacher 更自然，且与 L135 语法要点无冲突） |
| M-2 | L78 / L79 / L81 | 二选一：题目改为「介绍一个你认为最重要的节日」，或作答补一句明确 favourite | **改题目**（L81「节日重要性」与全文要点命名风格一致，改作答会连带 L81） |
| m-1 | L35 | 删掉 finish 与 meet 只留 have；或改写为「has / finish / meet 的主谓一致」 | 改写为「主谓一致」 |
| m-2 | L124 | 「also 引出补充」改为「not only ... but also 的并列」 | 直接改 |
| m-3 | L102 | 补一条「网络与纸书的对比」，或 L98 题目把「的不同」改为「的使用」 | 补要点 |
| m-4 | L21 | 补一条「爱好对自己的意义」 | 补要点 |
| m-5 | L43 | 改写分隔符为 grand · moth · er，或 grandmother = grand + moth + er | 直接改 |
| m-6 | L52 / L62 | 建议在要点里标注「此处已按作答改写，题目原问为『留下了什么／变化』」，便于回溯 | 加注 |

M-1 与 M-2 均为单行改动，不触及任何作答正文的重写。

---

## 12　未核到

- **官方 12 个话题清单**：本库无来源（L10–L11 自述检索未核到）。本轮未核到，**不作缺陷**。
- **官方评分标准**：L7 / L13 自述官方自 2025 年起不再提供范文与评分标准。本轮未核到，**不作缺陷**。
- **语音层面的实际质量**：L141 列出语音准确性、表达流利度、韵律节奏等评分维度，文本层无法核。本轮**未核到**。第 6 节所有「发音」结论仅限于「要点点名的词是否在作答里存在」，**不涉及实际发音、流利度或韵律的判断**。
- **口试时长 / 语速等本型之外的适用性**：题面无相关规格，未核到。
- **作答在本型之外的复用**（如作为听力材料）：题面未声明用途，未核到。

---

## 13　归档建议

V 判**不通过**，不建议直接进 CL。建议走 **F3 修复 → R3/V' 复核 → CL**：修 M-1、M-2 两行（m-1 至 m-6 可在同一轮一并处理，成本极低）。

修复后请重跑七道闸门，并注意：**修改 E8.md 会改变其 MD5**，届时 check-integrity 会把本报告判为 MISMATCH（这正是它该做的）。新报告需重新记录修复后的 MD5。
