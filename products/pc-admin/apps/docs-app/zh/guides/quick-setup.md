---
title: 快速设置指南 - 局域网访问文档中心
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- setup
- network
sidebar_label: 快速设置
sidebar_order: 2
sidebar_group: guides
---

# 快速设置指南 - 局域网访问文档中心

## 问题

当前文档中心只能通过 `localhost:8080` 访问，无法从局域网其他设备访问。

## 解决方案

### 1. 修改 Vite 配置

在主应用的 `vite.config.ts` 中修改服务器配置：

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 8080,
    strictPort: true
  }
})
```

### 2. 修改 VitePress 配置

在文档站点的 `.vitepress/config.ts` 中修改服务器配置：

```typescript
export default defineConfig({
  vite: {
    server: {
      host: '0.0.0.0',  // 允许外部访问
      port: 8085,
      strictPort: true
    }
  }
})
```

### 3. 防火墙设置

确保 Windows 防火墙允许以下端口：
- `8080` - 主应用端口
- `8085` - 文档站点端口

### 4. 网络访问

配置完成后，可以通过以下地址访问：
- 主应用: `http://[你的IP]:8080`
- 文档中心: `http://[你的IP]:8080/docs`
- 文档站点: `http://[你的IP]:8085`

## 验证步骤

1. **检查配置**: 确认配置文件已正确修改
2. **重启服务**: 重启开发服务器
3. **测试访问**: 从其他设备访问应用
4. **检查网络**: 确认网络连接正常

## 常见问题

### 问题1: 无法访问
- **检查IP地址**: 确认使用正确的IP地址
- **检查防火墙**: 确保防火墙允许端口访问
- **检查服务状态**: 确认服务正在运行

### 问题2: 端口冲突
- **检查端口占用**: `netstat -ano | findstr :8080`
- **修改端口**: 在配置中指定其他端口
- **终止进程**: 终止占用端口的进程

## 安全注意事项

1. **开发环境**: 此配置仅适用于开发环境
2. **生产环境**: 生产环境需要更严格的安全配置
3. **访问控制**: 考虑添加访问控制机制
4. **网络安全**: 注意网络安全和防火墙设置

---

**适用环境**: 开发环境
**安全等级**: 低（仅开发使用）
**维护团队**: 开发团队
