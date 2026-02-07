# 脚本使用指南

本文档说明优化后的参数化脚本使用方法。所有脚本已统一为参数化形式，新增应用时无需修改 `package.json`，只需更新 `apps.config.json` 配置文件。

## 应用配置

所有应用列表统一管理在 `apps.config.json` 文件中。新增应用时，只需在此文件中添加应用信息即可。

```json
{
  "apps": [
    {
      "id": "new-app",
      "name": "new-app",
      "displayName": "新应用",
      "category": "business",
      "packageName": "new-app"
    }
  ]
}
```

## 参数化脚本使用方式

所有参数化脚本使用 `--app=<app-name>` 或 `--app=<package-name>` 来指定应用。

### 方式一：使用 npm_config_app 环境变量（推荐）

```bash
# PowerShell
$env:npm_config_app="system-app"; pnpm build:app

# Bash
npm_config_app=system-app pnpm build:app
```

### 方式二：使用 pnpm 的 --config 参数

```bash
pnpm build:app --app=system-app
```

## 开发相关脚本

### 启动开发服务器

```bash
# 启动默认应用（apps.config.json 中的 defaultDevApps）
pnpm dev

# 启动所有应用
pnpm dev:all

# 启动特定应用
pnpm dev:app --app=system-app
pnpm dev:app --app=admin-app
```

**旧方式（已废弃）**：
```bash
pnpm dev:system  # ❌ 已删除
```

**新方式**：
```bash
pnpm dev:app --app=system-app  # ✅ 推荐
```

## 构建相关脚本

### 构建应用

```bash
# 构建所有应用
pnpm build:all

# 构建特定应用
pnpm build:app --app=system-app
pnpm build:app --app=admin-app
```

**旧方式（已废弃）**：
```bash
pnpm build:system  # ❌ 已删除
pnpm build:admin   # ❌ 已删除
```

**新方式**：
```bash
pnpm build:app --app=system-app  # ✅ 推荐
pnpm build:app --app=admin-app   # ✅ 推荐
```

### 预览构建结果

```bash
# 预览所有应用
pnpm preview:all

# 预览特定应用
pnpm preview:app --app=system-app

# 构建并预览（单个应用）
pnpm build-preview:app --app=system-app

# 构建并预览（所有应用）
pnpm build-preview:all
```

**旧方式（已废弃）**：
```bash
pnpm preview:system          # ❌ 已删除
pnpm build-preview:system   # ❌ 已删除
```

**新方式**：
```bash
pnpm preview:app --app=system-app        # ✅ 推荐
pnpm build-preview:app --app=system-app  # ✅ 推荐
```

## 部署相关脚本

### 构建并部署

```bash
# 构建并部署特定应用
pnpm build-deploy:app --app=system-app

# 构建并部署所有应用
pnpm build-deploy:all

# 完整部署（构建 + 部署应用 + 部署静态资源）
pnpm build-deploy:app:full --app=system-app
```

**旧方式（已废弃）**：
```bash
pnpm build-deploy:system      # ❌ 已删除
pnpm build-deploy:system:full # ❌ 已删除
```

**新方式**：
```bash
pnpm build-deploy:app --app=system-app        # ✅ 推荐
pnpm build-deploy:app:full --app=system-app   # ✅ 推荐
```

### 部署应用

```bash
# 部署特定应用
pnpm deploy:app --app=system-app

# 部署所有应用
pnpm deploy:all
```

**旧方式（已废弃）**：
```bash
pnpm deploy:system  # ❌ 已删除
```

**新方式**：
```bash
pnpm deploy:app --app=system-app  # ✅ 推荐
```

### 部署静态资源

```bash
# 部署特定应用的静态资源
pnpm deploy:static:app --app=system-app

# 部署所有应用的静态资源
pnpm deploy:static:all

# 构建并部署静态资源
pnpm build-deploy:static:app --app=system-app
```

**旧方式（已废弃）**：
```bash
pnpm deploy:static:system  # ❌ 已删除
```

**新方式**：
```bash
pnpm deploy:static:app --app=system-app  # ✅ 推荐
```

### Kubernetes 部署

```bash
# 自动检测变更的应用并部署
pnpm build-deploy:k8s

# 部署所有应用
pnpm build-deploy:k8s:all

# 部署特定应用
pnpm build-deploy:k8s:app --app=system-app

# 仅构建（K8s）
pnpm build:k8s:app --app=system-app

# 仅部署（K8s）
pnpm deploy:k8s:app --app=system-app
```

