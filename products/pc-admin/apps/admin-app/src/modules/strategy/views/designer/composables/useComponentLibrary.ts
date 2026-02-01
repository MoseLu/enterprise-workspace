;
﻿import { ref, computed, type Ref } from 'vue';
import type { NodeType } from '@/types/strategy';
import { NodeType as NodeTypeEnum } from '@/types/strategy';
import { logger } from '@btc/shared-core';

/**
 * 组件库管理
 */
export function useComponentLibrary(nodes?: Ref<any[]>) {
  // 搜索状态
  const componentSearch = ref('');
  const activeCategories = ref(['basic', 'advanced']);

  // 检查节点类型是否已存在
  const isNodeTypeExists = (nodeType: NodeType): boolean => {
    if (!nodes?.value) return false;
    return nodes.value.some(node => node.type === nodeType);
  };

  const { t } = useI18n();
  // 组件库配置
  const componentCategories = computed(() => [
    {
      name: 'basic',
      title: t('common.strategy.designer.component_library.basic'),
      components: [
        {
          type: NodeTypeEnum.START,
          name: t('common.strategy.designer.node_types.start'),
          disabled: isNodeTypeExists(NodeTypeEnum.START)
        },
        {
          type: NodeTypeEnum.END,
          name: t('common.strategy.designer.node_types.end'),
          disabled: isNodeTypeExists(NodeTypeEnum.END)
        },
        {
          type: NodeTypeEnum.CONDITION,
          name: t('common.strategy.designer.node_types.condition'),
          disabled: false
        },
        {
          type: NodeTypeEnum.ACTION,
          name: t('common.strategy.designer.node_types.action'),
          disabled: false
        }
      ]
    },
    {
      name: 'advanced',
      title: t('common.strategy.designer.component_library.advanced'),
      components: [
        {
          type: NodeTypeEnum.DECISION,
          name: t('common.strategy.designer.node_types.decision'),
          disabled: false
        },
        {
          type: NodeTypeEnum.GATEWAY,
          name: t('common.strategy.designer.node_types.gateway'),
          disabled: false
        }
      ]
    }
  ]);

  // 过滤后的组件分类
  const filteredComponentCategories = computed(() => {
    if (!componentSearch.value) return componentCategories.value;

    return componentCategories.value.map(category => ({
      ...category,
      components: category.components.filter(comp =>
        comp.name.includes(componentSearch.value)
      )
    })).filter(category => category.components.length > 0);
  });

  // 拖拽处理
  const handleComponentDragStart = (event: DragEvent, component: any) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(component));
      event.dataTransfer.setData('component-type', component.type);
      event.dataTransfer.effectAllowed = 'copy';

      // 创建自定义拖拽图像 - 使用实际组件大小
      const dragImage = document.createElement('canvas');
      dragImage.width = 120;
      dragImage.height = 60;
      const ctx = dragImage.getContext('2d');

      if (ctx) {
        // 绘制组件背景
        const fillColor = getNodeFillColor(component.type);
        const strokeColor = getNodeStrokeColor(component.type);
        const textColor = getNodeTextColor(component.type);

        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, 120, 60);

        // 绘制边框
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 118, 58);

        // 绘制文本
        ctx.fillStyle = textColor;
        ctx.font = '14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getNodeText(component.type), 60, 30);
      }

      event.dataTransfer.setDragImage(dragImage, 60, 30); // 使用组件中心作为拖拽点
    }
  };

  // 获取节点填充颜色
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

  // 获取节点边框颜色
  const getNodeStrokeColor = (type: NodeType): string => {
    return getNodeFillColor(type);
  };

  // 获取节点文本颜色
  const getNodeTextColor = (type: NodeType): string => {
    return '#ffffff';
  };

  // 获取节点文本
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

  const handleCanvasDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  const parseDropData = (event: DragEvent) => {
    if (!event.dataTransfer) return null;

    try {
      return JSON.parse(event.dataTransfer.getData('application/json'));
    } catch (error) {
      logger.error('Failed to parse drop data:', error);
      return null;
    }
  };

  // 扁平化的组件库（用于弹窗选择）
  const componentLibrary = computed(() => {
    return componentCategories.value.flatMap(category => category.components);
  });

  return {
    // 状态
    componentSearch,
    activeCategories,
    componentCategories,
    filteredComponentCategories,
    componentLibrary,

    // 方法
    handleComponentDragStart,
    handleCanvasDragOver,
    parseDropData
  };
}
