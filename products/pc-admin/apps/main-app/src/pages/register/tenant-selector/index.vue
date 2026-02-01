<template>
  <div class="tenant-selector">
    <!-- 顶部提示 -->
    <div class="tenant-header">
      <h3 class="tenant-header-title">选择注册类型</h3>
      <p class="tenant-header-description">请选择您要注册的账户类型</p>
    </div>

    <!-- 租户选项 -->
    <div class="tenant-options">
      <div
        v-for="tenant in tenantOptions"
        :key="tenant.value"
        class="tenant-card"
        :class="{ 'is-selected': isSelected(tenant) }"
        @click="selectTenant(tenant)"
      >
        <div class="tenant-icon">
          <el-icon :size="24">
            <component :is="tenant.icon" />
          </el-icon>
        </div>
        <div class="tenant-info">
          <h3 class="tenant-title">{{ tenant.title }}</h3>
          <p class="tenant-description">{{ tenant.description }}</p>
        </div>
        <div class="tenant-selector-indicator">
          <el-icon v-if="isSelected(tenant)">
            <Check />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="tenant-footer">
      <el-button type="primary" :disabled="!selectedTenant" @click="handleNext">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, OfficeBuilding, Connection, Van } from '@element-plus/icons-vue'

interface TenantOption {
  value: string
  title: string
  description: string
  icon: any
}

defineOptions({
  name: 'TenantSelector'
})

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'next': []
}>()

// 租户选择列表
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
const selectedTenant = ref<string>(props.modelValue || '')

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  selectedTenant.value = val || ''
})

// 判断是否选中
const isSelected = (tenant: TenantOption) => {
  return selectedTenant.value === tenant.value
}

// 选择租户
const selectTenant = (tenant: TenantOption) => {
  selectedTenant.value = tenant.value
  emit('update:modelValue', tenant.value)
}

// 下一步
const handleNext = () => {
  if (selectedTenant.value) {
    emit('next')
  }
}
</script>

<style lang="scss">
@use './styles.scss';
</style>
