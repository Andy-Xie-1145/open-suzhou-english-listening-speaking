# 复核报告：prod/D6.md 第 3 轮（V-D6，F2 之后首次独立复核）

> 本报告全部数字由复核员自写脚本在 `prod/D6.md` 上重算。**R1-D6、R2-D6 与修复方 F2 的任何自证数字一律不采信**，
> 只把它们当作「待验证的声明」逐条回原文核对。缺陷编号一律加 `V-` 前缀，与 R1 的 M-x / L-x、R2 的 M-x / L-x 互不冲突。
> **本轮只读**：`prod/D6.md` 在写报告前后各测一次 MD5，均为 `00020e950da31144daf8233abef3c1c7`，未被改动一个字节。

---

## 0. 字节级前置校验（_COMMON §1）

| 项 | 值 |
|---|---|
| 被复核文件 | `data/item-bank/prod/D6.md` |
| 字节数（`[System.IO.File]::ReadAllBytes`） | **13,791** |
| 行数（`[System.IO.File]::ReadAllLines`） | **209** |
| MD5（字节流计算） | **`00020e950da31144daf8233abef3c1c7`** |
| 字符数（`ReadAllText`） | 12,724 |
| 文件以换行符结尾 | 是（末尾字节 = 227,128,130,10） |
| 两种读法比对 | **一致**（字节流与逐行读取无差异，UTF-8 解码无替换字符） |
| **基线对照** | 任务书 V-D6.md 记载基线 = **13,791 字节 / MD5 `00020e95…`** → **当前完全一致，未变化** |
| 上一份报告基线对照 | R2-D6.md 记载基线 = 13,790 字节 / MD5 `4724fa27beeef42a43cb8ae9af7c8156` → **已变化**。**这是预期状态**：F2 改了第 172 行的一个词 |

> **对任务书「13,790 是还原态」这句提醒的确认**：任务书说 13,790 是反向套用还原态的值。实测确认——
> R2-D6 记录的正是 13,790 / `4724fa27…`（F2 之前），当前磁盘是 13,791 / `00020e95…`（F2 之后）。
> **拿 13,790 去对改后文件会误判**，任务书这条提醒成立。

---

## 1. 结论

- **复核对象**：`data/item-bank/prod/D6.md`，D 类表格填空，10 份 / 30 空。
- **覆盖方式**：**30 空逐空判定，零抽样**；10 份材料的体裁标记、词库、答案序列、表格行列、词数、材料数字全部脚本实测。
- **缺陷计数**：**严重 0 条｜中等 1 条｜轻微 10 条**（合计 11 条）。
- **是否通过**：**不通过**。
- **能否归档**：**不可归档**。唯一阻塞项是本轮独立发现的 **V-M1（D6-06 同句内部矛盾）**，改动 **1 个词**（`We` → `He`）、不影响任何答案与词数。
- **能否进入修复环节**：**可以**。D 类硬结构完好，无结构级返工风险。
- **是否可进入下一环节**：**否**。

### 1.1 任务书四个重点核查项的直接回答

| 重点核查项 | 答案 |
|---|---|
| **1. M-6 真的解开了吗？** | **解开了。** 第 172 行现文为 `W: Who from our school entered?`。**一所中学同时有八年级与九年级完全合理**，Nina（Grade Eight）与 Emma（Grade Nine）同框不再冲突。对问句的回答：一所学校同时有八年级和九年级，合理。**但改动留下一处新的轻微张力**，见 **V-L10**。 |
| **2. 上一轮的修复有没有在别处留下痕迹？** | **D6-09 内部没有。** 年级、班级、组别、规则句、日期、项目五者互不冲突，逐句核验见 §4。**但 D6-09 之外有一处本轮新发现的内部矛盾（D6-06，V-M1）**，它**不是** F2 造成的（F2 只动了第 172 行一个词），而是 R1 版就已存在、R2 记为 L-6 并判轻微、本轮复核员**改判为中等**——理由见 §10。 |
| **3. D 类硬结构是否仍然完好？** | **完好。** 每份词库 A–E 各一次 ✓、恰 2 个干扰项（全批 20 个）✓、30 空命中 **30 条互异短语** ✓、A–E 五字母全批 **各 6 次、无陷阱字母** ✓、空数 ÷ 份数 = **30 ÷ 10 = 3** ✓、**10 张表逐份 3 行 = 3 空（D6-10 无回退）** ✓、**10 张表逐份 5 列** ✓、**结构标记 Passage × 5 + Dialogue × 5，逐份与实际体裁相符** ✓。 |
| **4. 词数逐份复算** | **121 到 183**，实测区间与任务书一致，全部 ≤ 200。零余量块：**无**（最紧余量 17 词，D6-09）。 |
| **5. 答案序列** | **五项全过**（详见 §7），周期检测覆盖 **p = 1…15（全部 ≤ 长度一半的周期）**，**无一为严格周期**。 |
| **6. 30 个空逐空判定** | **30 空全判**，逐空结论见 §9。 |
| **7. 三个闸门原始输出** | 见 §2，原样粘贴。 |

### 1.2 门禁与自检的真实状态

| 门禁 / 检查项 | 结论 | 复核员实测 |
|---|---|---|
| 词数门禁 `wordcount-gate.ps1` | **PASS（退出码 0）** | 原始输出见 §2.1；逐份 121–183，全部 ≤ 200 |
| 零余量块 | **无** | 最紧余量 = D6-09 的 **17** 词；最大余量 = D6-03 的 **79** 词 |
| 答案一致性 `verify-bank.ps1` | **ALL CONSISTENT** | D6 行：`D类 Answers行=10 槽位=30`（全库 27 个批次，答案序列不一致 **0** 个） |
| 批次完整性 `check-integrity.ps1` | **通过**（两次实测，见 §2.3） | **第一次**（本报告落盘前）D6 = MISMATCH，属预期：R2-D6 记 `4724fa27…` vs 当前 `00020e95…`，差值即 F2 的改动。**第二次**（本报告落盘后）D6 = **MATCH**，比对对象变为 `V-D6.md`，报告记录与当前实测同为 `00020e950da31144daf8233abef3c1c7` |
| 结构比（空数 ÷ 份数 = 3） | **通过（30 ÷ 10 = 3.0000）** | 10 份逐份 3 空，无一份例外 |
| 编号连续 | **通过** | D6-01…D6-10 连续，无缺号、无重号 |
| 词库规则（5 项 / A–E / 恰 2 干扰项） | **通过** | 10 份逐份实测均为 `ABCDE`，干扰项逐份恰 2，全批 50 条 |
| 短语全批唯一 | **通过** | 50 条归一化后精确重复 **0** 组；去大小写与标点后 **0** 组；再去冠词 the/a/an 后 **0** 组；**30 条答案短语互异 30 条** |
| A–E 五字母全批都被用作答案 | **通过** | **A×6 B×6 C×6 D×6 E×6**，合计 30，**无固定陷阱字母** |
| 答案序列周期性 **p = 1…15** | **通过** | **无一为严格周期**；最长前缀连续匹配 11/26（p=4），详见 §7.1 |
| 前后半段是否互为重复 | **通过** | 前 15 = `ACBDAEBCDEBACED`，后 15 = `AECDBECDAEABBDC`，**不相同** |
| 最长连续相同 | **通过（要求 ≤ 2）** | **最长 2**（字母 B，0 基下标 26–27），全序列仅此一处；**无 3 连及以上** |
| 逐空位置偏斜（阈值 70%） | **通过** | 三位置最高频均 **20.0%**；闭卷盲猜 **6/30 = 20.00%** |
| 跨份首句归一化互异 | **通过** | **10/10 互异，重复首句 0 处**（含 D6-09 的切分伪影说明，见 §8.1） |
| 跨份全文 Jaccard ≥ 0.6 | **通过（命中 0 对 / 45 对）** | 词集口径最高一对 D6-02~D6-04 = **0.2466**；bigram 口径最高一对 D6-04~D6-08 = **0.0734** |
| 材料内话轮/句子两两雷同 ≥ 0.6 | **通过（命中 0）** | 10 份共 **107** 个句/话轮单位，两两比对 **0 命中** |
| 表格列数批内一致 | **通过** | 10 张表表头与全部 30 个表体行实测**一律 5 列**，与文件头 L5 的声明一致 |
| 行数与空数一致 | **通过（D6-10 无回退）** | 10 份逐份表体 **3 行**，空数 3 |
| 结构标记与体裁相符 | **通过** | **Passage × 5 + Dialogue × 5**；逐份比对实际体裁，**0 处不符** |
| 材料数字逐个复算 | **通过** | 10 份全部数字与表格逐格对照一致，见 §8.4 |
| 汇总行自洽（L209） | **通过，无虚报** | 10 份的 `①X②Y③Z` 与 Answers 行**逐份一致**；声明的 A×6…E×6 与实测一致；声明的 30÷10=3 与实测一致 |
| 无元数据区块 / 无过程记录 | **通过** | 以 `#` 开头的行共 **11** 行 = L1 批次标题（_COMMON §4 允许）+ 10 行 `## D6-0X` 题号标题。**无自检表、无考点对照表、无统计块**；HTML 注释块 **0** 个；正文**无中文** |

---

## 2. 必跑门禁原始输出（原样粘贴，未转述）

### 2.1 `docs/pipeline/wordcount-gate.ps1`

命令（工作区根目录执行，全库扫描，无路径参数）：`pwsh -Command "& docs/pipeline/wordcount-gate.ps1"`
退出码：**0**

```
PASS: no material block exceeds its limit
```

### 2.2 `docs/pipeline/verify-bank.ps1`

