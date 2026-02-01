<template>
  <div class="logistics-procurement-packaging">
    <BtcEmpty :description="t('page.procurement.placeholder.packaging')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import { BtcEmpty } from '@btc/shared-components';

defineOptions({
  name: 'btc-logistics-procurement-packaging',
});

const { t } = useI18n();
</script>

<style scoped lang="scss">
.logistics-procurement-packaging {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>


