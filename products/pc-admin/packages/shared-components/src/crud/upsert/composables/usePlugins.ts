import { ref } from 'vue';
import type { UpsertPlugin, UpsertProps } from '../types';

/**
 * 鎻掍欢绯荤粺绠＄悊
 */
export function usePlugins(props: UpsertProps) {
  // 鎻掍欢绠＄悊
  const registeredPlugins = ref<UpsertPlugin[]>([]);

  /**
   * 娉ㄥ唽鎻掍欢
   */
  const registerPlugins = () => {
    if (props.plugins && props.enablePlugin !== false) {
      registeredPlugins.value = props.plugins;
      // 瑙﹀彂鎻掍欢 created
      props.plugins.forEach((p) => {
        if (p.created) {
          p.created(p.value);
        }
      });
    }
  };

  /**
   * 瑙﹀彂鎻掍欢 onOpen
   */
  const triggerPluginOnOpen = async () => {
    if (props.enablePlugin !== false) {
      for (const p of registeredPlugins.value) {
        if (p.onOpen) {
          await p.onOpen();
        }
      }
    }
  };

  /**
   * 瑙﹀彂鎻掍欢 onSubmit
   */
  const triggerPluginOnSubmit = async (submitData: any): Promise<any> => {
    let data = submitData;

    if (props.enablePlugin !== false) {
      for (const p of registeredPlugins.value) {
        if (p.onSubmit) {
          data = (await p.onSubmit(data)) || data;
        }
      }
    }

    return data;
  };

  /**
   * 瑙﹀彂鎻掍欢 onClose
   */
  const triggerPluginOnClose = (done: () => void) => {
    if (props.enablePlugin !== false && registeredPlugins.value.length > 0) {
      let index = 0;

      const next = () => {
        if (index < registeredPlugins.value.length) {
          const p = registeredPlugins.value[index];
          index++;
          if (p && p.onClose) {
            p.onClose(next);
          } else {
            next();
          }
        } else {
          done();
        }
      };

      next();
    } else {
      done();
    }
  };

  /**
   * 娓呯┖鎻掍欢
   */
  const clearPlugins = () => {
    registeredPlugins.value = [];
  };

  return {
    registeredPlugins,
    registerPlugins,
    triggerPluginOnOpen,
    triggerPluginOnSubmit,
    triggerPluginOnClose,
    clearPlugins,
  };
}

