import type { Component } from 'vue';
import type { UseCrudReturn } from '@btc/shared-core';

/**
 * 表单项配置（对齐 cool-admin）
 */
export interface FormItem {
  prop: string;
  label: string;
  component?: {
    name: string | Component;
    props?: Record<string, any>;
    options?: any[];
    slots?: Record<string, (...args: any[]) => any>;
  };
  rules?: any | any[];
  required?: boolean;
  span?: number;
  value?: any; // 默认值
  hidden?: boolean | ((data: { scope: any; mode: string }) => boolean); // 动态隐藏
  hook?: any; // form-hook 转换
  _hidden?: boolean; // 内部使用
  [key: string]: any;
}

/**
 * 插件配置
 */
export interface UpsertPlugin {
  name: string;
  value?: any;
  created?: (options: any) => void;
  onOpen?: () => void | Promise<void>;
  onSubmit?: (data: any) => any | Promise<any>;
  onClose?: (done: () => void) => void;
}

/**
 * Props 配置
 */
export interface UpsertProps {
  items?: FormItem[] | (() => FormItem)[] | undefined; // 支持函数返回

  // Dialog 配置
  width?: string | number | undefined;
  padding?: string | undefined;
  dialogProps?: Record<string, any> | undefined;

  // Form 配置
  labelWidth?: string | number | undefined;
  labelPosition?: 'left' | 'right' | 'top' | undefined;
  formProps?: Record<string, any> | undefined;
  gutter?: number | undefined;

  // 文本
  addTitle?: string | undefined;
  editTitle?: string | undefined;
  infoTitle?: string | undefined; // 详情标题
  submitText?: string | undefined;
  cancelText?: string | undefined;

  // 高级参数（对标 cl-upsert）
  sync?: boolean | undefined; // 编辑时是否同步打开弹窗（先显示弹窗再加载数据）
  plugins?: UpsertPlugin[] | undefined; // 插件系统
  enablePlugin?: boolean | undefined; // 是否启用插件

  // 生命周期钩子（对标 cl-upsert）
  onOpen?: (() => void) | undefined; // 打开时（无数据）
  onInfo?: ((
    data: any,
    event: { next: (params?: any) => Promise<any>; done: (data: any) => void }
  ) => Promise<void> | void) | undefined; // 获取详情
  onOpened?: ((data: any) => void) | undefined; // 打开后（有数据）
  onSubmit?: ((
    data: any,
    event: { close: () => void; done: () => void; next: (data: any) => Promise<any> }
  ) => Promise<void> | void) | undefined; // 提交
  onClose?: ((action: 'close' | 'save', done: () => void) => void) | undefined; // 关闭前
  onClosed?: (() => void) | undefined; // 关闭后
}

/**
 * 表单模式
 */
export type UpsertMode = 'add' | 'update' | 'info';

/**
 * 表单数据上下文
 */
export interface FormDataContext {
  formRef: any;
  formData: any;
  mode: any;
  computedItems: any;
  formRules: any;
  loadingData: any;
  submitting: any;
}

/**
 * CRUD 上下文
 */
export interface CrudContext {
  crud: UseCrudReturn<any>;
}
