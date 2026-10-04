# 审核报告：B5.md 修复后独立复核（V-B5）

## 0. 结论

- 复核文件：`data/item-bank/prod/B5.md`
- 复核题数：**16**（8 段 × 2 题，逐题逐选项共 **64 个选项全部实读**，未抽样）
- 缺陷计数：**严重 0 条｜中等 1 条｜轻微 14 条**
- 是否通过：**不通过**（差一条残留中等，不放行）
- **当前磁盘版本能否归档：不能。**
- 是否可进入下一环节：**否**。剩一条残留中等（B5-06 跨句要求），按第 6.2 节的最小改法改一行即可复审，**不需要重排答案、不需要动任何标答字母**。
- **F2-B5 的两处改动我逐行独立验证，结论与修复方自证不同**，见第 3 节：
  - **M3（B5-02）：真修好**（R2 判定未修好，我推翻 R2）。
  - **M4（B5-06）：只修好了一半，仍判残留中等**（理由是颜色词仍留在教师那一轮，见 3.2 反证）。
- **修复方的一切自证一律未采信**：本报告每个数字都回到 `prod/B5.md` 原文用脚本重算。
- **角色隔离**：除任务书点名的 `reviews/R2-B5.md` 外，本复核员**未人工阅读** `reviews/` 与 `fixes/` 下任何文件。第 2 节运行的三个闸门脚本按 _COMMON §2b 第 39–46 行只做 MD5 提取与机械比对、不输出审核内容，属闸门而非人工阅读。
- **F1 对 M3 人称的偏离（`she`）经复核仍然正确，本轮未回退**，见第 3.1 节与第 10 节「保留项」。

---

## 1. 字节级前置校验（_COMMON §1）

| 文件 | 字节数 | 行数 | MD5 | 两次读取是否一致 |
|---|---|---|---|---|
| `data/item-bank/prod/B5.md` | **10556** | **227** | `035ee419b6e334032ff92d33d31d5c2e` | 一致 |

- 读取方式 A：`[System.IO.File]::ReadAllBytes` + `[System.Security.Cryptography.MD5]` → `BYTES=10556`，`MD5=035ee419b6e334032ff92d33d31d5c2e`
- 读取方式 B：`[System.IO.File]::ReadAllLines` → `LINES=227`；行读取工具复读 `totalLines=227`，227 行逐行内容一致
- 末次写入时间（UTC）：2026-10-03T16:24:26.0276745Z
- **基线对照**：任务书给定基线 = **10,556 字节 / 227 行 / `035ee419b6e334032ff92d33d31d5c2e`**，与实测**逐位相同** ⇒ **F2-B5 的修复确已落盘，且落盘后未被再次改动**。基线对照项**通过**。

---

## 2. 门禁脚本原始输出（原样粘贴，未转述）

### 2.1 词数门禁 `docs/pipeline/wordcount-gate.ps1`

```
PASS: no material block exceeds its limit
EXITCODE=0
```

### 2.2 批次完整性闸门 `docs/pipeline/check-integrity.ps1`

> **本闸门在本轮共运行两次，两次快照含义不同，必须分开读。上方（下方）代码块为第 2 次运行，即本报告已落盘之后的那一次。**

```
批次 | 最新报告 | MD5 取值来源 | 报告记录 | 当前实测 | 判定
--------------------------------------------------------------------------------------------------------------
A-batch0 | CL-A0.md | 强匹配(同行含题目名) | 84294453f09b6c771d4e1811c32db955 | 84294453f09b6c771d4e1811c32db955 | MATCH
A1 | CL-A1.md | 强匹配(同行含题目名) | 3456291bc77f1591567a5abc70d58651 | 3456291bc77f1591567a5abc70d58651 | MATCH
A2 | CL-A2.md | 强匹配(同行含题目名) | 9ed274f7ce7f776f51e32c62d4d7e66b | 9ed274f7ce7f776f51e32c62d4d7e66b | MATCH
A3 | CL-A3.md | 强匹配(同行含题目名) | 09b07c9645f238be1a9800faaa522822 | 6c33ef52001b61c47e148bf303e6a24e | MISMATCH
A4 | CL-A4.md | 强匹配(同行含题目名) | 4aa8b4e681b41d04037519839ac831c5 | 4aa8b4e681b41d04037519839ac831c5 | MATCH
A5 | CL-A5.md | 强匹配(同行含题目名) | 1c447628a0a2f43d2094043985e102d4 | 1c447628a0a2f43d2094043985e102d4 | MATCH
A6 | V-A6-2.md | 强匹配(同行含题目名) | fd253df7ce7707b441ab3150dca03d2e | fd253df7ce7707b441ab3150dca03d2e | MATCH
A7 | V-A7-2.md | 强匹配(同行含题目名) | fffe6e421137a6a0df1c09f798ea2656 | fffe6e421137a6a0df1c09f798ea2656 | MATCH
A8 | V-A8.md | 弱匹配(同行含MD5字样) | 15c0eba2af2085f0d8b3a6a710f97848 | 15c0eba2af2085f0d8b3a6a710f97848 | MATCH
B-batch1 | CL-B1.md | 强匹配(同行含题目名) | e8f9a056e92f08ef674aa8ef1208b97a | e8f9a056e92f08ef674aa8ef1208b97a | MATCH
B2 | V-B2.md | 弱匹配(同行含MD5字样) | dc026cb8896c79c9fdd2a05368f7080f | dc026cb8896c79c9fdd2a05368f7080f | MATCH
B3 | V-B3.md | 强匹配(同行含题目名) | c7d464c36eb87c45433de4c48adf3101 | c7d464c36eb87c45433de4c48adf3101 | MATCH
B4 | V-B4-3.md | 强匹配(同行含题目名) | 1308ca2c79888055bed8b7c401481af2 | 1308ca2c79888055bed8b7c401481af2 | MATCH
C-batch1 | CL-C1.md | 强匹配(同行含题目名) | 64cff9f8641294e705987a8a5ea3e825 | 64cff9f8641294e705987a8a5ea3e825 | MATCH
C2 | V-C2.md | 弱匹配(同行含MD5字样) | 3b982f8178487ccd62cde60a9acb07ca | 3b982f8178487ccd62cde60a9acb07ca | MATCH
C3 | CL-C3.md | 弱匹配(同行含MD5字样) | 8bb924d4fca02a7a56e5dfa5a689f211 | 8bb924d4fca02a7a56e5dfa5a689f211 | MATCH
C4 | V-C4.md | 强匹配(同行含题目名) | 26393da22fdb0dd7416257c900c9e5b9 | 26393da22fdb0dd7416257c900c9e5b9 | MATCH
D-batch1 | CL-D1.md | 弱匹配(同行含MD5字样) | e339b8d8dccc5fdac400975b0b8c994b | e339b8d8dccc5fdac400975b0b8c994b | MATCH
D4 | CL-D4.md | 弱匹配(同行含MD5字样) | cb57267d77d0d41c5c04f5dec3bdf238 | cb57267d77d0d41c5c04f5dec3bdf238 | MATCH
D5 | V-D5-2.md | 强匹配(同行含题目名) | 8a0a6b635e1abb0dc25f648c89f6c39a | 8a0a6b635e1abb0dc25f648c89f6c39a | MATCH
D6 | V-D6-2.md | 强匹配(同行含题目名) | 317b44d1e0ff97a66e1e70423c1881ae | 317b44d1e0ff97a66e1e70423c1881ae | MATCH
E-batch1 | V-E1-3.md | 强匹配(同行含题目名) | 4f646824063dfb9710c1126e66d93992 | 4f646824063dfb9710c1126e66d93992 | MATCH
E2 | V-E2.md | 弱匹配(同行含MD5字样) | 4fa6a952a62ef5a0c4d844363fa03ff8 | afc809aa2dc6773eddce524f561c6ab7 | MISMATCH
E3 | V-E3.md | 强匹配(同行含题目名) | 68de79335398971da12ff7eadd582cca | 68de79335398971da12ff7eadd582cca | MATCH
E4 | V-E4-3.md | 强匹配(同行含题目名) | 6f07851bd1aa514e2b4953b044f17192 | dc65407dd3886c58009bae70ec868ea9 | MISMATCH
B5 | V-B5.md | 强匹配(同行含题目名) | 035ee419b6e334032ff92d33d31d5c2e | 035ee419b6e334032ff92d33d31d5c2e | MATCH
C5 | V-C5-2.md | 弱匹配(同行含MD5字样) | 2e63c2f2f39df0bad8acc819878025c2 | 84b9f871f4f596bbb5590ed9261f1ff5 | MISMATCH
总计 27 个批次；需关注 4 个。
EXITCODE=1
```

