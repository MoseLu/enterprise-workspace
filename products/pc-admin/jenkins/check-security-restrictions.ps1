# Check for security restrictions that might block API access
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking Security Restrictions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prepare authentication
$pair = "$($JenkinsUser):$($JenkinsPassword)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $base64"
}

Write-Host "[TEST 1] Testing localhost access..." -ForegroundColor Yellow
try {
    $testUrl = "http://localhost:9000/api/json"
    $response = Invoke-WebRequest -Uri $testUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "  [SUCCESS] localhost access works" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] localhost access failed: $_" -ForegroundColor Red
}

Write-Host ""

Write-Host "[TEST 2] Testing IP address access..." -ForegroundColor Yellow
try {
    $testUrl = "http://10.80.8.199:9000/api/json"
    $response = Invoke-WebRequest -Uri $testUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "  [SUCCESS] IP address access works" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] IP address access failed: $_" -ForegroundColor Red
}

Write-Host ""

Write-Host "[INFO] Both localhost and IP should work for API calls" -ForegroundColor Cyan
Write-Host "The 403 error is a permission issue, not a network/URL issue" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Recommendation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can use either:" -ForegroundColor Yellow
Write-Host "  - http://localhost:9000" -ForegroundColor Cyan
Write-Host "  - http://10.80.8.199:9000" -ForegroundColor Cyan
Write-Host ""
Write-Host "But the 403 error indicates a permission configuration issue." -ForegroundColor Yellow
Write-Host "Please check:" -ForegroundColor Yellow
Write-Host "  1. Authorization strategy = 'Matrix-based security'" -ForegroundColor Cyan
Write-Host "  2. User 'Mose' is in the permission matrix" -ForegroundColor Cyan
Write-Host "  3. Permissions are saved" -ForegroundColor Cyan
Write-Host "  4. User has re-logged in" -ForegroundColor Cyan
Write-Host ""
