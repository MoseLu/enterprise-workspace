import type { BtcFormConfig } from '../useBtcForm';

export function useAction({ config, form }: { config: BtcFormConfig; form: any; Form?: any }) {
  // 设置表单数据
  function setForm(prop: string, value: any) {
    form[prop] = value;
  }

  // 获取表单数据
  function getForm(prop?: string) {
    return prop ? form[prop] : form;
  }

  // 设置选项
  function setOptions(prop: string, options: any[]) {
    const item = config.items.find((e: any) => e.prop === prop);
    if (item && item.component) {
      item.component.options = options;
    }
  }

  // 设置组件 props
  function setProps(prop: string, props: Record<string, any>) {
    const item = config.items.find((e: any) => e.prop === prop);
    if (item && item.component) {
      item.component.props = {
        ...item.component.props,
        ...props
      };
    }
  }

  // 显示表单项
  function showItem(...props: string[]) {
    props.forEach((prop) => {
      const item = config.items.find((e: any) => e.prop === prop);
      if (item) {
        item._hidden = false;
      }
    });
  }

  // 隐藏表单项
  function hideItem(...props: string[]) {
    props.forEach((prop) => {
      const item = config.items.find((e: any) => e.prop === prop);
      if (item) {
        item._hidden = true;
      }
    });
  }

  // 切换表单项显示
  function toggleItem(prop: string, visible?: boolean) {
    const item = config.items.find((e: any) => e.prop === prop);
    if (item) {
      item._hidden = visible === undefined ? !item._hidden : !visible;
    }
  }

  return {
    setForm,
    getForm,
    setOptions,
    setProps,
    showItem,
    hideItem,
    toggleItem
  };
}

