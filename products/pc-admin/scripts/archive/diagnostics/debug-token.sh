#!/bin/bash

# 模拟构建脚本的环境和逻辑

echo "=== Debug GITHUB_TOKEN Detection ==="
echo ""

# 模拟构建脚本的环境
GITHUB_TOKEN=""
OS="${OS:-}"
WINDIR="${WINDIR:-}"
OSTYPE="${OSTYPE:-msys}"

echo "Initial state:"
echo "  GITHUB_TOKEN: [${GITHUB_TOKEN:-empty}]"
echo "  OS: [$OS]"
echo "  WINDIR: [$WINDIR]"
echo "  OSTYPE: [$OSTYPE]"
echo ""

# 第一步：检查是否已设置
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Step 1: GITHUB_TOKEN is empty, trying Git Credential Manager..."
    if command -v git-credential-manager > /dev/null 2>&1; then
        GITHUB_TOKEN=$(git credential fill <<< "protocol=https
host=github.com
" 2>/dev/null | grep password | cut -d= -f2 | head -1)
        if [ -n "$GITHUB_TOKEN" ]; then
            echo "  ✓ Found from Git Credential Manager"
        else
            echo "  ✗ Not found in Git Credential Manager"
        fi
    else
        echo "  ✗ Git Credential Manager not found"
    fi
else
    echo "Step 1: GITHUB_TOKEN already set"
fi
echo ""

# 第二步：尝试从 PowerShell 读取
echo "Step 2: Checking Windows condition..."
CONDITION_RESULT=false
if [ -z "$GITHUB_TOKEN" ]; then
    if [ "$OS" = "Windows_NT" ] || [ -n "$WINDIR" ] || [ "$OSTYPE" = "msys" ] || [ "$OSTYPE" = "cygwin" ]; then
        CONDITION_RESULT=true
        echo "  ✓ Windows condition is TRUE"
    else
        echo "  ✗ Windows condition is FALSE"
        echo "    OS=$OS, WINDIR=$WINDIR, OSTYPE=$OSTYPE"
    fi
else
    echo "  - Skipped (GITHUB_TOKEN already set)"
fi
echo ""

if [ "$CONDITION_RESULT" = "true" ] || [ -z "$GITHUB_TOKEN" ]; then
    if command -v powershell.exe > /dev/null 2>&1; then
        echo "Step 3: Trying PowerShell..."
        echo "  Command: powershell.exe -NoProfile -NonInteractive -Command \"try { \\\$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\\\$token) { Write-Output \\\$token } } catch { }\""
        
        # 使用和构建脚本完全相同的命令
        PS_OUTPUT=$(powershell.exe -NoProfile -NonInteractive -Command "try { \$token = [System.Environment]::GetEnvironmentVariable('GITHUB_TOKEN', 'User'); if (\$token) { Write-Output \$token } } catch { }" 2>/dev/null)
        
        echo "  Raw PS_OUTPUT:"
        echo "  ---"
        echo "$PS_OUTPUT" | head -10 | sed 's/^/    /'
        echo "  ---"
        echo "  PS_OUTPUT length: ${#PS_OUTPUT}"
        
        # 清理输出（和构建脚本完全相同的逻辑）
        GITHUB_TOKEN=$(echo "$PS_OUTPUT" | grep -v "^PS " | grep -v "^所在位置" | grep -v "^标记" | grep -v "^CategoryInfo" | grep -v "^FullyQualifiedErrorId" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1)
        
        echo "  After cleaning:"
        echo "  GITHUB_TOKEN: [${GITHUB_TOKEN:-empty}]"
        echo "  Length: ${#GITHUB_TOKEN}"
        
        # 检查错误信息
        if echo "$GITHUB_TOKEN" | grep -qiE "error|exception|无法|not found|不存在"; then
            echo "  ✗ Contains error message, clearing..."
            GITHUB_TOKEN=""
        fi
        
        # 检查空值
        if [ -z "${GITHUB_TOKEN// }" ]; then
            echo "  ✗ Empty or whitespace only, clearing..."
            GITHUB_TOKEN=""
        else
            echo "  ✓ Token extracted successfully"
        fi
    else
        echo "Step 3: ✗ PowerShell not found"
    fi
fi
echo ""

echo "=== Final Result ==="
if [ -n "$GITHUB_TOKEN" ] && [ -n "${GITHUB_TOKEN// }" ]; then
    echo "✓ GITHUB_TOKEN is available (length: ${#GITHUB_TOKEN})"
    echo "  First 10 chars: ${GITHUB_TOKEN:0:10}..."
    exit 0
else
    echo "✗ GITHUB_TOKEN is NOT available"
    exit 1
fi


