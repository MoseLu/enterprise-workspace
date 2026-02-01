# Test Jenkins API with API Token (more secure than password)
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$ApiToken = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins API Token Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $ApiToken) {
    Write-Host "[INFO] API Token not provided" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To generate an API Token:" -ForegroundColor Yellow
    Write-Host "1. Login to Jenkins as '$JenkinsUser'" -ForegroundColor Cyan
    Write-Host "2. Click on your username (top right)" -ForegroundColor Cyan
    Write-Host "3. Click 'Configure' (配置)" -ForegroundColor Cyan
    Write-Host "4. Scroll to 'API Token' section" -ForegroundColor Cyan
    Write-Host "5. Click 'Add new Token' -> 'Generate'" -ForegroundColor Cyan
    Write-Host "6. Copy the token and use it:" -ForegroundColor Cyan
    Write-Host "   .\jenkins\test-with-api-token.ps1 -ApiToken 'your-token-here'" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# Prepare authentication with API Token
$pair = "$($JenkinsUser):$($ApiToken)"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [System.Convert]::ToBase64String($bytes)
$headers = @{
    "Authorization" = "Basic $base64"
}

# Get CSRF token
Write-Host "[STEP 1] Getting CSRF token..." -ForegroundColor Yellow
try {
    $crumbUrl = "$JenkinsUrl/crumbIssuer/api/json"
    $crumbResponse = Invoke-WebRequest -Uri $crumbUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $crumbData = $crumbResponse.Content | ConvertFrom-Json
    $headers[$crumbData.crumbRequestField] = $crumbData.crumb
    Write-Host "  [SUCCESS] CSRF token obtained" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Cannot get CSRF token: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test job creation
Write-Host "[STEP 2] Testing job creation with API Token..." -ForegroundColor Yellow
$testJobName = "test-api-token-$(Get-Date -Format 'yyyyMMddHHmmss')"
$testJobConfig = @"
<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.47">
  <description>Test job created with API Token</description>
  <keepDependencies>false</keepDependencies>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.95">
    <script>echo 'Test from API Token'</script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@

try {
    $encodedJobName = [System.Uri]::EscapeDataString($testJobName)
    $createUrl = "$JenkinsUrl/createItem?name=$encodedJobName"
    
    $response = Invoke-WebRequest -Uri $createUrl -Method Post -Body $testJobConfig -Headers $headers -UseBasicParsing -ContentType "application/xml; charset=utf-8" -ErrorAction Stop
    
    Write-Host "  [SUCCESS] Job created successfully with API Token!" -ForegroundColor Green
    Write-Host "    Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "    Job Name: $testJobName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [CONCLUSION] API Token authentication works!" -ForegroundColor Green
    Write-Host "    You can now use API Token instead of password in scripts" -ForegroundColor Cyan
    
    # Clean up
    try {
        $deleteUrl = "$JenkinsUrl/job/$encodedJobName/doDelete"
        Invoke-WebRequest -Uri $deleteUrl -Method Post -Headers $headers -UseBasicParsing -ErrorAction Stop | Out-Null
        Write-Host "  [SUCCESS] Test job deleted" -ForegroundColor Green
    } catch {
        Write-Host "  [WARNING] Could not delete test job" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $null
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    
    Write-Host "  [ERROR] Job creation failed (HTTP $statusCode)" -ForegroundColor Red
    
    if ($statusCode -eq 403) {
        Write-Host ""
        Write-Host "  [DIAGNOSIS] Still getting 403 with API Token" -ForegroundColor Yellow
        Write-Host "    This confirms the permission issue is not authentication-related" -ForegroundColor Yellow
        Write-Host "    The problem is in authorization configuration" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "    Check:" -ForegroundColor Yellow
        Write-Host "    1. Authorization strategy = 'Matrix-based security'" -ForegroundColor Cyan
        Write-Host "    2. User '$JenkinsUser' is in permission matrix" -ForegroundColor Cyan
        Write-Host "    3. Permissions are saved and container restarted" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
