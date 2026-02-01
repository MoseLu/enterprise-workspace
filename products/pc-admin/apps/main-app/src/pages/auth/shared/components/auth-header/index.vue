<template>
  <div class="card-header">
    <div class="title">
      <div class="logo">
        <img :src="appConfig.logo" :alt="appConfig.name" />
      </div>
      <h1>{{ appConfig.name }}</h1>
    </div>
    <slot name="toggle">
      <BtcQrToggleBtn
        :icon="toggleIcon"
        :label="toggleLabel"
        @click="handleToggleQr"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { appConfig } from '@/config/app';
import BtcQrToggleBtn from '../qr-toggle-btn/index.vue';

defineOptions({
  name: 'BtcAuthHeader'
});

interface Props {
  toggleIcon?: string;
  toggleLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  toggleIcon: 'qr',
  toggleLabel: 'auth.login.toggle.qr'
});

const emit = defineEmits<{
  'toggle-qr': [];
}>();

function handleToggleQr() {
  emit('toggle-qr');
}
</script>
