# 快速提交到 GitHub develop 分支
# 用法: .\scripts\quick-commit.ps1 [提交信息]

param(
    [string]$Message = "chore: update"
)

$ErrorActionPreference = "Stop"

# 检查是否在项目根目录（检查是否有 package.json 和 pnpm-workspace.yaml）
if (-not ((Test-Path "package.json") -and (Test-Path "pnpm-workspace.yaml"))) {
    Write-Host "❌ 错误: 请在项目根目录（btc-shopflow-monorepo）运行此脚本" -ForegroundColor Red
    exit 1
}

# 获取当前分支
$currentBranch = git branch --show-current
Write-Host "📋 当前分支: $currentBranch" -ForegroundColor Cyan

# 检查是否有未提交的更改
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "✅ 没有未提交的更改" -ForegroundColor Green
    exit 0
}

# 显示变更摘要
Write-Host "`n📝 变更文件:" -ForegroundColor Yellow
git status --short

# 切换到 develop 分支（如果不在）
if ($currentBranch -ne "develop") {
    Write-Host "`n🔄 切换到 develop 分支..." -ForegroundColor Cyan
    git checkout develop
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 切换到 develop 分支失败" -ForegroundColor Red
        exit 1
    }
}

# 添加所有更改
Write-Host "`n📦 添加所有更改..." -ForegroundColor Cyan
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 添加文件失败" -ForegroundColor Red
    exit 1
}

# 提交更改
Write-Host "`n💾 提交更改: $Message" -ForegroundColor Cyan
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 提交失败" -ForegroundColor Red
    exit 1
}

# 推送到远程
Write-Host "`n🚀 推送到 origin/develop..." -ForegroundColor Cyan
git push origin develop
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 推送失败" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ 提交成功并已推送到 GitHub develop 分支" -ForegroundColor Green
Write-Host "   提交信息: $Message" -ForegroundColor Gray
Write-Host "   分支: develop" -ForegroundColor Gray