> **第 1 次运行（写本报告之前，`reviews/` 里最新的还是 `R2-B5.md`）**，B5 行逐字为：
>
> ```
> B5 | R2-B5.md | 强匹配(同行含题目名) | 5b9082504fac8ad09f7d910ab9294391 | 035ee419b6e334032ff92d33d31d5c2e | MISMATCH
> 总计 27 个批次；需关注 3 个。
> ```
>
> ⇒ **B5 行 = `MISMATCH`**：脚本比对的是 R2-B5 记录的 `5b908250…` 与磁盘实测的 `035ee419…`，两者不同 = **F2-B5 的修复已落盘**，正是 _COMMON §2b 所描述的预期状态。与我在第 1 节独立复算的结果**逐位吻合**。该次快照的另两处 MISMATCH 为 **A8、C5**，均不属于本任务范围。
>
> **第 2 次运行（上方代码块，即本报告落盘之后）**：脚本转而读取本报告记录的 MD5，故 B5 行变为
>
> ```
> B5 | V-B5.md | 强匹配(同行含题目名) | 035ee419b6e334032ff92d33d31d5c2e | 035ee419b6e334032ff92d33d31d5c2e | MATCH
> ```
>
> ⇒ **B5 行 = `MATCH`**：报告记录的 MD5 与当前磁盘一致，**本报告的全部结论对当前磁盘上的 `prod/B5.md` 仍然有效**（_COMMON §2b 所问的那个问题，答案是「是」）。该次快照的 MISMATCH 为 **A3、E2、E4、C5**，其中 A8 已由 MISMATCH 转为 MATCH，**全部不属于本任务范围**，按 _COMMON §2 记为并发写入造成的时间差，不计为 B5 的缺陷。
>
> 本闸门为**全库扫描、不接受路径参数**，退出码 1 由「需关注 4 个」驱动，**不是 B5 单独 FAIL**。

### 2.3 汇总一致性与答案闸门 `docs/pipeline/verify-bank.ps1`

```
批次 | 类 | 位置 | 一致性
------------------------------------------------------------------------------------------------
A-batch0 | A | bank | 无汇总行可比对(20题)
A1 | A | bank | 无汇总行可比对(15题)
A2 | A | bank | 无汇总行可比对(15题)
A3 | A | bank | 无汇总行可比对(15题)
A4 | A | bank | 无汇总行可比对(15题)
A5 | A | bank | 无汇总行可比对(15题)
A6 | A | bank | PASS(15题)
A7 | A | bank | PASS(15题)
A8 | A | bank | PASS(15题)
B-batch1 | B | bank | 无汇总行可比对(16题)
B2 | B | bank | 无汇总行可比对(12题)
B3 | B | bank | PASS(12题)
B4 | B | bank | PASS(12题)
C-batch1 | C | bank | 无汇总行可比对(40题)
C2 | C | bank | PASS(25题)
C3 | C | bank | PASS(25题)
C4 | C | bank | PASS(25题)
D-batch1 | D | bank | D类 Answers行=10 槽位=30
D4 | D | bank | D类 Answers行=10 槽位=30
D5 | D | bank | D类 Answers行=10 槽位=30
D6 | D | bank | D类 Answers行=10 槽位=30
E-batch1 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
E2 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
E3 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
E4 | E | bank | 无 Answer/Answers 行(该类别可能本就不含)
B5 | B | prod | PASS(16题)
C5 | C | prod | PASS(25题)
共 27 个批次；答案序列不一致 0 个。
ALL CONSISTENT
EXITCODE=0
```

> B5 行 = `PASS(16题)`；脚本末行 `ALL CONSISTENT`，退出码 0。
> **R2-B5 第 11 节第 5 条「`verify-bank.ps1` 退出码为 1 不复现」在本轮仍成立**，且 R2 当时记录的 `5b908250…` 与我实测的旧基线可对照。

---

## 3. 【重点】两条中等到底修好没有 —— 独立裁定

### 3.0 我采用的判据（先声明，后逐条套用，保证两轮可比）

R2-B5 判定 B5-06 有缺陷时用的测试是：**「只读 X 这一轮，学生能不能选出标答」**（R2 第 5.4 节原文：「学生只读 L149 一轮即可选出 B」）。
本轮我对 M3 与 M4 **用同一条测试**，不因结论方便而放宽：

> **单轮可答 = 该轮的实义成分足以唯一锁定标答，且标答的实义成分不必取自别的轮次。**

### 3.1 M3（B5-02）：**真修好** —— 与 R2 的裁定相反

当前 L42、L43、L44、L45 逐字为：

- L42 `Ms. Clark: Not tomorrow. I collect the exercise books on Friday afternoon, and then the students take them home.`
- L43 `Boy: Then my mother will see it on Saturday morning?`
- **L44 `Ms. Clark: Not until this evening, once I have handed them all back. She should sign page forty and give the book back to me on Monday morning.`**
- L45 `Boy: Thank you. I'll tell her which page to sign.`

Q2 标答 **A = `On Friday evening, before she gives it back on Monday morning.`**（L55）

**把标答 A 的实义成分逐个回原文定位：**

| 成分 | 出处 | 所在轮次 |
|---|---|---|
| `evening`（今天晚上） | L44 `Not until **this evening**` | L44 |
| `before she gives it back on Monday morning` | L44 `She should sign page forty and **give the book back to me on Monday morning**` | L44 |
| **`Friday`（星期几）** | L42 `I collect the exercise books on **Friday** afternoon` | **L42 —— 唯一出处** |

- **`Friday` 这个词在 L44 里根本不存在**；L44 只说 `this evening`。要把 `this evening` 定成 **Friday evening**，**必须与 L42 合读**。任务书重点核查项 1 的第一个问句，答案是「必须合读，只读 L44 不够」。
- 附加确认：`they take them home`（L42）解释了为什么母亲不在收本时看到本子，这是 A 的 `before` 半个内容所需，L44 不含。
- **对照 R2 的反证**：R2 第 4.3 节指出改前 L44 一轮内含 `On Friday evening.` 与 `on Monday morning` 两句全部成分。改后 L44 里的 `Friday` 被换成了 `this`，**该反证已不成立**。
- **裁定：M3 现象已消失，判「已修好」。R2-B5 第 5.3 节「B5-02 跨句题数 = 0」的结论不再适用于当前磁盘版本。**

**残留（记轻微，不恢复中等）**：只读 L44 + 题干的学生仍可能靠**排除法**落到 A——因为四个选项里只有 A 含 `evening`（B 是 Saturday morning、C 是 Friday afternoon、D 是 Monday morning）。但这是任何四选一都可能出现的排除现象；**判定答案内容的依据（星期几）确实跨轮**，故只记为轻微第 4 条。

