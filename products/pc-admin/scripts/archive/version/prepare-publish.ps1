# 准备发布：处理 workspace 依赖

$ErrorActionPreference = "Stop"

Write-Host "=== 准备发布包 ===" -ForegroundColor Cyan

# 定义要处理的包
$packages = @(
    "packages/shared-utils",
    "packages/shared-core",
    "packages/subapp-manifests",
    "packages/vite-plugin",
    "packages/shared-components"
)

foreach ($pkgPath in $packages) {
    Write-Host "处理 $pkgPath..." -ForegroundColor Yellow
    
    $packageJsonPath = Join-Path $pkgPath "package.json"
    if (-not (Test-Path $packageJsonPath)) {
        Write-Host "跳过: $packageJsonPath 不存在" -ForegroundColor Gray
        continue
    }
    
    # 读取 package.json
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    
    # 处理 dependencies 中的 workspace 依赖
    if ($packageJson.dependencies) {
        $modified = $false
        foreach ($dep in $packageJson.dependencies.PSObject.Properties) {
            if ($dep.Value -like "workspace:*") {
                # 将 workspace:* 转换为 peerDependency
                if (-not $packageJson.peerDependencies) {
                    $packageJson | Add-Member -MemberType NoteProperty -Name "peerDependencies" -Value @{} -Force
                }
                $packageJson.peerDependencies[$dep.Name] = "^1.0.0"
                $packageJson.dependencies.PSObject.Properties.Remove($dep.Name)
                $modified = $true
            }
        }
        
        if ($modified) {
            # 保存修改后的 package.json
            $json = $packageJson | ConvertTo-Json -Depth 10
            [System.IO.File]::WriteAllText($packageJsonPath, $json, [System.Text.Encoding]::UTF8)
            Write-Host "✓ 已更新 $pkgPath" -ForegroundColor Green
        }
    }
}

Write-Host "`n准备完成！" -ForegroundColor Green

