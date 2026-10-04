# F2-TIME-REF：修 D7-01 时间矛盾 + C9 前三篇三处加词与短文矛盾

> 授权：task-47｜记录人：writer-bcd
> 改动范围：**只改 2 个题目文件、共 4 处，全部是单行文本替换。**
> 材料正文其余部分、题干、正确项、Answer 字母、末尾汇总行一律未动。

## 一、结论

四处矛盾全部消：
1. D7-01 的回程时刻与表格差 50 分钟 → 已改，时间链自洽。
2. C9-01 Q5 的 D 把周日洗车挂在 oven 上（短文说他洗的是 cart）→ 已换成短文原词复述。
3. C9-02 Q5 的 C 把「总共十一节」改成「每人十一节」→ 已换成短文未涉及的说法。
4. C9-02 Q5 的 D 把 Mr. Pei 写成学生 → 已换成短文未涉及的说法。

**这三处的共同病灶**：task-16 的加词让干扰项**不再是「材料没说」，而是「与材料冲突」**。
干扰项仍然是假的、答案仍唯一，所以不构成严重缺陷；但学生会读到与材料冲突的句子而开始怀疑自己读错了。

## 二、替换清单（反证可自行重跑）

### 2.1 data/item-bank/prod/D7.md（1 处）

| # | 改前 | 改后 |
|---|---|---|
| D-1 | `came back at five to ten.` | `came back at five past nine.` |

完整改前行：
```
Auntie Tang: Mine was longer. My card is H-3182 and I went out at a quarter past seven and came back at five to ten.
```
**重跑方法**：把这一行里的 `five to ten` 换成 `five past nine`，重算 MD5，应得基线值。

### 2.2 data/item-bank/prod/C9.md（3 处，三行均为整行替换）

| # | 改前 | 改后 |
|---|---|---|
| C-1 | `- D. The oven under the cart that he washes on Sunday.` | `- D. The oven under the cart, which takes fifty minutes for each batch.` |
| C-2 | `- C. They have each come to eleven second lessons.` | `- C. They have each paid him for the lesson.` |
| C-3 | `- D. They keep their phones in the same box as he does, with the numbers written outside it.` | `- D. They keep their old phones in a drawer at home, with the numbers written outside it.` |

**重跑方法**：把这三行逐条按上表右列换回左列，重算 MD5，应得基线值。三行各出现 1 次，无歧义。

## 三、基线与闭合（实测）

```
BEFORE  D7.md  MD5=5D64B315E9900D3C51C501FB68C06024  bytes=14229  lastByte=0x0A
AFTER   D7.md  MD5=9279AA8EFE1965219A6C00E48D3CF3BF  bytes=14232  lastByte=0x0A
REVERSED(D-1 反向替换后重算) = 5D64B315E9900D3C51C501FB68C06024   match_baseline=True

BEFORE  C9.md  MD5=415B45C1333D1913E991C6E55460EA8F  bytes=14399  lastByte=0x0A
AFTER   C9.md  MD5=BEADCD64F21BE543F3A5B9845F3DC8BE  bytes=14407  lastByte=0x0A
REVERSED(C-1/C-2/C-3 反向替换后重算) = 415B45C1333D1913E991C6E55460EA8F   match_baseline=True
```

**两个文件都逐位闭合 → 除授权的 4 处外无任何字节变动。**
文件大小 D7 14229→14232，C9 14399→14407，与整行替换的长度差一致。

## 四、逐处判读

### 4.1 D7-01 时间链

| 项 | 改前 | 改后 |
|---|---|---|
| 出场 | `a quarter past seven` ＝ 07:15 | 同 |
| 表格 Out at 列 | `07:15` | 同 |
| 表格 Time used 列 | `1 hour 50 minutes` | 同 |
| 应得回程 | 07:15 ＋ 1h50m ＝ 09:05 | 同 |
| 改前话轮 | `five to ten` ＝ 09:55，**差 50 分钟，矛盾** | `five past nine` ＝ 09:05，通过 |

另一处空格里原本就是 `five past nine`；改前只有 Auntie Tang 这一行对不上，改后两行一致。

### 4.2 C9-01 Q5 的 D

