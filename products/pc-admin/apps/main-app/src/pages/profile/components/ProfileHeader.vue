<template>
  <div class="profile-header">
    <div class="avatar-section">
      <el-avatar :size="80" :src="userInfo.avatar || appConfig.logo" class="user-avatar">
        <el-icon><User /></el-icon>
      </el-avatar>
    </div>
    <h2 class="profile-title">{{ userInfo.name || t(appConfig.company.sloganKey) }}</h2>
    <div class="profile-actions">
      <el-tooltip content="编辑个人信息">
        <el-icon class="action-icon" @click="$emit('edit')">
          <Edit />
        </el-icon>
      </el-tooltip>
      <el-tooltip :content="showFullInfo ? '点击隐藏完整信息' : '点击显示完整信息'">
        <el-icon class="toggle-icon" @click="$emit('toggle-show-full')">
          <View v-if="showFullInfo" />
          <Hide v-else />
        </el-icon>
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, View, Hide, Edit } from '@element-plus/icons-vue';
import { useI18n } from '@btc/shared-core';
import { appConfig } from '@/config/app';

defineOptions({
  name: 'ProfileHeader'
});

defineProps<{
  userInfo: any;
  showFullInfo: boolean;
}>();

defineEmits<{
  edit: [];
  'toggle-show-full': [];
}>();

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
  width: 100%;
  text-align: center;

  .avatar-section {
    .user-avatar {
      border: 3px solid var(--el-border-color-light);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }

  .profile-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-align: center;
    line-height: 1.4;
  }

  .profile-actions {
    margin-top: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;

    .action-icon,
    .toggle-icon {
      font-size: 20px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .profile-header {
    gap: 12px;
    padding: 15px 0;

    .avatar-section {
      .user-avatar {
        width: 60px !important;
        height: 60px !important;
      }
    }

    .profile-title {
      font-size: 18px;
    }
  }
}

@media (max-width: 480px) {
  .profile-header {
    gap: 10px;
    padding: 10px 0;

    .avatar-section {
      .user-avatar {
        width: 50px !important;
        height: 50px !important;
      }
    }

    .profile-title {
      font-size: 16px;
    }
  }
}
</style>

