<template>
  <div
    class="strategy-node"
    :class="[
      `node-type-${node.type.toLowerCase()}`,
      { 'node-selected': selected }
    ]"
    :style="{
      left: `${node.position.x}px`,
      top: `${node.position.y}px`,
      width: `${node.style?.width || 120}px`,
      height: `${node.style?.height || 80}px`,
      backgroundColor: node.style?.backgroundColor,
      borderColor: selected ? '#409eff' : node.style?.borderColor,
      transform: `scale(${Math.max(0.5, Math.min(2, 1 / zoom))})`
    }"
    @mousedown="handleMouseDown"
    @click="handleClick"
    @dblclick="handleDoubleClick"
  >
    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 节点图标 -->
      <div class="node-icon">
        <el-icon><component :is="getNodeIcon(node.type)" /></el-icon>
      </div>

      <!-- 节点标题 -->
      <div class="node-title">{{ node.name }}</div>

      <!-- 节点描述 -->
      <div v-if="node.description" class="node-description">
        {{ node.description }}
      </div>

      <!-- 节点状态指示器 -->
      <div v-if="hasValidationErrors" class="node-status error">
        <el-icon><WarningFilled /></el-icon>
      </div>
      <div v-else-if="isConfigured" class="node-status success">
        <el-icon><CircleCheckFilled /></el-icon>
      </div>
    </div>

    <!-- 连接点 -->
    <div class="connection-points">
      <!-- 输入连接点 -->
      <div
        v-if="canHaveInput"
        class="connection-point input"
        @mousedown.stop="handleInputConnect"
        @mouseup.stop="handleInputDrop"
      >
        <div class="connection-dot" />
      </div>

      <!-- 普通输出连接点（非条件节点） -->
      <div
        v-if="canHaveOutput && node.type !== 'DECISION' && node.type !== 'CONDITION'"
        class="connection-point output"
        @mousedown.stop="handleOutputConnect"
      >
        <div class="connection-dot" />
      </div>

      <!-- 条件输出连接点（用于决策节点和条件节点） -->
      <template v-if="node.type === 'DECISION' || node.type === 'CONDITION'">
        <div
          class="connection-point output-true"
          @mousedown.stop="(event) => handleConditionalOutputConnect(event, 'true')"
        >
          <div class="connection-dot success" />
          <span class="connection-label">是</span>
        </div>
        <div
          class="connection-point output-false"
          @mousedown.stop="(event) => handleConditionalOutputConnect(event, 'false')"
        >
          <div class="connection-dot danger" />
          <span class="connection-label">否</span>
        </div>
      </template>
    </div>

    <!-- 调整大小手柄 - 8个顶点 -->
    <div
      v-if="selected"
      class="resize-handles"
    >
      <!-- 四个角的手柄 -->
      <div
        class="resize-handle top-left"
        @mousedown.stop="(event) => handleResizeStart(event, 'top-left')"
      />
      <div
        class="resize-handle top-right"
        @mousedown.stop="(event) => handleResizeStart(event, 'top-right')"
      />
      <div
        class="resize-handle bottom-left"
        @mousedown.stop="(event) => handleResizeStart(event, 'bottom-left')"
      />
      <div
        class="resize-handle bottom-right"
        @mousedown.stop="(event) => handleResizeStart(event, 'bottom-right')"
      />

      <!-- 四个边中点的手柄 -->
      <div
        class="resize-handle top-center"
        @mousedown.stop="(event) => handleResizeStart(event, 'top-center')"
      />
      <div
        class="resize-handle right-center"
        @mousedown.stop="(event) => handleResizeStart(event, 'right-center')"
      />
      <div
        class="resize-handle bottom-center"
        @mousedown.stop="(event) => handleResizeStart(event, 'bottom-center')"
      />
      <div
        class="resize-handle left-center"
        @mousedown.stop="(event) => handleResizeStart(event, 'left-center')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  VideoPlay,
  VideoPause,
  QuestionFilled,
  Lightning,
  Share,
  Connection,
  WarningFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue';
import type { StrategyNode as IStrategyNode, NodeType } from '@/types/strategy';

