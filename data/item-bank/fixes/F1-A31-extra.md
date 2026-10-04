# F1-A31-extra：A31-09 小瓶换中瓶的推理方向反了

> 授权：第 194 轮调度方处方｜依据 `reviews/R2-A31-2.md`（本记录不引用该报告的数字，只用其指认的缺陷位置）
> 被改文件 `data/item-bank/prod/A31.md`｜改动 **2 处、2 行**

## 一、缺陷与处方

**改前（两行，第 194 轮实测行号）**：
```
L132: Girl: Ours is two people.
L133: Mr. Tao: Then a small bottle is too much. Take the middle one.
```

**改后（两行）**：
```
L132: Girl: Ours is four people.
L133: Mr. Tao: Then a small bottle is not enough. Take the middle one.
```

**答案字母不变（A 仍是 A）；L138–L141 四个选项一字未动；L238 汇总行一字未动。**

## 二、缺陷的成因（为什么原推理方向反了）

- L131 给基准：`A family of three takes a small bottle in about two months.` → **小瓶 = 3 人 / 2 个月**；
- L132 女孩说只有 2 人 → 2 人 2 个月只耗掉 **2/3 瓶**，**小瓶根本用不完，还要再等一个月才空**；
- L133 却判 `too much` 并让她换**更大的中瓶**——**消耗得越少越该用小瓶，方向反了**。

## 三、⚠ 被否决的旧处方（留档，防止下轮重犯）

**`reviews/R1-A31-2.md` L254–L258 的处方不可用**：它**只改 L132**（`two` → `four`），**L133 的 `too much` 原封不动**。

落盘后会变成「**4 人 + 小瓶太多**」——**而 4 人比 3 人用得更快，是太少不是太多**。
**那个方向矛盾一点没变，还把「前提可疑」升级成了事实错误。**

**所以本处方改两行，不是一行。**

## 四、替换清单与唯一命中实测

| 项 | L132 | L133 |
|---|---|---|
| 改前 | `Girl: Ours is two people.` | `Mr. Tao: Then a small bottle is too much. Take the middle one.` |
| 改后 | `Girl: Ours is four people.` | `Mr. Tao: Then a small bottle is not enough. Take the middle one.` |
| 改前出现次数 | **1** | **1** |
| 改后出现次数 | **1** | **1** |

**两行各自唯一命中，均未用全局 replace。**
**注意**：全文里 `Ours is` 有 **2** 行、`too much` 有 **3** 行、`a small bottle` 有 **2** 行——
**正因如此必须整行匹配**，按 `too much` 这种裸词替换会误伤另外 2 处。

**重跑方法**：把上面两行按右列换回左列（全文各仅一处），重算 MD5，应得 **58d9b62bd03c3efa56d8ecf8c893ee95 / 7714 字节**。

## 五、闭合自证（反向套用实测，基线自己重算）

```
BEFORE  data/item-bank/prod/A31.md  MD5=58d9b62bd03c3efa56d8ecf8c893ee95  bytes=7714  lastByte=0x0A
AFTER   data/item-bank/prod/A31.md  MD5=c95c81dad9b808e5c9f2f0fd19f18fae  bytes=7717  lastByte=0x0A  (+3)
REVERSED（按第四节反向套用两行后重算）= 58d9b62bd03c3efa56d8ecf8c893ee95  bytes=7714  match_baseline=True
```

**逐位闭合** → 除授权的 2 行外，A31.md 无任何字节变动。
**基线是自己动手前用 `Get-FileHash` 重算的**，未采信任何既有报告里的数字。
U+FFFD（真字符）= 0，CR = 0，无 BOM，末字节 `0x0A`。

## 六、改后材料与选项逐句自洽复核

```
L130: Girl: Mr. Tao, what size bottle of soy sauce shall I buy?
L131: Mr. Tao: A family of three takes a small bottle in about two months.
L132: Girl: Ours is four people.
L133: Mr. Tao: Then a small bottle is not enough. Take the middle one.
L134: Girl: And the large one?
L135: Mr. Tao: About a year. It is for a restaurant.
L137: Which bottle should the girl take?
L138: - A. The middle one.        ← 答案
L139: - B. The small one.
L140: - C. The large one.
L141: - D. Two small ones.
L142: **Answer** A
```

**推理链逐环自检**：

1. L131 基准 = **3 人 / 2 个月一小瓶**；
2. L132 女孩 = **4 人 > 3 人** ⇒ 单位时间消耗**更快**；
3. ⇒ 2 个月**不够用** ⇒ L133 `not enough` **方向正确**；
4. ⇒ 换**更大的**中瓶 L138 A，**方向与第 3 步一致**。

**自洽，无反转。**

| 选项 | 排除依据 | 档 |
|---|---|---|
| **A** | L133 `Take the middle one.` 直接给出 | 正确项 |
| B | L133 `a small bottle is not enough` 显式否定 | 甲 |
| C | L135 `It is for a restaurant.` 显式否定（是给餐厅的） | 甲 |
| D | L133 否定「小瓶够用」，两小瓶只会更不够 | 甲 |

## 七、词数（口径：只数材料正文含说话人标注，空白分词）

| | 改前 | 改后 |
|---|---|---|
| A31-09 材料词数 | **59** | **59**（等长） |

**上限 60，余 1。**（L132 `two`→`four` 与 L133 `too much`→`not enough` 长度恰好抵消。）

## 八、闸门原始输出（2026-10-05）

```
① wordcount-gate
PASS: no material block exceeds its limit
WORDCOUNT_EXIT=0

② verify-bank
A31 | A | prod | PASS(15题)
ALL CONSISTENT

③ check-integrity
A31 | CL-A31.md | 强匹配 | 58d9b62bd03c3efa56d8ecf8c893ee95 | c95c81dad9b808e5c9f2f0fd19f18fae | MISMATCH
总计 59 个批次；需关注 3 个。
```

**A31 的 MISMATCH 是本次修复的预期结果**（旧 CL 锚的是改前字节）。**修复落盘必然使旧锚失效，这不是回归。**
**同时刻另外 2 个需关注项里，D7 是别的 agent 正在改，与本任务无关。**

## 九、已读文件清单

| 文件 | 用途 |
|---|---|
| data/item-bank/prod/A31.md | 被改文件；改前读全块、改后逐句复核 |

**未修改**：除授权的 2 行外的任何内容；任何其他文件。
