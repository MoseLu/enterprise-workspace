// 登录页面类型定义

export interface LoginForm {
  username: string;
  password: string;
}

export interface SmsForm {
  phone: string;
  smsCode: string;
}

export type LoginMode = 'password' | 'sms' | 'qr';

export interface LoginState {
  currentLoginMode: LoginMode;
  isSaving: boolean;
  toggleIcon: any;
  toggleLabel: string;
}

export interface LoginActions {
  handleSwitchLoginMode: (mode: LoginMode) => void;
  toggleQrLogin: () => void;
  passwordSubmit: () => void;
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: (code: string) => void;
  onLogin: () => void;
  refreshQrCode: () => void;
}

export interface LoginProps extends LoginState, LoginActions {
  t: (key: string, params?: any) => string;
  app: any;
  passwordForm: LoginForm;
  passwordLoading: boolean;
  passwordRules: any;
  smsForm: SmsForm;
  smsSaving: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
  qrCodeUrl: string;
}

export interface LoginMainProps {
  currentLoginMode: 'password' | 'sms' | 'qr';
  isSaving: boolean;
  toggleIcon: any;
  toggleLabel: string;
  handleSwitchLoginMode: (mode: 'password' | 'sms' | 'qr') => void;
  toggleQrLogin: () => void;
  t: (key: string, params?: any) => string;
  app: any;
  // Password login props
  passwordForm: any;
  passwordLoading: boolean;
  passwordRules: any;
  passwordSubmit: () => void;
  // SMS login props
  smsForm: any;
  smsSaving: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: (code: string) => void;
  onLogin: () => void;
  // QR login props
  qrCodeUrl: string;
  refreshQrCode: () => void;
}
