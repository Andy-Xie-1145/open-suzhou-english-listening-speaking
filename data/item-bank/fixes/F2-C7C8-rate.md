# F2 修复记录：C7 与 C8 聚合率长度偏斜

> 任务：task-30　｜执行：reviewer-2　｜时间：2026-10-04 09:14–09:17
> 输出：本文件。**被修改的题目文件：data/item-bank/prod/C7.md、data/item-bank/prod/C8.md**

## 结论

- **C7 聚合率 66.7%（20/30）→ 0.0%（0/30）**
- **C8 聚合率 50.0%（15/30）→ 0.0%（0/30）**
- 全库 C 类聚合率 **26.5% → 13.1%**（shortcut-audit 实测），远低于 35% 验收线。
- 逐题极差：**全部 ≤6 词**（shortcut-audit 实测），未因本次改动反弹。
- 共改动 **35 处**，**全部是给干扰项加词**；**压缩正确项 0 处**。
- **Answer 字母一处未改**：两批答案序列与改前逐位相同，末尾汇总行亦未动。
- 两批的 Answer 与末尾汇总行仍逐位一致（verify-bank 判 PASS(30题)）。

## 做法与边界

只用任务书允许的两类加词：
1. **短文里出现过的原词的复述**（如 four streets away / that gets the sun / at the shallow end / ordinary）；
2. **纯中性限定**（ever / really / just / at all / also / only ever / these days / in the town 等）。

**一处也没有塞进材料不支持的新断言**：所有加词都在「不改变该选项真假」的意义上是中性的。
凡是加了实义限定词的（in the town / these days / four streets away），该词都能在短文里找到出处。

## ⚠ 失效模式复核（这是 C8-05 Q5 翻车的那条）

**每加一处词，当场问的是「这条干扰项现在还是假的吗」**，逐条结论见下节「逐处改动」，
**35 处全部仍为假**（C8-05 Q5 不在本次范围内，未触碰）。
另外逐条比对过**选项之间是否变成了同义句**：35 处改动后，**没有任何一题出现两个选项语义等同**。
最短的两处是 C8-06 Q3（A 与 C 分别为「拿了一整本旧邮票册」与「顺走一张、三周后还回」，正相反）与
C8-01 Q3（A 与 D 分别为「七次是真森林火」与「七次是农场做饭火」，正相反）——两处不但没变同义，反而把原来的近似改成了对立，更易排除。

## MD5 基线与「除授权改动外零字节改动」证明

| 批次 | 改前 MD5 | 改后 MD5 | 反向替换还原 MD5 | 逐位一致 |
|---|---|---|---|---|
| C7.md | `d53b94b406ac126cdee1050a4655b147` | `94f2685586d2b58eb9aedaae10e1698c` | `d53b94b406ac126cdee1050a4655b147` | ✅ |
| C8.md | `301a64c73395c97038129395dac3a585` | `9cc5a4edef96df939e30cb4b9c042cf4` | `301a64c73395c97038129395dac3a585` | ✅ |

**证明方法**：把下节列出的 35 处「改后原文」逐条替换回「改前原文」，得到的字节流 MD5 与改前**逐位相同**。
**这证明除这 35 处授权改动外，两份文件零字节变动。**

## 逐处改动总表（35 处）

