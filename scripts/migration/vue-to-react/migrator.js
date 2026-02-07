/**
 * Vue → React 迁移工具
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
 * Vue → React 转换规则配置
 */
export const CONVERSION_RULES = {
  // 标签转换
  tags: {
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
    'el-message': 'message',
    'el-menu': 'Menu',
    'el-menu-item': 'Menu.Item',
    'el-sub-menu': 'SubMenu',
    'el-icon': '',
    'el-container': 'Layout',
    'el-header': 'Header',
    'el-main': 'Content',
    'el-aside': 'Sider',
    'el-footer': 'Footer',
    'el-tabs': 'Tabs',
    'el-tab-pane': 'TabPane',
    'el-upload': 'Upload',
    'el-checkbox': 'Checkbox',
    'el-checkbox-group': 'Checkbox.Group',
    'el-radio': 'Radio',
    'el-radio-group': 'Radio.Group',
    'el-date-picker': 'DatePicker',
    'el-pagination': 'Pagination',
    'el-tree': 'Tree',
    'el-cascader': 'Cascader',
    'el-autocomplete': 'AutoComplete',
    'el-color-picker': 'ColorPicker',
    'el-switch': 'Switch',
    'el-slider': 'Slider',
    'el-rate': 'Rate',
    'el-transfer': 'Transfer',
    'el-steps': 'Steps',
    'el-step': 'Step',
    'el-collapse': 'Collapse',
    'el-collapse-item': 'Collapse.Panel',
    'el-tooltip': 'Tooltip',
    'el-popover': 'Popover',
    'el-popconfirm': 'Popconfirm',
    'el-empty': 'Empty',
    'el-loading': 'Spin',
  },

  // 属性转换
  attributes: {
    '@click': 'onClick',
    '@change': 'onChange',
    '@input': 'onInput',
    '@blur': 'onBlur',
    '@focus': 'onFocus',
    '@submit': 'onSubmit',
    '@reset': 'onReset',
    '@keyup': 'onKeyUp',
    '@keydown': 'onKeyDown',
    '@mouseover': 'onMouseOver',
    '@mouseleave': 'onMouseLeave',
    ':model-value': 'value',
    'v-model': 'value',
    'v-bind': '',
    'v-on': '',
    'v-if': '{!!$props.condition}',
    'v-else': '',
    'v-for': '',
    'v-show': 'style={{ display: $props.visible ? "block" : "none" }}',
    'v-html': 'dangerouslySetInnerHTML={{ __html: $props.html }}',
    'v-text': '$props.text',
    'v-pre': '',
    'v-cloak': '',
    'v-once': '',
    'ref': 'ref',
    'key': 'key',
    'slot': 'slot',
    'class': 'className',
    'autofocus': 'autoFocus',
    'readonly': 'readOnly',
    'maxlength': 'maxLength',
    'minlength': 'minLength',
    'placeholder': 'placeholder',
    'disabled': 'disabled',
    'required': 'required',
    'pattern': 'pattern',
    'checked': 'checked',
    'multiple': 'multiple',
    'size': 'size',
    'value': 'value',
    'type': 'type',
    'src': 'src',
    'alt': 'alt',
    'href': 'href',
    'target': 'target',
    'rel': 'rel',
    'style': 'style',
  },
};

/**
 * 获取所有 Vue 文件
 */
export function getVueFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      getVueFiles(fullPath, files);
    } else if (item.endsWith('.vue')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 解析 Vue 文件的模板和脚本
 */
export function parseVueFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');

  const result = {
    template: '',
    script: '',
    scriptSetup: '',
    style: '',
    imports: [],
    props: [],
    emits: [],
    composables: [],
    stores: [],
  };

  // 提取 template
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  if (templateMatch) {
    result.template = templateMatch[1].trim();
  }

  // 提取 script (非 setup)
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    result.script = scriptMatch[1].trim();
  }

  // 提取 <script setup>
  const scriptSetupMatch = content.match(/<script setup>([\s\S]*?)<\/script setup>/);
  if (scriptSetupMatch) {
    result.scriptSetup = scriptSetupMatch[1].trim();
  }

  // 提取 style
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    result.style = styleMatch[1].trim();
  }

  return result;
}

