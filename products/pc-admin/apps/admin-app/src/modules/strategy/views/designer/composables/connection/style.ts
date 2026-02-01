import type { Ref } from 'vue';
import type { StrategyConnection } from '@/types/strategy';
import { useConnectionPathGenerator } from './path-generator';

/**
 * 连接样式计算逻辑
 * 负责计算连接的样式、颜色、标记等
 */
export function useConnectionStyle(nodes: Ref<any[]>) {
  const { getConnectionPath } = useConnectionPathGenerator(nodes, {} as any);

  // 计算单个连接路径的颜色和标记
  const computeConnectionStyle = (connection: StrategyConnection) => {
    const getThemeColor = (cssVar: string) => {
      if (typeof window !== 'undefined') {
        const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
        return color || '#ffffff';
      }
      return '#ffffff';
    };

    const isDarkTheme = getThemeColor('--el-color-white') === '#ffffff' &&
                       getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').includes('dark');

    const color = connection.style?.strokeColor || (isDarkTheme ? getThemeColor('--el-color-white') : getThemeColor('--el-color-primary'));

    let marker = 'url(#arrowhead-default)';
    if (connection.condition === 'true') {
      marker = 'url(#arrowhead-true)';
    } else if (connection.condition === 'false') {
      marker = 'url(#arrowhead-false)';
    }

    return { color, marker };
  };

  // 获取连接颜色
  const getConnectionColor = (connection: StrategyConnection): string => {
    if (connection.condition === 'true') {
      return '#67c23a';
    } else if (connection.condition === 'false') {
      return '#f56c6c';
    }
    return connection.style?.strokeColor || '#409eff';
  };

  // 获取连接箭头标记
  const getConnectionMarker = (connection: StrategyConnection): string => {
    if (connection.condition === 'true') {
      return 'url(#arrowhead-true)';
    } else if (connection.condition === 'false') {
      return 'url(#arrowhead-false)';
    }
    return 'url(#arrowhead-default)';
  };

  // 计算连线方向（用于动态设置光标）
  const getConnectionDirection = (connection: StrategyConnection, pathString?: string): 'horizontal' | 'vertical' => {
    let path = pathString;
    if (!path) {
      path = getConnectionPath(connection);
    }

    if (path) {
      const firstMove = path.match(/M\s+([\d.-]+)\s+([\d.-]+)/);
      if (firstMove) {
        const allLines = path.matchAll(/L\s+([\d.-]+)\s+([\d.-]+)/g);
        const lines = Array.from(allLines);

        if (lines.length > 0) {
          let totalHorizontalLength = 0;
          let totalVerticalLength = 0;

          let prevX = parseFloat(firstMove[1]);
          let prevY = parseFloat(firstMove[2]);

          for (const line of lines) {
            const x = parseFloat(line[1]);
            const y = parseFloat(line[2]);

            const dx = Math.abs(x - prevX);
            const dy = Math.abs(y - prevY);

            totalHorizontalLength += dx;
            totalVerticalLength += dy;

            prevX = x;
            prevY = y;
          }

          return totalHorizontalLength >= totalVerticalLength ? 'horizontal' : 'vertical';
        }
      }
    }

    const sourceNode = nodes.value.find(n => n.id === connection.sourceNodeId);
    const targetNode = nodes.value.find(n => n.id === connection.targetNodeId);
    if (!sourceNode || !targetNode) return 'horizontal';

    const sxCenter = sourceNode.position.x + (sourceNode.style?.width || 120) / 2;
    const syCenter = sourceNode.position.y + (sourceNode.style?.height || 60) / 2;
    const txCenter = targetNode.position.x + (targetNode.style?.width || 120) / 2;
    const tyCenter = targetNode.position.y + (targetNode.style?.height || 60) / 2;

    const dx = Math.abs(txCenter - sxCenter);
    const dy = Math.abs(tyCenter - syCenter);

    return dx >= dy ? 'horizontal' : 'vertical';
  };

  return {
    computeConnectionStyle,
    getConnectionColor,
    getConnectionMarker,
    getConnectionDirection
  };
}

