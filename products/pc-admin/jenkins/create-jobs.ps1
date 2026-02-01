# Jenkins Batch Job Creation Script
# Usage:
# 1. Make sure Jenkins is running and accessible
# 2. Run in PowerShell: .\jenkins\create-jobs.ps1
# 3. Or specify Jenkins URL: .\jenkins\create-jobs.ps1 -JenkinsUrl "http://localhost:9000"
# 4. If authentication is required: .\jenkins\create-jobs.ps1 -JenkinsUser "username" -JenkinsPassword "password"

param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$GitRepoUrl = "https://github.com/BellisGit/btc-shopflow-monorepo.git",
    [string]$Branch = "develop",
    [string]$JenkinsUser = "",
    [string]$JenkinsPassword = ""
)

# Color output functions
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Blue }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# Application list
$apps = @(
    "system-app",
    "admin-app",
    "logistics-app",
    "quality-app",
    "production-app",
    "engineering-app",
    "finance-app",
    "mobile-app"
)

Write-Info "Starting to create Jenkins Jobs..."
Write-Info "Jenkins URL: $JenkinsUrl"
Write-Info "Git Repository: $GitRepoUrl"
Write-Info "Branch: $Branch"
if ($JenkinsUser) {
    Write-Info "Jenkins User: $JenkinsUser"
}
Write-Host ""
Write-Host "Note: You can use either 'localhost' or IP address (e.g., http://10.80.8.199:9000)" -ForegroundColor Cyan
Write-Host ""

# Note: We use Jenkins REST API instead of CLI, so no need to download CLI

# Create single application Job configuration XML
function Create-SingleAppJobConfig {
    param(
        [string]$AppName,
        [string]$RepoUrl,
        [string]$BranchName
    )
    
    $jobName = "btc-shopflow-deploy-$AppName"
    
    $xml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.42">
  <description>BTC ShopFlow - Deploy $AppName</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>APP_NAME</name>
          <description>Application name (auto-extracted from Job name)</description>
          <defaultValue>$AppName</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_HOST</name>
          <description>Server address</description>
          <defaultValue>47.112.31.96</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_USER</name>
          <description>Server username</description>
          <defaultValue>root</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_PORT</name>
          <description>SSH port</description>
          <defaultValue>22</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SSH_KEY_PATH</name>
          <description>SSH private key path (path on Jenkins server)</description>
          <defaultValue>/var/jenkins_home/.ssh/id_rsa</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>SKIP_TESTS</name>
          <description>Skip tests (speed up build)</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>CLEAN_BUILD</name>
          <description>Clean build cache (force rebuild)</description>
          <defaultValue>false</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>$RepoUrl</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/$BranchName</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>jenkins/Jenkinsfile.single-app</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@
    
    return $xml
}

# Create all applications deployment Job configuration XML
function Create-AllAppsJobConfig {
    param(
        [string]$RepoUrl,
        [string]$BranchName
    )
    
    $xml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.42">
  <description>BTC ShopFlow - Deploy All Applications</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_HOST</name>
          <description>Server address</description>
          <defaultValue>47.112.31.96</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_USER</name>
          <description>Server username</description>
          <defaultValue>root</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_PORT</name>
          <description>SSH port</description>
          <defaultValue>22</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SSH_KEY_PATH</name>
          <description>SSH private key path (path on Jenkins server)</description>
          <defaultValue>/var/jenkins_home/.ssh/id_rsa</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>SKIP_TESTS</name>
          <description>Skip tests (speed up build)</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>CLEAN_BUILD</name>
          <description>Clean build cache (force rebuild)</description>
          <defaultValue>false</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>$RepoUrl</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/$BranchName</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>jenkins/Jenkinsfile.all-apps</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@
    
    return $xml
}

