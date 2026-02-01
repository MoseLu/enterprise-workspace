<template>
  <p class="section-title" :style="style">
    {{ title }}
  </p>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  style?: Record<string, any>;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.section-title {
  position: relative;
  margin: 30px 0 20px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  text-align: center;

  &::before,
  &::after {
    position: absolute;
    top: 10px;
    width: 50px;
    margin: auto;
    content: '';
    border-bottom: 1px solid var(--el-border-color-light);
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
}
</style>

