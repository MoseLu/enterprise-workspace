import { storage } from '@btc/shared-utils';
import { ref, watch } from 'vue';
import { useI18n } from '@btc/shared-core';

/**
 * 权限组合数据管理
 */
export function usePermComposeData() {
  const { t } = useI18n();
  const resourceTree = ref<any[]>([]);
  const actions = ref<any[]>([]);
  const composedPermissions = ref<any[]>([]);
  
  const resourceTreeRef = ref();
  const resourceFilterText = ref('');
  const applyToChildren = ref(false);
  
  const treeProps = {
    children: 'children',
    label: 'resourceNameCn',
  };
  
  const selectedResources = ref<number[]>([]);
  const selectedActions = ref<number[]>([]);
  
  const matrixSelections = ref<Set<string>>(new Set());
  
  const filterResourceNode = (value: string, data: any) => {
    if (!value) return true;
    return data.resourceNameCn.toLowerCase().includes(value.toLowerCase()) ||
           data.resourceCode.toLowerCase().includes(value.toLowerCase());
  };
  
  watch(resourceFilterText, (val) => {
    resourceTreeRef.value?.filter(val);
  });
  
  const loadData = async () => {
    const resourcesRaw = storage.get<any>('btc_mock_btc_resources');
    const actionsRaw = storage.get<any>('btc_mock_btc_actions');
    
    if (resourcesRaw) {
      resourceTree.value = resourcesRaw;
    } else {
      resourceTree.value = [
        {
          id: 1,
          resourceNameCn: t('menu.org.users'),
          resourceCode: 'user',
          resourceType: t('common.menu'),
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 11, resourceNameCn: t('menu.org.users'), resourceCode: 'user.list', resourceType: t('common.menu'), supportedActions: [1, 2, 3, 4] },
            { id: 12, resourceNameCn: t('menu.org.user_detail'), resourceCode: 'user.detail', resourceType: t('common.menu'), supportedActions: [1] },
          ]
        },
        {
          id: 2,
          resourceNameCn: t('menu.access.roles'),
          resourceCode: 'role',
          resourceType: t('common.menu'),
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 21, resourceNameCn: t('menu.access.roles'), resourceCode: 'role.list', resourceType: t('common.menu'), supportedActions: [1, 2, 3, 4] },
            { id: 22, resourceNameCn: t('menu.access.role_assign'), resourceCode: 'role.assign', resourceType: t('common.menu'), supportedActions: [1, 4] },
          ]
        },
        {
          id: 3,
          resourceNameCn: t('menu.org.departments'),
          resourceCode: 'department',
          resourceType: t('common.menu'),
          supportedActions: [1, 2, 3, 4],
          children: [
            { id: 31, resourceNameCn: t('menu.org.departments'), resourceCode: 'dept.list', resourceType: t('common.menu'), supportedActions: [1, 2, 3, 4] },
          ]
        },
        {
          id: 4,
          resourceNameCn: t('menu.system_settings'),
          resourceCode: 'system',
          resourceType: t('common.menu'),
          supportedActions: [1, 2],
          children: [
            { id: 41, resourceNameCn: t('menu.system_config'), resourceCode: 'system.config', resourceType: t('common.menu'), supportedActions: [1, 2] },
          ]
        },
      ];
      storage.set('btc_mock_btc_resources', resourceTree.value);
    }
    
    if (actionsRaw) {
      actions.value = actionsRaw;
    } else {
      actions.value = [
        { id: 1, actionNameCn: t('menu.view'), actionCode: 'view', httpMethod: 'GET' },
        { id: 2, actionNameCn: t('menu.edit'), actionCode: 'edit', httpMethod: 'PUT' },
        { id: 3, actionNameCn: t('menu.delete'), actionCode: 'delete', httpMethod: 'DELETE' },
        { id: 4, actionNameCn: t('menu.add'), actionCode: 'create', httpMethod: 'POST' },
      ];
      storage.set('btc_mock_btc_actions', actions.value);
    }
  };
  
  const handleResourceCheck = (_data: any, _checked: boolean) => {
    const checkedKeys = resourceTreeRef.value?.getCheckedKeys() || [];
    selectedResources.value = checkedKeys;
  };
  
  return {
    resourceTree,
    actions,
    composedPermissions,
    resourceTreeRef,
    resourceFilterText,
    applyToChildren,
    treeProps,
    selectedResources,
    selectedActions,
    matrixSelections,
    filterResourceNode,
    loadData,
    handleResourceCheck,
  };
}

