<template>
  <div class="btc-master-table-group">
    <BtcDoubleLayout
      ref="doubleLayoutRef"
      :left-width="computedLeftWidth"
      :left-title="leftTitle"
      :right-title="rightTitle"
    >
      <template #left-header>
        <span class="label">{{ leftTitleDisplay }}</span>
        <div class="left-header-actions">
          <el-tooltip :content="t('common.button.refresh')">
            <button
              type="button"
              class="btc-master-list__icon-btn btc-comm__icon"
              :aria-label="t('common.button.refresh')"
              @click="handleLeftRefresh"
            >
              <BtcSvg name="refresh" />
            </button>
          </el-tooltip>
        </div>
      </template>

      <template #left>
        <BtcMasterList
          ref="masterListRef"
          :key="`master-list-${masterListKey}`"
          v-bind="{
            service: leftService,
            hideHeader: true,
            ...(idField !== undefined ? { 'id-field': idField } : {}),
            ...(labelField !== undefined ? { 'label-field': labelField } : {}),
            ...(parentField !== undefined ? { 'parent-field': parentField } : {}),
            ...(enableDrag !== undefined ? { drag: enableDrag } : {}),
            ...(showUnassigned !== undefined ? { 'show-unassigned': showUnassigned } : {}),
            ...(unassignedLabel !== undefined ? { 'unassigned-label': unassignedLabel } : {}),
            ...(enableKeySearch !== undefined ? { 'enable-key-search': enableKeySearch } : {}),
            'hide-expand-icon': props.leftSize === 'small' || props.leftSize === 'middle'
          }"
          @select="handleLeftSelect"
          @load="handleLeftLoad"
        />
      </template>

      <template #right-header>
        <span class="title">
          {{ rightTitle || '详情' }}（{{ selectedItem ? selectedItem[labelField || 'name'] || selectedItem.name : t('common.not_selected') }}）
        </span>
      </template>

      <template #right-op>
        <slot name="right-op">
          <!-- 如果配置了 rightOpFields，则根据配置渲染搜索字段 -->
          <div v-if="rightOpFieldsList.length > 0" class="custom-search-fields" style="display: flex; align-items: center; gap: 10px;">
            <template v-for="(field, index) in rightOpFieldsList" :key="index">
              <BtcInput
                v-if="field.type === 'input'"
                :model-value="props.rightOpFieldsValue?.[field.prop]"
                @update:model-value="(val: any) => handleRightOpFieldChange(field.prop, val)"
                :placeholder="field.placeholder"
                clearable
                :style="{ width: field.width || '150px' }"
                @keyup.enter="handleRightOpSearch(field)"
                @clear="handleRightOpSearch(field)"
              />
              <el-select
                v-else-if="field.type === 'select'"
                :model-value="props.rightOpFieldsValue?.[field.prop]"
                @update:model-value="(val: any) => handleRightOpFieldChange(field.prop, val)"
                :placeholder="field.placeholder"
                clearable
                filterable
                :loading="field.loading"
                :style="{ width: field.width || '100px' }"
                @change="handleRightOpSearch(field)"
                @clear="handleRightOpSearch(field)"
              >
                <el-option
                  v-for="option in field.options || []"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </template>
          </div>
        </slot>
      </template>

      <template #right>
        <div v-if="selectedItem" class="content">
          <BtcCrud
            ref="crudRef"
            :service="rightService"
            :auto-load="false"
            :on-before-refresh="handleBeforeRefresh"
            style="padding: 10px;"
          >
            <BtcCrudRow>
              <div class="btc-crud-primary-actions">
                <BtcRefreshBtn />
                <slot name="after-refresh-btn" />
                <slot name="add-btn">
                  <BtcAddBtn v-if="props.showAddBtn" />
                </slot>
                <slot name="multi-delete-btn">
                  <BtcMultiDeleteBtn v-if="props.showMultiDeleteBtn" />
                </slot>
              </div>
              <BtcCrudFlex1 />
              <slot name="search">
                <BtcCrudSearchKey v-if="props.showSearchKey" v-bind="searchPlaceholder ? { placeholder: searchPlaceholder } : {}" />
              </slot>
              <BtcCrudActions v-if="props.showToolbar" :show-toolbar="true">
                <template #default>
                  <slot
                    name="actions"
                    v-bind="{
                      ...(selectedItem !== null && selectedItem !== undefined ? { selected: selectedItem } : {}),
                      ...(selectedKeyword !== null && selectedKeyword !== undefined ? { keyword: selectedKeyword } : {}),
                      ...(leftListData !== null && leftListData !== undefined ? { leftData: leftListData } : {}),
                      ...(rightData !== null && rightData !== undefined ? { rightData } : {})
                    }"
                  />
                </template>
              </BtcCrudActions>
            </BtcCrudRow>
            <BtcCrudRow>
              <BtcTable
                :columns="tableColumns"
                v-bind="op ? { op } : {}"
                :disable-auto-created-at="disableAutoCreatedAt"
                :border="true"
              />
            </BtcCrudRow>
            <BtcCrudRow>
              <BtcCrudFlex1 />
              <BtcPagination />
            </BtcCrudRow>
            <BtcUpsert
              :items="computedFormItems"
              v-bind="{
                ...(upsertWidth !== undefined && { width: upsertWidth }),
                ...(handleFormSubmit && { 'on-submit': handleFormSubmit }),
              }"
            />
          </BtcCrud>
        </div>
        <BtcEmpty v-else :image-size="80" />
      </template>
    </BtcDoubleLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, toRaw } from 'vue';
