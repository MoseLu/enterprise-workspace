<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="domainService"
      :right-service="wrappedUserRoleService"
      :table-columns="roleColumns"
      :form-items="[]"
      left-title="title.org.userRoleAssign.domains"
      :right-title="t('org.user_role_assign.right_title')"
      :search-placeholder="t('org.user_role_assign.search_placeholder')"
      :show-unassigned="true"
      unassigned-label="未分配"
      :enable-key-search="true"
      :op="undefined"
      :show-add-btn="false"
      :show-multi-delete-btn="false"
      :left-size="'small'"
      @select="onDomainSelect"
    >
      <template #add-btn>
        <el-button type="primary" class="btc-crud-btn" @click="openDrawer">
          <BtcSvg class="btc-crud-btn__icon" name="authorize" />
          <span class="btc-crud-btn__text">{{ t('common.button.authorize') }}</span>
        </el-button>
      </template>
      <template #multi-delete-btn>
        <BtcMultiUnbindBtn @click="handleMultiUnbind" />
      </template>
    </BtcMasterTableGroup>

    <el-drawer
      v-model="drawerVisible"
      :title="t('org.user_role_assign.drawer.title')"
      size="800px"
      :close-on-click-modal="false"
      :modal="false"
      append-to-body
      :lock-scroll="false"
      class="user-role-assign-drawer-wrapper"
    >
      <template #default>
        <div class="user-role-assign-drawer">
          <!-- 用户选择部分 -->
          <div class="drawer-section user-section">
            <div class="section-title">{{ t('org.user_role_assign.drawer.subject_section_title') }}</div>
            <el-select
              ref="userSelectRef"
              v-model="selectedUserId"
              filterable
              remote
              :remote-method="searchUsers"
              :loading="userSearchLoading"
              :placeholder="t('org.user_role_assign.drawer.search_user')"
              clearable
              multiple
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
              @change="handleUserChange"
              @clear="handleRemoveUser"
              @visible-change="handleSelectVisibleChange"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.username"
                :value="user.id"
              >
                <span>{{ user.username }}</span>
                <span v-if="user.realName" style="color: var(--el-text-color-secondary); margin-left: 8px;">
                  ({{ user.realName }})
                </span>
              </el-option>
            </el-select>
          </div>

          <!-- 角色选择部分 -->
          <div class="drawer-section role-section">
            <div class="section-title">{{ t('org.user_role_assign.drawer.role_section_title') }}</div>
            <BtcTransferPanel
              ref="roleTransferRef"
              v-model="selectedRoleKeys"
              :service="roleTransferService"
              :columns="roleTransferColumns"
              :options="roleOptions"
              display-prop="roleName"
              description-prop="description"
              row-key="id"
              :auto-load="false"
              :collapsible="false"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="closeDrawer">{{ t('common.button.cancel') }}</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ t('common.button.confirm') }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n, getPageConfigFull, logger } from '@btc/shared-core';
// @ts-ignore - BtcMultiUnbindBtn 已从 @btc/shared-components 导出，但类型定义可能未更新
import { BtcMessage, BtcTransferPanel, BtcConfirm, BtcMasterTableGroup, BtcSvg, BtcMultiUnbindBtn } from '@btc/shared-components';
import type { TableColumn, TransferPanelColumn, TransferKey } from '@btc/shared-components';
import { service } from '@services/eps';

const { t } = useI18n();
const tableGroupRef = ref();
const roleTransferRef = ref<any>(null);
const userSelectRef = ref<any>(null);
const drawerVisible = ref(false);
const submitting = ref(false);
const selectedDomain = ref<any>(null);
const selectedUserId = ref<(string | number)[]>([]); // multiple 模式下使用数组
const selectedRoleKeys = ref<TransferKey[]>([]);
const userOptions = ref<any[]>([]);
const selectedUsers = ref<any[]>([]); // 保存选中的用户对象，用于获取 userCode
const userSearchLoading = ref(false);

// 监听域选择变化，如果已选择用户则重新加载角色列表
watch(() => selectedDomain.value, async () => {
  if (selectedUserId.value.length > 0 && drawerVisible.value) {
    roleTransferRef.value?.refresh?.();
  }
});

