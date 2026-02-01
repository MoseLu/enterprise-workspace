<template>
  <div class="auth-page">
    <!-- 背景装饰 -->
    <div class="bg">
      <BtcSvg name="bg" />
    </div>

    <!-- 表单卡片内容 -->
    <slot />

    <!-- 底部版权信息 -->
    <slot name="footer" />
  </div>
</template>

<script setup lang="ts">
import { BtcSvg } from '@btc/shared-components';

defineOptions({
  name: 'BtcAuthLayout'
});
</script>

<style lang="scss" scoped>
// 在组件内使用 scoped 样式覆盖 BtcSvg 的默认尺寸和颜色
// 这样可以通过选择器优先级覆盖子组件的 scoped 样式
.bg :deep(.btc-svg) {
  height: 100%;
  width: 100%;
  display: block;
  // 设置 SVG 的颜色，让 currentColor 能够正确工作
  // 注意：由于 SVG sprite 的限制，需要在 symbol 层面设置，这里先设置一个默认值
}
</style>
