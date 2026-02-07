# 国际化 CDN 模式迁移方案

## 📋 当前架构分析

### 当前方式（config.ts）

**实现方式：**
```typescript
// apps/system-app/src/i18n/getters.ts
const configFiles = import.meta.glob<{ default: any }>(
  ['../locales/config.ts', '../modules/**/config.ts'], 
  { eager: true }  // 构建时加载
);
```

**特点：**
- ✅ TypeScript 类型安全
- ✅ 构建时打包，首屏加载快
- ✅ 支持复杂逻辑和类型检查
- ❌ 修改需要重新构建
- ❌ 无法动态更新
- ❌ 增加构建产物体积

### 阿里云 CDN 模式

**实现方式：**
```
https://cws.alicdn.com/Release/alfa/@ali/alfa-aliyun-one-service-widget-chat/0.1.1/zh_CN.json
```

**特点：**
- ✅ 运行时动态加载
- ✅ 支持版本化管理
- ✅ 可独立更新，无需重新构建
- ✅ CDN 加速，按需加载
- ❌ 需要处理加载状态和错误
- ❌ 首屏可能稍慢（需要网络请求）

---

## 🎯 改造方案

### 方案一：混合模式（推荐）⭐

**保留 config.ts 作为默认值，CDN 作为覆盖层**

**优点：**
- ✅ 渐进式迁移，风险低
- ✅ 有降级方案（CDN 失败时使用本地）
- ✅ 保持类型安全
- ✅ 支持热更新

**实现步骤：**

#### 1. 构建时导出 JSON

创建构建脚本，将 `config.ts` 转换为 JSON：

```typescript
// scripts/build-locale-json.mjs
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

async function buildLocaleJson() {
  // 找到所有 config.ts 文件
  const configFiles = await glob('apps/*/src/locales/config.ts');
  
  for (const file of configFiles) {
    // 动态导入并提取默认导出
    const module = await import(file);
    const config = module.default;
    
    // 导出为 JSON
    const appName = file.match(/apps\/([^/]+)/)?.[1];
    const outputDir = `dist/locales/${appName}`;
    
    writeFileSync(
      `${outputDir}/zh-CN.json`,
      JSON.stringify(config['zh-CN'], null, 2),
      'utf-8'
    );
    writeFileSync(
      `${outputDir}/en-US.json`,
      JSON.stringify(config['en-US'], null, 2),
      'utf-8'
    );
  }
}
```

#### 2. 运行时加载器

```typescript
// packages/shared-core/src/utils/i18n/cdn-locale-loader.ts

interface CDNLocaleConfig {
  cdnBaseUrl?: string;
  version?: string;
  appId: string;
  fallbackToLocal?: boolean;
}

/**
 * 从 CDN 加载国际化配置
 */
export async function loadLocaleFromCDN(
  locale: 'zh-CN' | 'en-US',
  config: CDNLocaleConfig
): Promise<Record<string, any> | null> {
  const {
    cdnBaseUrl = 'https://cdn.yourdomain.com',
    version = 'latest',
    appId,
    fallbackToLocal = true,
  } = config;

  const url = `${cdnBaseUrl}/locales/${appId}/${version}/${locale}.json`;
  
  try {
    const response = await fetch(url, {
      cache: 'no-cache', // 开发环境不缓存
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // 缓存到 localStorage（可选）
    const cacheKey = `i18n_${appId}_${locale}_${version}`;
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));

    return data;
  } catch (error) {
    console.warn(`[i18n] Failed to load locale from CDN (${url}):`, error);
    
    // 尝试从缓存加载
    const cacheKey = `i18n_${appId}_${locale}_${version}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // 缓存 24 小时
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          return data;
        }
      } catch {
        // 忽略缓存解析错误
      }
    }

    // 降级到本地配置
    if (fallbackToLocal) {
      console.info(`[i18n] Falling back to local config for ${appId}`);
      return null; // 返回 null，让调用方使用本地配置
    }

    throw error;
  }
}

/**
 * 混合加载：CDN + 本地配置
 */
export async function loadHybridLocale(
  locale: 'zh-CN' | 'en-US',
  config: CDNLocaleConfig,
  localConfig: Record<string, any>
): Promise<Record<string, any>> {
  // 先尝试从 CDN 加载
  const cdnConfig = await loadLocaleFromCDN(locale, config);
  
  if (cdnConfig) {
    // CDN 配置覆盖本地配置
    return deepMerge(localConfig, cdnConfig);
  }
  
  // 降级到本地配置
  return localConfig;
}
```

#### 3. 修改 getters.ts

```typescript
// apps/system-app/src/i18n/getters.ts

import { loadHybridLocale } from '@btc/shared-core/utils/i18n/cdn-locale-loader';
import { deepMerge } from '@btc/shared-core/utils/i18n/locale-utils';

// 本地配置（作为默认值）
const configFiles = import.meta.glob<{ default: any }>(
  ['../locales/config.ts', '../modules/**/config.ts'], 
  { eager: true }
);

