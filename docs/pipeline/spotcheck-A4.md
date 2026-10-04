# 人工抽查记录 · 第 44 轮

> 这是**调度方本人**的抽查，不是审核员报告，因此不进入两轮审核链，
> 它的作用是回答脚本回答不了的问题：**答案到底对不对。**
>
> 脚本能验证的：词数上限、结构比、答案序列逐位一致、重复与偏斜。
> 脚本验证不了的：**标答是否真的成立、干扰项是否真的能被排除、句子读起来是否通顺。**

## 抽查对象

`data/item-bank/A4.md`（A 类短对话，15 题，已归档）。
选它是因为它**不在任何销案记录里**——`check-integrity.ps1` 判 A4 为 `UNVERIFIED`（早期 V 报告无 MD5），
且 `known-issues.md` 里有一条关于它的历史疑点（K-05 类开场句同质化）。

## 抽查范围

前 5 题（A4-01 至 A4-05），逐题逐选项人工判读。

## 结果

| 题号 | 题干考点 | 标答 | 人工核对 | 干扰项可排除性 |
|---|---|---|---|---|
| A4-01 | 两人见面时间 | C | 对：`free after five` + `meet at half past five` | A「四点」= 有钢琴课；B「五点」= 说的是 free 之后；D「四点半」= 全段无此时刻 |
| A4-02 | 男孩为何不能去 | A | 对：`going to a friend's birthday party that afternoon` | B「他要参加比赛」与「被邀请观看」矛盾；C「作业多」无出处；D「不爱看篮球」与 `I would love to` 矛盾 |
| A4-03 | 男孩说要做什么 | D | 对：`I will buy a new one for you this weekend` | A「打扫厨房」无出处；B「立刻赔钱」与 `this weekend` 时点矛盾；C「让女孩挑」无出处 |
| A4-04 | 女孩要带什么来 | B | 对：`Bring me some tomatoes from your garden` | A「花」= 女孩浇的是花不是她的；C「蛋糕」无出处；D「鱼」无出处 |
| A4-05 | 男孩要做什么 | A | 对：`Please wash the fruit and put it on the table` | B「看电视」无出处；C「饭后洗盘子」与 `wash the fruit` 矛盾；D「买水果」无出处 |

**5/5 标答正确，20/20 干扰项均可用材料中一句原文或一处明确矛盾排除。**

## 词数手算

A4-01 逐行手算（空白分词，含说话人标注）：
14 + 16 + 13 + 3 = **46 词**，上限 60，合规。
（A4-01 是本批最长的一段之一，手算结果与 `wordcount-gate.ps1` 一致。）

## 发现的观察项（不判缺陷）

A4-01 至 A4-05 的框架高度同构：**五题全部是「学生/女孩向老师、家长或邻居提出请求，对方回应」**。
字面不重复（开场白归一化互异），但语义骨架一致。

> **这正是 L-45 记录的 A 类系统性问题在旧批次里的残留形态。**
> 单条判轻微没有问题，但把它放进「供学生反复练习」的目标下，**五段连着读下来会明显觉得是同一段对话的变体**。

**已登记**：A8、B5 的出题任务书里已把「开场白必须**语义**去重、不能只查字面」写成硬要求。
旧批次不为此返工——它们已归档且答案正确，**改动已归档内容需要重新走完整审核链，成本远大于收益**。
**正确的做法是在新批次里堵住这个源头。**

---

## 第二部分：C4-01（短文五题，本库题型最复杂的一类）

抽查对象：`data/item-bank/C4.md` 第 1 篇（银发食堂）。
选它是因为 C 类每篇 5 道题里混着事实题、推断题、主旨题，**最容易出现「答案对但推理不成立」**。

### 材料词数

空白分词实测 **194 词**（含说话人标注），C 类区间 150 到 220，合规。

### 逐题判定