// 域服务配置 - 直接调用域列表的list API
const domainService = {
  list: (params?: any) => {
    // 必须传递参数至少为空对象{}，否则后台框架默认参数处理逻辑
    const finalParams = params || {};
    return service.admin?.iam?.domain?.list(finalParams);
  }
};

// 使用 EPS userRole 服务
const userRoleService = service.admin?.iam?.userRole;

// 包装 userRoleService，处理 domainCode 参数
const wrappedUserRoleService = {
  ...userRoleService,
  page: async (params: any) => {
    // BtcMasterTableGroup 会将左侧选中的域 ID 作为 keyword 传递，格式为 { ids: [...] }
    // 需要从 selectedDomain 中获取 domainCode，放在 keyword 对象中
    const finalParams = { ...params };

    // 处理 keyword 参数
    if (finalParams.keyword !== undefined && finalParams.keyword !== null) {
      const keyword = finalParams.keyword;

      // 确保 keyword 是一个对象
      if (typeof finalParams.keyword !== 'object' || Array.isArray(finalParams.keyword)) {
        finalParams.keyword = {};
      }

      // 从 selectedDomain 中获取 domainCode（优先使用 code 或 domainCode 字段）
      let domainCode = '';
      if (selectedDomain.value) {
        domainCode =selectedDomain.value.domainCode || '';
      }

      // 如果 keyword 是对象且包含 ids 字段（BtcMasterTableGroup 的标准格式）
      // 或者从 selectedDomain 中获取到了 domainCode
      if (typeof keyword === 'object' && !Array.isArray(keyword) && keyword.ids) {
        // 如果从 selectedDomain 中获取到了 domainCode，使用它
        // 否则尝试从 ids 中获取（向后兼容）
        if (domainCode) {
          finalParams.keyword.domainCode = domainCode;
        } else {
          const ids = Array.isArray(keyword.ids) ? keyword.ids : [keyword.ids];
          // 如果 ids 是 code 格式（字符串且不是纯数字），直接使用
          if (ids.length > 0 && ids[0] !== undefined && ids[0] !== null && ids[0] !== '') {
            const firstId = ids[0];
            // 判断是否是 code 格式（字符串且不是纯数字）
            if (typeof firstId === 'string' && isNaN(Number(firstId))) {
              finalParams.keyword.domainCode = firstId;
            } else {
              // 如果是数字 ID，需要从左侧列表中查找对应的 code
              // 这里暂时使用 id，但建议后端返回的数据中包含 code 字段
              finalParams.keyword.domainCode = String(firstId);
            }
          }
        }
        // 删除 ids 字段，因为已经转换为 domainCode
        delete finalParams.keyword.ids;
      } else if (domainCode) {
        // 如果从 selectedDomain 中获取到了 domainCode，直接使用
        finalParams.keyword.domainCode = domainCode;
      } else if (typeof keyword === 'string' && keyword !== '') {
        // 如果 keyword 直接是字符串，判断是否是 code 格式
        if (isNaN(Number(keyword))) {
          // 是 code 格式
          finalParams.keyword = {
            userCode: '',
            domainCode: keyword,
            roleName: '',
          };
        } else {
          // 是数字 ID，需要转换为 code（这里暂时使用 id，但建议后端返回的数据中包含 code 字段）
          finalParams.keyword = {
            userCode: '',
            domainCode: keyword,
            roleName: '',
          };
        }
      }

      // 确保 keyword 中有 userCode、domainCode 和 roleName 字段（根据 pageQueryOp 配置）
      if (finalParams.keyword.userCode === undefined) {
        finalParams.keyword.userCode = '';
      }
      if (finalParams.keyword.domainCode === undefined) {
        finalParams.keyword.domainCode = '';
      }
      if (finalParams.keyword.roleName === undefined) {
        finalParams.keyword.roleName = '';
      }
    } else {
      // 如果 keyword 不存在，初始化一个包含 domainCode 的对象
      const domainCode = selectedDomain.value?.code ||
                         selectedDomain.value?.domainCode ||
                         selectedDomain.value?.id ||
                         '';
      finalParams.keyword = {
        userCode: '',
        domainCode: domainCode,
        roleName: '',
      };
    }

    return userRoleService?.page?.(finalParams);
  }
};

// 域选择处理
const onDomainSelect = (domain: any) => {
  selectedDomain.value = domain;
};

