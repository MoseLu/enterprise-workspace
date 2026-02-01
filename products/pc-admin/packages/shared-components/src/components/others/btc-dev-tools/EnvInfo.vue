<template>
  <div class="env-info">
    <div class="env-info__header">
      <h3>系统信息</h3>
    </div>
    
    <div class="env-info__content">
      <div class="info-card">
        <div class="info-card__icon">
          <el-icon :size="24">
            <Monitor />
          </el-icon>
        </div>
        <div class="info-card__content">
          <div class="info-card__label">运行环境</div>
          <div class="info-card__value">
            <el-tag :type="envTagType" size="small" effect="dark">{{ envLabel }}</el-tag>
          </div>
        </div>
      </div>
      
      <div class="info-card">
        <div class="info-card__icon">
          <el-icon :size="24">
            <Grid />
          </el-icon>
        </div>
        <div class="info-card__content">
          <div class="info-card__label">当前应用</div>
          <div class="info-card__value">
            <el-tag type="info" size="small" effect="dark">{{ currentAppLabel }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Monitor, Grid } from '@element-plus/icons-vue';
import { useEnvInfo } from '@btc/shared-core';

// 使用统一的环境信息 composable
const { environment, currentApp: currentAppId } = useEnvInfo();

// 计算当前应用显示名称
const currentApp = computed(() => {
  return currentAppId.value || 'system';
});

const envLabel = computed(() => {
  const env = environment.value;
  const envMap: Record<string, string> = {
    development: '开发',
    preview: '预览',
    test: '测试',
    production: '生产',
  };
  return envMap[env] || env;
});

const envTagType = computed(() => {
  const env = environment.value;
  if (env === 'production') return 'warning';
  if (env === 'test') return 'warning';
  if (env === 'preview') return 'info';
  return 'success';
});

const currentAppLabel = computed(() => currentApp.value);

// useEnvInfo composable 已经自动处理了事件监听和更新逻辑，无需手动管理
</script>

<style lang="scss" scoped>
.env-info {
  padding: 20px;
  
  &__header {
    margin-bottom: 24px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      letter-spacing: 0.5px;
    }
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  
  &:hover {
    border-color: var(--el-border-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
    border-radius: 10px;
    color: var(--el-color-primary);
    flex-shrink: 0;
  }
  
  &__content {
    flex: 1;
    min-width: 0;
  }
  
  &__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  &__value {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }
}
</style>

