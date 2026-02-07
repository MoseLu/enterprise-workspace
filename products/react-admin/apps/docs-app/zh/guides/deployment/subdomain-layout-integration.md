---
title: 子域名访问时使用主应用 Layout 的实现方案（无重定向）
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- subdomain
- layout
sidebar_label: 子域名布局集成
sidebar_order: 12
sidebar_group: deployment
---

# 子域名访问时使用主应用 Layout 的实现方案（无重定向）

## 📋 概述

在生产环境中，当用户通过子域名（如 `quality.bellis.com.cn`）访问时，主应用会自动识别子域名并加载对应的子应用，同时显示主应用的统一 Layout（顶部导航、侧边栏、面包屑等）。**不会进行重定向，URL 保持为子域名**。

## 🏗️ 架构设计

### 整体流程

```
用户访问 quality.bellis.com.cn
    ↓
Nginx 将请求代理到主应用容器（main-app）
    ↓
主应用检测到子域名 quality.bellis.com.cn
    ↓
主应用路由自动跳转到 /quality（URL 仍为 quality.bellis.com.cn）
    ↓
主应用显示 Layout
    ↓
qiankun 检测到子域名或路径匹配，加载 quality-app
    ↓
子应用从 quality.bellis.com.cn 加载资源（跨域）
    ↓
用户看到完整的界面（Layout + 子应用内容，URL 为 quality.bellis.com.cn）
```

### 关键组件

1. **主应用（main-app）**
   - 域名：`bellis.com.cn` 和所有子域名（通过 Nginx 配置）
   - 职责：提供统一的 Layout，根据子域名/路径加载对应子应用
   - 技术：Vue 3 + qiankun

2. **子应用（quality-app, logistics-app 等）**
   - 域名：`quality.bellis.com.cn` 等（独立部署）
   - 职责：仅渲染业务内容，无独立 Layout
   - 技术：Vue 3 + vite-plugin-qiankun

## 🔧 实现细节

### 1. Nginx 配置（关键）

**所有子域名都指向主应用容器**，主应用负责根据子域名加载对应的子应用：

```nginx
# 主应用 - 根域名
server {
  listen 80;
  server_name bellis.com.cn;
  
  location / {
    proxy_pass http://127.0.0.1:30080;  # main-app 容器
    # ... 其他配置
  }
}

# 子域名也指向主应用容器
server {
  listen 80;
  server_name quality.bellis.com.cn;
  
  location / {
    proxy_pass http://127.0.0.1:30080;  # 同样指向 main-app 容器
    # ... 其他配置
  }
}

# 子应用的静态资源服务器（用于 qiankun 加载）
server {
  listen 80;
  server_name quality.bellis.com.cn;
  
  # 静态资源路径
  location ~ ^/(assets|icons|images)/ {
    root /usr/share/nginx/html/quality-app;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET,OPTIONS;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  # 其他请求代理到主应用
  location / {
    proxy_pass http://127.0.0.1:30080;  # main-app 容器
  }
}
```

### 2. 主应用路由处理

主应用在路由守卫中检测子域名，自动跳转到对应路径：

```typescript
// apps/main-app/src/router/index.ts

const subdomainToPathMap: Record<string, string> = {
  'admin.bellis.com.cn': '/admin',
  'logistics.bellis.com.cn': '/logistics',
  'quality.bellis.com.cn': '/quality',
  'production.bellis.com.cn': '/production',
  'engineering.bellis.com.cn': '/engineering',
  'finance.bellis.com.cn': '/finance',
};

router.beforeEach((to, from, next) => {
  // 只在根路径且是子域名时进行跳转
  if (to.path === '/' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const subdomainPath = subdomainToPathMap[hostname];
    
    if (subdomainPath) {
      // 保留查询参数和 hash
      const query = to.query;
      const hash = to.hash;
      const fullPath = subdomainPath + (hash || '');
      
      console.log(`[Subdomain Router] 检测到子域名 ${hostname}，跳转到 ${fullPath}`);
      next({ path: fullPath, query });
      return;
    }
  }
  
  next();
});
```

### 3. qiankun 配置

qiankun 的 `activeRule` 同时支持路径匹配和子域名匹配：

```typescript
// apps/main-app/src/micro/apps.ts

export const microApps: MicroAppConfig[] = [
  {
    name: 'quality',
    entry: getAppEntry('quality'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // 支持路径匹配：/quality 开头
      if (location.pathname.startsWith('/quality')) {
        return true;
      }
      // 支持子域名匹配：quality.bellis.com.cn
      const subdomainPath = getPathFromSubdomain(location.hostname);
      return subdomainPath === '/quality';
    },
  },
  // ... 其他子应用
];
```

