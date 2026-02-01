# Detailed Jenkins Diagnosis Script
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Detailed Jenkins Diagnosis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prepare authentication headers
$headers = @{}
if ($JenkinsUser -and $JenkinsPassword) {
    $pair = "$($JenkinsUser):$($JenkinsPassword)"
    $bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
    $base64 = [System.Convert]::ToBase64String($bytes)
    $headers["Authorization"] = "Basic $base64"
}

# Get CSRF token
try {
    $crumbUrl = "$JenkinsUrl/crumbIssuer/api/json"
    $crumbResponse = Invoke-WebRequest -Uri $crumbUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    if ($crumbResponse.StatusCode -eq 200) {
        $crumbData = $crumbResponse.Content | ConvertFrom-Json
        $headers[$crumbData.crumbRequestField] = $crumbData.crumb
        Write-Host "[INFO] CSRF token obtained" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARNING] Could not get CSRF token" -ForegroundColor Yellow
}

Write-Host ""

# Test 1: Try to create a job and capture full error response
Write-Host "[TEST] Attempting job creation with detailed error capture..." -ForegroundColor Yellow
$testJobName = "test-diagnosis-$(Get-Date -Format 'yyyyMMddHHmmss')"
$testJobConfig = @"
<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.47">
  <description>Test job for diagnosis</description>
  <keepDependencies>false</keepDependencies>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.95">
    <script>echo 'Test'</script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@

try {
    $encodedJobName = [System.Uri]::EscapeDataString($testJobName)
    $createUrl = "$JenkinsUrl/createItem?name=$encodedJobName"
    
    Write-Host "  URL: $createUrl" -ForegroundColor Gray
    Write-Host "  Method: POST" -ForegroundColor Gray
    Write-Host "  Headers:" -ForegroundColor Gray
    foreach ($key in $headers.Keys) {
        if ($key -ne "Authorization") {
            Write-Host "    $key : $($headers[$key].Substring(0, [Math]::Min(30, $headers[$key].Length)))..." -ForegroundColor Gray
        } else {
            Write-Host "    $key : [REDACTED]" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    $createResponse = Invoke-WebRequest -Uri $createUrl -Method Post -Body $testJobConfig -Headers $headers -UseBasicParsing -ContentType "application/xml; charset=utf-8" -ErrorAction Stop
    
    Write-Host "[SUCCESS] Job created successfully!" -ForegroundColor Green
    
    # Clean up
    try {
        $deleteUrl = "$JenkinsUrl/job/$encodedJobName/doDelete"
        Invoke-WebRequest -Uri $deleteUrl -Method Post -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
    } catch {}
    
} catch {
    $statusCode = $null
    $errorDetails = ""
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            $errorDetails = $errorBody
        } catch {
            $errorDetails = $_.Exception.Message
        }
    } else {
        $errorDetails = $_.Exception.Message
    }
    
    Write-Host "[ERROR] Job creation failed" -ForegroundColor Red
    Write-Host "  HTTP Status: $statusCode" -ForegroundColor Red
    Write-Host "  Error Details:" -ForegroundColor Red
    Write-Host $errorDetails -ForegroundColor Red
    Write-Host ""
    
    # Try to get more information about the error
    if ($statusCode -eq 403) {
        Write-Host "[ANALYSIS] 403 Forbidden Error Analysis" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "1. Authorization strategy is not 'Matrix-based security'" -ForegroundColor Cyan
        Write-Host "   -> Check: Manage Jenkins -> Security -> Authorization" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. User '$JenkinsUser' is not in the permission matrix" -ForegroundColor Cyan
        Write-Host "   -> Check: Add user to matrix and grant permissions" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Permissions were not saved properly" -ForegroundColor Cyan
        Write-Host "   -> Check: Click 'Save' at bottom of Security page" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Jenkins needs to be restarted" -ForegroundColor Cyan
        Write-Host "   -> Try: Restart Jenkins service" -ForegroundColor Gray
        Write-Host ""
        Write-Host "5. API access might be restricted" -ForegroundColor Cyan
        Write-Host "   -> Check: Jenkins system log for more details" -ForegroundColor Gray
        Write-Host ""
    }
}

Write-Host ""

# Test 2: Check if we can access the security configuration page
Write-Host "[TEST] Checking security configuration access..." -ForegroundColor Yellow
try {
    $securityUrl = "$JenkinsUrl/configureSecurity"
    $securityResponse = Invoke-WebRequest -Uri $securityUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "  [SUCCESS] Can access security configuration page" -ForegroundColor Green
    Write-Host "  Note: This means user has Administer permission" -ForegroundColor Gray
} catch {
    $statusCode = $null
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    if ($statusCode -eq 403) {
        Write-Host "  [WARNING] Cannot access security configuration (HTTP 403)" -ForegroundColor Yellow
        Write-Host "  This suggests user might not have Administer permission" -ForegroundColor Yellow
        Write-Host "  However, this doesn't explain why Job/Create doesn't work" -ForegroundColor Yellow
    } else {
        Write-Host "  [INFO] Security page access test: $_" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 3: Try to get user's effective permissions (if possible)
Write-Host "[TEST] Checking user permissions via API..." -ForegroundColor Yellow
Write-Host "  Note: Jenkins doesn't expose effective permissions via API" -ForegroundColor Gray
Write-Host "  You need to check manually in Jenkins UI" -ForegroundColor Gray

Write-Host ""

# Final recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CRITICAL CHECKS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please verify the following in Jenkins Web UI:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Authorization Strategy:" -ForegroundColor Yellow
Write-Host "   Location: Manage Jenkins -> Security -> Authorization" -ForegroundColor Cyan
Write-Host "   Must be: 'Matrix-based security' (NOT 'Logged-in users can do anything')" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. User in Matrix:" -ForegroundColor Yellow
Write-Host "   In the permission matrix table, verify 'Mose' appears as a row" -ForegroundColor Cyan
Write-Host "   If not, click 'Add user...' and add 'Mose'" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Permissions Checked:" -ForegroundColor Yellow
Write-Host "   For 'Mose' row, verify these are checked:" -ForegroundColor Cyan
Write-Host "   - Overall -> Administer (recommended)" -ForegroundColor Cyan
Write-Host "   OR at minimum:" -ForegroundColor Cyan
Write-Host "   - Overall -> Read" -ForegroundColor Cyan
Write-Host "   - Job -> Create" -ForegroundColor Cyan
Write-Host "   - Job -> Configure" -ForegroundColor Cyan
Write-Host "   - Job -> Read" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Configuration Saved:" -ForegroundColor Yellow
Write-Host "   Scroll to bottom of Security page" -ForegroundColor Cyan
Write-Host "   Click 'Save' button (not just 'Apply')" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Re-login:" -ForegroundColor Yellow
Write-Host "   Sign out from Jenkins" -ForegroundColor Cyan
Write-Host "   Wait 5-10 seconds" -ForegroundColor Cyan
Write-Host "   Sign back in as 'Mose'" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. If still failing, try restarting Jenkins:" -ForegroundColor Yellow
Write-Host "   This ensures all configuration changes are loaded" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