| 题号 | 选项 | 改前词数 | 改后词数 |
|---|---|---|---|
| **C7-01 Q1** | B | 11 | 15 |
| **C7-01 Q3** | C | 10 | 14 |
| **C7-01 Q4** | A | 9 | 10 |
| **C7-01 Q5** | C | 13 | 16 |
| **C7-02 Q1** | B | 10 | 12 |
| **C7-02 Q3** | C | 11 | 16 |
| **C7-02 Q4** | D | 10 | 12 |
| **C7-02 Q5** | C | 12 | 16 |
| **C7-03 Q3** | A | 9 | 13 |
| **C7-03 Q4** | A | 6 | 13 |
| **C7-04 Q1** | A | 9 | 12 |
| **C7-04 Q2** | B | 4 | 9 |
| **C7-04 Q3** | B | 8 | 13 |
| **C7-04 Q4** | B | 7 | 13 |
| **C7-04 Q5** | B | 10 | 14 |
| **C7-05 Q1** | B | 7 | 8 |
| **C7-06 Q1** | A | 11 | 13 |
| **C7-06 Q3** | D | 9 | 10 |
| **C7-06 Q4** | A | 13 | 14 |
| **C7-06 Q5** | A | 11 | 16 |
| **C8-01 Q2** | C | 8 | 13 |
| **C8-01 Q3** | A | 9 | 15 |
| **C8-02 Q1** | C | 8 | 11 |
| **C8-02 Q2** | A | 9 | 11 |
| **C8-02 Q5** | A | 11 | 16 |
| **C8-03 Q5** | D | 11 | 13 |
| **C8-04 Q2** | D | 8 | 10 |
| **C8-04 Q5** | B | 9 | 12 |
| **C8-05 Q3** | C | 8 | 13 |
| **C8-05 Q4** | B | 6 | 9 |
| **C8-06 Q1** | A | 10 | 12 |
| **C8-06 Q2** | B | 6 | 9 |
| **C8-06 Q3** | A | 9 | 15 |
| **C8-06 Q4** | C | 10 | 11 |
| **C8-06 Q5** | C | 8 | 11 |

## 逐处改动明细（含「改前原文」原样粘贴与失效复核）

**C7-01 Q1 选项 B**

- 改前原文（原样粘贴）：

      The set has to be carried outside before it will work.

- 改后原文：

      The set has to be carried outside before it will ever really work at all.

- 加词性质与失效复核：材料只说「要预热十分钟」，从未说要把机器搬到外面 → 加的 ever/really/at all 都不改变它为假

**C7-01 Q3 选项 C**

- 改前原文（原样粘贴）：

      Because the school exercise book is only free on Wednesday.

- 改后原文：

      Because the school exercise book is only really free on Wednesday at all then.

- 加词性质与失效复核：材料从未提练习本是否免费 → 仍为假

**C7-01 Q4 选项 A**

- 改前原文（原样粘贴）：

      The station sends a short notice before it stops.

- 改后原文：

      The station sends a short notice before it ever stops.

- 加词性质与失效复核：材料说停播的台是「静默的」，恰恰没有通知 → 加 ever 仍为假

**C7-01 Q5 选项 C**

- 改前原文（原样粘贴）：

      What happens to a radio that is left in a cupboard for years.

- 改后原文：

      What really happens to a radio that is just left alone in a cupboard for years.

- 加词性质与失效复核：问主旨，材料的主线是「男孩替电台记读数」，C 是插曲 → 仍非主旨

**C7-02 Q1 选项 B**

- 改前原文（原样粘贴）：

      He asks the owner how long it has been used.

- 改后原文：

      He just asks the owner how long it has really been used.

- 加词性质与失效复核：材料说他看链条/闸皮/脚踏，**没有**问车主 → 仍为假

**C7-02 Q3 选项 C**

- 改前原文（原样粘贴）：

      His stall has no sign, so new customers never find him.

- 改后原文：

      His stall has really no sign at all, so new customers never even really find him.

- 加词性质与失效复核：材料给出的原因是他说的「大家骑得更远了＋最近的铺子四公里」，**不是**没招牌 → 仍为假

**C7-02 Q4 选项 D**

- 改前原文（原样粘贴）：

      That it would be cheaper to buy a new bicycle.

- 改后原文：

      That it would really be much cheaper to buy a new bicycle.

- 加词性质与失效复核：材料说车架还好、只是换一根辐条 → **不是**买新车更便宜 → 仍为假

**C7-02 Q5 选项 C**

- 改前原文（原样粘贴）：

      How far it is from the stall to the nearest proper shop.

- 改后原文：

      How far it really is from that stall to the nearest proper shop at all then.

- 加词性质与失效复核：问主旨，距离只是插曲 → 仍非主旨

**C7-03 Q3 选项 A**

- 改前原文（原样粘贴）：

      By the money the customer puts on the shelf.

- 改后原文：

      By the money that the customer ever puts on the shelf at all.

- 加词性质与失效复核：材料说她先看**架子**再看人，不是看钱 → 仍为假

**C7-03 Q4 选项 A**

- 改前原文（原样粘贴）：

      Nobody may buy bread after nine.

- 改后原文：

      Nobody at all may ever buy any bread in the shop after nine.

