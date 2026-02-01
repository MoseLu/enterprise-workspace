/**
 * BtcForm 渲染逻辑
 * 完全参考 cool-admin 的实现方式
 */
import { h, resolveComponent, unref, defineComponent, computed } from 'vue';
import {
  ElInput, ElInputNumber, ElSelect, ElOption, ElRadioGroup, ElRadio,
  ElCheckboxGroup, ElCheckbox, ElSwitch, ElDatePicker, ElTimePicker,
  ElCascader, ElTreeSelect, /* ElColorPicker, */ ElRate, ElSlider, ElUpload, ElDivider,
  ElDescriptions, ElDescriptionsItem
} from 'element-plus';
import BtcCascader from '@btc-components/navigation/btc-cascader/index.vue';
// 注意：BtcUpload 使用动态解析以避免循环依赖
// BtcUpload 组件导入了 @btc/shared-components，而 useFormRenderer 也在同一个包中
// 通过在运行时使用 resolveComponent 动态解析可以打破循环依赖
// 这样避免了顶层导入导致的 "Cannot access 'BtcUpload' before initialization" 错误

// 组件映射表
export const componentMap: Record<string, any> = {
  'el-input': ElInput,
  'el-input-number': ElInputNumber,
  'el-select': ElSelect,
  'el-option': ElOption,
  'el-radio': ElRadio,
  'el-radio-group': ElRadioGroup,
  'el-checkbox': ElCheckbox,
  'el-checkbox-group': ElCheckboxGroup,
  'el-switch': ElSwitch,
  'el-date-picker': ElDatePicker,
  'el-time-picker': ElTimePicker,
  'el-cascader': ElCascader,
  'el-tree-select': ElTreeSelect,
  // 'el-color-picker': ElColorPicker, // 暂时禁用，避免 getBoundingClientRect 错误
  'el-rate': ElRate,
  'el-slider': ElSlider,
  'el-upload': ElUpload,
  'el-divider': ElDivider,
  'el-descriptions': ElDescriptions,
  'el-descriptions-item': ElDescriptionsItem,
  'btc-cascader': BtcCascader,
  // 'btc-upload' 通过 resolveComponent 动态解析，避免循环依赖
};

// 组件定义缓存
const componentCache = new Map<string, any>();

