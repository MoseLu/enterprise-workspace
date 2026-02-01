;
import { computed, toValue, inject } from 'vue';
import type { TableProps } from '../types';
import { autoFormatTableColumns } from '../utils/formatters';
import { CommonColumns } from '../utils/common-columns';
import { useI18n, type UseCrudReturn } from '@btc/shared-core';
import { useCrudLayout, DEFAULT_CRUD_GAP } from '../../context/layout';

/**
 * 获取表格单元格的实际字体样式
 */
function getTableCellFont(): { fontSize: number; fontFamily: string } {
  if (typeof document !== 'undefined') {
    const table = document.querySelector('.el-table');
    if (table) {
      const computedStyle = window.getComputedStyle(table);
      const fontSize = parseInt(computedStyle.fontSize) || 14;
      const fontFamily = computedStyle.fontFamily || 'Arial';
      // 安全处理：使用可选链和空值合并，确保不会出现 undefined
      const firstFont = fontFamily.split(',')[0]?.trim().replace(/['"]/g, '') || 'Arial';
      return { fontSize, fontFamily: firstFont };
    }
  }
  return { fontSize: 14, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' };
}

/**
 * 测量文本宽度的工具函数
 */
function measureTextWidth(text: string, fontSize?: number, fontFamily?: string): number {
  if (!text) return 0;
  const font = getTableCellFont();
  const actualFontSize = fontSize || font.fontSize;
  const actualFontFamily = fontFamily || font.fontFamily;

  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = `${actualFontSize}px ${actualFontFamily}`;
      return context.measureText(text).width;
    }
  }

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

  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // 安全处理：确保 char 不是 undefined
    if (char !== undefined) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        width += actualFontSize * 1.0;
      } else {
        width += actualFontSize * 0.55;
      }
    }
  }
  return width;
}

/**
 * 获取单元格的显示文本（用于列宽计算）
 */
function getCellTextForWidth(column: any, row: any): string {
  if (!column.prop) return '';
  const value = row[column.prop];
  if (value === null || value === undefined || value === '') return '';

  if (column.formatter) {
    try {
      const formatted = column.formatter(row, column, value, 0);
      return String(formatted || '');
    } catch (error) {
      console.warn('[useTableColumns] Formatter error:', error);
    }
  }

  if (column._dictFormatter) {
    try {
      const dict = column._dictFormatter(row);
      return String(dict?.label || value || '');
    } catch (error) {
      console.warn('[useTableColumns] Dict formatter error:', error);
    }
  }

  if (column._codeTagFormatter) {
    try {
      const tagInfo = column._codeTagFormatter(row);
      return String(tagInfo?.label || value || '');
    } catch (error) {
      console.warn('[useTableColumns] Code tag formatter error:', error);
    }
  }

  return String(value);
}

/**
 * 表格列配置处理
 */
