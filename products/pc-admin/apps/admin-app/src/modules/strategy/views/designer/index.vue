<template>
  <div class="strategy-designer">
    <btc-grid-group left-width="200px" right-width="260px">
      <!-- 顶栏左侧：缩放控制 -->
      <template #headerLeft>
        <TopToolbar
          :scale="canvasScale"
          :min-scale="minScale"
          :max-scale="maxScale"
          :scale-input-value="scaleInputValue"
          @zoom-out="handleZoomOut"
          @zoom-in="handleZoomIn"
          @zoom-command="handleZoomCommand"
          @scale-blur="handleScaleInputBlur"
          @scale-enter="handleScaleInputEnter"
          @scale-input="handleScaleInputChange"
        />
      </template>

      <!-- 顶栏中间：策略名称 -->
      <template #headerMiddle>
        <el-input
          v-model="strategyName"
          :placeholder="t('strategy.designer.strategy_name_placeholder')"
          style="width: 200px;"
        />
      </template>

      <!-- 顶栏右侧：操作按钮 -->
      <template #headerRight>
        <el-button type="primary" @click="validateOrchestration">验证</el-button>
        <el-button type="warning" @click="previewExecution">预览</el-button>
        <el-button type="success" @click="handleSave">保存</el-button>
      </template>

      <!-- 内容左侧：组件库 -->
      <template #bodyLeft>
        <ComponentLibraryPanel
          :search="componentSearch"
          :active="activeCategories"
          :categories="filteredComponentCategories"
          :get-fill="getNodeFillColor"
          :get-stroke="getNodeStrokeColor"
          @update:search="(v:string) => componentSearch = v"
          @update:active="(v:string[]) => activeCategories = v"
          @dragstart="handleComponentDragStart"
          @click-component="handleComponentClick"
        />
      </template>

      <!-- 内容中间：画布 -->
      <template #bodyMiddle>
        <div class="canvas-container">
          <div class="canvas-scroll">
            <!-- 网格背景 div：在 body_middle 中水平垂直居中 -->
            <div class="page"
              :style="gridBackgroundStyle"
            ></div>
            <!-- SVG 画布 -->
            <div id="text-editor-layer"></div>
            <CanvasSvg
              ref="canvasRef"
              :canvas-dimensions="canvasDimensions"
              :pan-x="panX"
              :pan-y="panY"
              :scale="canvasScale"
              :is-dragging="isDragging"
              :connection-paths="connectionPaths"
              :is-connection-selected="(id: string) => (selectedConnectionId === id || multiSelectedConnectionIds.has(id))"
              :get-grid-color="getGridColor"
              :get-connection-color="getConnectionColor"
              @drop="handleCanvasDrop"
              @dragover="(event) => event.preventDefault()"
              @dragleave="handleCanvasDragLeave"
              @mousedown="selection.onCanvasMouseDown"
              @mousemove="selection.onCanvasMouseMove"
              @mouseup="selection.onCanvasMouseUp"
              @click="handleCanvasClick"
              @select-connection="(id: string) => {
                const conn = connections.find(c => c.id === id);
                if (conn) {
                  selectConnection(conn);
                  // 选中连接线时，清空节点选中状态和多选状态（与节点选中行为一致）
                  selectNode('');
                  selection.clearMultiSelection();
                }
              }"
            >
              <!-- 临时连接线 -->
            <g v-if="tempConnection" class="temp-connection-group">
              <path
                :d="tempConnection.path"
                :stroke="getTempConnectionColor()"
                stroke-width="2"
                stroke-dasharray="5,5"
                fill="none"
                class="temp-connection-line"
              />
            </g>

            <!-- 节点内容层（直接在插槽中渲染，不需要额外的 content-layer，避免双重缩放） -->
            <NodeItem
              v-for="node in nodes"
              :key="node.id"
              :node="node"
              :selected-node-id="selectedNodeId || ''"
              :multi-selected-node-ids="multiSelectedNodeIds"
              :is-dragging="isDragging"
              :is-resizing="isResizing"
              :is-editing="editingNodeId === node.id"
              :dragging-node-id="draggingNodeId || ''"
              :last-selection-mode="lastSelectionMode"
              :multi-selected-connection-count="multiSelectedConnectionIds.size"
              :hovered-arrow-direction="hoveredArrowDirection"
              :is-mouse-on-node-border="isMouseOnNodeBorder"
              :default-text-config="defaultTextConfig"
              :get-node-fill-color="getNodeFillColor"
              :get-node-stroke-color="getNodeStrokeColor"
              :get-node-text-color="getNodeTextColor"
              :get-handle-positions="getHandlePositions"
              :get-position-box-local-transform="getPositionBoxLocalTransform"
              :get-arrow-transform="getArrowTransform"
              :get-node-text="getNodeText"
              :canvas-dimensions="canvasDimensions"
              :connections="connections"
              :selected-connection-id="selectedConnectionId || ''"
              :multi-selected-connection-ids="multiSelectedConnectionIds"
              :get-connection-handle="getConnectionHandle"
              @pointerdown="handleNodePointerDown"
              @click="handleNodeClick"
              @dblclick="handleNodeDoubleClick"
              @mouseenter="handleNodeMouseEnter"
              @mouseleave="handleNodeMouseLeave"
              @resize-start="handleResizeStart"
              @handle-enter="handleResizeHandleEnter"
              @handle-leave="handleResizeHandleLeave"
              @arrow-click="handleArrowClick"
              @arrow-enter="handleArrowEnter"
              @arrow-leave="handleArrowLeave"
            />

            <template #overlay-top>
              <ConnectionHandlesOverlay
                :connection-paths="connectionPaths"
                :is-selected="(id: string) => (selectedConnectionId === id || multiSelectedConnectionIds.has(id))"
                :selected-connection-id="selectedConnectionId"
                :multi-selected-connection-ids="multiSelectedConnectionIds"
                :get-connection-handle="getConnectionHandle"
                :start-drag="startDragConnectionHandle"
                :is-dragging="isDragging"
                :is-resizing="isResizing"
              />
            </template>
            </CanvasSvg>
            <!-- 橡皮筋选框 div：与 SVG 同级，独立 div 元素 -->
            <div
              v-if="selection.rubber.active"
              class="rubber-band-selection"
              :style="{
                position: 'absolute',
                left: `${selection.rubber.x}px`,
                top: `${selection.rubber.y}px`,
                width: `${selection.rubber.w}px`,
                height: `${selection.rubber.h}px`,
                pointerEvents: 'none',
                border: '1px solid #888',
                backgroundColor: 'rgba(0, 0, 0, 0.3)'
              }"
            ></div>
          </div>
                </div>
      </template>

      <!-- 内容右侧：属性面板 -->
      <template #bodyRight>
        <PropertiesPanel
          :selected-node="selectedNode"
          :selected-connection="selectedConnection"
          :text-config="nodeTextConfig"
          :font-family-options="fontFamilyOptions"
          @delete-selected="deleteSelected"
          @update-node="updateNode"
          @update-connection="updateConnection"
        />
      </template>
    </btc-grid-group>

    <!-- 预览对话框 -->
    <el-dialog v-model="showPreview" title="策略执行预览" width="80%">
      <StrategyExecutionPreview
        :orchestration="currentOrchestration"
        @close="showPreview = false"
      />
    </el-dialog>

    <!-- 形状选择弹窗 -->
    <ShapeSelectorPopup
      :visible="showComponentMenuFlag"
      :position="componentMenuPosition"
      :components="getCommonComponents()"
      :get-fill="getNodeFillColor"
      :get-stroke="getNodeStrokeColor"
      @select="selectComponent"
            />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useI18n, logger } from '@btc/shared-core';