### 3.2 M4（B5-06）：**只修好了一半，残留中等**

**先承认修好的那一半（我逐行验证，与 R2 记述一致）：**

- R2 时期的 L149 是 `Girl: Mine is dark green, and the handle is wood, not metal.`——颜色与材质**同在一轮**。
- 当前 L149 = `Girl: Mine is dark green.`（5 词，只剩**颜色**）
- 当前 L150 = `Ms. Zhang: Then it must be the green one. The handle is wood, not metal, and the name on it says Lily Chen.`（23 词，含**材质**）
- ⇒ **两条判别线索确实被拆到了两个不同的话轮里（女儿一轮 / 教师下一轮），这是真实改善。**

**再指出 R2 的处方没做到的那一半 —— 反证如下：**

当前 L150 第一句仍写着 `Then it must be **the green one**.`，**颜色词 `green` 仍留在教师这一轮里**。于是：

> **只读 L150 这一轮**：`the green one`（绿）+ `The handle is wood, not metal`（木）⇒ **标答 B「The dark green one with a wooden handle.」**（L160）直接成立。
>
> 选项里只有 `black` 与 `dark green` 两种颜色（L159、L161、L162），材料里的 `green` 只能映射到 `dark green`，映射唯一。

**这与 R2 判它有缺陷时用的是同一个测试，只是失败点从 L149 挪到了 L150。** 按 R2 自己的判据，缺陷形态未消除。

**它为什么偏偏漏在这里**：L150 必须回指女儿刚说的颜色（教师要确认是哪一件），所以拆分时颜色词**必然**会在教师这一轮重复出现。**R2 的处方只写了「颜色在女儿一轮、材质在教师下一轮」，没有禁止教师那一轮重复颜色词**，这是处方本身的缺口，不是修复方偷懒（_COMMON §4 第 91–94 行：处方不完整时「照做」不等于「修复」）。

**连带影响检查（第 4 项要求）**：拆分后周边仍自洽，未发现新缺陷——
- `He` / `she` / 名字交替处无一处指代错乱：L147 说话人 Girl、L148/L150/L152/L154/L156 为 Ms. Zhang、L151 Girl、L153 Girl、L155 Girl；L150 的 `the name on it says Lily Chen` 与 L151 `That's my name!` 衔接自然。
- 唯一仍存在的指代问题是 R2 轻微第 8 条那条**未被本轮改动触及**的 L152 `She also wrote her own name in our book.`（`She` 指交还者还是 Lily 不明），见本报告轻微第 8 条。
- L149 变成只说颜色的一句后，L150 的 `Then` 有明确 antecedent（`Mine`），比原状**更**通顺。

**B5-06 段级跨句题数实测 = 0**（Q1 单轮可答如上；Q2 依据在 L156 单轮之内：`anything unclaimed goes to the school shop`）⇒ **该段仍不满足任务书第 4 项「每段至少一处跨句或两步推理」。**

**最小改法（改一行、2 个词，不动标答字母 B，答案序列不变）：**

- L150 现：`Ms. Zhang: Then it must be the green one. The handle is wood, not metal, and the name on it says Lily Chen.`
- L150 改：`Ms. Zhang: Then we have found it. The handle is wood, not metal, and the name on it says Lily Chen.`
- 改后：L149 只给颜色、L150 只给材质；**只读任一轮都锁不住 B，必须合读两轮**，判别线索彻底分家。
- 词数复算：L150 由 23 词 → 21 词 ⇒ **B5-06 175 → 173**，仍远低于 200。
- 标答字母仍为 **B**，答案序列 `BDCAACDBADBCDACB` 不变，第 5 节全部周期/偏斜检查均无需重做。

**对判定不确定之处的说明（REVIEW-RUBRIC §4.5）**：本条存在反方读法——教师轮的 `the green one` 是**回指**（definite reference）而非新事实，严格的「事实引入轮次」口径下可以判已达标。我按「拿不准标中等、不默认放过」判为**残留中等**，并把反方读法原样写出，供调度方裁定；若调度方裁定按「线索引入轮次分处两轮」验收，本条可降为轻微，且**不改变最终结论的其余部分**。

---

## 4. 独立检查项

### 4.1 B 类词数逐段复算（口径：空白分词、只数 `**Dialogue**` 段内全部内容、**含说话人标注**；不含标题/题干/选项/Answer/文件头/末尾汇总行/注释块）

| 段号 | 行范围 | 话轮数 | **我实测** | 任务书所报 | 上限 | 余量 |
|---|---|---|---|---|---|---|
| B5-01 | 7–17 | 11 | **163** | （未报） | 200 | 37 |
| B5-02 | 35–45 | 11 | **147** | 145 ❌ | 200 | 53 |
| B5-03 | 63–73 | 11 | **160** | （未报） | 200 | 40 |
| B5-04 | 91–102 | 12 | **182** | （未报） | 200 | 18 |
| B5-05 | 120–129 | 10 | **143** | （未报） | 200 | 57 |
| B5-06 | 147–156 | 10 | **175** | 178 ❌ | 200 | 25 |
| B5-07 | 174–182 | 9 | **141** | （未报） | 200 | 59 |
| B5-08 | 200–209 | 10 | **141** | （未报） | 200 | 59 |

**八段全部 ≤200，最小余量 18 词（B5-04），无零余量段、无超限段。**
**任务书对 B5-02 与 B5-06 两个数字报错了**，见第 7 节第 1、2 条（两者仍均 ≤200，不影响词数门禁通过）。

### 4.2 结构与格式（1.6 / 1.9）

- `**Answer**` **16** 条 ÷ `##` 段 **8** 个 = **2.000** ⇒ **1.9 通过**（B 类每份材料 2 题）。
- `##` 题号标题行 **8** 条：`B5-01`…`B5-08` **连续，无缺号无重号**。
- `**Dialogue**` × 8、`**Q1**` × 8、`**Q2**` × 8、选项行 **64** 条 ⇒ **每题恰好 4 个选项**。
- **64 个选项在各自小题内去重后重复项 = 0**（1.4 通过）。
- `#` 开头行共 **9** 条 = 1 行批次说明 + 8 行 `##` 题号标题行；**无自检表 / 统计块 / 存疑词表等过程记录区块**。按 _COMMON §4 第 75–77、80–83 行，这两类行**属允许范围**，不判违规。
- HTML 注释块 **0** 个；对白正文与 64 个选项中**无一个中文字符**（中文只在 `##` 标题行与末尾两行汇总行）。
- 文件末尾两行为允许的汇总行：`段数：8 ／题目数：16 ／比值：2` 与 `本批答案序列：B D C A A C D B A D B C D A C B`。
- **人物标注核对（家长/教师不得被错标为 Boy 或 Girl）**：说话人标注全量清点为
  `Girl ×22、Boy ×27、Ms. Zhou ×5、Ms. Clark ×5、Mum ×5、Mr. Stone ×6、Ms. Yang ×5、Ms. Zhang ×5、Clerk ×4`。
  **无一家长或教师被写成 Boy/Girl**：B5-03 的母亲标 `Mum`；教师为 Ms. Clark（B5-02）、Mr. Stone（B5-04）、Ms. Yang（B5-05）、Ms. Zhang（B5-06）；邮局营业员 Ms. Zhou（B5-01，5 轮全部）；售票员 `Clerk`（B5-07）。B5-08 的 Boy/Girl 是两名学生，段内无成人角色。**通过。**

### 4.3 开场白归一化去重 + 全话轮 Jaccard（阈值 0.6）

8 段首句去说话人标注、去标点、转小写后建 key，**8 个 key 互不相同，重复项 = 0**：

