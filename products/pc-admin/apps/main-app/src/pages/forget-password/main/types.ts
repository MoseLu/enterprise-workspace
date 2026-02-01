// 忘记密码主页面类型定义

export interface ForgetPasswordMainProps {
  // 可以添加需要的props
}

export interface ForgetPasswordMainState {
  formData: any;
  loading: boolean;
  smsCountdown: number;
  hasSentSms: boolean;
  phoneError: string;
  isPhoneValid: boolean;
  canReset: boolean;
}

export interface ForgetPasswordMainActions {
  validatePhone: () => void;
  sendSmsCode: () => void;
  handlePhoneEnter: () => void;
  onCodeComplete: (code: string) => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  handleStepChange: (step: number) => void;
  handleFinish: () => void;
}
