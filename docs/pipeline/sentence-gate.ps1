# 口语「话题简述」句数闸门（sentence-gate.ps1）
#
# 缺口由来（首审员实测，不是推断）
#   口语「话题简述」这个题型的规格是**句数**（「不少于 7 句、连续成段」，B 级依据），
#   而 wordcount-gate.ps1 只量词数、不量句数，且**显式跳过 E 类**（该脚本第 42 行 cls -eq "E" continue）。
#   于是 wordcount-gate 报 PASS 时，对「≥8 句」这个要求**零证明力**：
#   PASS 只代表它没查这件事，不代表达标。本脚本补的就是这一段。
#
# 它管什么
#   1) 只对含「**参考作答**」标记的题块数句数，低于该文件内声明的下限即 FAIL。
#      判据取「**参考作答**」这个结构标记，而不是文件名前缀：
#      E 类既有话题简述也有「情景问答」，后者没有参考作答；A/B/C/D 听力题同样没有。
#   2) 阈值**不写死在脚本里**，逐文件从题面自己的规格声明里读；读不到 -> 报错退出（exit 2），
#      **不猜一个数**。规格会变，硬编码的闸门在规格变更后会静默失效——
#      它不会报错，只会拿一个已经作废的数继续判 PASS，这比没有闸门更坏。
#   3) 不含「**参考作答**」的题块一律 SKIP，**不判失败**：听力题没有这个结构。
#      跳过的是「不适用」，不是「通过」，输出里逐文件报跳过数。
#
# 它不管什么（看到 PASS 不要当成这些也成立）
#   - 不量词数：那是 wordcount-gate.ps1 的事，且那个脚本按设计跳过 E 类。
#   - 不查「连续成段」：规格原文是「不少于 N 句、连续成段」，本闸门**只证明前半句**。
#   - 不查评分要点，不查话题题目是否为官方 12 个话题（E8.md 头部自述：话题清单为本库自拟）。
#   - 不判参考作答的质量，只判句数。
#
# 句数怎么数（口径，逐条对应实现；改口径请连同这一段一起改）
#   1) 终止标点 . ? ! 各记 1 句；连续句点 "..." 先折叠成一个 "." 再计，不重复计数。
#   2) 小数点不算句号：句号前后**都是数字**（如 3.5）时跳过。
#   3) 缩写不算句号：句号前那个词（可含内部点，如 a.m / U.S.A）命中缩写表，
#      或本身就是**单个字母**（人名首字母 J. K. Rowling）时跳过。
#   4) 其余 . ? ! 一律记句（含 Oh! 这类独立感叹句）。
#   口径基准（实测）：data/item-bank/prod/E8.md 应得 9/9/8/9/8/8/8/8/8/8/8/8，最少 8 句。
#   数法与这个不一致就是数错了——改数法，不要改期望值。
#
# 已知边界：缩写点正好处在一句末尾（「……in the U.S.A. He came back」）时，它的点号既是缩写点
#   也是句号，单一口径必然二选一。因此脚本同时算两个数并**把区间摆出来**：
#   下界 Strict（缩写一律不切，可能少计）与上界 Loose（后面不跟小写字母时按句末计，可能多计），
#   真值落在两者之间。**判定只用下界**：下界达标则真值一定达标，PASS 不会被口径绑架；
#   下界不达标则该块判 FAIL 并打出区间提示——有疑问时宁可报出来，也不要让它混进一个 PASS 里。
#   E8.md 全 12 块两种读法一致（无区间提示），说明它不受这条边界影响。
#
# 阈值从哪来（认这几种写法，取最严的一个，逐条打印来源行号供人工复核）
#   「不少于 N 句」「至少 N 句」「下限由 X 提升至 N」「下限为 N」
#   同一句里出现多个数字时按各自声明取值；生效值 = 所有命中的**最大值**。
#   故意**不**采信：题面末尾的「最少句数 N 句」这类**实测汇总**。
#   那是上一轮量出来的结果，拿它当阈值等于让闸门校验自己的输出，会永远 PASS（循环论证）。
#   该行仍会打印，但明确标为「未采信」，不参与判定。
#
# 退出码：0 = 全部达标；1 = 有题块低于下限；2 = 阈值读不到 / 输入异常（**不等于达标**）
# 用法：
#   pwsh -NoProfile -File docs/pipeline/sentence-gate.ps1
#   pwsh -NoProfile -File docs/pipeline/sentence-gate.ps1 -File data/item-bank/prod/E8.md
#
# ⚠️ param() 必须是脚本的第一条语句（注释不算），否则 PowerShell 会把它当 cmdlet 调用。
param([string]$File)

