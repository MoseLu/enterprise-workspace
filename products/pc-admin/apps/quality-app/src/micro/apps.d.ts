/**
 * 微前端应用配置
 */
export interface MicroAppConfig {
    name: string;
    entry: string;
    container: string;
    activeRule: string | ((location: Location) => boolean);
}
/**
 * 子应用列表
 */
export declare const microApps: MicroAppConfig[];
