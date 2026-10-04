# 复核报告：D5.md 修复后复核（V-D5）

## 结论

- **是否通过：通过。能否放行：可以放行。可进入下一环节：可以。**
- 审核规模：**10 份 / 30 空，逐空判定，无抽样**；另核 10 份材料正文逐句、10 张表格逐行、50 条词库项逐条。
- **严重缺陷：0 条｜中等缺陷：3 条｜轻微缺陷：12 条**（另有 **1 项流程问题**、**3 项与任务书/依据报告描述不符的声明**，见第五、六节；这三项不计入上面的缺陷计数，因为它们指向任务书或 R2-D5 的表述，不是 D5.md 本身的题目缺陷）。
- R2-D5 所列的 **1 条严重 + 2 条中等已全部清除**；本轮新增发现的 D5-03 词库偏离授权文本，按流程问题单列。
- 放行理由：无严重缺陷；三条中等均不影响答案唯一性与可判性（详见 §三），其中两条属文件级格式缺件，一条属修复后残余可套利空间。

### 字节级前置校验（两次读取一致性）

| 文件路径 | 字节数 | 行数 | MD5 | 字节读取 vs 行读取是否一致 |
|---|---|---|---|---|
| `data/item-bank/prod/D5.md` | 8772 | 185 | `216530ce0539b4430106623d0f5f4f60` | **一致**（逐行字节重算 sum(行长+1)=8772，与 ReadAllBytes 相等；末字节=LF(10)；无 BOM；行读取工具返回 185 行） |
| `data/item-bank/reviews/R2-D5.md` | 38979 | 396 | `01f66673ad5af94d13e916b6d938cb4c` | **一致**（sum(行长+1)=38980，末行无换行故实际 38979；末字节=42=`*`；无 BOM；行读取工具返回 396 行） |

**基线对照**：R2-D5.md 第 4 行记录审核前基线 **MD5 = `4711bb19320e034dd0bae70873b03ccd`，8687 字节**。
当前 D5.md 为 **`216530ce0539b4430106623d0f5f4f60`，8772 字节** → **MD5 已变化、字节数 +85 → 修复已落盘**。（字节差 +85 与落盘改动量自洽：D5-03 材料 +8 词、D5-02 材料 +8 词、词库 C 项由 5 词缩为 3 词 −2 词、其余为标题与标记替换。）

---

## 一、必跑门禁（原始输出，逐字粘贴）

执行命令：`pwsh -Command "& docs/pipeline/wordcount-gate.ps1"`

```
PASS: no material block exceeds its limit
```

- 退出码：**0（PASS）**
- stderr：（空）
- **补充说明（不隐瞒门禁本身的局限）**：该脚本 **参数个数 = 0**，只输出一行整卷级结论，因此**无法从它的输出反证 D5.md 确在扫描范围内**。本轮因此不采信该行作为唯一依据，另行独立重算了全部 10 份材料词数（§二），结论一致。

### 词数（§1.10 唯一口径：空白分词 / 只数材料正文 / 含说话人标注 / 不含标题·表格·Word Bank·Answers·文件头）

| 份 | 实测词数 | 上限 200 | R2-D5 修前 | 差值 |
|---|---|---|---|---|
| D5-01 | 78 | ✅ | 78 | 0 |
| D5-02 | **99** | ✅ | 91 | +8 |
| D5-03 | **102** | ✅ | 94 | +8 |
| D5-04 | 84 | ✅ | 84 | 0 |
| D5-05 | 59 | ✅ | 59 | 0 |
| D5-06 | 69 | ✅ | 69 | 0 |
| D5-07 | 64 | ✅ | 64 | 0 |
| D5-08 | 85 | ✅ | 85 | 0 |
| D5-09 | 120 | ✅ | 120 | 0 |
| D5-10 | 114 | ✅ | 114 | 0 |
| **合计** | **874** | — | 858 | +16 |

- 最大值 **120（D5-09）**，上限 200 → **10/10 通过**；D 类无下限（§1.10 裁定），最短 59（D5-05）不触发任何条款。
- 与 R2-D5 自查预测（91→99、94→102）**逐份吻合**，实测值无一处偏差。

---

## 二、D 类专属必查项（逐项实测）

