<template>
  <div class="strategy-execution-preview">
    <div class="preview-header">
      <div class="preview-info">
        <h3>策略执行预览</h3>
        <p>模拟策略执行流程，查看各节点的执行顺序和结果</p>
      </div>

      <div class="preview-controls">
        <el-button @click="resetPreview">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
        <el-button type="primary" @click="startPreview" :loading="isExecuting">
          <el-icon><VideoPlay /></el-icon>
          开始预览
        </el-button>
      </div>
    </div>

    <!-- 执行配置 -->
    <div class="execution-config">
      <el-form :model="configForm" label-width="100px" size="small">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="执行模式" prop="mode">
              <el-select id="execution-mode-select" v-model="configForm.mode">
                <el-option id="execution-mode-step" label="步进模式" value="step" />
                <el-option id="execution-mode-continuous" label="连续模式" value="continuous" />
                <el-option id="execution-mode-fast" label="快速模式" value="fast" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行速度" prop="speed">
              <el-slider
                id="execution-speed-slider"
                v-model="configForm.speed"
                :min="100"
                :max="2000"
                :step="100"
                show-input
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="输入数据" prop="inputData">
          <el-input
            id="execution-input-data-textarea"
            v-model="configForm.inputData"
            type="textarea"
            :rows="4"
            placeholder='{"user": {"id": "123", "role": "admin"}, "resource": {"type": "document"}}'
          />
        </el-form-item>
      </el-form>
    </div>

    <!-- 执行流程图 -->
    <div class="execution-flow">
      <div class="flow-canvas">
        <svg :width="canvasWidth" :height="canvasHeight" class="preview-svg">
          <!-- 连接线 -->
          <path
            v-for="connection in orchestration.connections"
            :key="connection.id"
            :d="getConnectionPath(connection)"
            :class="[
              'connection-line',
              { 'executed': executedConnections.has(connection.id) }
            ]"
            stroke="#ddd"
            stroke-width="2"
            fill="none"
            marker-end="url(#preview-arrowhead)"
          />

          <!-- 箭头标记 -->
          <defs>
            <marker
              id="preview-arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#409eff" />
            </marker>
          </defs>
        </svg>

        <!-- 节点 -->
        <div
          v-for="node in orchestration.nodes"
          :key="node.id"
          class="preview-node"
          :class="[
            `node-type-${node.type.toLowerCase()}`,
            getNodeExecutionStatus(node.id)
          ]"
          :style="{
            left: `${node.position.x}px`,
            top: `${node.position.y}px`,
            width: `${node.style?.width || 120}px`,
            height: `${node.style?.height || 80}px`
          }"
        >
          <div class="node-content">
            <div class="node-icon">
              <el-icon><component :is="getNodeIcon(node.type)" /></el-icon>
            </div>
            <div class="node-title">{{ node.name }}</div>

            <!-- 执行状态指示器 -->
            <div class="execution-indicator">
              <el-icon v-if="getNodeExecutionStatus(node.id) === 'executing'">
                <Loading />
              </el-icon>
              <el-icon v-else-if="getNodeExecutionStatus(node.id) === 'completed'" class="success">
                <CircleCheckFilled />
              </el-icon>
              <el-icon v-else-if="getNodeExecutionStatus(node.id) === 'failed'" class="error">
                <CircleCloseFilled />
              </el-icon>
            </div>
          </div>

          <!-- 执行结果 -->
          <div v-if="nodeResults.has(node.id)" class="node-result">
            <el-popover placement="top" trigger="hover" width="300">
              <template #reference>
                <el-tag size="small" :type="nodeResults.get(node.id)?.success ? 'success' : 'danger'">
                  {{ nodeResults.get(node.id)?.success ? '成功' : '失败' }}
                </el-tag>
              </template>
              <div class="result-detail">
                <p><strong>执行时间:</strong> {{ nodeResults.get(node.id)?.duration }}ms</p>
                <p><strong>输出:</strong></p>
                <pre>{{ JSON.stringify(nodeResults.get(node.id)?.output, null, 2) }}</pre>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
    </div>

    <!-- 执行日志 -->
    <div class="execution-log">
      <div class="log-header">
        <h4>执行日志</h4>
        <el-button size="small" @click="clearLog">清空日志</el-button>
      </div>

      <div class="log-content">
        <div
          v-for="(log, index) in executionLogs"
          :key="index"
          class="log-item"
          :class="log.level"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>

        <div v-if="executionLogs.length === 0" class="log-empty">
          暂无执行日志
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import {
  Refresh,
  VideoPlay,
  Loading,
  CircleCheckFilled,
  CircleCloseFilled,
  VideoPlay as StartIcon,
  VideoPause,
  QuestionFilled,
  Lightning,
  Share,
  Connection
} from '@element-plus/icons-vue';
import type {
  StrategyOrchestration,
  StrategyNode,
  NodeType
} from '@/types/strategy';

