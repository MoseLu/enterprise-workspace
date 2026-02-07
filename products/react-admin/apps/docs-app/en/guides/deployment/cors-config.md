---
title: CORS Configuration Guide
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-27'
updated: '2025-01-27'
publish: true
tags:
- guides
- deployment
- cors
- nginx
sidebar_label: CORS Configuration
sidebar_order: 2
sidebar_group: deployment
---

# CORS Configuration Guide

## Problem Description

In production environments, when sub-applications (such as `admin.bellis.com.cn`) try to load resources from the layout application (`layout.bellis.com.cn`), CORS errors may occur:

```
Access to XMLHttpRequest at 'https://layout.bellis.com.cn/...' from origin 'https://admin.bellis.com.cn' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

## Cause

When requests use `credentials: 'include'`, the server cannot return `Access-Control-Allow-Origin: *`, it must return a specific origin.

## Solution

### Nginx Configuration Example

Add the following CORS headers to the Nginx configuration for `layout.bellis.com.cn`:

```nginx
server {
    listen 443 ssl;
    server_name layout.bellis.com.cn;
    
    # SSL configuration...
    
    location / {
        root /www/wwwroot/layout.bellis.com.cn;
        index index.html;
        
        # CORS configuration: dynamically set based on request Origin
        if ($http_origin) {
            set $cors_origin $http_origin;
        }
        
        # Allowed origin list (adjust based on actual situation)
        if ($http_origin ~* "^https?://(admin|logistics|finance|quality|production|engineering|monitor|system)\.bellis\.com\.cn$") {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id' always;
        }
        
        # Handle OPTIONS preflight requests
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

### Simpler Configuration (Recommended)

If all sub-applications are under the `*.bellis.com.cn` domain, you can use a simpler configuration:

```nginx
server {
    listen 443 ssl;
    server_name layout.bellis.com.cn;
    
    # SSL configuration...
    
    location / {
        root /www/wwwroot/layout.bellis.com.cn;
        index index.html;
        
        # CORS configuration: allow all bellis.com.cn subdomains
        if ($http_origin ~* "^https?://.*\.bellis\.com\.cn$") {
            add_header 'Access-Control-Allow-Origin' $http_origin always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-Tenant-Id' always;
        }
        
        # Handle OPTIONS preflight requests
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

## Notes

1. **Static Resource Requests**: For static resources (JS, CSS files), the code already uses `credentials: 'omit'`, which can avoid CORS issues. However, if the server returns `Access-Control-Allow-Origin: *`, it can still work normally.

2. **API Requests**: For API requests (such as `/api/system/base/profile/info`), if `credentials: 'include'` is used, the server must return a specific origin, wildcards cannot be used.

3. **Version Query Parameters**: Script URLs extracted from HTML may contain version numbers (such as `?v=xxx`), but the actual file path does not contain version numbers. The code automatically removes version query parameters to ensure correct file paths.

## Verification

After configuration, you can verify by:

1. Check the network request response headers in the browser developer tools to confirm `Access-Control-Allow-Origin` is set correctly.
2. Check if there are still CORS errors in the console.
3. Confirm that the layout application can load normally.
