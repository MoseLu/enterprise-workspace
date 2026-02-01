<template>
  <div class="page">
    <!-- 顶部工具栏 -->
    <div class="inventory-process__toolbar">
      <!-- 左侧：刷新按钮 -->
      <div class="inventory-process__toolbar-left">
        <BtcTableButton
          v-if="isMinimal"
          :config="refreshButtonConfig"
        />
        <el-button
          v-else
          class="btc-crud-btn"
          :loading="loading"
          @click="loadProcesses"
        >
          <BtcSvg class="btc-crud-btn__icon" name="refresh" />
          <span class="btc-crud-btn__text">刷新</span>
        </el-button>
      </div>

      <!-- 右侧：搜索和筛选 -->
      <div class="inventory-process__toolbar-right">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索流程名称..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="statusFilter"
          placeholder="筛选状态"
          clearable
          style="width: 150px"
        >
          <el-option label="全部" value="" />
          <el-option label="待开始" value="pending" />
          <el-option label="进行中" value="running" />
          <el-option label="暂停中" value="paused" />
          <el-option label="已结束" value="completed" />
        </el-select>
      </div>
    </div>

    <!-- 流程卡片列表 -->
    <div v-loading="loading" class="inventory-process__grid">
      <BtcProcessCard
        v-for="process in filteredProcesses"
        :key="process.id"
        :process="process"
        @start="handleStart"
        @pause="handlePause"
        @resume="handleResume"
        @end="handleEnd"
        @view-detail="handleViewDetail"
      />
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="!loading && filteredProcesses.length === 0"
      description="暂无流程数据"
      class="inventory-process__empty"
    />

    <!-- 详情对话框 -->
    <BtcDialog
      v-model="detailVisible"
      title="流程详情"
      width="800px"
    >
      <div v-loading="detailLoading">
        <el-descriptions v-if="detailData" :column="2" border>
          <el-descriptions-item label="盘点编号">
            {{ detailData.checkNo || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="域ID">
            {{ detailData.domainId || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="盘点类型">
            {{ detailData.checkType || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="盘点状态">
            {{ detailData.checkStatus || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="计划开始时间">
            {{ detailData.startTime ? formatDateTime(detailData.startTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="计划结束时间">
            {{ detailData.endTime ? formatDateTime(detailData.endTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="盘点人">
            {{ detailData.checker || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="剩余时长">
            {{ detailData.remainingSeconds ? `${Math.floor(detailData.remainingSeconds / 60)}分钟` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ detailData.remark || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ detailData.createdAt ? formatDateTime(detailData.createdAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="更新时间">
            {{ detailData.updateAt ? formatDateTime(detailData.updateAt) : '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </BtcDialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { BtcProcessCard, BtcSvg, BtcTableButton, BtcDialog } from '@btc/shared-components';
import { useThemePlugin } from '@btc/shared-core';
import { formatDateTime } from '@btc/shared-utils';
import { useInventoryProcess } from '@/modules/data/composables/useInventoryProcess';
import type { ProcessManagementItem } from '@btc/shared-components';

// 临时类型定义，等待 @btc/shared-components 导出
interface BtcTableButtonConfig {
  icon: string | (() => string);
  tooltip?: string | (() => string);
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  onClick?: (event?: MouseEvent) => void;
  disabled?: boolean;
  size?: number;
  badge?: number;
  ariaLabel?: string | (() => string);
  class?: string | string[];
  label?: string | (() => string);
  showLabel?: boolean;
}

defineOptions({
  name: 'BtcDataInventoryProcess',
});

const {
  loading,
  searchKeyword,
  statusFilter,
  filteredProcesses,
  loadProcesses,
  startProcess,
  pauseProcess,
  resumeProcess,
  endProcess,
  viewProcessDetail,
  detailVisible,
  detailLoading,
  detailData,
} = useInventoryProcess();

const handleStart = (process: ProcessManagementItem) => {
  startProcess(process);
};

const handlePause = (process: ProcessManagementItem) => {
  pauseProcess(process);
};

const handleResume = (process: ProcessManagementItem) => {
  resumeProcess(process);
};

const handleEnd = (process: ProcessManagementItem) => {
  endProcess(process);
};

const handleViewDetail = (process: ProcessManagementItem) => {
  viewProcessDetail(process);
};

// 按钮样式切换
const theme = useThemePlugin();
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

// 刷新按钮配置（minimal 模式）
const refreshButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'refresh',
  tooltip: '刷新',
  ariaLabel: '刷新',
  type: 'default',
  onClick: () => {
    if (!loading.value) {
      loadProcesses();
    }
  },
  disabled: loading.value,
}));
</script>

<style lang="scss" scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.inventory-process__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  flex-shrink: 0;

  &-left {
    display: flex;
    align-items: center;
  }

  &-right {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

.inventory-process__grid {
  flex: 1 1 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 10px;
  min-height: 0;
  align-content: start;
  overflow: visible;
  padding: 10px;
}

.inventory-process__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .inventory-process__grid {
    grid-template-columns: 1fr;
  }
}
</style>

