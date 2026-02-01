# Jenkins 必需插件列表

## 问题

如果遇到 403 权限错误，可能是缺少必要的 Jenkins 插件。

## 必需插件

### 1. Matrix Authorization Strategy Plugin（矩阵授权策略插件）

**插件名称：** `matrix-auth`  
**用途：** 启用矩阵权限配置（Matrix-based security）  
**是否必需：** ✅ **是**（如果使用矩阵权限）

**安装步骤：**
1. 进入：**Manage Jenkins** → **Plugins** → **Available**（可用插件）
2. 搜索：`Matrix Authorization Strategy`
3. 勾选插件
4. 点击 **"Install without restart"**（不重启安装）或 **"Download now and install after restart"**（下载并在重启后安装）
5. 等待安装完成

**验证：**
- 进入：**Manage Jenkins** → **Security**
- 在 **"Authorization"** 部分应该能看到 **"Matrix-based security"** 选项

---

### 2. Pipeline 相关插件

#### Pipeline（工作流聚合器）

**插件名称：** `workflow-aggregator`  
**用途：** Pipeline 功能的核心插件  
**是否必需：** ✅ **是**（如果使用 Pipeline Job）

**包含的子插件：**
- Pipeline: Job (`workflow-job`)
- Pipeline: Groovy (`workflow-cps`)
- Pipeline: API (`workflow-api`)
- Pipeline: Basic Steps (`workflow-basic-steps`)
- Pipeline: SCM Step (`workflow-scm-step`)
- Pipeline: Step API (`workflow-step-api`)
- Pipeline: Supporting APIs (`workflow-support`)

**安装步骤：**
1. 进入：**Manage Jenkins** → **Plugins** → **Available**
2. 搜索：`Pipeline`
3. 勾选 **"Pipeline"**（这会自动安装所有相关子插件）
4. 点击安装

---

### 3. Git 相关插件

#### Git Plugin

**插件名称：** `git`  
**用途：** 从 Git 仓库拉取代码  
**是否必需：** ✅ **是**（如果使用 Git 仓库）

**安装步骤：**
1. 进入：**Manage Jenkins** → **Plugins** → **Available**
2. 搜索：`Git`
3. 勾选 **"Git plugin"**
4. 点击安装

---

## 检查已安装的插件

### 方法 1：通过 Web UI

1. 进入：**Manage Jenkins** → **Plugins** → **Installed**（已安装）
2. 搜索插件名称
3. 检查状态是否为 **"Enabled"**（已启用）

### 方法 2：使用脚本检查

运行以下 PowerShell 脚本：

```powershell
.\jenkins\check-plugins.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

这个脚本会：
- 检查所有必需插件是否已安装
- 显示插件版本和状态
- 列出缺失的插件
- 提示需要安装的插件

---

## 安装插件后的操作

### 1. 重启 Jenkins（如果需要）

某些插件安装后需要重启 Jenkins：

1. 进入：**Manage Jenkins** → **Prepare for Shutdown**（准备关机）
2. 等待所有任务完成
3. 重启 Jenkins 服务

### 2. 重新配置权限

安装 **Matrix Authorization Strategy Plugin** 后：

1. 进入：**Manage Jenkins** → **Security**
2. 在 **"Authorization"** 部分选择 **"Matrix-based security"**
3. 配置用户权限
4. **保存配置**

### 3. 验证插件

运行测试脚本验证：

```powershell
.\jenkins\test-permissions.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

---

## 常见问题

### Q: 插件安装失败？

**A:** 
- 检查网络连接
- 检查 Jenkins 是否有足够的磁盘空间
- 查看 Jenkins 系统日志：**Manage Jenkins** → **System Log**

### Q: 插件已安装但仍然报错？

**A:**
- 检查插件是否已启用：**Manage Jenkins** → **Plugins** → **Installed**
- 如果插件被禁用，点击 **"Enable"**（启用）
- 重启 Jenkins

### Q: 找不到插件？

**A:**
- 确保已更新插件列表：**Manage Jenkins** → **Plugins** → **Advanced** → **Check now**（立即检查）
- 某些插件可能需要特定版本的 Jenkins
- 检查 Jenkins 版本：**Manage Jenkins** → **About Jenkins**

### Q: 安装插件后权限仍然无效？

**A:**
1. 确认已安装 **Matrix Authorization Strategy Plugin**
2. 确认已选择 **"Matrix-based security"** 作为授权策略
3. 重新配置用户权限并保存
4. 退出并重新登录 Jenkins
5. 等待 10-15 秒让配置生效

---

## 推荐的插件安装顺序

1. ✅ **Matrix Authorization Strategy Plugin**（如果使用矩阵权限）
2. ✅ **Pipeline**（如果使用 Pipeline Job）
3. ✅ **Git Plugin**（如果使用 Git 仓库）

---

## 快速检查命令

```powershell
# 检查插件
.\jenkins\check-plugins.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"

# 测试权限
.\jenkins\test-permissions.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"

# 创建 Jobs
.\jenkins\create-jobs.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```