import { globalMitt, BtcInput, BtcEmpty, BtcSvg } from '@btc/shared-components';
import BtcDoubleLayout from '../../layout/btc-double-layout/index.vue';
import BtcMasterList from '../btc-master-list/index.vue';
import BtcCrud from '@btc-crud/context/index.vue';
import BtcTable from '@btc-crud/table/index.vue';
import BtcPagination from '@btc-crud/pagination/index.vue';
import BtcAddBtn from '@btc-crud/add-btn/index.vue';
import BtcRefreshBtn from '@btc-crud/refresh-btn/index.vue';
import BtcMultiDeleteBtn from '@btc-crud/multi-delete-btn/index.vue';
import BtcCrudRow from '@btc-crud/crud-row/index.vue';
import BtcCrudFlex1 from '@btc-crud/crud-flex1/index.vue';
import BtcCrudSearchKey from '@btc-crud/crud-search-key/index.vue';
import BtcUpsert from '@btc-crud/upsert/index.vue';
import BtcCrudActions from '@btc-crud/actions/index.vue';
import { useContentHeight } from '../../../composables/content-height';
import { useI18n, logger } from '@btc/shared-core';
import type { MasterTableGroupProps, MasterTableGroupEmits, MasterTableGroupExpose } from './types';

defineOptions({
  name: 'BtcMasterTableGroup',
  inheritAttrs: false,
  components: {
    BtcDoubleLayout,
    BtcMasterList,
    BtcCrud,
    BtcTable,
    BtcPagination,
    BtcAddBtn,
    BtcRefreshBtn,
    BtcMultiDeleteBtn,
    BtcCrudRow,
    BtcCrudFlex1,
    BtcCrudSearchKey,
    BtcUpsert,
    BtcCrudActions,
    BtcEmpty,
    BtcSvg
  }
});

const props = withDefaults(defineProps<MasterTableGroupProps>(), {
  leftTitle: '列表',
  rightTitle: '详情',
  showUnassigned: false,
  unassignedLabel: '未分配',
  enableDrag: false,
  enableKeySearch: false,
  leftSize: 'default', // 默认类型
  upsertWidth: 800,
  searchPlaceholder: '搜索',
  showCreateTime: true,  // 默认显示创建时间列
  showUpdateTime: false,  // 默认不显示更新时间列
  showAddBtn: true, // 默认显示新增按钮
  showMultiDeleteBtn: true, // 默认显示批量删除按钮
  showSearchKey: true, // 默认显示搜索框
  showToolbar: true, // 默认显示右侧工具栏按钮
});

// 定义插槽类型
defineSlots<{
  actions?: (props: { selected?: any; keyword?: any; leftData?: any[]; rightData?: any }) => any;
  'add-btn'?: () => any;
  'multi-delete-btn'?: () => any;
  'after-refresh-btn'?: () => any;
  search?: () => any;
}>();

const emit = defineEmits<MasterTableGroupEmits>();

// 国际化
const { t } = useI18n();

// 判断字符串是否是国际化 key（包含点号）
const isI18nKey = (str: string | undefined): boolean => {
  if (!str) return false;
  return typeof str === 'string' && str.includes('.') && /^[a-zA-Z]/.test(str);
};

// 显示左侧标题（支持国际化）
const leftTitleDisplay = computed(() => {
  if (!props.leftTitle) return t('common.list');
  return isI18nKey(props.leftTitle) ? t(props.leftTitle) : props.leftTitle;
});