// Props
interface Props {
  node: IStrategyNode;
  selected: boolean;
  zoom: number;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  select: [nodeId: string];
  move: [nodeId: string, position: { x: number; y: number }];
  connect: [fromNodeId: string, event: MouseEvent, condition?: 'true' | 'false'];
  edit: [nodeId: string];
  'complete-connection': [nodeId: string];
}>();

// 响应式数据
const isDragging = ref(false);
const isResizing = ref(false);
const dragStart = ref({ x: 0, y: 0, nodeX: 0, nodeY: 0 });
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });
const resizeDirection = ref('');

// 计算属性
const canHaveInput = computed(() => {
  return props.node.type !== 'START';
});

const canHaveOutput = computed(() => {
  return props.node.type !== 'END';
});

const isConfigured = computed(() => {
  const { data } = props.node;

  switch (props.node.type) {
    case 'CONDITION':
      return data.conditions && data.conditions.length > 0;
    case 'ACTION':
      return data.actions && data.actions.length > 0;
    case 'DECISION':
      return data.rules && data.rules.length > 0;
    default:
      return true;
  }
});

const hasValidationErrors = computed(() => {
  // 简单的验证逻辑
  if (props.node.type === 'CONDITION' && (!props.node.data.conditions || props.node.data.conditions.length === 0)) {
    return true;
  }
  if (props.node.type === 'ACTION' && (!props.node.data.actions || props.node.data.actions.length === 0)) {
    return true;
  }
  return false;
});

// 工具函数
const getNodeIcon = (type: NodeType) => {
  const iconMap = {
    'START': VideoPlay,
    'END': VideoPause,
    'CONDITION': QuestionFilled,
    'ACTION': Lightning,
    'DECISION': Share,
    'GATEWAY': Connection
  };
  return iconMap[type] || QuestionFilled;
};

// 事件处理
const handleClick = (event: MouseEvent) => {
  event.stopPropagation();
  emit('select', props.node.id);
};

const handleDoubleClick = (event: MouseEvent) => {
  event.stopPropagation();
  emit('edit', props.node.id);
};

const handleMouseDown = (event: MouseEvent) => {
  if (event.button !== 0) return; // 只处理左键

  event.stopPropagation();

  isDragging.value = true;
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    nodeX: props.node.position.x,
    nodeY: props.node.position.y
  };

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value && !isResizing.value) return;

  if (isDragging.value) {
    const deltaX = (event.clientX - dragStart.value.x) / props.zoom;
    const deltaY = (event.clientY - dragStart.value.y) / props.zoom;

    const newPosition = {
      x: Math.max(0, dragStart.value.nodeX + deltaX),
      y: Math.max(0, dragStart.value.nodeY + deltaY)
    };

    // 实时更新节点位置，确保连接线同步移动
    emit('move', props.node.id, newPosition);
  }

  if (isResizing.value) {
    const deltaX = (event.clientX - resizeStart.value.x) / props.zoom;
    const deltaY = (event.clientY - resizeStart.value.y) / props.zoom;

    let newWidth = props.node.style?.width || 120;
    let newHeight = props.node.style?.height || 80;
    let newX = props.node.position.x;
    let newY = props.node.position.y;

    // 根据调整方向计算新的尺寸和位置
    switch (resizeDirection.value) {
      case 'top-left':
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newX = props.node.position.x + deltaX;
        newY = props.node.position.y + deltaY;
        break;
      case 'top-right':
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newY = props.node.position.y + deltaY;
        break;
      case 'bottom-left':
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        newX = props.node.position.x + deltaX;
        break;
      case 'bottom-right':
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        break;
      case 'top-center':
        newHeight = Math.max(60, resizeStart.value.height - deltaY);
        newY = props.node.position.y + deltaY;
        break;
      case 'bottom-center':
        newHeight = Math.max(60, resizeStart.value.height + deltaY);
        break;
      case 'left-center':
        newWidth = Math.max(80, resizeStart.value.width - deltaX);
        newX = props.node.position.x + deltaX;
        break;
      case 'right-center':
        newWidth = Math.max(80, resizeStart.value.width + deltaX);
        break;
    }

    // 更新节点样式和位置
    if (props.node.style) {
      props.node.style.width = newWidth;
      props.node.style.height = newHeight;
    }

    // 更新节点位置（对于需要移动的调整方向）
    if (newX !== props.node.position.x || newY !== props.node.position.y) {
      emit('move', props.node.id, { x: newX, y: newY });
    }
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  isResizing.value = false;

  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};

