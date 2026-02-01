<template>
  <BtcCrudToolbar v-if="binding" :binding="binding" />
</template>

<script setup lang="ts">
import { computed, inject, unref } from 'vue';
import BtcCrudToolbar from './index.vue';

const tableContext = inject<any>('btc-table-ref', null);
const providedBinding = inject<any>('btc-crud-toolbar-binding', null);

const binding = computed(() => {
  const injected = providedBinding ? unref(providedBinding) : null;
  if (injected) {
    return injected;
  }
  return tableContext?.value?.toolbarBinding ?? null;
});
</script>