// 组件引用
const doubleLayoutRef = ref<InstanceType<typeof BtcDoubleLayout>>();
const masterListRef = ref<InstanceType<typeof BtcMasterList>>();
const crudRef = ref<any>(null);

// 选中项和关键字（从 masterList 获取）
const selectedItem = ref<any>(null);
const selectedKeyword = ref<any>(null);
const rightData = ref<any>(null);

// MasterList key（用于强制刷新）
const masterListKey = ref(0);

// 右侧操作栏搜索字段（从 props 中提取，确保响应式追踪）
// TypeScript 类型已限制最多3个，这里直接返回
const rightOpFieldsList = computed(() => {
  return props.rightOpFields || [];
});

const { emit: emitContentResize } = useContentHeight();

const scheduleContentResize = () => {
  nextTick(() => {
    emitContentResize();
  });
};

const disableAutoCreatedAt = computed(() => !props.showCreateTime);

// 计算左侧宽度
const computedLeftWidth = computed(() => {
  if (props.leftWidth) {
    return props.leftWidth;
  }
  // 根据 leftSize 计算宽度
  if (props.leftSize === 'small') {
    return '150px';
  } else if (props.leftSize === 'middle') {
    return '225px';
  }
  return '300px';
});

// 左侧列表数据（用于表单中的级联选择）
const leftListData = ref<any[]>([]);

// 计算表格列（自动添加创建时间和操作列）
const tableColumns = computed(() => {
  const columns = [...(props.tableColumns || [])];

  // 移除手动添加的时间列，统一使用自动添加的
  const filteredColumns = columns.filter(col =>
    !(col.prop === 'createdAt' ||
      col.prop === 'updatedAt' ||
      col.prop === 'createTime' ||
      col.prop === 'updateTime' ||
      col.prop === 'create_time' ||
      col.prop === 'update_time')
  );

  // 查找操作列的位置
  const opColumnIndex = filteredColumns.findIndex(col => col.type === 'op');
  const hasOpColumn = opColumnIndex !== -1;

  // 准备要插入的时间列
  const timeColumns: any[] = [];

  // 添加创建时间列（如果启用）
  if (props.showCreateTime) {
    timeColumns.push({
      prop: 'createdAt', // 固定使用后端字段名
      label: 'crud.table.created_at', // 使用国际化 key
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right'
    });
  }

  // 添加更新时间列（如果启用）
  if (props.showUpdateTime) {
    timeColumns.push({
      prop: 'updatedAt', // 固定使用后端字段名
      label: 'crud.table.updated_at', // 使用国际化 key
      sortable: 'desc',
      minWidth: 170,
      fixed: 'right'
    });
  }

  // 如果有操作列，在操作列之前插入时间列；否则在末尾添加
  if (hasOpColumn && timeColumns.length > 0) {
    filteredColumns.splice(opColumnIndex, 0, ...timeColumns);
  } else if (timeColumns.length > 0) {
    filteredColumns.push(...timeColumns);
  }

  // 检查是否已有操作列，并根据 op 配置决定是否添加 - 操作列始终在最后
  if (!hasOpColumn && props.op !== undefined) {
    const buttons = props.op.buttons || ['edit', 'delete'];
    const buttonCount = Array.isArray(buttons) ? buttons.length : 2;
    // 根据按钮数量动态设置宽度：1个按钮126px（116+10，保证工具栏宽度），2个按钮220px（默认），3个及以上按钮300px
    const opWidth = buttonCount === 1 ? 126 : buttonCount === 2 ? 220 : 300;
    const opMinWidth = buttonCount === 1 ? 126 : 200;

    filteredColumns.push({
      type: 'op',
      minWidth: opMinWidth, // 最小宽度，确保有足够空间显示按钮和间距
      width: opWidth, // 根据按钮数量动态设置宽度
      fixed: 'right',
      buttons
    });
  }

  return filteredColumns;
});

// 计算表单项（注入左侧数据到级联选择器）
const computedFormItems = computed(() => {
  if (!props.formItems || !Array.isArray(props.formItems)) {
    return [];
  }
  // 创建左侧数据的浅拷贝，避免循环引用
  const leftData = Array.isArray(leftListData.value) ? [...leftListData.value] : [];

  return props.formItems.map(item => {
    // 如果是级联选择器，注入左侧列表数据
    if (item.component?.name === 'btc-cascader') {
      return {
        ...item,
        component: {
          ...item.component,
          options: leftData
        }
      };
    }
    return item;
  });
});

