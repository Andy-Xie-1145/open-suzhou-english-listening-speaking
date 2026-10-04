# F-word-A5 — A5 对话正文超长裁剪（60 词上限门禁补做）

## 0. 开工前一致性确认（字节方式读取）

| 项 | 值 |
| --- | --- |
| 文件 | `data/item-bank/A5.md` |
| 字节数 | 8533 |
| MD5 | `D62FE8D5FBF3CC45E214E1A362F78BF0` |
| SHA256 | `07257461EFBC5DB72A1A2452EFC899169246B75E5112AC91980FF579781F49D0` |
| 换行 | 纯 LF（CR 计数 = 0），无 BOM（首三字节 35,35,32 = "## "） |

读取方式为 `[System.IO.File]::ReadAllBytes` 直读字节后计算摘要，非文本解析，所见内容与磁盘一致。
本 fixLog 写入前已确认 `data/item-bank/fixes/F-word-A5.md` 不存在（新建，未覆盖）。

**口径**（与普查口径一致）：空白分词；只数 `**Dialogue**` 与 `**Question**` 之间的正文行；含说话人标注；不含标题、题干、选项、`**Answer**` 行、汇总行。

## 1. 性质

这不是缺陷修复，是**超长裁剪**。A5 已走完两轮独立审核 + 复核通过；A 类 60 词上限此前只写在产出指令里、从未成为门禁，故归档时未被拦截。
目标：只降词数，**一个字的判分依据都不丢**。

## 2. 改前基线（脚本实测，与任务书一致）

| 题号 | 改前 | 状态 |
| --- | --- | --- |
| A5-01 | 60 | 恰好 60，未超 |
| A5-02 | 54 | 未超 |
| A5-03 | 68 | 超 |
| A5-04 | 67 | 超 |
| A5-05 | 59 | 未超 |
| A5-06 | 67 | 超 |
| A5-07 | 65 | 超 |
| A5-08 | 64 | 超 |
| A5-09 | 58 | 未超 |
| A5-10 | 72 | 超（最严重） |
| A5-11 | 66 | 超 |
| A5-12 | 67 | 超 |
| A5-13 | 66 | 超 |
| A5-14 | 58 | 未超 |
| A5-15 | 66 | 超 |

超限 10 段，与任务书列举完全吻合。

## 3. 改前：逐题答案所依赖的原文句

（判分依据基线，改后逐条复验）

- **A5-01 B** — `Ms. Chen: Two fish, an orange one and a white one, right?`
- **A5-02 B** — `Mr. Wang: ... We're going to ride our bikes there.`
- **A5-03 A** — `Boy: I have. That's why I chose chess. I've never played it before.`（A「try something new」靠 "I've never played it before."）
  干扰项锚点：B → `It meets on Wednesday afternoon.`；C → `Not the piano club?`；D → `One club is enough for me this term.` + `No, thanks.`
- **A5-04 C** — `Ms. Xu: Four. My two kids, my mother and you.`（2+1+1=4）
- **A5-05 D** — `Mr. Guo: No. Keep him on a rope. If he pulls hard, stop walking for a minute.`
- **A5-06 A** — `Woman: I've got some tape in my bag. Give the kite to me and I'll fix the tail.`
  干扰项锚点：C「put the kite back in her bag」靠 `in my bag`
- **A5-07 C** — `Ms. Zhao: My grandma feeding birds. She has done it every morning for ten years.`
- **A5-08 B** — `Ms. Tang: ... He found a grey cat near the station.` + `Woman: Really? Thank you! I'll go and get her at once.`
  干扰项锚点：A → `My son saw a white cat near the market yesterday.`
- **A5-09 D** — `Ms. Sun: You'll have to get up early. The train leaves at six forty.`
- **A5-10 C** — `Man: She usually has a club after class. Go and ask her before lunch.` + `Girl: ... I'll go to the science room before lunch today.`
  干扰项锚点：A「after class this afternoon」靠 `after class`；D「On Thursday morning」靠 `The show is next Thursday.`
- **A5-11 A** — `Mr. Xu: Then she should run round the school track twice a week.`
  干扰项锚点：C → `She doesn't like the high jump.`；D → `on Friday` vs `on Tuesday and Thursday`
- **A5-12 D** — `Man: Yes, two will be enough. Could you bring them?`
  干扰项锚点：A「Six」→ `Six friends are coming`；B「Eight」→ `so eight of us in all`；C「Ten」→ `He's ten.`