| # | 必查项 | 实测 | 判定 |
|---|---|---|---|
| 1 | 表格列数口径全批一致 | 2 列 **6 份**（D5-01/03/04/07/08/09）；3 列 **4 份**（D5-02/05/06/10）；**每张表内部逐行列数完全一致（唯一值，无混列）** | ⚠️ 见 §五·声明不符 #1 |
| 2 | 每表有来源说明与日期 | 10 张表**逐表来源说明 = 0 处**；全文日期型 token（`20\d\d`/月份名/月份缩写）**命中数 = 0**；`来源` 仅 1 次（文件头第 3 行，**批次级、且无日期**） | ❌ **中等 M-2** |
| 3 | 人物与称谓全批一致 | 全批 12 个人名均为通用中文名；敬称仅 D5-04 用 `Mr. Wang` / `Ms. Lin`（缩写点齐全，全份一致）；D5-02 用 `W:` / `M:` **单字母说话人标注且材料内未指明身份** | ⚠️ 轻微 L12 |
| 4 | 槽位数算术：每份空数 = 末尾汇总行，空格总数 = 份数 × 每份空数 | 10 份 × 3 空 = **30 空**；每张 Answers 行恰 3 个字母，30/30 与表格空位一一对应；文件头第 3 行 `共 10 份 / 30 空` **实测成立**；**但文件末尾无汇总行**（末行即 `① C　② A　③ E`） | ❌ **中等 M-3**（汇总行缺件）＋替代核对通过 |
| 5 | 每个空的答案在材料中有逐字或可推依据 | 内容词召回 **30/30 有支撑**；完整命中 29/30，唯一缺口为 D5-07 ③「the weight **record** of the paper」对材料「writes down the **weight** of the paper」（名词化转写，2/3 命中） | ✅ |
| 6 | 词库短语数 = 全批空数；一个短语只用一次 | 10/10 词库恰 **5 项**，字母 A–E 各一次，**同一词库内重复短语 = 0**，每份取用 3 项、**恰 2 个干扰项未用**；跨份复用短语 2 条（`a big raincoat`、`a paper map`，均跨 D5-03↔D5-08） | ✅（字面口径见 §五·声明不符 #2） |
| 7 | 每空只有一个正确答案 | 30/30 逐空判定唯一（明细见 §三） | ✅ |
| 8 | 词数 ≤200 无下限 | 最大 120 | ✅ |

### 材料内数字与时间链独立复算（不采信任何上游数值，9/9 全部复算通过）

| 份 | 原文数字关系 | 本轮实测 |
|---|---|---|
| D5-02 | Plan A 半年 15 → 全年「twice as much, so 30」 | 15×2 = **30** ✅ |
| D5-02 | Plan B 半年 25 → 全年 50 | 25×2 = **50** ✅ |
| D5-04 | 房间「numbered from 201 to 212」称 twelve | 212−201+1 = **12** ✅ |
| D5-04 | Room 208「is the eighth room on that floor」 | 208−201+1 = **8** ✅ |
| D5-04 | Room 212「the last room of the floor」 | 212 = 区间末间 ✅ |
| D5-06 | Plan A 3 English + 2 science =「five classes」 | 3+2 = **5** ✅ |
| D5-06 | Plan B 5 + 4 =「nine in all」 | 5+4 = **9** ✅ |
| D5-09 | 4 clubs ×「twenty students」=「eighty」 | 4×20 = **80** ✅ |
| D5-10 | 「one hundred young trees」÷ 每家 5 棵 =「twenty families」 | 100÷5 = **20** ✅ |

时间链逐份复核：01 next Friday afternoon 单点、03 next Wednesday 单点、07 last month 单点、06/09 this term 单点，均无冲突；04 new term 单点；05「A year ago ↔ Now」双时态框架清晰；08「next weekend + Last year」无矛盾；10「Two years ago ↔ Last spring ↔ Now」三段自洽。**§1.2 严重级自相矛盾：0 条。**

---

## 三、结构、分布与可套利性整卷级门禁（本轮全部重算）

| # | 必查项 | 实测 | 判定 |
|---|---|---|---|
| 1 | 空数 ÷ 材料份数（§1.9 的 D 类正确读法） | 30 ÷ 10 = **3** | ✅ |
| 2 | 井号区块（§1.6） | 井号行 **11** = 1 个 H1 文件标题 + 10 个 `## D5-xx` 条目标题；`###` 及更深 **0**；`##` 段数 = 10，未污染 §1.9 | ✅（H1 标题为全卷唯一非结构井号行，与 R2-D5 判断一致） |
| 3 | 结构标记齐备 | `**Passage**` 9、`**Dialogue**` 1、`**Table**` 10、`**Word Bank**` 10、`**Answers**` 10、`**Question**` 0、`**Answer**` 0 | ✅ 编号 D5-01…D5-10 连续无缺号 |
| 4 | 逐份元组互异 | `EBC / CEA / BCE / AEC / BDA / ECA / CAD / EBD / DAE / CAE` → **10/10 互异** | ✅ |
| 5 | 键位覆盖（§1.8b） | A=**7** B=**4** C=**7** D=**4** E=**8**（合计 30），**A–E 全覆盖，无零覆盖** | ✅ |
| 6 | 逐空位置偏斜（§1.8b，阈值 70%） | ①=A1 B2 C3 D1 E3（最高 C 3/10 = **30%**）；②=A3 B2 C2 D1 E2（最高 A 3/10 = **30%**）；③=A3 B0 C2 D2 E3（最高 A 3/10 = **30%**） | ✅ 三列均 <70% |
| 7 | 周期性 p=2..6（§1.8） | 30 项序列 `EBCCEABCEAECBDAECACADEBDDAECAE`；p=2 首失配 index 0、p=3 index 0、p=4 index 1、p=5 index 0、p=6 index 0 → **全部非周期** | ✅ |
| 8 | 连续扎堆（≥3 连） | 最长连续相同 = **2**（`CC`） | ✅ |
| 9 | 闭卷盲猜得分（§1.8b） | 按每列最高频盲填 C/A/A = **9/30 = 30%** | ✅ 远低于 70%–87% 危险带 |
| 10 | 「逐列每字母恰 2 次」不变量 | 三列均为 11/10 非均衡分布 → **已打破** | ✅ |
| 11 | §1.7 开场白归一化 | 首句归一化键 **10/10 互异，0 命中**；`Our …` 起句 **6/10**（01/03/04/06/07/09） | ⚠️ 轻微 L6 |
| 12 | §1.7 份内重复句 | **0**（10 份逐句去重后无同句重复） | ✅ |
| 13 | §1.7 两两 Jaccard（阈值 0.6） | 45 对全部实测，**最高 0.153**（D5-02 × D5-06） | ✅（数值与 R2-D5 的 0.17 不同，因本轮分词剔除 a/an/the/and/our 与 3 字符以下词；**结论方向一致**，均在阈值内） |
| 14 | §1.3 语法 / 超纲词 / §1.5 严重项 | 10 份材料逐句复核：无时态·主谓一致·单复数·冠词·介词错误；超纲词 **0**；真实品牌 0、真实人名 0、争议内容 0、性别刻板印象 0 | ✅ |

