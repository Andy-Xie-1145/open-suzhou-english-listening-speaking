# 题库最终验收（PIPELINE L-99：把「目标是否达成」变成一个可重复运行的检查）
#
# 逐项核对目标里的可判定条款：
#   1. 每一道题目至少经过两轮相互独立的审核
#   2. 所有严重缺陷已修复
#   3. 规模达标
# 任何一个 FAIL 都让退出码非零。
$ErrorActionPreference = "Stop"
$root = "D:\Projects\Open English Listening and Speaking\data\item-bank"
$rv   = Join-Path $root "reviews"
$fx   = Join-Path $root "fixes"

function Get-Alias([string]$b) { if ($b -match "^([A-E])-batch(\d+)$") { return ($Matches[1] + $Matches[2]) }; return $b }

$targets = @{ A=100; B=48; C=100; D=90; E=40 }
$fail = @()

Write-Output "## 一、规模达标"
Write-Output "类别 | 达标线 | 实有 | 批次 | 判定"
$tot=@{A=0;B=0;C=0;D=0;E=0}; $cnt=@{A=0;B=0;C=0;D=0;E=0}
foreach ($d in @($root, (Join-Path $root "prod"))) {
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md","INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $cls = $f.BaseName.Substring(0,1)
    if (-not $tot.ContainsKey($cls)) { continue }
    $lines = Get-Content -LiteralPath $f.FullName
    $ans = @($lines | Where-Object { $_ -match "^\*\*Answer\*\*\s+[A-E]\s*$" }).Count
    $dS = 0
    for ($i=0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -match "^\*\*Answers\*\*") {
        $n = if ($i+1 -lt $lines.Count) { $lines[$i+1] } else { "" }
        $dS += ([regex]::Matches($n, "[①②③④⑤]")).Count
      }
    }
    $h2 = @($lines | Where-Object { $_ -match "^## " }).Count
    if ($cls -eq "E") { $tot[$cls] += $h2 * 2 } else { $tot[$cls] += [Math]::Max($ans, $dS) }
    $cnt[$cls]++
  }
}
foreach ($k in @("A","B","C","D","E")) {
  $ok = $tot[$k] -ge $targets[$k]
  if (-not $ok) { $fail += ("规模：$k 类 " + $tot[$k] + " < 达标线 " + $targets[$k]) }
  Write-Output ("$k | " + $targets[$k] + " | " + $tot[$k] + " | " + $cnt[$k] + " | " + $(if ($ok) {"PASS"} else {"FAIL"}))
}
Write-Output ("合计 " + ($tot.Values | Measure-Object -Sum).Sum + " 题或空 / " + ($cnt.Values | Measure-Object -Sum).Sum + " 批次")
Write-Output ""

Write-Output "## 二、每批的审核轮次"
Write-Output "批次 | 位置 | 一轮 | 二轮 | 复核 | 销案 | 修复记录 | 轮次合计 | 判定"
$rows = @()
foreach ($d in @($root, (Join-Path $root "prod"))) {
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md","INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $al = Get-Alias $f.BaseName
    $r1 = @(Get-ChildItem -LiteralPath $rv -Filter ("R1-" + $al + "*.md") -File -ErrorAction SilentlyContinue)
    $r2 = @(Get-ChildItem -LiteralPath $rv -Filter ("R2-" + $al + "*.md") -File -ErrorAction SilentlyContinue)
    $vv = @(Get-ChildItem -LiteralPath $rv -Filter ("V-"  + $al + "*.md") -File -ErrorAction SilentlyContinue)
    $cl = @(Get-ChildItem -LiteralPath $rv -Filter ("CL-" + $al + ".md")  -File -ErrorAction SilentlyContinue)
    $fxn = @(Get-ChildItem -LiteralPath $fx -Filter ("F*-" + $al + ".md") -File -ErrorAction SilentlyContinue)
    $rounds = $r1.Count + $r2.Count + $vv.Count
    $where = if ($d -like "*prod*") { "prod" } else { "bank" }
    $rows += [pscustomobject]@{ B=$f.BaseName; W=$where; R1=$r1.Count; R2=$r2.Count; V=$vv.Count; CL=$cl.Count; Fx=$fxn.Count; Rounds=$rounds }
  }
}
foreach ($r in $rows) {
  $ok = ($r.Rounds -ge 2)
  if (-not $ok) { $fail += ("审核轮次：" + $r.B + " 仅 " + $r.Rounds + " 轮") }
  $rt = if ($r.R2 -gt 0) { "Y" } else { "-" }
  $rv2 = if ($r.V -gt 0) { "Y" } else { "-" }
  $rcl = if ($r.CL -gt 0) { "Y" } else { "-" }
  Write-Output ("$($r.B) | $($r.W) | $($r.R1) | $rt | $rv2 | $rcl | $($r.Fx) | $($r.Rounds) | " + $(if ($ok) {"PASS"} else {"FAIL"}))
}
Write-Output ""

Write-Output "## 三、最新复核报告的严重缺陷计数"
# 只看每个批次的**最新一份** V 报告，且只看它的开头 2500 字符（结论区）。
# 第 44 轮修过一次：原先扫全文，把「R2-C4 报出的严重 1 条已修复」这类**转述上游**的句子也当成了自己的结论。
$sev = @()
foreach ($r in $rows) {
  $al = Get-Alias $r.B
  $vlist = @(Get-ChildItem -LiteralPath $rv -Filter ("V-" + $al + "*.md") -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime)
  if ($vlist.Count -eq 0) { $fail += ("复核缺失：" + $r.B); continue }
  $last = $vlist[$vlist.Count-1]
  $head = (Get-Content -LiteralPath $last.FullName -Raw)
  if ($head.Length -gt 2500) { $head = $head.Substring(0, 2500) }
  $hit = 0
  # 只认「严重 N 条｜中等…」这种三元组形式：要求数字后面紧跟全角竖线。
  # 本库所有报告的结论都写成「严重 X 条｜中等 Y 条｜轻微 Z 条」，
  # 而「R2 报出的严重 1 条已修复」这类转述句后面跟的是中文，不会匹配。
  foreach ($m in [regex]::Matches($head, "严重[^0-9\n|｜]{0,12}(\d+)\s*条?\s*[｜|]")) { $v = [int]$m.Groups[1].Value; if ($v -gt $hit) { $hit = $v } }
  $sup = if ($vlist.Count -gt 1) { (" (已被 " + $vlist.Count + " 份复核，本行为最新)") } else { "" }
  $st = if ($hit -eq 0) { "PASS" } else { "FAIL" }
  if ($hit -gt 0) { $fail += ("严重缺陷未清：" + $r.B + " 最新复核 " + $last.Name + " 记严重 " + $hit + " 条") }
  Write-Output ("$($r.B) | 最新复核 " + $last.Name + $sup + " | 严重 " + $hit + " 条 | " + $st)
}
Write-Output ""
Write-Output "## 结论"
if ($fail.Count -eq 0) { Write-Output "全部可判定条款通过。"; exit 0 }
Write-Output ("未通过项 " + $fail.Count + " 条：")
foreach ($x in $fail) { Write-Output ("  " + $x) }
exit 1