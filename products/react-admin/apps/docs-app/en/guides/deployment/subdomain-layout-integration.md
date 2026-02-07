---
title: Subdomain Access Using Main App Layout Implementation (No Redirect)
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
sidebar_label: Subdomain Layout Integration
sidebar_order: 12
sidebar_group: deployment
---

# Subdomain Access Using Main App Layout Implementation (No Redirect)

## Overview

In production environments, when users access via subdomain (such as `quality.bellis.com.cn`), the main application automatically recognizes the subdomain and loads the corresponding sub-application, while displaying the main application's unified Layout (top navigation, sidebar, breadcrumb, etc.). **No redirect occurs, URL remains as subdomain**.

## Architecture Design

### Overall Flow

```
User accesses quality.bellis.com.cn
    ↓
Nginx proxies request to main app container (main-app)
    ↓
Main app detects subdomain quality.bellis.com.cn
    ↓
Main app route automatically jumps to /quality (URL still quality.bellis.com.cn)
    ↓
Main app displays Layout
    ↓
qiankun detects subdomain or path match, loads quality-app
    ↓
Sub-app loads resources from quality.bellis.com.cn (cross-origin)
    ↓
User sees complete interface (Layout + sub-app content, URL is quality.bellis.com.cn)
```

### Key Components

1. **Main App (main-app)**
   - Domain: `bellis.com.cn` and all subdomains (via Nginx configuration)
   - Responsibility: Provides unified Layout, loads corresponding sub-app based on subdomain/path
   - Technology: Vue 3 + qiankun

2. **Sub-Apps (quality-app, logistics-app, etc.)**
   - Domain: `quality.bellis.com.cn` etc. (independent deployment)
   - Responsibility: Only render business content, no independent Layout
   - Technology: Vue 3 + vite-plugin-qiankun

## Implementation Details

### 1. Nginx Configuration (Key)

**All subdomains point to main app container**, main app is responsible for loading corresponding sub-app based on subdomain:

```nginx
# Main app - root domain
server {
  listen 80;
  server_name bellis.com.cn;
  
  location / {
    proxy_pass http://127.0.0.1:30080;  # main-app container
    # ... other configurations
  }
}

# Subdomain also points to main app container
server {
  listen 80;
  server_name quality.bellis.com.cn;
  
  location / {
    proxy_pass http://127.0.0.1:30080;  # Also points to main-app container
    # ... other configurations
  }
}

# Sub-app static resource server (for qiankun loading)
server {
  listen 80;
  server_name quality.bellis.com.cn;
  
  # Static resource paths
  location ~ ^/(assets|icons|images)/ {
    root /usr/share/nginx/html/quality-app;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET,OPTIONS;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  # Other requests proxy to main app
  location / {
    proxy_pass http://127.0.0.1:30080;  # main-app container
  }
}
```

### 2. Main App Route Handling

Main app detects subdomain in route guard and automatically jumps to corresponding path:

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
  // Only jump when at root path and on subdomain
  if (to.path === '/' && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const subdomainPath = subdomainToPathMap[hostname];
    
    if (subdomainPath) {
      // Preserve query parameters and hash
      const query = to.query;
      const hash = to.hash;
      const fullPath = subdomainPath + (hash || '');
      
      console.log(`[Subdomain Router] Detected subdomain ${hostname}, jumping to ${fullPath}`);
      next({ path: fullPath, query });
      return;
    }
  }
  
  next();
});
```

### 3. qiankun Configuration

qiankun's `activeRule` supports both path matching and subdomain matching:

```typescript
// apps/main-app/src/micro/apps.ts

export const microApps: MicroAppConfig[] = [
  {
    name: 'quality',
    entry: getAppEntry('quality'),
    container: '#subapp-viewport',
    activeRule: (location) => {
      // Support path matching: /quality prefix
      if (location.pathname.startsWith('/quality')) {
        return true;
      }
      // Support subdomain matching: quality.bellis.com.cn
      const subdomainPath = getPathFromSubdomain(location.hostname);
      return subdomainPath === '/quality';
    },
  },
  // ... other sub-apps
];
```

### 4. Sub-App Entry Address

In production environment, if currently accessing the corresponding sub-app's subdomain, use subdomain as entry:

```typescript
// apps/main-app/src/micro/apps.ts

