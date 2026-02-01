# 脚本归档目录

本目录包含已归档的过时脚本，这些脚本不再需要保留在主要的 scripts 目录中。

## 归档原因

根据脚本使用情况分析，这些脚本被归档的原因包括：

1. **问题已解决**: 脚本用于处理的问题已经通过其他方案解决，不再需要
2. **一次性迁移**: 已完成的一次性代码迁移/重构脚本
3. **旧流程替换**: 已有新的流程或工具替代
4. **不再使用**: 确认不再使用的脚本

## 归档标准

**核心原则**: 脚本的作用是处理问题，如果项目不会在发布之前出现问题（有其他的方案解决了）就不再需要脚本。

## 目录结构

```
archive/
├── migrations/      # 一次性迁移脚本（6个）
├── ssl/             # SSL/证书修复脚本（11个）
├── diagnostics/     # 诊断/调试脚本（9个）
├── verify/          # 验证/检查脚本（16个）
├── deploy/          # 部署相关脚本（6个）
├── dev/             # 开发工具脚本（2个）
├── version/         # 版本管理脚本（3个）
├── verdaccio/       # Verdaccio 相关脚本（2个）
├── backup/          # 备份/维护脚本（3个）
├── tools/           # 工具/辅助脚本（10个）
└── obsolete/        # 其他未分类脚本（10个）
```

## 归档统计

- **总归档数**: 78 个脚本
- **归档日期**: 2026-01-14
- **评估依据**: `scripts/UNUSED_SCRIPTS_CHECKLIST.json`

## 各目录说明

### migrations/ - 一次性迁移脚本

已完成的一次性代码迁移/重构脚本，通常不再需要：

- `i18n/migrate-flat-to-nested.mjs` - 将扁平化的国际化配置转换为嵌套格式
- `migrate-console-to-logger.mjs` - 批量替换 console 调用为 logger
- `migrate-routes-to-modules.mjs` - 批量迁移路由到模块配置
- `refactor-page-components.mjs` - 批量重构页面组件
- `reorganize-all-locales.js` - 重新组织所有国际化文件
- `reorganize-locale.js` - 重新组织国际化文件

### ssl/ - SSL/证书修复脚本

用于修复 SSL 证书问题的脚本，问题已通过其他方案解决：

- `check-and-fix-cert.sh` - 快速检查和修复证书链
- `check-ssl-bundle.sh` - SSL 证书链检查脚本
- `deploy-safari-cert.sh` - Safari 证书部署脚本
- `diagnose-ssl-connection.sh` - 诊断 SSL 连接问题
- `fix-cert-chain.sh` - 证书链修复脚本
- `fix-ssl-bundle.sh` - 修复 SSL bundle
- `fix-ssl-issues.sh` - 修复 SSL 问题
- `merge-certs-for-safari.ps1` - 证书合并脚本（PowerShell）
- `merge-certs-for-safari.sh` - 证书合并脚本（Shell）
- `optimize-ssl-bundle.sh` - SSL 证书链优化脚本
- `verify-safari-cert.sh` - Safari 证书验证脚本

### diagnostics/ - 诊断/调试脚本

用于诊断和调试问题的脚本，部署和运行问题已通过其他方案解决：

- `debug-releases.sh` - 检查 releases 结构状态
- `debug-token.sh` - 调试 GITHUB_TOKEN 检测
- `diagnose-404.sh` - 诊断 404 错误
- `diagnose-admin-404-server.sh` - 诊断 admin 应用 404 问题（服务器端）
- `diagnose-admin-404.sh` - 诊断 admin 应用 404 问题
- `diagnose-container.sh` - 诊断 Docker 容器状态
- `diagnose-mobile-domain.sh` - 诊断移动端域名配置问题
- `diagnose-nginx.sh` - 诊断 Nginx 配置
- `find-nginx-config.sh` - 查找 Nginx 配置文件位置

### verify/ - 验证/检查脚本

用于验证构建、引用等的脚本，部署和构建验证问题已通过其他方案解决：

