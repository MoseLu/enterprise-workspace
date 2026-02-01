<template>
  <div class="qr-login">
    <div class="qr-container">
      <div class="qr-code">
        <img :src="qrCodeUrl || loginQrImage" alt="扫码登录" />
      </div>
      <div class="qr-tips">
        <p>{{ t('请使用BTC移动端扫描二维码登录') }}</p>
        <el-button @click="handleRefreshQrCode">
          {{ t('刷新二维码') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import loginQrImage from '@/assets/images/login_qr.png';

defineOptions({
  name: 'BtcQrForm'
});

interface Props {
  qrCodeUrl?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'refresh': [];
}>();

const { t } = useI18n();

// 刷新二维码
const handleRefreshQrCode = () => {
  emit('refresh');
};
</script>

<style lang="scss" scoped>
.qr-login {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  box-sizing: border-box;

  .qr-container {
    text-align: center;

    .qr-code {
      margin-bottom: 20px;

      img {
        width: 200px;
        height: 200px;
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        background-color: var(--el-bg-color);
      }
    }

    .qr-tips {
      p {
        margin-bottom: 12px;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }

      .el-button {
        margin-top: 8px;
      }
    }
  }
}
</style>
