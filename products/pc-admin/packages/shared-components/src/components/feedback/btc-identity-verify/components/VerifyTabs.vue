<template>
  <div class="identity-verify__content-left">
    <div class="verify-tabs">
      <div
        class="verify-tabs__item"
        :class="{
          'is-active': currentVerifyType === 'phone',
          'is-disabled': !canUsePhoneVerify
        }"
        @click="canUsePhoneVerify ? handleSwitch('phone') : null"
      >
        手机号验证
      </div>
      <div
        class="verify-tabs__item"
        :class="{
          'is-active': currentVerifyType === 'email',
          'is-disabled': !canUseEmailVerify
        }"
        @click="canUseEmailVerify ? handleSwitch('email') : null"
      >
        邮箱验证
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VerifyType } from '../composables/useIdentityVerify';

defineOptions({
  name: 'BtcIdentityVerifyTabs'
});

interface Props {
  currentVerifyType: VerifyType;
  canUsePhoneVerify: boolean;
  canUseEmailVerify: boolean;
}

// props未直接使用，但在Vue组件中自动可用
defineProps<Props>();

const emit = defineEmits<{
  switch: [type: VerifyType];
}>();

const handleSwitch = (type: VerifyType) => {
  emit('switch', type);
};
</script>

<style lang="scss" scoped>
@use '../styles/tabs.scss' as *;
</style>

