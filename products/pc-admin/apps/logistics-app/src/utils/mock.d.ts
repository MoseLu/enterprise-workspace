/**
 * Mock 数据服务
 * 用于模拟后端API，数据存储在 localStorage
 */
export interface MockConfig<T = any> {
    storageKey: string;
    defaultData?: T[];
    idField?: string;
}
/**
 * 创建 Mock CRUD 服务
 */
export declare function createMockCrudService<T extends Record<string, any>>(storageKey: string, config?: Partial<MockConfig<T>>): {
    page: (params: {
        page: number;
        size: number;
        [key: string]: any;
    }) => Promise<{
        list: T[];
        total: number;
        page: number;
        size: number;
    }>;
    add: (data: Partial<T>) => Promise<T>;
    update: (data: T) => Promise<T>;
    delete: ({ ids }: {
        ids: (string | number)[];
    }) => Promise<{
        success: boolean;
    }>;
    info: (params: any) => Promise<T>;
    list: () => Promise<T[]>;
};
/**
 * 生成Mock数据辅助函数
 */
export declare const mockHelpers: {
    randomName: () => string;
    randomDate: (start?: Date, end?: Date) => string;
    randomChoice: <T>(arr: T[]) => T;
    randomBoolean: () => boolean;
    randomNumber: (min: number, max: number) => number;
};
