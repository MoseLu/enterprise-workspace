import type { Ref } from 'vue';
import { BtcMessage, BtcButton } from '@btc/shared-components';
import BtcSmsCodeInput from '@/pages/auth/shared/components/sms-code-input/index.vue';
import type { PhoneSmsState } from './phoneVerification';

interface FieldConfigContext {
  phoneUpdateSmsCodeState: PhoneSmsState;
  sendUpdateEmailCode: (email: string) => Promise<void>;
  emailUpdateCountdown: Ref<number>;
  emailUpdateSending: Ref<boolean>;
}

interface FieldItemConfig {
  prop: string;
  label: string;
  span: number;
  required?: boolean;
  component: Record<string, any>;
  rules?: any[];
}

interface FieldConfigResult {
  label: string;
  items: FieldItemConfig[];
}

const singleFieldConfig: Record<string, FieldItemConfig> = {
  realName: {
    prop: 'realName',
    label: '姓名',
    span: 24,
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入姓名'
      }
    }
  },
  name: {
    prop: 'name',
    label: '英文名',
    span: 24,
    required: true,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入英文名'
      }
    }
  },
  position: {
    prop: 'position',
    label: '职位',
    span: 24,
    component: {
      name: 'el-input',
      props: {
        placeholder: '请输入职位'
      }
    }
  }
};

function createEmailItems({
  sendUpdateEmailCode,
  emailUpdateCountdown,
  emailUpdateSending
}: FieldConfigContext): FieldItemConfig[] {
  return [
    {
      prop: 'email',
      label: '新邮箱',
      span: 24,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入新邮箱'
        },
        slots: {
          suffix: ({ scope }: any) => h(BtcButton as any, {
            link: true,
            size: 'small',
            disabled: emailUpdateCountdown.value > 0 || emailUpdateSending.value || !scope.email,
            loading: emailUpdateSending.value,
            onClick: async () => {
              await sendUpdateEmailCode(scope.email);
            }
          }, () => emailUpdateCountdown.value > 0 ? `${emailUpdateCountdown.value}s` : '获取验证码')
        }
      },
      rules: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
      ]
    },
    {
      prop: 'emailCode',
      label: '验证码',
      span: 24,
      required: true,
      component: {
        vm: markRaw(BtcSmsCodeInput),
        props: {}
      },
      rules: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码长度为6位', trigger: 'blur' }
      ]
    }
  ];
}

function createPhoneItems({ phoneUpdateSmsCodeState }: FieldConfigContext): FieldItemConfig[] {
  return [
    {
      prop: 'phone',
      label: '新手机号',
      span: 24,
      required: true,
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入新手机号'
        },
        slots: {
          suffix: ({ scope }: any) => h(BtcButton as any, {
            link: true,
            size: 'small',
            disabled: !phoneUpdateSmsCodeState.canSend.value || !scope.phone,
            loading: phoneUpdateSmsCodeState.sending.value,
            onClick: async () => {
              if (!scope.phone || !/^1[3-9]\d{9}$/.test(scope.phone)) {
                BtcMessage.warning('请输入正确的手机号');
                return;
              }
              await phoneUpdateSmsCodeState.send(scope.phone, 'bind');
            }
          }, () => phoneUpdateSmsCodeState.countdown.value > 0 ? `${phoneUpdateSmsCodeState.countdown.value}s` : '获取验证码')
        }
      },
      rules: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
      ]
    },
    {
      prop: 'smsCode',
      label: '验证码',
      span: 24,
      required: true,
      component: {
        vm: markRaw(BtcSmsCodeInput),
        props: {}
      },
      rules: [
        { required: true, message: '请输入验证码', trigger: 'blur' },
        { len: 6, message: '验证码长度为6位', trigger: 'blur' }
      ]
    }
  ];
}

const passwordItems: FieldItemConfig[] = [
  {
    prop: 'initPass',
    label: '新密码',
    span: 24,
    required: true,
    component: {
      name: 'el-input',
      props: {
        type: 'password',
        placeholder: '请输入新密码',
        showPassword: true
      }
    },
    rules: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ]
  },
  {
    prop: 'confirmPassword',
    label: '确认密码',
    span: 24,
    required: true,
    component: {
      name: 'el-input',
      props: {
        type: 'password',
        placeholder: '请再次输入新密码',
        showPassword: true
      }
    },
    rules: [
      { required: true, message: '请确认密码', trigger: 'blur' },
      {
        validator: (_rule: any, _value: any, callback: any) => {
          callback();
        },
        trigger: 'blur'
      }
    ]
  }
];

export function resolveFieldConfig(
  field: string,
  context: FieldConfigContext
): FieldConfigResult | null {
  if (singleFieldConfig[field]) {
    return {
      label: singleFieldConfig[field].label,
      items: [singleFieldConfig[field]]
    };
  }

  if (field === 'email') {
    return {
      label: '邮箱',
      items: createEmailItems(context)
    };
  }

  if (field === 'phone') {
    return {
      label: '手机号',
      items: createPhoneItems(context)
    };
  }

  if (field === 'initPass') {
    return {
      label: '密码',
      items: passwordItems
    };
  }

  return null;
}

export type FieldConfig = FieldConfigResult;

