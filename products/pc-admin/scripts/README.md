# Scripts 目录

本目录包含项目所有的脚本文件，包括构建、部署、开发、测试等工具脚本。

## 📁 目录结构

```
scripts/
├── bin/                    # 统一可执行入口
│   ├── build.js           # 构建命令入口
│   └── dev.js              # 开发命令入口
├── commands/              # 具体业务命令实现
│   ├── build/             # 构建相关脚本
│   ├── deploy/            # 部署相关脚本
│   ├── dev/               # 开发相关脚本
│   ├── test/              # 测试相关脚本
│   ├── check/             # 检查/验证相关脚本
│   ├── tools/             # 工具脚本
│   ├── migrate/           # 迁移相关脚本
│   ├── release/           # 发布相关脚本
│   └── handlers/          # 命令处理器（保留原有结构）
├── utils/                  # 全局公共工具
│   ├── logger.mjs         # 统一日志工具
│   ├── path-helper.mjs    # 路径处理工具
│   ├── monorepo-helper.mjs # monorepo 工具
│   ├── turbo-helper.mjs   # turbo 命令封装
│   └── shell-helper.mjs   # Shell 命令执行封装
├── config/                 # 脚本全局配置
│   ├── apps.config.js      # 应用配置
│   ├── build.config.js    # 构建配置
│   └── deploy.config.js   # 部署配置
├── shell/                  # Shell 脚本（.sh, .ps1）
│   ├── build/             # 构建相关 Shell 脚本
│   ├── deploy/            # 部署相关 Shell 脚本
│   └── verdaccio/         # Verdaccio 相关脚本
├── i18n/                   # i18n 相关脚本（保留）
├── archive/                # 归档的过时脚本
│   ├── migrations/         # 一次性迁移脚本
│   ├── ssl/                # SSL 修复脚本
│   ├── diagnostics/        # 诊断脚本
│   └── ...
└── [其他根目录脚本]        # 仍在使用的脚本（逐步迁移中）
```

## 🚀 快速开始

### 开发
```bash
# 启动默认应用开发服务器
pnpm dev

# 启动所有应用
pnpm dev:all

# 启动特定应用
pnpm dev:app --app=system-app
```

### 构建
```bash
# 构建所有应用
pnpm build:all

# 构建特定应用
pnpm build:app --app=system-app

# CDN 构建
pnpm build-cdn:app --app=system-app

# 构建预览
pnpm build-preview:app --app=system-app
```

### 检查
```bash
# 检查循环依赖
pnpm check:circular

# 检查 i18n 键
pnpm check:i18n
```

## 📚 详细文档

- [重构说明](README_REFACTOR.md) - 架构重构说明
- [迁移进度](MIGRATION_PROGRESS.md) - 详细迁移进度
- [重构总结](REFACTORING_SUMMARY.md) - 重构工作总结
- [脚本使用报告](SCRIPT_USAGE_REPORT.md) - 脚本使用情况报告
- [归档说明](archive/README.md) - 归档脚本说明

## 🔧 工具脚本

### 脚本分析工具
- `analyze-script-usage.mjs` - 分析脚本使用情况
- `generate-script-checklist.mjs` - 生成脚本确认清单
- `update-imports.mjs` - 批量更新导入路径
- `update-package-json-refs.mjs` - 批量更新 package.json 引用

## 📝 注意事项

1. **向后兼容**: 原始脚本仍然保留在 scripts 根目录，确保现有工作流不受影响
2. **逐步迁移**: 可以逐步更新 package.json 引用，不需要一次性全部更新
3. **测试验证**: 每个迁移的脚本都需要验证功能正常

## 🔄 架构重构

本目录正在进行架构重构，从扁平结构改为分层、分类的架构。详见 [README_REFACTOR.md](README_REFACTOR.md)。

**重构状态**: 主要工作已完成，详见 [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md)
