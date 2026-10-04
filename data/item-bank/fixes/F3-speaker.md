# F3-speaker：修 speaker-gate 判出的说话人标签缺陷（A15-10 与 A32 六处）

> 授权来源：调度方消息 team-message-0965f4d6-c6c2-4b64-85b6-e03d1ddd6804a
> 改动范围：**只改说话人标签词**。材料正文、选项、Answer 行、题号标题、汇总行一律未动。
> 依据：`docs/pipeline/speaker-gate.ps1` 单文件判定的原始输出。

## 一、结论

**两处文件均已修复，speaker-gate 对两文件各自退出码 0。**
授权改动共 7 处标签词（A15.md 1 处、A32.md 6 处），全部经语义核对确认是**同一人的第一人称延续**，因此改标签是正确处置；**没有任何一处是真写了第三个人**，故未出现「改标签掩盖真实缺陷」的情形，也无需并轮或改写材料。
「除授权改动外零字节改动」已用反向替换后 MD5 还原证明。

- 结论：通过，可进入首审/归档环节。
- 缺陷计数：严重 0 条｜中等 0 条｜轻微 0 条（本批为闸门缺陷修复，非审核定级）。

## 二、缺陷清单与处置

### 2.1 A15-10 班会讲故事讲五分钟（历史遗留）

闸门原始报出 2 条：
```
SPEAKER DEFECTS: 2
  [SPEAKER-COUNT] 1 条
    \prod/A15.md  ## A15-10 班会讲故事讲五分钟  A 类对话的说话人标签 3 个：Mr. Qi / Girl / Boy
  [STUDENT-SWITCH] 1 条
    \prod/A15.md  ## A15-10 班会讲故事讲五分钟  学生标签 Girl / Boy：第二个学生标签出现在非学生说话人之后（说话人顺序：Mr. Qi -> Girl -> Boy）
```

**语义核对**：整段是「班主任 Mr. Qi 与一个学生」两方对话。
- Girl 首轮说 `Can we talk for ten minutes?`——用 `we` 指自己的小组；
- 末轮原标 `Boy:` 说 `Half an hour for our group, then?`——用 `our group` 指**同一个小组**，是对上一轮同一诉求的追问，不是另一个人的发言。
- 题目问句为 `How long can the girl's group talk about its story?`，指向学生一侧的「组」，与合并为 Girl 一致。

**判定**：同一人的第一人称延续 → 改标签。
```
- Boy: Half an hour for our group, then?
+ Girl: Half an hour for our group, then?
```

### 2.2 A32 六处

闸门原始报出 12 条（6 条 SPEAKER-COUNT + 6 条 STUDENT-SWITCH），全部指同一根因：第三个话轮把 Boy 写成 Girl，或反向。逐条语义核对：

| 题号 | 行号 | 改动前 | 改动后 | 语义核对结论 |
|---|---|---|---|---|
| A32-08 早上设几个闹钟 | 116 | `Girl: Mine is one alarm at six.` | `Boy: Mine is one alarm at six.` | 首轮 Boy 已说 `I set my alarm for six, but I get up at six twenty`；末轮 `Mine` 是第一人称自嘲，Ms. Qin 回 `Then you are lucky` 即在应答这位男生。同一人的第一人称延续。 |
| A32-10 在展馆看画的时长 | 144 | `Girl: I want to see every one.` | `Boy: I want to see every one.` | 首轮由 Boy 提问观展时长，该轮是对自己观看范围的补充说明，第一人称。同一人。 |
| A32-11 在超市买米按袋 | 160 | `Girl: My parents are with us for three weeks.` | `Boy: My parents are with us for three weeks.` | 首轮 Boy 问 `how much rice should I buy for two people`，该轮补充自己家多住两周父母，正是他要多买的原因。同一人的第一人称延续。 |
| A32-13 遥控器电池怎么试 | 190 | `Girl: Can I test it now?` | `Boy: Can I test it now?` | 首轮 Boy 问电池寿命，该轮问自己能否当场试，第一人称。同一人。 |
| A32-14 给盆栽浇多少水 | 206 | `Boy: How much for one pot?` | `Girl: How much for one pot?` | 首轮由 Girl 问自来水浇花，该轮是她对自己那一盆的用量追问，第一人称。同一人。 |
| A32-15 把旧课本送给低年级 | 220 | `Girl: My little brother is in Grade Six.` | `Boy: My little brother is in Grade Six.` | 首轮 Boy 问毕业书能否送出，该轮补充自己有个六年级弟弟，与 Ms. Cui 随后 `Nobody keeps a book they cannot read` 的对象一致。同一人的第一人称延续。 |

