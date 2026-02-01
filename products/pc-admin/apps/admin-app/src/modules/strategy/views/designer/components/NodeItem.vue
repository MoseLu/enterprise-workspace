<template>
  <g
    :class="[
      'strategy-node',
      node.type,
      { selected: isSelected }
    ]"
    :data-node-id="node.id"
    :transform="`translate(${node.position.x}, ${node.position.y})`"
    @mousedown.stop="(e) => $emit('pointerdown', e, node)"
    @click.stop="(e) => $emit('click', node, e)"
    @dblclick.stop="(e) => $emit('dblclick', node, e)"
    @mouseenter="() => $emit('mouseenter', node)"
    @mouseleave="() => $emit('mouseleave')"
  >
    <!-- 形状 -->
    <circle
      v-if="node.type === 'START' || node.type === 'END'"
      :cx="(node.style?.width || 120) / 2"
      :cy="(node.style?.height || 60) / 2"
      :r="Math.min((node.style?.width || 120), (node.style?.height || 60)) / 2 - 2"
      stroke-width="2"
      class="node-rect"
      pointer-events="all"
    />
    <path
      v-else-if="node.type === 'CONDITION'"
      :d="`M ${(node.style?.width || 120) / 2} 0 L ${node.style?.width || 120} ${(node.style?.height || 60) / 2} L ${(node.style?.width || 120) / 2} ${node.style?.height || 60} L 0 ${(node.style?.height || 60) / 2} Z`"
      stroke-width="2"
      class="node-rect"
      pointer-events="all"
    />
    <rect
      v-else-if="node.type === 'ACTION'"
      :width="node.style?.width || 120"
      :height="node.style?.height || 60"
      stroke-width="2"
      rx="4"
      ry="4"
      class="node-rect"
      pointer-events="all"
    />
    <rect
      v-else
      :width="node.style?.width || 120"
      :height="node.style?.height || 60"
      stroke-width="2"
      rx="4"
      ry="4"
      class="node-rect"
      pointer-events="all"
    />

    <!-- 文本 -->
    <text
      v-if="!isEditing"
      :x="(node.style?.width || 120) / 2"
      :y="(node.style?.height || 60) / 2"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-family="node.textConfig?.fontFamily || defaultTextConfig.fontFamily"
      :font-weight="node.textConfig?.fontWeight || defaultTextConfig.fontWeight"
      :font-style="node.textConfig?.fontStyle || defaultTextConfig.fontStyle"
      :font-size="(node.textConfig?.fontSize || defaultTextConfig.fontSize) + 'px'"
      class="node-text"
    >
      {{ node.text || getNodeText(node.type) }}
    </text>

    <!-- 位置显示框（局部坐标） -->
    <g v-if="showPositionBox"
       class="node-position-box"
       :transform="getPositionBoxLocalTransform(node)">
      <rect x="0" y="0" width="70" height="18" fill="rgba(0,0,0,0.8)" stroke="#666" stroke-width="1" rx="2" ry="2" />
      <text x="35" y="9" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="3" font-family="monospace">
        {{ getRelativePosition(node).x }}, {{ getRelativePosition(node).y }}
      </text>
    </g>

    <!-- 8个手柄（选中且非拖拽/非缩放/非编辑） -->
    <g v-if="showResizeHandles" class="resize-handles">
      <rect
        :x="getHandlePositions(node.type, node.style?.width || 120, node.style?.height || 60).boundaryBox.x"
        :y="getHandlePositions(node.type, node.style?.width || 120, node.style?.height || 60).boundaryBox.y"
        :width="getHandlePositions(node.type, node.style?.width || 120, node.style?.height || 60).boundaryBox.width"
        :height="getHandlePositions(node.type, node.style?.width || 120, node.style?.height || 60).boundaryBox.height"
        fill="none"
        stroke="#409eff"
        stroke-width="1"
        stroke-dasharray="4,4"
        class="boundary-box"
      />
      <g v-if="getHandleVisibility.top" class="handle-top" :transform="`translate(${(node.style?.width || 120) / 2}, 0)`">
        <circle class="resize-handle top" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="n-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'top')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
      <g v-if="getHandleVisibility.right" class="handle-right" :transform="`translate(${node.style?.width || 120}, ${(node.style?.height || 60) / 2})`">
        <circle class="resize-handle right" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="e-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'right')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
      <g v-if="getHandleVisibility.bottom" class="handle-bottom" :transform="`translate(${(node.style?.width || 120) / 2}, ${node.style?.height || 60})`">
        <circle class="resize-handle bottom" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="s-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'bottom')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
      <g v-if="getHandleVisibility.left" class="handle-left" :transform="`translate(0, ${(node.style?.height || 60) / 2})`">
        <circle class="resize-handle left" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="w-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'left')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
      <g class="handle-top-left" :transform="`translate(0, 0)`">
        <circle class="resize-handle top-left" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="nw-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'top-left')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
      <g class="handle-top-right" :transform="`translate(${node.style?.width || 120}, 0)`">
        <circle class="resize-handle top-right" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="ne-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'top-right')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
      <g class="handle-bottom-left" :transform="`translate(0, ${node.style?.height || 60})`">
        <circle class="resize-handle bottom-left" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="sw-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'bottom-left')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
      <g class="handle-bottom-right" :transform="`translate(${node.style?.width || 120}, ${node.style?.height || 60})`">
        <circle class="resize-handle bottom-right" cx="0" cy="0" r="6" fill="#409eff" stroke="white" stroke-width="2" cursor="se-resize"
                @mousedown.stop="(e) => $emit('resize-start', e, node, 'bottom-right')"
                @mouseenter="$emit('handle-enter')" @mouseleave="$emit('handle-leave')" />
      </g>
    </g>

    <!-- 四向箭头（选中且非拖拽/无弹窗时） -->
    <g v-if="showArrows" class="connection-arrows visible" style="pointer-events: none;">
      <g class="connection-arrow-group"
         :class="{ 'active': isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'top' }"
         :transform="getArrowTransform(node, 'top')" style="pointer-events: auto;"
         @click="$emit('arrow-click', $event, node, 'top')" @mouseenter="$emit('arrow-enter','top')" @mouseleave="$emit('arrow-leave')">
        <path d="M 56 -10 L 56 -30 L 52 -30 L 60 -40 L 68 -30 L 64 -30 L 64 -10 Z" class="arrow-shape" />
      </g>
      <g class="connection-arrow-group"
         :class="{ 'active': isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'right' }"
         :transform="getArrowTransform(node, 'right')" style="pointer-events: auto;"
         @click="$emit('arrow-click', $event, node, 'right')" @mouseenter="$emit('arrow-enter','right')" @mouseleave="$emit('arrow-leave')">
        <path d="M 10 26 L 30 26 L 30 22 L 40 30 L 30 38 L 30 34 L 10 34 Z" class="arrow-shape" />
      </g>
      <g class="connection-arrow-group"
         :class="{ 'active': isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'bottom' }"
         :transform="getArrowTransform(node, 'bottom')" style="pointer-events: auto;"
         @click="$emit('arrow-click', $event, node, 'bottom')" @mouseenter="$emit('arrow-enter','bottom')" @mouseleave="$emit('arrow-leave')">
        <path d="M 56 10 L 56 30 L 52 30 L 60 40 L 68 30 L 64 30 L 64 10 Z" class="arrow-shape" />
      </g>
      <g class="connection-arrow-group"
         :class="{ 'active': isSelected && !isMouseOnNodeBorder && hoveredArrowDirection === 'left' }"
         :transform="getArrowTransform(node, 'left')" style="pointer-events: auto;"
         @click="$emit('arrow-click', $event, node, 'left')" @mouseenter="$emit('arrow-enter','left')" @mouseleave="$emit('arrow-leave')">
        <path d="M 30 26 L 10 26 L 10 22 L 0 30 L 10 38 L 10 34 L 30 34 Z" class="arrow-shape" />
      </g>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  node: any;
  selectedNodeId: string;
  multiSelectedNodeIds: Set<string>;
  isDragging: boolean;
  isResizing: boolean;
  isEditing?: boolean;
  draggingNodeId: string;
  lastSelectionMode: 'none' | 'click' | 'rubber';
  multiSelectedConnectionCount: number;
  hoveredArrowDirection: string;
  isMouseOnNodeBorder: boolean;
  defaultTextConfig: { fontSize: number; fontFamily: string; fontWeight: string; fontStyle: string };
  getNodeFillColor: (type: string) => string;
  getNodeStrokeColor: (type: string) => string;
  getNodeTextColor: (type: string) => string;
  getHandlePositions: (nodeType: string, width: number, height: number) => any;
  getPositionBoxLocalTransform: (node: any) => string;
  getArrowTransform: (node: any, dir: string) => string;
  getNodeText: (type: string) => string;
  canvasDimensions?: { width: number; height: number };
  // 用于检查连接线手柄是否与节点手柄重叠
  connections?: any[];
  selectedConnectionId?: string;
  multiSelectedConnectionIds?: Set<string>;
  getConnectionHandle?: (connectionId: string, pathString?: string) => { sx: number; sy: number; middleHandles: Array<{ x: number; y: number; segmentIndex: number }>; tx: number; ty: number };
}>();

