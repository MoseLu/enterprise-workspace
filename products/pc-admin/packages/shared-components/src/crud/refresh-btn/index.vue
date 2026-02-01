<template>
  <BtcTableButton
    class="btc-crud-action-icon"
    v-if="isMinimal"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    v-bind="$attrs"
    class="btc-crud-btn"
    @click="handleRefreshClick"
  >
    <BtcSvg class="btc-crud-btn__icon" name="refresh" />
    <span class="btc-crud-btn__text">
      <slot>{{ buttonLabel }}</slot>
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue';
import { useI18n, useThemePlugin, logger } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '@btc-components/basic/btc-table-button/types';

export interface Props {
  text?: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
// 安全地获取主题插件，避免在插件未初始化时出错
let theme: ReturnType<typeof useThemePlugin> | null = null;
try {
  theme = useThemePlugin();
} catch (error) {
  // 如果主题插件未初始化，使用默认配置
  console.warn('[BtcRefreshBtn] Theme plugin not available:', error);
}

const attrs = useAttrs();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  // 关键：在生产环境下，这个错误必须可见，不能被静默处理
  const error = new Error('[BtcRefreshBtn] Must be used inside <BtcCrud>. This usually means BtcCrud component is not properly rendered or provide/inject context is broken.');
  logger.error('[BtcRefreshBtn] CRITICAL ERROR:', error.message, {
    componentName: 'BtcRefreshBtn',
    injectKey: 'btc-crud',
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  throw error;
}

const buttonLabel = computed(() => props.text || t('crud.button.refresh'));
const isMinimal = computed(() => theme?.buttonStyle?.value === 'minimal');

const isDisabled = computed(() => {
  const value = attrs.disabled;
  return value === '' || value === true || value === 'true';
});

// 处理刷新按钮点击
const handleRefreshClick = () => {
  if (isDisabled.value) {
    return;
  }

  // 关键：在生产环境下，这些错误必须可见
  if (!crud) {
    const errorMsg = '[BtcRefreshBtn] crud is not available - inject failed or BtcCrud not rendered';
    logger.error(errorMsg, {
      componentName: 'BtcRefreshBtn',
      injectKey: 'btc-crud',
      timestamp: new Date().toISOString(),
    });
    throw new Error(errorMsg);
  }

  if (typeof crud.handleRefresh !== 'function') {
    const errorMsg = '[BtcRefreshBtn] crud.handleRefresh is not a function';
    logger.error(errorMsg, {
      crud,
      handleRefresh: crud.handleRefresh,
      type: typeof crud.handleRefresh,
      crudKeys: crud ? Object.keys(crud) : [],
      timestamp: new Date().toISOString(),
    });
    throw new Error(errorMsg);
  }

  try {
    crud.handleRefresh();
  } catch (error) {
    logger.error('[BtcRefreshBtn] Error calling crud.handleRefresh:', error, {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'refresh',
  tooltip: buttonLabel.value,
  ariaLabel: buttonLabel.value,
  type: 'default',
  onClick: handleRefreshClick,
  disabled: isDisabled.value,
}));
</script>

