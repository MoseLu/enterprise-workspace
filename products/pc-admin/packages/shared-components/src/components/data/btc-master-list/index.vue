<template>
  <div class="btc-master-list">
    <div v-if="!hideHeader" class="btc-master-list__header">
      <el-text>{{ displayTitle }}</el-text>

      <div class="btc-master-list__op">
        <div class="btcs" v-if="isDrag">
          <div class="item" @click="treeOrder(true)">
            <el-icon><Check /></el-icon>
          </div>
          <div class="item" @click="treeOrder(false)">
            <el-icon><Close /></el-icon>
          </div>
        </div>

        <template v-else>
          <div class="item">
            <el-tooltip :content="t('common.button.refresh')">
              <button
                type="button"
                class="btc-master-list__icon-btn btc-comm__icon"
                :aria-label="t('common.button.refresh')"
                @click="refresh()"
              >
                <BtcSvg name="refresh" />
              </button>
            </el-tooltip>
          </div>

          <div class="item" v-if="drag && !browser.isMini">
            <el-tooltip :content="t('common.button.sort')">
              <button
                type="button"
                class="btc-master-list__icon-btn btc-comm__icon"
                :aria-label="t('common.button.sort')"
                @click="isDrag = true"
              >
                <BtcSvg name="sort" />
              </button>
            </el-tooltip>
          </div>
        </template>
      </div>
    </div>

    <div v-if="enableKeySearch" class="btc-master-list__search">
      <BtcInput
        v-model="keyWord"
        placeholder="搜索关键字"
        clearable
        :prefix-icon="Search"
        @change="refresh()"
      />
    </div>

    <div
      class="btc-master-list__container"
      v-loading="loading"
      @contextmenu.stop.prevent="(event) => onContextMenu(event)"
    >
      <el-scrollbar>
        <el-tree
          ref="treeRef"
          node-key="id"
          :data="list"
          :props="treeProps"
          highlight-current
          :draggable="isDrag"
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          :expand-on-click-node="false"
          :icon="props.hideExpandIcon ? EmptyIcon : undefined"
          :class="{ 'hide-expand-icon': props.hideExpandIcon }"
          @node-contextmenu="onContextMenu"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="btc-master-list__node">
              <span
                class="btc-master-list__node-label"
                :class="{
                  'is-active': data.id == selectedItem?.id,
                }"
                >{{ node.label }}</span
              >
              <span
                v-if="browser.isMini"
                class="btc-master-list__node-icon"
                @click="onContextMenu($event, data, node)"
              >
                <el-icon><MoreFilled /></el-icon>
              </span>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, defineComponent, getCurrentInstance } from 'vue';

import { useI18n, logger } from '@btc/shared-core';
import { Check, Close, MoreFilled, Search } from '@element-plus/icons-vue';
// Refresh 未使用
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import { BtcMessage, BtcInput } from '@btc/shared-components';

// 空图标组件，用于隐藏展开/折叠图标
const EmptyIcon = defineComponent({
  setup() {
    return () => null;
  }
});

// 树形数据处理工具函数
function deepTree(data: any[], parentId: any = 0, children = 'children'): any[] {
  const result: any[] = [];

  for (const item of data) {
    // 处理字符串和数字类型的 parentId 匹配
    const itemParentId = item.parentId;
    const isMatch = itemParentId === parentId ||
                   String(itemParentId) === String(parentId) ||
                   (itemParentId == null && (parentId === 0 || parentId === '0' || parentId === null));

    if (isMatch) {
      const childrenData = deepTree(data, item.id, children);
      if (childrenData.length > 0) {
        item[children] = childrenData;
      }
      result.push(item);
    }
  }

  return result;
}

function revDeepTree(data: any[], children = 'children'): any[] {
  const result: any[] = [];

  for (const item of data) {
    result.push(item);
    if (item[children] && item[children].length > 0) {
      result.push(...revDeepTree(item[children], children));
    }
  }

  return result;
}

// 提取数据数组的工具函数
function extractDataArray(res: any): any[] {
  if (Array.isArray(res)) {
    return res;
  } else if (res && typeof res === 'object') {
    // 处理 { list: [...], page: 1, size: 20, total: 5 } 结构
    if (Array.isArray((res as any).list)) {
      return (res as any).list;
    } else if (Array.isArray((res as any).data)) {
      return (res as any).data;
    }
  }
  return [];
}

