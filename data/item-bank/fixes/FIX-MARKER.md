# FIX-MARKER · 修正 D-batch1 与 D4 的结构标记错配

## 一、结论

- **是否通过**：通过。8 处结构标记错配已全部修正；另有一处按规约拒改，一处按规约补改。
- **能否放行**：可以放行。wordcount-gate.ps1 退出码 0（PASS），verify-bank.ps1 退出码 0（ALL CONSISTENT）。
- **缺陷计数**：严重 0 条｜中等 1 条（结构标记与实际体裁错配，共 8 处，已全部修完）｜轻微 0 条。
  新发现并修正 1 处（任务书漏列：D4-05）；拒改 1 处（任务书误列：D4-04），理由见第四节。
- **是否可进入下一环节**：可以。

> 与任务书描述不符之处（共 2 处，详见第四节）：任务书表格列出「D4-04」而漏列「D4-05」，
> 这与它自己声称的「上表以调度方脚本扫描结果为准」相矛盾——脚本扫描结果里恰恰没有 D4-04、有 D4-05。
> 本轮实测净条数仍为 8，纯属两个错位互相抵消的巧合。

---

## 二、字节级前置校验（_COMMON.md §1）

开工时用 [System.IO.File]::ReadAllBytes 读字节，再用行读取工具复读全文重算 MD5，两次结果必须一致：

| 文件路径 | 字节数 | 行数 | MD5（字节法） | MD5（行复读法） | 是否一致 |
|---|---|---|---|---|---|
| data/item-bank/D-batch1.md | 7561 | 198 | ed4c8caca3f7c1b9b7fc8a93be0931e6 | ed4c8caca3f7c1b9b7fc8a93be0931e6 | 一致 |
| data/item-bank/D4.md | 7149 | 190 | b7d3890cdad4d9814152cc28f5f36b90 | b7d3890cdad4d9814152cc28f5f36b90 | 一致 |

**基线对照**：FIX-MARKER.md 任务书未记录这两个文件的开工基线 MD5（它只要求我把改前 MD5 记进本文件），
因此以本轮开工时自测值作为基线。开工后、修改前重测，MD5 与上表完全相同，可排除「上游报告已改过文件」的可能。

**编码基线**：两文件均为 UTF-8、无 BOM、纯 LF（D-batch1: lf=198 crlf=0；D4: lf=190 crlf=0）。
本轮未改变换行风格与 BOM 状态。

---

## 三、逐段独立判定（无抽样，D-batch1 10/10 段 + D4 10/10 段）

判定依据只有一条：**材料正文是否有说话人标注**。有 W: / M: / Boy: / Girl: 等起句的判为对话；
无标注、单句陈述的判为叙述。**未照抄任务书表格**，任务书点名的段落也逐段重读过原文。

### 3.1 D-batch1.md

| 段 | 实际体裁（我的判定） | 正文首句形态 | 脚本扫描是否报此项 | 任务书是否点名 | 处置 | 改前 | 改后 |
|---|---|---|---|---|---|---|---|
| D-01 一周社团活动 | 叙述 | Tom takes part in three... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D-02 周末购物清单 | 对话 | W: The kitchen is nearly empty. | 是 | 是 | 改 | **Passage** | **Dialogue** |
| D-03 去科技馆的路 | 对话 | W: Excuse me, could you tell me... | 是 | 是 | 改 | **Passage** | **Dialogue** |
| D-04 校运会训练安排 | 叙述 | Jack is on the school sports team... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D-05 端午节计划 | 对话 | W: The Dragon Boat Festival is coming. | 是 | 是 | 改 | **Passage** | **Dialogue** |
| D-06 课余兴趣小组 | 叙述 | The Grade 9 students can choose... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D-07 周末家务分工 | 对话 | W: The house is a mess at the weekend. | 是 | 是 | 改 | **Passage** | **Dialogue** |
| D-08 社区志愿服务日 | 叙述 | Our neighbourhood is clean and green... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D-09 杭州之行 | 对话 | M: We're going to Hangzhou next week. | 是 | 是 | 改 | **Passage** | **Dialogue** |
| D-10 校园环保行动 | 叙述 | Our school is doing something... | 否 | 否 | 不改 | **Passage** | **Passage** |

小计：改 5 段（D-02 / D-03 / D-05 / D-07 / D-09）。

### 3.2 D4.md

