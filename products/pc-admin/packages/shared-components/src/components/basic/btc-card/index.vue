<template>
  <div class="btc-card" :class="cardClass">
    <!-- 澶撮儴鍖哄煙 -->
    <div v-if="showHeader" class="btc-card__header">
      <div class="btc-card__title">
        <slot name="title">
          <span v-if="title">{{ title }}</span>
        </slot>
      </div>
      <div v-if="$slots.extra" class="btc-card__extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- 鍐呭鍖哄煙 -->
    <div class="btc-card__body">
      <slot />
    </div>

    <!-- 搴曢儴鍖哄煙 -->
    <div v-if="$slots.footer" class="btc-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcCard',
});

import { computed, useSlots } from 'vue';

interface Props {
  title?: string;
  shadow?: 'always' | 'hover' | 'never';
  border?: boolean;
  header?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  shadow: 'always',
  border: true,
  header: true,
});

const slots = useSlots();

const showHeader = computed(() => {
  return props.header && (props.title || slots.title || slots.extra);
});

const cardClass = computed(() => {
  return {
    'is-shadow-always': props.shadow === 'always',
    'is-shadow-hover': props.shadow === 'hover',
    'is-shadow-never': props.shadow === 'never',
    'is-border': props.border,
    'is-no-header': !showHeader.value,
  };
});
</script>

<style lang="scss" scoped>
.btc-card {
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-bg-color);
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  // 闃村奖鏍峰紡
  &.is-shadow-always {
    box-shadow: var(--el-box-shadow-light);
  }

  &.is-shadow-hover {
    &:hover {
      box-shadow: var(--el-box-shadow);
    }
  }

  &.is-shadow-never {
    box-shadow: none;
  }

  // 杈规鏍峰紡
  &.is-border {
    border: 1px solid var(--el-border-color-light);
  }

  // 澶撮儴鏍峰紡
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.5;
  }

  &__extra {
    // 不设置 color，让子元素（如状态图标）自己控制颜色
  }

  // 鍐呭鍖哄煙鏍峰紡
  &__body {
    padding: 20px;
  }

  // 搴曢儴鏍峰紡
  &__footer {
    padding: 18px 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    background-color: var(--el-fill-color-blank);
  }

  // 无头部时的内容区域调整
  &.is-no-header {
    .btc-card__body {
      padding-top: 20px;
    }
  }
}
</style>

