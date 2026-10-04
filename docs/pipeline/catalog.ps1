# 题库内容目录：逐批次列出每份材料的标题，让人一眼看见库里有什么
$ErrorActionPreference = "Stop"
$root = "D:\Projects\Open English Listening and Speaking\data\item-bank"

function Get-Alias([string]$b) { if ($b -match "^([A-E])-batch(\d+)$") { return ($Matches[1] + $Matches[2]) }; return $b }

$rows = @()
foreach ($d in @($root, (Join-Path $root "prod"))) {
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md","INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $cls = $f.BaseName.Substring(0,1)
    $titles = @()
    foreach ($l in (Get-Content -LiteralPath $f.FullName)) {
      if ($l -match "^##\s+(.+?)\s*$") {
        $t = $matches[1]
        $t = $t -replace "^[A-E]\d*-batch\d*-\d+\s*", ""
        $t = $t -replace "^[A-E]\d*-\d+\s*", ""
        $titles += $t.Trim()
      }
    }
    $where = if ($d -like "*prod*") { "在制" } else { "已入库" }
    $rows += [pscustomobject]@{ Batch=$f.BaseName; Cls=$cls; Where=$where; Titles=$titles }
  }
}

foreach ($cls in @("A","B","C","D","E")) {
  $sub = @($rows | Where-Object { $_.Cls -eq $cls })
  if ($sub.Count -eq 0) { continue }
  $n = 0; foreach ($s in $sub) { $n += $s.Titles.Count }
  Write-Output ("## " + $cls + " 类（" + $sub.Count + " 批 / " + $n + " 份材料）")
  foreach ($s in $sub) {
    Write-Output ("- **" + $s.Batch + "**（" + $s.Where + "，" + $s.Titles.Count + " 份）：" + ($s.Titles -join "、"))
  }
  Write-Output ""
}