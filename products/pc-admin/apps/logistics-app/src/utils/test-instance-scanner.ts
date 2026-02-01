import { logger } from '@btc/shared-core';
;
/**
 * 测试实例扫描器
 * 自动扫描 test 目录下的所有测试实例
 */

export interface TestInstanceConfig {
  name: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  path: string;
}

/**
 * 测试实例配置映射
 * 每个测试实例都需要在这里注册配置信息
 */
export const TEST_INSTANCE_CONFIGS: Record<string, TestInstanceConfig> = {
  crud: {
    name: 'crud',
    title: 'CRUD 组件测试',
    description: '测试完整的 CRUD 组件系统，包含表格、表单、分页等功能',
    icon: 'Grid',
    tags: ['CRUD', '表格', '表单', '分页'],
    path: '/test/crud'
  },
  i18n: {
    name: 'i18n',
    title: '国际化测试',
    description: '测试国际化功能和语言切换',
    icon: 'ChatDotRound',
    tags: ['国际化', 'i18n', '语言切换', '多语言'],
    path: '/test/i18n'
  },
  'message-notification': {
    name: 'message-notification',
    title: '消息通知测试',
    description: '测试 BtcMessage 和 BtcNotification 组件',
    icon: 'Message',
    tags: ['消息', '通知', 'BtcMessage', 'BtcNotification'],
    path: '/test/message-notification'
  },
  'select-button': {
    name: 'select-button',
    title: '选择按钮测试',
    description: '测试 BtcSelectButton 选择按钮组件',
    icon: 'Select',
    tags: ['选择按钮', 'BtcSelectButton', '状态切换', '按钮'],
    path: '/test/select-button'
  },
  'svg-plugin': {
    name: 'svg-plugin',
    title: 'SVG 插件测试',
    description: '测试 BtcSvg 图标组件和 SVG 插件功能',
    icon: 'Picture',
    tags: ['SVG', '图标', 'BtcSvg', '插件'],
    path: '/test/svg-plugin'
  },
  'btc-tabs': {
    name: 'btc-tabs',
    title: 'BtcTabs 组件测试',
    description: '测试 BtcTabs 标签页组件，包含 tab-ink 动画效果',
    icon: 'Document',
    tags: ['BtcTabs', '标签页', 'tab-ink', '动画'],
    path: '/test/btc-tabs'
  },
  'import-demo': {
    name: 'import-demo',
    title: '导入组件测试',
    description: '测试 BtcImportBtn 导入按钮组件，包含文件上传、数据解析、批量导入等功能',
    icon: 'Upload',
    tags: ['导入', 'BtcImportBtn', '文件上传', 'Excel'],
    path: '/test/import-demo'
  },
  'btc-code-json': {
    name: 'btc-code-json',
    title: 'JSON 代码组件测试',
    description: '测试 BtcCodeJson 组件，支持弹窗和直接显示两种模式，用于展示 JSON 数据',
    icon: 'Document',
    tags: ['JSON', 'BtcCodeJson', '弹窗', '代码显示'],
    path: '/test/btc-code-json'
  }
};

/**
 * 动态导入测试实例组件
 */
export async function loadTestInstanceComponent(instanceName: string) {
  try {
    const module = await import(`../pages/test/${instanceName}/index.vue`);
    return module.default;
  } catch (error) {
    logger.error(`Failed to load test instance: ${instanceName}`, error);
    throw error;
  }
}

/**
 * 获取所有测试实例配置
 */
export function getAllTestInstanceConfigs(): TestInstanceConfig[] {
  return Object.values(TEST_INSTANCE_CONFIGS);
}

/**
 * 根据名称获取测试实例配置
 */
export function getTestInstanceConfig(name: string): TestInstanceConfig | undefined {
  return TEST_INSTANCE_CONFIGS[name];
}

/**
 * 检查测试实例是否存在
 */
export function hasTestInstance(name: string): boolean {
  return name in TEST_INSTANCE_CONFIGS;
}

/**
 * 添加新的测试实例配置
 * 当创建新的测试实例时，需要调用此函数注册配置
 */
export function registerTestInstance(config: TestInstanceConfig): void {
  TEST_INSTANCE_CONFIGS[config.name] = config;
}

/**
 * 移除测试实例配置
 */
export function unregisterTestInstance(name: string): void {
  delete TEST_INSTANCE_CONFIGS[name];
}
