import { computed, Ref } from 'vue';
import { useMessage } from '@/utils/use-message';
import { useI18n } from '@btc/shared-core';

/**
 * 操作过滤逻辑
 */
export function useActionFilter(
  actions: Ref<any[]>,
  selectedResources: Ref<number[]>,
  resourceTreeRef: Ref<any>,
  resourceTree: Ref<any[]>
) {
  const { t } = useI18n();
  const message = useMessage();
  
  const filteredActions = computed(() => {
    if (selectedResources.value.length === 0) {
      return actions.value;
    }
    
    // 扁平化资源树以便查找
    const flattenResources = (tree: any[]): any[] => {
      const result: any[] = [];
      for (const node of tree) {
        result.push(node);
        if (node.children) {
          result.push(...flattenResources(node.children));
        }
      }
      return result;
    };
    
    const allResources = flattenResources(resourceTree.value);
    
    const filtered = actions.value.filter(action => {
      return selectedResources.value.every(resourceId => {
        const resource = allResources.find((r: any) => r.id === resourceId);
        return resource && resource.supportedActions && resource.supportedActions.includes(action.id);
      });
    });
    
    if (filtered.length === 0) {
      message.warning(t('common.access.no_common_actions'));
    }
    
    return filtered;
  });
  
  const isActionSupported = (actionId: number) => {
    if (selectedResources.value.length === 0) return true;
    
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    if (checkedNodes.length === 0) return true;
    
    const supportedCount = checkedNodes.filter((node: any) =>
      !node.supportedActions || node.supportedActions.includes(actionId)
    ).length;
    
    return supportedCount < selectedResources.value.length;
  };
  
  const getActionSupportCount = (actionId: number) => {
    if (selectedResources.value.length === 0) return 0;
    
    const checkedNodes = resourceTreeRef.value?.getCheckedNodes() || [];
    return checkedNodes.filter((node: any) =>
      !node.supportedActions || node.supportedActions.includes(actionId)
    ).length;
  };
  
  const isActionSupportedByResource = (resourceId: number, actionId: number) => {
    const findResource = (tree: any[], id: number): any => {
      for (const node of tree) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findResource(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const resource = findResource(resourceTree.value, resourceId);
    if (!resource || !resource.supportedActions) return true;
    return resource.supportedActions.includes(actionId);
  };
  
  return {
    filteredActions,
    isActionSupported,
    getActionSupportCount,
    isActionSupportedByResource,
  };
}

