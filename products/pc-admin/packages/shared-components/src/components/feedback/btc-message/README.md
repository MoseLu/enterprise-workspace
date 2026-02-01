# BtcMessage 组件

基于 Element Plus 的 `BtcMessage` 封装的消息组件，支持重复消息徽标计数功能。

## 功能特性

- ✅ **重复消息徽标计数**：相同内容的消息会显示重复次数徽标
- ✅ **自动递增递减**：连续重复消息时徽标递增，停止后自动递减
- ✅ **智能生命周期管理**：消息自动关闭，状态自动清理，无需手动关闭按钮
- ✅ **类型化支持**：支持 success、warning、info、error 四种类型
- ✅ **主题适配**：支持亮色/暗色主题切换
- ✅ **响应式设计**：移动端友好的徽标尺寸
- ✅ **完全兼容**：基于原生 BtcMessage，保持所有原生功能

## 安装使用

### 导入组件

```typescript
import { BtcMessage } from '@btc/shared-components';
```

### 基本用法

```typescript
// 成功消息
BtcMessage.success('操作成功完成！');

// 警告消息
BtcMessage.warning('请注意相关风险！');

// 信息消息
BtcMessage.info('这是一条提示信息');

// 错误消息
BtcMessage.error('操作失败，请重试！');
```

### 高级用法

```typescript
// 自定义配置
BtcMessage.info('这是一条自定义消息', {
  duration: 5000,
  showClose: true,
  maxCount: 15,
});
```

## API 参考

### 方法

#### BtcMessage.success(message, options?)

显示成功类型的消息。

**参数：**

- `message: string` - 消息内容
- `options?: MessageOptions` - 可选配置

#### BtcMessage.warning(message, options?)

显示警告类型的消息。

#### BtcMessage.info(message, options?)

显示信息类型的消息。

#### BtcMessage.error(message, options?)

显示错误类型的消息。

### 配置选项 (MessageOptions)

```typescript
interface MessageOptions {
  duration?: number; // 显示时长（毫秒），默认 3000
  showClose?: boolean; // 是否显示关闭按钮，默认 false（BtcMessage 不需要关闭按钮）
  dangerouslyUseHTMLString?: boolean; // 是否支持 HTML 内容，默认 false
  maxCount?: number; // 最大重复次数，默认 10
}
```

### 静态方法

#### BtcMessage.closeAll()

关闭所有当前显示的消息。

```typescript
BtcMessage.closeAll();
```

## 重复消息徽标功能

### 工作原理

1. **消息去重**：相同类型和内容的消息会被识别为重复消息
2. **徽标递增**：连续发送重复消息时，徽标数字会递增（最大到 maxCount）
3. **自动递减**：停止发送重复消息后，徽标数字会逐渐递减
4. **智能关闭**：当徽标数字递减到 1 时，消息会自动关闭

### 徽标样式

- **位置**：消息框右上角
- **样式**：圆形徽标，金色边框
- **颜色**：根据消息类型自动适配主题色
- **尺寸**：桌面端 18px，移动端 16px

### 示例

```typescript
// 快速连续点击同一个按钮
BtcMessage.success('操作成功！'); // 显示 "操作成功！"
BtcMessage.success('操作成功！'); // 徽标显示 "2"
BtcMessage.success('操作成功！'); // 徽标显示 "3"
// ... 停止点击后，徽标会逐渐递减到 1，然后消息自动关闭
```

## 样式定制

### CSS 变量

组件支持以下 CSS 变量进行主题定制：

```scss
:root {
  --btc-message-badge-success: #67c23a;
  --btc-message-badge-warning: #e6a23c;
  --btc-message-badge-info: #909399;
  --btc-message-badge-error: #f56c6c;
}
```

### 自定义样式

```scss
// 自定义徽标样式
.btc-message-badge-container {
  .btc-message-badge {
    border-color: #your-color; // 自定义边框颜色
    background-color: #your-bg-color; // 自定义背景色
  }
}
```

## 最佳实践

### 1. 合理使用重复消息

```typescript
// ✅ 好的做法：用于用户操作反馈
const handleSave = () => {
  BtcMessage.success('保存成功！');
};

// ❌ 避免：用于错误信息
const handleError = () => {
  BtcMessage.error('网络错误！'); // 错误信息通常不应该重复
};
```

### 2. 设置合适的持续时间

```typescript
// 重要消息使用较长持续时间
BtcMessage.success('数据已保存', {
  duration: 5000,
});

// 一般提示使用默认时间
BtcMessage.info('操作完成');
```

## 注意事项

1. **消息去重**：基于 `type:content` 的 key 进行去重，相同类型和内容的消息会被合并
2. **自动清理**：消息关闭时会自动清理相关状态，避免内存泄漏
3. **DOM 操作**：组件会进行必要的 DOM 操作来显示徽标，不会影响原生 BtcMessage 的功能
4. **样式隔离**：徽标样式不会影响其他消息的显示
5. **无关闭按钮**：BtcMessage 不显示关闭按钮，消息会自动关闭，用户无需手动操作

## 与 BtcNotification 的区别

| 特性     | BtcMessage             | BtcNotification    |
| -------- | ---------------------- | ------------------ |
| 显示位置 | 页面顶部中央           | 右上角             |
| 徽标位置 | 右上角                 | 左上角             |
| 持续时间 | 默认 3 秒              | 默认 4.5 秒        |
| 关闭按钮 | 无（自动关闭）         | 有（可手动关闭）   |
| 适用场景 | 用户操作提示、表单验证 | 系统通知、操作反馈 |

## 更新日志

### v1.0.0

- 初始版本发布
- 支持重复消息徽标计数
- 支持四种消息类型
- 支持主题适配和响应式设计

## 许可证

MIT License
