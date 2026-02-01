// 密码登录表单类型定义

export interface PasswordFormProps {
  form: {
    username: string;
    password: string;
  };
  loading: boolean;
  rules: any;
  submit: () => void;
}

export interface PasswordFormState {
  form: {
    username: string;
    password: string;
  };
  loading: boolean;
}

export interface PasswordFormActions {
  submit: () => void;
}
