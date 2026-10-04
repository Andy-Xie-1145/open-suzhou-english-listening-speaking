# 应试捷径检测：整卷有没有可被机械策略攻破的规律
# 第 73 轮建；第 74 轮补上 D 类（词库填空）并修两个解析 bug：
#   1) D 类词库行是「A. 短语」，没有前导横线；A/B/C 的选项行才是「- A. 选项」
#   2) D 类一行有 3 个槽位（「① B　② A　③ C」），用 -match 每行只会抓到第一个，必须用 [regex]::Matches
$ErrorActionPreference = "Stop"
$root = "D:\Projects\Open English Listening and Speaking\data\item-bank"

$items = @()
$dMat = 0
$errs = @()
foreach ($d in @($root, (Join-Path $root "prod"))) {
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md","INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $cls = $f.BaseName.Substring(0,1)
    $lines = Get-Content -LiteralPath $f.FullName
    if ($cls -eq "D") {
      # 第 110 轮修两个解析 bug：
      #   1) 词库必须按 ## 标题逐份重置。原来 $bank 建在文件级，一份文件里 10 份材料的
      #      词库被合并成同一个字典，又按引用传给每个槽位，于是「最长/最短」启发式
      #      实际比的是全文件最后一份材料的词库，不是本槽位所属材料的那份。
      #   2) 槽位只从 **Answers** 的下一行取。原来对每一行都做 Matches，而文件末尾的
      #      「本批汇总」行把全批 30 个答案又写了一遍，于是 D6 被数成 60 空（实为 30）。
      $bank = @{}; $snap = $null; $wantAns = $false
      foreach ($l in $lines) {
        # 材料以「## <字母><批次>-<两位序号> 标题」开头；批次总标题是单个 # ，不算材料。
        if ($l -match "^##\s+A?[A-E]?\d*-\d+\s") { $bank = @{}; $snap = $null; $wantAns = $false; $dMat++; continue }
        if ($l -match "^-?\s*([A-E])\.\s+(.+)$") { $bank[$matches[1]] = $matches[2]; continue }
        if ($l -match "Answers\*\*") { $snap = @{} + $bank; $wantAns = $true; continue }
        if ($wantAns) {
          foreach ($m in [regex]::Matches($l, "([①②③④⑤])\s*([A-E])")) {
            $items += [pscustomobject]@{ B=$f.BaseName; Ans=$m.Groups[2].Value; O=$snap }
          }
          $wantAns = $false
        }
      }
      continue
    }
    if ($cls -eq "E") { continue }
    # 第 113 轮修：这里原有一个「答案与选项错位一题」的 bug。
    # 原逻辑在遇到 **Answer** X 时才把手上累积的 $opts 冲出去，于是
    #   Q1 的答案 被配上了 Q2 的选项、Q2 的答案 被配上 Q3 的选项……
    # 结果「正确项总是最长/最短」这两条启发式**一直在拿下一题的选项去比**，
    # 测出来的是垃圾。reviewer-2 独立测出 C 类 50-73% 的偏差，闸门却报 7.3%，
    # 根因就在这里。
    # 正确做法：**见到题号标记就清空选项，见到 Answer 就连同当前选项一起发出。**
    $opts = @{}; $qid = ""; $qn = 0
    foreach ($l in $lines) {
      # 第 113 轮补：记题号。此前 items 里只有批次与答案字母，
      # 逐题极差检查报出「某批次某处多 N 词」却**说不出是哪一题**——
      # 报出问题却不给位置，调度方无法派单。这是闸门的可用性缺陷。
      if ($l -match "^##\s+(\S+)") { $cur = $matches[1]; continue }
      if ($l -match "^\*\*(Question|Q(\d+))\*\*\s*$") { $opts = @{}; $qn = [int]$matches[2]; continue }
      if ($l -match "^\*\*Answer\*\*\s+([A-E])\s*$") {
        if ($opts.Count -gt 0) {
          $tag = if ($qn -gt 0) { "Q" + $qn } else { "?" }
          $items += [pscustomobject]@{ B=$f.BaseName; Id=($cur + "-" + $tag); Ans=$matches[1]; O=$opts }
        }
        $opts = @{}; continue
      }
      if ($l -match "^-?\s*([A-E])\.\s+(.+)$") { $opts[$matches[1]] = $matches[2] }
    }
  }
}

