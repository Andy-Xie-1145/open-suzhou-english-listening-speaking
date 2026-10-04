# 复核报告：B-batch1.md 修复后复核（只复核本轮改动题）

> 复核对象：B-04、B-05、B-07（3 段材料 / 6 小问）
> 复核依据：`reviews/R2-B1.md` 所列改动项 + 现行 `data/item-bank/B-batch1.md`
> 复核边界：只验证本轮修复**有没有引入新缺陷**，不重做全面审核。未阅读 `reviews/` 下其他报告与 `fixes/` 下任何文件，未修改任何题目文件。

## 结论

- 复核题数：**6 小问**（B-04 Q1/Q2、B-05 Q1/Q2、B-07 Q1/Q2）
- 通过：**3 小问**（B-04 Q2、B-05 Q1、B-05 Q2）
- 有问题：**3 小问**（B-04 Q1；B-07 Q1、Q2 —— 后两者同源于 B-07 材料同一句）
- 缺陷计数：严重 **0** 条｜中等 **2** 条｜轻微 **2** 条（另有 5 条 R2 已记录但本轮未动的轻微项，另列）
- 是否通过：**暂不可归档**。两条中等均为**单词级单行改法**，不涉及任何答案唯一性风险；改完两行即可归档。
- 明确通过的部分：**三处改动全部成功消除了 R2 指出的双答案风险**，未产生任何新二解、未产生重复轮次、未产生角色方向错误。

---

## 一、本轮实际改动（已用脚本逐行确认落地情况）

| # | R2 改动项 | 应改位置 | 现状 | 落地 |
|---|---|---|---|---|
| 1 | 中等 #6 `sore`→`aches` | B-04 第 98 行 | 第 98 行 `my leg aches in the morning` | ✅ 材料已改 |
| 1b | 同上，**题干与选项的连带排查** | B-04 第 107 行（题干） | 第 107 行仍为 `feel sore` | ❌ **漏改（见 DEFECT-1）** |
| 2 | 中等 #1 `bought six` 歧义 | B-05 第 134 行 | `borrow a big bowl … He has six in his kitchen` | ✅ |
| 3 | 中等 #5 `flour`→`milk` | B-05 第 130 行 | `eggs, sugar, milk and something for the middle` | ✅ |
| 4 | 中等 #2 去掉「灯」的两处依据 | B-07 第 186、188 行 | 第 186 行 `Reading on a screen like that…`；第 188 行 `You need proper medical advice…` | ✅（但见 DEFECT-2） |
| 5 | 中等 #3 Q1 正确项压缩 | B-07 第 197 行 | `He should see an eye doctor with Kate's mother on Sunday.`（11 词） | ✅ |
| 6 | 中等 #4 Q2 选项 D 替换 | B-07 第 206 行 | `He will ask Kate's mother to check his eyes on Friday.` | ✅ |

脚本实测佐证：`sore` 在全文件**仅剩第 107 行一处**（即题干）；`bought six` 已消失；`flour` 已消失；`lamp` 仅出现在第 199、204 行（两个选项），**材料中零出现**——证明 B-07 去依据做得干净彻底。

---

## 二、新发现缺陷

### DEFECT-1（中等）B-04 Q1 题干遗留超纲词 `sore`，与材料改动后的 `aches` 脱节
- **位置**：第 107 行（Q1 题干）
- **证据**：材料第 98 行本轮已改为
  > `Lucy: About three kilometres, but I train after dinner, and my leg aches in the morning.`

  但 Q1 题干第 107 行仍是
  > `Why does Lucy's leg feel sore in the morning?`

  全文件检索 `sore` 只命中第 107 行，`ache` 命中第 98 行——即本轮把材料里的那一处换掉了，**同一个生词原封不动地留在了题干里**。
- **为什么是问题**：命中本次复核清单第 9 条（修复方只改材料里出现的那一处）。R2 的建议原文只承诺改第 98 行并自注「四个选项均未出现 `sore`」，修复方照此执行，却没有回扫题干——结果既没清掉超纲词（规范 1.3），又让**同一概念在材料用 `aches`、在题干用 `sore`**，材料与题干的指称对不上。
- **判分后果**：不影响唯一性（答案 B 仍由第 98 行 `I train after dinner` 直接支撑），但属于本轮修复**未完成**，而非新引入的答案缺陷。
- **建议改法**（单行替换）：
  > `Why does Lucy's leg ache in the morning?`
  >
  > （若保留 `sore` 并能出示课标五级词表收录证明，则材料也应回改为 `feels sore`，二者取其一即可。）

