# CDN 资源加速方案总结文档

## 方案概述

本方案实现了静态资源（JS、CSS、图片、SVG、字体等）的 CDN 加速，通过构建时修改 HTML 资源 URL 和运行时资源加载器实现三级降级策略：**CDN → OSS → 本地**。

### 核心特性

1. **构建时 URL 转换**：在 Vite 构建阶段自动将静态资源 URL 转换为 CDN URL
2. **运行时降级策略**：自动检测资源可用性，实现 CDN → OSS → 本地的三级降级
3. **布局应用支持**：支持当前应用资源（`/assets/`）和布局应用资源（`/assets/layout/`）
4. **动态导入拦截**：自动拦截 `import()` 调用，使用资源加载器加载资源
5. **智能资源识别**：自动识别资源类型和应用归属，应用对应的降级策略

## 架构设计

### 资源请求流程

```
浏览器请求资源
    ↓
识别资源类型
    ↓
静态资源 (/assets/ 或 /assets/layout/) → 资源加载器
    ↓
识别应用归属
    ↓
尝试 CDN (all.bellis.com.cn)
    ├─ 成功 → 返回资源
    └─ 失败 → 尝试 OSS (bellis1.oss-cn-shenzhen.aliyuncs.com)
        ├─ 成功 → 返回资源
        └─ 失败 → 回退本地 (nginx 服务器)
            └─ 返回资源
```

### 资源路径映射

#### 当前应用资源
- **原始路径**：`/assets/xxx.js`
- **CDN 路径**：`https://all.bellis.com.cn/{appName}/assets/xxx.js`
- **OSS 路径**：`https://bellis1.oss-cn-shenzhen.aliyuncs.com/{appName}/assets/xxx.js`
- **本地路径**：`/assets/xxx.js`（nginx 服务器）

#### 布局应用资源
- **原始路径**：`/assets/layout/xxx.js`
- **CDN 路径**：`https://all.bellis.com.cn/layout-app/assets/layout/xxx.js`
- **OSS 路径**：`https://bellis1.oss-cn-shenzhen.aliyuncs.com/layout-app/assets/layout/xxx.js`
- **本地路径**：`/assets/layout/xxx.js`（nginx 服务器，通常代理到 layout.bellis.com.cn）

## 实现细节

### 1. 构建时 CDN URL 转换插件

**文件**：`configs/vite/plugins/cdn-assets.ts`

#### 功能
- 在 `transformIndexHtml` 阶段修改 HTML 中的资源 URL
- 将 `/assets/` 和 `/assets/layout/` 路径转换为 CDN URL
- 保留版本号参数（`?v=xxx`）
- 支持环境变量控制（开发环境可禁用）

#### 转换规则
```typescript
// 当前应用资源
/assets/xxx.js → https://all.bellis.com.cn/{appName}/assets/xxx.js

// 布局应用资源
/assets/layout/xxx.js → https://all.bellis.com.cn/layout-app/assets/layout/xxx.js
```

#### 处理范围
- `<script src="/assets/xxx.js">` 标签
- `<link href="/assets/xxx.css">` 标签
- `<img src="/assets/xxx.png">` 标签
- 动态导入 `import('/assets/xxx.js')`（在 HTML 模板中）

### 2. 运行时资源加载器

**文件**：`packages/shared-core/src/btc/utils/resource-loader.ts`

#### 核心接口
```typescript
interface ResourceLoaderOptions {
  appName: string;        // 应用名称，如 'admin-app'
  timeout?: number;       // 超时时间（默认 5 秒）
}

function loadResource(
  url: string, 
  options: ResourceLoaderOptions
): Promise<Response>
```

#### 降级策略实现
1. **CDN 源检测**：使用 `fetch` 请求 CDN URL，设置超时时间
2. **OSS 源降级**：CDN 失败后自动切换到 OSS 源
3. **本地源降级**：OSS 失败后回退到原始 URL（本地 nginx）
4. **缓存机制**：成功加载的源会被缓存，失败的源会被标记，短时间内不再尝试

#### 资源识别逻辑
```typescript
// 自动识别资源类型
if (url.includes('/assets/layout/')) {
  // 布局应用资源
  appName = 'layout-app';
  cdnPath = `https://all.bellis.com.cn/layout-app/assets/layout/...`;
} else if (url.includes('/assets/')) {
  // 当前应用资源
  appName = currentAppName;
  cdnPath = `https://all.bellis.com.cn/${appName}/assets/...`;
}
```

### 3. 动态导入拦截器

**文件**：`packages/shared-core/src/btc/utils/dynamic-import-interceptor.ts`

#### 功能
- 拦截 `import()` 调用
- 识别 `/assets/` 和 `/assets/layout/` 路径的资源
- 使用资源加载器加载资源
- 执行模块代码，保持 ES 模块语义

#### 实现方式
```typescript
// 拦截原生 import()
const originalImport = window.import;
window.import = function(specifier: string) {
  if (specifier.includes('/assets/')) {
    // 使用资源加载器加载
    return loadResourceWithFallback(specifier)
      .then(response => response.text())
      .then(code => evalModule(code));
  }
  return originalImport(specifier);
};
```

### 4. HTML 注入脚本

在 HTML 的 `<head>` 中注入资源加载器初始化脚本，确保在应用代码加载前就准备好。

```html
<script>
  // 资源加载器初始化代码
  window.__BTC_RESOURCE_LOADER__ = {
    loadResource: function(url, options) { ... },
    // ...
  };
