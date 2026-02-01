# Fix Docker Jenkins Issues
param(
    [string]$ContainerName = "jenkins",
    [string]$HostPort = "9000",
    [string]$DataPath = "D:\jenkins_data"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Docker Jenkins Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check current container
Write-Host "[STEP 1] Checking current Jenkins container..." -ForegroundColor Yellow
$containerId = docker ps -a --filter "name=$ContainerName" --format "{{.ID}}" 2>&1 | Select-Object -First 1

if ($containerId) {
    Write-Host "  Found container: $ContainerName (ID: $containerId)" -ForegroundColor Green
    
    # Check if using named volume or bind mount
    $mounts = docker inspect -f "{{json .Mounts}}" $containerId 2>&1 | ConvertFrom-Json
    $usingNamedVolume = $false
    
    foreach ($mount in $mounts) {
        if ($mount.Destination -eq "/var/jenkins_home") {
            if ($mount.Type -eq "volume") {
                $usingNamedVolume = $true
                $volumeName = $mount.Name
                Write-Host "  [INFO] Using Docker named volume: $volumeName" -ForegroundColor Cyan
                Write-Host "  [WARNING] Named volumes are harder to access from Windows" -ForegroundColor Yellow
            } elseif ($mount.Type -eq "bind") {
                Write-Host "  [SUCCESS] Using bind mount: $($mount.Source)" -ForegroundColor Green
            }
        }
    }
    
    if ($usingNamedVolume) {
        Write-Host ""
        Write-Host "  [RECOMMENDATION] Switch to bind mount for easier access" -ForegroundColor Yellow
        Write-Host "  This will allow you to directly access Jenkins data from Windows" -ForegroundColor Cyan
    }
} else {
    Write-Host "  [INFO] No existing container found" -ForegroundColor Cyan
}

Write-Host ""

# Provide fix instructions
Write-Host "[STEP 2] Fix Instructions" -ForegroundColor Yellow
Write-Host ""

Write-Host "Option A: Fix existing container (keep data)" -ForegroundColor Cyan
Write-Host "  1. Backup current data (if needed):" -ForegroundColor Yellow
Write-Host "     docker exec $ContainerName tar czf /tmp/jenkins_backup.tar.gz /var/jenkins_home" -ForegroundColor Gray
Write-Host "     docker cp $ContainerName`:/tmp/jenkins_backup.tar.gz ." -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Stop and remove container:" -ForegroundColor Yellow
Write-Host "     docker stop $ContainerName" -ForegroundColor Gray
Write-Host "     docker rm $ContainerName" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Create data directory on Windows:" -ForegroundColor Yellow
Write-Host "     New-Item -ItemType Directory -Force -Path `"$DataPath`"" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. Start Jenkins with bind mount:" -ForegroundColor Yellow
Write-Host "     docker run -d `" -ForegroundColor Gray
Write-Host "       -p ${HostPort}:8080 `" -ForegroundColor Gray
Write-Host "       -p 50000:50000 `" -ForegroundColor Gray
Write-Host "       -v `"${DataPath}:/var/jenkins_home`" `" -ForegroundColor Gray
Write-Host "       --name $ContainerName `" -ForegroundColor Gray
Write-Host "       jenkins/jenkins:lts" -ForegroundColor Gray
Write-Host ""

Write-Host "Option B: Quick restart (if using named volume is OK)" -ForegroundColor Cyan
Write-Host "  1. Restart container:" -ForegroundColor Yellow
Write-Host "     docker restart $ContainerName" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Wait for Jenkins to start (30-60 seconds)" -ForegroundColor Yellow
Write-Host "     Start-Sleep -Seconds 60" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. Reconfigure permissions in Jenkins Web UI" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "After Fixing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Access Jenkins: http://localhost:$HostPort" -ForegroundColor Cyan
Write-Host "2. Configure authorization:" -ForegroundColor Cyan
Write-Host "   - Go to: Manage Jenkins -> Security" -ForegroundColor Gray
Write-Host "   - Set Authorization to 'Matrix-based security'" -ForegroundColor Gray
Write-Host "   - Add user 'Mose' to matrix" -ForegroundColor Gray
Write-Host "   - Grant Job/Create permission" -ForegroundColor Gray
Write-Host "   - Click Save" -ForegroundColor Gray
Write-Host "3. Restart container: docker restart $ContainerName" -ForegroundColor Cyan
Write-Host "4. Test: .\jenkins\diagnose-docker-jenkins.ps1" -ForegroundColor Cyan
Write-Host ""