$ErrorActionPreference = "Stop"
# 题库根目录：用 $PSScriptRoot 推导（与 scripts/facts.ps1 同一写法），不写死盘符——
# 换机器或换盘符时，写死的路径只会让人以为脚本「忘了跑」。
$bank = Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) "data\item-bank"

# 缩写表：小写匹配。这些点号后面不是句子结束。
$abbrev = @(
  "mr","mrs","ms","dr","prof","sr","jr","st","ste","rev","hon","gen","col","capt","lt","sgt",
  "vs","etc","no","nos","fig","al","inc","ltd","co","dept","est","approx","min","max",
  # 月份缩写带点（Sept. / Apr.），它们后面不是句子结束
  "jan","feb","mar","apr","jun","jul","aug","sept","sep","oct","nov","dec",
  "a.m","p.m","u.s","u.s.a","u.k","e.g","i.e","a.d","b.c"
)

# 规格声明：命中即视为一条阈值候选
$specRx = @(
  @{ Kind = "不少于N句";   Rx = [regex]'不少于\s*(\d+)\s*句' }
  @{ Kind = "至少N句";     Rx = [regex]'至少\s*(\d+)\s*句' }
  @{ Kind = "下限提升至N"; Rx = [regex]'下限\s*(?:由\s*\d+\s*)?(?:提升|提高|上调|改为)\s*(?:至|到)\s*(\d+)' }
  @{ Kind = "下限为N";     Rx = [regex]'下限\s*(?:为|是)\s*(\d+)' }
)

# 实测汇总：打印但**不采信**（否则闸门等于校验自己的输出）
$measuredRx = @(
  @{ Kind = "最少句数N句"; Rx = [regex]'最少\s*句数\s*[:：]?\s*(\d+)' }
  @{ Kind = "最少N句";     Rx = [regex]'最少\s*(\d+)\s*句' }
)

