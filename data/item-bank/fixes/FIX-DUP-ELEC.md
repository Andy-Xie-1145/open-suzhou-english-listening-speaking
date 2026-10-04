# FIX-DUP-ELEC：处置 A12-11 ↔ A16-04 真重复（改 A16 端）

> 授权：task-45｜被裁决为**全库唯一一对真重复**（两轮独立测量 0.761 / 0.752，两名审核员独立判读）
> 记录人：writer-bcd｜修复日期见文件时间

## 一、结论

**已改 A16 端。** A16-04 的考点由「在电费单上定位正确的那个数」整体换成
「**按衣物材质选择洗涤程序**」，**新考点不再是读账单找数**。
改完单题过语义闸门：**退出码 0，与索引最高相似度 0.658 < 0.70**，**A12-11 已不在 top-3**。

## 二、替换清单（**反证可自行重跑**）

**只改 data/item-bank/prod/A16.md 一个文件、一个 `## A16-04` 块，共 12 行整块替换。**
文件内其余 14 段、题号、Answer 字母、末尾汇总行**一律未动**。

**改前原文（整块，供反向替换）**：

```
## A16-04 本月用了多少度电
**Dialogue**
Boy: Mr. Song, here is our electricity bill. It says ninety yuan this month.
Mr. Song: Read the top line. We used two hundred degrees, not one hundred.
Boy: Last month it was only sixty yuan. Did we forget the lights?
Mr. Song: Yes. Switch off the lamp in the hall before you sleep tonight.
**Question**
How much electricity did the family use this month?
- A. One hundred degrees.
- B. One hundred and fifty degrees.
- C. Two hundred degrees.
- D. Three hundred degrees.
**Answer** C
```

**改后原文（整块）**：

```
## A16-04 羊毛衫要选冷水档
**Dialogue**
Boy: Ms. Guo, my shirt is wool. Which program shall I choose?
Ms. Guo: Not the thirty-degree cotton one. Wool needs the cold program.
Boy: How long does the cold program take?
Ms. Guo: Fifty minutes. The quick one is only fifteen, and that is not enough for wool.
Boy: Then I shall dry it flat, not in the machine.
**Question**
Which program does Ms. Guo tell the boy to use?
- A. The thirty-degree cotton program.
- B. The quick fifteen-minute program.
- C. The cold program for wool.
- D. The spin-only program.
**Answer** C
```

**重跑闭合的方法**：把上面的「改后原文」整块（12 行，含 `## A16-04` 那一行与末尾的 `**Answer** C`）
替换回「改前原文」整块，然后重算 MD5，应得基线值。

## 三、基线与闭合（实测）

```
BEFORE  data/item-bank/prod/A16.md  MD5=67EB48E21CFD9B556C2BD58E4E40A04A  bytes=7838  lastByte=0x0A
AFTER   data/item-bank/prod/A16.md  MD5=FC12BB4066C01790CFA10BC5FC7E0A51  bytes=7880  lastByte=0x0A
REVERSED(按第二节的替换清单反向替换后重算) = 67EB48E21CFD9B556C2BD58E4E40A04A   match_baseline=True
```

**反向替换逐位闭合，与基线完全相同 → 除该 12 行外，A16.md 无任何字节变动。**
文件大小 7838 → 7880（+42 字节），与整块替换的长度差一致。

## 四、为什么换这个考点（不复用电费单）

| | A12-11（保留端） | A16-04（改后） |
|---|---|---|
| 题干问什么 | 本月电费多少钱 | 羊毛衫该用哪个洗涤程序 |
| 解题动作 | **在账单上定位正确的那个数** | **按材质匹配到对应程序** |
| 是否做乘法 | 否（材料直接给出 240） | 否 |
| 答案形态 | 金额 | 程序名称 |

**关键**：两者现在连「解题动作」都不同了——一个是读数定位，一个是条件匹配。
**不是把 200 度换成 300 度**（那只会把相似度原样留在 0.75 附近）。

