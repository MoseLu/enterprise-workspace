/**
 * 用户列表页面配置
 */
import type { TableColumn, FormItem } from '@btc/shared-components';
export declare const userColumns: TableColumn[];
export declare const getUserFormItems: (departmentOptions?: any[]) => FormItem[];
export declare const services: {
    sysdepartment: any;
    sysuser: any;
};
