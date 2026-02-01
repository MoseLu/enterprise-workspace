// 注册主页面类型定义

export interface RegisterMainProps {
  // 可以添加需要的props
}

export interface RegisterMainState {
  selectedTenant: string | any;
}

export interface RegisterMainActions {
  handleTenantSelected: (tenant: string | any) => void;
  handleNextStep: () => void;
}