import { useSelection } from './composables/useSelection';
// import { BtcGridGroup } from '@btc/shared-components'; // ⚠️ 组件不存在，已从导出中移除，需要实现或使用替代方案
import { useComponentLibrary } from './composables/useComponentLibrary';
import { useCanvasInteraction } from './composables/useCanvasInteraction';
import { useNodeManagement } from './composables/useNodeManagement';
import { useConnectionManagement } from './composables/connection';
import { useStrategyOperations } from './composables/useStrategyOperations';
import { useNodeDrag } from './composables/useNodeDrag';
import { useNodeResize } from './composables/useNodeResize';
import { useNodeGeometry } from './composables/useNodeGeometry';
import { useNodeStyle } from './composables/useNodeStyle';
import { useConnectionHandles } from './composables/useConnectionHandles';
import { useComponentMenu } from './composables/useComponentMenu';
import { useTextEditor } from './composables/useTextEditor';
import { useCanvasDimensions } from './composables/useCanvasDimensions';
import { useCanvasScale } from './composables/useCanvasScale';
import { useNodeInteraction } from './composables/useNodeInteraction';
import { useUtils } from './composables/useUtils';
import { useUndoRedo } from './composables/useUndoRedo';
import { useAutoSave } from './composables/useAutoSave';
import CanvasSvg from './components/CanvasSvg.vue';
import ConnectionHandlesOverlay from './components/ConnectionHandlesOverlay.vue';
import NodeItem from './components/NodeItem.vue';
import StrategyExecutionPreview from './components/StrategyExecutionPreview.vue';
import TopToolbar from './components/TopToolbar.vue';
import ComponentLibraryPanel from './components/ComponentLibraryPanel.vue';
import PropertiesPanel from './components/PropertiesPanel.vue';
import ShapeSelectorPopup from './components/ShapeSelectorPopup.vue';

