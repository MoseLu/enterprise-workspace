;
import { nextTick, ref } from 'vue';
import { useI18n, logger } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableColumn, OpButton, TableProps } from '../types';
import { globalMitt } from '@btc/shared-components';

/**
 * 表格操作列处理 + 列控制
 * 提供操作按钮的获取、显示、点击处理，以及列的显示/隐藏控制功能
 * @param crud CRUD 操作实例
 * @param tableProps 表格属性配置
 * @returns 返回操作列和列控制相关的方法
 */
export function useTableOp(crud: UseCrudReturn<any>, tableProps: TableProps) {
  const { t } = useI18n();

  /**
   * 获取操作按钮列表
   * @param column 表格列配置
   * @param _scope 作用域数据
   * @returns 操作按钮数组
   */
  const _getOpButtons = (column: TableColumn, _scope: any): OpButton[] => {
    const buttons = column.buttons;
    // 如果是 undefined，返回默认按钮（编辑、删除）
    if (buttons === undefined) return ['edit', 'delete'];
    // 如果是空数组，返回空数组（不显示任何按钮）
    if (Array.isArray(buttons) && buttons.length === 0) return [];
    // 如果是函数，执行函数获取按钮
    if (typeof buttons === 'function') {
      // 确保传入的参数不为 undefined，避免解构错误
      try {
        return buttons({ scope: _scope });
      } catch (error) {
        logger.error('[useTableOp] opButtons 函数调用失败:', error);
        // 如果函数调用失败，返回默认按钮
        return ['edit', 'delete'];
      }
    }
    // 直接返回按钮配置（在 useTableColumns 中已经解包了 computed）
    return buttons;
  };

  /**
   * 获取按钮类型
   * @param btn 按钮标识
   * @returns 按钮类型（primary、danger、success、warning、default）
   */
  const getButtonType = (btn: string): string => {
    const typeMap: Record<string, string> = {
      edit: 'primary',
      delete: 'danger',
      info: 'success',
      detail: 'warning',
    };
    return typeMap[btn] || 'default';
  };

  /**
   * 获取按钮文本
   * @param btn 按钮标识
   * @returns 按钮显示的文本
   */
  const getButtonText = (btn: string): string => {
    const textMap: Record<string, string> = {
      edit: t('crud.button.edit'),
      delete: t('crud.button.delete'),
      info: t('crud.button.info'),
      detail: t('common.button.detail'),
    };
    return textMap[btn] || btn;
  };

  /**
   * 获取按钮图标
   * @param btn 按钮标识
   * @returns 按钮图标名称
   */
  const getButtonIcon = (btn: string): string | undefined => {
    const iconMap: Record<string, string> = {
      edit: 'edit',
      delete: 'delete',
      info: 'info',
      detail: 'info',
    };
    return iconMap[btn];
  };

  /**
   * 处理操作按钮点击事件
   * @param btn 按钮标识
   * @param row 当前行数据
   * @param emit 事件发射函数（可选）
   */
  const handleOpClick = (btn: string, row: any, emit?: (event: string, ...args: any[]) => void) => {
    if (!crud) {
      logger.error('[useTableOp] crud is not available');
      return;
    }

    switch (btn) {
      case 'edit':
        if (typeof crud.handleEdit === 'function') {
          crud.handleEdit(row);
        } else {
          logger.error('[useTableOp] crud.handleEdit is not available');
        }
        break;
      case 'delete':
        if (typeof crud.handleDelete === 'function') {
          crud.handleDelete(row);
        } else {
          logger.error('[useTableOp] crud.handleDelete is not available');
        }
        break;
      case 'info':
        if (typeof crud.handleView === 'function') {
          crud.handleView(row);
        } else {
          logger.error('[useTableOp] crud.handleView is not available');
        }
        break;
      case 'detail':
        // 触发 detail-click 事件，让使用侧处理详情按钮点击
        emit?.('detail-click', row);
        break;
    }
  };

  /**
   * 查找指定属性的列
   * @param prop 列属性名或属性名数组
   * @param callback 找到列时的回调函数
   */
  function findColumns(prop: string | string[], callback: (col: TableColumn) => void) {
    const propList = Array.isArray(prop) ? prop : [prop];

    /**
     * 递归查找列（支持嵌套子列）
     */
    function deep(list: TableColumn[]) {
      list.forEach(col => {
        if (col.prop && propList.includes(col.prop)) {
          callback(col);
        }
        if (col.children) {
          deep(col.children);
        }
      });
    }

    if (tableProps && tableProps.columns) {
      deep(tableProps.columns);
    }
  }

  /**
   * 显示列
   * @param prop 列属性名或属性名数组
   * @param status 显示状态，true 为显示，false 为隐藏，不传则默认显示
   */
  function showColumn(prop: string | string[], status?: boolean) {
    findColumns(prop, (col) => {
      // 如果设置为隐藏，但列不可切换或始终可见，则跳过
      if (status === false && (col.toggleable === false || col.alwaysVisible)) {
        return;
      }
      col.hidden = typeof status === 'boolean' ? !status : false;
    });
  }

  /**
   * 隐藏列
   * @param prop 列属性名或属性名数组
   */
  function hideColumn(prop: string | string[]) {
    showColumn(prop, false);
  }

  /**
   * 设置表格列
   * @param columns 新的列配置数组
   */
  function setColumns(columns: TableColumn[]) {
    if (tableProps && tableProps.columns) {
      tableProps.columns.splice(0, tableProps.columns.length, ...columns);
    }
  }

  /**
   * 重建表格的 key，用于强制刷新表格
   */
  const rebuildKey = ref(0);

  /**
   * 重建表格
   * @param callback 重建完成后的回调函数
   */
  function reBuild(callback?: () => void) {
    // 通过改变 key 值强制表格重新渲染
    rebuildKey.value++;
    if (callback) {
      callback();
    }
    // 在下一个 tick 触发 resize 事件，确保表格尺寸正确
    nextTick(() => {
      globalMitt.emit('resize');
    });
  }

  return {
    // 操作列
    getOpButtons: _getOpButtons,
    getButtonType,
    getButtonText,
    getButtonIcon,
    handleOpClick,

    // 列控制
    showColumn,
    hideColumn,
    setColumns,
    reBuild,
    rebuildKey,
  };
}


