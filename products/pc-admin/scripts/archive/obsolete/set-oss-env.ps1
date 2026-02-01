# PowerShell 脚本：从 .env.oss 文件加载 OSS 环境变量
# 使用方法：.\scripts\set-oss-env.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$envOssPath = Join-Path $projectRoot ".env.oss"

if (Test-Path $envOssPath) {
    Write-Host "Loading configuration from .env.oss file..." -ForegroundColor Cyan
    
    Get-Content $envOssPath | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $parts = $line -split '=', 2
            if ($parts.Length -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                if ($key) {
                    [Environment]::SetEnvironmentVariable($key, $value, 'Process')
                }
            }
        }
    }
    
    Write-Host "OSS environment variables loaded from .env.oss" -ForegroundColor Green
    Write-Host "   OSS_ACCESS_KEY_ID: $env:OSS_ACCESS_KEY_ID"
    Write-Host "   OSS_REGION: $env:OSS_REGION"
    Write-Host "   OSS_BUCKET: $env:OSS_BUCKET"
    Write-Host "   CDN_STATIC_ASSETS_URL: $env:CDN_STATIC_ASSETS_URL"
    Write-Host ""
    Write-Host "Note: Environment variables are only valid in the current PowerShell session" -ForegroundColor Yellow
} else {
    Write-Host "Error: .env.oss file not found" -ForegroundColor Red
    Write-Host "   Please copy .env.oss.example to .env.oss and fill in the actual credentials" -ForegroundColor Yellow
    exit 1
}
