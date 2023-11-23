$folders = Get-ChildItem -Path "C:\Galileo"
foreach($folder in $folders)
{
    Write-Host "Updating" $folder.FullName
    $branch = &git -C $folder.FullName rev-parse --abbrev-ref HEAD
    if ($branch -ne 'master')
    {
        git -C $folder.FullName reset --hard origin/master
        git -C $folder.FullName checkout master
    }
    git -C $folder.FullName pull
    git -C $folder.FullName branch |`
        %{ $_.Trim() } |`
        ?{ $_ -ne 'master' -and $_ -ne '* master' } |`
        %{ git -C $folder.FullName branch -D $_ }
}