// 从 config.ts 提取本地配置
const localConfigMessages = mergeConfigFiles(configFiles);

// 异步加载 CDN 配置
let cdnConfigCache: {
  'zh-CN'?: Record<string, any>;
  'en-US'?: Record<string, any>;
} = {};

async function loadCDNConfigs() {
  if (import.meta.env.DEV) {
    // 开发环境：可选启用 CDN 模式
    const enableCDN = import.meta.env.VITE_ENABLE_CDN_I18N === 'true';
    if (!enableCDN) {
      return;
    }
  }

  const cdnConfig = {
    appId: 'system',
    version: import.meta.env.VITE_APP_VERSION || 'latest',
    cdnBaseUrl: import.meta.env.VITE_CDN_BASE_URL || 'https://cdn.yourdomain.com',
    fallbackToLocal: true,
  };

  try {
    const [zhCN, enUS] = await Promise.all([
      loadHybridLocale('zh-CN', cdnConfig, localConfigMessages.zhCN),
      loadHybridLocale('en-US', cdnConfig, localConfigMessages.enUS),
    ]);

    cdnConfigCache = { 'zh-CN': zhCN, 'en-US': enUS };
  } catch (error) {
    console.warn('[i18n] Failed to load CDN configs, using local only:', error);
  }
}

// 在应用启动时加载（可选，也可以延迟加载）
if (typeof window !== 'undefined') {
  loadCDNConfigs();
}

export const { getLocaleMessages, normalizeLocale, clearLocaleMessagesCache, tSync } = setupAppI18n({
  appId: 'system',
  configFiles,
  sharedCoreZh,
  sharedCoreEn,
  sharedComponentsZh,
  sharedComponentsEn,
  // 使用混合配置
  appZhCN: cdnConfigCache['zh-CN'] || localConfigMessages.zhCN,
  appEnUS: cdnConfigCache['en-US'] || localConfigMessages.enUS,
  needsTSync: true,
});
```

---

### 方案二：完全 CDN 模式

**所有配置都从 CDN 加载，config.ts 仅用于类型定义**

**优点：**
- ✅ 完全动态，支持热更新
- ✅ 构建产物更小
- ✅ 版本化管理

**缺点：**
- ❌ 需要处理加载状态
- ❌ 首屏可能稍慢
- ❌ 需要完善的错误处理

**实现：**

```typescript
// 完全异步加载
const messages = await Promise.all([
  loadLocaleFromCDN('zh-CN', { appId: 'system' }),
  loadLocaleFromCDN('en-US', { appId: 'system' }),
]);

// 在加载完成前显示加载状态
```

---

## 📊 对比分析

| 特性 | config.ts（当前） | CDN 模式 | 混合模式（推荐） |
|------|------------------|----------|------------------|
| **类型安全** | ✅ 完全支持 | ❌ 需要额外类型定义 | ✅ 支持 |
| **构建时打包** | ✅ 是 | ❌ 否 | ✅ 本地作为默认值 |
| **动态更新** | ❌ 需要重新构建 | ✅ 支持 | ✅ 支持 |
| **首屏性能** | ✅ 快 | ⚠️ 需要网络请求 | ✅ 快（有本地降级） |
| **版本管理** | ❌ 随应用版本 | ✅ 独立版本 | ✅ 独立版本 |
| **错误处理** | ✅ 构建时检查 | ⚠️ 需要运行时处理 | ✅ 有降级方案 |
| **迁移成本** | - | ⚠️ 高 | ✅ 低（渐进式） |

---

## 🚀 实施建议

### 阶段一：准备基础设施（1-2 天）

1. ✅ 创建构建脚本，将 `config.ts` 导出为 JSON
2. ✅ 搭建 CDN 服务（或使用现有 OSS/CDN）
3. ✅ 实现 CDN 加载器工具函数

### 阶段二：试点应用（2-3 天）

1. ✅ 选择一个应用（如 `system-app`）进行试点
2. ✅ 实现混合模式加载
3. ✅ 测试 CDN 加载、降级、缓存等功能

### 阶段三：逐步推广（按需）

1. ✅ 根据试点结果优化
2. ✅ 推广到其他应用
3. ✅ 完善监控和错误上报

---

## 🔧 配置示例

### 环境变量

```bash
# .env.production
VITE_CDN_BASE_URL=https://cdn.yourdomain.com
VITE_APP_VERSION=1.0.0
VITE_ENABLE_CDN_I18N=true

# .env.development
VITE_CDN_BASE_URL=http://localhost:3000
VITE_ENABLE_CDN_I18N=false  # 开发环境默认使用本地
```

### CDN 目录结构

```
cdn.yourdomain.com/
  locales/
    system-app/
      latest/
        zh-CN.json
        en-US.json
      1.0.0/
        zh-CN.json
        en-US.json
    dashboard-app/
      latest/
        zh-CN.json
        en-US.json
