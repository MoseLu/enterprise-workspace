/**
 * Vue → React 迁移 SubAgent
 *
 * 用于将 pc-admin 的 Vue3 应用迁移到 react-admin
 *
 * @version 2.0.0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 分析源应用结构
 */
export function analyzeSourceApp(sourcePath) {
  const analysis = {
    vueFiles: [],
    views: [],
    components: [],
    modules: [],
    routerFile: null,
    storeFiles: [],
    styleFiles: [],
    assets: [],
    totalLines: 0,
    complexity: 'simple',
  };

  if (!fs.existsSync(sourcePath)) {
    return analysis;
  }

  // 递归扫描目录
  function scanDir(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (['node_modules', 'dist', 'build', '.git', '.idea', '__pycache__'].includes(item)) {
          continue;
        }
        scanDir(fullPath);
      } else {
        const ext = path.extname(item);
        const relativePath = path.relative(sourcePath, fullPath);

        if (ext === '.vue') {
          analysis.vueFiles.push({
            path: relativePath,
            lines: countLines(fullPath),
          });
          analysis.totalLines += stat.size;

          if (relativePath.includes('/views/') || relativePath.includes('\\views\\')) {
            analysis.views.push(relativePath);
          } else if (relativePath.includes('/components/') || relativePath.includes('\\components\\')) {
            analysis.components.push(relativePath);
          } else if (relativePath.includes('/modules/') || relativePath.includes('\\modules\\')) {
            analysis.modules.push(relativePath);
          }
        } else if (ext === '.ts' || ext === '.js') {
          if (relativePath.includes('/router/') || relativePath.endsWith('router.ts')) {
            analysis.routerFile = relativePath;
          } else if (relativePath.includes('/stores/') || relativePath.includes('/store/')) {
            analysis.storeFiles.push(relativePath);
          }
        } else if (['.scss', '.css', '.sass'].includes(ext)) {
          analysis.styleFiles.push(relativePath);
        } else if (['/assets/', '/public/', '/images/', '/icons/'].some((p) => relativePath.includes(p))) {
          analysis.assets.push(relativePath);
        }
      }
    }
  }

  scanDir(sourcePath);

  // 计算复杂度
  if (analysis.vueFiles.length > 50 || analysis.totalLines > 10000) {
    analysis.complexity = 'complex';
  } else if (analysis.vueFiles.length > 20 || analysis.totalLines > 3000) {
    analysis.complexity = 'medium';
  }

  return analysis;
}

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * 转换 Vue 组件为 React 组件
 */
