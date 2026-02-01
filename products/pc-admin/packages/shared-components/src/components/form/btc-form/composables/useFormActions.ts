;
import { nextTick } from 'vue';
import { formHook, logger } from '@btc/shared-core/utils/form';
import { cloneDeep, invokeData } from './useFormItems';

/**
 * 表单操作方法
 */
export function useFormActions(formSetup: any) {
  const {
    Form,
    config,
    form,
    visible,
    saving,
    loading,
    disabled,
    Tabs,
    plugin,
    refs,
    setCloseAction,
    getCloseAction,
    setDefForm,
    getDefForm,
  } = formSetup;

  // 显示加载
  function showLoading() {
    loading.value = true;
  }

  // 隐藏加载
  function hideLoading() {
    loading.value = false;
  }

  // 设置禁用
  function setDisabled(val: boolean = true) {
    disabled.value = val;
  }

  // 完成
  function done() {
    saving.value = false;
  }

  // 关闭前
  function beforeClose(doneFn: () => void) {
    if (config.on?.close) {
      config.on.close(getCloseAction(), doneFn);
    } else {
      doneFn();
    }
  }

  // 关闭
  function close(action?: 'close' | 'save') {
    if (action) {
      setCloseAction(action);
    }

    beforeClose(() => {
      visible.value = false;
      done();
    });
  }

  // 关闭后
  function onClosed() {
    Tabs.clear();
    Form.value?.clearValidate();

    if (config.on?.closed) {
      config.on.closed();
    }
  }

  // 清空表单
  function clear() {
    for (const i in form) {
      delete form[i];
    }

    setTimeout(() => {
      Form.value?.clearValidate();
    }, 0);
  }

  // 重置
  function reset() {
    const defForm = getDefForm();
    if (defForm) {
      for (const i in defForm) {
        form[i] = cloneDeep(defForm[i]);
      }
    }
  }

  // 提交
  function submit(callback?: (data: any, event: { close: () => void; done: () => void }) => void) {
    Form.value?.validate(async (valid: boolean, error: any) => {
      if (valid) {
        saving.value = true;

        const d = cloneDeep(form);

        config.items.forEach((e: any) => {
          function deep(e: any) {
            if (e.prop) {
              if (e._hidden) {
                delete d[e.prop];
              }

              if (e.hook) {
                formHook.submit({
                  ...e,
                  value: e.prop ? d[e.prop] : undefined,
                  form: d,
                });
              }
            }

            if (e.children) {
              e.children.forEach(deep);
            }
          }

          deep(e);
        });

        invokeData(d);

        const submitFn = callback || config.on?.submit;

        if (submitFn) {
          submitFn(await plugin.submit(d), {
            close() {
              close('save');
            },
            done,
          });
        } else {
          done();
        }
      } else {
        Tabs.toGroup({
          refs,
          config,
          prop: Object.keys(error)[0],
        });
      }
    });
  }

  // 打开表单
  function open(options?: any, plugins?: any[]) {
    if (!options) {
      return logger.error('Options is not null');
    }

    // 清空
    if (options.isReset !== false) {
      clear();
    }

    // 显示对话框
    visible.value = true;

    // 默认关闭方式
    setCloseAction('close');

    // 合并配置
    for (const i in config) {
      switch (i) {
        case 'items':
          config.items =
            options.items?.map((e: any) => {
              const item = typeof e === 'function' ? e() : e;
              return {
                ...item,
                children: item?.children?.map((c: any) => (typeof c === 'function' ? c() : c)),
              };
            }) || [];
          break;
        case 'on':
        case 'op':
        case 'props':
        case 'dialog':
        case '_data':
          Object.assign((config as any)[i], options[i] || {});
          break;
        default:
          (config as any)[i] = options[i];
          break;
      }
    }

    // 预设表单值
    if (options?.form) {
      for (const i in options.form) {
        form[i] = options.form[i];
      }
    }

    // 设置表单数据
    config.items.forEach((e: any) => {
      function deep(e: any) {
        if (e.prop) {
          // 解析 prop
          if (e.prop.includes('.')) {
            e.prop = e.prop.replace(/\./g, '-');
          }

          // prop 合并
          Tabs.mergeProp(e);

          // hook 绑定值
          formHook.bind({
            ...e,
            value: form[e.prop] !== undefined ? form[e.prop] : cloneDeep(e.value),
            form,
          });

          // 表单验证
          if (e.required) {
            e.rules = {
              required: true,
              message: `请输入${e.label || ''}`,
            };
          }
        }

        // 设置 tabs 默认值
        if (e.type === 'tabs') {
          Tabs.set(e.value);
        }

        // 子集
        if (e.children) {
          e.children.forEach(deep);
        }
      }

      deep(e);
    });

    // 注册插件
    if (plugins) {
      plugins.forEach(plugin.use);
    }

    // 保存表单数据
    setDefForm(cloneDeep(form));

    nextTick(() => {
      Form.value?.clearValidate();

      if (config.on?.open) {
        config.on.open(form);
      }
    });
  }

  return {
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
  };
}
