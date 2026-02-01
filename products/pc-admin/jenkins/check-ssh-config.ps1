# SSH 配置检查脚本
# 用于诊断 SSH 公钥认证问题

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerHost = "47.112.31.96",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$ContainerName = "jenkins"
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "SSH 配置检查脚本" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 1. 检查容器中的私钥
Write-Host "1. 检查容器中的私钥文件..." -ForegroundColor Yellow
$keyExists = docker exec $ContainerName test -f /var/jenkins_home/.ssh/id_rsa 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ 私钥文件存在" -ForegroundColor Green
    
    # 获取私钥指纹
    $keyFingerprint = docker exec $ContainerName ssh-keygen -lf /var/jenkins_home/.ssh/id_rsa 2>&1
    Write-Host "   指纹: $keyFingerprint" -ForegroundColor Gray
} else {
    Write-Host "   ❌ 私钥文件不存在" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. 检查权限
Write-Host "2. 检查文件权限..." -ForegroundColor Yellow
$permissions = docker exec $ContainerName stat -c "%a %n" /var/jenkins_home/.ssh/id_rsa 2>&1
Write-Host "   权限: $permissions" -ForegroundColor Gray
if ($permissions -match "600") {
    Write-Host "   ✅ 权限正确 (600)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  权限可能不正确，应该是 600" -ForegroundColor Yellow
}
Write-Host ""

# 3. 生成公钥用于验证
Write-Host "3. 从私钥生成公钥..." -ForegroundColor Yellow
$publicKey = docker exec $ContainerName ssh-keygen -y -f /var/jenkins_home/.ssh/id_rsa 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ 公钥生成成功" -ForegroundColor Green
    Write-Host ""
    Write-Host "   请在服务器上执行以下命令来检查:" -ForegroundColor Cyan
    Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "   # 1. 检查 authorized_keys 文件权限" -ForegroundColor Gray
    Write-Host "   ls -la ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host ""
    Write-Host "   # 2. 检查 .ssh 目录权限" -ForegroundColor Gray
    Write-Host "   ls -ld ~/.ssh" -ForegroundColor White
    Write-Host ""
    Write-Host "   # 3. 检查 authorized_keys 文件内容（应该包含以下公钥）" -ForegroundColor Gray
    Write-Host "   cat ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host ""
    Write-Host "   预期的公钥:" -ForegroundColor Cyan
    Write-Host "   $publicKey" -ForegroundColor White
    Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    
    # 保存公钥到文件
    $publicKey | Out-File -FilePath "$env:TEMP\jenkins_public_key.txt" -Encoding utf8 -NoNewline
    Write-Host "   💡 公钥已保存到: $env:TEMP\jenkins_public_key.txt" -ForegroundColor Yellow
} else {
    Write-Host "   ❌ 公钥生成失败: $publicKey" -ForegroundColor Red
}
Write-Host ""

# 4. 测试 SSH 连接
Write-Host "4. 测试 SSH 连接..." -ForegroundColor Yellow
$testResult = docker exec $ContainerName ssh -i /var/jenkins_home/.ssh/id_rsa -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${ServerUser}@${ServerHost} "echo 'SSH test successful'" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ SSH 连接成功" -ForegroundColor Green
    Write-Host "   输出: $testResult" -ForegroundColor Gray
} else {
    Write-Host "   ❌ SSH 连接失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "   可能的解决方案:" -ForegroundColor Yellow
    Write-Host "   1. 检查服务器上 ~/.ssh/authorized_keys 文件的权限（应该是 600）" -ForegroundColor Gray
    Write-Host "   2. 检查服务器上 ~/.ssh 目录的权限（应该是 700）" -ForegroundColor Gray
    Write-Host "   3. 确保公钥已正确添加到 authorized_keys 文件中" -ForegroundColor Gray
    Write-Host "   4. 检查服务器 SSH 配置：cat /etc/ssh/sshd_config | grep -E 'PubkeyAuthentication|AuthorizedKeysFile'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   修复权限的命令（在服务器上执行）:" -ForegroundColor Cyan
    Write-Host "   chmod 700 ~/.ssh" -ForegroundColor White
    Write-Host "   chmod 600 ~/.ssh/authorized_keys" -ForegroundColor White
    Write-Host "   chown ${ServerUser}:${ServerUser} ~/.ssh" -ForegroundColor White
    Write-Host "   chown ${ServerUser}:${ServerUser} ~/.ssh/authorized_keys" -ForegroundColor White
}
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "检查完成" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