interface Props {
  service: {
    list: (params?: any) => Promise<any[]>;
  };
  title?: string;
  showUnassigned?: boolean;
  unassignedLabel?: string;
  drag?: boolean;
  level?: number;
  idField?: string;
  labelField?: string;
  childrenField?: string;
  enableKeySearch?: boolean;
  hideExpandIcon?: boolean; // 是否隐藏展开/折叠图标
  hideHeader?: boolean; // 是否隐藏顶部标题栏
  codeField?: string; // 指定 code 字段名（如 deptCode, domainCode 等），如果不指定则自动推断
}

const props = withDefaults(defineProps<Props>(), {
  title: '列表',
  showUnassigned: false,
  unassignedLabel: '未分配',
  drag: true,
  level: 99,
  idField: 'id',
  labelField: 'name',
  childrenField: 'children',
  enableKeySearch: false,
  hideExpandIcon: false,
  hideHeader: false,
  codeField: undefined,
});

defineOptions({
  name: 'BtcMasterList'
});

const emit = defineEmits(['refresh', 'select', 'add', 'edit', 'delete', 'load']);

const { t } = useI18n();

// 获取 Vue I18n 实例（在 computed 外部获取）
const instance = getCurrentInstance();
const getI18nMessages = () => {
  if (!instance) return null;
  try {
    const app = instance.appContext.app;
    const i18nInstance = (app as any).config?.globalProperties?.$i18n || (app as any)._context?.provides?.i18n;
    if (i18nInstance) {
      const i18nGlobal = i18nInstance.global || i18nInstance;
      const currentLocale = i18nGlobal.locale?.value || i18nGlobal.locale || 'zh-CN';
      return i18nGlobal.getLocaleMessage(currentLocale) || {};
    }
  } catch {
    // 静默失败
  }
  return null;
};

// 计算显示标题（支持国际化 key）
const displayTitle = computed(() => {
  if (!props.title) {
    return '';
  }
  
  // 如果 title 看起来像国际化 key（包含点号且不包含中文字符），尝试翻译
  // 检查是否包含中文字符，如果包含则可能是已翻译的文本
  const hasChinese = /[\u4e00-\u9fa5]/.test(props.title);
  if (!hasChinese && props.title.includes('.')) {
    try {
      // 优先级1：直接使用 t() 函数（它应该能够访问 Vue I18n 实例）
      try {
        const translated = t(props.title);
        // 如果返回的是对象且包含 _ 键，使用 _ 键的值
        let finalTranslated = translated;
        if (translated && typeof translated === 'object' && translated !== null && !Array.isArray(translated) && '_' in translated) {
          finalTranslated = (translated as any)._;
        }
        if (finalTranslated && typeof finalTranslated === 'string' && finalTranslated !== props.title && finalTranslated.trim() !== '') {
          return finalTranslated;
        }
      } catch {
        // t() 函数调用失败，尝试其他方法
      }
      
      // 优先级2：通过 getI18nMessages 获取消息对象，然后按路径访问嵌套结构
      const messages = getI18nMessages();
      if (messages) {
        // 按路径访问嵌套结构
        const keys = props.title.split('.');
        let nestedValue: any = messages;
        for (const k of keys) {
          if (nestedValue && typeof nestedValue === 'object' && k in nestedValue) {
            nestedValue = nestedValue[k];
          } else {
            nestedValue = undefined;
            break;
          }
        }
        if (nestedValue !== undefined) {
          // 如果值是对象且包含 _ 键，使用 _ 键的值（Vue I18n 的约定）
          if (typeof nestedValue === 'object' && nestedValue !== null && !Array.isArray(nestedValue) && '_' in nestedValue) {
            nestedValue = nestedValue._;
          }
          if (typeof nestedValue === 'string' && nestedValue.trim() !== '' && nestedValue !== props.title) {
            return nestedValue;
          } else if (typeof nestedValue === 'function') {
            try {
              const result = nestedValue({ normalize: (arr: any[]) => arr[0] });
              if (typeof result === 'string' && result.trim() !== '' && result !== props.title) {
                return result;
              }
            } catch {
              // 如果函数调用失败，继续使用其他方法
            }
          }
        }
      }
    } catch {
      // 翻译失败，继续使用原 title
    }
  }
  
  // 否则直接使用 title（可能是已翻译的文本或普通文本，或者是找不到翻译的 key）
  return props.title;
});

// 响应式数据
const list = ref<any[]>([]);
const loading = ref(false);
const selectedItem = ref<any>(null);
const isDrag = ref(false);
const keyWord = ref('');

