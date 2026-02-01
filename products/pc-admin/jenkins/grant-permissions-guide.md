# Jenkins 给用户添加创建 Job 权限 - 详细步骤

## 当前状态

你已经进入了权限配置界面，看到了权限矩阵。现在需要给用户 "Mose" 添加创建 Job 的权限。

## 操作步骤

### 方法 1：给 "Mose" 用户单独添加权限（推荐）

1. **添加用户到权限矩阵**
   - 在权限矩阵表格中，找到 **"Add user…"**（添加用户）按钮
   - 点击 **"Add user…"**
   - 在弹出的输入框中输入：`Mose`
   - 点击确认或按回车

2. **分配权限**
   - 在权限矩阵中找到刚添加的 **"Mose"** 行
   - 勾选以下权限：
     - **Overall** → **Administer**（总体 → 管理员）- 最简单，包含所有权限
     - 或者至少勾选：
       - **Overall** → **Read**（总体 → 读取）
       - **Job** → **Create**（任务 → 创建）
       - **Job** → **Configure**（任务 → 配置）
       - **Job** → **Delete**（任务 → 删除）
       - **Job** → **Read**（任务 → 读取）

3. **保存配置**
   - 滚动到页面底部
   - 点击 **"Save"**（保存）或 **"Apply"**（应用）按钮

### 方法 2：给 "Authenticated Users" 组添加权限（所有登录用户）

如果你希望所有登录用户都能创建 Job：

1. **找到 "Authenticated Users" 行**
   - 在权限矩阵中找到 **"Authenticated Users"**（已认证用户）行

2. **勾选权限**
   - 在 **"Job"** 列下，勾选：
     - **Create**（创建）
     - **Configure**（配置）
     - **Delete**（删除）
     - **Read**（读取）

3. **保存配置**
   - 点击页面底部的 **"Save"**（保存）

## 权限说明

### 最小权限（仅创建 Job）
- **Overall** → **Read**：可以访问 Jenkins
- **Job** → **Create**：可以创建新的 Job
- **Job** → **Configure**：可以配置 Job
- **Job** → **Read**：可以查看 Job

### 推荐权限（完整管理）
- **Overall** → **Administer**：管理员权限，包含所有操作

## 验证权限

保存后，运行以下命令验证：

```powershell
.\jenkins\create-jobs.ps1 -JenkinsUser "Mose" -JenkinsPassword "123456"
```

如果成功创建 Jobs，说明权限配置正确。

## 常见问题

### Q: 添加用户后找不到？

A: 
- 确保输入的用户名与登录用户名完全一致（区分大小写）
- 检查用户是否已经存在（可能在 "Authenticated Users" 组中）

### Q: 保存后仍然没有权限？

A:
- 退出并重新登录 Jenkins
- 清除浏览器缓存
- 等待几秒钟让配置生效

### Q: 如何删除用户权限？

A:
- 在权限矩阵中找到该用户行
- 取消勾选所有权限
- 或者点击用户行右侧的删除按钮（如果有）
