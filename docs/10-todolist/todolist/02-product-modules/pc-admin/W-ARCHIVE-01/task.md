status: in_progress
priority: P2
progress: 0%
owner: worker-archive-01
created_at: 2026-02-07
start_time: 2026-02-07
completed_at: -

# Vue 代码归档到 references

## 验收标准
- [ ] references/pc-admin-vue 目录创建完成
- [ ] Vue 代码迁移完成
- [ ] Git 历史保留
- [ ] 文档链接更新完成
- [ ] 归档说明文档创建完成

## 执行步骤
```bash
git mv products/pc-admin/* references/pc-admin-vue/
git commit -m "chore: 归档旧版 pc-admin Vue 代码"
```
