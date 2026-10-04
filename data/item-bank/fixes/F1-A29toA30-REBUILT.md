> ⚠️ **本文件是 2026-10-04 12:09:13 修复事故后的重建件，不是原始记录。**
> 原始记录 `F1-A29toA30.md` 被 writer-a 的误操作截断至 64 字节并丢失；git 未跟踪、无备份。
> 本件依据 writer-a 会话内残留记忆重建，**不保证与原件逐字节相同**。
> **不得用本件做反向替换闭合证明**——重建件的「改前原文」可能已与真实前像有出入。
> 若需闭合证明，请以 **R1 报告基线 + 当前磁盘**为准，独立推出替换清单。
>
> **原件字节数（事故前实测，writer-a 记得）：** 14481 字节。
> **原件 MD5：不可复原**——writer-a 从未对记录文件本身算过 MD5，只算过被修题目文件的 MD5。

## 重建范围声明（重要）

**本件只重建可陈述的事实，不复原原件的叙述与论证文字。**
原件中由 writer-a 撰写的分析段落、代价说明、判读理由、门禁输出粘贴块，**此处内容不可复原**，不予杜撰。
下面「事实表」里的每一行都是 writer-a 在事故前记录过、且可由当前磁盘或 R1 报告独立复核的数字与改动。
## 事实表

| 项 | 值（事故前 writer-a 实测） |
|---|---|
| 被修文件 | `data/item-bank/prod/A29.md`、`A30.md` |
| 依据报告 | `reviews/R1-A30.md`、`reviews/R1-A29-2.md`（**只读这两份**） |
| 处置 | 严重 3｜中等 4｜轻微 1，共 11 处 |

### 修前 → 修后 MD5

| 文件 | 修前 | 修后 |
|---|---|---|
| A29.md | `8cff404d7edfe7f9e8e810dc64655cde` | `2ee16f32d8dbd602039e015ac3d8088d` |
| A30.md | `3dbce7d7e3d210f1664fe9ac7970610e` | `501e4894b3db8868ea1c4d552aca2e7d` |

（上表为 task-18 阶段值。task-20 另有一次改动：A29→`712823fdf676a97a9a4f90a2dda0be79`、A30→`a75de875dd67bfa5c66e87b20794295e`。）

### 十一处改动（writer-a 记录，**须回磁盘独立复核**）

| # | 位置 | 改动 |
|---|---|---|
| 1 | A30-08 | Answer C → B |
| 2 | A30-08 | 选项 D `Every three hours.` → `In two weeks.`（**未采用报告的 `Every June.`**，原处方会造出两个都像对的选项） |
| 3 | A30-13 | Answer B → A |
| 4 | A30-02 | 标题 `小区宽带的年费` → `小区宽带的付费` |
| 5 | A30 | 末尾汇总行同步 |
| 6 | A29-06 | **改题干**：`…when she returns the bicycle and gets the deposit back?` → `How much will the girl pay for the two hours, after the fifty yuan deposit comes back?` |
| 7 | A29-06 | Answer B → A |
| 8 | A29-13 | 补 `Boy: Is setting one enough?` |
| 9 | A29-15 | 补 `Girl: Shall I cut the sleeves?` |
| 10 | A29-12 | `A balcony tree should not be taller than the rail.` → `…should be a little above the rail.`（等长） |
| 11 | A29 | 末尾汇总行同步 |

### 此处原件内容不可复原

以下原件段落**不予重建**：对报告两处不成立处方的反证全文、A29-12 与 A30-08 的代价分析、
逐题唯一性复核表、六道门禁原始输出、task-20 补充节（含「未先确认报告版本」的自述失误）。

### 一条必须保留的教训（据 writer-a 会话记录，非原件原文）

本轮曾把已被取代的 `R1-A30.md` 当作 A30 的现行依据，据此做出裁定。
**正确依据是「A30 以 R1-A30-2 为准，而它与 R1-A29-2 一致判真重复」。**
详见 `docs/pipeline/LESSON-111.md` 与调度方记录。
