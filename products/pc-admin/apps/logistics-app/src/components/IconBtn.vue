<template>
  <div class="btc-icon-btn" @click="$emit('click', $event)">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'IconBtn',
});

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style lang="scss" scoped>
.btc-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  width: 26px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-fill-color-dark);
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;

  :deep(.btc-svg) {
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  &:hover {
    border-color: var(--el-color-primary);
    background-color: transparent;
  }
}
</style>

