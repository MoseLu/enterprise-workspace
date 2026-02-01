<template>
  <div class="btc-search">
    <el-input
      :model-value="modelValue"
      :placeholder="placeholder"
      :clearable="clearable"
      :disabled="disabled"
      :size="size"
      v-bind="$attrs"
      @update:model-value="handleUpdate"
      @keyup.enter="handleSearch"
      @clear="handleClear"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <template #prefix>
        <btc-svg name="search" :size="16" />
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import type { BtcSearchProps, BtcSearchEmits } from './types';

defineOptions({
  name: 'BtcSearch',
  inheritAttrs: false
});

const props = withDefaults(defineProps<BtcSearchProps>(), {
  modelValue: '',
  placeholder: '请输入搜索内容',
  clearable: true,
  disabled: false,
  size: 'default'
});

const emit = defineEmits<BtcSearchEmits>();

const handleUpdate = (value: string) => {
  emit('update:modelValue', value);
};

const handleSearch = () => {
  emit('search', props.modelValue || '');
};

const handleClear = () => {
  emit('clear');
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};
</script>

<style lang="scss" scoped>
.btc-search {
  :deep(.el-input__wrapper) {
    background-color: var(--el-fill-color-light);
    box-shadow: none;
    height: 27px;
    padding: 0 12px;
    border-radius: 6px;

    .el-input__inner {
      font-size: 13px;
    }
  }

  :deep(.el-input__prefix) {
    display: flex;
    align-items: center;
  }
}
</style>
