# Test Jenkins Permissions Script
# This script tests if the user has permission to create jobs via Jenkins REST API

param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins Permissions Test" -ForegroundColor Cyan
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

# Test 1: Check if we can access Jenkins
Write-Host "[TEST 1] Checking Jenkins connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$JenkinsUrl/api/json" -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "[SUCCESS] Jenkins is accessible" -ForegroundColor Green
    $jenkinsData = $response.Content | ConvertFrom-Json
    Write-Host "   Jenkins version: $($jenkinsData.version)" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] Cannot connect to Jenkins: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Check current user
Write-Host "[TEST 2] Checking current user..." -ForegroundColor Yellow
try {
    $userUrl = "$JenkinsUrl/me/api/json"
    $userResponse = Invoke-WebRequest -Uri $userUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $userData = $userResponse.Content | ConvertFrom-Json
    Write-Host "[SUCCESS] Current user: $($userData.id)" -ForegroundColor Green
    Write-Host "   Full name: $($userData.fullName)" -ForegroundColor Cyan
} catch {
    Write-Host "[WARNING] Cannot get user info: $_" -ForegroundColor Yellow
}

Write-Host ""

# Test 3: Get CSRF token
Write-Host "[TEST 3] Getting CSRF token..." -ForegroundColor Yellow
$csrfToken = $null
$csrfField = $null
try {
    $crumbUrl = "$JenkinsUrl/crumbIssuer/api/json"
    $crumbResponse = Invoke-WebRequest -Uri $crumbUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    if ($crumbResponse.StatusCode -eq 200) {
        $crumbData = $crumbResponse.Content | ConvertFrom-Json
        $csrfToken = $crumbData.crumb
        $csrfField = $crumbData.crumbRequestField
        Write-Host "[SUCCESS] CSRF token obtained" -ForegroundColor Green
        Write-Host "   Field: $csrfField" -ForegroundColor Cyan
        Write-Host "   Token: $($csrfToken.Substring(0, [Math]::Min(20, $csrfToken.Length)))..." -ForegroundColor Cyan
        $headers[$csrfField] = $csrfToken
    }
} catch {
    Write-Host "[WARNING] CSRF token not available (might be disabled): $_" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Check if user can read jobs
Write-Host "[TEST 4] Checking if user can read jobs..." -ForegroundColor Yellow
try {
    $jobsUrl = "$JenkinsUrl/api/json?tree=jobs[name]"
    $jobsResponse = Invoke-WebRequest -Uri $jobsUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $jobsData = $jobsResponse.Content | ConvertFrom-Json
    Write-Host "[SUCCESS] Can read jobs (found $($jobsData.jobs.Count) jobs)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Cannot read jobs: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        Write-Host "   HTTP Status: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""

# Test 5: Try to create a test job (will delete it immediately)
Write-Host "[TEST 5] Testing job creation permission..." -ForegroundColor Yellow
$testJobName = "test-permission-check-$(Get-Date -Format 'yyyyMMddHHmmss')"
$testJobConfig = @"
<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.47">
  <description>Test job for permission check</description>
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
    
    Write-Host "   Attempting to create test job: $testJobName" -ForegroundColor Cyan
    
    $createResponse = Invoke-WebRequest -Uri $createUrl -Method Post -Body $testJobConfig -Headers $headers -UseBasicParsing -ContentType "application/xml; charset=utf-8" -ErrorAction Stop
    
    Write-Host "[SUCCESS] Job creation test passed!" -ForegroundColor Green
    Write-Host "   Test job created: $testJobName" -ForegroundColor Cyan
    
    # Try to delete the test job
    Write-Host ""
    Write-Host "[CLEANUP] Deleting test job..." -ForegroundColor Yellow
    try {
        $deleteUrl = "$JenkinsUrl/job/$encodedJobName/doDelete"
        $deleteResponse = Invoke-WebRequest -Uri $deleteUrl -Method Post -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "[SUCCESS] Test job deleted" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Could not delete test job (you may need to delete it manually): $_" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $null
    $errorMessage = $_.Exception.Message
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "[ERROR] Job creation failed (HTTP $statusCode)" -ForegroundColor Red
            Write-Host "   Error details: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "[ERROR] Job creation failed (HTTP $statusCode)" -ForegroundColor Red
            Write-Host "   Error: $errorMessage" -ForegroundColor Red
        }
    } else {
        Write-Host "[ERROR] Job creation failed: $errorMessage" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "[TROUBLESHOOTING]" -ForegroundColor Yellow
    Write-Host "1. Make sure you clicked 'Save' in Jenkins Security configuration" -ForegroundColor Yellow
    Write-Host "2. Try logging out and logging back into Jenkins web UI" -ForegroundColor Yellow
    Write-Host "3. Wait a few seconds for permissions to take effect" -ForegroundColor Yellow
    Write-Host "4. Check Jenkins system log for more details" -ForegroundColor Yellow
    Write-Host "5. Verify the username and password are correct" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
