import type { UseCrudReturn } from '@btc/shared-core';
import type { UpsertProps } from '../types';
/**
 * 琛ㄥ崟鎻愪氦閫昏緫
 */
export declare function useFormSubmit(props: UpsertProps, crud: UseCrudReturn<any>, formDataContext: any, pluginContext: any): {
    submitting: globalThis.Ref<boolean, boolean>;
    handleSubmit: () => Promise<void>;
    handleCancel: () => void;
    handleClosed: () => void;
};

