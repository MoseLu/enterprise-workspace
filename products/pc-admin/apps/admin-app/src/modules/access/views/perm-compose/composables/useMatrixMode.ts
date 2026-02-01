import { computed, Ref } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';

/**
 * 矩阵模式逻辑
 */
export function useMatrixMode(
  resourceTree: Ref<any[]>,
  actions: Ref<any[]>,
  selectedResources: Ref<number[]>,
  matrixSelections: Ref<Set<string>>,
  composedPermissions: Ref<any[]>,
  resourceTreeRef: Ref<any>
) {
  const message = useMessage();
  const { t } = useI18n();
  
  const matrixData = computed(() => {
    if (selectedResources.value.length === 0) {
      return [];
    }
    
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    return checkedNodes;
  });
  
  const isPermissionChecked = (resourceId: number, actionId: number) => {
    return matrixSelections.value.has(`${resourceId}-${actionId}`);
  };
  
  const handleMatrixToggle = (resourceId: number, actionId: number, checked: boolean | string | number) => {
    const key = `${resourceId}-${actionId}`;
    
    if (checked) {
      matrixSelections.value.add(key);
      
      const resource = matrixData.value.find((r: any) => r.id === resourceId);
      const action = actions.value.find((a: any) => a.id === actionId);
      
      if (resource && action) {
        const existingKeys = new Set(composedPermissions.value.map((p: any) => p.key));
        if (!existingKeys.has(key)) {
          composedPermissions.value.push({
            key,
            permissionName: `${action.actionNameCn}${resource.resourceNameCn}`,
            permissionCode: `${resource.resourceCode}:${action.actionCode}`,
            resourceId: resource.id,
            resourceName: resource.resourceNameCn,
            actionId: action.id,
            actionName: action.actionNameCn,
            description: `${action.actionNameCn}${resource.resourceNameCn}${t('common.access.permission_of')}`,
          });
          message.success(`${t('common.access.added')}${action.actionNameCn}${resource.resourceNameCn}`);
        }
      }
    } else {
      matrixSelections.value.delete(key);
      
      const index = composedPermissions.value.findIndex((p: any) => p.key === key);
      if (index > -1) {
        const perm = composedPermissions.value[index];
        composedPermissions.value.splice(index, 1);
        message.info(`${t('common.access.removed_permission')}${perm.permissionName}`);
      }
    }
  };
  
  return {
    matrixData,
    isPermissionChecked,
    handleMatrixToggle,
  };
}