```
批次 | 类 | 位置 | 一致性
------------------------------------------------------------------------------------------------
A-batch0 | A | bank | 无汇总行可比对(20题)
A1 | A | bank | 无汇总行可比对(15题)
A2 | A | bank | 无汇总行可比对(15题)
A3 | A | bank | 无汇总行可比对(15题)
A4 | A | bank | 无汇总行可比对(15题)
A5 | A | bank | 无汇总行可比对(15题)
A6 | A | bank | 无汇总行可比对(15题)
B-batch1 | B | bank | 无汇总行可比对(16题)
B2 | B | bank | 无汇总行可比对(12题)
B3 | B | bank | PASS(12题)
C-batch1 | C | bank | 无汇总行可比对(40题)
C2 | C | bank | PASS(25题)
C3 | C | bank | PASS(25题)
C4 | C | bank | PASS(25题)
D-batch1 | D | bank | D类 Answers行=10 槽位=30
D4 | D | bank | D类 Answers行=10 槽位=30
D5 | D | bank | D类 Answers行=10 槽位=30
E-batch1 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
E2 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
E3 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
E4 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
A7 | A | prod | PASS(15题)
A8 | A | prod | PASS(15题)
B4 | B | prod | PASS(12题)
B5 | B | prod | PASS(16题)
C5 | C | prod | PASS(25题)
D6 | D | prod | D类 Answers行=10 槽位=30
共 27 个批次；答案序列不一致 0 个。
ALL CONSISTENT
```

退出码：**0**。D6 行 `D类 Answers行=10 槽位=30`，与我自数的 10 份 / 30 空一致。
> 与 R2-D6 粘贴的同一输出相比，本轮全库批次数由 **25 → 27**（新增 A8、B5），D6 行**逐字未变**。按 _COMMON §2 的并发条款，这是并发写入造成的时间差，**不记 D6 的缺陷**。

### 2.3 `docs/pipeline/check-integrity.ps1`

**按 _COMMON §2c 的明文裁定说明**：本节脚本由复核员运行，其中 `check-integrity.ps1` 会读取 `reviews/` 目录以提取报告里记录的 MD5。
_COMMON §2c 明确「子代理若要运行它，可以运行，并在报告里说明这是闸门而非人工阅读」。
**本轮对 `reviews/` 的人工阅读范围仅限任务书点名的 R1-D6.md 与 R2-D6.md 两份，未读任何第三份。**

该脚本在本轮跑了**两次**（本报告写入前后各一次），两次原始输出**全部原样粘贴**。

**第一次（写本报告之前；此时 `reviews/V-D6.md` 尚不存在，脚本能找到的 D6 最新报告是 R2-D6.md）**：

```
批次 | 最新报告 | MD5 取值来源 | 报告记录 | 当前实测 | 判定
--------------------------------------------------------------------------------------------------------------
A-batch0 | CL-A0.md | 强匹配(同行含题目名) | 84294453f09b6c771d4e1811c32db955 | 84294453f09b6c771d4e1811c32db955 | MATCH
A1 | CL-A1.md | 强匹配(同行含题目名) | 3456291bc77f1591567a5abc70d58651 | 3456291bc77f1591567a5abc70d58651 | MATCH
A2 | CL-A2.md | 强匹配(同行含题目名) | 9ed274f7ce7f776f51e32c62d4d7e66b | 9ed274f7ce7f776f51e32c62d4d7e66b | MATCH
A3 | CL-A3.md | 强匹配(同行含题目名) | 09b07c9645f238be1a9800faaa522822 | 09b07c9645f238be1a9800faaa522822 | MATCH
A4 | CL-A4.md | 强匹配(同行含题目名) | 4aa8b4e681b41d04037519839ac831c5 | 4aa8b4e681b41d04037519839ac831c5 | MATCH
A5 | CL-A5.md | 强匹配(同行含题目名) | 1c447628a0a2f43d2094043985e102d4 | 1c447628a0a2f43d2094043985e102d4 | MATCH
A6 | V-A6-2.md | 强匹配(同行含题目名) | fd253df7ce7707b441ab3150dca03d2e | fd253df7ce7707b441ab3150dca03d2e | MATCH
B-batch1 | CL-B1.md | 强匹配(同行含题目名) | e8f9a056e92f08ef674aa8ef1208b97d | e8f9a056e92f08ef674aa8ef1208b97d | MATCH
B2 | V-B2.md | 弱匹配(同行含MD5字样) | dc026cb8896c79c9fdd2a05368f7080f | dc026cb8896c79c9fdd2a05368f7080f | MATCH
B3 | V-B3.md | 强匹配(同行含题目名) | c7d464c36eb87c45433de4c48adf3101 | c7d464c36eb87c45433de4c48adf3101 | MATCH
B4 | V-B4-3.md | 强匹配(同行含题目名) | 1308ca2c79888055bed8b7c401481af2 | 1308ca2c79888055bed8b7c401481af2 | MATCH
C-batch1 | CL-C1.md | 强匹配(同行含题目名) | 64cff9f8641294e705987a8a5ea3e825 | 64cff9f8641294e705987a8a5ea3e825 | MATCH
C2 | V-C2.md | 弱匹配(同行含MD5字样) | 3b982f8178487ccd62cde60a9acb07ca | 3b982f8178487ccd62cde60a9acb07ca | MATCH
C3 | CL-C3.md | 弱匹配(同行含MD5字样) | 8bb924d4fca02a7a56e5dfa5a689f211 | 8bb924d4fca02a7a56e5dfa5a689f211 | MATCH
C4 | V-C4.md | 强匹配(同行含题目名) | 26393da22fdb0dd7416257c900c9e5b9 | 26393da22fdb0dd7416257c900c9e5b9 | MATCH
D-batch1 | CL-D1.md | 强匹配(同行含题目名) | ed4c8caca3f7c1b9b7fc8a93be0931e6 | ed4c8caca3f7c1b9b7fc8a93be0931e6 | MATCH
D4 | V-D4.md | 强匹配(同行含题目名) | b7d3890cdad4d9814152cc28f5f36b90 | b7d3890cdad4d9814152cc28f5f36b90 | MATCH
D5 | V-D5-2.md | 强匹配(同行含题目名) | 8a0a6b635e1abb0dc25f648c89f6c39a | 8a0a6b635e1abb0dc25f648c89f6c39a | MATCH
E-batch1 | V-E1.md | 强匹配(同行含题目名) | 755cdaa11a3180a139f9c60785c771c7 | 4f646824063dfb9710c1126e66d93992 | MISMATCH
E2 | V-E2.md | 弱匹配(同行含MD5字样) | 4fa6a952a62ef5a0c4d844363fa03ff8 | 4fa6a952a62ef5a0c4d844363fa03ff8 | MATCH
E3 | V-E3.md | 强匹配(同行含题目名) | 68de79335398971da12ff7eadd582cca | 68de79335398971da12ff7eadd582cca | MATCH
E4 | V-E4-3.md | 强匹配(同行含题目名) | 6f07851bd1aa514e2b4953b044f17192 | 6f07851bd1aa514e2b4953b044f17192 | MATCH
A7 | R2-A7.md | 弱匹配(同行含MD5字样) | 85c0edad35bd6cbd91defb44fd39fa34 | eeb1e0a39a93b94a3f9a5c3263bce892 | MISMATCH
A8 | - | - | - | - | 无报告
B5 | - | - | - | - | 无报告
C5 | R2-C5.md | 弱匹配(同行含MD5字样) | cfef0de21015fc5c92e836edca9d3ff2 | c33a384bc3f93842a043adf77a44a7d2 | MISMATCH
D6 | R2-D6.md | 强匹配(同行含题目名) | 4724fa27beeef42a43cb8ae9af7c8156 | 00020e950da31144daf8233abef3c1c7 | MISMATCH
总计 27 个批次；需关注 4 个。
```

进程退出码：**1**。

**D6 的 MISMATCH 如何解读**：**属预期，不是缺陷。** R2-D6 记录的是 F2 之前的 `4724fa27…`，磁盘上是 F2 之后的 `00020e95…`，两者本就应该不同。它恰好证明「F2 已落盘」。
第一次运行中的另 3 个需关注项（E1、A7、C5）**均不属本批**，按角色隔离我不作判断。

**第二次（写完本报告之后再跑一次，用于确认本报告记录的 MD5 正确）**：

