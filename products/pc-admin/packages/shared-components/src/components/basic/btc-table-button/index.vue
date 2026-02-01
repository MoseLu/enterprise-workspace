<template>
  <TableButtonInner :config="config" />
</template>

<script setup lang="ts">
import TableButtonInner from './table-button-inner.vue';
import type { BtcTableButtonConfig } from './types';

defineOptions({
  name: 'BtcTableButton',
});

defineProps<{
  config: BtcTableButtonConfig;
}>();
</script>


