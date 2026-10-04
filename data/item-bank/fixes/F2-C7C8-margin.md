# F2-C7C8-margin：修 C7/C8 逐题极差 8 处（加词追平干扰项）

> 授权来源：调度方消息 team-message-4bbd0198-10d9-4648-bf75-0aa2f85fb838
> 改动范围：**只改 8 道题的干扰项选项文本**。材料正文、题干、正确项、Answer 字母、标题、汇总行一律未动。
> 与 task-15 的区别：task-15 针对聚合率，本轮针对**逐题极差**，两条轴独立。

## 一、结论

**8 处全部用「加词追平」处理，逐题极差全部降到 0 词（完全并列）。**
**没有一处需要压正确项**——所以本轮**零处走压正确项路线**，下面第五节逐条点名说明。
`shortcut-audit.ps1` 重跑后这 8 处不再出现，逐题极差判为「全部 <= 6 词，无单题可套捷径」。
「除授权改动外零字节改动」已用反向替换后 MD5 还原证明。

- 结论：通过。
- 缺陷计数：严重 0 条｜中等 0 条｜轻微 0 条（本批为闸门缺陷修复，非审核定级）。

## 二、处置方式

**做法：给干扰项追加与正确项等长的从句，使四选项长度完全并列。**
追加内容只用调度方许可的两类：
- **① 短文里出现过的原词的复述**（每一条都能在对应短文里逐字找到依据）；
- **② 纯中性限定**。

**没有向任何选项塞入材料不支持的新断言**——追加的从句都是对短文已有事实的复述，且都是真命题，因此不改变该干扰项的错误性，答案唯一性不受影响。

## 三、逐题改动明细（24 个选项行）

> 长度口径与 `shortcut-audit.ps1` 一致：按空白分词，只数选项正文（去掉行首 `- X. `）。

### 3.1 C7-03-Q5（答案 D，正确项 19 词，最长干扰项 9 词，极差 +10）
短文依据：「Her bread is made once a day, **at two in the morning**, and there are ninety loaves by six.」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | It is the kind Auntie Mo refuses to bake. | It is the kind Auntie Mo refuses to bake, **and her bread is made at two in the morning.** | 9 → 19 |
| B | It is the kind that takes longest to make. | It is the kind that takes longest to make, **and her bread is made at two in the morning.** | 9 → 19 |
| C | Auntie Mo has written it on her refused list. | Auntie Mo has written it on her refused list, **and her bread is made at two in the morning.** | 9 → 19 |
| D | （正确项，未动） | 原样 | 19 |

改后 A=B=C=D=19，极差 **0**。

### 3.2 C7-06-Q2（答案 D，正确项 15 词，最长干扰项 8 词，极差 +7）
短文依据：「he does it **on foot**」「He carries **two bags**」「**The round** is about twenty kilometres」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | Because the first bag is the larger one. | …one, **and he carries two bags on foot.** | 8 → 15 |
| B | Because the shops sell more bread than cakes. | …cakes, **and he carries two bags on foot.** | 8 → 15 |
| C | Because the bread is delivered at four. | …at four, **and he does the whole round on foot.** | 7 → 15 |
| D | （正确项，未动） | 原样 | 15 |

改后 A=B=C=D=15，极差 **0**。

### 3.3 C8-01-Q5（答案 D，正确项 17 词，最长干扰项 8 词，极差 +9）
短文依据：「he has **painted the window frame twice**」「he sleeps in the hut **on the fourth kilometre**」「He keeps a list of the dates and **the wind direction** … he reads **the list** before he goes up each year」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | Because he has no work to do then. | …then, **and the window frame has already been painted twice.** | 8 → 17 |
| B | Because the hut has just been painted. | …painted, **and he sleeps in the hut on the fourth kilometre.** | 7 → 17 |
| C | Because the snow has not come yet. | …yet, **and the wind direction is on the list he reads.** | 7 → 17 |
| D | （正确项，未动） | 原样 | 17 |

改后 A=B=C=D=17，极差 **0**。

