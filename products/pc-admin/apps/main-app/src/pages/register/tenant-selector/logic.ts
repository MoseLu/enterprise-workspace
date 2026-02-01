// 租户选择器逻辑处理

import { ref, Ref } from 'vue'
import { OfficeBuilding, Connection, Van } from '@element-plus/icons-vue'
import { TenantOption } from './types'

export function useTenantSelector(emit: any) {
  // 租户选项配置
  const tenantOptions: TenantOption[] = [
    {
      value: 'INERT',
      title: 'BTC员工',
      description: '拜里斯科技员工注册',
      icon: OfficeBuilding
    },
    {
      value: 'SUPPLIER',
      title: '供应商',
      description: 'BTC供应商注册',
      icon: Van
    },
    {
      value: 'UK-HEAD',
      title: 'ITL',
      description: '',
      icon: Connection
    }
  ]

  // 响应式数据
  const selectedTenant = ref<string>('')

  // 判断是否选中
  const isSelected = (tenant: TenantOption) => {
    return selectedTenant.value === tenant.value
  }

  // 选择租户
  const selectTenant = (tenant: TenantOption) => {
    selectedTenant.value = tenant.value
    emit('tenant-selected', tenant.value)
  }

  return {
    selectedTenant,
    tenantOptions,
    isSelected,
    selectTenant
  }
}
