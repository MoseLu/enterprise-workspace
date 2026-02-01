# 修改 Jenkins 端口

## Windows 系统修改 Jenkins 端口

### 方式一：修改 Jenkins 配置文件（推荐）

1. **找到 Jenkins 安装目录**
   - 如果使用 Java 直接运行，通常在用户目录：`C:\Users\你的用户名\.jenkins`
   - 或者检查环境变量 `JENKINS_HOME`

2. **修改 Jenkins 配置文件**

找到 Jenkins 的配置文件（通常在安装目录的 `jenkins.xml`），修改端口：

```xml
<arguments>-Xrs -Xmx256m -Dhudson.lifecycle=hudson.lifecycle.WindowsServiceLifecycle -jar "%BASE%\jenkins.war" --httpPort=9080 --webroot="%BASE%\war"</arguments>
```

将 `--httpPort=8080` 改为 `--httpPort=9080`（或其他端口，比如 9090）

3. **重启 Jenkins**

如果是 Windows 服务：
```powershell
# 停止服务
Stop-Service jenkins

# 启动服务
Start-Service jenkins
```

如果是直接运行 Java：
```powershell
# 找到 Java 进程并停止
Get-Process java | Stop-Process

# 重新启动 Jenkins
java -jar jenkins.war --httpPort=9080
```

### 方式二：使用环境变量启动

如果 Jenkins 是通过命令行启动的，可以直接指定端口：

```powershell
java -jar jenkins.war --httpPort=9080
```

### 方式三：修改 Jenkins 配置文件（jenkins.xml）

1. 找到 `jenkins.xml` 文件（通常在 Jenkins 安装目录）
2. 找到 `<arguments>` 标签
3. 修改 `--httpPort=8080` 为 `--httpPort=9080`
4. 保存文件
5. 重启 Jenkins 服务

### 方式四：如果是通过安装包安装

1. 打开 Jenkins 安装目录（通常在 `C:\Program Files\Jenkins`）
2. 编辑 `jenkins.xml`
3. 修改 `--httpPort=8080` 为 `--httpPort=9080`
4. 重启 Jenkins Windows 服务

## 推荐端口

建议使用以下端口之一（避免与其他服务冲突）：
- **9080**（推荐）
- **9090**
- **8888**
- **9091**

## 修改后访问

修改端口后，访问地址变为：
- **http://localhost:9080**（如果改为9080）

## 快速修改脚本（Windows PowerShell）

```powershell
# 假设 Jenkins 安装在默认位置
$jenkinsXml = "C:\Program Files\Jenkins\jenkins.xml"

# 如果不在默认位置，查找文件
if (-not (Test-Path $jenkinsXml)) {
    # 在其他可能的位置查找
    $possiblePaths = @(
        "$env:ProgramFiles\Jenkins\jenkins.xml",
        "$env:ProgramFiles(x86)\Jenkins\jenkins.xml",
        "$env:USERPROFILE\.jenkins\jenkins.xml"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $jenkinsXml = $path
            break
        }
    }
}

if (Test-Path $jenkinsXml) {
    Write-Host "找到 Jenkins 配置文件: $jenkinsXml"
    Write-Host "正在修改端口为 9080..."
    
    $content = Get-Content $jenkinsXml -Raw
    $content = $content -replace '--httpPort=8080', '--httpPort=9080'
    Set-Content $jenkinsXml -Value $content -NoNewline
    
    Write-Host "✅ 端口已修改为 9080"
    Write-Host "请重启 Jenkins 服务使更改生效"
} else {
    Write-Host "❌ 未找到 jenkins.xml 文件"
    Write-Host "请手动查找并修改配置文件"
}
```
