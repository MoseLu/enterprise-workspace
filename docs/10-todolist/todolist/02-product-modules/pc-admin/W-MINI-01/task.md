status: in_progress
priority: P0
progress: 0%
owner: worker-mini-01
created_at: 2026-02-07
start_time: 2026-02-07
completed_at: -

# home-app + admin-app 小程序入口配置

## 验收标准
- [ ] home-app app.config.ts 完成
- [ ] home-app 页面配置完成
- [ ] admin-app app.config.ts 完成
- [ ] admin-app 多模块页面配置完成
- [ ] 小程序构建验证通过

## 技术细节
```typescript
// apps/home-app/src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/about/index',
    'pages/help/index',
    'pages/terms/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '首页',
    navigationBarTextStyle: 'black',
  },
});
```
