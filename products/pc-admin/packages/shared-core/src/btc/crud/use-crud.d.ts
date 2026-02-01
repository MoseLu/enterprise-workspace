/**
 * CRUD Composable
 * 封装 CRUD 通用逻辑：列表加载、分页、搜索、增删改等
 */
import type { CrudOptions, UseCrudReturn } from './types';
export declare function useCrud<T = Record<string, unknown>>(options: CrudOptions<T>, callback?: (app: UseCrudReturn<T>) => void): UseCrudReturn<T>;
//# sourceMappingURL=use-crud.d.ts.map