// 组件引用
const treeRef = ref<any>(null);

// 树配置
const treeProps = computed(() => ({
  children: props.childrenField,
  label: props.labelField,
  disabled: 'disabled',
  isLeaf: 'isLeaf',
}));

// 浏览器检测
const browser = computed(() => ({
  isMini: window.innerWidth <= 768
}));

// 刷新数据
async function refresh() {
  loading.value = true;
  isDrag.value = false;

  try {
    // 构建请求参数，包含搜索关键词
    const params: any = {};
    if (keyWord.value) {
      params.keyword = keyWord.value;
    }

    // 调用服务获取数据
    const res = await props.service.list(params);
    const dataArray = extractDataArray(res);

    // 检查数据是否有 parentId 字段，决定是否进行树形处理
    const hasParentId =
      dataArray.length > 0 && Object.prototype.hasOwnProperty.call(dataArray[0], 'parentId');

    let processedData: any[];
    if (hasParentId) {
      processedData = deepTree(dataArray);
    } else {
      // 平铺数据直接使用
      processedData = [...dataArray];
    }

    // 如果需要显示"未分配"分组，根据数据情况决定位置
    if (props.showUnassigned) {
      const unassignedItem = {
        [props.idField]: 'UNASSIGNED',
        [props.labelField]: props.unassignedLabel,
        isUnassigned: true, // 标记这是未分配项
      };

      // 如果只有未分配项（没有其他数据），显示在最上面
      // 否则显示在最下面
      if (processedData.length === 0) {
        list.value = [unassignedItem];
      } else {
        list.value = [...processedData, unassignedItem];
      }
    } else {
      list.value = processedData;
    }

    // 延迟执行默认选中，确保数据已经渲染
    nextTick(() => {
      if (list.value.length > 0) {
        // 优先选中第一项数据，而不是"未分配"项
        if (props.showUnassigned) {
          // 找到第一个非"未分配"的项
          const firstDataItem = list.value.find(item => !item.isUnassigned);
          if (firstDataItem) {
            handleNodeClick(firstDataItem);
          } else {
            // 如果没有数据项，只有"未分配"项，则选中"未分配"项
            const unassignedItem = list.value.find(item => item.isUnassigned);
            if (unassignedItem) {
              handleNodeClick(unassignedItem);
            }
          }
        } else {
          handleNodeClick(list.value[0]);
        }
      }
    });

    // 导出数据供右侧使用
    emit('load', list.value);

  } catch (error) {
    logger.error('加载数据失败:', error);
    BtcMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
}

// 自动推断 code 字段名
function inferCodeField(item: any): string | null {
  // 如果通过 props 指定了 codeField，直接使用
  if (props.codeField) {
    return props.codeField;
  }

  // 自动检测常见的 code 字段
  const commonCodeFields = ['deptCode', 'domainCode', 'roleCode', 'code'];
  for (const field of commonCodeFields) {
    if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
      return field;
    }
  }

  // 如果没找到，返回 null，使用 id
  return null;
}

// 处理节点点击
function handleNodeClick(item: any) {
  selectedItem.value = item;

  // 设置 el-tree 的当前节点
  nextTick(() => {
    if (treeRef.value) {
      treeRef.value.setCurrentKey(item.id);
    }
  });

  // 计算 keyword 参数 - 优先使用 code 字段，否则使用 id
  let keyword: any;
  if (item.isUnassigned) {
    keyword = undefined; // 未分配不传 keyword
  } else {
    // 尝试获取 code 字段名
    const codeField = inferCodeField(item);

    if (codeField) {
      // 使用 code 字段
      if (item.children && item.children.length > 0) {
        // 有子级：返回所有子级的 code 数组
        const codes = revDeepTree(item.children)
          .map(e => e[codeField])
          .filter((code: any) => code !== undefined && code !== null && code !== '');
        if (item[codeField]) {
          codes.unshift(item[codeField]);
        }
        keyword = codes.length > 0 ? codes : undefined;
      } else {
        // 单层：返回 code（单个值，不是数组）
        keyword = item[codeField] || undefined;
      }
    } else {
      // 没有 code 字段，使用 id（向后兼容）
      if (item.children && item.children.length > 0) {
        // 有子级：返回所有子级 ID 数组
        const ids = revDeepTree(item.children).map(e => e.id);
        ids.unshift(item.id);
        keyword = ids;
      } else {
        // 单层：统一返回数组格式（即使只有一个ID）
        keyword = [item.id];
      }
    }
  }

  // 导出选中参数
  emit('select', item, keyword);
}

