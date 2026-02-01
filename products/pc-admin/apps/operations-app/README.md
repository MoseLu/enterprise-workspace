# Monitor App - 全局错误监控子应用

## 功能说明

Monitor App 是一个专门用于实时监控和展示微前端环境中所有应用错误的子应用。它通过 qiankun 的全局状态机制，实时接收并展示主应用和所有子应用产生的错误和警告。

## 核心功能

1. **实时错误接收**：通过 qiankun 的 `initGlobalState` 监听全局错误列表变化
2. **错误分类展示**：支持按来源（主应用/各子应用）和类型（错误/警告）过滤
3. **详细信息展示**：显示错误消息、URL、错误栈等完整信息
4. **错误管理**：支持清空错误列表，限制最大错误数量（1000条）

## 访问方式

- 开发环境：`http://localhost:4180/monitor`
- 预览环境：`http://localhost:4189` 或通过主应用访问 `/monitor`
- 生产环境：通过主应用访问 `/monitor` 路径

## 技术实现

### 错误采集流程

1. **主应用错误捕获**：
   - 在 `system-app/src/utils/errorMonitor.ts` 中实现
   - 捕获 `window.onerror`、`unhandledrejection`、资源加载错误、console.warn/error

2. **子应用错误捕获**：
   - 使用 `@btc/shared-utils/error-monitor` 中的 `setupSubAppErrorCapture`
   - 在子应用的 `mount` 生命周期中调用
   - 通过 props 接收 `updateErrorList` 和 `appName`

3. **错误通信**：
   - 主应用通过 `initGlobalState` 初始化全局状态
   - 所有错误通过 `updateErrorList` 更新到全局状态
   - Monitor App 通过 `onGlobalStateChange` 实时接收错误列表

### 在子应用中集成错误监控

在子应用的 `main.ts` 中：

```typescript
import { setupSubAppErrorCapture } from '@btc/shared-utils/error-monitor';

async function mount(props: QiankunProps) {
  // 设置子应用错误捕获
  if (props.updateErrorList && props.appName) {
    setupSubAppErrorCapture({
      updateErrorList: props.updateErrorList,
      appName: props.appName,
    });
  }
  
  // ... 其他初始化代码
}
```

## 错误类型

- `resource`：资源加载错误（404等）
- `script`：JS 运行时错误
- `promise`：Promise 未处理的拒绝
- `console-warn`：console.warn 输出
- `console-error`：console.error 输出

## 注意事项

1. **生产环境权限控制**：建议在生产环境中对 monitor-app 添加权限控制，仅对管理员开放
2. **性能优化**：错误列表限制为最多 1000 条，超出后自动删除最早的错误（已有保留时间限制）
3. **避免循环上报**：monitor-app 自身的错误不会被捕获（避免无限循环）