| 段 | 实际体裁（我的判定） | 正文首句形态 | 脚本扫描是否报此项 | 任务书是否点名 | 处置 | 改前 | 改后 |
|---|---|---|---|---|---|---|---|
| D4-01 周末安排 | 叙述 | Jack is a busy boy. | 否 | 否 | 不改 | **Passage** | **Passage** |
| D4-02 上下学校车时刻表 | 叙述 | Jack lives in a village about five... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D4-03 期中考试时间表 | 对话 | M: Have you seen the time sheet... | 是 | 是 | 改 | **Passage** | **Dialogue** |
| D4-04 九年级下午课程表 | 叙述 | Tom has just got his new timetable... | 否 | 是（任务书点名） | 不改（拒绝） | **Passage** | **Passage** |
| D4-05 元旦文艺汇演节目流程表 | 对话 | W: What time does the New Year show start? | 是 | 否（任务书漏列） | 改 | **Passage** | **Dialogue** |
| D4-06 英语夏令营日程表 | 叙述 | Here is the plan for our English summer camp. | 否 | 否 | 不改 | **Passage** | **Passage** |
| D4-07 春游一日流程表 | 叙述 | Our class will go on a spring outing... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D4-08 校运动会比赛日程表 | 叙述 | Our school sports meeting will be held... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D4-09 假期每日作息时间表 | 叙述 | During the winter holiday Jack keeps... | 否 | 否 | 不改 | **Passage** | **Passage** |
| D4-10 市图书馆开放时间表 | 对话 | W: Are you going to the city library... | 是 | 是 | 改 | **Passage** | **Dialogue** |

小计：改 3 段（D4-03 / D4-05 / D4-10），拒改 1 段（D4-04）。

### 3.3 库内惯例佐证（证明 Dialogue 才是本库对话段的正确标记）

- data/item-bank/D5.md 第 26 行：D5-02「两种借书方案对比」正文以 W: I want to borrow... 起句，标记为 **Dialogue**。
- data/item-bank/prod/D6.md 第 28 行：D6-02「社区图书角借阅记录」正文以 M: Our reading corner... 起句，标记为 **Dialogue**。
- REVIEW-RUBRIC 1.6（第 61 行）：结构标记合法值为 **Dialogue** 或 **Passage**，二者按体裁二选一。
- 结论：D-batch1 与 D4 混用确属错配，D5 / D6 的统一写法是正确基准。

---

## 四、扫描漏报与误报（任务书点名要求写明）

**脚本扫描本身零漏报、零误报。** 开工时 wordcount-gate.ps1 的结构扫描报「STRUCTURE ERRORS: 8」，
其 8 条与我的逐段独立判定逐条完全吻合（D-02/03/05/07/09 + D4-03/05/10）。

**有偏差的是任务书的表格，不是脚本**：

1. **任务书误列 D4-04**——D4-04 正文「Tom has just got his new timetable for this term...」是纯叙述，
   全文无任何说话人标注，脚本也没报它。按 FIX-MARKER「若某段实际是叙述就不要改它」的明令，本轮拒改 D4-04。
2. **任务书漏列 D4-05**——D4-05 正文「W: What time does the New Year show start? / M: It starts at 2:00 p.m...」
   是标准对话，脚本已报，FIX-MARKER 也明令「若某段还有扫描漏掉的，同样处理」，本轮补改 D4-05。
3. 两条一误一漏互相抵消，所以「8 处」这个总数看起来对得上，但集合不同。
   若照任务书表格机械执行，会漏改 D4-05、错改 D4-04，净结果同样是 8 处、同样过闸门，
   但 D4-05 的缺陷会留给下一轮，D4-04 会被改成错误标记。这正是本任务书要求「自己独立复核」的收益所在。

---

## 五、材料正文与 Answers 行零改动的自证

### （1）反向套用复现基线（任务书第 4 条要求的自证）

把改后文本中的 **Dialogue** 全部逐字替换回 **Passage**，重算 MD5 与字节数：

| 文件 | 改后 MD5 | 改后字节 | 反向套用后 MD5 | 基线 MD5 | 反向套用后字节 | 基线字节 | 是否精确回到基线 |
|---|---|---|---|---|---|---|---|
| D-batch1.md | e339b8d8dccc5fdac400975b0b8c994b | 7566 | ed4c8caca3f7c1b9b7fc8a93be0931e6 | ed4c8caca3f7c1b9b7fc8a93be0931e6 | 7561 | 7561 | 是 |
| D4.md | cb57267d77d0d41c5c04f5dec3bdf238 | 7152 | b7d3890cdad4d9814152cc28f5f36b90 | b7d3890cdad4d9814152cc28f5f36b90 | 7149 | 7149 | 是 |

