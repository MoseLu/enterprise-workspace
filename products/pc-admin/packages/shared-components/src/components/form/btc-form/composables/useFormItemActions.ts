import { formHook, logger } from '@btc/shared-core/utils/form';
;

/**
 * 琛ㄥ崟椤瑰姩鎬佹帶鍒舵柟娉曪紙瀵归綈 cool-admin form/helper/action.ts锛? */
export function useFormItemActions(formSetup: any) {
  const { config, form } = formSetup;

  /**
   * 鏌ユ壘琛ㄥ崟椤?   */
  function findItemByProp(prop: string): any {
    let result: any;

    function deep(items: any[]) {
      items.forEach(e => {
        if (e.prop === prop) {
          result = e;
        } else if (e.children) {
          deep(e.children);
        }
      });
    }

    deep(config.items);
    return result;
  }

  /**
   * 璁剧疆閰嶇疆锛堥€氱敤锛?   */
  function set(
    { prop, key, path }: {
      prop?: string;
      key?: 'options' | 'props' | 'hidden' | 'hidden-toggle';
      path?: string
    },
    data?: any
  ) {
    // 閫氳繃璺緞璁剧疆
    if (path) {
      const keys = path.split('.');
      let target: any = config;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key === undefined) continue;
        target = target[key];
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey !== undefined) {
        target[lastKey] = data;
      }
      return;
    }

    // 閫氳繃 prop 璁剧疆
    if (prop) {
      const item = findItemByProp(prop);

      if (!item) {
        logger.error(`[set] ${prop} is not found`);
        return;
      }

      switch (key) {
        case 'options':
          if (item.component) {
            item.component.options = data;
          }
          break;

        case 'props':
          if (item.component) {
            if (!item.component.props) {
              item.component.props = {};
            }
            Object.assign(item.component.props, data);
          }
          break;

        case 'hidden':
          item.hidden = data;
          break;

        case 'hidden-toggle':
          item.hidden = data === undefined ? !item.hidden : !data;
          break;

        default:
          Object.assign(item, data);
          break;
      }
    }
  }

  /**
   * 鑾峰彇琛ㄥ崟鍊?   */
  function getForm(prop?: string) {
    return prop ? form[prop] : form;
  }

  /**
   * 璁剧疆琛ㄥ崟鍊?   */
  function setForm(prop: string, value: any) {
    form[prop] = value;
  }

  /**
   * 璁剧疆閰嶇疆
   */
  function setConfig(path: string, value: any) {
    set({ path }, value);
  }

  /**
   * 璁剧疆琛ㄥ崟椤规暟鎹?   */
  function setData(prop: string, value: any) {
    set({ prop }, value);
  }

  /**
   * 璁剧疆琛ㄥ崟椤圭殑涓嬫媺閫夐」
   */
  function setOptions(prop: string, value: any[]) {
    set({ prop, key: 'options' }, value);
  }

  /**
   * 璁剧疆琛ㄥ崟椤圭殑缁勪欢灞炴€?   */
  function setProps(prop: string, value: any) {
    set({ prop, key: 'props' }, value);
  }

  /**
   * 鍒囨崲琛ㄥ崟椤规樉绀?闅愯棌
   */
  function toggleItem(prop: string, value?: boolean) {
    set({ prop, key: 'hidden-toggle' }, value);
  }

  /**
   * 闅愯棌琛ㄥ崟椤?   */
  function hideItem(...props: string[]) {
    props.forEach((prop) => {
      set({ prop, key: 'hidden' }, true);
    });
  }

  /**
   * 鏄剧ず琛ㄥ崟椤?   */
  function showItem(...props: string[]) {
    props.forEach((prop) => {
      set({ prop, key: 'hidden' }, false);
    });
  }

  /**
   * 璁剧疆鏍囬
   */
  function setTitle(value: string) {
    config.title = value;
  }

  /**
   * 缁戝畾琛ㄥ崟鏁版嵁锛堟墜鍔ㄧ粦瀹氾級
   */
  function bindForm(data: any) {
    config.items.forEach((e: any) => {
      function deep(e: any) {
        if (e.prop) {
          formHook.bind({
            ...e,
            value: e.prop ? data[e.prop] : undefined,
            form: data
          });
        }

        if (e.children) {
          e.children.forEach(deep);
        }
      }

      deep(e);
    });

    Object.assign(form, data);
  }

  return {
    // 查找
    findItemByProp,
    // 表单值操作
    getForm,
    setForm,
    // 表单项控制
    setData,
    setConfig,
    setOptions,
    setProps,
    toggleItem,
    hideItem,
    showItem,
    setTitle,
    bindForm,
  };
}


