/**
 * btc-filter-list 组件类型定义
 */

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

export interface FilterResult {
  name: string; // 分类的 id
  value: any[]; // 选中的选项值数组
}

export type BtcFilterListSize = 'large' | 'small' | 'default';

export interface BtcFilterListProps {
  // 数据来源：EPS 服务或直接数据
  service?: {
    list: (params?: any) => Promise<FilterCategory[]>;
  };
  category?: FilterCategory[];
  
  // 其他配置
  title?: string;
  enableSearch?: boolean;
  defaultExpandedCount?: number; // 默认展开的分类数量
  multiple?: boolean; // 是否支持多选（默认 true）
  size?: BtcFilterListSize; // 组件尺寸：large（450px）、small（200px）、default（当前宽度）
  storageKey?: string; // 存储 key，用于区分不同页面的尺寸设置（如果不提供，则不存储）
  showTagsContainer?: boolean; // 是否显示标签容器，默认 true
  optionWrap?: boolean; // 是否允许选项换行，默认 true（当容器宽度较小时，可设置为 false 避免选项竖排）
}

export interface BtcFilterListEmits {
  change: [result: FilterResult[]];
  'update:modelValue': [result: FilterResult[]];
  'update:size': [size: BtcFilterListSize];
}

export interface CategoryTagRow {
  categoryId: string;
  categoryName: string;
  tags: Array<{
    optionValue: any;
    optionLabel: string;
  }>;
  visibleTags: Array<{
    optionValue: any;
    optionLabel: string;
  }>;
  overflowCount: number;
  overflowTags: Array<{
    optionValue: any;
    optionLabel: string;
  }>;
}

export type BtcTagType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink' | 'cyan' | 'teal' | 'indigo' | 'orange' | 'brown' | 'gray' | 'lime' | 'olive' | 'navy' | 'maroon';
