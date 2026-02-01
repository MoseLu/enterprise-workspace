<template>
  <div class="btc-crud-actions btc-crud-right-group">
    <slot />
    <BtcTableToolbar v-if="showToolbar" />
  </div>
</template>

<script setup lang="ts">
import BtcTableToolbar from '../toolbar/inline.vue';

defineProps({
  showToolbar: {
    type: Boolean,
    default: true
  }
});
</script>
