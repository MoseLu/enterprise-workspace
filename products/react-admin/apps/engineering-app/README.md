# engineering-app

企业工程管理应用

## 技术栈

- Vue 3
- TypeScript
- Vite 5
- Pinia
- Vue Router 4
- Element Plus
- Qiankun (微前端)

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 预览
pnpm preview
```

## 目录结构

```
engineering-app/
├── src/
│   ├── assets/         # 静态资源
│   ├── bootstrap/      # 启动配置
│   ├── components/      # 公共组件
│   ├── composables/     # 组合式函数
│   ├── config/         # 配置
│   ├── i18n/           # 国际化
│   ├── locales/        # 语言文件
│   ├── modules/        # 功能模块
│   ├── plugins/        # 插件
│   ├── router/         # 路由
│   ├── services/       # 服务
│   ├── store/          # 状态管理
│   ├── styles/         # 样式
│   ├── types/          # 类型定义
│   └── utils/          # 工具函数
├── public/             # 公共资源
└── scripts/            # 构建脚本
```

## 微前端

本应用作为 Qiankun 微前端子应用运行，支持独立运行和嵌入主应用两种模式。

### 独立运行

访问 `http://localhost:3001` 即可独立运行。

### 嵌入主应用

通过 Qiankun 微前端框架嵌入主应用，自动适配。
