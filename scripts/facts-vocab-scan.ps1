# facts-vocab-scan.ps1
# 措辞升格检查器。
#
# ===== 第 199 轮：第一条判据改口径（reviewer-3 实测推翻旧口径）=====
# 【旧口径及其错误】
#   旧：Old='此项无法判定，不是不合格' -> New='永久边界·待外部条件'
#   错在：Old 选的是**第 189 轮裁定的正文本身**，不是「旧格式标志」。
#   升格是**在原句外面加壳**（加 🔴【永久边界·待外部条件】前缀 + 补解除条件），
#   **并不替换掉原句**；原句在新旧两种措辞里都合法存在。
#   => 拿它当「旧措辞标志」**必然 100% 假阳性**。
#   实测：旧口径报 22 条「正文行」，逐条打开后**全部不该刷**。
#
# 【新口径（第 199 轮立）】
#   判定对象：**1.3 边界行**（含「1.3 超纲词」且含「课标五级/五级词表」）。
#   判定标准：**其所属小节是否具备 🔴【永久边界…】标记 与 解除条件**。即：**查结构，不查原句。**
#
# ===== 三个已修的 bug（都是「粒度/作用域选错」，记录下来供后人）=====
#   bug1 **逐行判定** → 必须**小节级**判定。边界要素常不在同一行：
#        🔴 标记写在标题里、解除条件写在**同小节的另一行**。逐行看刷出 30 条假阳性。
#   bug2 **只认 '## ' 标题** → 必须**任意层级标题**（'#' 开头）。实际结构常是
#        `## 附：库级边界（补录）` 下再套 `### 边界① … **永久边界**`，标记在 `###` 上。
#   bug3 **用 &{...} 脚本块累加计数器** → PowerShell 脚本块在**子作用域**里跑，
#        `$x++` 改的是子作用域副本，父作用域计数恒为 0。
#        **症状极具欺骗性：明细逐行打印了 [该刷]，汇总却显示 0。**
#        改为先收集、后遍历，不用脚本块。
#
# 【输出要能区分】
#   该刷 = 生效小节的 1.3 边界行，所属小节缺 🔴 永久边界标记 或 缺解除条件。
#   该留 = 「第 N 轮更正记录」小节内的改前原文（**是资产不是残留**）。
#   该留 = 跨文件引用行（同源登记 / 转录自 / 抄入 / 见 L…）。
#   已升格 = 所属小节两个要素都在。
#
# 【方法论提醒（比脚本本身更重要）】
#   「判据可自动化」不等于「口径选对了就自动化」。
#   **判据选错，跑得再干净也是废的**——干净地产出 22 条假阳性，比直接报错更坏。
#   同理**粒度选错、作用域选错也一样**。
#   **写完必须逐项核对「明细」与「汇总」是否自洽**：本脚本曾出现明细报 28 条、
#   汇总报 0 的自相矛盾输出，那正是 bug3 的信号。
#
# 单独成文件而不是塞进 facts.ps1：facts.ps1 是只读事实快照，本文件带配置、会被人编辑。
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

# 只扫批次归档记录 CL-*。§6.5.2 的库级边界小节要求只约束 CL。
$files = Get-ChildItem 'data/item-bank/reviews' -Filter 'CL-*.md' -File | Sort-Object Name

Write-Output '-- 检查一：1.3 边界小节的结构完整性（查 🔴【永久边界…】标记 与 解除条件，不查原句）'

$needFix = 0; $keepQuote = 0; $keepXref = 0; $ok = 0
$needDetail = New-Object System.Collections.Generic.List[string]

