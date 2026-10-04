# 机械基线记录：22 批无锚批次（BASELINE-MECHANICAL）

## 本文件断言什么、不断言什么

**这不是 clearance（内容已核准），是机械基线记录（当前字节）。**
借 writer-a 的区分：clearance 断言「本版本已核准」，本文件只断言「当前磁盘上的这些字节是多少」。

因此本文件：

- **不包含**任何质量判断（不判对错、不判重复、不判超纲、不判结构）
- **不含**「通过」「可归档」「已核准」等带判断性质的字样
- **不替任何人签核**
- **未修改任何题目文件**——只读字节

**任何人重算一次都能复现下面每一个数。**

## 口径（必须先看，否则重算会对不上）

- **字节数**：文件原始字节长度（[System.IO.File]::ReadAllBytes / ReadAllBytes 等价）。
- **行数**：按 `\n`（LF）切分后的**段数**，即 **LF 计数 + 1**。
  本文件 22 份**全部以 LF 结尾**，所以 `wc -l`（只数换行符）得到的值会比本文件的「行数」**少 1**。
  为免歧义，每行末尾另附 `LF=n` 即该文件的换行符实际个数。
- **末字节**：文件最后一个字节的十六进制值。22 份**全部是 0x0A**（末尾均有换行）。
- **MD5**：对整份文件原始字节计算，小写十六进制。
- **别名映射**（已应用）：`A0→A-batch0`、`B1→B-batch1`、`C1→C-batch1`、`D1→D-batch1`、`E1→E-batch1`、`A6-true→A6`。
  不做映射会被判成「文件不存在」。
- **目录直读**：prod/ 与库根均用 readdir 直读（prod 实测 31 份、库根 30 份），**未使用带返回上限的列表接口**。
- 22 份题目文件**全部位于 data/item-bank/ 库根**，无一在 prod/。

## ⚠️ 这些锚是「当前字节」的锚，**不是「R1 前像」的锚**

这 22 批的 R1 报告**根本没有记录 MD5／字节／行数**，因此：

1. 它们**不存在串线**问题（无锚可错）；
2. `check-integrity.ps1` 也不会因缺锚而误判为 MATCH；
3. **它们的 R1 前像在本库内不可得**——没有记录、没有备份、没有任何地方留下过这些批次的修复前字节。

**本文件不能替代 R1 前像，也不声称是它的替代品。** 今后若有人问「A3 在 R1 时长什么样」，**本库答不出来**。本文件只回答「A3 现在长什么样」。

**这 22 批从 R1 至今可能已被修复过**：是否存在修复、修了什么，**本文件不作断言**，那需要逐批比对各自的修复记录，属于另一次复核。

---

## 22 批机械基线

每批一行，**MD5 与题目路径同行**（满足 check-integrity 的强锚要求：同行含题目名）。

```
### A0
data/item-bank/A-batch0.md | afbd40cbe2c511a943dd56a538acc046 | 9389 | 296 | 0x0A |  LF=295
### A1
data/item-bank/A1.md | b622a2baaa2d28bfd5c4fe4379416b3b | 6443 | 207 | 0x0A |  LF=206
### A2
data/item-bank/A2.md | 9ed274f7ce7f776f51e32c62d4d7e66b | 6361 | 218 | 0x0A |  LF=217
### A3
data/item-bank/A3.md | 6c33ef52001b61c47e148bf303e6a24e | 6467 | 210 | 0x0A |  LF=209
### A4
data/item-bank/A4.md | 4aa8b4e681b41d04037519839ac831c5 | 6719 | 211 | 0x0A |  LF=210
### A5
data/item-bank/A5.md | 1c447628a0a2f43d2094043985e102d4 | 8147 | 229 | 0x0A |  LF=228
### A6-true
data/item-bank/A6.md | fd253df7ce7707b441ab3150dca03d2e | 7937 | 223 | 0x0A |  LF=222
### A7
data/item-bank/A7.md | 95fb87a7e6de2318166dbf45fd98324d | 6955 | 271 | 0x0A |  LF=270
### B1
data/item-bank/B-batch1.md | e8f9a056e92f08ef674aa8ef1208b97a | 11079 | 238 | 0x0A |  LF=237
### B2
data/item-bank/B2.md | dc026cb8896c79c9fdd2a05368f7080f | 4948 | 137 | 0x0A |  LF=136
### B3
data/item-bank/B3.md | c7d464c36eb87c45433de4c48adf3101 | 8693 | 176 | 0x0A |  LF=175
### C1
data/item-bank/C-batch1.md | 64cff9f8641294e705987a8a5ea3e825 | 19183 | 320 | 0x0A |  LF=319
### C2
data/item-bank/C2.md | 3b982f8178487ccd62cde60a9acb07ca | 11889 | 197 | 0x0A |  LF=196
### C3
data/item-bank/C3.md | ef85c44e71971cffc1519603664af18c | 11617 | 197 | 0x0A |  LF=196
### C4
data/item-bank/C4.md | 26393da22fdb0dd7416257c900c9e5b9 | 12373 | 201 | 0x0A |  LF=200
### D1
data/item-bank/D-batch1.md | e339b8d8dccc5fdac400975b0b8c994b | 7566 | 199 | 0x0A |  LF=198
### D4
data/item-bank/D4.md | cb57267d77d0d41c5c04f5dec3bdf238 | 7152 | 191 | 0x0A |  LF=190
### D5
data/item-bank/D5.md | 8a0a6b635e1abb0dc25f648c89f6c39a | 9029 | 186 | 0x0A |  LF=185
### D6
data/item-bank/D6.md | 317b44d1e0ff97a66e1e70423c1881ae | 13791 | 210 | 0x0A |  LF=209
### E1
data/item-bank/E-batch1.md | 1791b552ddfc28c683b031c9b6387fe4 | 6605 | 97 | 0x0A |  LF=96
### E2
data/item-bank/E2.md | afc809aa2dc6773eddce524f561c6ab7 | 7435 | 97 | 0x0A |  LF=96
### E4
data/item-bank/E4.md | 9cc00b371ed6ffbeaac01e46d41a3c53 | 10219 | 99 | 0x0A |  LF=98
```

---

## 可复现的取数方法

~~~
# 每一行都可由下列步骤独立复现
p = '<上表路径>'
raw = open(p, 'rb').read()
md5 = hashlib.md5(raw).hexdigest()      # 对应第 2 列
bytes = len(raw)                          # 对应第 3 列
lines = raw.decode('utf-8').split('\n')   # 段数 = 对应第 4 列
lines_count = len(lines)                  # = LF + 1
lf = lines_count - 1                      # 对应行末 LF=n
last = hex(raw[-1])                       # 对应第 5 列，本批恒为 0xa
~~~

## 已读文件清单

| 文件 | 读取方式 | 用途 |
|---|---|---|
| data/item-bank 下 22 份题目文件 | **只读字节与元数据，未打开正文** | 取 MD5／字节／行数／末字节 |
| data/item-bank/reviews/ | 仅列文件名元数据，确认 BASELINE-MECHANICAL.md 不存在 | 落盘前防覆盖 |
| docs/pipeline/ | 仅执行 check-integrity.ps1，未读其正文 | 验收 |

**未读取**：reviews/ 下任何既有报告的**正文**；fixes/ 下任何文件。
**未修改**：任何题目文件；任何脚本。**grep 未对 data/item-bank 整目录执行。**

---

**本文件只记录 22 批的当前字节事实，不含任何内容判断。**