**旧方式（已废弃）**：
```bash
pnpm build-deploy:k8s:system  # ❌ 已删除
pnpm build:k8s:system          # ❌ 已删除
pnpm deploy:k8s:system          # ❌ 已删除
```

**新方式**：
```bash
pnpm build-deploy:k8s:app --app=system-app  # ✅ 推荐
pnpm build:k8s:app --app=system-app          # ✅ 推荐
pnpm deploy:k8s:app --app=system-app         # ✅ 推荐
```

## 代码检查相关脚本

### Lint 检查

```bash
# 检查所有应用
pnpm lint

# 检查特定应用
pnpm lint:app --app=system-app

# 自动修复（所有应用）
pnpm lint:fix

# 自动修复（特定应用）
pnpm lint:fix --app=system-app
```

**旧方式（已废弃）**：
```bash
pnpm lint:system      # ❌ 已删除
pnpm lint:fix:system  # ❌ 已删除
```

**新方式**：
```bash
pnpm lint:app --app=system-app        # ✅ 推荐
pnpm lint:fix --app=system-app        # ✅ 推荐
```

### TypeScript 类型检查

```bash
# 检查所有应用
pnpm type-check

# 检查特定应用
pnpm type-check:app --app=system-app
```

**旧方式（已废弃）**：
```bash
pnpm tsc:system  # ❌ 已删除
```

**新方式**：
```bash
pnpm type-check:app --app=system-app  # ✅ 推荐
```

## 应用名称格式

可以使用以下两种格式指定应用：

1. **应用 ID**（来自 `apps.config.json` 的 `id` 字段）：
   ```bash
   pnpm build:app --app=system
   ```

2. **包名**（来自 `apps.config.json` 的 `packageName` 字段）：
   ```bash
   pnpm build:app --app=system-app
   ```

两种方式都可以正常工作，脚本会自动识别。

## 迁移指南

### 从旧脚本迁移到新脚本

| 旧脚本 | 新脚本 |
|--------|--------|
| `pnpm dev:system` | `pnpm dev:app --app=system-app` |
| `pnpm build:system` | `pnpm build:app --app=system-app` |
| `pnpm preview:system` | `pnpm preview:app --app=system-app` |
| `pnpm build-preview:system` | `pnpm build-preview:app --app=system-app` |
| `pnpm build-deploy:system` | `pnpm build-deploy:app --app=system-app` |
| `pnpm deploy:system` | `pnpm deploy:app --app=system-app` |
| `pnpm deploy:static:system` | `pnpm deploy:static:app --app=system-app` |
| `pnpm lint:system` | `pnpm lint:app --app=system-app` |
| `pnpm lint:fix:system` | `pnpm lint:fix --app=system-app` |
| `pnpm tsc:system` | `pnpm type-check:app --app=system-app` |

## 优势

1. **减少维护成本**：新增应用时只需更新 `apps.config.json`，无需修改 `package.json`
2. **统一管理**：所有应用配置集中在一个文件中
3. **一致性**：所有应用使用相同的执行方式
4. **可扩展性**：易于添加新应用和新任务类型
5. **脚本数量**：从 200+ 减少到 ~30，大幅简化

## 常见问题

### Q: 为什么有些脚本还需要单独定义？

A: 一些特殊脚本（如 `build:share`、`deploy:all`）有特殊的业务逻辑，不适合参数化。这些脚本会保留在 `package.json` 中。

### Q: 如何查看所有可用的应用？

A: 运行以下命令查看应用列表：
```bash
node scripts/apps-manager.mjs list
```

### Q: 如何批量操作多个应用？

A: 目前参数化脚本支持单个应用。如需批量操作，可以使用 `:all` 后缀的脚本，或使用 turbo 的 filter 功能：
```bash
pnpm turbo run build --filter=system-app --filter=admin-app
```

### Q: 旧脚本还能用吗？

A: 旧脚本已从 `package.json` 中删除。请使用新的参数化脚本。如果遇到问题，请参考本文档的迁移指南。

## 相关文档

- [应用配置文件](./apps.config.json)
- [Turbo 配置](./turbo.json)
- [版本发布指南](./VERSION_RELEASE_GUIDE.md)