export function useTableColumns(props: TableProps) {
  const { t: tOriginal, locale } = useI18n();
  const crudLayout = useCrudLayout();
  const gap = crudLayout?.gap?.value ?? DEFAULT_CRUD_GAP;

  // 尝试从 inject 获取 crud（用于访问 tableData）
  let crud: UseCrudReturn<any> | null = null;
  try {
    const injected = inject<UseCrudReturn<any>>('btc-crud');
    crud = injected || null;
  } catch (error) {
    // 如果 inject 失败，继续执行（可能不在 crud 上下文中）
  }
  /**
   * 安全的翻译函数，确保返回字符串类型，避免循环引用
   */
  const t = (key: string): string => {
    try {
      const result = tOriginal(key);
      // 确保返回字符串类型
      if (typeof result === 'string') {
        return result;
      }
      // 如果不是字符串，转换为字符串
      return String(result || key);
    } catch (error) {
      // 翻译失败，返回原 key
      console.warn('[useTableColumns] Translation failed:', error);
      return key;
    }
  };

  /**
   * 将 prop 转换为首字母大写的显示文本
   * 例如：deptCode -> Dept Code, parentId -> Parent Id, name -> Name
   */
  function formatPropToLabel(prop: string): string {
    // 将驼峰命名转换为空格分隔的单词
    const words = prop
      .replace(/([A-Z])/g, ' $1') // 在大写字母前添加空格
      .trim()
      .split(/\s+/); // 按空格分割成单词数组

    // 将每个单词首字母大写
    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * 判断当前是否为中文环境
   */
  function isChineseLocale(): boolean {
    const currentLocale = typeof locale === 'string' ? locale : locale.value;
    return currentLocale?.startsWith('zh') ?? false;
  }

  /**
   * 判断字符串是否是国际化 key（而不是翻译后的值）
   * 国际化 key 的格式：以字母开头，包含至少一个点，且点前后都有非空字符
   * 例如：'crud.table.index' 是 key，'No.' 不是 key
   */
  function isI18nKey(str: string): boolean {
    // 必须是字符串且包含点
    if (!str.includes('.')) {
      return false;
    }

    // 检查是否符合国际化 key 的格式：以字母开头，点前后都有非空字符
    // 例如：'crud.table.index' ✓, 'No.' ✗, 'A.B' ✓, '.B' ✗, 'A.' ✗
    const parts = str.split('.');
    if (parts.length < 2) {
      return false;
    }

    // 第一部分必须以字母开头
    const firstPart = parts[0]?.trim();
    if (!firstPart || !/^[a-zA-Z]/.test(firstPart)) {
      return false;
    }

    // 所有部分都不能为空
    return parts.every(part => part.trim().length > 0);
  }

  /**
   * 根据字符串哈希值选择颜色类型
   * @param value 字符串值
   * @param colorTypes 可用的颜色类型数组（支持 btc-tag 的所有类型）
   * @returns 选中的颜色类型
   */
  function getColorByHash(
    value: string,
    colorTypes: Array<
      | 'primary' | 'success' | 'warning' | 'danger' | 'info'
      | 'purple' | 'pink' | 'cyan' | 'teal' | 'indigo'
      | 'orange' | 'brown' | 'gray' | 'lime' | 'olive' | 'navy' | 'maroon'
    >
  ): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink' | 'cyan' | 'teal' | 'indigo' | 'orange' | 'brown' | 'gray' | 'lime' | 'olive' | 'navy' | 'maroon' {
    // 简单的哈希函数，将字符串转换为数字
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    // 使用绝对值并取模，确保结果在数组范围内
    const index = Math.abs(hash) % colorTypes.length;
    // 确保返回有效的颜色类型，如果数组为空则返回 'info'
    return colorTypes[index] || 'info';
  }

  /**
   * 格式化字典值
   */
  function formatDictValue(value: any, dict: any[], allLevels: boolean = false): string {
    if (!dict || dict.length === 0) return value;
    if (value === null || value === undefined || value === '') return '';

    // 如果是树形字典且需要显示所有层级
    if (allLevels) {
      const path: string[] = [];

      const findPath = (list: any[], val: any): boolean => {
        for (const item of list) {
          const label = item.label;
          // 如果 label 是国际化 key，进行翻译
          const translatedLabel = typeof label === 'string' && isI18nKey(label) ? t(label) : label;
          path.push(translatedLabel);

          if (item.value === val) {
            return true;
          }

          if (item.children && findPath(item.children, val)) {
            return true;
          }

          path.pop();
        }
        return false;
      };

      if (findPath(dict, value)) {
        return path.join(' / ');
      }
    }

    // 普通字典匹配
    function find(list: any[]): any {
      for (const item of list) {
        if (item.value === value) {
          return item;
        }
        if (item.children) {
          const found = find(item.children);
          if (found) return found;
        }
      }
      return null;
    }

    const item = find(dict);
    if (item) {
      const label = item.label;
      // 如果 label 是国际化 key，进行翻译
      return typeof label === 'string' && isI18nKey(label) ? t(label) : label;
    }
    return value;
  }

  /**
   * 计算列配置 - 智能列宽分配 + 字典匹配 + 自动时间格式化 + 自动添加通用列
   */
  const computedColumns = computed(() => {
    const columns = props.columns || [];

    // 检查是否已有创建时间列和操作列
    const hasCreatedAt = columns.some(col => col.prop === 'createdAt' || col.prop === 'createTime');
    const hasOpColumn = columns.some(col => col.type === 'op');

    // 自动添加通用列
    const enhancedColumns = [...columns];

    // 自动添加创建时间列（如果不存在）
    if (!hasCreatedAt && !props.disableAutoCreatedAt) {
      enhancedColumns.push(CommonColumns.createdAt());
    }

    // 自动添加操作列（如果不存在且 props.op 不为 undefined）
    if (!hasOpColumn && props.op !== undefined) {
      // 从 props.op 获取按钮配置，支持 computed ref
      const opButtons = toValue(props.op?.buttons) ?? ['edit', 'delete'];
      enhancedColumns.push(CommonColumns.operation(opButtons));
    }

    // 先进行自动时间格式化
    const formattedColumns = autoFormatTableColumns(enhancedColumns);
    return formattedColumns.map((column) => {
      const isFixedWidthColumn =
        column.type === 'selection' || column.type === 'index' || column.type === 'op';

      const config: any = {
        ...column,
        align: column.align || 'center',
        headerAlign: column.headerAlign || 'center',
        resizable: column.resizable ?? (column.type === 'selection' || column.type === 'index' ? false : true), // 智能列宽调整
        // 操作列不显示溢出提示，其他列默认显示
        showOverflowTooltip: column.showOverflowTooltip ?? (column.type === 'op' ? false : true),
        toggleable:
          typeof column.toggleable === 'boolean'
            ? column.toggleable
            : !(column.type === 'selection' || column.type === 'index'),
        alwaysVisible: column.alwaysVisible ?? column.toggleable === false,
      };

      // 处理列的国际化标签
      // 优先处理特殊类型列（index、op）的国际化
      if (column.type === 'index') {
        // 序号列：如果没有设置 width，使用默认宽度（70px）
        if (!config.width && !config.minWidth) {
          const defaultIndexColumn = CommonColumns.index();
          config.width = defaultIndexColumn.width;
        }
        // 序号列：如果 label 是国际化 key，翻译；否则使用默认的国际化标签
        if (column.label && typeof column.label === 'string' && isI18nKey(column.label)) {
            config.label = t(column.label);
        } else {
          config.label = t('crud.table.index');
          }
      } else if (column.type === 'op') {
        // 操作列：如果 label 是国际化 key，翻译；否则使用默认的国际化标签
        if (column.label && typeof column.label === 'string' && isI18nKey(column.label)) {
          config.label = t(column.label);
        } else {
          config.label = t('ui.table.operation');
        }
      } else if (column.label && typeof column.label === 'string') {
        // 普通列：如果 label 是国际化 key，进行翻译
        if (isI18nKey(column.label)) {
          config.label = t(column.label);
        } else {
          // 如果 label 不包含 '.'（可能是硬编码的中文），根据语言环境自动切换
          if (isChineseLocale()) {
            // 中文环境：显示 label（硬编码的中文）
            config.label = column.label;
          } else if (column.prop) {
            // 英文环境：显示 prop（首字母大写）
            config.label = formatPropToLabel(column.prop);
          } else {
            // 没有 prop，保持原 label
            config.label = column.label;
          }
        }
      } else if (!column.label && column.prop) {
        // 如果没有 label 但有 prop，根据语言环境显示
        if (isChineseLocale()) {
          // 中文环境：显示 prop（可能需要根据实际情况调整）
          config.label = column.prop;
        } else {
          // 英文环境：显示 prop（首字母大写）
          config.label = formatPropToLabel(column.prop);
        }
      }

      // selection 和 index 列默认固定在左侧（对齐 cool-admin）
      if ((column.type === 'selection' || column.type === 'index') && column.fixed === undefined) {
        config.fixed = 'left';
      }

      // 操作列默认固定在右侧（对齐 cool-admin）
      if (column.type === 'op' && column.fixed === undefined) {
        config.fixed = 'right';
        // 操作列宽度需要增加 gap（10px），这样搜索组件最右侧才能和操作列左侧对齐
        if (config.width && typeof config.width === 'number') {
          config.width = config.width + gap;
        } else if (config.minWidth && typeof config.minWidth === 'number') {
          config.minWidth = config.minWidth + gap;
        } else if (!config.width && !config.minWidth) {
          // 如果没有设置宽度，使用默认宽度 + gap
          config.width = 220 + gap;
        }
      }

      // 字典匹配（对齐 cool-admin）
      if (column.dict && column.prop) {
        // 保存原始 formatter
        const originalFormatter = column.formatter;

        // 如果启用了 dictColor，使用组件渲染
        if (column.dictColor) {
          config._dictFormatter = (row: any) => {
            const value = row[column.prop!];
            const dict = column.dict!;

            // 处理 null/undefined/空值
            if (value === null || value === undefined || value === '') {
              return { label: '', type: 'info' };
            }

            function find(list: any[]): any {
              for (const item of list) {
                if (item.value === value) return item;
                if (item.children) {
                  const found = find(item.children);
                  if (found) return found;
                }
              }
              return null;
            }

            const item = find(dict);
            if (item) {
              const label = item.label;
              // 如果 label 是国际化 key，进行翻译
              const translatedLabel = typeof label === 'string' && isI18nKey(label) ? t(label) : label;
              return { label: translatedLabel, type: item.type || 'info' };
            }
            return { label: value, type: 'info' };
          };
        } else {
          // 普通字典匹配，覆盖 formatter
          if (!originalFormatter) {
            config.formatter = (row: any) => {
              const value = row[column.prop!];
              if (value === null || value === undefined || value === '') {
                return '';
              }
              return formatDictValue(value, column.dict!, column.dictAllLevels || false);
            };
          }
        }
      }

      // 自动为包含 status、code 或 type 的字段添加 tag 渲染
      // 仅在未配置 dict、component 和 formatter 时自动添加
      if (column.prop && !column.dict && !column.component && !column.formatter) {
        const propName = column.prop.toLowerCase();
        const isStatusField = propName.includes('status');
        const isCodeField = propName.includes('code');
        const isTypeField = propName.includes('type');

        if (isStatusField || isCodeField || isTypeField) {
          // 根据字段类型和值生成不同的颜色
          config._codeTagFormatter = (row: any) => {
            const value = row[column.prop!];

            // 处理空值
            if (value === null || value === undefined || value === '') {
              return { label: '', type: 'info' };
            }

            const valueStr = String(value);

            // 根据字段类型选择颜色方案（支持 btc-tag 的所有类型）
            let colorType:
              | 'primary' | 'success' | 'warning' | 'danger' | 'info'
              | 'purple' | 'pink' | 'cyan' | 'teal' | 'indigo'
              | 'orange' | 'brown' | 'gray' | 'lime' | 'olive' | 'navy' | 'maroon'
              = 'info';

            if (isStatusField) {
              // status 字段：根据值的内容判断
              const statusLower = valueStr.toLowerCase();
              if (statusLower.includes('active') || statusLower.includes('enabled') || statusLower.includes('success')) {
                colorType = 'success';
              } else if (statusLower.includes('inactive') || statusLower.includes('disabled') || statusLower.includes('error')) {
                colorType = 'danger';
              } else if (statusLower.includes('pending') || statusLower.includes('warning')) {
                colorType = 'warning';
              } else {
                // 使用哈希值生成稳定的颜色
                colorType = getColorByHash(valueStr, ['success', 'warning', 'danger', 'info']);
              }
            } else if (isCodeField) {
              // code 字段：使用不同的颜色方案（避免与 status 相近）
              // 使用扩展颜色：purple, pink, cyan, teal, indigo, orange
              colorType = getColorByHash(valueStr, ['purple', 'pink', 'cyan', 'teal', 'indigo', 'orange']);
            } else if (isTypeField) {
              // type 字段：使用另一套颜色方案
              // 使用扩展颜色：brown, gray, lime, olive, navy, maroon
              colorType = getColorByHash(valueStr, ['brown', 'gray', 'lime', 'olive', 'navy', 'maroon']);
            }

            return { label: valueStr, type: colorType };
          };
        }
      }

      return config;
    }).map((column, index, columns) => {
      // 检查当前列是否需要渲染标签
      const hasTag = !!(column._dictFormatter || column._codeTagFormatter);

      if (hasTag) {
        // 找出所有连续的标签列
        let tagGroupStart = index;
        let tagGroupEnd = index;

        // 向前查找连续的标签列
        while (tagGroupStart > 0 && (columns[tagGroupStart - 1]._dictFormatter || columns[tagGroupStart - 1]._codeTagFormatter)) {
          tagGroupStart--;
        }

        // 向后查找连续的标签列
        while (tagGroupEnd < columns.length - 1 && (columns[tagGroupEnd + 1]._dictFormatter || columns[tagGroupEnd + 1]._codeTagFormatter)) {
          tagGroupEnd++;
        }

        // 在当前连续组中的位置（从0开始）
        const positionInGroup = index - tagGroupStart;

        // 交替使用 light 和 plain
        const tagEffect = positionInGroup % 2 === 0 ? 'light' : 'plain';

        // 确保 _tagEffect 被正确设置到返回的对象中
        return {
          ...column,
          _tagEffect: tagEffect,
        };
      }

      return column;
    }).map((column) => {
      // ========== 统一的列宽分配逻辑 ==========
      const isFixedWidthColumn = column.type === 'selection' || column.type === 'index' || column.type === 'op';

      // 1. 固定宽度列：保持原样（selection: 60, index: 60, op: 根据按钮数量计算）
      if (isFixedWidthColumn) {
        return column;
      }

      // 2. 识别列类型
      const propName = column.prop?.toLowerCase() || '';
      const isCodeField = propName.includes('code');
      const isTimeField = propName.includes('time') || propName.includes('at') ||
                         column.prop === 'createdAt' || column.prop === 'updatedAt' ||
                         column.prop === 'createTime' || column.prop === 'updateTime' ||
                         column.prop === 'deleteTime' || column.prop === 'deletedAt';
      const isJsonField = column.component?.name === 'BtcCodeJson' || column.component?.name === 'btc-code-json';
      const hasDictFormatter = !!column._dictFormatter; // 字典格式化器
      const hasCodeTagFormatter = !!column._codeTagFormatter; // Code 标签格式化器
      const hasTagFormatter = hasDictFormatter || hasCodeTagFormatter; // 是否有任何标签格式化器

      // 3. 用户配置中只能使用 width（作为兜底值），不能使用 minWidth
      // minWidth 完全由 composables 自动计算
      // width 作为最小值兜底，如果用户配置了 width，则使用它作为最小值；否则完全自动计算
      const userWidth = column.width;

      // 5. 获取表格数据（用于基于实际内容计算列宽）
      const tableData = crud?.tableData?.value || [];
      const sampleSize = 5; // 采样前5条数据
      const sampleData = tableData.slice(0, Math.min(sampleSize, tableData.length));

      // 6. 测量列标题宽度
      const labelText = column.label || '';
      const labelWidth = measureTextWidth(labelText);

      // 7. 预先计算最大内容宽度（用于后续计算，提升到外层作用域）
      let maxContentWidth = 0;
      let hasContent = false;
      for (const row of sampleData) {
        const cellText = getCellTextForWidth(column, row);
        if (cellText && cellText.trim()) {
          hasContent = true;
          let textWidth = measureTextWidth(cellText);
          // 对于 code 列和时间列，测量可能偏大，应用调整系数使其更接近实际渲染
          if (isCodeField || isTimeField) {
            textWidth = textWidth * 0.9; // 应用 0.9 的调整系数，使测量更接近实际渲染宽度
          }
          maxContentWidth = Math.max(maxContentWidth, textWidth);
        }
      }

      // 8. 根据列类型设置不同的宽度策略
      // 注意：Element Plus 表格单元格本身有默认的 padding（左右各 12px，共 24px）
      // 所以这里只使用文本宽度，不额外添加 padding，让 Element Plus 自动处理单元格的 padding
      let calculatedWidth = 0;

      if (isTimeField) {
        // 时间列：基于实际时间格式内容宽度计算（"YYYY-MM-DD HH:mm:ss" 格式，19个字符）
        // 优先使用实际数据宽度，如果没有数据，使用标准时间格式宽度
        // 注意：Element Plus 表格单元格有默认 padding（左右各 12px，共 24px）
        // 但实际测量可能偏大，所以使用较小的 padding 值
        const cellPadding = 18; // Element Plus 单元格 padding（进一步减小到 18px）
        const standardTimeWidth = measureTextWidth('2025-10-18 09:35:55') * 0.9; // 标准时间格式宽度，应用调整系数
        if (hasContent && maxContentWidth > 0) {
          // 使用实际数据宽度 + 单元格 padding
          calculatedWidth = maxContentWidth + cellPadding;
        } else {
          // 没有数据时，使用标准时间格式宽度 + 单元格 padding，不考虑表头宽度（避免表头过长导致过宽）
          calculatedWidth = standardTimeWidth + cellPadding;
        }
      } else if (isJsonField) {
        // JSON 列：固定宽度 200px（JSON 数据通常较长）
        calculatedWidth = 200;
      } else if (isCodeField) {
        // Code 列：优先使用实际数据宽度，不考虑表头宽度（代码通常比表头长）
        // 注意：Element Plus 表格单元格有默认 padding（左右各 12px，共 24px）
        // 标签组件在单元格内，也有 padding（2px * 2 = 4px）
        // 但实际测量可能偏大，所以使用较小的 padding 值
        const cellPadding = 18; // Element Plus 单元格 padding（进一步减小到 18px）
        const tagPadding = hasCodeTagFormatter ? 2 : 0; // 标签组件 padding（2px）
        const totalExtraPadding = cellPadding + tagPadding; // 总共 20px（code 列）或 18px（非标签 code 列）

        if (hasContent && maxContentWidth > 0) {
          // 使用实际数据宽度 + 单元格和标签的 padding
          calculatedWidth = maxContentWidth + totalExtraPadding;
        } else {
          // 没有数据时，使用表头宽度（但不要太大）
          calculatedWidth = Math.min(labelWidth, 200) + totalExtraPadding; // 表头宽度上限 200px
        }
        // 确保不小于最小宽度（code 列最小宽度降低到 120px，加上 padding）
        calculatedWidth = Math.max(120 + totalExtraPadding, calculatedWidth);
        // 对于 code 列，设置最大宽度限制，避免过宽
        if (hasContent && maxContentWidth > 0) {
          const maxAllowedWidth = maxContentWidth + totalExtraPadding;
          calculatedWidth = Math.min(calculatedWidth, maxAllowedWidth);
        }
      } else if (hasTagFormatter) {
        // 标签列：基于实际数据内容计算，优先使用数据宽度
        // 注意：Element Plus 表格单元格有默认 padding（左右各 12px，共 24px）
        const cellPadding = 24; // Element Plus 单元格 padding
        if (hasContent && maxContentWidth > 0) {
          // 如果数据宽度超过表头，使用数据宽度；否则使用表头宽度
          calculatedWidth = Math.max(labelWidth, maxContentWidth) + cellPadding;
        } else {
          calculatedWidth = labelWidth + cellPadding;
        }
      } else {
        // 普通列：如果数据内容都不超过表头宽度，则只需要保证能放下表头即可
        // 注意：Element Plus 表格单元格有默认 padding（左右各 12px，共 24px）
        const cellPadding = 24; // Element Plus 单元格 padding
        if (hasContent && maxContentWidth > 0) {
          // 如果数据宽度不超过表头，使用表头宽度
          // 如果数据宽度超过表头，使用数据宽度
          if (maxContentWidth <= labelWidth) {
            // 数据都不超过表头，只需保证表头能放下
            calculatedWidth = labelWidth + cellPadding;
          } else {
            // 数据超过表头，使用数据宽度
            calculatedWidth = maxContentWidth + cellPadding;
          }
        } else {
          // 没有数据内容时，使用表头宽度
          calculatedWidth = labelWidth + cellPadding;
        }
      }

      // 9. 设置最小宽度限制（包含单元格 padding，使用较小的 padding 值）
      const cellPadding = 20; // Element Plus 单元格 padding（减小到 20px）
      let minWidth: number;
      if (isCodeField) {
        const tagPadding = hasCodeTagFormatter ? 2 : 0; // 标签组件 padding（减小到 2px）
        minWidth = 120 + cellPadding + tagPadding; // code 列最小宽度降低到 120px，加上 padding
      } else if (isTimeField) {
        // 时间列：使用标准时间格式宽度，不考虑表头宽度（避免表头过长导致过宽）
        const standardTimeWidth = measureTextWidth('2025-10-18 09:35:55');
        // 使用标准时间宽度 + 单元格 padding
        minWidth = Math.max(80, standardTimeWidth) + cellPadding;
      } else if (hasTagFormatter || isJsonField) {
        // 标签列、JSON列：使用表头宽度 + 单元格 padding
        minWidth = Math.max(80, labelWidth) + cellPadding;
      } else {
        // 普通列：最小宽度 = 表头宽度 + 单元格 padding
        minWidth = Math.max(80, labelWidth) + cellPadding;
      }

      // 10. 最终宽度计算：优先使用自动计算的值，用户配置的 width 作为最小值兜底
      // 如果用户配置了 width，使用它作为最小值；否则使用计算出的 minWidth
      let finalWidth: number;

      // 计算最终的最小宽度：用户配置的 width（兜底）或自动计算的最小宽度
      const finalMinWidth = userWidth
        ? Math.max(minWidth, userWidth) // 用户配置的 width 作为最小值兜底
        : minWidth; // 没有配置 width，使用自动计算的最小宽度

      // 最终宽度 = 计算出的宽度和最小宽度的较大值
      finalWidth = Math.max(calculatedWidth, finalMinWidth);

      // 11. 返回更新后的列配置（统一使用 minWidth，width 设置为 undefined）
      return {
        ...column,
        minWidth: finalWidth,
        width: undefined, // 统一使用 minWidth，width 交给 Element Plus 处理
      };
    });
  });

  return {
    computedColumns,
    formatDictValue,
  };
}
