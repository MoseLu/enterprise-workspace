;
import { ref, reactive, nextTick } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { http } from '@/utils/http';
import { useUser } from '@/composables/useUser';
import { appStorage } from '@/utils/app-storage';

export function useLogin() {
  const router = useRouter();
  const { setUserInfo } = useUser();
  const { t } = useI18n();

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

  // 表单验证规则
  const rules = {
    username: [
      { required: true, message: t('请输入用户名或邮箱'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('请输入密码'), trigger: 'blur' }
    ]
  };

  // 提交登录
  const submit = async () => {
    // 基础验证
    if (!form.username) {
      BtcMessage.error(t('用户名不能为空'));
      return;
    }

    if (!form.password) {
      BtcMessage.error(t('密码不能为空'));
      return;
    }

    try {
      loading.value = true;

      // 调用登录接口
      const response = await http.post<{
        token: string;
        refreshToken?: string;
        expiresIn?: number;
        user?: any;
      }>('/base/open/login', {
        username: form.username,
        password: form.password
      });

      if (response) {
        BtcMessage.success(t('登录成功'));

        // 保存 token 到 cookie（不再保存到 localStorage）
        if (response.token) {
          // 清理旧的 localStorage 键（迁移）
          appStorage.auth.setToken(response.token);
          
          // 设置 cookie
          const { setCookie, getCookieDomain } = await import('@/utils/cookie');
          const isHttps = window.location.protocol === 'https:';
          setCookie('access_token', response.token, 7, {
            sameSite: isHttps ? 'None' : undefined,
            secure: isHttps,
            path: '/',
            domain: getCookieDomain(),
          });
          
          // 如果有 refreshToken，保存到 cookie（不再保存到 localStorage）
          if (response.refreshToken) {
            setCookie('refresh_token', response.refreshToken, 7, {
              sameSite: isHttps ? 'None' : undefined,
              secure: isHttps,
              path: '/',
              domain: getCookieDomain(),
            });
          }
        }

        // 保存用户信息（使用后端返回的准确数据）
        if (response.user) {
          // 处理用户信息：删除 name 字段，将 name 的值赋给 username（使用后端权威值）
          const userData = { ...response.user };
          if (userData.name) {
            userData.username = userData.name; // 使用后端返回的 name 作为 username
            delete userData.name; // 删除 name 字段
          }
          // 使用 appStorage.user.set 确保同时更新 localStorage 和 cookie
          appStorage.user.set(userData);
        }

        // 使用 nextTick 确保状态更新
        await nextTick();

        // 启动用户检查轮询（登录后强制立即检查，获取最新的剩余时间）
        try {
          const { startUserCheckPolling } = await import('@btc/shared-core/composables/user-check');
          startUserCheckPolling(true);
        } catch (error) {
          console.warn('[useLogin] Failed to start user check polling:', error);
        }
        // 已删除：登录成功后不再进行任何重定向，停留在登录页
        if (import.meta.env.DEV) {
          console.log('[useLogin] ✅ 登录成功，已禁用所有重定向逻辑，停留在登录页');
        }
      } else {
        BtcMessage.error(t('登录失败'));
      }
    } catch (error: any) {
      // 安全地记录错误信息
      const errorInfo = {
        message: error.message || 'Unknown error',
        response: error.response
      };
      console.error('登录错误:', errorInfo);
      BtcMessage.error(error.message || t('登录失败'));
      
      // 返回错误，让调用方刷新验证码
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    loading,
    rules,
    submit
  };
}

