import { logger } from '../../../utils/logger.mjs';
const fs = require('fs');
const path = require('path');

// 菜单顺序（根据 manifest 文件）
const menuOrder = [
  'menu.platform',
  'menu.platform.domains',
  'menu.platform.modules',
  'menu.platform.plugins',
  'menu.org',
  'menu.org.tenants',
  'menu.org.departments',
  'menu.org.users',
  'menu.org.dept_role_bind',
  'menu.access',
  'menu.access.config',
  'menu.access.resources',
  'menu.access.actions',
  'menu.access.permissions',
  'menu.access.roles',
  'menu.access.role_perm_bind',
  'menu.access.relations',
  'menu.access.perm_compose',
  'menu.access.user_assign',
  'menu.access.user_role_bind',
  'menu.access.role_assign',
  'menu.access.role_permission_bind',
  'menu.navigation',
  'menu.navigation.menus',
  'menu.navigation.menu_perm_bind',
  'menu.navigation.menu_preview',
  'menu.ops',
  'menu.ops.logs',
  'menu.ops.operation_log',
  'menu.ops.request_log',
  'menu.ops.api_list',
  'menu.ops.baseline',
  'menu.ops.simulator',
  'menu.strategy',
  'menu.strategy.management',
  'menu.strategy.designer',
  'menu.strategy.monitor',
  'menu.governance',
  'menu.data.files',
  'menu.data.files.templates',
  'menu.data.dictionary',
  'menu.data.dictionary.fields',
  'menu.data.dictionary.values',
  'menu.test_features',
  'menu.test_features.components',
  'menu.test_features.api_test_center',
  'menu.test_features.inventory_ticket_print',
];

// 分类函数
function categorizeKey(key) {
  if (key.startsWith('app.')) return { category: 1, key };
  if (key.startsWith('auth.')) return { category: 2, key };
  if (key.startsWith('common.') || key.startsWith('btc.')) return { category: 3, key };
  if (key.startsWith('menu.')) {
    const menuIndex = menuOrder.indexOf(key);
    return { category: 4, key, order: menuIndex >= 0 ? menuIndex : 9999 };
  }
  // 业务模块
  return { category: 5, key };
}

// 排序函数
function sortKeys(keys) {
  return keys.map(categorizeKey).sort((a, b) => {
    if (a.category !== b.category) return a.category - b.category;
    if (a.category === 4 && b.category === 4) {
      return a.order - b.order;
    }
    return a.key.localeCompare(b.key);
  }).map(item => item.key);
}

// 重新组织文件
function reorganizeLocaleFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // 删除不规范 key
  delete content['AdminInventoryTicketPrint'];

  const keys = Object.keys(content);
  const sortedKeys = sortKeys(keys);

  const newContent = {};
  sortedKeys.forEach(key => {
    newContent[key] = content[key];
  });

  const jsonContent = JSON.stringify(newContent, null, 2) + '\n';
  fs.writeFileSync(filePath, jsonContent, 'utf8');

  return {
    total: sortedKeys.length,
    removed: keys.length - sortedKeys.length
  };
}

// 主函数
const app = process.argv[2] || 'admin-app';
const localeDir = path.join(__dirname, '..', 'apps', app, 'src', 'locales');

['zh-CN.json', 'en-US.json'].forEach(locale => {
  const filePath = path.join(localeDir, locale);
  if (fs.existsSync(filePath)) {
    const result = reorganizeLocaleFile(filePath);
    logger.info(`${locale}: ${result.total} keys, removed ${result.removed} invalid keys`);
  }
});
