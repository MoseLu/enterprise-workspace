// logger removed, use console instead
import { readdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '../../..');
const appsDir = join(rootDir, 'apps');
const outputFile = join(__dirname, '../src/configs/app-configs-collected.ts');

/**
 * 收集所有应用配置
 * 在构建时读取应用配置文件并内联为 JSON，避免运行时动态导入
 */
async function collectAppConfigs() {
  const appConfigs = [];
  const errors = [];

  try {
    const appDirs = readdirSync(appsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.endsWith('-app'))
      .map(dirent => dirent.name)
      .sort();

    for (const appDir of appDirs) {
      const appConfigPath = join(appsDir, appDir, 'src', 'app.ts');
      
      if (!existsSync(appConfigPath)) {
        console.warn(`[collect-app-configs] ⚠️  应用 ${appDir} 的配置文件不存在: ${appConfigPath}`);
        continue;
      }

      try {
        let appConfig = null;

        // 首先尝试直接导入应用配置
        try {
          const configUrl = `file://${appConfigPath}`;
          const appConfigModule = await import(configUrl);
          appConfig = appConfigModule.default;

          if (!appConfig) {
            throw new Error('应用配置的 default 导出不存在');
          }
        } catch (importError) {
          // 如果导入失败（可能是因为依赖问题），尝试读取源文件并解析
          console.warn(`[collect-app-configs] ⚠️  应用 ${appDir} 配置导入失败，尝试读取源文件:`, importError.message);
          
          const sourceCode = readFileSync(appConfigPath, 'utf-8');
          
          // 尝试提取配置对象：查找 const xxxAppIdentity: AppIdentity = { ... };
          const configMatch = sourceCode.match(/const\s+\w+AppIdentity\s*:\s*AppIdentity\s*=\s*({[\s\S]*?});/);
          
          if (configMatch) {
            try {
              // 尝试解析配置对象
              // 注意：这里需要处理 t() 函数调用，将其替换为占位符或原始字符串
              let configStr = configMatch[1];
              
              // 替换 t('xxx') 为 'xxx'（保留 i18n key）
              configStr = configStr.replace(/t\(['"]([^'"]+)['"]\)/g, "'$1'");
              
              // 尝试解析为对象
              appConfig = eval(`(${configStr})`);
            } catch (parseError) {
              throw new Error(`无法解析配置对象: ${parseError.message}`);
            }
          } else {
            throw new Error('无法在源文件中找到配置对象');
          }
        }

        // 计算相对路径（用于生成文件路径键）
        const relativePath = appConfigPath
          .replace(rootDir, '')
          .replace(/\\/g, '/')
          .replace(/^\//, '');

        // 序列化为 JSON 字符串，确保特殊字符被正确转义
        const configJson = JSON.stringify(appConfig, null, 2);

        appConfigs.push({
          appDir,
          configPath: appConfigPath,
          relativePath,
          configJson,
        });
        console.info(`[collect-app-configs] ✓ 成功收集应用配置: ${appDir}`);
      } catch (error) {
        const errorMsg = error.message || String(error);
        errors.push({ appDir, error: errorMsg });
        console.error(`[collect-app-configs] ❌ 收集应用 ${appDir} 配置失败:`, errorMsg);
      }
    }
  } catch (error) {
    console.error(`[collect-app-configs] ❌ 扫描应用目录失败:`, error.message);
    process.exit(1);
  }

  // 生成 TypeScript 文件，内联所有应用配置为 JSON 字符串
  const configEntries = appConfigs.map(({ relativePath, configJson }) => {
    // JSON 字符串需要被包裹在引号中，并转义内部的引号和反斜杠
    // 使用 JSON.stringify 再次序列化，确保字符串被正确转义
    const escapedJsonString = JSON.stringify(configJson);
    return `    '../../../${relativePath}': ${escapedJsonString},`;
  }).join('\n');

  const output = `// @ts-nocheck
/**
 * 此文件由 scripts/collect-app-configs.mjs 自动生成
 * 请勿手动编辑此文件
 * 
 * 生成时间: ${new Date().toISOString()}
 * 
 * 此文件包含所有应用配置的内联 JSON 数据，避免运行时动态导入
 */

import type { AppIdentity } from './app-identity.types';

/**
 * 所有应用配置的映射（内联 JSON 字符串）
 * 键为应用配置文件路径（相对于项目根目录），值为 JSON 字符串
 * 
 * 注意：这些是 JSON 字符串，需要在 app-scanner.ts 中解析
 */
export const appConfigsJsonMap: Record<string, string> = {
${configEntries}
};

/**
 * 解析后的应用配置映射
 * 在模块加载时自动解析 JSON 字符串
 */
export const appConfigsMap: Record<string, AppIdentity> = Object.fromEntries(
  Object.entries(appConfigsJsonMap).map(([path, jsonStr]) => [
    path,
    JSON.parse(jsonStr) as AppIdentity,
  ])
);
`;

  writeFileSync(outputFile, output, 'utf-8');
  console.info(`[collect-app-configs] ✅ 已生成应用配置文件: ${outputFile}`);
  console.info(`[collect-app-configs] 📊 统计: 成功收集 ${appConfigs.length} 个应用配置`);

  if (errors.length > 0) {
    console.warn(`[collect-app-configs] ⚠️  以下应用配置收集失败:`);
    errors.forEach(({ appDir, error }) => {
      console.warn(`  - ${appDir}: ${error}`);
    });
  }
}

collectAppConfigs().catch(error => {
  console.error(`[collect-app-configs] ❌ 执行失败:`, error);
  process.exit(1);
});
