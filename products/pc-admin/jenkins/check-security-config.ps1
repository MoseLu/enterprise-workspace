# Check Jenkins Security Configuration
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins Security Configuration Check" -ForegroundColor Cyan
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

try {
    # Get system information
    $systemUrl = "$JenkinsUrl/systemInfo"
    $systemResponse = Invoke-WebRequest -Uri $systemUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-Host "[INFO] Jenkins system information retrieved" -ForegroundColor Green
    Write-Host ""
    
    # Get current user information
    Write-Host "[CHECK 1] Current User Information" -ForegroundColor Yellow
    try {
        $userUrl = "$JenkinsUrl/me/api/json"
        $userResponse = Invoke-WebRequest -Uri $userUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
        $userData = $userResponse.Content | ConvertFrom-Json
        Write-Host "  User ID: $($userData.id)" -ForegroundColor Cyan
        Write-Host "  Full Name: $($userData.fullName)" -ForegroundColor Cyan
        Write-Host "  Description: $($userData.description)" -ForegroundColor Cyan
    } catch {
        Write-Host "  [ERROR] Cannot get user info: $_" -ForegroundColor Red
    }
    Write-Host ""
    
    # Check if user has Overall/Read permission (required for API access)
    Write-Host "[CHECK 2] Testing API Access Permissions" -ForegroundColor Yellow
    try {
        $apiUrl = "$JenkinsUrl/api/json?tree=jobs[name]"
        $apiResponse = Invoke-WebRequest -Uri $apiUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "  [SUCCESS] User can access Jenkins API" -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] User cannot access Jenkins API: $_" -ForegroundColor Red
        Write-Host "  This indicates missing Overall/Read permission" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Check if user can read system configuration
    Write-Host "[CHECK 3] Testing System Configuration Access" -ForegroundColor Yellow
    try {
        $configUrl = "$JenkinsUrl/config.xml"
        $configResponse = Invoke-WebRequest -Uri $configUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "  [SUCCESS] User can read system configuration" -ForegroundColor Green
    } catch {
        $statusCode = $null
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        if ($statusCode -eq 403) {
            Write-Host "  [WARNING] User cannot read system configuration (HTTP 403)" -ForegroundColor Yellow
            Write-Host "  This is normal if user doesn't have Administer permission" -ForegroundColor Gray
        } else {
            Write-Host "  [ERROR] Cannot access system configuration: $_" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Try to get authorization strategy info (if possible)
    Write-Host "[CHECK 4] Authorization Strategy" -ForegroundColor Yellow
    Write-Host "  Note: Authorization strategy cannot be checked via API" -ForegroundColor Gray
    Write-Host "  Please verify manually:" -ForegroundColor Yellow
    Write-Host "    1. Go to: Manage Jenkins -> Security" -ForegroundColor Cyan
    Write-Host "    2. Check 'Authorization' section" -ForegroundColor Cyan
    Write-Host "    3. Should be set to 'Matrix-based security'" -ForegroundColor Cyan
    Write-Host "    4. User '$JenkinsUser' should have permissions in the matrix" -ForegroundColor Cyan
    Write-Host ""
    
    # Summary and recommendations
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Recommendations" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "If you're still getting 403 errors:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Verify Security Configuration:" -ForegroundColor Yellow
    Write-Host "   - Go to: Manage Jenkins -> Security" -ForegroundColor Cyan
    Write-Host "   - Authorization: Must be 'Matrix-based security'" -ForegroundColor Cyan
    Write-Host "   - User '$JenkinsUser' must be in the matrix" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Required Permissions for '$JenkinsUser':" -ForegroundColor Yellow
    Write-Host "   - Overall -> Administer (recommended)" -ForegroundColor Cyan
    Write-Host "   - OR at minimum:" -ForegroundColor Cyan
    Write-Host "     * Overall -> Read" -ForegroundColor Cyan
    Write-Host "     * Job -> Create" -ForegroundColor Cyan
    Write-Host "     * Job -> Configure" -ForegroundColor Cyan
    Write-Host "     * Job -> Read" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. After configuring permissions:" -ForegroundColor Yellow
    Write-Host "   - Click 'Save' at the bottom of the page" -ForegroundColor Cyan
    Write-Host "   - Log out and log back in" -ForegroundColor Cyan
    Write-Host "   - Wait 10-15 seconds" -ForegroundColor Cyan
    Write-Host "   - Run the test again" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Test again:" -ForegroundColor Yellow
    Write-Host "   .\jenkins\test-permissions.ps1 -JenkinsUser '$JenkinsUser' -JenkinsPassword '$JenkinsPassword'" -ForegroundColor Cyan
    Write-Host ""
    
} catch {
    Write-Host "[ERROR] Cannot check security configuration: $_" -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