// 处理左侧选择 - 自动刷新右侧
function handleLeftSelect(item: any, keyword: any) {
  selectedItem.value = item;
  selectedKeyword.value = keyword;
  
  // 触发事件
  emit('select', item, keyword);
  emit('update:selected', item);

  // 触发 BtcCrud 的刷新
  nextTick(() => {
    if (crudRef.value) {
      crudRef.value.refresh();
      globalMitt.emit('resize');
      scheduleContentResize();
    }
  });
}

// 处理左侧数据加载
function handleLeftLoad(data: any[]) {
  leftListData.value = data;
  emit('load', data);
  scheduleContentResize();
}

// 处理左侧刷新
function handleLeftRefresh() {
  if (masterListRef.value) {
    masterListRef.value.refresh();
  }
}

// 缓存推断结果，避免重复计算和循环引用问题
const codeFieldCache = new WeakMap<any, string | null>();

// 服务名到 code 字段名的映射表
const SERVICE_CODE_MAP: Record<string, string> = {
  module: 'moduleCode',
  domain: 'domainCode',
  menu: 'menuCode',
  tenant: 'tenantCode',
  user: 'userCode',
  role: 'roleCode',
  permission: 'permissionCode',
  resource: 'resourceCode',
  action: 'actionCode',
  dept: 'deptCode',
  department: 'deptCode', // department 也映射到 deptCode
};

// 从 selectedItem 反推 code 字段名（备选方案）
function inferCodeFieldFromSelectedItem(selectedItem: any): string | null {
  if (!selectedItem || typeof selectedItem !== 'object') return null;

  // 检查 selectedItem 中是否有映射表中的 code 字段
  // 按照优先级检查：domainCode, deptCode, moduleCode, menuCode, tenantCode, userCode, roleCode, permissionCode, resourceCode, actionCode
  const codeFields = [
    'domainCode', 'deptCode', 'moduleCode', 'menuCode', 'tenantCode',
    'userCode', 'roleCode', 'permissionCode', 'resourceCode', 'actionCode'
  ];

  for (const codeField of codeFields) {
    if (selectedItem[codeField] !== undefined && selectedItem[codeField] !== null && selectedItem[codeField] !== '') {
      return codeField;
    }
  }

  return null;
}

// 从左侧服务对象推断 code 字段名
// 必须严格按照服务名匹配映射表，否则返回 null
// 如果无法从服务对象推断，可以传入 selectedItem 作为备选方案
// 如果提供了明确的服务名（serviceName），优先使用它
function inferCodeFieldFromService(service: any, selectedItem?: any, serviceName?: string): string | null {
  // 如果提供了明确的服务名，优先使用它
  if (serviceName && typeof serviceName === 'string') {
    const normalizedName = serviceName
      .toLowerCase()
      .replace(/^sys/, '')  // 移除 sys 前缀
      .replace(/service$|api$|client$/, '')  // 移除常见后缀
      .trim();

    if (normalizedName && SERVICE_CODE_MAP[normalizedName]) {
      return SERVICE_CODE_MAP[normalizedName];
    }
  }

  if (!service) {
    // 如果服务对象不存在，尝试从 selectedItem 反推
    if (selectedItem) {
      return inferCodeFieldFromSelectedItem(selectedItem);
    }
    return null;
  }

  // 检查缓存（注意：缓存键只包含 service，不包含 selectedItem）
  if (codeFieldCache.has(service)) {
    const cached = codeFieldCache.get(service);
    if (cached) return cached;
    // 如果缓存结果是 null，且提供了 selectedItem，尝试从 selectedItem 反推
    if (!cached && selectedItem) {
      return inferCodeFieldFromSelectedItem(selectedItem);
    }
    return null;
  }

  let result: string | null = null;

  try {
    // 检查服务对象是否有 list 方法（这是左侧服务的特征）
    if (typeof service === 'object' && typeof service.list === 'function') {
      // 服务对象有 list 方法，说明这是左侧服务
      // 安全地尝试从服务对象的属性中获取服务名
      let serviceName: string | null = null;

      try {
        // 方法1: 尝试从服务对象的属性中获取服务名
        if (Object.prototype.hasOwnProperty.call(service, '_serviceName') && typeof service._serviceName === 'string') {
          serviceName = service._serviceName;
        } else if (Object.prototype.hasOwnProperty.call(service, 'name') && typeof service.name === 'string') {
          serviceName = service.name;
        } else if (Object.prototype.hasOwnProperty.call(service, 'serviceName') && typeof service.serviceName === 'string') {
          serviceName = service.serviceName;
        }

        // 方法2: 如果方法1失败，尝试从服务对象的构造函数名推断
        if (!serviceName && service.constructor && service.constructor.name) {
          const constructorName = service.constructor.name.toLowerCase();
          // 移除常见的后缀（如 Service, Api 等）
          serviceName = constructorName.replace(/service$|api$|client$/, '').trim() || null;
        }
      } catch (e) {
        // 如果访问属性时出错（可能是循环引用），跳过
      }

      // 如果找到了服务名，规范化后匹配映射表
      if (serviceName) {
        // 规范化服务名：移除 sys 前缀和 service/api/client 后缀
        const normalizedName = serviceName
          .toLowerCase()
          .replace(/^sys/, '')  // 移除 sys 前缀
          .replace(/service$|api$|client$/, '')  // 移除常见后缀
          .trim();

        // 严格按照映射表匹配
        if (normalizedName && SERVICE_CODE_MAP[normalizedName]) {
          result = SERVICE_CODE_MAP[normalizedName];
        } else {
          // 无法匹配映射表，返回 null
          result = null;
        }
      }
    }
  } catch (e) {
    // 如果推断过程中出错（可能是循环引用），返回 null
    result = null;
  }

  // 缓存结果
  codeFieldCache.set(service, result);

  // 如果从服务对象推断失败，且提供了 selectedItem，尝试从 selectedItem 反推
  if (!result && selectedItem) {
    result = inferCodeFieldFromSelectedItem(selectedItem);
  }

  return result;
}

