/**
 * 资源提取器
 * 从各种资源文件中提取元数据和内容
 */

import { readFileSync } from 'fs';
import { logger } from '../utils/logger.mjs';

// Babel 解析器缓存
let babelParser = null;
let babelTraverse = null;

/**
 * 获取 Babel 解析器（动态导入）
 */
async function getBabelParser() {
  if (!babelParser) {
    try {
      babelParser = await import('@babel/parser');
      babelTraverse = await import('@babel/traverse');
    } catch (error) {
      logger.warn('Babel parser not available, using simple extraction');
      return null;
    }
  }
  return { parse: babelParser.parse, traverse: babelTraverse.default };
}

/**
 * 提取 Composable 资源（简化版，不使用 Babel）
 */
function extractComposableSimple(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 使用正则提取 export function
    const functionMatches = content.matchAll(/export\s+(?:function|const)\s+(\w+)\s*[=(]/g);
    const composables = [];
    
    for (const match of functionMatches) {
      const name = match[1];
      composables.push({ name, params: [], description: '' });
    }
    
    // 提取注释
    const commentMatches = content.matchAll(/\/\*\*([\s\S]*?)\*\//g);
    const comments = Array.from(commentMatches).map(m => m[1].trim());
    
    return {
      type: 'composable',
      composables,
      imports: [],
      content,
    };
  } catch (error) {
    logger.warn(`Failed to extract composable from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取 Composable 资源
 */
export async function extractComposable(filePath) {
  try {
    const babel = await getBabelParser();
    
    if (!babel) {
      // 如果没有 Babel，使用简单的正则提取
      return extractComposableSimple(filePath);
    }

    const { parse, traverse } = babel;
    const content = readFileSync(filePath, 'utf-8');
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'decorators-legacy'],
    });

    const composables = [];
    const imports = [];

    traverse(ast, {
      // 提取 export function
      ExportNamedDeclaration(path) {
        if (path.node.declaration?.type === 'FunctionDeclaration') {
          const func = path.node.declaration;
          const name = func.id?.name;
          const params = func.params.map((p) => {
            if (p.type === 'Identifier') return p.name;
            if (p.type === 'ObjectPattern') return 'object';
            return 'unknown';
          });

          // 提取注释
          const comments = func.leadingComments?.map((c) => c.value.trim()) || [];
          const description = comments.find((c) => !c.startsWith('@')) || '';

          composables.push({
            name,
            params,
            description,
            comments,
          });
        }
      },
      // 提取 import
      ImportDeclaration(path) {
        imports.push({
          from: path.node.source.value,
          specifiers: path.node.specifiers.map((s) => ({
            local: s.local.name,
            imported: s.imported?.name || 'default',
          })),
        });
      },
    });

    return {
      type: 'composable',
      composables,
      imports,
      content,
    };
  } catch (error) {
    logger.warn(`Failed to extract composable from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取组件资源
 */
export function extractComponent(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // 提取 Vue 组件信息
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
    const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);

    // 提取组件名
    const nameMatch = content.match(/export\s+default\s+defineComponent\(/);
    const componentName = filePath.split('/').pop().replace('.vue', '');

    // 提取 Props（简化版）
    const propsMatch = scriptMatch?.[1]?.match(/defineProps<([^>]+)>/);
    const props = propsMatch ? propsMatch[1].split(',').map((p) => p.trim()) : [];

    // 提取注释
    const comments = content.match(/\/\*\*([\s\S]*?)\*\//g) || [];

    return {
      type: 'component',
      name: componentName,
      props,
      hasTemplate: !!templateMatch,
      comments: comments.map((c) => c.replace(/\/\*\*|\*\//g, '').trim()),
      content: scriptMatch?.[1] || '',
    };
  } catch (error) {
    logger.warn(`Failed to extract component from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取图标资源
 */
export function extractIcon(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const fileName = filePath.split('/').pop().replace('.svg', '');

    // 从路径提取分类
    const categoryMatch = filePath.match(/icons\/([^/]+)\//);
    const category = categoryMatch ? categoryMatch[1] : 'misc';

    // 提取 SVG 内容的关键信息
    const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
    const paths = content.match(/<path[^>]+>/g) || [];

    return {
      type: 'icon',
      name: fileName,
      category,
      viewBox: viewBoxMatch?.[1] || '',
      pathCount: paths.length,
      content,
    };
  } catch (error) {
    logger.warn(`Failed to extract icon from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取国际化资源
 */
export function extractLocale(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const localeData = JSON.parse(content);

    // 从路径提取语言
    const langMatch = filePath.match(/\/(zh-CN|en-US|zh|en)\.json$/);
    const language = langMatch ? langMatch[1] : 'unknown';

    // 提取所有键
    const keys = Object.keys(localeData);
    const nestedKeys = extractNestedKeys(localeData);

    return {
      type: 'locale',
      language,
      keys,
      nestedKeys,
      keyCount: keys.length,
      content: JSON.stringify(localeData, null, 2),
    };
  } catch (error) {
    logger.warn(`Failed to extract locale from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取 Skill 资源
 */
export function extractSkill(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // 提取 frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    let metadata = {};
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
      const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
      metadata = {
        name: nameMatch ? nameMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
      };
    }

    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // 提取使用场景
    const scenariosMatch = content.match(/##\s+使用场景\s*\n([\s\S]*?)(?=\n##|$)/);
    const scenarios = scenariosMatch ? scenariosMatch[1].trim() : '';

    return {
      type: 'skill',
      name: metadata.name || title,
      description: metadata.description || '',
      scenarios,
      content,
    };
  } catch (error) {
    logger.warn(`Failed to extract skill from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取工具函数资源（简化版）
 */
function extractUtilitySimple(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const functionMatches = content.matchAll(/export\s+(?:function|const)\s+(\w+)/g);
    const functions = [];
    
    for (const match of functionMatches) {
      functions.push({ name: match[1], params: 0 });
    }
    
    return { type: 'utility', functions, content };
  } catch (error) {
    logger.warn(`Failed to extract utility from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取工具函数资源
 */
export async function extractUtility(filePath) {
  try {
    const babel = await getBabelParser();
    
    if (!babel) {
      return extractUtilitySimple(filePath);
    }

    const { parse, traverse } = babel;
    const content = readFileSync(filePath, 'utf-8');
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript'],
    });

    const functions = [];

    traverse(ast, {
      ExportNamedDeclaration(path) {
        if (path.node.declaration?.type === 'FunctionDeclaration') {
          const func = path.node.declaration;
          functions.push({
            name: func.id?.name,
            params: func.params.length,
          });
        }
      },
    });

    return {
      type: 'utility',
      functions,
      content,
    };
  } catch (error) {
    logger.warn(`Failed to extract utility from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取嵌套键（用于国际化）
 */
function extractNestedKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.push(fullKey);
    if (typeof value === 'object' && value !== null) {
      keys.push(...extractNestedKeys(value, fullKey));
    }
  }
  return keys;
}

/**
 * 提取路由配置资源（简化版，使用正则）
 */
export function extractRoutes(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 从路径提取应用名
    const pathParts = filePath.split(/[/\\]/);
    const appIndex = pathParts.findIndex(p => p === 'apps');
    const appName = appIndex >= 0 && appIndex < pathParts.length - 1 
      ? pathParts[appIndex + 1] 
      : 'unknown';
    
    // 提取路由路径（简化：查找 path: 字符串）
    const pathMatches = content.matchAll(/path:\s*['"`]([^'"`]+)['"`]/g);
    const routes = [];
    for (const match of pathMatches) {
      routes.push({ path: match[1] });
    }
    
    // 提取路由名称
    const nameMatches = content.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g);
    const routeNames = Array.from(nameMatches).map(m => m[1]);
    
    // 提取组件引用
    const componentMatches = content.matchAll(/component:\s*['"`]([^'"`]+)['"`]/g);
    const components = Array.from(componentMatches).map(m => m[1]);
    
    // 提取路由元数据（meta）
    const metaMatches = content.matchAll(/meta:\s*\{([^}]+)\}/g);
    const metaInfo = Array.from(metaMatches).map(m => m[1]);
    
    // 检查是否有路由守卫
    const hasGuards = content.includes('beforeEnter') || 
                      content.includes('beforeEach') || 
                      content.includes('beforeResolve');
    
    return {
      type: 'routes',
      appName,
      routes: routes.slice(0, 50), // 限制数量
      routeNames,
      components,
      metaInfo,
      hasGuards,
      routeCount: routes.length,
      content: content.substring(0, 5000), // 限制内容长度
    };
  } catch (error) {
    logger.warn(`Failed to extract routes from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取状态管理资源（简化版，使用正则）
 */
export function extractStores(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 从路径提取应用名
    const pathParts = filePath.split(/[/\\]/);
    const appIndex = pathParts.findIndex(p => p === 'apps');
    const appName = appIndex >= 0 && appIndex < pathParts.length - 1 
      ? pathParts[appIndex + 1] 
      : 'unknown';
    
    // 提取 store 名称（从文件名或 export 推断）
    const fileName = pathParts[pathParts.length - 1].replace('.ts', '');
    
    // 提取 state 字段
    const stateMatches = content.matchAll(/state\s*[=:]\s*\{([^}]+)\}/g);
    const stateFields = [];
    for (const match of stateMatches) {
      const stateContent = match[1];
      const fieldMatches = stateContent.matchAll(/(\w+)\s*:/g);
      for (const fieldMatch of fieldMatches) {
        stateFields.push(fieldMatch[1]);
      }
    }
    
    // 提取 actions
    const actionMatches = content.matchAll(/(?:actions|actions:)\s*\{([^}]+)\}/g);
    const actions = [];
    for (const match of actionMatches) {
      const actionContent = match[1];
      const funcMatches = actionContent.matchAll(/(\w+)\s*[=:]\s*(?:async\s+)?\(/g);
      for (const funcMatch of funcMatches) {
        actions.push(funcMatch[1]);
      }
    }
    
    // 提取 getters
    const getterMatches = content.matchAll(/(?:getters|getters:)\s*\{([^}]+)\}/g);
    const getters = [];
    for (const match of getterMatches) {
      const getterContent = match[1];
      const funcMatches = getterContent.matchAll(/(\w+)\s*[=:]\s*\(/g);
      for (const funcMatch of funcMatches) {
        getters.push(funcMatch[1]);
      }
    }
    
    // 检查是否有 modules
    const hasModules = content.includes('modules:') || content.includes('modules =');
    
    return {
      type: 'stores',
      appName,
      storeName: fileName,
      stateFields: [...new Set(stateFields)].slice(0, 20),
      actions: [...new Set(actions)].slice(0, 20),
      getters: [...new Set(getters)].slice(0, 20),
      hasModules,
      content: content.substring(0, 5000), // 限制内容长度
    };
  } catch (error) {
    logger.warn(`Failed to extract stores from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 提取文档资源（简化版，使用正则）
 */
export function extractDocs(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // 提取标题
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';
    
    // 提取所有标题（章节）
    const headingMatches = content.matchAll(/^#{1,3}\s+(.+)$/gm);
    const headings = Array.from(headingMatches).map(m => m[1].trim());
    
    // 提取代码块
    const codeBlockMatches = content.matchAll(/```(\w+)?\n([\s\S]*?)```/g);
    const codeBlocks = Array.from(codeBlockMatches).map(m => ({
      language: m[1] || 'text',
      content: m[2].substring(0, 200), // 限制长度
    }));
    
    // 提取关键概念（从标题和粗体文本推断）
    const boldMatches = content.matchAll(/\*\*([^*]+)\*\*/g);
    const concepts = [...new Set(Array.from(boldMatches).map(m => m[1].trim()))].slice(0, 20);
    
    // 从路径提取分类
    const pathParts = filePath.split(/[/\\]/);
    const docsIndex = pathParts.findIndex(p => p === 'docs');
    const category = docsIndex >= 0 && docsIndex < pathParts.length - 1 
      ? pathParts[docsIndex + 1] 
      : 'general';
    
    return {
      type: 'docs',
      title: title || pathParts[pathParts.length - 1].replace('.md', ''),
      category,
      headings: headings.slice(0, 30),
      codeBlocks: codeBlocks.slice(0, 10),
      concepts,
      content: content.substring(0, 10000), // 限制内容长度
    };
  } catch (error) {
    logger.warn(`Failed to extract docs from ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 根据资源类型提取
 */
export async function extractResource(resource) {
  const { type, path } = resource;

  switch (type) {
    case 'composable':
      return await extractComposable(path);
    case 'component':
      return extractComponent(path);
    case 'icon':
      return extractIcon(path);
    case 'locale':
      return extractLocale(path);
    case 'skill':
      return extractSkill(path);
    case 'utility':
      return await extractUtility(path);
    case 'routes':
      return extractRoutes(path);
    case 'stores':
      return extractStores(path);
    case 'docs':
      return extractDocs(path);
    default:
      logger.warn(`Unknown resource type: ${type}`);
      return null;
  }
}
