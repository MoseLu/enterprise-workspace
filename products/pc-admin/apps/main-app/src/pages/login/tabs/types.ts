// 登录标签页组件类型定义

export type LoginMode = 'password' | 'sms' | 'qr';

export interface TabsProps {
  currentLoginMode: LoginMode;
  handleSwitchLoginMode: (mode: LoginMode) => void;
  t: (key: string, params?: any) => string;
}

export interface TabsState {
  currentLoginMode: LoginMode;
}

export interface TabsActions {
  handleSwitchLoginMode: (mode: LoginMode) => void;
}
