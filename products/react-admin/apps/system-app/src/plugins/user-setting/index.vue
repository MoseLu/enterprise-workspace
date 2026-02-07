<template>
  <div class="btc-user-setting-toolbar">
    <!-- 偏好设置按钮 -->
    <BtcIconButton
      :config="{
        icon: 'theme',
        tooltip: t('common.tooltip.theme_settings'),
        onClick: openDrawer
      }"
    />

    <!-- 暗黑模式切换 -->
    <BtcIconButton
      :config="{
        icon: () => theme.isDark.value ? 'light' : 'dark',
        tooltip: t('common.tooltip.toggle_dark'),
        onClick: handleDarkToggle
      }"
    />
  </div>

  <!-- 用户设置抽屉 -->
  <BtcUserSettingDrawer v-model="drawerVisible" />
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcIconButton } from '@btc/shared-components';
import { useUserSetting } from './composables/useThemeSwitcher';
import { BtcUserSettingDrawer } from '@btc/shared-components';

defineOptions({
  name: 'BtcUserSetting'
});

const { t } = useI18n();
const userSetting = useUserSetting();
const {
  drawerVisible,
  openDrawer,
  handleDarkToggle,
  theme,
} = userSetting;

// 提供用户设置实例给子组件
provide('userSetting', userSetting);
</script>

<style lang="scss" scoped>
.btc-user-setting-toolbar {
  display: flex;
  align-items: center;
  gap: 10px; // 两个按钮之间的间距
}
</style>

