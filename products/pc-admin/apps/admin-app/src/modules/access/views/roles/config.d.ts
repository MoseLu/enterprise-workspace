/**
 * 角色列表页面配置
 */
import type { TableColumn, FormItem } from '@btc/shared-components';
export declare const roleColumns: TableColumn[];
export declare const getRoleFormItems: (domainOptions?: any[], roleOptions?: any[]) => FormItem[];
export declare const services: {
    sysdomain: any;
    sysrole: any;
};
