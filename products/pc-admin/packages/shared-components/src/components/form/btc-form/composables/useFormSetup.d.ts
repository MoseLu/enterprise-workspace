/**
 * 琛ㄥ崟璁剧疆鍜屽垵濮嬪寲
 */
export declare function useFormSetup(props: any): {
  Form: globalThis.Ref<any, any>;
  config: {
    title?: string | undefined;
    height?: string | undefined;
    width?: string | undefined;
    props?: Record<string, any> | undefined;
    on?: Record<string, any> | undefined;
    op?:
      | {
          hidden?: boolean | undefined;
          saveButtonText?: string | undefined;
          closeButtonText?: string | undefined;
          justify?: string | undefined;
          buttons?: any[] | undefined;
        }
      | undefined;
    dialog?: Record<string, any> | undefined;
    items: any[];
    form?: Record<string, any> | undefined;
    _data?: Record<string, any> | undefined;
  };
  form: Record<string, any>;
  visible: globalThis.Ref<boolean, boolean>;
  saving: globalThis.Ref<boolean, boolean>;
  loading: globalThis.Ref<boolean, boolean>;
  disabled: globalThis.Ref<boolean, boolean>;
  closeAction: 'close';
  defForm: Record<string, any> | undefined;
  Tabs: {
    active: globalThis.Ref<string | undefined, string | undefined>;
    list: globalThis.ComputedRef<any>;
    isLoaded: (value: any) => any;
    onLoad: (value: any) => void;
    get: () => any;
    set: (data: any) => void;
    change: (value: any, isValid?: boolean) => Promise<unknown>;
    clear: () => void;
    mergeProp: (item: any) => void;
    toGroup: (opts: {
      config: import('@btc/shared-core').BtcFormConfig;
      prop: string;
      refs: any;
    }) => void;
  };
  Action: {
    setForm: (prop: string, value: any) => void;
    getForm: (prop?: string) => any;
    setOptions: (prop: string, options: any[]) => void;
    setProps: (prop: string, props: Record<string, any>) => void;
    showItem: (...props: string[]) => void;
    hideItem: (...props: string[]) => void;
    toggleItem: (prop: string, visible?: boolean) => void;
  };
  ElFormApi: Record<string, any>;
  plugin: {
    plugins: globalThis.Ref<
      {
        name: string;
        value?: any;
        created?: ((options: any, ctx: any) => void) | undefined;
        onOpen?: ((options: any, ctx: any) => void | Promise<void>) | undefined;
        onSubmit?: ((data: any, ctx: any) => any | Promise<any>) | undefined;
        onClose?: ((done: () => void, ctx: any) => void) | undefined;
      }[],
      | import('@btc/shared-core').FormPlugin[]
      | {
          name: string;
          value?: any;
          created?: ((options: any, ctx: any) => void) | undefined;
          onOpen?: ((options: any, ctx: any) => void | Promise<void>) | undefined;
          onSubmit?: ((data: any, ctx: any) => any | Promise<any>) | undefined;
          onClose?: ((done: () => void, ctx: any) => void) | undefined;
        }[]
    >;
    use: (plugin: import('@btc/shared-core').FormPlugin) => void;
    clear: () => void;
    submit: (data: any) => Promise<any>;
  };
  refs: Record<string, any>;
  setRefs: (name: string) => (el: any) => void;
  setCloseAction: (action: 'close' | 'save') => void;
  getCloseAction: () => 'close' | 'save';
  setDefForm: (data: any) => void;
  getDefForm: () => Record<string, any> | undefined;
};

