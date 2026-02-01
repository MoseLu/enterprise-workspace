/**
 * 智能菜单图标分配工具
 * 基于 labelKey 的语义匹配，自动为菜单项分配合适的图标
 */

// Element Plus 图标列表（常用的图标）
export const AVAILABLE_ELEMENT_ICONS = [
  'Lock',
  'Location',
  'Connection',
  'Files',
  'User',
  'OfficeBuilding',
  'Menu',
  'TrendCharts',
  'UserFilled',
  'FolderOpened',
  'Postcard',
  'Coin',
  'School',
  'Key',
  'List',
  'Monitor',
  'DocumentCopy',
  'Histogram',
  'Odometer',
  'Document',
  'Tickets',
  'House',
  'Grid',
  'View',
  'Operation',
  'Opportunity',
  'CollectionTag',
  'DeleteFilled',
  'Collection',
  'Setting',
  'Edit',
  'DataAnalysis',
  'ShoppingCart',
  'Box',
  'MapLocation',
  'Folder',
  'Delete',
  'Check',
  'Warning',
  'Money',
  'CreditCard',
  'Clock',
  'ShoppingBag',
  'Goods',
  'Van',
  'Ship',
  'Tools',
  'Cpu',
  'Printer',
  'Camera',
  'Picture',
  'VideoCamera',
  'Microphone',
  'Headset',
  'Phone',
  'Message',
  'ChatDotRound',
  'ChatLineRound',
  'Bell',
  'Notification',
  'Promotion',
  'Discount',
  'Star',
  'StarFilled',
  'Share',
  'Download',
  'Upload',
  'Link',
  'Search',
  'Filter',
  'Sort',
  'Refresh',
  'Loading',
  'Plus',
  'Minus',
  'Close',
  'Check',
  'CircleCheck',
  'CircleClose',
  'Warning',
  'InfoFilled',
  'SuccessFilled',
  'WarningFilled',
  'CirclePlus',
  'Remove',
  'CircleCheckFilled',
  'CircleCloseFilled',
] as const;

// SVG 图标列表（自定义图标）
export const AVAILABLE_SVG_ICONS = [
  'cart',
  'folder',
  'map',
  'odometer',
] as const;