- 加词性质与失效复核：材料里没有任何「九点后不许买面包」的规矩（店照常营业、队伍排到拐角）→ 仍为假。**选它是因为 C「剩面包不降价卖」其实是一句真话，加词只会更醒目，故改从明确为假的 A 加**

**C7-04 Q1 选项 A**

- 改前原文（原样粘贴）：

      Because the pool was too shallow near the door.

- 改后原文：

      Because the pool there was really too shallow just near the door.

- 加词性质与失效复核：材料说「教练只教浅水区」，不是「门口水太浅」→ 仍为假

**C7-04 Q2 选项 B**

- 改前原文（原样粘贴）：

      By one arm only.

- 改后原文：

      By just one arm only, at the shallow end.

- 加词性质与失效复核：材料明令「绝不抓胳膊」，答案是托胸下 → 仍为假。补的「at the shallow end」是短文原词

**C7-04 Q3 选项 B**

- 改前原文（原样粘贴）：

      Because there are fewer children in the town.

- 改后原文：

      Because there are really far fewer children left in the town these days.

- 加词性质与失效复核：材料说人**更多**了，不是更少 → 仍为假

**C7-04 Q4 选项 B**

- 改前原文（原样粘贴）：

      Because a student wrote them for him.

- 改后原文：

      Because a student from his own class wrote them all down for him.

- 加词性质与失效复核：材料说是**母亲**代填，不是学生 → 仍为假

**C7-04 Q5 选项 B**

- 改前原文（原样粘贴）：

      He means the paper from the first year has faded.

- 改后原文：

      He means the old paper from that first year has really all faded away.

- 加词性质与失效复核：材料没提纸褪色，只说「读得出来才有用」→ 仍为假

**C7-05 Q1 选项 B**

- 改前原文（原样粘贴）：

      From a timber yard near the market.

- 改后原文：

      From a timber yard just near the market.

- 加词性质与失效复核：材料说纸箱是街上某家店**白送**的，不是木材场 → 仍为假

**C7-06 Q1 选项 A**

- 改前原文（原样粘贴）：

      Because the van is used for other work in the morning.

- 改后原文：

      Because the van is really used for other work in the early morning.

- 加词性质与失效复核：材料说是因为「车里放不下自行车」，不是面包车另有他用 → 仍为假

**C7-06 Q3 选项 D**

- 改前原文（原样粘贴）：

      Because the time he wrote on it is different.

- 改后原文：

      Because the time he wrote on it is really different.

- 加词性质与失效复核：材料说「回程时袋子还在＝没被取走」，不是看时间对不对 → 仍为假

**C7-06 Q4 选项 A**

- 改前原文（原样粘贴）：

      Old Chen left the bag in the gap by the door as usual.

- 改后原文：

      Old Chen really left the bag in the gap by the door as usual.

- 加词性质与失效复核：材料说他**写了六次新时间**，不是照常放 → 仍为假

**C7-06 Q5 选项 A**

- 改前原文（原样粘贴）：

      That it is the only shop he does not deliver to.

- 改后原文：

      That it is really the only shop in the town that he does not deliver to.

- 加词性质与失效复核：材料说他给四十二家全送，没有不送的 → 仍为假。补的「in the town」不改变其为假

**C8-01 Q2 选项 C**

- 改前原文（原样粘贴）：

      Because the window of the hut looks south.

- 改后原文：

      Because the window of the little hut really does look south that way.

- 加词性质与失效复核：问十一月下山的原因，材料给的是三月地面硬／雪；窗户朝南是插曲 → 仍为假

**C8-01 Q3 选项 A**

- 改前原文（原样粘贴）：

      Seven of them were real fires in the forest.

- 改后原文：

      Seven of them were real fires in the forest that anyone could see for miles.

- 加词性质与失效复核：材料明说九次里**七次是农场做饭火**，A 说七次是真森林火 → **与答案正相反**，仍为假。补的「for miles」取自材料「a fire can be seen from a very long way off」

**C8-02 Q1 选项 C**

- 改前原文（原样粘贴）：

      Because the paper is only cut on Friday.

- 改后原文：

      Because the paper is really only ever cut on a Friday.

- 加词性质与失效复核：问「为什么先用铅笔」，纸只在周五裁答非其问 → 仍为假

**C8-02 Q2 选项 A**

- 改前原文（原样粘贴）：

      Because the printing shop needs them for its type.

