# Test Jenkins API directly using the documented method
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Direct Jenkins API Test" -ForegroundColor Cyan
Write-Host "Following official API documentation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prepare authentication
$pair = "$($JenkinsUser):$($JenkinsPassword)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)

# Get CSRF token
$headers = @{
    "Authorization" = "Basic $base64"
}

Write-Host "[STEP 1] Getting CSRF token..." -ForegroundColor Yellow
try {
    $crumbUrl = "$JenkinsUrl/crumbIssuer/api/json"
    $crumbResponse = Invoke-WebRequest -Uri $crumbUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $crumbData = $crumbResponse.Content | ConvertFrom-Json
    $headers[$crumbData.crumbRequestField] = $crumbData.crumb
    Write-Host "[SUCCESS] CSRF token obtained" -ForegroundColor Green
    Write-Host "  Field: $($crumbData.crumbRequestField)" -ForegroundColor Cyan
} catch {
    Write-Host "[WARNING] Could not get CSRF token: $_" -ForegroundColor Yellow
}

Write-Host ""

# Test job creation using exact API documentation method
Write-Host "[STEP 2] Creating test job using official API method..." -ForegroundColor Yellow
$testJobName = "test-api-direct-$(Get-Date -Format 'yyyyMMddHHmmss')"
$testJobConfig = @"
<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.47">
  <description>Test job created via REST API</description>
  <keepDependencies>false</keepDependencies>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.95">
    <script>echo 'Test from API'</script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@

# According to API docs: POST config.xml to /createItem?name=JOBNAME with Content-Type: application/xml
$createUrl = "$JenkinsUrl/createItem?name=$testJobName"
$apiHeaders = @{
    "Authorization" = "Basic $base64"
    "Content-Type" = "application/xml"
}

# Add CSRF token if available
if ($headers.ContainsKey($crumbData.crumbRequestField)) {
    $apiHeaders[$crumbData.crumbRequestField] = $headers[$crumbData.crumbRequestField]
}

Write-Host "  URL: $createUrl" -ForegroundColor Gray
Write-Host "  Method: POST" -ForegroundColor Gray
Write-Host "  Content-Type: application/xml" -ForegroundColor Gray
Write-Host "  Headers: Authorization, $($crumbData.crumbRequestField)" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $createUrl -Method Post -Body $testJobConfig -Headers $apiHeaders -UseBasicParsing -ErrorAction Stop
    
    Write-Host "[SUCCESS] Job created successfully!" -ForegroundColor Green
    Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "  Job Name: $testJobName" -ForegroundColor Cyan
    Write-Host "  Job URL: $JenkinsUrl/job/$testJobName" -ForegroundColor Cyan
    Write-Host ""
    
    # Try to delete the test job
    Write-Host "[CLEANUP] Deleting test job..." -ForegroundColor Yellow
    try {
        $deleteUrl = "$JenkinsUrl/job/$testJobName/doDelete"
        $deleteHeaders = @{
            "Authorization" = "Basic $base64"
        }
        if ($headers.ContainsKey($crumbData.crumbRequestField)) {
            $deleteHeaders[$crumbData.crumbRequestField] = $headers[$crumbData.crumbRequestField]
        }
        Invoke-WebRequest -Uri $deleteUrl -Method Post -Headers $deleteHeaders -UseBasicParsing -ErrorAction Stop | Out-Null
        Write-Host "[SUCCESS] Test job deleted" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Could not delete test job: $_" -ForegroundColor Yellow
        Write-Host "  You may need to delete it manually: $JenkinsUrl/job/$testJobName" -ForegroundColor Cyan
    }
    
} catch {
    $statusCode = $null
    $errorBody = ""
    
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
        } catch {
            $errorBody = $_.Exception.Message
        }
    } else {
        $errorBody = $_.Exception.Message
    }
    
    Write-Host "[ERROR] Job creation failed" -ForegroundColor Red
    Write-Host "  HTTP Status: $statusCode" -ForegroundColor Red
    Write-Host "  Error: $errorBody" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 403) {
        Write-Host "[DIAGNOSIS] 403 Forbidden - Permission Issue" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "The API call is correct, but the user lacks permission." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Required permissions:" -ForegroundColor Yellow
        Write-Host "  - Overall/Read (to access Jenkins)" -ForegroundColor Cyan
        Write-Host "  - Job/Create (to create jobs via API)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Critical check:" -ForegroundColor Red
        Write-Host "  1. Authorization strategy MUST be 'Matrix-based security'" -ForegroundColor Red
        Write-Host "  2. User '$JenkinsUser' MUST be in the permission matrix" -ForegroundColor Red
        Write-Host "  3. Permissions MUST be saved (click 'Save' button)" -ForegroundColor Red
        Write-Host "  4. User MUST re-login after permission changes" -ForegroundColor Red
        Write-Host ""
        Write-Host "See: .\jenkins\verify-authorization-strategy.md" -ForegroundColor Cyan
    } elseif ($statusCode -eq 401) {
        Write-Host "[DIAGNOSIS] 401 Unauthorized - Authentication Issue" -ForegroundColor Yellow
        Write-Host "  Check username and password" -ForegroundColor Cyan
    } elseif ($statusCode -eq 400) {
        Write-Host "[DIAGNOSIS] 400 Bad Request - Configuration Issue" -ForegroundColor Yellow
        Write-Host "  The job configuration XML might be invalid" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
