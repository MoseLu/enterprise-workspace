import type { Component } from 'vue';
/**
 * 琛ㄥ崟椤归厤缃? */
export interface BtcFormItem {
    type?: 'tabs' | string;
    label?: string;
    prop?: string;
    group?: string;
    component?: {
        name: string | Component;
        vm?: any;
        props?: Record<string, any>;
        options?: any[];
        slots?: Record<string, (...args: any[]) => any>;
    };
    rules?: any;
    required?: boolean;
    value?: any;
    span?: number;
    flex?: boolean;
    collapse?: boolean | undefined;
    hidden?: boolean | ((data: {
        scope: any;
    }) => boolean);
    hook?: any;
    children?: BtcFormItem[];
    col?: Record<string, any>;
    props?: Record<string, any>;
    _hidden?: boolean;
    [key: string]: any;
}
/**
 * 琛ㄥ崟閰嶇疆
 */
export interface BtcFormConfig {
    title?: string;
    width?: string | number;
    height?: string | number;
    items: BtcFormItem[];
    form?: Record<string, any>;
    props?: Record<string, any>;
    dialog?: Record<string, any>;
    op?: {
        hidden?: boolean;
        buttons?: any[];
        saveButtonText?: string;
        closeButtonText?: string;
        justify?: string;
    };
    on?: {
        open?: (data: any) => void;
        close?: (action: 'close' | 'save', done: () => void) => void;
        closed?: () => void;
        submit?: (data: any, event: {
            close: () => void;
            done: () => void;
        }) => void;
    };
    isReset?: boolean;
    _data?: Record<string, any>;
}
/**
 * Props 閰嶇疆
 */
export interface BtcFormProps {
    name?: string;
    inner?: boolean;
    inline?: boolean;
    enablePlugin?: boolean;
}
