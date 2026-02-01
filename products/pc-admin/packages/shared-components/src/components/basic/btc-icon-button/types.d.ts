export interface IconButtonDropdownItem {
    command: string;
    label: string;
    disabled?: boolean;
}
export interface IconButtonDropdown {
    items: IconButtonDropdownItem[];
    onCommand: (command: string) => void;
}
export interface IconButtonPopover {
    component: any;
    width?: number;
    placement?: string;
    popperClass?: string;
}
export interface IconButtonConfig {
    icon: string | (() => string);
    tooltip?: string | (() => string);
    onClick?: (event?: MouseEvent) => void;
    badge?: number;
    dropdown?: IconButtonDropdown;
    popover?: IconButtonPopover;
    size?: number;
    class?: string;
}