`good morning i want to send this box to my grandmother in nanjing` / `ms clark may i have my english paper back` / `mum shall we do the spring cleaning on saturday morning` / `mr stone my phone fell to the floor on monday and the screen is broken` / `ms yang what time do we start for the spring outing on saturday` / `ms zhang i think i left my umbrella at the sports meeting on wednesday` / `hello i d like two tickets to nanjing for saturday morning` / `shall we go to the museum on saturday morning`。

**全话轮两两 Jaccard 扫描：84 个话轮、3,486 对两两比对，J > 0.6 命中 0 对。** F2 的两处改动未引入重复轮次。**通过。**

### 4.4 跨句 / 两步推理逐段统计（**自己数，未引用任何上游数字**）

判据即第 3.0 节那条：「只做单句检索的学生答不答得对」。

| 段 | Q1 | Q2 | 本段跨句题数 | 判定 |
|---|---|---|---|---|
| B5-01 | **是**（L14 资费 + L15 三公斤 + L16 外箱 2 元 → 8+4+2；标答 `Fourteen yuan` 全文无此词） | 否（L13 `Wednesday plus three days is Saturday` 一轮即定） | 1 | 达标 |
| B5-02 | 否（L40 一轮） | **是**（星期几只在 L42，时段只在 L44，见 3.1） | 1 | **达标（本轮新达成）** |
| B5-03 | 否（L70 `do the two balconies first and leave the kitchen for Sunday` 一轮即可） | **是**（L64/L65 九点起 + L68 `each balcony` 一小时 + L70 只做两个阳台 → 9+2=11；材料全文无「eleven」） | 1 | 达标 |
| B5-04 | **是**（L96 三个数字 + L100/L101 `Then I'd better wait` 才兑现十元优惠 → 180+20−10） | **是**（L98 十点半 + L100 一小时 → 11:30） | 2 | 达标 |
| B5-05 | **是**（时刻在 L121 `leaves at ten past eight… twenty minutes earlier`，地点只在 L123 `At the east gate`） | **是**（L127 十点五十离园 + L125 单程四十分钟 → 11:30） | 2 | 达标 |
| B5-06 | **否（残留，见 3.2 反证）** | 否（L156 一轮） | **0** | **不达标 → 中等** |
| B5-07 | **是**（L175 两档票价 + L176 `I am fifteen and my cousin is eleven` + L181 十五岁按成人 → 70+50） | **是**（L177 九点发车 + L179 `Two hours and a half` → 11:30） | 2 | 达标 |
| B5-08 | 否（L203 `Let's meet at the school gate at half past nine` 一轮即定） | 弱两步（L203 `each way` × 2 = 50 分；须结合「往返」这一隐含前提，见轻微第 14 条） | 1 | 达标（偏弱） |

**8 段中 7 段含真正的跨句或两步推理；1 段（B5-06）不达标。**
对照量：R1 时 3 段不达标 → F1 后 2 段不达标（6/8 达标）→ **本轮 1 段不达标（7/8 达标）**。
**全批跨句/两步题共 10 道**（1+1+1+2+2+0+2+1）。

### 4.5 材料数字与时间链逐段重算（全部自己算）

| 段 | 我的重算 | 结论 |
|---|---|---|
| B5-01 | 3 公斤：≤2 公斤 8 元（L14）+ 超 1 公斤 4 元（L14/L15）= 12，+ 必买外箱 2 元（L16）= **14**（标答 B）。今晨 9 点车已开（L11）；明日 10 点前寄 ⇒ 走**周三**车（L12）；周三 + 三天（L10）= **周六**（标答 D），与 L9「生日在周六」吻合 | **通过**，链条闭合、无方向反转 |
| B5-02 | 无算术。L42 周五下午收本 → 学生带回家 → 母亲**当晚**才看到（L44 `Not until this evening`）→ 签第四十页 → **周一早上**交还（L44）。与 L43 男孩的周六误解不冲突（那是男孩的错判） | **通过**，时间链自洽 |
| B5-03 | 母亲：9:00 起（L64）→ 客厅 2 小时（9–11）→ 卫生间 1 小时（11–12，L66）→ 12:00 下厨（L72）→ 13:00 赶车（L64，下午工 13:30）；9:00–13:00 = 4 小时，与 L65 吻合。女儿：9:00 起，两个阳台各 1 小时（L68）⇒ 9+2 = **11 点**（标答 C）；L69 自算 9+3=12 复算为真；厨房已推至周日（L70） | **通过**，两人时序无任何时刻重叠 |
| B5-04 | 180 + 20 − 10（他留下等待，L101）= **190**（标答 D）。周五 9 点开门、最忙在十点前、约他十点半到（L98）→ 工作 1 小时（L100）⇒ **11:30**（标答 B）。新屏周五早上到货（L94），故周五是第一个可修日 | **通过** |
| B5-05 | 8:10 − 20 分 = **7:50**（ten to eight，标答 A）；地点取 L123 东门（西门早上锁）。8:10 发车 + 40 分 = 8:50 到园；停 2 小时（L125）⇒ 10:50 离园（L127 `ten to eleven` 精确吻合）；+40 分 = **11:30**（标答 D），早于 L126 的 12:00 午饭 | **通过** |
| B5-06 | 无算术。周三丢失（L147）→ 周五贴清单（L154）→ 保存一个月（L156）→ 之后每月最后一个周五进校店（L156） | **通过** |
| B5-07 | 15 岁＝成人 70 + 11 岁＝儿童 50 = **120**（标答 D）；L175「under fourteen」与 15/11 不冲突；L181 再次确认十五岁按成人。9:00 发车（L177）+ 两小时半（L179）= **11:30**（标答 A） | **通过** |
| B5-08 | 9:30 集合（L203）+ 25 分车程 = 9:55 到馆；恐龙厅 10:00 开（L201）、11:00 闭（L205）；商店 10:30 闭（L207）⇒ 先恐龙厅后商店（L208）可行。往返 25×2 = **50 分**（标答 B） | 通行；L205 `so we have two hours` 偏松（轻微第 11 条） |

**未发现本库历史事故中的另两类：推理方向反了、缺席区间跨整天只算半天。**

### 4.6 题干与标答的实词交集（任务书重点核查项 3）

口径：题干与标答分别转小写、去标点、剔除功能词与疑问词后取词集求交。

| 题号 | 题干实词 | 标答实词 | 交集 |
|---|---|---|---|
| B5-01-Q1 | how,much,girl,pay,parcel | fourteen,yuan | **空** |
| B5-01-Q2 | when,box,reach,grandmother | saturday,morning,days,after,van,leaves | **空** |
| B5-02-Q1 | what,ms,clark,ask,boy,questions,left,blank | copy,sentences,once,right,answer | **空** |
| B5-02-Q2 | boy,first,thought,mother,see,saturday,when,actually | friday,evening,before,gives,back,monday,morning | **空** |
| B5-03-Q1 | what,girl,clean,saturday,morning | balconies,only | **空** |
| B5-03-Q2 | what,time,girl,stop,cleaning,saturday,morning | eleven,clock | **空** |
| B5-04-Q1 | how,much,boy,pay,screen | hundred,ninety,yuan | **空** |
| B5-04-Q2 | what,time,boy,get,phone,back,friday | half,past,eleven,clock | **空** |
| B5-05-Q1 | where,when,class,meet,saturday,morning | east,gate | **空** |
| B5-05-Q2 | what,time,class,get,back,school | half,past,eleven | **空** |
| B5-06-Q1 | which,things,girl,umbrella | dark,green,wooden,handle | **空** |
| B5-06-Q2 | what,happen,umbrella,nobody,takes,away | sold,school,shop | **空** |
| B5-07-Q1 | how,much,boy,pay,tickets | hundred,twenty,yuan | **空** |
| B5-07-Q2 | what,time,train,arrive,nanjing | half,past,eleven,clock | **空** |
| B5-08-Q1 | what,time,boy,girl,meet,school,gate | half,past,clock | **空** |
| B5-08-Q2 | how,long,spend,bus,altogether | fifty,minutes | **空** |

