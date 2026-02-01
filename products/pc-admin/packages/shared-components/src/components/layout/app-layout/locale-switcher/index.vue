<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <template #default>
      <BtcIconButton
        :config="{
          icon: 'lang',
          tooltip: t('common.tooltip.locale')
        }"
      />
    </template>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="lang in languages"
          :key="lang.value"
          :command="lang.value"
        >
          <div
            class="locale-switcher__item"
            :class="{ active: locale === lang.value }"
          >
            <span class="locale-switcher__item-label">{{ lang.label }}</span>
            <span v-if="locale === lang.value" class="locale-switcher__item-dot"></span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutLocaleSwitcher'
});

import { ref } from 'vue';
// computed 未使用，已移除
import { storage } from '@btc/shared-core/utils/storage';
import { useI18n } from '@btc/shared-core';
import { BtcIconButton } from '@btc/shared-components';

const { locale, t } = useI18n();

const languages = ref([
  {
    label: '\u7b80\u4f53\u4e2d\u6587', // 简体中文
    value: 'zh-CN',
  },
  {
    label: 'English',
    value: 'en-US',
  },
]);

const handleCommand = (value: string) => {
  // 优先使用插件API
  const pluginAPI = (window as any).__PLUGIN_API__;
  if (pluginAPI?.i18n?.changeLocale) {
    try {
      pluginAPI.i18n.changeLocale(value);
      return;
    } catch (error) {
      console.warn('[LocaleSwitcher] 调用插件API失败:', error);
    }
  }

  // 向后兼容：直接操作
  locale.value = value;

  // 同步更新 storage
  storage.set('locale', value);

  // 触发语言切换事件
  window.dispatchEvent(new CustomEvent('language-change', {
    detail: { locale: value }
  }));
};
</script>

<style lang="scss" scoped>
.locale-switcher {
  &__item {
    width: 140px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;

    &-label {
      font-size: 14px;
    }

    &.active {
      .locale-switcher__item-label {
        color: var(--el-color-primary);
        font-weight: 500;
      }

      .locale-switcher__item-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: var(--el-color-primary);
      }
    }

    &:hover {
      .locale-switcher__item-label {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
