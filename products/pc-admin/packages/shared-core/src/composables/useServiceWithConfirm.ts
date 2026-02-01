/**
 * Service 包装工具
 * 用于为 service 添加统一的删除确认逻辑
 */

import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useI18n } from '../btc/plugins/i18n';
import type { CrudService } from '../btc/crud/types';

/**
 * 为 service 添加删除确认逻辑
 * @param service 原始 service 对象
 * @param options 配置选项
 * @returns 包装后的 service
 */
export function useServiceWithConfirm<T extends CrudService>(
  service: T,
  options?: {
    /**
     * 是否显示删除确认（默认 true）
     */
    showConfirm?: boolean;
    /**
     * 自定义确认消息
     */
    confirmMessage?: string;
    /**
     * 是否显示成功消息（默认 false，由 BtcCrud 统一处理）
     */
    showSuccessMessage?: boolean;
    /**
     * 自定义成功消息
     */
    successMessage?: string;
  }
): T {
  const { t } = useI18n();
  const {
    showConfirm = true,
    confirmMessage,
    showSuccessMessage = false,
    successMessage,
  } = options || {};

  if (!service) {
    return service;
  }

  const wrappedService = {
    ...service,
  } as T;

  // 包装 delete 方法
  if (service.delete) {
    wrappedService.delete = async (id: string | number) => {
      if (showConfirm) {
        await BtcConfirm(
          confirmMessage || t('crud.message.delete_confirm'),
          t('common.button.confirm'),
          { type: 'warning' }
        );
      }

      await service.delete(id);

      // 如果需要显示成功消息（通常由 BtcCrud 统一处理）
      if (showSuccessMessage) {
        BtcMessage.success(successMessage || t('crud.message.delete_success'));
      }
    };
  }

  // 包装 deleteBatch 方法
  if (service.deleteBatch) {
    wrappedService.deleteBatch = async (ids: (string | number)[]) => {
      if (showConfirm) {
        await BtcConfirm(
          confirmMessage || t('crud.message.delete_confirm'),
          t('common.button.confirm'),
          { type: 'warning' }
        );
      }

      await service.deleteBatch(ids);

      // 如果需要显示成功消息（通常由 BtcCrud 统一处理）
      if (showSuccessMessage) {
        BtcMessage.success(successMessage || t('crud.message.delete_success'));
      }
    };
  }

  return wrappedService;
}
