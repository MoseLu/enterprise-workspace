# main-app

主应用 - 企业工作平台 React 版本

## 技术栈

- React 18
- TypeScript
- Vite 5
- Ant Design 5
- React Router DOM 6
- Zustand (状态管理)

## 开发

```bash
# 启动开发服务器
pnpm dev

# 或使用 react-admin 脚本
pnpm dev:main
```

## 构建

```bash
# 构建生产版本
pnpm build

# 或使用 react-admin 脚本
pnpm build:main
```

## 目录结构

```
src/
├── main.tsx           # 入口文件
├── App.tsx            # 根组件
├── assets/           # 静态资源
│   ├── images/       # 图片
│   └── styles/       # 全局样式
├── components/       # 公共组件
│   └── Layout/       # 主布局
├── pages/            # 页面
│   ├── login/        # 登录页
│   ├── register/     # 注册页
│   ├── forget-password/  # 忘记密码
│   └── profile/      # 个人中心
├── router/           # 路由配置
│   └── ProtectedRoute.tsx  # 路由守卫
├── stores/           # 状态管理
│   ├── auth.ts       # 认证状态
│   └── theme.ts      # 主题状态
└── services/         # API 服务
```

## 功能特性

- 用户登录/注册
- 多方式认证（账号密码、手机验证码）
- 子应用容器（支持 qiankun 微前端）
- 主题切换（亮色/暗色）
- 多应用导航

## 迁移说明

此应用从 `products/pc-admin/apps/main-app` (Vue 版本) 迁移而来，使用 React + AntD 技术栈重构。
