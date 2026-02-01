<template>
  <g class="connection-handles-overlay">
    <!-- 调试信息 -->
    <text v-if="false" x="10" y="20" fill="red" font-size="12">
      {{ `isDragging: ${isDragging}, isResizing: ${isResizing}, selectedCount: ${selectedConnectionsWithHandles.length}` }}
    </text>
    <template v-for="item in selectedConnectionsWithHandles" :key="`handles-${item.pathData.id}`">
      <g>
                 <!-- 起点：实心蓝色圆圈 + 内部小白圆（不可拖拽） -->
                 <g :style="{ pointerEvents: 'auto', cursor: item.pathData.direction === 'horizontal' ? 'row-resize' : 'col-resize' }" class="connection-handle-start">
                   <circle 
                     :cx="item.handle.sx" 
                     :cy="item.handle.sy" 
                     r="6" 
                     fill="#409eff" 
                     stroke="#fff" 
                     stroke-width="2" 
                   />
                   <circle 
                     :cx="item.handle.sx" 
                     :cy="item.handle.sy" 
                     r="3" 
                     fill="#fff" 
                   />
                 </g>
                 <!-- 每段的中点：实心圆手柄（可拖拽） -->
                 <template v-for="(middleHandle, index) in item.handle.middleHandles" :key="`middle-${item.pathData.id}-${index}`">
                   <circle 
                     :cx="middleHandle.x" 
                     :cy="middleHandle.y" 
                     r="6" 
                     fill="#409eff" 
                     stroke="#fff" 
                     stroke-width="2" 
                     :style="{ cursor: item.pathData.direction === 'horizontal' ? 'row-resize' : 'col-resize', pointerEvents: 'auto' }" 
                     class="connection-handle-middle"
                     @mousedown.stop="(e) => startDrag(e, item.pathData.id, middleHandle.segmentIndex)" 
                   />
                 </template>
                 <!-- 终点：实心蓝色圆圈 + 内部小白圆（不可拖拽） -->
                 <g :style="{ pointerEvents: 'auto', cursor: item.pathData.direction === 'horizontal' ? 'row-resize' : 'col-resize' }" class="connection-handle-end">
                   <circle 
                     :cx="item.handle.tx" 
                     :cy="item.handle.ty" 
                     r="6" 
                     fill="#409eff" 
                     stroke="#fff" 
                     stroke-width="2" 
                   />
                   <circle 
                     :cx="item.handle.tx" 
                     :cy="item.handle.ty" 
                     r="3" 
                     fill="#fff" 
                   />
                 </g>
      </g>
    </template>
  </g>
</template>

<script setup lang="ts">
import { computed, watch, type Ref, unref } from 'vue';

const props = defineProps<{
  connectionPaths: Array<{ id: string; path?: string; direction?: 'horizontal' | 'vertical' } & Record<string, any>>;
  isSelected: (id: string) => boolean;
  selectedConnectionId?: string | Ref<string>;
  multiSelectedConnectionIds?: Set<string> | Ref<Set<string>>;
  getConnectionHandle: (id: string, pathString?: string) => { sx: number; sy: number; middleHandles: Array<{ x: number; y: number; segmentIndex: number }>; tx: number; ty: number };
  startDrag: (e: MouseEvent, id: string, segmentIndex?: number) => void;
  isDragging: boolean;
  isResizing: boolean;
}>();

const { isSelected, getConnectionHandle, startDrag, isDragging, isResizing } = props;


// 计算选中的连接线及其手柄数据
// 显式依赖 connectionPaths、selectedConnectionId、multiSelectedConnectionIds、isDragging、isResizing
const selectedConnectionsWithHandles = computed(() => {
  // 强制访问 props.connectionPaths，确保响应式追踪
  // 注意：connectionPaths 可能是 ref，需要解包
  const rawPaths = props.connectionPaths;
  const paths = Array.isArray(rawPaths) ? rawPaths : (rawPaths && typeof rawPaths === 'object' && 'value' in rawPaths ? rawPaths.value : unref(rawPaths) || []);
  const dragging = isDragging;
  const resizing = isResizing;
  
  // 显式访问选中状态（使用 unref 支持 Ref 和普通值），触发响应式追踪
  // 注意：直接访问 props 中的 ref 会自动解包，但为了确保响应式追踪，我们需要显式访问
  const selectedId = props.selectedConnectionId !== undefined ? (typeof props.selectedConnectionId === 'string' ? props.selectedConnectionId : unref(props.selectedConnectionId)) : '';
  const multiIds = props.multiSelectedConnectionIds !== undefined ? (props.multiSelectedConnectionIds instanceof Set ? props.multiSelectedConnectionIds : unref(props.multiSelectedConnectionIds)) : new Set<string>();
  
  
  // 如果正在拖拽或缩放，不显示手柄
  if (dragging || resizing) {
    return [];
  }
  
  // 确保 paths 是数组
  if (!Array.isArray(paths)) {
    return [];
  }
  
  // 如果 paths 为空数组，直接返回（这是正常的，当没有连接时）
  if (paths.length === 0) {
    return [];
  }
  
  // 过滤选中的连接线
  const selected = paths.filter(pathData => {
    // 优先使用直接传递的 props
    if (props.selectedConnectionId !== undefined || props.multiSelectedConnectionIds !== undefined) {
      const isSelectedValue = selectedId === pathData.id || (multiIds && multiIds.has(pathData.id));
      return isSelectedValue;
    }
    // 回退到使用 isSelected 函数（向后兼容）
    return props.isSelected(pathData.id);
  });
  
  // 获取每个选中连接的手柄数据
  const withHandles = selected.map(pathData => {
    const handle = getConnectionHandle(pathData.id, pathData.path);
    return {
      pathData,
      handle
    };
  });
  
  // 过滤掉无效的手柄
  const valid = withHandles.filter(item => {
    if (!item.handle) {
      return false;
    }
    const hasValidStart = !(item.handle.sx === 0 && item.handle.sy === 0);
    const hasValidEnd = !(item.handle.tx === 0 && item.handle.ty === 0);
    const isValid = hasValidStart && hasValidEnd;
    return isValid;
  });
  
  return valid;
});

</script>


