#!/usr/bin/env node
/**
 * 生成 overview.json - 收集所有应用的菜单国际化配置
 * 在构建 shared-core 时自动执行
 */
// logger removed, use console instead

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '../../..');
const appsDir = join(rootDir, 'apps');
const outputFile = join(__dirname, '../src/manifest/manifests/overview.json');

/**
 * 从 config.ts 文件中提取菜单国际化配置
 */
async function extractMenuI18nFromConfig(configPath) {
  try {
    // 先尝试直接导入配置
    try {
      const configUrl = `file://${configPath}`;
      const configModule = await import(configUrl);
      const config = configModule.default;

      if (!config || !config.locale) {
        return null;
      }

      const locale = config.locale;
      const menuI18n = {
        'zh-CN': {},
        'en-US': {},
      };

      // 提取所有以 menu. 开头的 key
      if (locale['zh-CN']) {
        Object.keys(locale['zh-CN']).forEach((key) => {
          if (key.startsWith('menu.')) {
            menuI18n['zh-CN'][key] = locale['zh-CN'][key];
          }
        });
      }

      if (locale['en-US']) {
        Object.keys(locale['en-US']).forEach((key) => {
          if (key.startsWith('menu.')) {
            menuI18n['en-US'][key] = locale['en-US'][key];
          }
        });
      }

      // 如果没有任何菜单配置，返回 null
      if (Object.keys(menuI18n['zh-CN']).length === 0 && Object.keys(menuI18n['en-US']).length === 0) {
        return null;
      }

      return menuI18n;
    } catch (importError) {
      // 如果导入失败（可能是因为依赖问题），尝试读取源文件并解析
      const sourceCode = readFileSync(configPath, 'utf-8');
      
      // 尝试提取 locale 对象中的菜单配置
      // 查找 locale: { 'zh-CN': { ... }, 'en-US': { ... } } 结构
      const menuI18n = {
        'zh-CN': {},
        'en-US': {},
      };
      
      // 使用正则表达式提取菜单配置
      // 匹配 'menu.xxx': 'yyy' 或 "menu.xxx": "yyy" 的模式（支持单引号和双引号）
      // 注意：需要处理多行和嵌套对象的情况
      const menuKeyPattern = /['"](menu\.[^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g;
      let match;
      
      // 提取中文配置（在 'zh-CN' 块中）
      // 使用更宽松的匹配，处理嵌套对象和注释
      const zhCNRegex = /'zh-CN'\s*:\s*\{([\s\S]*?)\}(?=\s*[,}])/;
      const zhCNMatch = sourceCode.match(zhCNRegex);
      if (zhCNMatch) {
        const zhCNContent = zhCNMatch[1];
        // 移除注释
        const cleanContent = zhCNContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        menuKeyPattern.lastIndex = 0;
        while ((match = menuKeyPattern.exec(cleanContent)) !== null) {
          const key = match[1];
          const value = match[2];
          if (key.startsWith('menu.')) {
            menuI18n['zh-CN'][key] = value;
          }
        }
      }
      
      // 提取英文配置（在 'en-US' 块中）
      const enUSRegex = /'en-US'\s*:\s*\{([\s\S]*?)\}(?=\s*[,}])/;
      const enUSMatch = sourceCode.match(enUSRegex);
      if (enUSMatch) {
        const enUSContent = enUSMatch[1];
        // 移除注释
        const cleanContent = enUSContent.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        menuKeyPattern.lastIndex = 0; // 重置正则
        while ((match = menuKeyPattern.exec(cleanContent)) !== null) {
          const key = match[1];
          const value = match[2];
          if (key.startsWith('menu.')) {
            menuI18n['en-US'][key] = value;
          }
        }
      }
      
      // 如果没有任何菜单配置，返回 null
      if (Object.keys(menuI18n['zh-CN']).length === 0 && Object.keys(menuI18n['en-US']).length === 0) {
        return null;
      }
      
      return menuI18n;
    }
  } catch (error) {
    console.warn(`[generate-overview-i18n] ⚠️  无法读取配置文件 ${configPath}:`, error.message);
    return null;
  }
}

/**
 * 收集所有应用的菜单国际化配置
 * 所有菜单配置都在模块级 config.ts 中定义
 */
async function collectOverviewI18n() {
  const overviewI18n = {
    'zh-CN': {},
    'en-US': {},
  };

  const appDirs = readdirSync(appsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name.endsWith('-app'))
    .map((dirent) => dirent.name)
    .sort();

  console.info('[generate-overview-i18n] 开始收集菜单国际化配置...');

  /**
   * 递归查找所有 config.ts 文件
   */
  function findConfigFiles(dir, fileList = []) {
    const files = readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = join(dir, file.name);
      
      if (file.isDirectory()) {
        findConfigFiles(filePath, fileList);
      } else if (file.isFile() && file.name === 'config.ts') {
        fileList.push(filePath);
      }
    }
    
    return fileList;
  }

  for (const appDir of appDirs) {
    // 处理模块级配置（src/modules/**/config.ts）
    const modulesPath = join(appsDir, appDir, 'src', 'modules');
    
    if (!existsSync(modulesPath)) {
      continue;
    }
    
    // 查找所有 modules/**/config.ts 文件
    const configFiles = findConfigFiles(modulesPath);

    if (configFiles.length === 0) {
      continue;
    }

    console.info(`[generate-overview-i18n] 处理应用 ${appDir}，找到 ${configFiles.length} 个模块配置`);

    for (const configFile of configFiles) {
      const menuI18n = await extractMenuI18nFromConfig(configFile);
      
      if (menuI18n) {
        // 合并到总配置中
        Object.assign(overviewI18n['zh-CN'], menuI18n['zh-CN']);
        Object.assign(overviewI18n['en-US'], menuI18n['en-US']);
      }
    }
  }

  // 生成 overview.json
  const output = {
    i18n: overviewI18n,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  
  const zhCNCount = Object.keys(overviewI18n['zh-CN']).length;
  const enUSCount = Object.keys(overviewI18n['en-US']).length;
  
  console.info(`[generate-overview-i18n] ✅ 已生成 overview.json`);
  console.info(`[generate-overview-i18n] 📊 统计: 中文菜单 key ${zhCNCount} 个，英文菜单 key ${enUSCount} 个`);
  console.info(`[generate-overview-i18n] 📁 输出文件: ${outputFile}`);
}

collectOverviewI18n().catch((error) => {
  console.error(`[generate-overview-i18n] ❌ 执行失败:`, error);
  process.exit(1);
});