/**
 * 转换 Vue 模板到 JSX
 */
export function convertTemplate(template) {
  let jsx = template;

  // 1. 移除 template 标签的 wrapper（如果需要）
  jsx = jsx.replace(/<template[^>]*>/i, '').replace(/<\/template>/i, '');

  // 2. 转换 Element Plus 标签到 Ant Design
  for (const [vueTag, reactTag] of Object.entries(CONVERSION_RULES.tags)) {
    const regex = new RegExp(`<${vueTag}([^>]*)>`, 'g');
    jsx = jsx.replace(regex, (_, attributes) => {
      if (!reactTag) return '';
      return `<${reactTag}${attributes}>`;
    });
    // 闭合标签
    jsx = jsx.replace(new RegExp(`</${vueTag}>`, 'g'), `</${reactTag}>`);
  }

  // 3. 转换属性
  for (const [vueAttr, reactAttr] of Object.entries(CONVERSION_RULES.attributes)) {
    if (vueAttr.startsWith('@')) {
      const eventName = vueAttr.slice(1);
      jsx = jsx.replace(
        new RegExp(`${vueAttr}="([^"]*)"`, 'g'),
        `${reactAttr}={$1}`
      );
    } else if (vueAttr === 'v-model') {
      jsx = jsx.replace(
        /v-model="([^"]*)"/g,
        'value={$1} onChange={(e) => {$1 = e.target.value}}'
      );
    } else if (vueAttr === ':model-value' || vueAttr === 'v-bind:') {
      jsx = jsx.replace(
        new RegExp(`${vueAttr}="([^"]*)"`, 'g'),
        `${reactAttr}={$1}`
      );
    } else if (vueAttr === 'v-for') {
      // v-for 需要特殊处理
      // v-for="(item, index) in list" -> {list.map((item, index) => (
      jsx = jsx.replace(
        /v-for="\((\w+),\s*(\w+)\) in (\w+)\)"/g,
        '{$3.map(($1, $2) => ('
      );
      jsx = jsx.replace(/v-for="(\w+) in (\w+)"/g, '{$2.map($1 => (');
    } else if (vueAttr === 'v-if') {
      jsx = jsx.replace(/v-if="([^"]*)"/g, '{$props.condition && (');
    } else if (vueAttr === 'v-else') {
      jsx = jsx.replace(/v-else/g, ')}') + ')';
    } else if (vueAttr === 'v-show') {
      jsx = jsx.replace(/v-show="([^"]*)"/g, 'style={{ display: $1 ? "block" : "none" }}');
    } else if (vueAttr === 'v-html') {
      jsx = jsx.replace(/v-html="([^"]*)"/g, 'dangerouslySetInnerHTML={{ __html: $1 }}');
    } else {
      jsx = jsx.replace(
        new RegExp(`${vueAttr}="([^"]*)"`, 'g'),
        `${reactAttr}="$1"`
      );
    }
  }

  // 4. 转换条件渲染
  jsx = jsx.replace(/v-else-if="([^"]*)"/g, ')} {$1 && (');
  jsx = jsx.replace(/(?<![\w])v-if="([^"]*)"(?![\w])/g, '{$1 && (');
  jsx = jsx.replace(/(?<![\w])v-else(?![\w])/g, ')}');
  jsx = jsx.replace(/<\/template>/g, ') } ');

  // 5. 处理 slot
  jsx = jsx.replace(/#(\w+)="([^"]*)"/g, '$2');
  jsx = jsx.replace(/<template #(\w+)>/g, '{/* slot: $1 */}');
  jsx = jsx.replace(/<\/template>/g, '');

  // 6. 处理 router-link
  jsx = jsx.replace(
    /<router-link to="([^"]*)"(.*?)>/g,
    '<Link to="$1"$2>'
  );
  jsx = jsx.replace(/<\/router-link>/g, '</Link>');

  // 7. 处理动态属性绑定
  jsx = jsx.replace(/:\[(\w+)\]="([^"]*)"/g, '{...{ [$1]: $2 }}');
  jsx = jsx.replace(/:class="([^"]*)"/g, 'className={$1}');
  jsx = jsx.replace(/:style="([^"]*)"/g, 'style={$1}');
  jsx = jsx.replace(/:src="([^"]*)"/g, 'src={$1}');
  jsx = jsx.replace(/:href="([^"]*)"/g, 'href={$1}');

  return jsx;
}

