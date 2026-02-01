<template>
  <div class="permission-list">
    <transition-group name="list">
      <div
        v-for="(perm, index) in composedPermissions"
        :key="perm.key"
        class="permission-item"
      >
        <div class="permission-item__index">{{ index + 1 }}</div>
        <div class="permission-item__content">
          <div class="permission-item__name">{{ perm.permissionName }}</div>
          <div class="permission-item__code">{{ perm.permissionCode }}</div>
        </div>
        <div class="icon" @click="$emit('removePermission', index)">
          <el-icon><Close /></el-icon>
        </div>
      </div>
    </transition-group>

    <el-empty v-if="composedPermissions.length === 0" description="暂无权限" :image-size="80">
      <template #image>
        <el-icon :size="60" color="var(--el-text-color-placeholder)">
          <Document />
        </el-icon>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { Document, Close } from '@element-plus/icons-vue';

interface Props {
  composedPermissions: any[];
}

defineProps<Props>();

defineEmits<{
  removePermission: [index: number];
}>();

defineOptions({
  name: 'BtcPermissionList'
});
</script>

<style lang="scss" scoped>
.permission-list {
  padding: 10px;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    background-color: var(--el-fill-color-light);
    transform: translateX(2px);

    .icon {
      color: var(--el-color-danger);
    }
  }

  &__index {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--el-color-primary-light-8);
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 12px;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;

    .permission-item__name {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 4px;
    }

    .permission-item__code {
      font-size: 11px;
      color: var(--el-text-color-secondary);
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    height: 24px;
    width: 24px;
    font-size: 14px;
    border-radius: 4px;
    color: var(--el-text-color-regular);
    flex-shrink: 0;

    &:hover {
      background-color: var(--el-fill-color);
      color: var(--el-color-danger);
    }
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.list-move {
  transition: transform 0.3s;
}
</style>

