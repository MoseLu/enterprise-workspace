# 高对比度颜色变量设置指南

## 重要说明

**不需要重新构建设计令牌包**！这些高对比度颜色变量是**运行时动态生成**的，不依赖设计令牌包。

## 工作原理

高对比度颜色变量（`--el-color-primary-contrast-*`）是在应用初始化时，通过 `setThemeColor` 函数动态计算并设置到 CSS 变量中的。

### 生成时机

1. **应用启动时**：主题插件初始化时会调用 `setThemeColor`
2. **切换主题时**：用户切换主题色时会重新生成
3. **切换暗黑模式时**：切换亮色/暗色模式时会重新生成

## 如何让变量生效

### 方法一：重启开发服务器（推荐）

如果代码已经修改，最简单的方法是重启开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
pnpm dev
```

### 方法二：手动触发主题色设置

如果变量仍未显示，可以在浏览器控制台手动触发：

```javascript
// 完整的调试和设置脚本
(function() {
  console.log('=== 主题色调试脚本 ===');
  
  // 1. 检查主题插件是否存在
  const themePlugin = window.__THEME_PLUGIN__;
  if (!themePlugin) {
    console.error('❌ 主题插件未找到！请检查应用是否正确初始化。');
    return;
  }
  console.log('✅ 主题插件已找到:', themePlugin);
  
  // 2. 检查当前主题色
  const currentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--el-color-primary').trim();
  console.log('当前主题色:', currentColor || '未设置');
  
  // 3. 检查是否为暗色模式
  const isDark = document.documentElement.classList.contains('dark');
  console.log('暗色模式:', isDark);
  
  // 4. 检查高对比度变量
  const contrastVars = [
    '--el-color-primary-contrast-light',
    '--el-color-primary-contrast-dark',
    '--el-color-primary-contrast-aa',
    '--el-color-primary-contrast-aaa'
  ];
  
  console.log('\n=== 当前高对比度变量 ===');
  contrastVars.forEach(varName => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName).trim();
    console.log(`${varName}: ${value || '❌ 未设置'}`);
  });
  
  // 5. 如果主题色存在，重新设置
  if (currentColor) {
    console.log('\n=== 重新设置主题色 ===');
    
    // 方法1: 使用 setThemeColor（需要传入暗色模式）
    if (themePlugin.setThemeColor) {
      console.log('使用 setThemeColor 方法...');
      themePlugin.setThemeColor(currentColor, isDark);
      console.log('✅ setThemeColor 已调用');
    }
    
    // 方法2: 使用 updateThemeColor（推荐，会自动处理）
    if (themePlugin.updateThemeColor) {
      console.log('使用 updateThemeColor 方法...');
      themePlugin.updateThemeColor(currentColor);
      console.log('✅ updateThemeColor 已调用');
    }
    
    // 等待一下，然后再次检查
    setTimeout(() => {
      console.log('\n=== 设置后的高对比度变量 ===');
      contrastVars.forEach(varName => {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(varName).trim();
        console.log(`${varName}: ${value || '❌ 仍未设置'}`);
      });
    }, 500);
  } else {
    console.error('❌ 当前主题色未设置，无法生成高对比度变量！');
    console.log('提示: 请先在主题设置中选择一个主题色');
  }
})();
```

### 方法三：切换主题色

在应用的主题设置中切换一次主题色，这会触发 `setThemeColor` 函数重新生成所有变量。

## 验证变量是否生效

### 1. 检查浏览器开发者工具

打开浏览器开发者工具（F12），在 Console 中运行：

```javascript
// 检查所有高对比度变量
const vars = [
  '--el-color-primary-contrast-light',
  '--el-color-primary-contrast-dark',
  '--el-color-primary-contrast-aa',
  '--el-color-primary-contrast-aaa'
];

vars.forEach(varName => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName).trim();
  console.log(`${varName}: ${value || '未设置'}`);
});
```

### 2. 查看测试页面

访问测试二页面（`/test/test-two`），应该能看到所有颜色变量的演示。

### 3. 检查元素样式

在 Elements 面板中，选中 `<html>` 元素，查看 `style` 属性，应该能看到：

```css
--el-color-primary-contrast-light: #xxxxxx;
--el-color-primary-contrast-dark: #xxxxxx;
--el-color-primary-contrast-aa: #xxxxxx;
--el-color-primary-contrast-aaa: #xxxxxx;
```

## 常见问题

### Q1: 变量显示"未设置"

**原因**：主题色设置函数可能还没有被调用，或者调用时出错了。

**解决方案**：
1. 检查浏览器控制台是否有错误信息
2. 尝试切换一次主题色
3. 刷新页面

### Q2: 变量值不正确

**原因**：可能是颜色计算算法的问题。

**解决方案**：
1. 检查主色值是否正确：`getComputedStyle(document.documentElement).getPropertyValue('--el-color-primary')`
2. 检查是否为暗色模式：`document.documentElement.classList.contains('dark')`
3. 查看浏览器控制台是否有警告信息

### Q3: 变量在子应用中不显示

**原因**：子应用可能还没有同步到主题色变量。

**解决方案**：
1. 检查主应用是否正确设置了变量
2. 子应用加载后会自动同步，等待几秒后刷新
3. 如果仍然不行，检查微前端配置是否正确

## 调试技巧

### 启用详细日志

在 `packages/shared-core/src/btc/utils/color-contrast.ts` 中添加日志：

```typescript
export function generateContrastVariants(
  primaryColor: string,
  isDark: boolean = false
) {
  console.log('[Color Contrast] Generating variants:', {
    primaryColor,
    isDark
  });
  
  // ... 生成逻辑
  
  console.log('[Color Contrast] Generated variants:', {
    contrastLight,
    contrastDark,
    contrastAA,
    contrastAAA
  });
  
  return { contrastLight, contrastDark, contrastAA, contrastAAA };
}
```

### 检查主题插件状态

```javascript
// 检查主题插件是否已初始化
console.log('Theme Plugin:', window.__THEME_PLUGIN__);