// 根据后端返回的数据格式定义表格列
const roleColumns = computed<TableColumn[]>(() => [
  { type: 'selection', width: 60 },
  { type: 'index', label: t('common.index'), width: 60 },
  { prop: 'name', label: t('org.user_role_assign.columns.username'), minWidth: 160, showOverflowTooltip: true },
  { prop: 'realName', label: t('org.user_role_assign.user.real_name'), minWidth: 120, showOverflowTooltip: true },
  { prop: 'roleName', label: t('org.user_role_assign.columns.role_name'), minWidth: 180, showOverflowTooltip: true },
  {
    type: 'op',
    label: t('crud.table.operation'),
    minWidth: 126, // 单个按钮的最小宽度（116+10），保证工具栏宽度
    width: 126, // 单个按钮的宽度（116+10）
    align: 'center',
    fixed: 'right' as const,
    buttons: [
      {
        label: t('org.user_role_assign.actions.unbind'),
        type: 'danger',
        icon: 'unbind',
        onClick: ({ scope }: { scope: any }) => handleUnbind(scope.row),
      },
    ],
  },
]);

// 从 config.ts 读取服务配置
const orgConfig = getPageConfigFull('org.users');
const accessConfig = getPageConfigFull('access.roles');

const userService = orgConfig?.service?.sysuser;
const roleService = accessConfig?.service?.sysrole;

const roleTransferColumns = computed<TransferPanelColumn[]>(() => [
  { prop: 'roleName', label: t('org.user_role_assign.columns.role_name'), minWidth: 160 },
  { prop: 'description', label: t('org.user_role_assign.columns.description'), minWidth: 220 },
]);

// 处理角色搜索参数
const handleRoleBeforeRefresh = (params: Record<string, unknown>) => {
  if (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword)) {
    const keyword = params.keyword as Record<string, unknown>;
    if (keyword.ids !== undefined) {
      const idsValue = keyword.ids;
      if (typeof idsValue === 'string' && idsValue !== '') {
        keyword.roleName = idsValue;
        delete keyword.ids;
      } else if (Array.isArray(idsValue) && idsValue.length > 0) {
        const firstElement = idsValue[0];
        if (typeof firstElement === 'string') {
          keyword.roleName = firstElement;
          delete keyword.ids;
        }
      }
    }
  }
  // 添加用户Code和域Code参数
  if (selectedUserId.value.length > 0) {
    if (!params.keyword || typeof params.keyword !== 'object' || Array.isArray(params.keyword)) {
      params.keyword = {};
    }
    // 从 userOptions 中获取 userCode
    const userId = selectedUserId.value[0];
    const user = userOptions.value.find((u: any) => u.id === userId || String(u.id) === String(userId));
    const userCode = user?.userCode || user?.code || '';
    (params.keyword as Record<string, unknown>).userCode = userCode;

    // 从 selectedDomain 中获取 domainCode
    const domainCode = selectedDomain.value?.code ||
                       selectedDomain.value?.domainCode ||
                       selectedDomain.value?.id ||
                       '';
    (params.keyword as Record<string, unknown>).domainCode = domainCode;
  }
  return params;
};

const roleOptions = {
  search: {
    keyWordLikeFields: ['roleName'],
  },
  onBeforeRefresh: handleRoleBeforeRefresh,
};

