# EPS 服务共享方案

## 问题描述

当前每个应用在构建时都会：
1. 生成独立的 `build/eps` 目录（EPS 数据文件）
2. 通过 `virtual:eps` 虚拟模块生成 EPS 服务代码
3. 打包成独立的 `eps-service-xxx.js` chunk

这导致：
- 每个应用都包含重复的 EPS 服务代码
- 构建产物体积增大
- 没有真正实现共享的优势

## 解决方案

### 方案1：将 EPS 服务代码提取到共享包（推荐）

将 EPS 服务代码提取到 `@btc/shared-core` 中，作为共享逻辑的一部分。

**优点**：
- 真正实现共享，所有应用引用同一个包
- 减少构建产物体积
- 符合"逻辑层面共享"的定位

**缺点**：
- 需要修改现有代码结构
- EPS 数据仍然需要从 main-app 复制

### 方案2：优化构建配置，共享 EPS chunk

通过构建配置，让所有应用共享同一个 EPS chunk（通过 CDN 或共享位置加载）。

**优点**：
- 不需要大幅修改代码结构
- 可以实现运行时共享

**缺点**：
- 需要额外的 CDN 或共享位置配置
- 仍然需要在构建时生成 EPS 数据

### 方案3：将 EPS 服务代码作为独立的 npm 包发布

将 EPS 服务代码提取为独立的 `@btc/shared-eps` 包。

**优点**：
- 完全独立，便于管理
- 可以独立版本控制

**缺点**：
- 增加包管理复杂度
- EPS 数据仍然需要处理

## 推荐方案：方案1

将 EPS 服务代码提取到 `@btc/shared-core` 中，因为：
1. EPS 服务代码是共享逻辑，符合 `@btc/shared-core` 的定位
2. 所有应用都使用相同的 EPS 数据（从 main-app 复制）
3. 可以减少包的数量，简化依赖管理

## 实施步骤（已完成）

1. **✅ 在 `@btc/shared-core` 中创建 EPS 服务模块**
   - 已创建 `packages/shared-core/src/eps/service.ts`
   - 提供统一的 EPS 服务加载函数：`loadEpsService`, `getGlobalEpsService`, `createEpsService`, `exportEpsServiceToGlobal`

2. **✅ 修改 EPS 插件**
   - 已修改 `@btc/vite-plugin` 的 EPS 插件
   - 添加 `sharedEpsDir` 选项，支持从共享位置读取 EPS 数据
   - 子应用优先从 `main-app/build/eps` 读取 EPS 数据

3. **✅ 修改应用代码**
   - 所有应用的 `src/services/eps.ts` 已更新为使用共享的 EPS 服务模块
   - 使用 `loadEpsService` 函数统一加载 EPS 服务

4. **✅ 优化构建配置**
   - `manualChunks` 配置已优化，EPS 服务代码打包到 `eps-service` chunk
   - 所有应用共享同一个 EPS chunk（通过 `virtual:eps` 虚拟模块）

5. **✅ 更新构建脚本**
   - 子应用配置已更新，自动从 `main-app/build/eps` 读取 EPS 数据
   - 构建流程保持不变，但子应用不再独立生成 EPS 数据

## 注意事项

1. **EPS 数据仍然需要从 main-app 复制**
   - EPS 数据是动态生成的，需要从 main-app 获取
   - 但服务代码可以共享

2. **保持向后兼容**
   - 在迁移过程中，保持对现有代码的兼容
   - 逐步迁移，避免一次性大改

3. **版本管理**
   - EPS 服务代码的版本应该与 `@btc/shared-core` 同步
   - 确保所有应用使用相同版本的 EPS 服务代码

