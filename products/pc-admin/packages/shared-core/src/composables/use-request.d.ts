export interface UseRequestReturn<T> {
    loading: any;
    data: any;
    error: any;
    execute: (...args: any[]) => Promise<T>;
}
/**
 * 閫氱敤璇锋眰 Composable
 */
export declare function useRequest<T = any>(requestFn: (...args: any[]) => Promise<T>): UseRequestReturn<T>;
//# sourceMappingURL=use-request.d.ts.map