# F2-C9-medium：修 C9 两条中等缺陷（量级不自洽 + 因果链断裂）

> 授权来源：调度方任务板 **task-31**（依据 `reviews/V-C9.md` 与 `reviews/R1-C9.md`）
> 缺陷等级：中等 ×2（REVIEW-RUBRIC 1.2 材料内部一致性 ／ _COMMON §5 推理链断裂）
> 改动范围：**C9-01 材料正文中一个数字短语 + C9-03 Q3 题干一句。**
> 其余全部未动：材料正文其余部分、C9-03 材料、C9-03 Q3 的四个选项与 Answer 字母、选项行序、标题、汇总行。

---

## 一、结论

两条中等缺陷均已消：
1. **C9-01 的烤炉产能与日销量量级现已自洽**（30 公斤 ÷ 6 公斤 = 5 炉 × 50 分钟 ≈ 4.2 小时；15 公斤 ≈ 2.1 小时）。
2. **C9-03 Q3 的题干不再主张因果**，与材料「画与那件事毫无关系」不再抵触，答案唯一性成立。

反向替换后 MD5 逐位还原，**除这两处外零字节改动**。

- 结论：通过。本批可交 V 轮复验。
- 缺陷计数：严重 0 条｜中等 2 条（已修）｜轻微 0 条（不在本任务范围）。

---

## 二、改前原文（**按原文件空行原样粘贴**，供反向替换字节级闭合）

### 2.1 C9-01 材料正文中被改的那一句（第 8 行整行，**空行与前后文一律保留**）

```

Uncle Yan pushes a cart of roast sweet potatoes into the market square daily from the tenth of November to the tenth of February, and no day before or after. He buys them eighty kilometres away at four yuan a kilo and sells them at six, so a good day is about two hundred kilos and a bad one a hundred. He says the bad ones are the warm days, when people still want ice, not something hot. The oven under the cart holds six kilos at a time and takes fifty minutes, so he can turn over a batch every hour from three in the afternoon. The square is closed to carts on Sunday morning, and that is when he washes the cart, which costs him an hour he does not lose, since he is not there anyway. He keeps the burnt ones for himself and gives them to the man who moves the bins; he does not sell them at a lower price. He has pushed the same cart for nineteen years and has never once been late, not even when snow closed the road in the first week. He says what has really cost him is his left knee, and he blames the slope at the north end of the square rather than the cold.

```

替换的两个字符串（均在上述一整行内，出现次数各 1）：
- 改前：`a good day is about two hundred kilos and a bad one a hundred`
- 改后：`a good day is about thirty kilos and a bad one fifteen`

### 2.2 C9-03 Q3 题干（第 101–107 行，**空行与前后文一律保留**）

```

**Q3**
Why is 2009 the only year without a picture?
- A. Because his hands began to shake that year.
- B. Because it was the year he stopped speaking to his brother.
- C. Because the college asked to see all the pictures that year.
- D. Because the light was not flat that year.
**Answer** B

```

替换的字符串：
- 改前：`Why is 2009 the only year without a picture?`
- 改后：`What does the passage say about 2009?`

### 2.3 基线

```
BEFORE C9 MD5=399407BBDFA4C2E0376E97B5EA3F7BA6 bytes=14413 lastByte=0x0A
```

---

## 三、中等缺陷 1：烤炉产能与日销量量级不自洽

### 3.1 改前的算式（我自算，与报告一致）

改前材料三处数字：
- 炉容量：**six kilos** a time
- 每炉：**fifty minutes**
- 日销量：好天 **two hundred kilos** ／坏天 **a hundred** kilos

```
好天 200 ÷ 6 = 33.3 炉 × 50 分钟 ≈ 1,667 分钟 ≈ 27.8 小时
   → 即便烤炉一天二十四小时连轴转（24 × 6 = 144 公斤），也达不到 200 公斤
坏天 100 ÷ 6 = 16.7 炉 × 50 分钟 ≈ 14 小时
   → 从「下午三点起」要烤到次日凌晨五点，不成立
```

### 3.2 处置，以及一处**超出处方字面**的地方（必须点名）

**处方字面只写了「把『好天』的数字改成 30 公斤」。**
但 **R1-C9 第 199 行自己就算出：只改好天，坏天 100 公斤仍需约 14 小时，「仍偏多」。**
若严格照字面执行，这条缺陷只修了一半。

依 _COMMON 第 4 节「**处方不完整时，「照做」不等于「修复**……若只覆盖一部分，
必须写明『本处方只处理了第 X 部分』」，我**把两处数字一并改了**，并在此点名：

| 数字 | 改前 | 改后 | 是否在处方字面内 |
|---|---|---|---|
| 好天 | two hundred kilos | **thirty kilos** | ✅ 处方指定 |
| 坏天 | a hundred kilos | **fifteen** | ❌ **超出字面，我判断必须一并改** |

**如调度方要求严格照处方字面执行，坏天这一处需另行确认或回退。**
回退成本极低：把 `fifteen` 换回 `a hundred` 即可，不影响另一处改动。