## 五、语义闸门原始输出

**单题过闸（把 A16-04 一行喂给 check，避开自匹配）**：

```
[查询 1] A16-04 羊毛衫要选冷水档 Boy: Ms. Guo, my shirt is wool. Which program shall I choose? 
    0.658  A13-15     A13.md         新衬衫怎么洗
    0.611  A11-14     A11.md         先甩干再拿到阳台晾
    0.593  A10-12     A10.md         干洗大衣多少钱

阈值 0.75｜与索引最高相似度 0.658｜批内超阈值对 0
VERDICT: 通过，无超阈值相似项（已排除已定性的假阳性）
EXIT=0
```

**要求达成**：退出码 **0** ✓｜最高相似度 **0.658 < 0.70** ✓｜**A12-11 不在 top-3** ✓

> **为什么用单题过闸而不是整批**：A16 已 build 进索引，整批 check 会让每一题都匹配到**它自己**（0.9 以上），
> 退出码必然是 1，那是**自匹配不是重复**。单题喂入查的是它**与全库其他题**的关系，才是这一对要问的问题。

## 六、结构复算（不采信任何既有记录）

| 检查项 | 实测 | 判定 |
|---|---|---|
| A16-04 词数 | **60 词**，A 类上限 60 | 通过（**恰好贴线，零余量**） |
| A16 全批词数 | 37–60，**0 条超限** | 通过 |
| 逐份词数 | 01=52 02=37 03=53 **04=60** 05=55 06=57 07=53 08=54 09=54 10=54 11=56 12=56 13=56 14=51 15=55 | — |
| 编号连续性 | 15 段，01–15 连续无缺号无重号 | 通过 |
| 题数比 | Answer 行 15 ÷ 段数 15 ＝ 1 | 通过 |
| 选项数 | 选项行 60 ＝ 15×4 | 通过 |
| 答案序列 | **B C A C D B C A C A D B A C B**（**与改动前逐位相同**） | — |
| 周期检测 | p=1…7 全部不成立 | 通过 |
| 最长连跑 | 1 | 通过 |
| 四字母齐备 | A=4、B=4、C=5、D=2 | 通过 |
| 末尾汇总行 | 与 15 条 Answer 行逐位一致 | 通过 |
| 末尾换行 | 末字节 0x0A | 通过 |

**答案字母刻意保持 C 未变**，因此末尾汇总行与 1.8 排列**完全不受影响**，改动面最小。

## 七、其余闸门（时间戳 2026-10-04 11:30:26）

| 闸门 | 结果 |
|---|---|
| wordcount-gate | `PASS: no material block exceeds its limit`　EXIT=0 |
| encoding-check | 合计 500 份 md，`PASS: no encoding or corruption defect`　EXIT=0 |
| shortcut-audit | A 类 79/500＝15.8%「正常」；逐题极差全部 ≤6；EXIT=0 |
| topic-guard build | 重编码 2 条，总计 694 条；EXIT=0 |

## 八、已读文件清单

| 文件 | 用途 | 授权 |
|---|---|---|
| data/item-bank/prod/A16.md | 被改文件（只改了 A16-04 一块） | 任务 |
| data/item-bank/prod/A12.md | **只读了 A12-11 那一块**，用于确认保留端考点 | 任务书指明的一对 |
| docs/pipeline/DUP-ADJUDICATION.md | 追加「已处置」一行 | 任务书指定 |
| docs/pipeline/TOPIC-GUARD.md | 查重阈值与判读纪律 | 归档条件之一 |

**未修改**：A12.md（保留端一个字节没动）与任何其他题目文件。

## 九、结论

**通过。** A12-11 ↔ A16-04 这一对全库唯一真重复已处置：改 A16 端，新考点为「按材质选洗涤程序」，
**不再读账单找数**；单题过语义闸门退出码 0、最高 0.658 < 0.70；A16.md 除授权的 12 行外零字节改动，反向替换 MD5 逐位闭合。
