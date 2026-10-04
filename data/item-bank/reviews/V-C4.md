# 复核报告：V-C4（C4.md 二轮修复后独立复核）

> 复核员立场：本轮为**独立复核**，不采信 R2-C4 的任何结论，也不采信 F2-C4 的任何自证。
> 依据报告中每一处引文、数字、缺陷描述，均已回到 `data/item-bank/prod/C4.md` 原文逐字重新验证。

---

## 结论

- 复核题数：**25**（逐题逐选项判定，共 100 个选项全部实读，**无抽样**）
- 缺陷计数：**严重 0 条 ｜ 中等 0 条 ｜ 轻微 9 条**
- 是否通过：**通过**
- 能否放行（当前磁盘版本能否归档）：**可以归档**
- 是否可进入下一环节：**是**
- 是否需返工：**否**。剩余 9 条全部为「轻微」，按 _COMMON.md §5「记录即可，可择机修」，不构成归档阻断。
- **R2-C4 的严重 1 条已修复并经我独立复核确认解除**（详见 §3.1）。
- **R2-C4 的中等 1 条在 C4-04 已修复；但同类问题在 C4-02 有残留**（详见 §5 轻微 3）。

### 三条硬性任务的独立结论

| 任务书要求 | 我的独立结论 | 证据 |
|---|---|---|
| 25 行 Answer 行 + 末尾汇总行是否与改前完全一致 | **完全一致，逐字节相同**（非"看起来一致"） | 反向套用 5 处改动后重建全文，MD5 精确等于 R2-C4 基线 `C7AD9C66B1C041081ECBCDE77DB7DB80`；且 Answer 块 + 汇总行的 MD5 改前改后均为 `C0A69259BA2E4B48081056AD4CEA8755` |
| 修复方"仅 5 处改动"的自证 | **成立**（我自行验证，非采信） | 上述反向套用重建的 12351 字节与基线 12351 字节、MD5 全等 ⇒ 全部 22 字节增量都被这 5 处唯一匹配串解释，无第 6 处改动 |
| C4-04 矛盾是否真的解开 | **真解开**，且修复方的自我怀疑不成立 | 见 §3.1 的借方方向论证 |

### 修复方自证的两处不成立（详见 §6）

1. **「`The best part is not the meal.` 改前严格逐字 1 次、忽略大小写 2 次」不成立**——实测忽略大小写仍为 **1 次**。
2. **「结尾模板由 4/5 降到 3/5」不成立**——第 4 处改动位于 C4-01 材料第 7 句（全篇 14 句），**根本不是结尾句**，结尾两句未被触碰。

---

## 0. 字节级前置校验（_COMMON.md §1，必做）

### 0.1 当前磁盘版本

| 项 | 值 |
|---|---|
| 文件路径 | `data/item-bank/prod/C4.md` |
| 字节数（`[System.IO.File]::ReadAllBytes`.Length） | **12373** |
| 字符数（`ReadAllText`.Length） | 12167 |
| 行数（`[System.IO.File]::ReadAllLines`） | **200** |
| 行数（行读取工具逐行复读） | **200** |
| 两次读取是否一致 | **是**（行数一致；LF=200、CRLF=0，UTF-8 无 BOM） |
| MD5 | **26393DA22FDB0DD7416257C900C9E5B9** |
| SHA-256 | `eeab731238f2aafbed70fb66d3f78978b41fbfd1c0e9ba96d4ba2fed3798dfcb` |
| 最后写入时间（UTC） | 2026-10-03T14:13:16.9884892Z |

### 0.2 基线对照（R2-C4 §0 记录的改前基线）

| 项 | 基线（R2-C4 实测） | 当前 | 变化 |
|---|---|---|---|
| 字节数 | 12351 | 12373 | **+22** |
| 字符数 | 12145 | 12167 | +22 |
| 行数 | 200 | 200 | 不变 |
| MD5 | `C7AD9C66B1C041081ECBCDE77DB7DB80` | `26393DA22FDB0DD7416257C900C9E5B9` | **已变化** |

**结论：修复已落盘**（MD5 已变、字节数已变、行数未变，符合"只改材料内文字"的预期）。

### 0.3 「仅 5 处改动」——我的独立反向套用验证（不采信修复方）

我对当前磁盘文件施加下列 5 处**逆替换**，每处先断言在全文中出现次数 **恰为 1**：

| # | 当前磁盘（改后） | 逆替换为（改前） | 出现次数 |
|---|---|---|---|
| 1 | `Mr Qian never keeps a borrowed thing longer than one evening.` | `Mr Qian never keeps anything longer than one evening.` | 1 |
| 2 | `writes the number on a slip of paper` | `writes the number on a paper` | 1 |
| 3 | `on a small slip of paper` | `on a small paper` | 1 |
| 4 | `the fair is still the one my grandmother knew` | `the plan is still the one my grandmother knew` | 1 |
| 5 | `"The meal is only half of it."` | `"The best part is not the meal."` | 1 |

逆替换后重建全文的实测：

- 字节数 = **12351**（基线 12351 ✔）
- MD5 = **`c7ad9c66b1c041081ecbcde77db7db80`**（基线 `C7AD9C66B1C041081ECBCDE77DB7DB80` ✔ **完全相同**）

**独立结论：修复落盘内容 ≡ R2-C4 基线 + 上述 5 处替换。文件内不存在第 6 处任何字节增删。**
（字节恒等式 `12351 + 22 = 12373` 亦与 `"borrowed thing"(+13) + 两处 "slip"(+8) + "The meal is only half of it." vs "The best part is not the meal."(+1)` 的净差吻合。）

### 0.4 Answer 行 / 末尾汇总行未变——逐字 + MD5 双重证明

| 项 | 值 |
|---|---|
| Answer 行数 | 25（行 10/17/24/31/38/49/56/63/70/77/88/95/102/109/116/127/134/141/148/155/166/173/180/187/194） |
| Answer 行块 + 末尾汇总行拼接串，改前 MD5 | `C0A69259BA2E4B48081056AD4CEA8755` |
| Answer 行块 + 末尾汇总行拼接串，改后 MD5 | `C0A69259BA2E4B48081056AD4CEA8755` |
| 逐字比较 | **完全相同** |

