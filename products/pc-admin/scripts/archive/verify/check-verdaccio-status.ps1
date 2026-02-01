# 检查 Verdaccio 状态和包发布情况

$ErrorActionPreference = "Stop"

Write-Host "=== Verdaccio 状态检查 ===" -ForegroundColor Cyan

# 1. 检查 Verdaccio 是否运行
Write-Host "`n1. 检查 Verdaccio 服务..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4873" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Verdaccio 正在运行" -ForegroundColor Green
    Write-Host "  访问地址: http://localhost:4873" -ForegroundColor Gray
} catch {
    Write-Host "✗ Verdaccio 未运行" -ForegroundColor Red
    Write-Host "  请运行: .\scripts\start-verdaccio.ps1" -ForegroundColor Yellow
    exit 1
}

# 2. 检查登录状态
Write-Host "`n2. 检查登录状态..." -ForegroundColor Yellow
$whoami = npm whoami --registry http://localhost:4873 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 已登录为: $whoami" -ForegroundColor Green
} else {
    Write-Host "✗ 未登录" -ForegroundColor Red
    Write-Host "  请运行: npm login --registry http://localhost:4873" -ForegroundColor Yellow
    exit 1
}

# 3. 检查已发布的包
Write-Host "`n3. 检查已发布的包..." -ForegroundColor Yellow
$packages = @(
    "@btc/shared-utils",
    "@btc/shared-core",
    "@btc/subapp-manifests",
    "@btc/vite-plugin",
    "@btc/shared-components"
)

$allPublished = $true
foreach ($pkg in $packages) {
    $result = npm view $pkg --registry http://localhost:4873 2>&1
    if ($LASTEXITCODE -eq 0) {
        $version = ($result | Select-String -Pattern '"version"').ToString()
        Write-Host "  ✓ $pkg 已发布" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $pkg 未发布" -ForegroundColor Red
        $allPublished = $false
    }
}

if ($allPublished) {
    Write-Host "`n✓ 所有包已发布，可以使用 npm/pnpm 安装" -ForegroundColor Green
    Write-Host "`n使用示例:" -ForegroundColor Cyan
    Write-Host "  pnpm add @btc/shared-components @btc/shared-core @btc/shared-utils @btc/subapp-manifests" -ForegroundColor Gray
} else {
    Write-Host "`n✗ 部分包未发布，请运行发布脚本" -ForegroundColor Red
    Write-Host "  运行: .\scripts\publish-to-verdaccio.ps1" -ForegroundColor Yellow
}

