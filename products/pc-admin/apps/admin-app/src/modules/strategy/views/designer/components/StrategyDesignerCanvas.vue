<template>
  <div class="canvas-container">
    <!-- SVG 画布 -->
    <svg
      class="strategy-canvas"
      :class="{ dragging: isDragging }"
      :style="{ transform: `translate(${panX}px, ${panY}px) scale(${canvasScale})` }"
      @drop="handleCanvasDrop"
      @dragover="(event) => event.preventDefault()"
      @dragleave="handleCanvasDragLeave"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleCanvasMouseMove"
      @mouseup="handleCanvasMouseUp"
      @click="handleCanvasClick"
    >
      <!-- 定义箭头标记和网格 -->
      <defs>
        <!-- 网格模式定义 -->
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--el-border-color-light)" stroke-width="1"/>
        </pattern>

        <!-- 箭头标记定义 -->
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="var(--el-color-primary)"
          />
        </marker>
      </defs>

      <!-- 网格背景 -->
      <rect width="100%" height="100%" fill="url(#grid)" />

      <!-- 连接线 -->
      <g class="connections">
        <g
          v-for="connection in connections"
          :key="connection.id"
          :class="[
            'connection',
            connection.type,
            { selected: selectedConnectionId === connection.id }
          ]"
          @mousedown="handleConnectionMouseDown($event, connection)"
        >
          <path
            :d="getConnectionPath(connection)"
            :stroke="getConnectionColor(connection)"
            :stroke-width="getConnectionStrokeWidth(connection)"
            :stroke-dasharray="getConnectionDashArray(connection)"
            fill="none"
            marker-end="url(#arrowhead)"
          />
        </g>
      </g>

      <!-- 临时连接线 -->
      <g v-if="isConnecting && tempConnection" class="temp-connection">
        <path
          :d="tempConnection.path"
          stroke="var(--el-color-primary)"
          stroke-width="2"
          stroke-dasharray="5,5"
          fill="none"
          marker-end="url(#arrowhead)"
        />
      </g>

      <!-- 节点 -->
      <g class="nodes">
        <g
          v-for="node in nodes"
          :key="node.id"
          :class="[
            'strategy-node',
            node.type,
            { selected: selectedNodeId === node.id }
          ]"
          :transform="`translate(${node.position.x}, ${node.position.y})`"
          @mousedown="handleNodeMouseDown($event, node, editingNodeId === node.id)"
          @click="handleNodeClick(node, $event)"
          @dblclick="handleNodeDoubleClick(node, $event)"
          @mouseenter="handleNodeMouseEnter(node)"
          @mouseleave="handleNodeMouseLeave"
        >
          <!-- 节点背景 -->
          <rect
            :width="node.style?.width || 120"
            :height="node.style?.height || 60"
            :fill="getNodeFillColor(node.type)"
            :stroke="getNodeStrokeColor(node.type)"
            :stroke-width="2"
            :rx="8"
            :ry="8"
          />

          <!-- 节点文本 -->
          <text
            v-if="editingNodeId !== node.id"
            :x="(node.style?.width || 120) / 2"
            :y="(node.style?.height || 60) / 2"
            :font-size="(node.textConfig?.fontSize || defaultTextConfig.fontSize) / canvasScale"
            :font-family="node.textConfig?.fontFamily || defaultTextConfig.fontFamily"
            :font-weight="node.textConfig?.fontWeight || defaultTextConfig.fontWeight"
            :font-style="node.textConfig?.fontStyle || defaultTextConfig.fontStyle"
            :fill="getNodeTextColor(node.type)"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ node.text || getNodeText(node.type) }}
          </text>

          <!-- 文本编辑模式 -->
          <foreignObject
            v-if="editingNodeId === node.id"
            :x="0"
            :y="0"
            :width="node.style?.width || 120"
            :height="node.style?.height || 60"
          >
            <div class="text-edit-container">
              <input
                :value="editingText"
                @input="$emit('update:editingText', $event.target.value)"
                type="text"
                class="node-text-input"
                :style="{
                  fontSize: (node.textConfig?.fontSize || defaultTextConfig.fontSize) + 'px',
                  fontFamily: node.textConfig?.fontFamily || defaultTextConfig.fontFamily,
                  fontWeight: node.textConfig?.fontWeight || defaultTextConfig.fontWeight,
                  fontStyle: node.textConfig?.fontStyle || defaultTextConfig.fontStyle,
                  color: getNodeTextColor(node.type)
                }"
                @blur="finishTextEditing"
                @keydown="handleTextEditKeyDown"
                ref="textInputRef"
              />
            </div>
          </foreignObject>

          <!-- 8个连接点 - 始终渲染，通过CSS控制显示 -->
          <g
            class="connection-points"
            :class="{ visible: hoveredNodeId === node.id || selectedNodeId === node.id }"
          >
            <!-- 四个边线中点连接点 + 箭头 -->
            <!-- 顶部中点 -->
            <g class="edge-connection-group">
              <circle
                :cx="(node.style?.width || 120) / 2"
                :cy="0"
                r="4"
                fill="white"
                stroke="#666666"
                stroke-width="1"
                class="connection-dot edge"
                @click="handleConnectionPointClick($event, node, 'top')"
              />
              <g
                class="connection-arrow-group"
                :class="{
                  'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                  'active': activeArrowDirection === 'top' && selectedNodeId === node.id
                }"
                @click="handleArrowClick($event, node, 'top')"
              >
                <path
                  :d="`M ${(node.style?.width || 120) / 2 - 5} ${-15}
                       L ${(node.style?.width || 120) / 2 - 5} ${-25}
                       L ${(node.style?.width || 120) / 2 - 8} ${-25}
                       L ${(node.style?.width || 120) / 2} ${-32}
                       L ${(node.style?.width || 120) / 2 + 8} ${-25}
                       L ${(node.style?.width || 120) / 2 + 5} ${-25}
                       L ${(node.style?.width || 120) / 2 + 5} ${-15}
                       Z`"
                  class="arrow-shape"
                />
              </g>
            </g>

            <!-- 右侧中点 -->
            <g class="edge-connection-group">
              <circle
                :cx="(node.style?.width || 120)"
                :cy="(node.style?.height || 60) / 2"
                r="4"
                fill="white"
                stroke="#666666"
                stroke-width="1"
                class="connection-dot edge"
                @click="handleConnectionPointClick($event, node, 'right')"
              />
              <g
                class="connection-arrow-group"
                :class="{
                  'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                  'active': activeArrowDirection === 'right' && selectedNodeId === node.id
                }"
                @click="handleArrowClick($event, node, 'right')"
              >
                <path
                  :d="`M ${(node.style?.width || 120) + 15} ${(node.style?.height || 60) / 2 - 5}
                       L ${(node.style?.width || 120) + 25} ${(node.style?.height || 60) / 2 - 5}
                       L ${(node.style?.width || 120) + 25} ${(node.style?.height || 60) / 2 - 8}
                       L ${(node.style?.width || 120) + 32} ${(node.style?.height || 60) / 2}
                       L ${(node.style?.width || 120) + 25} ${(node.style?.height || 60) / 2 + 8}
                       L ${(node.style?.width || 120) + 25} ${(node.style?.height || 60) / 2 + 5}
                       L ${(node.style?.width || 120) + 15} ${(node.style?.height || 60) / 2 + 5}
                       Z`"
                  class="arrow-shape"
                />
              </g>
            </g>

            <!-- 底部中点 -->
            <g class="edge-connection-group">
              <circle
                :cx="(node.style?.width || 120) / 2"
                :cy="(node.style?.height || 60)"
                r="4"
                fill="white"
                stroke="#666666"
                stroke-width="1"
                class="connection-dot edge"
                @click="handleConnectionPointClick($event, node, 'bottom')"
              />
              <g
                class="connection-arrow-group"
                :class="{
                  'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                  'active': activeArrowDirection === 'bottom' && selectedNodeId === node.id
                }"
                @click="handleArrowClick($event, node, 'bottom')"
              >
                <path
                  :d="`M ${(node.style?.width || 120) / 2 - 5} ${(node.style?.height || 60) + 15}
                       L ${(node.style?.width || 120) / 2 - 5} ${(node.style?.height || 60) + 25}
                       L ${(node.style?.width || 120) / 2 - 8} ${(node.style?.height || 60) + 25}
                       L ${(node.style?.width || 120) / 2} ${(node.style?.height || 60) + 32}
                       L ${(node.style?.width || 120) / 2 + 8} ${(node.style?.height || 60) + 25}
                       L ${(node.style?.width || 120) / 2 + 5} ${(node.style?.height || 60) + 25}
                       L ${(node.style?.width || 120) / 2 + 5} ${(node.style?.height || 60) + 15}
                       Z`"
                  class="arrow-shape"
                />
              </g>
            </g>

            <!-- 左侧中点 -->
            <g class="edge-connection-group">
              <circle
                :cx="0"
                :cy="(node.style?.height || 60) / 2"
                r="4"
                fill="white"
                stroke="#666666"
                stroke-width="1"
                class="connection-dot edge"
                @click="handleConnectionPointClick($event, node, 'left')"
              />
              <g
                class="connection-arrow-group"
                :class="{
                  'visible': hoveredNodeId === node.id || selectedNodeId === node.id,
                  'active': activeArrowDirection === 'left' && selectedNodeId === node.id
                }"
                @click="handleArrowClick($event, node, 'left')"
              >
                <path
                  :d="`M -15 ${(node.style?.height || 60) / 2 - 5}
                       L -25 ${(node.style?.height || 60) / 2 - 5}
                       L -25 ${(node.style?.height || 60) / 2 - 8}
                       L -32 ${(node.style?.height || 60) / 2}
                       L -25 ${(node.style?.height || 60) / 2 + 8}
                       L -25 ${(node.style?.height || 60) / 2 + 5}
                       L -15 ${(node.style?.height || 60) / 2 + 5}
                       Z`"
                  class="arrow-shape"
                />
              </g>
            </g>
          </g>

        </g>
      </g>
    </svg>

    <!-- 形状选择弹窗 -->
    <div
      v-if="showShapeSelector"
      class="shape-selector-popup"
      :style="{
        left: shapeSelectorPosition.x + 'px',
        top: shapeSelectorPosition.y + 'px'
      }"
    >
      <div class="shape-list">
        <div
          v-for="shape in commonShapes"
          :key="shape.type"
          class="shape-item"
          @click="handleShapeSelect(shape)"
        >
          <div class="shape-preview" :style="{ backgroundColor: shape.color }">
            {{ shape.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useI18n } from '@btc/shared-core';
import type { StrategyNode, StrategyConnection, NodeType } from '@/types/strategy';
import { NodeType as NodeTypeEnum } from '@/types/strategy';

interface Props {
  nodes: StrategyNode[];
  connections: StrategyConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  isDragging: boolean;
  canvasScale: number;
  panX: number;
  panY: number;
  isConnecting: boolean;
  tempConnection: any;
  editingNodeId: string | null;
  editingText: string;
  activeArrowDirection: string | null;
  showShapeSelector: boolean;
  shapeSelectorPosition: { x: number; y: number };
  commonShapes: any[];
  defaultTextConfig: any;
}

interface Emits {
  (e: 'canvas-drop', event: DragEvent): void;
  (e: 'canvas-drag-leave', event: DragEvent): void;
  (e: 'canvas-mouse-down', event: MouseEvent): void;
  (e: 'canvas-mouse-move', event: MouseEvent): void;
  (e: 'canvas-mouse-up', event: MouseEvent): void;
  (e: 'canvas-click', event: MouseEvent): void;
  (e: 'node-mouse-down', event: MouseEvent, node: StrategyNode, isEditingText: boolean): void;
  (e: 'node-click', node: StrategyNode, event: MouseEvent): void;
  (e: 'node-double-click', node: StrategyNode, event: MouseEvent): void;
  (e: 'node-mouse-enter', node: StrategyNode): void;
  (e: 'node-mouse-leave'): void;
  (e: 'connection-mouse-down', event: MouseEvent, connection: StrategyConnection): void;
  (e: 'arrow-click', event: MouseEvent, node: any, direction: string, position: { x: number; y: number }): void;
  (e: 'shape-select', shape: any): void;
  (e: 'finish-text-editing'): void;
  (e: 'text-edit-keydown', event: KeyboardEvent): void;
  (e: 'update:editingText', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const textInputRef = ref<HTMLInputElement>();

// 事件处理
const handleCanvasDrop = (event: DragEvent) => emit('canvas-drop', event);
const handleCanvasDragLeave = (event: DragEvent) => emit('canvas-drag-leave', event);
const handleCanvasMouseDown = (event: MouseEvent) => emit('canvas-mouse-down', event);
const handleCanvasMouseMove = (event: MouseEvent) => emit('canvas-mouse-move', event);
const handleCanvasMouseUp = (event: MouseEvent) => emit('canvas-mouse-up', event);
const handleCanvasClick = (event: MouseEvent) => emit('canvas-click', event);

const handleNodeMouseDown = (event: MouseEvent, node: StrategyNode, isEditingText: boolean) => {
  emit('node-mouse-down', event, node, isEditingText);
};

const handleNodeClick = (node: StrategyNode, event: MouseEvent) => {
  emit('node-click', node, event);
};

const handleNodeDoubleClick = (node: StrategyNode, event: MouseEvent) => {
  emit('node-double-click', node, event);
};

const handleNodeMouseEnter = (node: StrategyNode) => {
  emit('node-mouse-enter', node);
};

const handleNodeMouseLeave = () => {
  emit('node-mouse-leave');
};

const handleConnectionMouseDown = (event: MouseEvent, connection: StrategyConnection) => {
  emit('connection-mouse-down', event, connection);
};

const handleArrowClick = (event: MouseEvent, node: any, direction: string, position: { x: number; y: number }) => {
  event.stopPropagation();
  emit('arrow-click', event, node, direction, position);
};

const handleConnectionPointClick = (event: MouseEvent, node: any, position: string) => {
  event.stopPropagation();
  // 连接点点击处理逻辑
  
};

const handleShapeSelect = (shape: any) => {
  emit('shape-select', shape);
};

const finishTextEditing = () => {
  emit('finish-text-editing');
};

const handleTextEditKeyDown = (event: KeyboardEvent) => {
  emit('text-edit-keydown', event);
};

// 工具函数
const getNodeFillColor = (type: NodeType): string => {
  const colorMap = {
    [NodeTypeEnum.START]: '#67c23a',
    [NodeTypeEnum.END]: '#f56c6c',
    [NodeTypeEnum.CONDITION]: '#e6a23c',
    [NodeTypeEnum.ACTION]: '#409eff',
    [NodeTypeEnum.DECISION]: '#909399',
    [NodeTypeEnum.GATEWAY]: '#9c27b0'
  };
  return colorMap[type] || '#409eff';
};

const getNodeStrokeColor = (type: NodeType): string => {
  return getNodeFillColor(type);
};

const getNodeTextColor = (type: NodeType): string => {
  return '#ffffff';
};

const { t } = useI18n();
const getNodeText = (type: NodeType): string => {
  const textMap = {
    [NodeTypeEnum.START]: t('common.strategy.designer.node_types.start'),
    [NodeTypeEnum.END]: t('common.strategy.designer.node_types.end'),
    [NodeTypeEnum.CONDITION]: t('common.strategy.designer.node_types.condition'),
    [NodeTypeEnum.ACTION]: t('common.strategy.designer.node_types.action'),
    [NodeTypeEnum.DECISION]: t('common.strategy.designer.node_types.decision'),
    [NodeTypeEnum.GATEWAY]: t('common.strategy.designer.node_types.gateway')
  };
  return textMap[type] || t('common.strategy.designer.node_types.node');
};

const getConnectionPath = (connection: StrategyConnection): string => {
  // 连接线路径计算逻辑
  return '';
};

const getConnectionColor = (connection: StrategyConnection): string => {
  return 'var(--el-color-primary)';
};

const getConnectionStrokeWidth = (connection: StrategyConnection): number => {
  return 2;
};

const getConnectionDashArray = (connection: StrategyConnection): string => {
  return '';
};

const getVertexConnectionPoints = (node: StrategyNode) => {
  const width = node.style?.width || 120;
  const height = node.style?.height || 60;
  return [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height }
  ];
};

const getEdgeConnectionPoints = (node: StrategyNode) => {
  const width = node.style?.width || 120;
  const height = node.style?.height || 60;
  return [
    { x: width / 2, y: 0 },
    { x: width, y: height / 2 },
    { x: width / 2, y: height },
    { x: 0, y: height / 2 }
  ];
};

const getDirectionArrows = (node: StrategyNode) => {
  const width = node.style?.width || 120;
  const height = node.style?.height || 60;
  return [
    {
      direction: 'top',
      position: { x: width / 2, y: -20 },
      path: 'M 0 0 L 10 0 L 5 15 L 0 0 Z',
      fill: 'rgba(64, 158, 255, 0.3)',
      stroke: 'rgba(64, 158, 255, 0.6)',
      strokeWidth: 1
    },
    {
      direction: 'right',
      position: { x: width + 20, y: height / 2 },
      path: 'M 0 0 L 0 10 L 15 5 L 0 0 Z',
      fill: 'rgba(64, 158, 255, 0.3)',
      stroke: 'rgba(64, 158, 255, 0.6)',
      strokeWidth: 1
    },
    {
      direction: 'bottom',
      position: { x: width / 2, y: height + 20 },
      path: 'M 0 0 L 10 0 L 5 15 L 0 0 Z',
      fill: 'rgba(64, 158, 255, 0.3)',
      stroke: 'rgba(64, 158, 255, 0.6)',
      strokeWidth: 1
    },
    {
      direction: 'left',
      position: { x: -20, y: height / 2 },
      path: 'M 0 0 L 0 10 L 15 5 L 0 0 Z',
      fill: 'rgba(64, 158, 255, 0.3)',
      stroke: 'rgba(64, 158, 255, 0.6)',
      strokeWidth: 1
    }
  ];
};
</script>

<style lang="scss">
@use '../styles/canvas.scss';
@use '../styles/nodes.scss';
</style>
