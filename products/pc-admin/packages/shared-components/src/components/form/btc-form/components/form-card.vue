<template>
  <div class="btc-form-card">
    <div class="btc-form-card__header" @click="toggle">
      <span class="btc-form-card__label">{{ label }}</span>
      <el-icon class="btc-form-card__icon" :class="{ 'is-expand': isExpand }">
        <ArrowDown />
      </el-icon>
    </div>
    <div v-show="isExpand" class="btc-form-card__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcFormCard'
});

import { ref } from 'vue';
import { ArrowDown } from '@element-plus/icons-vue';

interface Props {
  label?: string;
  expand?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  expand: true
});

const isExpand = ref(props.expand);

function toggle() {
  isExpand.value = !isExpand.value;
}
</script>

<style lang="scss" scoped>
.btc-form-card {
  margin-bottom: 20px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background-color: var(--el-fill-color-light);
    border-radius: var(--el-border-radius-base);
    cursor: pointer;
    user-select: none;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--el-fill-color);
    }
  }

  &__label {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__icon {
    transition: transform 0.3s ease;

    &.is-expand {
      transform: rotate(180deg);
    }
  }

  &__content {
    padding: 16px 0;
  }
}
</style>


