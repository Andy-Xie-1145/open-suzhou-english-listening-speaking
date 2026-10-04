$root='D:\Projects\Open English Listening and Speaking'
$files = @(Get-ChildItem "$root\data\item-bank" -Filter '*.md' -File) + @(Get-ChildItem "$root\data\item-bank\prod" -Filter '*.md' -File)
$cls = @{}
foreach($f in $files){
  $lines = Get-Content $f.FullName
  foreach($ln in $lines){
    if($ln -match '^##\s+([ABCDE])[0-9A-Za-z]*-([0-9]+)'){
      $k = $Matches[1]
      if(-not $cls.ContainsKey($k)){ $cls[$k]=@{n=0; files=0} }
      $cls[$k].n++
    }
  }
}
foreach($k in 'A','B','C','D','E'){
  if($cls.ContainsKey($k)){ "$k  materials=" + $cls[$k].n } else { "$k  materials=0" }
}