---

## 四、逐题逐空判定（30/30，无抽样）

> 「无材料可判」= 不读材料、只看表格行头与生活经验即可高概率命中的程度；基准 = 整卷字母盲填 30%、完全随机 20%。

### D5-01 科技节上的三份贡献（78 词 · 5 项词库 · 答案 EBC）
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① Lin Hui | E a story about a moon trip | `Lin Hui wanted more students to join in, so she wrote a story about a moon trip` | ✅ | 0（人名无语义） |
| ② Zhou Min | B a big poster about the festival | `Zhou Min is good at drawing, so he made a big poster to tell the other students what the festival was about` | ✅ | 0 |
| ③ Xu Lei | C a small rocket for the show | `Xu Lei likes making models, and she built a small rocket for the show in the physics room` | ✅ | 0 |
未用干扰项 A（photo show）、D（smart robots）材料均未提 ✅｜结论：**零缺陷**

### D5-02 两种借书方案对比（99 词 · Dialogue · 答案 CEA）
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① 半年 Plan A | C 15 yuan | `Plan A is 15 yuan for half a year` | ✅ 价格无常识先验 | 0 |
| ② 半年 Plan B | E 25 yuan | `Plan B is 25 yuan for half a year` | ✅ | 0 |
| ③ 全年 Plan A | A 30 yuan | `A whole year costs twice as much, so 30 yuan`（算式明写，已复算 15×2=30） | ✅ | 0 |
未用干扰项 B **50 yuan**（材料明写 Plan B 全年价，强陷阱）、D 40 yuan（未提）✅｜标记已由 `**Passage**` 更正为 `**Dialogue**`，与 W:/M: 话轮一致 ✅｜结论：**零缺陷**（R2-D5 中等 #3 已清除）

### D5-03 春游要带的三样东西（102 词 · 答案 BCE）【本次修复项】
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判（本轮独立估计） |
|---|---|---|---|---|
| ① 干爽可坐之处 | B an old towel | `An old towel is useful too, since the grass is damp in the morning and we can spread it out to sit on when we have our picnic at noon` | ✅ | **≈1/3**（毛巾 / 塑料布 / 雨衣均可「铺开坐下」，行头不再唯一锁定） |
| ② 天黑后食物安全 | C the insect spray | `A small bottle of insect spray will keep the mosquitoes away from us when we eat dinner on the hill in the evening` | ✅ | **≈0.90**（行头已不含物品名，但「防食物/驱虫」仍由生活经验锁定） |
| ③ 开箱前先铺的东西 | E a plastic sheet | `We should take a plastic sheet, because there is a lot of sand on the grass and we can keep the boxes off it` | ✅ | **≈0.62**（「铺下的东西」→塑料布仍是首选） |
未用干扰项 A a paper map、D a big raincoat，**材料中均未出现** ✅｜期望得分 ≈ 0.33+0.90+0.62 = **1.85/3 ≈ 62%**（基准 30%、随机 20%）