### （2）字节增量精确对账

Passage（7 字节）→ Dialogue（8 字节），每处 +1 字节。
D-batch1 改 5 处 → 7561+5 = 7566（实测 7566）；
D4 改 3 处 → 7149+3 = 7152（实测 7152）。
若多改或少改一处，增量即对不上。两文件行数分别仍为 198 / 190，均未变化。

### （3）逐行定位

对改后文件逐行与「反向套用」结果比对，全部且仅有的差异行号为
**D-batch1: 26, 46, 85, 124, 162**（＝D-02/03/05/07/09 的标记行）；
**D4: 44, 82, 173**（＝D4-03/05/10 的标记行）。共 8 行，其余每一行逐字节相同，
材料正文、表格、Word Bank、Answers 行、文件头与末尾汇总行全部零改动。

### （4）词数零变动（REVIEW-RUBRIC 1.10 口径：空白分词、只数材料正文、含说话人标注）

| 段 | 改后词数 | 改前词数 | 差 | 段 | 改后词数 | 改前词数 | 差 |
|---|---|---|---|---|---|---|---|
| D-01 | 84 | 84 | 0 | D4-01 | 95 | 95 | 0 |
| D-02 | 82 | 82 | 0 | D4-02 | 88 | 88 | 0 |
| D-03 | 109 | 109 | 0 | D4-03 | 85 | 85 | 0 |
| D-04 | 106 | 106 | 0 | D4-04 | 77 | 77 | 0 |
| D-05 | 116 | 116 | 0 | D4-05 | 113 | 113 | 0 |
| D-06 | 131 | 131 | 0 | D4-06 | 127 | 127 | 0 |
| D-07 | 102 | 102 | 0 | D4-07 | 121 | 121 | 0 |
| D-08 | 109 | 109 | 0 | D4-08 | 86 | 86 | 0 |
| D-09 | 102 | 102 | 0 | D4-09 | 89 | 89 | 0 |
| D-10 | 102 | 102 | 0 | D4-10 | 113 | 113 | 0 |

D 类上限 200：**20 段全部合规**，最大 131（D-06），余量 69 词，无零余量段。

### （5）答案序列未被触碰（Answers 行逐字节相同；附 §2c / §1.8b 实测数字供调度方取用）

**D-batch1**（30 空，序列 ADBCEAABDBCEDACEBDCAEDBAECBCED）

1. 周期检测：测 p = 1…15（上界取序列长度的一半，不是只测 2–6）→ 无任何周期；
2. 前半段与后半段是否互为重复：否；
3. 最长连续相同：2（要求不大于 2，合规）；
4. 各字母作为正确答案的次数：A=6 B=6 C=6 D=6 E=6，无全批一次都不作答案的字母——
   与文件头「答案字母 A–E 各 6 次」的自述相符（实测已验证）。
5. 逐空位置偏斜：空① C 30%、空② B 30%、空③ D 30%，均低于 70%；
6. 闭卷盲猜得分：30% / 30% / 30%。

**D4**（30 空，序列 BACBDEABDBDEABCABDEDBDEBABDCBD）

1. 周期检测：测 p = 1…15 → 无任何周期；
2. 前半段与后半段是否互为重复：否；
3. 最长连续相同：1（要求不大于 2，合规）；
4. 各字母作为正确答案的次数：A=5 B=10 C=3 D=8 E=4，无全批一次都不作答案的字母；
5. 逐空位置偏斜：空① A 40%、空② B 50%、空③ D 40%，均低于 70%；
6. 闭卷盲猜得分：40% / 50% / 40%。

---

## 六、闸门原始输出

### 6.1 wordcount-gate.ps1（改前，基线）——退出码 1

    STRUCTURE ERRORS: 8
      D-batch1   ## D-02 周末购物清单  [标 Passage 但正文有说话人标注]
      D-batch1   ## D-03 去科技馆的路  [标 Passage 但正文有说话人标注]
      D-batch1   ## D-05 端午节计划  [标 Passage 但正文有说话人标注]
      D-batch1   ## D-07 周末家务分工  [标 Passage 但正文有说话人标注]
      D-batch1   ## D-09 杭州之行  [标 Passage 但正文有说话人标注]
      D4         ## D4-03 期中考试时间表  [标 Passage 但正文有说话人标注]
      D4         ## D4-05 元旦文艺汇演节目流程表  [标 Passage 但正文有说话人标注]
      D4         ## D4-10 市图书馆开放时间表  [标 Passage 但正文有说话人标注]