case 'production':
  // Production environment: judge whether to use subdomain or relative path based on subdomain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const subdomainMap: Record<string, string> = {
      'quality.bellis.com.cn': 'quality',
      // ... other mappings
    };
    
    // If currently accessing corresponding sub-app's subdomain, use subdomain as entry
    if (subdomainMap[hostname] === appName) {
      const protocol = window.location.protocol;
      return `${protocol}//${hostname}/`;
    }
  }
  // Otherwise use relative path
  return `/${appName}/`;
```

## Workflow

### Scenario 1: User Accesses via Subdomain

1. User accesses `https://quality.bellis.com.cn/`
2. Nginx proxies request to main app container (main-app)
3. Main app loads, route guard detects subdomain `quality.bellis.com.cn`
4. Automatically jumps to `/quality` (URL still `quality.bellis.com.cn/quality`)
5. Main app displays Layout
6. qiankun detects subdomain or path `/quality`, loads `quality-app`
7. Sub-app loads resources from `quality.bellis.com.cn` (cross-origin, requires CORS configuration)
8. Sub-app mounts to main app's `#subapp-viewport` container
9. User sees complete interface (Layout + sub-app content, URL is `quality.bellis.com.cn/quality`)

### Scenario 2: User Accesses via Main App

1. User accesses `https://bellis.com.cn/quality/`
2. Main app loads, displays Layout
3. qiankun detects path `/quality`, loads `quality-app`
4. Sub-app loads resources from `quality.bellis.com.cn`
5. User sees complete interface

### Scenario 3: Development Environment

1. Development environment uses port access (e.g., `localhost:8080/quality`)
2. Main app routes normally
3. qiankun uses development port to load sub-app
4. Works normally

## Advantages

1. **URL Remains Subdomain**: When user accesses `quality.bellis.com.cn`, URL does not change
2. **Unified Experience**: All sub-apps share the same Layout, consistent user experience
3. **Development Friendly**: Development environment can still run sub-apps independently
4. **Backward Compatible**: Does not affect existing qiankun integration

## Nginx Configuration Example

### Complete Configuration Example

```nginx
# Main app - root domain
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

# Subdomain - quality.bellis.com.cn
server {
  listen 80;
  server_name quality.bellis.com.cn;
  
  # Static resources (loaded from sub-app container)
  location ~ ^/(assets|icons|images|index.html)$ {
    proxy_pass http://127.0.0.1:30083;  # quality-app container
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods GET,OPTIONS;
    add_header Access-Control-Allow-Headers Content-Type;
  }
  
  # Other requests proxy to main app
  location / {
    proxy_pass http://127.0.0.1:30080;  # main-app container
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## Testing

### Test Steps

1. **Test Subdomain Access**
   - Access `https://quality.bellis.com.cn/`
   - Should automatically jump to `https://quality.bellis.com.cn/quality`
   - Should see complete Layout + sub-app content
   - URL should remain as `quality.bellis.com.cn`

2. **Test Main App Access**
   - Access `https://bellis.com.cn/quality/`
   - Should directly display complete Layout + sub-app content

3. **Test Development Environment**
   - Access `http://localhost:8080/quality/`
   - Should work normally

## Notes

1. **Cross-Origin Issues**
   - Sub-app static resources need to configure CORS headers, allowing main app domain access
   - Sub-app API requests need to configure `withCredentials: true`

2. **Cookie and LocalStorage**
   - If cross-subdomain state sharing is needed, need to set Cookie `domain` to `.bellis.com.cn`
   - LocalStorage does not cross domains by default, need to use qiankun's global state management

3. **Route Synchronization**
   - Sub-apps use MemoryHistory to avoid route conflicts
   - Main app uses WebHistory to manage global routes

4. **Performance Optimization**
   - Sub-app static resources should configure CDN
   - Main app can preload sub-app resources (qiankun prefetch)

## Related Documentation

- [qiankun Official Documentation](https://qiankun.umijs.org/)
- [Nginx Subdomain Reverse Proxy Configuration](./nginx-subdomain-proxy.md)
- [K8s Domain Configuration](../k8s/DOMAIN_CONFIG.md)