// 画布引用
const canvasRef = ref<InstanceType<typeof CanvasSvg> | null>(null);

const { t } = useI18n();

// 使用 composables - 按依赖顺序初始化

// 1. 基础 composables（无依赖）
const { generateId, domUid } = useUtils();
const { canvasDimensions } = useCanvasDimensions();

// 2. 画布交互和缩放（需要基础 composables）
// 先创建临时 updateTempConnection，稍后更新
let updateTempConnectionTemp: ((event: MouseEvent, canvasRef?: HTMLElement) => void) | undefined;
const {
  panX,
  panY,
  resetZoom,
  handleCanvasMouseDown,
  handleCanvasMouseMove,
  handleCanvasMouseUp
} = useCanvasInteraction((event: MouseEvent, canvasRef?: HTMLElement) => {
  updateTempConnectionTemp?.(event, canvasRef);
});

const {
  canvasScale,
  minScale,
  maxScale,
  scaleInputValue,
  handleZoomIn,
  handleZoomOut,
  handleZoomCommand,
  handleScaleInputChange,
  handleScaleInputBlur,
  handleScaleInputEnter
} = useCanvasScale(panX, panY);

// 3. 节点管理（需要 canvasDimensions）
const {
  nodes,
  selectedNode,
  selectedNodeId,
  isDragging: nodeIsDragging,
  addNode,
  updateNode: updateNodeOriginal,
  selectNode,
  moveNode
} = useNodeManagement(canvasDimensions);

// 4. 连接管理（需要 nodes）
const {
  connections,
  selectedConnectionId,
  selectedConnection,
  connectionState,
  tempConnection,
  connectionPaths,
  updateTempConnection,
  completeConnection,
  connectionOffsetY,
  selectConnection,
  updateConnection: updateConnectionOriginal,
  updateConnectionPaths
} = useConnectionManagement(nodes);

// 设置全局函数，供节点拖拽和缩放时调用
(window as any).updateConnectionPaths = updateConnectionPaths;

// 更新 useCanvasInteraction 的 updateTempConnection
updateTempConnectionTemp = updateTempConnection;

// 5. 几何计算和样式（需要 canvasDimensions 和 connectionState）
const {
  getHandlePositions,
  getArrowTransform,
  getArrowTransformByPos,
  getPositionBoxLocalTransform
} = useNodeGeometry(canvasDimensions);

