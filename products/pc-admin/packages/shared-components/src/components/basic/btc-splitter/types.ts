import type { InjectionKey, UnwrapRef, VNode } from 'vue';

export type Layout = 'horizontal' | 'vertical';

export type PanelItemState = UnwrapRef<{
  uid: number;
  getVnode: () => VNode;
  el: HTMLElement;
  collapsible: { start?: boolean; end?: boolean };
  max?: number | string;
  min?: number | string;
  resizable: boolean;
  size?: number | string;
  setIndex: (val: number) => void;
}>;

export interface SplitterRootContext {
  panels: PanelItemState[];
  layout: Layout;
  lazy: boolean;
  containerSize: number;
  movingIndex: { index: number; confirmed: boolean } | null;
  percentSizes: number[];
  pxSizes: number[];
  registerPanel: (pane: PanelItemState) => void;
  unregisterPanel: (pane: PanelItemState) => void;
  onCollapse: (index: number, type: 'start' | 'end') => void;
  togglePanels: (panelIndex: number, targetIndices: number[]) => void;
  onMoveEnd: (index: number) => Promise<void>;
  onMoveStart: (index: number) => void;
  onMoving: (index: number, offset: number) => void;
}

export const splitterRootContextKey: InjectionKey<SplitterRootContext> = Symbol(
  'splitterRootContextKey'
);

// BtcSplitter 相关类型
export interface BtcSplitterProps {
  /** 分栏方向：'horizontal' | 'vertical' */
  direction?: 'horizontal' | 'vertical';
  /** 是否使用懒加载 */
  lazy?: boolean;
}

export interface BtcSplitterEmits {
  /** 尺寸变化 */
  'resize': [index: number, sizes: number[]];
  /** 开始调整尺寸 */
  'resize-start': [index: number, sizes: number[]];
  /** 结束调整尺寸 */
  'resize-end': [index: number, sizes: number[]];
  /** 折叠/展开 */
  'collapse': [index: number, type: 'start' | 'end', sizes: number[]];
}

export interface BtcSplitterExpose {
  // 暂无暴露的属性和方法
}

export type BtcSplitterDirection = 'horizontal' | 'vertical';

export interface BtcSplitterPanelProps {
  /** 面板尺寸 */
  size?: string | number;
  /** 最小尺寸 */
  min?: string | number;
  /** 最大尺寸 */
  max?: string | number;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 是否可折叠 */
  collapsible?: boolean | { start?: boolean; end?: boolean };
}

export interface BtcSplitterPanelEmits {
  /** 尺寸更新 */
  'update:size': [value: number | string];
}