**判定**：六处全部为同一人的第一人称延续 → 改标签，无需并轮或改材料。
**另核**：七处改动的题干均不引用被改标签，A15-10 题干用的是 `the girl's group`、A32 四处题干只提到 `Ms. Qin`/`Ms. Qi`/`Mr. Fu`/`Ms. Cui` 或不提说话人，故题干与答案不受影响。

## 三、零字节改动证明（反向替换还原 MD5）

原始基线：
```
BEFORE data/item-bank/prod/A15.md MD5=EDB06B8185AD3503AC05FE3FEE751B2D bytes=7019
BEFORE data/item-bank/prod/A32.md MD5=4363BC25C581FCCAEF690CA061A896E6 bytes=7063
```
改动后：
```
AFTER A15 MD5=719B4043FC4004357510EE3278D7A612 bytes=7020
AFTER A32 MD5=EB28DF0ACD65DA0BCF8E06B4F95DA6F9 bytes=7059
```
把改动后的内容在内存中做**反向替换**（不做任何其他改动，不写盘），重算 MD5：
```
REVERSED A15 MD5=edb06b8185ad3503ac05fe3fee751b2d  match_original=True
REVERSED A32 MD5=4363bc25c581fcceaef690ca061a896e6  match_original=True
```
两个 MD5 与基线**逐位相同**，即两份文件除那 7 个标签词外无任何字节变动。
字节差自洽：A15 `Boy`→`Girl` +1 字节（7019→7020）；A32 五处 `Girl`→`Boy`（-5）加一处 `Boy`→`Girl`（+1），净 -4（7063→7059）。
被替换的 7 个整行字符串在各自文件中出现次数均为 1，反向替换无歧义。

## 四、四道闸门原始输出

### 4.1 speaker-gate（修复前，A15）
```
SPEAKER DEFECTS: 2
  [SPEAKER-COUNT] 1 条
    \prod/A15.md           ## A15-10 班会讲故事讲五分钟                            A 类对话的说话人标签 3 个：Mr. Qi / Girl / Boy
  [STUDENT-SWITCH] 1 条
    \prod/A15.md           ## A15-10 班会讲故事讲五分钟                            学生标签 Girl / Boy：第二个学生标签出现在非学生说话人之后（说话人顺序：Mr. Qi -> Girl -> Boy）
EXITCODE=1
```

### 4.2 speaker-gate（修复前，A32）
```
SPEAKER DEFECTS: 12
  [SPEAKER-COUNT] 6 条
    \prod/A32.md           ## A32-08 早上设几个闹钟                              A 类对话的说话人标签 3 个：Boy / Ms. Qin / Girl
    \prod/A32.md           ## A32-10 在展馆看画的时长                             A 类对话的说话人标签 3 个：Boy / Ms. Qin / Girl
    \prod/A32.md           ## A32-11 在超市买米按袋                              A 类对话的说话人标签 3 个：Boy / Ms. Qi / Girl
    \prod/A32.md           ## A32-13 遥控器电池怎么试                             A 类对话的说话人标签 3 个：Boy / Mr. Fu / Girl
    \prod/A32.md           ## A32-14 给盆栽浇多少水                              A 类对话的说话人标签 3 个：Girl / Ms. Pei / Boy
    \prod/A32.md           ## A32-15 把旧课本送给低年级                            A 类对话的说话人标签 3 个：Boy / Ms. Cui / Girl
  [STUDENT-SWITCH] 6 条
    \prod/A32.md           ## A32-08 早上设几个闹钟                              学生标签 Boy / Girl：第二个学生标签出现在非学生说话人之后（说话人顺序：Boy -> Ms. Qin -> Girl）
    \prod/A32.md           ## A32-10 在展馆看画的时长                             学生标签 Boy / Girl：第二个学生标签出现在非学生说话人之后（说话人顺序：Boy -> Ms. Qin -> Girl）
    \prod/A32.md           ## A32-11 在超市买米按袋                              学生标签 Boy / Girl：第二个学生标签出现在非学生说话人之后（说话人顺序：Boy -> Ms. Qi -> Girl）
    \prod/A32.md           ## A32-13 遥控器电池怎么试                             学生标签 Boy / Girl：第二个学生标签出现在非学生说话人之后（说话人顺序：Boy -> Mr. Fu -> Girl）
    \prod/A32.md           ## A32-14 给盆栽浇多少水                              学生标签 Girl / Boy：第二个学生标签出现在非学生说话人之后（说话人顺序：Girl -> Ms. Pei -> Boy）
    \prod/A32.md           ## A32-15 把旧课本送给低年级                            学生标签 Boy / Girl：第二个学生标签出现在非学生说话人之后（说话人顺序：Boy -> Ms. Cui -> Girl）
EXITCODE=1
```

