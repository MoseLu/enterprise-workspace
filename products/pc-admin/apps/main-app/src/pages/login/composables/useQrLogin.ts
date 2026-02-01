;
import { ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcMessage } from '@btc/shared-components';
import loginQrImage from '@/assets/images/login_qr.png';
import { authApi } from '@/modules/api-services/auth';

// localStorage 存储的 key
const QR_CODE_STORAGE_KEY = 'btc_qr_code_cache';
const QR_CODE_EXPIRE_TIME_KEY = 'btc_qr_code_expire_time';

interface QrCodeCache {
  qrCodeUrl: string;
  expireTime: number; // 剩余时间（秒）
}

export function useQrLogin() {
  const { t } = useI18n();
  
  // 二维码URL
  const qrCodeUrl = ref<string>(loginQrImage);
  // 倒计时（秒）
  const countdown = ref<number>(0);
  // 是否已失效
  const isExpired = ref<boolean>(false);
  // 倒计时定时器
  let countdownTimer: ReturnType<typeof setInterval> | null = null;

  // 清除倒计时
  const clearCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  };

  // 保存二维码到本地存储
  const saveQrCodeToStorage = (qrCodeData: string, expireTimeSeconds: number) => {
    try {
      const expireTime = Date.now() + expireTimeSeconds * 1000; // 转换为时间戳（毫秒）
      localStorage.setItem(QR_CODE_STORAGE_KEY, qrCodeData);
      localStorage.setItem(QR_CODE_EXPIRE_TIME_KEY, expireTime.toString());
    } catch (error) {
      console.warn('保存二维码到本地存储失败:', error);
    }
  };

  // 从本地存储读取二维码
  const loadQrCodeFromStorage = (): QrCodeCache | null => {
    try {
      const cachedQrCode = localStorage.getItem(QR_CODE_STORAGE_KEY);
      const cachedExpireTime = localStorage.getItem(QR_CODE_EXPIRE_TIME_KEY);
      
      if (!cachedQrCode || !cachedExpireTime) {
        return null;
      }
      
      const expireTime = parseInt(cachedExpireTime, 10);
      const now = Date.now();
      
      // 检查是否已过期
      if (now >= expireTime) {
        // 已过期，清除缓存
        clearQrCodeStorage();
        return null;
      }
      
      // 计算剩余时间（秒）
      const remainingSeconds = Math.floor((expireTime - now) / 1000);
      
      return {
        qrCodeUrl: cachedQrCode,
        expireTime: remainingSeconds
      };
    } catch (error) {
      console.warn('从本地存储读取二维码失败:', error);
      return null;
    }
  };

  // 清除本地存储的二维码
  const clearQrCodeStorage = () => {
    try {
      localStorage.removeItem(QR_CODE_STORAGE_KEY);
      localStorage.removeItem(QR_CODE_EXPIRE_TIME_KEY);
    } catch (error) {
      console.warn('清除二维码本地存储失败:', error);
    }
  };

  // 开始倒计时
  const startCountdown = (seconds: number = 60) => {
    clearCountdown();
    countdown.value = seconds;
    isExpired.value = false;

    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearCountdown();
        isExpired.value = true;
        qrCodeUrl.value = loginQrImage; // 失效后显示占位图
        clearQrCodeStorage(); // 清除已过期的缓存
      }
    }, 1000);
  };

  // 获取二维码
  const fetchQrCode = async (forceRefresh: boolean = false) => {
    try {
      const response = await authApi.generateQrCode();
      
      // 处理响应：可能是字符串（base64）或对象（包含qrCode字段）
      let qrCodeData: string;
      let expireTime: number = 60;
      
      if (typeof response === 'string') {
        // 如果响应直接是base64字符串
        qrCodeData = response;
      } else if (response?.qrCode) {
        // 如果响应是对象，包含qrCode字段
        qrCodeData = response.qrCode;
        expireTime = response.expireTime || 60;
      } else if (response?.data) {
        // 如果响应是对象，包含data字段（base64字符串）
        qrCodeData = response.data;
        expireTime = response.expireTime || 60;
      } else {
        throw new Error(t('获取二维码失败'));
      }
      
      // 确保base64字符串格式正确
      if (qrCodeData && !qrCodeData.startsWith('data:')) {
        qrCodeData = `data:image/png;base64,${qrCodeData}`;
      }
      
      qrCodeUrl.value = qrCodeData;
      startCountdown(expireTime);
      isExpired.value = false;
      
      // 保存到本地存储
      saveQrCodeToStorage(qrCodeData, expireTime);
    } catch (error: any) {
      BtcMessage.error(error.message || t('获取二维码失败'));
      qrCodeUrl.value = loginQrImage;
      isExpired.value = true;
      clearCountdown();
      clearQrCodeStorage(); // 清除可能存在的无效缓存
    }
  };

  // 刷新二维码（强制刷新，清除缓存）
  const refreshQrCode = async () => {
    clearQrCodeStorage(); // 清除缓存
    await fetchQrCode(true);
  };

  // 初始化：先检查缓存，如果没有或已过期才请求新的
  const initializeQrCode = async () => {
    const cached = loadQrCodeFromStorage();
    
    if (cached) {
      // 使用缓存的二维码
      qrCodeUrl.value = cached.qrCodeUrl;
      startCountdown(cached.expireTime);
      isExpired.value = false;
    } else {
      // 没有缓存或已过期，请求新的二维码
      await fetchQrCode();
    }
  };

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearCountdown();
  });

  // 初始化时先检查缓存，如果没有或已过期才请求新的
  initializeQrCode();

  return {
    qrCodeUrl,
    countdown,
    isExpired,
    refreshQrCode
  };
}

