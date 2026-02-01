/**
 * 注册表单相关工具函数
 */
;

import { ref, reactive, computed, watch } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { ensureString, validatePasswordStrength, validatePhone, validateSmsCode } from '../../shared/composables/validation';
import { sendSmsCode, registerUser } from '../../shared/composables/api';
import { createCountState } from '../../shared/composables/state';
import type { EmployeeInfo } from './identity';
// 导入 Zod 验证工具
import { zodToElementPlusRules } from '@btc/shared-core/utils/form/zod-validator';
import { registerFormFieldSchemas, createConfirmPasswordSchema } from '../../schemas/register-form.schema';

/**
 * 注册表单数据
 */
export interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  smsCode: string;
  realName: string;
  department: string;
  position: string;
}

/**
 * 创建注册表单
 * @param initialData 初始数据
 * @returns 注册表单对象
 */
export function createRegisterForm(initialData: Partial<RegisterForm> = {}) {
  const form = reactive<RegisterForm>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    smsCode: '',
    realName: '',
    department: '',
    position: '',
    ...initialData
  });

  // 监听表单字段变化，确保类型正确
  watch(() => form.password, (newVal) => {
    if (Array.isArray(newVal)) {
      form.password = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.confirmPassword, (newVal) => {
    if (Array.isArray(newVal)) {
      form.confirmPassword = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.phone, (newVal) => {
    if (Array.isArray(newVal)) {
      form.phone = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.smsCode, (newVal) => {
    if (Array.isArray(newVal)) {
      form.smsCode = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.email, (newVal) => {
    if (Array.isArray(newVal)) {
      form.email = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.username, (newVal) => {
    if (Array.isArray(newVal)) {
      form.username = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.realName, (newVal) => {
    if (Array.isArray(newVal)) {
      form.realName = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.department, (newVal) => {
    if (Array.isArray(newVal)) {
      form.department = ensureString(newVal);
    }
  }, { immediate: true });

  watch(() => form.position, (newVal) => {
    if (Array.isArray(newVal)) {
      form.position = ensureString(newVal);
    }
  }, { immediate: true });

  return {
    form
  };
}

/**
 * 注册表单验证规则（使用 Zod schema 生成）
 */
export function createRegisterRules(form: RegisterForm) {
  // 从 Zod schema 生成 Element Plus 规则
  return {
    password: zodToElementPlusRules(registerFormFieldSchemas.password, '系统登录密码'),
    confirmPassword: zodToElementPlusRules(
      createConfirmPasswordSchema(ensureString(form.password)),
      '确认密码'
    ),
    phone: zodToElementPlusRules(registerFormFieldSchemas.phone, '手机号'),
    smsCode: zodToElementPlusRules(registerFormFieldSchemas.smsCode, '短信验证码'),
  };
}

/**
 * 创建短信发送处理函数
 * @param form 注册表单
 * @returns 短信发送处理对象
 */
export function createRegisterSmsSender(form: RegisterForm) {
  const { count: smsCountdown, setCount: setSmsCountdown } = createCountState(0, 60);
  const sendingSms = ref(false);

  const canSendSms = computed(() => {
    const password = ensureString(form.password);
    const confirmPassword = ensureString(form.confirmPassword);
    const phone = ensureString(form.phone);

    // 必须按顺序填写：密码 -> 确认密码 -> 手机号
    return password && confirmPassword && phone && validatePhone(phone);
  });

  const handleSendSms = async () => {
    const password = ensureString(form.password);
    const confirmPassword = ensureString(form.confirmPassword);
    const phone = ensureString(form.phone);

    // 渐进式验证提示
    if (!password) {
      BtcMessage.warning('请先输入登录密码');
      return;
    }
    if (!confirmPassword) {
      BtcMessage.warning('请先确认密码');
      return;
    }
    if (!phone) {
      BtcMessage.warning('请先输入手机号');
      return;
    }
    if (!validatePhone(phone)) {
      BtcMessage.warning('请输入正确的手机号');
      return;
    }

    try {
      sendingSms.value = true;

      const response = await sendSmsCode(phone, 'register');

      if (response.code === 2000) {
        BtcMessage.success('验证码已发送');

        // 开始倒计时
        setSmsCountdown(60);
        const timer = setInterval(() => {
          if (smsCountdown.value > 0) {
            setSmsCountdown(smsCountdown.value - 1);
          } else {
            clearInterval(timer);
          }
        }, 1000);
      } else {
        BtcMessage.error(response.msg || '发送失败，请重试');
      }
    } catch (error: any) {
      BtcMessage.error(error.message || '发送失败，请重试');
    } finally {
      sendingSms.value = false;
    }
  };

  return {
    smsCountdown,
    sendingSms,
    canSendSms,
    handleSendSms
  };
}

/**
 * 创建字段禁用状态计算属性
 * @param form 注册表单
 * @returns 字段禁用状态
 */
export function createFieldDisabled(form: RegisterForm) {
  return computed(() => ({
    // 确认密码字段：只有密码填写后才能输入
    confirmPassword: !ensureString(form.password),
    // 手机号字段：只有密码和确认密码都填写后才能输入
    phone: !ensureString(form.password) || !ensureString(form.confirmPassword),
    // 短信验证码字段：只有手机号填写后才能输入
    smsCode: !ensureString(form.phone)
  }));
}

/**
 * 创建注册处理函数
 * @param form 注册表单
 * @param getSessionId 获取会话ID的函数
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns 注册处理对象
 */
export function createRegisterHandler(
  form: RegisterForm,
  getSessionId: () => string,
  onSuccess?: (data: any) => void,
  onError?: (error: any) => void
) {
  const registering = ref(false);

  const handleRegister = async () => {
    try {
      registering.value = true;

      const sessionId = getSessionId();
      if (!sessionId) {
        BtcMessage.error('会话已过期，请重新验证身份');
        onError?.({ msg: '会话已过期' });
        return;
      }

      const sanitizedData = {
        username: ensureString(form.username),
        password: ensureString(form.password),
        confirmPassword: ensureString(form.confirmPassword),
        email: ensureString(form.email),
        phone: ensureString(form.phone),
        realName: ensureString(form.realName),
        department: ensureString(form.department),
        position: ensureString(form.position),
        sessionId: sessionId, // 身份验证会话ID
        tenantId: 'INERT', // 内网员工租户ID
        depId: '001', // 默认部门ID
        avatar: ''
      };

      const response = await registerUser(sanitizedData);

      // 如果到达这里，说明请求成功（code === 2000）
      BtcMessage.success('注册成功！');
      onSuccess?.(response.data);
    } catch (error: any) {
      console.error('注册请求失败:', error);

      // 处理不同类型的错误
      let errorMessage = '注册过程中发生错误';
      let errorData = error;

      if (error.code && error.msg) {
        // 这是后端返回的业务错误
        errorMessage = error.msg;
        errorData = { code: error.code, msg: error.msg };
      } else if (error.message) {
        // 这是网络或其他错误
        errorMessage = error.message;
      }

      BtcMessage.error(errorMessage);
      onError?.(errorData);
    } finally {
      registering.value = false;
    }
  };

  return {
    registering,
    handleRegister
  };
}

/**
 * 自动填充员工信息到注册表单
 * @param form 注册表单
 * @param employeeInfo 员工信息
 */
export function fillEmployeeInfo(form: RegisterForm, employeeInfo: EmployeeInfo) {
  form.realName = ensureString(employeeInfo.name);
  form.department = ensureString(employeeInfo.department);
  form.position = ensureString(employeeInfo.position);
  form.email = ensureString(employeeInfo.email);
  form.phone = ensureString(employeeInfo.phone);
}