// 语义关键词到图标的映射表
// 格式：关键词（小写） -> 候选图标列表（按优先级排序）
const SEMANTIC_ICON_MAP: Record<string, string[]> = {
  // 数据相关
  'data': ['Files', 'DataAnalysis', 'Document', 'Folder'],
  'files': ['Files', 'Document', 'Folder', 'FolderOpened'],
  'file': ['Files', 'Document', 'Folder'],
  'document': ['Document', 'Files', 'DocumentCopy'],
  'template': ['Files', 'Document', 'DocumentCopy'],
  'dictionary': ['Collection', 'FolderOpened', 'Files'],
  'recycle': ['DeleteFilled', 'Delete', 'CircleClose'],

  // 库存相关
  'inventory': ['Odometer', 'Box', 'Files'],
  'stock': ['Box', 'Odometer', 'Files'],
  'warehouse': ['FolderOpened', 'Box', 'House'],
  'material': ['Files', 'Box', 'Goods'],
  'bom': ['List', 'Files', 'Document'],
  'check': ['Check', 'CircleCheck', 'View'],

  // 采购相关
  'procurement': ['ShoppingCart', 'ShoppingBag', 'Goods'],
  'purchase': ['ShoppingCart', 'ShoppingBag', 'Goods'],
  'supplier': ['User', 'UserFilled', 'Connection'],
  'auxiliary': ['Collection', 'Box', 'Goods'],
  'packaging': ['CollectionTag', 'Box', 'Goods'],

  // 物流相关
  'logistics': ['Van', 'Ship', 'Box'],
  'transport': ['Van', 'Ship', 'Box'],
  'customs': ['MapLocation', 'Location', 'Map'],
  'shipping': ['Ship', 'Van', 'Box'],

  // 组织相关
  'org': ['OfficeBuilding', 'House', 'User'],
  'organization': ['OfficeBuilding', 'House', 'User'],
  'tenant': ['School', 'OfficeBuilding', 'House'],
  'department': ['Postcard', 'OfficeBuilding', 'Folder'],
  'user': ['User', 'UserFilled', 'Connection'],
  'users': ['User', 'UserFilled', 'Connection'],

  // 权限相关
  'access': ['Lock', 'Key', 'Connection'],
  'permission': ['Key', 'Lock', 'Connection'],
  'role': ['UserFilled', 'Key', 'Lock'],
  'resource': ['FolderOpened', 'Files', 'Document'],
  'action': ['TrendCharts', 'Operation', 'Setting'],

  // 平台相关
  'platform': ['Coin', 'Setting', 'Monitor'],
  'domain': ['Location', 'MapLocation', 'House'],
  'module': ['Files', 'Folder', 'Grid'],
  'plugin': ['Connection', 'Tools', 'Setting'],

  // 导航相关
  'navigation': ['Menu', 'Grid', 'List'],
  'menu': ['Menu', 'List', 'Grid'],

  // 运维相关
  'ops': ['Monitor', 'Operation', 'Setting'],
  'operation': ['Operation', 'Monitor', 'Setting'],
  'log': ['Document', 'Files', 'List'],
  'api': ['Connection', 'Link', 'Setting'],
  'baseline': ['Histogram', 'TrendCharts', 'DataAnalysis'],
  'simulator': ['Opportunity', 'Tools', 'Setting'],

  // 策略相关
  'strategy': ['Document', 'TrendCharts', 'DataAnalysis'],
  'management': ['Setting', 'Operation', 'Monitor'],
  'designer': ['Edit', 'Tools', 'Setting'],
  'monitor': ['Monitor', 'TrendCharts', 'DataAnalysis'],

  // 治理相关
  'governance': ['DataAnalysis', 'TrendCharts', 'Monitor'],

  // 工程相关
  'engineering': ['Tools', 'Cpu', 'Setting'],
  'project': ['Folder', 'Files', 'Document'],
  'projects': ['Folder', 'Files', 'Document'],
  'progress': ['TrendCharts', 'Histogram', 'DataAnalysis'],
  'monitoring': ['Monitor', 'TrendCharts', 'DataAnalysis'],

  // 生产相关
  'production': ['Tools', 'Cpu', 'Printer'],
  'plan': ['List', 'Document', 'Files'],
  'plans': ['List', 'Document', 'Files'],
  'schedule': ['Clock', 'Calendar', 'List'],
  'materials': ['Box', 'Goods', 'Files'],

  // 财务相关
  'finance': ['Money', 'CreditCard', 'Coin'],
  'receivables': ['Money', 'CreditCard', 'Coin'],
  'payables': ['CreditCard', 'Money', 'Coin'],
  'reports': ['DataAnalysis', 'TrendCharts', 'Document'],
  'report': ['DataAnalysis', 'TrendCharts', 'Document'],

  // 品质相关
  'quality': ['Check', 'CircleCheck', 'Star'],
  'inspection': ['Check', 'CircleCheck', 'View'],
  'defects': ['Warning', 'WarningFilled', 'CircleClose'],

  // 配置相关
  'config': ['Setting', 'Tools', 'Operation'],
  'configuration': ['Setting', 'Tools', 'Operation'],
  'setting': ['Setting', 'Tools', 'Operation'],
  'settings': ['Setting', 'Tools', 'Operation'],
  'storage': ['Box', 'FolderOpened', 'Files'],
  'location': ['Location', 'MapLocation', 'House'],

  // 测试相关
  'test': ['Tickets', 'Tools', 'Setting'],
  'test_features': ['Tickets', 'Tools', 'Setting'],
  'features': ['Tickets', 'Tools', 'Setting'],

  // 通用操作
  'list': ['List', 'Grid', 'View'],
  'detail': ['View', 'Document', 'InfoFilled'],
  'info': ['InfoFilled', 'Document', 'View'],
  'preview': ['View', 'Picture', 'VideoCamera'],
  'view': ['View', 'Picture', 'VideoCamera'],
  'edit': ['Edit', 'Tools', 'Setting'],
  'add': ['Plus', 'CirclePlus', 'Plus'],
  'delete': ['Delete', 'DeleteFilled', 'CircleClose'],
  'search': ['Search', 'Filter', 'View'],
  'filter': ['Filter', 'Search', 'Setting'],
  'sort': ['Sort', 'Operation', 'Setting'],
  'refresh': ['Refresh', 'Loading', 'Operation'],
} as const;

/**
 * 从 labelKey 中提取关键词
 * @param labelKey 菜单的 labelKey，如 "menu.data.files" 或 "test-features"
 * @returns 关键词数组，如 ["data", "files"]（不包含 "menu"）
 */
