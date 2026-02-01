/**
 * 智能菜单图标分配工具
 * 基于 labelKey 的语义匹配，自动为菜单项分配合适的图标
 */
export declare const AVAILABLE_ELEMENT_ICONS: readonly ["Lock", "Location", "Connection", "Files", "User", "OfficeBuilding", "Menu", "TrendCharts", "UserFilled", "FolderOpened", "Postcard", "Coin", "School", "Key", "List", "Monitor", "DocumentCopy", "Histogram", "Odometer", "Document", "Tickets", "House", "Grid", "View", "Operation", "Opportunity", "CollectionTag", "DeleteFilled", "Collection", "Setting", "Edit", "DataAnalysis", "ShoppingCart", "Box", "MapLocation", "Folder", "Delete", "Check", "Warning", "Money", "CreditCard", "Clock", "ShoppingBag", "Goods", "Van", "Ship", "Tools", "Cpu", "Printer", "Camera", "Picture", "VideoCamera", "Microphone", "Headset", "Phone", "Message", "ChatDotRound", "ChatLineRound", "Bell", "Notification", "Promotion", "Discount", "Star", "StarFilled", "Share", "Download", "Upload", "Link", "Search", "Filter", "Sort", "Refresh", "Loading", "Plus", "Minus", "Close", "Check", "CircleCheck", "CircleClose", "Warning", "InfoFilled", "SuccessFilled", "WarningFilled", "CirclePlus", "Remove", "CircleCheckFilled", "CircleCloseFilled"];
export declare const AVAILABLE_SVG_ICONS: readonly ["cart", "folder", "map", "odometer"];
/**
 * 智能分配图标
 * @param labelKey 菜单的 labelKey
 * @param usedIcons 当前应用（域）已使用的图标集合
 * @param existingIcon 已存在的图标（如果菜单项已指定图标，则使用该图标）
 * @returns 分配的图标名称
 */
export declare function assignMenuIcon(labelKey: string, usedIcons: Set<string>, existingIcon?: string): string;
/**
 * 为菜单树分配图标（递归处理）
 * @param items 菜单项数组
 * @param usedIcons 当前应用（域）已使用的图标集合（会被修改）
 * @returns 分配图标后的菜单项数组
 */
export declare function assignIconsToMenuTree(items: Array<{
    index: string;
    labelKey?: string;
    label?: string;
    icon?: string;
    children?: any[];
}>, usedIcons: Set<string>): Array<{
    index: string;
    labelKey?: string;
    label?: string;
    icon: string;
    children?: any[];
}>;
//# sourceMappingURL=menu-icon-assigner.d.ts.map