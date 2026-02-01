import { computed, Ref } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';

/**
 * 组合模式逻辑
 */
export function useComposeMode(
  actions: Ref<any[]>,
  selectedResources: Ref<number[]>,
  selectedActions: Ref<number[]>,
  resourceTreeRef: Ref<any>,
  composedPermissions: Ref<any[]>
) {
  const { t } = useI18n();
  const message = useMessage();
  
  const composeCount = computed(() => {
    if (selectedResources.value.length === 0 || selectedActions.value.length === 0) {
      return 0;
    }
    
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    let count = 0;
    
    checkedNodes.forEach((resource: any) => {
      selectedActions.value.forEach(actionId => {
        if (!resource.supportedActions || resource.supportedActions.includes(actionId)) {
          count++;
        }
      });
    });
    
    return count;
  });
  
  const canCompose = computed(() => {
    return composeCount.value > 0;
  });
  
  const handleCompose = async (composing: Ref<boolean>) => {
    if (!canCompose.value) {
      message.warning(t('common.access.select_resource_and_action'));
      return;
    }
    
    composing.value = true;
    try {
      const newPermissions: any[] = [];
      const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
      
      const existingKeys = new Set(composedPermissions.value.map((p: any) => p.key));
      
      checkedNodes.forEach((resource: any) => {
        selectedActions.value.forEach(actionId => {
          const action = actions.value.find((a: any) => a.id === actionId);
          if (!action) return;
          
          if (resource.supportedActions && !resource.supportedActions.includes(actionId)) {
            return;
          }
          
          const key = `${resource.id}-${actionId}`;
          
          if (existingKeys.has(key)) return;
          
          newPermissions.push({
            key,
            permissionName: `${action.actionNameCn}${resource.resourceNameCn}`,
            permissionCode: `${resource.resourceCode}:${action.actionCode}`,
            resourceId: resource.id,
            resourceName: resource.resourceNameCn,
            actionId: action.id,
            actionName: action.actionNameCn,
            description: `${action.actionNameCn}${resource.resourceNameCn}${t('common.access.permission_of')}`,
          });
        });
      });
      
      if (newPermissions.length === 0) {
        message.warning(t('common.access.no_permissions_to_add'));
        return;
      }
      
      composedPermissions.value.push(...newPermissions);
      message.success(`${t('common.access.added')} ${newPermissions.length} ${t('common.access.permissions')}`);
      
      resourceTreeRef.value?.setCheckedKeys([]);
      selectedResources.value.length = 0;
      selectedActions.value.length = 0;
    } catch (_error) {
      message.error(t('common.error.generate_failed'));
    } finally {
      composing.value = false;
    }
  };
  
  return {
    composeCount,
    canCompose,
    handleCompose,
  };
}