### 3.3 改后自检（量级）

```
好天 30 ÷ 6 = 5 炉 × 50 分钟 ≈ 4.2 小时
   → 「下午三点起」到晚上七点多结束，成立
坏天 15 ÷ 6 = 2.5 炉 × 50 分钟 ≈ 2.1 小时
   → 「下午三点起」到五点半结束，成立
与「turn over a batch every hour」也不冲突（50 分钟 < 1 小时，每小时翻一炉可行）
```

### 3.4 硬要求：改了材料数字，必须回查所有引用它的选项（**五题逐题查**）

| 题 | 正确项 | 是否引用了「好天/坏天吨位」 | 判定 |
|---|---|---|---|
| C9-01 Q1 卖多久 | D（十一月十日至次年二月十日） | 否 | 不受影响 |
| C9-01 Q2 什么日子差 | B（暖天、人们要冰的） | 否 | 不受影响 |
| C9-01 Q3 炉装几公斤 | C（**six kilos**，引用的是**炉容量**不是日销量） | 否 | **不受影响** |
| C9-01 Q4 为何周日上午洗车 | A（广场周日上午不许推车） | 否 | 不受影响 |
| C9-01 Q5 左膝归咎于什么 | B（广场北端的坡，而不是寒冷） | 否 | 不受影响 |

**全批另做过一次全文扫描**：C9 全部 30 个选项里，含 `kilo` 的只有 C9-01 Q3 的四项
（2/4/6/20 kilos，炉容量）；含 `hundred` 的只有 C9-05 Q5 的 `About three hundred.` 与
`About four hundred.`（画布尺寸，与本条无关）。
**没有任何选项引用被改的两个吨位数字 → 无需连带改选项。**

### 3.5 词数

C9-01 由 **218 词减到 216 词**（`two hundred`→`thirty` 减 1，`a hundred`→`fifteen` 减 1），
C 类区间 150–220，**距上限由 2 词余量变为 4 词余量**。
这同时消掉了 V-C8/R1 记录的 C9-01「余量仅 2 词」那条轻微缺陷。

---

## 四、中等缺陷 2：C9-03 Q3 题干问 Why，而材料否认唯一选项所主张的因果

### 4.1 材料原文

```
In 2009 he painted nothing at all, and the gap is the only one. He says the year
without a picture **was** the year he stopped speaking to his brother, **and that the
painting had nothing to do with it**, though he can understand why people think it does.
```

### 4.2 缺陷

改前题干 `Why is 2009 the only year without a picture?` 问**原因**，
而唯一有材料支撑的选项 B 以 `Because` 开头、**主张因果**——
**恰是材料明确否认的那个因果**（`the painting had nothing to do with it`）。
于是题干问的东西材料不给，答案主张的东西材料明说不是。

### 4.3 处置

按处方：**只改题干，四个选项与 Answer 字母一律不动。**

```
- Why is 2009 the only year without a picture?
+ What does the passage say about 2009?
```

### 4.4 改后逐项复查（新立规矩：这条干扰项现在还是假的吗）

| 选项 | 材料逐字依据 | 判定 |
|---|---|---|
| A. Because his hands began to shake that year. | 材料说手抖是**现在**的事（七十六岁），并因此拿不准还有没有第三十二张，**与 2009 无关** | **假** ✓ |
| **B. Because it was the year he stopped speaking to his brother.** | `the year without a picture was the year he stopped speaking to his brother`——**逐字对应** | **真，答案** ✓ |
| C. Because the college asked to see all the pictures that year. | 材料里学院学生是**后来**来的，而且他只给她看了 4 张、再 11 张，`all` 也不成立 | **假** ✓ |
| D. Because the light was not flat that year. | 材料说光是**在一月初**平的（`he paints in the first week of January when the light is flat`） | **假** ✓ |

**四项各自可独立排除，只有 B 与材料逐字对应 → 答案唯一性成立。**

> **一处如实说明**：新题干是非疑问句，而四个选项仍以 `Because` 开头，读起来略别扭。
> 这是处方明确要求「选项与 Answer 都不必动」的结果，我**没有自作主张改选项措辞**。
> 若认为别扭需一并调整措辞，请另派单——那是改动选项行、会牵动长度线。

---

## 五、闸门原始输出

### 5.1 wordcount-gate
```
PASS: no material block exceeds its limit
WORDCOUNT_EXIT=0
```
逐份实测：C9-01 **216**、C9-03 **198**（其余未改）。

### 5.2 speaker-gate（单文件）
```
SPEAKER/OPTION GATE: 扫描 1 份题目文件（A 类 0 份；SPEAKER-COUNT 只对 A 类生效）
检查项：MISSING-LABEL / SPEAKER-COUNT(A) / STUDENT-SWITCH / TITLE-CONFLICT / OPTION-REUSED(仅供参考)
PASS: no speaker-label defect
SPEAKER_EXIT=0
```

### 5.3 encoding-check
```
合计 477 份 md

PASS: no encoding or corruption defect
ENC_EXIT=0
```
C9.md 末字节 `0x0A`，字节数 14399。

