#!/usr/bin/env node
/**
 * PC-Admin → React-Admin 迁移 Worktree 管理脚本
 * 功能：批量创建和管理迁移专用的 git worktree
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const WORKTREE_BASE = resolve(__dirname, '../worktrees/migration');
const CONFIG_FILE = join(__dirname, 'migration-config.json');
const BRANCH = process.env.GIT_BRANCH || 'feature/first-feature-branch';

// 颜色输出
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const BLUE = '\x1b[0;34m';
const CYAN = '\x1b[0;36m';
const NC = '\x1b[0m';

function log(label, message) {
  console.log(`${label}[${label}]${NC} ${message}`);
}
const logInfo = (m) => log(BLUE, 'INFO', m);
const logSuccess = (m) => log(GREEN, 'SUCCESS', m);
const logWarn = (m) => log(YELLOW, 'WARN', m);
const logError = (m) => log(RED, 'ERROR', m);
const logPhase = (m) => log(CYAN, 'PHASE', m);

// 读取配置
function readConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  } catch {
    logError('无法读取配置文件');
    return null;
  }
}

// 获取阶段的应用列表
function getPhaseApps(phaseName) {
  const config = readConfig();
  if (!config) return [];

  const phase = config.phases.find(p => p.name === phaseName);
  return phase?.apps || [];
}

// 获取所有迁移应用
function getAllMigrationApps() {
  const config = readConfig();
  if (!config) return [];

  const apps = new Set();
  config.phases.forEach(p => p.apps.forEach(a => apps.add(a)));
  return Array.from(apps);
}

// 执行 git 命令
function git(args, options = {}) {
  try {
    const result = spawnSync('git', args, {
      encoding: 'utf-8',
      shell: true,
      ...options
    });
    return { success: true, output: result.stdout?.trim() || '', error: result.stderr };
  } catch (e) {
    return { success: false, output: '', error: e.message };
  }
}

// 创建迁移 worktree
function createMigrationWorktree(app) {
  const worktreePath = join(WORKTREE_BASE, app);
  const sourcePath = `products/pc-admin/apps/${app}`;

  logInfo(`为迁移 [$app] 创建 worktree...`);

  // 检查源应用是否存在
  if (!existsSync(resolve(__dirname, '..', sourcePath))) {
    logError(`源应用不存在: ${sourcePath}`);
    return false;
  }

  // 创建父目录
  if (!existsSync(WORKTREE_BASE)) {
    mkdirSync(WORKTREE_BASE, { recursive: true });
  }

  // 检查是否已存在
  if (existsSync(worktreePath)) {
    logWarn(`Worktree 已存在: ${worktreePath}`);
    git(['fetch', 'origin', BRANCH], { cwd: worktreePath });
    git(['checkout', BRANCH], { cwd: worktreePath });
    return true;
  }

  // 创建 worktree
  const result = git(['worktree', 'add', worktreePath, BRANCH], {
    cwd: resolve(__dirname, '..')
  });

  if (result.success) {
    logSuccess(`Worktree 创建成功: ${worktreePath}`);

    // 创建迁移笔记
    const notesPath = join(worktreePath, 'MIGRATION_NOTES.md');
    writeFileSync(notesPath, `# ${app} 迁移笔记

## 源信息
- 源路径: products/pc-admin/apps/${app}
- 目标路径: products/react-admin/apps/${app}

## 待完成任务
- [ ] 分析 Vue 组件结构
- [ ] 识别可复用逻辑
- [ ] 创建 React 组件
- [ ] 更新路由配置
- [ ] 更新样式
- [ ] 测试功能

## 注意事项
- 使用 @enterprise-workspace/frontend 作为组件库
- 使用 Zustand 替代 Pinia
- 使用 React Router 替代 Vue Router
`);

    git(['branch', '--set-upstream-to', `origin/${BRANCH}`, BRANCH], {
      cwd: worktreePath
    });

    return true;
  } else {
    logError(`Worktree 创建失败: ${app}`);
    return false;
  }
}

// 批量创建 worktree
function createAllWorktrees(apps = []) {
  if (apps.length === 0) {
    apps = getAllMigrationApps();
  }

  if (apps.length === 0) {
    logError('没有指定应用');
    return { created: [], failed: [] };
  }

  logPhase(`批量创建 ${apps.length} 个迁移 worktree...`);
  console.log('');

  const created = [];
  const failed = [];

  for (const app of apps) {
    if (createMigrationWorktree(app)) {
      created.push(app);
    } else {
      failed.push(app);
    }
  }

  console.log('');
  logSuccess(`成功: ${created.length} 个`);
  if (failed.length > 0) {
    logError(`失败: ${failed.length} 个: ${failed.join(', ')}`);
  }

  return { created, failed };
}

// 初始化 React 应用结构
function initReactApp(app) {
  const targetPath = resolve(__dirname, '..', `products/react-admin/apps/${app}`);

  if (existsSync(targetPath)) {
    logWarn(`目标已存在: ${targetPath}`);
    return;
  }

  logInfo(`创建 React 应用结构: ${app}`);

  // 创建目录结构
  mkdirSync(join(targetPath, 'src'), { recursive: true });
  mkdirSync(join(targetPath, 'config'), { recursive: true });

  // 创建 package.json
  writeFileSync(join(targetPath, 'package.json'), JSON.stringify({
    name: `@enterprise-workspace/${app}`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      lint: 'eslint src --ext .ts,.tsx --max-warnings 0',
      'type-check': 'tsc --noEmit'
    },
    dependencies: {
      '@enterprise-workspace/frontend': 'workspace:*',
      antd: '>=5.0.0',
      react: '>=18.0.0',
      'react-dom': '>=18.0.0',
      'react-router-dom': '>=6.0.0'
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
      vite: '^5.0.0'
    }
  }, null, 2));

  // 创建 vite.config.ts
  writeFileSync(join(targetPath, 'vite.config.ts'), `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@enterprise-workspace/frontend': path.resolve(__dirname, '../../../common/frontend'),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
`);

  // 创建 tsconfig.json
  writeFileSync(join(targetPath, 'tsconfig.json'), JSON.stringify({
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
        '@enterprise-workspace/frontend/*': ['../../../common/frontend/*']
      }
    },
    include: ['src', 'vite.config.ts']
  }, null, 2));

  // 创建 index.html
  writeFileSync(join(targetPath, 'index.html'), `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${app}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  // 创建 main.tsx
  writeFileSync(join(targetPath, 'src/main.tsx'), `import React from 'react';
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
`);

  // 创建 App.tsx
  writeFileSync(join(targetPath, 'src/App.tsx'), `import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>${app}</Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={2}>迁移自 Vue 的 React 应用</Title>
        <p>此应用从 products/pc-admin/apps/${app} 迁移而来。</p>
      </Content>
    </Layout>
  );
}

export default App;
`);

  // 创建 index.css
  writeFileSync(join(targetPath, 'src/index.css'), `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  width: 100%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
`);

  logSuccess(`创建完成: ${targetPath}`);
}

// 显示状态
function showStatus() {
  const config = readConfig();
  const apps = getAllMigrationApps();

  console.log('');
  console.log('===============================================================================');
  console.log('                    PC-Admin → React-Admin 迁移状态');
  console.log('===============================================================================');
  console.log('');
  console.log(`当前分支: ${BRANCH}`);
  console.log(`Worktree 基础目录: ${WORKTREE_BASE}`);
  console.log('');

  if (config) {
    console.log('--- 迁移阶段 ---');
    config.phases.forEach(p => {
      const statusIcon = p.status === 'completed' ? '[✓]' : p.status === 'in_progress' ? '[→]' : '[ ]';
      console.log(`${statusIcon} ${p.name} - ${p.description}`);
    });
    console.log('');
  }

  console.log('--- 应用迁移状态 ---');
  for (const app of apps) {
    const worktreePath = join(WORKTREE_BASE, app);
    const targetPath = resolve(__dirname, '..', `products/react-admin/apps/${app}`);
    const sourcePath = resolve(__dirname, '..', `products/pc-admin/apps/${app}`);

    let status = '';
    if (existsSync(targetPath)) {
      status = '[✓] 已迁移 → products/react-admin';
    } else if (existsSync(worktreePath)) {
      status = '[~] worktree 已创建 (迁移中)';
    } else if (existsSync(sourcePath)) {
      status = '[ ] 待迁移';
    } else {
      status = '[?] 源路径不存在';
    }
    console.log(`${status} ${app}`);
  }

  console.log('');
  console.log('--- Git Worktree 列表 (迁移相关) ---');
  const worktreeResult = git(['worktree', 'list', '--porcelain']);
  if (worktreeResult.success) {
    const lines = worktreeResult.output.split('\n').filter(l => l.includes(WORKTREE_BASE));
    if (lines.length > 0) {
      lines.forEach(l => {
        const path = l.split(' ')[1];
        console.log(`  ${path}`);
      });
    } else {
      console.log('  (无迁移 worktree)');
    }
  }
  console.log('');
}

// 清理迁移 worktree
function cleanupMigrationWorktrees() {
  logInfo('清理迁移 worktree...');

  const worktreeResult = git(['worktree', 'list', '--porcelain']);
  if (!worktreeResult.success) {
    logError('无法获取 worktree 列表');
    return;
  }

  const lines = worktreeResult.output.split('\n').filter(l => l.includes(WORKTREE_BASE));

  if (lines.length === 0) {
    logInfo('没有需要清理的迁移 worktree');
    return;
  }

  for (const line of lines) {
    const path = line.split(' ')[1]?.trim();
    if (path) {
      logInfo(`清理: ${path}`);
      git(['worktree', 'remove', path, '--force']);
    }
  }

  git(['worktree', 'prune']);
  logSuccess('清理完成');
}

// 主入口
function main() {
  const command = process.argv[2] || 'status';

  switch (command) {
    case 'create':
    case 'c': {
      const app = process.argv[3];
      if (!app) {
        console.log('用法: node migration-worktree.mjs create <app>');
        process.exit(1);
      }
      createMigrationWorktree(app);
      break;
    }
    case 'create-all':
    case 'ca': {
      const apps = process.argv.slice(3);
      createAllWorktrees(apps.length > 0 ? apps : undefined);
      break;
    }
    case 'init':
    case 'i': {
      const app = process.argv[3];
      if (!app) {
        console.log('用法: node migration-worktree.mjs init <app>');
        process.exit(1);
      }
      initReactApp(app);
      break;
    }
    case 'init-phase':
    case 'ip': {
      const phase = process.argv[3];
      if (!phase) {
        console.log('用法: node migration-worktree.mjs init-phase <phase>');
        process.exit(1);
      }
      const apps = getPhaseApps(phase);
      apps.forEach(app => initReactApp(app));
      break;
    }
    case 'status':
    case 's': {
      showStatus();
      break;
    }
    case 'cleanup':
    case 'rm': {
      cleanupMigrationWorktrees();
      break;
    }
    case 'help':
    case '--help':
    case '-h': {
      console.log('PC-Admin → React-Admin 迁移 Worktree 管理脚本');
      console.log('');
      console.log('用法: node migration-worktree.mjs <命令> [参数]');
      console.log('');
      console.log('命令:');
      console.log('  create <app>           为单个应用创建迁移 worktree');
      console.log('  create-all [apps...]   批量创建迁移 worktree');
      console.log('  init <app>             初始化 React 应用结构');
      console.log('  init-phase <phase>     批量初始化 React 应用结构');
      console.log('  status                 显示迁移状态');
      console.log('  cleanup                清理所有迁移 worktree');
      console.log('');
      break;
    }
    default: {
      logError(`未知命令: ${command}`);
      process.exit(1);
    }
  }
}

main();