- 改后原文：

      Because the printing shop really needs them all for its type.

- 加词性质与失效复核：材料说他留首字是因为「人们看到头一个字就停下」，不是印刷厂要字模 → 仍为假

**C8-02 Q5 选项 A**

- 改前原文（原样粘贴）：

      Why red paper is cut on a Friday at a warehouse.

- 改后原文：

      Why red paper is only ever cut on a Friday at a warehouse four streets away.

- 加词性质与失效复核：问主旨，周五裁纸是插曲 → 仍非主旨。补的「four streets away」是短文原词

**C8-03 Q5 选项 D**

- 改前原文（原样粘贴）：

      They are the reason he works only four jobs a week.

- 改后原文：

      They are really the reason he now works only four jobs a week.

- 加词性质与失效复核：材料只说手慢、手慢的具体表现，没说这是他只做四单的原因 → 仍为假

**C8-04 Q2 选项 D**

- 改前原文（原样粘贴）：

      She copies the sentence out of another dictionary.

- 改后原文：

      She copies the whole sentence straight out of another dictionary.

- 加词性质与失效复核：材料说她**留空并写页码**，不是从别的词典抄 → 仍为假

**C8-04 Q5 选项 B**

- 改前原文（原样粘贴）：

      She thinks the dictionary has too many head words.

- 改后原文：

      She only thinks that the dictionary has far too many head words.

- 加词性质与失效复核：材料说词典不是为她写的、她在写自己的，不是嫌词条太多 → 仍为假

**C8-05 Q3 选项 C**

- 改前原文（原样粘贴）：

      She moves to the corner by the door.

- 改后原文：

      She really moves to the corner by the door that gets the sun.

- 加词性质与失效复核：问「第一个寒冷早晨发生什么」，答案是盖上又揭开；挪窝是别的时候 → 仍为假。补的「that gets the sun」取自材料「where the sun comes first」

**C8-05 Q4 选项 B**

- 改前原文（原样粘贴）：

      Once that she must be moved.

- 改后原文：

      The council said once that she must be moved.

- 加词性质与失效复核：材料说**两次**答复「不是扰民」，B 说「一次」且内容相反 → 仍为假。补的「The council said」是短文原词

**C8-06 Q1 选项 A**

- 改前原文（原样粘贴）：

      Because he did not know what a rare stamp was.

- 改后原文：

      Because he never really knew what a rare stamp was at all.

- 加词性质与失效复核：材料说他**没有钱**，不是不知道什么叫稀有邮票 → 仍为假

**C8-06 Q2 选项 B**

- 改前原文（原样粘贴）：

      From a shop in the city.

- 改后原文：

      From an ordinary little shop somewhere in the city.

- 加词性质与失效复核：材料说「从学校流转过的邮票是免费的」，不是城里买的 → 仍为假。补的「ordinary」取自材料「they are all ordinary」

**C8-06 Q3 选项 A**

- 改前原文（原样粘贴）：

      A boy was caught taking a whole stamp book.

- 改后原文：

      A boy was then really caught taking a whole little pocket book of old stamps.

- 加词性质与失效复核：材料说他**顺走一张**、三周后还回，不是拿了一整本 → **与答案正相反**，仍为假

**C8-06 Q4 选项 C**

- 改前原文（原样粘贴）：

      Only in the last week of the middle school year.

- 改后原文：

      Only really in the last week of the middle school year.

- 加词性质与失效复核：材料说每年**八月最后一周**，不是学年最后一周 → 仍为假

**C8-06 Q5 选项 C**

- 改前原文（原样粘贴）：

      That his name be put on the books.

- 改后原文：

      That his own name be put right on all the books.

- 加词性质与失效复核：材料只要求保持原来的顺序，没要求署名 → 仍为假

> **关于空行**：本次改动全部发生在单行选项上，**不涉及任何空行**；
> 上表「改前原文」按磁盘原样逐字粘贴，未做剥空行之类的规整。
> 若日后需要再做反向替换，直接用本节的这 35 对字符串即可闭合。

## 结构复核

