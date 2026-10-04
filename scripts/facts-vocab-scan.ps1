# facts-vocab-scan.ps1
# 措辞变体扫描：裁定升级措辞后，一次性确认 (a) 还有没有旧措辞没升格（漏刷）
#                              (b) 哪些命中是转引而不是正文，避免把别人的原话当自己的行改掉（误刷）
# 判据来源：CL 里那条界线——凡「我核过」的事就地写下依据与行号；
#          凡「我信了别人的执行结果」的事必须标明那是谁执行的。
# 单独成文件而不是塞进 facts.ps1：facts.ps1 是只读事实快照，本文件带配置、会被人编辑。
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

# ---- 配对表：裁定升级措辞后改这里，然后重跑本脚本 ----
$pairs = @(
  @{ Old = '此项无法判定，不是不合格'; New = '永久边界·待外部条件'; Scope = 'reviews' },
  @{ Old = '依据公开材料推定';            New = '永久边界·无官方依据'; Scope = 'reviews' }
)

# 命中行里出现这些词，判为「引用行」（转引别人的原话/执行结果），不刷
$quoteMark = '转录|据|引用|原句|改前|参见|见 L|见第'

foreach ($p in $pairs) {
  Write-Output ('-- 旧:[' + $p.Old + ']  ->  新:[' + $p.New + ']')
  if ($p.Scope -eq 'all') {
    $files = Get-ChildItem 'data','docs' -Recurse -Filter '*.md' -File
  } else {
    $files = Get-ChildItem 'data/item-bank/reviews' -Filter '*.md' -File
  }
  $body = 0; $quote = 0
  foreach ($f in $files) {
    $n = 0
    foreach ($ln in (Get-Content $f.FullName)) {
      $n++
      if ($ln.Contains($p.Old)) {
        if ($ln -match $quoteMark) { $quote++; $kind = '引用行' } else { $body++; $kind = '正文行' }
        Write-Output ('     ' + $f.Name + ':' + $n + '  [' + $kind + ']  ' + $ln.Trim())
      }
    }
  }
  Write-Output ('   正文行={0}  引用行={1}  合计={2}' -f $body, $quote, ($body + $quote))
  if ($body -eq 0) {
    Write-Output '   -> 正文行已全部升格（若你以为还有没刷的，多半是措辞变体不同，先看命中行）'
  }
}
