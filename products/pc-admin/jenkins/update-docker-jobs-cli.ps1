# Jenkins Docker 部署 Job 批量更新脚本（使用 Jenkins Java CLI）
# 功能：更新所有 Docker 方式部署的 Jenkins Jobs 配置
# 使用方法：
# 1. 确保 Jenkins 正在运行且可访问
# 2. 在 PowerShell 中运行: .\jenkins\update-docker-jobs-cli.ps1
# 3. 或指定 Jenkins URL: .\jenkins\update-docker-jobs-cli.ps1 -JenkinsUrl "http://localhost:9000"
# 4. 如果需要认证: .\jenkins\update-docker-jobs-cli.ps1 -JenkinsUser "username" -JenkinsPassword "password"

param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$GitRepoUrl = "https://github.com/BellisGit/btc-shopflow-monorepo.git",
    [string]$Branch = "develop",
    [string]$JenkinsUser = "",
    [string]$JenkinsPassword = "",
    [string]$JenkinsCliPath = ""
)

# 自动检测脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 如果没有指定 Jenkins CLI 路径，使用脚本所在目录下的 jenkins-cli.jar
if ([string]::IsNullOrEmpty($JenkinsCliPath)) {
    $JenkinsCliPath = Join-Path $ScriptDir "jenkins-cli.jar"
    # 如果脚本目录下没有，尝试上级目录的 jenkins 子目录
    if (-not (Test-Path $JenkinsCliPath)) {
        $JenkinsCliPath = Join-Path (Split-Path -Parent $ScriptDir) "jenkins\jenkins-cli.jar"
    }
}

# 将相对路径转换为绝对路径
$JenkinsCliPath = (Resolve-Path $JenkinsCliPath -ErrorAction SilentlyContinue).Path
if (-not $JenkinsCliPath) {
    # 如果解析失败，使用原始路径
    $JenkinsCliPath = $param:JenkinsCliPath
    if ([string]::IsNullOrEmpty($JenkinsCliPath)) {
        $JenkinsCliPath = Join-Path $ScriptDir "jenkins-cli.jar"
    }
}

# 颜色输出函数
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Blue }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# Docker 部署应用列表（与 create-docker-jobs-cli.ps1 保持一致）
$dockerApps = @(
    @{ Name = "home-app"; Jenkinsfile = "Jenkinsfile.home-app.docker"; JobName = "btc-shopflow-deploy-home-app-docker" },
    @{ Name = "layout-app"; Jenkinsfile = "Jenkinsfile.layout-app.docker"; JobName = "btc-shopflow-deploy-layout-app-docker" }
    # 注意：system-app 的 Docker 部署可能使用不同的 Job 名称，如果需要请添加
    # @{ Name = "system-app"; Jenkinsfile = "Jenkinsfile.main-app.docker"; JobName = "btc-shopflow-deploy-system-app-docker" }
)

Write-Info "开始更新 Jenkins Docker 部署 Jobs（使用 Java CLI）..."
Write-Info "Jenkins URL: $JenkinsUrl"
Write-Info "Git 仓库: $GitRepoUrl"
Write-Info "分支: $Branch"
if ($JenkinsUser) {
    Write-Info "Jenkins 用户: $JenkinsUser"
}
Write-Host ""