**16 题全部为空 —— 复验通过。**（R2 记的「16 题全空」在题干改写后仍然成立。）

**题干 ∩ 任意选项 的实词共现：仅 2 处，且都落在错项上，不构成对标答的泄露——**
- **B5-02-Q1 错项 D** `Ask a classmate to correct the work before Friday.` 与题干共用 `ask`；
- **B5-02-Q2 错项 B** `On Saturday morning, because she collects them on Friday.` 与题干共用 `saturday`。
其余 14 题题干与四个选项**完全不相交**。

### 4.7 选项词数极差（口径：去掉 `- X. ` 后的空白分词；同题四选项极差 ≤ 2 为长度相近）

实测极差（按 B5-01Q1 → B5-08Q2）：**0, 2, 1, 2, 2, 2, 2, 2, 0, 2, 1, 0, 1, 1, 0, 0**
逐题词数：01Q1 [2,2,2,2]／01Q2 [7,9,9,9]／02Q1 [9,9,10,9]／02Q2 [11,9,10,11]／03Q1 [4,6,5,5]／03Q2 [3,5,3,3]／04Q1 [5,3,5,5]／04Q2 [3,5,3,5]／05Q1 [8,8,8,8]／05Q2 [4,5,3,4]／06Q1 [7,8,7,8]／06Q2 [8,8,8,8]／07Q1 [5,5,4,5]／07Q2 [5,6,5,6]／08Q1 [5,5,5,5]／08Q2 [2,2,2,2]。
**16 题极差全部 ≤ 2（最大 2），无一超阈。**

### 4.8 F2 两处改动的连带影响（第 4 项要求，逐轮查周边自洽）

| 改动处 | 连带检查 | 结果 |
|---|---|---|
| B5-02 L44 改写 | ①人称：`She should sign page forty` 的 she＝母亲，与 L45 `I'll tell her which page to sign` 一致；②与 L42 `on Friday afternoon`、L43 男孩周六误解的时序衔接；③Q2 四选项是否仍被新文本支持（**全部仍支持**：B 被 `Not until this evening` 否掉，C 被 `once I have handed them all back` 否掉，D 被 `this evening` 否掉）；④标答字母仍为 A，答案序列不变 | **无新缺陷**；**M3 达标** |
| B5-06 L149/L150 拆分 | ①指代唯一性：L149 `Mine` 有 antecedent（L148 清单），L150 `Then it` 有 antecedent（L149），无悬空指代；②`He`/`she`/名字交替：L150 的 `Lily Chen` ↔ L151 `That's my name!` 衔接自然；③2×2 选项结构未被破坏（仍为 黑/深绿 × 金属/木）；④标答字母仍为 B，答案序列不变；⑤L152 `She also wrote…` 的指代问题**非本轮引入**，原样留存 | **无新缺陷**；但 **M4 未达标**（见 3.2） |

**两处改动均未引入新的严重或中等缺陷**（M4 的残留是「未修够」，不是「新引入」）。

---

## 5. 答案排列独立检查（_COMMON §2c 四项 + 1.8 / 1.8b）

我逐题复读 16 条 `**Answer**` 行重排得序列（与末尾汇总行、文件头声明**三处一致**）：

```
B D C A A C D B A D B C D A C B
```

| 检查项 | 口径 | 我的实测 |
|---|---|---|
| **周期检测：所有不超过长度一半的周期 p = 1…8** | `seq[i] == seq[i+p]` | **p=1 阴性**（i=0 B≠D）｜**p=2 阴性**（i=0 B≠C）｜**p=3 阴性**（i=0 B≠A）｜**p=4 阴性**（i=0 B≠A）｜**p=5 阴性**（i=0 B≠C）｜**p=6 阴性**（i=0 B≠D）｜**p=7 阴性**（i=1 D≠A）｜**p=8 阴性**（i=0 B≠A）。**p=1…8 全部阴性** |
| **前半段与后半段是否互为重复** | 前 8 vs 后 8 | 前 8 = `BDCAACDB`，后 8 = `ADBCDACB` ⇒ **不同** |
| **后 8 位是否为前 8 位的循环移位**（自加严，8 个移位全枚举） | 枚举 r = 0…7 | r0 `BDCAACDB`／r1 `DCAACDBB`／r2 `CAACDBBD`／r3 `AACDBBDC`／r4 `ACDBBDCA`／r5 `CDBBDCAA`／r6 `DBBDCAAC`／r7 `BBDCAACD` —— **8 个移位中无一等于 `ADBCDACB`** ⇒ **阴性** |
| **最长连续相同** | 要求 ≤ 2 | **2**（第 4–5 位 `AA`）；**连续 ≥3 的位置：0 处** ⇒ 达标 |
| **四字母覆盖** | A/B/C/D 次数 | **A=4 B=4 C=4 D=4**；**无任何字母全批一次都不作答案** ⇒ 达标 |
| 位置偏斜（奇数位，8 个 Q1） | 最高频 ≥70% 即缺陷 | `BCADABDC`，各字母 2 次，最高 **25%** ⇒ 达标 |
| 位置偏斜（偶数位，8 个 Q2） | 同上 | `DACBDCAB`，各字母 2 次，最高 **25%** ⇒ 达标 |
| 盲猜得分 | 按各位置最高频字母盲填 | **25%**（两个位置都是四字母并列，无可套的高频位） |
| **同段 Q1 与 Q2 标答是否全不相同** | 8 段逐段比对 | B5-01 B≠D／B5-02 C≠A／B5-03 A≠C／B5-04 D≠B／B5-05 A≠D／B5-06 B≠C／B5-07 D≠A／B5-08 C≠B ⇒ **8 段全部不同** |

**结论：周期 1–8 的套利通道全部关闭；前后半段不互为重复，后半段也不是前半段的任何循环移位；无连续 3 扎堆；四字母覆盖均衡；无位置偏斜；同段两题答案不同。答案排列一项完全通过。**
（此项 E 类「无答案行」分支：**不适用**，本批为 B 类选择题，16 条 Answer 行齐备。）

---

## 6. 缺陷清单

### 6.1 严重缺陷：**0 条**

16 道题的标答全部**唯一**且**可从材料推出**；64 个选项无重复；无语法错误、中式英语或超纲生词；无使答案失效的材料矛盾；B5-03 时间链保持闭合；B5-06 拆分后未产生指代错乱。

### 6.2 中等缺陷：**1 条**

#### M4（残留，未完全修好）. B5-06 —— 颜色与材质虽已分处两轮，但颜色词仍留在教师那一轮，标答仍可单轮选出

- **位置**：B5-06-Q1（L157–L163）；取证行 **L149、L150**
- **问题**：
  - 已达成：L149 = `Girl: Mine is dark green.`（颜色，女儿一轮）；L150 = `Ms. Zhang: Then it must be **the green one**. The handle is wood, not metal, and the name on it says Lily Chen.`（材质，教师下一轮）。两条判别线索**确实分处两轮**。
  - 未达成：L150 第一句把颜色 `green` **又说了一遍**。于是**只读 L150 一轮**即可得到「绿 + 木」，唯一对应标答 B `The dark green one with a wooden handle.`（选项中的颜色只有 `black` 与 `dark green`，映射唯一）。**单轮可答的形态未消除，只是从 L149 挪到了 L150。**
  - B5-06-Q2 依据仍在 L156 单轮之内。本段跨句题数 = **0**，不满足任务书第 4 项「每段至少一处跨句或两步推理」。