const {
  getNodeText,
  getNodeFillColor,
  getNodeStrokeColor,
  getNodeTextColor,
  getConnectionColor,
  getTempConnectionColor,
  getGridColor
} = useNodeStyle(nodes, connectionState);

// 6. 连接手柄（需要 connections, nodes, connectionOffsetY, canvasScale）
const {
  getConnectionHandle,
  startDragConnectionHandle
} = useConnectionHandles(connections, nodes, connectionOffsetY, canvasScale);

// 7. 组件库（需要 nodes）
const {
  componentSearch,
  activeCategories,
  filteredComponentCategories,
  componentLibrary,
  handleComponentDragStart
} = useComponentLibrary(nodes);

// 9. 组件菜单状态（需要其他 composables）
const activeArrowDirection = ref('');
const {
  showComponentMenuFlag,
  componentMenuPosition,
  showComponentMenu,
  selectComponent,
  closeComponentMenu,
  getCommonComponents,
  findNearbyNode,
  createConnection: createConnectionOriginal
} = useComponentMenu(
  nodes,
  connections,
  componentLibrary,
  addNode,
  generateId,
  getConnectionColor,
  activeArrowDirection
);

// 包装 createConnection 以记录历史状态（必须在 useNodeInteraction 之前定义）
// 暂时不在这里记录历史，稍后在正确位置包装
let createConnectionFromMenu = (sourceNode: any, targetNode: any, direction: string) => {
  createConnectionOriginal(sourceNode, targetNode, direction);
};

// 10. 文本编辑（需要多个依赖）- 先创建，dragState稍后更新
// 先创建 dragState 的占位符（可写 ref，便于 useTextEditor 写入）
const dragStatePlaceholder = {
  isDragging: ref(false),
  maybeDrag: ref(false)
};

const {
  editingNodeId,
  isOverlayEditing,
  nodeTextConfig,
  defaultTextConfig,
  fontFamilyOptions,
  handleNodeDoubleClick
} = useTextEditor(
  nodes,
  selectedNodeId,
  canvasScale,
  panX,
  panY,
  canvasDimensions,
  dragStatePlaceholder,
  getNodeText
);

// 10. 节点缩放（需要多个依赖）
const isMouseOnNodeBorder = ref(false);
const {
  isResizing,
  handleResizeHandleEnter,
  handleResizeHandleLeave,
  handleResizeStart,
  handleResizeMove,
  handleResizeEnd
} = useNodeResize(
  nodes,
  selectedNodeId,
  canvasDimensions,
  canvasScale,
  isMouseOnNodeBorder,
  getHandlePositions,
  getArrowTransform,
  getArrowTransformByPos
);

// 11. 节点拖拽（需要多个依赖）
const {
  dragState,
  isDragging,
  draggingNodeId,
  handleNodePointerDown,
  handleNodePointerMove,
  handleNodePointerUp,
  dragStateRefs
} = useNodeDrag(
  nodes,
  selectedNodeId,
  canvasDimensions,
  canvasScale,
  isResizing,
  isOverlayEditing,
  nodeIsDragging,
  moveNode,
  getHandlePositions,
  getArrowTransformByPos,
  handleNodeDoubleClick
);

// 同步 useNodeDrag 的状态到占位符（保持可写）
watch(dragStateRefs.isDragging, v => { dragStatePlaceholder.isDragging.value = v; }, { immediate: true });
watch(dragStateRefs.maybeDrag, v => { dragStatePlaceholder.maybeDrag.value = v; }, { immediate: true });

// 12. 选择与橡皮筋（依赖多个 composables，需要在 useNodeInteraction 之前定义）
const selection = useSelection({
  nodes,
  connections,
  panX,
  panY,
  canvasScale,
  isOverlayEditing,
  connectionState,
  selectedNodeId,
  connectionOffsetY,
  getConnectionHandle,
  fallthrough: { handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp }
});
const multiSelectedNodeIds = selection.multiSelectedNodeIds;
const multiSelectedConnectionIds = selection.multiSelectedConnectionIds;
const lastSelectionMode = selection.lastSelectionMode;

