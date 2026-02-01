/**
 * 数组工具函数
 */
/**
 * 将 ids 统一转换为数组格式
 * @param ids - 可能是字符串、数字、数组或 undefined/null
 * @returns 数组格式的 ids，如果输入为空则返回空数组
 */
export declare function normalizeIds(ids: string | number | (string | number)[] | undefined | null): (string | number)[];
/**
 * 统一处理 keyword 对象中的 ids 字段为数组格式
 * @param keyword - keyword 对象
 * @returns 处理后的 keyword 对象，ids 字段统一为数组
 */
export declare function normalizeKeywordIds(keyword: any): any;
//# sourceMappingURL=array.d.ts.map