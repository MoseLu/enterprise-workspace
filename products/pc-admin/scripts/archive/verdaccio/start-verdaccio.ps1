# 启动 Verdaccio 私有仓库 (PowerShell)

# 检查 Verdaccio 是否已安装
if (-not (Get-Command verdaccio -ErrorAction SilentlyContinue)) {
    Write-Host "错误: Verdaccio 未安装" -ForegroundColor Red
    Write-Host "请运行: pnpm add -g verdaccio" -ForegroundColor Yellow
    exit 1
}

# 获取脚本所在目录
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ConfigDir = Join-Path $ProjectRoot "configs\verdaccio"

# 确定配置文件位置
$VerdaccioConfigDir = Join-Path $env:APPDATA "verdaccio"

# 如果配置文件不存在，从项目复制
if (-not (Test-Path (Join-Path $VerdaccioConfigDir "config.yaml"))) {
    Write-Host "配置文件不存在，正在创建..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $VerdaccioConfigDir -Force | Out-Null
    Copy-Item (Join-Path $ConfigDir "config.yaml") (Join-Path $VerdaccioConfigDir "config.yaml")
    Write-Host "配置文件已创建: $VerdaccioConfigDir\config.yaml" -ForegroundColor Green
}

# 启动 Verdaccio
Write-Host "正在启动 Verdaccio..." -ForegroundColor Green
Write-Host "访问地址: http://localhost:4873" -ForegroundColor Cyan
verdaccio

