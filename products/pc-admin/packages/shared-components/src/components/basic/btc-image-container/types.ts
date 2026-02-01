import type { FilterCategory } from '../../data/btc-filter-list/types';

export interface ImageItem {
  id: string | number;
  src: string;                    // 图片地址
  alt?: string;                   // 图片描述
  title?: string;                 // 图片标题
  tags?: string[];                // 标签数组
  downloads?: number;             // 下载数
  favorites?: number;             // 收藏数
  resolution?: string;            // 分辨率（如 "2358x1740"）
  fileSize?: string;              // 文件大小（如 "585 KB"）
  category?: string;              // 分类（如 "自然｜风景"）
  colorScheme?: string;           // 色系（如 "偏蓝"）
  publishDate?: string;           // 发布时间
  link?: string;                  // 点击链接
  // 图表图片相关参数（用于详情页展示）
  chartType?: string;             // 图表类型（如 "line", "bar", "pie"）
  chartConfig?: Record<string, any>; // 图表配置参数
  dataSource?: string;            // 数据源
  dataRange?: string;             // 数据时间范围
  [key: string]: any;            // 允许扩展其他参数
}

export interface BtcImageContainerProps {
  items: ImageItem[];            // 图片数据数组
  columns?: number;               // 列数，默认 3
  gap?: number | string;          // 间距，默认 16px
  cardMinHeight?: number;        // 卡片最小高度
  filterCategories?: FilterCategory[]; // 筛选分类配置
  enableFilter?: boolean;        // 是否启用筛选功能（默认 true）
  filterStickyTop?: number | string; // 粘性定位的 top 值（默认 0）
}
