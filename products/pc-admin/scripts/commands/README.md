# 交互式命令系统

类似 vue-cli 的交互式命令系统，支持通过交互式菜单选择命令类型、应用和操作。

## 使用方法

### 交互式模式

直接运行 `pnpm cmd`，系统会引导你选择：

1. **命令类型**：dev, build, preview, deploy, lint, type-check, build-deploy, build-preview
2. **应用**：system, admin, logistics, finance, engineering, quality, production, monitor, layout, mobile, docs
3. **子命令**（如果需要）：如 lint 的 check/fix，deploy 的 local/static/k8s

```bash
pnpm cmd
```

### 快速模式

直接通过命令行参数执行，跳过交互式选择：

```bash
# 开发系统应用
pnpm cmd dev system

# 检查管理应用代码
pnpm cmd lint admin check

# 修复物流应用代码
pnpm cmd lint logistics fix

# 构建财务应用
pnpm cmd build finance

# 部署工程应用到本地
pnpm cmd deploy engineering local

# 部署品质应用到 K8s
pnpm cmd deploy quality k8s

# 类型检查生产应用
pnpm cmd type-check production
```

## 支持的命令类型

- **dev**: 启动开发服务器
- **build**: 构建生产版本
- **preview**: 预览构建结果
- **lint**: 代码检查（子命令：check, fix）
- **type-check**: TypeScript 类型检查
- **deploy**: 部署应用（子命令：local, static, k8s）
- **build-deploy**: 构建并部署（子命令：full, k8s）
- **build-preview**: 构建并预览

## 支持的应用

- system (系统应用)
- admin (管理应用)
- logistics (物流应用)
- finance (财务应用)
- engineering (工程应用)
- quality (品质应用)
- production (生产应用)
- monitor (监控应用)
- layout (布局应用)
- mobile (移动应用)
- docs (文档站点)

## 向后兼容

所有现有的命令仍然可用，例如：
- `pnpm dev:system`
- `pnpm lint:admin`
- `pnpm build:logistics`
- 等等...

新的交互式系统是对现有命令的增强，不会破坏任何现有功能。

