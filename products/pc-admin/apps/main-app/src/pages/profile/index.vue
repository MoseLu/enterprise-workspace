<template>
  <div class="page">
    <btc-card v-loading="loading" class="profile-card">
      <template #title>
        <div class="profile-card__header-left">
          <el-tooltip content="摇滚风格">
            <el-switch
              v-model="rockStyleEnabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="handleRockStyleChange"
            />
          </el-tooltip>
        </div>
      </template>
      <template #extra>
        <el-tooltip :content="showFullInfo ? '隐藏完整信息' : '显示完整信息'">
          <el-icon class="profile-card__toggle-icon" @click="handleToggleShowFull">
            <View v-if="showFullInfo" />
            <Hide v-else />
          </el-icon>
        </el-tooltip>
      </template>

      <ProfileCard
        :user-info="userInfo"
        :show-full-info="showFullInfo"
        :rock-style="rockStyleEnabled"
        @edit-field="handleEditField"
        @bind-field="handleBindField"
        @avatar-change="handleAvatarChange"
      />
    </btc-card>

    <!-- 编辑表单 -->
    <BtcForm ref="Form" />

    <!-- 身份验证弹窗 -->
    <BtcIdentityVerifyWrapper
      v-model="verifyVisible"
      :user-info="{
        id: userInfo.id,
        phone: userInfo.phone,
        email: userInfo.email
      }"
      :skip-verification="skipVerification"
      :bind-field="bindField"
      :editing-field="editingField"
      @success="handleVerifySuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { View, Hide } from '@element-plus/icons-vue';
import { appStorage } from '@/utils/app-storage';
import { useProfile } from './composables/useProfile';
import { useProfileForm } from './composables/form';
import ProfileCard from './components/ProfileCard.vue';
import BtcIdentityVerifyWrapper from './components/BtcIdentityVerifyWrapper.vue';
import { BtcMessage } from '@btc/shared-components';
import { logger } from '@btc/shared-core';
;


defineOptions({
  name: 'Profile'
});

// 使用个人信息 composable
const { userInfo, loading, showFullInfo, loadUserInfo, handleToggleShowFull } = useProfile();

// 身份验证弹窗显示状态
const verifyVisible = ref(false);
// 验证成功后的回调函数
let verifySuccessCallback: (() => void) | null = null;

// 使用表单 composable
const { Form, handleEditField: handleEditFieldFromForm, handleEdit, handleEditAvatar } = useProfileForm(
  userInfo,
  showFullInfo,
  loadUserInfo,
  (field: string) => {
    // 打开验证弹窗，传递当前编辑的字段
    editingField.value = field;
    // 确保不是绑定模式
    skipVerification.value = false;
    bindField.value = null;
    verifyVisible.value = true;
  },
  (callback: () => void) => {
    // 保存验证成功后的回调
    verifySuccessCallback = callback;
  }
);

// 包装 handleEditField，处理编辑字段
const handleEditField = (field: string) => {
  // 先重置绑定相关状态，确保是验证模式
  skipVerification.value = false;
  bindField.value = null;
  editingField.value = field; // 设置编辑字段
  
  // 调用 composable 的 handleEditField
  handleEditFieldFromForm(field);
};

// 绑定字段相关状态
const skipVerification = ref(false);
const bindField = ref<string | null>(null);
// 当前正在编辑的字段（用于限制验证方式）
const editingField = ref<string | null>(null);

// 处理绑定字段
const handleBindField = (field: string) => {
  bindField.value = field;
  editingField.value = null; // 绑定模式不需要 editingField
  skipVerification.value = true;
  // 打开验证弹窗（绑定模式）
  verifyVisible.value = true;
};


