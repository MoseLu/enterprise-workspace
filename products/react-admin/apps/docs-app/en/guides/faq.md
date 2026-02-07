---
title: Frequently Asked Questions
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-01-14'
updated: '2025-01-14'
publish: true
tags:
  - faq
  - troubleshooting
sidebar_label: FAQ
sidebar_order: 100
---

# Frequently Asked Questions (FAQ)

This document collects common problems and solutions during development.

## Development Environment

### Q: How to start development server?

A: Run in project root directory:

```bash
pnpm dev
```

Or start specific application:

```bash
pnpm --filter main-app dev
```

### Q: What to do about port conflicts?

A: You can modify the port configuration in the application's `vite.config.ts`, or use `pnpm --filter docs-app dev:clean` to clean the port.

## Build Issues

### Q: "Element is missing end tag" error during build?

A: This is usually because there are unclosed HTML tags in Markdown files. Check the reported file and ensure all tags are properly closed.

### Q: Syntax highlighting language not loaded warning during build?

A: Some code blocks may use language identifiers that are not supported. You can use common language identifiers instead (such as `js`, `ts`, `vue`, `bash`, etc.).

## Documentation Related

### Q: How to add new documentation?

A: Use command to create:

```bash
pnpm --filter docs-app new-doc
```

Or manually create `.md` file in the corresponding directory and add frontmatter.

### Q: How to sync documentation?

A: Run sync script:

```bash
pnpm --filter docs-app sync
```

## Component Development

### Q: How to add new components?

A: Refer to component development standards in [Component Development Guide](/en/guides/components/).

### Q: How to customize theme?

A: Refer to theme customization section in [System Configuration](/en/guides/system/).

## Internationalization

### Q: How to configure internationalization?

A: Refer to internationalization configuration section in [System Configuration](/en/guides/system/).

### Q: How to add new translations?

A: Find the corresponding language file in the `locales` directory and add new key-value pairs.

## Deployment

### Q: How to deploy to production environment?

A: Refer to related documentation in [Deployment Guide](/en/guides/deployment/).

### Q: How to configure CDN acceleration?

A: Refer to [CDN Acceleration Configuration](/en/guides/deployment/cdn-acceleration.md).

## Other Issues

### Q: What to do if encountering other problems?

A: 
1. Check if this document has relevant answers
2. View project's GitHub Issues
3. Contact development team

---

> 💡 **Tip**: If this document doesn't answer your question, please submit an Issue or PR to improve the documentation.
