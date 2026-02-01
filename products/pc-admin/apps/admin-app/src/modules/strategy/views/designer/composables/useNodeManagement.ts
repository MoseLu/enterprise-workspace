import { ref, computed, nextTick } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import type { StrategyNode, NodeType } from '@/types/strategy';
import { NodeType as NodeTypeEnum } from '@/types/strategy';

/**
 * 节点管理
 */
export function useNodeManagement(canvasDimensions?: { value: { width: number; height: number } }) {
  // 节点数据
  const nodes = ref<StrategyNode[]>([]);
  const selectedNodeId = ref<string>('');

  // 画布尺寸引用（从外部传入）
  const canvasDimensionsRef = canvasDimensions || { value: { width: 2000, height: 1500 } };

  // 显示框位置放置的记忆，用于防抖与消除抖动（top/bottom 保持，只有越过滞后阈值才切换）
  const positionBoxPlacement = new Map<string, 'top' | 'bottom'>();

  // 计算属性
  const selectedNode = computed(() =>
    nodes.value.find(node => node.id === selectedNodeId.value)
  );

  // 工具函数
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // 切换滞后像素
  const HYSTERESIS = 6;

  // 更新位置显示框（带放置记忆 + 滞后 + 整数坐标）
  const updatePositionBox = (nodeId: string, x: number, y: number, width: number, height: number) => {
    const positionGroup = document.querySelector(`[data-position-id="position-${nodeId}"]`) as HTMLElement;
    if (positionGroup) {
      // 获取画布尺寸：优先使用实际 SVG viewBox，回退到传入的 canvasDimensions
      let canvasWidth = canvasDimensionsRef?.value.width || 2000;
      let canvasHeight = canvasDimensionsRef?.value.height || 1500;
      const svgEl = document.querySelector('.strategy-canvas') as SVGSVGElement | null;
      if (svgEl && svgEl.viewBox && svgEl.viewBox.baseVal) {
        const vb = svgEl.viewBox.baseVal;
        if (vb && vb.width > 0 && vb.height > 0) {
          canvasWidth = vb.width;
          canvasHeight = vb.height;
        }
      }

      // 计算显示框尺寸
      const boxWidth = 70;
      const boxHeight = 18;
      const margin = 20; // 显示框与节点之间的距离

      // 候选位置（以 SVG/viewBox 坐标计算）
      const bottomX = x + width / 2 - boxWidth / 2;
      const bottomY = y + height + margin;
      const topX = x + width / 2 - boxWidth / 2;
      const topY = y - boxHeight - margin;

      // 底部空间 vs 需要空间（整数比较避免抖动）
      const bottomSpace = Math.round(canvasHeight - (y + height));
      const needSpace = Math.round(margin + boxHeight);

      // 带滞后决策：只有越过阈值才改变侧
      const prev = positionBoxPlacement.get(nodeId) ?? 'bottom';
      let nextPlacement: 'top' | 'bottom' = prev;
      if (prev === 'bottom' && bottomSpace < (needSpace - HYSTERESIS)) {
        nextPlacement = 'top';
      } else if (prev === 'top' && bottomSpace > (needSpace + HYSTERESIS)) {
        nextPlacement = 'bottom';
      } else if (!positionBoxPlacement.has(nodeId)) {
        nextPlacement = bottomSpace >= needSpace ? 'bottom' : 'top';
      }

      // 选择位置：优先底部，其次顶部，最后钳制在画布内
      // 按最终放置侧选择坐标
      let finalX: number;
      let finalY: number;
      if (nextPlacement === 'bottom') {
        finalX = bottomX;
        finalY = bottomY;
      } else {
        // nextPlacement === 'top'
        finalX = topX;
        finalY = topY;
      }

      // 保证在画布内（允许刚好贴边），并用整数坐标
      finalX = Math.round(Math.max(0, Math.min(finalX, canvasWidth - boxWidth)));
      finalY = Math.round(Math.max(0, Math.min(finalY, canvasHeight - boxHeight)));

      // 更新位置
      positionGroup.setAttribute('transform', `translate(${finalX}, ${finalY})`);

      // 记忆本次放置侧（尽管当前逻辑不依赖，但保留以便未来扩展）
      positionBoxPlacement.set(nodeId, nextPlacement);

      // 更新文本内容
      const textElement = positionGroup.querySelector('.position-box-text') as SVGElement;
      if (textElement) {
        textElement.textContent = `${Math.round(x)}, ${Math.round(y)}`;
      }
    }
  };

  // 验证节点类型唯一性
  const validateNodeTypeUniqueness = (nodeType: NodeType): { valid: boolean; message?: string } => {
    // 检查是否已存在相同类型的节点
    const existingNode = nodes.value.find(node => node.type === nodeType);

    if (nodeType === NodeTypeEnum.START && existingNode) {
      const { t } = useI18n();
      return {
        valid: false,
        message: t('common.strategy.designer.node_management.only_one_start_node')
      };
    }

    if (nodeType === NodeTypeEnum.END && existingNode) {
      return {
        valid: false,
        message: t('common.strategy.designer.node_management.only_one_end_node')
      };
    }

    return { valid: true };
  };

  const getNodeColor = (type: NodeType): string => {
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

  // 节点操作
  const addNode = async (component: any, position: { x: number; y: number }) => {
    // 验证节点类型唯一性
    const validation = validateNodeTypeUniqueness(component.type);
    if (!validation.valid) {
      BtcMessage.warning(validation.message!);
      return null;
    }

    // 根据节点类型确定尺寸
    let nodeWidth = 120;
    let nodeHeight = 60;

    // 圆形节点（START/END）使用正方形画布
    if (component.type === 'START' || component.type === 'END') {
      nodeWidth = 60;
      nodeHeight = 60;
    }

    const newNode: StrategyNode = {
      id: generateId(),
      type: component.type,
      name: component.name,
      position,
      data: {
        conditions: [],
        actions: [],
        rules: [],
        config: {}
      },
      style: {
        width: nodeWidth,
        height: nodeHeight,
        backgroundColor: getNodeColor(component.type),
        borderColor: getNodeColor(component.type)
      },
      textConfig: {
        fontSize: 16,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal'
      }
    };

    nodes.value.push(newNode);

    // Delay to ensure DOM is ready and all components are fully rendered
    await nextTick();

    return newNode;
  };

  const selectNode = (nodeId: string) => {
    selectedNodeId.value = nodeId;
  };

  const moveNode = (nodeId: string, position: { x: number; y: number }) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      // 使用Object.assign确保响应式更新
      Object.assign(node.position, position);
    }
  };

  const updateNodeProperties = (nodeId: string, properties: Partial<StrategyNode>) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, properties);
    }
  };

  const deleteNode = async (nodeId: string, skipConfirm = false) => {
    try {
      if (!skipConfirm) {
        await BtcConfirm(t('common.strategy.designer.node_management.delete_confirm'), t('common.confirm_delete'), {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        });
      }

      nodes.value = nodes.value.filter(n => n.id !== nodeId);

      if (selectedNodeId.value === nodeId) {
        selectedNodeId.value = '';
      }

      BtcMessage.success(t('common.strategy.designer.node_management.delete_success'));
      return true;
    } catch {
      return false;
    }
  };

  const clearNodes = () => {
    nodes.value = [];
    selectedNodeId.value = '';
  };

  // 更新节点
  const updateNode = (nodeId: string, updates: Partial<StrategyNode>) => {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      Object.assign(node, updates);
    }
  };

  // 获取节点样式（SVG 版本）
  const getNodeStyle = (node: StrategyNode) => {
    // SVG 节点不需要返回样式，位置通过 transform 属性处理
    return {};
  };

  // 获取节点图标
  const getNodeIcon = (type: NodeType): string => {
    const iconMap: Record<NodeType, string> = {
      [NodeTypeEnum.START]: 'VideoPlay',
      [NodeTypeEnum.END]: 'VideoPause',
      [NodeTypeEnum.CONDITION]: 'QuestionFilled',
      [NodeTypeEnum.ACTION]: 'Lightning',
      [NodeTypeEnum.DECISION]: 'Share',
      [NodeTypeEnum.GATEWAY]: 'Connection'
    };
    return iconMap[type] || 'Lightning';
  };

  // 获取输出连接点样式类
  const getOutputConnectionClass = (node: StrategyNode) => {
    if (node.type === 'CONDITION') {
      return 'conditional';
    }
    return '';
  };

  // 拖拽状态
  const isDragging = ref(false);
  const draggingNodeId = ref<string | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });
  const dragStartPosition = ref({ x: 0, y: 0 });

  // 处理节点鼠标按下
  const handleNodeMouseDown = (event: MouseEvent, node: StrategyNode, isEditingText = false, canvasDimensions?: { width: number; height: number }) => {
    // 如果正在编辑文本，不启动拖拽
    if (isEditingText) {
      return;
    }

    // 检查点击的是否是连接点
    const target = event.target as HTMLElement;
    if (target.classList.contains('connection-point')) {
      // 如果是连接点，不阻止事件冒泡，让连接点处理
      return;
    }

    event.stopPropagation();
    selectNode(node.id);

    // 设置拖拽状态
    isDragging.value = true;
    draggingNodeId.value = node.id;
    dragStartPosition.value = { x: node.position.x, y: node.position.y };

    // 开始拖拽移动
    const startX = event.clientX;
    const startY = event.clientY;
    const startNodeX = node.position.x;
    const startNodeY = node.position.y;

      // 计算网格边界限制
      const nodeWidth = node.style?.width || 120;
      const nodeHeight = node.style?.height || 60;

      // 使用传入的画布尺寸，如果没有则使用默认值
      const canvasWidth = canvasDimensions?.width || 2000;
      const canvasHeight = canvasDimensions?.height || 1500;

      // 计算边界限制
      const minX = 0;
      const minY = 0;
      const maxX = canvasWidth - nodeWidth;
      const maxY = canvasHeight - nodeHeight;

    // 当前新位置，用于在 handleMouseUp 中访问
    let newPosition = {
      x: node.position.x,
      y: node.position.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // 应用边界限制
      newPosition = {
        x: Math.max(minX, Math.min(maxX, startNodeX + deltaX)),
        y: Math.max(minY, Math.min(maxY, startNodeY + deltaY))
      };

      // 直接操作SVG DOM - 节点拖拽
      const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
      if (nodeElement) {
        // 改为仅更新辅助视觉（位置框/连线），位置由响应式 node.position 驱动
        // 更新位置显示框
        updatePositionBox(node.id, newPosition.x, newPosition.y, nodeWidth, nodeHeight);

        // 实时更新连线路径
        if ((window as any).updateConnectionPaths) {
          (window as any).updateConnectionPaths();
        }
      }
    };

    const handleMouseUp = () => {
      // 将SVG状态同步回Vue数据（用于持久化）
      const nodeElement = document.querySelector(`[data-node-id="${node.id}"]`) as HTMLElement;
      if (nodeElement) {
        // 直接使用新位置同步回 Vue 数据
            moveNode(node.id, newPosition);
      }

      // 清除拖拽状态
      isDragging.value = false;
      draggingNodeId.value = null;
      dragOffset.value = { x: 0, y: 0 };
      dragStartPosition.value = { x: 0, y: 0 };

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return {
    // 状态
    nodes,
    selectedNodeId,
    selectedNode,
    isDragging,
    draggingNodeId,
    dragOffset,
    dragStartPosition,

    // 方法
    addNode,
    selectNode,
    moveNode,
    updateNodeProperties,
    updateNode,
    deleteNode,
    clearNodes,
    generateId,
    getNodeColor,
    getNodeStyle,
    getNodeIcon,
    getOutputConnectionClass,
    handleNodeMouseDown,
    updatePositionBox
  };
}