```
批次 | 最新报告 | MD5 取值来源 | 报告记录 | 当前实测 | 判定
--------------------------------------------------------------------------------------------------------------
A-batch0 | CL-A0.md | 强匹配(同行含题目名) | 84294453f09b6c771d4e1811c32db955 | 84294453f09b6c771d4e1811c32db955 | MATCH
A1 | CL-A1.md | 强匹配(同行含题目名) | 3456291bc77f1591567a5abc70d58651 | 3456291bc77f1591567a5abc70d58651 | MATCH
A2 | CL-A2.md | 强匹配(同行含题目名) | 9ed274f7ce7f776f51e32c62d4d7e66b | 9ed274f7ce7f776f51e32c62d4d7e66b | MATCH
A3 | CL-A3.md | 强匹配(同行含题目名) | 09b07c9645f238be1a9800faaa522822 | 09b07c9645f238be1a9800faaa522822 | MATCH
A4 | CL-A4.md | 强匹配(同行含题目名) | 4aa8b4e681b41d04037519839ac831c5 | 4aa8b4e681b41d04037519839ac831c5 | MATCH
A5 | CL-A5.md | 强匹配(同行含题目名) | 1c447628a0a2f43d2094043985e102d4 | 1c447628a0a2f43d2094043985e102d4 | MATCH
A6 | V-A6-2.md | 强匹配(同行含题目名) | fd253df7ce7707b441ab3150dca03d2e | fd253df7ce7707b441ab3150dca03d2e | MATCH
B-batch1 | CL-B1.md | 强匹配(同行含题目名) | e8f9a056e92f08ef674aa8ef1208b97d | e8f9a056e92f08ef674aa8ef1208b97d | MATCH
B2 | V-B2.md | 弱匹配(同行含MD5字样) | dc026cb8896c79c9fdd2a05368f7080f | dc026cb8896c79c9fdd2a05368f7080f | MATCH
B3 | V-B3.md | 强匹配(同行含题目名) | c7d464c36eb87c45433de4c48adf3101 | c7d464c36eb87c45433de4c48adf3101 | MATCH
B4 | V-B4-3.md | 强匹配(同行含题目名) | 1308ca2c79888055bed8b7c401481af2 | 1308ca2c79888055bed8b7c401481af2 | MATCH
C-batch1 | CL-C1.md | 强匹配(同行含题目名) | 64cff9f8641294e705987a8a5ea3e825 | 64cff9f8641294e705987a8a5ea3e825 | MATCH
C2 | V-C2.md | 弱匹配(同行含MD5字样) | 3b982f8178487ccd62cde60a9acb07ca | 3b982f8178487ccd62cde60a9acb07ca | MATCH
C3 | CL-C3.md | 弱匹配(同行含MD5字样) | 8bb924d4fca02a7a56e5dfa5a689f211 | 8bb924d4fca02a7a56e5dfa5a689f211 | MATCH
C4 | V-C4.md | 强匹配(同行含题目名) | 26393da22fdb0dd7416257c900c9e5b9 | 26393da22fdb0dd7416257c900c9e5b9 | MATCH
D-batch1 | CL-D1.md | 强匹配(同行含题目名) | ed4c8caca3f7c1b9b7fc8a93be0931e6 | e339b8d8dccc5fdac400975b0b8c994b | MISMATCH
D4 | V-D4.md | 强匹配(同行含题目名) | b7d3890cdad4d9814152cc28f5f36b90 | cb57267d77d0d41c5c04f5dec3bdf238 | MISMATCH
D5 | V-D5-2.md | 强匹配(同行含题目名) | 8a0a6b635e1abb0dc25f648c89f6c39a | 8a0a6b635e1abb0dc25f648c89f6c39a | MATCH
E-batch1 | V-E1-3.md | 强匹配(同行含题目名) | 4f646824063dfb9710c1126e66d93992 | 4f646824063dfb9710c1126e66d93992 | MATCH
E2 | V-E2.md | 弱匹配(同行含MD5字样) | 4fa6a952a62ef5a0c4d844363fa03ff8 | 4fa6a952a62ef5a0c4d844363fa03ff8 | MATCH
E3 | V-E3.md | 强匹配(同行含题目名) | 68de79335398971da12ff7eadd582cca | 68de79335398971da12ff7eadd582cca | MATCH
E4 | V-E4-3.md | 强匹配(同行含题目名) | 6f07851bd1aa514e2b4953b044f17192 | 6f07851bd1aa514e2b4953b044f17192 | MATCH
A7 | V-A7.md | 强匹配(同行含题目名) | eeb1e0a39a93b94a3f9a5c3263bce892 | eeb1e0a39a93b94a3f9a5c3263bce892 | MATCH
A8 | R1-A8.md | 强匹配(同行含题目名) | 80c5bf87dda15d1025eec32b762da8c3 | 685026ae9914fdfde48d471e791dd81b | MISMATCH
B5 | R1-B5.md | 强匹配(同行含题目名) | 0137683f92723187a08244576fbde4bd | 5b9082504fac8ad09f7d910ab9294391 | MISMATCH
C5 | R2-C5.md | 弱匹配(同行含MD5字样) | cfef0de21015fc5c92e836edca9d3ff2 | c33a384bc3f93842a043adf77a44a7d2 | MISMATCH
D6 | V-D6.md | 强匹配(同行含题目名) | 00020e950da31144daf8233abef3c1c7 | 00020e950da31144daf8233abef3c1c7 | MATCH
总计 27 个批次；需关注 5 个。
```

进程退出码：**1**。

- **D6 行已翻转为 `MATCH`**，比对对象变成 `V-D6.md`：报告记录 `00020e950da31144daf8233abef3c1c7` = 当前实测 `00020e950da31144daf8233abef3c1c7`。
  **这直接验证了本报告 §0 的基线数字与磁盘一致，也验证了本报告的结论对当前磁盘版本成立。**
- **两次之间非本批的行发生翻转**（E1、A7 由 MISMATCH 转 MATCH；A8、B5 由「无报告」变为有报告但 MISMATCH；D-batch1、D4 由 MATCH 转 MISMATCH；C5 保持 MISMATCH）。
  按 _COMMON §2 的并发条款，这是**其他批次并发写入造成的时间差**，**D6 行是唯一需要判读的行，其判定变化有明确且可解释的原因**（本报告落盘），不记任何批次的缺陷。
- **归档前提醒**：**若 V-M1 修复后 `prod/D6.md` 的 MD5 再变，本报告的结论对它即失效，必须再补一轮复核**；届时 check-integrity 会把 D6 判回 MISMATCH。

---

## 3. 重点核查项一：M-6 是否真的解开了

**方法**：回到第 169–189 行原文，逐句重读，不引用 R2 的描述。

- **第 172 行现文（实测原文）**：

  > `W: Who from our school entered?`

  **确认：F2 确实把 `our class` 改成了 `our school`，只改了这一个词。** 与任务书描述一致，全批未发现第二个改动点。
- **任务书追问：「一所学校同时有八年级和九年级，合理吗？」**
  **合理。** 一所中学（初中部）本来就同时设八年级与九年级，问句范围由「班」放宽到「校」之后，
  Nina（Grade Eight，L173）与 Emma（Grade Nine，L175）同框是**同一所学校里的两个年级**，不再是矛盾。
  材料本身未把三人称作同班同学，L172 之后也再无任何句子暗示三人同班。
- **判定**：**R2-D6 的中等缺陷 M-6 已解开。**

---

## 4. 重点核查项二：D6-09 整段重新复看（不抽样）

任务书要求「把 D6-09 那一整段的正文重新读一遍，确认年级、班级、组别、规则句之间没有别的冲突」。以下为**逐项核验**。

**正文原文（L171–L175，实测）**：

> **L171** M: Ms. Hu at the district office opened the sign-up for the calligraphy competition on 5 November, and the last day was 12 November. Her table has five columns: the name, the group, the event, the day the form arrived, and where the form came from. The event is written out in full, and the day before the month. **Grade Nine students can enter only the senior group, and Grade Eight students only the junior group.**
> **L172** W: **Who from our school entered?**
> **L173** M: **Jack entered the senior group** and chose hard-pen writing. He sent his form on the first day, 5 November, through the school office. **Nina chose brush writing, but she is only in Grade Eight, so she entered the junior group**; her mother sent the form from her office on 9 November.
> **L174** W: What about Emma?
> **L175** M: **Emma is in Grade Nine**, and she chose hard-pen writing and sent her form on the very last day, 12 November, from the community centre where she studies. The office ran an English handwriting event too, but only for students from three other schools.

**表格（L177–L181）与词库（L183–L187）**：

| Name | Group | Event | Day the form arrived | Where the form came from |
|---|---|---|---|---|
| Jack | senior | ① | 5 November | the school office |
| Nina | junior | ② | 9 November | her mother's office |
| Emma | ③ | hard-pen writing | 12 November | the community centre |

A. brush writing｜B. senior｜C. junior｜D. English handwriting｜E. hard-pen writing　　**Answers：① E　② A　③ B**

### 4.1 六个维度的冲突排查

| 维度 | 正文证据 | 表格 / 答案 | 冲突？ |
|---|---|---|---|
| **年级（Grade）** | Nina = Grade Eight（L173）；Emma = Grade Nine（L175）；Jack 年级**未交代** | Jack 的 Group = senior 为**给定格** | **否。** 未交代年级的 Jack 其 Group 是给定的，不构成推导，不产生矛盾。 |
| **班级（Class）** | **本份材料全文未出现任何班级信息** | Group 列是「senior / junior」，**不是班级**；表格无 Class 列 | **否。** 无「班级」这一维度可冲突。R2 记录的「our class 口径问题」正是本轮已由 F2 解开的那一处。 |
| **组别（Group）** | 规则句（L171）：Grade Nine → **only** senior；Grade Eight → only junior。Nina = Eight → junior（L173，与表内给定格 junior 一致 ✓） | Emma 行 = ③ = **B = senior** | **否。** Emma = Grade Nine ⇒ senior，链条完整且唯一。 |
| **规则句本身** | 「can enter **only** the senior group」用排他措辞单向锁定 | 要得出 C（junior），学生必须**先推翻材料明写的规则句** | **否。** 规则句与 L173、L175 无任何相反陈述。 |
| **项目（Event）** | Jack = hard-pen writing（L173）；Nina = brush writing（L173）；Emma = hard-pen writing（L175）；English handwriting **只面向另外三所学校**（L175） | ① = E = hard-pen writing；② = A = brush writing | **否。** D 被「only for students from three other schools」明确排除。 |
| **日期** | 开放 **5 November** → 最后一天 **12 November**（L171）；Jack「the first day, 5 November」；Nina 9 November；Emma「the very last day, 12 November」 | 5 / 9 / 12 November | **否。** 三处日期与开放日、截止日全部吻合。 |

### 4.2 结论

**D6-09 内部：年级、班级、组别、规则句、项目、日期六个维度全部自洽，无新冲突。**
**任务书重点核查项 2 的答复：D6-09 内部没有留下新痕迹。**

