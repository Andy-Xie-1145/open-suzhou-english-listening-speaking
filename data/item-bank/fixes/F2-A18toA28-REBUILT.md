> ⚠️ **本文件是 2026-10-04 12:09:13 修复事故后的重建件，不是原始记录。**
> 原始记录 `F2-A18toA28.md` 被 writer-a 的误操作截断至 64 字节并丢失；git 未跟踪、无备份。
> 本件依据 writer-a 会话内残留记忆重建，**不保证与原件逐字节相同**。
> **不得用本件做反向替换闭合证明**——重建件的「改前原文」可能已与真实前像有出入。
> 若需闭合证明，请以 **R1 报告基线 + 当前磁盘**为准，独立推出替换清单。
>
> **原件字节数（事故前实测，writer-a 记得）：** 23804 字节。
> **原件 MD5：不可复原**——writer-a 从未对记录文件本身算过 MD5，只算过被修题目文件的 MD5。

## 重建范围声明（重要）

**本件只重建可陈述的事实，不复原原件的叙述与论证文字。**
原件中由 writer-a 撰写的分析段落、代价说明、判读理由、门禁输出粘贴块，**此处内容不可复原**，不予杜撰。
下面「事实表」里的每一行都是 writer-a 在事故前记录过、且可由当前磁盘或 R1 报告独立复核的数字与改动。
## 事实表

| 项 | 值（事故前 writer-a 实测） |
|---|---|
| 被修文件 | `data/item-bank/prod/A24.md`、`A26.md`、`A28.md` |
| 依据 | `docs/pipeline/speaker-gate.ps1` |
| 缺陷 | 8 处说话人标签（SPEAKER-COUNT + STUDENT-SWITCH 各触发一次，闸门报 16 行） |
| 改动内容 | **只改说话人标签词**，材料其余部分、选项、答案、汇总行一律未动 |
| 段词数 | 8 段全部不变 |

### 修前 → 修后 MD5

| 文件 | 修前 | 修后（= 事故前磁盘值） |
|---|---|---|
| A24.md | `4bf93404e74f7bbf532deb6d629cca5e` | `3b52e5bc62484e99b6eaa0045569506f` |
| A26.md | `4af70216f3d50ac43ba8a960bd4a800d` | `15d0039203530b44e645a78dbd247a29` |
| A28.md | `c461fa9b4a3759aad56c747c1a72627a` | `e735de16e2f4e34fb4d61969a5093a74` |

### 八处标签改动（writer-a 记录，**须回磁盘独立复核**）

| 题号 | 修前顺序 | 处置 | 修后顺序 |
|---|---|---|---|
| A24-11 | Boy / Mr. Xu / **Girl** | `Girl:` → `Boy:` | Boy / Mr. Xu / Boy |
| A26-11 | Girl / Mr. Bai / **Boy** | `Boy:` → `Girl:` | Girl / Mr. Bai / Girl |
| A28-07 | Boy / Mr. Gao / **Girl** | `Girl:` → `Boy:` | Boy / Mr. Gao / Boy |
| A28-10 | Girl / Mr. Hui / **Boy** | `Boy:` → `Girl:` | Girl / Mr. Hui / Girl |
| A28-11 | Boy / Mr. Pei / **Girl** | `Girl:` → `Boy:` | Boy / Mr. Pei / Boy |
| A28-13 | Girl / Ms. Luo / **Boy** | `Boy:` → `Girl:` | Girl / Ms. Luo / Girl |
| A28-14 | Girl / Mr. Li / **Boy** | `Boy:` → `Girl:` | Girl / Mr. Li / Girl |
| A28-15 | Girl / Mr. Ding / **Boy** | `Boy:` → `Girl:` | Girl / Mr. Ding / Girl |

### 此处原件内容不可复原

以下原件段落**不予重建**：逐处语义核对表（第一人称指代论证）、gate 参数被静默丢弃的发现与后果、
speaker-gate 无 param 块的调查经过、六道门禁原始输出、闸门修复前后对照。

### 权威性说明

**文件名 `F2-A18toA28` 是区间标签，不代表 A18–A28 全段都被改过。**
实际只改了 A24、A26、A28 三个文件中的 8 处；**A18、A22 等批次自 R1 起零改动**。
验证：`python scripts/dispatch-guard.py touched A18` → UNCHANGED-SINCE-R1。
