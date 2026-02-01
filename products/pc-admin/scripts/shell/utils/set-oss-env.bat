@echo off
REM Windows 批处理脚本：从 .env.oss 文件加载 OSS 环境变量
REM 使用方法：scripts\set-oss-env.bat

setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%.."
set "ENV_OSS_PATH=.env.oss"

if not exist "%ENV_OSS_PATH%" (
    echo ❌ 错误：找不到 .env.oss 文件
    echo    请复制 .env.oss.example 为 .env.oss 并填入实际的密钥信息
    exit /b 1
)

echo 📖 从 .env.oss 文件加载配置...

for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_OSS_PATH%") do (
    set "key=%%a"
    set "value=%%b"
    REM 移除前后空格
    for /f "tokens=*" %%k in ("!key!") do set "key=%%k"
    for /f "tokens=*" %%v in ("!value!") do set "value=%%v"
    REM 跳过空行和注释
    if not "!key!"=="" (
        if not "!key:~0,1!"=="#" (
            if not "!value!"=="" (
                set "!key!=!value!"
            )
        )
    )
)

REM 将变量设置到环境变量
for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_OSS_PATH%") do (
    set "key=%%a"
    set "value=%%b"
    for /f "tokens=*" %%k in ("!key!") do set "key=%%k"
    for /f "tokens=*" %%v in ("!value!") do set "value=%%v"
    if not "!key!"=="" (
        if not "!key:~0,1!"=="#" (
            if not "!value!"=="" (
                set "%%a=%%b"
            )
        )
    )
)

echo ✅ OSS 环境变量已从 .env.oss 加载
echo    OSS_ACCESS_KEY_ID=%OSS_ACCESS_KEY_ID%
echo    OSS_REGION=%OSS_REGION%
echo    OSS_BUCKET=%OSS_BUCKET%
echo    CDN_STATIC_ASSETS_URL=%CDN_STATIC_ASSETS_URL%
echo.
echo ⚠️  当前设置的环境变量仅在当前命令提示符会话中有效

