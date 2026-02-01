export interface BtcSearchProps {
  /** 搜索框的值 */
  modelValue?: string;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否可清空 */
  clearable?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 输入框大小 */
  size?: 'large' | 'default' | 'small';
}

export interface BtcSearchEmits {
  /** 更新搜索值 */
  (e: 'update:modelValue', value: string): void;
  /** 搜索事件（回车或点击搜索时触发） */
  (e: 'search', value: string): void;
  /** 清空事件 */
  (e: 'clear'): void;
  /** 聚焦事件 */
  (e: 'focus', event: FocusEvent): void;
  /** 失焦事件 */
  (e: 'blur', event: FocusEvent): void;
}