// 13. 节点交互（需要多个依赖，包括 selection）
const lastSelectionModePlaceholder = ref<'click' | 'rubber'>('click');
const {
  hoveredArrowDirection: interactionHoveredArrowDirection,
  handleNodeClick,
  handleNodeMouseEnter,
  handleNodeMouseLeave,
  handleArrowClick,
  handleArrowEnter,
  handleArrowLeave,
  handleCanvasClick,
  handleCanvasDragLeave
} = useNodeInteraction(
  nodes,
  selectedNodeId,
  isOverlayEditing,
  editingNodeId,
  showComponentMenuFlag,
  closeComponentMenu,
  activeArrowDirection,
  lastSelectionModePlaceholder,
  findNearbyNode,
  createConnectionFromMenu,
  showComponentMenu,
  nodeTextConfig,
  defaultTextConfig,
  isMouseOnNodeBorder,
  selection.clearMultiSelection,
  () => { selectedConnectionId.value = ''; } // 清空连接线选中状态
);
// 兼容模板旧引用名
const hoveredArrowDirection = interactionHoveredArrowDirection;

// 更新 lastSelectionModePlaceholder 的值
watch(lastSelectionMode, (val) => {
  lastSelectionModePlaceholder.value = (val === 'rubber') ? 'rubber' : 'click';
}, { immediate: true });

// 14. 撤销/重做管理（需要 nodes, connections, connectionOffsetY）
const {
  recordHistory,
  undo,
  redo,
  clearHistory,
  canUndo,
  canRedo
} = useUndoRedo(nodes, connections, connectionOffsetY);

// 15. 策略操作（需要 nodes, connections）
const {
  strategyName,
  currentOrchestration,
  showPreview,
  validateOrchestration,
  previewExecution,
  handleSave
} = useStrategyOperations(nodes, connections);

// 16. 自动保存（需要 nodes, connections, connectionOffsetY, canvasScale, strategyName）
const {
  saveNow,
  loadFromIndexedDB,
  getFileList,
  deleteFile
} = useAutoSave({
  nodes,
  connections,
  connectionOffsetY,
  canvasPosition: { x: panX, y: panY }, // 传递当前画布位置 refs
  canvasScale,
  strategyName,
  autoSaveEnabled: true
});

// 监听文本编辑结束，触发保存
watch(isOverlayEditing, (newVal, oldVal) => {
  // 当编辑状态从 true 变为 false 时，表示文本编辑完成
  if (oldVal && !newVal) {
    recordHistory();
    saveNow();
  }
});

// 重新包装 createConnectionFromMenu 以记录历史状态
createConnectionFromMenu = (sourceNode: any, targetNode: any, direction: string) => {
  createConnectionOriginal(sourceNode, targetNode, direction);
  recordHistory();
  saveNow();
};

// 包装 updateNode 和 updateConnection 以触发保存
const updateNode = (nodeId: string, updates: any) => {
  updateNodeOriginal(nodeId, updates);
  recordHistory();
  saveNow();
};

const updateConnection = (connectionId: string, updates: any) => {
  updateConnectionOriginal(connectionId, updates);
  recordHistory();
  saveNow();
};

// 处理画布拖放
const handleCanvasDrop = async (event: DragEvent) => {
  event.preventDefault();

  const componentType = event.dataTransfer?.getData('component-type');
  const componentData = event.dataTransfer?.getData('application/json');

  if (componentType && componentData) {
    try {
      const component = JSON.parse(componentData);
      const rect = (event.target as HTMLElement).getBoundingClientRect();

      // 计算相对于画布的位置（考虑缩放和平移）
      const x = (event.clientX - rect.left - panX.value) / canvasScale.value;
      const y = (event.clientY - rect.top - panY.value) / canvasScale.value;

      // 添加节点
      await addNode(component, { x, y });
      // 添加节点后记录历史状态
      recordHistory();
      saveNow();
    } catch (error) {
      logger.error('Failed to parse component data:', error);
    }
  }
};


