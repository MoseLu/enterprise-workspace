---
title: System Configuration Guide
type: guide
project: system
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- system
- configuration
sidebar_label: System Configuration
sidebar_order: 5
sidebar_group: system
---

# System Configuration Guide

BTC workshop management system configuration management and deployment guide.

## Configuration Overview

System configuration includes environment configuration, application configuration, theme configuration, and other aspects, ensuring the system runs normally in different environments.

## Environment Configuration

### Development Environment
```bash
# .env.development
NODE_ENV=development
VITE_APP_TITLE=BTC Workshop Management System (Development)
VITE_APP_BASE_API=http://localhost:3000/api
VITE_APP_UPLOAD_URL=http://localhost:3000/upload
VITE_DOCS_URL=http://localhost:8085
VITE_APP_WS_URL=ws://localhost:3000
```

### Staging Environment
```bash
# .env.staging
NODE_ENV=staging
VITE_APP_TITLE=BTC Workshop Management System (Staging)
VITE_APP_BASE_API=https://test-api.btc.com/api
VITE_APP_UPLOAD_URL=https://test-api.btc.com/upload
VITE_DOCS_URL=https://test-docs.btc.com
VITE_APP_WS_URL=wss://test-api.btc.com
```

### Production Environment
```bash
# .env.production
NODE_ENV=production
VITE_APP_TITLE=BTC Workshop Management System
VITE_APP_BASE_API=https://api.btc.com/api
VITE_APP_UPLOAD_URL=https://api.btc.com/upload
VITE_DOCS_URL=https://docs.btc.com
VITE_APP_WS_URL=wss://api.btc.com
```

## Application Configuration

### Main Application Configuration
```typescript
// src/config/index.ts
export interface AppConfig {
  title: string
  version: string
  baseURL: string
  timeout: number
  uploadURL: string
  docsURL: string
  wsURL: string
  theme: ThemeConfig
  locale: LocaleConfig
  microApps: MicroAppConfig[]
}

export const appConfig: AppConfig = {
  title: import.meta.env.VITE_APP_TITLE,
  version: '1.0.0',
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 10000,
  uploadURL: import.meta.env.VITE_APP_UPLOAD_URL,
  docsURL: import.meta.env.VITE_DOCS_URL,
  wsURL: import.meta.env.VITE_APP_WS_URL,
  theme: {
    defaultTheme: 'light',
    primaryColor: '#409EFF',
    enableDarkMode: true
  },
  locale: {
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
    availableLocales: ['zh-CN', 'en-US']
  },
  microApps: [
    {
      name: 'logistics',
      entry: '//localhost:8081',
      container: '#subapp-viewport',
      activeRule: (location) => location.pathname.startsWith('/logistics')
    },
    {
      name: 'engineering',
      entry: '//localhost:8082',
      container: '#subapp-viewport',
      activeRule: (location) => location.pathname.startsWith('/engineering')
    },
    {
      name: 'quality',
      entry: '//localhost:8083',
      container: '#subapp-viewport',
      activeRule: (location) => location.pathname.startsWith('/quality')
    },
    {
      name: 'production',
      entry: '//localhost:8084',
      container: '#subapp-viewport',
      activeRule: (location) => location.pathname.startsWith('/production')
    }
  ]
}
```

### Sub-Application Configuration
```typescript
// Sub-application independent configuration
export interface SubAppConfig {
  name: string
  port: number
  publicPath: string
  baseURL: string
  theme: ThemeConfig
  features: string[]
}

export const subAppConfigs: Record<string, SubAppConfig> = {
  logistics: {
    name: 'logistics',
    port: 8081,
    publicPath: '/logistics/',
    baseURL: import.meta.env.VITE_APP_BASE_API,
    theme: {
      primaryColor: '#67C23A',
      enableDarkMode: true
    },
    features: ['inventory', 'shipping', 'warehouse']
  },
  engineering: {
    name: 'engineering',
    port: 8082,
    publicPath: '/engineering/',
    baseURL: import.meta.env.VITE_APP_BASE_API,
    theme: {
      primaryColor: '#E6A23C',
      enableDarkMode: true
    },
    features: ['design', 'cad', 'simulation']
  },
  quality: {
    name: 'quality',
    port: 8083,
    publicPath: '/quality/',
    baseURL: import.meta.env.VITE_APP_BASE_API,
    theme: {
      primaryColor: '#F56C6C',
      enableDarkMode: true
    },
    features: ['inspection', 'testing', 'certification']
  },
  production: {
    name: 'production',
    port: 8084,
    publicPath: '/production/',
    baseURL: import.meta.env.VITE_APP_BASE_API,
    theme: {
      primaryColor: '#909399',
      enableDarkMode: true
    },
    features: ['planning', 'scheduling', 'monitoring']
  }
}
```

## Theme Configuration

### Theme Presets
```typescript
// src/styles/theme.ts
export const THEME_PRESETS = [
  {
    name: 'default',
    label: 'Default Theme',
    color: '#409EFF',
    dark: false
  },
  {
    name: 'green',
    label: 'Green Theme',
    color: '#67C23A',
    dark: false
  },
  {
    name: 'orange',
    label: 'Orange Theme',
    color: '#E6A23C',
    dark: false
  },
  {
    name: 'red',
    label: 'Red Theme',
    color: '#F56C6C',
    dark: false
  },
  {
    name: 'purple',
    label: 'Purple Theme',
    color: '#8E44AD',
    dark: false
  },
  {
    name: 'dark',
    label: 'Dark Theme',
    color: '#409EFF',
    dark: true
  }
]

// CSS variables configuration
export const CSS_VARIABLES = {
  '--el-color-primary': '#409EFF',
  '--el-color-primary-light-1': '#53a8ff',
  '--el-color-primary-light-2': '#66b1ff',
  '--el-color-primary-light-3': '#79bbff',
  '--el-color-primary-light-4': '#8cc5ff',
  '--el-color-primary-light-5': '#a0cfff',
  '--el-color-primary-light-6': '#b3d8ff',
  '--el-color-primary-light-7': '#c6e2ff',
  '--el-color-primary-light-8': '#d9ecff',
  '--el-color-primary-light-9': '#ecf5ff',
  '--el-color-primary-dark-2': '#337ecc'
}
```

