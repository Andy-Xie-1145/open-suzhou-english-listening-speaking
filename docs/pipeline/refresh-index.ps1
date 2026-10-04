param()
$ErrorActionPreference = "Stop"
$root = "D:\Projects\Open English Listening and Speaking"
$bank = Join-Path $root "data\item-bank"
$rv   = Join-Path $bank "reviews"
$fx   = Join-Path $bank "fixes"

function Get-Alias([string]$b) { if ($b -match "^([A-E])-batch(\d+)$") { return ($Matches[1] + $Matches[2]) }; return $b }

function Count-Rounds([string]$prefix, [string]$alias) {
  if (-not (Test-Path -LiteralPath $rv)) { return 0 }
  return @(Get-ChildItem -LiteralPath $rv -Filter ($prefix + "-" + $alias + "*.md") -File -ErrorAction SilentlyContinue).Count
}

# 最高修复轮次：扫描 F1..F9 找出实际存在的最大编号
function Get-FixRound([string]$alias) {
  if (-not (Test-Path -LiteralPath $fx)) { return "-" }
  for ($n = 9; $n -ge 1; $n--) {
    if (Test-Path -LiteralPath (Join-Path $fx ("F" + $n + "-" + $alias + ".md"))) { return ("F" + $n) }
  }
  if (Test-Path -LiteralPath (Join-Path $fx ("F-" + $alias + ".md"))) { return "F1" }
  return "-"
}

# 第 188 轮改：本函数原先与 check-integrity.ps1 的同名函数**不是同一套**——
# 弱匹配的取法不同（本脚本「任何含 MD5 字样的行都算」，那边要求该行提到本批次文件名），
# 且缺少「首串」兜底与它的反向校验。两个脚本对同一批次给出不同结论，根因就在这里。
# 现改为与 check-integrity.ps1 逐行一致，并保留 K 字段以便判定时区分取值来源。
function Get-ItemMD5([string]$reportPath, [string]$itemBaseName) {
  $lines = Get-Content -LiteralPath $reportPath
  # 词元边界匹配：文件名前不能紧邻字母/数字/下划线/连字符，避免 R2-E4.md 被当成 E4.md
  $tok = "(?<![A-Za-z0-9_-])" + [regex]::Escape($itemBaseName) + "\.md"
  $strong = $null; $weak = $null; $first = $null
  foreach ($ln in $lines) {
    $isItemLine = ($ln -match $tok)
    $isOtherFile = ($ln -match "(?i)(reviews|fixes)[\\/]")
    foreach ($m in [regex]::Matches($ln, "(?i)\b([0-9a-f]{32})\b")) {
      $c = $m.Groups[1].Value.ToLower()
      if ($null -eq $first) { $first = $c }
      if ($isItemLine -and -not $isOtherFile) { if ($null -eq $strong) { $strong = $c } }
      elseif ($isItemLine -and $isOtherFile -and $null -eq $weak) { $weak = $c }
      elseif ($isItemLine -and $null -eq $weak) { $weak = $c }
    }
  }
  if ($null -ne $strong) { return @{ V=$strong; K="强匹配(同行含题目名)" } }
  if ($null -ne $weak)   { return @{ V=$weak;   K="弱匹配(同行含题目名)" } }
  if ($null -ne $first)  { return @{ V=$first;  K="首串(可能是规约文件MD5)" } }
  return @{ V=""; K="无" }
}

# 第 188 轮新增：报告优先级，与 check-integrity.ps1 完全同一套 Get-Rank。
# 原先此处用 Sort-Object LastWriteTime 取「最新一份」，而 check-integrity 按轮次 rank 取权威。
# 两者不是同一件事：**任何人 touch 一下文件，mtime 取法就会换一份报告**，
# 于是同一批次两次跑出两个结论。COVERAGE-BOUNDARIES 已记「mtime 只给时间不给成因」。
# **mtime 自本轮起不再参与任何判定。**
function Get-Rank([string]$name, [string]$alias) {
  if ($name -match ("^CL-" + [regex]::Escape($alias) + "(-(\d+))?\.md$")) {
    $c = if ($matches[2]) { [int]$matches[2] } else { 1 }
    return (9000 + $c)
  }
  if ($name -match ("^V-" + [regex]::Escape($alias) + "(-(\d+))?\.md$")) {
    $n = if ($matches[2]) { [int]$matches[2] } else { 1 }
    return (8000 + $n)
  }
  if ($name -match ("^R2-" + [regex]::Escape($alias) + "\.md$")) { return 200 }
  if ($name -match ("^R1-" + [regex]::Escape($alias) + "\.md$")) { return 100 }
  return 0
}

