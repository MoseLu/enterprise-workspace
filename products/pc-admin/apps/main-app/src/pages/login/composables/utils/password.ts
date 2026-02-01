/**
 * 密码登录相关工具函数
 */

import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { validatePasswordStrength } from '../../../auth/shared/composables/validation';
import { passwordLogin } from '../../../auth/shared/composables/api';

/**
 * 密码登录表单数据
 */
export interface PasswordLoginForm {
  username: string;
  password: string;
  captcha?: string;
  rememberMe?: boolean;
}

/**
 * 创建密码登录表单
 * @param initialData 初始数据
 * @returns 密码登录表单对象
 */
export function createPasswordLoginForm(initialData: Partial<PasswordLoginForm> = {}) {
  const form = reactive<PasswordLoginForm>({
    username: '',
    password: '',
    captcha: '',
    rememberMe: false,
    ...initialData
  });

  return {
    form
  };
}

/**
 * 密码登录验证规则
 */
export function createPasswordLoginRules() {
  return {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: Function) => {
          if (!validatePasswordStrength(value)) {
            callback(new Error('密码格式不正确'));
          } else {
            callback();
          }
        },
        trigger: 'blur'
      }
    ]
  };
}

/**
 * 密码登录处理函数
 * @param form 登录表单
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns 登录处理函数
 */
export function createPasswordLoginHandler(
  form: PasswordLoginForm,
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void
) {
  const loading = ref(false);

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      BtcMessage.warning('请填写完整的登录信息');
      return;
    }

    try {
      loading.value = true;
      const response = await passwordLogin({
        username: form.username,
        password: form.password,
        captcha: form.captcha,
        rememberMe: form.rememberMe
      });

      if (response.code === 2000) {
        BtcMessage.success('登录成功');
        onSuccess?.(response.data);
      } else {
        BtcMessage.error(response.msg || '登录失败');
        onError?.(response);
      }
    } catch (error: any) {
      BtcMessage.error(error.message || '登录失败，请重试');
      onError?.(error);
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    handleLogin
  };
}