export function convertVueToReact(vueFilePath) {
  const content = fs.readFileSync(vueFilePath, 'utf-8');

  // 提取 template
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  let template = templateMatch ? templateMatch[1].trim() : '';

  // 提取 script setup
  const scriptSetupMatch = content.match(/<script setup>([\s\S]*?)<\/script setup>/);
  const scriptSetup = scriptSetupMatch ? scriptSetupMatch[1].trim() : '';

  // 提取 script (非 setup)
  const scriptMatch = content.match(/<script[^>]*>(?![\s\S]*<script setup>)([\s\S]*)<\/script>/);
  const script = scriptMatch ? scriptMatch[1].trim() : '';

  // 提取 style
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  const style = styleMatch ? styleMatch[1].trim() : '';

  // 合并脚本
  const fullScript = scriptSetup + '\n' + script;

  // 提取组件名称
  const nameMatch = content.match(/defineOptions\s*\(\s*\{\s*name:\s*['"](\w+)['"]/);
  const componentName = nameMatch ? nameMatch[1] : 'Component';

  return {
    template,
    script: fullScript,
    style,
    componentName,
  };
}

/**
 * 转换 Vue template 到 JSX
 */
function convertTemplate(template) {
  let jsx = template;

  // 移除 template 标签
  jsx = jsx.replace(/<template[^>]*>/i, '').replace(/<\/template>/i, '');

  // Element Plus → Ant Design 标签转换
  const tagMapping = {
    'el-button': 'Button',
    'el-input': 'Input',
    'el-select': 'Select',
    'el-option': 'Option',
    'el-card': 'Card',
    'el-table': 'Table',
    'el-table-column': 'TableColumn',
    'el-form': 'Form',
    'el-form-item': 'FormItem',
    'el-dialog': 'Modal',
    'el-menu': 'Menu',
    'el-menu-item': 'MenuItem',
    'el-container': 'Layout',
    'el-header': 'Header',
    'el-main': 'Content',
    'el-aside': 'Sider',
    'el-tabs': 'Tabs',
    'el-tab-pane': 'TabPane',
    'el-upload': 'Upload',
    'el-checkbox': 'Checkbox',
    'el-checkbox-group': 'CheckboxGroup',
    'el-radio': 'Radio',
    'el-radio-group': 'RadioGroup',
    'el-date-picker': 'DatePicker',
    'el-pagination': 'Pagination',
    'el-tree': 'Tree',
  };

  for (const [vueTag, reactTag] of Object.entries(tagMapping)) {
    const openTagRegex = new RegExp(`<${vueTag}(\\s[^>]*)?>`, 'g');
    const closeTagRegex = new RegExp(`</${vueTag}>`, 'g');
    jsx = jsx.replace(openTagRegex, `<${reactTag}$1>`);
    jsx = jsx.replace(closeTagRegex, `</${reactTag}>`);
  }

  // 处理 el-icon
  jsx = jsx.replace(/<el-icon[^>]*><\/el-icon>/g, '');

  // 事件绑定转换
  jsx = jsx.replace(/@click="([^"]*)"/g, 'onClick={$1}');
  jsx = jsx.replace(/@click\.stop="([^"]*)"/g, 'onClick={(e) => { e.stopPropagation(); $1 }}');
  jsx = jsx.replace(/@click\.prevent="([^"]*)"/g, 'onClick={(e) => { e.preventDefault(); $1 }}');
  jsx = jsx.replace(/@change="([^"]*)"/g, 'onChange={$1}');
  jsx = jsx.replace(/@input="([^"]*)"/g, 'onInput={$1}');
  jsx = jsx.replace(/@blur="([^"]*)"/g, 'onBlur={$1}');
  jsx = jsx.replace(/@focus="([^"]*)"/g, 'onFocus={$1}');
  jsx = jsx.replace(/@submit="([^"]*)"/g, 'onSubmit={$1}');
  jsx = jsx.replace(/@keyup\.enter="([^"]*)"/g, 'onKeyUp={(e) => { if (e.key === "Enter") $1 }}');
  jsx = jsx.replace(/@keydown="([^"]*)"/g, 'onKeyDown={$1}');

  // v-model 和属性绑定
  jsx = jsx.replace(/:model-value="([^"]*)"/g, 'value={$1}');
  jsx = jsx.replace(/v-model="([^"]*)"/g, 'value={$1} onChange={(e) => {$1 = e.target.value}}');
  jsx = jsx.replace(/:value="([^"]*)"/g, 'value={$1}');
  jsx = jsx.replace(/:src="([^"]*)"/g, 'src={$1}');
  jsx = jsx.replace(/:href="([^"]*)"/g, 'href={$1}');
  jsx = jsx.replace(/:class="([^"]*)"/g, 'className={$1}');
  jsx = jsx.replace(/:style="([^"]*)"/g, 'style={$1}');
  jsx = jsx.replace(/:disabled="([^"]*)"/g, 'disabled={$1}');
  jsx = jsx.replace(/:placeholder="([^"]*)"/g, 'placeholder={$1}');
  jsx = jsx.replace(/:type="([^"]*)"/g, 'type={$1}');

  // 条件渲染
  jsx = jsx.replace(/v-if="([^"]*)"/g, '{$1 && (');
  jsx = jsx.replace(/v-else-if="([^"]*)"/g, ')} {$1 && (');
  jsx = jsx.replace(/v-else/g, ')}');

  // 列表渲染
  jsx = jsx.replace(/v-for="\((\w+),\s*(\w+)\) in (\w+)\)"/g, '{$3.map(($1, $2) => (');
  jsx = jsx.replace(/v-for="(\w+) in (\w+)"/g, '{$2.map($1 => (');
  // 清理未闭合的 v-for
  jsx = jsx.replace(/\)\s*}\s*\)/g, ') })}');

  // 显示/隐藏
  jsx = jsx.replace(/v-show="([^"]*)"/g, 'style={{ display: $1 ? "block" : "none" }}');

  // class 转换
  jsx = jsx.replace(/class="/g, 'className="');

  // router-link 转换
  jsx = jsx.replace(/<router-link to="([^"]*)"(.*?)>/g, '<Link to="$1"$2>');
  jsx = jsx.replace(/<\/router-link>/g, '</Link>');

  // 清理 Vue 特有属性
  jsx = jsx.replace(/ref="[^"]*"/g, '');
  jsx = jsx.replace(/slot="[^"]*"/g, '');
  jsx = jsx.replace(/v-once/g, '');
  jsx = jsx.replace(/v-pre/g, '');

  // 插槽
  jsx = jsx.replace(/#default="([^"]*)"/g, '$1');
  jsx = jsx.replace(/#header="([^"]*)"/g, '$1');
  jsx = jsx.replace(/#footer="([^"]*)"/g, '$1');

  // 简化 Vue 表达式
  jsx = jsx.replace(/\{\{[^}]*\}\}/g, (match) => {
    const expr = match.slice(2, -2).trim();
    if (expr.includes('computed') || expr.includes('function')) {
      return '';
    }
    return `{${expr}}`;
  });

  return jsx;
}

/**
 * 生成 React 组件代码
 */
export function generateReactComponent(filePath, converted) {
  const componentName = path.basename(filePath, '.tsx').replace('.tsx', '');
  const pascalName = componentName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // 转换模板
  const template = convertTemplate(converted.template);

  // 生成组件
  const code = `import React from 'react';

interface ${pascalName}Props {}

export function ${pascalName}(props: ${pascalName}Props) {
  return (
${indent(template, 4)}
  );
}

export default ${pascalName};
`;

  return code;
}

function indent(str, spaces) {
  const ind = ' '.repeat(spaces);
  return str.split('\n').map(line => line ? ind + line : line).join('\n');
}

/**
 * 创建 React 应用配置
 */
export function createReactConfig(appName, targetPath) {
  const configs = {
    'package.json': {
      name: `@enterprise-workspace/${appName}`,
      version: '1.0.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview',
        lint: 'eslint src --ext .ts,.tsx --max-warnings 0',
        'type-check': 'tsc --noEmit',
      },
      dependencies: {
        '@enterprise-workspace/frontend': 'workspace:*',
        antd: '>=5.0.0',
        react: '>=18.0.0',
        'react-dom': '>=18.0.0',
        'react-router-dom': '>=6.0.0',
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        '@vitejs/plugin-react': '^4.2.0',
        eslint: '^8.0.0',
        prettier: '^3.0.0',
        typescript: '^5.0.0',
        vite: '^5.0.0',
      },
    },

    'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@enterprise-workspace/frontend': path.resolve(
        __dirname,
        '../../../common/frontend'
      ),
    },
  },
  server: {
    port: 3001,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
`,

    'tsconfig.json': {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: 'react-jsx',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
          '@enterprise-workspace/frontend/*': ['../../../common/frontend/*'],
        },
      },
      include: ['src', 'vite.config.ts'],
    },

    'index.html': `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,

    'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1890ff',
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
`,

    'src/App.tsx': `import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

export default App;
`,

    'src/index.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}
`,

    'src/router/index.tsx': `import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// 懒加载视图组件
const Home = lazy(() => import('../views/Home'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <Home />
      </Suspense>
    ),
  },
];

export const router = createBrowserRouter(routes);

export default router;
`,

    'src/views/Home.tsx': `import React from 'react';

export function Home() {
  return (
    <div>
      <h1>Home Page</h1>
    </div>
  );
}

export default Home;
`,
  };

  // 写入配置文件
  for (const [fileName, content] of Object.entries(configs)) {
    const filePath = path.join(targetPath, fileName);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (typeof content === 'object') {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    } else {
      fs.writeFileSync(filePath, content);
    }
  }
}