- 实测答案序列：`BACDB | ACBDA | BADCD | DBBCA | ACDBC`，全文串 `BACDBACBDABADCDDBBCAACDBC`
- 与 R2-C4 §2.3 / §2.6 **逐字记录**的序列一致；与第 200 行汇总行 `B A C D B　A C B D A　B A D C D　D B B C A　A C D B C` 一致
- 汇总行与 Answer 行**内部自洽**（篇数 5 / 题目数 25 / 比值 5 全部与实测一致）

---

## 1. 必跑门禁原始输出（_COMMON.md §2，原样粘贴，未转述）

执行命令（工作区根目录）：`pwsh -Command "& docs/pipeline/wordcount-gate.ps1"`

连续执行两次，输出与退出码均稳定：

```
PASS: no material block exceeds its limit
exit=[] at 2026-10-03T22:24:55.5178910+08:00
PASS: no material block exceeds its limit
exit=[] at 2026-10-03T22:24:58.1799330+08:00
```

- 工具层报告的进程退出码：**0**
- 脚本 stderr：**空**
- **透明说明**：`$LASTEXITCODE` 读出为空串，我已打开 `docs/pipeline/wordcount-gate.ps1` 逐行核对——该脚本**不含 `exit` 语句**，只输出 `PASS: no material block exceeds its limit` 或 `OVER-LIMIT BLOCKS: n` 两种字符串；因此"PASS 字符串 + 进程退出码 0"即为该门禁的全部判据。我**不**把空串写成"退出码 0"，也不把"PASS"写成"已核验到 C4 段"以外的东西。
- **该脚本的覆盖范围已核实**：它对 `data/item-bank/` 与 `data/item-bank/prod/` 下全部 `*.md` 扫描，按文件名首字母取类（`C4.md`→C 类，上限 220），逐 `## ` 块、逐 `**Passage**`/`**Dialogue**` 正文以 `\s+` 空白分词计数。`C4.md` 确在扫描范围内。
- ⚠ **脚本只检查上限**（源码判断式为 `-gt $lim`），**不检查 C 类的 150 下限**。故 C 类下限必须由复核员手工复核，见 §2.2——本轮已手工补上。

---

## 2. 必查项逐项过（REVIEW-RUBRIC 1.7–1.10）

### 2.1 §1.7 跨篇重复（脚本扫描，非目测）

**开场白归一化扫描**（首句去标点、转小写、空格归一后建 key）：

| 篇 | 归一化首句 |
|---|---|
| C4-01 | `last spring our neighborhood opened a small canteen for old people` |
| C4-02 | `every tuesday morning a small legal advice office opens in our community center` |
| C4-03 | `the old park in our town holds a temple fair every spring` |
| C4-04 | `a small table appeared under the stairs of our building six years ago` |
| C4-05 | `our community opened a small parcel point under the library two years ago` |

**互异 5/5，命中 0。**

**句级 Jaccard 扫描**（停用词表 + 去标点 + 转小写，阈值 0.6）：

- 全卷句子数：**14 / 14 / 14 / 13 / 13 = 68**（与 R2-C4 §2.1 的 68 句一致 ✔）
- 跨篇两两句对：**1849 对**，相似度 **> 0.6 的句对 = 0**
- 篇内两两句对：命中 **0**
- 最高相似度实测 = **0.333**，为 C4-04 首句 `A small table appeared under the stairs of our building six years ago.` ↔ C4-05 首句 `Our community opened a small parcel point under the library two years ago.`——均为"X 处出现/开设了一个设施"的表层同构，场景、用词、后续内容全异，**人工判读为非情境雷同，不判缺陷**。
- 人工判读：5 篇情境（老年食堂 / 社区法律援助 / 庙会糖画 / 楼道修理桌 / 社区快递点）互不雷同。**阴性。**

### 2.2 §1.7b + §1.10 词数（口径写明，并含 150 下限的脚本盲区补测）

**所用口径**：按空白分词（连续非空白字符序列计 1 词）；**只数材料正文**（`**Passage**` 段内全部内容）；不含 `## 编号 标题`、不含 `**Q1**`–`**Q5**` 题干、不含选项、不含 `**Answer**` 行、不含末尾汇总行与 HTML 注释块。与门禁脚本 `Get-Blocks` 的取块逻辑逐条对齐（C 类材料为单行，行号 3 / 42 / 81 / 120 / 159）。

| 材料 | 行号 | **改前实测** | **当前实测** | 增量 | C 类区间 150–220 | 距 220 上限余量 |
|---|---|---|---|---|---|---|
| C4-01 银发食堂 | 3 | 194 | **194** | 0 | 合格 | 26 |
| C4-02 周二的法律咨询台 | 42 | 193 | **193** | 0 | 合格 | 27 |
| C4-03 老公园的春日庙会 | 81 | 199 | **199** | 0 | 合格 | 21 |
| C4-04 楼道下的修理桌 | 120 | 196 | **202** | **+6** | 合格 | **18** |
| C4-05 图书馆下的快递点 | 159 | 194 | **194** | 0 | 合格 | 26 |

- **5 篇全部落在 150–220 双侧区间内**：上限 202/220 未超；**下限 193 ≥ 150 亦全部满足**（此下限项门禁脚本不检，为我手工补测）。
- 改前 5 个数字与 R2-C4 §2.2 记录逐篇吻合；改后 5 个数字与任务书转述的修复方申报（194/193/199/202/194）逐篇吻合。**双方数字均被我独立复现，无冲突。**
- **零余量检查**：无。最小余量为 C4-04 的 18 词（202/220），非 §1.7b 所指"恰好贴限"（220/220）。按 §1.7b「零余量不判缺陷」的精神，**不判缺陷**，但余量已从 24 词降至 18 词，记为**轻微 9**（仅提示，不阻断）。

### 2.3 §1.8 答案位置排列（整卷级）

- 答案序列（逐行读取实测）：`BACDB | ACBDA | BADCD | DBBCA | ACDBC`
- 全文序列：`BACDBACBDABADCDDBBCAACDBC`

