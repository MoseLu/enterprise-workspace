# RULE.md

> **企业工作空间项目规则** - 所有 AI 助手必须遵守的开发规范

**重要声明**：本文件定义了项目的核心规则，是所有 AI 助手必须严格遵守的默认行为。规则配置为自动加载，无需手动操作。

---

## 自动加载状态

✅ **已配置自动加载**

- **Claude Code**：自动读取 `CLAUDE.md` 和 `AGENTS.md`
- **Cursor**：自动加载 `.cursor/rules/spec-driven-development.jsonc`
- **Windsurf**：自动读取 `CLAUDE.md`
- **Codex CLI**：自动读取 `CLAUDE.md`
- **其他 AI 助手**：自动读取 `AGENTS.md`

**加载顺序**：
1. `CLAUDE.md` - 最高优先级
2. `AGENTS.md` - 多 Agent 配置
3. `.specify/memory/constitution.md` - 项目原则
4. `.cursor/rules/` - 具体规则

---

## 第一部分：强制规则（必须遵守）

以下规则是**强制性的**，所有代码变更必须符合，不遵守将导致 CI 失败。

### R1：代码质量规则

#### R1.1 TypeScript 严格模式

**规则**：所有 TypeScript 文件必须启用严格模式。

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**违规示例**：
```typescript
// ❌ 禁止：any 类型
function process(data: any) {
  return data.value;
}

// ✅ 必须：明确类型
interface ProcessResult {
  value: string;
}
function process(data: { value: string }): ProcessResult {
  return { value: data.value };
}
```

#### R1.2 错误处理

**规则**：所有可能出错的操作必须处理错误，不允许裸用 `panic`。

**Go 语言**：
```go
// ❌ 禁止：裸用 panic
func Process(data []byte) {
  if err := json.Unmarshal(data, &result); err != nil {
    panic(err)
  }
}

// ✅ 必须：返回错误
func Process(data []byte) (*Result, error) {
  var result Result
  if err := json.Unmarshal(data, &result); err != nil {
    return nil, fmt.Errorf("failed to unmarshal data: %w", err)
  }
  return &result, nil
}
```

**TypeScript**：
```typescript
// ❌ 禁止：忽略错误
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// ✅ 必须：处理错误
async function fetchData(): Promise<Data> {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
```

#### R1.3 代码长度限制

**规则**：函数不超过 50 行，文件不超过 300 行。

**检查方法**：
```bash
# 检查文件行数
wc -l src/**/*.ts

# 检查函数长度（使用工具）
npx tslint --rules.max-line-length 50
```

#### R1.4 测试覆盖率

**规则**：核心业务逻辑测试覆盖率不低于 80%。

**覆盖率检查**：
```bash
# 运行测试并检查覆盖率
npm run test:coverage

# 覆盖率报告位置
coverage/lcov-report/index.html
```

**阈值配置**（jest.config.js）：
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### R2：安全性规则

#### R2.1 输入验证

**规则**：所有用户输入必须经过验证和清理。

**后端验证**（Go）：
```go
// ❌ 禁止：直接使用用户输入
func CreateUser(w http.ResponseWriter, r *http.Request) {
  username := r.FormValue("username")
  db.Create(&User{Name: username})  // SQL 注入风险！
}

// ✅ 必须：验证和清理输入
func CreateUser(w http.ResponseWriter, r *http.Request) {
  username := strings.TrimSpace(r.FormValue("username"))
  
  // 验证用户名格式
  if !regexp.MustCompile(`^[a-zA-Z0-9_]{3,20}$`).MatchString(username) {
    http.Error(w, "invalid username", http.StatusBadRequest)
    return
  }
  
  // 使用参数化查询
  db.Create(&User{Name: username})
}
```

**前端验证**（TypeScript）：
```typescript
// ❌ 禁止：直接插入 DOM
function renderUserContent(userInput: string) {
  document.getElementById('content').innerHTML = userInput;  // XSS 风险！
}

// ✅ 必须：转义或使用安全 API
function renderUserContent(userInput: string) {
  const content = document.getElementById('content');
  content.textContent = userInput;  // 使用 textContent 而不是 innerHTML
  
  // 或使用专门的转义库
  content.innerHTML = escapeHtml(userInput);
}
```

