<template>
  <div class="btc-config-form-item" :class="{ 'is-required': required, 'is-error': error }">
    <!-- Label部分 -->
    <div v-if="label" class="btc-config-form-item__label" :style="labelStyle">
      <!-- 使用 span 标签避免 for 属性问题 -->
      <span class="label-text">
        <span v-if="required" class="is-required-asterisk">*</span>
        {{ label }}
      </span>
    </div>

    <!-- 内容部分 -->
    <div class="btc-config-form-item__content">
      <slot></slot>
      <div v-if="error" class="btc-config-form-item__error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

interface Props {
  label?: string;
  prop?: string;
  labelWidth?: string;
  required?: boolean;
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  prop: '',
  labelWidth: '',
  required: false,
  error: ''
});

// 注入父组件的配置
interface ConfigFormContext {
  labelWidth: string;
  size: string;
}

const configContext = inject<ConfigFormContext>('btcConfigForm', {
  labelWidth: '80px',
  size: 'small'
});

// 计算 label 样式
const labelStyle = computed(() => {
  const width = props.labelWidth || configContext.labelWidth;
  return {
    width,
    minWidth: width
  };
});

defineOptions({
  name: 'BtcConfigFormItem'
});
</script>

<style scoped>
.btc-config-form-item {
  display: flex;
  margin-bottom: 18px;
}

.btc-config-form-item__label {
  padding-right: 12px;
  text-align: right;
  box-sizing: border-box;
  color: var(--el-text-color-regular);
  font-size: 14px;
  font-weight: 500;
}

.label-text {
  display: inline-flex;
  align-items: center;
  line-height: 32px;
}

.is-required-asterisk {
  color: var(--el-color-danger);
  margin-right: 4px;
}

.btc-config-form-item__content {
  flex: 1;
  line-height: 32px;
}

.btc-config-form-item__error {
  color: var(--el-color-danger);
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}

/* 紧凑模式 */
.btc-config-form-item.is-compact {
  margin-bottom: 12px;
}

.btc-config-form-item.is-compact .btc-config-form-item__label .label-text {
  line-height: 24px;
}

.btc-config-form-item.is-compact .btc-config-form-item__content {
  line-height: 24px;
}
</style>

