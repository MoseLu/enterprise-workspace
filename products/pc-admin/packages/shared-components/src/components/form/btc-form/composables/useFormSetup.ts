import { provide } from 'vue';
import { useBtcForm, useTabs, useAction, useElApi, usePlugins } from '@btc/shared-core';

/**
 * 表单设置和初始化
 */
export function useFormSetup(props: any) {
  // 核心表单对象
  const { Form, config, form, visible, saving, loading, disabled } = useBtcForm();

  // 关闭的操作类型
  let closeAction: 'close' | 'save' = 'close';

  // 旧表单数据
  let defForm: Record<string, any> | undefined;

  // 选项卡
  const Tabs = useTabs({ config, Form });

  // 操作
  const Action = useAction({ config, form });

  // el-form 方法
  const ElFormApi = useElApi(
    ['validate', 'validateField', 'resetFields', 'scrollToField', 'clearValidate'],
    Form
  );

  // 插件
  const plugin = usePlugins(props.enablePlugin, { visible });

  // Refs
  const refs: Record<string, any> = {};
  function setRefs(name: string) {
    return (el: any) => {
      refs[name] = el;
    };
  }

  // 提供上下文
  provide('btc-form', {
    form,
    config,
    Form
  });

  return {
    Form,
    config,
    form,
    visible,
    saving,
    loading,
    disabled,
    closeAction,
    defForm,
    Tabs,
    Action,
    ElFormApi,
    plugin,
    refs,
    setRefs,
    setCloseAction: (action: 'close' | 'save') => { closeAction = action; },
    getCloseAction: () => closeAction,
    setDefForm: (data: any) => { defForm = data; },
    getDefForm: () => defForm,
  };
}

