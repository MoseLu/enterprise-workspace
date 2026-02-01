# CORS 配置说明

## 问题描述

在生产环境中，当子应用（如 `admin.bellis.com.cn`）尝试加载布局应用（`layout.bellis.com.cn`）的资源时，可能会遇到 CORS 错误：

```
Access to XMLHttpRequest at 'https://layout.bellis.com.cn/...' from origin 'https://admin.bellis.com.cn' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

## 原因

当请求使用 `credentials: 'include'` 时，服务器不能返回 `Access-Control-Allow-Origin: *`，必须返回具体的源（origin）。

## 解决方案

### Nginx 配置示例

在 `layout.bellis.com.cn` 的 Nginx 配置中添加以下 CORS 头：

```nginx
server {
    listen 443 ssl;
    server_name layout.bellis.com.cn;
    
    # SSL 配置...
    
    location / {
        root /www/wwwroot/layout.bellis.com.cn;
        index index.html;
        
        # CORS 配置：根据请求的 Origin 动态设置
        if ($http_origin) {
            set $cors_origin $http_origin;
        }
        
        # 允许的源列表（根据实际情况调整）
        if ($http_origin ~* "^https?://(admin|logistics|finance|quality|production|engineering|monitor|system)\.bellis\.com\.cn$") {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id' always;
        }
        
        # 处理 OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id' always;
            add_header 'Access-Control-Max-Age' '86400' always;
            add_header 'Content-Length' '0' always;
            add_header 'Content-Type' 'text/plain' always;
            return 204;
        }
        
        try_files $uri $uri/ /index.html;
    }
}
```

### 更简洁的配置（推荐）

如果所有子应用都在 `*.bellis.com.cn` 域名下，可以使用更简洁的配置：

```nginx
server {
    listen 443 ssl;
    server_name layout.bellis.com.cn;
    
    # SSL 配置...
    
    location / {
        root /www/wwwroot/layout.bellis.com.cn;
        index index.html;
        
        # CORS 配置：允许所有 bellis.com.cn 子域名
        if ($http_origin ~* "^https?://.*\.bellis\.com\.cn$") {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id' always;
        }
        
        # 处理 OPTIONS 预检请求
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id' always;
            add_header 'Access-Control-Max-Age' '86400' always;
            add_header 'Content-Length' '0' always;
            add_header 'Content-Type' 'text/plain' always;
            return 204;
        }
        
        try_files $uri $uri/ /index.html;
    }
}
```

## 注意事项

1. **静态资源请求**：对于静态资源（JS、CSS 文件），代码中已经使用 `credentials: 'omit'`，这样可以避免 CORS 问题。但如果服务器返回 `Access-Control-Allow-Origin: *`，仍然可以正常工作。

2. **API 请求**：对于 API 请求（如 `/api/system/base/profile/info`），如果使用了 `credentials: 'include'`，服务器必须返回具体的源，不能使用通配符。

3. **版本号查询参数**：从 HTML 提取的脚本 URL 可能包含版本号（如 `?v=xxx`），但实际文件路径不包含版本号。代码已经自动移除版本号查询参数，确保文件路径正确。

## 验证

配置完成后，可以通过以下方式验证：

1. 在浏览器开发者工具中检查网络请求的响应头，确认 `Access-Control-Allow-Origin` 是否正确设置。
2. 检查控制台是否还有 CORS 错误。
3. 确认布局应用能够正常加载。