/**
 * 执行迁移
 */
export async function migrate(appName, sourcePath, targetPath) {
  const result = {
    appName,
    sourceFiles: 0,
    migratedFiles: 0,
    skippedFiles: 0,
    errors: [],
    warnings: [],
    status: 'pending',
  };

  try {
    // 1. 分析源应用
    console.log('分析源应用...');
    const analysis = analyzeSourceApp(sourcePath);
    result.sourceFiles = analysis.vueFiles.length;

    console.log(`找到 ${analysis.vueFiles.length} 个 Vue 文件`);
    console.log(`视图: ${analysis.views.length}, 组件: ${analysis.components.length}`);
    console.log(`复杂度: ${analysis.complexity}`);

    if (analysis.routerFile) {
      result.warnings.push(`检测到路由文件: ${analysis.routerFile}，请手动迁移路由配置`);
    }

    if (analysis.storeFiles.length > 0) {
      result.warnings.push(`检测到状态管理文件: ${analysis.storeFiles.join(', ')}，请手动迁移到 Zustand`);
    }

    // 2. 创建目标目录
    console.log('\n创建目标目录...');
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    // 3. 创建配置文件
    console.log('创建配置文件...');
    createReactConfig(appName, targetPath);

    // 4. 复制静态资源
    console.log('复制静态资源...');
    const sourceAssets = path.join(sourcePath, 'src/assets');
    const targetAssets = path.join(targetPath, 'src/assets');

    if (fs.existsSync(sourceAssets)) {
      copyDirectory(sourceAssets, targetAssets);
    }

    // 5. 迁移 Vue 组件
    console.log('\n迁移 Vue 组件...');
    for (const vueFile of analysis.vueFiles) {
      try {
        const relativePath = vueFile.path;
        const tsxPath = relativePath.replace('.vue', '.tsx');
        const targetFilePath = path.join(targetPath, tsxPath);
        const targetDir = path.dirname(targetFilePath);

        if (shouldSkip(relativePath)) {
          result.skippedFiles++;
          continue;
        }

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const sourceFilePath = path.join(sourcePath, relativePath);
        const converted = convertVueToReact(sourceFilePath);
        const reactCode = generateReactComponent(tsxPath, converted);

        fs.writeFileSync(targetFilePath, reactCode);
        result.migratedFiles++;
      } catch (error) {
        result.errors.push({
          file: vueFile.path,
          error: error.message,
        });
      }
    }

    result.status = result.errors.length === 0 ? 'completed' : 'partial';
  } catch (error) {
    result.status = 'failed';
    result.errors.push({
      error: error.message,
    });
  }

  return result;
}

