# Jenkins SSH 密钥配置脚本 (Windows)
# 使用方法: .\setup-ssh-key.ps1 -ContainerName "jenkins" -SshKeyPath "C:\Users\YourName\.ssh\id_rsa"

param(
    [Parameter(Mandatory=$false)]
    [string]$ContainerName = "jenkins",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKeyPath = "$env:USERPROFILE\.ssh\id_rsa",
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerKeyPath = "/var/jenkins_home/.ssh/id_rsa"
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Jenkins SSH 密钥配置脚本" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 检查 Docker 是否运行
Write-Host "检查 Docker 状态..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker 未运行或无法访问" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker 未运行或无法访问" -ForegroundColor Red
    Write-Host "错误: $_" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker 运行正常" -ForegroundColor Green
Write-Host ""

# 查找 Jenkins 容器
Write-Host "查找 Jenkins 容器..." -ForegroundColor Yellow
$containerExists = docker ps -a --filter "name=$ContainerName" --format "{{.Names}}" | Select-String -Pattern "^$ContainerName$"
if (-not $containerExists) {
    Write-Host "❌ 未找到名为 '$ContainerName' 的容器" -ForegroundColor Red
    Write-Host "💡 提示: 请检查容器名称，或使用 -ContainerName 参数指定" -ForegroundColor Yellow
    Write-Host "   可用的 Jenkins 容器:" -ForegroundColor Yellow
    docker ps -a --filter "ancestor=jenkins/jenkins" --format "  - {{.Names}}"
    exit 1
}
Write-Host "✅ 找到容器: $ContainerName" -ForegroundColor Green
Write-Host ""

# 检查容器是否运行
$containerRunning = docker ps --filter "name=$ContainerName" --format "{{.Names}}" | Select-String -Pattern "^$ContainerName$"
if (-not $containerRunning) {
    Write-Host "⚠️  容器 $ContainerName 未运行，正在启动..." -ForegroundColor Yellow
    docker start $ContainerName
    Start-Sleep -Seconds 3
}

# 检查 SSH 密钥文件是否存在
Write-Host "检查 SSH 密钥文件..." -ForegroundColor Yellow
if (-not (Test-Path $SshKeyPath)) {
    Write-Host "❌ SSH 密钥文件不存在: $SshKeyPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 你有以下选择:" -ForegroundColor Yellow
    Write-Host "   1. 生成新的 SSH 密钥对:" -ForegroundColor Yellow
    Write-Host "      ssh-keygen -t rsa -b 4096 -C `"jenkins@deploy`"" -ForegroundColor Cyan
    Write-Host "   2. 使用现有的密钥文件，通过 -SshKeyPath 参数指定路径" -ForegroundColor Yellow
    Write-Host "   3. 手动创建密钥文件后重新运行此脚本" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ SSH 密钥文件存在: $SshKeyPath" -ForegroundColor Green
Write-Host ""

# 创建 .ssh 目录
Write-Host "在容器中创建 .ssh 目录..." -ForegroundColor Yellow
docker exec -u root $ContainerName mkdir -p /var/jenkins_home/.ssh 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 目录创建成功" -ForegroundColor Green
} else {
    Write-Host "⚠️  目录可能已存在（这是正常的）" -ForegroundColor Yellow
}
Write-Host ""

# 复制 SSH 密钥到容器
Write-Host "复制 SSH 密钥到容器..." -ForegroundColor Yellow
Write-Host "  源路径: $SshKeyPath" -ForegroundColor Gray
Write-Host "  目标: ${ContainerName}:$ContainerKeyPath" -ForegroundColor Gray

# 使用 Windows 路径格式（需要转换为 WSL 格式或使用绝对路径）
docker cp "$SshKeyPath" "${ContainerName}:$ContainerKeyPath" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 密钥复制成功" -ForegroundColor Green
} else {
    Write-Host "❌ 密钥复制失败" -ForegroundColor Red
    Write-Host "错误代码: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 设置权限
Write-Host "设置文件权限..." -ForegroundColor Yellow
docker exec -u root $ContainerName chmod 600 $ContainerKeyPath 2>&1 | Out-Null
docker exec -u root $ContainerName chown jenkins:jenkins $ContainerKeyPath 2>&1 | Out-Null
Write-Host "✅ 权限设置完成" -ForegroundColor Green
Write-Host ""

# 验证配置
Write-Host "验证配置..." -ForegroundColor Yellow
$fileCheck = docker exec $ContainerName ls -la $ContainerKeyPath 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 文件验证成功" -ForegroundColor Green
    Write-Host "   文件信息: $fileCheck" -ForegroundColor Gray
} else {
    Write-Host "❌ 文件验证失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 显示权限信息
Write-Host "检查文件权限..." -ForegroundColor Yellow
$permissions = docker exec $ContainerName stat -c "%a %n" $ContainerKeyPath 2>&1
Write-Host "   权限: $permissions" -ForegroundColor Gray
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ SSH 密钥配置完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "配置信息:" -ForegroundColor Yellow
Write-Host "  容器名称: $ContainerName" -ForegroundColor Gray
Write-Host "  密钥路径: $ContainerKeyPath" -ForegroundColor Gray
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 确保你的公钥已添加到目标服务器的 ~/.ssh/authorized_keys" -ForegroundColor Gray
Write-Host "  2. 可以在 Jenkins Job 中使用 SSH_KEY_PATH 参数，默认值是 $ContainerKeyPath" -ForegroundColor Gray
Write-Host "  3. 运行 Jenkins 构建以验证配置" -ForegroundColor Gray
Write-Host ""