**周期性检测（p = 2–6）**：

| p | 首个失配位 | 结论 |
|---|---|---|
| 2 | seq[0]=B vs seq[2]=C | 阴性 |
| 3 | seq[0]=B vs seq[3]=D | 阴性 |
| 4 | seq[3]=D vs seq[7]=B | 阴性 |
| 5 | seq[0]=B vs seq[5]=A | 阴性 |
| 6 | seq[0]=B vs seq[6]=C | 阴性 |

**五项全部阴性**（用 0 基与 1 基两种下标复算，结果一致）。

**连续扎堆（≥3 连相同）**：最长同字母连段 = **2**（`DD`、`BB`、`AA` 各 1 处）。**阴性。**

**字母分布 / 四字母覆盖**：A=6、B=7、C=6、D=6，共 25。**A/B/C/D 全部被用作正确答案，无固定陷阱字母。**

**Q5 主旨题答案与本篇前四题重复**的篇数：C4-01 B✔、C4-02 A✔、C4-03 D✔、C4-04 ✘、C4-05 C✔ = **4/5**。数学期望 3.42/5，实测 4/5 属噪声范围。**不判缺陷**（专门记录以防下一轮误抓）。

### 2.4 §1.8b 位置偏斜与键位覆盖 / §1.8c 槽位算术 —— **不适用（C 类选择题，D 类专属）**

- §1.8b、§1.8c 的规范原文限定为「表格填空类必查」；本批次为 C 类短文五问（选择题），卷内无 `**Table**`/`**Word Bank**`/`**Answers**`、无空①②③、无词库五选三结构。**门禁项判定为「不适用」并说明理由**（不按 PASS 充数，_COMMON §6）。
- **附加等价扫描**（非门禁，供参考）：

| 位置 | 5 篇该位答案 | 最高频占比 |
|---|---|---|
| Q1 | `BABDA` | 2/5 = 40% |
| Q2 | `ACABC` | 2/5 = 40% |
| Q3 | `CBDBD` | 2/5 = 40% |
| Q4 | `DDCCB` | 2/5 = 40% |
| Q5 | `BADAC` | 2/5 = 40% |

任一位置最高频 40% ≪ 70% 阈值 → **阴性**。盲猜得分：全卷最高频字母 B = 7/25 = **28%**；单篇内最高 2/5 = 40%。可套规律程度低。

### 2.5 §1.9 题数比（C 类专属硬约定）

- `## ` 段数 = **5**（C4-01…C4-05，编号连续、无缺号、无重号）
- `**Answer**` 行数 = **25**；`**Passage**` 行数 = 5；`**Qn**` 行数 = 25；选项行数 = **100**
- 选项标签统计：`- A.` 25 次、`- B.` 25 次、`- C.` 25 次、`- D.` 25 次 —— **无缺选项、无多选项**
- 同题内 4 个选项文本去重后**无碰撞**（25 题全部通过）
- 25 个 Answer 全部匹配 `^**Answer** [A-D]$`，**无缺号、无多值**；每个答案字母在本题的 4 个选项中均真实存在（25/25 通过）
- **25 ÷ 5 = 5 = C 类约定「1 篇短文 / 5 题（Q1–Q5）」→ 成立**
- 全文 **无以 `# ` 开头的元数据区块**（以 `# ` 开头的行数 = 0；`## ` 开头的行仅 5 行题号标题行，属 §1.6 结构标记与 _COMMON §4 明令保留项）

### 2.6 §1.7 考点分类（事实 / 推断 / 主旨）与全卷推断题总数

| 题号 | C4-01 | C4-02 | C4-03 | C4-04 | C4-05 |
|---|---|---|---|---|---|
| Q1 | 事实（价格 12 元） | 事实（免预约） | 事实（方法：糖+热石板） | 事实（只收配件钱） | 事实（留名→电话通知） |
| Q2 | 事实（周三免费） | 事实（逐行解释+画表） | 事实（八年前学校邀约） | 事实（三条松腿木椅） | 事实（教人用手机办业务） |
| Q3 | 事实（任何人可加菜） | 事实（有时商家是对的） | 事实（60 余年） | 事实（41 张贴墙上） | 事实（7 件送本地家庭） |
| Q4 | **推断**（陪伴 > 饭菜） | **推断**（诚实 > 胜负） | **推断**（怕失传） | **推断**（要笔笔清楚） | **推断**（不浪费） |
| Q5 | **主旨** | **主旨** | **主旨** | **主旨** | **主旨** |

- 全卷：**事实 15 ｜ 推断 5 ｜ 主旨 5**，共 25。
- **R2-C3 的 M5 教训（"4 道查词 + 1 道主旨"）在本卷不复现**：每篇固定 3 事实 + 1 推断 + 1 主旨，推断题占 20%，且推断题必须跨句才成立（不能靠字面命中）。
- **考点重复检查**：15 道事实题分布在 5 篇、每篇 3 道，分别落在"数字/规则""人物行为""程序/事件"三种不同问法上，跨篇问法也不重样（见 2.6 表）→ **阴性**。
- 判定：**阴性，不判缺陷**。此处的判断口径一并写明——REVIEW-RUBRIC 未规定推断题数量下限，本卷每篇必有 1 道真推断，已高于 R2-C3 的失败形态；若调度方认为需要更高比例，可另立标准再轮，本轮不擅自加严。

### 2.7 材料中的数字逐个复算（§1.2 数字一致性）