// 处理验证成功
const handleVerifySuccess = async (isBinding: boolean = false) => {
  // 重新加载用户信息（验证成功后可能绑定了新的手机号或邮箱）
  await loadUserInfo(showFullInfo.value);
  
  // 如果是绑定流程，跳过编辑表单弹窗步骤
  if (isBinding || skipVerification.value) {
    // 绑定流程已完成，不需要打开编辑表单
    verifySuccessCallback = null;
    // 重置绑定状态
    skipVerification.value = false;
    bindField.value = null;
    editingField.value = null;
  } else {
    // 验证流程，执行回调打开编辑表单
    if (verifySuccessCallback) {
      verifySuccessCallback();
      verifySuccessCallback = null;
    }
    // 重置编辑字段状态
    editingField.value = null;
  }
  
  // 关闭验证弹窗（如果还开着）
  verifyVisible.value = false;
};

// 摇滚风格开关（从统一存储读取，默认 false）
const getRockStyleEnabled = (): boolean => {
  const stored = appStorage.settings.getItem('avatarRockStyle');
  return stored === true || stored === false ? stored : false;
};
const rockStyleEnabled = ref<boolean>(getRockStyleEnabled());

// 处理摇滚风格变化
const handleRockStyleChange = (value: boolean) => {
  appStorage.settings.setItem('avatarRockStyle', value);
  // 触发自定义事件，通知其他组件更新
  window.dispatchEvent(new CustomEvent('avatarRockStyleChanged', { detail: value }));
};

// 处理头像变更
const handleAvatarChange = async (avatarUrl: string) => {
  try {
    const { service } = await import('@services/eps');
    const profileService = service.admin?.base?.profile;
    if (!profileService) {
      BtcMessage.warning('用户信息服务不可用');
      return;
    }

    // 调用更新接口
    await profileService.update({
      id: userInfo.value.id,
      avatar: avatarUrl
    });

    // 更新统一存储
    appStorage.user.setAvatar(avatarUrl);

    // 同时更新 useUser 中的信息
    const { useUser } = await import('@/composables/useUser');
    const { getUserInfo, setUserInfo } = useUser();
    const currentUser = getUserInfo();
    if (currentUser) {
      setUserInfo({
        ...currentUser,
        avatar: avatarUrl
      });
    }

    // 触发自定义事件，通知顶栏更新
    window.dispatchEvent(new CustomEvent('userInfoUpdated', {
      detail: {
        avatar: avatarUrl,
        name: userInfo.value.name
      }
    }));

    BtcMessage.success('头像更新成功');
    
    // 重新加载用户信息
    await loadUserInfo(showFullInfo.value);
  } catch (error: any) {
    logger.error('保存头像失败:', error);
    BtcMessage.error(error?.message || '保存头像失败');
  }
};

// 事件监听器清理函数
const handleRockStyleChanged = (event: Event) => {
  const customEvent = event as CustomEvent;
  if (customEvent.detail !== undefined) {
    rockStyleEnabled.value = customEvent.detail;
  }
};

// 组件挂载时加载数据（默认脱敏）
onMounted(() => {
  loadUserInfo(false);
  // 监听摇滚风格变化事件
  window.addEventListener('avatarRockStyleChanged', handleRockStyleChanged);
});

// 组件卸载时清理资源，防止内存泄漏
onBeforeUnmount(() => {
  // 移除事件监听器
  window.removeEventListener('avatarRockStyleChanged', handleRockStyleChanged);
  
  // 清理响应式数据引用，帮助 GC
  userInfo.value = {};
  verifyVisible.value = false;
  verifySuccessCallback = null;
  skipVerification.value = false;
  bindField.value = null;
  editingField.value = null;
});
</script>

<style lang="scss" scoped>
@use './styles/index.scss' as *;

.profile-card {
  :deep(.btc-card__body) {
    padding: 0 !important;
    position: relative;
  }

  // 覆盖 is-no-header 时的 padding-top
  :deep(.btc-card.is-no-header .btc-card__body) {
    padding-top: 0 !important;
  }

  // 移除 header 和内容之间的分隔线
  :deep(.btc-card__header) {
    border-bottom: none !important;
  }

  &__header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  // 眼睛图标样式
  &__toggle-icon {
    font-size: 18px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>

