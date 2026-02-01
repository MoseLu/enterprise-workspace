/**
 * CRUD Composable
 * 封装 CRUD 通用逻辑：列表加载、分页、搜索、增删改等
 */
;

import { ref, reactive, computed, shallowRef } from 'vue';
import { normalizeKeywordIds } from '../../utils/array';
import { logger } from '../../utils/logger';
import type { CrudOptions, PaginationConfig, UseCrudReturn } from './types';

export function useCrud<T = Record<string, unknown>>(
  options: CrudOptions<T>,
  callback?: (app: UseCrudReturn<T>) => void
): UseCrudReturn<T> {
  const {
    service,
    onLoad,
    onSuccess,
    onError,
    onBeforeRefresh,
    onAfterRefresh,
    onBeforeDelete,
    onAfterDelete,
  } = options;

  // 表格数据
  const tableData = ref<T[]>([]);
  const loading = ref(false);

  // 分页配置
  const pagination = reactive<PaginationConfig>({
    page: 1,
    size: 20,
    total: 0,
  });

  // 搜索参数
  const searchParams = ref<Record<string, unknown>>({});

  // 选择行
  const selection = ref<T[]>([]);
  const toolbarContext = shallowRef<any>(null);

  const setToolbarContext = (context: any) => {
    toolbarContext.value = context;
  };

  // 防止重复调用的标记
  const isRefreshing = ref(false);

  // 新增/编辑弹窗
  const upsertVisible = ref(false);
  const currentRow = ref<T | null>(null);
  const upsertMode = ref<'add' | 'update' | 'info'>('add'); // 弹窗模式

  // 查看详情弹窗
  const viewVisible = ref(false);
  const viewRow = ref<T | null>(null);

  /**
   * 加载数据
   */
  const loadData = async () => {

    loading.value = true;
    onLoad?.();

    try {
      // 合并参数，过滤掉 null 值
      let params: Record<string, unknown> = {
        page: pagination.page,
        size: pagination.size,
      };

      // 根据 service.search 配置组织搜索参数
      // 注意：service 对象可能包含 search 属性（从 EPS 生成的服务对象）
      const searchConfig = (service as any)?.search;

      if (searchConfig && (searchConfig.fieldEq || searchConfig.fieldLike || searchConfig.keyWordLikeFields)) {
        const keywordParams: Record<string, unknown> = {};
        let hasKeywordParams = false;

        // 获取已存在的 keyword 对象（如果页面传递了 keyword 参数）
        let existingKeyword: Record<string, unknown> = searchParams.value.keyword && typeof searchParams.value.keyword === 'object' && !Array.isArray(searchParams.value.keyword)
          ? (searchParams.value.keyword as Record<string, unknown>)
          : {};

        // 统一处理 keyword 对象中的 ids 字段为数组格式
        // 使用 normalizeKeywordIds 确保空字符串、null、undefined 都转换为空数组
        existingKeyword = normalizeKeywordIds(existingKeyword) as Record<string, unknown>;

        // 获取 fieldEq 字段列表
        let fieldEqFields = searchConfig.fieldEq || [];
        if (!Array.isArray(fieldEqFields) || fieldEqFields.length === 0) {
          // 如果 searchConfig.fieldEq 为空，尝试从 pageColumns 中获取字段名（后备方案）
          const pageColumns = (service as any)?._pageColumns || (service as any)?.pageColumns;
          if (Array.isArray(pageColumns) && pageColumns.length > 0) {
            fieldEqFields = pageColumns
              .map((col: any) => col?.propertyName || col?.field || col?.name)
              .filter((name: any): name is string => !!name);
          }
        }

        // 处理 fieldEq（等值查询）- 始终包含在 keyword 对象中，即使值为空
        // 确保所有 fieldEq 中配置的字段都被包含在 keyword 对象中
        if (Array.isArray(fieldEqFields) && fieldEqFields.length > 0) {
          fieldEqFields.forEach((field: any) => {
            // 支持多种字段格式：对象 { propertyName: "xxx" } 或字符串 "xxx"
            let fieldName: string | undefined;
            if (typeof field === 'string') {
              fieldName = field;
            } else if (field && typeof field === 'object') {
              // 优先使用 propertyName，其次使用 field，最后使用 name
              fieldName = field.propertyName || field.field || field.name;
            }

            // 确保字段名存在，并且始终添加到 keywordParams 中（即使值为空）
            if (fieldName) {
              // 优先从 keyword 对象中读取，其次从 searchParams.value 中读取，最后使用空字符串
              const value = existingKeyword[fieldName] !== undefined
                ? existingKeyword[fieldName]
                : (searchParams.value[fieldName] !== undefined ? searchParams.value[fieldName] : '');
              // 即使值为空，也包含在 keyword 对象中（后端需要空字符串）
              keywordParams[fieldName] = value !== null && value !== undefined ? value : '';
              hasKeywordParams = true;
            }
          });
        }

        // 处理 fieldLike（模糊查询）- 始终包含在 keyword 对象中，即使值为空
        if (Array.isArray(searchConfig.fieldLike) && searchConfig.fieldLike.length > 0) {
          searchConfig.fieldLike.forEach((field: any) => {
            // 支持多种字段格式：对象 { propertyName: "xxx" } 或字符串 "xxx"
            let fieldName: string | undefined;
            if (typeof field === 'string') {
              fieldName = field;
            } else if (field && typeof field === 'object') {
              fieldName = field.propertyName || field.field || field.name;
            }

            if (fieldName) {
              // 优先从 keyword 对象中读取，其次从 searchParams.value 中读取，最后使用空字符串
              const value = existingKeyword[fieldName] !== undefined
                ? existingKeyword[fieldName]
                : (searchParams.value[fieldName] !== undefined ? searchParams.value[fieldName] : '');
              // 即使值为空，也包含在 keyword 对象中（后端需要空字符串）
              keywordParams[fieldName] = value !== null && value !== undefined ? value : '';
              hasKeywordParams = true;
            }
          });
        }

        // 处理 keyWordLikeFields（关键字搜索字段）
        // 如果 keyWordLikeFields 配置了字段，将关键字应用到这些字段
        // 如果 keyWordLikeFields 为空或只有空字符串，将关键字应用到 fieldEq 中的第一个字段（通常是主搜索字段）
        const keyword = searchParams.value.keyword;
        if (keyword !== null && keyword !== undefined && keyword !== '') {
          const keyWordFields = searchConfig.keyWordLikeFields || [];
          const validKeyWordFields = keyWordFields
            .map((field: any) => field?.propertyName || field)
            .filter((fieldName: string) => fieldName && fieldName !== '');

          if (validKeyWordFields.length > 0) {
            // 如果配置了有效的 keyWordLikeFields，应用到这些字段
            validKeyWordFields.forEach((fieldName: string) => {
              keywordParams[fieldName] = keyword;
              hasKeywordParams = true;
            });
          } else if (Array.isArray(searchConfig.fieldEq) && searchConfig.fieldEq.length > 0) {
            // 如果没有配置 keyWordLikeFields，将关键字应用到 fieldEq 中的第一个字段（通常是主搜索字段，如 username）
            const firstField = searchConfig.fieldEq[0];
            const firstFieldName = firstField?.propertyName || firstField;
            if (firstFieldName) {
              keywordParams[firstFieldName] = keyword;
              hasKeywordParams = true;
            }
          }
        }

        // 如果有搜索配置，始终添加 keyword 对象（即使为空对象）
        if (hasKeywordParams || (searchConfig.fieldEq && searchConfig.fieldEq.length > 0) || (searchConfig.fieldLike && searchConfig.fieldLike.length > 0)) {
          params.keyword = keywordParams;
        }
      } else {
        // 如果没有 search 配置，使用扁平化参数（向后兼容）
        Object.keys(searchParams.value).forEach(key => {
          if (searchParams.value[key] !== null && searchParams.value[key] !== undefined) {
            params[key] = searchParams.value[key];
          }
        });
      }

      // 刷新前钩子（对应 cool-admin 的 onRefresh）
      if (onBeforeRefresh) {
        const modifiedParams = onBeforeRefresh(params);
        if (modifiedParams) {
          params = modifiedParams;
        }
      }

      // 在 onBeforeRefresh 之后，统一处理 params.keyword.ids 为数组格式
      // 使用 normalizeKeywordIds 确保空字符串、null、undefined 都转换为空数组
      if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
        params.keyword = normalizeKeywordIds(params.keyword);
      }

      // 检查 service 是否存在
      if (!service) {
        loading.value = false;
        return;
      }

      // 检查 service.page 是否是函数
      if (typeof service.page !== 'function') {
        loading.value = false;
        throw new Error('service.page 不是一个函数');
      }

      const res = await service.page(params) as any;

      // 检查响应数据是否有效
      if (res && typeof res === 'object') {
        // 检查是否是 Axios 响应对象
        const isAxiosResponse = res.data && res.status && res.headers;

        // 如果是 Axios 响应对象（有 data, status, headers 等属性）
        if (isAxiosResponse) {
          // 这是一个 Axios 响应对象，需要提取 data
          const responseData = res.data;

          // 检查是否是标准 API 响应格式 { code: 200, msg: '...', data: {...} }
          if (responseData && typeof responseData === 'object' && responseData.code !== undefined) {
            // 响应拦截器可能没有正确处理，手动提取 data.data
            if (responseData.data && typeof responseData.data === 'object') {
              const actualData = responseData.data;

              if (actualData.list !== undefined) {
                // 标准格式：{ list: [], total: 0 }
                const list = Array.isArray(actualData.list) ? actualData.list : [];
                const total = typeof actualData.total === 'number' ? actualData.total : 0;
                tableData.value = list;
                pagination.total = total;
              } else {
                tableData.value = [];
                pagination.total = 0;
              }
            } else {
              tableData.value = [];
              pagination.total = 0;
            }
          } else {
            // 直接使用 responseData
            if (responseData.list !== undefined) {
              const list = Array.isArray(responseData.list) ? responseData.list : [];
              const total = typeof responseData.total === 'number' ? responseData.total : 0;
              tableData.value = list;
              pagination.total = total;
            } else {
              tableData.value = [];
              pagination.total = 0;
            }
          }
        } else if (Array.isArray(res)) {
          // 如果 res 本身就是数组，直接使用
          tableData.value = res;
          pagination.total = res.length;
        } else if (res.list !== undefined) {
          // 标准格式：{ list: [], total: 0 }
          const list = Array.isArray(res.list) ? res.list : [];
          const total = typeof res.total === 'number' ? res.total : 0;
          tableData.value = list;
          pagination.total = total;
        } else if (res.data && Array.isArray(res.data)) {
          // 嵌套格式：{ data: [] }
          tableData.value = res.data;
          pagination.total = typeof res.total === 'number' ? res.total : res.data.length;
        } else {
          // 其他格式，尝试提取数组
          tableData.value = [];
          pagination.total = 0;
        }
      } else {
        // 如果响应数据无效，清空表格数据
        tableData.value = [];
        pagination.total = 0;
      }

      // 刷新后钩子
      onAfterRefresh?.(res);
    } catch (error) {
      // 发生错误时，清空表格数据并显示错误状态
      tableData.value = [];
      pagination.total = 0;
      onError?.(error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 搜索
   */
  const handleSearch = (params: Record<string, unknown>) => {
    searchParams.value = params;
    pagination.page = 1;
    loadData();
  };

  /**
   * 重置搜索
   */
  const handleReset = () => {
    searchParams.value = {};
    pagination.page = 1;
    loadData();
  };

  /**
   * 打开新增弹窗
   */
  const handleAdd = () => {
    currentRow.value = null;
    upsertMode.value = 'add';
    upsertVisible.value = true;
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (row: T) => {
    currentRow.value = { ...row };
    upsertMode.value = 'update';
    upsertVisible.value = true;
  };

  /**
   * 打开详情弹窗（info 模式）
   * 未使用，保留以备将来使用
   */
  // const handleInfo = (row: T) => {
  //   currentRow.value = { ...row };
  //   upsertMode.value = 'info';
  //   upsertVisible.value = true;
  // };

  /**
   * 打开追加弹窗（对应 cool-admin 的 rowAppend）
   * 追加模式：基于现有数据创建新数据
   * 未使用，保留以备将来使用
   */
  // const handleAppend = (row?: T) => {
  //   currentRow.value = row ? { ...row } : null;
  //   upsertMode.value = 'add';
  //   upsertVisible.value = true;
  // };

  /**
   * 打开详情弹窗（独立弹窗）
   */
  const handleView = (row: T) => {
    viewRow.value = { ...row };
    viewVisible.value = true;
  };

  /**
   * 关闭所有弹窗（对应 cool-admin 的 rowClose）
   */
  const closeDialog = () => {
    upsertVisible.value = false;
    viewVisible.value = false;
    currentRow.value = null;
    viewRow.value = null;
  };

  /**
   * 关闭详情弹窗
   */
  const handleViewClose = () => {
    viewVisible.value = false;
    viewRow.value = null;
  };

  /**
   * 删除单行
   */
  const handleDelete = async (row: T & { id: number | string }) => {
    // 检查 row 是否有有效的 id
    if (!row || row.id === undefined || row.id === null) {
      const errorMsg = '删除失败：行数据缺少有效的 id 字段';
      logger.error('[useCrud]', errorMsg, row);
      onError?.(new Error(errorMsg));
      return;
    }

    // 删除前钩子（对应 cool-admin 的 onDelete）
    if (onBeforeDelete) {
      const canDelete = await onBeforeDelete([row]);
      if (canDelete === false) {
        return;
      }
    }

    try {
      // 单个删除：传递单个 ID 给 delete 方法
      await service.delete(row.id);
      onSuccess?.('删除成功');
      onAfterDelete?.();
      loadData();
    } catch (error) {
      logger.error('[useCrud] Delete operation failed:', error);
      onError?.(error);
    }
  };

  /**
   * 批量删除
   */
  const handleMultiDelete = async () => {
    if (selection.value.length === 0) {
      const errorMsg = '请选择要删除的数据';
      console.warn('[useCrud]', errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    // 删除前钩子
    if (onBeforeDelete) {
      const canDelete = await onBeforeDelete(selection.value as T[]);
      if (canDelete === false) {
        return;
      }
    }

    try {
      const ids = selection.value.map((row: any) => row.id);
      // 批量删除：使用专门的 deleteBatch 方法
      await service.deleteBatch(ids);
      onSuccess?.(`成功删除 ${ids.length} 条数据`);
      onAfterDelete?.();
      clearSelection();
      loadData();
    } catch (error) {
      logger.error('[useCrud] Multi-delete operation failed:', error);
      onError?.(error);
    }
  };

  /**
   * 选择变化
   */
  const handleSelectionChange = (rows: T[]) => {
    selection.value = rows;
  };

  /**
   * 清空选择
   */
  const clearSelection = () => {
    selection.value = [];
  };

  /**
   * 切换行选择
   */
  const toggleSelection = (row: T, selected?: boolean) => {
    // 这个方法需要在组件中配合 el-table ref 使用
    // 这里只提供状态管理
    const index = selection.value.findIndex((item: any) => item === row);

    if (selected === undefined) {
      // 切换状态
      if (index > -1) {
        selection.value.splice(index, 1);
      } else {
        selection.value.push(row as any);
      }
    } else if (selected && index === -1) {
      // 选中
      selection.value.push(row as any);
    } else if (!selected && index > -1) {
      // 取消选中
      selection.value.splice(index, 1);
    }
  };

  /**
   * 刷新 - 强制更新版本 2024-01-16 15:30
   */
  const handleRefresh = async () => {
    if (isRefreshing.value) {
      return;
    }
    isRefreshing.value = true;
    try {
      await loadData();
    } finally {
      isRefreshing.value = false;
    }
  };

  /**
   * 强制刷新数据 - 确保数据更新
   */
  const forceRefresh = async () => {
    // 重置刷新状态
    isRefreshing.value = false;
    // 强制重新加载数据
    await loadData();
    // 确保UI更新完成
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  /**
   * 页码改变 - 强制更新版本 2024-01-16 15:30
   */
  const handlePageChange = (page: number) => {
    if (isRefreshing.value) {
      return;
    }
    pagination.page = page;
    loadData();
  };

  /**
   * 每页条数改变
   */
  const handleSizeChange = (size: number) => {
    pagination.size = size;
    pagination.page = 1;
    loadData();
  };

  /**
   * 获取请求参数（对应 cool-admin 的 getParams）
   */
  const getParams = () => {
    return {
      page: pagination.page,
      size: pagination.size,
      ...searchParams.value,
    };
  };

  /**
   * 设置请求参数（对应 cool-admin 的 setParams）
   */
  const setParams = (params: Record<string, unknown>) => {
    Object.assign(searchParams.value, params);
  };

  const crudInstance: UseCrudReturn<T> = {
    // 数据
    data: tableData as any,
    tableData: tableData as any,
    loading,
    total: computed(() => pagination.total),
    page: computed(() => pagination.page),
    size: computed(() => pagination.size),
    pagination,

    // 方法
    refresh: loadData,
    loadData,
    forceRefresh,
    add: handleAdd,
    handleAdd,
    edit: handleEdit,
    handleEdit,
    delete: handleMultiDelete,
    handleDelete: handleDelete as any,
    handleMultiDelete,
    search: (keyword: string) => {
      searchParams.value.keyword = keyword;
      loadData();
    },
    handleSearch: handleSearch as any,
    reset: handleReset,
    handleReset,
    handleRefresh,

    // 状态
    upsertVisible,
    upsertLoading: ref(false),
    upsertData: currentRow as any,
    isEdit: computed(() => upsertMode.value === 'update'),
    selectedRows: selection as any,
    selection: selection as any,
    searchKeyword: ref(''),
    currentRow: currentRow as any,
    upsertMode,
    viewVisible,
    viewRow: viewRow as any,

    // 服务
    service: service as any,

    // 其他方法
    handleSelectionChange,
    clearSelection,
    toggleSelection,
    handlePageChange,
    handleSizeChange,
    getParams,
    setParams,
    closeDialog,
    handleView,
    handleViewClose,
    toolbarContext,
    setToolbarContext,
  };

  // 如果有回调函数，调用它
  if (callback) {
    callback(crudInstance);
  }

  return crudInstance;
}

