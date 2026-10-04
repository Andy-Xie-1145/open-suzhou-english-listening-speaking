# 说话人标签与选项复用闸门
#
# 起因：**全部为 R1 首审的实测结果，不是推断**
#   1) A21-04  同一个人先称 Mr. Xia 后称 Ms. Xia        -> TITLE-CONFLICT
#   2) A24-11  对话只有 Boy 与 Mr. Xu，第三轮凭空出现 Girl -> SPEAKER-COUNT
#   3) A26-11 学生标签在同一段内由 Girl 换成 Boy        -> STUDENT-SWITCH
#   4) A27 6 处（15 题中 40%）、A28 同样 6 处（40%），连续两批同型同比例
#   5) A29-13 / A29-15 各有一个话轮**完全没有说话人标注**  -> MISSING-LABEL
#   6) A15-10  Mr. Qi / Girl / Boy，学生标签在中途才出现    -> SPEAKER-COUNT
#
# 这五类 100% 可机械检出，不该占用人工审核注意力，也不该依赖审核员临场发明检查。
#
# 检查项（按类别的适用范围不同，已逐条写明理由）：
#   (1) MISSING-LABEL   对话内出现非说话人标注行。**适用于全部类别**
#   (2) SPEAKER-COUNT   每段对话的说话人标签集合是否恰好为 2。**只适用于 A 类**
#                         ——B/C 类允许多人对话，D 类的专项要求本身就是 >=4 个说话人
#                         （见 D7 的说话人标签专项），对它们套用「恰好 2 个」会产生系统性误报
#   (3) STUDENT-SWITCH  第二个学生标签是否**出现在非学生说话人之后**。**适用于全部类别**
#                         ——判别线：两个学生从第一轮起交替说话是正常的同伴对话；
#                           第二个学生标签要等教师说完才出现，才是标签被换掉
#   (4) TITLE-CONFLICT  同一姓氏在同一段对话内配了两个不同称谓。**适用于全部类别**
#   (5) OPTION-REUSED   同一文件内两个不同题号共用完全相同的选项文本（>=3 个词）。
#                         **仅供参考，不影响退出码**：价格、时刻这类选项天然会跨题重复，
#                         逐条报出会有大量良性命中；但它能提示「选项文本被整条搬运」，
#                         而搬运时指代与单复数常常没跟着改
#
# 退出码：0 = PASS，1 = FAIL。
# 本脚本只报「哪儿错了」，**不做定级**；定级由审核员按 REVIEW-RUBRIC 判。

# 第 113 轮补：接受单文件参数。
# 起因是 writer-a 指出——本脚本**原先没有 param() 块**，全文直接从 foreach 扫全库、
# 从不读 $args，于是 `-File ... data/item-bank/prod/Axx.md` 的路径参数被**静默丢弃**。
# 后果：「闸门对该文件退出码 0」这条验收标准**永远无法判定**——
# 即使某批次全部修好，只要别处还有缺陷，退出码就仍是 1。
# **这与 shortcut-audit「答案与选项错位一题」、encoding-check「末尾换行被过滤掉」是同一类错误：**
# 闸门悄悄忽略了自己的输入，然后报告一个看起来正常的结论。
#
# ⚠️ param() 必须是脚本的**第一条语句**（注释行不算），否则 PowerShell 会把它当 cmdlet 调用。
param([string]$File)

$ErrorActionPreference = "Stop"
$bank = "D:\Projects\Open English Listening and Speaking\data\item-bank"

$only = $null
if ($File) {
  $cand = @()
  foreach ($c0 in @($File, (Join-Path $bank $File), (Join-Path (Join-Path $bank "prod") $File))) {
    if (Test-Path -LiteralPath $c0) { $cand += (Resolve-Path -LiteralPath $c0).Path }
  }
  if ($cand.Count -eq 0) {
    Write-Output ("找不到文件：" + $File)
    Write-Output "用法：speaker-gate.ps1 [题目文件路径，可省略以扫全库]"
    exit 2
  }
  $only = $cand[0]
}