export function useFormRenderer() {
  // 渲染组件 - 完全参考 cool-admin 的方式
  function renderComponent(item: any, form: any) {
    const componentName = item.component?.name;
    if (!componentName) return null;

    // 动态获取组件，对于 btc-upload 使用延迟解析以避免循环依赖
    let Component = componentMap[componentName];
    
    // 特殊处理 btc-upload，使用 resolveComponent 动态解析以避免循环依赖
    // 这避免了顶层导入导致的初始化顺序问题
    if (componentName === 'btc-upload') {
      // 使用 resolveComponent 动态解析组件，避免顶层导入导致的循环依赖
      // resolveComponent 会在运行时查找组件，此时组件应该已经通过 index.ts 导出
      Component = resolveComponent('BtcUpload') as any;
    } else if (!Component) {
      // 如果组件不在映射表中，尝试解析
      Component = resolveComponent(componentName);
    }

    // 使用 item.prop + componentName 作为缓存 key，确保组件定义稳定
    const cacheKey = `${item.prop || 'unknown'}_${componentName}`;

    // 如果缓存中没有，创建新的组件定义
    if (!componentCache.has(cacheKey)) {
      const componentDef = defineComponent({
        name: `FormItem_${cacheKey}`,
        setup() {
          // 在 setup 中捕获 form 和 item 的引用
          const formRef = form;
          const itemRef = item;
          const prop = itemRef.prop;

          // 使用 computed 来追踪 formRef.value，确保响应式追踪正确
          // 关键：computed 的 getter 会在渲染函数中被调用，Vue 会正确追踪依赖
          const scope = computed(() => {
            const value = unref(formRef);
            if (!value) {
              return {};
            }
            return value;
          });

          // 对于 el-select 组件，使用 computed 来追踪 options 的变化
          // 关键：在 setup 中定义 computed，确保响应式追踪正确
          const selectOptions = componentName === 'el-select' 
            ? computed(() => {
                const options = itemRef?.component?.options;
                return Array.isArray(options) ? options : [];
              })
            : null;

          return () => {
            // 获取表单数据（form 是 ref，需要 unref）- 完全参考 cool-admin
            // 使用 computed 确保响应式追踪正确
            const currentScope = scope.value;

            // 确保 scope 存在
            if (!currentScope) {
              return null;
            }

            // 基础 props
            const props: any = {
              ...itemRef.component?.props,
              disabled: itemRef.disabled,
              // 支持 readonly 属性（从 component.props 中获取，如果没有则从 itemRef 顶层获取）
              readonly: itemRef.component?.props?.readonly ?? itemRef.readonly,
            };

            // 为组件设置 id，确保 label 的 for 属性能正确关联
            // Element Plus 的 el-form-item 会自动为 label 生成 for 属性，需要组件有对应的 id
            // 生成唯一的 id，使用 Element Plus 期望的格式：el-form-item-${prop}
            // 这样 label 的 for 属性就能正确匹配
            const inputId = prop ? `el-form-item-${prop}` : undefined;
            
            // 定义不包含标准 input 元素的组件列表
            // 这些组件需要添加隐藏的 input 元素，以便 label 的 for 属性能正确匹配
            const componentsWithoutStandardInput = [
              // 'el-color-picker', // 暂时禁用，避免 getBoundingClientRect 错误
              'el-radio-group',
              'el-checkbox-group',
              'el-switch',
              'el-rate',
              'el-slider',
              'el-upload',
              'el-cascader',
              'el-tree-select',
              'btc-cascader',
              'btc-upload'
            ];
            
            const needsHiddenInput = componentsWithoutStandardInput.includes(componentName);
            
            // 为需要隐藏 input 的组件设置 id（但不传递给组件本身，避免冲突）
            // 为其他组件也设置 id
            if (inputId && !needsHiddenInput) {
              props.id = inputId;
            }

            // 添加双向绑定（完全参考 cool-admin 的实现）
            // 关键：currentScope 是 formRef.value 的引用，直接使用它进行读写
            // 这样既能正确显示值，又能确保表单验证时能读取到正确的值
            if (currentScope && prop) {
              // 从 currentScope[prop] 读取值（currentScope 是 formRef.value 的引用）
              props.modelValue = currentScope[prop];
              props['onUpdate:modelValue'] = function (val: any) {
                // 直接修改 currentScope[prop]，就像 cool-admin 一样
                // currentScope 是 formRef.value 的引用，修改它会触发响应式更新
                currentScope[prop] = val;
              };
            }

            // 处理特殊组件
            if (componentName === 'el-select') {
              // 使用 Element Plus 2.10.5+ 的 options prop
              // 关键：使用在 setup 中定义的 computed 来追踪 options 的变化
              // 这样当 options 更新时，组件会自动重新渲染
              const currentOptions = selectOptions?.value || [];

              // 如果没有设置 placeholder，默认使用空字符串（而不是 "Select"）
              if (props.placeholder === undefined) {
                props.placeholder = '';
              }

              // 确保 el-select 内部的输入元素有正确的 id
              // Element Plus 的 el-select 会将 id 传递给内部的 el-input
              return h(Component, {
                ...props,
                options: currentOptions,
                props: itemRef?.component?.optionProps || {
                  value: 'value',
                  label: 'label',
                  disabled: 'disabled'
                }
              });
            }

            if (componentName === 'el-radio-group') {
              const currentOptions = itemRef?.component?.options || [];
              const slots = currentOptions.length > 0 ? {
                default: () => {
                  return currentOptions.map((opt: any) => {
                    const optValue = opt?.value ?? opt;
                    const optLabel = opt?.label ?? optValue;
                    return h(ElRadio, { key: optValue, value: optValue }, () => optLabel);
                  });
                }
              } : undefined;

              // 为 el-radio-group 添加隐藏的 input 元素，以便 label 的 for 属性能正确匹配
              if (inputId) {
                return h('div', { style: { position: 'relative' } }, [
                  h('input', {
                    id: inputId,
                    name: prop || '',
                    type: 'text',
                    style: {
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    },
                    tabIndex: -1,
                    'aria-hidden': 'true'
                  }),
                  h(Component, props, slots)
                ]);
              }

              return h(Component, props, slots);
            }

            if (componentName === 'el-checkbox-group') {
              const currentOptions = itemRef?.component?.options || [];
              const slots = currentOptions.length > 0 ? {
                default: () => {
                  return currentOptions.map((opt: any) => {
                    const optValue = opt?.value ?? opt;
                    const optLabel = opt?.label ?? optValue;
                    return h(ElCheckbox, { key: optValue, value: optValue }, () => optLabel);
                  });
                }
              } : undefined;

              // 为 el-checkbox-group 添加隐藏的 input 元素，以便 label 的 for 属性能正确匹配
              if (inputId) {
                return h('div', { style: { position: 'relative' } }, [
                  h('input', {
                    id: inputId,
                    name: prop || '',
                    type: 'text',
                    style: {
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    },
                    tabIndex: -1,
                    'aria-hidden': 'true'
                  }),
                  h(Component, props, slots)
                ]);
              }

              return h(Component, props, slots);
            }

            if (componentName === 'el-cascader') {
              const slots: any = {};
              if (itemRef.component?.slots) {
                Object.keys(itemRef.component.slots).forEach(slotName => {
                  slots[slotName] = itemRef.component.slots[slotName];
                });
              }

              const cascaderProps = props.cascaderProps || {
                checkStrictly: props.checkStrictly,
                emitPath: props.emitPath,
                multiple: props.multiple,
                showPrefix: props.showPrefix,
                showAllLevels: props.showAllLevels
              };

              const cascaderVNode = h(Component, {
                ...props,
                options: itemRef.component?.options || [],
                props: cascaderProps
              }, slots);

              // 为 el-cascader 添加隐藏的 input 元素，以便 label 的 for 属性能正确匹配
              if (inputId) {
                return h('div', { style: { position: 'relative' } }, [
                  h('input', {
                    id: inputId,
                    name: prop || '',
                    type: 'text',
                    style: {
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    },
                    tabIndex: -1,
                    'aria-hidden': 'true'
                  }),
                  cascaderVNode
                ]);
              }

              return cascaderVNode;
            }

            if (componentName === 'el-tree-select') {
              const treeSelectVNode = h(Component, {
                ...props,
                data: itemRef.component?.options || []
              });

              // 为 el-tree-select 添加隐藏的 input 元素，以便 label 的 for 属性能正确匹配
              if (inputId) {
                return h('div', { style: { position: 'relative' } }, [
                  h('input', {
                    id: inputId,
                    name: prop || '',
                    type: 'text',
                    style: {
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    },
                    tabIndex: -1,
                    'aria-hidden': 'true'
                  }),
                  treeSelectVNode
                ]);
              }

              return treeSelectVNode;
            }

            if (componentName === 'btc-cascader') {
              const btcCascaderVNode = h(Component, {
                ...props,
                options: itemRef.component?.options || []
              });

              // 为 btc-cascader 添加隐藏的 input 元素，以便 label 的 for 属性能正确匹配
              if (inputId) {
                return h('div', { style: { position: 'relative' } }, [
                  h('input', {
                    id: inputId,
                    name: prop || '',
                    type: 'text',
                    style: {
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    },
                    tabIndex: -1,
                    'aria-hidden': 'true'
                  }),
                  btcCascaderVNode
                ]);
              }

              return btcCascaderVNode;
            }

            if (componentName === 'btc-upload') {
              let uploadService = props.uploadService;
              if (!uploadService && typeof window !== 'undefined') {
                uploadService = (window as any).__BTC_SERVICE__;
              }

              const uploadVNode = h(Component, {
                ...props,
                prop: itemRef.prop,
                uploadService
              });

              // 为 btc-upload 添加隐藏的 input 元素，以便 label 的 for 属性能正确匹配
              if (inputId) {
                return h('div', { style: { position: 'relative' } }, [
                  h('input', {
                    id: inputId,
                    name: prop || '',
                    type: 'text',
                    style: {
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    },
                    tabIndex: -1,
                    'aria-hidden': 'true'
                  }),
                  uploadVNode
                ]);
              }

              return uploadVNode;
            }

            if (componentName === 'el-descriptions') {
              itemRef._hideLabel = true;
              const slots = {
                default: () => {
                  return h(ElDescriptionsItem, {
                    label: itemRef.label,
                    style: { width: '100%' },
                    labelStyle: { width: '25%', textAlign: 'center' },
                    contentStyle: { width: '75%', textAlign: 'center' },
                    labelClassName: 'descriptions-label-center',
                    contentClassName: 'descriptions-content-center',
                    'class': 'descriptions-content-center'
                  }, () => {
                    const currentScope = scope.value;
                    return currentScope?.[prop] || '';
                  });
                }
              };

              return h(Component, {
                ...props,
                style: { width: '100%' }
              }, slots);
            }

            // 日期选择器和时间选择器特殊处理
            // 这些组件内部可能不包含标准的 input 元素，所以 Element Plus 的 el-form-item 生成的 for 属性可能无法匹配
            // 为了修复警告，我们保留 id，让 Element Plus 尝试匹配，如果不行，至少不会报错
            if (componentName === 'el-date-picker' || componentName === 'el-time-picker') {
              // 保留 id，但过滤掉 name（某些组件可能不支持 name）
              const { name, ...filteredProps } = props;
              
              // 为日期/时间选择器添加隐藏的 input 元素
              if (inputId) {
                return h('div', { style: { position: 'relative' } }, [
                  h('input', {
                    id: inputId,
                    name: prop || '',
                    type: 'text',
                    style: {
                      position: 'absolute',
                      opacity: 0,
                      pointerEvents: 'none',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      border: 'none',
                      padding: 0,
                      margin: 0
                    },
                    tabindex: -1,
                    'aria-hidden': 'true',
                    value: Array.isArray(currentScope[prop])
                      ? currentScope[prop].join(' - ')
                      : (currentScope[prop] || ''),
                    readonly: true
                  }),
                  h(Component, filteredProps)
                ]);
              }
              
              return h(Component, filteredProps);
            }

            // 对于不包含标准 input 的组件，添加隐藏的 input 元素
            // 这样 label 的 for 属性就能正确匹配，避免浏览器警告
            if (needsHiddenInput && inputId) {
              // 获取当前值，用于隐藏 input
              let hiddenInputValue = '';
              if (currentScope && prop) {
                const value = currentScope[prop];
                if (Array.isArray(value)) {
                  hiddenInputValue = value.join(', ');
                } else if (value !== null && value !== undefined) {
                  hiddenInputValue = String(value);
                }
              }
              
              return h('div', { style: { position: 'relative' } }, [
                h('input', {
                  id: inputId,
                  name: prop || '',
                  type: 'text',
                  style: {
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    border: 'none',
                    padding: 0,
                    margin: 0
                  },
                  tabindex: -1,
                  'aria-hidden': 'true',
                  value: hiddenInputValue,
                  readonly: true
                }),
                h(Component, props)
              ]);
            }

            // 默认组件
            return h(Component, props);
          };
        }
      });

      componentCache.set(cacheKey, componentDef);
    }

    return componentCache.get(cacheKey);
  }

  return {
    renderComponent
  };
}
