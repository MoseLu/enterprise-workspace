# Jenkins OSS 凭证配置脚本（使用 Jenkins Java CLI）
# 功能：从环境变量读取 OSS 凭证并通过 Jenkins CLI 配置到 Jenkins
# 使用方法：
# 1. 确保环境变量 OSS_ACCESS_KEY_ID 和 OSS_ACCESS_KEY_SECRET 已设置
# 2. 在 PowerShell 中运行: .\jenkins\setup-oss-credentials-cli.ps1
# 3. 或指定 Jenkins URL: .\jenkins\setup-oss-credentials-cli.ps1 -JenkinsUrl "http://localhost:9000"
# 4. 如果需要认证: .\jenkins\setup-oss-credentials-cli.ps1 -JenkinsUser "username" -JenkinsPassword "password"
# 5. 也可以直接传入凭证: .\jenkins\setup-oss-credentials-cli.ps1 -AccessKeyId "xxx" -AccessKeySecret "xxx"

param(
    [string]$JenkinsUrl = "http://localhost:9000",
    [string]$JenkinsUser = "",
    [string]$JenkinsPassword = "",
    [string]$JenkinsCliPath = "",
    [string]$AccessKeyId = "",
    [string]$AccessKeySecret = "",
    [string]$JavaCmd = "java"
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

Write-Info "开始配置 Jenkins OSS 凭证..."
Write-Info "Jenkins URL: $JenkinsUrl"
Write-Host ""

# 检查 Jenkins CLI JAR 文件是否存在
if (-not (Test-Path $JenkinsCliPath)) {
    Write-Error "Jenkins CLI JAR 文件不存在: $JenkinsCliPath"
    Write-Warning "请确保 jenkins-cli.jar 文件存在"
    Write-Info "您可以从 Jenkins 服务器下载:"
    Write-Host "  Invoke-WebRequest -Uri `"$JenkinsUrl/jnlpJars/jenkins-cli.jar`" -OutFile `"$JenkinsCliPath`"" -ForegroundColor Yellow
    Write-Host ""
    Write-Info "或者指定正确的路径:"
    Write-Host "  .\setup-oss-credentials-cli.ps1 -JenkinsCliPath `"完整路径\jenkins-cli.jar`"" -ForegroundColor Yellow
    exit 1
}

# 检查 Java 是否可用
try {
    $javaCheck = Get-Command java -ErrorAction Stop
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Info "Java 已安装: $javaVersion"
} catch {
    Write-Error "未找到 Java，请先安装 Java"
    Write-Warning "Jenkins CLI 需要 Java 来运行"
    exit 1
}

# 获取 OSS 凭证
if ([string]::IsNullOrEmpty($AccessKeyId)) {
    $AccessKeyId = $env:OSS_ACCESS_KEY_ID
}

if ([string]::IsNullOrEmpty($AccessKeySecret)) {
    $AccessKeySecret = $env:OSS_ACCESS_KEY_SECRET
}

if ([string]::IsNullOrEmpty($AccessKeyId) -or [string]::IsNullOrEmpty($AccessKeySecret)) {
    Write-Error "OSS 凭证未设置"
    Write-Warning "请通过以下方式之一提供 OSS 凭证:"
    Write-Host "  1. 设置环境变量:" -ForegroundColor Yellow
    Write-Host "     `$env:OSS_ACCESS_KEY_ID = 'your_access_key_id'" -ForegroundColor Yellow
    Write-Host "     `$env:OSS_ACCESS_KEY_SECRET = 'your_access_key_secret'" -ForegroundColor Yellow
    Write-Host "  2. 使用参数:" -ForegroundColor Yellow
    Write-Host "     .\setup-oss-credentials-cli.ps1 -AccessKeyId 'xxx' -AccessKeySecret 'xxx'" -ForegroundColor Yellow
    exit 1
}

Write-Info "OSS AccessKey ID: $($AccessKeyId.Substring(0, [Math]::Min(8, $AccessKeyId.Length)))..."
Write-Info "OSS AccessKey Secret: $($AccessKeySecret.Substring(0, [Math]::Min(8, $AccessKeySecret.Length)))..."
Write-Host ""

# 生成凭证 XML（Secret text 类型）
function Generate-CredentialXml {
    param(
        [string]$Id,
        [string]$Description,
        [string]$Secret
    )
    
    # 转义 XML 特殊字符
    $escapedSecret = $Secret -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;' -replace "'", '&apos;'
    
    $xml = @"
<com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>
  <scope>GLOBAL</scope>
  <id>$Id</id>
  <description>$Description</description>
  <username></username>
  <password>$escapedSecret</password>
</com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl>
"@
    return $xml
}

# 使用 Secret text 类型的凭证 XML
function Generate-SecretTextXml {
    param(
        [string]$Id,
        [string]$Description,
        [string]$Secret
    )
    
    # 转义 XML 特殊字符
    $escapedSecret = $Secret -replace '&', '&amp;' -replace '<', '&lt;' -replace '>', '&gt;' -replace '"', '&quot;' -replace "'", '&apos;'
    
    $xml = @"
<org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl>
  <scope>GLOBAL</scope>
  <id>$Id</id>
  <description>$Description</description>
  <secret>$escapedSecret</secret>
</org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl>
"@
    return $xml
}

# 使用 Jenkins CLI 创建凭证
function Create-Credential-WithCli {
    param(
        [string]$CredentialId,
        [string]$Description,
        [string]$Secret,
        [string]$CliPath,
        [string]$Url,
        [string]$User = "",
        [string]$Password = "",
        [string]$JavaCmd = "java"
    )
    
    Write-Info "正在创建凭证: $CredentialId"
    
    # 生成凭证 XML
    $credentialXml = Generate-SecretTextXml -Id $CredentialId -Description $Description -Secret $Secret
    
    try {
        # 构建完整的参数数组
        $allArgs = @("-jar", "`"$CliPath`"", "-s", "`"$Url`"")
        
        # 如果有认证信息，添加认证参数
        if ($User -and $Password) {
            $allArgs += @("-auth", "`"${User}:${Password}`"")
        }
        
        # 添加创建凭证命令参数
        # 注意：create-credentials-by-xml 需要指定 store 和 domain
        # 对于全局凭证，store 是 system::system::jenkins，domain 是 _ (下划线)
        $allArgs += @("create-credentials-by-xml", "system::system::jenkins", "_")
        
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
        $credentialXmlBytes = $utf8NoBom.GetBytes($credentialXml)
        $process.StandardInput.BaseStream.Write($credentialXmlBytes, 0, $credentialXmlBytes.Length)
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
            Write-Success "凭证 '$CredentialId' 创建成功"
            return $true
        } else {
            # 检查是否是因为凭证已存在
            if ($stderr -match "already exists" -or $stdout -match "already exists") {
                Write-Warning "凭证 '$CredentialId' 已存在，尝试更新..."
                # 尝试删除后重新创建
                return Update-Credential-WithCli -CredentialId $CredentialId -Description $Description -Secret $Secret -CliPath $CliPath -Url $Url -User $User -Password $Password -JavaCmd $JavaCmd
            } else {
                Write-Error "凭证 '$CredentialId' 创建失败（退出码: $exitCode）"
                if ($stderr) {
                    Write-Error "错误信息: $stderr"
                }
                if ($stdout) {
                    Write-Info "输出信息: $stdout"
                }
                return $false
            }
        }
    } catch {
        Write-Error "创建凭证 '$CredentialId' 时发生错误: $_"
        return $false
    }
}

# 使用 Jenkins CLI 更新凭证
function Update-Credential-WithCli {
    param(
        [string]$CredentialId,
        [string]$Description,
        [string]$Secret,
        [string]$CliPath,
        [string]$Url,
        [string]$User = "",
        [string]$Password = "",
        [string]$JavaCmd = "java"
    )
    
    Write-Info "正在更新凭证: $CredentialId"
    
    # 先尝试删除旧凭证
    try {
        $allArgs = @("-jar", "`"$CliPath`"", "-s", "`"$Url`"")
        if ($User -and $Password) {
            $allArgs += @("-auth", "`"${User}:${Password}`"")
        }
        $allArgs += @("delete-credentials", "system::system::jenkins", "_", $CredentialId)
        
        $process = Start-Process -FilePath $JavaCmd -ArgumentList ($allArgs -join ' ') -NoNewWindow -Wait -PassThru -RedirectStandardOutput ([System.IO.Path]::GetTempFileName()) -RedirectStandardError ([System.IO.Path]::GetTempFileName())
    } catch {
        # 忽略删除错误
    }
    
    # 重新创建凭证
    return Create-Credential-WithCli -CredentialId $CredentialId -Description $Description -Secret $Secret -CliPath $CliPath -Url $Url -User $User -Password $Password -JavaCmd $JavaCmd
}

# 主逻辑
$successCount = 0
$totalCount = 2

# 创建 OSS AccessKey ID 凭证
if (Create-Credential-WithCli -CredentialId "oss-access-key-id" -Description "阿里云 OSS AccessKey ID" -Secret $AccessKeyId -CliPath $JenkinsCliPath -Url $JenkinsUrl -User $JenkinsUser -Password $JenkinsPassword -JavaCmd $JavaCmd) {
    $successCount++
}

Write-Host ""

# 创建 OSS AccessKey Secret 凭证
if (Create-Credential-WithCli -CredentialId "oss-access-key-secret" -Description "阿里云 OSS AccessKey Secret" -Secret $AccessKeySecret -CliPath $JenkinsCliPath -Url $JenkinsUrl -User $JenkinsUser -Password $JenkinsPassword -JavaCmd $JavaCmd) {
    $successCount++
}

Write-Host ""

# 输出结果
if ($successCount -eq $totalCount) {
    Write-Success "所有 OSS 凭证配置完成！"
    Write-Info "已配置的凭证:"
    Write-Host "  - oss-access-key-id" -ForegroundColor Green
    Write-Host "  - oss-access-key-secret" -ForegroundColor Green
    Write-Host ""
    Write-Info "现在可以在 Jenkins Pipeline 中使用这些凭证进行 CDN 上传了"
    exit 0
} else {
    Write-Warning "部分凭证配置失败（成功: $successCount/$totalCount）"
    exit 1
}

