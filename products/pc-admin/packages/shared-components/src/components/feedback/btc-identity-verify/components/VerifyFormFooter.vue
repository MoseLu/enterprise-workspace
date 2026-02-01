<template>
  <div class="verify-form__footer">
    <div class="verify-form__divider"></div>

    <div class="verify-form__item-tip">
      <template v-if="currentVerifyType === 'phone'">
        <div v-if="hasPhone">
          1. 接收验证码的手机号为您账号中绑定的安全手机号
        </div>
        <div v-else>
          1. 请输入您的手机号，验证码将发送至该手机号
        </div>
        <div>2. 发送验证码后，您可以在手机短信中获取（1分钟内未收到，建议在垃圾短信中查看）</div>
        <div v-if="!hasPhone" class="verify-form__item-tip-highlight">
          3. 验证成功后，该手机号将自动绑定到您的账号
        </div>
      </template>
      <template v-else>
        <div v-if="hasEmail">
          验证码已发送至您的邮箱，请查收。如未收到，请检查垃圾邮件或稍后重试。
        </div>
        <div v-else>
          <div>1. 请输入您的邮箱地址，验证码将发送至该邮箱</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VerifyType } from '../composables/useIdentityVerify';

defineOptions({
  name: 'BtcVerifyFormFooter'
});

interface Props {
  currentVerifyType: VerifyType;
  hasPhone: boolean;
  hasEmail: boolean;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@use '../styles/footer.scss' as *;
</style>

