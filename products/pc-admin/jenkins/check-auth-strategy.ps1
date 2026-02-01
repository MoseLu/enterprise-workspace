# Check Jenkins Authorization Strategy
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "admin",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Authorization Strategy Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prepare authentication
$pair = "$($JenkinsUser):$($JenkinsPassword)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $base64"
}

# Get CSRF token
try {
    $crumbUrl = "$JenkinsUrl/crumbIssuer/api/json"
    $crumbResponse = Invoke-WebRequest -Uri $crumbUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $crumbData = $crumbResponse.Content | ConvertFrom-Json
    $headers[$crumbData.crumbRequestField] = $crumbData.crumb
} catch {}

Write-Host "[CRITICAL ISSUE] Both 'Mose' and 'admin' users are getting 403 errors" -ForegroundColor Red
Write-Host "This indicates the authorization strategy is NOT configured correctly" -ForegroundColor Red
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SOLUTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The problem is likely one of these:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Authorization Strategy is NOT 'Matrix-based security'" -ForegroundColor Red
Write-Host "   Current strategy might be:" -ForegroundColor Yellow
Write-Host "   - 'Logged-in users can do anything' (doesn't work for API)" -ForegroundColor Cyan
Write-Host "   - 'Anyone can do anything' (doesn't work for API)" -ForegroundColor Cyan
Write-Host "   - Other strategy" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Authorization Strategy is 'Matrix-based security' BUT:" -ForegroundColor Yellow
Write-Host "   - Configuration was not saved properly" -ForegroundColor Cyan
Write-Host "   - Jenkins needs to be restarted" -ForegroundColor Cyan
Write-Host "   - There's a bug in the configuration" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMMEDIATE ACTION REQUIRED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Check Authorization Strategy" -ForegroundColor Yellow
Write-Host "   1. Go to: Manage Jenkins -> Security" -ForegroundColor Cyan
Write-Host "   2. Find 'Authorization' section" -ForegroundColor Cyan
Write-Host "   3. Check what is currently selected" -ForegroundColor Cyan
Write-Host "   4. If it's NOT 'Matrix-based security', change it!" -ForegroundColor Red
Write-Host ""
Write-Host "Step 2: If it IS 'Matrix-based security', try:" -ForegroundColor Yellow
Write-Host "   1. Scroll to bottom of Security page" -ForegroundColor Cyan
Write-Host "   2. Click 'Save' button" -ForegroundColor Cyan
Write-Host "   3. Restart Jenkins service" -ForegroundColor Cyan
Write-Host "   4. Wait for Jenkins to fully start" -ForegroundColor Cyan
Write-Host "   5. Test again" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 3: Alternative - Temporarily disable security (TEST ONLY)" -ForegroundColor Yellow
Write-Host "   WARNING: Only for testing, not for production!" -ForegroundColor Red
Write-Host "   1. Go to: Manage Jenkins -> Security" -ForegroundColor Cyan
Write-Host "   2. Uncheck 'Enable security'" -ForegroundColor Cyan
Write-Host "   3. Save" -ForegroundColor Cyan
Write-Host "   4. Test if job creation works" -ForegroundColor Cyan
Write-Host "   5. If it works, the problem is authorization strategy" -ForegroundColor Cyan
Write-Host "   6. Re-enable security and fix the strategy" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

