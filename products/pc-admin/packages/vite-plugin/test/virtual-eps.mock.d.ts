/**
 * 鐢ㄤ簬娴嬭瘯鐨?EPS Mock 鏁版嵁
 */
export declare const mockEpsData: {
    user: {
        path: string;
        method: string;
        name: string;
        summary: string;
    }[];
    order: {
        path: string;
        method: string;
        name: string;
        summary: string;
    }[];
    product: {
        path: string;
        method: string;
        name: string;
        summary: string;
    }[];
};
/**
 * 妯℃嫙 EPS API 鍝嶅簲
 */
export declare function createMockEpsResponse(): {
    code: number;
    data: {
        user: {
            path: string;
            method: string;
            name: string;
            summary: string;
        }[];
        order: {
            path: string;
            method: string;
            name: string;
            summary: string;
        }[];
        product: {
            path: string;
            method: string;
            name: string;
            summary: string;
        }[];
    };
    message: string;
};

