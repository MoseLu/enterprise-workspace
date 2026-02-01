/**
 * 层级工具函数
 * 从路径提取层级信息（应用、资源类型等）
 */

/**
 * 从路径提取层级信息
 * @param {string} relativePath - 相对路径
 * @returns {object} 层级信息
 */
export function extractHierarchyInfo(relativePath) {
  const pathParts = relativePath.split(/[/\\]/).filter(p => p);
  
  let appName = null;
  let appType = null; // 'main' | 'sub' | 'package'
  let resourceCategory = null; // 'composables' | 'routes' | 'stores' | 'components' | 'utils' | 'docs' | 'icons' | 'locales'
  let moduleName = null;
  
  // 检查是否在 apps 目录下
  const appsIndex = pathParts.findIndex(p => p === 'apps');
  if (appsIndex >= 0 && appsIndex < pathParts.length - 1) {
    appName = pathParts[appsIndex + 1];
    
    // 判断应用类型
    if (appName === 'main-app') {
      appType = 'main';
    } else {
      appType = 'sub';
    }
    
    // 查找资源类型
    const srcIndex = pathParts.findIndex(p => p === 'src');
    if (srcIndex >= 0) {
      // 在 src 目录下查找资源类型
      const resourceTypes = ['composables', 'routes', 'router', 'stores', 'store', 'components', 'utils', 'services', 'modules', 'config', 'i18n', 'locales'];
      
      for (let i = srcIndex + 1; i < pathParts.length; i++) {
        const part = pathParts[i];
        
        // 检查是否是资源类型目录
        if (resourceTypes.includes(part)) {
          if (part === 'router') {
            resourceCategory = 'routes';
          } else if (part === 'store') {
            resourceCategory = 'stores';
          } else {
            resourceCategory = part;
          }
          break;
        }
        
        // 检查是否在 modules 下的子模块
        if (part === 'modules' && i < pathParts.length - 1) {
          moduleName = pathParts[i + 1];
          // 继续查找资源类型
          for (let j = i + 2; j < pathParts.length; j++) {
            if (resourceTypes.includes(pathParts[j])) {
              if (pathParts[j] === 'router') {
                resourceCategory = 'routes';
              } else if (pathParts[j] === 'store') {
                resourceCategory = 'stores';
              } else {
                resourceCategory = pathParts[j];
              }
              break;
            }
          }
          break;
        }
      }
    }
  } else {
    // 检查是否在 packages 目录下
    const packagesIndex = pathParts.findIndex(p => p === 'packages');
    if (packagesIndex >= 0 && packagesIndex < pathParts.length - 1) {
      appName = pathParts[packagesIndex + 1];
      appType = 'package';
      
      // 查找资源类型
      const resourceTypes = ['composables', 'components', 'utils', 'docs'];
      for (let i = packagesIndex + 1; i < pathParts.length; i++) {
        if (resourceTypes.includes(pathParts[i])) {
          resourceCategory = pathParts[i];
          break;
        }
      }
    } else {
      // 检查是否是文档
      const docsIndex = pathParts.findIndex(p => p === 'docs');
      if (docsIndex >= 0) {
        appType = 'package';
        appName = 'docs';
        resourceCategory = 'docs';
      }
      
      // 检查是否是图标
      const iconsIndex = pathParts.findIndex(p => p === 'icons');
      if (iconsIndex >= 0) {
        appType = 'package';
        appName = 'shared-components';
        resourceCategory = 'icons';
      }
      
      // 检查是否是国际化
      const localesIndex = pathParts.findIndex(p => p === 'locales');
      if (localesIndex >= 0) {
        resourceCategory = 'locales';
        // 尝试从路径推断应用
        if (localesIndex > 0) {
          appName = pathParts[localesIndex - 1];
          appType = pathParts.includes('apps') ? 'sub' : 'package';
        }
      }
    }
  }
  
  return {
    appName,
    appType,
    resourceCategory,
    moduleName,
  };
}

/**
 * 判断应用类型
 */
export function determineAppType(appName) {
  if (!appName) return null;
  
  if (appName === 'main-app') {
    return 'main';
  }
  
  if (appName.startsWith('shared-') || appName === 'docs') {
    return 'package';
  }
  
  return 'sub';
}
