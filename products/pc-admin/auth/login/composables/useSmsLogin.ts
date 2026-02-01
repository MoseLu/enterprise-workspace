;
import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { authApi } from '@/modules/api-services';
import { appStorage } from '@/utils/app-storage';

export function useSmsLogin() {
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();

  // 表单数据
  const form = reactive({
    phone: '',
    smsCode: ''
  });

  // 加载状态
  const loading = ref(false);

  // 提交登录
  const submit = async (formData: { phone: string; smsCode: string }) => {
    try {
      loading.value = true;

      // 调用短信登录接口
      // 关键：只要请求返回 200（没有抛出错误），就认为登录成功
      // 响应拦截器会处理响应，如果 code 不是 200，会抛出错误
      // 所以这里不需要检查响应格式，直接认为登录成功
      await authApi.loginBySms({
        phone: formData.phone,
        smsCode: formData.smsCode,
        smsType: 'login'
      });

      // 如果代码执行到这里，说明请求返回了 200，登录成功
      // 只负责鉴权，跳转逻辑交给 loginRedirectGuard 统一处理
      BtcMessage.success(t('登录成功'));

      // 设置登录状态标记到统一的 settings 存储中
      // 关键：直接使用 storage.get 和 syncSettingsToCookie，确保标记能立即被 isAuthenticated() 读取
      try {
        const { storage } = await import('@btc/shared-core/utils/storage');
        const { syncSettingsToCookie } = await import('@btc/shared-core/utils/storage/cross-domain');
        const currentSettings = (storage.get('settings') as Record<string, any>) || {};
        const updatedSettings = { ...currentSettings, is_logged_in: true };
        // 直接同步到 Cookie，确保立即生效
        syncSettingsToCookie(updatedSettings);
        
        if (import.meta.env.DEV) {
          console.log('[useSmsLogin] ✅ 已设置 is_logged_in 标记到 Cookie');
        }
      } catch (error) {
        // 如果失败，使用 appStorage（回退方案）
        const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
        appStorage.settings.set({ ...currentSettings, is_logged_in: true });
        
        if (import.meta.env.DEV) {
          console.warn('[useSmsLogin] 使用 appStorage 设置 is_logged_in 标记（回退方案）:', error);
        }
      }
      
      // 记录登录时间，用于存储有效性检查的宽限期
      try {
        import('@btc/shared-core/utils/storage-validity-check').then(({ recordLoginTime }) => {
          recordLoginTime();
        }).catch(() => {
          // 静默失败，不影响登录流程
        });
      } catch (error) {
        // 静默失败，不影响登录流程
      }

      // 已禁用：不再刷新页面，改为使用路由跳转或保持在登录页
      if (import.meta.env.DEV) {
        console.log('[useSmsLogin] ✅ 登录成功，已禁用页面刷新');
        console.log('[useSmsLogin] 检查是否有 oauth_callback 参数');
      }
      
      // 等待一小段时间，确保认证状态已稳定（cookie 和 is_logged_in 标记都已设置）
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 检查是否有 oauth_callback 参数，如果有就跳转到目标页面
      const oauthCallback = route.query.oauth_callback as string | undefined;
      if (oauthCallback) {
        try {
          const { validateAndNormalizeRedirectPath } = await import('@btc/auth-shared/composables/redirect');
          const { getMainAppHomeRoute } = await import('@btc/shared-core');
          const defaultPath = getMainAppHomeRoute() || '/workbench/overview';
          const redirectPath = validateAndNormalizeRedirectPath(oauthCallback, defaultPath);
          
          // 确保不是登录页（防止循环）
          const normalizedPath = redirectPath.split('?')[0];
          if (normalizedPath === '/login' || normalizedPath.startsWith('/login')) {
            if (import.meta.env.DEV) {
              console.log('[useSmsLogin] 重定向路径是登录页，跳转到默认首页');
            }
            router.push(defaultPath);
          } else {
            if (import.meta.env.DEV) {
              console.log('[useSmsLogin] 跳转到目标页面:', redirectPath);
            }
            router.push(redirectPath);
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('[useSmsLogin] 跳转失败:', error);
          }
          // 如果跳转失败，保持在登录页（不刷新）
        }
      } else {
        // 没有回调参数，保持在登录页（不刷新）
        if (import.meta.env.DEV) {
          console.log('[useSmsLogin] 没有 oauth_callback 参数，保持在登录页');
        }
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      BtcMessage.error(error.message || t('登录失败'));
      // 不再抛出错误，避免在父组件中产生未处理的错误
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    loading,
    submit
  };
}
