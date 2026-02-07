---
title: 启动开发环境
type: sop
project: development
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- sop
- development
- environment
sidebar_label: 启动开发环境
sidebar_order: 1
sidebar_group: sop-development
---

# 启动开发环境

## 前提条件
- 已安装 Node.js >= 18
- 已安装 pnpm >= 8

## 操作步骤

### 1. 安装依赖
```bash
cd btc-shopflow-monorepo
pnpm install
```

### 2. 启动主应用（必需）
```bash
pnpm --filter admin-app dev
```

### 3. 启动子应用（按需）
```bash
# 新开终端窗口
pnpm --filter logistics-app dev
pnpm --filter engineering-app dev
pnpm --filter quality-app dev
pnpm --filter production-app dev
```

## 验证
访问 http://localhost:8080 应该看到主应用界面

## 失败回滚
如果启动失败：
1. 删除所有 node_modules：`pnpm clean`
2. 重新安装：`pnpm install`
3. 检查端口是否被占用

