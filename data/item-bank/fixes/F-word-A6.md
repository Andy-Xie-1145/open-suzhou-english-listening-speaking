# F-word-A6 执行记录：A6 对话超长裁剪（A 类 60 词上限）

- **任务**：把 data/item-bank/A6.md 的 15 段 Dialogue 正文降到 ≤60 词（含说话人标注口径），一个字的判分依据都不能丢。
- **性质**：超长裁剪，非缺陷修复。
- **开工校验**：`data/item-bank/A6.md` 字节长度 8056，MD5 = `140F0A904D8EF34BD8831EC663BD3A3B`，与派单给定值一致。
- **交付文件冲突检查**：开工前 `data/item-bank/fixes/F-word-A6.md` 不存在（Test-Path = False），无覆盖风险。
- **计数口径**：空白分词；只数 Dialogue 正文；**含说话人标注**；不含标题、题干、选项、Answer 行、文件头与末尾汇总行。上限 60 词，A 类无下限。
- **计数工具自校**：按上述口径复算基线，得 A6-04=65、A6-05=67、A6-08=61、A6-15=64，与词数普查结果逐项吻合，确认口径实现无误。

## 一、改前：15 段「正确答案所依赖的原文句」基线

| 题号 | 答案 | 正确答案所依赖的原文句（改前） |
|---|---|---|
| A6-01 | C | Go to bed at about ten, not at twelve. |
| A6-02 | A | Run slowly for five minutes, then five minutes of jumping. Ten minutes in all. |
| A6-03 | D | Then you can't drink it. Buy a small box at the shop, not a big bottle. |
| A6-04 | B | Put ice on it for fifteen minutes and rest at home. |
| A6-05 | A | The gym is free then. Meet in it at seven in the morning. |
| A6-06 | C | A blood test first, then an eye test, a tooth check and a height test. |
| A6-07 | B | Look away for a minute every twenty minutes, not every ten. |
| A6-08 | D | Write your worries on a piece of paper, then walk around the room for ten minutes. |
| A6-09 | A | Buy a soft one, not a hard one. / A big handle is fine. / A soft brush with a big handle. |
| A6-10 | C | Have some bread and an egg. |
| A6-11 | D | Then stay home and miss PE class. / ... and rest. |
| A6-12 | B | Meet in the gym at four, after your PE class. |
| A6-13 | C | The nurse checks your feet at seven on Monday morning, before your high jump on Tuesday. |
| A6-14 | A | Take her for a walk, not to the library. |
| A6-15 | D | Practise that on Monday and Wednesday. |

## 二、逐段改动与即时重计数

仅对 4 段超长材料动手；其余 11 段本就 ≤60，未作任何改动。

### A6-04（65 → 59，删 6 词）
1. `Can you walk to the classroom?` → `Can you walk?`（−2）。"to the classroom" 不被 A/B/C/D 任一选项引用，属场景赘语；答句 "Slowly." 仍成立。
2. `so there is no swimming either.` → `so no swimming.`（−3）。"there is" 为虚位主语、"either" 为语气赘语；对 C 项 "no swimming" 的显式否定完整保留。

**依据复验**：B 项依据句 `Put ice on it for fifteen minutes and rest at home.` **逐字未动**；A 项依据 `go to the gym and swim after school` + `The gym is closed today`；C 项依据 `swim after school` + `so no swimming`；D 项条件式 `See a doctor tomorrow if it still hurts.`（含 "if it still hurts" 条件，未删）。

### A6-05（67 → 59，删 8 词）
1. `all week, so we'll train indoors. In the gym tomorrow at four.` → `all week. In the gym tomorrow at four.`（−4）。"we'll train indoors" 与紧随其后的 "In the gym" 同义重复，属赘语。
2. `Good. The gym is free then. Meet in it at seven in the morning.` → `Good. Meet in the gym at seven in the morning.`（−4）。"The gym is free then." 与 "Meet in it" 重复；删后把回指代词 `it` 就地展开为 `the gym`，避免悬空指代。

**依据复验**：A 项依据由 `Meet in it at seven...` 变为 `Meet in the gym at seven in the morning.`，与选项 A "In the gym at seven in the morning" 仍**逐字对应**；C 项错因依据 `Four tomorrow, then seven on Wednesday.`（把 four 绑定到 tomorrow）**逐字未动**；B/D 项错因依据 `The track is closed for repairs all week.` **逐字未动**。

### A6-08（61 → 57，删 4 词）
1. `Write your worries on a piece of paper, then ...` → `Write your worries on paper, then ...`（−3）。"a piece of" 为数量赘语；改后与选项 D "Write down his worries on paper" 字面贴合度反而更高。
2. `Boy: Writing? I never thought of that. Thanks.` → `Boy: Writing? I never thought of that.`（−1）。删语气词 "Thanks."。

**依据复验**：D 项依据句语义与指称完全保留（且更贴选项）；A 项依据 `don't read in bed`、B 项依据 `Don't drink coffee` 均**逐字未动**；C 项错因依赖过去时 `I asked my classmates about the test`（已发生、未奏效），**时态逐字未动**。

