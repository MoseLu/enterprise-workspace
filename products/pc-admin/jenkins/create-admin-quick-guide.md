# Jenkins 创建管理员账号 - 快速指南

根据你提供的菜单，请按照以下步骤操作：

## 步骤 1：进入安全配置

1. 在 Jenkins 首页，点击左侧菜单 **"Manage Jenkins"**（管理 Jenkins）
2. 在系统配置部分，点击 **"Security"**（安全）

## 步骤 2：配置安全域（Security Realm）

在 **"Security"** 页面中：

1. 找到 **"Security Realm"**（安全域）部分
2. 选择 **"Jenkins' own user database"**（Jenkins 自己的用户数据库）
3. 勾选 **"Allow users to sign up"**（允许用户注册）
4. 点击页面底部的 **"Save"**（保存）或 **"Apply"**（应用）

## 步骤 3：创建新用户

1. 返回 Jenkins 首页
2. 点击右上角的 **"Sign up"**（注册）链接
3. 填写信息：
   - **Username**（用户名）：例如 `admin`
   - **Password**（密码）：设置一个强密码
   - **Full name**（全名）：例如 `Administrator`
   - **Email**（邮箱）：你的邮箱地址
4. 点击 **"Sign up"**（注册）

## 步骤 4：分配管理员权限

1. 使用当前账号（Mose）登录
2. 进入 **"Manage Jenkins"** → **"Security"**（安全）
3. 找到 **"Authorization"**（授权）部分
4. 选择授权策略：
   - **"Matrix-based security"**（基于矩阵的安全）- 推荐
   - 或 **"Logged-in users can do anything"**（登录用户可以执行任何操作）- 简单但不安全
5. 如果选择 **"Matrix-based security"**：
   - 在用户/组列表中找到你刚创建的 `admin` 用户
   - 勾选 **"Overall/Administer"**（总体/管理员）权限
   - 确保勾选了所有需要的权限
6. 点击 **"Save"**（保存）

## 步骤 5：验证管理员账号

1. 退出当前登录
2. 使用新创建的 `admin` 账号登录
3. 确认可以看到 **"Manage Jenkins"** 菜单
4. 使用脚本测试：
   ```powershell
   .\jenkins\create-jobs.ps1 -JenkinsUser "admin" -JenkinsPassword "your-password"
   ```

## 如果看不到 "Security" 选项

如果你在 **"Manage Jenkins"** 页面看不到 **"Security"** 选项，可能的原因：

1. **当前用户没有权限**
   - 需要先使用管理员账号登录
   - 或者临时禁用安全设置

2. **Jenkins 版本不同**
   - 某些版本的 Jenkins 可能使用不同的菜单名称
   - 尝试直接访问：`http://localhost:9000/configureSecurity`

3. **安全设置未启用**
   - 如果安全设置未启用，可能不会显示 Security 选项
   - 需要先启用安全设置

## 临时解决方案：给现有用户添加权限

如果你无法创建新用户，可以尝试给现有用户 "Mose" 添加创建 Job 的权限：

1. 进入 **"Manage Jenkins"** → **"Security"**（安全）
2. 在 **"Authorization"**（授权）部分：
   - 选择 **"Matrix-based security"**
   - 找到用户 `Mose`
   - 勾选以下权限：
     - **"Overall/Read"**（总体/读取）
     - **"Job/Create"**（任务/创建）
     - **"Job/Configure"**（任务/配置）
     - **"Job/Delete"**（任务/删除）
     - 或者直接勾选 **"Overall/Administer"**（总体/管理员）
3. 点击 **"Save"**（保存）

保存后，再次运行脚本应该就可以创建 Jobs 了。
