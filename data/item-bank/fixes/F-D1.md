# 修复执行记录：D-batch1.md（第 1 轮）

- 依据报告：`data/item-bank/reviews/R1-D1.md`
- 目标文件：`data/item-bank/D-batch1.md`（唯一被修改的既有文件）
- 修复范围：**仅严重 + 中等缺陷**；轻微缺陷 9 条一律未动，留给第二轮
- 报告判定：严重 0 条、中等 10 条、轻微 9 条

---

## 已修复

> 全部采用报告给出的替换文本，逐字执行，未自拟。

### 中等 #1｜D-01 首句「三个社团」与下文对不上
- 位置：Passage 第 1 句（L9）
- `Tom is in three school clubs this term.` → `Tom takes part in three after-school activities this term.`
- 说明：统领句降到与正文一致，与表格三行「Activity」口径对齐。

### 中等 #2｜D-01 答案 ① 的 meeting 无原文依据
- 位置：Word Bank A（L17）
- `A. take part in the chess club meeting` → `A. go to the chess club`
- 说明：改为原文原词，与答案 B、D 同口径。**轻微 #1（C/E 去时间状语）未执行**，仅记录报告括注。

### 中等 #3｜D-02 干扰项质量
- 位置：Word Bank B（L38）、D（L40）
- `B. three boxes` → `B. three bottles`；`D. two bags` → `D. three bags`
- 说明：换成「数量接近、包装错误」的近身干扰项，答案 C/E/A 不变。

### 中等 #4｜D-03 词库 A 过长、一眼可排除
- 位置：Word Bank A（L58）、Table 首行（L54）
- `A. Walk along this street and turn left at the second crossing` → `A. Turn left at the second crossing`
- `| The way to the museum | ① |` → `| The first turning on the way | ① |`
- 说明：A 由 11 词压到 6 词，与 B/C/D/E（3–4 词）同量级；改后五项长度 3–6 词。

### 中等 #5｜D-04 答案 B 是全库最短、结构异类
- 位置：Passage（L68）、Word Bank B（L77）
- `He has to run 800 metres before breakfast every morning.` → `He has to run 800 metres on the sports field before breakfast every morning.`
- `B. run 800 metres` → `B. run 800 metres on the sports field`
- 说明：补地点状语，五项均带地点或同伴状语，长度 5–8 词。表格行未动。

### 中等 #6｜D-04「下周三」与未限定周次的训练并存
- 位置：Passage 第 1 句（L68）
- `and the sports meeting is next Wednesday.` → `and the school sports meeting will be held at the end of this term.`
- 说明：报告给的是「择一」方案，**取方案 ①**（一处改动、改动面最小）；本句改后，本周训练与热身赛都明确早于运动会。方案 ② 未采用。

### 中等 #7｜D-05 超纲词 glutinous rice 出现在答案选项里
- 位置：Passage M 的话（L87）、Word Bank A（L96）
- 与 #8 合并为一次替换：`M: I'll go with you. After the races, we should buy some glutinous rice and bamboo leaves for the zongzi.` → `M: I'll go with you. On Friday evening, after the races, we'll buy some rice and bamboo leaves for the zongzi.`
- `A. buy glutinous rice and bamboo leaves` → `A. buy rice and bamboo leaves`
- 说明：原文与选项同步降门槛；`zongzi` 按报告保留。

### 中等 #8｜D-05 表格②行「Friday evening」原文无时间落点
- 与 #7 同一次替换完成（L87）。
- 说明：原文已钉死 `On Friday evening`，②A 不再靠排除得出，而是由材料时间证据直接定位。

### 中等 #9｜D-08「住五楼」与「帮提水」因果不通
- 位置：Passage（L145）
- `His classmate Kate lives on the fifth floor, so she plans to help an old neighbour carry water.` → `His classmate Kate lives on the first floor, so she plans to help an old neighbour carry water upstairs.`

### 中等 #10｜D-08 标题「清洁日」与三项任务不匹配
- 位置：标题（L143）、Passage 首句（L145）
- `## D-08 社区清洁日` → `## D-08 社区志愿服务日`
- `This Saturday is our cleaning day.` → `This Saturday is our neighbourhood service day.`
- 说明：标题与首句同步改，表格与答案未动。

---

## 已修复（自拟方案）

**无。** 10 条中等缺陷报告均给出了可直接落地的替换文本，全部照用，未自拟任何改动。

---

## 未修复

**无。** 10 条中等缺陷全部修复成功，无 old_string 找不到被跳过的条目。

