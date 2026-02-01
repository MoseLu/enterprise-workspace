<template>
  <div class="btc-config-form">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { provide, reactive } from 'vue';

interface Props {
  model?: Record<string, any>;
  labelWidth?: string;
  size?: 'large' | 'default' | 'small';
}

const props = withDefaults(defineProps<Props>(), {
  model: () => ({}),
  labelWidth: '80px',
  size: 'small'
});

// 提供配置给子组件
provide('btcConfigForm', reactive({
  labelWidth: props.labelWidth,
  size: props.size
}));

defineOptions({
  name: 'BtcConfigForm'
});
</script>

<style scoped>
.btc-config-form {
  width: 100%;
}
</style>

