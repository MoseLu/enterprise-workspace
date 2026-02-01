;
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcMessage } from '@btc/shared-components';
import loginQrImage from '@/assets/images/login_qr.png';

export function useQrLogin() {
  const { t } = useI18n();
  
  // 二维码URL（占位）
  const qrCodeUrl = ref<string>(loginQrImage);

  // 刷新二维码
  const refreshQrCode = async () => {
    try {
      // TODO: 调用后端API获取二维码
      // const response = await http.post('/base/open/qr/generate');
      // qrCodeUrl.value = response.data.qrCodeUrl;
      
      BtcMessage.info(t('二维码登录功能暂未开启'));
    } catch (error: any) {
      console.error('刷新二维码错误:', error);
      BtcMessage.error(error.message || t('刷新二维码失败'));
    }
  };

  return {
    qrCodeUrl,
    refreshQrCode
  };
}

