$ErrorActionPreference = "Stop"
$root = "D:\Projects\Open English Listening and Speaking"
$bank = Join-Path $root "data\item-bank"
$rv   = Join-Path $bank "reviews"
$fx   = Join-Path $bank "fixes"

function Get-Alias([string]$b) {
  if ($b -match "^([A-E])-batch(\d+)$") { return ($Matches[1] + $Matches[2]) }
  return $b
}

# 找出某个批次名下的全部报告，返回最新修改时间
function Get-NewestReport([string]$alias, [string]$prefix) {
  if (-not (Test-Path -LiteralPath $rv)) { return $null }
  $all = @(Get-ChildItem -LiteralPath $rv -Filter ($prefix + "-" + $alias + "*.md") -File -ErrorAction SilentlyContinue)
  if ($all.Count -eq 0) { return $null }
  return ($all | Sort-Object LastWriteTime | Select-Object -Last 1)
}

$items = @()
foreach ($d in @($bank, (Join-Path $bank "prod"))) {
  if (-not (Test-Path -LiteralPath $d)) { continue }
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md", "INDEX.md")) { continue }
    # 旁挂文件（.meta / 说明页）不是批次，必须排除
    if ($f.BaseName -match "\.meta$") { continue }
    if ($f.Name -match "^README") { continue }
    $b  = $f.BaseName
    $al = Get-Alias $b

    $r1all = @(Get-ChildItem -LiteralPath $rv -Filter ("R1-" + $al + "*.md") -File -ErrorAction SilentlyContinue)
    $r2all = @(Get-ChildItem -LiteralPath $rv -Filter ("R2-" + $al + "*.md") -File -ErrorAction SilentlyContinue)
    $vall  = @(Get-ChildItem -LiteralPath $rv -Filter ("V-"  + $al + "*.md") -File -ErrorAction SilentlyContinue)

    $r1 = if ($r1all.Count -eq 0) { "-" } else { "Y" + $(if ($r1all.Count -gt 1) { "+" + $r1all.Count } else { "" }) }
    $r2 = if ($r2all.Count -eq 0) { "-" } else { "Y" + $(if ($r2all.Count -gt 1) { "+" + $r2all.Count } else { "" }) }
    $vv = if ($vall.Count -eq 0) { "-" } else { "Y" + $(if ($vall.Count -gt 1) { "+" + $vall.Count } else { "" }) }

    $fixn = 0
    if (Test-Path -LiteralPath $fx) {
      $fixn = @(Get-ChildItem -LiteralPath $fx -Filter ("*" + $al + "*.md") -File -ErrorAction SilentlyContinue).Count
    }

    # L-63 风险：题目文件的修改时间晚于最新一份报告的时间，则该报告结论已失效
    $newest = $null
    foreach ($p in @("R1","R2","V")) {
      $x = Get-NewestReport $al $p
      if ($null -ne $x -and ($null -eq $newest -or $x.LastWriteTime -gt $newest.LastWriteTime)) { $newest = $x }
    }
    $risk = "-"
    if ($newest -ne $null -and $f.LastWriteTime -gt $newest.LastWriteTime) {
      $risk = "复核后被改动 " + $f.LastWriteTime.ToString("HH:mm:ss") + " > " + $newest.Name + " " + $newest.LastWriteTime.ToString("HH:mm:ss")
    }
    if ($newest -eq $null) { $risk = "无任何报告" }

    $where = if ($d -like "*prod*") { "prod" } else { "bank" }
    $items += [pscustomobject]@{ Name=$b; Alias=$al; Where=$where; R1=$r1; R2=$r2; V=$vv; Fix=$fixn; Risk=$risk }
  }
}

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# 题库批次流水线总表（自动生成）")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("由 docs/pipeline/build-status.ps1 生成，请勿手改。跑一次即可刷新。")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## 全量状态")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| 批次 | 别名 | 位置 | 一轮 | 二轮 | 复核 | 修复记录 | 报告时效性 | 达标所需 |")
[void]$sb.AppendLine("|---|---|---|---|---|---|---|---|---|")
foreach ($i in $items) {
  $need = @()
  if ($i.R1 -eq "-") { $need += "派 R1" }
  if ($i.R2 -eq "-") { $need += "派 R2" }
  if ($i.V  -eq "-") { $need += "派 V" }
  if ($i.Where -eq "prod" -and $need.Count -eq 0) { $need += "可归档" }
  if ($i.Risk -ne "-" -and $i.Where -eq "bank") { $need += "补复核（见报告时效性列）" }
  if ($need.Count -eq 0) { $need += "流水线完整" }
  [void]$sb.AppendLine("| " + $i.Name + " | " + $i.Alias + " | " + $i.Where + " | " + $i.R1 + " | " + $i.R2 + " | " + $i.V + " | " + $i.Fix + " | " + $i.Risk + " | " + ($need -join "；") + " |")
}
[void]$sb.AppendLine("")
[void]$sb.AppendLine("说明：")
[void]$sb.AppendLine("- 别名列给出报告文件名的实际前缀。B-batch1 的别名是 B1，故其报告为 R1-B1.md。")
[void]$sb.AppendLine("- Y+n 表示该轮有 n 份报告（例如 Y+2 = V-X.md 与 V-X-2.md 两份复核）。")
[void]$sb.AppendLine("- **报告时效性**列是 PIPELINE L-63 的闸门：题目文件若比最新一份报告更新，那份报告的结论对它已失效。")
[void]$sb.AppendLine("- 旁挂文件（*.meta.md 等）不是批次，本表已排除。")
[System.IO.File]::WriteAllText((Join-Path $root "docs\pipeline\STATUS.md"), $sb.ToString().Replace("`r`n", "`n"), (New-Object System.Text.UTF8Encoding($false)))
"STATUS.md written"