- **为什么是问题**：这正是 R2 判该题有缺陷时用的同一条测试（_COMMON §4 的处方完整性条款第 91–94 行亦适用：R2 处方只写「材质放到教师下一轮」，未禁止教师轮重复颜色词，**处方本身不完整**，「已照做」不等于「已修完」）。
- **建议改法（最小改动：只改 B5-06 材料一行，不动 Q1 四选项、不动标答字母 B）**：
  - L150 原：`Ms. Zhang: Then it must be the green one. The handle is wood, not metal, and the name on it says Lily Chen.`
  - L150 改：`Ms. Zhang: Then we have found it. The handle is wood, not metal, and the name on it says Lily Chen.`
  - 改后 L149 只给颜色、L150 只给材质，任一轮都无法独力锁定 B，**必须合读两轮**。
  - **词数复算：L150 23 词 → 21 词，B5-06 175 → 173**，仍远低于 200 上限。
  - **本处方只处理「颜色词泄漏」这一项**；本条不含其他待办（Q2 的 `sold` 属轻微第 9 条，不在本处方授权范围内，可择机另行处理）。
- **反向说明（REVIEW-RUBRIC §4.5）**：若调度方裁定按「线索引入轮次分处两轮」验收，本条可降为轻微；我按「拿不准标中等、不默认放过」判为中等，并保留上述反方读法。

### 6.3 轻微缺陷：**14 条**（题级 13 + 文件级 1；记录即可，可择机修）

| 编号 | 位置 | 问题 | 处置 |
|---|---|---|---|
| 1 | B5-01-Q2 | 单句可答：L13 `Wednesday plus three days is Saturday.` 一轮即定。段级要求已由 Q1 的 8+4+2 三步运算满足 | 记录即可 |
| 2 | B5-02-Q1 错项 D | `Ask a classmate to correct the work before Friday.` 在材料中**无任何依据**（R2 轻微 3，本轮未修） | 可换为有材料依据的反事实错项 |
| 3 | B5-02-Q2 错项 A/D | A 与 D 共用 `gives it back on Monday morning` 这一措辞；D 的排他性只能靠「看见 ≠ 交还」这一语义区分（R2 轻微 4） | 记录；D 问的是「看见」时刻，主句时刻仍是交还时刻，仍可排除，**不判缺陷** |
| 4 | B5-02-Q2 **本轮新增观察** | 只读 L44 + 题干的学生仍可凭排除法落到 A（四个选项中只有 A 含 `evening`）。但标答的**星期几依据**确实只来自 L42，M3 仍判达标 | 记录即可 |
| 5 | B5-03 | 母亲 12:00 下厨、13:00 赶车，窗口仅 1 小时且材料未给做饭时长；偏紧，但**无任何一句与之冲突** | 记录即可；**不得**为此把 L72 改回 `half past eleven`（会退回 M1） |
| 6 | B5-05-Q1 错项 B/D | `At the school hall at ten past eight` 与 `At the bus stop at half past eight` 无材料依据（R2 轻微 6，本轮未修；错项 C 的西校门有 L123 `The west gate is locked` 作依据，是好的） | 换成有依据的地点/时间错项 |
| 7 | B5-05-Q2 错项 B | `At a quarter past eleven` 无材料依据（R2 轻微 7，本轮未修） | 同上 |
| 8 | B5-06 材料 L152 | `She also wrote her own name in our book.` 中 `She` 指向不明（交还者 or 本人 Lily），与 L151 `somebody handed it in for me` 有轻微抵触（R2 轻微 8，本轮未修） | 可改为 `The person who brought it in wrote her name in our book.` |
| 9 | B5-06-Q2 错项 C | `It will be sold in the school shop.` 比材料 `goes to the school shop` 多出 `sold`（R2 轻微 9，本轮未修） | 改为 `It will go to the school shop.` |
| 10 | B5-07-Q1 错项 B/C | `One hundred and ten yuan.` 与 `Ninety yuan in total.` 无推导来源（另两项 140 = 双成人、120 = 70+50 均可推导）（R2 轻微 10，本轮未修） | 换成有推导路径的错值 |
| 11 | B5-08 材料 L205 | `The museum closes at eleven on Saturdays, so we have two hours.` 的 two hours 是馆方开放时长；9:30 集合 + 25 分车程 = 9:55 到馆，两人实际可支配不足两小时（R2 轻微 11，本轮未修） | 改为 `so we can stay in the dinosaur room for about an hour.` |
| 12 | B5-08-Q2 错项 D | `One hour.` 无材料依据（R2 轻微 12，本轮未修） | 改为 `Thirty minutes.` |
| 13 | 文件级 | ①B5-01 与 B5-07 同为「南京 + 周六 + 奶奶生日」情境回声（R2 #13a）；②B5-02/04/05/06 四段以「Ms./Mr. + 姓」的称呼式开场，句式同构（R2 #13b） | 记录即可，不要求修复 |
| 14 | B5-08-Q2 | 两步（25×2）发生在 L203 同一句之内，是全批最弱的跨句题；之所以仍成立，是要结合「他们当天往返」这一隐含前提（L209 `See you at the gate.`） | 记录即可 |

**R2 的 13 条轻微中，本轮未消除任何一条**（F2 按 R2 处方只动材料、不动选项与选项外的句子）；**本轮新增 1 条**（第 4 条，B5-02-Q2 排除法路径）。13 + 1 = **14 条**。

---

## 7. 与任务书 / 上游描述不符之处（逐条列明，附反证）

1. **任务书第 26 行「B5-02 的 L44 改为 `Not until this evening…`（20 -> 26 词，段 139 -> 145）」中的两个数字都不成立。**
   反证：我按空白分词逐词数当前 L44
   `Ms. Clark: Not until this evening, once I have handed them all back. She should sign page forty and give the book back to me on Monday morning.`
   = Ms.(1) Clark:(2) Not(3) until(4) this(5) evening,(6) once(7) I(8) have(9) handed(10) them(11) all(12) back.(13) She(14) should(15) sign(16) page(17) forty(18) and(19) give(20) the(21) book(22) back(23) to(24) me(25) on(26) Monday(27) morning.(28) = **28 词**，不是 26。改前版本实测 20 词，故净增 **+8**，段词数 **139 → 147**，**不是 145**。逐段复算脚本对 B5-02 输出的实测值即 **147**。
   **根源**：R2-B5 第 6 节 M3 自己把新句算成 26 词，任务书照抄了这个数。**两个词都不影响门禁（147 < 200），但记账错误必须写出。**

2. **任务书第 27 行「M4：B5-06 的 L149/L150 拆成两轮（颜色在女儿一轮、材质在教师下一轮，段 176 -> 178）」中的 `178` 不成立。**
   反证：逐词复算当前 L150
   `Ms. Zhang: Then it must be the green one. The handle is wood, not metal, and the name on it says Lily Chen.`
   = Ms.(1) Zhang:(2) Then(3) it(4) must(5) be(6) the(7) green(8) one.(9) The(10) handle(11) is(12) wood,(13) not(14) metal,(15) and(16) the(17) name(18) on(19) it(20) says(21) Lily(22) Chen.(23) = **23 词**；改前 L150 实测 **17 词**（R2 记为 14 词，**计错 3 词**）；改前 L149 = 12 词、改后 = 5 词。净变化 = (−12+17) − (5+23) = 29 − 28 = **−1**，故段词数 **176 → 175**，**不是 178**。脚本对 B5-06 输出的实测值即 **175**。