</script>
```

## 配置说明

### 环境变量

- `ENABLE_CDN_ACCELERATION`：是否启用 CDN 加速（默认：生产环境启用）
- `CDN_TIMEOUT`：CDN 请求超时时间（默认：5000ms）
- `CDN_DOMAIN`：CDN 域名（默认：`all.bellis.com.cn`）
- `OSS_DOMAIN`：OSS 域名（默认：`bellis1.oss-cn-shenzhen.aliyuncs.com`）

### 应用名称映射

从 `appName`（如 'admin-app'）到 CDN 路径的映射：

| 应用名称 | CDN 路径 |
|---------|---------|
| `admin-app` | `admin-app` |
| `system-app` | `system-app` |
| `layout-app` | `layout-app` |
| `logistics-app` | `logistics-app` |
| ... | ... |

## 资源识别规则

### 处理的资源

- **路径**：`/assets/` 和 `/assets/layout/` 下的所有文件
- **文件类型**：`.js`, `.mjs`, `.css`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.woff`, `.woff2`, `.ttf`, `.otf`, `.webp`, `.json`, `.webmanifest`

### 不处理的资源

- **EPS 相关请求**：都是后端 API，不会出现在静态资源中
- **应用间通信**：全局 API 请求
- **API 请求**：`/api/` 路径下的请求

## 错误处理

### 超时处理
- CDN 请求超时：默认 5 秒
- OSS 请求超时：默认 5 秒
- 超时后自动切换到下一个源

### 错误类型
- **网络错误**：自动切换到下一个源
- **404 错误**：自动切换到下一个源
- **CORS 错误**：自动切换到下一个源

### 缓存策略
- **成功加载的源**：会被缓存，短时间内直接使用
- **失败的源**：会被标记，短时间内不再尝试
- **缓存时间**：默认 5 分钟

## 使用说明

### 开发环境

开发环境默认**不启用** CDN 加速，直接使用本地资源。如需启用，设置环境变量：

```bash
ENABLE_CDN_ACCELERATION=true
```

### 生产环境

生产环境默认**启用** CDN 加速。构建时会自动：
1. 将 HTML 中的资源 URL 转换为 CDN URL
2. 注入资源加载器脚本
3. 配置动态导入拦截器

### 调试

在浏览器控制台可以查看资源加载情况：

```javascript
// 查看资源加载器状态
window.__BTC_RESOURCE_LOADER__

// 查看资源加载日志
window.__BTC_RESOURCE_LOADER__.getLogs()
```

## 注意事项

### 1. 微前端兼容性

- 确保在 qiankun 环境下资源加载器能正确识别应用名称
- 子应用的资源路径需要正确映射到对应的应用名称

### 2. CORS 配置

#### OSS 跨域规则配置

在阿里云 OSS 控制台配置跨域规则，允许以下源访问：
- `https://*.bellis.com.cn` - 允许所有子域名
- `https://bellis.com.cn` - 允许主域名

配置项：
- **允许的源（Origin）**：`https://*.bellis.com.cn` 和 `https://bellis.com.cn`
- **允许的方法（Methods）**：`GET`, `HEAD`, `OPTIONS`
- **允许的请求头（Headers）**：`*` 或 `Content-Type, Range, Accept, Accept-Encoding`
- **暴露的响应头（ExposeHeaders）**：`*`
- **缓存时间（MaxAgeSeconds）**：`3600`

#### CDN 响应头配置（关键）

**重要**：由于 `all.bellis.com.cn` 是 CDN 域名，即使 OSS 配置了 CORS，CDN 也需要配置响应头才能传递 CORS 头。

在阿里云 CDN 控制台配置响应头管理：

1. 进入 CDN 控制台 → 域名管理 → `all.bellis.com.cn` → 配置管理
2. 找到"响应头管理"或"HTTP 响应头"功能
3. 添加以下响应头：
   - **Access-Control-Allow-Origin**: `*` 或动态设置为请求的 Origin
   - **Access-Control-Allow-Methods**: `GET, HEAD, OPTIONS`
   - **Access-Control-Allow-Headers**: `Range, Content-Type, Accept, Accept-Encoding`
   - **Access-Control-Allow-Credentials**: `true`（如果使用通配符 `*`，则不能设置为 `true`）

**注意**：如果使用 `Access-Control-Allow-Origin: *`，则不能同时设置 `Access-Control-Allow-Credentials: true`。如果需要支持 credentials，需要动态设置 Origin。

#### 推荐配置

如果 CDN 支持动态响应头，推荐配置：
- **Access-Control-Allow-Origin**: 动态设置为请求的 `Origin` 头（如果 Origin 匹配 `*.bellis.com.cn` 或 `bellis.com.cn`）
- **Access-Control-Allow-Methods**: `GET, HEAD, OPTIONS`
- **Access-Control-Allow-Headers**: `*`
- **Access-Control-Allow-Credentials**: `true`

