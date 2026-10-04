# facts.ps1 —— 题库事实快照。新建任务书时**引用本文件输出**，不要凭记忆写数字。
# 用法： pwsh -NoProfile -File scripts/facts.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$bank = 'data/item-bank'
$prod = Join-Path $bank 'prod'

$batchFiles = @(
  Get-ChildItem $bank -Filter '*.md' -File | Where-Object { $_.Name -notmatch 'INDEX|REVIEW-RUBRIC' }
) + @(
  Get-ChildItem $prod -Filter '*.md' -File | Where-Object { $_.Name -notmatch '\.meta\.md$' }
)

'=== 1. 批次规模 ==='
foreach ($k in 'A','B','C','D','E') {
  '{0} = {1}' -f $k, (@($batchFiles | Where-Object Name -match "^$k").Count)
}
'total = ' + $batchFiles.Count

'=== 2. 题块数（## X..-NN 标题行） ==='
foreach ($k in 'A','B','C','D','E') {
  $n = 0
  foreach ($f in ($batchFiles | Where-Object Name -match "^$k")) {
    $n += (@(Get-Content $f.FullName) | Where-Object { $_ -match '^##[ \t]+[A-E][0-9A-Za-z]*-[0-9]+' }).Count
  }
  '{0} blocks = {1}' -f $k, $n
}

'=== 3. 每批 MD5 / 字节 / 行数 / 末字节 ==='
'# 口径：行数 = Get-Content .Count；末字节 = 0x0A 表示有末尾换行'
foreach ($f in ($batchFiles | Sort-Object Name)) {
  $md5 = (Get-FileHash $f.FullName -Algorithm MD5).Hash.ToLower()
  $len = $f.Length
  $lc  = (Get-Content $f.FullName).Count
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  '{0,-12} {1} {2,6} {3,5} 0x{4:X2}' -f $f.Name, $md5, $len, $lc, $bytes[-1]
}

'=== 4. 归档缺口（别名感知） ==='
$alias = @{'A-batch0'='A0';'B-batch1'='B1';'C-batch1'='C1';'D-batch1'='D1';'E-batch1'='E1'}
$noCL = @()
foreach ($f in ($batchFiles | Sort-Object Name)) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($f.Name)
  $a = if ($alias.ContainsKey($base)) { $alias[$base] } else { $base }
  if (-not (Test-Path "data/item-bank/reviews/CL-$a.md")) { $noCL += $base }
}
'archived = ' + ($batchFiles.Count - $noCL.Count) + ' / ' + $batchFiles.Count
'gap = ' + ($noCL -join ' ')

'=== 5. git 跟踪 ==='
'git ls-files data/item-bank = ' + ((git ls-files data/item-bank | Measure-Object).Count)

'=== 6. 真 U+FFFD 扫描（不要数 0xEF 字节，那是错的） ==='
$bad = @()
foreach ($g in (Get-ChildItem 'docs','data','scripts' -Recurse -Filter '*.md' -File -ErrorAction SilentlyContinue)) {
  $c = Get-Content $g.FullName -Raw -Encoding UTF8
  if (([regex]::Matches($c, [char]0xFFFD)).Count -gt 0) { $bad += $g.FullName }
}
foreach ($g in (Get-ChildItem 'scripts' -Filter '*.ps1' -File -ErrorAction SilentlyContinue)) {
  $c = Get-Content $g.FullName -Raw -Encoding UTF8
  if (([regex]::Matches($c, [char]0xFFFD)).Count -gt 0) { $bad += $g.FullName }
}
'files with real U+FFFD = ' + $bad.Count
$bad
