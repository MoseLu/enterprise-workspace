# Check Required Jenkins Plugins
param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "Mose",
    [string]$JenkinsPassword = "123456"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins Plugins Check" -ForegroundColor Cyan
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

# Required plugins for job creation and security
$requiredPlugins = @{
    "Matrix Authorization Strategy Plugin" = @{
        "ShortName" = "matrix-auth"
        "Description" = "Required for Matrix-based security configuration"
        "Critical" = $true
    }
    "Pipeline" = @{
        "ShortName" = "workflow-aggregator"
        "Description" = "Required for Pipeline jobs"
        "Critical" = $true
    }
    "Pipeline: Job" = @{
        "ShortName" = "workflow-job"
        "Description" = "Required for Pipeline job type"
        "Critical" = $true
    }
    "Pipeline: Groovy" = @{
        "ShortName" = "workflow-cps"
        "Description" = "Required for Pipeline script execution"
        "Critical" = $true
    }
    "SCM API Plugin" = @{
        "ShortName" = "scm-api"
        "Description" = "Required for Git integration"
        "Critical" = $false
    }
    "Git Plugin" = @{
        "ShortName" = "git"
        "Description" = "Required for Git repository access"
        "Critical" = $false
    }
}

try {
    # Get installed plugins
    $pluginsUrl = "$JenkinsUrl/pluginManager/api/json?depth=1"
    $pluginsResponse = Invoke-WebRequest -Uri $pluginsUrl -Headers $headers -UseBasicParsing -ErrorAction Stop
    $pluginsData = $pluginsResponse.Content | ConvertFrom-Json
    
    Write-Host "[INFO] Checking installed plugins..." -ForegroundColor Yellow
    Write-Host ""
    
    $missingPlugins = @()
    $installedPlugins = @{}
    
    # Check each required plugin
    foreach ($pluginName in $requiredPlugins.Keys) {
        $pluginInfo = $requiredPlugins[$pluginName]
        $shortName = $pluginInfo.ShortName
        
        $installed = $pluginsData.plugins | Where-Object { 
            $_.shortName -eq $shortName -or 
            $_.longName -like "*$pluginName*" -or
            $_.shortName -like "*$shortName*"
        }
        
        if ($installed) {
            $plugin = $installed | Select-Object -First 1
            $status = if ($plugin.enabled) { "ENABLED" } else { "DISABLED" }
            $color = if ($plugin.enabled) { "Green" } else { "Red" }
            
            Write-Host "[✓] $pluginName" -ForegroundColor $color
            Write-Host "    Short Name: $($plugin.shortName)" -ForegroundColor Cyan
            Write-Host "    Version: $($plugin.version)" -ForegroundColor Cyan
            Write-Host "    Status: $status" -ForegroundColor $color
            
            if (-not $plugin.enabled) {
                Write-Host "    ⚠ WARNING: Plugin is disabled!" -ForegroundColor Yellow
            }
            
            $installedPlugins[$pluginName] = $plugin
        } else {
            Write-Host "[✗] $pluginName - NOT INSTALLED" -ForegroundColor Red
            Write-Host "    Short Name: $shortName" -ForegroundColor Cyan
            Write-Host "    Description: $($pluginInfo.Description)" -ForegroundColor Gray
            
            if ($pluginInfo.Critical) {
                $missingPlugins += $pluginName
            }
        }
        Write-Host ""
    }
    
    # Summary
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Summary" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    if ($missingPlugins.Count -eq 0) {
        Write-Host "[SUCCESS] All required plugins are installed!" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Missing critical plugins:" -ForegroundColor Yellow
        foreach ($plugin in $missingPlugins) {
            Write-Host "  - $plugin" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "Please install missing plugins:" -ForegroundColor Yellow
        Write-Host "  Jenkins -> Manage Jenkins -> Plugins -> Available" -ForegroundColor Cyan
        Write-Host "  Search and install: $($requiredPlugins[$missingPlugins[0]].ShortName)" -ForegroundColor Cyan
    }
    
    # Check for disabled plugins
    $disabledPlugins = $installedPlugins.Values | Where-Object { -not $_.enabled }
    if ($disabledPlugins) {
        Write-Host ""
        Write-Host "[WARNING] Some plugins are disabled:" -ForegroundColor Yellow
        foreach ($plugin in $disabledPlugins) {
            Write-Host "  - $($plugin.longName)" -ForegroundColor Red
        }
        Write-Host ""
        Write-Host "Please enable them:" -ForegroundColor Yellow
        Write-Host "  Jenkins -> Manage Jenkins -> Plugins -> Installed" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "[ERROR] Cannot check plugins: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check manually:" -ForegroundColor Yellow
    Write-Host "  Jenkins -> Manage Jenkins -> Plugins -> Installed" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
