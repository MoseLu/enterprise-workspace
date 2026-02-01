# 验证 Jenkins 授权策略 - 关键步骤

## ⚠️ 重要提示

如果授权策略不是 **"Matrix-based security"**，那么你在权限矩阵中配置的所有权限都不会生效！

## 如何检查授权策略

### 步骤 1：进入安全配置

1. 打开 Jenkins：`http://localhost:9000`
2. 点击左侧菜单：**Manage Jenkins**（管理 Jenkins）
3. 点击：**Security**（安全）

### 步骤 2：找到授权部分

在安全配置页面中，找到 **"Authorization"**（授权）部分。

### 步骤 3：检查当前选择的策略

在 **"Authorization"** 部分，你会看到一个下拉菜单或单选按钮组，显示当前选择的授权策略。

**必须选择：** ✅ **"Matrix-based security"**（矩阵安全）

**不能选择：**
- ❌ "Logged-in users can do anything"（已登录用户可做任何事）
- ❌ "Anyone can do anything"（任何人都可以做任何事）
- ❌ "Role-Based Strategy"（基于角色的策略）- 除非你明确配置了角色

### 步骤 4：如果策略不正确

1. **选择 "Matrix-based security"**
2. **立即会显示权限矩阵表格**
3. **在矩阵中添加用户 "Mose"**（如果还没有）
4. **勾选权限**（至少 Overall/Read 和 Job/Create）
5. **滚动到底部，点击 "Save"（保存）**

### 步骤 5：验证配置

保存后，你应该能看到：
- 授权策略显示为 "Matrix-based security"
- 权限矩阵表格中显示用户 "Mose"
- "Mose" 行中相关权限已勾选

## 常见问题

### Q: 我找不到 "Authorization" 部分？

**A:** 
- 确保你进入了正确的页面：**Manage Jenkins** → **Security**
- 如果页面很长，向下滚动查找
- 在某些 Jenkins 版本中，可能显示为 "授权" 或 "权限配置"

### Q: 我选择了 "Matrix-based security" 但矩阵表格是空的？

**A:**
- 这是正常的，你需要手动添加用户
- 点击 "Add user…"（添加用户）按钮
- 输入用户名 "Mose"
- 然后勾选权限

### Q: 我选择了 "Logged-in users can do anything"，为什么还是 403？

**A:**
- "Logged-in users can do anything" 策略可能不适用于 REST API
- 某些 Jenkins 版本中，这个策略只适用于 Web UI
- **建议：** 改用 "Matrix-based security" 并明确配置权限

### Q: 我已经选择了 "Matrix-based security" 并配置了权限，还是不行？

**A:**
请按以下顺序检查：

1. ✅ **确认已保存配置**
   - 滚动到页面底部
   - 点击 "Save"（保存）按钮
   - 不要只点 "Apply"（应用）

2. ✅ **确认用户已在矩阵中**
   - 在权限矩阵表格中，确认能看到 "Mose" 这一行
   - 如果看不到，点击 "Add user…" 添加

3. ✅ **确认权限已勾选**
   - 对于 "Mose" 行，至少勾选：
     - Overall → Read
     - Job → Create
     - Job → Configure
     - Job → Read
   - 或者直接勾选 Overall → Administer（推荐）

4. ✅ **退出并重新登录**
   - 点击右上角用户名 → Sign out（退出）
   - 等待 5-10 秒
   - 重新登录

5. ✅ **等待配置生效**
   - 等待 10-15 秒

6. ✅ **重启 Jenkins（最后手段）**
   - 如果以上都不行，尝试重启 Jenkins 服务
   - 这确保所有配置都被重新加载

## 快速验证命令

配置完成后，运行：

```powershell
.\jenkins\test-permissions.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

如果测试通过，运行：

```powershell
.\jenkins\create-jobs.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

## 截图检查清单

请确认以下内容：

- [ ] 授权策略 = "Matrix-based security"
- [ ] 权限矩阵中有 "Mose" 这一行
- [ ] "Mose" 行的权限已勾选（至少 Job/Create）
- [ ] 已点击页面底部的 "Save" 按钮
- [ ] 已退出并重新登录 Jenkins
- [ ] 等待了 10-15 秒

如果以上所有项都确认了，但仍然失败，请提供：
1. 授权策略选择的截图
2. 权限矩阵的截图
3. Jenkins 系统日志中的相关错误信息
