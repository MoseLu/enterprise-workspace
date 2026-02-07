# 业务组件迁移指南

> Vue3 + Element Plus → React + Ant Design + Taro

## 迁移策略

### 1. 组件映射表

| Vue3 (Element Plus) | React (Ant Design) | 说明 |
|---------------------|-------------------|------|
| `<el-button>` | `<Button>` | 直接替换 |
| `<el-input>` | `<Input>` | 直接替换 |
| `<el-table>` | `<Table>` | 直接替换 |
| `<el-form>` | `<Form>` | 需调整表单验证 |
| `<el-dialog>` | `<Modal>` | 直接替换 |
| `<el-select>` | `<Select>` | 直接替换 |
| `<el-menu>` | `<Menu>` | 需调整菜单结构 |

### 2. 状态管理映射

| Vue3 | React | 说明 |
|------|-------|------|
| `ref()` | `useState()` | 响应式状态 |
| `reactive()` | `useState()` | 对象状态 |
| `computed()` | `useMemo()` | 计算属性 |
| `watch()` | `useEffect()` | 监听变化 |
| `provide/inject` | `Context` | 依赖注入 |

### 3. 生命周期映射

| Vue3 | React | 说明 |
|------|-------|------|
| `onMounted()` | `useEffect(() => {}, [])` | 挂载后 |
| `onUpdated()` | `useEffect()` | 更新后 |
| `onUnmounted()` | `useEffect(() => return () => {}, [])` | 卸载前 |
| `onBeforeMount()` | `useLayoutEffect()` | 挂载前 |

## 迁移步骤

### 步骤 1: 复制组件

```bash
# 从 Vue 复制到 React
cp products/pc-admin/apps/main-app/src/modules/base/components/layout \
   products/react-admin/apps/main-app/src/components/layout
```

### 步骤 2: 重命名文件

```bash
# .vue → .tsx
mv Header.vue Header.tsx
mv Footer.vue Footer.tsx
```

### 步骤 3: 转换语法

**Vue3 → React 示例:**

```vue
<!-- Vue3 -->
<template>
  <el-button type="primary" @click="handleClick">
    {{ title }}
  </el-button>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>
```

```tsx
// React
import React from 'react';
import { Button } from '@enterprise-workspace/frontend/shared';

interface Props {
  title: string;
}

interface Events {
  (e: 'click'): void;
}

export const Header: React.FC<Props> = ({ title }) => {
  const handleClick = () => {
    // 处理点击
  };

  return (
    <Button type="primary" onClick={handleClick}>
      {title}
    </Button>
  );
};
```

## 目录结构

```
react-admin/apps/{app-name}/src/
├── components/          # 通用组件
│   ├── Button/
│   │   ├── index.tsx
│   │   └── types.ts
│   └── ...
├── pages/              # 页面组件
│   ├── Home/
│   │   ├── index.tsx
│   │   └── components/
│   └── ...
├── hooks/              # 自定义 Hooks
├── stores/             # Zustand 状态
└── utils/              # 工具函数
```

## 核心组件清单

### 布局组件（优先级：高）

- [ ] `Layout` - 主布局
- [ ] `Header` - 顶部栏
- [ ] `Sidebar` - 侧边栏
- [ ] `Footer` - 底部
- [ ] `Breadcrumb` - 面包屑
- [ ] `Topbar` - 顶部工具栏

### 导航组件（优先级：高）

- [ ] `Menu` - 菜单
- [ ] `Tabs` - 标签页
- [ ] `ProcessBar` - 进度条
- [ ] `GlobalSearch` - 全局搜索

### 表单组件（优先级：中）

- [ ] `Form` - 表单
- [ ] `Input` - 输入框
- [ ] `Select` - 选择器
- [ ] `DatePicker` - 日期选择
- [ ] `Upload` - 上传

### 数据展示组件（优先级：中）

- [ ] `Table` - 表格
- [ ] `Card` - 卡片
- [ ] `Modal` - 对话框
- [ ] `Tree` - 树形控件

## 复用 @enterprise-workspace/frontend

优先使用设计系统中的组件：

```tsx
// ❌ 不推荐：直接使用 antd
import { Button } from 'antd';

// ✅ 推荐：使用 @enterprise-workspace/frontend/shared
import { Button } from '@enterprise-workspace/frontend/shared';
```

### 设计系统提供的组件

| 类别 | 组件 |
|------|------|
| 布局 | `AppLayout`, `EnterpriseLayout`, `Flex`, `Grid` |
| 导航 | `BreadcrumbBar`, `Menu`, `Tabs`, `TopMenu` |
| 数据展示 | `Table`, `Card`, `Modal`, `Tree` |
| 表单 | `Form`, `Input`, `Select`, `Datepicker` |
| 反馈 | `Message`, `Notification`, `Popconfirm` |
| 业务 | `Crud`, `SearchBar` |

## 样式迁移

### CSS Modules

```scss
// Header.module.scss
.header {
  display: flex;
  align-items: center;
  background: #fff;
}

.title {
  font-size: 16px;
}
```

```tsx
import styles from './Header.module.scss';

// ...
<div className={styles.header}>
  <span className={styles.title}>{title}</span>
</div>
```

### Tailwind CSS

```tsx
<div className="flex items-center bg-white">
  <span className="text-base">{title}</span>
</div>
```

## 进度跟踪

| 应用 | 组件数 | 已迁移 | 进度 |
|------|--------|--------|------|
| main-app | 50+ | 0 | 0% |
| admin-app | 30+ | 0 | 0% |
| home-app | 10+ | 0 | 0% |
| 其他应用 | 20+ | 0 | 0% |

## 相关资源

- [@enterprise-workspace/frontend/shared](../common/frontend/shared/README.md)
- [Ant Design 5.x 文档](https://ant.design/components/overview)
- [React 官方文档](https://react.dev)
