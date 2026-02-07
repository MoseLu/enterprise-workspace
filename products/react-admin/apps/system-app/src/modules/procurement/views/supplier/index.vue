<template>
  <div class="logistics-procurement-supplier">
    <BtcEmpty :description="t('logistics.placeholder.procurementSupplier')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import { BtcEmpty } from '@btc/shared-components';

defineOptions({
  name: 'btc-logistics-procurement-supplier',
});

const { t } = useI18n();
</script>

<style scoped lang="scss">
.logistics-procurement-supplier {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>