> **本轮独立判断**：R2-D5 严重 #1 的核心机制（「行头直接写出物品、与词库构成定义级配对」）**已彻底消除**——①现在有 3 个同样成立的填法，**不读材料必然做错**，符合 §1.1 的可判性底线。残余的 ②≈0.90 / ③≈0.62 仍使本份无材料期望分达 ≈62%，高于 30% 基准但**低于 R2-D5 自己对 D5-05/10 判中等时使用的 70% 线**，故本轮记为**中等 M-1（残余可套利）**，**不升为严重**——理由写明：升严重的要件是「不读材料即可猜对 / 无区分度」，而 ① 已无法猜，整份不具备「零区分度」。
> **与 R2-D5 自查的差异（须记录）**：R2-D5 预测修复后无材料期望分为 33%（三空各 1/3）。本轮实测估计为 ≈62%，**该预测不成立**，理由见 §五·声明不符 #3。

### D5-04 新学期的教室安排（84 词 · 答案 AEC）
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① Chinese | A in Room 208 on the second floor | `his class is in Room 208, which is the eighth room on that floor` + 首句 `second floor of the main building`（需跨句合并楼层） | ✅ | 0 |
| ② Maths | E in Room 212 on the second floor | `she uses the last room of the floor, Room 212` + 首句楼层 | ✅ | 0 |
| ③ English | C in Room 105 in the new building | `The English lessons have moved to the new building, where our class is in Room 105 on the ground floor` | ✅ | 0 |
未用干扰项 B Room 301 third floor、D Room 303 top floor，材料均未提，同为「in + Room + 楼层」结构 ✅｜编号关系三项全部复算通过 ✅｜结论：**零缺陷**

### D5-05 王涛课余时间的变化（59 词 · 答案 BDA）【本次修复项】
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① Now / After school | B play basketball with his classmates | `He plays basketball with his classmates on the playground twice a week` | ✅（时段见轻微 L1） | ≈1/3（{B,C,E}） |
| ② A year ago / After school | D play computer games at home | `After school he played computer games at home every day` | ✅ | ≈1/3（{A,D,E}） |
| ③ A year ago / At the weekend | A watch TV with his friends | `At the weekend he watched TV with his friends` | ✅ | ≈1/2（{A,E}） |
期望 ≈ 1.17/3 = **39%**，已贴近 30% 基准｜标题已由「运动习惯的**变化**」改为「课余时间的**变化**」，方向泄漏消除 ✅｜结论：**零内容缺陷**（保留轻微 L1）

### D5-06 两个课外学习方案对比（69 词 · 答案 ECA）
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① Science / Plan A | E two classes a week | `two science classes a week` | ✅ | 0 |
| ② Science / Plan B | C four classes a week | `four science classes a week` | ✅ | 0 |
| ③ English / Plan A | A three classes a week | `Plan A has three English classes and two science classes a week` | ✅ | 0 |
未用干扰项 B **five classes a week**（= Plan A 周总课时，强陷阱）、D six classes（未提）✅｜3+2=5、5+4=9 复算通过 ✅｜结论：**零缺陷**

### D5-07 社区回收站的三个岗位（64 词 · 答案 CAD）
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① Wang Mei | C a simple guide for the neighbours | `Wang Mei loves talking to people, and she stands at the gate and gives the neighbours a simple guide` | ✅ | 0（人名无语义；搭配生硬见 L4） |
| ② Zhou Yang | A the heavy boxes for the van | `he carries the heavy boxes to the van` | ✅ | 0 |
| ③ Chen Jie | D the weight record of the paper | `she stays at the desk and writes down the weight of the paper every day` | ✅（唯一内容词缺口，见 §二·必查 5） | 0 |
未用干扰项 B list of all new volunteers、E football team of our school，均未提 ✅｜结论：**零内容缺陷**（保留轻微 L4）

### D5-08 山谷露营要带什么（85 词 · 答案 EBD）
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① Sun Bo | E a big raincoat | `Last year we got wet through in the rain, so Sun Bo is bringing a big raincoat for the whole group` | ✅ | 0 |
| ② Guo Ping | B a paper map | `There is no phone signal in the valley, so Guo Ping drew our route and is bringing a paper map` | ✅ | 0 |
| ③ Huang Ying | D a small torch | `after we have dinner, we walk back to the car in the dark, so Huang Ying is bringing a small torch` | ✅ | 0 |
未用干扰项 A a sleeping bag、C a folding chair —— 材料明写 `already in the parents' cars`，属**必须读材料才能排除的高强度陷阱**，设计优秀 ✅｜结论：**零内容缺陷**（保留轻微 L5）

### D5-09 四个社团的活动室（120 词 · 答案 DAE）
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① photography club | D in the music room next to the hall | `it puts up its show on the stage now, so it meets in the music room next to the hall` | ✅ | 常识（摄影→暗房）指向 B，**恰好错** ✅ |
| ② robot club | A in the common room on the second floor | `the science room on the second floor has been closed for repairs this term, so it meets in the common room` | ✅ | 常识（机器人→科学室）指向 C，**恰好错** ✅ |
| ③ chess club | E in the small study room by the library | `The chess club must be quiet, so it meets in the small study room by the library` | ✅ | ≈0.6（棋类需安静→自习室，唯一一处常识可命中项） |
未用干扰项 B dark room（`used to`）、C science room（`closed for repairs`）—— 两者均为**被材料否定的地点**，陷阱质量高 ✅｜4×20=80 复算通过 ✅｜结论：**零内容缺陷**（保留轻微 L3：标题称「四个社团」但表格只有 3 行，第 4 个 reading club 无词库项）

