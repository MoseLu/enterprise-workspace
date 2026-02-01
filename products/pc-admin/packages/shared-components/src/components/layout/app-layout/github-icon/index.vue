<template>
  <BtcIconButton
    :config="{
      icon: 'github',
      tooltip: t('common.tooltip.github'),
      onClick: toCode
    }"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcGithubIcon',
});

import { useI18n } from '@btc/shared-core';
import { BtcIconButton } from '@btc/shared-components';

const { t } = useI18n();

function toCode() {
  // 优先使用插件API提供的仓库URL
  const pluginAPI = (window as any).__PLUGIN_API__;
  if (pluginAPI?.github?.openRepository) {
    try {
      pluginAPI.github.openRepository();
      return;
    } catch (error) {
      console.warn('[GithubIcon] 调用插件API失败:', error);
    }
  }

  // 回退到默认仓库URL
  window.open('https://github.com/BellisGit/btc-shopflow.git', '_blank');
}
</script>

