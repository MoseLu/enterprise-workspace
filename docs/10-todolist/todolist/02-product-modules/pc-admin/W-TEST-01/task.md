status: in_progress
priority: P1
progress: 0%
owner: worker-test-01
created_at: 2026-02-07
start_time: 2026-02-07
completed_at: -

# home-app + main-app 单元测试

## 验收标准
- [ ] home-app 组件测试覆盖 ≥ 80%
- [ ] main-app 组件测试覆盖 ≥ 80%
- [ ] 所有测试通过

## 技术配置
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
```
