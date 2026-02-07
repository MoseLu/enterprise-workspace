# Quality App

> 品质应用 - 从 pc-admin (Vue3 + Element Plus) 迁移到 react-admin (React + Ant Design)

## 迁移说明

此应用已从 `products/pc-admin/apps/quality-app` 迁移到 `products/react-admin/apps/quality-app`。

### 技术栈变更

| 方面 | 原始技术栈 | 目标技术栈 |
|------|-----------|-----------|
| 框架 | Vue 3 | React 18 |
| UI 组件库 | Element Plus | Ant Design |
| 路由 | Vue Router | React Router |
| 状态管理 | Pinia | 待定 |
| 构建工具 | Vite + @vitejs/plugin-vue | Vite + @vitejs/plugin-react |
| 样式 | SCSS | CSS Modules / SCSS |
| 国际化 | Vue I18n | 待定 |

### 目录结构

```
quality-app/
├── index.html          # 入口 HTML
├── package.json        # 依赖配置
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
├── public/             # 静态资源
└── src/
    ├── main.tsx        # 应用入口
    ├── App.tsx         # 根组件
    ├── index.css       # 全局样式
    ├── components/     # 组件
    ├── pages/          # 页面
    ├── hooks/          # 自定义 Hooks
    ├── services/       # API 服务
    ├── store/          # 状态管理
    ├── utils/          # 工具函数
    └── types/          # 类型定义
```

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 类型检查
pnpm type-check
```

## 注意事项

1. **组件迁移**：Vue 组件需要重写为 React 组件
2. **指令替换**：Vue 指令（如 v-if, v-for）需要替换为 React JSX 语法
3. **生命周期**：Vue 生命周期钩子需要替换为 React useEffect/useLayoutEffect
4. **响应式**：Vue 的 ref/reactive 需要替换为 React useState/useRef
5. **样式**：Scoped CSS 需要转换为 CSS Modules 或全局样式

## 迁移进度

- [x] 基础目录结构创建
- [x] 配置文件迁移
- [x] 入口文件迁移
- [ ] 组件迁移（进行中）
- [ ] 页面迁移
- [ ] 路由配置
- [ ] 状态管理
- [ ] 服务层
- [ ] 样式迁移
- [ ] 测试验证

## 后续工作

1. 逐步迁移 Vue 组件到 React
2. 更新共享模块的引用路径
3. 调整 CI/CD 配置
4. 更新文档