### Theme Switching
```typescript
// Theme management
export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: ThemeConfig

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  // Apply theme
  applyTheme(theme: ThemeConfig) {
    this.currentTheme = theme
    this.updateCSSVariables(theme)
    this.updateDocumentClass(theme)
    this.saveTheme(theme)
  }

  // Update CSS variables
  private updateCSSVariables(theme: ThemeConfig) {
    const root = document.documentElement
    const colorPalette = this.generateColorPalette(theme.color)

    Object.entries(colorPalette).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  // Update document class
  private updateDocumentClass(theme: ThemeConfig) {
    const html = document.documentElement
    html.classList.toggle('dark', theme.dark)
    html.classList.toggle(`theme-${theme.name}`, true)
  }

  // Save theme
  private saveTheme(theme: ThemeConfig) {
    localStorage.setItem('theme', JSON.stringify(theme))
  }

  // Generate color palette
  private generateColorPalette(color: string) {
    // Color palette generation logic
    return {
      '--el-color-primary': color,
      // ... other color variables
    }
  }
}
```

## Internationalization Configuration

### Language Configuration
```typescript
// src/locales/index.ts
export interface LocaleConfig {
  locale: string
  fallbackLocale: string
  availableLocales: string[]
  messages: Record<string, any>
}

export const localeConfig: LocaleConfig = {
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  availableLocales: ['zh-CN', 'en-US'],
  messages: {
    'zh-CN': {
      common: {
        confirm: '确认',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        add: '添加',
        search: '搜索',
        reset: '重置'
      },
      menu: {
        dashboard: '仪表盘',
        users: '用户管理',
        roles: '角色管理',
        settings: '系统设置'
      }
    },
    'en-US': {
      common: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        reset: 'Reset'
      },
      menu: {
        dashboard: 'Dashboard',
        users: 'User Management',
        roles: 'Role Management',
        settings: 'System Settings'
      }
    }
  }
}
```

### Date Time Configuration
```typescript
// Date time configuration
export const dateTimeConfig = {
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
  weekdays: {
    'zh-CN': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    'en-US': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  },
  months: {
    'zh-CN': [
      '一月', '二月', '三月', '四月', '五月', '六月',
      '七月', '八月', '九月', '十月', '十一月', '十二月'
    ],
    'en-US': [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
  }
}
```

## Deployment Configuration

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# nginx.conf
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  # Main application
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Sub-application routes
  location /logistics {
    try_files $uri $uri/ /index.html;
  }

  location /engineering {
    try_files $uri $uri/ /index.html;
  }

  location /quality {
    try_files $uri $uri/ /index.html;
  }

  location /production {
    try_files $uri $uri/ /index.html;
  }

  # Documentation application
  location /docs {
    proxy_pass http://docs-server:8085;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # API proxy
  location /api {
    proxy_pass http://api-server:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Static resource cache
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Environment Variables Configuration
```bash
# .env.production
NODE_ENV=production
VITE_APP_TITLE=BTC Workshop Management System
VITE_APP_BASE_API=https://api.btc.com/api
VITE_APP_UPLOAD_URL=https://api.btc.com/upload
VITE_DOCS_URL=https://docs.btc.com
VITE_APP_WS_URL=wss://api.btc.com

# Database configuration
DATABASE_URL=postgresql://user:password@localhost:5432/btc_shopflow
REDIS_URL=redis://localhost:6379

# Third-party services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

## Monitoring Configuration

### Performance Monitoring
```typescript
// Performance monitoring configuration
export const performanceConfig = {
  // Performance metrics collection
  collectMetrics: true,

  // Metrics configuration
  metrics: {
    // Page load time
    pageLoadTime: {
      enabled: true,
      threshold: 3000
    },

    // API response time
    apiResponseTime: {
      enabled: true,
      threshold: 5000
    },

    // Memory usage
    memoryUsage: {
      enabled: true,
      threshold: 100 * 1024 * 1024 // 100MB
    },

    // Error rate
    errorRate: {
      enabled: true,
      threshold: 0.05 // 5%
    }
  },

  // Reporting configuration
  reporting: {
    endpoint: '/api/metrics',
    interval: 30000, // 30 seconds
    batchSize: 100
  }
}
```

### Error Monitoring
```typescript
// Error monitoring configuration
export const errorConfig = {
  // Error collection
  collectErrors: true,

  // Error types
  errorTypes: [
    'javascript',
    'promise',
    'resource',
    'fetch',
    'xhr'
  ],

  // Error filters
  filters: [
    // Filter known errors
    (error: Error) => error.message.includes('Script error'),
    // Filter third-party errors
    (error: Error) => error.stack?.includes('chrome-extension://')
  ],

  // Reporting configuration
  reporting: {
    endpoint: '/api/errors',
    maxErrors: 100,
    rateLimit: 10 // Maximum 10 errors per minute
  }
}
```

## Related Documentation

- [Environment Configuration Guide](./environment.md)
- [Deployment Configuration Guide](./deployment.md)
- [System Integration Guide](../integration/index.md)
