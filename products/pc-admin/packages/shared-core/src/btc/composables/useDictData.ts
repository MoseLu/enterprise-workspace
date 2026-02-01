/**
 * 响应式字典数据 Hook
 * 提供 Vue 3 Composition API Hook，用于在组件中使用响应式字典数据
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  getDictData,
  onDictUpdate,
  offDictUpdate,
  type DictUpdateEvent,
} from '../service/dict-manager';

/**
 * 单个字典字段的响应式数据
 * @param resource 资源名称，例如 'admin_role'
 * @param fieldName 字段名称，例如 'domainId'
 * @returns 响应式的字典选项数组
 */
export function useDictData(
  resource: string,
  fieldName: string
): {
  options: ReturnType<typeof ref<Array<{label: string, value: any}>>>;
  loading: ReturnType<typeof ref<boolean>>;
} {
  const options = ref<Array<{label: string, value: any}>>(getDictData(resource, fieldName));
  const loading = ref(false);

  // 更新函数
  const updateOptions = (event?: DictUpdateEvent) => {
    // 如果事件中包含具体的 resource 和 fieldName，且匹配当前字段，则更新
    if (event?.resource === resource && event?.fieldName === fieldName) {
      options.value = getDictData(resource, fieldName);
    } else if (!event || (!event.resource && !event.fieldName)) {
      // 如果事件中没有具体字段信息（全量更新），则更新所有字段
      options.value = getDictData(resource, fieldName);
    }
  };

  // 订阅字典更新事件
  onMounted(() => {
    onDictUpdate(updateOptions);
    // 初始化时也更新一次
    const initialData = getDictData(resource, fieldName);
    options.value = initialData;
  });

  // 取消订阅
  onUnmounted(() => {
    offDictUpdate(updateOptions);
  });

  return {
    options,
    loading,
  };
}

/**
 * 多个字典字段的响应式数据
 * @param fields 字段数组，格式：[{resource: string, fieldName: string}]
 * @returns 响应式的字典选项映射
 */
export function useDictDataMultiple(
  fields: Array<{resource: string, fieldName: string}>
): {
  options: Record<string, ReturnType<typeof ref<Array<{label: string, value: any}>>>>;
  loading: ReturnType<typeof ref<boolean>>;
} {
  const options: Record<string, ReturnType<typeof ref<Array<{label: string, value: any}>>>> = {};
  const loading = ref(false);

  // 初始化所有字段的响应式数据
  fields.forEach(({ resource, fieldName }) => {
    const key = `${resource}.${fieldName}`;
    options[key] = ref<Array<{label: string, value: any}>>(getDictData(resource, fieldName));
  });

  // 更新函数
  const updateOptions = (event?: DictUpdateEvent) => {
    fields.forEach(({ resource, fieldName }) => {
      const key = `${resource}.${fieldName}`;
      
      // 如果事件中包含具体的 resource 和 fieldName，且匹配当前字段，则更新
      if (event?.resource === resource && event?.fieldName === fieldName) {
        options[key].value = getDictData(resource, fieldName);
      } else if (!event || (!event.resource && !event.fieldName)) {
        // 如果事件中没有具体字段信息（全量更新），则更新所有字段
        options[key].value = getDictData(resource, fieldName);
      }
    });
  };

  // 订阅字典更新事件
  onMounted(() => {
    onDictUpdate(updateOptions);
    // 初始化时也更新一次
    fields.forEach(({ resource, fieldName }) => {
      const key = `${resource}.${fieldName}`;
      options[key].value = getDictData(resource, fieldName);
    });
  });

  // 取消订阅
  onUnmounted(() => {
    offDictUpdate(updateOptions);
  });

  return {
    options,
    loading,
  };
}
