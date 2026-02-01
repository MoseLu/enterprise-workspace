import type { ImageItem } from '../btc-image-container/types';

export interface ImageDetailProps {
  imageId?: string | number;      // 图片ID（用于加载详情数据，可选）
  image?: ImageItem;               // 图片数据（如果已加载，可直接传入）
  showRelated?: boolean;          // 是否显示相关图片推荐，默认 true
}

export interface ImageDetailEmits {
  (e: 'tag-click', tag: string): void;           // 标签点击事件
  (e: 'related-click', image: ImageItem): void; // 相关图片点击事件
  (e: 'download', image: ImageItem): void;      // 下载事件
  (e: 'favorite', image: ImageItem): void;      // 收藏事件
  (e: 'share', image: ImageItem, platform: string): void; // 分享事件
}
