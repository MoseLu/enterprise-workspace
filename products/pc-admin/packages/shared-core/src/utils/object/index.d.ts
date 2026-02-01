/**
 * 对象工具函数
 */
/**
 * 深拷贝对象
 * @param obj 对象
 * @returns 深拷贝后的对象
 */
export declare function deepClone<T>(obj: T): T;
/**
 * 判断是否为对象
 * @param item 项目
 * @returns 是否为对象
 * 未使用，保留以备将来使用
 */
/**
 * 获取对象属性值（支持路径）
 * @param obj 对象
 * @param path 路径
 * @param defaultValue 默认值
 * @returns 属性值
 */
export declare function get<T = any>(obj: any, path: string, defaultValue?: T): T;
/**
 * 选择对象的指定属性
 * @param obj 对象
 * @param keys 键数组
 * @returns 新对象
 */
export declare function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * 排除对象的指定属性
 * @param obj 对象
 * @param keys 键数组
 * @returns 新对象
 */
export declare function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
//# sourceMappingURL=index.d.ts.map