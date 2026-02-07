;
import { ref, computed, watch, onMounted } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n, logger } from '@btc/shared-core';
import type { ProcessManagementItem } from '@btc/shared-components';
import { service } from '@/services/eps';

// 将 API 返回的数据映射到 ProcessManagementItem
interface CheckBaseItem {
  id?: number | string;
  checkNo?: string;
  domainId?: string;
  checkType?: string;
  checkStatus?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  checker?: string;
  remark?: string;
  remainingSeconds?: number;
  createdAt?: string | Date;
  updateAt?: string | Date;
  deletedAt?: string | Date;
}

// 状态映射：将后端状态映射到前端状态
const mapCheckStatus = (checkStatus?: string): 'pending' | 'running' | 'paused' | 'completed' => {
  if (!checkStatus) return 'pending';

  const statusMap: Record<string, 'pending' | 'running' | 'paused' | 'completed'> = {
    'pending': 'pending',
    '待开始': 'pending',
    'running': 'running',
    '进行中': 'running',
    'paused': 'paused',
    '已暂停': 'paused',
    '暂停': 'paused',
    '暂停中': 'paused',
    'completed': 'completed',
    '已完成': 'completed',
    '已结束': 'completed',
    '结束': 'completed',
  };

  return statusMap[checkStatus] || 'pending';
};

// 将 API 数据转换为 ProcessManagementItem
const mapToProcessItem = (item: CheckBaseItem, statusValue?: string): ProcessManagementItem => {
  // 注意：后端未提供 startTime/endTime 时，不要强行赋值（否则会出现“计划开始/结束=当前时间”的误导）
  // 以 checkStatus 为准：没有时间就展示为空，组件自行处理显示为 '-'。
  const scheduledStartTime = item.startTime ? new Date(item.startTime) : undefined;
  const scheduledEndTime = item.endTime ? new Date(item.endTime) : undefined;

  // 使用通过 status API 获取的状态
  const status = mapCheckStatus(statusValue);

  // 判断是否有实际开始/结束时间
  // 根据后端状态判断：如果状态不是 pending，则认为已开始
  // 如果状态是 completed，则认为已结束
  const hasActualStart = status !== 'pending';
  const hasActualEnd = status === 'completed';

  // 如果后端状态表明已开始，使用开始时间作为实际开始时间
  // 如果后端状态表明已结束，使用结束时间作为实际结束时间
  const actualStartTime = hasActualStart ? scheduledStartTime : undefined;
  const actualEndTime = hasActualEnd ? scheduledEndTime : undefined;

  const result: ProcessManagementItem = {
    id: String(item.id || ''),
    name: item.remark || item.checkNo || `盘点-${item.id}`, // 优先使用 remark 作为流程标题
    status,
    ...(scheduledStartTime !== undefined && { scheduledStartTime }),
    ...(scheduledEndTime !== undefined && { scheduledEndTime }),
    ...(actualStartTime !== undefined && { actualStartTime }),
    ...(actualEndTime !== undefined && { actualEndTime }),
    ...(item.remark !== undefined && { description: item.remark }),
  };
  return result;
};