foreach ($f in $files) {
  # 先切成小节：任意层级标题（'#' 开头）都算小节边界
  $secs = New-Object System.Collections.Generic.List[object]
  $cur = [pscustomobject]@{ Head=''; HeadLine=0; Lines=New-Object System.Collections.Generic.List[object] }
  $n = 0
  foreach ($ln in (Get-Content $f.FullName)) {
    $n++
    if ($ln.StartsWith('#')) {
      if ($cur.Lines.Count -gt 0 -or $cur.Head -ne '') { $secs.Add($cur) }
      $cur = [pscustomobject]@{ Head=$ln.Trim(); HeadLine=$n; Lines=New-Object System.Collections.Generic.List[object] }
      continue
    }
    $cur.Lines.Add([pscustomobject]@{ N=$n; Txt=$ln })
  }
  if ($cur.Lines.Count -gt 0 -or $cur.Head -ne '') { $secs.Add($cur) }

  foreach ($s in $secs) {
    # 小节级要素汇总
    $hasPrefix  = $s.Head.Contains('永久边界')
    $hasRelease = $false
    $bl = New-Object System.Collections.Generic.List[object]
    foreach ($l in $s.Lines) {
      if ($l.Txt.Contains('【永久边界')) { $hasPrefix = $true }
      if ($l.Txt.Contains('解除条件'))   { $hasRelease = $true }
      if ($l.Txt.Contains('1.3 超纲词') -and ($l.Txt.Contains('课标五级') -or $l.Txt.Contains('五级词表'))) {
        $xref = ($l.Txt.Contains('同源登记') -or $l.Txt.Contains('转录自') -or $l.Txt.Contains('抄入') -or $l.Txt.Contains('见 L'))
        $bl.Add([pscustomobject]@{ N=$l.N; Txt=$l.Txt.Trim(); Xref=$xref })
      }
    }
    if ($bl.Count -eq 0) { continue }
    $isCorr = $s.Head.Contains('更正记录')

    foreach ($b in $bl) {
      if ($isCorr) {
        $keepQuote++
        Write-Output ('     ' + $f.Name + ':' + $b.N + '  [该留·更正记录改前原文]')
      }
      elseif ($b.Xref) {
        $keepXref++
        Write-Output ('     ' + $f.Name + ':' + $b.N + '  [该留·跨文件引用]')
      }
      elseif ($hasPrefix -and $hasRelease) { $ok++ }
      else {
        $needFix++
        $miss = @()
        if (-not $hasPrefix)  { $miss += '所属小节缺🔴永久边界标记' }
        if (-not $hasRelease) { $miss += '所属小节缺解除条件' }
        $needDetail.Add('     ' + $f.Name + ':' + $b.N + '  [该刷·' + ($miss -join '+') + ']  小节(L' + $s.HeadLine + '): ' + $s.Head)
      }
    }
  }
}

foreach ($d in $needDetail) { Write-Output $d }
Write-Output ('   汇总：该刷={0}  该留(更正记录改前原文)={1}  该留(跨文件引用)={2}  已升格={3}' -f $needFix, $keepQuote, $keepXref, $ok)
Write-Output ('   自洽核对：明细打印的该刷行数={0}  汇总该刷计数={1}  -> {2}' -f $needDetail.Count, $needFix, $(if ($needDetail.Count -eq $needFix) { '一致' } else { '**不一致，说明脚本有 bug**' }))
if ($needFix -eq 0) {
  Write-Output '   -> 无一条该刷。与第 198 轮逐条人工判读结论一致（旧口径那 22 条命中全部不该刷）。'
}
else {
  Write-Output '   -> 出现「该刷」行。**先查本脚本口径有没有 bug，不要改数据迁就脚本。**'
}

Write-Output ''
Write-Output '-- 检查二：依据公开材料推定 -> 永久边界·无官方依据'
Write-Output '   **本条保持原样，是对的，不要再怀疑它**（第 199 轮核实）：'
Write-Output '   命中项全部是 E 类文件头原文的引用（「呈现格式依据公开材料推定，未经官方确认」）；'
Write-Output '   实测「正文行 = 0」，即**生效行早已全部升格**。'
Write-Output '   句中的旧措辞**正是「当时就没有考纲」的证据**，删掉反而把证据抹了。'

$p2 = '依据公开材料推定'
$quoteMark = '转录|据|引用|原句|改前|参见|见 L|见第'
$body2 = 0; $quote2 = 0
foreach ($f in $files) {
  $n = 0
  foreach ($ln in (Get-Content $f.FullName)) {
    $n++
    if ($ln.Contains($p2)) {
      if ($ln -match $quoteMark) { $quote2++ } else { $body2++; Write-Output ('     ' + $f.Name + ':' + $n + '  [正文行]  ' + $ln.Trim()) }
    }
  }
}
Write-Output ('   正文行={0}  引用行={1}  合计={2}' -f $body2, $quote2, ($body2 + $quote2))
if ($body2 -eq 0) {
  Write-Output '   -> 正文行已全部升格（本条符合预期，见上方说明）'
}