### DEFECT-2（中等·不确定）B-07 第 188 行**新引入** `medical`，未做词表核对
- **位置**：第 188 行 `Kate: You need proper medical advice. My mother used to work in a hospital.`
- **证据**：`medical` 在全文件仅出现第 188 行一处，且该句是**本轮修复新写入的文本**（R2 建议的原文不含此词）。检索 `medical` → 行 188（仅此一处）。
- **为什么是问题**：命中复核清单第 9 条的镜像情形——修复方在替换句子时顺手换进了一个自己没核对的新词。同句的 `proper`（五级）、`hospital`（五级）无疑问，疑问只在 `medical`（形容词）。
- **不确定的理由（按规范 4.5 明确标注）**：本工作区内没有课标词表文件，`medicine` 可确认属五级，`medical`（adj. 医学的）是否收录我无法就地核验。同一份材料里的 `sore`（R2 中等 #6）即按「可能超纲」处理，本条按同一标准计中等；**若修复方能确认 `medical adj.` 在课标五级词表内，本条可直接注销**。
- **判分后果**：无。不影响 B-07 任何小问的可判性（`see an eye doctor … on Sunday` 仍由第 190 行独立支撑）。
- **建议改法**（单行替换，`see a doctor` 为确定五级，第 189 行 `Really? She knows an eye doctor, doesn't she?` 与第 190 行的衔接不受影响）：
  > `Kate: You need to see a doctor. My mother used to work in a hospital.`

### DEFECT-3（轻微）B-07 两个小问共用同一个错误理念作干扰项——本轮改动的连带结果
- **位置**：第 199 行（B-07 Q1 D）、第 204 行（B-07 Q2 B）
- **证据**：材料中 `lamp` 已零出现（脚本实测：`lamp` 仅命中第 199、204 行两个选项）。于是
  - Q1 D：`He should use a brighter lamp at his desk.`
  - Q2 B：`He will read with a brighter lamp at his desk.`

  两题相邻，共用「换更亮的台灯」这一条错误理念。
- **为什么只是轻微**：材料已无任何台灯依据，两项都是纯干扰项，**不产生二解**，正确项 B（Q1）与 C（Q2）均为材料原句直引。后果仅是：做完 Q2 的学生会把「更亮的台灯」记为错误方向，进而去 Q1 排除同一表述——相邻两题的区分度被轻微削弱。
- **建议改法**（只动 Q2 B，保持同类、给出材料味道更强的排除力）：
  > `- B. He will finish the last chapter before he sleeps.`
  >
  > （源自第 187 行 Daniel 的 `I always think I can finish the last chapter first`，同为「未来动作」同类项，且因第 193 行 `I'll talk to her this week` 而被明确排除。）

### DEFECT-4（轻微）B-05 改后食材清单失去唯一合理的和面原料
- **位置**：第 130 行 `We need eggs, sugar, milk and something for the middle.`
- **证据**：`flour`→`milk` 的替换执行到位（`flour` 已全文件清零）。但自做月饼的面点通常靠粉类定型，改后清单变成「鸡蛋、糖、牛奶 + 馅料」，缺和面原料，读起来略不合常识。
- **为什么只是轻微**：这是「超纲词 vs 生活常识」权衡后的取舍，**不影响任何小问可判性**——Q1 问的是 Grandma 对店售月饼太甜的反对（第 126 行，与食材无关），Q2 问的是借什么（第 134 行，与食材无关）。记录供下一轮决定是否再调，不阻塞。
- **建议改法**（可选）：`We need eggs, sugar, oil and something for the middle.`

---

## 三、九条复核清单逐条回答

### 1. 改动后是否出现新的二解？
**通过。** 逐选项排除如下：

- **B-04 Q1（答案 B）**：A「每天早上跑三公里」被第 98 行 `I train after dinner` 直接否定；C「清晨空气太冷」无依据（第 100 行 Lucy 反而说空气更干净）；D「病了好几天」无依据。仅 B。
- **B-05 Q2（答案 A）**：本轮改动**成功消除**了 R2 中等 #1。第 134 行现为 `We can borrow a big bowl from Uncle Wang on Saturday. He has six in his kitchen.`，借的对象显式写死为 “a big bowl”，选项 B `A box for the cakes.` 在材料中零依据。
  - 已核查并排除的残余疑虑：`He has six` 的省略先行词理论上仍可被读作「六盒月饼在他家厨房」，但该句只交代**来源家中有六只**，而问句问的是 borrow 什么，借物在同句前半已显式命名；省略句无论怎么读都推不出第二个借物答案。**不构成二解。**