const handleResizeStart = (event: MouseEvent, direction: string) => {
  event.stopPropagation();

  isResizing.value = true;
  resizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: props.node.style?.width || 120,
    height: props.node.style?.height || 80
  };

  // 存储调整方向
  resizeDirection.value = direction;

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleInputConnect = (event: MouseEvent) => {
  // 输入连接点暂时不处理拖拽开始
  event.stopPropagation();
};

// 组件卸载时清理事件监听器
onBeforeUnmount(() => {
  // 确保所有事件监听器都被移除
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});

const handleInputDrop = (event: MouseEvent) => {
  event.stopPropagation();
  // 通知父组件完成连接
  emit('complete-connection', props.node.id);
};

const handleOutputConnect = (event: MouseEvent) => {
  event.stopPropagation();
  emit('connect', props.node.id, event);
};

const handleConditionalOutputConnect = (event: MouseEvent, condition: 'true' | 'false') => {
  event.stopPropagation();
  emit('connect', props.node.id, event, condition);
};
</script>

<style lang="scss" scoped>
.strategy-node {
  position: absolute;
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: move;
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: var(--el-box-shadow-light);
  transform-origin: center;

  &:hover {
    box-shadow: var(--el-box-shadow);
  }

  &.node-selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
  }

  // 不同类型节点的样式
  &.node-type-start {
    border-color: #67c23a;

    .node-icon {
      color: #67c23a;
    }
  }

  &.node-type-end {
    border-color: #f56c6c;

    .node-icon {
      color: #f56c6c;
    }
  }

  &.node-type-condition {
    border-color: #e6a23c;

    .node-icon {
      color: #e6a23c;
    }

    // 条件节点特殊标识
    .node-title::after {
      content: ' ?';
      color: #e6a23c;
      font-weight: bold;
    }
  }

  &.node-type-action {
    border-color: #409eff;

    .node-icon {
      color: #409eff;
    }
  }

  &.node-type-decision {
    border-color: #909399;

    .node-icon {
      color: #909399;
    }

    // 决策节点特殊标识
    .node-title::after {
      content: ' ?';
      color: #909399;
      font-weight: bold;
    }
  }

  &.node-type-gateway {
    border-color: #9c27b0;

    .node-icon {
      color: #9c27b0;
    }
  }

  .node-content {
    padding: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .node-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .node-title {
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      line-height: 1.2;
      margin-bottom: 2px;
      color: var(--el-text-color-primary);
    }

    .node-description {
      font-size: 10px;
      color: var(--el-text-color-regular);
      text-align: center;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .node-status {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;

      &.success {
        background: var(--el-color-success-light-9);
        color: var(--el-color-success);
      }

      &.error {
        background: var(--el-color-danger-light-9);
        color: var(--el-color-danger);
      }
    }
  }

  .connection-points {
    .connection-point {
      position: absolute;
      width: 16px;
      height: 16px;
      cursor: crosshair;
      z-index: 10;

      .connection-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--el-color-primary);
        border: 2px solid var(--el-bg-color);
        box-shadow: 0 0 0 1px var(--el-color-primary), var(--el-box-shadow-light);
        transition: all 0.2s;
        margin: 3px;

        &:hover {
          transform: scale(1.3);
          box-shadow: 0 0 0 2px var(--el-color-primary), var(--el-box-shadow);
        }

        &.success {
          background: var(--el-color-success);
          box-shadow: 0 0 0 1px var(--el-color-success), var(--el-box-shadow-light);

          &:hover {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px var(--el-color-success), var(--el-box-shadow);
          }
        }

        &.danger {
          background: var(--el-color-danger);
          box-shadow: 0 0 0 1px var(--el-color-danger), var(--el-box-shadow-light);

          &:hover {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px var(--el-color-danger), var(--el-box-shadow);
          }
        }
      }

      .connection-label {
        position: absolute;
        font-size: 10px;
        white-space: nowrap;
        pointer-events: none;
        color: var(--el-text-color-regular);
      }

      &.input {
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      &.output {
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
      }

      &.output-true {
        bottom: -8px;
        right: 15%;
        transform: translateX(50%);

        .connection-label {
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          color: #67c23a;
          font-weight: 600;
          font-size: 11px;
        }
      }

      &.output-false {
        bottom: -8px;
        left: 15%;
        transform: translateX(-50%);

        .connection-label {
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          color: #f56c6c;
          font-weight: 600;
          font-size: 11px;
        }
      }
    }
  }

  .resize-handles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 20;

    .resize-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #409eff !important;
      border: 2px solid white !important;
      border-radius: 2px;
      z-index: 21;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
      pointer-events: auto;

      // 四个角的手柄
      &.top-left {
        top: -6px;
        left: -6px;
        cursor: nw-resize;
      }

      &.top-right {
        top: -6px;
        right: -6px;
        cursor: ne-resize;
      }

      &.bottom-left {
        bottom: -6px;
        left: -6px;
        cursor: sw-resize;
      }

      &.bottom-right {
        bottom: -6px;
        right: -6px;
        cursor: se-resize;
      }

      // 四个边中点的手柄
      &.top-center {
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        cursor: n-resize;
      }

      &.right-center {
        top: 50%;
        right: -6px;
        transform: translateY(-50%);
        cursor: e-resize;
      }

      &.bottom-center {
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        cursor: s-resize;
      }

      &.left-center {
        top: 50%;
        left: -6px;
        transform: translateY(-50%);
        cursor: w-resize;
      }

      &:hover {
        background: #66b1ff;
        transform: scale(1.2);
      }

      // 添加双箭头提示
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 0;
        height: 0;
        border: 2px solid white;
        opacity: 0;
        transition: opacity 0.2s ease;
        pointer-events: none;
      }

      &:hover::before {
        opacity: 1;
      }

      // 四个角的手柄 - 双对角线箭头
      &.top-left::before {
        border-top: 2px solid white;
        border-right: 2px solid white;
        width: 6px;
        height: 6px;
        transform: translate(-50%, -50%) rotate(45deg);
      }

      &.bottom-right::before {
        border-top: 2px solid white;
        border-right: 2px solid white;
        width: 6px;
        height: 6px;
        transform: translate(-50%, -50%) rotate(45deg);
      }

      &.top-right::before {
        border-top: 2px solid white;
        border-left: 2px solid white;
        width: 6px;
        height: 6px;
        transform: translate(-50%, -50%) rotate(-45deg);
      }

      &.bottom-left::before {
        border-top: 2px solid white;
        border-left: 2px solid white;
        width: 6px;
        height: 6px;
        transform: translate(-50%, -50%) rotate(-45deg);
      }

      // 四个边中点的手柄 - 双方向箭头
      &.top-center::before {
        border-top: 2px solid white;
        border-bottom: 2px solid white;
        width: 8px;
        height: 4px;
        transform: translate(-50%, -50%);
      }

      &.bottom-center::before {
        border-top: 2px solid white;
        border-bottom: 2px solid white;
        width: 8px;
        height: 4px;
        transform: translate(-50%, -50%);
      }

      &.left-center::before {
        border-left: 2px solid white;
        border-right: 2px solid white;
        width: 4px;
        height: 8px;
        transform: translate(-50%, -50%);
      }

      &.right-center::before {
        border-left: 2px solid white;
        border-right: 2px solid white;
        width: 4px;
        height: 8px;
        transform: translate(-50%, -50%);
      }
    }
  }
}

// 缩放适配
@media (max-width: 768px) {
  .strategy-node {
    .node-content {
      .node-title {
        font-size: 11px;
      }

      .node-description {
        font-size: 9px;
      }
    }

    .connection-points {
      .connection-point {
        width: 16px;
        height: 16px;

        .connection-dot {
          width: 10px;
          height: 10px;
        }
      }
    }
  }
}
</style>
