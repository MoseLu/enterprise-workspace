import { watch, nextTick } from 'vue';
import { formHook } from '@btc/shared-core/utils/form';
import type { UseCrudReturn } from '@btc/shared-core';
import type { UpsertProps } from '../types';

/**
 * 表单初始化逻辑
 */
export function useFormInit(
  props: UpsertProps,
  crud: UseCrudReturn<any>,
  formDataContext: any,
  pluginContext: any
) {
  const {
    formRef,
    formData,
    mode,
    loadingData,
    computedItems,
  } = formDataContext;

  const {
    registerPlugins,
    triggerPluginOnOpen,
  } = pluginContext;

  /**
   * 绑定表单数据（form-hook）
   */
  const bindFormData = () => {
    computedItems.value.forEach((item: any) => {
      if (item.hook && item.prop) {
        formHook.bind({
          ...item,
          value: formData[item.prop],
          form: formData
        });
      }
    });
  };

  /**
   * 初始化表单数据
   * 关键：先根据 items 创建所有字段的初始值，再合并详情数据
   * 这样确保所有字段都存在，插件和 hook 能正确绑定
   */
  const initFormData = async () => {
    // 确定模式
    if (crud.currentRow.value) {
      // 有数据，判断是编辑还是详情
      mode.value = crud.upsertMode?.value || 'update';
    } else {
      mode.value = 'add';
    }

    // 注册插件
    registerPlugins();

    // 调用 onOpen 钩子（此时还没有数据）
    props.onOpen?.();

    // 触发插件 onOpen
    await triggerPluginOnOpen();

    // 关键修复：先根据 items 初始化所有字段的初始值
    // 这样确保所有字段都存在，插件和 hook 能正确绑定
    computedItems.value.forEach((item: any) => {
      if (item.prop) {
        // 如果字段已有值（从 formData 中），保留它
        // 否则使用 item.value 作为默认值
        if (formData[item.prop] === undefined) {
          formData[item.prop] = item.value !== undefined ? item.value : undefined;
        }
      }
    });

    if (mode.value === 'add') {
      // 新增模式：已经设置了默认值，直接调用 onOpened
      // 调用 onOpened
      nextTick(() => {
        props.onOpened?.(formData);
      });
    } else {
      // 编辑/详情模式：获取详情数据

      // sync=false（默认）：先加载数据再打开弹窗
      // sync=true：先打开弹窗再加载数据
      const shouldSync = props.sync === true;

      const loadAndBind = async () => {
        loadingData.value = true;

        if (props.onInfo) {
          // 使用自定义 onInfo
          const next = async (params?: any) => {
            // 调用 service.info
            const service = crud.service;
            if (service && service.info) {
              return await service.info(params || crud.currentRow.value);
            }
            return crud.currentRow.value;
          };

          const done = (responseData: any) => {
            // 合并详情数据到 formData（覆盖初始值）
            Object.assign(formData, responseData);

            // 绑定 hook
            bindFormData();

            loadingData.value = false;

            // 调用 onOpened
            nextTick(() => {
              props.onOpened?.(formData);
            });
          };

          await props.onInfo(crud.currentRow.value, { next, done });
        } else {
          // 默认行为：直接使用 currentRow
          // 合并详情数据到 formData（覆盖初始值）
          Object.assign(formData, crud.currentRow.value);

          // 绑定 hook
          bindFormData();

          loadingData.value = false;

          // 调用 onOpened
          nextTick(() => {
            props.onOpened?.(formData);
          });
        }
      };

      if (!shouldSync) {
        // 默认：先加载数据（弹窗还未显示）
        await loadAndBind();
      } else {
        // sync=true：先显示弹窗，再加载数据
        nextTick(async () => {
          await loadAndBind();
        });
      }
    }
  };

  /**
   * 监听弹窗显示
   */
  watch(() => crud.upsertVisible.value, (visible) => {
    if (visible) {
      initFormData();
      nextTick(() => {
        formRef.value?.clearValidate();
      });
    }
  });

  /**
   * 追加数据打开表单（新增模式 + 预填数据）
   */
  const append = async (data: any) => {
    // 设置为新增模式
    mode.value = 'add';

    // 注册插件
    registerPlugins();

    // 调用 onOpen 钩子
    props.onOpen?.();

    // 触发插件 onOpen
    await triggerPluginOnOpen();

    // 先根据 items 初始化所有字段的初始值
    computedItems.value.forEach((item: any) => {
      if (item.prop) {
        formData[item.prop] = item.value !== undefined ? item.value : undefined;
      }
    });

    // 合并传入的数据（覆盖默认值）
    Object.assign(formData, data);

    // 调用 onOpened
    nextTick(() => {
      props.onOpened?.(formData);
    });
  };

  return {
    initFormData,
    bindFormData,
    append,
  };
}