- **A5-13 B** — `Ms. Wu: Yes, but only on Friday afternoon.`（`only` 是与 D「Friday morning」的唯一区分点，必须保留）
- **A5-14 C** — `Ms. Fang: Take a small one, and bring a warm coat and a bottle of water. You don't need much food for one night.`
- **A5-15 A** — `Ms. Liu: It will. So please never let it out of the flat alone.`
  干扰项锚点：B → `but only a small one. Big dogs aren't allowed...`；C → `Boy: I see. I'll take it to the park with my father.`（C 是逐字锚点，整句须保留）

## 4. 逐段裁剪记录（只动 Dialogue 正文）

原则：删赘语不删信息——场景状语、动机补充、语气承接词、重复连接词；凡任一选项（含干扰项）逐字锚点，一律不删。

| 题号 | 改前 | 改后 | 删了什么（全部为无判分负载的赘语） |
| --- | --- | --- | --- |
| A5-03 | 68 | **58** | `Have you decided which club`→`Which club have you chosen`；删 `in that book`；删承接语 `I have.`；删 `Then`；删 `for me` |
| A5-04 | 67 | **59** | 删 `to your home`（`coming for the Mid-Autumn dinner` 已含场合）；删 `I haven't bought any yet.`（动机补充，无选项依赖） |
| A5-06 | 67 | **58** | 删 `today`、`on the hill`；删 `if the wind doesn't stop`（条件冗余，与 `Of course` 自相矛盾） |
| A5-07 | 65 | **60** | `What is`→`What's`；`the next contest`→`again`；删 `new`、删 `first` |
| A5-08 | 64 | **58** | 删 `quite`；删 `Then it wasn't yours. But`（白猫已被 `White? My cat is grey` 排除，属重复推理）；删 `Really?` |
| A5-10 | 72 | **59** | 删 `for the science show`（L2 `The show`、L4 `science room` 仍在）；`everything you need`→`everything`；删 `for the volcano`；删 `to the science room` |
| A5-11 | 66 | **60** | 删 `before?`（`never round a track` 已表意）；删 `but`；删 `only`；`That's fine. She can do it`→`She can run` |
| A5-12 | 67 | **59** | `How old is he, and how many guests are coming?`→`How old is he? How many guests?`；删 `Your living room isn't big.`（提问理由，非提问本身） |
| A5-13 | 66 | **59** | 删 `for their first song`；删 `to the list` |
| A5-15 | 66 | **59** | `in our building`→`here`（"楼里" 语境仍由标题与 `the flat` 承载）；`and`→`,`；删 `So please`；删 `I see.` |

未动的 5 段：A5-01（60）、A5-02（54）、A5-05（59）、A5-09（58）、A5-14（58）——本就 ≤60，一字未改。
**10 段全部裁剪成功，无一段因"删无可删"而交回处置。**

## 5. 改后自检

### 5.1 词数（15 段逐段重数）

| 题号 | 改前 | 改后 | ≤60 |
| --- | --- | --- | --- |
| A5-01 | 60 | 60 | ✅ |
| A5-02 | 54 | 54 | ✅ |
| A5-03 | 68 | 58 | ✅ |
| A5-04 | 67 | 59 | ✅ |
| A5-05 | 59 | 59 | ✅ |
| A5-06 | 67 | 58 | ✅ |
| A5-07 | 65 | 60 | ✅ |
| A5-08 | 64 | 58 | ✅ |
| A5-09 | 58 | 58 | ✅ |
| A5-10 | 72 | 59 | ✅ |
| A5-11 | 66 | 60 | ✅ |
| A5-12 | 67 | 59 | ✅ |
| A5-13 | 66 | 59 | ✅ |
| A5-14 | 58 | 58 | ✅ |
| A5-15 | 66 | 59 | ✅ |

15/15 全部 ≤60。最大 60（A5-01 / A5-07 / A5-11 三段），最小 54（A5-02）。
全卷 Dialogue 正文总词数 **957 → 878（−79）**。

### 5.2 选项可判性（15 题 × 4 选项逐个代入）

每题 4 个选项共 60 个，脚本逐条核对"该选项所依据的原文片段"在改后正文中是否逐字可定位：
**60/60 全部命中，0 失败**（含干扰项锚点：A5-03 的 Wednesday afternoon / piano club / one club enough；A5-06 的 `in my bag`；A5-08 的 white cat/market/yesterday；A5-10 的 after class / next Thursday；A5-12 的 ten / Six / eight of us；A5-15 的 `I'll take it to the park with my father.`）。
每题仍唯一可判，无新增二义。

