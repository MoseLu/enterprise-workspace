import type { TransferKey, TransferPanelProps } from '../btc-transfer-panel/types';
// SelectedItemDisplay 未使用，已移除

export interface TransferDrawerSection {
  key: string;
  title: string;
  subtitle?: string;
  transferProps: Omit<TransferPanelProps<any>, 'modelValue'>;
  modelValue: TransferKey[];
}

export interface TransferDrawerChangePayload<T = any> {
  key: string;
  keys: TransferKey[];
  items: T[];
}

export interface TransferDrawerRemovePayload<T = any> {
  sectionKey: string;
  key: TransferKey;
  item: T | undefined;
}
