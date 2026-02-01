<template>
  <div class="card-header">
    <div class="title">
      <div class="logo">
        <img src="/icons/android-chrome-192x192.png" alt="BTC Admin Logo" />
      </div>
      <h1>{{ app.info.name }}</h1>
    </div>
    <qr-toggle-btn
      :icon="toggleIcon"
      :label="toggleLabel"
      @click="toggleQrLogin"
    />
  </div>
</template>

<script lang="ts" setup>
import QrToggleBtn from '../controls/qr-toggle-btn.vue';

defineOptions({
  name: 'LoginHeader'
});

defineProps<{
  toggleIcon: any;
  toggleLabel: string;
  toggleQrLogin: () => void;
  app: any;
}>();
</script>

<style lang="scss">
@use './styles.scss';
</style>