- **B-07 Q1（答案 B）**：本轮改动**成功消除**了 R2 中等 #2。材料中 `lamp` 已零出现（脚本实测确认），D「换更亮的台灯」失去全部依据；C「买新手机」无依据；A「早点写完作业」是 Daniel 自己的说法而非 Kate 的建议，且指向 homework 而非眼睛。仅 B（第 190 行直引）。
- **B-07 Q2（答案 C）**：C 由第 193 行 `I'll talk to her this week` 直引。A「让 Kate 替他写作业」无依据；B 见 DEFECT-3（无依据）；D「周五请 Kate 母亲查眼睛」双重排除——材料中已无任何「检查眼睛」的动作（第 188 行的 `ask her to look at your eyes` 本轮被删），且第 193 行明确是「周日看医生」。仅 C。

### 2. 改动后材料内部是否仍自洽？
**B-04：有问题（术语层）**。同一概念材料用 `aches`、题干用 `sore`，见 DEFECT-1。
- 时间/数字/人物/场所：**通过**。三周后开赛（第 103 行）↔ 赛前一周停夜训（第 101 行）↔ 今天下午看医生（第 103 行）无冲突；800 米 / 400 米 / 每天三公里三处数字互不矛盾；Peter 与 Lucy 的说话人标签全篇一致；`leg hurts`（训练所致，第 96 行）→ `leg aches`（次日清晨，第 98 行）→ school doctor（第 102 行）→ 若需休息改跑 400 米（第 104 行）因果链完整。
- **B-05：通过**。第 131 行 Dad 的 `my sister` 与第 132 行 Mia 的 `your sister is welcome` 指向同一人（Dad 的妹妹），未把一个角色拆成两人；「一家只有一只大碗」（第 133 行）→「借王叔叔周六的，他家有六只」（第 134 行）数量与来源自洽；食材→借碗→开始制作的顺序自洽。
- **B-07：通过**。每晚睡前两小时、手机放在书旁（第 185 行）→「That light is too close」回指手机（第 186 行），下一句 `Reading on a screen like that` 自我印证 that = 手机屏，指代链闭合；周日看医生（第 190、193 行）↔ this week 交作业一致；「母亲曾在医院工作」→「她认识眼科医生」→「可以周日跟她去看他」的推理链无矛盾。

### 3. 说话人标注是否仍全篇统一？有没有同一角色被拆成两个人？
**通过。** 脚本逐轮统计：B-04 = Peter 5 轮 + Lucy 6 轮 = 11；B-05 = Dad 6 轮 + Mia 6 轮 = 12；B-07 = Kate 6 轮 + Daniel 6 轮 = 12。三段内部标签均为单一写法，无 `Man`/`Mr.`/`Woman`/`Ms.` 混用。文中的 Grandma、Kate 的母亲、Kate 的姐姐、Dad 的妹妹、Uncle Wang 均为**被提及者**而非说话人，不构成角色拆分；Uncle Wang 全段仅一处提及，不存在前后指代不一致。

### 4. 标题与正文是否仍矛盾？
**通过**，三题标题与正文均不矛盾。
- B-04「校运会800米」：Lucy 说 `I am, but I'm not sure` 并可能改跑 400 米——标题是话题标签而非「她一定跑 800 米」的断言，可接受。
- B-05「自做月饼」：正文确实转为自家做月饼，无矛盾。仅「自做」二字略非规范（「自制/自己做」更地道），属标题措辞轻微项，且**本轮未改动该标题**，不算新缺陷。
- B-07「眼睛不舒服」：正文自始至终围绕眼睛不适，无矛盾。