- `build-and-verify-admin.mjs` - 构建并验证 admin-app
- `check-admin-refs.mjs` - 检查 admin 应用构建产物中的引用
- `check-baota-nginx.sh` - 检查宝塔面板的 Nginx 配置
- `check-deployed-files.sh` - 检查服务器上部署的文件
- `check-dynamic-import-cdn.mjs` - 检查动态导入的 CDN 策略
- `check-layout-load-order.mjs` - 检查 layout-app 的加载顺序
- `check-ports.mjs` - 端口检查工具
- `check-src-artifacts.mjs` - 检查并清理 src 目录下的构建产物
- `check-src-directory-structure.mjs` - 检查所有应用的 src 目录结构
- `check-verdaccio-status.ps1` - 检查 Verdaccio 状态（PowerShell）
- `check-verdaccio-status.sh` - 检查 Verdaccio 状态（Shell）
- `verify-admin-build.mjs` - 验证 admin-app 构建产物
- `verify-admin-refs.mjs` - 验证管理应用构建产物中的所有引用
- `verify-all-refs.mjs` - 完整验证管理应用构建产物中的所有引用
- `verify-build-assets.mjs` - 验证构建产物中的资源引用
- `verify-mobile-build.js` - 验证移动端应用构建产物

### deploy/ - 部署相关脚本

部署相关的脚本，已有新的部署流程：

- `deploy-config.example.sh` - 部署配置示例文件（模板）
- `deploy-local.sh` - 本地构建并部署脚本
- `deploy-manual.sh` - 手动部署脚本
- `deploy.sh` - BTC ShopFlow 生产环境部署脚本
- `force-redeploy.sh` - 强制重新部署脚本
- `trigger-deployment-test.sh` - 触发部署测试脚本

### dev/ - 开发工具脚本

开发时使用的工具脚本，开发环境问题已通过其他方案解决：

- `kill-dev-ports.ps1` - 结束所有开发服务器进程
- `run-without-env.js` - 通用包装脚本，避免 Windows PowerShell 的"输入行太长"问题

### version/ - 版本管理脚本

版本号和发布相关脚本，如果发布流程已自动化则归档：

- `prepare-publish.ps1` - 准备发布：处理 workspace 依赖
- `version-packages.ps1` - 批量更新共享组件库版本号（PowerShell）
- `version-packages.sh` - 批量更新共享组件库版本号（Shell）

### verdaccio/ - Verdaccio 相关脚本

Verdaccio 私有仓库相关脚本，开发环境问题已通过其他方案解决：

- `publish-to-verdaccio.ps1` - 发布到 Verdaccio（PowerShell）
- `start-verdaccio.ps1` - 启动 Verdaccio（PowerShell）

### backup/ - 备份/维护脚本

备份和维护相关的脚本，如果已有自动化备份系统则归档：

- `backup.sh` - 宝塔面板自动备份脚本
- `btc-backup.sh` - BTC 备份脚本
- `btc-maintenance.sh` - BTC ShopFlow 宝塔面板维护脚本

### tools/ - 工具/辅助脚本

各种工具和辅助脚本：

- `analyze-i18n-keys.js` - 分析 i18n 键的使用情况
- `generate-test-report.mjs` - 测试报告生成器
- `icon-diff.mjs` - 图标差异对比
- `icon-usage.mjs` - 分析图标使用情况
- `subdomain-redirect.js` - 子域名重定向脚本
- `sync-docs-to-vitepress.mjs` - 文档同步脚本
- `test-eps-sharing.mjs` - 测试 EPS 数据共享功能
- `upload-icons-to-oss.mjs` - 上传图标文件到阿里云 OSS
- `validate-commit-msg.js` - 提交信息验证脚本
- `validate-docs.mjs` - 文档验证脚本

### obsolete/ - 其他未分类脚本

其他未分类的脚本：

- `build-preview-all.js` - 构建并预览所有应用
- `cleanup-docs.ps1` - 文档清理自动化脚本
- `copy-eps-from-system.sh` - 从 system-app 复制 EPS 文件
- `force-rebuild-mobile.js` - 强制重新构建移动端应用
- `migrate-to-releases-on-server.sh` - 迁移到 releases 目录结构（服务器端）
- `migrate-to-releases.sh` - 迁移到 releases 目录结构
- `quick-commit.ps1` - 快速提交到 GitHub develop 分支（PowerShell）
- `quick-commit.sh` - 快速提交到 develop 分支（Shell）
- `set-oss-env.ps1` - 从 .env.oss 文件加载 OSS 环境变量
- `setup-private-registry.sh` - 私有镜像仓库设置脚本

## 恢复脚本

如果需要恢复某个已归档的脚本，可以：

1. 从对应的归档目录中找到脚本
2. 将其移回 `scripts/` 根目录
3. 更新 `scripts/UNUSED_SCRIPTS_CHECKLIST.json` 中的 `keep` 状态

## 相关文档

- `scripts/UNUSED_SCRIPTS_CHECKLIST.json` - 脚本使用情况确认清单
- `scripts/SCRIPT_USAGE_REPORT.md` - 脚本使用情况报告
