<template>
  <div class="forgot-password">
    <a href="/forget-password" class="forgot-password-link">
      {{ t('auth.forget_password') }}
      <el-icon class="arrow-right">
        <arrow-right />
      </el-icon>
    </a>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

defineOptions({
  name: 'ForgotPassword'
});

const { t } = useI18n();
</script>