// 生成网格背景的 SVG pattern（base64 编码）
const gridPatternSvg = computed(() => {
  const gridSize = 40; // pattern 单位尺寸
  const smallGridStep = 10; // 小网格步长

  const svg = `
<svg style="color-scheme: light dark;" width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
      <path d="M 0 ${smallGridStep} L ${gridSize} ${smallGridStep} M ${smallGridStep} 0 L ${smallGridStep} ${gridSize} M 0 ${smallGridStep * 2} L ${gridSize} ${smallGridStep * 2} M ${smallGridStep * 2} 0 L ${smallGridStep * 2} ${gridSize} M 0 ${smallGridStep * 3} L ${gridSize} ${smallGridStep * 3} M ${smallGridStep * 3} 0 L ${smallGridStep * 3} ${gridSize}" fill="none" style="stroke: light-dark(#d0d0d0, #424242);" stroke="#d0d0d0" opacity="0.2" stroke-width="1"/>
      <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" fill="none" style="stroke: light-dark(#d0d0d0, #424242);" stroke="#d0d0d0" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)"/>
</svg>`.trim();

  return `data:image/svg+xml;base64,${btoa(svg)}`;
});

// 网格背景 div 的样式：尺寸基于 canvasDimensions，在 body_middle 中水平垂直居中
// 注意：不设置 z-index，依赖 DOM 顺序和 pointer-events: none 来避免拦截事件
// 使用 box-sizing: border-box 确保边框包含在尺寸内，简化坐标计算
const gridBackgroundStyle = computed(() => {
  return {
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
    width: `${canvasDimensions.value.width}px`,
    height: `${canvasDimensions.value.height}px`,
    marginLeft: `-${canvasDimensions.value.width / 2}px`,
    marginTop: `-${canvasDimensions.value.height / 2}px`,
    boxSizing: 'border-box' as const,
    borderTopWidth: '1px',
    borderRightWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderStyle: 'solid' as const,
    borderColor: 'var(--el-border-color)',
    overflow: 'hidden' as const,
    backgroundColor: 'var(--el-bg-color)',
    backgroundImage: `url("${gridPatternSvg.value}")`,
    backgroundPosition: '-1px -1px',
    pointerEvents: 'none' as const
  };
});

// 删除选中的元素（直接删除，不需要确认）
const deleteSelected = () => {
  // 正在拖拽或缩放时，不允许删除
  if (isDragging.value || isResizing.value || dragState.maybeDrag) {
    return;
  }

  // 优先处理多选
  if (multiSelectedNodeIds.value.size > 0 || multiSelectedConnectionIds.value.size > 0) {
    // 删除多选的节点
    if (multiSelectedNodeIds.value.size > 0) {
      const nodesToDelete = Array.from(multiSelectedNodeIds.value);
      nodes.value = nodes.value.filter(n => !nodesToDelete.includes(n.id));
    }
    
    // 删除多选的连接线
    if (multiSelectedConnectionIds.value.size > 0) {
      const connsToDelete = Array.from(multiSelectedConnectionIds.value);
      connections.value = connections.value.filter(conn => !connsToDelete.includes(conn.id));
    }
    
    // 清空多选状态
    selection.clearMultiSelection();
    
    // 清空单选状态
    selectedNodeId.value = '';
    selectedConnectionId.value = '';
    
    // 删除后记录历史状态
    recordHistory();
    saveNow();
    
    return;
  }

  // 处理单选
  if (selectedNode.value) {
    const nodeId = selectedNode.value.id;
    const nodeExists = nodes.value.some(n => n.id === nodeId);
    if (nodeExists) {
      // 在删除前记录历史状态（确保连线在节点存在时的正确状态被保存）
      recordHistory();
      
      nodes.value = nodes.value.filter(n => n.id !== nodeId);

      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = '';
      }
      
      // 删除后再次记录历史状态（记录删除后的悬空连线状态）
      nextTick(() => {
        recordHistory();
        saveNow();
      });
    }
  } else if (selectedConnection.value) {
    const connectionId = selectedConnection.value.id;
    const connectionExists = connections.value.some(c => c.id === connectionId);
    if (connectionExists) {
      connections.value = connections.value.filter(conn => conn.id !== connectionId);

      if (selectedConnectionId.value === connectionId) {
        selectedConnectionId.value = '';
      }
      
      // 删除后记录历史状态
      recordHistory();
      saveNow();
    }
  }
};

