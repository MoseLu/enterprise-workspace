<script lang="ts">
import { defineComponent, h, resolveComponent } from 'vue';
import {
  ElForm, ElRow, ElCol, ElFormItem, ElButton, ElTabs, ElTabPane, ElDivider,
  ElInput, ElInputNumber, ElSelect, ElOption, ElRadioGroup, ElRadio,
  ElCheckboxGroup, ElCheckbox, ElSwitch, ElDatePicker, ElTimePicker,
  ElCascader, ElTreeSelect, /* ElColorPicker, */ ElRate, ElSlider, ElUpload
} from 'element-plus';
import BtcDialog from '../../feedback/btc-dialog/index';
import BtcUpload from '../btc-upload/index.vue';
import { useFormSetup, useFormActions, useFormItemActions, isBoolean, parseHidden, collapseItem } from './composables';

// 组件映射表
const componentMap: Record<string, any> = {
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
  'btc-upload': BtcUpload
};

export default defineComponent({
  name: 'BtcForm',

  props: {
    name: String,
    inner: Boolean,
    inline: Boolean,
    enablePlugin: {
      type: Boolean,
      default: true
    }
  },

  setup(props, { expose, slots }) {
    // 生成本表单唯一前缀，用于组合每个输入控件的唯一 id
    const formUid = `btc-form-${Math.random().toString(36).slice(2, 8)}`;
    // 表单设置和初始化
    const formSetup = useFormSetup(props);
    const {
      Form,
      config,
      form,
      visible,
      saving,
      loading,
      disabled,
      Tabs,
      Action,
      ElFormApi,
      setRefs,
    } = formSetup;

    // 表单操作方法
    const formActions = useFormActions(formSetup);
    const {
      showLoading,
      hideLoading,
      setDisabled,
      done,
      close,
      onClosed,
      clear,
      reset,
      submit,
      open,
    } = formActions;

    // 表单项动态控制方法
    const formItemActions = useFormItemActions(formSetup);
    const {
      getForm,
      setForm,
      setData,
      setConfig,
      setOptions,
      setProps,
      toggleItem,
      hideItem,
      showItem,
      setTitle,
      bindForm,
    } = formItemActions;


    // 渲染表单项
    function renderFormItem(e: any, index: number) {
      if (!e) return null;

      // 分组判断
      const inGroup = Tabs.active.value ? e.group === Tabs.active.value || !e.group : true;

      // 隐藏判断
      e._hidden = parseHidden(e.hidden, form);

      if (e._hidden || !inGroup) {
        return null;
      }

      // collapse 默认值
      if (e.collapse === undefined && isBoolean(e.collapse) === false) {
        e.collapse = false; // 默认展开
      }

      // Tabs 组件
      if (e.type === 'tabs') {
        return h(ElTabs, {
          modelValue: Tabs.active.value,
          'onUpdate:modelValue': (val: string) => {
            Tabs.change(val);
          },
          ...e.props
        }, {
          default: () => e.props?.labels?.map((tab: any) => {
            return h(ElTabPane, {
              label: tab.label,
              name: tab.value,
              lazy: tab.lazy
            });
          })
        });
      }

      // 普通表单项
      const FormItem = h(ElFormItem, {
        label: e.label,
        prop: e.prop,
        rules: e.rules,
        required: e.required,
        key: `${e.prop || index}`
      }, {
        default: () => {
          const content = [];
          
          // 插槽
          if (e.component?.name?.startsWith('slot-')) {
            const slotName = e.component.name.replace('slot-', '');
            return slots[slotName]?.({ scope: form, prop: e.prop, item: e });
          }

          // 组件实例
          if (e.component?.vm) {
            return h(e.component.vm, {
              modelValue: (form as Record<string, any>)[e.prop],
              'onUpdate:modelValue': (val: any) => {
                (form as Record<string, any>)[e.prop] = val;
              },
              scope: form,
              prop: e.prop,
              ...e.component.props
            });
          }

            // 组件名称
            if (e.component?.name) {
            const componentName = e.component.name;
            const Component = componentMap[componentName] || resolveComponent(componentName);

            // 为控件生成稳定且唯一的 id
            const baseProp = e.prop || `field-${index}`;
            const inputId = `${formUid}-${baseProp}-${index}`;

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
              'btc-upload'
            ];
            
            const isDateOrTimePicker = componentName === 'el-date-picker' || componentName === 'el-time-picker';
            const needsHiddenInput = componentsWithoutStandardInput.includes(componentName) || isDateOrTimePicker;
            
            // 对于需要隐藏 input 的组件，先添加隐藏的 input 作为第一个子元素（用于可访问性，让 label 的 for 属性能找到它）
            if (needsHiddenInput) {
              // 获取当前值，用于隐藏 input
              let hiddenInputValue = '';
              const formValue = (form as Record<string, any>)[e.prop];
              if (Array.isArray(formValue)) {
                hiddenInputValue = isDateOrTimePicker ? formValue.join(' - ') : formValue.join(', ');
              } else if (formValue !== null && formValue !== undefined) {
                hiddenInputValue = String(formValue);
              }
              
              content.push(h('input', {
                id: inputId,
                name: baseProp,
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
              }));
            }
            
            const componentProps = {
              modelValue: (form as Record<string, any>)[e.prop],
              'onUpdate:modelValue': (val: any) => {
                (form as Record<string, any>)[e.prop] = val;
              },
              disabled: disabled.value || e.component.props?.disabled,
              // 对于需要隐藏 input 的组件，不传递 id 和 name（避免冲突）
              // 对于其他组件，传递 id 和 name
              ...(needsHiddenInput ? {} : { id: inputId, name: baseProp }),
              ...e.component.props
            };

            // 特殊处理 btc-upload：需要传递 uploadService
            if (componentName === 'btc-upload') {
              // 尝试从全局获取 service
              let uploadService = componentProps.uploadService;
              if (!uploadService && typeof window !== 'undefined') {
                uploadService = (window as any).__BTC_SERVICE__;
              }
              componentProps.uploadService = uploadService;
              componentProps.prop = e.prop;
            }

            // 渲染子项（如 el-select 的 options）
            let children = null;

            if (e.component.options) {
              if (componentName === 'el-select') {
                children = e.component.options.map((opt: any) => {
                  return h(ElOption, {
                    key: opt.value,
                    label: opt.label,
                    value: opt.value
                  });
                });
              } else if (componentName === 'el-radio-group') {
                children = e.component.options.map((opt: any) => {
                  return h(ElRadio, {
                    key: opt.value,
                    value: opt.value
                  }, () => opt.label);
                });
              } else if (componentName === 'el-checkbox-group') {
                children = e.component.options.map((opt: any) => {
                  return h(ElCheckbox, {
                    key: opt.value,
                    value: opt.value
                  }, () => opt.label);
                });
              }
            }

            // 渲染子表单项
            if (e.children) {
              children = h('div', { class: 'btc-form-item__children' }, [
                h(ElRow, { gutter: 10 }, () => e.children.map(renderFormItem))
              ]);
            }

            // 处理组件 slots（如 el-input 的 suffix）
            const componentSlots: any = {};
            if (e.component?.slots) {
              Object.keys(e.component.slots).forEach(slotName => {
                componentSlots[slotName] = (props?: any) => {
                  return e.component.slots[slotName]({ scope: form, prop: e.prop, item: e, ...props });
                };
              });
            }

            // 如果有 children，添加到 default slot；slots 可以同时存在
            if (children) {
              componentSlots.default = () => children;
            }

            const result = h(Component, componentProps, Object.keys(componentSlots).length > 0 ? componentSlots : undefined);

            // flex 控制：包装在 div 中（隐藏 input 已在最开始添加到 content 中）
            if (e.flex === false) {
              content.push(h('div', {
                class: 'btc-form-item__component',
                style: { flex: 'initial', width: 'auto' }
              }, [result]));
            } else {
              content.push(h('div', {
                class: ['btc-form-item__component', 'flex1']
              }, [result]));
            }

            // collapse 折叠
            if (isBoolean(e.collapse)) {
              content.push(h('div', {
                class: 'btc-form-item__collapse',
                onClick: () => collapseItem(e)
              }, [
                h('el-divider', { contentPosition: 'center' }, () =>
                  e.collapse ? '查看更多' : '收起内容'
                )
              ]));
            }

            return content;
          }

          return null;
        }
      });

      // 包装在 el-col 中
      if (!props.inline) {
        const span = e.span || 24;
        return h(ElCol, {
          span,
          ...e.col
        }, () => FormItem);
      }

      return FormItem;
    }

    // 渲染表单容器
    function renderContainer() {
      const children = config.items.map(renderFormItem);

      const labelPosition = (config.props?.labelPosition || 'top') as 'top' | 'left' | 'right';

      // 合并 props，避免重复定义
      const { labelWidth: _labelWidth, labelPosition: _labelPosition, ...restProps } = config.props || {};

      return h('div', { class: 'btc-form__container', ref: setRefs('form') }, [
        h(ElForm, {
          ref: Form,
          model: form,
          labelWidth: config.props?.labelWidth || '100px',
          labelPosition: labelPosition,
          inline: props.inline,
          disabled: saving.value || disabled.value,
          scrollToError: true,
          ...restProps,
          onSubmit: (e: Event) => {
            submit();
            e.preventDefault();
          }
        }, {
          default: () => {
            const items = [
              slots.prepend?.({ scope: form }),
              props.inline ? children : h(ElRow, { gutter: 10 }, () => children),
              slots.append?.({ scope: form })
            ];

            return h('div', { class: 'btc-form__items' }, items);
          }
        })
      ]);
    }

    // 渲染底部按钮
    function renderFooter() {
      const { hidden, buttons, saveButtonText, closeButtonText, justify } = config.op || {};

      if (hidden) {
        return null;
      }

      const Btns = buttons?.map((e: any) => {
        switch (e) {
          case 'save':
            return h(ElButton, {
              type: 'primary',
              loading: saving.value,
              disabled: loading.value,
              onClick: () => submit()
            }, () => saveButtonText || '保存');

          case 'close':
            return h(ElButton, {
              onClick: () => close('close')
            }, () => closeButtonText || '关闭');

          default:
            // 插槽
            if (typeof e === 'string' && e.startsWith('slot-')) {
              const slotName = e.replace('slot-', '');
              return slots[slotName]?.({ scope: form });
            }

            // 自定义按钮
            if (typeof e === 'object' && e.label) {
              return h(ElButton, {
                type: e.type,
                ...e.props,
                onClick: () => {
                  if (e.onClick) {
                    e.onClick({ scope: form });
                  }
                }
              }, () => e.label);
            }

            return null;
        }
      });

      return h('div', {
        class: 'btc-form__footer',
        style: {
          justifyContent: justify || 'flex-end'
        }
      }, Btns);
    }

    // 暴露方法
    const ctx = {
      Form,
      visible,
      saving,
      form,
      config,
      loading,
      disabled,
      open,
      close,
      done,
      clear,
      reset,
      submit,
      showLoading,
      hideLoading,
      setDisabled,
      ...Action,
      ...ElFormApi,
      // 动态控制方法（对齐 cool-admin，覆盖 Action 中的同名方法）
      getForm,
      setForm,
      setData,
      setConfig,
      setOptions,
      setProps,
      toggleItem,
      hideItem,
      showItem,
      setTitle,
      bindForm,
      // Tabs (exposed for advanced usage)
      tabs: Tabs
    };

    expose(ctx);

    // 渲染
    return () => {
      if (props.inner) {
        return renderContainer();
      }

      return h(BtcDialog, {
        modelValue: visible.value,
        'onUpdate:modelValue': (val: boolean) => {
          visible.value = val;
        },
        ...(config.title !== undefined ? { title: config.title } : {}),
        ...(config.width !== undefined ? { width: config.width } : {}),
        ...((config as any).height !== undefined ? { height: (config as any).height } : {}),
        ...config.dialog,
        onClosed
      }, {
        default: () => renderContainer(),
        footer: () => renderFooter()
      });
    };
  }
});
</script>

