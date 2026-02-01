<template>
  <el-dropdown
    class="user-info"
    placement="bottom-end"
    :popper-class="popperClass"
    @command="handleCommand"
  >
    <div class="user-info__trigger">
      <span
        class="user-info__name"
        :data-full-name="userInfo.name"
        @mouseenter="handleNameHover"
        @mouseleave="handleNameLeave"
      >
        <span class="user-info__name-text" :class="{ 'is-dark': isDark }">{{ displayedName }}</span>
        <span
          class="user-info__name-cursor"
          v-if="isTyping"
          :style="{ transform: `translateX(${cursorPosition * 0.6}em)` }"
        >|</span>
      </span>
      <div class="user-info__avatar-box user-info__avatar-box--small">
        <img
          :src="avatarUrl"
          :alt="userInfo.name || '用户头像'"
          class="user-info__avatar-img-small"
          @error="handleAvatarError"
        />
      </div>
    </div>

    <template #dropdown>
      <div class="user-info__header">
        <div class="user-info__avatar-box user-info__avatar-box--large">
          <el-image
            :src="userInfo.avatar || '/logo.png'"
            :preview-src-list="[userInfo.avatar || '/logo.png']"
            fit="cover"
            class="user-info__avatar-img"
          >
            <template #error>
              <el-avatar :size="50">
                <el-icon><User /></el-icon>
              </el-avatar>
            </template>
          </el-image>
        </div>
        <div class="user-info__details">
          <el-text size="default" tag="p">{{ userInfo.name }}</el-text>
          <el-text size="small" type="info">{{ userInfo.position || '' }}</el-text>
        </div>
      </div>

      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          <btc-svg name="my" :size="16" />
          <span>{{ t('common.profile') }}</span>
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <btc-svg name="set" :size="16" />
          <span>{{ t('common.settings') }}</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <btc-svg name="exit" :size="16" />
          <span>{{ t('common.logout') }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useI18n, logger } from '@btc/shared-core';
import { BtcConfirm } from '@btc/shared-components';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import { useLogout } from '@/composables/useLogout';
import { User } from '@element-plus/icons-vue';
import { useUserInfo } from './index';

defineOptions({
  name: 'UserInfo'
});

const { t } = useI18n();
const router = useRouter();
const { logout } = useLogout();

// popper-class 类型定义修复
const popperClass = 'user-info__popper' as any;

// 获取设置状态
const { menuThemeType, isDark: isDarkTheme } = useSettingsState();

// 判断是否为深色菜单风格
const isDark = computed(() => {
  return isDarkTheme?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 使用 composable
const {
  displayedName,
  isTyping,
  cursorPosition,
  userInfo,
  loadProfileInfo,
  handleNameHover,
  handleNameLeave
} = useUserInfo();

// 记录头像加载失败状态，避免无限循环
const avatarLoadError = ref(false);
const errorHandled = ref(false);

// 头像 URL（确保始终有值，避免空白）
const avatarUrl = computed(() => {
  const url = userInfo.value?.avatar;
  // 如果头像加载失败，强制使用默认 Logo
  if (avatarLoadError.value) {
    return '/logo.png';
  }
  return url && url !== '/logo.png' && url !== '' ? url : '/logo.png';
});

// 头像加载失败处理 - 阻止无限循环
const handleAvatarError = (event: Event) => {
  // 防止重复处理
  if (errorHandled.value) {
    return;
  }

  const img = event.target as HTMLImageElement;
  const failedUrl = img.src;

  console.warn('[UserInfo] 头像加载失败:', failedUrl);

  // 标记已处理
  errorHandled.value = true;

  // 如果失败的是 logo.png，不再重试
  if (failedUrl.includes('logo.png')) {
    logger.error('[UserInfo] ❌ logo.png 文件加载失败！请检查: public/logo.png');
    logger.error('[UserInfo] URL:', failedUrl);
    return;
  }

  // 标记头像加载失败
  avatarLoadError.value = true;
};

// 监听头像变化，重置错误状态
watch(() => userInfo.value?.avatar, (newAvatar, oldAvatar) => {
  if (newAvatar !== oldAvatar && newAvatar) {
    avatarLoadError.value = false;
    errorHandled.value = false;
  }
});

// 初始化
onMounted(async () => {
  if (import.meta.env.DEV) {
    console.info('[UserInfo] onMounted called');
  }
  await loadProfileInfo();
});

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
  console.info('[UserInfo] handleCommand 被调用, command:', command);
  switch (command) {
    case 'profile':
      // 个人信息页面属于系统域（主应用），直接使用 router.push
      router.push('/workbench/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      // 获取国际化文本
      const confirmMessage = t('common.logoutConfirm') || '确定要退出登录吗？';
      const confirmTitle = t('common.warning') || t('common.tip') || '提示';
      const confirmText = t('common.button.confirm') || '确定';
      const cancelText = t('common.button.cancel') || '取消';

      // 直接使用 ElMessageBox.confirm，确保对话框能够显示
      BtcConfirm(confirmMessage, confirmTitle, {
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        type: 'warning',
        autofocus: false
      })
        .then(() => {
          // 用户确认退出
          logout().catch((error) => {
            logger.error('[UserInfo] logout 执行失败:', error);
          });
        })
        .catch(() => {
          // 用户取消退出，不做任何操作
        });
      break;
  }
};
</script>

<style lang="scss" scoped>
@use './index.scss';
</style>

<style lang="scss">
@use './popper.scss';
</style>