// 处理刷新前钩子 - 注入 keyword 参数，将左侧选中的 code 传递到右侧
function handleBeforeRefresh(params: Record<string, unknown>) {
  const currentSelectedKeyword = selectedKeyword.value;
  const currentSelectedItem = selectedItem.value;

  // 获取现有的 keyword 对象（可能包含用户输入的搜索内容）
  const existingKeyword = (params.keyword && typeof params.keyword === 'object' && !Array.isArray(params.keyword))
    ? { ...(params.keyword as Record<string, unknown>) }
    : {};

  // 如果选中项有 checkNo 字段，将 checkNo 合并到 keyword 对象中
  if (currentSelectedItem && !currentSelectedItem.isUnassigned && currentSelectedItem.checkNo) {
    (params as any).keyword = {
      ...existingKeyword,
      checkNo: currentSelectedItem.checkNo
    };
    return params;
  }

  // 只有当 selectedKeyword 有值时才注入 keyword 参数（page 查询，放在 keyword 对象中）
  // 必须严格按照服务推断 code 字段名，只有推断成功才传递
  if (currentSelectedKeyword !== undefined && currentSelectedKeyword !== null && currentSelectedKeyword !== '') {
    // 从左侧服务推断 code 字段名
    let codeField: string | null = null;
    try {
      // 使用 toRaw 获取原始对象，避免触发 Vue 的响应式系统
      const rawService = toRaw(props.leftService);
      codeField = inferCodeFieldFromService(rawService, currentSelectedItem, props.leftServiceName);
    } catch (e) {
      // 如果推断失败，使用 null（不传递 code 字段）
      codeField = null;
    }

    // 只有推断成功才传递 code 字段
    if (codeField) {
      // 如果 selectedKeyword 是字符串（code 值），放在 keyword 对象中对应的 code 字段属性中
      if (typeof currentSelectedKeyword === 'string' && currentSelectedKeyword !== '') {
        (params as any).keyword = { ...existingKeyword, [codeField]: currentSelectedKeyword };
      } else if (Array.isArray(currentSelectedKeyword) && currentSelectedKeyword.length > 0) {
        // 如果是数组，使用第一个 code 值
        const firstCode = currentSelectedKeyword[0];
        if (firstCode !== undefined && firstCode !== null && firstCode !== '') {
          (params as any).keyword = { ...existingKeyword, [codeField]: firstCode };
        } else if (Object.keys(existingKeyword).length > 0) {
          // 无法获取有效的 code 值，只保留现有的 keyword
          (params as any).keyword = existingKeyword;
        }
      } else if (typeof currentSelectedKeyword === 'object' && currentSelectedKeyword !== null && !Array.isArray(currentSelectedKeyword)) {
        // 如果是对象，直接合并（可能已经包含 code 字段）
        (params as any).keyword = { ...existingKeyword, ...currentSelectedKeyword };
      }
    } else {
      // 无法推断 code 字段名，不传递，只保留现有的 keyword
      if (Object.keys(existingKeyword).length > 0) {
        (params as any).keyword = existingKeyword;
      }
    }
  } else {
    // 如果没有 selectedKeyword，但已有 keyword 对象，保留现有的 keyword
    if (Object.keys(existingKeyword).length > 0) {
      (params as any).keyword = existingKeyword;
    }
  }

  return params;
}

