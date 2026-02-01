# GitHub Actions 缓存配置说明

## 📋 概述

本项目已优化 GitHub Actions 工作流的依赖缓存配置，以加速 CI/CD 构建过程。缓存策略包括：

1. **pnpm store 缓存**：缓存 pnpm 的全局存储，这是最重要的缓存
2. **node_modules 缓存**：缓存项目中的 node_modules 目录（可选优化）

## 🎯 缓存策略

### 1. pnpm Store 缓存（主要缓存）

pnpm 使用全局存储（store）来存储所有下载的包，这是最高效的缓存方式。

**配置示例：**

```yaml
- name: Get pnpm store directory
  shell: bash
  run: |
    echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ${{ env.STORE_PATH }}
    key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-store-
```

**关键点：**
- 使用 `pnpm store path` 动态获取 store 路径，而不是硬编码
- 缓存 key 基于 `pnpm-lock.yaml` 的哈希值，当依赖变更时自动失效
- `restore-keys` 允许部分匹配，即使 lockfile 变更也能使用旧缓存

### 2. node_modules 缓存（可选优化）

虽然 pnpm 使用符号链接，node_modules 很小，但缓存它仍可以进一步加速安装。

**配置示例：**

```yaml
- name: Cache node_modules
  uses: actions/cache@v3
  with:
    path: |
      node_modules
      **/node_modules
    key: ${{ runner.os }}-node-modules-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-node-modules-
```

### 3. 安装依赖

使用 `--prefer-offline` 标志可以优先使用缓存：

```yaml
- name: Install dependencies
  run: pnpm install --frozen-lockfile --prefer-offline
```

## ✅ 已优化的工作流文件

以下工作流文件已配置完整的缓存策略：

- ✅ `build-all-apps.yml`
- ✅ `build-app-reusable.yml`
- ✅ `build-deploy-app-reusable.yml`
- ✅ `build-deploy-all-apps.yml`
- ✅ `build-dependencies.yml`
- ✅ `build-system-app-reusable.yml`
- ✅ `deploy-static.yml`

## 📊 缓存效果

### 首次构建
- 需要下载所有依赖
- 缓存会被创建并保存

### 后续构建（依赖未变更）
- pnpm store 缓存命中：**几乎瞬间完成**
- node_modules 缓存命中：**几秒钟内完成**
- 总体安装时间：**从几分钟减少到几秒**

### 依赖部分变更
- 使用 `restore-keys` 部分匹配
- 只下载新增或变更的依赖
- 仍然显著加速

## 🔧 缓存管理

### 查看缓存状态

在 GitHub Actions 运行日志中，可以看到缓存的状态：
- `Cache restored from key: ...` - 缓存命中
- `Cache saved with key: ...` - 缓存已保存

### 手动清除缓存

如果需要清除缓存（例如遇到依赖问题）：

1. 在 GitHub 仓库中，进入 **Settings** → **Actions** → **Caches**
2. 选择要删除的缓存条目
3. 点击 **Delete**

或者，可以通过修改 `pnpm-lock.yaml` 来使缓存失效（添加一个空行并提交）。

## 📝 最佳实践

1. **始终使用动态路径**：使用 `pnpm store path` 而不是硬编码路径
2. **使用 restore-keys**：允许部分匹配，提高缓存命中率
3. **基于 lockfile 哈希**：确保依赖变更时缓存自动失效
4. **使用 --prefer-offline**：优先使用缓存，减少网络请求
5. **使用 --frozen-lockfile**：确保使用锁定的依赖版本

## ⚠️ 注意事项

1. **缓存大小限制**：GitHub Actions 免费账户有 10GB 的缓存限制
2. **缓存过期**：未使用的缓存会在 7 天后自动删除
3. **跨分支共享**：缓存在不同分支之间共享（基于相同的 key）
4. **pnpm store vs node_modules**：pnpm store 缓存更重要，node_modules 缓存是可选的额外优化

## 🔍 故障排查

### 缓存未命中

如果缓存未命中，检查：
1. `pnpm-lock.yaml` 是否已提交到仓库
2. 缓存 key 是否正确
3. 缓存路径是否正确

### 依赖安装失败

如果遇到依赖问题：
1. 清除相关缓存
2. 检查 `pnpm-lock.yaml` 是否损坏
3. 尝试不使用缓存重新安装

## 📚 参考资源

- [GitHub Actions 缓存文档](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [pnpm 文档](https://pnpm.io/)
- [actions/cache 文档](https://github.com/actions/cache)

