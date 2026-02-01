/**
 * 琛ㄥ崟鎿嶄綔鏂规硶
 */
export declare function useFormActions(formSetup: any): {
  showLoading: () => void;
  hideLoading: () => void;
  setDisabled: (val?: boolean) => void;
  done: () => void;
  close: (action?: 'close' | 'save') => void;
  onClosed: () => void;
  clear: () => void;
  reset: () => void;
  submit: (callback?: (data: any, event: { close: () => void; done: () => void }) => void) => void;
  open: (options?: any, plugins?: any[]) => void;
};