# Create Job using Jenkins REST API
function Create-Job {
    param(
        [string]$JobName,
        [string]$JobConfig
    )
    
    Write-Info "Creating Job: $JobName"
    
    try {
        # Prepare headers with authentication
        $headers = @{
            "Content-Type" = "application/xml"
        }
        if ($JenkinsUser -and $JenkinsPassword) {
            $pair = "$($JenkinsUser):$($JenkinsPassword)"
            $bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
            $base64 = [System.Convert]::ToBase64String($bytes)
            $headers["Authorization"] = "Basic $base64"
        }
        
        # Get CSRF token (Jenkins security feature)
        try {
            $crumbUrl = "$JenkinsUrl/crumbIssuer/api/json"
            $crumbResponse = Invoke-WebRequest -Uri $crumbUrl -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue
            if ($crumbResponse.StatusCode -eq 200) {
                $crumbData = $crumbResponse.Content | ConvertFrom-Json
                if ($crumbData.crumbRequestField -and $crumbData.crumb) {
                    $headers[$crumbData.crumbRequestField] = $crumbData.crumb
                    Write-Info "CSRF token obtained successfully"
                }
            }
        } catch {
            # CSRF might not be enabled, continue without it
            Write-Warning "Could not get CSRF token, continuing without it..."
        }
        
        # Use Jenkins REST API to create Job
        # URL encode the job name
        $encodedJobName = [System.Uri]::EscapeDataString($JobName)
        $jobUrl = "$JenkinsUrl/createItem?name=$encodedJobName"
        
        try {
            # Use -Body parameter directly (PowerShell will handle encoding)
            $response = Invoke-WebRequest -Uri $jobUrl -Method Post -Body $JobConfig -Headers $headers -UseBasicParsing -ContentType "application/xml; charset=utf-8" -ErrorAction Stop
            Write-Success "Job '$JobName' created successfully"
            Write-Host "   Access: $JenkinsUrl/job/$JobName" -ForegroundColor Cyan
            return $true
        } catch {
            $statusCode = $null
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
            }
            
            if ($statusCode -eq 400) {
                # Job might already exist, try to update it
                Write-Warning "Job '$JobName' might already exist, attempting to update..."
                $updateUrl = "$JenkinsUrl/job/$JobName/config.xml"
                try {
                    $updateResponse = Invoke-WebRequest -Uri $updateUrl -Method Post -Body $JobConfig -Headers $headers -UseBasicParsing -ContentType "application/xml" -ErrorAction Stop
                    Write-Success "Job '$JobName' updated successfully"
                    Write-Host "   Access: $JenkinsUrl/job/$JobName" -ForegroundColor Cyan
                    return $true
                } catch {
                    Write-Error "Failed to update Job '$JobName': $_"
                    return $false
                }
            } elseif ($statusCode -eq 403) {
                Write-Error "Job '$JobName' creation failed: Permission denied (HTTP 403)"
                Write-Warning "The user '$JenkinsUser' does not have permission to create Jobs via API."
                Write-Host ""
                Write-Host "   CRITICAL: Check Authorization Strategy first!" -ForegroundColor Red
                Write-Host "   ========================================" -ForegroundColor Yellow
                Write-Host "   1. Go to: Manage Jenkins -> Security -> Authorization" -ForegroundColor Yellow
                Write-Host "   2. MUST select: 'Matrix-based security' (NOT 'Logged-in users can do anything')" -ForegroundColor Yellow
                Write-Host "   3. Add user '$JenkinsUser' to the permission matrix" -ForegroundColor Yellow
                Write-Host "   4. Check permissions for '$JenkinsUser':" -ForegroundColor Yellow
                Write-Host "      - Overall -> Administer (recommended)" -ForegroundColor Cyan
                Write-Host "      OR at minimum:" -ForegroundColor Cyan
                Write-Host "      - Overall -> Read" -ForegroundColor Cyan
                Write-Host "      - Job -> Create" -ForegroundColor Cyan
                Write-Host "      - Job -> Configure" -ForegroundColor Cyan
                Write-Host "      - Job -> Read" -ForegroundColor Cyan
                Write-Host "   5. Scroll to bottom and click 'Save' (not just 'Apply')" -ForegroundColor Yellow
                Write-Host "   6. Sign out and sign back in" -ForegroundColor Yellow
                Write-Host "   7. Wait 10-15 seconds for changes to take effect" -ForegroundColor Yellow
                Write-Host "   ========================================" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "   See: .\jenkins\verify-authorization-strategy.md for detailed guide" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "   Alternative: Use an administrator account" -ForegroundColor Yellow
                Write-Host "      .\jenkins\create-jobs.ps1 -JenkinsUser 'admin' -JenkinsPassword 'admin-password'" -ForegroundColor Yellow
                return $false
            } else {
                Write-Error "Job '$JobName' creation failed (HTTP $statusCode)"
                if ($_.Exception.Message) {
                    Write-Host "Error message: $($_.Exception.Message)" -ForegroundColor Red
                }
                return $false
            }
        }
    } catch {
        Write-Error "Error creating Job '$JobName': $_"
        if ($_.Exception.Message) {
            Write-Host "Exception details: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Check if Job exists (using Jenkins REST API)
function Job-Exists {
    param([string]$JobName)
    
    try {
        $jobUrl = "$JenkinsUrl/job/$JobName/api/json"
        $headers = @{}
        if ($JenkinsUser -and $JenkinsPassword) {
            $pair = "$($JenkinsUser):$($JenkinsPassword)"
            $bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
            $base64 = [System.Convert]::ToBase64String($bytes)
            $headers["Authorization"] = "Basic $base64"
        }
        $response = Invoke-WebRequest -Uri $jobUrl -UseBasicParsing -TimeoutSec 5 -Headers $headers -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Main process
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins Jobs Batch Creation Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Jenkins connection
Write-Info "Checking Jenkins connection..."
try {
    $headers = @{}
    if ($JenkinsUser -and $JenkinsPassword) {
        $pair = "$($JenkinsUser):$($JenkinsPassword)"
        $bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
        $base64 = [System.Convert]::ToBase64String($bytes)
        $headers["Authorization"] = "Basic $base64"
    }
    
    $response = Invoke-WebRequest -Uri "$JenkinsUrl/api/json" -UseBasicParsing -TimeoutSec 5 -Headers $headers
    Write-Success "Jenkins connection successful"
} catch {
    $statusCode = $null
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode
    } elseif ($_.Exception.Message -match "403" -or $_.Exception.Message -match "Forbidden") {
        $statusCode = 403
    }
    
    if ($statusCode -eq 403 -or $statusCode -eq 401) {
        Write-Error "Jenkins requires authentication (HTTP $statusCode)"
        if (-not ($JenkinsUser -and $JenkinsPassword)) {
            Write-Warning "Please run the script with the following parameters:"
            Write-Host "  .\jenkins\create-jobs.ps1 -JenkinsUser 'your-username' -JenkinsPassword 'your-password'" -ForegroundColor Yellow
        } else {
            Write-Warning "The provided username or password may be incorrect, please check"
            Write-Host "  Attempted user: $JenkinsUser" -ForegroundColor Yellow
        }
    } else {
        Write-Error "Unable to connect to Jenkins: $_"
        Write-Warning "Please ensure Jenkins is started and the URL is correct (current: $JenkinsUrl)"
    }
    exit 1
}

Write-Host ""

# Create Jobs for individual applications
$successCount = 0
$failCount = 0

foreach ($app in $apps) {
    $jobName = "btc-shopflow-deploy-$app"
    
    if (Job-Exists $jobName) {
        Write-Warning "Job '$jobName' already exists, skipping"
        continue
    }
    
    $config = Create-SingleAppJobConfig -AppName $app -RepoUrl $GitRepoUrl -BranchName $Branch
    if (Create-Job -JobName $jobName -JobConfig $config) {
        $successCount++
    } else {
        $failCount++
    }
    Write-Host ""
}

# Create all applications deployment Job
Write-Host "----------------------------------------" -ForegroundColor Cyan
$allJobName = "btc-shopflow-deploy-all"

if (Job-Exists $allJobName) {
    Write-Warning "Job '$allJobName' already exists, skipping"
} else {
    $config = Create-AllAppsJobConfig -RepoUrl $GitRepoUrl -BranchName $Branch
    if (Create-Job -JobName $allJobName -JobConfig $config) {
        $successCount++
    } else {
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creation Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Success "Successfully created: $successCount Jobs"
if ($failCount -gt 0) {
    Write-Error "Failed: $failCount Jobs"
}
Write-Host ""
Write-Info "Access Jenkins: $JenkinsUrl"
Write-Info "All Jobs list: $JenkinsUrl/view/all/"