- 短文：`The square is closed to carts on Sunday morning, and that is when he washes the cart.`
- **改前**：`The oven under the cart that he washes on Sunday.`——短文说他周日洗的是 cart 不是 oven，学生读到这个选项会与材料对撞。
- **改后**：`The oven under the cart, which takes fifty minutes for each batch.`——
  括号里是短文**原话**（`takes fifty minutes`），挂在**正确的主语 oven** 上，不与任何一句冲突；
  它仍然不是左膝疼痛的归因，所以仍是假干扰项，排除依据回到「材料说的是坡，不是烤炉」。

### 4.3 C9-02 Q5 的 C

- 短文：`Anything else is a second lesson, and there have been eleven second lessons.`——**总共十一节**。
- **改前**：`They have each come to eleven second lessons.`——**每人十一节**等于四人共四十四节，与短文直接冲突。
- **改后**：`They have each paid him for the lesson.`——短文全篇未提报酬，属「材料没说」，排除依据回到材料内。

### 4.4 C9-02 Q5 的 D

- 短文：`He keeps the phones in a box with the numbers written on the outside in large print.`——**是他在保管**。
- **改前**：`They keep their phones in the same box as he does...`——把保管这件事写成了学生的行为，读者要花力气分辨谁在保管。
- **改后**：`They keep their old phones in a drawer at home, with the numbers written outside it.`——
  抽屉在家里，短文从未提及，属「材料没说」，**不再牵涉 Mr. Pei 与学生的角色归属**。

> **保留的加词**：末段 `with the numbers written outside it` 保留——它是短文原词的复述，
> 且现在挂在一个**短文没有提及的新对象**（家里抽屉里的旧手机）上，不与任何原句冲突。

## 五、长度与结构复算（实测）

| 题号 | 答案 | 改前四选项词数 | 改后四选项词数 | 极差 |
|---|---|---|---|---|
| C9-01 Q5 | B | 13 / 13 / 9 / 10 | 13 / 13 / 9 / **12** | **0** |
| C9-02 Q5 | A | 17 / 7 / 8 / 17 | 17 / 7 / 8 / **16** | **1** |

| 检查项 | 结果 |
|---|---|
| D7-01 词数 | 改前 172 / 改后 172（两个说法同为 3 词，**词数不变**） |
| C9 全批词数 | 最大 216，**0 条超限**（C 类区间 150–220） |
| C9 题数比 | Answer 行 30 ÷ 段数 6 ＝ 5 |
| C9 选项数 | 选项行 120 ＝ 30×4 |
| 极差（margin） | 两道被改的题分别为 0 与 1，均 ≤6 |
| 末尾换行 | 两文件末字节均 0x0A |

## 六、闸门原始输出（时间戳 2026-10-04 11:30:26 / 11:30:38）

| 闸门 | 结果 |
|---|---|
| wordcount-gate | `PASS: no material block exceeds its limit`　EXIT=0 |
| encoding-check | 合计 500 份 md，`PASS: no encoding or corruption defect`　EXIT=0 |
| speaker-gate（D7 单文件） | `PASS: no speaker-label defect` |
| shortcut-audit | C 类 35/260＝13.5%「正常」，四类全部正常；逐题极差全部 ≤6；EXIT=0 |
| topic-guard build | 重编码 2 条，总计 694 条；EXIT=0 |

> **build 为什么只重编码 2 条**：本轮改的是 C9 的**三个选项行**，而 `parse_materials` 会剔除选项行与 Answer 行，
> **进入索引的文本（标题＋材料正文＋题干）一字未变**，所以 C9 不需要重编码；
> 被重编码的 2 条是 A16-04 与 D7-01（那两个改的是材料正文，分别属 FIX-DUP-ELEC 与本记录）。

## 七、已读文件清单

| 文件 | 用途 | 授权 |
|---|---|---|
| data/item-bank/prod/D7.md | 被改文件之一 | 任务 |
| data/item-bank/prod/C9.md | 被改文件之二 | 任务 |

**未修改**：D7.md 与 C9.md 授权范围外的任何一行；任何其他题目文件。

## 八、结论

**通过。** 四处矛盾全部消，**其中 C9 的三处把干扰项的排除依据从「与材料矛盾」退回了「材料未提及」**——
答案唯一性本就未被破坏，但学生的阅读不再被与材料冲突的句子打断。
两个文件均**反向替换 MD5 逐位闭合**，授权 4 处之外零字节改动。
