<template>
  <div class="forgot-password-link">
    <router-link to="/forget-password" class="link">
      {{ $t('auth.login.password.forgot') }}
      <el-icon class="arrow-right">
        <ArrowRight />
      </el-icon>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue';

defineOptions({
  name: 'BtcForgotPasswordLink'
});
</script>
