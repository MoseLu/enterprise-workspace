<template>
  <div class="finance-inventory">
    <el-empty :description="t('finance.placeholder.inventoryManagement')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';

defineOptions({
  name: 'btc-finance-inventory',
});

const { t } = useI18n();
</script>

<style scoped lang="scss">
.finance-inventory {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