// 处理右侧操作栏搜索字段值变化
function handleRightOpFieldChange(prop: string, value: any) {
  const newValue = { ...(props.rightOpFieldsValue || {}), [prop]: value };
  emit('update:rightOpFieldsValue', newValue);
}

// 处理右侧操作栏搜索
function handleRightOpSearch(field: any) {
  // 如果字段有自定义搜索回调，使用自定义回调；否则触发搜索事件，由父组件处理刷新
  if (field.onSearch) {
    field.onSearch();
  } else {
    emit('right-op-search', field);
    // 注意：不在这里默认刷新，让父组件通过监听 right-op-search 事件来决定是否刷新
    // 这样可以避免重复刷新（如果父组件在事件处理中已经调用了 refresh）
  }
}

// 表单提交 - 自动注入左侧选中的 code 字段（add 操作，放在表单数据中）
async function handleFormSubmit(data: any, event: any) {
  const currentSelectedItem = selectedItem.value;
  const currentSelectedKeyword = selectedKeyword.value;

  // 自动注入选中项的 code 字段（如果有选中且不是未分配）
  // 必须严格按照服务推断，只有推断成功才传递
  if (currentSelectedItem && !currentSelectedItem.isUnassigned) {
    try {
      // 从左侧服务推断 code 字段名（优先使用明确指定的 leftServiceName，如果无法从服务推断，会尝试从 selectedItem 反推）
      const rawService = toRaw(props.leftService);
      const codeField = inferCodeFieldFromService(rawService, currentSelectedItem, props.leftServiceName);

      // 只有推断成功才传递
      if (codeField) {
        // 优先从 selectedItem 中获取对应的 code 字段值
        if (currentSelectedItem[codeField] !== undefined && currentSelectedItem[codeField] !== null && currentSelectedItem[codeField] !== '') {
          data[codeField] = currentSelectedItem[codeField];
        } else if (currentSelectedItem.code !== undefined && currentSelectedItem.code !== null && currentSelectedItem.code !== '') {
          // 如果没有对应的 code 字段，但有通用的 code 字段，也传递
          data[codeField] = currentSelectedItem.code;
        } else if (currentSelectedKeyword !== undefined && currentSelectedKeyword !== null && currentSelectedKeyword !== '') {
          // 如果 selectedItem 中没有 code 字段，尝试从 selectedKeyword 获取（page 查询时使用的值）
          if (typeof currentSelectedKeyword === 'string') {
            data[codeField] = currentSelectedKeyword;
          } else if (Array.isArray(currentSelectedKeyword) && currentSelectedKeyword.length > 0) {
            data[codeField] = currentSelectedKeyword[0];
          }
        }
      }
    } catch (e) {
      // 推断失败，不传递
      if (import.meta.env.DEV) {
        logger.error('[BtcMasterTableGroup] handleFormSubmit 推断失败:', e);
      }
    }
  }

  // 触发事件
  emit('form-submit', data, event);

  // 如果没有自定义处理，使用默认逻辑
  if (!event.defaultPrevented) {
    // 按照 cool-admin 的方式，调用 next 方法
    if (typeof event.next === 'function') {
      await event.next(data);
    }
  }
  scheduleContentResize();
}

// 刷新方法
const refresh = async (params?: any) => {
  if (masterListRef.value) {
    await masterListRef.value.refresh();
  }
  if (crudRef.value) {
    await crudRef.value.refresh(params);
  }
  emit('refresh', params);
  scheduleContentResize();
};

// 暴露
defineExpose<MasterTableGroupExpose>({
  viewGroupRef: doubleLayoutRef, // 保持向后兼容
  crudRef,
  refresh
});
</script>

<style lang="scss" scoped>
.btc-master-table-group {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;

  .content {
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .left-header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;

    .btc-master-list__icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      height: 26px;
      width: 26px;
      font-size: 16px;
      border: none;
      background: transparent;
      border-radius: 4px;
      color: var(--el-text-color-regular);
      padding: 0;

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }
}

:deep(.btc-double-layout) {
  height: 100%;
  width: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
