# PowerShell 脚本：向 Cursor 发送快捷键
# 用于自动打开新的 Chat 对话

param(
    [string]$Shortcut = "Ctrl+L"
)

# 加载 Windows Forms 程序集
Add-Type -AssemblyName System.Windows.Forms

Write-Host "🔍 正在查找 Cursor 窗口..." -ForegroundColor Cyan

# 查找 Cursor 窗口
$cursorProcess = Get-Process | Where-Object { 
    $_.MainWindowTitle -like "*Cursor*" -or 
    $_.ProcessName -like "*cursor*" -or
    $_.MainWindowTitle -like "*Code*"
} | Select-Object -First 1

if (-not $cursorProcess) {
    Write-Host "❌ 未找到 Cursor 窗口" -ForegroundColor Red
    Write-Host "💡 请确保 Cursor 已打开并处于活动状态" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 找到 Cursor 窗口: $($cursorProcess.MainWindowTitle)" -ForegroundColor Green

# 激活 Cursor 窗口
try {
    # 使用 SetForegroundWindow API
    $signature = @"
        [DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);
        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
"@
    
    $type = Add-Type -MemberDefinition $signature -Name Win32ShowWindowAsync -Namespace Win32Functions -PassThru
    $hwnd = $cursorProcess.MainWindowHandle
    
    # 显示窗口（如果最小化）
    $type::ShowWindow($hwnd, 9) | Out-Null  # SW_RESTORE = 9
    
    # 激活窗口
    $type::SetForegroundWindow($hwnd) | Out-Null
    
    # 等待窗口激活
    Start-Sleep -Milliseconds 300
    
    Write-Host "✅ Cursor 窗口已激活" -ForegroundColor Green
} catch {
    Write-Host "⚠️  无法激活窗口，尝试继续..." -ForegroundColor Yellow
}

# 发送快捷键
Write-Host "⌨️  正在发送快捷键: $Shortcut" -ForegroundColor Cyan

try {
    # 根据快捷键类型发送
    switch ($Shortcut) {
        "Ctrl+L" {
            # Ctrl+L: 打开 Chat 面板
            [System.Windows.Forms.SendKeys]::SendWait("^l")
            Write-Host "✅ 已发送 Ctrl+L (打开 Chat 面板)" -ForegroundColor Green
            Write-Host "💡 提示：请在 Chat 面板中点击 '+ New Chat' 按钮" -ForegroundColor Yellow
        }
        "Ctrl+T" {
            # Ctrl+T: 可能是打开新 Chat（如果 Cursor 支持）
            [System.Windows.Forms.SendKeys]::SendWait("^t")
            Write-Host "✅ 已发送 Ctrl+T" -ForegroundColor Green
        }
        "Ctrl+Shift+P" {
            # Ctrl+Shift+P: 打开命令面板
            [System.Windows.Forms.SendKeys]::SendWait("^+p")
            Write-Host "✅ 已发送 Ctrl+Shift+P (打开命令面板)" -ForegroundColor Green
            Write-Host "💡 提示：请输入 'New Chat' 或 'Cursor: New Chat'" -ForegroundColor Yellow
        }
        default {
            # 自定义快捷键（使用 SendKeys 格式）
            $keys = $Shortcut -replace "Ctrl\+", "^" -replace "Shift\+", "+" -replace "Alt\+", "%"
            [System.Windows.Forms.SendKeys]::SendWait($keys)
            Write-Host "✅ 已发送快捷键: $Shortcut" -ForegroundColor Green
        }
    }
    
    Write-Host "✅ 快捷键发送成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 发送快捷键失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
