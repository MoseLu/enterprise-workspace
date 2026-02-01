// 二维码登录表单类型定义

export interface QrFormProps {
  qrCodeUrl: string;
  refreshQrCode: () => void;
  t: (key: string) => string;
}

export interface QrFormState {
  qrCodeUrl: string;
}

export interface QrFormActions {
  refreshQrCode: () => void;
}
