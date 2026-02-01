;
import { ref, reactive, computed } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { http } from '@/utils/http';
import { zodToElementPlusRules } from '@btc/shared-core/utils/form/zod-validator';
import { registerFormFieldSchemas, createConfirmPasswordSchema } from '../schemas/register-form.schema';

export function useRegister() {
  const router = useRouter();
  const { t } = useI18n();

  const form = reactive({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const loading = ref(false);

  // 使用 Zod schema 生成验证规则
  const rules = computed(() => ({
    username: zodToElementPlusRules(registerFormFieldSchemas.username, t('auth.form.username') || '用户名'),
    phone: zodToElementPlusRules(registerFormFieldSchemas.phone, t('auth.form.phone') || '手机号'),
    password: zodToElementPlusRules(registerFormFieldSchemas.password, t('auth.form.password') || '密码'),
    confirmPassword: zodToElementPlusRules(
      createConfirmPasswordSchema(form.password),
      t('auth.form.confirm_password') || '确认密码'
    ),
  }));

  const register = async (formRef: any) => {
    if (!formRef) return;
    try {
      loading.value = true;
      await formRef.validate();

      // 调用注册 API
      await http.post('/base/open/register', {
        username: form.username,
        phone: form.phone,
        password: form.password
      });

      BtcMessage.success(t('auth.message.register_success'));
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login?from=register');
      }, 1500);
    } catch (error: any) {
      console.error('注册失败:', error);
      BtcMessage.error(error.message || t('auth.message.register_failed'));
    } finally {
      loading.value = false;
    }
  };

  return {
    form,
    rules,
    loading,
    register
  };
}

