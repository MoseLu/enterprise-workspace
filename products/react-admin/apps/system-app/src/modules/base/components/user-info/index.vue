<template>
  <el-dropdown
    class="user-info"
    placement="bottom-end"
    popper-class="user-info__popper"
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
import { useI18n } from 'vue-i18n';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useMessage } from '@/utils/use-message';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import { useUser } from '@/composables/useUser';
import { useLogout } from '@/composables/useLogout';
import { User } from '@element-plus/icons-vue';
import { useUserInfo } from './index';

defineOptions({
  name: 'UserInfo'
});

const { t } = useI18n();
const router = useRouter();
const message = useMessage();
const { logout } = useLogout();

// 获取设置状态
const { menuThemeType, isDark: isDarkTheme } = useSettingsState();

// 判断是否为深色菜单风格
const isDark = computed(() => {
  return isDarkTheme?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 用户相关
const { userInfo: userInfoComputed, getUserInfo, setUserInfo } = useUser();

// 使用 composable
const {
  profileUserInfo,
  displayedName,
  isTyping,
  cursorPosition,
  userInfo,
  handleNameHover,
  handleNameLeave
} = useUserInfo();

// 头像 URL（确保始终有值，避免空白）
const avatarUrl = computed(() => {
  const url = userInfo.value?.avatar;
  return url && url !== '/logo.png' ? url : '/logo.png';
});

// 头像加载失败处理
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  img.src = '/logo.png';
};

// 初始化（个人信息由主应用或 layout-app 统一处理，system-app 不需要加载）

// 处理用户下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 个人信息页面属于系统域（主应用），直接使用 router.push
      router.push('/profile');
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'logout':
      BtcConfirm(t('common.logoutConfirm'), t('common.warning'), {
        confirmButtonText: t('common.button.confirm'),
        cancelButtonText: t('common.button.cancel'),
        type: 'warning'
      })
        .then(() => {
          logout();
        })
        .catch(() => {
          // 取消操作
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

