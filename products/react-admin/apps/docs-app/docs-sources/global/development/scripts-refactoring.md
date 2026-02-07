# Scripts 架构重构说明

## 重构目标

将当前扁平的 scripts 目录结构重构为分层、分类的架构，提升可维护性、代码复用性和职责清晰度。

## 新目录结构

```
scripts/
├── bin/                    # 统一可执行入口
│   ├── build.js           # 构建命令入口
│   ├── dev.js             # 开发命令入口
│   └── index.js           # 统一命令行调度入口
├── commands/              # 具体业务命令实现
│   ├── build/             # 构建相关
│   ├── deploy/            # 部署相关
│   ├── dev/               # 开发相关
│   ├── test/              # 测试相关
│   ├── check/             # 检查/验证相关
│   ├── tools/             # 工具脚本
│   ├── migrate/           # 迁移相关
│   └── release/           # 发布相关
├── utils/                  # 全局公共工具
│   ├── logger.mjs         # 统一日志
│   ├── path-helper.mjs    # 路径处理
│   ├── monorepo-helper.mjs # monorepo 工具
│   ├── turbo-helper.mjs   # turbo 命令封装
│   └── shell-helper.mjs   # Shell 命令执行封装
├── config/                 # 脚本全局配置
│   ├── apps.config.js      # 应用配置
│   ├── build.config.js    # 构建配置
│   └── deploy.config.js   # 部署配置
├── archive/                # 归档的过时脚本
│   ├── migrations/         # 一次性迁移脚本
│   ├── ssl/                # SSL 修复脚本
│   ├── diagnostics/        # 诊断脚本
│   └── ...
└── i18n/                   # i18n 相关脚本（保留）
```

## 迁移状态

详见 `MIGRATION_PROGRESS.md`

## 使用新结构

### 开发
```bash
# 使用新的统一入口
node scripts/bin/dev.js

# 或直接使用命令脚本
node scripts/commands/dev/dev-all.mjs
```

### 构建
```bash
# 使用新的统一入口（待实现）
node scripts/bin/build.js preview [app]

# 或直接使用命令脚本
node scripts/commands/build/preview-build.mjs [app]
```

## 向后兼容

在完全迁移之前，原始脚本仍然保留在 scripts 根目录，确保现有工作流不受影响。

## 注意事项

1. 所有迁移的脚本需要更新导入路径，使用新的 utils 模块
2. package.json 中的脚本引用将逐步更新
3. 每个迁移的脚本都需要验证功能正常
