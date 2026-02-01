/**
 * 列渲染优化 composable
 * 
 * 功能：
 * 1. 优先渲染选中分类对应的列
 * 2. 宽度充足时再渲染其他列
 * 3. 动态显示/隐藏列
 * 
 * 注意：这个功能需要根据实际的表格组件API来实现
 * 如果 BtcTable 不支持动态显示/隐藏列，可能需要其他方案
 */;


import { computed, type Ref, type ComputedRef } from 'vue';
import type { TableColumn } from '@btc-crud/table/types';

/**
 * 列渲染选项
 */
export interface ColumnRenderOptions {
  /**
   * 可用宽度（像素）
   */
  availableWidth: number;

  /**
   * 每列的平均宽度（像素）
   */
  avgColumnWidth?: number;
}

/**
 * 列渲染优化
 * 
 * @param sortedColumns 已排序的列（优先级高的在前）
 * @param containerRef 容器引用
 * @param leftWidth 左侧宽度
 * @param options 渲染选项
 * @returns 可见列
 */
export function useColumnRender(
  sortedColumns: ComputedRef<TableColumn[]>,
  containerRef: Ref<HTMLElement | undefined>,
  leftWidth: ComputedRef<string>,
  options?: ColumnRenderOptions
) {
  // 计算可见列（基于可用宽度）
  const visibleColumns = computed(() => {
    // 如果容器引用无效，返回所有列
    if (!containerRef.value) {
      return sortedColumns.value;
    }
    
    try {
      // 获取可用宽度
      const containerWidth = containerRef.value.offsetWidth;
      const leftWidthValue = parseFloat(leftWidth.value) || 0;
      const rightAvailableWidth = containerWidth - leftWidthValue;
      
      // 如果可用宽度无效，返回所有列
      if (rightAvailableWidth <= 0) {
        return sortedColumns.value;
      }
      
      // 使用配置的平均列宽或默认值
      const avgWidth = options?.avgColumnWidth || 150;
      
      // 计算已使用的宽度
      let usedWidth = 0;
      const visible: TableColumn[] = [];
      
      // 优先显示高优先级的列
      for (const column of sortedColumns.value) {
        // 获取列的实际宽度
        const columnWidth = getColumnWidth(column, avgWidth);
        
        // 检查是否还有足够空间
        if (usedWidth + columnWidth <= rightAvailableWidth) {
          visible.push(column);
          usedWidth += columnWidth;
        } else {
          // 宽度不足，停止添加
          break;
        }
      }
      
      // 如果所有列都能显示，返回所有列
      if (visible.length === sortedColumns.value.length) {
        return sortedColumns.value;
      }
      
      return visible;
    } catch (error) {
      console.warn('[BtcFilterTableGroup] 列渲染计算失败:', error);
      // 计算失败时返回所有列
      return sortedColumns.value;
    }
  });
  
  return {
    visibleColumns
  };
}

/**
 * 获取列的实际宽度
 * 
 * @param column 列配置
 * @param defaultWidth 默认宽度
 * @returns 列宽度（像素）
 */
function getColumnWidth(column: TableColumn, defaultWidth: number): number {
  // 如果列配置了固定宽度，使用配置的宽度
  if (column.width) {
    const width = typeof column.width === 'string' 
      ? parseFloat(column.width) 
      : column.width;
    if (!isNaN(width) && width > 0) {
      return width;
    }
  }
  
  // 如果列配置了最小宽度，使用最小宽度
  if (column.minWidth) {
    const minWidth = typeof column.minWidth === 'string'
      ? parseFloat(column.minWidth)
      : column.minWidth;
    if (!isNaN(minWidth) && minWidth > 0) {
      return minWidth;
    }
  }
  
  // 特殊列类型的固定宽度
  if (column.type === 'selection' || column.type === 'index') {
    return 60;
  }
  
  if (column.type === 'op') {
    // 操作列宽度根据按钮数量估算
    const buttonCount = Array.isArray(column.buttons) ? column.buttons.length : 1;
    return Math.max(100, buttonCount * 80);
  }
  
  // 使用默认宽度
  return defaultWidth;
}
