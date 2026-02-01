import { ref, computed, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import { useFormRenderer } from '@btc/shared-components';
import type { FormItem, UpsertProps, UpsertMode } from '../types';
// 注意：zodToElementPlusRules 和 createFormSchema 在动态导入中使用，不需要静态导入

/**
 * 表单数据管理
 */
export function useFormData(props: UpsertProps) {
  const { t } = useI18n();

  // 表单渲染器
  const { renderComponent } = useFormRenderer();

  // 表单实例
  const formRef = ref<FormInstance>();
  // 使用 reactive 而不是 ref，确保动态属性绑定正常工作
  const formData = reactive<Record<string, any>>({});
  const loadingData = ref(false);

  // 模式
  const mode = ref<UpsertMode>('add');

  // 是否禁用
  const isDisabled = computed(() => mode.value === 'info');

  /**
   * 计算表单项（支持函数返回）
   */
  const computedItems = computed(() => {
    if (!props.items) return [];

    const items = props.items.map((item: any) => {
      // 支持函数返回
      let resolved = typeof item === 'function' ? item() : item;

      // 再次检查（双层函数）
      if (typeof resolved === 'function') {
        resolved = resolved();
      }

      // 处理 hidden 属性
      if (resolved.hidden !== undefined) {
        if (typeof resolved.hidden === 'function') {
          resolved._hidden = resolved.hidden({ scope: formData, mode: mode.value });
        } else {
          resolved._hidden = resolved.hidden;
        }
      }

      return resolved;
    });

    return items;
  });

  /**
   * 获取组件 props
   */
  const getComponentProps = (item: FormItem) => {
    const baseProps = item.component?.props || {};
    const componentName = item.component?.name;

    // 如果已经有 placeholder，直接返回
    if (baseProps.placeholder !== undefined) {
      return baseProps;
    }

    // 为 el-input 和 el-input-number 自动添加 placeholder
    if (componentName === 'el-input' || componentName === 'el-input-number') {
      return {
        ...baseProps,
        placeholder: `请输入${item.label}`,
      };
    }

    return baseProps;
  };

  // 计算属性：提供默认值
  const width = computed(() => props.width || '800px');
  const dialogPadding = computed(() => props.padding || '10px 20px');
  const labelWidth = computed(() => props.labelWidth || '100px');
  const labelPosition = computed(() => props.labelPosition || 'top');
  const gutter = computed(() => props.gutter || 20);
  const cancelText = computed(() => props.cancelText || t('common.button.cancel'));
  const submitText = computed(() => props.submitText || t('common.button.confirm'));

  // 标题
  const title = computed(() => {
    if (mode.value === 'info') {
      return props.infoTitle || t('crud.dialog.info_title') || '详情';
    }
    if (mode.value === 'update') {
      return props.editTitle || t('crud.dialog.edit_title');
    }
    return props.addTitle || t('crud.dialog.add_title');
  });

  // 表单规则
  const formRules = computed<FormRules>(() => {
    const rules: FormRules = {};
    computedItems.value.forEach((item) => {
      if (!item.prop) return; // 跳过没有 prop 的项

      // 优先使用 Zod schema（如果提供）
      if (item.zodSchema) {
        try {
          // 动态导入 Zod 验证工具（避免循环依赖）
          import('@btc/shared-core/utils/form/zod-validator').then(({ zodToElementPlusRules }) => {
            const zodRules = zodToElementPlusRules(item.zodSchema!, item.label);
            // 处理 Arrayable 类型
            const rulesArray = Array.isArray(zodRules) ? zodRules : (zodRules ? [zodRules] : []);
            if (rulesArray.length > 0) {
              rules[item.prop] = rulesArray;
            }
          }).catch(() => {
            // 如果导入失败，回退到原有规则
            if (item.rules) {
              const normalizedRules = Array.isArray(item.rules) ? item.rules : [item.rules];
              rules[item.prop] = normalizedRules.map((rule: any) => {
                if (!rule.trigger) {
                  return { ...rule, trigger: ['blur', 'change'] };
                }
                return rule;
              });
            }
          });
        } catch {
          // 如果导入失败，继续使用原有规则
        }
      }

      // 如果没有 Zod schema 或导入失败，使用原有规则
      if (!item.zodSchema || !rules[item.prop]) {
        if (item.rules) {
          // 如果已有规则，确保每个规则都有 trigger
          const normalizedRules = Array.isArray(item.rules) ? item.rules : [item.rules];
          rules[item.prop] = normalizedRules.map((rule: any) => {
            // 如果规则没有 trigger，添加默认的 trigger
            if (!rule.trigger) {
              return { ...rule, trigger: ['blur', 'change'] };
            }
            return rule;
          });
        } else if (item.required) {
          // 只有 required 时，添加完整的验证规则（包括 trigger）
          rules[item.prop] = [{
            required: true,
            message: `${t('common.validation.required_prefix')}${item.label}`,
            trigger: ['blur', 'change']
          }];
        }
      }
    });
    return rules;
  });

  return {
    // refs
    formRef,
    formData,
    loadingData,
    mode,

    // computed
    isDisabled,
    computedItems,
    formRules,
    width,
    dialogPadding,
    labelWidth,
    labelPosition,
    gutter,
    cancelText,
    submitText,
    title,

    // methods
    getComponentProps,
    renderComponent,
  };
}