| 篇 | 原文数字 | 复算 |
|---|---|---|
| C4-01 | four volunteers / over sixty / ten to two / twelve yuan / seventy-eight / three times a week / two of the volunteers / ten families / sixty-one dishes / eleven on the menu | 4 人 ≥ 2 人（挑 2 人在雨天使）✔；cook lunch 10:00–14:00 合理 ✔；11 ≤ 61 ✔；78 岁、每周 3 次合理 ✔。**无矛盾** |
| C4-02 | Two lawyers / three student volunteers / seventy-two / forty minutes / two hundred people / sixty of them | 5 人 ✔；72 岁 ✔；40 分钟逐行讲解 ✔；200 人中 60 人情况改变、余 140 人得到建议，前后自洽 ✔。**无矛盾** |
| C4-03 | more than sixty years / one winter / Eight years ago / One year became eight / ten minutes | "One year became eight" 与 "Eight years ago … almost stopped" 同指 8 年跨度，时间线自洽 ✔；"only one in the town who can do it" 与"gives a free lesson"并置（怕失传的动机成立）✔。**无矛盾** |
| C4-04 | six years ago / four things only / sixty / eight and five / three loose legs / four yuan / forty-one | 桌上四样 = 螺丝盒 1 + 钳子 1 副 + 电钻 1 + 油罐 1 = **恰 4 件** ✔；41 张纸条与 Q3 题干 `forty-one` 一致 ✔；4 元是"一个电 kettle 开关"的价，Q1 选项 B（每单 4 元）为错项，前后一致 ✔。**无矛盾（修复后）** |
| C4-05 | two years ago / every afternoon / A year ago / six days / four of them / two hundred and forty lockers / seven parcels | 240 个柜 vs 上月滞留 7 件 ✔；6 天取不到包裹与"滞留超一周"阈值相容 ✔；"four of them"（4 个架子）✔。**无矛盾** |

---

## 3. R2-C4 严重缺陷的修复验证（逐条独立判定）

### 3.1 严重 1 · C4-04 `Mr Qian never keeps a borrowed thing longer than one evening.` —— **已解除**

**R2 的原判（回原文复核，成立）**：改前第 120 行 `Mr Qian never keeps anything longer than one evening.` 中的 `anything` 是无限定全称量词，与同段两处事实互斥：
1. `A small table appeared under the stairs of our building six years ago. On it there were four things only: …` —— 桌上四件工具已放置六年；
2. `Last year he wrote the cost of every repair on a small paper and posted all forty-one of them on the wall.` —— 41 张纸条跨一整年留存。

**当前磁盘文本（第 120 行，逐字）**：

```
A small table appeared under the stairs of our building six years ago. On it there were four things only: a box of screws, a pair of pliers, a small electric drill and a tin of oil. Above it somebody had written, "Bring it, and I will fix it. No money, only parts." The man behind the table is Mr Qian. He worked in a factory until he was sixty; now he opens his door at eight and closes it at five. People bring kettles, desk lamps, walking sticks and radios, and once a small wooden chair with three loose legs. Mr Qian never keeps a borrowed thing longer than one evening. Nothing at the table is free except the work. A kettle needs a new switch for four yuan; Mr Qian writes the number on a slip of paper and never says what his labour was. Last year he wrote the cost of every repair on a small slip of paper and posted all forty-one of them on the wall. The table has become a small shop without a roof. Mr Qian says he never learned to run a shop, but people come back because they have nowhere else to go.
```

**我的独立判定：矛盾已解开。** 量词被限定到 `a borrowed thing`（单数、有限定的"借来的东西"）后：
- 桌上的螺丝/钳子/电钻/油罐是他自己的工具（材料从未说它们属于客人），**不落在 `borrowed` 的辖域内**；
- 41 张纸条是他自己写的账目记录，同样不落在辖域内；
- 材料中真正"借来"的只有客人送修的 kettle / desk lamp / walking stick / radio / chair，材料恰好说明它们当 evening 当场取走。

⇒ 全篇不再有任何一处事实与该句冲突。**严重缺陷解除。**

**关于修复方自己留下的疑问（"客人送来的物件是暂存托付，未必算借来"）——我认为不成立，不计缺陷。** 理由：该句主语是 `Mr Qian`，动词是 `keeps`，施事与受事方向是"**他收下并留着**"。客人把东西托付给他保管修好，在他这一侧就是"**他借来（暂收）的东西**"，次日归还正合 `borrow` 的本义（临时取得、约定归还）。若从客人视角说才需要 `lend`。句子的语用方向与材料事实一致，不构成"表述与事实不符"。

### 3.2 R2 中等 1 · C4-04 两处 `on a paper` —— **在 C4-04 已解除；同类问题在 C4-02 残留（记轻微 3）**

- 第 120 行两处现文已逐字核实为 `writes the number on a slip of paper` 与 `on a small slip of paper` —— **地道，且"一张小纸条"的语义比原文更贴合"贴满一墙的 41 张纸"。**
- 但全篇检索 `paper` 的 5 处上下文后发现：**C4-02 第 42 行 `Last spring she signed a paper she did not understand.`** 仍是"把 paper 当可数名词直接加冠词"的同类用法，R2 未定位到、F2 也未处理。处置见轻微 3。

### 3.3 R2 轻微 1 · C4-03 `the plan` —— **已处理，但引入新瑕疵**