#### R2.2 认证授权

**规则**：所有 API 端点必须进行认证和授权检查。

```typescript
// ❌ 禁止：未授权访问
router.get('/api/admin/users', (req, res) => {
  User.findAll();  // 任何人都可以访问！
});

// ✅ 必须：认证中间件 + 授权检查
router.get('/api/admin/users', 
  authenticate,  // 认证中间件
  authorize('admin'),  // 授权中间件
  (req, res) => {
    User.findAll();
  }
);
```

#### R2.3 敏感数据处理

**规则**：敏感数据必须加密存储和传输。

```typescript
// ❌ 禁止：明文存储密码
const user = await User.create({
  email: email,
  password: password,  // 明文密码！
});

// ✅ 必须：使用加密
const hashedPassword = await bcrypt.hash(password, 12);
const user = await User.create({
  email: email,
  password: hashedPassword,  // 加密存储
});
```

### R3：Git 规则

#### R3.1 提交信息规范

**规则**：使用 Conventional Commits 格式。

```
<type>(<scope>): <description>

# 类型：
# feat: 新功能
# fix: 修复 bug
# docs: 文档更新
# style: 代码格式调整
# refactor: 重构
# test: 测试
# chore: 构建/工具

# 示例：
feat(auth): 添加用户登录功能
fix(database): 修复连接池泄漏问题
docs: 更新 API 文档
```

**验证工具**：
```bash
# 安装 commitlint
npm install -D @commitlint/cli @commitlint/config-conventional

# 配置 commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

#### R3.2 分支命名规范

**规则**：分支名称必须符合以下格式。

```
# 功能分支
feature/[ticket-id]-short-description
示例：feature/TICKET-123-user-login

# 修复分支
bugfix/[ticket-id]-short-description
示例：bugfix/TICKET-456-fix-crash

# 紧急修复
hotfix/[ticket-id]-short-description
示例：hotfix/TICKET-789-security-patch
```

### R4：文档规则

#### R4.1 API 文档

**规则**：所有 API 必须使用 OpenAPI/Swagger 文档。

```typescript
// ✅ 正确：OpenAPI 注解
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 获取用户列表
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/api/users', async (req, res) => {
  // 实现
});
```

#### R4.2 README 要求

**规则**：每个项目必须有 README.md，包含以下内容。

```markdown
# 项目名称

## 简介
[1-2 行项目描述]

## 功能特性
- 特性 1
- 特性 2
- 特性 3

## 快速开始

### 前置条件
- Node.js 18+
- PostgreSQL 14+

### 安装
```bash
npm install
```

### 配置
```bash
cp .env.example .env
```

### 运行
```bash
npm run dev
```

## 文档链接
- [完整文档](docs/)
- [API 文档](docs/api.md)
- [贡献指南](CONTRIBUTING.md)

## 许可证
MIT
```

---

## 第二部分：推荐规则（应尽量遵守）

以下规则是**推荐性的**，建议在大多数情况下遵守，但可以根据具体情况进行调整。

### R5：代码风格规则

#### R5.1 命名规范

**规则**：使用有意义的名称，遵循项目惯例。

| 元素 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName`, `orderList` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 函数 | camelCase，动词开头 | `getUser()`, `createOrder()` |
| 类 | PascalCase | `UserController`, `OrderService` |
| 接口 | PascalCase，可加 I 前缀 | `User`, `IUserRepository` |
| 文件 | kebab-case 或 camelCase | `user-service.ts`, `userService.ts` |

#### R5.2 注释规范

**规则**：复杂逻辑必须添加注释，注释应该解释「为什么」而不是「是什么」。

```typescript
// ❌ 不好：重复代码
// 增加计数
count++;

// ✅ 好的：解释原因
// 记录访问日志，用于后续分析用户行为模式
count++;
```

#### R5.3 代码格式化

**规则**：使用 Prettier 进行代码格式化。

