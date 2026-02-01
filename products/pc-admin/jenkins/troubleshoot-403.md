# Jenkins 403 权限错误排查指南

## 当前问题

即使已经授予了所有权限，创建 Job 时仍然返回 HTTP 403 错误。

## 可能的原因和解决方案

### 1. 确认权限配置已保存

**检查步骤：**
- 在权限矩阵页面，确认所有权限都已勾选
- **重要：** 滚动到页面最底部，点击 **"Save"**（保存）按钮
- 如果只点击了 "Apply"（应用），请再次点击 "Save"

**验证：**
- 刷新页面，检查权限是否还在
- 如果权限消失了，说明没有保存成功

### 2. 重新登录 Jenkins

**操作步骤：**
1. 退出 Jenkins（点击右上角用户名 → Sign out）
2. 等待 5-10 秒
3. 重新登录 Jenkins（使用 Mose 账号）
4. 再次运行创建脚本

### 3. 检查权限矩阵配置

**确保以下权限已勾选：**

对于 **Mose** 用户，至少需要：

```
Overall:
  ✓ Administer  (或者至少 Read)

Job:
  ✓ Create
  ✓ Configure
  ✓ Delete
  ✓ Read
  ✓ Discover
  ✓ Move

Run:
  ✓ Build
  ✓ Update
```

**或者最简单的方式：**
- 勾选 **Overall** → **Administer**（这会包含所有权限）

### 4. 检查 Jenkins 安全设置

**操作步骤：**
1. 进入：**Manage Jenkins** → **Security**
2. 检查 **"Enable security"** 是否已启用
3. 检查 **"Authorization"** 部分：
   - 确认选择了 **"Matrix-based security"**（矩阵安全）
   - 不是 "Logged-in users can do anything"（已登录用户可做任何事）

### 5. 检查是否有其他安全限制

**可能的限制：**
- Jenkins 可能配置了 IP 白名单
- 可能有插件限制了 API 访问
- 可能有代理或防火墙规则

**检查方法：**
1. 在 Jenkins 中，尝试手动创建一个 Job（通过 Web UI）
2. 如果 Web UI 可以创建，但 API 不行，可能是 API 访问被限制

### 6. 检查 Jenkins 系统日志

**操作步骤：**
1. 进入：**Manage Jenkins** → **System Log**
2. 查看最近的错误日志
3. 搜索包含 "403"、"Forbidden"、"Mose" 的日志条目

**或者运行脚本：**
```powershell
.\jenkins\check-jenkins-log.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

### 7. 尝试使用管理员账号

如果 Jenkins 有管理员账号，可以尝试：

```powershell
.\jenkins\create-jobs.ps1 -JenkinsUser "admin" -JenkinsPassword "admin-password"
```

### 8. 临时禁用安全（仅用于测试）

**警告：** 仅用于测试，生产环境不要这样做！

1. 进入：**Manage Jenkins** → **Security**
2. 取消勾选 **"Enable security"**
3. 保存
4. 运行创建脚本（不需要用户名密码）
5. 测试完成后，重新启用安全

### 9. 检查 Jenkins 版本兼容性

某些 Jenkins 版本可能有权限系统的 bug。

**检查版本：**
- 进入：**Manage Jenkins** → **About Jenkins**
- 查看 Jenkins 版本号

**如果版本较旧：**
- 考虑升级 Jenkins
- 或者尝试使用 Jenkins CLI 而不是 REST API

### 10. 验证 API 访问权限

运行测试脚本查看详细错误：

```powershell
.\jenkins\test-permissions.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

## 推荐的排查顺序

1. ✅ **确认已保存权限配置**（最重要！）
2. ✅ **退出并重新登录 Jenkins**
3. ✅ **等待 10 秒让配置生效**
4. ✅ **再次运行创建脚本**
5. ✅ **如果仍然失败，检查 Jenkins 系统日志**
6. ✅ **尝试使用管理员账号**

## 快速测试命令

```powershell
# 测试权限
.\jenkins\test-permissions.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"

# 创建 Jobs
.\jenkins\create-jobs.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

## 如果以上都不行

请提供以下信息以便进一步诊断：

1. Jenkins 版本号
2. Jenkins 系统日志中的相关错误信息
3. 权限矩阵的截图
4. 是否可以通过 Web UI 手动创建 Job