### D5-10 我们楼后的那块空地（114 词 · 答案 CAE）【本次修复项】
| 空 | 答案 | 材料逐字依据 | 唯一性 | 无材料可判 |
|---|---|---|---|---|
| ① Now / children evening | C ride bikes along the small path | `Now there is a small path and six new lights. Children ride bikes along the small path after school` | ✅（时段见 L4） | ≈1/2（{A,C}） |
| ② Two years ago / children evening | A play ball games on the grass | `Children often played ball games on the grass there every evening` | ✅ | ≈1/2（由 ① 排除强制） |
| ③ Two years ago / old people morning | E take a walk in the park | `Old people used to take a walk in the park` | ✅（时段见 L4） | ≈1/2（{B,E}） |
期望 ≈ **50%**（基准 30%）｜标题已由「小区绿地的前后**变化**」改为「我们楼后的那块空地」，改善方向泄漏消除 ✅｜未用干扰项 B **do their exercises under the trees**（= 现况行为，强陷阱）、D water the flowers（未提）✅｜100÷5=20 复算通过 ✅｜结论：**零内容缺陷**（保留轻微 L4、L11）

### 已复核题号清单（严重 / 中等 / 轻微 三列，逐份列出，无抽样）

| # | 份 | 空数 | 元组 | 结构标记 | 词数 | 严重 | 中等 | 轻微 |
|---|---|---|---|---|---|---|---|---|
| 1 | D5-01 | 3 | EBC | ✅ | 78 | 0 | 0 | 0 |
| 2 | D5-02 | 3 | CEA | ✅ Dialogue | 99 | 0 | 0 | 1（L12） |
| 3 | D5-03 | 3 | BCE | ✅ | 102 | **0** | **1（M-1）** | 2（L9、L10） |
| 4 | D5-04 | 3 | AEC | ✅ | 84 | 0 | 0 | 0 |
| 5 | D5-05 | 3 | BDA | ✅ | 59 | 0 | 0 | 1（L1） |
| 6 | D5-06 | 3 | ECA | ✅ | 69 | 0 | 0 | 0 |
| 7 | D5-07 | 3 | CAD | ✅ | 64 | 0 | 0 | 1（L4） |
| 8 | D5-08 | 3 | EBD | ✅ | 85 | 0 | 0 | 1（L5） |
| 9 | D5-09 | 3 | DAE | ✅ | 120 | 0 | 0 | 1（L3） |
| 10 | D5-10 | 3 | CAE | ✅ | 114 | 0 | 0 | 2（L4、L11） |
| — | **卷级** | **30** | 10/10 互异 | ✅ | 874 | **0** | **2（M-2、M-3）** | **6（L2、L6、L7、L8、+D5-03 两项已计入该份）** |

- 覆盖证明：材料 **10/10** 逐份（正文逐句、表格逐行、词库逐项、答案逐空）；空数 **30/30** 逐空；Answers 行 **10/10**；结构比 30÷10 = 3 ✅
- **合计：严重 0 条｜中等 3 条｜轻微 12 条**

---

## 五、与任务书/依据报告描述不符之处（「该声明不成立」+ 反证）

### 声明不符 #1：任务书 D 类必查项「表格 **5 列或 6 列**的口径必须全批一致」
**该声明不成立。** 反证：实测 10 张表格的列数为 **2 列 6 份**（D5-01/03/04/07/08/09）与 **3 列 4 份**（D5-02/05/06/10），**无一张表是 5 列或 6 列**。D5.md 的表结构由 §1.6 规定的「`**Table**` + 每空一格」模板决定，天然是 2–3 列，不可能是 5–6 列。
**本轮按可核对的口径实测**：每张表内部逐行列数**完全一致**（每张表的唯一列数集合均为单值，无混列），跨份分两种口径且各份内部自洽。**该项在「每表内部一致」这一实质要求上通过。**

### 声明不符 #2：任务书 D 类必查项「WordBank 的**短语数必须等于全批空数**」
**该声明不成立。** 反证：全批空数 = 30，全批词库条目 = 50（10 份 × 5 项），二者不等；且本模板是**每份自带 5 项词库、挖 3 空、留 2 干扰项**（REVIEW-RUBRIC §1.4 明文：「D 类（表格填空）：词库 5 个短语，挖 3 空，恰好 2 个干扰项不被使用」）。
**本轮按 §1.4 模板实测**：10/10 词库恰 5 项、字母 A–E 各一次、同库内重复短语 0、每份取用 3 个互异项、恰 2 个干扰项未用 → **模板要求 10/10 满足**。「一个短语只用一次」在**同一词库内**成立；跨份复用 2 条（`a big raincoat`、`a paper map`，均跨 D5-03↔D5-08）属分卷独立词库的正常现象，不构成违例。