// Props
interface Props {
  orchestration: StrategyOrchestration;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();

// 响应式数据
const isExecuting = ref(false);
const canvasWidth = ref(800);
const canvasHeight = ref(600);

const configForm = ref({
  mode: 'step',
  speed: 1000,
  inputData: '{"user": {"id": "123", "role": "admin"}, "resource": {"type": "document"}}'
});

// 执行状态
const executedNodes = ref(new Set<string>());
const executedConnections = ref(new Set<string>());
const currentExecutingNode = ref<string>('');
const nodeResults = ref(new Map<string, any>());

// 执行日志
interface ExecutionLog {
  timestamp: number;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

const executionLogs = ref<ExecutionLog[]>([]);

// 计算属性
const getNodeExecutionStatus = (nodeId: string) => {
  if (currentExecutingNode.value === nodeId) return 'executing';
  if (executedNodes.value.has(nodeId)) {
    const result = nodeResults.value.get(nodeId);
    return result?.success ? 'completed' : 'failed';
  }
  return 'pending';
};

// 工具函数
const getNodeIcon = (type: NodeType) => {
  const iconMap = {
    'START': StartIcon,
    'END': VideoPause,
    'CONDITION': QuestionFilled,
    'ACTION': Lightning,
    'DECISION': Share,
    'GATEWAY': Connection
  };
  return iconMap[type] || QuestionFilled;
};

const getConnectionPath = (connection: any): string => {
  const sourceNode = props.orchestration.nodes.find(n => n.id === connection.sourceNodeId);
  const targetNode = props.orchestration.nodes.find(n => n.id === connection.targetNodeId);

  if (!sourceNode || !targetNode) return '';

  const sourceX = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
  const sourceY = sourceNode.position.y + (sourceNode.style?.height || 80);
  const targetX = targetNode.position.x + (targetNode.style?.width || 120) / 2;
  const targetY = targetNode.position.y;

  return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
};

const addLog = (level: ExecutionLog['level'], message: string) => {
  executionLogs.value.push({
    timestamp: Date.now(),
    level,
    message
  });
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

const clearLog = () => {
  executionLogs.value = [];
};

const resetPreview = () => {
  isExecuting.value = false;
  executedNodes.value.clear();
  executedConnections.value.clear();
  currentExecutingNode.value = '';
  nodeResults.value.clear();
  executionLogs.value = [];

  addLog('info', t('common.strategy.designer.execution_preview.reset'));
};

const startPreview = async () => {
  if (props.orchestration.nodes.length === 0) {
    BtcMessage.warning(t('common.strategy.designer.execution_preview.add_nodes_first'));
    return;
  }

  try {
    const inputData = JSON.parse(configForm.value.inputData);
    await executeOrchestration(inputData);
  } catch (error) {
    BtcMessage.error(t('common.strategy.designer.execution_preview.invalid_input_json'));
  }
};

const executeOrchestration = async (inputData: any) => {
  isExecuting.value = true;
  addLog('info', t('common.strategy.designer.execution_preview.start_execution'));

  try {
    // 找到开始节点
    const startNodes = props.orchestration.nodes.filter(n => n.type === 'START');
    if (startNodes.length === 0) {
      throw new Error(t('common.strategy.designer.execution_preview.start_node_not_found'));
    }

    // 从开始节点开始执行
    for (const startNode of startNodes) {
      await executeNode(startNode, inputData);
    }

    addLog('success', t('common.strategy.designer.execution_preview.execution_completed'));
  } catch (error) {
    addLog('error', `${t('common.strategy.designer.execution_preview.execution_failed')}: ${error}`);
  } finally {
    isExecuting.value = false;
    currentExecutingNode.value = '';
  }
};

const executeNode = async (node: StrategyNode, context: any): Promise<any> => {
  currentExecutingNode.value = node.id;
  addLog('info', `${t('common.strategy.designer.execution_preview.start_executing_node')}: ${node.name}`);

  // 模拟执行延迟
  await new Promise(resolve => setTimeout(resolve, configForm.value.speed));

  try {
    const result = await simulateNodeExecution(node, context);

    executedNodes.value.add(node.id);
    nodeResults.value.set(node.id, result);

    addLog('success', `${t('common.strategy.designer.node_types.node')} ${node.name} ${t('common.strategy.designer.execution_preview.node_execution_success')}`);

    // 执行后续节点
    const nextConnections = props.orchestration.connections.filter(
      c => c.sourceNodeId === node.id
    );

    for (const connection of nextConnections) {
      executedConnections.value.add(connection.id);

      const nextNode = props.orchestration.nodes.find(n => n.id === connection.targetNodeId);
      if (nextNode) {
        await executeNode(nextNode, result.output);
      }
    }

    return result;
  } catch (error) {
    const errorResult = {
      success: false,
      duration: Math.random() * 100 + 50,
      output: context,
      error: String(error)
    };

    executedNodes.value.add(node.id);
    nodeResults.value.set(node.id, errorResult);

    addLog('error', `${t('common.strategy.designer.node_types.node')} ${node.name} ${t('common.strategy.designer.execution_preview.node_execution_failed')}: ${error}`);

    throw error;
  }
};

const simulateNodeExecution = async (node: StrategyNode, context: any): Promise<any> => {
  const duration = Math.random() * 200 + 100;

  switch (node.type) {
    case 'START':
      return {
        success: true,
        duration,
        output: context
      };

    case 'END':
      return {
        success: true,
        duration,
        output: context
      };

    case 'CONDITION': {
      // 模拟条件判断
      const conditionResult = Math.random() > 0.3; // 70% 成功率
      return {
        success: conditionResult,
        duration,
        output: {
          ...context,
          conditionResult
        }
      };
    }

    case 'ACTION': {
      // 模拟动作执行
      const actionSuccess = Math.random() > 0.1; // 90% 成功率
      return {
        success: actionSuccess,
        duration,
        output: {
          ...context,
          actionExecuted: actionSuccess
        }
      };
    }

    case 'DECISION': {
      // 模拟决策
      const decisionResult = ['option1', 'option2', 'option3'][Math.floor(Math.random() * 3)];
      return {
        success: true,
        duration,
        output: {
          ...context,
          decisionResult
        }
      };
    }

    case 'GATEWAY':
      // 模拟网关
      return {
        success: true,
        duration,
        output: context
      };

    default:
      return {
        success: true,
        duration,
        output: context
      };
  }
};

// 生命周期
onMounted(() => {
  addLog('info', t('common.strategy.designer.execution_preview.component_loaded'));
});
</script>

<style lang="scss" scoped>
.strategy-execution-preview {
  height: 80vh;
  display: flex;
  flex-direction: column;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .preview-info {
      h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
      }

      p {
        margin: 0;
        color: var(--el-text-color-secondary);
        font-size: 14px;
      }
    }

    .preview-controls {
      display: flex;
      gap: 8px;
    }
  }