/**
 * 转换 Vue 脚本到 TypeScript
 */
export function convertScript(scriptSetup, script = '') {
  let ts = '';

  // 合并 script 和 scriptSetup
  const fullScript = scriptSetup + '\n' + script;

  // 1. 提取 import 语句
  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  // 2. 提取 defineProps
  const propsRegex = /defineProps\s*<([^>]+)>\s*\(\s*\)/;
  const propsMatch = fullScript.match(propsRegex);

  // 3. 提取 defineEmits
  const emitsRegex = /defineEmits\s*<([^>]+)>\s*\(\s*\)/;
  const emitsMatch = fullScript.match(emitsRegex);

  // 4. 提取 ref/reactive
  const refRegex = /(?:const|let)\s+(\w+)\s*=\s*ref\s*\(([^)]+)\)/g;
  const reactiveRegex = /(?:const|let)\s+(\w+)\s*=\s*reactive\s*\(([^)]+)\)/g;

  // 5. 提取 computed
  const computedRegex = /const\s+(\w+)\s*=\s*computed\s*\(\s*\(\)\s*=>\s*([^{]+)\)/g;

  // 6. 提取 watch
  const watchRegex = /watch\s*\(\s*(\w+)\s*,\s*\([^)]+\)\s*=>\s*{([^}]+)}\s*\)/g;

  // 7. 提取生命周期钩子
  const onMountedRegex = /onMounted\s*\(\s*\(\)\s*=>\s*{([^}]+)}\s*\)/g;
  const onUnmountedRegex = /onUnmounted\s*\(\s*\(\)\s*=>\s*{([^}]+)}\s*\)/g;

  // 构建转换后的代码
  ts = 'import { useState, useEffect, useMemo, useCallback, useRef } from \'react\';\n';
  ts += 'import { useNavigate, useLocation } from \'react-router-dom\';\n\n';

  // 添加 props 接口
  if (propsMatch) {
    ts += `interface Props {\n  ${propsMatch[1]}\n}\n\n`;
  }

  // 转换 ref 为 useState
  while ((match = refRegex.exec(fullScript)) !== null) {
    const varName = match[1];
    const initialValue = match[2];
    if (!initialValue.includes('function')) {
      ts += `const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState(${initialValue});\n`;
    }
  }

  ts += '\n';

  return ts;
}

/**
 * 生成 React 组件
 */
export function generateReactComponent(componentName, template, script, style) {
  const convertedScript = convertScript(script);
  const convertedTemplate = convertTemplate(template);

  const component = `
import React from 'react';
${convertedScript}

interface ${componentName}Props {}

export function ${componentName}(props: ${componentName}Props) {
  return (
    ${convertedTemplate}
  );
}

export default ${componentName};
`;

  return component;
}

/**
 * 迁移整个应用
 */
export async function migrateApp(appName, sourcePath, targetPath) {
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
    // 1. 检查源目录
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`源目录不存在: ${sourcePath}`);
    }

    // 2. 创建目标目录
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    // 3. 复制共享资源
    await copySharedAssets(sourcePath, targetPath);

    // 4. 获取所有 Vue 文件
    const vueFiles = getVueFiles(sourcePath);
    result.sourceFiles = vueFiles.length;

    // 5. 迁移每个 Vue 文件
    for (const vueFile of vueFiles) {
      try {
        const relativePath = path.relative(sourcePath, vueFile);
        const tsxPath = relativePath.replace('.vue', '.tsx');

        // 检查是否应该跳过
        if (shouldSkipFile(relativePath)) {
          result.skippedFiles++;
          continue;
        }

        // 解析并转换 Vue 文件
        const parsed = parseVueFile(vueFile);
        const componentName = getComponentName(tsxPath);
        const reactComponent = generateReactComponent(
          componentName,
          parsed.template,
          parsed.scriptSetup + parsed.script,
          parsed.style
        );

        // 写入 React 组件
        const targetFilePath = path.join(targetPath, tsxPath);
        const targetDir = path.dirname(targetFilePath);

        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        fs.writeFileSync(targetFilePath, reactComponent);
        result.migratedFiles++;
      } catch (error) {
        result.errors.push({
          file: vueFile,
          error: error.message,
        });
      }
    }

    // 6. 创建配置文件
    await createConfigFiles(appName, targetPath);

    // 7. 创建路由配置
    await createRouterConfig(appName, sourcePath, targetPath);

    // 8. 创建入口文件
    await createEntryFiles(appName, targetPath);

    result.status = result.errors.length === 0 ? 'completed' : 'partial';
  } catch (error) {
    result.status = 'failed';
    result.errors.push({
      error: error.message,
    });
  }

  return result;
}

