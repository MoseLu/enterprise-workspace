<template>
  <div class="page">
    <BtcEmpty :description="t('page.customs.placeholder')" />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@btc/shared-core';
import { BtcEmpty } from '@btc/shared-components';

defineOptions({
  name: 'LogisticsCustoms',
});

const { t } = useI18n();
</script>

<style scoped lang="scss">

</style>


