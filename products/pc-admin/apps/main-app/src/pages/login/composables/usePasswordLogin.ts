;
import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { authApi } from '@/modules/api-services';
import { appStorage } from '@/utils/app-storage';

export function usePasswordLogin() {
  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();

  // 表单数据
  // 从统一存储中获取用户名
  const getStoredUsername = (): string => {
    return appStorage.user.getUsername() || '';
  };

  const form = reactive({
    username: getStoredUsername(),
    password: ''
  });

  // 加载状态
  const loading = ref(false);

  // 提交登录
  const submit = async (formData: { username: string; password: string }) => {
    try {
      loading.value = true;

      // 调用登录接口
      // 关键：只要请求返回 200（没有抛出错误），就认为登录成功
      // 响应拦截器会处理响应，如果 code 不是 200，会抛出错误
      // 所以这里不需要检查响应格式，直接认为登录成功
      await authApi.login({
        username: formData.username,
        password: formData.password
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
      } catch (error) {
        // 如果失败，使用 appStorage（回退方案）
        const currentSettings = (appStorage.settings.get() as Record<string, any>) || {};
        appStorage.settings.set({ ...currentSettings, is_logged_in: true });
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

      // 登录成功后，直接导航到目标页面（首页或 oauth_callback）
      // 关键：不再导航到当前路由（/login），而是直接导航到目标页面
      // 这样可以避免触发 loginRedirectGuard 的"从登录页到登录页"判断，导致页面刷新
      try {
        // 使用 nextTick 确保状态更新完成
        await import('vue').then(({ nextTick }) => nextTick());
        
        // 等待一小段时间，确保 Cookie 和 Storage 都已同步
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 检查是否有 oauth_callback 参数
        const oauthCallback = route.query.oauth_callback as string | undefined;
        let targetRoute: { path: string; query?: Record<string, any> } | string;
        
        if (oauthCallback) {
          // 如果有 oauth_callback，尝试解析并导航到该地址
          try {
            // 使用 URL API 解析完整 URL（自动处理编码/解码）
            const callbackUrl = new URL(oauthCallback, window.location.origin);
            
            // 提取路径
            const targetPath = callbackUrl.pathname;
            
            // 提取查询参数（Vue Router 会自动编码）
            const targetQuery: Record<string, string> = {};
            Array.from(callbackUrl.searchParams.entries()).forEach(([key, value]) => {
              targetQuery[key] = value;
            });
            
            // 如果有 hash，添加到路径中（Vue Router 不支持单独的 hash 参数）
            const finalPath = targetPath + (callbackUrl.hash || '');
            
            // 使用对象形式，明确指定 path 和 query
            targetRoute = {
              path: finalPath,
              query: Object.keys(targetQuery).length > 0 ? targetQuery : undefined,
            };
          } catch (error) {
            // 如果解析失败，尝试使用原始值作为路径
            const fallbackPath = oauthCallback.startsWith('/') ? oauthCallback : `/${oauthCallback}`;
            targetRoute = fallbackPath;
          }
        } else {
          // 没有 oauth_callback，检查是否有保存的退出前路径
          const { getAndClearLogoutRedirectPath } = await import('@btc/shared-core/utils/redirect');
          const savedPath = getAndClearLogoutRedirectPath();
          
          if (savedPath) {
            // 如果有保存的路径，使用保存的路径
            try {
              // 尝试解析保存的路径（可能是完整URL或相对路径）
              let finalPath: string;
              if (savedPath.startsWith('http://') || savedPath.startsWith('https://')) {
                // 如果是完整URL，提取路径部分
                const url = new URL(savedPath);
                finalPath = url.pathname + url.search + url.hash;
              } else {
                // 如果是相对路径，直接使用
                finalPath = savedPath.startsWith('/') ? savedPath : `/${savedPath}`;
              }
              
              targetRoute = finalPath;
            } catch (error) {
              // 如果解析失败，使用原始值
              targetRoute = savedPath.startsWith('/') ? savedPath : `/${savedPath}`;
            }
          } else {
            // 没有保存的路径，导航到首页
            const { getMainAppHomeRoute } = await import('@btc/shared-core');
            const homeRoute = getMainAppHomeRoute() || '/workbench/overview';
            targetRoute = homeRoute;
          }
        }
        
        // 检查 router 是否可用
        if (!router) {
          return;
        }
        
        // 检查是否需要跨应用跳转
        const targetPathString = typeof targetRoute === 'string' ? targetRoute : targetRoute.path || '';
        const { handleCrossAppRedirect } = await import('@btc/shared-core/utils/redirect');
        const isCrossAppRedirect = await handleCrossAppRedirect(targetPathString, router);
        
        if (isCrossAppRedirect) {
          // 如果是跨应用跳转，handleCrossAppRedirect 已经处理了跳转，直接返回
          return;
        }
        
        // 使用 nextTick 确保所有状态更新完成
        await import('vue').then(({ nextTick }) => nextTick());
        
        // 额外等待一小段时间，确保路由系统完全准备好
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 使用 replace 避免在历史记录中留下登录页
        // 关键：使用 router.replace({ path, query }) 对象形式，确保 Vue Router 正确处理
        // 这样可以避免页面刷新，保持 SPA 无刷新特性
        try {
          await router.replace(targetRoute);
        } catch (error) {
          // 如果失败，尝试导航到首页（兜底方案）
          try {
            const { getMainAppHomeRoute } = await import('@btc/shared-core');
            const homeRoute = getMainAppHomeRoute() || '/workbench/overview';
            await router.push(homeRoute);
          } catch (importError) {
            // 兜底跳转也失败，静默处理
          }
        }
      } catch (error) {
        // 导航逻辑执行失败，静默处理
      }
    } catch (error: any) {
      BtcMessage.error(error.message || t('登录失败'));
      throw error;
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
