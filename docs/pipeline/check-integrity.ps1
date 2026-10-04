# 批次完整性闸门（PIPELINE L-63）
# 用途：判断某份审核报告的结论，对当前磁盘上的题目文件是否仍然有效。
# 判定优先级：
#   1) 报告里记录的题目文件 MD5 与当前 MD5 相同 -> MATCH（结论有效）
#   2) 报告里记录的题目文件 MD5 与当前 MD5 不同 -> MISMATCH（结论已失效，必须补复核）
#   3) 报告里没有可用的题目 MD5 -> UNVERIFIED，退化为 mtime 比较并明确标注
$ErrorActionPreference = "Stop"
$root  = "D:\Projects\Open English Listening and Speaking\data\item-bank"
$rv    = Join-Path $root "reviews"

function Get-Alias([string]$b) {
  if ($b -match "^([A-E])-batch(\d+)$") { return ($Matches[1] + $Matches[2]) }
  return $b
}

# 从报告里挑出「属于题目文件的那个 MD5」：
# 只认所在行提到题目文件名的 32 位十六进制串。
# 第 42 轮修过一次：原先的兜底规则是「取第一个含 MD5 字样的行」，
# 结果 CL-D4.md 里描述 E4 去重时写的 E4 那个 MD5，被误认成了 D4 的记录值。
# **一份销案记录可能同时描述多个文件的哈希，因此兜底规则不能脱离「该行是否提到本批次的文件名」。**
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

# 报告优先级：按**轮次**排序，不按修改时间。
# 第 86 轮修：原先用 `Sort-Object LastWriteTime | Select-Object -Last 1` 取「最新一份」，
# 而任何一次「修复某份旧报告里的错别字」都会刷新它的 mtime，
# 于是闸门会跳过一个更新轮次、去比对一个更旧的轮次。
# 实测事故：R2-A9.md（第二轮）的 mtime 晚于 V-A9.md（复核），闸门比错了对象。
# 优先级：销案记录 CL- > 第 N 轮复核 V-(-N) > 二轮 R2- > 一轮 R1-
function Get-Rank([string]$name, [string]$alias) {
  # 第 114 轮改（reviewer-2 报告）：CL 原先写死 9000、不解析后缀，
  # 而同排名按文件名倒序取第一个——'.'(0x2E) > '-'(0x2D)，
  # 于是无后缀的 CL-X.md 排在 CL-X-2.md 之前，**后缀更大的新记录被静默忽略**。
  # 这与「同批次取最高后缀」的既定口径正好相反，而 CL 恰恰是「批次重新归档时重写」的那一种。
  # 现在与 V 侧同构：9000 + n，后缀越大 rank 越大。
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
foreach ($d in @($root, (Join-Path $root "prod"))) {
  if (-not (Test-Path -LiteralPath $d)) { continue }
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md","INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $al = Get-Alias $f.BaseName
    $all = @(Get-ChildItem -LiteralPath $rv -Filter ("*-" + $al + "*.md") -File -ErrorAction SilentlyContinue)
    if ($all.Count -eq 0) {
      $rows += [pscustomobject]@{ Batch=$f.BaseName; Report="-"; Kind="-"; Recorded="-"; Current="-"; Verdict="无报告"; Newer=$false }
      continue
    }
    $al0 = $al
    $ranked = $all | ForEach-Object { [pscustomobject]@{ F=$_; R=(Get-Rank $_.Name $al0); N=$_.Name } } | Sort-Object -Property R,N -Descending
    $rep = ($ranked | Select-Object -First 1).F
    $g = Get-ItemMD5 $rep.FullName $f.BaseName
    $cur = (Get-FileHash -LiteralPath $f.FullName -Algorithm MD5).Hash.ToLower()
    # 第 86 轮加：未锚定取值（首串）的反向校验。
    # 「首串」意味着这一串 32 位十六进制没有跟着本批次文件名出现，可能是规约文件的哈希。
    # 只有当**当前文件的 MD5 确实能在报告正文里找到**时，才认这个取值；否则判 UNVERIFIED，
    # 宁可说「无法判定」，也不要把规约文件的哈希当成批次的记录值——那正是 D4 那次假警报的成因。
    if ($g.K -like "首串*") {
      $body = [System.IO.File]::ReadAllText($rep.FullName, [System.Text.Encoding]::UTF8)
      if ($body.IndexOf($cur, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) { $g = @{ V=""; K="首串但正文无当前MD5，不予采信" } }
    }
    $newer = $f.LastWriteTime -gt $rep.LastWriteTime
    if ($g.V -eq "") {
      $verdict = "UNVERIFIED"; if ($newer) { $verdict = "UNVERIFIED+被改动" }
    } elseif ($g.V -eq $cur) { $verdict = "MATCH" }
    else { $verdict = "MISMATCH" }
    $rows += [pscustomobject]@{ Batch=$f.BaseName; Report=$rep.Name; Kind=$g.K; Recorded=$g.V; Current=$cur; Verdict=$verdict; Newer=$newer }
  }
}

Write-Output "批次 | 最新报告 | MD5 取值来源 | 报告记录 | 当前实测 | 判定"
Write-Output ("-" * 110)
foreach ($r in $rows) { Write-Output ($r.Batch + " | " + $r.Report + " | " + $r.Kind + " | " + $r.Recorded + " | " + $r.Current + " | " + $r.Verdict) }

$bad  = @($rows | Where-Object { $_.Verdict -match "MISMATCH|UNVERIFIED" })
Write-Output ("总计 " + $rows.Count + " 个批次；需关注 " + $bad.Count + " 个。")
if ($bad.Count -gt 0) { exit 1 }