# 注意：说话人标签后可以跟引号或数字（见 B2-04 的 "My school life."、A10-02 的 380 students），
# 因此不能要求冒号后必须是字母。早期版本那样写会把这两种正常行误报成「缺标注」。
$spkPattern = "^[A-Z][A-Za-z.]*( [A-Z][A-Za-z.]*)?:"
$studentNames = @("Boy", "Girl", "Mum", "Mom", "Dad", "Grandma", "Grandpa", "Student", "Pupil")
$optPattern = "^- [A-E]\. "

$bad = @()
$info = @()
$scanned = 0
$aCount = 0

function Get-Blocks([string]$path) {
  $out = @()
  $cur = $null
  foreach ($l in (Get-Content -LiteralPath $path -Encoding UTF8)) {
    if ($l -match "^## ") { $cur = [pscustomobject]@{ Id = $l.Trim(); Lines = @() }; $out += $cur; continue }
    if ($cur -ne $null) { $cur.Lines += $l }
  }
  return $out
}

# 第 113 轮补：按 $only 过滤（param 块在文件顶部，$File 已在脚本开头解析完毕）。
foreach ($d in @($bank, (Join-Path $bank "prod"))) {
  if (-not (Test-Path -LiteralPath $d)) { continue }
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($only -and $f.FullName -ne $only) { continue }
    if ($f.Name -in @("REVIEW-RUBRIC.md", "INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    if ($f.Name.StartsWith(".")) { continue }
    $scanned++
    $fileTag = $d.Replace($bank, "") + "/" + $f.Name
    $isA = $f.BaseName -match "^A"
    if ($isA) { $aCount++ }

    $optOwners = @{}

    foreach ($blk in (Get-Blocks $f.FullName)) {
      $inMat = $false
      $order = @()      # 按首次出现顺序的说话人
      $stuIdx = @()     # **互不重复的**学生标签各自在 order 中的下标
      $titleOf = @{}

      foreach ($l in $blk.Lines) {
        if ($l -match "^\*\*Dialogue\*\*") { $inMat = $true; continue }
        if ($l -match "^\*\*") { $inMat = $false; continue }

        if ($inMat) {
          if ($l.Trim() -eq "") { continue }
          if ($l -match $spkPattern) {
            $who = ($l -replace ":.*$", "").Trim()
            $isNew = ($order -notcontains $who)
            if ($isNew) { $order += $who }
            # 同一个学生标签只在**首次出现**时记一次下标；
            # 否则一个说三句话的 Girl 会被记成三个下标，把「两个学生」误报成三个
            if ($isNew -and ($studentNames -contains $who)) { $stuIdx += ($order.Count - 1) }
            $parts = $who -split " "
            if ($parts.Count -ge 2) {
              $sur = $parts[-1]
              if ($titleOf.ContainsKey($sur) -and $titleOf[$sur] -ne $parts[0]) {
                $bad += [pscustomobject]@{
                  File = $fileTag; Item = $blk.Id; Kind = "TITLE-CONFLICT"
                  Detail = ("同一姓氏 " + $sur + " 配了两个称谓：" + $titleOf[$sur] + " 与 " + $parts[0])
                }
              }
              $titleOf[$sur] = $parts[0]
            }
          } else {
            $bad += [pscustomobject]@{
              File = $fileTag; Item = $blk.Id; Kind = "MISSING-LABEL"
              Detail = ("对话内有一行没有说话人标注：" + $l.Trim())
            }
          }
          continue
        }

        if ($l -match $optPattern) {
          $text = ($l -replace $optPattern, "").Trim()
          $key = $text.ToLower()
          if (-not $optOwners.ContainsKey($key)) { $optOwners[$key] = @() }
          if ($optOwners[$key] -notcontains $blk.Id) { $optOwners[$key] += $blk.Id }
        }
      }

      if ($order.Count -gt 0) {
        $uniq = @($order | Select-Object -Unique)
        if ($isA -and $uniq.Count -ne 2) {
          $bad += [pscustomobject]@{
            File = $fileTag; Item = $blk.Id; Kind = "SPEAKER-COUNT"
            Detail = ("A 类对话的说话人标签 " + $uniq.Count + " 个：" + ($uniq -join " / "))
          }
        }
        if ($stuIdx.Count -ge 2) {
          # 第二个学生标签是否出现在某个非学生说话人之后
          $firstStu = $stuIdx[0]
          $secondStu = $stuIdx[1]
          $hasNonStuBefore = $false
          for ($i = 0; $i -lt $secondStu; $i++) {
            if ($studentNames -notcontains $order[$i]) { $hasNonStuBefore = $true }
          }
          if ($hasNonStuBefore) {
            $bad += [pscustomobject]@{
              File = $fileTag; Item = $blk.Id; Kind = "STUDENT-SWITCH"
              Detail = ("学生标签 " + $order[$stuIdx[0]] + " / " + $order[$stuIdx[1]] + "：第二个学生标签出现在非学生说话人之后（说话人顺序：" + ($order -join " -> ") + "）")
            }
          }
        }
      }
    }

    foreach ($key in $optOwners.Keys) {
      $owners = $optOwners[$key]
      if ($owners.Count -ge 2 -and ($key -split "\s+").Count -ge 3) {
        $info += [pscustomobject]@{
          File = $fileTag; Item = ($owners -join " & ")
          Detail = ("同一文件内 " + $owners.Count + " 道题共用同一条选项文本：" + $key)
        }
      }
    }
  }
}

"SPEAKER/OPTION GATE: 扫描 " + $scanned + " 份题目文件（A 类 " + $aCount + " 份；SPEAKER-COUNT 只对 A 类生效）"
"检查项：MISSING-LABEL / SPEAKER-COUNT(A) / STUDENT-SWITCH / TITLE-CONFLICT / OPTION-REUSED(仅供参考)"

if ($bad.Count -eq 0) {
  "PASS: no speaker-label defect"
  if ($info.Count -gt 0) {
    ""
    "选项文本复用提示（不影响判定）：" + $info.Count + " 处"
    foreach ($r in ($info | Sort-Object File, Item)) { "    {0,-22} {1}" -f $r.File, $r.Detail }
"OPTION-REUSED 的命中只作人工复核提示，不构成缺陷判定；同一文件的不同题共用选项文本、但各自独立判分，属正常命题手法。"
"（已裁定实例：B7-01 Q2 与 B7-08 Q2 共用 At ten past three. 与 At half past three.，判非缺陷，见 COVERAGE-BOUNDARIES.md。）"
  }
  exit 0
}

$order2 = @("MISSING-LABEL", "SPEAKER-COUNT", "STUDENT-SWITCH", "TITLE-CONFLICT")
""
"SPEAKER DEFECTS: " + $bad.Count
foreach ($k in $order2) {
  $rows = @($bad | Where-Object { $_.Kind -eq $k })
  if ($rows.Count -eq 0) { continue }
  "  [" + $k + "] " + $rows.Count + " 条"
  foreach ($r in ($rows | Sort-Object File, Item)) {
    "    {0,-22} {1,-46} {2}" -f $r.File, $r.Item, $r.Detail
  }
}

if ($info.Count -gt 0) {
  ""
  "选项文本复用提示（不影响判定）：" + $info.Count + " 处"
  foreach ($r in ($info | Sort-Object File, Item)) { "    {0,-22} {1}" -f $r.File, $r.Detail }
"OPTION-REUSED 的命中只作人工复核提示，不构成缺陷判定；同一文件的不同题共用选项文本、但各自独立判分，属正常命题手法。"
"（已裁定实例：B7-01 Q2 与 B7-08 Q2 共用 At ten past three. 与 At half past three.，判非缺陷，见 COVERAGE-BOUNDARIES.md。）"
}

""
"以上只报「哪儿错了」，不做定级；定级由审核员按 REVIEW-RUBRIC 判。"
exit 1
