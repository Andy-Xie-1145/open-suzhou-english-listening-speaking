# 已归档题库一致性闸门
# 逐批核对：文件末尾汇总行声明的答案序列，是否与逐题 Answer 行逐位一致。
# 这是与 check-integrity.ps1 互补的检查：后者管「报告是否还成立」，本脚本管「文件自身是否自洽」。
$ErrorActionPreference = "Stop"
$bank = "D:\Projects\Open English Listening and Speaking\data\item-bank"

$rows = @()
foreach ($d in @($bank, (Join-Path $bank "prod"))) {
  if (-not (Test-Path -LiteralPath $d)) { continue }
  foreach ($f in (Get-ChildItem -LiteralPath $d -Filter *.md -File | Sort-Object Name)) {
    if ($f.Name -in @("REVIEW-RUBRIC.md","INDEX.md")) { continue }
    if ($f.BaseName -match "\.meta$") { continue }
    $lines = Get-Content -LiteralPath $f.FullName

    # 1) 逐题 Answer 行拼出的序列（A/B/C/E 类）
    $ans = ""
    foreach ($ln in $lines) { if ($ln -match "^\*\*Answer\*\*\s+([A-Z])\s*$") { $ans += $matches[1] } }

    # 2) 末尾汇总行声明的序列
    # 第 70 轮修过一次：原先对整行做 [A-Z] 提取，
    # 而汇总行里常有「Answer 行 15 ÷ ## 段数 15 = 1」这样的括注，
    # 结果把 Answer 的 A 也算进了序列，凭空多出一个字母。
    # 现在只取「答案序列」这个词之后的部分。
    $decl = ""
    for ($li = 0; $li -lt $lines.Count; $li++) {
      $ln = $lines[$li]
      if ($ln -match "答案序列") {
        $tail = $ln.Substring($ln.IndexOf("答案序列") + 4)
        $got = ([regex]::Matches($tail, "[A-Z]") | ForEach-Object { $_.Value }) -join ""
        # 第 113 轮补（R1-C6 的 V 轮 reviewer-2 报出）：汇总行可以拆成两行——
        # 第 N 行以「答案序列：」结尾、序列本身在第 N+1 行。
        # 原实现只取同一行，于是取到空串、报「无汇总行可比对」，
        # **既不是 PASS 也不是不一致告警**——又一次「看起来正常」。
        if ($got.Length -eq 0 -and ($li + 1) -lt $lines.Count) {
          # 下一行常以批次题号起头（如「C6-01  B D A C B」），
          # 直接做 [A-Z] 提取会把题号里的字母也算进序列，凭空多出字母。
          # 第 113 轮：修这个 bug 时又踩了一次——先把题号去掉再提取。
          $nx = $lines[$li + 1]
          $nx = [regex]::Replace($nx, "[A-E]\d+-\d+", " ")
          $got = ([regex]::Matches($nx, "[A-Z]") | ForEach-Object { $_.Value }) -join ""
        }
        if ($got.Length -gt 0) { $decl = $got }
      }
    }

    # 3) D 类：Answers 行本身不含答案，答案在它的下一行
    $dAns = 0; $dBlanks = 0
    for ($i = 0; $i -lt $lines.Count; $i++) {
      if ($lines[$i] -match "^\*\*Answers\*\*") {
        $dAns++
        $nxt = if ($i + 1 -lt $lines.Count) { $lines[$i+1] } else { "" }
        $dBlanks += ([regex]::Matches($nxt, "[①②③④⑤]")).Count
      }
    }

    $cls = $f.BaseName.Substring(0,1)
    $verdict = ""
    if ($ans.Length -gt 0 -and $decl.Length -gt 0) {
      $verdict = if ($ans -ceq $decl) { "PASS(" + $ans.Length + "题)" } else { "*** 不一致: Answer=" + $ans + " 声明=" + $decl }
    } elseif ($ans.Length -gt 0) {
      $verdict = "无汇总行可比对(" + $ans.Length + "题)"
    } elseif ($dAns -gt 0) {
      $verdict = "D类 Answers行=" + $dAns + " 槽位=" + $dBlanks
    } else {
      $verdict = "无 Answer/Answers 行(该类别可能本就不含)"
    }

    # 套利周期检测（L-85）：不只查 p=2..6，而是查所有「不超过序列长度一半」的周期。
    # 反例来源：B5 首版答案序列前 8 位与后 8 位完全相同（周期 8），p=2..6 全部查不出，
    # 而这种排列等于把一半题目白送给套规律者。
    $period = ""
    if ($ans.Length -ge 4) {
      $n = $ans.Length
      for ($p = 2; $p -le [Math]::Floor($n/2); $p++) {
        $ok = $true
        for ($i = $p; $i -lt $n; $i++) { if ($ans[$i] -ne $ans[$i - $p]) { $ok = $false; break } }
        if ($ok) { $period = " *** 套利周期 p=" + $p + " ***"; break }
      }
      # 补充：整段重复（前后半段互为副本）已含在上面的 p = n/2 情形里，这里再单列一次便于阅读
      if (($n % 2) -eq 0) {
        $h = [int]($n/2)
        if ($ans.Substring(0,$h) -ceq $ans.Substring($h,$h)) { $period = " *** 前后半段完全重复 ***" + $period }
      }
    }
    $verdict = $verdict + $period
    $where = if ($d -like "*prod*") { "prod" } else { "bank" }
    $rows += [pscustomobject]@{ Batch=$f.BaseName; Cls=$cls; Where=$where; Verdict=$verdict }
  }
}

Write-Output "批次 | 类 | 位置 | 一致性"
Write-Output ("-" * 96)
foreach ($r in $rows) { Write-Output ($r.Batch + " | " + $r.Cls + " | " + $r.Where + " | " + $r.Verdict) }

$bad = @($rows | Where-Object { $_.Verdict -like "*不一致*" })
Write-Output ("共 " + $rows.Count + " 个批次；答案序列不一致 " + $bad.Count + " 个。")
if ($bad.Count -gt 0) { exit 1 }
"ALL CONSISTENT"
# 显式退出 0：PowerShell 的 $LASTEXITCODE 会保留上一次脚本调用的值，
# 若不显式退出，调用方读到的可能是上一轮的 1，把通过误判成失败（与 wordcount-gate 同一个坑）。
exit 0