- R2 原文引文（回原文复核，**成立**）：`The fair has run for more than sixty years, and the plan is still the one my grandmother knew.` —— `the plan` 前文从未出现。
- 现文（第 81 行）：`The fair has run for more than sixty years, and the fair is still the one my grandmother knew.`
- **我的判定：`. 指代确实变清楚了** —— `the fair` 在首句 `holds a temple fair every spring` 与前半小句 `The fair has run…` 中已两次确立，`the fair is still the one…` 的所指唯一，不存在 R2 所指的"布局 vs 日程"二义。**修复方的这一取舍成立**（R2 建议的 `the layout` 反而会制造一个全新悬空指代——材料中从未出现 layout，R2 该条建议本身不如修复方的方案）。
- **但代价是新引入了紧邻名词短语重复**：同一小句内 `The fair … the fair` 连续出现，且后半小句与前半小句语义高度重叠（都在说"庙会老、没变"）。判**轻微 1**，仅记录，不必改。
- 词数无影响（1 词换 1 词）。

### 3.4 R2 轻微 2 · C4-04 `opens his door at eight` —— **未修，我独立定级为轻微（承 R2）**

现文：`He worked in a factory until he is sixty; now he opens his door at eight and closes it at five.`

- 材料把修理桌设在 `under the stairs of our building`（公共楼道），却用"开关自家门"表达出摊时段，衔接确实松散。
- **但不构成 §1.2 的"人物/物品/场所冲突"**：楼道某一层若有 Mr Qian 的住户门，桌设于其门外、他从门内取活并按时开门，逻辑成立；且此句不支撑任何一道题（25 题中无一题以此句为答案依据）。
- **定级轻微**（承 R2）。修复方主动留档，未超范围。

### 3.5 R2 轻微 3 · 结尾模板 —— **未真正处理（详见 §6.2）**

见 §6.2 的独立统计与反证。

### 3.6 R2 轻微 4 · 末尾 HTML 注释块 —— **R2 的定性不成立，本轮不予计缺陷**

R2 称该块"超出 _COMMON.md §4 的『题目文件只许包含』清单"。**回原文核对，该声明不成立**：_COMMON.md §4 的允许清单第 7 项明确包含 **`注释块`**，且同节写明「HTML 注释块允许保留（词数口径本就排除注释块），但注释内不得出现答案或解题提示」。第 196–199 行内容为：

```
<!--
篇数：5 ／题目数：25 ／比值：5
存疑词：canteen、clinic、takeaway、landlord、deposit、refund、parcel、locker、screws、pliers、lantern、couplets、dumplings（库内无课标五级词表可对照，无法核实官方词表，单列备查）。
-->
```

逐项核对：**无答案、无解题提示、无考点提示**；仅为统计与存疑词备查。**符合 _COMMON §4，判阴性。**

---

## 4. 已复核题号清单（25 行，逐题逐选项，无抽样）

**计数约定**：「严重 / 中等 / 轻微」三列只计**该题自身**（题干、选项、键位）的缺陷；材料级瑕疵写在末列并注明归属篇目，**不重复计入各题**（避免虚增）。

| # | 题号 | 所属材料 | 键位（原文） | 判定依据（原文片段，逐字回查） | 逐选项排除记录（A/B/C/D 四项全判） | 严 | 中 | 轻 | 结论 / 备注 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | C4-01 Q1 | 银发食堂 | B | `a full meal costs only twelve yuan` | A Ten/C Eighteen/D Twenty 均为原文未出现的价，与正确项同为"…yuan"结构 | 0 | 0 | 0 | 通过；4 干扰项同类（价格） |
| 2 | C4-01 Q2 | 银发食堂 | A | `Old people who live alone can eat there free on Wednesdays` | B "meal sent home"——送餐仅限 `people who cannot walk well`；C 帮厨无据；D `again` 无据 | 0 | 0 | 0 | 通过 |
| 3 | C4-01 Q3 | 银发食堂 | C | `anyone can add a dish to tomorrow's list` | A 开会无据；B 对面诊所店铺无据；D 提前一周订无据 | 0 | 0 | 0 | 通过 |
| 4 | C4-01 Q4 | 银发食堂 | D | `"The meal is only half of it." "It is that somebody is waiting for me."` | A 想吃更好的菜——与 `simple but warm`/无抱怨相斥；B 晚上开门——与 `ten to two` 相斥；C 在家吃——与 `goes three times a week` 相斥 | 0 | 0 | 0 | 通过；**注：新句引入后答案更顺，但见材料级轻微 2** |
| 5 | C4-01 Q5 | 银发食堂 | B | `the kitchen is run by four volunteers`＋`make a noisy, bright room where old neighbors meet every day` | A/C/D 所述主体（自家选菜/在家做/诊所教做）全文无据 | 0 | 0 | 0 | 通过；主旨题 |
| 6 | C4-02 Q1 | 法律咨询台 | A | `anyone can walk in without an appointment` | B 需写信、C 只限周五、D 收费——三项均与原文直接相反 | 0 | 0 | 0 | 通过 |
| 7 | C4-02 Q2 | 法律咨询台 | C | `sat with her for forty minutes and explained every line. He drew a simple table on paper` | A 读给她家人听、B 要商家复述条款、D 让她另找律师——三项均无据 | 0 | 0 | 0 | 通过；干扰项同为"他做了什么" |
| 8 | C4-02 Q3 | 法律咨询台 | B | `The office does not fight every case. Sometimes the answer is simply that the shop is right.` | A `always` 被前句否定；C 收费、D 寄长信——无据 | 0 | 0 | 0 | 通过 |
| 9 | C4-02 Q4 | 法律咨询台 | D | `The workers say the best part is not winning.`＋`including the person in front of you` | A 觉得小问题无解——与"帮 140 人避坑"相斥；B 以胜仗论好坏——被同句否定；C 顺着来访者说——与"诚实"相斥 | 0 | 0 | 0 | 通过；**跨句推断成立** |
| 10 | C4-02 Q5 | 法律咨询台 | A | `a small legal advice office`＋`Most people come with small problems` | B/C/D 主体（店铺改价/学生学庭审/为何买二手机）全文无据 | 0 | 0 | 0 | 通过；主旨题 |
| 11 | C4-03 Q1 | 春日庙会 | B | `draws sugar pictures with a small spoon, a hot piece of stone and melted brown sugar` | A 面包+平锅、C 冷颜料+玻璃、D 热水+金属板——4 项同为 "With X on Y" | 0 | 0 | 0 | 通过；干扰项同类性优秀 |
| 12 | C4-03 Q2 | 春日庙会 | A | `Eight years ago Mr Wu almost stopped… Then a school asked him to come and show the skill to a class.` | B 父亲回庙会无据；C `suddenly went down` 与 `Sugar became expensive` 相反；D 年轻人"开车送他去公园"——原文是"每晚送他回家"且非八年前 | 0 | 0 | 0 | 通过；4 项唯一贴合 |
| 13 | C4-03 Q3 | 春日庙会 | D | `The fair has run for more than sixty years` | A 十年前、B 四十余、C 约八年——C 为有效干扰项（取自另一处事实） | 0 | 0 | 0 | 通过 |
| 14 | C4-03 Q4 | 春日庙会 | C | `Today he is the only one in the town who can do it`＋`gives a free lesson to any child` | A 卖给摊位商店无据；B "只有本镇孩子该学"被 `any child` 排除；D "他的画是最好艺术"被 `He says a sugar picture is not real art.` 排除 | 0 | 0 | 0 | 通过；**跨句推断成立** |
| 15 | C4-03 Q5 | 春日庙会 | D | `He learned the skill from his father in one winter.`＋`keeps making it` | A 年轻画家、C 节俭家庭、B 公园闭园——三项无据 | 0 | 0 | 0 | 通过；主旨题 |
| 16 | C4-04 Q1 | 楼道修理桌 | D | `No money, only parts.`＋`Nothing at the table is free except the work. A kettle needs a new switch for four yuan` | A 零件也免费——与"only parts"相反；B 每单 4 元——4 元是"开关"的价非"工钱"；C 看时长定价无据 | 0 | 0 | 0 | 通过；材料另有严重 1（原）+轻微 3 条，均已解除或仅记录 |
| 17 | C4-04 Q2 | 楼道修理桌 | B | `once a small wooden chair with three loose legs` | A 太重、C 工厂新买、D 搁三周——三项无据 | 0 | 0 | 0 | 通过 |
| 18 | C4-04 Q3 | 楼道修理桌 | B | `posted all forty-one of them on the wall` | A 收进楼梯下箱子、C 交给工厂、年底扔掉——三项无据 | 0 | 0 | 0 | 通过；**题干 `small papers` 与材料 `a small slip of paper` 用词不一致，见轻微 5**（所指相同，判分无歧义） |
| 19 | C4-04 Q4 | 楼道修理桌 | C | `writes the number on a slip of paper and never says what his labour was` | A 要收工钱——被同句否定；B 怕人多——与 `people come back because they have nowhere else to go` 相斥；D 年底收摊无据 | 0 | 0 | 0 | 通过；**跨句推断成立** |
| 20 | C4-04 Q5 | 楼道修理桌 | A | `He worked in a factory until he was sixty`＋`The table has become a small shop without a roof.` | B 大楼决定向每家收费无据；C 工厂关闭修理间——与"他六十岁前在工厂上班"相斥；D 靠卖新零件发财——与"never says what his labour was"/只收配件钱相斥 | 0 | 0 | 0 | 通过；主旨题。（选项 A 用 `corner` 概括楼梯下空地，属主旨题的合理转述，不判缺陷） |
| 21 | C4-05 Q1 | 快递点 | A | `People who do not like lockers can leave their name and get a phone call instead.` | B 志愿者送货到家、C 加付小费、D 请邮局开箱——三项无据 | 0 | 0 | 0 | 通过 |
| 22 | C4-05 Q2 | 快递点 | C | `comes every afternoon to show people how to take a photo, pay for a box and ask for a refund`＋`He uses his own phone` | A 送箱去邮局无据；B 查柜门无据；D 把老人名字写在架子上无据（原文写的是"不会用柜子的老人"的架子） | 0 | 0 | 0 | 通过 |
| 23 | C4-05 Q3 | 快递点 | D | `only seven parcels stayed for more than a week, and the workers gave them to local families` | A 留柜里——与 `stayed for more than a week` 后被处置相斥；B 退回邮局无据；C 放小架子无据（架子是另一条情节线） | 0 | 0 | 0 | 通过；C/D 互斥且仅 D 合原文 |
| 24 | C4-05 Q4 | 快递点 | B | `A service point, they say, is also a place where nothing is thrown away.`＋`it does more than store boxes` | A "只管保管"被同句否定；C 希望包裹变少无据；D 想随图书馆搬迁关闭无据 | 0 | 0 | 0 | 通过；**跨句推断成立** |
| 25 | C4-05 Q5 | 快递点 | C | `The point is free, but it does more than store boxes.`＋`a volunteer, Uncle He…` | A 赚钱私营店无据；B 邮局送免费箱给病患家庭无据；D 图书馆教读长信息无据 | 0 | 0 | 0 | 通过；主旨题 |