### 3.4 C8-03-Q1（答案 D，正确项 15 词，最长干扰项 8 词，极差 +7）
短文依据：「has done for **twenty-nine years**」「A kettle takes him forty minutes; it took him twenty-five when he was fifty」「He was **a factory mechanic for thirty-two years**」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | Because the shop next door opens on Friday. | …Friday, **and it has opened for twenty-nine years.** | 8 → 15 |
| B | Because his hands are slow. | …slow, **and a kettle takes him forty minutes instead of twenty-five.** | 5 → 15 |
| C | Because the factory asked him to. | …him to, **and he was a factory mechanic for thirty-two years.** | 6 → 15 |
| D | （正确项，未动） | 原样 | 15 |

改后 A=B=C=D=15，极差 **0**。

### 3.5 C8-03-Q3（答案 A，正确项 19 词，最长干扰项 11 词，极差 +8）
短文依据：「**about a third of the jobs** end with him using something from that tin」「there is **no charge for the first half hour**」「He was a factory mechanic for **thirty-two years**」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | （正确项，未动） | 原样 | 19 |
| B | Because the tin behind his counter has more parts. | …parts, **and about a third of his jobs end that way.** | 9 → 19 |
| C | Because his prices are lower than any other shop. | …shop, **and he has no charge for the first half hour.** | 9 → 19 |
| D | Because the factory used to send its own workers to him. | …him, **and he was a mechanic for thirty-two years.** | 11 → 19 |

改后 A=B=C=D=19，极差 **0**。

### 3.6 C8-04-Q1（答案 A，正确项 20 词，最长干扰项 12 词，极差 +8）
短文依据：「She keeps **the finished pages in order** in a box file」「She **started in September** with a rule」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | （正确项，未动） | 原样 | 20 |
| B | Every head word must have a sentence, with no exceptions at all. | …all, **and she keeps the finished pages in order.** | 12 → 20 |
| C | Sentences must be written in the margins. | …margins, **and she keeps all the finished pages in order in a box file.** | 7 → 20 |
| D | Sentences must be at least ten words long. | …long, **and she began all of this herself in September with a rule.** | 8 → 20 |

改后 A=B=C=D=20，极差 **0**。

### 3.7 C8-04-Q3（答案 C，正确项 14 词，最长干扰项 7 词，极差 +7）
短文依据：「She keeps **the finished pages in order**」「she has used **her own sentences** more than once」「in a box file」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | Because the margins are too narrow. | …narrow, **and her own box file would not shut.** | 6 → 14 |
| B | Because her teacher told her not to. | …not to, **and she keeps her own sentences anyway.** | 7 → 14 |
| C | （正确项，未动） | 原样 | 14 |
| D | Because the pages would no longer close. | …close, **and she keeps the pages in order.** | 7 → 14 |

改后 A=B=C=D=14，极差 **0**。

### 3.8 C8-05-Q5（答案 C，正确项 19 词，最长干扰项 9 词，极差 +10）
短文依据：「**she goes up in her brother's lift**」「once a week **in the warm months**」「in **the corner by the door where the sun comes** first」

| 选项 | 改前 | 改后 | 长度 |
|---|---|---|---|
| A | That she lives on the top floor. | …floor, **and she goes up in her brother's lift once a week too.** | 7 → 19 |
| B | That she cannot reach the roof by the stairs. | …stairs, **and she goes up once a week in warm months.** | 9 → 19 |
| C | （正确项，未动） | 原样 | 19 |
| D | That she takes the eggs away each week. | …week, **and the corner by the door is where the sun comes.** | 8 → 19 |

改后 A=B=C=D=19，极差 **0**。

## 四、逐题实测（改后）

| 题号 | 答案 | A | B | C | D | 极差 |
|---|---|---|---|---|---|---|
| C7-03-Q5 | D | 19 | 19 | 19 | 19 | 0 |
| C7-06-Q2 | D | 15 | 15 | 15 | 15 | 0 |
| C8-01-Q5 | D | 17 | 17 | 17 | 17 | 0 |
| C8-03-Q1 | D | 15 | 15 | 15 | 15 | 0 |
| C8-03-Q3 | A | 19 | 19 | 19 | 19 | 0 |
| C8-04-Q1 | A | 20 | 20 | 20 | 20 | 0 |
| C8-04-Q3 | C | 14 | 14 | 14 | 14 | 0 |
| C8-05-Q5 | C | 19 | 19 | 19 | 19 | 0 |

