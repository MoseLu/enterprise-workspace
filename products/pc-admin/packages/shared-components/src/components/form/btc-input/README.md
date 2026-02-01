# BtcInput 输入框组件

## 概述

`BtcInput` 是一个通用的输入框组件，基于左侧菜单搜索框的样式规范封装，完全透传 `el-input` 的所有功能，并提供了防抖、格式化、输入限制、校验提示等扩展功能。

## 特性

- 🎨 **样式统一**：复用左侧菜单搜索框的视觉样式规范
- 📏 **尺寸选项**：支持多种尺寸（default、small、middle、large、auto、tiny）
- 🔄 **完整透传**：支持 el-input 的所有属性、事件、插槽、方法
- ⏱️ **防抖功能**：支持输入防抖，用于实时搜索等场景
- 📝 **输入格式化**：支持内置格式（手机号、身份证、金额等）和自定义格式化函数
- 🚫 **输入限制**：支持输入类型限制（数字、字母、禁止emoji等）和正则过滤
- ✅ **自定义校验提示**：支持校验状态显示和自定义提示插槽

## Props

### 基础 Props

组件完全透传 `el-input` 的所有原生属性，包括：

- `modelValue`: 双向绑定值
- `placeholder`: 占位符文本
- `disabled`: 是否禁用
- `readonly`: 是否只读
- `clearable`: 是否可清空
- `maxlength`: 最大输入长度
- `type`: 输入框类型
- 其他 el-input 原生属性

### 扩展 Props

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
|------|------|------|--------|--------|
| size | 输入框尺寸 | `string` | `'default' \| 'small' \| 'middle' \| 'large' \| 'auto' \| 'tiny'` | `'default'` |
| debounce | 防抖时间（毫秒） | `number` | — | `0` |
| format | 格式化类型 | `string` | `'phone' \| 'idCard' \| 'amount' \| 'custom'` | `undefined` |
| customFormat | 自定义格式化函数 | `function` | `(value: string) => string` | — |
| formatTrigger | 格式化触发时机 | `string` | `'input' \| 'blur'` | `'blur'` |
| inputType | 输入类型限制 | `string` | `'number' \| 'letter' \| 'alphanumeric' \| 'noEmoji' \| 'custom'` | `undefined` |
| customInputPattern | 自定义输入正则表达式 | `RegExp` | — | — |
| validateStatus | 校验状态 | `string` | `'success' \| 'error' \| 'warning' \| ''` | `''` |
| errorMessage | 错误提示文案 | `string` | — | — |
| successMessage | 成功提示文案 | `string` | — | — |
| warningMessage | 警告提示文案 | `string` | — | — |

### 尺寸说明

- `default`: 默认尺寸（27px 高度，复用左侧菜单搜索框样式）
- `small`: 小尺寸（使用 Element Plus 原生 small 尺寸）
- `middle`: 中等尺寸（映射为 Element Plus 的 default 尺寸）
- `large`: 大尺寸（使用 Element Plus 原生 large 尺寸）
- `auto`: 自适应（width: 100%，容器和输入框都设置为 100%）
- `tiny`: 图标模式（只显示图标按钮，不显示输入框，参考 btc-search-key 的实现）

**注意**：`size='tiny'` 模式下，不支持输入、格式化、校验等功能（因为不显示输入框）。

## Events

### 原生事件

组件完全透传 `el-input` 的所有原生事件：

- `update:modelValue`: 输入值变化时触发
- `input`: 输入事件
- `change`: 值改变事件
- `blur`: 失焦事件
- `focus`: 聚焦事件
- `clear`: 清空事件
- 其他原生事件

### 扩展事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| formatted | 格式化后触发 | `(value: string)` |
| icon-click | tiny 模式下图标按钮点击事件 | `()` |

## 插槽

### 原生插槽

组件完全透传 `el-input` 的所有原生插槽：

- `prefix`: 前缀插槽
- `suffix`: 后缀插槽
- `prepend`: 前置内容插槽
- `append`: 后置内容插槽

### 扩展插槽

| 插槽名 | 说明 |
|--------|------|
| icon | tiny 模式下图标插槽（默认使用 search 图标） |
| errorTip | 自定义错误提示插槽（替代默认错误提示） |
| successTip | 自定义成功提示插槽（替代默认成功提示） |
| warningTip | 自定义警告提示插槽（替代默认警告提示） |

## 方法

通过 `ref` 可以访问组件实例的方法：

| 方法名 | 说明 | 参数 |
|--------|------|------|
| focus | 聚焦 | — |
| blur | 失焦 | — |
| select | 选中文本 | — |
| reset | 重置输入框值 | — |

## 使用示例

### 基础用法

```vue
<template>
  <btc-input v-model="inputValue" placeholder="请输入内容" />
</template>

<script setup>
import { ref } from 'vue';
import { BtcInput } from '@btc/shared-components';

const inputValue = ref('');
</script>
```

### 尺寸选项

