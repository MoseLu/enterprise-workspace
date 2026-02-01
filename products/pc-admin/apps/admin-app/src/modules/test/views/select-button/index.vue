<template>
  <div class="select-button-demo">
    <!-- 基础用法 -->
    <div class="demo-section">
      <h3>基础用法 - 状态筛选</h3>
      <div class="demo-row">
        <span class="demo-label">用户状态：</span>
        <BtcSelectButton v-model="status" :options="statusOptions" @change="handleStatusChange" />
        <span class="demo-result">{{ getStatusLabel(status) }}</span>
      </div>
    </div>

    <!-- 视图模式 -->
    <div class="demo-section">
      <h3>视图模式切换</h3>
      <div class="demo-row">
        <span class="demo-label">显示模式：</span>
        <BtcSelectButton v-model="viewMode" :options="viewModeOptions" />
        <span class="demo-result">{{ getViewModeLabel(viewMode) }}</span>
      </div>
    </div>

    <!-- 小尺寸 -->
    <div class="demo-section">
      <h3>小尺寸模式</h3>
      <div class="demo-row">
        <span class="demo-label">时间范围：</span>
        <BtcSelectButton v-model="timeRange" :options="timeRangeOptions" small />
        <span class="demo-result">{{ getTimeRangeLabel(timeRange) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, markRaw, shallowRef } from 'vue';
import { useMessage } from '@/utils/use-message';

defineOptions({
  name: 'SelectButtonTestPage',
});

const message = useMessage();

// 状态管理 - 使用 shallowRef 避免深层响应式
const status = shallowRef('all');
const viewMode = shallowRef('list');
const timeRange = shallowRef('today');

// 选项配置
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '启用', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

const viewModeOptions = [
  { label: '列表', value: 'list' },
  { label: '卡片', value: 'card' },
  { label: '时间线', value: 'timeline' },
];

const timeRangeOptions = [
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
];

// 方法
const handleStatusChange = (value: string) => {
  message.success(`状态已切换为: ${getStatusLabel(value)}`);
};

const getStatusLabel = (value: string) => {
  const option = statusOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getViewModeLabel = (value: string) => {
  const option = viewModeOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getTimeRangeLabel = (value: string) => {
  const option = timeRangeOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};
</script>

<style lang="scss" scoped>
.select-button-demo {
  padding: 20px;
}

.demo-section {
  margin-bottom: 25px;
  padding: 15px;
  background: var(--el-fill-color-light);
  border-radius: var(--el-border-radius-base);

  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  .demo-label {
    min-width: 80px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  .demo-result {
    margin-left: auto;
    padding: 4px 8px;
    background: var(--el-color-primary-light-9);
    border-radius: var(--el-border-radius-base);
    font-size: 12px;
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .demo-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;

    .demo-result {
      margin-left: 0;
    }
  }
}
</style>
