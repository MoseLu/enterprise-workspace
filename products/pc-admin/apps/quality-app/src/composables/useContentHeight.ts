// 重新导出类型（直接定义，避免导入路径问题）
import type { Ref } from 'vue';

export interface ContentHeightContext {
  height: Ref<number>;
  register: (el: HTMLElement | null) => void;
  emit: () => void;
}

export {
  provideContentHeight,
  useContentHeight,
} from '@btc/shared-components';


