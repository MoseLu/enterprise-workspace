# Jenkins 创建管理员账号指南

## 方法 1：通过 Jenkins Web UI 创建（推荐）

### 步骤：

1. **访问 Jenkins**
   - 打开浏览器，访问 `http://localhost:9000`

2. **进入安全配置**
   - 点击左侧菜单 **"Manage Jenkins"**（管理 Jenkins）
   - 点击 **"Security"**（安全）或 **"Configure Global Security"**（配置全局安全）
   - 注意：在较新版本的 Jenkins 中，可能直接显示为 **"Security"**

3. **启用安全设置**
   - 在 **"Security Realm"**（安全域）部分：
     - 选择 **"Jenkins' own user database"**（Jenkins 自己的用户数据库）
     - 勾选 **"Allow users to sign up"**（允许用户注册）（可选，用于后续注册）
   - 点击 **"Save"**（保存）

4. **创建管理员用户**
   - 回到 Jenkins 首页
   - 点击右上角的 **"Sign up"**（注册）或 **"Create an account"**（创建账户）
   - 填写：
     - **Username**（用户名）：例如 `admin`
     - **Password**（密码）：设置一个强密码
     - **Full name**（全名）：例如 `Administrator`
     - **Email**（邮箱）：你的邮箱地址
   - 点击 **"Sign up"**（注册）

5. **分配管理员权限**
   - 再次进入 **"Manage Jenkins"** → **"Security"**（安全）
   - 在 **"Authorization"**（授权）部分：
     - 选择 **"Matrix-based security"**（基于矩阵的安全）或 **"Role-Based Strategy"**（基于角色的策略）
   - 如果选择 **"Matrix-based security"**：
     - 在用户列表中找到你刚创建的用户（例如 `admin`）
     - 勾选 **"Overall/Administer"**（总体/管理员）权限
   - 如果选择 **"Role-Based Strategy"**：
     - 需要先安装 **"Role-based Authorization Strategy"** 插件
     - 然后创建角色并分配权限
   - 点击 **"Save"**（保存）

6. **验证管理员权限**
   - 退出当前登录
   - 使用新创建的管理员账号登录
   - 确认可以看到 **"Manage Jenkins"** 菜单

## 方法 2：通过 Jenkins 初始化脚本（首次安装时）

如果这是首次安装 Jenkins，Jenkins 会显示一个初始化向导：

1. **解锁 Jenkins**
   - 访问 `http://localhost:9000`
   - 按照提示找到初始管理员密码（通常在日志文件或屏幕上显示）

2. **安装推荐插件**
   - 选择 **"Install suggested plugins"**（安装推荐插件）

3. **创建管理员用户**
   - 填写管理员信息：
     - **Username**（用户名）
     - **Password**（密码）
     - **Full name**（全名）
     - **Email**（邮箱）
   - 点击 **"Save and Continue"**（保存并继续）

4. **完成配置**
   - 确认 Jenkins URL
   - 点击 **"Save and Finish"**（保存并完成）

## 方法 3：通过 Jenkins 配置文件（高级）

如果你有服务器文件系统访问权限，可以直接编辑配置文件：

1. **找到 Jenkins 配置文件**
   - Windows: `C:\Users\<username>\.jenkins\config.xml` 或 Jenkins 安装目录
   - 或者查看 Jenkins 启动日志中的 `JENKINS_HOME` 路径

2. **修改安全配置**
   - 编辑 `config.xml`，设置：
     ```xml
     <useSecurity>true</useSecurity>
     <authorizationStrategy class="hudson.security.FullControlOnceLoggedInAuthorizationStrategy"/>
     ```

3. **创建用户**
   - 在 `users/` 目录下创建用户文件夹
   - 或者使用 Jenkins CLI 创建用户

## 方法 4：临时禁用安全（仅用于测试）

⚠️ **警告：此方法仅用于测试环境，生产环境请勿使用！**

1. **编辑 Jenkins 配置文件**
   - 找到 `config.xml` 文件
   - 设置：
     ```xml
     <useSecurity>false</useSecurity>
     ```

2. **重启 Jenkins**
   - 重启 Jenkins 服务

3. **创建用户后重新启用安全**
   - 通过 Web UI 创建用户
   - 重新启用安全设置

## 验证管理员账号

创建完成后，使用以下命令验证：

```powershell
.\jenkins\create-jobs.ps1 -JenkinsUser "admin" -JenkinsPassword "your-password"
```

如果成功创建 Jobs，说明管理员账号配置正确。

## 常见问题

### Q: 忘记了管理员密码怎么办？

A: 
1. 如果有其他管理员账号，可以用它重置密码
2. 如果没有，需要编辑 `users/<username>/config.xml` 文件，重置密码哈希
3. 或者临时禁用安全，重新设置

### Q: 如何给现有用户添加管理员权限？

A:
1. 使用管理员账号登录
2. 进入 **"Manage Jenkins"** → **"Security"**（安全）
3. 在 **"Authorization"**（授权）部分，找到该用户
4. 勾选 **"Overall/Administer"**（总体/管理员）权限
5. 保存

### Q: 如何查看当前用户权限？

A:
- 访问 `http://localhost:9000/user/<username>/configure`
- 或者访问 `http://localhost:9000/user/<username>/api/json` 查看用户信息
