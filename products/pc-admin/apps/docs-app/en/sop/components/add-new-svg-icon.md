---
title: Add New SVG Icon
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
sidebar_label: Add SVG Icon
sidebar_order: 2
sidebar_group: sop-components
---

# Add New SVG Icon

## Prerequisites
- SVG file format correct (prefer fill type, avoid stroke type)
- File encoding is UTF-8

## Operation Steps

### 1. Place SVG File in Application's icons Directory
```bash
# Example: Add to main application
cp your-icon.svg apps/admin-app/src/assets/icons/
```

### 2. If Plugin Code Modified, Rebuild Plugin
```bash
cd packages/vite-plugin
pnpm build
```

### 3. Restart Development Server
```bash
# Ctrl+C to stop server, then restart
pnpm --filter admin-app dev
```

## Verification
Check in browser console if icon is loaded:
```javascript
// Check if icon exists (assuming icon name is myicon)
console.log(document.getElementById('icon-myicon'))
```

Use in component:
```vue
<btc-svg name="myicon" />
```

## Failure Rollback
If icon doesn't display:
1. Check if filename is correct (don't include `icon-` prefix)
2. Check SVG format (prefer fill type)
3. Confirm server restarted
4. Check console for `[btc:svg] Found XX SVG icons` log
