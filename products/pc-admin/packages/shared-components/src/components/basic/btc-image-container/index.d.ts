import type { ImageItem, BtcImageContainerProps } from './types';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    BtcImageContainer: typeof import('./index.vue').default;
  }
}

export type { ImageItem, BtcImageContainerProps };
