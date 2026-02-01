# 结束所有开发服务器进程的脚本
# 注意：只结束占用开发端口的 Node.js 进程，不影响 IDE 相关进程

$ports = @(8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089, 8091, 8092, 8093, 8094, 8095, 8096)

Write-Host "🔍 检查开发端口占用情况..." -ForegroundColor Cyan

$killedProcesses = @()

foreach ($port in $ports) {
    try {
        $netstatOutput = netstat -ano | Select-String ":$port " | Select-String "LISTENING"
        if ($netstatOutput) {
            $pid = ($netstatOutput -split '\s+')[-1]
            if ($pid) {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process -and $process.ProcessName -eq "node") {
                    Write-Host "  ❌ 端口 $port 被 Node.js 进程占用 (PID: $pid)" -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    $killedProcesses += @{Port = $port; Pid = $pid}
                    Write-Host "  ✅ 已结束进程 $pid" -ForegroundColor Green
                } elseif ($process) {
                    Write-Host "  ⚠️  端口 $port 被进程占用 (PID: $pid, 进程: $($process.ProcessName))" -ForegroundColor Yellow
                    Write-Host "     这是系统进程或非 Node.js 进程，跳过" -ForegroundColor Gray
                }
            }
        }
    } catch {
        # 忽略错误
    }
}

if ($killedProcesses.Count -eq 0) {
    Write-Host "`n✅ 没有找到开发服务器进程" -ForegroundColor Green
} else {
    Write-Host "`n✅ 已结束 $($killedProcesses.Count) 个开发服务器进程" -ForegroundColor Green
}

Write-Host "`n💡 提示：如果某些端口仍被系统服务占用，可能需要重启系统或检查系统服务配置" -ForegroundColor Cyan
