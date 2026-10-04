# F1-A25-extra：A25-05 正确项的正向依据被材料在「后果」层抵消

> 授权：第 194 轮调度方处方｜依据 `reviews/R2-A25-2.md`（本记录不引用该报告的数字，只用其指认的缺陷位置）
> 被改文件 `data/item-bank/prod/A25.md`｜改动 **1 处、1 行**

## 一、缺陷与处方

**改前（L79，第 194 轮实测行号）**：
```
Mr. Bai: Even those. Food from outside makes them ill. Buy the approved food.
```

**改后**：
```
Mr. Bai: Even those. Only the keeper may feed them. He takes your bread to them.
```

**答案字母不变（A 仍是 A）；L83–L86 四个选项一字未动；L260 汇总行一字未动。**

## 二、为什么必须这样改（缺陷的成因）

- 正确项 A「Give it to the keeper for the animals.」在改前的**唯一正向依据**是 L77 的 `The keeper does it.`；
- 而改前 L79 的 `Food from outside makes them ill.` **与 A 在「后果」层直接冲突**——女孩的面包正是园外食物，
  A 断言它被喂给动物，材料给的却是「会让它们生病」；
- 且 L79 另有自己的替代方案 `Buy the approved food.`，**四个选项里没有任何一项对应它**——即材料给的正路没被考。

改后 A 同时获得两处支撑：L77 的 `The keeper does it.` 与 L79 的 `Only the keeper may feed them. He takes your bread to them.`，
**且不再有任何一句与 A 冲突**。

## 三、⚠ 被否决的旧处方（留档，防止下轮重犯）

**`reviews/R1-A25.md` L251 的「处方 2」不可用**，理由逐字记录：
它把 L79 换成含 `give your bread back at the gate` 的文本，**但那行里没有出现过 `keeper`**；
而选项 A 一字未动、仍是 `Give it to the keeper for the animals.`。
**结果：A 的正向依据仍只有 L77 那一句，与改动前完全相同——不构成闭合。**
**换句话说，那条处方改了「后果」却没补「路径」，把冲突消掉了，正确项的依据却一点没增加。**

## 四、替换清单与唯一命中实测

| 项 | 值 |
|---|---|
| 改前整行 | `Mr. Bai: Even those. Food from outside makes them ill. Buy the approved food.` |
| 改后整行 | `Mr. Bai: Even those. Only the keeper may feed them. He takes your bread to them.` |
| 该整行在改前文件中的出现次数 | **1**（唯一命中，故未用全局 replace） |
| 该整行在改后文件中的出现次数 | **1** |
| 文件内 `Even those` 出现行数 | **1** |
| 文件内 `Buy the approved food` 出现行数 | **1** |

**重跑方法**：把改后整行换回改前整行（全文仅此一处），重算 MD5，应得 **f13b9e4e4ff5cb0df073620dffcaff62 / 7405 字节**。

## 五、闭合自证（反向套用实测，基线自己重算）

```
BEFORE  data/item-bank/prod/A25.md  MD5=f13b9e4e4ff5cb0df073620dffcaff62  bytes=7405  lastByte=0x0A
AFTER   data/item-bank/prod/A25.md  MD5=425e14d0fe31f4893c83ba73da69f9b6  bytes=7408  lastByte=0x0A  (+3)
REVERSED（按第四节反向套用后重算）= f13b9e4e4ff5cb0df073620dffcaff62  bytes=7405  match_baseline=True
```

**逐位闭合** → 除授权的 1 行外，A25.md 无任何字节变动。
**基线是自己动手前用 `Get-FileHash` 重算的**，未采信任何既有报告里的数字。
U+FFFD（真字符）= 0，CR = 0，无 BOM，末字节 `0x0A`。

## 六、改后材料与选项逐句自洽复核

```
L76: Girl: Mr. Bai, may I feed the monkeys my bread?
L77: Mr. Bai: No. You must not feed any animal here. The keeper does it.
L78: Girl: Even the ducks by the pond?
L79: Mr. Bai: Even those. Only the keeper may feed them. He takes your bread to them.
L82: What may the girl do with her bread?
L83: - A. Give it to the keeper for the animals.      ← 答案
L84: - B. Throw it to the monkeys herself.
L85: - C. Give it to the ducks by the pond.
L86: - D. Drop it on the ground for the birds.
L88: **Answer** A
```

| 选项 | 排除依据 | 档 |
|---|---|---|
| **A** | L77 `The keeper does it.` ＋ L79 `He takes your bread to them.` | 正确项 |
| B | L77 `You must not feed any animal here.` 显式否定 | 甲 |
| C | L77 显式否定（`must not feed any animal here` 涵盖 ducks） | 甲 |
| D | L77 显式否定 | 甲 |

**结论：正确项依据充分，四个选项各自可被材料内信息独立排除，全文无一句与 A 冲突。自洽。**

## 七、词数（口径：只数材料正文含说话人标注，空白分词）

| | 改前 | 改后 |
|---|---|---|
| A25-05 材料词数 | **35** | **37**（+2） |

**上限 60，余 23。**
> **与派单里「45→47」的口径不同**：我实测按上述口径是 35→37，**增量 +2 与派单一致**，但基数不同。
**我按自己的口径报，并写明口径，不改派单的数也不迁就它。**

## 八、闸门原始输出（2026-10-05）

```
① wordcount-gate
PASS: no material block exceeds its limit
WORDCOUNT_EXIT=0

② verify-bank
A25 | A | prod | PASS(15题)
ALL CONSISTENT

③ check-integrity
A25 | CL-A25.md | 强匹配 | f13b9e4e4ff5cb0df073620dffcaff62 | 425e14d0fe31f4893c83ba73da69f9b6 | MISMATCH
总计 59 个批次；需关注 3 个。
```

**A25 的 MISMATCH 是本次修复的预期结果**（旧 CL 锚的是改前字节）。**修复落盘必然使旧锚失效，这不是回归。**
**同一时刻的另外 2 个需关注项里，D7 是别的 agent 正在改，与本任务无关。**

## 九、已读文件清单

| 文件 | 用途 |
|---|---|
| data/item-bank/prod/A25.md | 被改文件；改前读全块、改后逐句复核 |

**未修改**：除授权的 1 行外的任何内容；任何其他文件。
