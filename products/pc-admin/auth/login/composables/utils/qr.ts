/**
 * 二维码登录相关工具函数
 */
;

import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';

/**
 * 二维码登录状态
 */
export interface QrLoginState {
  qrCode: string;
  status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'success';
  expiresAt: number;
}

/**
 * 创建二维码登录状态
 * @returns 二维码登录状态对象
 */
export function createQrLoginState() {
  const state = reactive<QrLoginState>({
    qrCode: '',
    status: 'pending',
    expiresAt: 0
  });

  const loading = ref(false);
  const polling = ref(false);

  return {
    state,
    loading,
    polling
  };
}

/**
 * 生成二维码
 * @param state 二维码状态
 * @param onSuccess 成功回调
 * @returns 生成二维码函数
 */
export function createQrCodeGenerator(
  state: QrLoginState,
  onSuccess?: (qrCode: string) => void
) {
  const loading = ref(false);

  const generateQrCode = async () => {
    try {
      loading.value = true;
      
      // 模拟生成二维码的 API 调用
      // 实际项目中应该调用真实的 API
      const response = await new Promise<{ code: number; data: { qrCode: string; expiresIn: number } }>((resolve) => {
        setTimeout(() => {
          resolve({
            code: 2000,
            data: {
              qrCode: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              expiresIn: 300 // 5分钟过期
            }
          });
        }, 1000);
      });

      if (response.code === 2000) {
        state.qrCode = response.data.qrCode;
        state.status = 'pending';
        state.expiresAt = Date.now() + response.data.expiresIn * 1000;
        
        onSuccess?.(state.qrCode);
        BtcMessage.success('二维码已生成');
      } else {
        BtcMessage.error('二维码生成失败');
      }
    } catch (error: any) {
      BtcMessage.error('二维码生成失败，请重试');
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    generateQrCode
  };
}

/**
 * 轮询二维码状态
 * @param state 二维码状态
 * @param onStatusChange 状态变化回调
 * @returns 轮询控制对象
 */
export function createQrCodePoller(
  state: QrLoginState,
  onStatusChange?: (status: string) => void
) {
  const polling = ref(false);
  let pollTimer: NodeJS.Timeout | null = null;

  const startPolling = () => {
    if (polling.value || !state.qrCode) return;
    
    polling.value = true;
    pollTimer = setInterval(async () => {
      // 检查是否过期
      if (Date.now() > state.expiresAt) {
        state.status = 'expired';
        stopPolling();
        onStatusChange?.('expired');
        return;
      }

      // 模拟轮询二维码状态
      // 实际项目中应该调用真实的 API
      try {
        const response = await new Promise<{ code: number; data: { status: string } }>((resolve) => {
          setTimeout(() => {
            // 模拟状态变化
            const random = Math.random();
            if (random < 0.1) {
              resolve({ code: 2000, data: { status: 'scanned' } });
            } else if (random < 0.15) {
              resolve({ code: 2000, data: { status: 'confirmed' } });
            } else {
              resolve({ code: 2000, data: { status: 'pending' } });
            }
          }, 500);
        });

        if (response.code === 2000 && response.data.status !== state.status) {
          state.status = response.data.status as any;
          onStatusChange?.(response.data.status);
          
          if (response.data.status === 'confirmed') {
            stopPolling();
          }
        }
      } catch (error) {
        console.error('轮询二维码状态失败', error);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    polling.value = false;
  };

  const resetQrCode = () => {
    stopPolling();
    state.qrCode = '';
    state.status = 'pending';
    state.expiresAt = 0;
  };

  return {
    polling,
    startPolling,
    stopPolling,
    resetQrCode
  };
}

/**
 * 创建二维码登录处理函数
 * @param state 二维码状态
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns 二维码登录处理函数
 */
export function createQrLoginHandler(
  state: QrLoginState,
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void
) {
  const handleQrLogin = async () => {
    if (state.status !== 'confirmed') {
      BtcMessage.warning('请先确认登录');
      return;
    }

    try {
      // 模拟二维码登录 API 调用
      const response = await new Promise<{ code: number; data: any; msg: string }>((resolve) => {
        setTimeout(() => {
          resolve({
            code: 2000,
            data: { token: 'mock_token', user: { id: 1, name: '用户' } },
            msg: '登录成功'
          });
        }, 1000);
      });

      if (response.code === 2000) {
        state.status = 'success';
        BtcMessage.success(response.msg || '登录成功');
        onSuccess?.(response.data);
      } else {
        BtcMessage.error(response.msg || '登录失败');
        onError?.(response);
      }
    } catch (error: any) {
      BtcMessage.error(error.message || '二维码登录失败');
      onError?.(error);
    }
  };

  return {
    handleQrLogin
  };
}
