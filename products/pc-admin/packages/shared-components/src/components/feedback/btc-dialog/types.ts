/**
 * BtcDialog Props
 */
export interface DialogProps {
  // 鏄惁鍙
  modelValue: boolean;

  // 鏍囬
  title?: string;

  // 楂樺害
  height?: string | number;

  // 瀹藉害
  width?: string | number;

  // 内边距
  padding?: string;

  // 鏄惁缂撳瓨
  keepAlive?: boolean;

  // 鏄惁鍏ㄥ睆
  fullscreen?: boolean;

  // 鎺у埗鎸夐挳
  controls?: string[];

  // 闅愯棌澶撮儴鍏冪礌
  hideHeader?: boolean;

  // 关闭前
  beforeClose?: (done: () => void) => void | Promise<void>;

  // 鏄惁闇€瑕佹粴鍔ㄦ潯
  scrollbar?: boolean;

  // 鑳屾櫙閫忔槑
  transparent?: boolean;

  // 是否居中
  alignCenter?: boolean;

  // 是否挂载到 body（在微前端环境中建议设置为 false）
  appendToBody?: boolean;

  // 挂载到指定选择器或元素（Element Plus 2.4.3+ 支持，优先级高于 appendToBody）
  appendTo?: string | HTMLElement;
}

/**
 * BtcDialog Emits
 */
export interface DialogEmits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'fullscreen-change', value: boolean): void;
  (e: 'closed'): void;
}

