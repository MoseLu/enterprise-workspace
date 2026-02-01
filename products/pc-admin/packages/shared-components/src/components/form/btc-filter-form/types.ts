/**
 * BtcFilterForm 组件类型定义
 */

import type { BtcFormItem } from '../btc-form/types';

export interface BtcFilterFormProps {
  /**
   * 筛选表单数据（v-model）
   */
  modelValue?: Record<string, any>;

  /**
   * 表单项配置
   */
  items: BtcFormItem[];

  /**
   * 折叠面板标题
   */
  title?: string;

  /**
   * 是否默认展开
   */
  defaultExpand?: boolean;

  /**
   * 是否启用 Enter 提交
   */
  enableEnterSubmit?: boolean;

  /**
   * Enter 提交防抖延迟（毫秒）
   */
  enterDebounce?: number;

  /**
   * 表单标签宽度
   */
  labelWidth?: string | number;

  /**
   * 表单标签位置
   */
  labelPosition?: 'left' | 'right' | 'top';

  /**
   * 栅格间距
   */
  gutter?: number;
}

export interface BtcFilterFormEmits {
  /**
   * 表单数据更新
   */
  'update:modelValue': [value: Record<string, any>];

  /**
   * 提交事件（Enter 或手动调用 submit）
   */
  'submit': [data: Record<string, any>];

  /**
   * 重置事件
   */
  'reset': [];

  /**
   * 折叠状态变化
   */
  'expand-change': [expanded: boolean];
}
