<template>
  <div class="third-party-login">
    <BtcAuthDivider />
    <BtcLoginOptions />
  </div>
</template>

<script setup lang="ts">
import BtcAuthDivider from '../auth-divider/index.vue';
import BtcLoginOptions from '../login-options/index.vue';

defineOptions({
  name: 'BtcThirdPartyLogin'
});
</script>
