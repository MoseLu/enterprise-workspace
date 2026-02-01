import { ref, watch } from 'vue';

export interface FormPlugin {
  name: string;
  value?: any;
  created?: (options: any, ctx: any) => void;
  onOpen?: (options: any, ctx: any) => void | Promise<void>;
  onSubmit?: (data: any, ctx: any) => any | Promise<any>;
  onClose?: (done: () => void, ctx: any) => void;
}

export function usePlugins(enablePlugin: boolean = true, { visible }: { visible: any }) {
  const plugins = ref<FormPlugin[]>([]);

  // 监听弹窗显示
  watch(visible, async (val) => {
    if (val && enablePlugin) {
      for (const p of plugins.value) {
        if (p.onOpen) {
          await p.onOpen(p.value, {});
        }
      }
    }
  });

  // 提交时执行插件
  async function submit(data: any) {
    let result = data;

    if (enablePlugin) {
      for (const p of plugins.value) {
        if (p.onSubmit) {
          result = await p.onSubmit(result, {});
        }
      }
    }

    return result;
  }

  // 注册插件
  function use(plugin: FormPlugin) {
    plugins.value.push(plugin);

    if (plugin.created) {
      plugin.created(plugin.value, {});
    }
  }

  // 清空插件
  function clear() {
    plugins.value = [];
  }

  return {
    plugins,
    use,
    clear,
    submit,
  };
}
