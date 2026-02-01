/**
 * 系统基础信息配置
 */

import { systemSettingConfig } from './settings';

export const appConfig = {
  // 系统名称（使用国际化 key）
  nameKey: 'common.system.btc_shop_management',

  // 系统简称
  shortName: 'BTC ShopFlow',

  // 系统英文名
  enName: 'BTC Shop Flow Management System',

  // 系统版本
  version: '1.0.0',

  // Logo 路径（同时用作 favicon）
  logo: '/logo.png',

  // 公司/组织信息
  company: {
    name: 'BTC',
    fullName: 'BTC Technology',
    fullNameCnKey: 'common.system.bellis',
    fullNameEn: 'Bellis Technology',
    website: 'https://www.btc.com',
    // Slogan 使用国际化键
    sloganKey: 'app.slogan',
  },

  // Copyright 信息
  copyright: {
    year: new Date().getFullYear(),
    text: `© ${new Date().getFullYear()} BTC. All rights reserved.`,
  },

  // 联系方式
  contact: {
    email: 'support@btc.com',
    phone: '400-123-4567',
    addressKey: 'common.system.address',
  },

  // 加载页面文案（使用国际化 key）
  loading: {
    titleKey: 'common.system.loading_resources',
    subTitleKey: 'common.system.loading_resources_subtitle',
  },

  // 路由配置
  router: {
    // 路由模式：'hash' | 'history'
    mode: 'history',
    // 页面切换动画
    transition: 'slide',
  },

  // 布局配置
  layout: {
    // 侧边栏宽度
    sidebarWidth: 210,
    // 侧边栏折叠宽度
    sidebarCollapseWidth: 64,
    // 顶栏高度
    topbarHeight: 48,
    // 标签栏高度
    tabbarHeight: 39,
  },

  // 系统设置默认值（从子配置导入）
  systemSetting: systemSettingConfig,
};

export default appConfig;