### 声明不符 #3：R2-D5 对修复效果的**两处**预测与实测不符
- **(a) D5-03 无材料期望得分**：R2-D5 自查称修复后降至「≈ 3×(1/3) = 33%」。**该预测不成立。** 本轮逐行头独立估计：①≈1/3、**②≈0.90**、**③≈0.62**，期望 ≈ **62%**。R2-D5 把三空一律按 1/3 处理，忽略了「Our food to be safe…」对驱虫剂的语义牵引与「put down」对塑料布的惯用牵引。修正后仍低于其自用的 70% 中等线，故定级为中等而非严重（见 §四 D5-03）。
- **(b) R2-D5 §三 的逐列预测算错两处**：
  - 预测「①=A1 B2 C3 **D2** E3」——**合计 11 ≠ 10**，自相矛盾；实测 ① = **A1 B2 C3 D1 E3**（D 只有 1 次，即 D5-09）。
  - 预测「③=A3 **B1** C2 D2 **E2**」——**未随 ACB→BCE 更新**，沿用了修前的 B；实测 ③ = **A3 B0 C2 D2 E3**。
  - **该声明不成立。** 需要指出的是，R2-D5 的**整卷总计数预测 A=7 B=4 C=7 D=4 E=8 反而是对的**，与其逐列预测自相矛盾——以其总计数反推即可发现逐列预测有误。本轮实测总计数 **A=7 B=4 C=7 D=4 E=8**，与之一致。
- **(c) R2-D5 §一 的证据引文不可作逐字基线证据**：本轮提取 R2-D5 第 176–262 行的 30 条行内代码引文与当前文件逐条比对，**23 条逐字命中**；7 条不命中，逐条查证为：1 条系本次授权修复**应当删除**的旧句（`we play a game in the afternoon and we may need to dry our feet after the game`）✅；1 条仅大小写差异（`a whole year` vs 句首 `A whole year`）✅；其余 5 条是 R2-D5 自己的**省略号引文或改写**（如 `Plan A costs 15 yuan` 实为 `Plan A is 15 yuan`、`three English classes a week` 原文为 `three English classes and two science classes a week`）。**按 _COMMON §7，这 5 条引文不得被当作基线逐字证据使用。**

---

## 六、修复落盘核对与流程问题

### 6.1 声明项逐条独立验证

> **前置说明（诚实边界）**：`data/item-bank/fixes/` 目录按纪律禁读，**修复方的 fixLog / 申报原文本轮无法读取**。因此下表以「**R2-D5 明文授权的修复项**」为声明清单逐条验证；落盘文本相对授权文本的偏离在 §6.2 单独列出。修复方是否就该偏离作出申报，**本轮无法核实**，已在 §6.2 写明。

| # | 声明内容（来源：R2-D5 授权文本） | 独立验证结果 | 成立？ | 依据 |
|---|---|---|---|---|
| S1 | D5-03 材料替换为授权文本（94→102 词） | **逐字节相同**（长度 494 字符全等），实测词数 **102** | ✅ 成立 | R2-D5 第 78 行 vs D5.md 第 48 行 |
| S2 | D5-03 表格替换为授权文本（3 行头 + 表头） | **5/5 行逐字节相同** | ✅ 成立 | R2-D5 第 82–86 行 vs D5.md 第 50–54 行 |
| S3 | D5-03 词库替换为授权文本（A–E 五项） | **4/5 行逐字节相同；C 项不一致** | ❌ **不成立（部分）** | 授权 `C. a small bottle of insect spray` vs 落盘 `C. the insect spray` |
| S4 | D5-03 答案改为 `① B　② C　③ E`（恰 2 干扰项 A/D） | 落盘第 62 行 = `① B　② C　③ E`；未用项实测恰为 A、D | ✅ 成立 | D5.md 第 62 行 + 词库占用实测 |
| S5 | 文件头第 5 行类型声明同步改写为「需求—物品对应 1 份（D5-03）」 | 落盘第 5 行 = `…需求—物品对应 1 份（D5-03）…`；5 类份数 3+1+2+2+2 = **10**，编号覆盖 D5-01…10 **无重无漏** | ✅ 成立 | D5.md 第 5 行 |
| S6 | D5-02 标记 `**Passage**` → `**Dialogue**` | 落盘第 26 行 = `**Dialogue**`，与 W:/M: 话轮一致；全卷 9 Passage + 1 Dialogue，符合 §1.6 | ✅ 成立 | D5.md 第 26 行 |
| S7 | D5-02 材料替换为授权 5 行文本 | **5/5 行逐字节相同**；实测词数 **99**（= 预测值） | ✅ 成立 | R2-D5 第 144–148 行 vs D5.md 第 27–31 行 |
| S8 | D5-05 标题改为「王涛课余时间的变化」 | 落盘第 83 行 = `## D5-05 王涛课余时间的变化` | ✅ 成立 | D5.md 第 83 行 |
| S9 | D5-10 标题改为「我们楼后的那块空地」 | 落盘第 171 行 = `## D5-10 我们楼后的那块空地` | ✅ 成立 | D5.md 第 171 行 |
| S10 | 其余 9 份材料/表格/词库/答案**一字不动** | 元组 9/9 与 R2-D5 记录完全一致（CEA/AEC/BDA/ECA/CAD/EBD/DAE/CAE）；词数 9/9 完全一致（78/84/59/69/64/85/120/114）；R2-D5 的 30 条行内引文中 23 条逐字命中，7 条差异已逐条查证为「授权删除 1 条 + 大小写 1 条 + R2 自引省略/改写 5 条」 | ✅ 成立 | 元组与词数全量对照 + 引文比对 |

