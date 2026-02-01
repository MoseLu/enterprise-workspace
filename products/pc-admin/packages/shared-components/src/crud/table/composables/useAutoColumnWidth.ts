;
import { ref, watch, nextTick, type Ref, type ComputedRef } from 'vue';
import type { TableColumn } from '../types';

/**
 * 获取表格单元格的实际字体样式
 */
function getTableCellFont(): { fontSize: number; fontFamily: string } {
  if (typeof document !== 'undefined') {
    // 尝试从表格元素获取实际字体
    const table = document.querySelector('.el-table');
    if (table) {
      const computedStyle = window.getComputedStyle(table);
      const fontSize = parseInt(computedStyle.fontSize) || 14;
      const fontFamily = computedStyle.fontFamily || 'Arial';
      return { fontSize, fontFamily: fontFamily.split(',')[0].replace(/['"]/g, '') };
    }
  }
  // 默认值（Element Plus 表格默认字体）
  return { fontSize: 14, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' };
}

/**
 * 测量文本宽度的工具函数
 * 使用 Canvas 或临时 DOM 元素来测量文本的实际渲染宽度
 */
function measureTextWidth(text: string, fontSize?: number, fontFamily?: string): number {
  if (!text) return 0;

  // 获取实际字体样式
  const font = getTableCellFont();
  const actualFontSize = fontSize || font.fontSize;
  const actualFontFamily = fontFamily || font.fontFamily;

  // 优先使用 Canvas（更准确）
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = `${actualFontSize}px ${actualFontFamily}`;
      return context.measureText(text).width;
    }
  }

  // 降级方案：使用临时 DOM 元素（更准确，因为会应用实际样式）
  if (typeof document !== 'undefined') {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'nowrap';
    span.style.fontSize = `${actualFontSize}px`;
    span.style.fontFamily = actualFontFamily;
    span.style.fontWeight = 'normal';
    span.style.letterSpacing = 'normal';
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  }

  // 最后的降级方案：根据字符数估算
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // 判断是否为中文字符
    if (/[\u4e00-\u9fa5]/.test(char)) {
      width += actualFontSize * 1.0; // 中文字符
    } else {
      width += actualFontSize * 0.55; // 英文字符（包括数字和符号）
    }
  }
  return width;
}

/**
 * 获取单元格的显示文本
 */
function getCellText(column: TableColumn, row: any): string {
  if (!column.prop) return '';

  const value = row[column.prop];
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // 如果有 formatter，使用 formatter 的结果
  if (column.formatter) {
    try {
      const formatted = column.formatter(row, column, value, 0);
      return String(formatted || '');
    } catch (error) {
      console.warn('[useAutoColumnWidth] Formatter error:', error);
    }
  }

  // 如果有字典格式化器，获取标签文本
  if (column._dictFormatter) {
    try {
      const dict = column._dictFormatter(row);
      return String(dict?.label || value || '');
    } catch (error) {
      console.warn('[useAutoColumnWidth] Dict formatter error:', error);
    }
  }

      // 如果有 code tag 格式化器，获取标签文本
      // 注意：标签组件会有额外的内边距（约 18px，左右各 9px），需要额外考虑
      if (column._codeTagFormatter) {
        try {
          const tagInfo = column._codeTagFormatter(row);
          return String(tagInfo?.label || value || '');
        } catch (error) {
          console.warn('[useAutoColumnWidth] Code tag formatter error:', error);
        }
      }

      // 默认转换为字符串
      return String(value);
    }

/**
 * 根据实际数据内容自动计算列宽
 * @param columns 列配置
 * @param tableData 表格数据
 * @param sampleSize 采样数量（默认前 5 条数据）
 * @param padding 额外内边距（默认 40px，包括单元格 padding 和边框）
 */
export function useAutoColumnWidth(
  columns: Ref<TableColumn[]> | ComputedRef<TableColumn[]>,
  tableData: Ref<any[]> | ComputedRef<any[]>,
  sampleSize: number = 5,
  padding: number = 24 // 减小内边距，更合理的值（包括单元格 padding 和边框）
): {
  optimizedColumns: Ref<TableColumn[]>;
  recalculate: () => void;
} {
  const optimizedColumns = ref<TableColumn[]>([]);

  // 计算列宽
  const calculateColumnWidths = () => {
    const data = tableData.value || [];
    if (data.length === 0) {
      optimizedColumns.value = columns.value;
      return;
    }

    const sampleData = data.slice(0, Math.min(sampleSize, data.length));
    const cols = columns.value.map((column) => {
      // 跳过固定宽度的列
      if (
        column.type === 'selection' ||
        column.type === 'index' ||
        column.type === 'op' ||
        column.type === 'expand'
      ) {
        return column;
      }

      const propName = column.prop?.toLowerCase() || '';
      const isCodeField = propName.includes('code');
      
      // 测量列标题宽度
      const labelText = column.label || '';
      const labelWidth = measureTextWidth(labelText);

      // 如果已经有明确的宽度配置且不是 code 字段，保持原样（useTableColumns 已经处理过）
      // 只有当没有配置宽度时才进行自动计算，避免覆盖已有的合理配置
      if ((column.width || column.minWidth) && !isCodeField) {
        return column;
      }

      // 没有配置宽度，进行自动计算
      // 测量数据内容宽度
      let maxContentWidth = 0;
      const hasTagFormatter = !!(column._dictFormatter || column._codeTagFormatter);
      
      for (const row of sampleData) {
        const cellText = getCellText(column, row);
        if (cellText) {
          const textWidth = measureTextWidth(cellText);
          maxContentWidth = Math.max(maxContentWidth, textWidth);
        }
      }

      // 如果是标签渲染（字典或 code tag），标签组件有额外的内边距（约 18px，左右各 9px）
      const tagPadding = hasTagFormatter ? 18 : 0;
      
      // 计算最终宽度：取标题和数据内容的最大值，加上内边距和标签内边距
      const contentWidth = maxContentWidth > 0 ? Math.max(labelWidth, maxContentWidth) : labelWidth;
      const calculatedWidth = contentWidth + padding + tagPadding;

      // 设置最小宽度限制（更合理的值）
      // code 字段最小宽度 180px，其他字段使用更小的最小宽度（基于标签宽度）
      const minWidth = isCodeField ? 180 : Math.max(80, labelWidth + padding);
      const finalWidth = Math.max(calculatedWidth, minWidth);

      // 返回更新后的列配置
      return {
        ...column,
        minWidth: finalWidth,
        // 如果原来有 width，删除它（使用 minWidth 更灵活）
        width: undefined,
      };
    });

    optimizedColumns.value = cols;
  };

  // 监听数据变化
  watch(
    [tableData, columns],
    () => {
      nextTick(() => {
        calculateColumnWidths();
      });
    },
    { immediate: true, deep: true }
  );

  return {
    optimizedColumns,
    recalculate: calculateColumnWidths,
  };
}