// 全局键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  // 处理撤销/重做快捷键
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    if (event.shiftKey) {
      // Ctrl+Shift+Z 或 Cmd+Shift+Z: 重做
      redo();
    } else {
      // Ctrl+Z 或 Cmd+Z: 撤销
      undo();
    }
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
    // Ctrl+Y 或 Cmd+Y: 重做
    event.preventDefault();
    redo();
    return;
  }

  // 编辑文本或覆盖编辑器激活时，屏蔽全局删除/快捷键
  if (editingNodeId.value || isOverlayEditing.value) {
    return;
  }

  // 正在拖拽或缩放时，屏蔽删除操作，避免意外删除节点
  if (isDragging.value || isResizing.value) {
    return;
  }

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (selectedNode.value || selectedConnection.value || multiSelectedNodeIds.value.size > 0 || multiSelectedConnectionIds.value.size > 0) {
      event.preventDefault();
      deleteSelected();
    }
  }
};

// 全局鼠标事件处理
const handleGlobalMouseMove = (event: MouseEvent) => {
  // 处理缩放移动
  if (isResizing.value) {
    handleResizeMove(event);
  }
  // 处理节点拖拽
  handleNodePointerMove(event);
  // 处理画布鼠标移动
  handleCanvasMouseMove(event);
};

const handleGlobalMouseUp = (event: MouseEvent) => {
  // 处理缩放结束
  if (isResizing.value) {
    handleResizeEnd();
    // 缩放结束后记录历史状态
    recordHistory();
    saveNow();
  }
  // 处理节点拖拽结束
  const wasDragging = dragState.isDragging || dragState.maybeDrag;
  handleNodePointerUp(event);
  // 如果节点被拖拽过，记录历史状态
  if (wasDragging) {
    recordHistory();
    saveNow();
  }
  // 处理画布鼠标抬起
  handleCanvasMouseUp();
};

// 监听画布尺寸变化，转换节点坐标以保持相对位置
// 保存上一次的网格偏移量，确保转换时基于相对坐标计算，避免误差累积
const lastGridOffset = ref<{ x: number; y: number } | null>(null);
const lastCanvasDimensions = ref<{ width: number; height: number } | null>(null);