| 题号 | 考点类型 | 标答 | 人工核对 | 干扰项可排除性 |
|---|---|---|---|---|
| Q1 | 事实 | B | 对：`a full meal costs only twelve yuan` | 其余三个金额（10 / 18 / 20）在全段零出现 |
| Q2 | 事实 | A | 对：`Old people who live alone can eat there free on Wednesdays` | B「送到家」对应的是 `takeaway boxes for people who cannot walk well`，是另一类人；C / D 无出处 |
| Q3 | 事实 | C | 对：`anyone can add a dish to tomorrow's list` | A「四人开会定」与「任何人都能加」矛盾；B「对面餐馆送」无出处；D「提前一周订」无出处 |
| Q4 | **推断** | D | 对，**且确为两步**：须合并 `The meal is only half of it.` 与 `It is that somebody is waiting for me.` 两句才推得出「她更看重陪伴而非饭菜」 | A「想吃更丰盛」与 `the food is simple but warm` 矛盾；B「晚上开门」与 `from ten to two` 矛盾；C「在家吃」与她每周去三次矛盾 |
| Q5 | 主旨 | B | 对：全篇围绕四位志愿者如何让独居老人一起吃饭 | A / C / D 三个主旨均与材料无对应句 |

**5/5 标答正确。**其中 Q4 经人工确认是**真正的两步推断**——
只读 `It is that somebody is waiting for me.` 这一句答不出来，必须知道前一句「饭菜只是一半」。

### 确认到的一条已知轻微

本篇结尾 `The cooks do not think of themselves as a restaurant. They say their real work is ...` 属于
V-C4 记录过的「结尾模板 5/5 共用」那一类。人工读下来确认：结构上确实是模板化的，
但**不影响任何一题的答案**，按 `_COMMON` 第 5 节记为轻微即可。

## 结论

`A4.md` 前 5 题与 `C4.md` 第 1 篇，**标答全部正确，干扰项全部可排除，词数合规**。
A4 另有结构核账报告（`reviews/RECHECK-G3.md` 判「结构完好，可销案」，MD5 `4aa8b4e6…`）。

本记录补充的是脚本给不出的那一半——**内容本身是对的**。
这是第 44 轮起新增的一类检查，与两轮审核链并行，互不替代。

---

## 第三、四部分：B4-01 与 E3-01（补齐 B 类与 E 类的人工覆盖）

### B4-01 调课（B 类长对话，200 词上限，2 题）

| 题号 | 考点 | 标答 | 人工核对 |
|---|---|---|---|
| Q1 | 下月社团的会期 | C | 对。需读懂 `instead`——**只换星期、不换时刻**，所以时刻沿用前文的 `half past four`，日期待在 `Thursday` |
| Q2 | 错过班车之因 | B | 对。依据是 `we clean the room for ten minutes after the club` |

干扰项排除：
- Q1 的 A「Wednesday」被 `instead` 直接否掉；B「four o'clock」与 D「half past three」两个时刻全段不出现。
- Q2 的 A 被 `It's only a five-minute walk` 否掉；**C「his English lesson ends five minutes late」与材料方向相反**
  （材料说他 `left your class five minutes early`，是早退不是晚退）；D 无任何出处。

**时间链人工重算**：社团 16:30 起 -> 打扫 10 分钟 -> 16:40 -> 步行 5 分钟 -> 16:45 到站，
与 `I get there at a quarter to five` 逐位吻合；到站 16:45 而车是 16:45，
「`the quarter-to-five bus often leaves without me`」自洽。**6 步全部闭合。**

### E3-01 补笔记的同学（E 类情景问答）

E 类**没有唯一答案**，因此人工能验的是另外三件事：

1. **情景提示是否给得出答案**——「上周发烧缺了两天课，同桌想知道你落下哪些内容，还问你平常记不记笔记」，
   两问分别对应「两天课的内容」与「记笔记的频度」，**信息充分**；
2. **考点是否把作答形式说清**——Q1 写明「did 后用动词原形 learn」并要求「把问句的 your 切换为考生视角的 my」；
   Q2 写明「how often 提问动作频度（不是 how long）」与「答语用频度短语作完整句子」。**两处都给了可照抄的范例，且语法正确。**
3. **范例答语与情景是否一致**——`My classmates learned two new lessons about plants last week.` 与
   `I take notes in Chinese class almost every day.` 都能用情景提示里的信息作答。**通过。**

**同时确认一处已知的轻微**：Q1 的考点写着「`your classmates` 指考生同班的同学（**非提问者**、非考生）」，
但**提问者正是考生的同桌，同桌也是同班同学**——「非提问者」这一括注与事实相抵。
这与 V-E3 记录的 L33 是同一处，**属既有轻微，不阻断**。
**但它值得记住**：E 类靠文字描述来消除歧义，而**描述本身也可能自相矛盾**——
考点不是天然可靠的，它和题目本身一样需要被审核。