$dc = @($items | Where-Object { $_.B -like "D*" }).Count
Write-Output ("总题数/槽位数 " + $items.Count + "（其中 D 类槽位 " + $dc + "）")
Write-Output ""

# 第 110 轮补：解析器自身的自检。
# 「D 类槽位数 = D 类材料数 x 每份空数」是硬等式，不等即解析器读错了文件——
# 历史上正是缺这道自检，D6 的末尾汇总行把 30 空读成 60 空却无人发现。
if ($dMat -gt 0) {
  $want = $dMat * 3
  if ($dc -ne $want) {
    $errs += ("解析错误：D 类共 " + $dMat + " 份材料，每份 3 空，应为 " + $want + " 空，实读出 " + $dc + " 空")
  }
}
if ($errs.Count -gt 0) {
  Write-Output "## 解析器自检"
  foreach ($e in $errs) { Write-Output ("FAIL | " + $e) }
  Write-Output ""
  Write-Output "以上是解析错误，不是题目缺陷。请先修脚本，再谈启发式结论。"
  exit 1
}
$okMsg = "解析器自检通过（D 类 " + $dMat + " 份 x 3 空 = " + $dc + " 空）"
Write-Output $okMsg
Write-Output ""
Write-Output "启发式 | 命中 | 命中率 | 随机基线 | 判定"

function Show([string]$n, [scriptblock]$p, [double]$base) {
  $h = 0; foreach ($i in $items) { if (& $p $i) { $h++ } }
  $r = if ($items.Count -gt 0) { $h / $items.Count } else { 0 }
  $flag = if ($r -gt $base + 0.05) { "**可疑**" } else { "正常" }
  Write-Output ("$n | $h | " + [Math]::Round($r*100,1) + "% | " + [Math]::Round($base*100,0) + "% | $flag")
}

Show "正确项总是 A" { param($x) $x.Ans -eq "A" } 0.25
Show "正确项总是 B" { param($x) $x.Ans -eq "B" } 0.25
Show "正确项总是 C" { param($x) $x.Ans -eq "C" } 0.25
Show "正确项总是 D" { param($x) $x.Ans -eq "D" } 0.25
Show "正确项总是 E" { param($x) $x.Ans -eq "E" } 0.25
Show "正确项总是最长" {
  param($x)
  if (-not $x.O.ContainsKey("A") -or -not $x.O.ContainsKey("D")) { return $false }
  $lens = @{}; foreach ($k in $x.O.Keys) { $lens[$k] = ($x.O[$k] -split "\s+").Count }
  $mx = ($lens.Values | Measure-Object -Maximum).Maximum
  $b = @($lens.Keys | Where-Object { $lens[$_] -eq $mx })
  if ($b.Count -ne 1) { return $false }
  return ($b[0] -eq $x.Ans)
} 0.25
Show "正确项总是最短" {
  param($x)
  if (-not $x.O.ContainsKey("A") -or -not $x.O.ContainsKey("D")) { return $false }
  $lens = @{}; foreach ($k in $x.O.Keys) { $lens[$k] = ($x.O[$k] -split "\s+").Count }
  $mn = ($lens.Values | Measure-Object -Minimum).Minimum
  $b = @($lens.Keys | Where-Object { $lens[$_] -eq $mn })
  if ($b.Count -ne 1) { return $false }
  return ($b[0] -eq $x.Ans)
} 0.25