defineEmits([ 'pointerdown', 'click', 'dblclick', 'mouseenter', 'mouseleave', 'resize-start', 'handle-enter', 'handle-leave', 'arrow-click', 'arrow-enter', 'arrow-leave' ]);

const isSelected = computed(() => props.selectedNodeId === props.node.id || props.multiSelectedNodeIds.has(props.node.id));
const showPositionBox = computed(() => props.selectedNodeId === props.node.id || (props.isDragging && props.draggingNodeId === props.node.id));
// 修改条件：只有当橡皮筋选择时只选中了连接线而没有选中节点时，才隐藏节点手柄
// 如果节点也被选中了，应该显示手柄框
const showResizeHandles = computed(() => {
  if (!isSelected.value || props.isDragging || props.isResizing || props.isEditing) {
    return false;
  }
  // 如果是橡皮筋选择且只选中了连接线（当前节点不在多选列表中），才隐藏手柄
  // 如果当前节点在多选列表中，应该显示手柄
  const isInMultiSelection = props.multiSelectedNodeIds.has(props.node.id);
  if (props.lastSelectionMode === 'rubber' && props.multiSelectedConnectionCount > 0 && !isInMultiSelection) {
    return false;
  }
  return true;
});
const showArrows = computed(() => props.selectedNodeId === props.node.id && !props.isDragging);