**合计：25 题全部实读，100 个选项逐个判定，无抽样。**
题目层面缺陷 **0 条**；材料/文件层面缺陷 **9 条（严重 0 ｜ 中等 0 ｜ 轻微 9）**。

**其他题目层结构项（逐项实测）**：25 题各 4 个选项；A/B/C/D 各 25 次；同题内选项文本无重复；25 个 Answer 均为单一大写字母且在本题选项中真实存在；无真实品牌、真实人名、争议内容、地域或性别刻板印象。

---

## 5. 轻微缺陷（9 条，记录即可，可择机修）

| # | 位置 | 原文 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | C4-03 第 81 行（本轮新引入） | `The fair has run for more than sixty years, and the fair is still the one my grandmother knew.` | 同一小句内 `The fair` 紧邻重复，且后半小句与前半小句语义重叠（都在说"庙会老、没变"）。修复方改用 `the fair` 确实解决了 R2 指出的悬空指代（见 §3.3），但代价是这个重复 | 可改为 `The fair has run for more than sixty years, and it is still the one my grandmother knew.`（`it` 指代明确、词数不变） |
| 2 | C4-01 第 3 行（本轮新引入） | `"The meal is only half of it." "It is that somebody is waiting for me."` | `of it` 的先行词未在文中锚定（"它"＝食堂体验／这顿饭的完整意义），第二个 `It` 又要靠省略链条回指"另一半"。口语可接受，但作为阅读语料偏松散 | 可改为 `"The meal is only half of it." "The other half is that somebody is waiting for me."`（+2 词，改后 C4-01 为 196，仍在区间） |
| 3 | C4-02 第 42 行（R2 中等缺陷的同class 残留） | `Last spring she signed a paper she did not understand.` | 与 R2 在 C4-04 判为中等的 `on a paper / on a small paper` 同属"paper 作可数名词"痕迹。R2 只定位到 C4-04，F2 也只改了 C4-04，全篇仍留一处。**说明我与 R2 分级的差异**：`sign a paper`（"签一份文件"）在美式英语中有稳定用法，歧义为零，故我只判**轻微**，不上调为中等——若调度方按 §1.3 字面要求全篇统一，可同步改为 `signed a document`。**注意连带**：C4-02 Q2 选项 A `He read the paper aloud to her family instead.` 中的 `the paper` 须一并改，否则选项与材料指代脱节 | 视是否统一体例而定；若改，须同时改 Q2 选项 A，**但绝不可动 C4-02 Q2 的 Answer 行 C** |
| 4 | C4-04 第 120 行（R2 轻微 2，修复方主动留档未修） | `now he opens his door at eight and closes it at five` | 公共楼道场景下说"开关自家门"衔接松散。不构成场所冲突（详见 §3.4），且不支撑任何题目 | `now he is at the table from eight to five` |
| 5 | C4-04 Q3 题干（修复方主动留档未修） | `What did Mr Qian do with the forty-one small papers?` | 题干 `small papers` 与材料 `a small slip of paper` 用词不一致；所指相同（41 张纸条），判分无歧义 | 题干改为 `the forty-one slips of paper` 或材料保留 `a small slip of paper` 而题干写 `the forty-one pieces of paper`。**不得动 Answer 行 B** |
| 6 | 全卷 5 篇结尾（承 R2 轻微 3，本轮独立复核后**升级为未修**） | 见 §6.2 的逐篇末尾清单 | "某人转述 + 否定/对比式"结尾模板仍覆盖 **4/5–5/5 篇**，远未消除。**R2 建议改写的 C4-03 未被改，F2 只动了 C4-01 的第 7 句（非结尾句）**，故模板数未下降 | 若要真正降到 3/5，需改 C4-03 或 C4-05 的收尾；只改 C4-01 的中部引语无效（见 §6.2 反证） |
| 7 | 全卷拼写体例 | `neighborhood` / `neighbors` / `community center` / `takeaway`（美式）↔ `labour`（英式） | 同一学生语料文件内美式／英式拼写体例混用。R2 引用了 `labour` 未作判定 | 统一为 `labor`（与 `neighborhood/center` 一致）或统一为 `labour/neighbourhood/centre`。**注意**：`takeaway`（英式=美式 takeout）亦在混用之列 |
| 8 | C4-04 第 120 行 | `Mr Qian writes the number on a slip of paper and never says what his labour was.` | `never says what his labour was` 表述生硬（" labour 是什么"），上下文里指的是"他从不说工钱是多少"。R2 引用了此句未作判定 | `never says what his labour cost` |
| 9 | C4-04 第 120 行（词数） | 实测 **202 词 / 上限 220 / 余量 18** | C4-04 是全卷最长的一篇，余量已由 24 词降至 18 词（约一句半）。未贴限，按 §1.7b **不判阻断**，但任何后续微调都必须重新计数 | 若采纳轻微 4/5/8 的任一改法，改完须重跑 C4-04 词数（各改法均为等词数替换，不影响计数） |

