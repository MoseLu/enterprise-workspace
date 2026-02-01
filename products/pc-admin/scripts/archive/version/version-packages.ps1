# 批量更新共享组件库版本号

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor')]
    [string]$Type,
    
    [string]$CustomVersion
)

$ErrorActionPreference = "Stop"

Write-Host "=== 更新共享组件库版本号 ===" -ForegroundColor Cyan

# 定义要更新的包（按依赖顺序）
$packages = @(
    "packages/shared-utils",
    "packages/shared-core",
    "packages/subapp-manifests",
    "packages/vite-plugin",
    "packages/shared-components"
)

if ($CustomVersion) {
    Write-Host "`n使用自定义版本号: $CustomVersion" -ForegroundColor Yellow
    
    foreach ($pkg in $packages) {
        $pkgName = Split-Path $pkg -Leaf
        Write-Host "更新 $pkgName 版本为 $CustomVersion..." -ForegroundColor Gray
        
        Push-Location $pkg
        try {
            $packageJson = Get-Content package.json -Raw | ConvertFrom-Json
            $oldVersion = $packageJson.version
            $packageJson.version = $CustomVersion
            $packageJson | ConvertTo-Json -Depth 10 | Set-Content package.json -Encoding UTF8
            Write-Host "  ✓ $pkgName: $oldVersion -> $CustomVersion" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ $pkgName 更新失败: $_" -ForegroundColor Red
            Pop-Location
            exit 1
        } finally {
            Pop-Location
        }
    }
} else {
    Write-Host "`n使用版本类型: $Type" -ForegroundColor Yellow
    
    foreach ($pkg in $packages) {
        $pkgName = Split-Path $pkg -Leaf
        Write-Host "更新 $pkgName ($Type)..." -ForegroundColor Gray
        
        Push-Location $pkg
        try {
            $packageJson = Get-Content package.json -Raw | ConvertFrom-Json
            $oldVersion = $packageJson.version
            
            # 使用 pnpm version 命令更新版本号
            pnpm version $Type --no-git-tag-version
            
            if ($LASTEXITCODE -eq 0) {
                $packageJson = Get-Content package.json -Raw | ConvertFrom-Json
                $newVersion = $packageJson.version
                Write-Host "  ✓ $pkgName: $oldVersion -> $newVersion" -ForegroundColor Green
            } else {
                Write-Host "  ✗ $pkgName 更新失败" -ForegroundColor Red
                Pop-Location
                exit 1
            }
        } catch {
            Write-Host "  ✗ $pkgName 更新失败: $_" -ForegroundColor Red
            Pop-Location
            exit 1
        } finally {
            Pop-Location
        }
    }
}

Write-Host "`n=== 版本号更新完成 ===" -ForegroundColor Cyan
Write-Host "`n下一步：" -ForegroundColor Yellow
Write-Host "1. 构建所有包: pnpm run predev:all" -ForegroundColor Gray
Write-Host "2. 发布到 Verdaccio: .\scripts\publish-with-pnpm.ps1" -ForegroundColor Gray