3. **任务书第 20 行「M4 只修好一半：…B5-06 的两条线索同在一轮内，跨句要求仍未达成」——就「两条线索同在一轮内」这半句而言，对当前磁盘版本已不成立。**
   反证：当前 L149 只含颜色、L150 只含材质，两条线索**确实分处两轮**。但任务书未察觉的是**颜色词 `green` 仍留在 L150**，使得单轮可答的形态**从 L149 转移到了 L150 而未消除**（本报告 3.2）。**本轮裁定：M4 仍为未修好，但病灶已移动，性质与 R2 记述不同。**

4. **R2-B5 第 6 节 M4 处方本身不完整。** 它只规定「材质放到教师下一轮」，没有规定教师那一轮**不得重复颜色词**；而教师要回指女儿刚说的颜色，重复几乎不可避免。结果是修复方忠实执行了处方却达不到目的。**责任在处方，不在修复方**（_COMMON §4 第 91–94 行）。

5. **R2-B5 第 5.3 节「B5-02 跨句题数 = 0」对当前磁盘版本不再成立。** 反证见 3.1：标答的星期几成分 `Friday` 在 L44 中**不存在**，只在 L42 出现。**R2 的这项裁定本轮被推翻。**

6. **R2-B5 第 7 节轻微第 13 条的计数已过期。** R2 记「轻微 13 条」时含题级 12 + 文件级 1。本轮题级 13 + 文件级 1 = **14 条**（F2 未动任何选项与选项外句子，R2 的 13 条一条未消；另新增第 4 条）。

7. **闸门脚本退出码与两次快照（与 R2 的记录一致，本轮复现）**：`wordcount-gate.ps1` = `PASS`，**退出码 0**；`verify-bank.ps1` = `ALL CONSISTENT`，**退出码 0**；`check-integrity.ps1` = **退出码 1**，两次快照分别为「需关注 3 个」与「需关注 4 个」。第 1 次快照里 B5 行为 **MISMATCH**（＝F2-B5 修复落盘的预期状态，本报告已写入 B5 行的反证）；**第 2 次快照（本报告落盘后）B5 行已转为 `MATCH`**，即本报告结论对当前磁盘文件有效。第 2 次快照的 A3、E2、E4、C5 四处 MISMATCH 及第 1 次的 A8、C5 **均不属本任务范围**，按 _COMMON §2 记为并发写入造成的时间差。**三道门禁均不因 B5 而 FAIL。**

---

## 8. 16 题逐题逐选项判定（**64/64 全判，未抽样**）

「A/B/C/D 依据」列对**每一个选项**单独给出材料依据或反证。行号为当前磁盘文件。

| 题号 | 标答 | 唯一性 | A 项依据 | B 项依据 | C 项依据 | D 项依据 | 判定 |
|---|---|---|---|---|---|---|---|
| B5-01-Q1 | B | 唯一 | 反证：L16 的 12 元是**未含必买外箱**的中间值（漏算外箱） | 正：L14 资费 + L15 `three kilos` + L16 外箱 2 元 → 8+4+2 = 14 | 反证：12+4，把超出的 1 公斤重复计一次 | 反证：8+2，漏计超出的 1 公斤 | 可答；**真三步运算题**；标答全文不在材料中；极差 0（轻微 1 不涉此题） |
| B5-01-Q2 | D | 唯一 | 反证：周三只是 L10 的**发车日**，不是到达日 | 反证：三天路 ≠ 一天 | 反证：三天路 ≠ 两天 | 正：L10 三天在路上 + L12 走周三车 + L13 周三+3=周六 ⇒ 周六上午 | 可答；**单轮可答（L13）**（轻微 1） |
| B5-02-Q1 | C | 唯一 | 反证：L39 `copy the whole text?` 被 L40 的 `No, only the sentences you left blank` 明确否决 | 反证：L38 要求写在 exercise book 上，不是「a separate sheet」 | 正：L40 `each one time` + `with the right answer` | 反证：材料无「请同学代改」任何依据 | 可答；**单轮可答（L40）**；错项 D 无依据（轻微 2） |
| B5-02-Q2 | A | 唯一 | 正：**L42（Friday）+ L44（this evening / Monday morning）合读** | 反证：L44 `Not until this evening` 直接否掉 Saturday morning | 反证：L44 `once I have handed them all back` 否掉「while Ms. Clark is collecting」 | 反证：主句时刻是**交还**时刻，L44 说「看见」在 this evening | 可答；**真跨句题（星期几只在 L42）**；A/D 共用措辞（轻微 3）、排除法路径（轻微 4） |
| B5-03-Q1 | A | 唯一 | 正：L70 `do the two balconies first and leave the kitchen for Sunday morning` | 反证：客厅归母亲（L66） | 反证：厨房已推至周日（L70）、卫生间归母亲（L66） | 反证：卫生间归母亲（L66），且阳台是两个都归女儿 | 可答；**单轮可答（L70）** |
| B5-03-Q2 | C | 唯一 | 反证：9+1，只算一个阳台 | 反证：9+1.5，无推导路径 | 正：L64/L65 九点起 + L68 `each balcony` 一小时 + L70 只做两个阳台 → 9+2 = 11 | 反证：9+3，是 L70 之前的旧计划，已被推翻 | 可答；**真跨句两步题**；段内 12:00–13:00 偏紧（轻微 5，不涉此题） |
| B5-04-Q1 | D | 唯一 | 反证：180+20+10，折扣符号错 | 反证：180+20，漏折扣 | 反证：只算屏幕钱 | 正：180+20 − 10（折扣由 L100/L101 `Then I'd better wait` 兑现） | 可答；**真跨句题**（折扣是否兑现须读后续两轮） |
| B5-04-Q2 | B | 唯一 | 反证：10:30+30 分 | 正：L98 十点半 + L100 一小时 ⇒ 11:30 | 反证：10:30+1.5 小时 | 反证：把到达时刻当取回时刻 | 可答；**真跨句题** |
| B5-05-Q1 | A | 唯一 | 正：L121 8:10−20 分 = 7:50（ten to eight）+ L123 `At the east gate` | 反证：school hall 无依据（轻微 6）；十点过八分是**发车**时刻 | 反证：L123 `The west gate is locked in the morning` | 反证：bus stop 与 8:30 均无依据（轻微 6） | 可答；**真跨句题**（时刻与地点分处两轮） |
| B5-05-Q2 | D | 唯一 | 反证：十点五十是 L127 的**离园**时刻 | 反证：11:15 无推导路径（轻微 7） | 反证：L126 的 12:00 是午饭时刻 | 正：10:50 + L125 单程四十分钟 = 11:30 | 可答；**真跨句题** |
| B5-06-Q1 | B | 唯一 | 反证：黑 + 金属，两条都错 | 正：**L149（dark green）+ L150（wood, not metal）** —— 但两条线索仍可由 L150 一轮同时取出 | 反证：黑 + 木，错在颜色 | 反证：深绿 + 金属，错在材质 | 可答；**2×2 结构好、极差 1、但跨句要求未达成 → 中等**（3.2 / 6.2） |
| B5-06-Q2 | C | 唯一 | 反证：L154 班长是**贴清单**，不是接收人 | 反证：L154 是给校长留一份**清单副本**，不是交伞 | 正：L156 `anything unclaimed goes to the school shop` | 反证：与 L156 `We keep lost things for one month` 矛盾 | 可答；**单轮可答（L156）**；C 多出 `sold`（轻微 9）；L152 指代（轻微 8） |
| B5-07-Q1 | D | 唯一 | 反证：两条都按成人 70×2 = 140 | 反证：110 无推导来源（轻微 10） | 反证：90 无推导来源（轻微 10） | 正：L175 成人 70 + L176 `my cousin is eleven` 儿童 50 = 120，L181 再确认十五岁按成人 | 可答；**真跨句题** |
| B5-07-Q2 | A | 唯一 | 正：L177 九点发车 + L179 `Two hours and a half` ⇒ 11:30 | 反证：9+1 小时 | 反证：9+1.5 小时 | 反证：9+3 小时 | 可答；**真跨句题** |
| B5-08-Q1 | C | 唯一 | 反证：L201 馆 9:00 开 | 反证：L201 恐龙厅 10:00 开 | 正：L203 `Let's meet at the school gate at half past nine` | 反证：L207 商店 10:30 打烊 | 可答；**单轮可答（L203）** |
| B5-08-Q2 | B | 唯一 | 反证：L203 `every fifteen minutes` 是**班次间隔**，不是单程时长 | 正：25 分 × 2 趟 = 50 分 | 反证：25 是**单程** | 反证：60 无推导来源（轻微 12） | 可答；两步但发生在同一句内，强度最弱（轻微 14） |