#### 排查步骤

如果遇到 CORS 错误，按以下步骤排查：

1. **检查响应头**：在浏览器开发者工具的 Network 标签中，查看失败的请求响应头，确认是否包含 `Access-Control-Allow-Origin`
   - 如果缺少该头，说明 CDN 没有正确配置或传递 CORS 头
   - 如果该头值为 `null` 或不匹配请求的 Origin，说明 OSS 跨域规则配置有误

2. **验证 OSS 跨域规则**：
   - 确保规则中包含了主域名 `https://bellis.com.cn`（注意拼写，不是 `bellis.con.cn`）
   - 确保规则中包含了通配符 `https://*.bellis.com.cn` 以匹配所有子域名

3. **验证 CDN 响应头配置**：
   - 在 CDN 控制台检查响应头管理配置
   - 确保 `Access-Control-Allow-Origin` 已正确配置
   - 如果使用通配符 `*`，确保没有同时设置 `Access-Control-Allow-Credentials: true`

4. **清除 CDN 缓存**：
   - 配置修改后，清除 CDN 缓存以确保新配置生效
   - 可以在 CDN 控制台的"缓存刷新"功能中刷新相关路径

### 3. 版本号参数

确保 CDN URL 中的版本号参数（`?v=xxx`）被正确保留，用于缓存控制。

### 4. 布局应用资源

- 布局应用的资源路径是 `/assets/layout/`，而不是 `/assets/`
- 各个子应用在独立运行时，会通过 nginx 代理请求布局应用的资源
- 在 CDN 方案中，布局应用资源的 CDN 路径是 `https://all.bellis.com.cn/layout-app/assets/layout/...`

### 5. 性能考虑

- 资源加载器的超时时间需要合理设置，避免影响用户体验
- 建议 CDN 超时时间设置为 3-5 秒
- 建议 OSS 超时时间设置为 3-5 秒

## 文件清单

### 新增文件

1. `configs/vite/plugins/cdn-assets.ts` - 构建时 CDN URL 转换插件
2. `packages/shared-core/src/btc/utils/resource-loader.ts` - 运行时资源加载器
3. `packages/shared-core/src/btc/utils/dynamic-import-interceptor.ts` - 动态导入拦截器

### 修改文件

1. `configs/vite/factories/subapp.config.ts` - 添加 CDN 插件
2. `configs/vite/factories/mainapp.config.ts` - 添加 CDN 插件
3. `configs/vite/factories/layout.config.ts` - 添加 CDN 插件

## 测试要点

### 1. 构建时测试
- 验证 HTML 中的资源 URL 是否正确转换为 CDN URL
- 验证版本号参数是否被正确保留
- 验证布局应用资源路径是否正确转换

### 2. 运行时测试
- 验证资源加载器的降级策略是否正常工作
- 验证 CDN → OSS → 本地的降级顺序是否正确
- 验证资源加载器的缓存机制是否正常工作

### 3. 动态导入测试
- 验证 `import()` 拦截是否正常工作
- 验证动态导入的资源是否能正确加载
- 验证模块代码是否能正确执行

### 4. 错误处理测试
- 模拟 CDN 不可用的情况，验证降级是否正常
- 模拟 OSS 不可用的情况，验证降级是否正常
- 模拟网络超时的情况，验证超时处理是否正常

### 5. 布局应用测试
- 验证布局应用资源的 CDN 路径是否正确
- 验证各个子应用请求布局应用资源时是否能正确降级
- 验证布局应用资源的加载是否正常

## 常见问题

### Q1: 为什么某些资源没有走 CDN？

**A**: 检查以下几点：
1. 资源路径是否以 `/assets/` 或 `/assets/layout/` 开头
2. 文件扩展名是否在支持列表中
3. 环境变量 `ENABLE_CDN_ACCELERATION` 是否设置为 `true`
4. 构建时是否正确应用了 CDN 插件

### Q2: 资源加载失败怎么办？

**A**: 资源加载器会自动降级：
1. CDN 失败 → 自动切换到 OSS
2. OSS 失败 → 自动回退到本地
3. 如果所有源都失败，会在控制台输出错误信息

### Q3: 如何调试资源加载问题？

**A**: 在浏览器控制台执行：
```javascript
// 查看资源加载日志
window.__BTC_RESOURCE_LOADER__.getLogs()

// 查看资源加载器配置
window.__BTC_RESOURCE_LOADER__.getConfig()
```

### Q4: 布局应用资源为什么没有加载？

**A**: 检查以下几点：
1. 资源路径是否包含 `/assets/layout/`
2. CDN 和 OSS 中是否存在对应的资源文件
3. 资源加载器的应用名称识别是否正确

## 更新日志

### 2025-01-XX
- 初始版本
- 实现构建时 CDN URL 转换
- 实现运行时资源加载器
- 实现动态导入拦截器
- 支持布局应用资源

## 参考文档

- [Vite 插件开发文档](https://vitejs.dev/guide/api-plugin.html)
- [Fetch API 文档](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [ES 模块动态导入](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)