**轻微缺陷 9 条按要求未处理**（留给第二轮），此处仅列清单备查，未作任何改动：

| # | 题号 | 内容 | 状态 |
|---|---|---|---|
| 1 | D-01 | 词库 C/E 带时间状语，口径不齐 | 未动（轻微） |
| 2 | D-06 | 表头 `Club and time` 与 Nick 在家练琴不匹配 | 未动（轻微） |
| 3 | D-06 | 词库 E 11 词，明显偏长 | 未动（轻微） |
| 4 | D-07 | `housework` 口径略窄 | 未动（轻微） |
| 5 | D-09 | 表格 10:00 a.m. 早于乘公交时刻 | 未动（轻微） |
| 6 | D-01/D-06 | 两题情境雷同 | 未动（轻微） |
| 7 | 全文件 | 5 处对话体裁误标 `**Passage**` | 未动（轻微，属格式统一处理） |
| 8 | 全文件 | D-05/D-06 之间多一空行 | 未动（轻微，属格式统一处理） |
| 9 | D-10 | 同句内人称跳换 | 未动（轻微） |

> 注：轻微 #7、#8 属「格式另有统一处理」范围，即使不算轻微也不应由本轮触碰；一并留待第二轮/统一处理。

---

## 修改后自检

### 结构标记 ✅
- 10 题各自恰有 1 个 `**Passage**`、`**Table**`、`**Word Bank**`、`**Answers**`，全部齐全、未增减。
- 本轮 14 处替换均为句内文本或单行替换，未触碰任何结构标记行。
- 文件总行数 **198 → 198**，不变。

### 编号连续 ✅
- D-01 ~ D-10 连续无缺号、无重号，题号文本未被改动。
- 空号 ①②③ 全部保留，位置未变。

### 选项个数 ✅
- 10 份词库均为 A–E 五项，顺序完整、无重复、无增删。
- 定位：L16 / L36 / L57 / L75 / L95 / L114 / L134 / L152 / L172 / L190，各 = 5。
- 每份仍恰有 2 个干扰项（未把原干扰项改成答案项或反之）。

### 答案对应 ✅
- 答案行 10 条、每条 3 空，全部未改动。
- 字母分布 **A6 / B6 / C6 / D6 / E6 = 30**，与文件头声明一致。
- 逐空复核改后仍判得出唯一答案：

| 题 | 空 | 答案 | 改后材料依据 |
|---|---|---|---|
| D-01 | ①②③ | A / D / B | A=`go to the chess club` 对应 `goes to the chess club on Monday afternoon` |
| D-02 | ①②③ | C / E / A | `a big bottle` / `a kilo` / `two packets` |
| D-03 | ①②③ | A / B / D | `turn left at the second crossing` 对应表格首行「第一个路口」；Bus 12；five minutes |
| D-04 | ①②③ | B / C / E | 原文 `run 800 metres on the sports field`；周二周四跳高；周五热身赛 |
| D-05 | ①②③ | D / A / C | 周五下午看龙舟；**周五晚**买粽叶糯米；周六上午学包粽子 |
| D-08 | ①②③ | D / B / A | Peter 打扫操场；Kate 帮提水；下午贴节水告示 |

- 重点复查三处（报告点名第二轮可能升级为严重）：
  - **D-03**：改后 A 与 B/C/D/E 同为 3–6 词，①已不能靠长度一眼锁定；②③仍由原文 `Bus 12`、`five minutes on foot` 唯一定位。无二解。
  - **D-05**：②的时间证据已写进原文（`On Friday evening`），不再依赖排除；`zongzi` 与选项 `buy rice and bamboo leaves` 仍一一对应。无二解。
  - **D-01**：A 由「无据可依」变为原文原词，五项中仅 B、D 有原文支撑，①②③无二解。

### 未引入新问题 ✅
- 改动均为报告指定文本，未新增词汇到答案选项（`after-school activities`、`sports field`、`upstairs`、`neighbourhood service day`、`the first turning` 均为课标内常用词）。
- D-04 改后「运动会于学期末举行」与「本周训练/热身赛」不再冲突，时间线自洽。
- D-08 改后「住一楼 → 有余力帮邻居提水上楼」因果闭合；选项侧保持原样（仍为 `help an old neighbour carry water`，`upstairs` 只加在原文），答案 ②B 不变。

---

**统计：严重 0｜中等 10 已修｜自拟 0｜未修复 0｜轻微 9 保留。**
