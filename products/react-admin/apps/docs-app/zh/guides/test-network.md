---
title: 网络访问测试
type: guide
project: network
owner: dev-team
created: '2025-10-13'
updated: '2025-10-14'
publish: true
tags:
  - guides
  - network
  - test
sidebar_label: 网络测试
sidebar_order: 2
sidebar_group: guides
---

# 网络访问测试

## 问题解决

### 问题原因
主应用中的 iframe 组件硬编码了 `http://localhost:8085`，导致局域网其他设备无法访问

### 解决方案
1. **修改 iframe 组件**：使其能够动态检测当前页面的主机地址
2. **支持环境变量**：可以通过 `VITE_DOCS_URL` 环境变量自定义文档服务器地址
3. **自动IP检测**：当访问 localhost 时，自动使用当前页面的IP地址

### 修改内容

#### 1. 动态URL检测函数
```javascript
const getDocsUrl = () => {
if (!import.meta.env.DEV) {
return '/';
}

// 优先使用环境变量
const envUrl = import.meta.env.VITE_DOCS_URL;
if (envUrl) {
return envUrl;
}

// 自动检测当前页面的主机地址
const protocol = window.location.protocol;
const hostname = window.location.hostname;

return `${protocol}//${hostname}:8085`;
};
```

#### 2. 服务器配置
VitePress 配置已正确设置：
```javascript
server: {
port: 8085,
host: '0.0.0.0', // 允许所有网络接口访问
strictPort: true,
cors: true // 允许跨域
}
```

### 测试方法

#### 方法1：直接访问文档服务器
在局域网其他设备上访问：
```
http://10.80.8.199:8085/
```

#### 方法2：通过主应用访问
在局域网其他设备上访问主应用：
```
http://10.80.8.199:8080/
```
然后点击"文档中心"菜单

#### 方法3：环境变量配置（可选）
在主应用根目录创建 `.env` 文件：
```bash
VITE_DOCS_URL=http://10.80.8.199:8085
```

### 验证步骤
1. 确认文档服务器正在运行：`http://10.80.8.199:8085/`
2. 确认主应用正在运行：`http://10.80.8.199:8080/`
3. 在局域网其他设备上测试访问
4. 检查浏览器开发者工具的网络面板，确认请求地址正确

### 故障排除
如果仍然无法访问，请检查：
1. Windows 防火墙是否阻止了端口 8085
2. 路由器是否阻止了端口转发
3. 其他设备是否在同一网络段
4. 浏览器是否阻止了跨域请求

运行防火墙规则脚本（需要管理员权限）：
```bash
# 以管理员身份运行
enable-network-access.bat
```