```vue
<template>
  <!-- 默认尺寸 -->
  <btc-input v-model="value1" size="default" />
  
  <!-- 小尺寸 -->
  <btc-input v-model="value2" size="small" />
  
  <!-- 中等尺寸 -->
  <btc-input v-model="value3" size="middle" />
  
  <!-- 大尺寸 -->
  <btc-input v-model="value4" size="large" />
  
  <!-- 自适应宽度 -->
  <btc-input v-model="value5" size="auto" />
  
  <!-- 图标模式 -->
  <btc-input 
    v-model="value6" 
    size="tiny" 
    placeholder="搜索"
    @icon-click="handleIconClick"
  />
</template>
```

### 防抖功能

```vue
<template>
  <btc-input 
    v-model="searchValue" 
    :debounce="300"
    placeholder="输入搜索关键词（300ms 防抖）"
  />
</template>

<script setup>
import { ref } from 'vue';

const searchValue = ref('');
</script>
```

### 输入格式化

```vue
<template>
  <!-- 手机号格式化 -->
  <btc-input 
    v-model="phone" 
    format="phone"
    format-trigger="blur"
    placeholder="请输入手机号"
  />
  
  <!-- 金额千分位格式化 -->
  <btc-input 
    v-model="amount" 
    format="amount"
    format-trigger="input"
    placeholder="请输入金额"
  />
  
  <!-- 自定义格式化 -->
  <btc-input 
    v-model="custom" 
    format="custom"
    :custom-format="customFormatter"
    placeholder="自定义格式化"
  />
</template>

<script setup>
import { ref } from 'vue';

const phone = ref('');
const amount = ref('');
const custom = ref('');

const customFormatter = (value: string) => {
  // 自定义格式化逻辑
  return value.toUpperCase();
};
</script>
```

### 输入限制

```vue
<template>
  <!-- 只允许数字 -->
  <btc-input 
    v-model="number" 
    input-type="number"
    placeholder="只能输入数字"
  />
  
  <!-- 只允许字母 -->
  <btc-input 
    v-model="letter" 
    input-type="letter"
    placeholder="只能输入字母"
  />
  
  <!-- 禁止 emoji -->
  <btc-input 
    v-model="text" 
    input-type="noEmoji"
    placeholder="禁止输入 emoji"
  />
  
  <!-- 自定义正则限制 -->
  <btc-input 
    v-model="custom" 
    input-type="custom"
    :custom-input-pattern="/^[A-Z0-9]*$/"
    placeholder="只能输入大写字母和数字"
  />
</template>

<script setup>
import { ref } from 'vue';

const number = ref('');
const letter = ref('');
const text = ref('');
const custom = ref('');
</script>
```

### 校验提示

```vue
<template>
  <!-- 错误提示 -->
  <btc-input 
    v-model="errorValue" 
    validate-status="error"
    error-message="输入格式不正确"
  />
  
  <!-- 成功提示 -->
  <btc-input 
    v-model="successValue" 
    validate-status="success"
    success-message="输入格式正确"
  />
  
  <!-- 警告提示 -->
  <btc-input 
    v-model="warningValue" 
    validate-status="warning"
    warning-message="请注意输入格式"
  />
  
  <!-- 自定义提示插槽 -->
  <btc-input 
    v-model="customValue" 
    validate-status="error"
  >
    <template #errorTip>
      <span style="color: red;">自定义错误提示</span>
    </template>
  </btc-input>
</template>

<script setup>
import { ref } from 'vue';

const errorValue = ref('');
const successValue = ref('');
const warningValue = ref('');
const customValue = ref('');
</script>
```

### 组合使用

```vue
<template>
  <btc-input 
    v-model="searchValue" 
    size="default"
    :debounce="300"
    input-type="noEmoji"
    placeholder="搜索（防抖 + 禁止 emoji）"
    @input="handleInput"
  />
</template>

<script setup>
import { ref } from 'vue';

const searchValue = ref('');

const handleInput = (value: string) => {
  console.log('输入值:', value);
};
</script>
```

## 与 BtcSearch 的区别

- **BtcSearch**：专门用于搜索场景，默认带 search 图标，有 search 事件，功能简单
- **BtcInput**：通用输入组件，默认无图标，完全透传 el-input 的功能，支持防抖、格式化、输入限制、校验提示等扩展功能，支持多种尺寸选项

## 注意事项

1. **样式优先级**：使用 `:deep()` 穿透 scoped 样式，确保样式能够正确应用
2. **属性透传**：使用 `v-bind="$attrs"` 和 `inheritAttrs: false` 确保属性透传正确
3. **尺寸处理**：
   - `size='auto'` 时，容器和输入框宽度都设置为 100%
   - `size='tiny'` 时，不渲染 el-input，只显示图标按钮
   - `size='middle'` 映射为 Element Plus 的 `default` 尺寸
   - `size='tiny'` 模式下，不支持输入、格式化、校验等功能
4. **防抖处理**：防抖只影响 `update:modelValue` 和 `input` 事件，不影响 `change`、`blur` 等事件
5. **格式化时机**：区分 `input` 和 `blur` 两种格式化时机，满足不同业务场景
6. **输入限制**：输入限制在输入时实时过滤，不影响用户体验
7. **向后兼容**：确保组件可以完全替代 el-input 使用，所有扩展功能都是可选的
