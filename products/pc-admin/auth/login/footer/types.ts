// 登录页面底部组件类型定义

export interface FooterProps {
  app: {
    info: {
      name: string;
    };
  };
  t: (key: string, params?: any) => string;
}

export interface FooterState {
  app: {
    info: {
      name: string;
    };
  };
}
