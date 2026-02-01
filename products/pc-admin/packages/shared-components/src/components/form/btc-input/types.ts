/** 输入框尺寸 */
export type BtcInputSize = 'default' | 'small' | 'middle' | 'large' | 'auto' | 'tiny';

/** 格式化类型 */
export type BtcInputFormat = 'phone' | 'idCard' | 'amount' | 'custom';

/** 格式化触发时机 */
export type BtcInputFormatTrigger = 'input' | 'blur';

/** 输入类型限制 */
export type BtcInputType = 'number' | 'letter' | 'alphanumeric' | 'noEmoji' | 'custom';

/** 校验状态 */
export type BtcInputValidateStatus = 'success' | 'error' | 'warning' | '';

export interface BtcInputProps {
  /** 输入框的值 */
  modelValue?: string | number;
  /** 输入框尺寸 */
  size?: BtcInputSize;
  /** 防抖时间（毫秒），默认 0（不防抖） */
  debounce?: number;
  /** 格式化类型 */
  format?: BtcInputFormat;
  /** 自定义格式化函数，当 format='custom' 时使用 */
  customFormat?: (value: string) => string;
  /** 格式化触发时机 */
  formatTrigger?: BtcInputFormatTrigger;
  /** 输入类型限制 */
  inputType?: BtcInputType;
  /** 自定义输入正则表达式，当 inputType='custom' 时使用 */
  customInputPattern?: RegExp;
  /** 校验状态 */
  validateStatus?: BtcInputValidateStatus;
  /** 错误提示文案，当 validateStatus='error' 时显示 */
  errorMessage?: string;
  /** 成功提示文案，当 validateStatus='success' 时显示 */
  successMessage?: string;
  /** 警告提示文案，当 validateStatus='warning' 时显示 */
  warningMessage?: string;
}

export interface BtcInputEmits {
  /** 更新输入值 */
  (e: 'update:modelValue', value: string | number): void;
  /** 输入事件 */
  (e: 'input', value: string | number): void;
  /** 值改变事件 */
  (e: 'change', value: string | number): void;
  /** 失焦事件 */
  (e: 'blur', event: FocusEvent): void;
  /** 聚焦事件 */
  (e: 'focus', event: FocusEvent): void;
  /** 清空事件 */
  (e: 'clear'): void;
  /** 格式化后触发 */
  (e: 'formatted', value: string): void;
  /** tiny 模式下图标按钮点击事件 */
  (e: 'icon-click'): void;
}