# 返回两个数：Strict（下界，判定用）与 Loose（上界，仅作提示）。
#   Strict：缩写点一律不切。保守，**可能少计**（见下面的已知边界）。
#   Loose ：缩写点若后面紧跟的不是小写字母，则当作句末再计一次。
# 判定只用 Strict：Loose >= Strict，所以 Strict 达标时两种读法都达标，PASS 不会被口径绑架；
# 而 Strict 不达标时，Loose 会把「是不是少计了」这件事摆到台面上，而不是藏进一个 PASS 里。
function Get-SentenceCount {
  param([string]$Text)
  if ([string]::IsNullOrWhiteSpace($Text)) { return @{ Strict = 0; Loose = 0 } }
  # 省略号折叠 + 换行压平（参考作答理论上是一段；跨行时按一段算）
  $t = (($Text -replace '\.{3,}', '.') -replace '\s+', ' ').Trim()
  $n = 0; $loose = 0
  for ($i = 0; $i -lt $t.Length; $i++) {
    $c = [int]$t[$i]
    if ($c -ne 46 -and $c -ne 63 -and $c -ne 33) { continue }   # 只关心 . ? !
    if ($c -eq 46) {
      $p = if ($i -gt 0) { [int]$t[$i-1] } else { 32 }
      $x = if ($i -lt $t.Length - 1) { [int]$t[$i+1] } else { 32 }
      # 规则 2：小数点（3.5）前后都是数字 -> 不切
      if ($p -ge 48 -and $p -le 57 -and $x -ge 48 -and $x -le 57) { continue }
      # 规则 3：回溯取句号前的词（允许内部有点，拿到 a.m / U.S.A 这种）
      $j = $i - 1
      while ($j -ge 0) {
        $k = [int]$t[$j]
        $isLetter = (($k -ge 65 -and $k -le 90) -or ($k -ge 97 -and $k -le 122))
        if (-not $isLetter -and $k -ne 46) { break }
        $j--
      }
      $tok = $t.Substring($j + 1, $i - $j - 1).ToLower()
      $isAbbrev = $false
      if ($tok.Length -eq 1) { $isAbbrev = $true }             # 单字母：人名首字母 / a.m 的 a
      elseif ($abbrev -contains $tok) { $isAbbrev = $true }
      elseif ($tok.EndsWith(".") -and $abbrev -contains $tok.Substring(0, $tok.Length - 1)) { $isAbbrev = $true }
      if ($isAbbrev) {
        # 后面紧跟小写字母/数字 -> 一定是同一句的延续，两种读法都不切
        $k2 = $i + 1
        while ($k2 -lt $t.Length -and [int]$t[$k2] -eq 32) { $k2++ }
        $nx = if ($k2 -lt $t.Length) { [int]$t[$k2] } else { 32 }
        $certainCont = ($nx -ge 97 -and $nx -le 122) -or ($nx -ge 48 -and $nx -le 57)
        if ($certainCont) { continue }
        # 已知边界：缩写正好处在一句末尾（「……in the U.S.A. He came back」）时，
        # 它的点号既是缩写点也是句号。Strict 按缩写处理（少计），Loose 按句末处理。
        $loose++
        continue
      }
    }
    $n++; $loose++
  }
  return @{ Strict = $n; Loose = $loose }
}

# 逐个「## 」题块切分；只把带 **参考作答** 标记的块收进结果。
function Get-AnswerBlocks {
  param([string]$Path)
  $lines = @(Get-Content -LiteralPath $Path -Encoding UTF8)
  $blocks = @(); $cur = $null; $curLine = 0; $buf = @(); $cap = $false
  $hasAns = $false; $ansLine = 0; $ansLines = 0
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $l = $lines[$i]
    if ($l -match "^##\s") {
      if ($cur) {
        $blocks += [pscustomobject]@{ File=$Path; Id=$cur; Line=$curLine; HasAnswer=$hasAns; AnswerLine=$ansLine; AnswerLines=$ansLines; Answer=($buf -join " ") }
      }
      $cur = $l.Trim(); $curLine = $i + 1
      $buf = @(); $cap = $false; $hasAns = $false; $ansLine = 0; $ansLines = 0
      continue
    }
    if (-not $cur) { continue }
    if ($cap) {
      # 参考作答到下一个结构标记 / 列表项 / 表格 / 空行为止
      if (($l -match "^\s*\*\*") -or ($l -match "^\s*[-*+] ") -or ($l -match "^\s*\|") -or ($l.Trim().Length -eq 0)) {
        $cap = $false; continue
      }
      $buf += $l; $ansLines++
      continue
    }
    if ($l -match "^\s*\*\*参考作答\*\*") {
      $cap = $true; $hasAns = $true; $ansLine = $i + 1; $ansLines = 0
      $rest = ($l -replace "^\s*\*\*参考作答\*\*[：:\s]*", "")
      if ($rest.Trim().Length -gt 0) { $buf += $rest; $ansLines = 1 }
    }
  }
  if ($cur) {
    $blocks += [pscustomobject]@{ File=$Path; Id=$cur; Line=$curLine; HasAnswer=$hasAns; AnswerLine=$ansLine; AnswerLines=$ansLines; Answer=($buf -join " ") }
  }
  return @($blocks)
}

