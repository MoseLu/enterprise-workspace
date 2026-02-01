import { logger } from '../../../utils/logger.mjs';
const fs = require('fs');
const path = require('path');

// 应用配置
const appConfigs = {
  'admin-app': {
    manifest: 'packages/shared-core/src/manifest/manifests/admin.json',
    removeKeys: ['AdminInventoryTicketPrint']
  },
  'system-app': {
    manifest: 'packages/shared-core/src/manifest/manifests/system.json',
    removeKeys: ['AdminInventoryTicketPrint']
  },
  'logistics-app': {
    manifest: 'packages/shared-core/src/manifest/manifests/logistics.json',
    removeKeys: []
  },
  'finance-app': {
    manifest: 'packages/shared-core/src/manifest/manifests/finance.json',
    removeKeys: []
  },
  'quality-app': {
    manifest: null,
    removeKeys: []
  },
  'production-app': {
    manifest: null,
    removeKeys: []
  },
  'personnel-app': {
    manifest: null,
    removeKeys: []
  },
  'operations-app': {
    manifest: null,
    removeKeys: []
  },
  'engineering-app': {
    manifest: null,
    removeKeys: []
  },
  'dashboard-app': {
    manifest: null,
    removeKeys: []
  },
  'docs-app': {
    manifest: null,
    removeKeys: []
  }
};

// 提取菜单 key 顺序
function extractMenuKeys(menus, result = []) {
  menus.forEach(menu => {
    if (menu.labelKey) result.push(menu.labelKey);
    if (menu.children) extractMenuKeys(menu.children, result);
  });
  return result;
}

// 分类 key
function categorizeKey(key, menuOrder) {
  if (key.startsWith('app.')) return { category: 1, key };
  if (key.startsWith('auth.')) return { category: 2, key };
  if (key.startsWith('common.') || key.startsWith('btc.')) return { category: 3, key };
  if (key.startsWith('menu.')) {
    const menuIndex = menuOrder.indexOf(key);
    return { category: 4, key, order: menuIndex >= 0 ? menuIndex : 9999 };
  }
  return { category: 5, key };
}

// 重新组织文件
function reorganizeLocaleFile(appName, config) {
  const localeDir = path.join(__dirname, '..', 'apps', appName, 'src', 'locales');

  // 获取菜单顺序
  let menuOrder = [];
  if (config.manifest && fs.existsSync(config.manifest)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(config.manifest, 'utf8'));
      menuOrder = extractMenuKeys(manifest.menus || []);
    } catch(e) {
      logger.error(`Error reading manifest for ${appName}:`, e.message);
    }
  }

  const results = [];

  ['zh-CN.json', 'en-US.json'].forEach(locale => {
    const filePath = path.join(localeDir, locale);
    if (!fs.existsSync(filePath)) {
      return;
    }

    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // 删除不规范 key
      config.removeKeys.forEach(key => {
        delete content[key];
      });

      // 删除中文 key
      const keys = Object.keys(content);
      const chineseKeys = keys.filter(k => /[\u4e00-\u9fa5]/.test(k));
      chineseKeys.forEach(key => {
        delete content[key];
      });

      // 重新获取 keys（删除后）
      const remainingKeys = Object.keys(content);

      // 排序
      const sorted = remainingKeys
        .map(k => categorizeKey(k, menuOrder))
        .sort((a, b) => {
          if (a.category !== b.category) return a.category - b.category;
          if (a.category === 4 && b.category === 4) return a.order - b.order;
          return a.key.localeCompare(b.key);
        })
        .map(item => item.key);

      // 构建新内容
      const newContent = {};
      sorted.forEach(k => {
        newContent[k] = content[k];
      });

      // 写入文件
      const jsonContent = JSON.stringify(newContent, null, 2) + '\n';
      fs.writeFileSync(filePath, jsonContent, 'utf8');

      results.push({
        app: appName,
        locale,
        total: sorted.length,
        removed: keys.length - sorted.length,
        chineseKeysRemoved: chineseKeys.length
      });
    } catch(e) {
      logger.error(`Error processing ${appName}/${locale}:`, e.message);
    }
  });

  return results;
}

// 主函数
const apps = process.argv.slice(2);
const targetApps = apps.length > 0 ? apps : Object.keys(appConfigs);

const allResults = [];
targetApps.forEach(appName => {
  const config = appConfigs[appName];
  if (!config) {
    logger.error(`Unknown app: ${appName}`);
    return;
  }

  const results = reorganizeLocaleFile(appName, config);
  allResults.push(...results);
});

logger.info(JSON.stringify(allResults, null, 2));