function shouldSkip(filePath) {
  const skipPatterns = [
    /node_modules/,
    /dist/,
    /build/,
    /\.git/,
    /env\.d\.ts/,
    /vite\.env/,
    /\.scss\.modules/,
    /Thumbs\.db/,
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);

  for (const item of items) {
    const sourceItem = path.join(source, item);
    const targetItem = path.join(target, item);

    if (fs.statSync(sourceItem).isDirectory()) {
      copyDirectory(sourceItem, targetItem);
    } else {
      if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(path.extname(item))) {
        fs.copyFileSync(sourceItem, targetItem);
      }
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Vue → React 迁移 SubAgent

用法:
  node agent.js <appName> [sourcePath] [targetPath]

示例:
  node agent.js home-app
  node agent.js admin-app

参数:
  appName      应用名称
  sourcePath   源路径 (可选，默认: products/pc-admin/apps/{appName})
  targetPath   目标路径 (可选，默认: products/react-admin/apps/{appName})
`);
    process.exit(0);
  }

  const appName = args[0];
  const basePath = path.resolve(__dirname, '../../../products');
  const sourcePath = args[1] || path.join(basePath, 'pc-admin/apps', appName);
  const targetPath = args[2] || path.join(basePath, 'react-admin/apps', appName);

  console.log(`开始迁移: ${appName}`);
  console.log(`源路径: ${sourcePath}`);
  console.log(`目标路径: ${targetPath}`);

  const result = await migrate(appName, sourcePath, targetPath);

  console.log('\n' + '='.repeat(50));
  console.log('迁移结果');
  console.log('='.repeat(50));
  console.log(`应用名称: ${result.appName}`);
  console.log(`源文件数: ${result.sourceFiles}`);
  console.log(`已迁移文件: ${result.migratedFiles}`);
  console.log(`跳过文件: ${result.skippedFiles}`);
  console.log(`状态: ${result.status}`);

  if (result.warnings.length > 0) {
    console.log('\n警告:');
    result.warnings.forEach((w) => console.log(`  - ${w}`));
  }

  if (result.errors.length > 0) {
    console.log('\n错误:');
    result.errors.forEach((e) => {
      if (e.file) {
        console.log(`  - ${e.file}: ${e.error}`);
      } else {
        console.log(`  - ${e.error}`);
      }
    });
  }

  console.log('='.repeat(50));
  console.log('\n提示: 迁移后的组件需要手动调整才能正常工作');
  console.log('1. 添加缺失的状态管理 (useState/useEffect)');
  console.log('2. 修复 className 语法');
  console.log('3. 替换 Vue 特有 API');
  console.log('4. 调整组件导入路径');
  console.log('');

  process.exit(result.status === 'failed' ? 1 : 0);
}

// 导出所有函数
