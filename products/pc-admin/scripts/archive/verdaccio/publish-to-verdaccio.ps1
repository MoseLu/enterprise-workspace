# 发布共享组件库到 Verdaccio 私有仓库

$ErrorActionPreference = "Stop"

Write-Host "=== 发布共享组件库到 Verdaccio ===" -ForegroundColor Cyan

# 检查 Verdaccio 是否运行
$verdaccioRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4873" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $verdaccioRunning = $true
} catch {
    Write-Host "警告: Verdaccio 未运行，请先启动 Verdaccio" -ForegroundColor Yellow
    Write-Host "运行: .\scripts\start-verdaccio.ps1" -ForegroundColor Yellow
    exit 1
}

if ($verdaccioRunning) {
    Write-Host "✓ Verdaccio 正在运行" -ForegroundColor Green
}

# 检查是否已登录
Write-Host "`n检查登录状态..." -ForegroundColor Cyan
$whoami = npm whoami --registry http://localhost:4873 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "未登录，请先登录 Verdaccio" -ForegroundColor Yellow
    Write-Host "运行: npm login --registry http://localhost:4873" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ 已登录为: $whoami" -ForegroundColor Green

# 定义要发布的包（按依赖顺序）
$packages = @(
    @{ name = "shared-utils"; path = "packages/shared-utils" },
    @{ name = "shared-core"; path = "packages/shared-core" },
    @{ name = "subapp-manifests"; path = "packages/subapp-manifests" },
    @{ name = "vite-plugin"; path = "packages/vite-plugin" },
    @{ name = "shared-components"; path = "packages/shared-components" }
)

# 构建所有包
Write-Host "`n=== 构建所有包 ===" -ForegroundColor Cyan
foreach ($pkg in $packages) {
    $pkgPath = $pkg.path
    Write-Host "构建 $($pkg.name)..." -ForegroundColor Yellow
    
    Push-Location $pkgPath
    try {
        # 检查是否有构建脚本
        $packageJson = Get-Content package.json | ConvertFrom-Json
        if ($packageJson.scripts.build) {
            pnpm run build
            if ($LASTEXITCODE -ne 0) {
                Write-Host "✗ $($pkg.name) 构建失败" -ForegroundColor Red
                Pop-Location
                exit 1
            }
        }
        Write-Host "✓ $($pkg.name) 构建完成" -ForegroundColor Green
    } finally {
        Pop-Location
    }
}

# 发布所有包
Write-Host "`n=== 发布包到 Verdaccio ===" -ForegroundColor Cyan
foreach ($pkg in $packages) {
    $pkgPath = $pkg.path
    Write-Host "发布 $($pkg.name)..." -ForegroundColor Yellow
    
    Push-Location $pkgPath
    try {
        # 读取 package.json
        $packageJson = Get-Content package.json -Raw | ConvertFrom-Json
        
        # 检查 dist 目录是否存在
        if (-not (Test-Path "dist")) {
            Write-Host "✗ $($pkg.name) dist 目录不存在，请先构建" -ForegroundColor Red
            Pop-Location
            continue
        }
        
        # 发布包
        npm publish --registry http://localhost:4873
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $($pkg.name) 发布成功" -ForegroundColor Green
        } else {
            Write-Host "✗ $($pkg.name) 发布失败" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
}

Write-Host "`n=== 发布完成 ===" -ForegroundColor Cyan
Write-Host "访问 Verdaccio Web UI: http://localhost:4873" -ForegroundColor Green

