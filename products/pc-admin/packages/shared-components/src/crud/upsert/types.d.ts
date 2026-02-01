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
    value?: any;
    hidden?: boolean | ((data: {
        scope: any;
        mode: string;
    }) => boolean);
    hook?: any;
    _hidden?: boolean;
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
    items?: FormItem[] | (() => FormItem)[];
    width?: string | number;
    padding?: string;
    dialogProps?: Record<string, any>;
    labelWidth?: string | number;
    labelPosition?: 'left' | 'right' | 'top';
    formProps?: Record<string, any>;
    gutter?: number;
    addTitle?: string;
    editTitle?: string;
    infoTitle?: string;
    submitText?: string;
    cancelText?: string;
    sync?: boolean;
    plugins?: UpsertPlugin[];
    enablePlugin?: boolean;
    onOpen?: () => void;
    onInfo?: (data: any, event: {
        next: (params?: any) => Promise<any>;
        done: (data: any) => void;
    }) => Promise<void> | void;
    onOpened?: (data: any) => void;
    onSubmit?: (data: any, event: {
        close: () => void;
        done: () => void;
        next: (data: any) => Promise<any>;
    }) => Promise<void> | void;
    onClose?: (action: 'close' | 'save', done: () => void) => void;
    onClosed?: () => void;
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
