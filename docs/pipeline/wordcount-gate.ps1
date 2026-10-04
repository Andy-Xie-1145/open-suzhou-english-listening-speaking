$ErrorActionPreference = "Stop"
$bank = "D:\Projects\Open English Listening and Speaking\data\item-bank"

# 词数普查门禁 + 结构完整性门禁（PIPELINE L-66 / L-74 / L-75 / L-86）
#
# 口径（REVIEW-RUBRIC 1.10）：空白分词、只数材料正文（Passage/Dialogue 段内全部内容，含说话人标注）、
# 不含标题、题干、选项、Answer 行、文件头与末尾汇总行。D 类剔除表格标记。
# 150 词下限仅适用 C 类；A=60 B=200 C=220 D=200 上限，D 无下限。
#
# L-75：靠结构标记行定位材料正文。某份材料若完全缺少标记，词数会被计为 0 并静默通过。
#       现在对「有编号标题但找不到材料标记」的段落单独报警。
# L-86：结构标记必须与实际体裁相符。标 Passage 却有说话人标注、标 Dialogue 却没有，都判错配。
#       起因：D-batch1 有 5 份对话被标成 Passage，D4 有 3 份同样问题，两批此前从未被审出。
$limits = @{ A = 60; B = 200; C = 220; D = 200 }

function Get-Blocks($path) {
  $lines = Get-Content -LiteralPath $path -Encoding UTF8
  $spk = "^[A-Z][A-Za-z.]*( [A-Z][A-Za-z.]*)?: [A-Za-z]"
  $blocks = @(); $cur = $null; $buf = @(); $inMat = $false; $hasMark = $false
  $mark = ""; $hasSpk = $false
  foreach ($l in $lines) {
    if ($l -match "^## ") {
      if ($cur) { $blocks += [pscustomobject]@{ Id=$cur; Text=($buf -join " "); HasMarker=$hasMark; Mark=$mark; HasSpeaker=$hasSpk } }
      $cur = $l.Trim(); $buf = @(); $inMat = $false; $hasMark = $false; $mark = ""; $hasSpk = $false; continue
    }
    if ($l -match "^\*\*Passage\*\*")  { $inMat = $true; $hasMark = $true; $mark = "P"; continue }
    if ($l -match "^\*\*Dialogue\*\*") { $inMat = $true; $hasMark = $true; $mark = "D"; continue }
    if ($l -match "^\*\*") { $inMat = $false; continue }
    if ($inMat) { $buf += $l; if ($l -match $spk) { $hasSpk = $true } }
  }
  if ($cur) { $blocks += [pscustomobject]@{ Id=$cur; Text=($buf -join " "); HasMarker=$hasMark; Mark=$mark; HasSpeaker=$hasSpk } }
  return $blocks
}

$over = @(); $missing = @()
foreach ($d in @($bank, (Join-Path $bank "prod"))) {
  if (-not (Test-Path -LiteralPath $d)) { continue }
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md", "INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $b = $f.BaseName; $cls = $b.Substring(0,1)
    if ($cls -eq "E") { continue }
    if (-not $limits.ContainsKey($cls)) {
      $missing += [pscustomobject]@{ File = $b; Id = ("文件名类别前缀为 " + $cls + "，不是 A/B/C/D/E") }
      continue
    }
    $lim = $limits[$cls]
    foreach ($blk in (Get-Blocks $f.FullName)) {
      if (-not $blk.HasMarker) {
        $missing += [pscustomobject]@{ File = $b; Id = ($blk.Id + "  [缺 Passage/Dialogue 标记，无法计量词数]") }
        continue
      }
      if ($blk.Mark -eq "P" -and $blk.HasSpeaker) {
        $missing += [pscustomobject]@{ File = $b; Id = ($blk.Id + "  [标 Passage 但正文有说话人标注]") }
        continue
      }
      if ($blk.Mark -eq "D" -and -not $blk.HasSpeaker) {
        $missing += [pscustomobject]@{ File = $b; Id = ($blk.Id + "  [标 Dialogue 但正文无说话人标注]") }
        continue
      }
      $t = $blk.Text
      if ($cls -eq "D") { $t = ($t -replace "①|②|③", "") }
      $t = ($t -replace "^\s+|\s+$", "")
      if ([string]::IsNullOrWhiteSpace($t)) {
        $missing += [pscustomobject]@{ File = $b; Id = ($blk.Id + "  [标记存在但材料正文为空]") }
        continue
      }
      $n = ($t -split "\s+" | Where-Object { $_ -ne "" }).Count
      if ($n -gt $lim) { $over += [pscustomobject]@{ File = $b; Id = $blk.Id; Words = $n; Limit = $lim } }
    }
  }
}

if ($missing.Count -gt 0) {
  "STRUCTURE ERRORS: " + $missing.Count
  foreach ($m in ($missing | Sort-Object File, Id)) {
    "  {0,-10} {1,-56} {2}" -f $m.File, $m.Id, ""
  }
}
if ($over.Count -gt 0) {
  "OVER-LIMIT BLOCKS: " + $over.Count
  foreach ($o in ($over | Sort-Object File, Id)) {
    "  {0,-10} {1,-36} {2,5} > {3}" -f $o.File, $o.Id, $o.Words, $o.Limit
  }
}
if ($over.Count -eq 0 -and $missing.Count -eq 0) {
  "PASS: no material block exceeds its limit"
  exit 0
}
exit 1