function extractKeywords(labelKey: string): string[] {
  // 移除 "menu." 前缀（如果存在）
  const key = labelKey.replace(/^menu\./, '');
  // 按点分割
  const parts = key.split('.');
  // 返回所有部分作为关键词（转换为小写，过滤空字符串）
  // 同时处理连字符，将 "test-features" 转换为 "test_features"
  return parts
    .map(part => part.toLowerCase().replace(/-/g, '_'))
    .filter(part => part.length > 0 && part !== 'menu');
}

/**
 * 根据关键词匹配图标
 * @param keywords 关键词数组
 * @returns 候选图标列表（按优先级排序）
 */
function matchIconsByKeywords(keywords: string[]): string[] {
  const matchedIcons: string[] = [];
  const iconSet = new Set<string>();

  // 遍历所有关键词，收集匹配的图标
  for (const keyword of keywords) {
    const icons = SEMANTIC_ICON_MAP[keyword];
    if (icons) {
      for (const icon of icons) {
        if (!iconSet.has(icon)) {
          matchedIcons.push(icon);
          iconSet.add(icon);
        }
      }
    }
  }

  return matchedIcons;
}

/**
 * 从可用图标池中选择未使用的图标
 * @param usedIcons 已使用的图标集合
 * @param preferredIcons 优先选择的图标列表
 * @returns 选中的图标名称
 */
function selectAvailableIcon(
  usedIcons: Set<string>,
  preferredIcons: string[] = []
): string {
  // 首先尝试从优先列表中选择未使用的图标
  for (const icon of preferredIcons) {
    if (!usedIcons.has(icon)) {
      return icon;
    }
  }

  // 如果优先列表中的图标都被使用，从所有可用图标中选择
  for (const icon of AVAILABLE_ELEMENT_ICONS) {
    if (!usedIcons.has(icon)) {
      return icon;
    }
  }

  // 如果所有图标都被使用，返回默认图标
  return 'Document';
}

/**
 * 智能分配图标
 * @param labelKey 菜单的 labelKey
 * @param usedIcons 当前应用（域）已使用的图标集合
 * @param existingIcon 已存在的图标（如果菜单项已指定图标，则使用该图标）
 * @returns 分配的图标名称
 */
export function assignMenuIcon(
  labelKey: string,
  usedIcons: Set<string>,
  existingIcon?: string
): string {
  // 如果已指定图标，直接使用（但需要检查是否是 SVG 图标）
  if (existingIcon) {
    // SVG 图标以 "svg:" 开头，直接返回
    if (existingIcon.startsWith('svg:')) {
      return existingIcon;
    }
    // 检查是否是有效的 Element Plus 图标
    if (AVAILABLE_ELEMENT_ICONS.includes(existingIcon as any)) {
      return existingIcon;
    }
    // 如果不是有效图标，继续智能分配
  }

  // 从 labelKey 提取关键词
  const keywords = extractKeywords(labelKey);

  // 根据关键词匹配图标
  const matchedIcons = matchIconsByKeywords(keywords);

  // 从匹配的图标中选择未使用的图标
  const selectedIcon = selectAvailableIcon(usedIcons, matchedIcons);

  return selectedIcon;
}

/**
 * 为菜单树分配图标（递归处理）
 * @param items 菜单项数组
 * @param usedIcons 当前应用（域）已使用的图标集合（会被修改）
 * @returns 分配图标后的菜单项数组
 */
export function assignIconsToMenuTree(
  items: Array<{ index: string; labelKey?: string; label?: string; icon?: string; children?: any[] }>,
  usedIcons: Set<string>
): Array<{ index: string; labelKey?: string; label?: string; icon: string; children?: any[] }> {
  return items.map(item => {
    // 确定 labelKey
    const labelKey = item.labelKey || item.label || item.index;

    // 分配图标
    const assignedIcon = assignMenuIcon(labelKey, usedIcons, item.icon);

    // 将分配的图标添加到已使用集合
    usedIcons.add(assignedIcon);

    // 递归处理子菜单
    const children = item.children && item.children.length > 0
      ? assignIconsToMenuTree(item.children, usedIcons)
      : undefined;

    const result: { index: string; labelKey?: string; label?: string; icon: string; children?: any[] } = {
      index: item.index,
      icon: assignedIcon,
    };
    if (item.labelKey) {
      result.labelKey = item.labelKey;
    }
    if (item.label) {
      result.label = item.label;
    }
    if (children) {
      result.children = children;
    }
    return result;
  });
}

