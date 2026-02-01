export interface IconButtonDropdownItem {
	command: string;
	label: string;
	icon?: string | (() => string);
	disabled?: boolean;
}

export interface IconButtonDropdown {
	items: IconButtonDropdownItem[];
	onCommand: (command: string) => void;
	popperClass?: string;
}

export interface IconButtonPopover {
  component: any;
  width?: number;
  placement?: string;
  popperClass?: string;
}

import type { BtcSvgAnimation, BtcSvgAnimationTrigger } from '../btc-svg/types';

export interface IconButtonConfig {
  icon: string | (() => string);
  tooltip?: string | (() => string);
  onClick?: (event?: MouseEvent) => void;
  badge?: number;
  dropdown?: IconButtonDropdown;
  popover?: IconButtonPopover;
  size?: number;
  class?: string;
  disabled?: boolean;
  // 图标动画配置
  iconAnimation?: BtcSvgAnimation;
  iconAnimationTrigger?: BtcSvgAnimationTrigger;
  iconAnimationDuration?: string | number;
  iconAnimationDelay?: string | number;
}

