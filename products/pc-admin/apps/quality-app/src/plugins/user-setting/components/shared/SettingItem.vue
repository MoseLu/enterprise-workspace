<template>
  <div class="setting-item" :class="{ 'mobile-hide': config.mobileHide }">
    <span class="label">{{ config.label }}</span>

    <!-- 开关类型 -->
    <el-switch v-if="config.type === 'switch'" :model-value="modelValue" @change="handleChange" />

    <!-- 数字输入类型 -->
    <el-input-number
      v-else-if="config.type === 'input-number'"
      :model-value="modelValue"
      :min="config.min"
      :max="config.max"
      :step="config.step"
      :style="config.style"
      :controls-position="config.controlsPosition"
      @change="handleChange"
    />

    <!-- 选择器类型 -->
    <el-select
      v-else-if="config.type === 'select'"
      :model-value="modelValue"
      :style="config.style"
      :placeholder="''"
      @change="handleChange"
    >
      <el-option
        v-for="option in normalizedOptions"
        :key="option.value"
        :label="option.label"
        :value="option.value"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ComputedRef } from 'vue';
;


export interface SettingItemConfig {
  key: string;
  label: string;
  type: 'switch' | 'input-number' | 'select';
  handler: string;
  mobileHide?: boolean;
  min?: number;
  max?: number;
  step?: number;
  style?: Record<string, string>;
  controlsPosition?: '' | 'right';
  options?:
    | Array<{ value: any; label: string }>
    | ComputedRef<Array<{ value: any; label: string }>>;
}

interface Props {
  config: SettingItemConfig;
  modelValue: any;
}

interface Emits {
  (e: 'change', value: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 标准化选项，处理computed和普通数组
const normalizedOptions = computed(() => {
  if (!props.config.options) return [];

  try {
    let options: Array<{ value: any; label: string }> = [];
    
    // 如果是 ComputedRef，则返回其值
    if (typeof props.config.options === 'object' && 'value' in props.config.options) {
      options = props.config.options.value || [];
    } else if (Array.isArray(props.config.options)) {
      // 如果是普通数组，直接返回
      options = props.config.options;
    }
    
    // 确保所有选项的 value 和 label 都存在
    return options.filter(opt => opt != null && 'value' in opt && 'label' in opt);
  } catch (error) {
    console.warn('Error processing options for config:', props.config.key, error);
    return [];
  }
});

const handleChange = (value: any) => {
  emit('change', value);
};
</script>

<style lang="scss" scoped>
.setting-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 25px;
  background: transparent !important;

  .label {
    font-size: 14px;
    color: var(--el-text-color-regular);
    background: transparent !important;
  }
}

@media screen and (width <= 768px) {
  .mobile-hide {
    display: none !important;
  }
}
</style>

