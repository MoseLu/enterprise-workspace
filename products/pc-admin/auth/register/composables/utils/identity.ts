/**
 * 身份验证相关工具函数
 */

import { ref, reactive } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { ensureString } from '../../shared/composables/validation';
import { verifyEmployeeIdentity } from '../../shared/composables/api';

/**
 * 身份验证表单数据
 */
export interface IdentityForm {
  empId: string;
  initPassword?: string;
  smsCode?: string;
}

/**
 * 员工信息
 */
export interface EmployeeInfo {
  empId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  sessionId: string;
}

/**
 * 创建身份验证表单
 * @param initialData 初始数据
 * @returns 身份验证表单对象
 */
export function createIdentityForm(initialData: Partial<IdentityForm> = {}) {
  const form = reactive<IdentityForm>({
    empId: '',
    initPassword: '',
    smsCode: '',
    ...initialData
  });

  return {
    form
  };
}

/**
 * 身份验证验证规则
 */
export function createIdentityRules() {
  return {
    empId: [
      { required: true, message: '请输入企业邮箱前缀', trigger: 'blur' },
      {
        pattern: /^[a-zA-Z0-9._-]+$/,
        message: '企业邮箱前缀只能包含字母、数字、点、下划线和连字符',
        trigger: 'blur'
      }
    ],
    initPassword: [
      { required: false, message: '请输入初始密码', trigger: 'blur' }
    ],
    smsCode: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { len: 6, message: '验证码长度为6位', trigger: 'blur' }
    ]
  };
}

/**
 * 创建身份验证处理函数
 * @param form 身份验证表单
 * @param onSuccess 成功回调
 * @param onError 错误回调
 * @returns 身份验证处理对象
 */
export function createIdentityVerifier(
  form: IdentityForm,
  onSuccess?: (employeeInfo: EmployeeInfo) => void,
  onError?: (error: any) => void
) {
  const verifying = ref(false);
  const verifyError = ref('');
  const employeeInfo = ref<EmployeeInfo | null>(null);

  const verifyIdentity = async () => {
    if (!form.empId || !form.initPassword) {
      BtcMessage.warning('请填写完整的身份验证信息');
      return;
    }

    try {
      verifying.value = true;
      verifyError.value = '';

      const response = await verifyEmployeeIdentity(form.empId, form.initPassword);

      if (response.code === 2000) {
        // 验证成功，设置员工信息
        const info: EmployeeInfo = {
          empId: form.empId,
          name: response.data.name || '未知',
          department: response.data.department || '未知部门',
          position: response.data.position || '未知职位',
          email: response.data.email || '',
          phone: response.data.phone || '',
          sessionId: response.data.sessionId || ''
        };

        employeeInfo.value = info;
        BtcMessage.success('身份验证成功！');
        onSuccess?.(info);
      } else {
        // 验证失败
        verifyError.value = response.msg || '工号验证失败';
        BtcMessage.error(response.msg || '工号验证失败');
        onError?.(response);
      }
    } catch (error: any) {
      verifyError.value = error.msg || '验证失败，请重试';
      BtcMessage.error(error.msg || '验证失败，请重试');
      onError?.(error);
    } finally {
      verifying.value = false;
    }
  };

  return {
    verifying,
    verifyError,
    employeeInfo,
    verifyIdentity
  };
}