**但 F2 的改动在 D6-09 内留下了一处新的轻微张力（V-L10）**：问句问的是 `our school`，而 L175 说 Emma 的表格交自我 `from the community centre **where she studies**`。
读法甲（Emma 是本校九年级生，社区中心只是报名点/练字处）与读法乙（Emma 在社区中心就读，故不算 our school）并存，材料未消除。
**不影响任何空的唯一性**（③ 只依赖「Emma is in Grade Nine」+ 规则句，与 Emma 的就读单位无关），故记轻微。见 §10。

---

## 5. D 类硬结构专项（任务书重点核查项 3）

| 检查项 | 要求 | 复核员实测（10 份逐份） | 结论 |
|---|---|---|---|
| 词库字母 | 每份 A–E 各一次，不多不少 | 10 份逐份实测均为 `ABCDE`，无重复、无缺项、无第 6 项 | ✅ |
| 词库项数 | 每份 5 项 | 10 份逐份实测 = 5 | ✅ |
| 干扰项 | 每份**恰 2 个**，全批 20 个 | ①D,E｜②B,C｜③A,E｜④C,D｜⑤A,B｜⑥B,D｜⑦A,C｜⑧B,E｜⑨C,D｜⑩A,E —— **全批恰 20 个** | ✅ |
| 命中数 | 词库命中数 = 空数 = 30 | 50 条中被用作答案 **30** 条、干扰 **20** 条（**「词库短语数 = 空数」是错的，此处按 D-SPEC §数量与配比 的正确表述执行**） | ✅ |
| 短语全批只用一次 | 每条短语全批只能被用作一次 | 50 条归一化后精确重复 **0** 组；去大小写与标点后 **0** 组；**再去冠词 the/a/an 后仍 0 组** | ✅ |
| 每空唯一对应 | 每个空唯一对应一条短语 | **30 空逐空判定（§9），0 个空存在第二条成立读法** | ✅ |
| 五字母覆盖 | A 到 E 全批都要被用作答案 | **A×6 B×6 C×6 D×6 E×6**，无固定陷阱字母 | ✅ |
| 结构比 | 空数 ÷ 份数 = 3 | **30 ÷ 10 = 3.0000** | ✅ |
| 表体行数 = 空数 | 3 空即 3 行 | **10 份逐份表体均为 3 行**。**D6-10 实测 3 行（L197 two months ago / L198 last month / L199 this month so far），无回退** | ✅ |
| 表格列数批内一致 | 全批内部一致即可 | 表头与全部 30 个表体行实测**一律 5 列**，与文件头 L5 声明一致 | ✅ |
| 结构骨架 | `## 编号 标题` / `**Passage|Dialogue**` / `**Table**` / `**Word Bank**` / `**Answers**` | 全批计数各 **10 / 10 / 10 / 10 / 10** | ✅ |
| 编号连续 | 无缺号无重号 | D6-01 … D6-10 连续 | ✅ |
| **结构标记与体裁相符** | 逐份核对 | **Passage × 5**（D6-01/03/05/07/10，正文均为第三人称叙述、无说话人前缀）；**Dialogue × 5**（D6-02/04/06/08/09，正文均为 M:/W: 轮流）。**标记不符 0 处。** 全文只出现 **M 与 W** 两种说话人前缀，非 M/W 前缀 **0** 处 | ✅ |
| 无元数据块 | 不得残留 `#` 开头元数据区块 | `#` 开头共 11 行 = L1 批次标题（_COMMON §4 允许）+ 10 行题号标题（REVIEW-RUBRIC 1.6）。**无自检表、无考点对照表、无统计块**；HTML 注释 **0** | ✅ |
| 每份一行一空？ | —— | **不适用**（D-SPEC 只要求「行数与空数一致」，未要求一行一空）。实测：D6-01/04/05/06/07/09 为一行一空；D6-02 第 2 行两空、D6-03 第 2 行两空、**D6-10 第 2 行三空**。**按 D-SPEC 判定合规**，仅记录形态差异 | 不适用（合规） |

**结论：修复没有破坏 D 类的任何硬结构。** F2 只改了问句里的一个词，不涉及正文事实、词库与 Answers，答案序列、五字母覆盖、干扰项计数在结构上不可能被破坏——实测也确认了（§7 序列与 R1、R2 记录逐字相同）。

---

## 6. 词数逐份复算（任务书重点核查项 4）

**口径（明写以便复现，与 REVIEW-RUBRIC §1.10 一致）**：**空白分词**、**含说话人标注（M:/W:）**、只数材料正文、**不含**题号标题 / `**Table**` 及其下表格行 / Word Bank / Answers / 文件头（L1–L7）/ 末尾汇总行（L209）/ 注释块；D 类剔除 ①②③。
实现方式：自写脚本，材料体起点取 `**Passage**` / `**Dialogue**` 标记行的下一行，终点取下一条独占的星号粗体行。与 `wordcount-gate.ps1` 的 Get-Blocks 边界同源，结果与门禁一致。

| 题号 | 标记 | 正文行 | 词数 | 上限 | 余量 |
|---|---|---|---|---|---|
| D6-01 | Passage | L11 | **137** | 200 | 63 |
| D6-02 | Dialogue | L29–34 | **180** | 200 | **20** |
| D6-03 | Passage | L52 | **121** | 200 | 79 |
| D6-04 | Dialogue | L70–73 | **162** | 200 | 38 |
| D6-05 | Passage | L91 | **162** | 200 | 38 |
| D6-06 | Dialogue | L109–115 | **166** | 200 | 34 |
| D6-07 | Passage | L133 | **140** | 200 | 60 |
| D6-08 | Dialogue | L151–153 | **167** | 200 | 33 |
| D6-09 | Dialogue | L171–175 | **183** | 200 | **17**（全批最紧余量） |
| D6-10 | Passage | L193 | **151** | 200 | 49 |

- **实测区间 = 121 到 183**，全部 ≤ 200，**通过**。**零余量块：无。**
- 任务书写的「121 到 183」**与实测一致**，予以确认。
- **对 R2-D6.md 一处内部自相矛盾的更正（按 _COMMON §7 必须写明）**：
  R2 的 §7 逐份表里写的是 **D6-09 = 183**，但同一节的汇总句写「**区间 121–180**」，§1.2 门禁表里又写「逐份实测 **121–180** 词」。
  **三处表述互相打架。复核员独立重算：实测区间是 121–183，不是 121–180。R2 的汇总句与 §1.2 的「121–180」两处写错了，任务书的「121 到 183」是对的。**
  该错误不影响 R2 的任何判定（183 与 180 都 ≤ 200），但它是报告内部数字不自洽，记录在此。
- **对 R2-D6 §7 关于余量方向的更正，复核员确认成立**：R2 说「20 词是 D6-02 的**最小**余量，不是最大余量；最大余量是 D6-03 的 79 词」。
  复核员实测：**最小余量 17 词（D6-09）、最大余量 79 词（D6-03）、D6-02 = 20 词。R2 的这处更正正确。**

---

## 7. 30 项答案序列专项（1.8 / 1.8b / _COMMON §2c 四项）

**序列（30 项，实测）**：`ACBDAEBCDEBACEDAECDBECDAEABBDC`
（与 R1-D6 §8、R2-D6 §8 记录的序列**逐字相同** —— F2 未改动任何答案字母。**R2 的这条自证经复核属实。**）

### 7.1 周期检测 —— **覆盖所有不超过长度一半的周期（p = 1…15），不只是 2 到 6**

长度 n = 30，一半 = 15。判定式：前 (n − p) 项均满足 `seq[i] == seq[i+p]` 即为严格周期。

| p | 前缀连续匹配 | 首个失配下标 | 是否严格周期 |
|---|---|---|---|
| 1 | 1/29 | 1 | 否 |
| 2 | 1/28 | 1 | 否 |
| 3 | 1/27 | 1 | 否 |
| 4 | **11/26** | 11 | 否 |
| 5 | 3/25 | 3 | 否 |
| 6 | 3/24 | 3 | 否 |
| 7 | 4/23 | 4 | 否 |
| 8 | 7/22 | 7 | 否 |
| 9 | 2/21 | 2 | 否 |
| 10 | 4/20 | 4 | 否 |
| 11 | 7/19 | 7 | 否 |
| 12 | 2/18 | 2 | 否 |
| 13 | 1/17 | 1 | 否 |
| 14 | 4/16 | 4 | 否 |
| **15** | **4/15** | 4 | **否** |

**判定：p = 1 到 15 中无一为严格周期。最长的前缀连续匹配是 p = 4 的 11/26（41.7%），远未达到 26/26。**
**特别是 p = 15（前后半段整体平移）只有 4/15 匹配** —— 这正是 _COMMON §2c 所举 B5「前 8 位与后 8 位相同」那一类套利形态的检验口径，本批**阴性**。

### 7.2 前后半段是否互为重复

- 前 15 位：`ACBDAEBCDEBACED`
- 后 15 位：`AECDBECDAEABBDC`
- **是否相同：否。**
- 补充：两段的多重集**相同**（各含 A×3 B×3 C×3 D×3 E×3），但这是 6/6/6/6/6 均匀分布的必然结果，**顺序完全不同**。p = 15 平移检测 4/15 再次确认不是半段复制。

### 7.3 最长连续相同

**最长 = 2**，字母 **B**，0 基下标 **26–27**（序列末段 …ABBDC 中的 BB）。全序列**仅此一处**相同相邻段。
**无 3 连及以上扎堆。要求 ≤ 2，满足。**

### 7.4 五字母覆盖

**A×6、B×6、C×6、D×6、E×6，合计 30。五个字母全部被用作答案，不存在固定陷阱字母。**

### 7.5 逐空位置偏斜（阈值 70%）

