<template>
  <div class="execution-detail-panel">
    <el-row :gutter="16">
      <!-- 执行概览 -->
      <el-col :span="12">
        <el-card title="执行概览">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="执行ID">
              {{ execution.executionId }}
            </el-descriptions-item>
            <el-descriptions-item label="策略ID">
              {{ execution.strategyId }}
            </el-descriptions-item>
            <el-descriptions-item label="策略效果">
              <el-tag :type="getEffectTagType(execution.effect)" size="small">
                {{ execution.effect }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行状态">
              <el-tag :type="execution.success ? 'success' : 'danger'" size="small">
                {{ execution.success ? '成功' : '失败' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="执行时间">
              {{ execution.executionTime }}ms
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">
              {{ formatTime(execution.metadata.startTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="结束时间">
              {{ formatTime(execution.metadata.endTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="策略版本">
              {{ execution.metadata.version }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 执行统计 -->
      <el-col :span="12">
        <el-card title="执行统计">
          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-icon total">
                <el-icon><List /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ execution.steps.length }}</div>
                <div class="stat-label">总步骤数</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon success">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ successSteps }}</div>
                <div class="stat-label">成功步骤</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon failed">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ failedSteps }}</div>
                <div class="stat-label">失败步骤</div>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon duration">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ avgStepDuration }}ms</div>
                <div class="stat-label">平均步骤时间</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 执行步骤详情 -->
    <el-row style="margin-top: 16px;">
      <el-col :span="24">
        <el-card title="执行步骤详情">
          <el-timeline>
            <el-timeline-item
              v-for="(step, index) in execution.steps"
              :key="step.nodeId"
              :type="getStepType(step)"
              :timestamp="formatStepTime(step.duration)"
            >
              <div class="step-content">
                <div class="step-header">
                  <h4 class="step-title">
                    {{ step.nodeName }}
                    <el-tag size="small" :type="step.executed ? 'success' : 'info'">
                      {{ step.executed ? '已执行' : '跳过' }}
                    </el-tag>
                  </h4>
                  <div class="step-meta">
                    <span class="step-index">步骤 {{ index + 1 }}</span>
                    <span class="step-duration">{{ step.duration }}ms</span>
                  </div>
                </div>

                <div v-if="step.result" class="step-result">
                  <h5>执行结果</h5>
                  <pre class="result-json">{{ JSON.stringify(step.result, null, 2) }}</pre>
                </div>

                <div v-if="step.error" class="step-error">
                  <h5>错误信息</h5>
                  <div class="error-message">{{ step.error }}</div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 输入输出数据 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card title="输出数据">
          <pre class="data-json">{{ JSON.stringify(execution.output, null, 2) }}</pre>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card title="错误信息">
          <div v-if="execution.error" class="error-details">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="错误代码">
                {{ execution.error.code }}
              </el-descriptions-item>
              <el-descriptions-item label="错误消息">
                {{ execution.error.message }}
              </el-descriptions-item>
              <el-descriptions-item v-if="execution.error.details" label="详细信息">
                <pre class="error-json">{{ JSON.stringify(execution.error.details, null, 2) }}</pre>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <BtcEmpty v-else description="无错误信息" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  List,
  CircleCheckFilled,
  CircleCloseFilled,
  Timer
} from '@element-plus/icons-vue';
import type { StrategyExecutionResult } from '@/types/strategy';
import { BtcEmpty } from '@btc/shared-components';

// Props
interface Props {
  execution: StrategyExecutionResult;
}

const props = defineProps<Props>();

// 计算属性
const successSteps = computed(() => {
  return props.execution.steps.filter(step => step.executed && !step.error).length;
});

const failedSteps = computed(() => {
  return props.execution.steps.filter(step => step.error).length;
});

const avgStepDuration = computed(() => {
  const totalDuration = props.execution.steps.reduce((sum, step) => sum + step.duration, 0);
  return props.execution.steps.length > 0
    ? Math.round(totalDuration / props.execution.steps.length)
    : 0;
});

// 工具函数
const getEffectTagType = (effect: string) => {
  const effectMap = {
    'ALLOW': 'success',
    'DENY': 'danger',
    'CONDITIONAL': 'warning'
  };
  return effectMap[effect] || 'default';
};

const getStepType = (step: any) => {
  if (step.error) return 'danger';
  if (step.executed) return 'success';
  return 'info';
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const formatStepTime = (duration: number) => {
  return `${duration}ms`;
};
</script>

<style lang="scss" scoped>
.execution-detail-panel {
  .stats-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .stat-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background: var(--el-bg-color-page);
      border-radius: 6px;

      .stat-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        .el-icon {
          font-size: 18px;
          color: white;
        }

        &.total {
          background: #409eff;
        }

        &.success {
          background: #67c23a;
        }

        &.failed {
          background: #f56c6c;
        }

        &.duration {
          background: #e6a23c;
        }
      }

      .stat-info {
        .stat-value {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .step-content {
    .step-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .step-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .step-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;

        .step-index {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }

        .step-duration {
          font-size: 12px;
          font-weight: 600;
          color: var(--el-color-primary);
        }
      }
    }

    .step-result {
      margin-top: 12px;

      h5 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #67c23a;
      }

      .result-json {
        background: #f0f9ff;
        border: 1px solid #b3d8ff;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        margin: 0;
        max-height: 200px;
        overflow-y: auto;
      }
    }

    .step-error {
      margin-top: 12px;

      h5 {
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #f56c6c;
      }

      .error-message {
        background: #fef0f0;
        border: 1px solid #fbc4c4;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #f56c6c;
      }
    }
  }

  .data-json,
  .error-json {
    background: var(--el-bg-color-page);
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-light);
  }

  .error-details {
    .error-json {
      background: #fef0f0;
      border-color: #fbc4c4;
      color: #f56c6c;
    }
  }
}

@media (max-width: 768px) {
  .execution-detail-panel {
    .stats-container {
      grid-template-columns: 1fr;
    }

    .step-content {
      .step-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  }
}
</style>
