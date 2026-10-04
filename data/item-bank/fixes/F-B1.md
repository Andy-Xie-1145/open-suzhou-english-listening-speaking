# 修复记录：B-batch1.md（依据 R1-B1.md）

> 本轮只处理「严重」「中等」缺陷；16 条轻微缺陷一律未动，留给第二轮。
> 改动仅落在 `data/item-bank/B-batch1.md` 本文件。

## 已修复
- 【严重】B-03 去图书馆的路线 报告给的两处 old_string（`Go straight along this road for about five minutes.` / `How long does it take to walk there from the station?`）在文件中均已不存在，"the station" 凭空登场与 5 分钟 / 15 分钟口径打架的问题**已被先行改动消除**；但该改动遗留了一处新伤：`Is there a bus stop nearby?` + `Buses number 3 and 12 stop there.` 这一对问答在对话中被完整重复两遍（原第 72–73 行与第 76–77 行，逐字相同），Tom 连问两遍同一问题。→ 删除后出现的那一份重复（报告点名的 76–77 行区间内），使对话回到「问路 → 公交 → 步行」的单一链路；未改动任何保留句的措辞，Q1（第二个红绿灯）与 Q2（12 路）答案不受影响。
- 【中等】B-02 更换笔记本 店员台词含超纲词 `a sale item`，且"这是降价品"之后又痛快换货，前后行为矛盾 → 按报告改为 `Sorry, we can only change a notebook bought within seven days. May I see your receipt?`；Emma 回 `I bought it last Saturday` 正好落在七天内，逻辑自洽，Q1（B）与 Q2（A）判分不变。
- 【中等】B-01 读书角志愿者 Q2 选项 A `She could not find the right colours for it.` 与正确项 C 同指"颜色没定下来"，存在二解风险 → 按报告改为 `She did not have enough time to work on it.`，仍为 Because 类从句、与其余三项同构，且可由材料排除；Answer 仍为 C。
- 【中等】B-04 校运会800米 Q1 选项 A `Because she runs three kilometres every day.` 使用的事实在材料中为真，与 `I train after dinner` 因果相容 → 按报告改为 `Because she runs three kilometres every morning.`，与原文直接矛盾、可排除；Answer 仍为 B。
- 【中等】B-04 校运会800米 Q2 题干问 `probably`，材料只给了 if 条件句，概率无从判断 → 采用报告建议①（未选②）：题干改为 `What does Lucy say she will do if the doctor tells her to rest?`，与材料条件句 `If the doctor says I need rest, I'll run the 400 metres instead.` 一一对应；选项 C 保持 `She will run the 400 metres instead.`、Answer 仍为 C，四个选项未动。选①而非②的理由：②的改法会让选项变成条件句，却仍挂在"what will she do"这个问将来行为的题干下，题干与选项语法不同层，反而制造新的不匹配。
- 【中等】B-05 自做月饼 第 11 轮 `He bought six last year.` 缺中心语、指代残缺，而这句是 Q2（借什么）的唯一依据 → 按报告改为 `He bought six last year, so we can borrow one of them.`；Q2 Answer 仍为 A（a big bowl），其余选项未动。
- 【中等】B-08 环保活动改期 中式搭配 `the environment activity`（对白 1 处 + Q1 题干 1 处） → 两处统一改为 `the school clean-up activity`；Q1 Answer 仍为 D，与对白 `the weather is too windy` 对应。

## 已修复（自拟方案）
- 【严重】B-03 重复轮次 删除重复的 `Tom: Is there a bus stop nearby?…` / `Woman: Yes, there's a stop at the corner…` 一对（原第 76–77 行）。报告给的是"改写这两行"的替换文本，但这两行已被别人替换成与前文逐字相同的内容，原替换文本无法再定位；本条为清除该次改动残留而自拟的最小方案——只删重复、不新增任何台词、不动选项与编号。请第二轮复核时重点确认这一段。

## 未修复
- 【严重】B-06 周六去公园拍照 冠词缺失（`One of birds in a tree.`）——未修复，原因：文件中该句已为 `One of the birds in a tree.`，报告 old_string 找不到，判定已被先行改动修正，按"找不到就跳过"处理。
- 【严重】B-07 眼睛不舒服 Kate 台词人称错误（`Ask her to check my eyes too.`）——未修复，原因：文件中已为 `You can ask her to look at your eyes too.`，old_string 找不到，判定已被先行改动修正。
- 【严重】B-07 Q1 选项 B 答案与材料不符（`…with his mother on Sunday.`）——未修复，原因：文件中已为 `He should go to see an eye doctor with Kate's mother on Sunday.`，Answer 仍为 B，old_string 找不到，判定已被先行改动修正。

> 说明：上述 3 条严重项均非"本轮放弃"，而是所引用的缺陷原文在本文件中已不存在；本轮不重复施加同一修改。

## 修改后自检
- 结构标记是否仍完整：是（8 段 × `**Dialogue**` / `**Q1**` / `**Q2**` / `**Answer**`，Dialogue 8、Q1 8、Q2 8、Answer 16）
- 编号是否仍连续：是（B-01 ~ B-08，无缺号、无重号）
- 每题选项个数是否仍为 4：是（16 小题全部 ABCD 四项，顺序未变）
- 答案字母是否仍与对话对应：是（16 题答案逐题重核；分布仍为 A4 B4 C4 D4，与文件头声明一致；本轮未改动任何 `**Answer**` 行）

## 遗留（按约定未动）
- 16 条轻微缺陷全部保留，包括：第 120–121 行 B-04/B-05 之间多余空行、B-05 Q2-D 与 B-06 Q2-B 的 `A pair of gloves.` 重复干扰项、B-01 人数口径与因果链缺环、B-02 `the thirty-page version` 等。以上供第二轮处理。
- 未改动任何结构标记、题号、选项个数与答案字母；未改动除 `B-batch1.md` 外的任何文件。
