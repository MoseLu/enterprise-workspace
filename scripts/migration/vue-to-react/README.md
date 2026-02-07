# Vue → React 迁移工具

> 用于将 pc-admin 的 Vue3 应用迁移到 react-admin 的自动化工具

## 目录结构

```
scripts/migration/vue-to-react/
├── agent.js      # SubAgent 核心脚本
├── migrate.js     # 简化的命令行入口
├── migrator.js    # 迁移模块（已废弃）
├── AGENTS.md      # SubAgent 配置文档
└── README.md      # 本文档
```

## 使用方式

### 方式一：命令行运行

```bash
# 迁移单个应用
node scripts/migration/vue-to-react/migrate.js <appName>

# 示例
node scripts/migration/vue-to-react/migrate.js home-app
node scripts/migration/vue-to-react/migrate.js admin-app

# 指定完整路径
node scripts/migration/vue-to-react/migrate.js my-app /path/to/source /path/to/target
```

### 方式二：Claude Code SubAgent 调用

在 Claude Code 对话中，直接使用自然语言：

```
请将 home-app 从 pc-admin 迁移到 react-admin
```

## 迁移规则

### 文件映射

| Vue 文件 | React 文件 |
|----------|-----------|
| `*.vue` | `*.tsx` |
| `App.vue` | `App.tsx` |
| `views/**/*.vue` | `views/**/*.tsx` |
| `components/**/*.vue` | `components/**/*.tsx` |

### 技术栈映射

| Vue 技术栈 | React 技术栈 |
|-----------|-------------|
| Element Plus | Ant Design |
| Vue Router | React Router 6 |
| Pinia | Zustand |
| vue-i18n | react-i18next |

### 组件转换示例

```vue
<!-- Vue -->
<template>
  <el-button @click="handleClick">点击</el-button>
</template>

<script setup>
const handleClick = () => { ... }
</script>
```

```tsx
// React
import { Button } from 'antd';

export function Component() {
  const handleClick = () => { ... }

  return (
    <Button onClick={handleClick}>点击</Button>
  );
}
```

### 属性转换

| Vue | React |
|-----|-------|
| `@click` | `onClick` |
| `:model-value` | `value` |
| `v-model` | `value` + `onChange` |
| `class` | `className` |
| `v-if` | `{condition && (` |
| `v-for` | `{list.map(` |

### 生命周期转换

| Vue | React |
|-----|-------|
| `onMounted` | `useEffect` |
| `onUnmounted` | `return cleanup` |
| `watch` | `useEffect` |
| `computed` | `useMemo` |

## 输出示例

迁移完成后，会生成以下目录结构：

```
apps/{appName}/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── router/
    │   └── index.tsx
    └── views/
        └── ...
```

## 迁移后处理

迁移完成后，需要手动执行以下步骤：

1. **安装依赖**

   ```bash
   cd products/react-admin/apps/{appName}
   npm install
   ```

2. **手动调整**

   - 添加缺失的状态管理 (`useState`, `useEffect`)
   - 修复 `className` 语法
   - 替换 Vue 特有 API
   - 调整组件导入路径
   - 处理图片导入路径

3. **运行类型检查**

   ```bash
   npm run type-check
   ```

## 当前支持的应用

| 应用名称 | 状态 |
|----------|------|
| home-app | 待迁移 |
| admin-app | 待迁移 |
| dashboard-app | 待迁移 |
| docs-app | 已存在 |
| engineering-app | 待迁移 |
| finance-app | 待迁移 |
| layout-app | 待迁移 |
| logistics-app | 待迁移 |
| main-app | 待迁移 |
| operations-app | 待迁移 |
| personnel-app | 待迁移 |
| production-app | 待迁移 |
| quality-app | 待迁移 |
| system-app | 待迁移 |

## 注意事项

1. **自动转换的限制**

   自动化迁移无法处理所有 Vue 特性，以下情况需要手动处理：
   - 复杂的 `provide/inject` 用法
   - 自定义 Vue 指令
   - 复杂的 `scoped slot`
   - 动态组件 (`<component :is="...">`)
   - 复杂的 Pinia store 逻辑

2. **样式处理**

   SCSS 样式需要手动转换为 CSS Modules：
   - 将 `.scss` 文件重命名为 `.module.scss`
   - 使用 `import styles from './Component.module.scss'`
   - 通过 `styles.className` 使用

3. **API 调用**

   `axios` 和 `fetch` 调用保持不变，但可以封装为自定义 Hook。

## 开发计划

- [ ] 支持更多 Element Plus 组件
- [ ] 自动处理 SCSS 样式转换
- [ ] Pinia 到 Zustand 的迁移
- [ ] 生成迁移报告
- [ ] 集成测试验证

## 贡献

欢迎改进迁移工具！
