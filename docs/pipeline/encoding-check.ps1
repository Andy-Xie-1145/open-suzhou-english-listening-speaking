# 文件可用性闸门：产出物能不能被正常读取
# 第 79 轮建（只扫题目文件），第 81 轮扩展为扫全部 md。
#
# 起因链：
#   1) 查 C3.md 末尾少一个 LF -> 建成闸门（只扫题目文件）
#   2) 顺手扩到审核报告 -> 查出 9 份文档共 14 处 U+FFFD，含 REVIEW-RUBRIC / PIPELINE / ARCHIVE
#   3) 根因：字符在构造字符串时就丢了，写文件时把 U+FFFD 当正文写入，全程零报错，字节级完全合法。
#      **任何「结果对不对」的检查都发现不了它，只有「产出即校验」能发现。**
$ErrorActionPreference = "Stop"
$proj = "D:\Projects\Open English Listening and Speaking"

function Scan-Dir([string]$dir, [string]$label, [bool]$needLF) {
  $bad = @(); $n = 0
  if (-not (Test-Path -LiteralPath $dir)) { return @($n, $bad) }
  foreach ($f in (Get-ChildItem -LiteralPath $dir -Filter *.md -File)) {
    $n++
    $b = [System.IO.File]::ReadAllBytes($f.FullName)
    $issues = @()
    if ($b.Length -ge 3 -and $b[0] -eq 0xEF -and $b[1] -eq 0xBB -and $b[2] -eq 0xBF) { $issues += "有 BOM" }
    $txt = [System.Text.Encoding]::UTF8.GetString($b)
    $fffd = ($txt.ToCharArray() | Where-Object { [int]$_ -eq 0xFFFD }).Count
    if ($fffd -gt 0) { $issues += ("U+FFFD x" + $fffd) }
    if (([regex]::Matches($txt, "`r")).Count -gt 0) { $issues += "含 CR" }
    # 第 112 轮修：末尾换行按「目录」豁免，不按「缺陷类型」豁免。
    # 原实现把 "末尾无换行" 从 $all 过滤进 $strict，再拿 $strict.Count -eq 0 判 PASS——
    # 于是这一项永远不可能 FAIL。讽刺的是本闸门正是为「查 C3.md 末尾少一个 LF」而建的。
    # 更糟的是：同时存在末尾缺 LF 与其他真缺陷的文件，会因这条过滤整条从失败集消失。
    if ($needLF -and $b.Length -gt 0 -and $b[$b.Length-1] -ne 10) { $issues += "末尾无换行" }
    if ($txt.Length -eq 0) { $issues += "空文件" }
    if ($issues.Count -gt 0) { $bad += ($label + "/" + $f.Name + " -> " + ($issues -join "、")) }
  }
  return @($n, $bad)
}

# LF = 是否要求末尾换行。题目文件必须（下游按行切分）；流程文档不强制。
$targets = @(
  @{ D = (Join-Path $proj "data\item-bank\prod");   L = "在制题目"; LF = $true  },
  @{ D = (Join-Path $proj "data\item-bank\reviews"); L = "审核报告"; LF = $false },
  @{ D = (Join-Path $proj "data\item-bank\fixes");   L = "修复记录"; LF = $false },
  @{ D = (Join-Path $proj "docs\pipeline");          L = "流水线文档"; LF = $false },
  @{ D = (Join-Path $proj "docs\pipeline\dispatch");L = "任务书"; LF = $false },
  @{ D = (Join-Path $proj "research");                L = "调研"; LF = $false }
)

$total = 0; $all = @(); $per = @()
foreach ($t in $targets) {
  $r = Scan-Dir $t.D $t.L $t.LF
  $total += $r[0]
  $per += ("  " + $t.L + "：" + $r[0] + " 份")
  if ($r[1].Count -gt 0) { $all += $r[1] }
}

Write-Output "扫描范围："
$per | ForEach-Object { Write-Output $_ }
Write-Output ("合计 " + $total + " 份 md")
Write-Output ""
# 第 112 轮修：不再按缺陷类型过滤。末尾换行的豁免已下放到 Scan-Dir 的 $needLF 参数，
# 这一层只看「还剩多少缺陷」，剩 0 才算 PASS。
if ($all.Count -eq 0) {
  "PASS: no encoding or corruption defect"
  exit 0
}
Write-Output ("ENCODING DEFECTS: " + $all.Count)
foreach ($x in $all) { "  " + $x }
exit 1