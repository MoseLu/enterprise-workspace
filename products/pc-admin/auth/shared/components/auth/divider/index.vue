<template>
  <div class="divider">
    <div class="divider-line"></div>
    <span class="divider-text">其他方式登录</span>
    <div class="divider-line"></div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'AuthDivider'
});
</script>

<style lang="scss" scoped>
.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;

  .divider-line {
    flex: 1;
    height: 1px;
    background-color: var(--el-border-color-lighter);
  }

  .divider-text {
    padding: 0 16px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    white-space: nowrap;
  }
}
</style>