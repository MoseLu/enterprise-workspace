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
      <el-button @click="handleBack">返回</el-button>
      <el-button type="primary" :disabled="!selectedTenant" @click="handleNext">下一步</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check, OfficeBuilding, Connection, Van } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

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
  'back': []
}>()

const router = useRouter()

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

// 返回
const handleBack = () => {
  router.push('/login?from=register')
}

// 下一步
const handleNext = () => {
  if (selectedTenant.value) {
    emit('next')
  }
}
</script>

<style lang="scss" scoped>
.tenant-selector {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .tenant-header {
    text-align: center;
    margin-bottom: 24px;

    &-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 8px 0;
    }

    &-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin: 0;
    }
  }

  .tenant-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    justify-content: center;
    padding: 0;

    .tenant-card {
      background: var(--el-bg-color);
      border: 2px solid var(--el-border-color-light);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      &:hover {
        border-color: var(--el-color-primary);
        background: var(--el-bg-color);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
        transform: translateY(-1px);
      }

      &.is-selected {
        border-color: var(--el-color-primary);
        background: var(--el-bg-color);
        box-shadow: 0 4px 16px rgba(64, 158, 255, 0.25);
        transform: translateY(-1px);

        .tenant-icon {
          color: var(--el-color-primary);
        }

        .tenant-title {
          color: var(--el-color-primary);
        }

        .tenant-description {
          color: var(--el-color-primary);
        }
      }
    }

    .tenant-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
      color: var(--el-text-color-secondary);
      font-size: 28px;
      transition: color 0.2s ease;
    }

    .tenant-info {
      text-align: center;

      .tenant-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 6px 0;
        transition: color 0.2s ease;
      }

      .tenant-description {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin: 0;
        line-height: 1.4;
        transition: color 0.2s ease;
      }
    }

    .tenant-selector-indicator {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--el-color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      opacity: 0;
      transition: all 0.2s ease;
      box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
      z-index: 10;
    }

    .tenant-card.is-selected .tenant-selector-indicator {
      opacity: 1 !important;
      transform: scale(1.1);
    }
  }

  .tenant-footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--el-border-color-light);

    .el-button {
      flex: 1;
      height: 40px;
      font-size: 15px;
      
      &.is-disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .tenant-selector {
    .tenant-options {
      gap: 16px;

      .tenant-card {
        padding: 20px;
      }
    }
  }
}
</style>
