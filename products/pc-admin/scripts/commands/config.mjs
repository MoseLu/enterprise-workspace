/**
 * 命令系统配置
 * 定义所有命令类型、应用列表和命令映射
 */

// 应用列表配置
export const APPS = {
  system: {
    name: 'system',
    displayName: '系统应用',
    packageName: 'system-app',
  },
  admin: {
    name: 'admin',
    displayName: '管理应用',
    packageName: 'admin-app',
  },
  logistics: {
    name: 'logistics',
    displayName: '物流应用',
    packageName: 'logistics-app',
  },
  finance: {
    name: 'finance',
    displayName: '财务应用',
    packageName: 'finance-app',
  },
  engineering: {
    name: 'engineering',
    displayName: '工程应用',
    packageName: 'engineering-app',
  },
  quality: {
    name: 'quality',
    displayName: '品质应用',
    packageName: 'quality-app',
  },
  production: {
    name: 'production',
    displayName: '生产应用',
    packageName: 'production-app',
  },
  monitor: {
    name: 'monitor',
    displayName: '监控应用',
    packageName: 'monitor-app',
  },
  layout: {
    name: 'layout',
    displayName: '布局应用',
    packageName: 'layout-app',
  },
  docs: {
    name: 'docs',
    displayName: '文档站点',
    packageName: 'docs-app',
  },
};

// 获取所有应用名称列表
export const APP_NAMES = Object.keys(APPS);

// 获取应用显示名称列表（用于交互式选择）
export const APP_CHOICES = APP_NAMES.map(key => ({
  title: APPS[key].displayName,
  value: key,
  description: `应用ID: ${key}`,
}));

// 命令类型配置
export const COMMAND_TYPES = {
  dev: {
    name: 'dev',
    displayName: '开发 (Dev)',
    description: '启动开发服务器',
    handler: 'dev',
    supportsMultiApp: false, // 开发服务器通常一次只启动一个
    subCommands: null,
  },
  build: {
    name: 'build',
    displayName: '构建 (Build)',
    description: '构建生产版本',
    handler: 'build',
    supportsMultiApp: true,
    subCommands: null,
  },
  preview: {
    name: 'preview',
    displayName: '预览 (Preview)',
    description: '预览构建结果',
    handler: 'preview',
    supportsMultiApp: false,
    subCommands: null,
  },
  lint: {
    name: 'lint',
    displayName: '代码检查 (Lint)',
    description: '检查代码质量和风格',
    handler: 'lint',
    supportsMultiApp: true,
    subCommands: {
      check: {
        name: 'check',
        displayName: '检查',
        description: '只检查，不修复',
      },
      fix: {
        name: 'fix',
        displayName: '修复',
        description: '自动修复可修复的问题',
      },
    },
  },
  'type-check': {
    name: 'type-check',
    displayName: '类型检查 (Type Check)',
    description: '检查 TypeScript 类型错误',
    handler: 'type-check',
    supportsMultiApp: true,
    subCommands: null,
  },
  deploy: {
    name: 'deploy',
    displayName: '部署 (Deploy)',
    description: '部署应用到服务器',
    handler: 'deploy',
    supportsMultiApp: false,
    subCommands: {
      local: {
        name: 'local',
        displayName: '本地部署',
        description: '部署到本地服务器',
      },
      static: {
        name: 'static',
        displayName: '静态资源部署',
        description: '部署静态资源',
      },
      k8s: {
        name: 'k8s',
        displayName: 'K8s 部署',
        description: '部署到 Kubernetes',
      },
    },
  },
  'build-deploy': {
    name: 'build-deploy',
    displayName: '构建并部署 (Build & Deploy)',
    description: '构建并部署应用',
    handler: 'build-deploy',
    supportsMultiApp: false,
    subCommands: {
      full: {
        name: 'full',
        displayName: '完整部署',
        description: '构建、部署应用和静态资源',
      },
      k8s: {
        name: 'k8s',
        displayName: 'K8s 部署',
        description: '构建并部署到 Kubernetes',
      },
    },
  },
  'build-preview': {
    name: 'build-preview',
    displayName: '构建并预览 (Build & Preview)',
    description: '构建并预览结果',
    handler: 'build-preview',
    supportsMultiApp: false,
    subCommands: null,
  },
};

// 获取命令类型选择列表
export const COMMAND_TYPE_CHOICES = Object.values(COMMAND_TYPES).map(cmd => ({
  title: cmd.displayName,
  value: cmd.name,
  description: cmd.description,
}));

// 获取子命令选择列表
export function getSubCommandChoices(commandType) {
  const cmd = COMMAND_TYPES[commandType];
  if (!cmd || !cmd.subCommands) {
    return null;
  }
  return Object.values(cmd.subCommands).map(sub => ({
    title: sub.displayName,
    value: sub.name,
    description: sub.description,
  }));
}

// 获取应用包名
export function getAppPackageName(appName) {
  return APPS[appName]?.packageName || `${appName}-app`;
}

// 获取应用显示名称
export function getAppDisplayName(appName) {
  return APPS[appName]?.displayName || appName;
}