/**
 * 检查是否应该跳过文件
 */
function shouldSkipFile(relativePath) {
  const skipPatterns = [
    /node_modules/,
    /dist/,
    /build/,
    /\.git/,
    /env\.d\.ts/,
    /vite\.env/,
    /\.scss\.modules/,
  ];

  return skipPatterns.some((pattern) => pattern.test(relativePath));
}

/**
 * 获取组件名称
 */
function getComponentName(filePath) {
  const name = path.basename(filePath, '.tsx');
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * 复制共享资源
 */
async function copySharedAssets(sourcePath, targetPath) {
  const assetsToCopy = ['assets', 'public'];

  for (const asset of assetsToCopy) {
    const sourceAsset = path.join(sourcePath, asset);
    const targetAsset = path.join(targetPath, asset);

    if (fs.existsSync(sourceAsset)) {
      await copyDirectory(sourceAsset, targetAsset);
    }
  }
}

/**
 * 复制目录
 */
async function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);

  for (const item of items) {
    const sourceItem = path.join(source, item);
    const targetItem = path.join(target, item);

    if (fs.statSync(sourceItem).isDirectory()) {
      await copyDirectory(sourceItem, targetItem);
    } else {
      fs.copyFileSync(sourceItem, targetItem);
    }
  }
}

/**
 * 创建配置文件
 */
async function createConfigFiles(appName, targetPath) {
  // package.json
  const packageJson = {
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
  };

  fs.writeFileSync(
    path.join(targetPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
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
`;

  fs.writeFileSync(path.join(targetPath, 'vite.config.ts'), viteConfig);

  // tsconfig.json
  const tsconfig = {
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
  };

  fs.writeFileSync(
    path.join(targetPath, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2)
  );

  // index.html
  const indexHtml = `<!DOCTYPE html>
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
`;

  fs.writeFileSync(path.join(targetPath, 'index.html'), indexHtml);
}

/**
 * 创建路由配置
 */
async function createRouterConfig(appName, sourcePath, targetPath) {
  const routerPath = path.join(targetPath, 'src', 'router');
  if (!fs.existsSync(routerPath)) {
    fs.mkdirSync(routerPath, { recursive: true });
  }

  const routesContent = `import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
    children: [],
  },
];

export const router = createBrowserRouter(routes);

export default router;
`;

  fs.writeFileSync(path.join(routerPath, 'index.tsx'), routesContent);
}

/**
 * 创建入口文件
 */
async function createEntryFiles(appName, targetPath) {
  const srcPath = path.join(targetPath, 'src');

  // main.tsx
  const mainTsx = `import React from 'react';
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
`;

  fs.writeFileSync(path.join(srcPath, 'main.tsx'), mainTsx);

  // App.tsx
  const appTsx = `import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

export default App;
`;

  fs.writeFileSync(path.join(srcPath, 'App.tsx'), appTsx);

  // index.css
  const indexCss = `* {
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
`;

  fs.writeFileSync(path.join(srcPath, 'index.css'), indexCss);
}

export default {
  CONVERSION_RULES,
  getVueFiles,
  parseVueFile,
  convertTemplate,
  convertScript,
  generateReactComponent,
  migrateApp,
};