# 读一份题目文件里声明的阈值；返回候选明细 / 被拒声明 / 生效值（无候选则 Threshold = $null）
function Get-DeclaredFloor {
  param([string]$Path)
  $lines = @(Get-Content -LiteralPath $Path -Encoding UTF8)
  $hits = @(); $rej = @()
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $l = $lines[$i]
    foreach ($p in $specRx) {
      foreach ($m in $p.Rx.Matches($l)) {
        $hits += [pscustomobject]@{ Line = ($i + 1); Kind = $p.Kind; Value = [int]$m.Groups[1].Value; Match = $m.Value.Trim() }
      }
    }
    foreach ($p in $measuredRx) {
      foreach ($m in $p.Rx.Matches($l)) {
        $rej += [pscustomobject]@{ Line = ($i + 1); Kind = $p.Kind; Value = [int]$m.Groups[1].Value; Match = $m.Value.Trim() }
      }
    }
  }
  $eff = $null
  if ($hits.Count -gt 0) { $eff = ($hits | Measure-Object -Property Value -Maximum).Maximum }
  return [pscustomobject]@{ Hits = $hits; Rejected = $rej; Threshold = $eff }
}

# ---- 主流程 ----
"=== sentence-gate：口语「话题简述」句数闸门 ==="

if ($File) {
  if (-not (Test-Path -LiteralPath $File)) { "INPUT ERROR: 找不到文件 " + $File; exit 2 }
  $files = @(Get-Item -LiteralPath $File)
  "模式：单文件 " + $files[0].FullName
} else {
  if (-not (Test-Path -LiteralPath $bank)) { "INPUT ERROR: 找不到题库目录 " + $bank; exit 2 }
  $files = @()
  foreach ($d in @($bank, (Join-Path $bank "prod"))) {
    if (-not (Test-Path -LiteralPath $d)) { continue }
    $files += @(Get-ChildItem -LiteralPath $d -Filter *.md -File)
  }
  $files = @($files | Sort-Object Name | Where-Object { $_.Name -notin @("INDEX.md","REVIEW-RUBRIC.md") -and $_.BaseName -notmatch "\.meta$" })
  "模式：全库（题目文件 data/item-bank 与 data/item-bank/prod；**不含** reviews/ 与 fixes/，那两处也有「参考作答」字样，但不是题面）"
  "扫描 " + $files.Count + " 份题目文件"
}