// 角色穿梭框服务：只使用 userRoleService.data 方法，包装成 page 方法供 BtcTransferPanel 使用
const roleTransferService = computed(() => ({
  page: async (params: any) => {
    // 如果没有选择用户，直接返回空数据，不调用 API
    if (!selectedUserId.value || selectedUserId.value.length === 0) {
      return { list: [], total: 0 };
    }

    // 只使用 userRoleService.data 方法，参数格式和 page 完全一致
    if (!userRoleService?.data) {
      return { list: [], total: 0 };
    }

    const finalParams = { ...params };

    // 确保 keyword 格式正确
    // 从 userOptions 中获取 userCode
    const userId = selectedUserId.value[0];
    const user = userOptions.value.find((u: any) => u.id === userId || String(u.id) === String(userId));
    const userCode = user?.userCode || user?.code || '';

    // 从 selectedDomain 中获取 domainCode
    const domainCode = selectedDomain.value?.code ||
                       selectedDomain.value?.domainCode ||
                       selectedDomain.value?.id ||
                       '';

    if (!finalParams.keyword || typeof finalParams.keyword !== 'object' || Array.isArray(finalParams.keyword)) {
      finalParams.keyword = {
        userCode: userCode,
        domainCode: domainCode,
        roleName: '',
      };
    } else {
      if (finalParams.keyword.userCode === undefined) {
        finalParams.keyword.userCode = userCode;
      }
      if (finalParams.keyword.domainCode === undefined) {
        finalParams.keyword.domainCode = domainCode;
      }
      if (finalParams.keyword.roleName === undefined) {
        finalParams.keyword.roleName = '';
      }
    }

    // 只使用 userRoleService.data 方法（不使用 page 方法）
    const response = await userRoleService.data(finalParams);

    // 处理返回数据：data 方法返回的可能是数组或对象
    if (Array.isArray(response)) {
      return { list: response, total: response.length };
    } else if (response && typeof response === 'object' && 'list' in response) {
      return response;
    } else {
      return { list: [], total: 0 };
    }
  },
}));

// 搜索用户（用于 el-select remote）
const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = [];
    return;
  }

  userSearchLoading.value = true;
  try {
    const response = await userService.data?.({
      page: 1,
      size: 20,
      keyword: {
        username: query,
      },
    });
    // data 方法可能直接返回数组，也可能返回包含 list 的对象
    userOptions.value = Array.isArray(response) ? response : (response?.list || []);
  } catch (error) {
    logger.error('[UserRoleAssign] search users error', error);
    userOptions.value = [];
  } finally {
    userSearchLoading.value = false;
  }
};

// 处理用户选择变化（el-select multiple 模式下，value 是数组）
const handleUserChange = (value: (string | number)[]) => {
  // 限制只能选择一个用户：如果选择了多个，只保留最后一个
  if (value.length > 1) {
    selectedUserId.value = [value[value.length - 1]];
  } else {
    selectedUserId.value = value;
  }

  // 保存选中的用户对象，用于后续获取 userCode
  if (selectedUserId.value.length > 0) {
    const userId = selectedUserId.value[0];
    const user = userOptions.value.find((u: any) => u.id === userId || String(u.id) === String(userId));
    if (user) {
      selectedUsers.value = [user];
    } else {
      // 如果 userOptions 中没有，尝试从已保存的 selectedUsers 中查找
      const existingUser = selectedUsers.value.find((u: any) => u.id === userId || String(u.id) === String(userId));
      if (!existingUser) {
        selectedUsers.value = [];
      }
    }
  } else {
    selectedUsers.value = [];
  }

  // 选择后清空输入内容
  if (selectedUserId.value.length > 0) {
    nextTick(() => {
      // 清空输入框内容
      if (userSelectRef.value) {
        // el-select filterable 模式的搜索输入框
        const selectInput = userSelectRef.value.$el?.querySelector('.el-select__input');
        if (selectInput) {
          selectInput.value = '';
          // 触发 input 事件让组件更新查询字符串
          selectInput.dispatchEvent(new Event('input', { bubbles: true }));
          // 尝试直接设置组件的查询字符串（Element Plus 内部使用 query）
          if (userSelectRef.value.setQuery) {
            userSelectRef.value.setQuery('');
          } else if (userSelectRef.value.query) {
            userSelectRef.value.query = '';
          }
        }
      }
      // 清空搜索关键字和选项（但保留已选中的用户对象）
      userOptions.value = [];
    });
  }

  // 清空角色选择
  selectedRoleKeys.value = [];
  if (roleTransferRef.value) {
    roleTransferRef.value.clearSelection?.();
  }

  // 刷新角色面板以加载可分配角色
  if (selectedUserId.value.length > 0 && drawerVisible.value) {
    roleTransferRef.value?.refresh?.();
  }
};

// 处理移除用户
const handleRemoveUser = () => {
  selectedUserId.value = [];
  selectedUsers.value = [];
  selectedRoleKeys.value = [];
  userOptions.value = [];

  // 清空角色选择并刷新表格（确保数据被清空）
  if (roleTransferRef.value) {
    roleTransferRef.value.clearSelection?.();
    // 刷新表格，由于没有用户，roleTransferService 会返回空数据
    if (drawerVisible.value) {
      roleTransferRef.value.refresh?.();
    }
  }
};