| 位置 | 序列 | 分布 | 最高频占比 |
|---|---|---|---|
| 空① | `ADBECADCEB` | A2 D2 B2 E2 C2 | **20.0%** |
| 空② | `CACBEEBDAD` | C2 A2 B2 E2 D2 | **20.0%** |
| 空③ | `BEDADCEABC` | B2 E2 D2 A2 C2 | **20.0%** |

**闭卷按各位置最高频盲填 = 6/30 = 20.00%**（阈值 70%）。**无位置偏斜缺陷。**

> 「分布均衡 ≠ 排列正常」的提醒继续落实：字母分布是完美的 6/6/6/6/6，但**周期检测（含 p = 7…15）、扎堆检测、位置偏斜检测另外单独做，结果均为阴性**。三项不是互相替代的关系。

### 7.6 汇总行自洽性（L209）

脚本逐份比对：10 份的 `①X②Y③Z` **全部与对应 Answers 行逐字一致**；声明的「A×6、B×6、C×6、D×6、E×6」与实测一致；声明的「30 空 ÷ 10 份 = 3」与实测一致。**汇总行无虚报。**（D-SPEC L55：末尾汇总行「写了不算错」。）

---

## 8. 跨份雷同扫描与材料数字复算

### 8.1 跨份首句归一化互异

