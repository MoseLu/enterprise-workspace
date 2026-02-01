// BtcUpsert 组件单独导出，避免循环依赖
import BtcUpsert from './index.vue';
export { default as BtcUpsert } from './index.vue';
export default BtcUpsert;
export type { FormItem, UpsertPlugin, UpsertProps } from './types';