### 5. 是否引入重复轮次？（规范 1.7 相似度扫描，实测全文件）
**通过。** 已按 1.7 推荐的两项脚本扫描全文件（非目测）：
- **话轮相似度扫描**：全文件 **95 个话轮**，同一材料内两两分词 Jaccard 全部 **>0.6 命中 0 次**。各段最大值：B-01 0.300、B-02 0.250、B-03 0.333、B-04 0.133、B-05 0.125、B-06 0.182、B-07 0.182、B-08 0.143，均远低于阈值。B-03 的「问公交站 → 站点在拐角 → 坐 12 路」三连轮只出现一次，未被复制。
- **跨材料话轮相似度**：最高一对仅 0.250（B-04 `All right. If the doctor says…` vs B-07 `All right. I'll talk to her…`），属正常口语开头重合，非雷同。
- **开场白归一化扫描**：8 段首句取前 4 词归一化后 **8/8 唯一，重复 0**。未出现「多题同以 Excuse me 开头」的旧病。
- **本轮改动本身是否制造了雷同**：B-07 第 188 行新句与第 190 行、第 193 行的相似度为全段最高档 0.182，属正常对话，未构成重复轮次。
- **附：选项跨题重复扫描**（非 1.7 要求项，顺带实测）→ 命中 1 组，见第四节遗留项。

### 6. 答案字母是否仍与材料对应？
**通过。** 逐条溯源：

| 题号 | 答案 | 材料出处 | 是否直引 |
|---|---|---|---|
| B-04 Q1 | B | 第 98 行 `I train after dinner` | 显性 |
| B-04 Q2 | C | 第 104 行 `I'll run the 400 metres instead` | 直接引语 |
| B-05 Q1 | D | 第 126 行 `Grandma always says those cakes are too sweet` | 直接引语 |
| B-05 Q2 | A | 第 134 行 `We can borrow a big bowl` | 直接引语 |
| B-07 Q1 | B | 第 190 行 `You can go to see him with her on Sunday` | 直接引语 |
| B-07 Q2 | C | 第 193 行 `I'll talk to her this week` | 直接引语 |

**全卷答案分布实测**：`A C B A B D B C D A C A B C D D` → **A4 B4 C4 D4，共 16**，与文件头第 3 行声明完全一致，本轮改动未打乱字母分布。
**B-07 选项长度实测**（对应中等 #3）：A=10 词、B=11 词、C=10 词、D=9 词，四项已收敛到同一量级，位置暗示消除。

### 7. 有没有引入新的语法错误、超纲词或中式表达？
**有问题（2 条，均已在上文列出）；无语法错误、无中式表达。**
- 语法逐句核查（仅看本轮改动句）：
  - 第 98 行 `my leg aches in the morning` —— 第三人称单数动词形式正确。✅
  - 第 130 行 `We need eggs, sugar, milk and something for the middle.` —— 句法正确。✅
  - 第 134 行 `We can borrow a big bowl from Uncle Wang on Saturday. He has six in his kitchen.` —— 语法正确；`six [big bowls]` 的省略由前半句 `borrow a big bowl from Uncle Wang` 锚定，是英语允许的合法省略，**不构成语法错误**。✅
  - 第 186 行 `That light is too close. Reading on a screen like that is bad for your eyes.` —— 句法正确。✅
  - 第 188 行 `You need proper medical advice. My mother used to work in a hospital.` —— 语法正确，但 `medical` 词表状态存疑，见 DEFECT-2。⚠️
  - 第 197 行选项、第 206 行选项 —— 句法正确。✅
- 超纲词：`ache`、`milk`、`screen`、`hospital`、`proper` 均为确定五级词；`medical` 存疑（DEFECT-2）；`sore` 残留题干（DEFECT-1）。
- 中式表达：逐句检查三段改动文本，**未发现**。`home-made`（第 135 行）为可接受写法且本轮未改动。

### 8. 情景提示 / 问句 / 考点三者角色方向是否一致？
**通过。** 说明：B 类为选择题，用 `**Dialogue**` + `**Q1/Q2**` + `**Answer**`，**没有独立的「情景提示」字段**，故按同一原则核查「问句主语 ↔ 材料中 you/your 的受话人」方向。
- 三题 6 个问句**全部为第三人称转述**，无一处出现 `I`/`my`/`me` 指考生：`Why does Lucy's leg ache…`、`What does Lucy say she will do…`、`Why doesn't Mia want to buy…`、`What will Mia and her father borrow…`、`What does Kate suggest Daniel do…`、`What will Daniel probably do…`。**「问句里的 I / my 绝不能指考生」这一条无违例。**
- `you`/`your` 的指向（材料内第二人称仅存在于 B-07，均为 Kate→Daniel）：第 186 行 `bad for **your** eyes`、第 188 行 `You need…`、第 190 行 `**You** can go to see him with her`、第 192 行 `Tell **your** teacher`。
- 对应问句 Q1 `What does **Kate** suggest **Daniel** do`（主语 Kate = 建议方，被动方 Daniel = 材料中的 you）、Q2 `What will **Daniel** probably do`（材料中 Kate 的 you = Daniel，问句中的 Daniel = 同一人）——**方向完全一致，未出现角色互换或指代漂移。**
- B-05 内 `your sister`（第 132 行，Mia→Dad）与 `my sister`（第 131 行，Dad 自述）指向同一第三人称对象，不构成「问句 you 指考生」的违规。