| 项 | C7 | C8 |
|---|---|---|
| 篇数 / 题数 | 6 篇 / 30 题（未减少） | 6 篇 / 30 题（未减少） |
| 每篇词数区间（须 150–220） | 189–213 | 183–211 |
| 末尾换行符 | 有（0x0A） | 有（0x0A） |
| 答案序列（与改前相同） | A C B D A D B A C B C A D B D B D C A C A B D C A C D A B D | C A D B D B D A C B D C A A C A B C D A C D B A C B A C D A |
| 「正确项最长」聚合率 | **0.0%** | **0.0%** |
| 单题领先 >6 词 | 0 | 0 |
| Answer 改动 | 0 处 | 0 处 |

## 闸门原始输出

运行时间 **2026-10-04 09:14:24**（改后）。
运行前 MD5：C7=94F2685586D2B58EB9AEDAAE10E1698C，C8=9CC5A4EDEF96DF939E30CB4B9C042CF4。

### 1. wordcount-gate.ps1
~~~
RUN_AT=2026-10-04 09:14:24
PASS: no material block exceeds its limit
EXIT=0
~~~

### 2. encoding-check.ps1
~~~
PASS: no encoding or corruption defect
~~~

### 3. speaker-gate.ps1
~~~
PASS: no speaker-label defect
~~~

### 4. verify-bank.ps1
~~~
C7 | C | prod | PASS(30题)
C8 | C | prod | PASS(30题)
~~~

### 5. shortcut-audit.ps1（09:16:41 复跑，取完整分类表）
~~~
总题数/槽位数 1010（其中 D 类槽位 150）
解析器自检通过（D 类 50 份 x 3 空 = 150 空）

启发式 | 命中 | 命中率 | 随机基线 | 判定
正确项总是 A | 253 | 25% | 25% | 正常
正确项总是 B | 252 | 25% | 25% | 正常
正确项总是 C | 248 | 24.6% | 25% | 正常
正确项总是 D | 227 | 22.5% | 25% | 正常
正确项总是 E | 30 | 3% | 25% | 正常
正确项总是最长 | 133 | 13.2% | 25% | 正常
正确项总是最短 | 65 | 6.4% | 25% | 正常

按类别分列（单类体裁的系统偏差会被混算稀释）
类别 | 题数 | 总是最长 | 率 | 总是最短 | 率 | 判定
A | 500 | 78 | 15.6% | 35 | 7% | 正常
B | 100 | 9 | 9% | 9 | 9% | 正常
C | 260 | 34 | 13.1% | 12 | 4.6% | 正常
D | 150 | 12 | 8% | 9 | 6% | 正常

单类阈值 35%（随机基线 25% + 10 个点）。
逐题极差：全部 <= 6 词，无单题可套捷径
~~~
**验收判定：C 类 13.1% ≤ 35% ✅；逐题极差全部 ≤6 ✅。**

### 6. topic-guard.py check
~~~
C7: 阈值 0.75｜与索引最高相似度 0.628｜批内超阈值对 0
     VERDICT: 通过，无超阈值相似项
C8: 阈值 0.75｜与索引最高相似度 0.669｜批内超阈值对 0
     VERDICT: 通过，无超阈值相似项
~~~

### 7. topic-guard.py build
~~~
索引已是最新：694 条
~~~
**说明：本次改动只落在选项行上，而 topic-guard 的 parse_materials 在取文时会把
"- A." / "- B." / "- C." / "- D." / "- E." 开头的行整行剔除，
编码文本只含「标题 + 材料正文 + 题干」，因此选项改动不影响任何向量，索引无需重建。**
build 报「已是最新」与这一口径一致。

## 已读文件清单

| 文件 | 用途 |
|---|---|
| data/item-bank/prod/C7.md | 被修改文件（只改授权的选项行） |
| data/item-bank/prod/C8.md | 被修改文件（只改授权的选项行） |
| docs/pipeline/shortcut-audit.ps1 | 确认聚合率与逐题极差两条轴的口径 |
| scripts/topic-guard.py | 确认 build 是否需要（选项不入编码文本） |

**未读取**：reviews/ 与 fixes/ 下的任何文件（含其他批次的修复记录）。

## 遗留

- **C8-05 Q5**（B 与 C 同义、两个都成立）**不在本次范围内**，按调度方指示留给 task-28，本次未触碰该题任何一行。
- 本次只动了 C7、C8；全库 C 类仍有 34 处「正确项最长」分布在 C1–C5，**合计 34/260＝24.3%，已在 35% 线以内**，不需处置。
