// 登录页面头部组件类型定义

export interface HeaderProps {
  app: {
    info: {
      name: string;
    };
  };
  toggleIcon: any;
  toggleLabel: string;
  toggleQrLogin: () => void;
}

export interface HeaderState {
  app: {
    info: {
      name: string;
    };
  };
}

export interface HeaderActions {
  toggleQrLogin: () => void;
}
