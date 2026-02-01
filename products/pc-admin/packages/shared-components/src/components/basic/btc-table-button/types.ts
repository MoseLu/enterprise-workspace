export interface BtcTableButtonConfig {
  icon: string | (() => string);
  tooltip?: string | (() => string);
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  onClick?: (event?: MouseEvent) => void;
  disabled?: boolean;
  size?: number;
  badge?: number;
  ariaLabel?: string | (() => string);
  class?: string | string[];
  label?: string | (() => string);
  showLabel?: boolean;
}