```

---

## ⚠️ 注意事项

1. **缓存策略**
   - 开发环境：`cache: 'no-cache'` 确保获取最新
   - 生产环境：使用版本号，支持长期缓存

2. **错误处理**
   - 必须有降级方案（使用本地配置）
   - 记录错误日志，便于排查

3. **类型安全**
   - 保持 `config.ts` 作为类型定义
   - 使用 JSON Schema 验证 CDN 配置

4. **性能优化**
   - 并行加载多语言配置
   - 使用 localStorage 缓存
   - 考虑 Service Worker 缓存

5. **版本管理**
   - 支持 `latest` 和具体版本号
   - 版本回滚机制

---

## 📝 总结

**推荐采用混合模式**，原因：

1. ✅ **渐进式迁移**：风险低，可以逐步推进
2. ✅ **有降级保障**：CDN 失败时自动使用本地配置
3. ✅ **保持类型安全**：继续使用 TypeScript
4. ✅ **灵活切换**：可以通过环境变量控制是否启用 CDN

**适用场景：**
- 需要频繁更新国际化内容
- 多环境部署（不同环境可能需要不同翻译）
- 希望减少构建时间
- 需要版本化管理的国际化资源

**不适用场景：**
- 国际化内容很少变化
- 对首屏性能要求极高
- 没有 CDN 基础设施

---

## ✅ 实施完成

### 已完成的工作

1. ✅ **CDN 加载器** (`packages/shared-core/src/utils/i18n/cdn-locale-loader.ts`)
   - 实现了 `loadLocaleFromCDN()` 和 `loadHybridLocale()` 函数
   - 支持 localStorage 缓存和错误降级

2. ✅ **构建脚本** (`scripts/commands/tools/build-locale-json.mjs`)
   - 自动扫描所有应用的 config.ts 文件
   - 导出为 JSON 格式到 `dist/locales/` 目录

3. ✅ **核心功能修改**
   - `createLocaleGetters` 支持 CDN 配置
   - `setupAppI18n` 支持传递 CDN 配置
   - 所有 13 个应用的 `getters.ts` 已更新

4. ✅ **构建流程集成**
   - 上传脚本支持国际化文件上传到 OSS
   - OSS 路径：`locales/${appName}/${version}/zh-CN.json`

### 环境变量配置

在各应用的 `.env.production` 文件中添加：

```bash
# CDN 基础 URL
VITE_CDN_BASE_URL=https://all.bellis.com.cn

# 应用版本号（用于版本化管理）
VITE_APP_VERSION=1.0.0

# 是否启用 CDN 国际化（生产环境默认启用）
VITE_ENABLE_CDN_I18N=true
```

在 `.env.development` 中：

```bash
# 开发环境默认使用本地配置
VITE_ENABLE_CDN_I18N=false
```

### 使用方法

1. **构建时导出 JSON**：
   ```bash
   node scripts/commands/tools/build-locale-json.mjs
   ```

2. **上传到 CDN**：
   ```bash
   node scripts/commands/tools/upload-app-to-cdn.mjs system-app
   ```

3. **运行时自动加载**：
   - 应用启动时会自动尝试从 CDN 加载
   - 如果 CDN 加载失败，自动降级到本地配置
   - 支持 localStorage 缓存（24 小时）

### 故障排查

1. **CORS 错误**：
   - **问题**：`Access to fetch at '...' has been blocked by CORS policy`
   - **原因**：CDN 服务器未配置 CORS 头
   - **解决方案**：
     - **开发环境**：默认已禁用 CDN 加载，避免 CORS 问题。如需测试 CDN，设置 `VITE_ENABLE_CDN_I18N=true`
     - **生产环境**：需要在 CDN 服务器配置 CORS 头：
       ```
       Access-Control-Allow-Origin: *
       Access-Control-Allow-Methods: GET, OPTIONS
       Access-Control-Allow-Headers: Accept
       ```
     - 系统会自动降级到本地配置，不影响功能

2. **CDN 加载失败**：
   - 检查网络连接
   - 检查 CDN URL 是否正确
   - 查看浏览器控制台的警告信息
   - 系统会自动降级到本地配置

3. **缓存问题**：
   - 使用 `clearCDNCache(appId)` 清除缓存
   - 或手动清除 localStorage 中的 `i18n_*` 键

4. **版本不匹配**：
   - 检查 `VITE_APP_VERSION` 环境变量
   - 确保 CDN 上存在对应版本的文件

### 环境配置说明

**开发环境**：
- 默认禁用 CDN 加载（避免 CORS 问题）
- 如需测试 CDN 功能，设置 `VITE_ENABLE_CDN_I18N=true`

**生产环境**：
- 默认启用 CDN 加载
- 如需禁用，设置 `VITE_ENABLE_CDN_I18N=false`
- 确保 CDN 服务器配置了正确的 CORS 头