### A6-15（64 → 59，删 5 词）
1. `My friend always starts fast and then gets tired.` → `My friend starts fast and gets tired.`（−2）。删副词 `always` 与重复连词 `and then` → `and`。
2. `Practise that on Monday and Wednesday. Not on Friday — you'll still be tired from ...` → `Practise on Monday and Wednesday. Not on Friday. You'll be tired from ...`（−3）。删回指代词 `that`、破折号（空白分词下计为 1 词）、副词 `still`。

**依据复验**：D 项依据 `Practise on Monday and Wednesday.`（原 `Practise that on...` 仅多一个回指代词）仍**逐字可定位**；B/C 项错因依据 `Not on Friday.` 完整保留；A 项错因依据 `the sports meeting on Thursday morning` **逐字未动**。

## 三、15 段改后词数（全部 ≤60）

| 题号 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 改前 | 58 | 57 | 59 | **65** | **67** | 59 | 58 | **61** | 58 | 53 | 59 | 51 | 56 | 53 | **64** |
| 改后 | 58 | 57 | 59 | **59** | **59** | 59 | 58 | **57** | 58 | 53 | 59 | 51 | 56 | 53 | **59** |

最大值 59，全部满足 ≤60。

## 四、改后自检

**1. 选项依据逐条复验（机械核验，60/60 通过）**
对 15 题 × 4 个选项共 60 条，逐条断言其材料依据以逐字子串形式存在于该段 Dialogue 正文中，全部通过。含 4 个被改段落的复验，已逐条列于第二节。

**2. 受保护区未改动（以字节级基线 diff 证明）**
将改前内容按字节重建为基线文件，重建件 MD5 = `140F0A904D8EF34BD8831EC663BD3A3B`，与开工时磁盘值完全一致，故该基线可作为权威比对源。对其与现文件做全量 diff：**仅 8 行发生变化（A6-04 两行、A6-05 两行、A6-08 两行、A6-15 两行），全部位于这 4 段的 Dialogue 正文内**。题干、选项文本、Answer 字母、题号标题、文件头、末尾汇总行**逐行零改动**。

**3. 答案序列与尾行汇总行**
由 15 个 `**Answer**` 行推导序列 = `C A D B A C B D A C D B C A D`；末尾汇总行 = `本批答案序列：C A D B A C B D A C D B C A D`。两者逐位一致，且与改前完全相同。A6-15 的 Answer 行与尾行**未被触碰**。

**4. 数字与时间算术**
对 15 段做全量数字/时间/星期词表比对（含基数词、序数词、时段词、星期词、数字 400、12 等），改前改后**逐项完全一致，15/15 通过**，故所有算术与时间关系原样成立：A6-02 五+五=十分钟；A6-03 第十日 < 第十八日（已过期）；A6-10 六点五十起床 / 七点十分出门 / 闹钟提前十分钟；A6-13 周一七点早于八点上课、九点诊所繁忙；A6-05 四点属明天、七点属周三；A6-15 周四运动会 → 周五不练。**人称与时态亦未改动**（含 A6-08 "I asked"、A6-01 "I slept"、A6-03 "today is" 等过去时/现在时标记）。

**5. 称谓一致性（全卷扫描）**
全卷 15 个称谓形式（Mr. Guo / Mr. Liu / Mr. Sun / Mr. Zhao / Ms. Chen / Ms. Gao / Ms. He / Ms. Kong / Ms. Pan / Ms. Shen / Ms. Wang / Ms. Wu / Ms. Xu / Ms. Yang / Ms. Yuan）改前改后**集合与词频完全一致**，统一为"姓+Mr./Ms."格式；本次裁剪未删任何一处称谓。

**6. 悬空并列（全卷扫描）**
所有并列结构完整：被改的 `Practise on Monday and Wednesday. Not on Friday.` 保持"肯定并列 + 否定排除"完整；`Write your worries on paper, then walk around the room for ten minutes.` 两步并列完整；未改的 A6-02 "five minutes, then five minutes of jumping"、A6-06 "a blood test first, then an eye test, a tooth check and a height test"、A6-10 "Milk isn't breakfast, and an apple is only a snack" 均原样。A6-05 删除 `we'll train indoors` 后未留下悬空并列——被删句本身即为独立结果句，其信息由紧邻的 `In the gym` 与 `Meet in the gym` 承载；回指代词 `it` 已同步展开为 `the gym`，无悬空指代。

**7. 完成体/时态预设（全卷扫描）**
A6-08 选项 C 的错因完全依赖过去时预设（"I asked ... but I'm still worried"：已发生且无效），该句逐字未动；A6-01 "I slept in the car"、A6-03 "today is the eighteenth"、A6-11 "Since last night"、A6-14 "She got a low mark" 等时态预设句均未被触碰。无完成体被新增或删除。

## 五、异常与交回处置

**因无法安全压缩而交回处置的段落：0 段。**
4 段超长材料均在「保留全部选项依据」的前提下完成压缩，无需改动任何选项即达标；11 段未超长材料未作改动。**未触碰 Answer 行与尾行汇总行，A6-15 的 p=12 周期形式相关内容未被改动。**

## 六、唯一非信息性差异说明

A6-05 逗号数由 3 减为 1 处减少，源于随 `so we'll train indoors` 一并删除的 `all week,` 中的逗号，属被删赘语自带标点，非信息变更。其余各段标点（含问号数量）改前改后完全一致。