### 6.2 wordcount-gate.ps1（改后）——退出码 0

    PASS: no material block exceeds its limit

### 6.3 verify-bank.ps1（改后）——退出码 0

    批次 | 类 | 位置 | 一致性
    ------------------------------------------------------------------------------------------------
    A-batch0 | A | bank | 无汇总行可比对(20题)
    A1 | A | bank | 无汇总行可比对(15题)
    A2 | A | bank | 无汇总行可比对(15题)
    A3 | A | bank | 无汇总行可比对(15题)
    A4 | A | bank | 无汇总行可比对(15题)
    A5 | A | bank | 无汇总行可比对(15题)
    A6 | A | bank | PASS(15题)
    B-batch1 | B | bank | 无汇总行可比对(16题)
    B2 | B | bank | 无汇总行可比对(12题)
    B3 | B | bank | PASS(12题)
    B4 | B | bank | PASS(12题)
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
    B5 | B | prod | PASS(16题)
    C5 | C | prod | PASS(25题)
    D6 | D | prod | D类 Answers行=10 槽位=30
    共 27 个批次；答案序列不一致 0 个。
    ALL CONSISTENT

### 6.4 check-integrity.ps1（补充跑；机械闸门，非人工阅读 reviews）——退出码 1

说明：按 _COMMON.md §2b 第 38 轮澄清，子代理运行该脚本不构成信息泄漏（它只提取报告里记录的 MD5 与磁盘比对，
不输出任何审核内容）。本脚本非本任务书要求的两个闸门，此处只报与我相关的两行 + 汇总：

    D-batch1 | CL-D1.md | 强匹配(同行含题目名) | ed4c8caca3f7c1b9b7fc8a93be0931e6 | e339b8d8dccc5fdac400975b0b8c994b | MISMATCH
    D4 | V-D4.md | 强匹配(同行含题目名) | b7d3890cdad4d9814152cc28f5f36b90 | cb57267d77d0d41c5c04f5dec3bdf238 | MISMATCH
    总计 27 个批次；需关注 6 个。

**这 2 条 MISMATCH 是本轮授权修改的机械后果，不是缺陷**：CL-D1.md 与 V-D4.md 记录的是改前 MD5，
而任务书明确授权修改这两个文件，修改后旧报告的字节级结论对它们自然失效。
**调度方须知**：这两份报告若还要继续引用，其结论须补一轮复核，或改以本记录里的新 MD5 为准
（D-batch1 = e339b8d8dccc5fdac400975b0b8c994b；D4 = cb57267d77d0d41c5c04f5dec3bdf238）。
**另有 4 条 MISMATCH（E-batch1 / A7 / C5 / D6）与本轮无关**——这四个文件本轮从未被打开或写入，属既存状态。

---

## 七、纪律声明

- **未修改** src/、tests/、任何项目代码或配置文件。本轮写入仅限：
  data/item-bank/D-batch1.md 与 data/item-bank/D4.md（仅 8 行结构标记），以及新建本文件
  data/item-bank/fixes/FIX-MARKER.md。
- **未人工阅读** reviews/ 与 fixes/ 下任何其他文件。（过程中对 data/item-bank 做过一次关键词扫描以确认库内标记惯例，
  该次扫描只返回「文件路径:行号」、不返回任何正文内容，未读到任何他人审核结论；
  见 6.4 关于运行闸门脚本的同源说明。）
- **文件名口径说明**：_COMMON.md §4 规定修复记录文件名由被修审核报告的轮次机械推导（R1-X → F1-X、R2-X → F2-X）。
  本任务并非针对某份具名审核报告的轮次修复，而是调度方直接派发的独立修复作业，
  任务书显式点名输出路径为 data/item-bank/fixes/FIX-MARKER.md，故按任务书执行。
  若调度方希望改用轮次命名，请指定对应报告轮次，我再改名。

## 八、最终判定

**通过。** 8 处结构标记错配已全部修正（D-batch1 5 处、D4 3 处）；D4-04 经独立复核判定为叙述、依规约拒改，
D4-05 经独立复核补改；材料正文、表格、词库、Answers 行与末尾汇总行零改动（字节增量与反向 MD5 双重对账通过），
两个必需闸门均退出码 0。
