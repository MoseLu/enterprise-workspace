<template>
  <div class="qr-login">
    <div class="qr-container">
      <div class="qr-code">
        <img :src="qrCodeUrl || loginQrImage" alt="扫码登录" />
        <!-- 失效遮罩层 -->
        <div v-show="isExpired" class="qr-expired-overlay">
          <!-- 刷新图标按钮 -->
          <div 
            class="qr-refresh-icon" 
            @click.stop="handleRefreshQrCode"
            :title="t('刷新二维码')"
          >
            <el-icon :size="24">
              <RefreshRight />
            </el-icon>
          </div>
          <!-- 失效提示放在刷新图标下方 -->
          <div class="qr-expired-tip">
            <p>{{ t('二维码已失效') }}</p>
          </div>
        </div>
      </div>
      <div class="qr-tips">
        <p>{{ t('请使用BTC移动端扫描二维码登录') }}</p>
        <div class="qr-countdown" v-if="countdown > 0 && !isExpired">
          <span>{{ t('二维码将在') }} {{ countdown }} {{ t('秒后失效') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { RefreshRight } from '@element-plus/icons-vue';
import loginQrImage from '@/assets/images/login_qr.png';

defineOptions({
  name: 'BtcQrForm'
});

interface Props {
  qrCodeUrl?: string;
  countdown?: number;
  isExpired?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  countdown: 0,
  isExpired: false
});

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
      position: relative;
      margin-bottom: 20px;
      display: inline-block;
      width: 200px;
      height: 200px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      overflow: hidden;
      box-sizing: border-box;

      img {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 0;
        background-color: var(--el-bg-color);
        display: block;
        object-fit: contain;
      }

      .qr-expired-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 7px;
        z-index: 2;
        pointer-events: auto;

        .qr-refresh-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 3;

          &:hover {
            background-color: rgba(255, 255, 255, 1);
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          &:active {
            transform: translate(-50%, -50%) scale(0.95);
          }

          .el-icon {
            color: var(--el-color-primary);
          }
        }

        .qr-expired-tip {
          position: absolute;
          top: calc(50% + 40px);
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.7);
          padding: 6px 12px;
          border-radius: 4px;
          white-space: nowrap;

          p {
            color: #fff;
            font-size: 12px;
            font-weight: 500;
            margin: 0;
          }
        }
      }
    }

    .qr-tips {
      min-height: 60px;
      
      p {
        margin-bottom: 12px;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }

      .qr-countdown {
        height: 20px;
        margin-bottom: 12px;
        color: var(--el-color-warning);
        font-size: 12px;
        line-height: 20px;
      }
    }
  }
}
</style>
