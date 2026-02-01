# Check Jenkins System Log for Permission Errors
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456"
)

Write-Host "Checking Jenkins system log..." -ForegroundColor Cyan

$headers = @{}
if ($JenkinsUser -and $JenkinsPassword) {
    $pair = "$($JenkinsUser):$($JenkinsPassword)"
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
    $base64 = [System.Convert]::ToBase64String($bytes)
    $headers["Authorization"] = "Basic $base64"
}

try {
    # Get system log (last 100 lines)
    $logUrl = "$JenkinsUrl/log/all"
    $response = Invoke-WebRequest -Uri $logUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $logContent = $response.Content
    
    # Extract recent error lines
    $lines = $logContent -split "`n"
    $errorLines = $lines | Where-Object { $_ -match "(403|Forbidden|Permission|denied|Mose)" } | Select-Object -Last 20
    
    if ($errorLines) {
        Write-Host "Recent permission-related log entries:" -ForegroundColor Yellow
        $errorLines | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    } else {
        Write-Host "No recent permission errors found in log" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not access Jenkins log: $_" -ForegroundColor Red
}
