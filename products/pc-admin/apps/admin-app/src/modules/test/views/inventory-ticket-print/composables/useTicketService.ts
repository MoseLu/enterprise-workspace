import { ref, computed } from 'vue';
import { useI18n } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import { service } from '@/services/eps';
import type { TableColumn } from '@btc/shared-components';

/**
 * 盘点票服务相关的 composable
 */
export function useTicketService() {
  const { t } = useI18n();
  const loading = ref(false);
  const ticketList = ref<any[]>([]);
  const selectedDomain = ref<any>(null);
  const positionFilter = ref('');
  const materialCodeFilter = ref('');
  const pagination = ref({
    page: 1,
    size: 20,
    total: 0,
  });

  // 仓位输入框 placeholder
  const positionPlaceholder = computed(() => {
    const prefix = t('common.validation.required_prefix');
    const storageLocation = t('inventory.result.fields.storageLocation');
    return `${prefix}${storageLocation}`;
  });

  // 物料编码输入框 placeholder
  const materialCodePlaceholder = computed(() => {
    const materialCode = t('system.material.fields.materialCode');
    return t('inventory.ticket.print.material_code_placeholder', { materialCode });
  });

  // 表格列配置
  const tableColumns = computed<TableColumn[]>(() => [
    { type: 'index', label: t('common.index') },
    { prop: 'checkNo', label: t('system.inventory.base.fields.checkNo'), showOverflowTooltip: true },
    { prop: 'partName', label: t('system.material.fields.materialCode'), showOverflowTooltip: true },
    { prop: 'position', label: t('inventory.result.fields.storageLocation'), showOverflowTooltip: true },
  ]);

  // 盘点票服务（包装为 BtcCrud 需要的格式）
  const checkTicketService = service.admin?.base?.checkTicket;

  const ticketService = {
    // 包装 info 服务为 page 方法
    page: async (params: any) => {
      loading.value = true;
      try {
        const checkTicketInfoService = checkTicketService?.info;
        if (!checkTicketInfoService) {
          BtcMessage.warning(t('inventory.ticket.print.service_unavailable'));
          return { list: [], total: 0 };
        }

        // 构建请求参数 - 使用 keyword 对象，内部放 domainId 和 position 属性
        const requestParams: any = {
          keyword: {}
        };

        // 传递 domainId 参数到 keyword 对象中
        if (selectedDomain.value?.domainId) {
          requestParams.keyword.domainId = selectedDomain.value.domainId;
        }

        // 传递 position 参数到 keyword 对象中（必须传递，没有输入则为空串）
        requestParams.keyword.position = positionFilter.value?.trim() || '';

        // 直接调用 checkTicket.info 服务（EPS 生成的方法已经包含正确的路径和方法）
        const response = await checkTicketInfoService(requestParams);

        // 处理响应数据
        // 响应结构：{ code: 200, msg: "响应成功", data: [...] }
        let list: any[] = [];
        if (response && typeof response === 'object') {
          if ('data' in response && Array.isArray(response.data)) {
            list = response.data;
          } else if (Array.isArray(response)) {
            list = response;
          } else if (response.data && typeof response.data === 'object' && 'list' in response.data) {
            list = response.data.list || [];
          }
        }

        // 前端筛选：根据物料编码进行模糊匹配（后端不支持，需要在前端筛选）
        if (materialCodeFilter.value?.trim()) {
          const filterText = materialCodeFilter.value.trim().toLowerCase();
          list = list.filter((item: any) => {
            const partName = (item.partName || '').toLowerCase();
            return partName.includes(filterText);
          });
        }

        // 前端分页处理
        const page = params.page || pagination.value.page || 1;
        const size = params.size || pagination.value.size || 20;
        const total = list.length; // 统计全量数据的总数
        const start = (page - 1) * size;
        const end = start + size;
        const paginatedList = list.slice(start, end);

        ticketList.value = paginatedList;
        pagination.value.total = total;

        // BtcCrud 期望的返回格式：{ list: [], total: number }
        return {
          list: paginatedList,
          total: total, // 直接返回 total，而不是嵌套在 pagination 中
        };
      } catch (error) {
        // 响应拦截器已显示错误消息，不需要在控制台打印
        // 如果响应拦截器没有显示消息（如网络错误），这里再显示一次
        BtcMessage.error(t('inventory.ticket.print.load_failed'));
        return { list: [], total: 0 };
      } finally {
        loading.value = false;
      }
    },
    // 如果有其他方法，也可以展开
    ...(checkTicketService || {}),
  };

  // 左侧域列表使用物流域的仓位配置页面的 page 接口
  const domainService = {
    list: async () => {
      try {
        // 调用物流域仓位配置的 page 接口
        const response = await service.logistics?.base?.position?.page?.({ page: 1, size: 1000 });

        // 处理响应数据
        let data = response;
        if (response && typeof response === 'object' && 'data' in response) {
          data = response.data;
        }

        const positionList = data?.list || [];

        // 从仓位数据中提取唯一的域信息（根据 domainId 和 name 去重）
        const domainMap = new Map<string, any>();
        positionList.forEach((item: any) => {
          const domainId = item.domainId;
          if (domainId && !domainMap.has(domainId)) {
            domainMap.set(domainId, {
              id: domainId,
              domainId: domainId,
              name: item.name || '',
              domainCode: domainId,
              value: domainId,
            });
          }
        });

        // 返回域列表
        return Array.from(domainMap.values());
      } catch (error) {
        // 响应拦截器已显示错误消息，不需要在控制台打印
        return [];
      }
    }
  };

  return {
    loading,
    ticketList,
    selectedDomain,
    positionFilter,
    materialCodeFilter,
    pagination,
    positionPlaceholder,
    materialCodePlaceholder,
    tableColumns,
    ticketService,
    domainService,
  };
}