export function useInventoryProcess() {
  const { t } = useI18n();
  const message = useMessage();

  const processes = ref<ProcessManagementItem[]>([]);
  const loading = ref(false);
  const searchKeyword = ref('');
  const statusFilter = ref<string>('');

  // 过滤后的流程列表
  const filteredProcesses = computed(() => {
    let result = processes.value;

    // 按关键词搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase();
      result = result.filter(
        (p: ProcessManagementItem) => p.name.toLowerCase().includes(keyword)
      );
    }

    // 按状态筛选
    if (statusFilter.value) {
      result = result.filter((p: ProcessManagementItem) => p.status === statusFilter.value);
    }

    return result;
  });

  // 刷新单个流程的状态（通过 status API）
  const refreshProcessStatus = async (processId: string | number): Promise<string | undefined> => {
    try {
      const statusResponse = await service.logistics?.warehouse?.check?.status?.({ id: processId });
      // status API 可能返回状态字符串或包含状态的对象
      return typeof statusResponse === 'string'
        ? statusResponse
        : statusResponse?.status || statusResponse?.checkStatus || statusResponse?.data?.status || statusResponse?.data?.checkStatus;
    } catch (error) {
      logger.error(`[InventoryProcess] Failed to refresh status for process ${processId}:`, error);
      return undefined;
    }
  };

  // 加载流程列表
  const loadProcesses = async () => {
    try {
      loading.value = true;

      // 调用真实 API：查询盘点流程表（暂时不支持搜索，不传递参数）
      const response = await service.logistics?.warehouse?.check?.info?.();

      // 转换数据格式
      // info API 可能返回单个对象或数组，需要统一处理
      let list: any[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (response?.data) {
        // 处理 { code: 200, data: [...] } 格式
        if (Array.isArray(response.data)) {
          list = response.data;
        } else if (response.data?.list) {
          list = response.data.list;
        } else if (response.data?.records) {
          list = response.data.records;
        } else if (response.data && typeof response.data === 'object') {
          list = [response.data];
        }
      } else if (response?.list) {
        list = response.list;
      } else if (response?.records) {
        list = response.records;
      } else if (response && typeof response === 'object') {
        // 如果是单个对象，转换为数组
        list = [response];
      }

      // 直接使用 info API 返回的 checkStatus，不需要额外调用 status API
      let mappedList = list.map((item) => {
        // 直接使用 item.checkStatus
        return mapToProcessItem(item, item.checkStatus);
      });

      // 前端过滤：按搜索关键词
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        mappedList = mappedList.filter((p: ProcessManagementItem) =>
          p.name.toLowerCase().includes(keyword)
        );
      }

      // 前端过滤：按状态筛选
      if (statusFilter.value) {
        mappedList = mappedList.filter((p: ProcessManagementItem) => p.status === statusFilter.value);
      }

      processes.value = mappedList;
    } catch (error) {
      logger.error('[InventoryProcess] Load failed:', error);
      message.error(t('process.load.failed') || '加载流程列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 监听搜索关键词变化，自动重新加载（防抖处理）
  let searchTimer: ReturnType<typeof setTimeout> | null = null;
  watch(searchKeyword, () => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      loadProcesses();
    }, 500); // 500ms 防抖
  });

  // 监听状态筛选变化，自动重新加载
  watch(statusFilter, () => {
    loadProcesses();
  });


  // 手动开始
  const startProcess = async (process: ProcessManagementItem) => {
    if (process.actualStartTime) {
      message.warning(t('process.start.already') || '流程已经开始，不能重复开始');
      return;
    }

    try {
      loading.value = true;

      // 调用 API：开始盘点
      await service.logistics?.warehouse?.check?.start?.({ id: process.id });

      // 通过 status API 刷新单个流程的状态
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index = processes.value.findIndex((p: ProcessManagementItem) => p.id === process.id);
        if (index !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index];
          if (!currentProcess) return;
          // 更新状态和实际开始时间
          const scheduledStartTime = currentProcess.scheduledStartTime;
          processes.value[index] = {
            ...currentProcess,
            status: mappedStatus,
            ...(scheduledStartTime !== undefined && { actualStartTime: scheduledStartTime }), // 使用计划开始时间作为实际开始时间
          };
        }
      }

      message.success(t('process.start.success', { name: process.name }) || `流程 "${process.name}" 已开始`);
    } catch (error) {
      logger.error('[InventoryProcess] Start failed:', error);
      message.error(t('process.start.failed') || '开始流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 暂停流程
  const pauseProcess = async (process: ProcessManagementItem, reason?: string) => {
    if (process.status !== 'running') {
      message.warning(t('process.pause.invalid') || '只有运行中的流程才能暂停');
      return;
    }

    try {
      loading.value = true;

      // 调用 API：暂停盘点
      await service.logistics?.warehouse?.check?.pause?.({ id: process.id, reason });

      // 通过 status API 刷新单个流程的状态
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index = processes.value.findIndex((p: ProcessManagementItem) => p.id === process.id);
        if (index !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index];
          if (currentProcess) {
            processes.value[index] = {
              ...currentProcess,
              status: mappedStatus,
            };
          }
        }
      }

      message.success(t('process.pause.success', { name: process.name }) || `流程 "${process.name}" 已暂停`);
    } catch (error) {
      logger.error('[InventoryProcess] Pause failed:', error);
      message.error(t('process.pause.failed') || '暂停流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 恢复流程
  const resumeProcess = async (process: ProcessManagementItem) => {
    if (process.status !== 'paused') {
      message.warning(t('process.resume.invalid') || '只有暂停的流程才能恢复');
      return;
    }

    try {
      loading.value = true;

      // 调用 API：继续盘点
      await service.logistics?.warehouse?.check?.recover?.({ id: process.id });

      // 通过 status API 刷新单个流程的状态
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index = processes.value.findIndex((p: ProcessManagementItem) => p.id === process.id);
        if (index !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index];
          if (currentProcess) {
            processes.value[index] = {
              ...currentProcess,
              status: mappedStatus,
            };
          }
        }
      }

      message.success(t('process.resume.success', { name: process.name }) || `流程 "${process.name}" 已恢复`);
    } catch (error) {
      logger.error('[InventoryProcess] Resume failed:', error);
      message.error(t('process.resume.failed') || '恢复流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 结束流程
  const endProcess = async (process: ProcessManagementItem) => {
    if (process.actualEndTime) {
      message.warning(t('process.end.already') || '流程已经结束，不能重复结束');
      return;
    }

    if (!process.actualStartTime) {
      message.warning(t('process.end.notStarted') || '流程尚未开始，不能结束');
      return;
    }

    try {
      loading.value = true;

      // 调用 API：结束盘点
      await service.logistics?.warehouse?.check?.finish?.({ id: process.id });

      // 通过 status API 刷新单个流程的状态
      const newStatus = await refreshProcessStatus(process.id);
      if (newStatus) {
        const index = processes.value.findIndex((p: ProcessManagementItem) => p.id === process.id);
        if (index !== -1) {
          const mappedStatus = mapCheckStatus(newStatus);
          const currentProcess = processes.value[index];
          if (!currentProcess) return;
          // 更新状态和实际结束时间
          const scheduledEndTime = currentProcess.scheduledEndTime;
          processes.value[index] = {
            ...currentProcess,
            status: mappedStatus,
            ...(scheduledEndTime !== undefined && { actualEndTime: scheduledEndTime }), // 使用计划结束时间作为实际结束时间
          };
        }
      }

      message.success(t('process.end.success', { name: process.name }) || `流程 "${process.name}" 已结束`);
    } catch (error) {
      logger.error('[InventoryProcess] End failed:', error);
      message.error(t('process.end.failed') || '结束流程失败');
    } finally {
      loading.value = false;
    }
  };

  // 详情相关状态
  const detailVisible = ref(false);
  const detailLoading = ref(false);
  const detailData = ref<CheckBaseItem | null>(null);

  // 查看详情
  const viewProcessDetail = async (process: ProcessManagementItem) => {
    try {
      detailVisible.value = true;
      detailLoading.value = true;

      // 调用 info API 获取详情
      const response = await service.logistics?.warehouse?.check?.info?.({ id: process.id });
      // 处理响应数据，可能是在 data 字段中，也可能直接返回
      detailData.value = response?.data || response || null;
    } catch (error) {
      logger.error('[InventoryProcess] Load detail failed:', error);
      message.error(t('process.detail.load.failed') || '加载详情失败');
      detailVisible.value = false;
    } finally {
      detailLoading.value = false;
    }
  };

  onMounted(() => {
    loadProcesses();
  });

  return {
    processes,
    loading,
    searchKeyword,
    statusFilter,
    filteredProcesses,
    loadProcesses,
    startProcess,
    pauseProcess,
    resumeProcess,
    endProcess,
    viewProcessDetail,
    detailVisible,
    detailLoading,
    detailData,
  };
}