// 处理下拉框显示状态：有选择时不允许打开下拉框
const handleSelectVisibleChange = (visible: boolean) => {
  // 如果有选择且下拉框要打开，强制关闭
  if (visible && selectedUserId.value.length > 0) {
    nextTick(() => {
      userSelectRef.value?.blur?.();
    });
  }
};

function openDrawer() {
  // 清空之前的选择
  selectedUserId.value = [];
  selectedUsers.value = [];
  selectedRoleKeys.value = [];
  userOptions.value = [];
  drawerVisible.value = true;
}

function closeDrawer() {
  drawerVisible.value = false;
  // 延迟重置状态，确保抽屉关闭动画完成
  setTimeout(() => {
    selectedUserId.value = [];
    selectedUsers.value = [];
    selectedRoleKeys.value = [];
    userOptions.value = [];
  }, 300);
}

async function handleSubmit() {
  // 验证是否选择了用户和角色
  if (!selectedUserId.value || selectedUserId.value.length === 0) {
    BtcMessage.warning(t('org.user_role_assign.messages.selectUsers'));
    return;
  }

  if (!selectedRoleKeys.value || selectedRoleKeys.value.length === 0) {
    BtcMessage.warning(t('org.user_role_assign.messages.selectRoles'));
    return;
  }

  // 保存当前选中的域，以便刷新后恢复选择
  const currentDomain = selectedDomain.value;
  const currentDomainId = currentDomain?.id;

  // 将 userId 转换为 userCode
  const userCodes: string[] = [];
  for (const userId of selectedUserId.value) {
    // 优先从 selectedUsers 中获取（保存的完整用户对象）
    let user = selectedUsers.value.find((u: any) => u.id === userId || String(u.id) === String(userId));
    // 如果 selectedUsers 中没有，尝试从 userOptions 中获取
    if (!user) {
      user = userOptions.value.find((u: any) => u.id === userId || String(u.id) === String(userId));
    }
    if (user) {
      const userCode = user.userCode || user.code;
      if (userCode) {
        userCodes.push(userCode);
      } else {
        console.warn(`[UserRoleAssign] 用户没有 userCode 字段:`, user);
        const identifier = user.username || user.realName || String(userId);
        BtcMessage.error(t('org.user_role_assign.messages.userCodeNotFound', { identifier }));
        return;
      }
    } else {
      console.warn(`[UserRoleAssign] 找不到用户:`, userId);
      BtcMessage.error(t('org.user_role_assign.messages.userNotFound', { identifier: String(userId) }));
      return;
    }
  }

  // 将 roleId 转换为 roleCode
  const roleCodes: string[] = [];
  const selectedRoleItems = roleTransferRef.value?.selectedItems || [];
  for (const roleId of selectedRoleKeys.value) {
    const role = selectedRoleItems.find((r: any) => r.id === roleId || String(r.id) === String(roleId));
    if (role) {
      const roleCode = role.roleCode || role.code;
      if (roleCode) {
        roleCodes.push(roleCode);
      } else {
        console.warn(`[UserRoleAssign] 角色没有 roleCode 字段:`, role);
        const identifier = role.roleName || String(roleId);
        BtcMessage.error(t('org.user_role_assign.messages.roleCodeNotFound', { identifier }));
        return;
      }
    } else {
      console.warn(`[UserRoleAssign] 找不到角色:`, roleId);
      BtcMessage.error(t('org.user_role_assign.messages.roleNotFound', { identifier: String(roleId) }));
      return;
    }
  }

  submitting.value = true;
  try {
    // 批量绑定模式：使用 batchBind
    // 后端要求 userCode 和 roleCode 都为数组格式
    await userRoleService?.batchBind?.({
      userCode: userCodes,
      roleCode: roleCodes,
    });

    BtcMessage.success(t('org.user_role_assign.messages.bindSuccess'));
    closeDrawer();

    // 只刷新右侧表格，不刷新左侧列表，避免重置选择
    if (tableGroupRef.value?.crudRef?.crud?.loadData) {
      await tableGroupRef.value.crudRef.crud.loadData();
    } else {
      // 如果无法只刷新右侧，则刷新整个表格并恢复选择
      await tableGroupRef.value?.refresh?.();

      // 刷新后恢复左侧域的选择状态
      // 由于 BtcMasterList 的 refresh 会在 nextTick 中自动选中第一项，
      // 我们需要在更晚的时机恢复选择，确保覆盖默认选择
      if (currentDomain && currentDomainId && tableGroupRef.value?.viewGroupRef) {
        // 使用多次 nextTick 和 setTimeout 确保在默认选择之后恢复
        await nextTick();
        await nextTick();
        setTimeout(() => {
          const viewGroup = tableGroupRef.value?.viewGroupRef;
          if (viewGroup?.masterListRef) {
            // 从左侧列表中查找对应的域对象
            const leftList = viewGroup.masterListRef.list || [];
            const domainItem = leftList.find((item: any) => item.id === currentDomainId);
            if (domainItem) {
              viewGroup.select?.(domainItem, currentDomainId);
            } else {
              // 如果找不到，直接使用保存的域对象
              viewGroup.select?.(currentDomain, currentDomainId);
            }
          }
        }, 200);
      }
    }
  } catch (error: any) {
    logger.error('[UserRoleAssign] submit error', error);
    const errorMessage = error?.message || error?.response?.data?.message || t('common.message.error');
    BtcMessage.error(errorMessage);
  } finally {
    submitting.value = false;
  }
}

