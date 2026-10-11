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

'=== 8. 每型可组整卷数 ==='
'# 为什么加这一节：第 200 轮全库总套数（202）对上了「每型 50 套」的要求，就没有再单独核口语；
#   而话题简述当时只有 12 题 = 12 套，缺 38。**总数对上掩盖了单项缺口。**
#   第 1-7 节报的都是「有多少」，没有一节报「能组几套」。这一节把换算变成机器算的。'
$blocks = @{}
foreach ($k in 'A','B','C','D') {
  $n = 0
  foreach ($ff in ($batchFiles | Where-Object Name -match "^$k")) {
    $n += (@(Get-Content $ff.FullName) | Where-Object { $_ -match '^##[ \t]+[A-E][0-9A-Za-z]*-[0-9]+' }).Count
  }
  $blocks[$k] = $n
}
$perSet = @{ A = 10; B = 1; C = 1; D = 1 }
$setCount = @{}
foreach ($k in 'A','B','C','D') {
  $n = $blocks[$k]
  if ($n -gt 0) { $setCount[$k] = [math]::Floor($n / $perSet[$k]) } else { $setCount[$k] = 0 }
  '{0}: 题块 {1,4} / 每套 {2,2} = {3,3} 套' -f $k, $n, $perSet[$k], $setCount[$k]
}
'# E 类两个官方口语题型分别算：情景问答 1 组/套，话题简述 1 题/套'
$qGroups = 0; $qTopics = 0
foreach ($f in $batchFiles) {
  if ($f.Name -notmatch '^E') { continue }
  $txt = Get-Content $f.FullName -Raw
  $g = ([regex]::Matches($txt, '(?m)^##\s+E[0-9A-Za-z]*-[0-9]+')).Count
  if ($txt.Contains('话题题目')) { $qTopics += $g } else { $qGroups += $g }
}
'E-情景问答: 组 {0,3} / 每套 1 = {1,3} 套' -f $qGroups, $qGroups
'E-话题简述: 题 {0,3} / 每套 1 = {1,3} 套' -f $qTopics, $qTopics
$setCount['E-情景问答'] = $qGroups; $setCount['E-话题简述'] = $qTopics
'# 目标 50 套。缺口必须显式打印，不要让人自己算。'
foreach ($k in 'A','B','C','D','E-情景问答','E-话题简述') {
  $s = $setCount[$k]; $gap = 50 - $s
  if ($gap -le 0) { '{0,-12} {1,3} 套  [OK]' -f $k, $s }
  else { '{0,-12} {1,3} 套  [缺 {2}]' -f $k, $s, $gap }
}

'=== 9. 主库 JSONL 一致性校验（md 是审阅源，jsonl 才是主库） ==='
$jsonl = Join-Path $root 'data/bank/items.jsonl'
if (Test-Path $jsonl) {
  $lines = @(Get-Content $jsonl)
  $byType = @{}
  foreach ($l in $lines) {
    $o = $l | ConvertFrom-Json
    if ($byType.ContainsKey($o.type)) { $byType[$o.type]++ } else { $byType[$o.type] = 1 }
  }
  'jsonl 行数 = ' + $lines.Count
  foreach ($k in ($byType.Keys | Sort-Object)) { '  {0,-28} {1}' -f $k, $byType[$k] }
  # 与第 2 节的 md 题块数对质：不对上就报，这是主库与源材料脱节的唯一自动信号
  $mdAB = $blocks['A']; $mdB = $blocks['B']; $mdC = $blocks['C']; $mdD = $blocks['D']
  $jA = $byType['listening.dialogue.1q']; $jB = $byType['listening.dialogue.2q']
  $jC = $byType['listening.passage.5q']; $jD = $byType['listening.table.3blank']
  $jQ = $byType['speaking.qa']; $jT = $byType['speaking.topic']
  $mism = @()
  if ($jA -ne $mdAB) { $mism += "A: md=$mdAB jsonl=$jA" }
  if ($jB -ne $mdB)  { $mism += "B: md=$mdB jsonl=$jB" }
  if ($jC -ne $mdC)  { $mism += "C: md=$mdC jsonl=$jC" }
  if ($jD -ne $mdD)  { $mism += "D: md=$mdD jsonl=$jD" }
  if ($jQ -ne $qGroups) { $mism += "E情景: md=$qGroups jsonl=$jQ" }
  if ($jT -ne $qTopics) { $mism += "E话题: md=$qTopics jsonl=$jT" }
  if ($mism.Count -eq 0) { '主库与 md 一致 [OK]' }
  else { '主库与 md 不一致 [需重跑 npm run bank:export]：'; $mism | ForEach-Object { '  ' + $_ } }
} else {
  'data/bank/items.jsonl 不存在 —— 跑 npm run bank:export 生成'
}
