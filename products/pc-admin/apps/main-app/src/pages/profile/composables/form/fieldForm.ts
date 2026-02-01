import type { Ref } from 'vue';

export function createFieldFormData(
  field: string,
  userInfo: Ref<any>,
  resetEmailUpdateCountdown: () => void
) {
  const baseData: Record<string, any> = {
    id: userInfo.value.id || ''
  };

  if (field === 'phone') {
    return {
      ...baseData,
      phone: '',
      smsCode: ''
    };
  }

  if (field === 'email') {
    resetEmailUpdateCountdown();
    return {
      ...baseData,
      email: '',
      emailCode: ''
    };
  }

  if (field === 'initPass') {
    return {
      ...baseData,
      initPass: '',
      confirmPassword: ''
    };
  }

  return {
    ...baseData,
    [field]: userInfo.value[field] || ''
  };
}