---

## 6. 与任务书 / 依据报告描述不符之处（逐条反证）

### 6.1 修复方申报的统计之一不成立

**声明**（任务书转述）：「修复方报告称严格逐字（大小写敏感）改前只出现 1 次、忽略大小写才是 2 次」。

**我的实测**（对**改前**全文，即 §0.3 逆套用重建的 12351 字节文本）：

| 检索串 | 严格（区分大小写） | 忽略大小写 |
|---|---|---|
| `The best part is not the meal.` | **1** | **1** ← 与声明不符 |
| `the best part is not the meal.` | 0 | 1 |
| `**The best part is not**` | **1** | **2** ← 声明所指的"2 次"其实是这个更短的片段 |
| `the best part`（忽略大小写） | — | 2 |

**该声明不成立**：`The best part is not the meal.` 这个完整串在改前全文中**严格 1 次、忽略大小写仍是 1 次**（C4-02 用的是 `the best part is not winning.`，后半段不同）。"忽略大小写 2 次"只在检索**更短的片段** `The best part is not` 时才成立（= C4-01 一次 + C4-02 一次）。修复方把两个不同检索串的统计混在了一起。

**对结论的影响：无。** 该统计原本是为佐证"改后不再逐字重复"，而改后 `The meal is only half of it.` 严格 1 次、`the best part is not` 忽略大小写也只剩 1 次（C4-02 一处）——**去重的目标事实上达成了，只是达成方式比申报的更彻底**。

### 6.2 修复方申报的统计之二不成立：「结尾模板由 4/5 降到 3/5」

**声明**（任务书转述）：「修复方报告称……结尾模板由 4/5 降到 3/5」。

**我的反证（三条，逐条可复现）**：

1. **被改的那句不是结尾句。** C4-01 材料我按句切分为 **14 句**；第 4 处改动落在**第 7 句**：
   - 第 7 句（本次被改）：`"The meal is only half of it."`
   - 第 13–14 句（真正的结尾，本次**未被触碰**）：`The cooks do not think of themselves as a restaurant. They say their real work is to make a noisy, bright room where old neighbors meet every day, and to notice at once when somebody does not come.`
   而第 13–14 句本身就是"某人转述 + 否定/对比"模板（`do not think of themselves as…` ＋ `their real work is…`）。**结尾模板一个都没少。**

2. **被改的新句仍完整保留该模板。** `"The meal is only half of it." "It is that somebody is waiting for me."` = "你以为的那件（饭）只是一部分 / 真正重要的是另一件"——与 `The best part is not the meal.` 是**同一个修辞模板**。把"不是饭"换成"饭只是一半"，模板未变。

3. **逐篇清点（我的实测，原文逐字）**：

| 篇 | 材料最后两句 | 是否属"某人转述 + 否定/对比"模板 |
|---|---|---|
| C4-01 | `The cooks do not think of themselves as a restaurant. / They say their real work is to make a noisy, bright room…` | **是**（未被改动） |
| C4-02 | `The workers say the best part is not winning. / It is showing people that a rule is something everybody has to follow…` | 是 |
| C4-03 | `He says a sugar picture is not real art. / It lasts about ten minutes before somebody eats it.` | 是 |
| C4-04 | `Mr Qian says he never learned to run a shop, / but people come back because they have nowhere else to go.` | 是（转述 + 对比转折） |
| C4-05 | `A service point, they say, is also a place where nothing is thrown away.` | 是 |

   ⇒ **按"材料结尾"口径计为 5/5；按"R2 列举的口径"计也为 4/5–5/5。无论用哪个口径，都不是 3/5。**

