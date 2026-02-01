declare module './crud/btc-import-export-group/index.vue' {
  export type BtcImportExportGroupProps = Record<string, any>;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, any>, any, any>;
  export default component;
}