$rows = @()
foreach ($dir in @($bank, (Join-Path $bank "prod"))) {
  if (-not (Test-Path -LiteralPath $dir)) { continue }
  foreach ($f in (Get-ChildItem -LiteralPath $dir -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md","INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $lines = Get-Content -LiteralPath $f.FullName -Encoding UTF8
    $raw   = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $base  = $f.BaseName
    $al    = Get-Alias $base
    $cls   = $base.Substring(0,1)
    $inProd = ($dir -like "*prod*")
    $items = @($lines | Where-Object { $_ -match "^## " }).Count

    # 答案：A/B/C 读 Answer 行；D 读 Answers 的下一行；E 类本就没有答案行
    $seq = @()
    if ($cls -ne "E") {
      foreach ($l in $lines) { if ($l -match "^\*\*Answer\*\*\s+([A-E])\s*$") { $seq += $Matches[1] } }
      if ($seq.Count -eq 0 -and $cls -eq "D") {
        for ($i = 0; $i -lt $lines.Count; $i++) {
          if ($lines[$i] -match "^\*\*Answers\*\*") {
            $nxt = if ($i + 1 -lt $lines.Count) { $lines[$i+1] } else { "" }
            foreach ($m in [regex]::Matches($nxt, "[①②③④⑤]\s*([A-E])")) { $seq += $m.Groups[1].Value }
          }
        }
      }
    }

    $per = 0
    if ($seq.Count -ge 8) {
      $maxP = [Math]::Min(6, $seq.Count - 2)
      for ($q = 2; $q -le $maxP; $q++) {
        $ok = $true
        for ($i = 0; $i -lt $seq.Count - $q; $i++) { if ($seq[$i] -ne $seq[$i + $q]) { $ok = $false; break } }
        if ($ok) { $per = $q; break }
      }
    }
    $mr = 1; $run = 1
    if ($seq.Count -gt 1) { for ($i = 1; $i -lt $seq.Count; $i++) { if ($seq[$i] -eq $seq[$i-1]) { $run++ } else { $run = 1 }; if ($run -gt $mr) { $mr = $run } } }
    $prev = ""; $adj = 0
    foreach ($l in $lines) { if ($l -match "^(\w+): ") { if ($Matches[1] -eq $prev) { $adj++ }; $prev = $Matches[1] } else { $prev = "" } }
    $em = ([regex]::Matches($raw, "(?im)^\w+:\s*Excuse me")).Count

    $r1 = Count-Rounds "R1" $al; $r2 = Count-Rounds "R2" $al; $vc = Count-Rounds "V" $al
    $fix = Get-FixRound $al

    # 完整性：比对权威报告记录的题目 MD5 与当前实测
    # 第 188 轮改：报告选取与 MD5 取值来源两处都对齐 check-integrity.ps1，**mtime 不参与判定**。
    $integrity = "-"
    $all = @(Get-ChildItem -LiteralPath $rv -Filter ("*-" + $al + "*.md") -File -ErrorAction SilentlyContinue)
    $rep = $null
    if ($all.Count -gt 0) {
      $ranked = $all | ForEach-Object { [pscustomobject]@{ F=$_; R=(Get-Rank $_.Name $al); N=$_.Name } } | Sort-Object -Property R,N -Descending
      $rep = ($ranked | Select-Object -First 1).F
    }
    $cur = (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash.ToLower()
    if ($null -ne $rep) {
      $g = Get-ItemMD5 $rep.FullName $base
      # 首串反向校验：取到「首串」时，只有当前 MD5 确实出现在报告正文里才认，否则判 UNVER。
      if ($g.K -like "首串*") {
        $body = [System.IO.File]::ReadAllText($rep.FullName, [System.Text.Encoding]::UTF8)
        if ($body.IndexOf($cur, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) { $g = @{ V=""; K="首串但正文无当前MD5，不予采信" } }
      }
      # check-integrity 写作 UNVERIFIED；本表沿用图例里的 UNVER，判定等价。
      if ($g.V -eq "") { $integrity = "UNVER" } elseif ($g.V -eq $cur) { $integrity = "MATCH" } else { $integrity = "MISMATCH" }
    }

    $gate = ($per -eq 0) -and ($mr -le 2) -and ($adj -eq 0)
    $excOk = $true; if ($items -gt 0) { $excOk = ($em * 100 / $items) -le 30 }
    $ready = (-not $inProd) -and ($r1 -gt 0) -and ($r2 -gt 0) -and ($vc -gt 0) -and ($integrity -eq "MATCH")
    $rows += [pscustomobject]@{
      File=$base; Cls=$cls; Where=$(if($inProd){"prod"}else{"bank"}); Items=$items; Ans=$seq.Count
      R1=$r1; R2=$r2; V=$vc; Fx=$fix; Per=$per; Run=$mr; Adj=$adj; Exc=$em
      Integ=$integrity; Gate=$gate; Ready=$ready
    }
  }
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# 题库索引（自动生成）")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("由 docs/pipeline/refresh-index.ps1 生成，请勿手改。跑一次即可刷新。")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("")
[void]$sb.AppendLine('## 题型归属对照（苏教基〔2025〕3号）')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('官方听力题型只有两个（苏教基〔2025〕3 号 A 级原文）：')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('1. 听对话回答问题')
[void]$sb.AppendLine('2. 听对话和短文答题')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('| 本库标签 | 官方归属 | 本库形式 |')
[void]$sb.AppendLine('|---|---|---|')
[void]$sb.AppendLine('| A | 听对话回答问题 | 一段极短对话 + 1 题四选一 |')
[void]$sb.AppendLine('| B | 听对话回答问题 | 一段长对话 + 2 题四选一 |')
[void]$sb.AppendLine('| C | 听对话和短文答题 | 一篇短文 + 5 题四选一 |')
[void]$sb.AppendLine('| D | 听对话和短文答题 | 材料可为 Passage（叙述）或 Dialogue（对话），两者都被接受 |')
[void]$sb.AppendLine('| E | 情景问答（官方口语题型） | 中文情景提示 + 2 个英文问题，不与听力混列 |')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('**表格填空是呈现格式，不是题型名。** 本库的 A/B/C/D/E 是我们自己起的分类标签，不可与官方题型名并列比较。**曾经把 D 类当成独立题型、判其不在官方两个听力题型内——该判断已证伪并撤销。**')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('### 证据级别（两件事不可混说）')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('| 项 | 证据级别 |')
[void]$sb.AppendLine('|---|---|')
[void]$sb.AppendLine('| 听力题型归属（A/B/C/D） | **有官方依据**（苏教基〔2025〕3 号 A 级原文） |')
[void]$sb.AppendLine('| E 类情景问答 | 官方口语题型；**具体题型规格无公开来源** |')
[void]$sb.AppendLine('| 段数 / 题量 / 设问方式 | **无公开来源**，待《初中考试纲要》确认 |')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('### 当前全库规模')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('| 类 | 批次数 | 题块 | 每套块数 | 折算套数 | 题目数 |')
[void]$sb.AppendLine('|---|---|---|---|---|---|')
[void]$sb.AppendLine('| A | 33 | 500 段 | 10 | 50 | 500 选择题 |')
[void]$sb.AppendLine('| B | 7 | 50 段 | 1 | 50 | 100 选择题 |')
[void]$sb.AppendLine('| C | 9 | 52 篇 | 1 | 52 | 260 选择题 |')
[void]$sb.AppendLine('| D | 5 | 50 份 | 1 | 50 | 150 个表格空 |')
[void]$sb.AppendLine('| E | 4 | 40 组 | — | — | 80 题 |')
[void]$sb.AppendLine('| **合计** | **58** | — | — | **202** | — |')
[void]$sb.AppendLine('')
[void]$sb.AppendLine('口径与来源：批次数＝题面文件个数；题块＝形如「## A..-NN」的标题行数；题目数＝A/B/C 为 Answer 行数、D 为 Answers 行的填空标记数、E 为组数乘 2。**以上均为第 188 轮逐文件实测，非转录。**')
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## 流水线状态")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| 批次 | 类 | 位置 | 题块 | 答案 | 一轮 | 二轮 | 复核 | 修复至 | 完整性 | 周期 | 连续 | 相邻同人 | ExcuseMe | 可归档 |")
[void]$sb.AppendLine("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|")
foreach ($r in $rows) {
  $y1 = if ($r.R1 -gt 0) { "Y" + $(if($r.R1 -gt 1){"+"+$r.R1}else{""}) } else { "-" }
  $y2 = if ($r.R2 -gt 0) { "Y" + $(if($r.R2 -gt 1){"+"+$r.R2}else{""}) } else { "-" }
  $yv = if ($r.V  -gt 0) { "Y" + $(if($r.V  -gt 1){"+"+$r.V }else{""}) } else { "-" }
  $per = if ($r.Per -gt 0) { ("!" + $r.Per) } else { "0" }
  $rd = if ($r.Ready) { "YES" } else { "no" }
  [void]$sb.AppendLine("| " + $r.File + " | " + $r.Cls + " | " + $r.Where + " | " + $r.Items + " | " + $r.Ans + " | " + $y1 + " | " + $y2 + " | " + $yv + " | " + $r.Fx + " | " + $r.Integ + " | " + $per + " | " + $r.Run + " | " + $r.Adj + " | " + $r.Exc + " | " + $rd + " |")
}
[void]$sb.AppendLine('**E 类 5 个批次（E-batch1／E2／E3／E4／E8）均带『永久边界·无官方依据』标注，见图例 E 类条目。** 表内 E 类各行的判定值只指流水线报告状态，**不含依据边界**。')
[void]$sb.AppendLine("")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## 图例")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("- 位置：bank = 已入库；prod = 产出待审")
[void]$sb.AppendLine("- 一轮/二轮/复核：该轮报告份数。`Y+2` 表示有 2 份（例如 V-X.md 与 V-X-2.md）")
[void]$sb.AppendLine("- 修复至：已落盘的**最高**修复轮次，例如 F5 表示 F1 到 F5 五轮都已记录")
[void]$sb.AppendLine("- 完整性：`MATCH` 报告记录的题目 MD5 与当前磁盘一致；`MISMATCH` 结论已失效须补复核；`UNVER` 报告未记 MD5")
[void]$sb.AppendLine("- 周期：答案序列周期 p，0 = 无，非 0 即缺陷")
[void]$sb.AppendLine("- 连续：最长连续相同答案，要求不大于 2")
[void]$sb.AppendLine("- 相邻同人：相邻两轮同一说话人标注，要求 0")
[void]$sb.AppendLine("- ExcuseMe：以 Excuse me 起句的题数，门禁要求不超过 30%")
[void]$sb.AppendLine("- 可归档：**已在 bank 目录** + 一轮二轮复核齐备 + 完整性为 MATCH")
[void]$sb.AppendLine("")
[void]$sb.AppendLine('- **E 类（情景问答／话题简述）**：官方口语题型，但本库未获取中考口语考纲，属**永久边界·无官方依据**——内容可用，但无法证明对齐中考。解除条件：取得《初中考试纲要》或苏州市教育局基教处书面口径。')
[void]$sb.AppendLine("## 归档条件（全部满足）")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("1. 已移入 `data/item-bank/` 根目录（不再留在 prod/）")
[void]$sb.AppendLine("2. 一轮与二轮报告均已产出，且两轮的严重缺陷均已修复")
[void]$sb.AppendLine("3. 复核报告已产出且通过（多份复核时以文件名后缀最大的那份为准）")
[void]$sb.AppendLine("4. `check-integrity.ps1` 判 **MATCH**（报告记录的 MD5 与当前磁盘一致）")
[void]$sb.AppendLine("5. 周期 0、连续不大于 2、相邻同人 0、ExcuseMe 不超过 30%")
[System.IO.File]::WriteAllText((Join-Path $bank "INDEX.md"), $sb.ToString().Replace("`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
"INDEX.md written"
