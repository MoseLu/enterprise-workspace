# BtcAvatar 头像组件

带摇滚律动效果的头像组件，支持炫彩渐变边框、律动频谱条、头像抖动和点击爆发效果。

## 特性

- 🎨 炫彩渐变边框（支持亮色/暗色模式）
- 🎸 摇滚风格律动效果（频谱条、抖动、爆发）
- 📷 头像预览（点击头像可预览大图）
- ✏️ 可选的编辑功能（上传头像）
- 🎯 完全可配置（大小、样式、行为）

## 使用示例

### 基础用法

```vue
<template>
  <BtcAvatar :src="avatarUrl" :size="78" />
</template>

<script setup>
import { BtcAvatar } from '@btc/shared-components';

const avatarUrl = ref('https://example.com/avatar.jpg');
</script>
```

### 可编辑头像

```vue
<template>
  <BtcAvatar
    :src="avatarUrl"
    :size="78"
    :editable="true"
    :upload-service="service"
    :on-upload="handleAvatarUpload"
  />
</template>

<script setup>
import { BtcAvatar } from '@btc/shared-components';
import { service } from '@services/eps';

const avatarUrl = ref('https://example.com/avatar.jpg');

const handleAvatarUpload = async (url: string) => {
  avatarUrl.value = url;
  // 更新用户信息
  await updateUserInfo({ avatar: url });
};
</script>
```

### 自定义大小

```vue
<template>
  <!-- 数字大小 -->
  <BtcAvatar :src="avatarUrl" :size="120" />
  
  <!-- 字符串大小 -->
  <BtcAvatar :src="avatarUrl" size="100px" />
</template>
```

### 禁用摇滚风格（仅显示炫彩边框）

```vue
<template>
  <BtcAvatar
    :src="avatarUrl"
    :size="78"
    :rock-style="false"
  />
</template>
```

禁用摇滚风格后，将只显示炫彩渐变边框，不会有律动效果、抖动动画和高对比度滤镜。

### 自定义点击行为

```vue
<template>
  <BtcAvatar
    :src="avatarUrl"
    :size="78"
    :on-click="handleAvatarClick"
  />
</template>

<script setup>
const handleAvatarClick = () => {
  console.log('头像被点击');
  // 自定义逻辑
};
</script>
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | `'/logo.png'` | 头像 URL |
| `size` | `number \| string` | `78` | 头像大小（数字为 px，字符串为 CSS 值） |
| `editable` | `boolean` | `false` | 是否可编辑（显示编辑图标） |
| `uploadService` | `any` | `undefined` | 上传服务（EPS service 对象） |
| `onUpload` | `(url: string) => void \| Promise<void>` | `undefined` | 上传成功回调 |
| `onClick` | `() => void` | `undefined` | 点击头像回调（默认触发爆发效果） |
| `rockStyle` | `boolean` | `true` | 是否启用摇滚风格（包括律动效果、抖动动画、高对比度滤镜） |
| `previewable` | `boolean` | `true` | 是否可预览（点击头像可预览大图） |

## 事件

无（使用 props 回调代替）

## 样式

组件使用 SCSS 模块化样式，包含：

- `.btc-avatar` - 容器
- `.btc-avatar__box` - 边框容器（渐变背景）
- `.btc-avatar__img` - 头像图片
- `.btc-avatar__error` - 错误占位符
- `.btc-avatar__edit-icon` - 编辑图标
- `.rhythm-bar` - 律动频谱条（动态生成）

## 摇滚风格说明

当 `rockStyle` 为 `true`（默认）时，组件包含完整的摇滚风格效果：

1. **频谱条**：20 条围绕头像的频谱条，随机高度变化
2. **抖动效果**：头像轻微旋转抖动
3. **爆发效果**：点击头像时所有频谱条同时爆发
4. **高对比度滤镜**：增强视觉效果
5. **颜色渐变**：基于 HSL 的炫彩渐变，支持亮色/暗色模式

当 `rockStyle` 为 `false` 时，组件仅显示炫彩渐变边框，不包含上述动态效果。

## 注意事项

1. 上传服务需要提供 `service.upload.file.avatar.avatar` 方法
2. 上传文件大小限制为 5MB
3. 仅支持图片文件（`image/*`）
4. 律动效果使用 `requestAnimationFrame`，性能优化良好

