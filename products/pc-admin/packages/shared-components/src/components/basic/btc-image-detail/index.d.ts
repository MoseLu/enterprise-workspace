import type { ImageDetailProps, ImageDetailEmits } from './types';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    BtcImageDetail: typeof import('./index.vue').default;
  }
}

export type { ImageDetailProps, ImageDetailEmits };
