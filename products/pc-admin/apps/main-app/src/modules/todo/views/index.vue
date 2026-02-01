<template>
  <div class="page">
    <div class="todo__content">
      <BtcEmpty :description="t('todo.empty')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { BtcEmpty } from '@btc/shared-components';

const { t } = useI18n();
</script>

<style lang="scss" scoped>
// 样式内容
</style>

