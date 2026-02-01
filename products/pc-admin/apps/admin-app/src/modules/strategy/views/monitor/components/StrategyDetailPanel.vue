<template>
  <div class="strategy-detail-panel">
    <el-row :gutter="16">
      <!-- 基本信息 -->
      <el-col :span="12">
        <el-card title="基本信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="策略名称">
              {{ strategy.name }}
            </el-descriptions-item>
            <el-descriptions-item label="策略类型">
              <el-tag :type="getTypeTagType(strategy.type)" size="small">
                {{ getTypeLabel(strategy.type) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusTagType(strategy.status)" size="small">
                {{ getStatusLabel(strategy.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              {{ strategy.priority }}
            </el-descriptions-item>
            <el-descriptions-item label="版本">
              {{ strategy.version }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(strategy.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDate(strategy.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="创建人">
              {{ strategy.createdBy }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 执行统计 -->
      <el-col :span="12">
        <el-card title="执行统计">
          <div v-if="stats" class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ stats.execution.total }}</div>
              <div class="stat-label">总执行次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value success">{{ stats.execution.success }}</div>
              <div class="stat-label">成功次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value error">{{ stats.execution.failed }}</div>
              <div class="stat-label">失败次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ Math.round(stats.execution.avgDuration) }}ms</div>
              <div class="stat-label">平均执行时间</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.execution.maxDuration }}ms</div>
              <div class="stat-label">最大执行时间</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ stats.execution.minDuration }}ms</div>
              <div class="stat-label">最小执行时间</div>
            </div>
          </div>
          <BtcEmpty v-else description="暂无统计数据" :image-size="80" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <!-- 策略效果分布 -->
      <el-col :span="8">
        <el-card title="策略效果分布">
          <div v-if="stats" class="effect-stats">
            <div class="effect-item">
              <div class="effect-icon allow">
                <el-icon><CircleCheckFilled /></el-icon>
              </div>
              <div class="effect-info">
                <div class="effect-count">{{ stats.effects.allow }}</div>
                <div class="effect-label">允许</div>
              </div>
            </div>
            <div class="effect-item">
              <div class="effect-icon deny">
                <el-icon><CircleCloseFilled /></el-icon>
              </div>
              <div class="effect-info">
                <div class="effect-count">{{ stats.effects.deny }}</div>
                <div class="effect-label">拒绝</div>
              </div>
            </div>
            <div class="effect-item">
              <div class="effect-icon conditional">
                <el-icon><QuestionFilled /></el-icon>
              </div>
              <div class="effect-info">
                <div class="effect-count">{{ stats.effects.conditional }}</div>
                <div class="effect-label">条件性</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 性能指标 -->
      <el-col :span="8">
        <el-card title="性能指标">
          <div v-if="stats" class="performance-stats">
            <div class="perf-item">
              <div class="perf-label">吞吐量</div>
              <div class="perf-value">{{ stats.performance.throughput.toFixed(2) }} /s</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">错误率</div>
              <div class="perf-value error">{{ (stats.performance.errorRate * 100).toFixed(2) }}%</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">P95响应时间</div>
              <div class="perf-value">{{ stats.performance.p95Duration }}ms</div>
            </div>
            <div class="perf-item">
              <div class="perf-label">P99响应时间</div>
              <div class="perf-value">{{ stats.performance.p99Duration }}ms</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 标签信息 -->
      <el-col :span="8">
        <el-card title="标签信息">
          <div class="tags-container">
            <el-tag
              v-for="tag in strategy.tags"
              :key="tag"
              style="margin: 4px;"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
            <div v-if="strategy.tags.length === 0" class="no-tags">
              暂无标签
            </div>
          </div>

          <el-divider />

          <div class="description-section">
            <h4>策略描述</h4>
            <p v-if="strategy.description" class="description-text">
              {{ strategy.description }}
            </p>
            <p v-else class="no-description">
              暂无描述
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 策略配置详情 -->
    <el-row style="margin-top: 16px;">
      <el-col :span="24">
        <el-card title="策略配置详情">
          <el-tabs>
            <el-tab-pane label="规则配置" name="rules">
              <div v-if="strategy.rules && strategy.rules.length > 0">
                <div
                  v-for="(rule, index) in strategy.rules"
                  :key="rule.id"
                  class="config-item"
                >
                  <h5>规则 {{ index + 1 }}</h5>
                  <el-descriptions :column="1" size="small" border>
                    <el-descriptions-item label="表达式">
                      <code class="expression-code">{{ rule.expression }}</code>
                    </el-descriptions-item>
                    <el-descriptions-item label="变量">
                      <pre class="variables-json">{{ JSON.stringify(rule.variables, null, 2) }}</pre>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="rule.description" label="描述">
                      {{ rule.description }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
              <BtcEmpty v-else description="暂无规则配置" :image-size="80" />
            </el-tab-pane>

            <el-tab-pane label="条件配置" name="conditions">
              <div v-if="strategy.conditions && strategy.conditions.length > 0">
                <div
                  v-for="(condition, index) in strategy.conditions"
                  :key="condition.id"
                  class="config-item"
                >
                  <h5>条件 {{ index + 1 }}</h5>
                  <el-descriptions :column="2" size="small" border>
                    <el-descriptions-item label="字段">
                      {{ condition.field }}
                    </el-descriptions-item>
                    <el-descriptions-item label="操作符">
                      {{ condition.operator }}
                    </el-descriptions-item>
                    <el-descriptions-item label="值">
                      {{ condition.value }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="condition.logicalOperator" label="逻辑操作符">
                      {{ condition.logicalOperator }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
              <el-empty v-else description="暂无条件配置" :image-size="80" />
            </el-tab-pane>

            <el-tab-pane label="动作配置" name="actions">
              <div v-if="strategy.actions && strategy.actions.length > 0">
                <div
                  v-for="(action, index) in strategy.actions"
                  :key="action.id"
                  class="config-item"
                >
                  <h5>动作 {{ index + 1 }}</h5>
                  <el-descriptions :column="1" size="small" border>
                    <el-descriptions-item label="类型">
                      {{ action.type }}
                    </el-descriptions-item>
                    <el-descriptions-item label="参数">
                      <pre class="parameters-json">{{ JSON.stringify(action.parameters, null, 2) }}</pre>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="action.description" label="描述">
                      {{ action.description }}
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </div>
              <BtcEmpty v-else description="暂无动作配置" :image-size="80" />
            </el-tab-pane>

            <el-tab-pane label="执行配置" name="execution">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="执行引擎">
                  {{ strategy.execution?.engine || 'SYNC' }}
                </el-descriptions-item>
                <el-descriptions-item label="超时时间">
                  {{ strategy.execution?.timeout || 5000 }}ms
                </el-descriptions-item>
                <el-descriptions-item label="重试次数">
                  {{ strategy.execution?.retryCount || 3 }}
                </el-descriptions-item>
                <el-descriptions-item label="缓存启用">
                  {{ strategy.execution?.cacheEnabled ? '是' : '否' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  CircleCheckFilled,
  CircleCloseFilled,
  QuestionFilled
} from '@element-plus/icons-vue';
import type { Strategy, StrategyMonitorStats } from '@/types/strategy';
import { StrategyType, StrategyStatus } from '@/types/strategy';
import { BtcEmpty } from '@btc/shared-components';

// Props
interface Props {
  strategy: Strategy;
  stats: StrategyMonitorStats | null;
}

defineProps<Props>();

// 工具函数
const getTypeTagType = (type: StrategyType) => {
  const typeMap = {
    'PERMISSION': 'danger',
    'BUSINESS': 'success',
    'DATA': 'warning',
    'WORKFLOW': 'info'
  };
  return typeMap[type] || 'default';
};

const { t } = useI18n();
const getTypeLabel = (type: StrategyType) => {
  const labelMap = {
    'PERMISSION': t('common.strategy.types.permission'),
    'BUSINESS': t('common.strategy.types.business'),
    'DATA': t('common.strategy.types.data'),
    'WORKFLOW': t('common.strategy.types.workflow')
  };
  return labelMap[type] || type;
};

const getStatusTagType = (status: StrategyStatus) => {
  const statusMap = {
    'DRAFT': 'info',
    'TESTING': 'warning',
    'ACTIVE': 'success',
    'INACTIVE': 'danger',
    'ARCHIVED': 'default'
  };
  return statusMap[status] || 'default';
};

const getStatusLabel = (status: StrategyStatus) => {
  const labelMap = {
    'DRAFT': t('common.strategy.status.draft'),
    'TESTING': t('common.strategy.status.testing'),
    'ACTIVE': t('common.strategy.status.active'),
    'INACTIVE': t('common.strategy.status.inactive'),
    'ARCHIVED': t('common.strategy.status.archived')
  };
  return labelMap[status] || status;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};
</script>

<style lang="scss" scoped>
.strategy-detail-panel {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .stat-item {
      text-align: center;
      padding: 16px;
      background: var(--el-bg-color-page);
      border-radius: 6px;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 4px;

        &.success {
          color: #67c23a;
        }

        &.error {
          color: #f56c6c;
        }
      }

      .stat-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .effect-stats {
    .effect-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .effect-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;

        .el-icon {
          font-size: 16px;
          color: white;
        }

        &.allow {
          background: #67c23a;
        }

        &.deny {
          background: #f56c6c;
        }

        &.conditional {
          background: #e6a23c;
        }
      }

      .effect-info {
        .effect-count {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .effect-label {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .performance-stats {
    .perf-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .perf-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }

      .perf-value {
        font-weight: 600;

        &.error {
          color: #f56c6c;
        }
      }
    }
  }

  .tags-container {
    min-height: 40px;

    .no-tags {
      color: var(--el-text-color-secondary);
      font-size: 14px;
      text-align: center;
      padding: 20px 0;
    }
  }

  .description-section {
    h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .description-text {
      margin: 0;
      line-height: 1.5;
      color: var(--el-text-color-regular);
    }

    .no-description {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-style: italic;
    }
  }

  .config-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    h5 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .expression-code {
      background: var(--el-bg-color-page);
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
    }

    .variables-json,
    .parameters-json {
      background: var(--el-bg-color-page);
      padding: 8px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 11px;
      margin: 0;
      max-height: 150px;
      overflow-y: auto;
    }
  }
}

@media (max-width: 768px) {
  .strategy-detail-panel {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
