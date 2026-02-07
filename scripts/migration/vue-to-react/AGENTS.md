# Vue → React 迁移 SubAgent

> 用于将 pc-admin 的 Vue3 应用迁移到 react-admin

## 任务描述

将 `products/pc-admin/apps/{appName}` 目录下的 Vue3 应用迁移到 `products/react-admin/apps/{appName}`。

## 迁移规则

### 1. 文件映射

| Vue 文件 | React 文件 |
|----------|-----------|
| `*.vue` | `*.tsx` |
| `App.vue` | `App.tsx` |
| `views/**/*.vue` | `views/**/*.tsx` |
| `components/**/*.vue` | `components/**/*.tsx` |

### 2. 组件转换

**Vue → React 转换规则：**

```vue
<!-- Vue 模板 -->
<template>
  <div class="container">
    <el-button @click="handleClick">按钮</el-button>
  </div>
</template>

<script setup lang="ts">
const handleClick = () => { ... }
</script>
```

↓ 转换为 ↓

```tsx
// React 组件
import { Button } from 'antd';

export function App() {
  const handleClick = () => { ... }

  return (
    <div className="container">
      <Button onClick={handleClick}>按钮</Button>
    </div>
  );
}
```

### 3. 技术栈映射

| Vue 技术栈 | React 技术栈 |
|-----------|-------------|
| Element Plus | Ant Design |
| Vue Router | React Router 6 |
| Pinia | Zustand |
| vue-i18n | react-i18next |
| @vueuse/core | @hooks (自定义) |

### 4. 目录结构

目标目录结构：
```
apps/{appName}/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── router/
│   │   └── index.tsx
│   ├── stores/
│   │   └── index.ts
│   ├── views/
│   │   └── ...
│   └── components/
│       └── ...
```

## 输入格式

SubAgent 接收以下参数：
- `appName`: 应用名称 (如 "admin-app", "home-app")
- `sourcePath`: 源路径 (默认: "products/pc-admin/apps/{appName}")
- `targetPath`: 目标路径 (默认: "products/react-admin/apps/{appName}")

## 执行步骤

1. **分析源应用**
   - 列出所有 Vue 文件
   - 识别组件结构
   - 分析路由配置
   - 分析状态管理

2. **创建 React 应用结构**
   - 创建 package.json
   - 创建 vite.config.ts
   - 创建 tsconfig.json
   - 创建入口文件

3. **迁移组件**
   - 将 Vue 组件转换为 React 组件
   - Element Plus → Ant Design
   - Vue API → React Hooks

4. **迁移路由**
   - Vue Router → React Router 6
   - 动态路由保持一致

5. **迁移状态**
   - Pinia Stores → Zustand Stores
   - Composables → React Hooks

## 输出格式

返回迁移结果：

```json
{
  "appName": "admin-app",
  "sourceFiles": 150,
  "migratedFiles": 120,
  "skippedFiles": 30,
  "errors": [],
  "warnings": ["..."],
  "status": "completed" | "partial" | "failed"
}
```

## 使用方式

### 方式一：命令行直接运行

```bash
# 迁移单个应用
node scripts/migration/vue-to-react/migrate.js <appName>

# 示例
node scripts/migration/vue-to-react/migrate.js home-app
node scripts/migration/vue-to-react/migrate.js admin-app
```

### 方式二：Claude Code SubAgent 调用

在 Claude Code 对话中，可以直接调用此 SubAgent：

```
请将 pc-admin 的 home-app 迁移到 react-admin
```

或者指定参数：

```
请将 admin-app 从 products/pc-admin/apps/admin-app 迁移到 products/react-admin/apps/admin-app
```

## 当前迁移任务

**appName**: `{appName}`

请开始迁移工作。

## 迁移检查清单

- [ ] 分析源应用结构
- [ ] 创建目标目录结构
- [ ] 复制静态资源（assets、public）
- [ ] 迁移所有 Vue 组件
- [ ] 迁移路由配置
- [ ] 迁移状态管理
- [ ] 验证配置文件完整性
- [ ] 生成迁移报告

## 注意事项

1. **复杂逻辑**：某些 Vue 特性（如 provide/inject、复杂的 v-for）可能需要手动调整
2. **样式处理**：SCSS 样式需要转换为 CSS Modules 或 styled-components
3. **API 调用**：axios/fetch 保持不变，但可以封装为自定义 Hook
4. **第三方库**：需要检查并替换不支持 React 的库
5. **性能优化**：考虑使用 React.memo、useMemo、useCallback 进行优化