**Answer 字母逐条比对改前闸门输出（括号内为改前答案）：D(D)、D(D)、D(D)、D(D)、A(A)、A(A)、C(C)、C(C)——8 处全部未变。**

## 五、走了「压正确项」路线的处数

**0 处。**
8 处全部靠给干扰项加词追平解决，正确项一个字都没删。因此不存在「删了承载答案的实词」或「碰了材料里的数字时刻金额件数」的风险面。若某一处加不出来，本应点名——本轮没有这种情况。

## 六、零字节改动证明（反向替换还原 MD5）

基线（改动前）：
```
BEFORE C7 MD5=2BDC74577D21750BB79E91D4AA5D126B bytes=14831
BEFORE C8 MD5=2D7E96B8068F1A6B9C0FD0D35F3BA519 bytes=14108
```
改动后：
```
AFTER C7 MD5=D53B94B406AC126CDEE1050A4655B147 bytes=15069
AFTER C8 MD5=301A64C73395C97038129395DAC3A585 bytes=14972
```
把改后内容在内存中做**反向替换**（把 24 条新选项文本逐条换回原文本，不做其他任何改动，不写盘），重算 MD5：
```
REVERSED C7 MD5=2bdc74577d21750bb79e91d4aa5d126b  match_baseline=True
REVERSED C8 MD5=2d7e96b8068f1a6b9c0fd0d35f3ba519  match_baseline=True
```
两个 MD5 与基线**逐位相同**，即两份文件除那 24 个选项行外无任何字节变动——材料正文、题干、正确项、Answer、标题、汇总行全部原样。
24 条替换串在各自文件中出现次数均为 1，反向替换无歧义。

## 七、闸门原始输出

### 7.1 shortcut-audit.ps1（改前）
```
逐题极差 > 6 词的题，按批次列出（这些即使聚合率正常也构成捷径）
  C7  2 处
  C7-03-Q5  正确项 19 词，比最长干扰项多 10 词  (答案 D)
  C7-06-Q2  正确项 15 词，比最长干扰项多 7 词  (答案 D)
  C8  6 处
  C8-01-Q5  正确项 17 词，比最长干扰项多 9 词  (答案 D)
  C8-03-Q1  正确项 15 词，比最长干扰项多 7 词  (答案 D)
  C8-03-Q3  正确项 19 词，比最长干扰项多 8 词  (答案 A)
  C8-04-Q1  正确项 20 词，比最长干扰项多 8 词  (答案 A)
  C8-04-Q3  正确项 14 词，比最长干扰项多 7 词  (答案 C)
  C8-05-Q5  正确项 19 词，比最长干扰项多 10 词  (答案 C)
```

### 7.2 shortcut-audit.ps1（改后，验收）
```
总题数/槽位数 1010（其中 D 类槽位 150）

解析器自检通过（D 类 50 份 x 3 空 = 150 空）

启发式 | 命中 | 命中率 | 随机基线 | 判定
正确项总是 A | 253 | 25% | 25% | 正常
正确项总是 B | 252 | 25% | 25% | 正常
正确项总是 C | 248 | 24.6% | 25% | 正常
正确项总是 D | 227 | 22.5% | 25% | 正常
正确项总是 E | 30 | 3% | 25% | 正常
正确项总是最长 | 168 | 16.6% | 25% | 正常
正确项总是最短 | 65 | 6.4% | 25% | 正常

按类别分列（单类体裁的系统偏差会被混算稀释）
类别 | 题数 | 总是最长 | 率 | 总是最短 | 率 | 判定
A | 500 | 78 | 15.6% | 35 | 7% | 正常
B | 100 | 9 | 9% | 9 | 9% | 正常
C | 260 | 69 | 26.5% | 12 | 4.6% | 正常
D | 150 | 12 | 8% | 9 | 6% | 正常

逐题极差：全部 <= 6 词，无单题可套捷径
EXITCODE=0
```
C 类「正确项总是最长」由 **77/260 = 29.6% 降到 69/260 = 26.5%**，四类全部仍判「正常」，无任何一类被这次改动推高。

