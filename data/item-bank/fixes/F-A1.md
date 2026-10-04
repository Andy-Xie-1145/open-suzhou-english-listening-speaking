# 修复记录：A1.md（依据 R1-A1.md）

修复范围：仅严重 / 中等缺陷，共 5 条中等缺陷实际改入 A1.md；2 条严重缺陷在本轮开工前文件里已是报告给出的推荐修正版本，按"old_string 找不到即跳过"的约束未做改动。10 条轻微缺陷一律未动。

## 已修复
- 【严重】A1-08 说 three colours 却只枚举 red/blue，"B. Two." 成为同样合理选项 → 跳过：打开文件时 L102 已是报告推荐文本「Boy: Yes, with three colours — red for words, blue for sentences and green for the main points.」，枚举已补第三种颜色 green，数字与枚举自洽，答案 D 可由枚举唯一确定，无需再改。
- 【严重】A1-09 回答 Five 却只枚举 4 门课 → 跳过：打开文件时 L114 已是报告推荐方案一（改数字）的文本「Girl: Four. We have Chinese, maths and English, and then science.」，数字与枚举自洽，无需再改。
- 【中等】A1-12 正确答案含材料未提供的时段 afternoon，学生只能靠选项结构排除 → 按报告替换 L157 为「Girl: We'll talk about our summer plans. Please come to our practice on Thursday afternoon.」，答案 C 由材料直接支撑。
- 【中等】A1-03 女教师 Ms. Green 被标为 Girl:，与全文 Man/Woman 的成年人标注冲突 → 将该题唯一的 `Girl:`（L31）改为 `Ms. Green:`。
- 【中等】A1-11 女教师 Ms. Wang 被标为 Girl:，同上 → 将该题 2 处 `Girl:`（L142、L144）改为 `Ms. Wang:`。
- 【中等】A1-14 超纲 / 美式用词 `poster board` 与全文英式拼写不一致 → 将 L185 改为「Man: May we use the big notice board, too?」（报告建议，与轻微 #10 同处，按中等处理）。报告中另三处待核词 photography / go through the mistakes / sports field 按报告"建议保留"未动。

## 已修复（自拟方案）
- 【中等】A1-03 报告写的是"把该题 2 处 `Girl:` 改为 `Ms. Green:`（位置 :31、:32）"，但文件里该题只有 1 处 `Girl:`（L31），L32 本身是 `Boy:`。自拟：只改 L31 这一处，不动 `Boy:`，以免把学生台词也改成教师标签、破坏一问一答结构。

## 未修复
- 【轻微】A1-01 加入 art club 靠隐含推断、答非所问等 10 条轻微缺陷（A1-01 ×2、A1-02 ×1、A1-03 ×3、A1-04 ×1、A1-07 ×1、A1-13 ×1、A1-14 ×1）——按任务约束轻微缺陷一律不动，留给第二轮审核处理。
- 无"改完仍判不出唯一答案"而被迫保留的情况。

## 修改后自检
- 结构标记是否仍完整：是（15 题各含 1 个 `**Dialogue**` / `**Question**` / `**Answer**`，共 15/15/15）
- 编号是否仍连续：是（A1-01～A1-15 无缺号、无重号，标题行未改动）
- 每题选项个数是否仍为 4：是（15 题的选项字母均为 A.B.C.D.，无增删、无重复）
- 答案字母是否仍与对话对应：是（答案行一字未改：B C A D B A C D B A D C A B C；A1-12 的 C 现由 L157 的 "Thursday afternoon" 直接支撑，A1-11 的 D 由 L144 "write down what you and Jack do" 支撑，A1-03 的 A 由 L31 "before four this afternoon" 支撑）
- 改动是否只落在审核点名处：是（共 5 处 edit，全部为报告点名的行；未重写任何整题）
- 是否触碰其它文件：否（仅新建本文件）
