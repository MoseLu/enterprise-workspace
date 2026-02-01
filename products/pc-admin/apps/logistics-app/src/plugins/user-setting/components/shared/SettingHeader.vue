<template>
  <div class="setting-header">
    <div class="close-wrap">
      <el-icon @click="$emit('close')" class="close-icon">
        <Close />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue';

defineEmits<{
  close: []
}>();
</script>

<style lang="scss" scoped>
.setting-header {
  .close-wrap {
    display: flex;
    justify-content: flex-end;
    padding: 8px;

    .close-icon {
      display: block;
      padding: 8px;
      font-size: 18px;
      font-weight: bold;
      color: var(--el-text-color-regular);
      cursor: pointer;
      border-radius: 5px;
      transition: all 0.2s;

      &:hover {
        color: var(--el-text-color-primary);
        background-color: var(--el-fill-color-light);
      }
    }
  }
}
</style>

