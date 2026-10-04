> ⚠️ **本文件是 2026-10-04 12:09:13 修复事故后的重建件，不是原始记录。**
> 原始记录 `F1-B7.md` 被 writer-a 的误操作截断至 58 字节并丢失；git 未跟踪、无备份。
> 本件依据 writer-a 会话内残留记忆重建，**不保证与原件逐字节相同**。
> **不得用本件做反向替换闭合证明**——重建件的「改前原文」可能已与真实前像有出入。
> 若需闭合证明，请以 **R1 报告基线 + 当前磁盘**为准，独立推出替换清单。
>
> **原件字节数（事故前实测，writer-a 记得）：** 20375 字节。
> **原件 MD5：不可复原**——writer-a 从未对记录文件本身算过 MD5，只算过被修题目文件的 MD5。

## 重建范围声明（重要）

**本件只重建可陈述的事实，不复原原件的叙述与论证文字。**
原件中由 writer-a 撰写的分析段落、代价说明、判读理由、门禁输出粘贴块，**此处内容不可复原**，不予杜撰。
下面「事实表」里的每一行都是 writer-a 在事故前记录过、且可由当前磁盘或 R1 报告独立复核的数字与改动。
## 事实表

| 项 | 值（事故前 writer-a 实测） |
|---|---|
| 被修文件 | `data/item-bank/prod/B7.md` |
| 修前 MD5 / 字节 / 行 | `b6b60dbc987fcd99557a777704df5c87` / 9550 / 211 |
| 修后 MD5 | `2ae058eed985c44b6b2acc667746d28e` |
| 依据报告 | `reviews/R1-B7.md`（writer-a 当时只读这一份） |
| 处置 | 严重 3｜中等 1｜轻微 1，共 5 处改动 |

### 五处改动（writer-a 记录，**须回磁盘独立复核**）

| # | 位置 | 改前 | 改后 |
|---|---|---|---|
| 1 | B7-05 Q2 选项 C | `One hour and a quarter.` | `Twenty minutes.` |
| 2 | B7-02 材料 | `If the rain starts at half past eight` | `If the rain starts at nine` |
| 3 | B7-06 材料 | `forty minutes` / `two hours and ten minutes` | `thirty-six minutes` / `two hours and six minutes` |
| 4 | B7-01 材料 | `Most people want the whole thing once a year.` | `…three times a year.` |
| 5 | B7-05 话轮 3 | `You pay two yuan and you take ninety yuan in notes…` | `The fee is two yuan either way. Do you want the rest in notes?` |

改后答案序列 `B D C A D A B C A B D C A C B D`（未变动）。

### 此处原件内容不可复原

以下原件段落**不予重建**：缺陷逐条独立复核过程、对报告两条不成立处方的反证全文、
「修复员自制缺陷已回退」的完整叙述、Jaccard 口径声明、代价分析、六道门禁原始输出粘贴块。
**其中「对严重 2 改法甲与中等 1 主建议的反证」是本轮最关键的推理，不应丢失——建议由他人依据 R1-B7.md 原文重新推导。**

## 现在能核的（不依赖本件）

闭合证明请用：R1-B7.md 的基线 + 当前磁盘 `B7.md`，独立推出替换清单。
B7 当前 MD5 可用 `python scripts/dispatch-guard.py baseline B7` 取。
