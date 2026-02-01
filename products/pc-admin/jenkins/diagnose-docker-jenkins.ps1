# Comprehensive Docker Jenkins Diagnosis Script
# Checks Docker-specific issues that may cause 403 errors

param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456",
    [string]$ContainerName = "jenkins"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Jenkins Diagnosis" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check 1: Docker container status and mounts
Write-Host "[CHECK 1] Docker Container Status and Volume Mounts" -ForegroundColor Yellow
Write-Host ""

try {
    # Check if Docker is running
    $dockerRunning = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Docker is not running or not accessible" -ForegroundColor Red
        Write-Host "  Please start Docker Desktop" -ForegroundColor Yellow
        exit 1
    }
    
    # Find Jenkins container
    $containerInfo = docker ps -a --filter "name=$ContainerName" --format "{{.ID}}|{{.Names}}|{{.Status}}" 2>&1
    if ($containerInfo -match "Error" -or $containerInfo -eq "") {
        Write-Host "  [WARNING] Jenkins container '$ContainerName' not found" -ForegroundColor Yellow
        Write-Host "  Searching for any Jenkins container..." -ForegroundColor Cyan
        $allContainers = docker ps -a --format "{{.Names}}" 2>&1
        $jenkinsContainers = $allContainers | Where-Object { $_ -like "*jenkins*" }
        if ($jenkinsContainers) {
            Write-Host "  Found Jenkins containers:" -ForegroundColor Cyan
            $jenkinsContainers | ForEach-Object { Write-Host "    - $_" -ForegroundColor Cyan }
            Write-Host "  Please specify the correct container name with -ContainerName parameter" -ForegroundColor Yellow
        } else {
            Write-Host "  [ERROR] No Jenkins container found" -ForegroundColor Red
        }
    } else {
        $containerId = ($containerInfo -split '\|')[0]
        Write-Host "  [SUCCESS] Found Jenkins container: $ContainerName (ID: $containerId)" -ForegroundColor Green
        
        # Check container status
        $containerStatus = docker inspect -f "{{.State.Status}}" $containerId 2>&1
        Write-Host "  Container Status: $containerStatus" -ForegroundColor Cyan
        
        if ($containerStatus -ne "running") {
            Write-Host "  [WARNING] Container is not running!" -ForegroundColor Yellow
            Write-Host "  Starting container..." -ForegroundColor Cyan
            docker start $containerId 2>&1 | Out-Null
            Start-Sleep -Seconds 5
        }
        
        # Check volume mounts (CRITICAL!)
        Write-Host ""
        Write-Host "  [CRITICAL] Checking volume mounts..." -ForegroundColor Yellow
        $mounts = docker inspect -f "{{json .Mounts}}" $containerId 2>&1 | ConvertFrom-Json
        
        $jenkinsHomeMounted = $false
        $jenkinsHomePath = ""
        
        foreach ($mount in $mounts) {
            if ($mount.Destination -eq "/var/jenkins_home" -or $mount.Destination -like "*jenkins_home*") {
                $jenkinsHomeMounted = $true
                $jenkinsHomePath = $mount.Source
                Write-Host "    [SUCCESS] Jenkins home is mounted!" -ForegroundColor Green
                Write-Host "      Container path: $($mount.Destination)" -ForegroundColor Cyan
                Write-Host "      Host path: $($mount.Source)" -ForegroundColor Cyan
                break
            }
        }
        
        if (-not $jenkinsHomeMounted) {
            Write-Host "    [ERROR] Jenkins home is NOT mounted!" -ForegroundColor Red
            Write-Host "    This means all configuration will be lost when container restarts!" -ForegroundColor Red
            Write-Host ""
            Write-Host "    SOLUTION: Restart Jenkins with volume mount:" -ForegroundColor Yellow
            Write-Host "      docker stop $containerId" -ForegroundColor Cyan
            Write-Host "      docker rm $containerId" -ForegroundColor Cyan
            Write-Host "      docker run -d -p 9000:8080 -p 50000:50000 -v D:\jenkins_data:/var/jenkins_home --name jenkins jenkins/jenkins:lts" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "    WARNING: This will create a new container. Backup data first if needed!" -ForegroundColor Red
        } else {
            # Check if the mounted directory exists and is accessible
            if (Test-Path $jenkinsHomePath) {
                Write-Host "    [SUCCESS] Mounted directory exists and is accessible" -ForegroundColor Green
                
                # Check config.xml to verify persistence
                $configPath = Join-Path $jenkinsHomePath "config.xml"
                if (Test-Path $configPath) {
                    Write-Host "    [SUCCESS] Jenkins config.xml found in mounted directory" -ForegroundColor Green
                } else {
                    Write-Host "    [WARNING] config.xml not found in mounted directory" -ForegroundColor Yellow
                }
            } else {
                Write-Host "    [WARNING] Mounted directory does not exist: $jenkinsHomePath" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "  [ERROR] Cannot check Docker: $_" -ForegroundColor Red
}

Write-Host ""

# Check 2: Network connectivity
Write-Host "[CHECK 2] Network Connectivity" -ForegroundColor Yellow
Write-Host ""

# Test localhost access
try {
    $testResponse = Invoke-WebRequest -Uri "$JenkinsUrl/api/json" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  [SUCCESS] Can access Jenkins at $JenkinsUrl" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Cannot access Jenkins at $JenkinsUrl" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    
    # Try to get container IP
    try {
        $containerId = (docker ps --filter "name=$ContainerName" --format "{{.ID}}" 2>&1 | Select-Object -First 1)
        if ($containerId) {
            $containerIp = docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" $containerId 2>&1
            Write-Host ""
            Write-Host "  Container IP: $containerIp" -ForegroundColor Cyan
            Write-Host "  Try accessing: http://$containerIp:8080" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "  Cannot get container IP: $_" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check 3: Manual API test with simple job
Write-Host "[CHECK 3] Manual API Test (Simple Job Creation)" -ForegroundColor Yellow
Write-Host ""

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
    Write-Host "  [SUCCESS] CSRF token obtained" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Cannot get CSRF token: $_" -ForegroundColor Red
    Write-Host "  This may indicate authentication or network issues" -ForegroundColor Yellow
}

# Test job creation with minimal XML
$testJobName = "test-docker-diagnosis-$(Get-Date -Format 'yyyyMMddHHmmss')"
$simpleJobXml = @"
<?xml version='1.0' encoding='UTF-8'?>
<project>
  <description>Test job for Docker diagnosis</description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <scm class="hudson.scm.NullSCM"/>
  <canRoam>true</canRoam>
  <disabled>false</disabled>
  <blockBuildWhenDownstreamBuilding>false</blockBuildWhenDownstreamBuilding>
  <blockBuildWhenUpstreamBuilding>false</blockBuildWhenUpstreamBuilding>
  <triggers/>
  <concurrentBuild>false</concurrentBuild>
  <builders/>
  <publishers/>
  <buildWrappers/>
</project>
"@

try {
    Write-Host "  Attempting to create test job: $testJobName" -ForegroundColor Cyan
    $createUrl = "$JenkinsUrl/createItem?name=$testJobName"
    
    $response = Invoke-WebRequest -Uri $createUrl -Method Post -Body $simpleJobXml -Headers $headers -UseBasicParsing -ContentType "application/xml; charset=utf-8" -ErrorAction Stop
    
    Write-Host "  [SUCCESS] Manual API test passed! Job created successfully" -ForegroundColor Green
    Write-Host "    Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    
    # Try to delete the test job
    try {
        $deleteUrl = "$JenkinsUrl/job/$testJobName/doDelete"
        Invoke-WebRequest -Uri $deleteUrl -Method Post -Headers $headers -UseBasicParsing -ErrorAction Stop | Out-Null
        Write-Host "  [SUCCESS] Test job deleted" -ForegroundColor Green
    } catch {
        Write-Host "  [WARNING] Could not delete test job (you may need to delete it manually)" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $null
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    }
    
    Write-Host "  [ERROR] Manual API test failed" -ForegroundColor Red
    Write-Host "    HTTP Status: $statusCode" -ForegroundColor Red
    
    if ($statusCode -eq 403) {
        Write-Host ""
        Write-Host "  [DIAGNOSIS] 403 Forbidden - Permission Issue" -ForegroundColor Yellow
        Write-Host "    This confirms the permission problem exists even with manual API calls" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "    Possible causes:" -ForegroundColor Yellow
        Write-Host "    1. Permissions not persisted (volume not mounted)" -ForegroundColor Cyan
        Write-Host "    2. Authorization strategy not 'Matrix-based security'" -ForegroundColor Cyan
        Write-Host "    3. User '$JenkinsUser' not in permission matrix" -ForegroundColor Cyan
        Write-Host "    4. Permissions not saved or container not restarted" -ForegroundColor Cyan
    }
}

Write-Host ""

# Check 4: Jenkins configuration persistence
Write-Host "[CHECK 4] Configuration Persistence" -ForegroundColor Yellow
Write-Host ""

if ($jenkinsHomeMounted -and $jenkinsHomePath) {
    Write-Host "  Checking configuration files in: $jenkinsHomePath" -ForegroundColor Cyan
    
    $configXmlPath = Join-Path $jenkinsHomePath "config.xml"
    if (Test-Path $configXmlPath) {
        Write-Host "  [SUCCESS] config.xml exists" -ForegroundColor Green
        
        # Try to read and check Jenkins URL
        try {
            $configContent = Get-Content $configXmlPath -Raw -ErrorAction Stop
            if ($configContent -match "<jenkinsUrl>(.*?)</jenkinsUrl>") {
                $configuredUrl = $matches[1]
                Write-Host "    Configured Jenkins URL: $configuredUrl" -ForegroundColor Cyan
                
                if ($configuredUrl -ne $JenkinsUrl) {
                    Write-Host "    [WARNING] Jenkins URL mismatch!" -ForegroundColor Yellow
                    Write-Host "      Configured: $configuredUrl" -ForegroundColor Red
                    Write-Host "      Accessing: $JenkinsUrl" -ForegroundColor Red
                    Write-Host "      This may cause 'reverse proxy setup is broken' error" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "  [WARNING] Cannot read config.xml: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [WARNING] config.xml not found" -ForegroundColor Yellow
    }
    
    # Check users directory
    $usersPath = Join-Path $jenkinsHomePath "users"
    if (Test-Path $usersPath) {
        $userDirs = Get-ChildItem $usersPath -Directory -ErrorAction SilentlyContinue
        Write-Host "  [INFO] Found $($userDirs.Count) user directories" -ForegroundColor Cyan
    }
} else {
    Write-Host "  [SKIP] Cannot check persistence (volume not mounted)" -ForegroundColor Yellow
}

Write-Host ""

# Summary and recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY AND RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $jenkinsHomeMounted) {
    Write-Host "[CRITICAL] Volume not mounted - Configuration will be lost!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Action required:" -ForegroundColor Yellow
    Write-Host "1. Stop and remove current Jenkins container" -ForegroundColor Cyan
    Write-Host "2. Create data directory: mkdir D:\jenkins_data" -ForegroundColor Cyan
    Write-Host "3. Start Jenkins with volume mount:" -ForegroundColor Cyan
    Write-Host "   docker run -d -p 9000:8080 -p 50000:50000 -v D:\jenkins_data:/var/jenkins_home --name jenkins jenkins/jenkins:lts" -ForegroundColor Cyan
    Write-Host "4. Reconfigure permissions after restart" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Ensure volume is mounted (see above)" -ForegroundColor Cyan
Write-Host "2. Verify authorization strategy is 'Matrix-based security'" -ForegroundColor Cyan
Write-Host "3. Ensure user '$JenkinsUser' has Job/Create permission" -ForegroundColor Cyan
Write-Host "4. Restart Jenkins container: docker restart $ContainerName" -ForegroundColor Cyan
Write-Host "5. Re-login to Jenkins Web UI" -ForegroundColor Cyan
Write-Host "6. Test again with this script" -ForegroundColor Cyan
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