### 5.3 答案序列与汇总行

`B,B,A,C,D,A,C,B,D,C,A,D,B,C,A` —— 与改前**逐位完全一致**。
说明：本文件**不存在尾行汇总行**，文件以 A5-15 的 `**Answer** A` 结尾（已按尾 400 字节核实）。答案序列只能由 15 条 `**Answer**` 行得出，已逐位比对，未变。

### 5.4 只动了 Dialogue 的证明

把 21 处新文本反向替换回原文后重算摘要，得到 **MD5 = `D62FE8D5FBF3CC45E214E1A362F78BF0`**，与开工前基线**逐字节相同**（8533 字节）。
这在数学上排除了任何其他改动：15 个标题、15 条题干、60 条选项、15 条 Answer 行、空行与全部结构均**一字未动**。

### 5.5 数字 / 时间 / 算术重算

- A5-01：`Two fish` = orange 1 + white 1 = 2 → B ✅
- A5-04：`My two kids, my mother and you` = 2+1+1 = **4** → C ✅（与 `Four.` 一致）
- A5-06：`ten o'clock` 未动 ✅
- A5-07：`every morning for ten years`、`Ten years!` 呼应未动 ✅
- A5-08：Saturday 出走 / yesterday 见白猫（因 `My cat is grey` 被否）/ station 见灰猫 → B ✅
- A5-09：`six forty` 未动 → D ✅
- A5-10：`after class` + `before lunch` + `next Thursday` + `today` 齐全 → C ✅
- A5-11：`400-metre` / `400 metres` / `every morning` / `twice a week` / `Tuesday and Thursday` / `Friday` 齐全；周二+周四 = 每周两次，与 `twice a week` 自洽 → A ✅
- A5-12：`He's ten` + `Six friends` = `eight of us in all` → **8** ✅；`two will be enough` → D ✅；`at ten`（10 点）与"十岁"同形，为原卷既有设计，未改
- A5-13：`three months` vs `one month`、`six guitars` 齐全 → B ✅
- A5-15：`six months` 未动 → A ✅

脚本化校验：15 题的数字/时间/星期/度量词片段全部完好，**0 失败**。

### 5.6 说话人标注与称谓

15 段共 **79** 个说话人标注（各段 4/4/6/6/5/5/6/5/5/6/6/6/6/4/5 个），与改前原文件重建副本逐题比对，**标注序列差异 = 0**，文字与归属全部未变（仅 A5-07 的 `What is`→`What's` 属对话正文用词，非标注）。
全卷共 16 种标注：`Boy:`、`Girl:`、`Man:`、`Woman:`、`Mr. Guo:`、`Mr. Wang:`、`Mr. Xu:`、`Ms. Chen:`、`Ms. Fang:`、`Ms. Li:`、`Ms. Liu:`、`Ms. Sun:`、`Ms. Tang:`、`Ms. Wu:`、`Ms. Xu:`、`Ms. Zhao:` —— 拼写与题号映射关系未变，无新增或丢失称谓。注意 A5-07 的 `Ms. Zhao:` 与 A5-10 的 `Ms. Zhao:` 是两个不同角色，各自题内一致，未跨题串用。

### 5.7 文件卫生

新文件 8147 字节（−386），CR 计数 0（纯 LF），无 BOM，以 LF 结尾；15 标题 / 15 Dialogue / 15 Question / 15 Answer / 60 选项 结构计数全部完好；无行尾空格、无连续空格。

## 6. 遗留与建议

1. **门禁缺口仍在**：60 词上限至今不是被检查的门禁，只是指令里的约定，A5 就是这么漏过去的。建议把词数检查写进 REVIEW-RUBRIC 的检查项或产出脚本。
2. **同批未排查**：本次只处理 A5。同目录 A1–A6、B/C/D/E 系列均未做词数普查，A5 的同类超长很可能不止一处（本次 15 段里有 10 段超限，比例不低）。
3. 本次未新增任何汇总行；如需为 A5 补一条答案序列汇总行，属结构变更，超出"只动 Dialogue"的授权范围，留给你定夺。

---
*执行范围声明：本次全程未读取 `reviews/` 下任何报告，未读取 `fixes/` 下任何既有文件，未检索 `docs/pipeline`。*