# 检查 Jenkins CLI JAR 文件是否存在
if (-not (Test-Path $JenkinsCliPath)) {
    Write-Error "Jenkins CLI JAR 文件不存在: $JenkinsCliPath"
    Write-Warning "请确保 jenkins-cli.jar 文件存在"
    Write-Info "脚本当前目录: $ScriptDir"
    Write-Info "尝试的文件路径: $JenkinsCliPath"
    Write-Info "您可以从 Jenkins 服务器下载:"
    Write-Host "  Invoke-WebRequest -Uri `"$JenkinsUrl/jnlpJars/jenkins-cli.jar`" -OutFile `"$JenkinsCliPath`"" -ForegroundColor Yellow
    Write-Host ""
    Write-Info "或者指定正确的路径:"
    Write-Host "  .\update-docker-jobs-cli.ps1 -JenkinsCliPath `"完整路径\jenkins-cli.jar`"" -ForegroundColor Yellow
    exit 1
}

# 检查 Java 是否可用，并获取完整路径
$javaPath = $null
try {
    $javaCheck = Get-Command java -ErrorAction Stop
    $javaPath = $javaCheck.Source
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Info "Java 已安装: $javaVersion"
    Write-Info "Java 路径: $javaPath"
} catch {
    Write-Error "未找到 Java，请先安装 Java"
    Write-Warning "Jenkins CLI 需要 Java 来运行"
    Write-Info "请确保 Java 已安装并添加到系统 PATH 环境变量中"
    Write-Info "Java 下载地址: https://www.oracle.com/java/technologies/downloads/"
    exit 1
}

# 如果找到了 Java，使用完整路径；否则使用 "java"
if ($javaPath) {
    $javaCommand = $javaPath
} else {
    $javaCommand = "java"
}

# 创建 Docker 部署 Job 配置 XML（与 create-docker-jobs-cli.ps1 保持一致）
function Create-DockerJobConfig {
    param(
        [string]$AppName,
        [string]$Jenkinsfile,
        [string]$RepoUrl,
        [string]$BranchName
    )
    
    $xml = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.42">
  <description>BTC ShopFlow - Deploy $AppName (Docker)</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_HOST</name>
          <description>服务器地址</description>
          <defaultValue>47.112.31.96</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_USER</name>
          <description>服务器用户名</description>
          <defaultValue>root</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SERVER_PORT</name>
          <description>SSH 端口</description>
          <defaultValue>22</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>SSH_KEY_PATH</name>
          <description>SSH 私钥路径（Jenkins 服务器上的路径）</description>
          <defaultValue>/var/jenkins_home/.ssh/id_rsa</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>REMOTE_PATH</name>
          <description>服务器上的项目路径</description>
          <defaultValue>/www/wwwroot/btc-shopflow-monorepo</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>SKIP_TESTS</name>
          <description>是否跳过测试（加速构建）</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>CLEAN_BUILD</name>
          <description>是否清理构建缓存（强制重新构建）</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>BUILD_SHARED_DEPS</name>
          <description>是否构建共享依赖包</description>
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
    <scriptPath>jenkins/$Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@
    
    return $xml
}

# 使用 Jenkins CLI 更新 Job
function Update-Job-WithCli {
    param(
        [string]$JobName,
        [string]$JobConfig,
        [string]$CliPath,
        [string]$Url,
        [string]$User = "",
        [string]$Password = "",
        [string]$JavaCmd = "java"
    )
    
    Write-Info "正在更新 Job: $JobName"
    
    try {
        # 构建参数数组
        $allArgs = @("-jar", "`"$CliPath`"", "-s", "`"$Url`"")
        
        # 如果有认证信息，添加认证参数
        if ($User -and $Password) {
            $allArgs += @("-auth", "`"${User}:${Password}`"")
        }
        
        # 添加更新命令参数
        $allArgs += @("update-job", $JobName)
        
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = $JavaCmd
        $processInfo.Arguments = $allArgs -join ' '
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardInput = $true
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.CreateNoWindow = $true
        $processInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8
        $processInfo.StandardErrorEncoding = [System.Text.Encoding]::UTF8
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        
        # 启动进程
        $process.Start() | Out-Null
        
        # 写入 XML 配置到标准输入
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        $jobConfigBytes = $utf8NoBom.GetBytes($JobConfig)
        $process.StandardInput.BaseStream.Write($jobConfigBytes, 0, $jobConfigBytes.Length)
        $process.StandardInput.Close()
        
        # 读取输出
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        
        # 等待进程结束
        $process.WaitForExit()
        $exitCode = $process.ExitCode
        
        # 清理
        $process.Dispose()
        
        if ($exitCode -eq 0) {
            Write-Success "Job '$JobName' 更新成功"
            Write-Host "   访问地址: $Url/job/$JobName" -ForegroundColor Cyan
            return $true
        } else {
            Write-Error "Job '$JobName' 更新失败（退出码: $exitCode）"
            if ($stderr) {
                Write-Error "错误信息: $stderr"
            }
            if ($stdout) {
                Write-Info "输出信息: $stdout"
            }
            return $false
        }
    } catch {
        Write-Error "更新 Job '$JobName' 时发生错误: $_"
        return $false
    }
}

# 检查 Job 是否存在（使用 Jenkins CLI）
function Job-Exists-Cli {
    param(
        [string]$JobName,
        [string]$CliPath,
        [string]$Url,
        [string]$User = "",
        [string]$Password = "",
        [string]$JavaCmd = "java"
    )
    
    try {
        # 构建参数数组
        $allArgs = @("-jar", "`"$CliPath`"", "-s", "`"$Url`"")
        if ($User -and $Password) {
            $allArgs += @("-auth", "`"${User}:${Password}`"")
        }
        $allArgs += @("get-job", $JobName)
        
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = $JavaCmd
        $processInfo.Arguments = $allArgs -join ' '
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        $processInfo.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        $process.Start() | Out-Null
        $process.StandardOutput.ReadToEnd() | Out-Null
        $process.StandardError.ReadToEnd() | Out-Null
        $process.WaitForExit()
        $exitCode = $process.ExitCode
        $process.Dispose()
        
        if ($exitCode -eq 0) {
            return $true
        } else {
            return $false
        }
    } catch {
        return $false
    }
}

# 主流程
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Jenkins Docker 部署 Jobs 批量更新工具（CLI）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Jenkins 连接
Write-Info "检查 Jenkins 连接..."
try {
    # 构建参数数组
    $testArgs = @("-jar", "`"$JenkinsCliPath`"", "-s", "`"$JenkinsUrl`"")
    if ($JenkinsUser -and $JenkinsPassword) {
        $testArgs += @("-auth", "`"${JenkinsUser}:${JenkinsPassword}`"")
    }
    $testArgs += @("version")
    
    # 执行命令并捕获输出
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $javaCommand
    $processInfo.Arguments = $testArgs -join ' '
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.CreateNoWindow = $true
    $processInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $processInfo.StandardErrorEncoding = [System.Text.Encoding]::UTF8
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    $process.Start() | Out-Null
    
    $stdout = $process.StandardOutput.ReadToEnd()
    $stderr = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    $exitCode = $process.ExitCode
    $process.Dispose()
    
    if ($exitCode -eq 0) {
        Write-Success "Jenkins 连接成功"
        if ($stdout) {
            Write-Info "Jenkins 版本: $stdout"
        }
    } else {
        Write-Error "无法连接到 Jenkins（退出码: $exitCode）"
        if ($stderr) {
            Write-Host "错误详情: $stderr" -ForegroundColor Red
        }
        if ($stdout) {
            Write-Host "输出信息: $stdout" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Warning "可能的原因和解决方法："
        Write-Host "  1. Jenkins 服务器未运行或 URL 不正确" -ForegroundColor Yellow
        Write-Host "     当前 URL: $JenkinsUrl" -ForegroundColor Cyan
        Write-Host "     请在浏览器中访问该 URL 确认 Jenkins 可访问" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  2. Jenkins CLI 访问未启用" -ForegroundColor Yellow
        Write-Host "     进入: Manage Jenkins -> Security" -ForegroundColor Cyan
        Write-Host "     确保启用了 'CLI over HTTP' 或 'CLI over TCP port JNLP' 选项" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "  3. 认证信息不正确" -ForegroundColor Yellow
        if ($JenkinsUser -and $JenkinsPassword) {
            Write-Host "     当前用户: $JenkinsUser" -ForegroundColor Cyan
            Write-Host "     请检查用户名和密码/API Token 是否正确" -ForegroundColor Cyan
        } else {
            Write-Host "     请提供认证信息:" -ForegroundColor Cyan
            Write-Host "     .\update-docker-jobs-cli.ps1 -JenkinsUser 'username' -JenkinsPassword 'password'" -ForegroundColor Cyan
        }
        exit 1
    }
} catch {
    Write-Error "连接测试时发生异常: $_"
    exit 1
}

Write-Host ""

# 更新各个 Docker 部署应用的 Jobs
$successCount = 0
$failCount = 0
$skipCount = 0

foreach ($app in $dockerApps) {
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    Write-Info "处理应用: $($app.Name)"
    Write-Info "Jenkinsfile: $($app.Jenkinsfile)"
    Write-Info "Job 名称: $($app.JobName)"
    
    # 检查 Job 是否已存在
    if (-not (Job-Exists-Cli -JobName $app.JobName -CliPath $JenkinsCliPath -Url $JenkinsUrl -User $JenkinsUser -Password $JenkinsPassword -JavaCmd $javaCommand)) {
        Write-Warning "Job '$($app.JobName)' 不存在，跳过"
        $skipCount++
        Write-Host ""
        continue
    }
    
    # 生成配置 XML
    $config = Create-DockerJobConfig -AppName $app.Name -Jenkinsfile $app.Jenkinsfile -RepoUrl $GitRepoUrl -BranchName $Branch
    
    # 更新 Job
    if (Update-Job-WithCli -JobName $app.JobName -JobConfig $config -CliPath $JenkinsCliPath -Url $JenkinsUrl -User $JenkinsUser -Password $JenkinsPassword -JavaCmd $javaCommand) {
        $successCount++
    } else {
        $failCount++
    }
    
    Write-Host ""
}

# 输出总结
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "更新完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Success "成功更新: $successCount 个 Docker 部署 Jobs"
if ($skipCount -gt 0) {
    Write-Warning "已跳过: $skipCount 个 Jobs（不存在）"
}
if ($failCount -gt 0) {
    Write-Error "失败: $failCount 个 Jobs"
}
Write-Host ""
Write-Info "访问 Jenkins: $JenkinsUrl"
Write-Info "所有 Jobs 列表: $JenkinsUrl/view/all/"
Write-Host ""
Write-Info "已更新的 Docker 部署 Jobs："
foreach ($app in $dockerApps) {
    if (Job-Exists-Cli -JobName $app.JobName -CliPath $JenkinsCliPath -Url $JenkinsUrl -User $JenkinsUser -Password $JenkinsPassword -JavaCmd $javaCommand) {
        Write-Host "  ✅ $($app.JobName)" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  $($app.JobName) (不存在)" -ForegroundColor Yellow
    }
}
Write-Host ""

