/**
 * 列优先级管理 composable
 *
 * 功能：
 * 1. 根据左侧选中的分类计算列的优先级
 * 2. 对列进行排序（优先级高的在前）
 */

import { computed, type Ref, type ComputedRef } from 'vue';
import type { FilterResult } from '../../btc-filter-list/types';
import type { TableColumn } from '@btc-crud/table/types';
import type { CategoryColumnMap } from '../types';

/**
 * 列优先级管理
 *
 * @param filterResult 筛选结果
 * @param tableColumns 表格列配置
 * @param categoryColumnMap 分类到列的映射
 * @returns 列优先级和排序后的列
 */
export function useColumnPriority(
  filterResult: Ref<FilterResult[]> | ComputedRef<FilterResult[]>,
  tableColumns: Ref<TableColumn[]> | ComputedRef<TableColumn[]>,
  categoryColumnMap: CategoryColumnMap
) {
  // 计算列的优先级
  const columnPriorities = computed(() => {
    const priorities: Record<string, number> = {};

    // 获取当前选中的分类ID
    const selectedCategoryIds = filterResult.value.map(r => r.name);

    // 初始化所有列的优先级为 0（最低）
    tableColumns.value.forEach(col => {
      if (col.prop) {
        priorities[col.prop] = 0;
      }
    });

    // 根据选中的分类提升对应列的优先级
    selectedCategoryIds.forEach((categoryId, index) => {
      const columnProps = categoryColumnMap[categoryId] || [];
      columnProps.forEach(prop => {
        // 优先选中的分类对应的列优先级更高
        // 第一个选中的分类优先级最高
        priorities[prop] = selectedCategoryIds.length - index;
      });
    });

    return priorities;
  });

  // 计算排序后的列（优先级高的在前）
  // 注意：序号列（index）、选择列（selection）固定在左侧，操作列（op）固定在右侧，不受优先级排序影响
  const sortedColumns = computed(() => {
    const columns = [...tableColumns.value];

    // 分离特殊列和普通列
    const specialLeftColumns: TableColumn[] = []; // index, selection 等固定在左侧的列
    const normalColumns: TableColumn[] = []; // 普通列，需要按优先级排序
    const specialRightColumns: TableColumn[] = []; // op 等固定在右侧的列

    // 记录普通列在原始数组中的索引（用于稳定排序）
    const normalColumnIndices: Map<TableColumn, number> = new Map();

    columns.forEach((col, index) => {
      const colType = col.type;

      // 特殊列类型：序号列、选择列固定在左侧
      if (colType === 'index' || colType === 'selection' || colType === 'expand') {
        specialLeftColumns.push(col);
      }
      // 操作列固定在右侧
      else if (colType === 'op') {
        specialRightColumns.push(col);
      }
      // 普通列，需要按优先级排序
      else {
        normalColumns.push(col);
        normalColumnIndices.set(col, index);
      }
    });

    // 对普通列按优先级排序（稳定排序：优先级相同时保持原始顺序）
    const sortedNormalColumns = normalColumns.sort((a, b) => {
      const priorityA = columnPriorities.value[a.prop || ''] || 0;
      const priorityB = columnPriorities.value[b.prop || ''] || 0;

      // 如果优先级相同，保持原始顺序（使用原始索引）
      if (priorityA === priorityB) {
        const indexA = normalColumnIndices.get(a) ?? 0;
        const indexB = normalColumnIndices.get(b) ?? 0;
        return indexA - indexB;
      }

      // 降序排列（优先级高的在前）
      return priorityB - priorityA;
    });

    // 合并列：特殊左侧列 + 排序后的普通列 + 特殊右侧列
    return [...specialLeftColumns, ...sortedNormalColumns, ...specialRightColumns];
  });

  return {
    columnPriorities,
    sortedColumns
  };
}