// 检查连接线手柄是否与节点手柄位置重叠
// 返回一个对象，指示每个方向的手柄是否应该隐藏
const getHandleVisibility = computed(() => {
  const result = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    topLeft: true,
    topRight: true,
    bottomLeft: true,
    bottomRight: true
  };
  
  if (!props.connections || !props.getConnectionHandle || !showResizeHandles.value) {
    return result;
  }
  
  const nodeWidth = props.node.style?.width || 120;
  const nodeHeight = props.node.style?.height || 60;
  const nodeX = props.node.position.x;
  const nodeY = props.node.position.y;
  
  // 节点手柄的位置（绝对坐标）
  const handlePositions = {
    top: { x: nodeX + nodeWidth / 2, y: nodeY },
    right: { x: nodeX + nodeWidth, y: nodeY + nodeHeight / 2 },
    bottom: { x: nodeX + nodeWidth / 2, y: nodeY + nodeHeight },
    left: { x: nodeX, y: nodeY + nodeHeight / 2 }
  };
  
  // 检查所有选中的连接线，找出与该节点相关的连接线
  const selectedConnections = props.connections.filter((conn: any) => {
    const isSelected = props.selectedConnectionId === conn.id || 
                      (props.multiSelectedConnectionIds && props.multiSelectedConnectionIds.has(conn.id));
    // 只检查起点或终点在该节点上的连接线
    return isSelected && (conn.sourceNodeId === props.node.id || conn.targetNodeId === props.node.id);
  });
  
  const tolerance = 3; // 容差：3像素范围内认为重叠（因为手柄半径是6，所以3像素足够精确）
  
  selectedConnections.forEach((conn: any) => {
    const handle = props.getConnectionHandle!(conn.id);
    if (!handle || !handle.sx || !handle.sy || !handle.tx || !handle.ty) return;
    
    // 检查连接线起点或终点是否与节点手柄重叠
    const checkConnectionPoint = (pointX: number, pointY: number) => {
      // 检查是否与 top 手柄重叠（在节点顶部边缘中点）
      if (Math.abs(pointX - handlePositions.top.x) < tolerance && 
          Math.abs(pointY - handlePositions.top.y) < tolerance) {
        result.top = false;
      }
      // 检查是否与 right 手柄重叠（在节点右侧边缘中点）
      if (Math.abs(pointX - handlePositions.right.x) < tolerance && 
          Math.abs(pointY - handlePositions.right.y) < tolerance) {
        result.right = false;
      }
      // 检查是否与 bottom 手柄重叠（在节点底部边缘中点）
      if (Math.abs(pointX - handlePositions.bottom.x) < tolerance && 
          Math.abs(pointY - handlePositions.bottom.y) < tolerance) {
        result.bottom = false;
      }
      // 检查是否与 left 手柄重叠（在节点左侧边缘中点）
      if (Math.abs(pointX - handlePositions.left.x) < tolerance && 
          Math.abs(pointY - handlePositions.left.y) < tolerance) {
        result.left = false;
      }
    };
    
    // 如果连接线起点在该节点上，检查起点
    if (conn.sourceNodeId === props.node.id) {
      checkConnectionPoint(handle.sx, handle.sy);
    }
    // 如果连接线终点在该节点上，检查终点
    if (conn.targetNodeId === props.node.id) {
      checkConnectionPoint(handle.tx, handle.ty);
    }
  });
  
  return result;
});

