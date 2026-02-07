<template>
  <div class="logistics-procurement-auxiliary">
    <BtcEmpty :description="t('logistics.placeholder.procurementAux')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import { BtcEmpty } from '@btc/shared-components';

defineOptions({
  name: 'btc-logistics-procurement-auxiliary',
});

const { t } = useI18n();
</script>

<style scoped lang="scss">
.logistics-procurement-auxiliary {
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>


