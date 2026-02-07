status: in_progress
priority: P0
progress: 0%
owner: worker-mini-02
created_at: 2026-02-07
start_time: 2026-02-07
completed_at: -

# main-app + operations-app 小程序入口配置

## 验收标准
- [ ] main-app 认证页面入口配置完成
- [ ] operations-app 运维模块入口配置完成
- [ ] 小程序构建验证通过

## 技术细节
```typescript
// apps/main-app/src/app.config.ts
export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/register/index',
    'pages/forgot-password/index',
  ],
});
```