### 4.3 speaker-gate（修复后，验收）
```
SPEAKER/OPTION GATE: 扫描 1 份题目文件（A 类 1 份；SPEAKER-COUNT 只对 A 类生效）
检查项：MISSING-LABEL / SPEAKER-COUNT(A) / STUDENT-SWITCH / TITLE-CONFLICT / OPTION-REUSED(仅供参考)
PASS: no speaker-label defect

选项文本复用提示（不影响判定）：3 处
    \prod/A15.md           同一文件内 2 道题共用同一条选项文本：half an hour.
    \prod/A15.md           同一文件内 2 道题共用同一条选项文本：at six o'clock.
    \prod/A15.md           同一文件内 2 道题共用同一条选项文本：at ten o'clock.
EXITCODE=0
```
（以上为 A15.md。选项文本复用属「仅供参考」项，不构成判定，按授权未改。）

```
SPEAKER/OPTION GATE: 扫描 1 份题目文件（A 类 1 份；SPEAKER-COUNT 只对 A 类生效）
检查项：MISSING-LABEL / SPEAKER-COUNT(A) / STUDENT-SWITCH / TITLE-CONFLICT / OPTION-REUSED(仅供参考)
PASS: no speaker-label defect
EXITCODE=0
```
（以上为 A32.md。）

### 4.4 wordcount-gate.ps1
```
PASS: no material block exceeds its limit
EXITCODE=0
```
七处被改材料逐份实测词数（上限 60，改标签不改词数，前后一致）：
A15-10 = 54｜A32-08 = 58｜A32-10 = 58｜A32-11 = 46｜A32-13 = 54｜A32-14 = 52｜A32-15 = 53。

### 4.5 encoding-check.ps1
```
扫描范围：
  在制题目：31 份
  审核报告：149 份
  修复记录：85 份
  流水线文档：12 份
  任务书：139 份
  调研：10 份
合计 426 份 md

PASS: no encoding or corruption defect
EXITCODE=0
```

### 4.6 topic-guard build
```
索引已更新：重编码 13 条，新增 0 条，总计 694 条 -> .topic-index.json
EXITCODE=0
```
（本次只改说话人标签词，A32 的 15 条材料文本随之变化，故被重编码；新增 0 条是因 A29–A32 已全部入库。）

## 五、逐条复核清单

| 题号 | 文件 | 原说话人序列 | 改后序列 | 严重 | 中等 | 轻微 |
|---|---|---|---|---|---|---|
| A15-10 | prod/A15.md | Mr. Qi → Girl → Mr. Qi → Boy → Mr. Qi | Mr. Qi → Girl → Mr. Qi → **Girl** → Mr. Qi | 无 | 无 | 无 |
| A32-08 | prod/A32.md | Boy → Ms. Qin → Girl | Boy → Ms. Qin → **Boy** | 无 | 无 | 无 |
| A32-10 | prod/A32.md | Boy → Ms. Qin → Girl | Boy → Ms. Qin → **Boy** | 无 | 无 | 无 |
| A32-11 | prod/A32.md | Boy → Ms. Qi → Girl | Boy → Ms. Qi → **Boy** | 无 | 无 | 无 |
| A32-13 | prod/A32.md | Boy → Mr. Fu → Girl | Boy → Mr. Fu → **Boy** | 无 | 无 | 无 |
| A32-14 | prod/A32.md | Girl → Ms. Pei → Boy | Girl → Ms. Pei → **Girl** | 无 | 无 | 无 |
| A32-15 | prod/A32.md | Boy → Ms. Cui → Girl | Boy → Ms. Cui → **Boy** | 无 | 无 | 无 |

已复核题号清单共 7 条，逐条判定，未抽样。

## 六、最终判定

**通过。** 两份文件的说话人标签缺陷已全部修复，speaker-gate 各自退出码 0，wordcount-gate 与 encoding-check 均 PASS，除授权的 7 个标签词外零字节改动。

> 附一条自查更正：上一轮我向调度方报的 A32 逐份词数里，A32-15 写的是 55，实为 **53**。原因是当时统计脚本在循环外漏了末段的收尾，A32-15 未被计入，本次已改用带收尾的脚本对 A29/A30/A31/A32 四批 60 份重测：A29 46–60、A30 42–60、A31 52–60、A32 46–60，超限 0 份；A29/A30/A31 的数字与上轮完全一致，仅 A32-15 一处需更正。