**配置**（.prettierrc）：
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**使用**：
```bash
# 格式化所有文件
npm run format

# 检查格式化（不修改）
npm run format:check
```

### R6：性能规则

#### R6.1 数据库查询

**规则**：避免 N+1 查询问题。

```typescript
// ❌ 不好：N+1 查询
const users = await User.findAll();
for (const user of users) {
  const posts = await Post.find({ userId: user.id });  // 每次循环都查询！
}

// ✅ 好的：预加载
const users = await User.findAll({
  include: Post,  // 一次性加载所有关联
});
```

#### R6.2 缓存策略

**规则**：热点数据使用缓存。

```typescript
// ❌ 不好：每次请求都查询数据库
async function getProduct(id: string) {
  return await Product.findById(id);
}

// ✅ 好的：使用缓存
async function getProduct(id: string) {
  const cacheKey = `product:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const product = await Product.findById(id);
  await redis.set(cacheKey, JSON.stringify(product), 'EX', 3600);  // 1小时过期
  
  return product;
}
```

### R7：架构规则

#### R7.1 目录结构

**规则**：遵循项目定义的目录结构。

```
src/
├── components/      # 通用组件
├── features/        # 功能模块
│   └── feature-name/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── store/
│       └── utils/
├── pages/           # 页面组件
├── services/        # API 服务
├── store/           # 全局状态
├── utils/           # 工具函数
└── App.tsx
```

#### R7.2 依赖方向

**规则**：依赖倒置，高层模块不依赖低层模块。

```
❌ 不好：
UserService → Database
UserService → Logger

✅ 好的：
UserService → UserRepository (Interface)
UserService → Logger (Interface)
Database → 实现 UserRepository
Logger → 实现 Logger
```

---

## 第三部分：检查清单

### 代码提交前检查

在提交代码前，运行以下检查：

```bash
# 1. 类型检查
npm run type-check

# 2. 代码检查
npm run lint

# 3. 代码格式化检查
npm run format:check

# 4. 测试
npm run test

# 5. 构建
npm run build
```

### Pull Request 检查清单

创建 Pull Request 前，确保：

- [ ] 代码通过所有 CI 检查
- [ ] 新功能有对应的测试
- [ ] 测试覆盖率达标
- [ ] 文档已更新
- [ ] 无敏感信息泄露
- [ ] 提交信息符合规范

---

## 违规处理

### 严重违规（阻断合并）

以下违规会直接阻断代码合并：

- 违反 R2（安全性规则）
- 测试覆盖率不达标
- 代码检查失败
- 类型检查失败

### 一般违规（警告）

以下违规会触发警告，但可以评审后合并：

- 违反 R5（推荐规则）
- 文档不完整
- 注释不清晰

---

## 规则更新

### 更新流程

1. 提出变更：创建 Issue 说明规则变更原因
2. 讨论评审：团队讨论变更的必要性
3. 投票决定：技术委员会投票
4. 实施更新：更新本文件和相关配置
5. 通知团队：通知所有成员规则变更

### 版本管理

本文件使用语义化版本：

- **主版本**：重大规则变更，可能影响现有代码
- **次版本**：新增规则或澄清现有规则
- **修订版本**：文档修正，不影响规则

---

## 附录

### A. 相关文档

- [constitution.md](.specify/memory/constitution.md) - 项目原则
- [CLAUDE.md](CLAUDE.md) - AI 助手配置
- [使用指南.md](.specify/使用指南.md) - 完整使用教程
- [docs/development/系统开发规范.md](docs/development/系统开发规范.md) - 开发规范

### B. 工具配置

| 工具 | 配置文件 | 用途 |
|------|----------|------|
| ESLint | .eslintrc.js | 代码检查 |
| Prettier | .prettierrc | 代码格式化 |
| TypeScript | tsconfig.json | 类型检查 |
| Jest | jest.config.js | 测试配置 |
| CommitLint | commitlint.config.js | 提交信息检查 |

### C. 联系人

- **规则问题**：技术委员会
- **安全问题**：安全团队
- **一般问题**：项目维护者

---

**版本**：1.0.0  
**最后更新**：2026-02-01  
**下次评审**：2026-05-01
