// 租户选择器类型定义

export interface TenantOption {
  value: string
  title: string
  description: string
  icon: any
}

export interface TenantSelectorProps {
  // 可以添加需要的props
}

export interface TenantSelectorState {
  selectedTenant: string | null
  tenantOptions: TenantOption[]
}

export interface TenantSelectorActions {
  isSelected: (tenant: TenantOption) => boolean
  selectTenant: (tenant: TenantOption) => void
}
