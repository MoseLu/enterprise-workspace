---
title: 添加新的 SVG 图标
type: sop
project: components
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags:
- sop
- components
- svg
sidebar_label: 添加SVG图标
sidebar_order: 2
sidebar_group: sop-components
---

# 添加新的 SVG 图标

## 前提条件
- SVG 文件格式正确（优先使用 fill 型，避免 stroke 型）
- 文件编码为 UTF-8

## 操作步骤

### 1. 将 SVG 文件放到应用的 icons 目录
```bash
# 示例：添加到主应用
cp your-icon.svg apps/admin-app/src/assets/icons/
```

### 2. 如果修改了插件代码，重新构建插件
```bash
cd packages/vite-plugin
pnpm build
```

### 3. 重启开发服务器
```bash
# Ctrl+C 停止服务器，然后重新启动
pnpm --filter admin-app dev
```

## 验证
在浏览器控制台检查图标是否加载：
```javascript
// 检查图标是否存在（假设图标名为 myicon）
console.log(document.getElementById('icon-myicon'))
```

在组件中使用：
```vue
<btc-svg name="myicon" />
```

## 失败回滚
如果图标不显示：
1. 检查文件名是否正确（不要包含 `icon-` 前缀）
2. 检查 SVG 格式（优先使用 fill 型）
3. 确认已重启服务器
4. 查看控制台是否有 `[btc:svg] 找到 XX 个 SVG 图标` 日志