// 计算相对于网格背景的坐标（网格左上角为 (0, 0)）
// 使用与边界检测完全相同的计算方式，确保一致性
const getRelativePosition = (node: any) => {
  const container = document.querySelector('.canvas-scroll') as HTMLElement | null;
  if (!container) {
    return { x: Math.round(node.position.x), y: Math.round(node.position.y) };
  }
  
  const containerWidth = container.getBoundingClientRect().width;
  const containerHeight = container.getBoundingClientRect().height;
  const gridWidth = props.canvasDimensions?.width || 2000;
  const gridHeight = props.canvasDimensions?.height || 1500;
  
  // 使用与边界检测完全相同的计算方式
  // 网格背景居中，使用 box-sizing: border-box，边框包含在尺寸内
  // 边框宽度都是 1px（四边一致：borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth）
  const borderWidth = 1;
  
  // 计算网格内容区域的左上角位置（边框内边缘）
  const gridOffsetX = (containerWidth - gridWidth) / 2 + borderWidth;
  const gridOffsetY = (containerHeight - gridHeight) / 2 + borderWidth;
  
  // 计算相对坐标（节点位置相对于网格内容区域左上角）
  // backgroundPosition: -1px -1px 只影响背景图案显示，不影响节点坐标系统
  const relativeX = node.position.x - gridOffsetX;
  const relativeY = node.position.y - gridOffsetY;
  
  // 返回相对于网格背景内容区域的坐标（网格内容左上角为原点 (0, 0)）
  // 使用 Math.floor 确保坐标向下取整，避免显示比实际位置大的值
  // 如果节点在网格左上角，应该显示 0, 0
  return {
    x: Math.floor(relativeX),
    y: Math.floor(relativeY)
  };
};
</script>


