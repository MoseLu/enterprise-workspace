<template>
  <el-button
    ref="buttonRef"
    v-bind="allButtonProps"
    :class="buttonClass"
    :style="buttonStyle"
  >
    <!-- 默认插槽内容 -->
    <slot />
    
    <!-- 其他插槽透传 -->
    <template #loading>
      <slot name="loading" />
    </template>
    <template #icon>
      <slot name="icon" />
    </template>
  </el-button>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { ElButton } from 'element-plus';
import type { ComponentPublicInstance } from 'vue';

defineOptions({
  name: 'BtcButton',
});

// 使用 $attrs 来接收所有 el-button 的属性
const attrs = useAttrs();

// Element Plus 按钮类型定义
type ButtonType = '' | 'default' | 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'text';

// 判断是否为无效的 type（如 "flower"）
const isValidType = (type: any): type is ButtonType => {
  if (!type) return true; // 空字符串或 undefined 是有效的
  const validTypes: readonly ButtonType[] = ['', 'default', 'primary', 'success', 'warning', 'info', 'danger', 'text'];
  return validTypes.includes(type);
};

// 构建传递给 el-button 的所有 props（过滤掉无效的 type 和 color）
const allButtonProps = computed(() => {
  const result: Record<string, any> = {};
  
  Object.keys(attrs).forEach(key => {
    const value = attrs[key as keyof typeof attrs];
    
    // 过滤掉无效的 type（如 "flower"）
    if (key === 'type' && !isValidType(value)) {
      return; // 跳过无效的 type
    }
    
    // 过滤掉 "flower" 字符串作为 color
    if (key === 'color' && value === 'flower') {
      return; // 跳过 "flower" color
    }
    
    result[key] = value;
  });
  
  return result;
});

// 按钮样式
const buttonStyle = computed(() => {
  return undefined;
});

// 按钮类名
const buttonClass = computed(() => {
  return '';
});

const buttonRef = ref<ComponentPublicInstance>();

// 暴露 el-button 的引用和方法
defineExpose({
  ref: buttonRef,
});
</script>

<style lang="scss" scoped>
// btc-button 样式
// 注意：不设置任何尺寸相关的样式（width、height、padding、min-width、min-height等），
// 完全使用 Element Plus 的标准尺寸（small、default、large）
</style>
