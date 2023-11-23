$user = "namito.yokota@hexagon.com"
$token = "dzykp3x4ubxr4xi3nb3gdqniaagtczvkuszhfneaplc74iwz4f2a"
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(("{0}:{1}" -f $user, $token)))
$headers = @{Authorization=("Basic {0}" -f $base64AuthInfo)}
$repoEndpoint = "https://dev.azure.com/hexagon-si-gpc/OTHERHEXPRODS.SCPSAS/_apis/git/repositories?api-version=6.1-preview.1"
$repos = Invoke-RestMethod -ErrorVariable restError -Uri $repoEndpoint -Method GET -ContentType "application/json" -Headers $headers
$prcounts = New-Object -TypeName Hashtable
foreach ($repo in $repos.value)
{
    $PrEndpoint = "https://dev.azure.com/hexagon-si-gpc/OTHERHEXPRODS.SCPSAS/_apis/git/repositories/$($repo.id)/pullrequests?api-version=6.1-preview.1&searchCriteria.status=completed&`$top=5000"
    $prs = Invoke-RestMethod -ErrorVariable restError -Uri $PrEndpoint -Method GET -ContentType "application/json" -Headers $headers -ErrorAction SilentlyContinue
    if(!$restError)
    {
        foreach($pr in $prs.value)
        {
            $count = 0
            if($prcounts[$pr.createdBy.uniqueName])
            {
                $count = $prcounts[$pr.createdBy.uniqueName]
            }
            $prcounts[$pr.createdBy.uniqueName] = $count + 1
        }
    }
}

$prcounts.GetEnumerator() | Sort Value -Descending