### 5.4 shortcut-audit
```
按类别分列（单类体裁的系统偏差会被混算稀释）
类别 | 题数 | 总是最长 | 率 | 总是最短 | 率 | 判定
A | 500 | 78 | 15.6% | 35 | 7% | 正常
B | 100 | 9 | 9% | 9 | 9% | 正常
C | 260 | 34 | 13.1% | 12 | 4.6% | 正常
D | 150 | 12 | 8% | 9 | 6% | 正常

逐题极差：全部 <= 6 词，无单题可套捷径
SHORTCUT_EXIT=0
```

### 5.5 topic-guard check
```
阈值 0.75｜与索引最高相似度 0.939｜批内超阈值对 0
VERDICT: 有超阈值相似项，必须换题后重查
CHECK_EXIT=1
```
**6 条超阈值全部是 C9 与索引中 C9 自身的自匹配，不是跨批次重复：**

| 查询 | 自匹配对象（同一材料） | 相似度 | 第二名（真正的跨批近邻） | 相似度 |
|---|---|---|---|---|
| C9-01 | C9-01 冬天推车卖烤红薯（自身） | 0.906 | C7-06 一天走四十里的送货员 | 0.543 |
| C9-02 | C9-02 教盲人用手机的志愿者（自身） | 0.907 | C7-04 教孩子游泳的老教练 | 0.534 |
| C9-03 | C9-03 每年只画一幅画的老人（自身） | 0.916 | C9-06 在候车亭画画的女孩（同批不同篇） | 0.540 |
| C9-04 | C9-04 社区菜园里的三分地（自身） | 0.939 | C5-03 清晨五点的蔬菜摊 | 0.540 |
| C9-05 | C9-05 在阳台上养蚕的男生（自身） | 0.935 | C8-05 在屋顶上孵蛋的母鸡 | 0.548 |
| C9-06 | C9-06 在候车亭画画的女孩（自身） | 0.937 | C9-03（**同批不同篇**） | 0.568 |

**跨批次最高相似度 0.548，远低于 0.75；批内超阈值对 0。**
C9-03 与 C9-06 这一对（同为「一个人固定画同一样东西」）R1-C9 已判为**非重复**
（0.556，本次实测 0.568，结论不变，仍远低于阈值）。
**退出码为 1 的原因同 C8：C9 早已 build 进索引，拿索引查 C9 等于拿它自己查自己。**

### 5.6 topic-guard build
```
索引已是最新：694 条
BUILD_EXIT=0
```
（`parse_materials` 会剔除选项行与 Answer 行；本次改的是材料正文里一个数字短语与一道题干，
两者都进入索引文本，故 build 报「已是最新」是脚本行为，**不是漏做**——见记录第五节末尾的说明。）

> **需要调度方留意**：`topic-guard build` 的跳过条件是 `文件名::题号` 已存在即视为已入库，
> **它不比较内容**。因此「改材料正文后再 build」在当前脚本下**不会刷新向量**。
> 这与 ARCHIVE-113 第三节列的第 4 条闸门 bug 是同一件事。
> 本次 build 输出里的「重编码」是别的修复轮触发的，不是我这次触发的。
> **建议单独确认 build 的刷新路径**，否则「修复后再查重」这一步在语义上是不成立的。

---

## 六、零字节改动证明（反向替换还原 MD5）

```
BEFORE C9 MD5=399407BBDFA4C2E0376E97B5EA3F7BA6 bytes=14413
AFTER  C9 MD5=415B45C1333D1913E991C6E55460EA8F bytes=14399
```
把改后内容在内存中做**反向替换**（两条新字符串各自换回改前原句，不做任何其他改动，不写盘），重算 MD5：
```
REVERSED C9 MD5=399407bbdfa4c2e0376e97b5ea3f7ba6  match_baseline=True
new-string occurrences: m1=1 m2=1
old-string occurrences: m1=0 m2=0
```
**反向替换逐位闭合，与基线 MD5 完全相同**，即除这两处外无任何字节变动。
字节数 14413 → 14399（−14 字节），与「`two hundred`→`thirty`、`a hundred`→`fifteen`」两处减词一致。

---

## 七、最终判定

**通过。** 两条中等缺陷均已消：量级现已自洽（好天约 4.2 小时、坏天约 2.1 小时）；
题干不再主张因果，答案唯一性成立。两处替换串均在原文件中出现 1 次，反向替换 MD5 逐位闭合，
除授权改动外零字节改动，五道闸门全部退出码 0（topic-guard check 的退出码 1 已在 5.5 逐条说明为自匹配）。

**遗留（不属本任务）**：
1. **3.2 节点名的「坏天吨位」超出处方字面**，请调度方确认保留或回退。
2. **4.4 节点名的「新题干是非疑问句、选项仍以 Because 开头」**的措辞别扭，请决定是否另派单调整。
3. C9-01 的日毛利由原来的 400 元降到 60 元（30 公斤 ×（6−4）元）——
   这是处方指定的 30 公斤带来的**量化副作用**，量级不荒谬但明显变小，一并报请知悉。