取每份正文首行 → 剥离 `M:/`W:` 说话人前缀 → 切出第一个句号前的成分（保护 `Mr./Ms.` 缩写）→ 去标点转小写 → 建字典去重。

| 题号 | 首句归一化 key |
|---|---|
| D6-01 | our school keeps its lost and found book in the gatehouse and mr |
| D6-02 | our reading corner has a borrowing record now |
| D6-03 | the science club keeps a plant record on the wall of the reading room |
| D6-04 | did you see the new visitor book at the nature museum ms |
| D6-05 | our school writes the weather down on a board at the front of the science building |
| D6-06 | mum and i did three kitchen experiments last weekend and she helped me write them in her notebook |
| D6-07 | our school announced the new school uniform order on 30 august and ms |
| D6-08 | the school newspaper office keeps a record of the hand written newspapers for the autumn show |
| D6-09 | **ms** ← **切分伪影，非真实重复** |
| D6-10 | my family writes down the electricity and the water we use because the two bills change a lot between summer and winter |

**10/10 互异，重复首句 0 处。**
**伪影说明（过程纠错留痕）**：D6-09 的首句是 `Ms. Hu at the district office…`，我的切分器在 `Ms.` 上切出了伪 key `ms`。
**该 key 与其余 9 个 key 无碰撞**，故 10/10 的去重结果仍然成立。**若把它当成真实重复，会得到「9/10」的假阳性。**
（R2-D6 §9.1 也记录了同一个伪影并作了同样处理，两轮独立撞上同一处切分伪影——这是分割器的已知缺陷，不是题目缺陷。）

### 8.2 跨份全文 Jaccard（阈值 0.6）

- **词集口径**：**命中 0 对 / 45 对**。最高一对 D6-02~D6-04 = **0.2466**；其后 D6-01~D6-04 = 0.2409、D6-01~D6-02 = 0.2374、D6-04~D6-07 = 0.2353。
- **bigram 口径（更严）**：**命中 0 对 / 45 对**。最高一对 D6-04~D6-08 = **0.0734**；其后 D6-03~D6-08 = 0.0733。
- **结论：远低于 0.6 阈值，无跨份雷同。**

### 8.3 材料内话轮/句子两两雷同（阈值 0.6）

10 份共 **107** 个句/话轮单位（≥3 词），逐份去重后**重复 0 处**，全批两两比对 **0 命中**。

### 8.4 材料数字逐个复算

口径：把每份材料正文里的阿拉伯数字、英文数词、日期全部抽出，与该份表格逐格对照。

| 题号 | 正文数字 | 表格数字 | 复算结论 |
|---|---|---|---|
| D6-01 | 12 March（末条）、8 March、10 March、12 March、Two（Class Two） | 8 / 10 / 12 March | 一致。「the last entry in them is 12 March」与表第 3 行 12 March 相符 |
| D6-02 | 2 April（开页）、five（×2）、8 April、nine、4 April、11 April、8 April、15 April、12 April、19 April | 4/11、8/②(15)、12/19 April；Back on time yes/no/yes | 一致。② = 15 April 与「has not returned it yet」→ `no` 互证 ✓ |
| D6-03 | 20 May（完工）、five、forty、2 May、sixty、28 April、one、15 May | 2 May、28 April、15 May；forty / sixty / one | 一致。**28 April < 2 May** 与「opened **before** the camellia's」相符 ✓ |
| D6-04 | 8 June（开页）、five、6 June、12 yuan（×2）、20 yuan | 6/6/7 June；12/12/20 yuan | 一致。Nina 的 7 June = 「the next day」= 6 June + 1 ✓；「students pay less than adults」与 12 < 20 ✓ |
| D6-05 | 1 April（开页）、one、eight、two、5/7/10 April、23、11、18、13、28、16 | 5/7/10 April；23/11、②(18)/13、28/③(16) | 一致。**10 April 最高 28 > 5 April 的 23 > 7 April 的 18**，与「it was the hottest day of the month」相符 ✓ |
| D6-06 | 16 March（开页）、three、10 / 5 / 8 minutes、one | 10 / 5 / 8 | 一致 |
| D6-07 | **30 August**、6 September（开页 + 首日）、**four**、two、one、two、one、one、one、**9 September** | 6/6/③(9) September；two/0/one | **日期自洽**（30 Aug 公告 → 6 Sep 首日 → 9 Sep 付款）；**尺码自洽**（four sizes 含 S；M/L 分派给 Jack/Leo，XL 未用）；「two shirts only」与 Shorts = 0 相符 ✓ |
| D6-08 | 20 October（开页）、five、20 / 21 / 22 October、Two、Three | 20 / 21 / 22 October；Class Two / Two / Three | 一致 |
| D6-09 | 5 November（开放）、12 November（截止）、five、**Nine**、**Eight**、5 November、9 November、12 November、three | 5 / 9 / 12 November；senior / junior / ③(senior) | 一致。**年级→组别映射数值上自洽**（Nine→senior / Eight→junior）✓ |
| D6-10 | 1 January（开页）、two、one、118 k、15 t、78 yuan、145 k、12 t、96 yuan、102 k、18 t、85 yuan | 118/15/78；①(145)/②(12)/③(96)；102/18/85 | 一致。「the water went **down** to 12 t」与 15 → 12 的下降方向相符 ✓；「two months ago / last month / this month so far」相对「新页 1 January」可调和（今为 3 月） |

**数字复算未发现任何算术错误，也未发现新的数字/文字冲突。** 原 S-2（尺码与库存）与 M-3（日期）两处冲突已从数字层面完全消失。

---

## 9. 30 空逐空判定（零抽样）

列含义：**依据** = 答案短语的材料出处（行号 + 原文片段）；**唯一性** = 词库内是否只有这一条能填，以及为什么排他。
「命中」列：脚本对该空做**字面子串检测**（答案短语是否原样出现在材料正文中）。`否(变形)` 表示材料用了时态/词形变化或需跨两句合成，已在「依据」列逐条说明，**不构成第二条成立读法**。

| # | 题号 | 空 | 答案 | 词库短语 | 所在列 | 依据（原文定位） | 唯一性 | 命中 | 严重 | 中等 | 轻微 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | D6-01 | ① | A | in the reading room | Where it was found | L11「On 8 March he found a blue water bottle **in the reading room**」 | **唯一**。D = in the gatehouse 是登记簿所在地（L11「keeps its lost-and-found book in the gatehouse」），不是发现地点；E = Jack 属人名列 | 是 | — | — | — |
| 2 | D6-01 | ② | C | in the dining hall | Where it was found | L11「On 10 March he picked up a pair of black gloves **in the dining hall**」 | **唯一**。A 已归第 1 行；D 为簿册所在地；E 为人名 | 是 | — | — | — |
| 3 | D6-01 | ③ | B | Emma | Who took it home | L11「**Emma**, a new student in Class Two, said the badge was hers, so Mr. Brown gave it to her in the gatehouse」 | **唯一**。E = Jack 已是第 1 行该列的给定格；D 是地点短语，人名列不收 | 是 | — | — | — |
| 4 | D6-02 | ① | D | a story about a little white horse | Name of the book | L33「The second line is Nina. She took **a story about a little white horse** home on 8 April」 | **唯一**。B = 11 April、C = 12 April 是日期，不属书名列；E 是 Leo 的书（第 3 行） | 是 | — | — | — |
| 5 | D6-02 | ② | A | 15 April | Day it is due back | L33「it should have come back on **15 April**, but she has not returned it yet」；**与同行 `Back on time = no` 互证** | **唯一**。B = 11 April 已是第 1 行给定格；C = 12 April 已是第 3 行给定格 | 是 | — | — | — |
| 6 | D6-02 | ③ | E | a science book about the sea | Name of the book | L34「Leo borrowed **a science book about the sea** on 12 April and gave it back on time on 19 April」 | **唯一**。D 已归第 2 行；A/B 是日期 | 是 | — | — | — |
| 7 | D6-03 | ① | B | a camellia | Plant | L52「Near the east gate there is **a camellia**, about forty centimetres high」 | **唯一**。C = a lilac 归第 2 行；D = purple 是颜色，Plant 列不收；E 已是第 3 行给定格 | 是 | — | — | — |
| 8 | D6-03 | ② | C | a lilac | Plant | L52「By the reading room there is **a lilac**, about sixty centimetres high」 | **唯一**。B 归第 1 行；D 是颜色；E 已是第 3 行给定格 | 是 | — | — | — |
| 9 | D6-03 | ③ | D | purple | Colour of the flowers | L52「**Its purple** flowers opened before the camellia's, on 28 April」 | **唯一**。A = white 已是第 1 行给定格；该列另两格 white / yellow 均为颜色短语 | 是 | — | — | — |
| 10 | D6-04 | ① | E | the hall of wild animals | Hall | L72「**Emma** went to **the hall of wild animals**」 | **唯一**。5 项全为展厅名；C（machines）、D（birds）**材料中从未出现**，可直接证否 | 是 | — | — | — |
| 11 | D6-04 | ② | B | the hall of ancient China | Hall | L72「and **I** went to **the hall of ancient China**」 | **唯一**。C/D 材料中不存在；A 归第 3 行（由同句「Nina went there on her own」定出第 3 行是 Nina，她 stayed in the hall of space） | 是 | — | — | **V-L8** |
| 12 | D6-04 | ③ | A | the hall of space | Hall | L73「**she** stayed in **the hall of space** all afternoon」（she = Nina，由同句前半「Nina went there on her own」定） | **唯一**。E 已归第 1 行；B 已归第 2 行 | 是 | — | — | — |
| 13 | D6-05 | ① | C | rainy in the morning | Weather | L91「On 5 April it **rained in the morning** and stopped before noon」 | 词库内唯一（其余 4 项 A/B/D/E 全是数值，Weather 列不收）。**但属类别锁**：不读材料，仅凭列头即可断定该填天气短语 | **否(变形：rained→rainy)** | — | — | **V-L7** |
| 14 | D6-05 | ② | E | 18 | Highest (C) | L91「On 7 April the sky stayed cloudy all day, and the temperature **did not go above 18**」 | **唯一**。A = 23、B = 11 已是第 1 行该列给定格；D = 16 归空③ | 是 | — | — | — |
| 15 | D6-05 | ③ | D | 16 | Lowest (C) | L91「The highest was 28, and the lowest was **16**」 | **唯一**。B = 11 已是第 1 行给定格；E = 18 归空② | 是 | — | — | — |
| 16 | D6-06 | ① | A | red cabbage leaves in hot water | What we used | L111「The first one was about **the colour of red cabbage**.」+「I put **the leaves in hot water**」 | **唯一**。B = hot water and a green leaf 含材料从未出现的 `green leaf`（实验对象是 red cabbage）；C/D/E 是人名，不属 What we used 列。**需跨两句合成，但合成结果唯一** | **否(跨两句合成)** | — | — | **V-L1**、**V-M1** |
| 17 | D6-06 | ② | E | Kate | Who did the experiment | L113「**Kate did that one with me**」 | **唯一**。D = Nina 被「his sister Nina was **out that afternoon**」排除；C = Leo 独自做第 3 项（已归空③） | 是 | — | — | **V-L1**、**V-L2**、**V-M1** |
| 18 | D6-06 | ③ | C | Leo | Who did the experiment | L115「**Leo did that one on his own**」 | **唯一**。E = Kate 已归第 2 行；D = Nina 被排除。**本空的依据句本身无歧义**；但同句前半「We mixed them in a bowl」与之冲突 → **V-M1** | 是 | — | **V-M1** | **V-L1**、**V-L2** |
| 19 | D6-07 | ① | D | M | Size | L133「Jack is tall and thin, so he chose **size M**」 | **唯一**。C = XL 材料中从未指派；B = S 归 Nina 行；A = 6 September 是日期 | 是 | — | — | **V-L9** |
| 20 | D6-07 | ② | B | S | Size | L133「Nina is smaller, so she chose **size S**」+「the shop has **four sizes in stock: S, M, L and XL**」 | **唯一**。D = M 已归第 1 行；C = XL 从未指派。**依据句不再与库存清单冲突（S-2 确已解开）** | 是 | — | — | **V-L9** |
| 21 | D6-07 | ③ | E | 9 September | Day of payment | L133「his father came to pay **on 9 September**」 | **唯一**。A = 6 September 已是第 1、2 行给定格 | 是 | — | — | **V-L9** |
| 22 | D6-08 | ① | C | A Small Reading Corner | Name of the work | L153「**Emma**'s work is called **A Small Reading Corner**」 | **唯一**。B = Jack 的作品（已是第 2 行给定格）；D = Kate 的作品；E 已是第 3 行 Subject 给定格 | 是 | — | — | — |
| 23 | D6-08 | ② | D | The Old Stone Bridge | Name of the work | L153「**Kate**'s work is called **The Old Stone Bridge**」 | **唯一**。E = `the old stone bridge near the school gate` 已是第 3 行 Subject 给定格，且为小写普通名词短语，作品名不会长这样；C 已归第 1 行 | 是 | — | — | — |
| 24 | D6-08 | ③ | A | the plants that our class grows | Subject | L153「Jack's work is called Plants in Our Garden … and **its subject is the plants that our class grows**」 | **唯一**。B/C/D 是作品名（已归第 2 行 Name 或第 2 行给定格）；E 已是第 3 行给定格 | 是 | — | — | — |
| 25 | D6-09 | ① | E | hard-pen writing | Event | L173「Jack entered the senior group and chose **hard-pen writing**」 | **唯一**。D = English handwriting 被 L175「**only for students from three other schools**」排除；A = brush writing 归 Nina 行；B/C 是组别，不属 Event 列 | 是 | — | — | **V-L6**、**V-L10** |
| 26 | D6-09 | ② | A | brush writing | Event | L173「**Nina chose brush writing**, but she is only in Grade Eight」 | **唯一**。B/C 是组别；D 被排除；E 归第 1 行空 | 是 | — | — | **V-L6**、**V-L10** |
| 27 | D6-09 | ③ | B | senior | Group | L171 规则句「**Grade Nine students can enter only the senior group**」+ L175「**Emma is in Grade Nine**」 | **唯一**。C = junior 要求学生**先推翻材料明写的规则句**。Emma 与 Grade **已同句共现（L175）** | 是 | — | — | **V-L6**、**V-L10** |
| 28 | D6-10 | ① | B | 145 | Electricity (k) | L193「Last month we used **145 k** of electricity」 | **唯一**。A = 118 已是第 1 行给定格；D/E 属其他列 | 是 | — | — | **V-L9** |
| 29 | D6-10 | ② | D | 12 | Water (t) | L193「but **the water went down to 12 t**, because it rained a lot」 | **唯一**。E = 15 已是第 1 行给定格 | 是 | — | — | **V-L9** |
| 30 | D6-10 | ③ | C | 96 | Bill (yuan) | L193「**The bill last month was 96 yuan**」 | **唯一**。B/D 属其他列；A/E 已是第 1 行给定格 | 是 | — | — | **V-L9** |

### 9.1 逐空判定汇总

| 维度 | 结果 |
|---|---|
| 逐空判定覆盖率 | **30 / 30，零抽样** |
| 材料中无任何依据的空 | **0**（30 个空全部有材料出处；最弱的两处是 D6-05 ① 的时态变形与 D6-06 ① 的跨两句合成，两者都不产生第二条读法） |
| 词库内存在第二条成立填法的空 | **0**（30 / 30 唯一） |
| 严重缺陷空 | **0** |
| 中等缺陷空 | **1**（D6-06 ③，同份级连带） |
| 轻微缺陷空 | **13**（上表「轻微」列非空的行数） |
| 零附注的空 | D6-01 ①②③、D6-02 ①②③、D6-03 ①②③、D6-08 ①②③ = **12 个空** |

---

## 10. 缺陷清单（本轮独立编号，与 R1/R2 的 M-x / L-x 无关）

### 严重缺陷：**0 条**

R1-D6 报出的两条严重（S-1 D6-09 空③ 无年级依据、S-2 D6-07 空② 与库存清单冲突），复核员在当前磁盘版本上逐条重新验证，**两条均已解开**：

| 原编号 | 位置 | 当前实测 | 结论 |
|---|---|---|---|
| **S-1** | D6-09 空③ | L175「**Emma is in Grade Nine**」与规则句 L171「Grade Nine students can enter **only** the senior group」构成完整单向映射；Emma 与 Grade **同句共现**。词库 Group 列候选仅 B（senior）、C（junior）；要得出 C 必须先推翻规则句。**可得不同答案的读法数 = 1** | ✅ 已解开 |
| **S-2** | D6-07 空② | L133 库存句现为「This year the shop has **four sizes in stock: S, M, L and XL**」，**S 在库存清单内**，与「she chose size S」不再冲突。Size 列候选 B（S）/C（XL）/D（M）：D 归 Jack 行，C 从未指派，**读法数 = 1** | ✅ 已解开 |

R1-D6 报出的五条中等（M-1…M-5）同样在当前磁盘版本上逐条复核，**五条全部已解开**（结构标记实测 Passage × 5 + Dialogue × 5 且逐份相符；D6-06 列头现为 `Who did the experiment`，与 L113 / L115 逐字对齐；D6-07 句 1 现为「announced … on **30 August**」；D6-10 表体 3 行；D6-04 词库 5 项全为展厅名）。**本轮不重复其明细，只确认结论成立。**

### 中等缺陷：**1 条**

#### **V-M1　D6-06 第 115 行**　**同一句话内部矛盾：「我们把它们倒进碗里拌」与「那一次是 Leo 一个人做的」互相排斥** —— 材料自相矛盾

- **位置**：L115（材料正文第 6 行，第 3 个实验的整段）；影响空③，牵连全份。**不是 F2 造成的**（F2 只动了第 172 行一个词）。
- **原文（L115 完整实测）**：

  > M: The third one was about baking soda and vinegar. **We mixed them in a bowl**, and the mixture rose like a cake. It took 8 minutes. **Leo did that one on his own**, because his sister Nina was out that afternoon.

- **问题**：同一句话里，`We mixed them`（说话人 + 某人一起做）主张**至少两个人**参与了第 3 个实验，
  而 `Leo did that one **on his own**` 主张第 3 个实验**只有 Leo 一个人**做。两句相隔不到三个词，直接互相排斥。
- **为什么这不是判分问题、却仍是缺陷**：
  - **对判分零影响**：空③ = C（Leo）的唯一依据就是「Leo did that one on his own」这句话本身，它不含歧义；空② = E（Kate）不受影响。
  - **但它与本份的考查点正面相邻**：表格第 5 列表头就是 **`Who did the experiment`**，学生做这一空时正要判断「谁做的」。
    一名认真读完这一段的学生会当场发现叙述者先说「我们一起做」、后说「Leo 一个人做」，无从判断该信哪一句。
- **为什么本轮判中等、而 R2-D6 判轻微（本轮明确改判，须说明理由）**：
  1. R2 给出的调和读法是「Mum 与「我」做了全部三项，具体某一步由谁做另说」。**复核员认为这条调和读法在原文里站不住**：
     若 `We` = Mum + 我，则第 3 项既被 Mum + 我做、又被 Leo 独自做，**矛盾原封不动，只是换了主角**。
  2. **本份材料自身的平行句式直接解除了这条调和读法**。第 2 个实验（L113）是同一构造：

     > M: The second one was about eggs. **We** dropped a raw egg into a cup of salt water, and the egg stayed at the bottom. It took only 5 minutes. **Kate did that one with me.**

     此处 `We` = 「我」+ Kate，与「Kate did that one **with me**」**完全自洽**，没有任何矛盾。
     **同一份材料对同一句式给出了两种用法**（第 2 项 `We` 含说话人，第 3 项 `We` 却不含说话人却紧接「独自完成」），这就把第 3 项的 `We` 锁死为误用。
  3. 按 REVIEW-RUBRIC §1.2「任何读起来说不通之处 → 严重」与 §2「材料内部矛盾 → 严重」，**按字面从严判可升为严重**。
  4. 但它**无判分后果**（30 空的唯一性全部成立），且 `We` 可作泛指性口语铺陈理解，故本轮按 REVIEW-RUBRIC §4.5「拿不准的标为中等并写明不确定的理由」判 **中等**，并把升格选项交调度方裁定。
- **建议改法（1 个词，零词数影响，不动任何答案）**：把 L115 的 `We mixed them in a bowl` 改为 `**He** mixed them in a bowl`，与同句「Leo did that one on his own」对齐。
  改后第 2 项（`We` = 我 + Kate）与第 3 项（`He` = Leo）句式一致，矛盾消除。**改动后必须重跑 `wordcount-gate.ps1`、`verify-bank.ps1`、`check-integrity.ps1` 并复核 Answers 未变。**
  **备选方案**：若不愿改动词，把「Leo did that one on his own」改为「Leo did that one with me」——但这会使 `We` = 我 + Leo，
  与「his sister Nina was out」以及「独自完成」的原有设定都要重写，改动面更大，**不推荐**。

### 轻微缺陷：**10 条**

| 编号 | 位置 | 内容 | 处置 |
|---|---|---|---|
| **V-L1** | D6-06 L109 | 口径声明落空：「She began the new page on 16 March, and **she always writes the day first and then the month**」—— 但本表 5 列为 Experiment / What we used / Minutes / What we saw / Who did the experiment，**没有任何日期列**；唯一的数值列 `Minutes` 也没有任何口径声明。命中 D-SPEC「表格列的口径必须说清楚」。**无判分后果** | 记录即可（严格读 D-SPEC 可升为中等） |
| **V-L2** | D6-06 L111 | F1 把表头 `Who wrote the line down` 改成 `Who did the experiment` 之后，正文遗留了一句「It took 10 minutes, so **I wrote that line** myself」—— 本表**已无「谁写记录」这一列**，该句成为孤儿。（第 1 行给定格 `I` 另有「I put the leaves in hot water」支撑，故不构成依据缺失，只是措辞残留） | 记录即可 |
| **V-L3** | D6-01 L11 | `on the stairs between **the second and the third floor**` —— 英语中并列序数词之间不重复冠词，且 floor 应用复数。通常写作 `between the second and third floors`。不影响任何一个空 | 记录即可 |
| **V-L4** | 文件头 L6 | 声明「称呼**只用 Mr. 与 Ms.**，全批一致」。实测：D6-06 正文出现 `Mum`（1 次）、D6-10 正文出现 `My mother`（2 次）、`mother`（小写）6 次。**该声明与原文不符。**（说话人标注 `M:` / `W:` 那一半声明**成立**——全文只出现 M 与 W 两种前缀，非 M/W 前缀 0 处） | 记录即可 |
| **V-L5** | D6-08 L151 | `the hand-written newspapers`（手抄报，惯用 hand-drawn / hand-lettered）。不构成语法错误，但搭配不地道 | 记录即可 |
| **V-L6** | D6-09 L171 | `opened the sign-up for the calligraphy competition` —— `sign-up` 作名词用偏口语；`began the sign-up` 更合语域。不构成语法错误 | 记录即可 |
| **V-L7** | D6-05 空① | **题干泄露答案（类别锁）**：Weather 列的 5 个候选里只有 `rainy in the morning` 一项是天气短语，其余 4 项（23 / 11 / 16 / 18）全是数值。学生只凭列头即可排除全部数值项，不读材料即知 ① 该填天气短语。命中 REVIEW-RUBRIC §1.1 末条（题干泄露答案 → 轻微）。**按 §1.8c，这是「三空类型两两不相交 + 5 项词库」的模板算术下限（3 类 × 2 个可排除候选需 6 个槽位，词库只有 5 项），不是命题疏忽**——本份空②③ 本就共享「数值」类型，缺的是让空① 也与某一类共享，而 5 项模板下无低成本解法 | **不修**，如实记录 |
| **V-L8** | D6-04 空② | 要填 Jack 的展厅，须知道第 3 行是 Nina（由 L73「Nina went there on her own」定），而表格里第 3 行确实写着 Nina——这一环材料有支撑。**真正的残留**是：材料**从未点名 Jack**，第 2 行的 Jack 靠「M ≠ Emma ≠ Nina」反推。M-5 的修复（新词库的 machines / birds 材料中不存在）已使这一空**无需认定 M 的身份即可收敛**，严重度较 R1 时已显著削弱 | 记录即可 |
| **V-L9** | D6-01 r1 / D6-02 r1 / D6-04 r1,r2 / D6-07 r1,r2 / D6-10 r1,r2 | **给定格的依据在材料中未交代**（共 7 格，均非考查对象，不影响任何空的判分）：D6-01 第 1 行 `Given back to the owner = yes`（材料只说「Jack carried it home」，未说 Jack 是物主）；D6-02 第 1 行 `Back on time = yes`（材料只说九本应于 11 April 还，未说是否按期归还）；D6-04 第 1、2 行 `Class Two`（本份材料只说「our class」，从未说 Class Two；跨份与 D6-01 / D6-08 一致，故是**本份内依据缺失**而非全批矛盾）；D6-07 第 1、2 行 `Day of payment = 6 September`（材料只说「Our class **ordered** on the first day」，未说当天付款）；D6-10 第 1、2 行 `Who wrote the line`（材料只说「My mother keeps one book … she started a new page」，第 3 行另有「she has written … in the book」支撑） | 记录即可 |
| **V-L10** | D6-09 L172 / L175 | **本轮独立发现。** F2 把问句改成 `Who from **our school** entered?` 之后，问句问的是「我们学校」，而 L175 说 Emma 的表格交自我 `from the community centre **where she studies**`。读法甲（Emma 是本校九年级生，社区中心只是报名点 / 练字处）与读法乙（Emma 在社区中心就读，故不算 our school）并存，材料未消除。（Nina 的表格来自「her mother's office」不构成同类问题——那只是提交地点；「where she studies」是就读单位的陈述，性质不同。）**不影响任何空的唯一性**：空③ 只依赖「Emma is in Grade Nine」+ 规则句，与 Emma 的就读单位无关 | 记录即可 |

### 10.1 一条**不判缺陷**的跨份观察（记录以免下一轮重复怀疑）

**跨份同名不同人**：D6-04 L73 说「Nina … **is a college student now**」（大学生），
而 D6-07 L133 让 Nina 在班级里订校服、D6-09 L173 说 Nina「only in **Grade Eight**」（八年级）。
**本轮判定：明确不记为缺陷。** 理由：D 类的 10 份材料彼此独立、各自成立，同名**不指同一个人**；
D-SPEC 与 REVIEW-RUBRIC 均未要求跨份人物身份一致；REVIEW-RUBRIC §1.7 查的是「情境高度雷同」，不是同名。
本项**不影响任何空的判分**，仅在此记录事实。

---

## 11. 与任务书 / 依据文件描述不符之处（按 _COMMON §7 必须写明）

1. **任务书的四组关键数字，全部经复核属实，无需推翻。**
   基线 **13,791 字节 / 209 行 / MD5 `00020e950da31144daf8233abef3c1c7`** —— 实测逐字一致，未变化 ✓
   词数区间 **121 到 183** —— 实测一致 ✓
   「F2-D6 已把第 172 行的 `our class` 改为 `our school`。**只改了这一个词。**」—— 实测第 172 行现文确为 `W: Who from our school entered?`，全批未发现第二个改动点 ✓
   「任务书里的 13,790 是还原态」—— 实测确认 13,790 / `4724fa27…` 正是 R2-D6 记录的 F2 之前状态 ✓

2. **任务书 §3 的四项 D 类硬结构声明，全部属实。** 每份词库 A–E 各一次 ✓、恰 2 个干扰项（全批 20 个）✓、30 空命中 30 条唯一短语 ✓、A–E 五字母全批各 6 次（无陷阱字母）✓、空数 ÷ 份数 = 3 ✓、10 张表逐份 3 行（**D6-10 上轮补到 3 行，本轮确认无回退**）✓、结构标记 Passage × 5 + Dialogue × 5 且**逐份与实际体裁相符** ✓。

3. **「上一轮的修复有没有在别处留下痕迹」——D6-09 内部没有，但 D6-06 有一处与 F2 无关的残留矛盾。**
   任务书的问题指向 D6-09，复核员已逐句确认无冲突（§4）。
   **但任务书未提及的另一处**：D6-06 L115 的 `We mixed them` / `on his own` 矛盾**在 R1 版就已存在**，F2 没有碰过它。
   本轮把它从 R2 的「轻微 L-6」改判为「中等 V-M1」，理由已在 §10 写明。

4. **R2-D6.md 内部有一处数字不自洽：词数区间写错两次。**
   R2 的 §7 逐份表里写 **D6-09 = 183**，但同一节的汇总句写「**区间 121–180**」，§1.2 门禁表里又写「逐份实测 **121–180** 词」。
   **三处表述互相打架。复核员独立重算：实测区间是 121–183。R2 的汇总句与 §1.2 的「121–180」两处写错；任务书的「121 到 183」是对的。**
   该错误**不影响 R2 的任何判定**（180 与 183 都 ≤ 200），但属报告内部数字不自洽，按 _COMMON §7 记录在此。

5. **R2-D6.md 关于余量方向的更正是对的，复核员确认。** R2 §7 写「20 词是 D6-02 的**最小**余量，不是最大余量；最大余量是 D6-03 的 79 词」。
   实测：**最小余量 17 词（D6-09）、最大余量 79 词（D6-03）、D6-02 = 20 词。R2 这处更正正确。**

6. **R2-D6.md 粘贴的 `verify-bank.ps1` 输出与本轮不同，属并发批次增长，不是缺陷。**
   R2 粘贴的输出为「共 **25** 个批次」，本轮为「共 **27** 个批次」（新增 A8、B5）。**D6 行两次都是 `D6 | D | prod | D类 Answers行=10 槽位=30`，逐字未变。** 按 _COMMON §2 的并发条款记录，不算缺陷。

7. **R1-D6 §11 第 2 条 / R2 §12 第 6 条指出的规约缺陷已由调度方修复。**
   两份报告都建议在 D-SPEC 补 Dialogue 骨架。复核员回原文核对：**D-SPEC.md 第 31–53 行现已补上完整的 `**Dialogue**` 骨架与 Dialogue 代码块**，并写明「**这一段是补写的，不是可选项。**」
   **M-1（5 份对话全标成 Passage）的诱因已消除。**

8. **R1 §11 第 3 条与 R2 §12 第 7 条指出的「两份依据文件对 D 类实测正常词数区间的说法互相矛盾」——仍未统一。**
   D-SPEC.md §词数 写「实测正常区间 **40 到 180** 词」；REVIEW-RUBRIC §1.10 写「实测 **59–114** 词属正常」。本批实测 **121–183**。
   两份文件**至今未改**。该分歧**不构成硬性上下限**（D 类唯一硬约束是 REVIEW-RUBRIC §1.10 的「上限 200、无下限」），故**本轮仍不判缺陷**，但矛盾依旧存在，建议调度方统一表述。

9. **D-SPEC.md 的两条「不适用」条款本轮同样不适用**，已按 _COMMON §6 写明理由而非伪装成通过（见 §12）。

---

## 12. 「不适用」项清单（按 _COMMON §6，明写而非伪装成 PASS）

| 项 | 结论 | 理由 |
|---|---|---|
| 「主题与 D-batch1、D4、D5 均不重复」（文件头 L7） | **不适用（未核验）** | 本任务**未授权**读取 D-batch1、D4、D5。**不记 PASS 也不记 FAIL。** 该句是出题方的自我声明，不在 D-SPEC 必查项内 |
| 「表格必须有来源说明与日期」 | **不适用** | D-SPEC §不适用的门禁 明文：「**本项目规约里没有这一条**」（R1/R2 曾据此误报一条不存在的缺陷，该条已作废） |
| 「文件末尾必须有汇总行」 | **不适用（允许）** | D-SPEC L55：写了不算错。本文件 L209 存在，经核验与 10 条 Answers 行逐份一致，无虚报 |
| REVIEW-RUBRIC §1.9 字面公式「Answer 行数 ÷ ## 段数」 | **不适用** | D 类无 Answer 行。按 REVIEW-RUBRIC §1.10 的正式裁定与 D-SPEC §数量与配比，D 类用「**空数 ÷ 份数**」口径，实测 30 ÷ 10 = 3 ✓ |
| REVIEW-RUBRIC §1.4 的 E 类「**考点**」检查项 | **不适用** | 本批为 D 类，文件内无 E 类条目，全文 `**情景提示**` / `**考点**` 计数为 0 |
| 超纲词（REVIEW-RUBRIC §1.3） | **已检查，判定不构成缺陷** | 已扫并列出：camellia、lilac、winter jasmine、gatehouse、calligraphy、baking soda、hard-pen、sign-up、Ms./Mr.。**理由**：本题为**从词库选项**而非从零产出，学生无需产出这些词。按 §1.3「列出该词」的口径不足以支撑一条中等或严重缺陷。**不记 PASS 也不记 FAIL，记「已检查、不判缺陷」** |

---

## 13. 无问题清单（供下一轮省时）

- **12 个空在本轮全部维度上零附注**：**D6-01 ①②③、D6-02 ①②③、D6-03 ①②③、D6-08 ①②③**（词数、结构、依据、唯一性、同类性、体裁标记全部通过）。
- **可不再复核的机械级项目**：词数门禁 PASS、0 块超限、0 块零余量、30÷10=3、编号连续无缺号、每份 A–E 各一次、每份恰 2 干扰项（全批 20 个）、50 条短语零重复、30 条答案短语互异、A–E 各 6 次、**周期 p=1…15 全部阴性**、前后半段不互为重复、最长连续 2、位置偏斜 20% << 70%、盲猜 20%、首句 10/10 互异、跨份 Jaccard 0/45 命中（词集与 bigram 两口径）、话轮雷同 0/107 命中、10 表全 5 列、10 表体全 3 行、汇总行与 Answers 逐份一致、全文正文无中文、无 HTML 注释、无元数据区块。
- **复审建议只盯 1 处**：D6-06 L115 的 `We mixed them`（V-M1，**改 1 个词即可**）。
- **另有 10 条轻微**（V-L1…V-L10）见 §10，**不影响通过与否**，其中 V-L7（D6-05 类别锁）按 REVIEW-RUBRIC §1.8c **明示不建议修**。

---

## 14. 修复建议汇总

| 编号 | 题号 | 处置 | 词数影响 | 授权 |
|---|---|---|---|---|
| **V-M1** | D6-06 | L115 `We mixed them in a bowl` → `He mixed them in a bowl` | **0**（1 个词，同句内替换） | **授权按此改**；改后必须重跑 `wordcount-gate.ps1`、`verify-bank.ps1`、`check-integrity.ps1`，并复核 Answers 未变、MD5 更新 |
| V-L1 / V-L2 | D6-06 | 删 L109 的日期口径分句、删 L111 的 `so I wrote that line myself` | 0 ~ −12 | 记录即可，可择机修 |
| V-L3 | D6-01 | `between the second and the third floor` → `between the second and third floors` | 0 | 记录即可，可择机修 |
| V-L4 | 文件头 L6 | 「称呼只用 Mr. 与 Ms.」改为「凡出现人物一律用英文名，亲属称谓可保留」 | 0 | 记录即可，可择机修 |
| V-L5 / V-L6 | D6-08 / D6-09 | hand-drawn newspapers；began the sign-up | 0 | 记录即可，可择机修 |
| V-L8 / V-L9 / V-L10 | 各处 | 见 §10 处置栏 | 0 | 记录即可，可择机修 |
| **V-L7** | D6-05 | 见 §10 | — | **不修**，按 REVIEW-RUBRIC §1.8c 如实记录 |

**修 V-M1 后必须重跑三个闸门**。V-M1 只动一个词，答案序列 `ACBDAEBCDEBACEDAECDBECDAEABBDC`、五字母 6/6/6/6/6、每份恰 2 干扰项、30÷10=3 **均不可能受影响**，但仍须实测确认后再归档。

---

## 15. 最终判定

**不通过。** 严重 **0** 条｜中等 **1** 条（V-M1，D6-06 同句内部矛盾）｜轻微 **10** 条。

R1-D6 报出的 **2 条严重与 5 条中等已全部解开**（本轮逐条重新验证，未采信任何上游自证）；
R2-D6 报出的 **M-6 已解开**（第 172 行确为 `our school`，一所学校同时有八年级与九年级合理）；
D 类硬结构（词库 A–E、恰 2 干扰项、30 空命中 30 条互异短语、五字母全批 6/6/6/6/6、30÷10=3、10 表各 5 列各 3 行、Passage × 5 + Dialogue × 5 逐份相符）**完好无损**；
**答案序列与 R1、R2 记录逐字相同，周期检测覆盖 p = 1…15 全部阴性。**

**唯一阻塞项是本轮独立发现的 V-M1（D6-06 L115 同句内部矛盾），改动 1 个词、不影响任何答案与词数。** 建议派单修复 V-M1 后复审，通过即可放行归档。