// 检查当前主题色
console.log('Current Color:', window.__THEME_PLUGIN__?.color?.value);

// 手动设置主题色（推荐使用 updateThemeColor）
if (window.__THEME_PLUGIN__) {
  const currentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--el-color-primary').trim();
  
  if (currentColor) {
    // 方法1: 使用 updateThemeColor（推荐）
    window.__THEME_PLUGIN__.updateThemeColor(currentColor);
    
    // 方法2: 使用 setThemeColor（需要传入暗色模式）
    const isDark = document.documentElement.classList.contains('dark');
    window.__THEME_PLUGIN__.setThemeColor(currentColor, isDark);
  } else {
    // 如果没有主题色，先设置一个
    window.__THEME_PLUGIN__.updateThemeColor('#4165d7');
  }
}
```

### 快速测试脚本（一键运行）

将以下代码复制到浏览器控制台运行：

```javascript
// 一键测试和修复脚本（强制生成）
(function() {
  console.log('=== 强制生成高对比度变量 ===');
  
  const plugin = window.__THEME_PLUGIN__;
  if (!plugin) {
    console.error('❌ 主题插件未找到！');
    return;
  }
  
  // 获取当前主题色和暗黑模式
  let color = getComputedStyle(document.documentElement)
    .getPropertyValue('--el-color-primary').trim();
  const isDark = document.documentElement.classList.contains('dark');
  
  if (!color) {
    console.log('⚠️ 未检测到主题色，使用默认蓝色...');
    color = '#4165d7';
  } else {
    console.log('✅ 检测到主题色:', color);
  }
  
  console.log('暗色模式:', isDark);
  
  // 方法1: 先清除当前颜色，强制重新生成
  console.log('\n方法1: 清除当前颜色，强制重新生成...');
  document.documentElement.style.removeProperty('--el-color-primary');
  
  // 等待一下
  setTimeout(() => {
    // 使用 setThemeColor 直接设置（跳过颜色检查）
    if (plugin.setThemeColor) {
      console.log('调用 setThemeColor...');
      plugin.setThemeColor(color, isDark);
    }
    
    // 等待生成完成
    setTimeout(() => {
      const vars = [
        '--el-color-primary-contrast-light',
        '--el-color-primary-contrast-dark',
        '--el-color-primary-contrast-aa',
        '--el-color-primary-contrast-aaa'
      ];
      
      console.log('\n📊 高对比度变量状态:');
      let allSet = true;
      vars.forEach(v => {
        const val = getComputedStyle(document.documentElement)
          .getPropertyValue(v).trim();
        const status = val ? '✅' : '❌';
        console.log(`  ${status} ${v}: ${val || '未设置'}`);
        if (!val) allSet = false;
      });
      
      if (allSet) {
        console.log('\n✅ 所有高对比度变量已成功生成！');
      } else {
        console.log('\n⚠️ 部分变量未设置，请检查浏览器控制台的错误信息');
        console.log('提示: 可能需要重启开发服务器以加载最新代码');
      }
    }, 1000);
  }, 100);
})();
```

### 如果仍然未设置，检查代码是否已更新

如果运行脚本后变量仍然未设置，可能是代码还没有热更新。请：

1. **检查浏览器控制台**是否有错误信息
2. **重启开发服务器**：
   ```bash
   # 停止服务器（Ctrl+C）
   pnpm dev
   ```
3. **检查代码是否已保存**：确保所有修改的文件都已保存
4. **清除浏览器缓存**：Ctrl+Shift+R 强制刷新

## 总结

1. ✅ **不需要重新构建设计令牌包**
2. ✅ **变量是运行时动态生成的**
3. ✅ **重启开发服务器即可生效**
4. ✅ **切换主题色会触发重新生成**
5. ✅ **使用测试页面验证效果**

如果按照上述步骤操作后仍然有问题，请检查：
- 浏览器控制台的错误信息
- 主题插件是否正确初始化
- 代码是否有语法错误