**该声明不成立。** 附带指出 **R2-C4 轻微 3 自身也有事实错误**：它把 C4-01 的 `The best part is not the meal…` 列为"结尾句"，而该句在原文里是第 7/14 句，位于材料中部（其后还有送餐、雨天送汤、菜单板、点菜统计、厨师自述共 6 句）。R2-C3 的后续修复方沿用了这个错误口径。

### 6.3 依据报告 R2-C4 的一处引文不逐字

R2-C4 §3 第 19 行引文：`he writes the cost of every repair on a small paper and posted all forty-one of them on the wall`。
改前原文实为：`Last year he **wrote** the cost of every repair on a small paper and posted all forty-one of them on the wall.`（`writes` → `wrote`，且引文省略了主句 `Last year`）。
R2-C4 §严重缺陷 1 与 §中等缺陷 1 中的同一句引用是**逐字正确**的，可见是表格栏的转述笔误。**该引文错误不影响其结论**（41 张纸条跨年留存的事实成立），但依 _COMMON §7 在此记录。

### 6.4 依据报告 R2-C4 轻微 4 的定性不成立

R2 称末尾 HTML 注释块"超出 _COMMON.md §4 的『题目文件只许包含』清单"。**回原文核对不成立**——_COMMON §4 的允许清单第 7 项即为"注释块"，且只禁止注释内出现答案或解题提示。实测该块无答案、无提示。详见 §3.6。

### 6.5 与任务书描述相符之处（明确记录，便于调度方对账）

- 任务书转述的 R2 缺陷计数「严重 1 ｜ 中等 1 ｜ 轻微 4」——**与 R2-C4 报告原文一致**，本轮对该 5 条已逐条独立验证（§3）。
- 任务书转述的 5 处改动——**全部在当前磁盘文件中真实存在，且每处在全文中唯一出现**（§0.3）。
- 任务书转述的修复方词数「194/193/199/202/194」——**与我的独立复算逐篇吻合**（§2.2）。
- 任务书「其中 C4-04 已涨到 202，余量只剩 18 词」——**属实**（改前 196 → 改后 202，+6 = 三处各 +2）。
- 任务书授权我读 R2-C4.md——**已读**；reviews/ 与 fixes/ 下其余文件**一律未读**（本轮仅对 prod/C4.md、REVIEW-RUBRIC.md、_COMMON.md、V-C4.md、wordcount-gate.ps1 做读取，无任何 grep/glob 扫描 reviews/ 或 fixes/ 目录）。

### 6.6 一处流程口径不一致（仅记录，不影响本题判定）

任务书称修复记录为 **F2-C4**；但 _COMMON §4 的机械推导示例写的是「**R2-C3 对应 F3-C3**」，R2-C4 自己在轻微 4 中也建议移入 **F3-C4.md**。两套口径不一致（轮次是否 +1）。修复记录位于 `data/item-bank/fixes/`，**按 _COMMON §0 属我禁读范围，无法核实实际文件名**，故此处仅记录并建议调度方在规约中把该命名规则写死。

---

## 7. 独立性与纪律声明

- **未修改 `data/item-bank/prod/C4.md`**：全部操作限于只读（`ReadAllBytes` / `ReadAllText` / `ReadAllLines` / 只读工具）。写报告前后各测一次 MD5，均为 `26393DA22FDB0DD7416257C900C9E5B9`、12373 字节、mtime 2026-10-03T14:13:16.9884892Z，**未变**。
- **未修改 `src/`、`tests/` 或任何项目代码与配置**。唯一读取的代码文件是 `docs/pipeline/wordcount-gate.ps1`（只读，用途是核实门禁确实覆盖 C4.md 及其判定逻辑）。
- **唯一输出文件**：`data/item-bank/reviews/V-C4.md`。
- **角色隔离**：只读了任务书点名的 `reviews/R2-C4.md`；未读 `reviews/`、`fixes/` 下任何其他文件；未检索 `docs/pipeline` 下的历史文档。
- **不采信上游自证**：§0.3 的反向套用、§0.4 的 Answer 块 MD5、§2.2 的词数、§2.1 的 Jaccard、§2.3 的周期、§2.6 的考点分类、§2.7 的数字复算，全部为我本轮实测；§6.1 与 §6.2 明确写出两条**不成立**的上游声明。
- **25 题逐题逐选项，无抽样**：100 个选项逐个记录排除理由（见 §4）。

---

## 最终判定

**通过 —— 当前磁盘版本的 C4.md 可以归档。**

判据：R2-C4 判为**严重**的 C4-04 材料自相矛盾已修复，且经我独立验证矛盾真解除（量词辖域已限缩，借方方向论证成立）；R2 判为**中等**的 `on a paper` 搭配在 C4-04 已修复（同class 残留在 C4-02 记为轻微 3）；词数门禁 PASS 且 5 篇实测 194/193/199/202/194 全部落在 C 类 150–220 双侧区间（并补测了脚本不检的 150 下限）；题数比 25÷5=5 成立；答案排列无 2–6 周期、最长连号 2、四字母全覆盖、逐题位置偏斜最高 40%；跨篇首句 5/5 互异、1849 个跨篇句对 Jaccard 无一超过 0.6（最高 0.333）；25 题 100 个选项逐个判定通过、无一缺陷；**反向套用 5 处逆替换后重建的全文 MD5 精确等于 R2-C4 基线 `C7AD9C66B1C041081ECBCDE77DB7DB80`、12351 字节，Answer 行块与末尾汇总行的 MD5 改前改后全等 `C0A69259BA2E4B48081056AD4CEA8755`——独立证明"仅 5 处改动、答案与汇总行一字未动"成立。** 遗留 **严重 0 ｜ 中等 0 ｜ 轻微 9**，按 _COMMON.md §5 属"记录即可、可择机修"，不阻断归档。同时记录：修复方申报的两条统计（`The best part is not the meal.` "忽略大小写 2 次"、结尾模板 "4/5→3/5"）**均不成立**，R2-C4 的两处引文/定性亦有误（详见 §6），但这些均不改变归档结论。
