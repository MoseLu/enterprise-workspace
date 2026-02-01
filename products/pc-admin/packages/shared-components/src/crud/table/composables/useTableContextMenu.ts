;
import { ref } from 'vue';
import { useI18n, logger } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import type { TableProps } from '../types';

/**
 * 右键菜单处理（对齐 cool-admin table/helper/row.ts）
 */
export function useTableContextMenu(crud: UseCrudReturn<any>, props: TableProps, tableRef: any) {
  const { t } = useI18n();

  // 右键菜单配置
  const contextMenuVisible = ref(false);
  const contextMenuStyle = ref({});
  const contextMenuItems = ref<any[]>([]);
  const currentRow = ref<any>(null);
  const currentColumn = ref<any>(null);

  /**
   * 获取内置菜单项
   */
  function getBuiltInMenuItems(row: any, column: any) {
    const items: any[] = [];
    const menu = props.contextMenu;

    if (!menu) return [];

    // 默认菜单（menu === true）
    if (menu === true) {
      return [
        { label: t('crud.context_menu.refresh'), value: 'refresh' },
        { label: t('crud.context_menu.edit'), value: 'edit' },
        { label: t('crud.context_menu.delete'), value: 'delete' },
      ];
    }

    // menu === false 不显示菜单
    if (typeof menu === 'boolean') {
      return [];
    }

    // 自定义菜单
    if (Array.isArray(menu)) {
      menu.forEach((item: any) => {
        if (typeof item === 'string') {
          // 内置菜单项
          switch (item) {
            case 'refresh':
              items.push({ label: t('crud.context_menu.refresh'), value: 'refresh' });
              break;
            case 'check':
              items.push({ label: t('crud.context_menu.check'), value: 'check' });
              break;
            case 'edit':
              items.push({ label: t('crud.context_menu.edit'), value: 'edit' });
              break;
            case 'delete':
              items.push({ label: t('crud.context_menu.delete'), value: 'delete' });
              break;
            case 'info':
              items.push({ label: t('crud.context_menu.info'), value: 'info' });
              break;
            case 'order-asc':
              items.push({ label: t('crud.context_menu.order_asc'), value: 'order-asc' });
              break;
            case 'order-desc':
              items.push({ label: t('crud.context_menu.order_desc'), value: 'order-desc' });
              break;
          }
        } else if (typeof item === 'function') {
          // 动态菜单项
          const result = item(row, column, null);
          if (result) {
            items.push(result);
          }
        } else {
          // 自定义菜单项对象
          items.push(item);
        }
      });
    }

    return items;
  }

  /**
   * 处理右键点击
   */
  function onRowContextMenu(row: any, column: any, event: MouseEvent) {
    if (!props.contextMenu) return;

    event.preventDefault();

    currentRow.value = row;
    currentColumn.value = column;

    // 获取菜单项
    const items = getBuiltInMenuItems(row, column);
    contextMenuItems.value = items;

    // 设置位置
    contextMenuStyle.value = {
      left: `${event.clientX}px`,
      top: `${event.clientY}px`,
    };

    contextMenuVisible.value = true;

    // 点击其他地方关闭菜单
    const closeMenu = () => {
      contextMenuVisible.value = false;
      document.removeEventListener('click', closeMenu);
    };

    setTimeout(() => {
      document.addEventListener('click', closeMenu);
    }, 100);
  }

  /**
   * 处理菜单项点击
   */
  function handleMenuClick(item: any) {
    const row = currentRow.value;

    if (!crud) {
      logger.error('[useTableContextMenu] crud is not available');
      return;
    }

    switch (item.value) {
      case 'refresh':
        if (typeof crud.loadData === 'function') {
          crud.loadData();
        }
        break;
      case 'check':
        // 切换选中状态
        tableRef.value?.toggleRowSelection(row);
        break;
      case 'edit':
        if (typeof crud.handleEdit === 'function') {
          crud.handleEdit(row);
        } else {
          logger.error('[useTableContextMenu] crud.handleEdit is not available');
        }
        break;
      case 'delete':
        if (typeof crud.handleDelete === 'function') {
          crud.handleDelete(row);
        } else {
          logger.error('[useTableContextMenu] crud.handleDelete is not available');
        }
        break;
      case 'info':
        if (typeof crud.handleView === 'function') {
          crud.handleView(row);
        } else {
          logger.error('[useTableContextMenu] crud.handleView is not available');
        }
        break;
      case 'order-asc':
      case 'order-desc':
        // 排序功能在 useTableSort 中实现
        break;
      default:
        // 自定义菜单项的回调
        if (item.callback) {
          item.callback(() => {
            contextMenuVisible.value = false;
          });
        }
        break;
    }

    contextMenuVisible.value = false;
  }

  return {
    contextMenuVisible,
    contextMenuStyle,
    contextMenuItems,
    onRowContextMenu,
    handleMenuClick,
  };
}

