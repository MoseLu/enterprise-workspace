# Taro 多端输出配置

> react-admin 支持 H5 和小程序多端输出

## 概述

react-admin 基于 `@enterprise-workspace/frontend` 设计系统构建，支持以下输出：

| 平台 | 技术栈 | 构建命令 | 输出目录 |
|------|--------|----------|----------|
| H5 | Vite + React | `pnpm build:h5` | `dist-h5/` |
| 小程序 | Taro + React | `pnpm exec taro build --type weapp` | `dist-weapp/` |

## 快速开始

### H5 输出

```bash
# 开发模式
pnpm dev:h5

# 构建生产版本
pnpm build:h5

# 预览
pnpm preview
```

### 微信小程序输出

> 需要安装 Taro CLI: `pnpm add -g @tarojs/cli`

```bash
# 开发模式（watch）
pnpm exec taro build --type weapp --watch

# 构建生产版本
pnpm exec taro build --type weapp
```

## 配置说明

### H5 配置 (vite.config.h5.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps'),
      '@enterprise-workspace/frontend': path.resolve(__dirname, '../common/frontend'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist-h5',
    sourcemap: true,
  },
});
```

### Taro 配置 (taro.config.ts)

```typescript
import type { UserConfig } from '@tarojs/taro';

const config: UserConfig = {
  projectName: 'react-admin',
  designWidth: 750,
  sourceRoot: 'src',
  outputRoot: 'dist-weapp',
  framework: 'react',
  compiler: {
    type: 'webpack5',
  },
  h5: {
    devServer: {
      port: 3000,
    },
  },
  mini: {
    compileType: 'bundle',
  },
};

export default config;
```

## 小程序适配

### 平台检测

```typescript
import { usePlatform } from '@enterprise-workspace/frontend-taro';

function App() {
  const { isH5, isWeapp } = usePlatform();

  if (isWeapp) {
    // 小程序特有逻辑
    return <WeappView />;
  }

  return <H5View />;
}
```

### 条件渲染

```typescript
// Taro 平台判断
if (process.env.TARO_ENV === 'weapp') {
  // 小程序代码
} else {
  // H5 代码
}
```

## 组件适配

### 推荐做法

使用 `@enterprise-workspace/frontend-taro` 提供的跨平台组件：

```typescript
import { Button, Input, Modal } from '@enterprise-workspace/frontend-taro';
```

这些组件会自动根据平台渲染不同的原生组件。

### 平台特定组件

```
src/
├── components/
│   ├── Button/
│   │   ├── index.tsx      # 通用实现
│   │   ├── h5.tsx          # H5 特定实现
│   │   └── weapp.tsx       # 小程序特定实现
│   └── ...
```

## 样式适配

### CSS 变量

```css
/* index.css */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --font-size-base: 14px;
}

/* 小程序特定样式 */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #1890ff;
  }
}
```

### Taro 响应式

```scss
/* 使用 Taro 的响应式工具类 */

/* H5 */
@media screen and (min-width: 768px) {
  .container {
    display: flex;
  }
}

/* 小程序 */
view.container {
  /* 小程序样式 */
}
```

## 构建验证

### H5 验证

```bash
# 安装依赖
pnpm install

# 构建 H5
pnpm build:h5

# 验证输出
ls -la dist-h5/
# 应包含: index.html, assets/, static/
```

### 小程序验证

```bash
# 构建小程序
pnpm exec taro build --type weapp

# 验证输出
ls -la dist-weapp/
# 应包含: project.config.json, app.js, pages/

# 使用微信开发者工具打开
cd dist-weapp && wechat-devtools
```

## 常见问题

### Q: 小程序构建失败？

A: 确保已安装 Taro CLI 并配置正确的 Node 版本（>= 18）

```bash
# 检查 Taro 版本
taro -v

# 如未安装
pnpm add -g @tarojs/cli
```

### Q: H5 和小程序样式不一致？

A: 使用 `@enterprise-workspace/frontend-taro` 组件，它们会自动处理平台差异。

### Q: 如何调试小程序？

A: 使用 Taro CLI 的开发模式：

```bash
pnpm exec taro build --type weapp --watch
```

## 相关文档

- [@enterprise-workspace/frontend-taro](../common/frontend/taro/README.md)
- [Taro 官方文档](https://taro-docs.jd.com/)
- [小程序适配指南](https://taro-docs.jd.com/docs/react-native-born)