$rows = @(); $skipped = 0; $specErr = @(); $notes = @()
foreach ($f in $files) {
  $blocks = @(Get-AnswerBlocks $f.FullName)
  if ($blocks.Count -eq 0) { continue }
  $spoken = @($blocks | Where-Object { $_.HasAnswer })
  $skipped += ($blocks.Count - $spoken.Count)
  if ($spoken.Count -eq 0) { continue }

  $floor = Get-DeclaredFloor $f.FullName
  ""
  "--- " + $f.Name + " ---"
  if ($floor.Hits.Count -gt 0) {
    "  阈值来源（逐条列出，生效值取最严的一个）："
    foreach ($h in ($floor.Hits | Sort-Object Line, Value)) {
      "    L{0,-5} {1,-12} -> {2,3} 句   原文片段「{3}」" -f $h.Line, $h.Kind, $h.Value, $h.Match
    }
  }
  foreach ($r in ($floor.Rejected | Sort-Object Line)) {
    "    L{0,-5} 未采信「{1}」= {2}：题面里的实测汇总；用它当阈值等于闸门校验自己的输出，会永远 PASS" -f $r.Line, $r.Match, $r.Value
  }
  if ($null -eq $floor.Threshold) {
    $specErr += ($f.Name + "  [题面里读不到句数下限声明：既没有「不少于 N 句」，也没有「下限…提升至 N」]")
    "  阈值：读不到 -> SPEC ERROR（不猜数）"
    continue
  }
  "  生效阈值 = " + $floor.Threshold + " 句"

  foreach ($b in $spoken) {
    if ([string]::IsNullOrWhiteSpace($b.Answer)) {
      $specErr += ($f.Name + " / " + $b.Id + "  [有「参考作答」标记但内容为空]")
      "    {0,-22}   ? 句   -  SPEC ERROR（参考作答为空）" -f $b.Id
      continue
    }
    $cnt = Get-SentenceCount $b.Answer
    $n = $cnt.Strict
    $ok = ($n -ge $floor.Threshold)
    $rows += [pscustomobject]@{ File = $f.Name; Id = $b.Id; Sentences = $n; Loose = $cnt.Loose; Threshold = $floor.Threshold; Pass = $ok }
    "    {0,-22} {1,3} 句  {2} {3}  {4}" -f $b.Id, $n, $(if ($ok) { ">=" } else { "< " }), $floor.Threshold, $(if ($ok) { "PASS" } else { "FAIL" })
    if ($cnt.Loose -ne $n) {
      $notes += ($f.Name + " / " + $b.Id + "  含句末缩写点：判定用下界 " + $n + " 句，按句末读法为 " + $cnt.Loose + " 句。判定取下界（保守，可能少计）；两种读法差 " + ($cnt.Loose - $n) + " 句")
    }
    if ($b.AnswerLines -gt 1) {
      $notes += ($f.Name + " / " + $b.Id + "  参考作答占 " + $b.AnswerLines + " 行（规格要求「连续成段」；本闸门不判段落连续性，仅提示）")
    }
  }
  "  跳过 " + ($blocks.Count - $spoken.Count) + " 个不含「参考作答」的题块（听力题等，非本闸门适用范围，不是「通过」）"
}

""
"=== 汇总 ==="
"题块：计量 " + $rows.Count + " 个 ｜ 跳过（无「参考作答」结构）" + $skipped + " 个"
foreach ($nte in $notes) { "NOTE（不影响退出码）：" + $nte }

if ($rows.Count -eq 0 -and $specErr.Count -eq 0) {
  "没有任何题块带「**参考作答**」标记——本闸门无事可查。"
  "不能据此认为口语题达标（闸门没查到东西，不等于查过没问题）。"
  exit 2
}
if ($rows.Count -gt 0) {
  $mn = ($rows | Measure-Object -Property Sentences -Minimum).Minimum
  $mx = ($rows | Measure-Object -Property Sentences -Maximum).Maximum
  "实测句数分布（下界，判定用）：" + (($rows | Sort-Object File, Id | ForEach-Object { $_.Sentences }) -join "/") + "（最少 " + $mn + "，最多 " + $mx + "）"
  $amb = @($rows | Where-Object { $_.Loose -ne $_.Sentences })
  if ($amb.Count -gt 0) {
    "口径存疑题块 " + $amb.Count + " 个（含句末缩写点，下界与句末读法不一致）：" + (($amb | ForEach-Object { $_.Id + " " + $_.Sentences + "/" + $_.Loose }) -join "、")
  }
}
foreach ($s in $specErr) { "SPEC ERROR: " + $s }

if ($specErr.Count -gt 0) {
  "阈值/输入读不到，本闸门**没有结论**：exit 2"
  exit 2
}
$fail = @($rows | Where-Object { -not $_.Pass })
if ($fail.Count -gt 0) {
  "UNDER-FLOOR BLOCKS: " + $fail.Count
  foreach ($o in ($fail | Sort-Object File, Id)) {
    "  {0,-10} {1,-22} {2,3} 句 <  {3}" -f $o.File, $o.Id, $o.Sentences, $o.Threshold
  }
  "FAIL: " + $fail.Count + " 个口语题块低于其文件内声明的句数下限"
  exit 1
}
"PASS: all " + $rows.Count + " spoken blocks meet the declared sentence floor"
exit 0
