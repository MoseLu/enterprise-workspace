# Enterprise Workspace - React Admin

React 管理控制台，基于 `@enterprise-workspace/frontend` 设计系统构建。

## 技术栈

- React 18 + TypeScript
- Ant Design 5.x
- Vite 5
- React Router 6

## 目录结构

```
react-admin/
├── apps/                    # 子应用
│   ├── home-app/            # 首页应用
│   └── docs-app/            # 文档应用
├── packages/                # 内部包
│   └── shared/              # 共享库
└── config/                   # 配置
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build
```

## 与 design-system 集成

本项目使用 `@enterprise-workspace/frontend` 作为统一的设计系统：

```typescript
import { Button, Table, Modal } from '@enterprise-workspace/frontend/shared';
import { useTheme, useBreakpoints } from '@enterprise-workspace/frontend/shared/hooks';
```

## 迁移计划

本项目将逐步迁移自 `products/pc-admin` (Vue3)：

1. ✅ home-app - 首页应用
2. ✅ docs-app - 文档应用
3. 🔄 admin-app - 管理应用
4. 🔄 operations-app - 运维应用
5. ...

## License

MIT
