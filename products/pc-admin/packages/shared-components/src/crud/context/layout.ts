import type { ComputedRef, InjectionKey, Ref } from 'vue';
import { inject } from 'vue';

export const DEFAULT_OPERATION_WIDTH = 220;
export const DEFAULT_CRUD_GAP = 10;

export type CrudLayoutTrailingKey = 'export' | 'toolbar';

export interface CrudLayoutContext {
  /**
   * 当前操作列宽度（来自表格列配置）
   */
  operationWidth: Ref<number>;

  /**
   * 顶部行的统一间距（与 --btc-crud-gap 保持一致）
   */
  gap: Ref<number>;

  /**
   * 顶部右侧区域（导出按钮、工具栏等）的总宽度
   */
  trailingWidth: ComputedRef<number>;

  /**
   * 顶部右侧区域元素数量
   */
  trailingCount: ComputedRef<number>;

  /**
   * 搜索区域在展开状态下应占据的宽度
   */
  searchWidth: ComputedRef<number>;

  /**
   * 注册或注销右侧区域的元素，自动跟踪其宽度
   */
  registerTrailing: (key: CrudLayoutTrailingKey, el: HTMLElement | null, options?: { immediate?: boolean }) => void;

  /**
   * 表格组件上报操作列宽度
   */
  setOperationWidth: (width: number | null | undefined) => void;

  /**
   * 更新顶部统一间距
   */
  setGap: (gap: number) => void;
}

export const crudLayoutKey: InjectionKey<CrudLayoutContext> = Symbol('btc-crud-layout');

export function useCrudLayout(): CrudLayoutContext | null {
  return inject(crudLayoutKey, null);
}