# 第 113 轮补：按类别分列。
# 起因是 reviewer-2 发现 C 类短文批次「正确项总是最长」高达 50-73%（随机基线 25%），
# 而本脚本一直报「正常」——**因为它把 A/B/C 混在一起算，全库 8.1% 把单类体裁的系统偏差稀释掉了**。
# 这正是 L-85 的变体：阈值是照惯例定的，没有问「它对哪一层生效」。
# **混算会把某一类的系统性缺陷洗成正常**，所以必须分类目判。
Write-Output ""
Write-Output "按类别分列（单类体裁的系统偏差会被混算稀释）"
$brows = @{}
foreach ($x in $items) {
  $cc = $x.B.Substring(0,1)
  if (-not $brows.ContainsKey($cc)) { $brows[$cc] = [pscustomobject]@{ Long=0; Short=0; N=0 } }
  $brows[$cc].N++
  if (-not $x.O.ContainsKey("A") -or -not $x.O.ContainsKey("D")) { continue }
  $lens2 = @{}; foreach ($k in $x.O.Keys) { $lens2[$k] = ($x.O[$k] -split "\s+").Count }
  $mx2 = ($lens2.Values | Measure-Object -Maximum).Maximum
  $bk = @($lens2.Keys | Where-Object { $lens2[$_] -eq $mx2 })
  if ($bk.Count -eq 1 -and $bk[0] -eq $x.Ans) { $brows[$cc].Long++ }
  $mn2 = ($lens2.Values | Measure-Object -Minimum).Minimum
  $bk2 = @($lens2.Keys | Where-Object { $lens2[$_] -eq $mn2 })
  if ($bk2.Count -eq 1 -and $bk2[0] -eq $x.Ans) { $brows[$cc].Short++ }
}
Write-Output "类别 | 题数 | 总是最长 | 率 | 总是最短 | 率 | 判定"
foreach ($cc in ($brows.Keys | Sort-Object)) {
  $rr = $brows[$cc]
  if ($rr.N -eq 0) { continue }
  $lr = $rr.Long / $rr.N
  $sr = $rr.Short / $rr.N
  $fl = if ($lr -gt 0.35 -or $sr -gt 0.35) { "**可疑**" } else { "正常" }
  Write-Output ("{0} | {1} | {2} | {3}% | {4} | {5}% | {6}" -f $cc, $rr.N, $rr.Long, [Math]::Round($lr*100,1), $rr.Short, [Math]::Round($sr*100,1), $fl)
}
Write-Output ""
Write-Output "单类阈值 35%（随机基线 25% + 10 个点）。可疑则处置：缩短正确项或加长干扰项，"
Write-Output "目标逐题四选项长度彼此相差 4 词以内，把「一律选最长」压回 35% 以下。"

# 第 113 轮补：逐题极差检查（与上面的聚合率互补）
# 起因是 writer-a 在 A 类量出 A28-13：正确项比最长干扰项多 7 词，
# 而 **A 类聚合率 15.9%、阈值 35%、判「正常」——这道题被聚合率稀释掉了，闸门根本没报**。
#
# **两者互补，不可互相替代**：
#   聚合率抓「系统性倾向」——整批的倾向会让「一律选最长」可套。
#   逐题极差抓「极端个例」——单题就能被套，与整批倾向无关。
# **「聚合率过了」不等于「每一题都过」**，这是今天实测反例。
#
# 阈值取 6 而不是 4：4 是「四项两两相差」的验收线，6 是「单题可套捷径」的判定线，
# 两者不是一回事。过严会把并列最长、措辞差异这类无害情形也拉进来。

$margins = @{}
foreach ($x in $items) {
  if (-not $x.O.ContainsKey("A") -or -not $x.O.ContainsKey("D")) { continue }
  $ln = @{}; foreach ($k in $x.O.Keys) { $ln[$k] = ($x.O[$k] -split "\s+").Count }
  if (-not $ln.ContainsKey($x.Ans)) { continue }
  $others = @(); foreach ($k in $ln.Keys) { if ($k -ne $x.Ans) { $others += $ln[$k] } }
  if ($others.Count -eq 0) { continue }
  $mxOther = ($others | Measure-Object -Maximum).Maximum
  $mg = $ln[$x.Ans] - $mxOther
  if ($mg -gt 6) {
    $key = $x.B
    if (-not $margins.ContainsKey($key)) { $margins[$key] = @() }
    $margins[$key] += ("  " + $x.Id + "  正确项 " + $ln[$x.Ans] + " 词，比最长干扰项多 " + $mg + " 词  (答案 " + $x.Ans + ")")
  }
}
if ($margins.Count -eq 0) {
  Write-Output "逐题极差：全部 <= 6 词，无单题可套捷径"
} else {
  Write-Output ("逐题极差 > 6 词的题，按批次列出（这些即使聚合率正常也构成捷径）")
  foreach ($b in ($margins.Keys | Sort-Object)) {
    Write-Output ("  " + $b + "  " + $margins[$b].Count + " 处")
    foreach ($d in $margins[$b]) { Write-Output $d }
  }
}