---
title: 系统配置指南
type: guide
project: system
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- system
- configuration
sidebar_label: 系统配置
sidebar_order: 5
sidebar_group: system
---

# 系统配置指南

BTC 车间管理系统的配置管理和部署指南

## 配置概览

系统配置包括环境配置应用配置主题配置等多个方面，确保系统在不同环境下正常运行

## 环境配置

### 开发环境
```bash
# .env.development
NODE_ENV=development
VITE_APP_TITLE=BTC车间管理系统(开发)
VITE_APP_BASE_API=http://localhost:3000/api
VITE_APP_UPLOAD_URL=http://localhost:3000/upload
VITE_DOCS_URL=http://localhost:8085
VITE_APP_WS_URL=ws://localhost:3000
```

### 测试环境
```bash
# .env.staging
NODE_ENV=staging
VITE_APP_TITLE=BTC车间管理系统(测试)
VITE_APP_BASE_API=https://test-api.btc.com/api
VITE_APP_UPLOAD_URL=https://test-api.btc.com/upload
VITE_DOCS_URL=https://test-docs.btc.com
VITE_APP_WS_URL=wss://test-api.btc.com
```

### 生产环境
```bash
# .env.production
NODE_ENV=production
VITE_APP_TITLE=BTC车间管理系统
VITE_APP_BASE_API=https://api.btc.com/api
VITE_APP_UPLOAD_URL=https://api.btc.com/upload
VITE_DOCS_URL=https://docs.btc.com
VITE_APP_WS_URL=wss://api.btc.com
```

## 应用配置

### 主应用配置
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

### 子应用配置
```typescript
// 子应用独立配置
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

## 主题配置

### 主题预设
```typescript
// src/styles/theme.ts
export const THEME_PRESETS = [
{
name: 'default',
label: '默认主题',
color: '#409EFF',
dark: false
},
{
name: 'green',
label: '绿色主题',
color: '#67C23A',
dark: false
},
{
name: 'orange',
label: '橙色主题',
color: '#E6A23C',
dark: false
},
{
name: 'red',
label: '红色主题',
color: '#F56C6C',
dark: false
},
{
name: 'purple',
label: '紫色主题',
color: '#8E44AD',
dark: false
},
{
name: 'dark',
label: '暗黑主题',
color: '#409EFF',
dark: true
}
]

// CSS 变量配置
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

### 主题切换
```typescript
// 主题管理
export class ThemeManager {
private static instance: ThemeManager
private currentTheme: ThemeConfig

static getInstance(): ThemeManager {
if (!ThemeManager.instance) {
ThemeManager.instance = new ThemeManager()
}
return ThemeManager.instance
}

// 应用主题
applyTheme(theme: ThemeConfig) {
this.currentTheme = theme
this.updateCSSVariables(theme)
this.updateDocumentClass(theme)
this.saveTheme(theme)
}

// 更新CSS变量
private updateCSSVariables(theme: ThemeConfig) {
const root = document.documentElement
const colorPalette = this.generateColorPalette(theme.color)

Object.entries(colorPalette).forEach(([key, value]) => {
root.style.setProperty(key, value)
})
}

// 更新文档类
private updateDocumentClass(theme: ThemeConfig) {
const html = document.documentElement
html.classList.toggle('dark', theme.dark)
html.classList.toggle(`theme-${theme.name}`, true)
}

// 保存主题
private saveTheme(theme: ThemeConfig) {
localStorage.setItem('theme', JSON.stringify(theme))
}

// 生成颜色调色板
private generateColorPalette(color: string) {
// 颜色调色板生成逻辑
return {
'--el-color-primary': color,
// ... 其他颜色变量
}
}
}
```

## 国际化配置

### 语言配置
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

### 日期时间配置
```typescript
// 日期时间配置
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

## 部署配置

### Docker 配置
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

### Nginx 配置
```nginx
# nginx.conf
server {
listen 80;
server_name localhost;
root /usr/share/nginx/html;
index index.html;

# 主应用
location / {
try_files $uri $uri/ /index.html;
}

# 子应用路由
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

# 文档应用
location /docs {
proxy_pass http://docs-server:8085;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
}

# API 代理
location /api {
proxy_pass http://api-server:3000;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
}

# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
expires 1y;
add_header Cache-Control "public, immutable";
}
}
```

### 环境变量配置
```bash
# .env.production
NODE_ENV=production
VITE_APP_TITLE=BTC车间管理系统
VITE_APP_BASE_API=https://api.btc.com/api
VITE_APP_UPLOAD_URL=https://api.btc.com/upload
VITE_DOCS_URL=https://docs.btc.com
VITE_APP_WS_URL=wss://api.btc.com

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/btc_shopflow
REDIS_URL=redis://localhost:6379

# 第三方服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

## 监控配置

### 性能监控
```typescript
// 性能监控配置
export const performanceConfig = {
// 性能指标收集
collectMetrics: true,

// 指标配置
metrics: {
// 页面加载时间
pageLoadTime: {
enabled: true,
threshold: 3000
},

// API 响应时间
apiResponseTime: {
enabled: true,
threshold: 5000
},

// 内存使用
memoryUsage: {
enabled: true,
threshold: 100 * 1024 * 1024 // 100MB
},

// 错误率
errorRate: {
enabled: true,
threshold: 0.05 // 5%
}
},

// 上报配置
reporting: {
endpoint: '/api/metrics',
interval: 30000, // 30秒
batchSize: 100
}
}
```

### 错误监控
```typescript
// 错误监控配置
export const errorConfig = {
// 错误收集
collectErrors: true,

// 错误类型
errorTypes: [
'javascript',
'promise',
'resource',
'fetch',
'xhr'
],

// 错误过滤
filters: [
// 过滤已知错误
(error: Error) => error.message.includes('Script error'),
// 过滤第三方错误
(error: Error) => error.stack?.includes('chrome-extension://')
],

// 上报配置
reporting: {
endpoint: '/api/errors',
maxErrors: 100,
rateLimit: 10 // 每分钟最多10个错误
}
}
```

## 相关文档

- [环境配置指南](./environment.md)
- [部署配置指南](./deployment.md)
- [系统集成指南](../integration/index.md)
