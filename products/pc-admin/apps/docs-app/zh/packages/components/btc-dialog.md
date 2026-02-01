---
title: BtcDialog 组件
type: package
project: components
owner: dev-team
created: '2025-10-12'
updated: '2025-10-13'
publish: true
tags:
- packages
- components
- dialog
sidebar_label: BtcDialog
sidebar_order: 5
sidebar_group: packages
---
# BtcDialog 组件

## 概述

增强版的 `el-dialog` 组件，参考 cool-admin 的 `cl-dialog` 实现，提供更丰富的功能和更好的用户体验

**实现方式**：使用 **TSX + render 函数**，确保 slot 正确传递和渲染

## 特性

- 全屏/最小化控制
- 双击标题栏切换全屏
- 自定义控制按钮
- KeepAlive 缓存支持
- 自定义滚动条
- 背景透明选项
- 关闭前确认钩子

## 基础用法

```vue
<template>
<BtcDialog v-model="visible" title="用户详情" width="600px">
<p>弹窗内容</p>
</BtcDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 是否可见 | boolean | false |
| title | 标题 | string | '-' |
| width | 宽度 | string | '50%' |
| height | 高度 | string | - |
| padding | 内边距 | string | '20px' |
| keepAlive | 是否缓存内容 | boolean | false |
| fullscreen | 是否全屏 | boolean | false |
| controls | 控制按钮 | Array | ['fullscreen', 'close'] |
| hideHeader | 隐藏头部 | boolean | false |
| beforeClose | 关闭前回调 | Function | - |
| scrollbar | 是否使用滚动条 | boolean | true |
| transparent | 背景透明 | boolean | false |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:modelValue | 可见性变化 | boolean |
| fullscreen-change | 全屏状态变化 | boolean |

## Slots

| 插槽名 | 说明 |
|--------|------|
| default | 弹窗内容 |
| footer | 底部区域 |

## Expose

| 方法/属性 | 说明 | 类型 |
|-----------|------|------|
| visible | 可见性 | Ref\<boolean\> |
| isFullscreen | 是否全屏 | ComputedRef\<boolean\> |
| open | 打开弹窗 | () => void |
| close | 关闭弹窗 | () => void |
| toggleFullscreen | 切换全屏 | (val?: boolean) => void |

## 示例

### 带全屏控制

```vue
<template>
<BtcDialog
v-model="visible"
title="CRUD 表格"
width="80%"
:controls="['fullscreen', 'close']"
>
<BtcCrud :service="service">
<BtcTable :columns="columns" />
</BtcCrud>
</BtcDialog>
</template>
```

### 双击标题栏全屏

用户可以双击标题栏快速切换全屏状态（仅当 controls 包含 'fullscreen' 时）

### 关闭前确认

```vue
<template>
<BtcDialog
v-model="visible"
title="编辑用户"
:before-close="handleBeforeClose"
>
<el-form v-model="form">
<!-- 表单内容 -->
</el-form>
</BtcDialog>
</template>

<script setup lang="ts">
import { BtcConfirm } from '@btc/shared-components';

const handleBeforeClose = (done: () => void) => {
BtcConfirm('确定要关闭吗？数据将不会保存')
.then(() => {
done(); // 调用 done 才会真正关闭
})
.catch(() => {
// 取消关闭
});
};
</script>
```

### KeepAlive 缓存

```vue
<BtcDialog v-model="visible" title="表格" :keep-alive="true">
<!-- keepAlive 为 true 时，关闭弹窗不会重新渲染内容 -->
<BtcCrud :service="service">
<!-- ... -->
</BtcCrud>
</BtcDialog>
```

### 自定义控制按钮

```vue
<template>
<BtcDialog
v-model="visible"
title="自定义控制"
:controls="['fullscreen', customButton, 'close']"
>
内容
</BtcDialog>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { Download } from '@element-plus/icons-vue';

const customButton = h(
'button',
{
type: 'button',
class: 'control-btn',
onClick: () => {
console.log('自定义按钮点击');
}
},
h(Download)
);
</script>
```

### 固定高度 + 滚动条

```vue
<BtcDialog
v-model="visible"
title="长内容"
height="500px"
:scrollbar="true"
>
<!-- 内容超过 500px 会出现滚动条 -->
<div style="height: 1000px">很长的内容...</div>
</BtcDialog>
```

### 透明背景

```vue
<BtcDialog v-model="visible" :transparent="true">
<!-- 透明背景弹窗，无阴影 -->
</BtcDialog>
```

## 与 el-dialog 的区别

| 特性 | el-dialog | BtcDialog |
|------|-----------|-----------|
| 全屏控制 | 需要自己实现 | 内置 |
| 双击全屏 | | 支持 |
| 自定义控制按钮 | | 支持 |
| KeepAlive | | 支持 |
| 滚动条控制 | | 内置 el-scrollbar |
| 关闭按钮悬浮效果 | 普通 | 主题色高亮 |

## 样式定制

组件使用 CSS 变量，自动适配 Element Plus 主题：

```scss
.btc-dialog {
// 头部
&__header {
padding: 16px 20px;
border-bottom: 1px solid var(--el-border-color-lighter);
}

// 标题
&__title {
font-size: 16px;
font-weight: 600;
}

// 控制按钮
&__controls {
.control-btn {
&.close:hover {
background-color: var(--el-color-danger);
color: #fff;
}
}
}
}
```

## 注意事项

1. **自动导入**：组件已通过 `unplugin-vue-components` 自动导入，无需手动 import
2. **类型支持**：完整的 TypeScript 类型定义
3. **性能**：建议在大型表格或复杂内容中设置 `keepAlive: true`
4. **移动端**：在小屏幕设备上，fullscreen 按钮自动隐藏

##相关组件

- [BtcCrud](../../crud/README.md) - CRUD 上下文容器
- [BtcUpsert](../../crud/upsert/index.vue) - 表单弹窗（基于 el-dialog）