watch(() => canvasDimensions.value, (newDims) => {
  // 防止在拖拽或缩放过程中触发
  if (isDragging.value || isResizing.value) {
    return;
  }

  // 获取当前容器尺寸
  const container = document.querySelector('.canvas-scroll') as HTMLElement | null;
  if (!container) return;

  const containerRect = container.getBoundingClientRect();
  const currentContainerWidth = containerRect.width;
  const currentContainerHeight = containerRect.height;

  const borderWidth = 1;
  // 标准化偏移量计算：对计算结果进行取整，确保一致性，避免浮点数精度问题
  const currentGridOffsetX = Math.round((currentContainerWidth - newDims.width) / 2 + borderWidth);
  const currentGridOffsetY = Math.round((currentContainerHeight - newDims.height) / 2 + borderWidth);

  // 如果是第一次初始化，只记录偏移量和网格尺寸，不转换坐标
  if (!lastGridOffset.value || !lastCanvasDimensions.value) {
    lastGridOffset.value = { x: currentGridOffsetX, y: currentGridOffsetY };
    lastCanvasDimensions.value = { ...newDims };
    return;
  }

  // 只有当网格尺寸或偏移量有显著变化时才进行转换
  // 由于偏移量已取整，这里检查整数差异即可
  const gridSizeChanged =
    Math.abs(newDims.width - lastCanvasDimensions.value.width) > 0.5 ||
    Math.abs(newDims.height - lastCanvasDimensions.value.height) > 0.5;

  const offsetChanged =
    currentGridOffsetX !== lastGridOffset.value.x ||
    currentGridOffsetY !== lastGridOffset.value.y;

  if (!gridSizeChanged && !offsetChanged) {
    // 没有显著变化，只更新记录
    lastGridOffset.value = { x: currentGridOffsetX, y: currentGridOffsetY };
    lastCanvasDimensions.value = { ...newDims };
    return;
  }

  // 有显著变化，转换所有节点坐标
  // 重要：基于相对坐标计算，避免误差累积
  nodes.value.forEach(node => {
    // 计算节点在旧网格系统中的相对坐标（精确值，不取整）
    const relativeX = node.position.x - lastGridOffset.value!.x;
    const relativeY = node.position.y - lastGridOffset.value!.y;

    // 计算节点在新网格系统中的绝对坐标
    const newAbsoluteX = relativeX + currentGridOffsetX;
    const newAbsoluteY = relativeY + currentGridOffsetY;

    // 更新节点位置（最后才取整）
    const targetNode = nodes.value.find(n => n.id === node.id);
    if (targetNode) {
      targetNode.position.x = Math.round(newAbsoluteX);
      targetNode.position.y = Math.round(newAbsoluteY);
    }
  });

  // 更新记录的偏移量和网格尺寸
  lastGridOffset.value = { x: currentGridOffsetX, y: currentGridOffsetY };
  lastCanvasDimensions.value = { ...newDims };
}, { immediate: false });

// 组件挂载
onMounted(async () => {
  // 添加全局事件监听
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousemove', handleGlobalMouseMove);
  document.addEventListener('mouseup', handleGlobalMouseUp);

  // 重置缩放与位移
  try {
    resetZoom();
  } catch {
    // 忽略错误，静默处理
  }
});

// 组件卸载
onUnmounted(() => {
  // 移除全局事件监听
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('mousemove', handleGlobalMouseMove);
  document.removeEventListener('mouseup', handleGlobalMouseUp);
});

// 处理组件点击 - 在当前可视区域中心创建组件（考虑缩放与平移）
const handleComponentClick = async (component: any) => {
  const svg = document.querySelector('.strategy-canvas') as SVGSVGElement | null;
  if (!svg) return;

  const rect = svg.getBoundingClientRect();
  const viewCenterClientX = rect.left + rect.width / 2;
  const viewCenterClientY = rect.top + rect.height / 2;

  // 将屏幕坐标转换为画布本地坐标
  const centerX = (viewCenterClientX - rect.left - panX.value) / canvasScale.value;
  const centerY = (viewCenterClientY - rect.top - panY.value) / canvasScale.value;

  // 与 useNodeManagement 保持一致的默认尺寸
  let nodeWidth = component.style?.width || 120;
  let nodeHeight = component.style?.height || 60;
  if (component.type === 'START' || component.type === 'END') {
    nodeWidth = 60;
    nodeHeight = 60;
  }

  // 计算左上角使节点中心对齐视口中心
  const nodeX = centerX - nodeWidth / 2;
  const nodeY = centerY - nodeHeight / 2;

  await addNode(component, { x: nodeX, y: nodeY });
  // 添加节点后记录历史状态
  recordHistory();
  saveNow();
};

// 包装 completeConnection 以记录历史状态
const handleCompleteConnection = (nodeId: string) => {
  const result = completeConnection(nodeId);
  if (result) {
    // 只有成功创建连接时才记录历史
    recordHistory();
    saveNow();
  }
};

// 暴露给子组件的方法
defineExpose({
  completeConnection: handleCompleteConnection,
  selectNode,
  selectConnection
});
</script>

<style lang="scss">
@use './styles/index.scss';
</style>