// 计算当前选中项的 keyword - 优先使用 code 字段
function calculateKeyword(item: any): any {
  if (!item) return undefined;

  if (item.isUnassigned) {
    return undefined;
  } else {
    // 尝试获取 code 字段名
    const codeField = inferCodeField(item);

    if (codeField) {
      // 使用 code 字段
      if (item.children && item.children.length > 0) {
        // 有子级：返回所有子级的 code 数组
        const codes = revDeepTree(item.children)
          .map(e => e[codeField])
          .filter((code: any) => code !== undefined && code !== null && code !== '');
        if (item[codeField]) {
          codes.unshift(item[codeField]);
        }
        return codes.length > 0 ? codes : undefined;
      } else {
        // 单层：返回 code（单个值，不是数组）
        return item[codeField] || undefined;
      }
    } else {
      // 没有 code 字段，使用 id（向后兼容）
      if (item.children && item.children.length > 0) {
        const ids = revDeepTree(item.children).map(e => e.id);
        ids.unshift(item.id);
        return ids;
      } else {
        // 统一返回数组格式（即使只有一个ID）
        return [item.id];
      }
    }
  }
}

// 拖拽相关
function allowDrag({ data }: any) {
  return data.parentId;
}

function allowDrop(_: any, dropNode: any) {
  return dropNode.data.parentId;
}

// 右键菜单
function onContextMenu(_event: any, _data?: any, _node?: any) {
  // 这里可以集成右键菜单组件
}

// 拖拽排序
function treeOrder(save: boolean) {
  if (save) {
    BtcMessage.success('排序已保存');
  } else {
    BtcMessage.info('已取消排序');
  }
  isDrag.value = false;
}

// 组件挂载时刷新数据
onMounted(() => {
  refresh();
});

// 暴露方法和数据
defineExpose({
  refresh,
  selectedItem,
  list, // 暴露列表数据供外部使用
  treeRef, // 暴露 treeRef，供外部设置选中状态
  getKeyword() { return calculateKeyword(selectedItem.value); }
});
</script>

<style lang="scss" scoped>
.btc-master-list {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-tree-node__label) {
    display: block;
    height: 100%;
    width: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    min-width: 0; // 允许 flex 项目收缩
    flex-shrink: 0;

    .el-text {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0; // 允许文本收缩
      // 确保在折叠时不会换行
      word-break: keep-all;
      hyphens: none;
    }
  }

  &__op {
    display: flex;
    align-items: center;

    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      list-style: none;
      margin-left: 5px;
      cursor: default;
    }

    .btns {
      display: flex;
      align-items: center;
      justify-content: center;

      .item {
        &:hover {
          &:first-child {
            color: var(--el-color-success);
          }

          &:last-child {
            color: var(--el-color-danger);
          }
        }
      }
    }

  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--el-color-primary);
      outline-offset: 2px;
    }
  }

  &__search {
    padding: 10px 10px 0 10px;
    flex-shrink: 0;

    :deep(.el-input) {
      .el-input__wrapper {
        border-radius: 6px;
      }
    }
  }

  &__container {
    padding: 10px;
    flex: 1;
    overflow: hidden;
    margin-top: 10px;
    box-sizing: border-box;

    :deep(.el-tree-node__content) {
      height: 38px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-start; // default 左对齐
      text-align: left; // default 左对齐

      .el-tree-node__expand-icon {
        margin-left: 5px;
      }
    }

    // 当 hideExpandIcon 为 true 时，隐藏展开/折叠图标
    :deep(.hide-expand-icon .el-tree-node__expand-icon) {
      display: none !important;
      width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      visibility: hidden !important;
    }

    // 空状态样式 - 在整个容器中垂直水平居中
    :deep(.el-tree__empty-block) {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      position: relative;
    }

    :deep(.el-tree__empty-text) {
      color: var(--el-text-color-placeholder);
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      display: inline-block;
      word-break: keep-all;
      hyphens: none;
    }
  }

  &__node {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    box-sizing: border-box;

    &-label {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      height: 100%;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &.is-active {
        color: var(--el-color-primary);
      }
    }

    &-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #eee;
      height: 26px;
      width: 26px;
      text-align: center;
      margin-right: 5px;
      border-radius: 6px;
    }
  }
}
</style>