### 已复核题号清单（16 行）

| 题号 | 严重 | 中等 | 轻微 | 本轮结论 |
|---|---|---|---|---|
| B5-01-Q1 | 0 | 0 | 0 | **无问题** |
| B5-01-Q2 | 0 | 0 | 1（#1） | **通过** |
| B5-02-Q1 | 0 | 0 | 1（#2） | **通过** |
| B5-02-Q2 | 0 | 0 | 2（#3、#4） | **通过**（M3 本轮已修好） |
| B5-03-Q1 | 0 | 0 | 0 | **无问题** |
| B5-03-Q2 | 0 | 0 | 1（#5，段级） | **通过** |
| B5-04-Q1 | 0 | 0 | 0 | **无问题** |
| B5-04-Q2 | 0 | 0 | 0 | **无问题** |
| B5-05-Q1 | 0 | 0 | 1（#6） | **通过** |
| B5-05-Q2 | 0 | 0 | 1（#7） | **通过** |
| B5-06-Q1 | 0 | **1（M4 残留）** | 0 | **需修复后复审** |
| B5-06-Q2 | 0 | 0 | 2（#8、#9） | 记录即可（单轮可答已计入 M4 段级判定） |
| B5-07-Q1 | 0 | 0 | 1（#10） | **通过** |
| B5-07-Q2 | 0 | 0 | 0 | **无问题** |
| B5-08-Q1 | 0 | 0 | 1（#11，段级） | **通过** |
| B5-08-Q2 | 0 | 0 | 2（#12、#14） | 记录即可 |

**计数核对：题级中等 **1** 条（M4 残留，落点 B5-06-Q1，跨该段 Q2 一并计）；题级轻微 **13** 条 + 文件级 **1** 条 = **14** 条。严重 0。**
**覆盖确认：16/16 题、64/64 选项已实读，无抽样。**
**经本轮复核确认无任何问题的题号：B5-01-Q1、B5-03-Q1、B5-04-Q1、B5-04-Q2、B5-07-Q2。**

---

## 9. 门禁汇总

| 门禁 | 结果 | 是否因 B5 而 FAIL |
|---|---|---|
| 字节级基线对照（10,556 / 227 / `035ee419b6e334032ff92d33d31d5c2e`） | **逐位一致** | 否（修复确已落盘且未再被改动） |
| `wordcount-gate.ps1` | PASS，EXITCODE=0 | 否 |
| `check-integrity.ps1` | EXITCODE=1；第 1 次快照 B5 行 MISMATCH＝**修复落盘的预期状态**，**第 2 次快照 B5 行 = MATCH**（本报告结论对当前磁盘有效） | 否 |
| `verify-bank.ps1` | `PASS(16题)`、`ALL CONSISTENT`、EXITCODE=0 | 否 |
| 词数上限（B ≤200） | 8 段全部通过，最小余量 18 | 否 |
| 题数比 1.9（16 ÷ 8 = 2） | 通过 | 否 |
| 答案排列（_COMMON §2c 四项 + 偏斜 + 同段异答） | 全部通过 | 否 |
| 开场白去重 + Jaccard 0.6 | 通过（8 key 互异、0 命中） | 否 |
| 题干 ∩ 标答实词 | 16 题全空 | 否 |
| 选项词数极差 | 16 题全部 ≤2 | 否 |
| 家长/教师标注 | 无一错标 | 否 |
| **段级跨句/两步推理（任务书第 4 项）** | **7/8 段达标，B5-06 不达标** | **是 —— 本轮唯一卡口** |

---

## 10. 给下一轮修复方的说明

- 本报告对应修复轮次：**F3-B5**（依 _COMMON §4 的机械推导，`V-X.md` 是第一份复核报告，其报出的问题对应 `fixes/F3-X.md`；本报告文件名无数字后缀，确认为第一次复核）。
- **唯一待修中等**（第 6.2 节）：只改 `data/item-bank/prod/B5.md` 的 **B5-06 L150** 一行
  - 现：`Ms. Zhang: Then it must be the green one. The handle is wood, not metal, and the name on it says Lily Chen.`
  - 改：`Ms. Zhang: Then we have found it. The handle is wood, not metal, and the name on it says Lily Chen.`
  - **本处方只处理「教师轮重复颜色词」这一项**；第 6.3 节的 14 条轻微**不在本处方授权范围内**，可择机另行处理，不得混做。
- **该改动不动任何标答字母**（M4 仍为 B），因此 **A4 B4 C4 D4 分布、答案序列 `BDCAACDBADBCDACB`、以及第 5 节的全部周期 / 前后半段 / 8 个循环移位 / 最长连续 / 偏斜 / 同段异答检查均无需重做。**
- 改完必须重跑 `docs/pipeline/wordcount-gate.ps1`（预期 B5-06 = **173**），由调度方重跑 `check-integrity.ps1`。
- **保留项（不得回退）**：
  - B5-02 L44 的 `she` 人称（B5-02-Q2 标答 A 与错项 D 均保持 `she`，见 R2-B5 第 4 节、本轮第 3.1 节已复核仍然正确）；
  - B5-02 L44 的 `Not until this evening`（它是 M3 达标的唯一原因）；
  - B5-06 Q1 的 2×2 全同构四选项与标答 B；
  - B5-03 的 12:00 下厨（**不得**改回 `half past eleven`）。
- **下一轮可直接沿用本报告的部分**：第 1 节基线、第 2 节三门禁、第 4.1 词数（仅 B5-06 变 175→173）、第 4.2–4.3、第 4.5–4.8、第 5 节答案排列、第 6.3 节 14 条轻微、第 8 节 64 格判定——**这些均为本轮从原文重算的结果，不受本次一行改动影响**。

---

## 最终判定

**不通过**——严重 **0** 条、中等 **1** 条、轻微 **14** 条。基线逐位吻合、三道闸门均不因 B5 而 FAIL、答案排列（周期 1–8、前后半段、8 个循环移位、最长连续、四字母覆盖、位置偏斜、同段异答）全部通过、词数 8 段全 ≤200、题干与标答实词交集 16 题全空、64 个选项全判。**F2-B5 的 M3（B5-02）经复核确已真修好**（标答的「Friday」只在 L42，L44 只剩 `this evening`，必须合读两轮），与 R2 的裁定相反；**M4（B5-06）只把「颜色词」从女儿那一轮搬到了教师那一轮，单轮可答的形态未消除，残留中等**。按第 6.2 节把 L150 的 `Then it must be the green one.` 改成 `Then we have found it.`（两词，段词数 175→173，标答与答案序列均不变）即可复审通过，**当前磁盘版本暂不能归档**。
