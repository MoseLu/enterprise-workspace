// 短信登录表单类型定义

export interface SmsFormProps {
  form: {
    phone: string;
    smsCode: string;
  };
  saving: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: (code: string) => void;
  onLogin: () => void;
  t: (key: string) => string;
}

export interface SmsFormState {
  form: {
    phone: string;
    smsCode: string;
  };
  saving: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
}

export interface SmsFormActions {
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: (code: string) => void;
  onLogin: () => void;
}