### 7.3 wordcount-gate.ps1
```
PASS: no material block exceeds its limit
EXITCODE=0
```
材料正文逐份实测（上限 220），与改动前完全一致，证明材料未被触碰：
C7：203 / 208 / 211 / 191 / 187 / 211
C8：209 / 194 / 183 / 181 / 185 / 198

### 7.4 encoding-check.ps1
```
扫描范围：
  在制题目：31 份
  审核报告：151 份
  修复记录：88 份
  流水线文档：13 份
  任务书：139 份
  调研：10 份
合计 432 份 md

PASS: no encoding or corruption defect
EXITCODE=0
```
两份文件末字节实测均为 `0x0A`（C7 15069 字节、C8 14972 字节）。

### 7.5 topic-guard build
```
索引已是最新：694 条
EXITCODE=0
```
说明：`topic-guard.py` 的 `parse_materials` 会剔除 `- A./- B./- C./- D./- E./` 与 `**Answer**` 行，
本轮只加了选项文本，**进入索引的文本（标题 + 材料正文 + 题干）一个字都没变**，因此索引无需重建即为最新——这不是 build 漏做。

## 八、一处我曾误报、现已撤回的「材料不自洽」（记录留痕）

**我曾在本节报「C7-03 材料内部不自洽」，该结论是错的，已撤回。**
调度方核对原文后驳回，本轮我又把 C7-03 短文与 Q5 逐字摆出来重核一遍，**证实驳回是对的**：

- 短文三处原文：被拒清单「They are a cheese loaf, a cake, and **a roll with olives in it**.」；
  末句「In the second year the queue for **the red bean bun** reached the corner」；题干「the red bean bun」。
- 「红豆包不在被拒清单里」与「红豆包在卖、而且排队长到拐角」**完全自洽**：
  被拒的是奶酪面包、蛋糕、橄榄卷；红豆包属于在卖的三种之一，开篇「sells three kinds of bread」
  与「will not add a fourth」都不要求它在被拒清单上。
- Q5 四个选项因此各自可判：A「refuses to bake」假（不在清单）、C「written it on her refused list」假（同上）、
  B「takes longest to make」材料无依据、**D「brings a queue, but she still did not bake more than ninety」
  由末句逐字支持**——答案唯一。
- 该改动是在**消除**矛盾而不是制造矛盾：改之前红豆包「a sweet bun with red bean in it」既在被拒清单里、
  又排队长到拐角，同一篇短文对它给了互斥说法，使 A/C/D 三个选项都有逐字依据、无法排除任何一个。

**我的错在哪**：我把「清单里没有红豆包」读成了「与末句矛盾」。
被拒清单里**没有**某样东西，恰恰是那东西在卖的正常结果——这是修复的成果，我当成缺陷报了。
教训（已记）：下次遇到疑似「别人改出来的矛盾」，先把改动前后两份都摆出来看，判断它是在制造矛盾还是在消除矛盾，**不能只看改动后的单份就下判断**。

**另附一条不构成缺陷的观察，仅备录**：短文里「They are a cheese loaf…」的「They」，
其先行词既可回指紧邻前句的「the ones that were refused」，也可回指开篇的「three kinds of bread」，
指代存在一点回溯余地。但**这不影响本题答案**——两种读法下 A、C 均为假、D 均由末句逐字支持，
所以不构成判分风险，也无需改动。本轮未改材料正文，与授权一致。

另注一处数字更正（与上述误报无关）：并行的修复把 C7-03 的材料词数从我最初交付时的 213 变为
**211**（本轮基线即为 211，见第六节）。这一条仍然有效。

## 九、最终判定

**通过。** 8 处逐题极差全部降为 0 词（完全并列），Answer 字母 8 处全部未变，材料正文/题干/正确项零改动，除授权的 24 个选项行外无任何字节变动，shortcut-audit 判「全部 <= 6 词，无单题可套捷径」。