  .execution-config {
    margin-bottom: 20px;
    padding: 16px;
    background: var(--el-bg-color-page);
    border-radius: 6px;
    border: 1px solid var(--el-border-color-light);
  }

  .execution-flow {
    flex: 1;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    overflow: hidden;
    position: relative;

    .flow-canvas {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: auto;
      background: #fafafa;

      .preview-svg {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;

        .connection-line {
          transition: stroke 0.3s;

          &.executed {
            stroke: #67c23a;
            stroke-width: 3;
          }
        }
      }

      .preview-node {
        position: absolute;
        border: 2px solid #ddd;
        border-radius: 8px;
        background: white;
        display: flex;
        flex-direction: column;
        transition: all 0.3s;

        &.pending {
          opacity: 0.6;
        }

        &.executing {
          border-color: #409eff;
          box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
          animation: pulse 1s infinite;
        }

        &.completed {
          border-color: #67c23a;
          background: #f0f9ff;
        }

        &.failed {
          border-color: #f56c6c;
          background: #fef0f0;
        }

        .node-content {
          flex: 1;
          padding: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;

          .node-icon {
            font-size: 16px;
            margin-bottom: 4px;
          }

          .node-title {
            font-size: 11px;
            text-align: center;
            line-height: 1.2;
          }

          .execution-indicator {
            position: absolute;
            top: 4px;
            right: 4px;

            .success {
              color: #67c23a;
            }

            .error {
              color: #f56c6c;
            }
          }
        }

        .node-result {
          padding: 4px 8px;
          border-top: 1px solid var(--el-border-color-light);
        }
      }
    }
  }

  .execution-log {
    margin-top: 20px;
    height: 200px;
    display: flex;
    flex-direction: column;

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      h4 {
        margin: 0;
        font-size: 14px;
      }
    }

    .log-content {
      flex: 1;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 8px;
      border-radius: 4px;
      overflow-y: auto;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;

      .log-item {
        display: flex;
        margin-bottom: 2px;

        .log-time {
          color: #569cd6;
          margin-right: 8px;
          min-width: 80px;
        }

        .log-level {
          margin-right: 8px;
          min-width: 60px;
          font-weight: bold;
        }

        .log-message {
          flex: 1;
        }

        &.info .log-level {
          color: #4ec9b0;
        }

        &.success .log-level {
          color: #b5cea8;
        }

        &.error .log-level {
          color: #f44747;
        }

        &.warning .log-level {
          color: #dcdcaa;
        }
      }

      .log-empty {
        color: #6a6a6a;
        text-align: center;
        padding: 20px;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(64, 158, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
  }
}

.result-detail {
  font-size: 12px;

  p {
    margin: 4px 0;
  }

  pre {
    background: var(--el-bg-color-page);
    padding: 8px;
    border-radius: 4px;
    font-size: 11px;
    max-height: 150px;
    overflow-y: auto;
  }
}
</style>
