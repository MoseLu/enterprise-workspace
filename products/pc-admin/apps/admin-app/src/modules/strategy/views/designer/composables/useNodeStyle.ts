import { computed, type Ref } from 'vue';
import { useI18n } from '@btc/shared-core';

/**
 * 节点样式getter函数
 */
export function useNodeStyle(
  nodes: Ref<any[]>,
  connectionState: { isConnecting: boolean; fromNodeId: string; fromCondition?: 'true' | 'false' }
) {
  // 获取Element Plus主题颜色
  const getThemeColor = (cssVar: string) => {
    if (typeof window !== 'undefined') {
      const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      return color || '#ffffff'; // 如果获取不到，使用白色作为默认值
    }
    return '#ffffff'; // 默认白色
  };

  // 判断是否为深色主题
  const isDarkTheme = computed(() => {
    if (typeof window !== 'undefined') {
      const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').trim();
      return bgColor.includes('dark') || bgColor.includes('#1a1a1a') || bgColor.includes('#000');
    }
    return false;
  });

  const { t } = useI18n();
  // 获取节点文字 - 简化版本
  const getNodeText = (type: string) => {
    const textMap: Record<string, string> = {
      'START': t('common.strategy.designer.node_types.start'),
      'END': t('common.strategy.designer.node_types.end'),
      'CONDITION': t('common.strategy.designer.node_types.condition'),
      'ACTION': t('common.strategy.designer.node_types.action'),
      'DECISION': t('common.strategy.designer.node_types.decision'),
      'GATEWAY': t('common.strategy.designer.node_types.gateway')
    };
    return textMap[type] || t('common.strategy.designer.node_types.node');
  };

  // 获取节点填充颜色 - 无填充，只显示形状轮廓
  const getNodeFillColor = (type: string) => {
    return 'none'; // 无填充色
  };

  // 获取节点边框颜色 - 使用 Element Plus 主题边框色
  const getNodeStrokeColor = (type: string) => {
    // 使用 Element Plus 的主题边框色变量
    if (typeof window !== 'undefined') {
      const borderColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--el-border-color')
        .trim();
      return borderColor || '#dcdfe6'; // 默认浅灰色边框
    }
    return '#dcdfe6'; // 默认浅灰色边框
  };

  // 获取节点文字颜色 - draw.io 风格
  const getNodeTextColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'START': '#2d5016',      // 深绿色
      'END': '#5c2121',        // 深红色
      'CONDITION': '#6c5b00',  // 深黄色
      'ACTION': '#1f4e79',     // 深蓝色
      'DECISION': '#4c2a5c',   // 深紫色
      'GATEWAY': '#333333'     // 深灰色
    };
    return colorMap[type] || '#333333';
  };

  // 获取连接线颜色（根据主题动态选择）
  const getConnectionColor = () => {
    return isDarkTheme.value ? getThemeColor('--el-color-white') : getThemeColor('--el-text-color-primary');
  };

  // 获取临时连接线颜色
  const getTempConnectionColor = () => {
    if (!connectionState.isConnecting || !connectionState.fromNodeId) {
      return 'var(--el-color-primary)';
    }

    const fromNode = nodes.value.find(n => n.id === connectionState.fromNodeId);
    if (!fromNode) {
      return 'var(--el-color-primary)';
    }

    // 根据节点类型和连接条件返回颜色
    if (fromNode.type === 'CONDITION' || fromNode.type === 'DECISION') {
      if (connectionState.fromCondition === 'true') {
        return 'var(--el-color-success)'; // 绿色
      } else if (connectionState.fromCondition === 'false') {
        return 'var(--el-color-danger)'; // 红色
      }
    }

    return 'var(--el-color-primary)'; // 默认蓝色
  };

  // 获取网格颜色 - 两种网格并存，固定颜色
  const getGridColor = (isSmall: boolean = true) => {
    if (isSmall) {
      // 小网格 - 较浅的颜色
      return isDarkTheme.value ? getThemeColor('--el-border-color') : getThemeColor('--el-text-color-placeholder');
    } else {
      // 大网格 - 使用合适的颜色，确保在两种主题下都可见
      if (isDarkTheme.value) {
        // 暗色主题：使用稍亮的边框色
        return getThemeColor('--el-border-color-light') || getThemeColor('--el-border-color');
      } else {
        // 亮色主题：使用更明显的颜色
        return getThemeColor('--el-text-color-regular') || getThemeColor('--el-text-color-primary') || '#606266';
      }
    }
  };

  return {
    getNodeText,
    getNodeFillColor,
    getNodeStrokeColor,
    getNodeTextColor,
    getConnectionColor,
    getTempConnectionColor,
    getGridColor,
    getThemeColor,
    isDarkTheme
  };
}