### 9. 超纲词有没有漏网的？
**有问题，命中本条。** 本轮修复正是典型的「只改材料里那一处」：
- **漏网 1（B-04 Q1）**：`sore` 未清除。R2 中等 #6 的建议只覆盖材料句与四个选项（报告原文自注「四个选项均未出现 `sore`」），修复方据此改了第 98 行，**却没回扫题干**。脚本检索 `sore` → 仅第 107 行，即题干；`ache` → 第 98 行。详见 DEFECT-1。
- **漏网 2（B-07 材料，方向相反）**：修复方在替换第 188 行时**新写入**了 `medical`，同属未做词表核对的新词。检索 `medical` → 仅第 188 行。详见 DEFECT-2。
- **已确认清除**：`flour` 全文件清零（→ `milk`）；`bought six` 全文件清零；材料中的 `sore` 已换成 `aches`；材料中的 `lamp` 两处依据全文件清零。
- **反向复查（题干/选项里是否还留着别处同源生词）**：已对 B-04/B-05/B-07 六个问句与全部 24 个选项逐词扫过，除上述 `sore` 外未发现第二个超纲词或与材料脱节的旧词；B-07 选项 D（第 206 行）中 `check`、`Friday` 均五级且为纯干扰项，不构成漏网。

---

## 四、R2 已记录但本轮未处理的轻微项（非本轮引入，列出备查）

脚本实测确认以下 5 条**原样保留**，均不阻塞归档：

| R2 编号 | 位置 | 现状（实测） |
|---|---|---|
| 轻微 #5 | B-04 第 105 行 | `Better to finish the **season** safely than to run with a bad leg.` ——「赛季」与校运会语境不符，仍在 |
| 轻微 #6 | B-05 第 133 行 | `Then we'll start early.` 与第 132 行 `We can start in the afternoon` 的「早」仍轻微冲突 |
| 轻微 #8 | B-05 Q2 D ＝ B-06 Q2 B | 选项跨题精确重复扫描命中 **1 组**：`A pair of gloves.` 仍重复 |
| 轻微 #10 | B-07 第 192 行 | `got a lighter schedule` 搭配生硬，仍在 |
| 轻微 #13 | 第 120–121 行 | **连续两个空行仍在**（偏移读取确认第 120、121 行均为空行；本次复核脚本首轮因空串假值漏检，已用定点复核补正） |

> 附注：R2 中等 #2 建议的第 206 行 D 项原本依赖第 188 行 `ask her to look at your eyes`，而该句在同一轮修复中被改写掉了——两项建议互相打架，修复方采纳后 D 项在材料中已完全无依据（见 DEFECT-3）。这不是修复方的失误，是 R2 建议之间的冲突，特此记录。

---

## 五、给下一轮的落地清单（最小改动）

1. **必改** B-04 第 107 行：`Why does Lucy's leg feel sore in the morning?` → `Why does Lucy's leg ache in the morning?`
2. **必改** B-07 第 188 行：`You need proper medical advice.` → `You need to see a doctor.`（或确认 `medical` 在课标五级内则注销本条）
3. 可选 B-07 第 204 行：换掉与 Q1 D 共用的「更亮台灯」干扰项（DEFECT-3）
4. 可选 B-05 第 130 行：`milk` → `oil` 以恢复和面原料的常识合理性（DEFECT-4）

以上 2 条必改均为单词级替换，**不触及任何答案、选项与话轮结构**，改完即可直接归档，无需再走一轮完整审核。

## 六、复核覆盖证明

- 已复核小问清单（6 / 6 = 3 段材料 × 2 小问）：B-04 Q1、B-04 Q2、B-05 Q1、B-05 Q2、B-07 Q1、B-07 Q2。
- 九条复核清单逐条均已作答，无空项。
- 全文件脚本扫描：话轮 Jaccard（95 轮）、跨材料话轮、开场白归一化、选项跨题重复、答案分布、答案溯源、关键字符串定位、连续空行 —— 均已实跑并记录数值。
- **6 / 6 已复核，无抽样。**