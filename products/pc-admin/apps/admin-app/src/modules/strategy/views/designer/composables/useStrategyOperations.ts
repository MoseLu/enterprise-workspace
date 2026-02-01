;
﻿import { ref, computed, type Ref } from 'vue';
import { useI18n, logger } from '@btc/shared-core';
import { BtcMessage } from '@btc/shared-components';
import type { StrategyOrchestration, StrategyNode, StrategyConnection } from '@/types/strategy';
import { strategyService } from '@/services/strategy';

/**
 * 策略操作管理
 */
export function useStrategyOperations(
  nodes: Ref<StrategyNode[]>,
  connections: Ref<StrategyConnection[]>
) {
  const { t } = useI18n();
  // 策略信息
  const strategyName = ref(t('common.strategy.designer.operations.new_orchestration'));
  const showPreview = ref(false);

  // 当前编排数据
  const currentOrchestration = computed<StrategyOrchestration>(() => ({
    id: Date.now().toString(),
    strategyId: '',
    nodes: nodes.value,
    connections: connections.value,
    variables: {},
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }));

  // 验证编排
  const validateOrchestration = async () => {
    try {
      const result = await strategyService.validateOrchestration(currentOrchestration.value);

      if (result.valid) {
        BtcMessage.success(t('common.strategy.designer.operations.validation_passed'));
        return true;
      } else {
        BtcMessage.error(`${t('common.strategy.designer.operations.validation_failed_prefix')}${result.errors.join(', ')}`);
        return false;
      }
    } catch (error) {
      BtcMessage.error(t('common.strategy.designer.operations.validation_failed'));
      return false;
    }
  };

  // 预览执行
  const previewExecution = () => {
    if (nodes.value.length === 0) {
      BtcMessage.warning(t('common.strategy.designer.execution_preview.add_nodes_first'));
      return;
    }

    showPreview.value = true;
  };

  // 保存编排
  const saveOrchestration = async (strategyId?: string) => {
    if (!strategyId) {
      BtcMessage.warning(t('common.strategy.designer.operations.select_or_create_strategy_first'));
      return false;
    }

    try {
      await strategyService.updateOrchestration(strategyId, currentOrchestration.value);
      BtcMessage.success(t('common.strategy.designer.operations.save_success'));
      return true;
    } catch (error) {
      BtcMessage.error(t('common.save_failed'));
      return false;
    }
  };

  // 加载编排
  const loadOrchestration = async (strategyId: string) => {
    try {
      const orchestration = await strategyService.getOrchestration(strategyId);
      nodes.value = orchestration.nodes;
      connections.value = orchestration.connections;

      if (orchestration.metadata?.name) {
        strategyName.value = orchestration.metadata.name;
      }

      BtcMessage.success(t('common.strategy.designer.operations.load_success'));
      return orchestration;
    } catch (error) {
      logger.error('Failed to load orchestration:', error);
      BtcMessage.error(t('common.strategy.designer.operations.load_failed'));
      return null;
    }
  };

  // 清空编排
  const clearOrchestration = () => {
    nodes.value = [];
    connections.value = [];
    strategyName.value = t('common.strategy.designer.operations.new_orchestration');
    BtcMessage.success(t('common.strategy.designer.operations.clear_success'));
  };

  // 导出编排
  const exportOrchestration = () => {
    const data = JSON.stringify(currentOrchestration.value, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${strategyName.value || 'strategy'}.json`;
    link.click();

    URL.revokeObjectURL(url);
    BtcMessage.success(t('common.strategy.designer.operations.export_success'));
  };

  // 导入编排
  const importOrchestration = (file: File) => {
    return new Promise<boolean>((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          if (data.nodes && data.connections) {
            nodes.value = data.nodes;
            connections.value = data.connections;

            if (data.metadata?.name) {
              strategyName.value = data.metadata.name;
            }

            BtcMessage.success(t('common.strategy.designer.operations.import_success'));
            resolve(true);
          } else {
            BtcMessage.error(t('common.strategy.designer.operations.invalid_file_format'));
            resolve(false);
          }
        } catch (error) {
          BtcMessage.error(t('common.strategy.designer.operations.parse_failed'));
          resolve(false);
        }
      };

      reader.onerror = () => {
        BtcMessage.error(t('common.strategy.designer.operations.file_read_failed'));
        resolve(false);
      };

      reader.readAsText(file);
    });
  };

  // 处理保存
  const handleSave = async () => {
    if (nodes.value.length === 0) {
      BtcMessage.warning(t('common.strategy.designer.execution_preview.add_nodes_first'));
      return;
    }

    // 这里可以添加保存逻辑，比如保存到本地存储或发送到服务器
    BtcMessage.success(t('common.strategy.designer.operations.save_success'));
  };

  return {
    // 状态
    strategyName,
    showPreview,
    currentOrchestration,

    // 方法
    validateOrchestration,
    previewExecution,
    saveOrchestration,
    handleSave,
    loadOrchestration,
    clearOrchestration,
    exportOrchestration,
    importOrchestration
  };
}