async function handleUnbind(row: any) {
  // 保存当前选中的域，以便刷新后恢复选择
  const currentDomain = selectedDomain.value;
  const currentDomainId = currentDomain?.id;

  try {
    await BtcConfirm(
      t('org.user_role_assign.messages.unbindConfirm', {
        username: row.name || row.username,
        roleName: row.roleName
      }),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 使用 userCode 和 roleCode，而不是 userId 和 roleId
    const userCode = row.userCode || row.code;
    const roleCode = row.roleCode || row.role_code;

    if (!userCode || !roleCode) {
      BtcMessage.error(t('org.user_role_assign.messages.codeNotFound'));
      return;
    }

    await userRoleService?.unbind?.({
      userCode: userCode,
      roleCode: roleCode,
    });

    BtcMessage.success(t('org.user_role_assign.messages.unbindSuccess'));

    // 只刷新右侧表格，不刷新左侧列表，避免重置选择
    if (tableGroupRef.value?.crudRef?.crud?.loadData) {
      await tableGroupRef.value.crudRef.crud.loadData();
    } else {
      // 如果无法只刷新右侧，则刷新整个表格并恢复选择
      await tableGroupRef.value?.refresh?.();

      // 刷新后恢复左侧域的选择状态
      if (currentDomain && currentDomainId && tableGroupRef.value?.viewGroupRef) {
        await nextTick();
        await nextTick();
        setTimeout(() => {
          const viewGroup = tableGroupRef.value?.viewGroupRef;
          if (viewGroup?.masterListRef) {
            // 从左侧列表中查找对应的域对象
            const leftList = viewGroup.masterListRef.list || [];
            const domainItem = leftList.find((item: any) => item.id === currentDomainId);
            if (domainItem) {
              viewGroup.select?.(domainItem, currentDomainId);
            } else {
              // 如果找不到，直接使用保存的域对象
              viewGroup.select?.(currentDomain, currentDomainId);
            }
          }
        }, 200);
      }
    }
  } catch (error: any) {
    // 用户取消操作时不显示错误
    if (error?.message === 'cancel' || error === 'cancel') {
      return;
    }
    logger.error('[UserRoleAssign] unbind error', error);
    const errorMessage = error?.message || error?.response?.data?.message || t('common.message.error');
    BtcMessage.error(errorMessage);
  }
}

async function handleMultiUnbind(rows: any[]) {
  if (!rows || rows.length === 0) {
    BtcMessage.warning(t('org.user_role_assign.messages.selectRows'));
    return;
  }

  // 保存当前选中的域，以便刷新后恢复选择
  const currentDomain = selectedDomain.value;
  const currentDomainId = currentDomain?.id;

  try {
    await BtcConfirm(
      t('org.user_role_assign.messages.unbindBatchConfirm', { count: rows.length }),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // 使用 userCode 和 roleCode，而不是 userId 和 roleId
    const unbindList = rows.map((row) => {
      const userCode = row.userCode || row.code;
      const roleCode = row.roleCode || row.role_code;

      if (!userCode || !roleCode) {
        console.warn('[UserRoleAssign] 行数据缺少 userCode 或 roleCode:', row);
        return null;
      }

      return {
        userCode: userCode,
        roleCode: roleCode,
      };
    }).filter((item) => item !== null);

    if (unbindList.length === 0) {
      BtcMessage.error(t('org.user_role_assign.messages.codeNotFound'));
      return;
    }

    await userRoleService?.batchUnbind?.(unbindList);

    BtcMessage.success(t('org.user_role_assign.messages.unbindSuccess'));

    // 只刷新右侧表格，不刷新左侧列表，避免重置选择
    if (tableGroupRef.value?.crudRef?.crud?.loadData) {
      await tableGroupRef.value.crudRef.crud.loadData();
    } else {
      // 如果无法只刷新右侧，则刷新整个表格并恢复选择
      await tableGroupRef.value?.refresh?.();

      // 刷新后恢复左侧域的选择状态
      if (currentDomain && currentDomainId && tableGroupRef.value?.viewGroupRef) {
        await nextTick();
        await nextTick();
        setTimeout(() => {
          const viewGroup = tableGroupRef.value?.viewGroupRef;
          if (viewGroup?.masterListRef) {
            // 从左侧列表中查找对应的域对象
            const leftList = viewGroup.masterListRef.list || [];
            const domainItem = leftList.find((item: any) => item.id === currentDomainId);
            if (domainItem) {
              viewGroup.select?.(domainItem, currentDomainId);
            } else {
              // 如果找不到，直接使用保存的域对象
              viewGroup.select?.(currentDomain, currentDomainId);
            }
          }
        }, 200);
      }
    }
  } catch (error: any) {
    // 用户取消操作时不显示错误
    if (error?.message === 'cancel' || error === 'cancel') {
      return;
    }
    logger.error('[UserRoleAssign] multi unbind error', error);
    const errorMessage = error?.message || error?.response?.data?.message || t('common.message.error');
    BtcMessage.error(errorMessage);
  }
}
</script>

<style lang="scss" scoped>


// 覆盖抽屉默认样式（只影响当前抽屉）
:deep(.user-role-assign-drawer-wrapper) {
  // drawer header 和 body 之间的分隔线
  .el-drawer__header {
    border-bottom: 1px solid var(--el-border-color-light);
    // 保留默认的 margin-bottom，只添加分隔线
  }

  // 覆盖 footer 的默认边距和样式 - 使用更高优先级的选择器
  &.el-drawer .el-drawer__footer,
  .el-drawer__footer {
    padding: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    overflow: visible !important;
    text-align: left !important; // 覆盖默认的 right，因为我们使用 flex-start
  }
}

// 抽屉布局样式
.user-role-assign-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.drawer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.user-section {
  flex: 0 0 auto;
  min-height: auto;
  max-height: 150px;
  margin-bottom: 24px; // 用户主体和角色主体之间的间距
}

.role-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

// 确保角色穿梭框左右部分的分隔线可见
.role-section :deep(.btc-transfer-panel) {
  height: 100%;
  min-height: 0;
  overflow: hidden;

  // 确保左右两侧都有边框，形成分隔线效果
  .btc-transfer-panel__main {
    border: 1px solid var(--el-border-color-light);
  }

  .btc-transfer-panel__selected {
    border: 1px solid var(--el-border-color-light);
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  flex-shrink: 0;
}


.drawer-footer {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--el-border-color-light); // 顶部分隔线
}

// 角色穿梭框样式 - 保持左右布局（BtcTransferPanel 默认就是左右布局）
.role-section :deep(.btc-transfer-panel) {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>

<style lang="scss">
// 全局样式：覆盖角色绑定抽屉的样式（非 scoped，提高优先级）
.user-role-assign-drawer-wrapper.el-drawer {
  // drawer header 和 body 之间的分隔线
  .el-drawer__header {
    border-bottom: 1px solid var(--el-border-color-light) !important;
    // 减少 header 的高度，使分隔线距离顶栏更近
    padding-top: 16px !important;
    padding-bottom: 16px !important;
    min-height: auto !important;
  }

  // 覆盖 footer 的默认边距和样式
  .el-drawer__footer {
    padding: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    overflow: visible !important;
    text-align: left !important;
  }
}
</style>