### 4. 子应用入口地址

在生产环境，如果当前访问的是对应子应用的子域名，使用子域名作为入口：

```typescript
// apps/main-app/src/micro/apps.ts

case 'production':
  // 生产环境：根据子域名判断使用子域名还是相对路径
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const subdomainMap: Record<string, string> = {
      'quality.bellis.com.cn': 'quality',
      // ... 其他映射
    };
    
    // 如果当前访问的是对应子应用的子域名，使用子域名作为入口
    if (subdomainMap[hostname] === appName) {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/`;
    }
  }
  // 否则使用相对路径
  return `/${appName}/`;
```

## 🔄 工作流程

### 场景 1：用户通过子域名访问

1. 用户访问 `https://quality.bellis.com.cn/`
2. Nginx 将请求代理到主应用容器（main-app）
3. 主应用加载，路由守卫检测到子域名 `quality.bellis.com.cn`
4. 自动跳转到 `/quality`（URL 仍为 `quality.bellis.com.cn/quality`）
5. 主应用显示 Layout
6. qiankun 检测到子域名或路径 `/quality`，加载 `quality-app`
7. 子应用从 `quality.bellis.com.cn` 加载资源（跨域，需要 CORS 配置）
8. 子应用挂载到主应用的 `#subapp-viewport` 容器
9. 用户看到完整的界面（Layout + 子应用内容，URL 为 `quality.bellis.com.cn/quality`）

### 场景 2：用户通过主应用访问

1. 用户访问 `https://bellis.com.cn/quality/`
2. 主应用加载，显示 Layout
3. qiankun 检测到路径 `/quality`，加载 `quality-app`
4. 子应用从 `quality.bellis.com.cn` 加载资源
5. 用户看到完整的界面

### 场景 3：开发环境

1. 开发环境使用端口访问（如 `localhost:8080/quality`）
2. 主应用路由正常跳转
3. qiankun 使用开发端口加载子应用
4. 正常工作

## ✅ 优势

1. **URL 保持子域名**：用户访问 `quality.bellis.com.cn` 时，URL 不会改变
2. **统一体验**：所有子应用共享同一套 Layout，用户体验一致
3. **开发友好**：开发环境仍可独立运行子应用
4. **向后兼容**：不影响现有的 qiankun 集成

## 🌐 Nginx 配置示例

### 完整配置示例

```nginx
# 主应用 - 根域名
server {
  listen 80;
  server_name bellis.com.cn;
  
  location / {
    proxy_pass http://127.0.0.1:30080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}

# 子域名 - quality.bellis.com.cn
server {
  listen 80;
  server_name quality.bellis.com.cn;
  
  # 静态资源（从子应用容器加载）
  location ~ ^/(assets|icons|images|index.html)$ {
    proxy_pass http://127.0.0.1:30083;  # quality-app 容器
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET,OPTIONS;
    add_header Access-Control-Allow-Headers Content-Type;
  }
  
  # 其他请求代理到主应用
  location / {
    proxy_pass http://127.0.0.1:30080;  # main-app 容器
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 🧪 测试

### 测试步骤

1. **测试子域名访问**
   - 访问 `https://quality.bellis.com.cn/`
   - 应该自动跳转到 `https://quality.bellis.com.cn/quality`
   - 应该看到完整的 Layout + 子应用内容
   - URL 应该保持为 `quality.bellis.com.cn`

2. **测试主应用访问**
   - 访问 `https://bellis.com.cn/quality/`
   - 应该直接显示完整的 Layout + 子应用内容

3. **测试开发环境**
   - 访问 `http://localhost:8080/quality/`
   - 应该正常工作

## 📝 注意事项

1. **跨域问题**
   - 子应用的静态资源需要配置 CORS 头，允许主应用域名访问
   - 子应用的接口请求需要配置 `withCredentials: true`

2. **Cookie 和 LocalStorage**
   - 如果需要跨子域名共享状态，需要设置 Cookie 的 `domain` 为 `.bellis.com.cn`
   - LocalStorage 默认不跨域，需要通过 qiankun 的全局状态管理

3. **路由同步**
   - 子应用使用 MemoryHistory 避免路由冲突
   - 主应用使用 WebHistory 管理全局路由

4. **性能优化**
   - 子应用的静态资源应该配置 CDN
   - 主应用可以预加载子应用资源（qiankun prefetch）

## 🔗 相关文档

- [qiankun 官方文档](https://qiankun.umijs.org/)
- [Nginx 子域名反向代理配置](./nginx-subdomain-proxy.md)
- [K8s 域名配置](../k8s/DOMAIN_CONFIG.md)
