# Fix Jenkins URL Configuration
# This script helps diagnose and fix the "reverse proxy setup is broken" error
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$CorrectUrl = "http://10.80.8.199:9000",
    [string]$JenkinsUser = "admin",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins URL Configuration Fix" -ForegroundColor Cyan
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
    Write-Host "[SUCCESS] CSRF token obtained" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cannot get CSRF token: $_" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Jenkins is running" -ForegroundColor Cyan
    Write-Host "  2. URL is correct: $JenkinsUrl" -ForegroundColor Cyan
    Write-Host "  3. Username and password are correct" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Get current Jenkins URL configuration
Write-Host "[STEP 1] Checking current Jenkins URL configuration..." -ForegroundColor Yellow
try {
    $configUrl = "$JenkinsUrl/config.xml"
    $configResponse = Invoke-WebRequest -Uri $configUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $configXml = [xml]$configResponse.Content
    
    $currentUrl = $configXml.configuration.jenkinsUrl
    Write-Host "  Current Jenkins URL: $currentUrl" -ForegroundColor Cyan
    
    if ($currentUrl -ne $CorrectUrl) {
        Write-Host "  [WARNING] Jenkins URL mismatch!" -ForegroundColor Yellow
        Write-Host "    Current: $currentUrl" -ForegroundColor Red
        Write-Host "    Expected: $CorrectUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "  This is likely causing the 'reverse proxy setup is broken' error" -ForegroundColor Yellow
    } else {
        Write-Host "  [SUCCESS] Jenkins URL is correct" -ForegroundColor Green
    }
} catch {
    Write-Host "  [ERROR] Cannot read Jenkins configuration: $_" -ForegroundColor Red
    Write-Host "  You may need to fix this manually in Jenkins Web UI" -ForegroundColor Yellow
}

Write-Host ""

# Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SOLUTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To fix the 'reverse proxy setup is broken' error:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Method 1: Fix via Jenkins Web UI (Recommended)" -ForegroundColor Yellow
Write-Host "  1. Go to: Manage Jenkins -> System Configuration" -ForegroundColor Cyan
Write-Host "  2. Find 'Jenkins URL' field" -ForegroundColor Cyan
Write-Host "  3. Set it to: $CorrectUrl" -ForegroundColor Cyan
Write-Host "  4. Click 'Save' button" -ForegroundColor Cyan
Write-Host "  5. Refresh the page" -ForegroundColor Cyan
Write-Host ""
Write-Host "Method 2: Fix via Jenkins Configuration File" -ForegroundColor Yellow
Write-Host "  1. Stop Jenkins service" -ForegroundColor Cyan
Write-Host "  2. Edit Jenkins config.xml file" -ForegroundColor Cyan
Write-Host "  3. Find <jenkinsUrl> tag" -ForegroundColor Cyan
Write-Host "  4. Change value to: $CorrectUrl" -ForegroundColor Cyan
Write-Host "  5. Save the file" -ForegroundColor Cyan
Write-Host "  6. Start Jenkins service" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: If you're NOT using a reverse proxy:" -ForegroundColor Yellow
Write-Host "  - Jenkins URL should match the URL you use to access Jenkins" -ForegroundColor Cyan
Write-Host "  - If you access via http://10.80.8.199:9000, set Jenkins URL to that" -ForegroundColor Cyan
Write-Host "  - If you access via http://localhost:9000, set Jenkins URL to that" -ForegroundColor Cyan
Write-Host ""
Write-Host "After fixing, the 403 permission errors should also be resolved!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
