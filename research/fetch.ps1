
param([string[]]$Urls, [int]$MaxChars = 30000)
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
foreach ($u in $Urls) {
  try {
    $resp = Invoke-WebRequest -Uri $u -UserAgent $ua -Headers @{"Accept-Language"="zh-CN,zh;q=0.9"} -TimeoutSec 45 -UseBasicParsing
    $t = $resp.Content
    $t = [regex]::Replace($t, "<script[\s\S]*?</script>", " ")
    $t = [regex]::Replace($t, "<style[\s\S]*?</style>", " ")
    $t = [regex]::Replace($t, "<!--[\s\S]*?-->", " ")
    $t = [regex]::Replace($t, "<[^>]+>", "`n")
    $t = [System.Net.WebUtility]::HtmlDecode($t)
    $lines = $t -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
    $joined = $lines -join "`n"
    if ($joined.Length -gt $MaxChars) { $joined = $joined.Substring(0,$MaxChars) + "`n...[TRUNCATED]" }
    Write-Output "########## $u"
    Write-Output $joined
    Write-Output ""
  } catch {
    Write-Output "########## $u  ERROR: $($_.Exception.Message)"
    Write-Output ""
  }
}