### 6.2 流程问题（按 V-D5 第 6 条单列）

**FP-1：D5-03 词库 C 项落盘文本偏离授权文本 1 处，属未授权改动（是否申报无法核实）**

- 授权文本（R2-D5 第 92 行）：`C. a small bottle of insect spray`
- 落盘文本（D5.md 第 58 行）：`C. the insect spray`
- **范围**：全卷唯一一处。逐字节比对显示其余 4 项（A/B/D/E）与其他所有授权改动均严格一致（见 S1–S10）。
- **判分后果：无。** 30/30 空答案未变（`BCE`），材料支撑未变，② 空仍由 `will keep the mosquitoes away from us` 唯一支撑，不产生第二解，也不影响任何分布指标。
- **副作用（轻微 L9）**：该词库由「5 项全部 `a/an` + 名词」变为「4 项 `a/an` + 1 项 `the`」，破坏了 §1.4「选项结构一致」的同类性原则。客观上它使 5 项词数由 6,3,5,3,3 变为 **3,3,3,3,3**（实测全部等长），即修长了同类性、损了冠词一致性——**净效果中性偏负**（冠词一致性是学生可见的显性信号，等长学生不可见）。
- **是否申报**：`fixes/` 禁读，**本轮无法核实**。建议由调度方向修复方索取 fixLog，确认该项是否被申报；若未申报，则本条构成 V-D5 第 6 条意义上的**越界改动**。
- **建议改法（最小改动，不触及答案与分布）**：`C. the insect spray` → `C. a small bottle of insect spray`（与授权一致），代价是该项变为 5 词、与其余 4 项的 3 词不等长；或反向接受现状并在后续统一全卷冠词体例。**本轮不代为决定，交调度方裁定。**

---

## 七、缺陷清单

### 严重缺陷：0 条
- 答案错误 0；答案不唯一 0；材料自相矛盾 0；题目无法作答 0。
- R2-D5 的严重 #1（D5-03 行头—答案定义级配对）**已验证清除**：①现需阅读材料方可命中。

### 中等缺陷：3 条

**M-1｜D5-03 修复后残余可套利空间（②③ 仍可由生活经验高概率命中）**
- 位置：D5-03 第 ①/②/③ 空（表格第 1–3 行）
- 实测：无材料期望得分 ≈ **0.33 + 0.90 + 0.62 = 1.85/3 ≈ 62%**；基准 = 整卷字母盲填 30%、随机 20%
- 为什么是问题：②「Our food to be safe after the sun goes down」对 `the insect spray` 仍是近定义级牵引；③「Something we put down before we open the boxes」对 `a plastic sheet` 仍是惯用级牵引。整份仍存在高于基准一倍的套利空间。
- 为什么不判严重：① 已无材料唯一解（毛巾/塑料布/雨衣三者皆可「铺开坐下」），**不读材料必然做错一空**，不构成 §1.1 的「无区分度」要件；且 62% 低于 R2-D5 自身用于判中等的 70% 线。
- 建议改法（最小改动、不触及答案字母与分布）：把 ② 行头改为不含「食物/安全」指向的中性问法，例如 `Something we take out when the mosquitoes come near us`（行头自曝答案类型，违反本轮修复所依据的 §1.8c 第三条出路，**不建议**）；更优解是走 §1.8c 第二条——**词库扩至 6 项、干扰项增至 3 个**，为每类答案各配 1 个同类可排除候选，从根本上抬升无材料歧义。本轮仅记录，**未代为授权**。

**M-2｜D 类必查项「每个表格必须有来源说明与日期」不成立**
- 位置：全卷 10 张表格
- 实测：逐表来源说明 **0 处**；全文日期型 token（`20\d\d` / 月份名 / 月份缩写）命中 **0 个**；`来源` 仅出现 1 次（文件头第 3 行，批次级、无日期）
- 为什么是问题：任务书 D 类专属必查项明文要求；缺日期使「来源」声明不可追溯到生成时点，与 REVIEW-RUBRIC §0「非真题」的前提标注要求方向相悖。
- 归属：**非本次修复引入**。R2-D5 全篇未覆盖此项，本轮按任务书补检后首次记录。
- 建议改法：在文件头第 3 行的来源声明中补一个生成日期（例如 `> 来源：并行子任务产出（2026-XX-XX）｜…`），并在 §1.6 允许的范围内统一，不必逐表重复。

**M-3｜文件末尾无汇总行，D 类槽位算术的「与末尾汇总行一致」一项无法执行**
- 位置：D5.md 全文件（末行即 `① C　② A　③ E`，其后无内容）
- 实测：文件头第 3 行承载的聚合量 `共 10 份 / 30 空` **与实测一致（10 份 / 30 空 ✅）**；但 **文件末尾汇总行 = 0 行**，任务书要求的「每份空数与末尾汇总行一致」无法按字面执行。
- 为什么是问题：任务书与 _COMMON §4 均把「文件末尾汇总行」当作题目文件的常规构件，本卷缺失导致下游无法按行核对份数与空数。
- 归属：**非本次修复引入**。R2-D5 未覆盖此项。
- 建议改法：在文件末尾补一行形如 `共 10 份 / 30 空 / 30 个答案位，每份 3 空` 的汇总行（属 §1.6 允许的内容类别，不构成 §1.6 禁止的「`#` 开头元数据区块」）。

### 轻微缺陷：12 条（记录即可，本轮不建议为此再动文件）

| # | 位置 | 实测问题 | 来源 |
|---|---|---|---|
| L1 | D5-05 ① | 现况句 `He plays basketball with his classmates on the playground twice a week` **未写时段**，该空靠与前句的叙事对照才成立（②③ 时段均已明写） | R2-D5 L1，未修 |
| L2 | D5-10 ①③ | 行头 `in the evening` / `in the morning` 与材料的 `after school` / `used to take a walk in the park`（未带时段）措辞不咬合 | R2-D5 L2，未修 |
| L3 | D5-09 | 标题称「**四个**社团」但表格仅 3 行；材料写了 reading club 在 library，**词库无对应项**，该 club 无处可落 | R2-D5 L3，未修 |
| L4 | D5-07 | `gives the neighbours a simple guide` 搭配生硬（读作「递给一份指南」，语境却是「现场指导」） | R2-D5 L4，未修 |
| L5 | D5-08 | 表头 `What he or she is bringing` 中 `he or she` 并列读起来生硬 | R2-D5 L5，未修 |
| L6 | 全卷 | **6/10 份以 `Our …` 起句**（01/03/04/06/07/09），其中 `Our school` 独占 4 份 | R2-D5 L6，未修 |
| L7 | 文件头第 5 行 | 「10 份互不雷同」仅在**情境层**成立（本轮实测两两 Jaccard 最高 0.153，远低于 0.6 阈值）；D5-01（Student|Contribution）与 D5-07（Person|Contribution）**表格骨架近乎相同**，该行本身也把二者归入同一类型族 | R2-D5 L7，未修 |
| L8 | D5-02/05/06/10 | `—` 预填格约定不统一且未在文件头注明：02/06/10 被略去的格内容**恰是某个干扰项**，05 被略去的内容**不在词库里** | R2-D5 L8，未修 |
| L9 | D5-03 | 词库冠词同类性被破坏：4 项用 `a/an`、C 项用 `the`（**本次修复引入**，见 §6.2 FP-1） | 本轮新增 |
| L10 | D5-03 | ② 行头 `Our food to be safe after the sun goes down` 与材料 `keep the mosquitoes away from us` 措辞跨了一步（材料说的是「驱蚊」，行头说的是「食物安全」） | 本轮新增 |
| L11 | D5-10 | 修复后残余无材料期望分 ≈ **50%**（三空各 1/2），高于 30% 基准；成因是「孩子类 2 项 + 老人类 2 项 + 1 无关项」的 5 项词库**结构上无法再细分**（§1.8c 所述模板算术下限），**不建议再微调词库** | 修复后残余 |
| L12 | D5-02 | `W:` / `M:` 单字母说话人标注与全批「全名」称谓体例不一致，且材料内未指明两人身份（谁是学生、谁是管理员） | 本轮新增 |

---

## 八、最终判定

**通过。** D5.md（10 份 / 30 空）修复已落盘，R2-D5 的 1 条严重与 2 条中等缺陷全部清除，**严重 0 条｜中等 3 条｜轻微 12 条**；词数门禁原始输出 `PASS: no material block exceeds its limit`（退出码 0），10/10 份实测 78–120 词全部 ≤200；结构比 30÷10=3、逐空答案 30/30 唯一且有材料依据、A–E 键位全覆盖、三列最高频均 30%（<70%）、p=2–6 全非周期、最长连 2、闭卷盲填 30%，分布层无可利用不变量。**唯一需调度方裁定的事项是流程问题 FP-1（D5-03 词库 C 项偏离授权文本，fixLog 申报情况因禁读 fixes/ 无法核实）。**
