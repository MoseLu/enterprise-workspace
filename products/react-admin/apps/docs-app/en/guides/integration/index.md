---
title: Integration Deployment
type: guide
project: integration
owner: dev-team
created: '2025-10-13'
updated: '2025-10-13'
publish: true
tags: ["integration", "guides"]
sidebar_label: Integration Deployment
sidebar_order: 5
sidebar_group: guides
---

# Integration Deployment

This section introduces the integration solution between the documentation center and the main application, as well as related deployment and optimization strategies.

## Table of Contents

- [Documentation Integration](/en/guides/integration/vitepress-integration-complete) - VitePress documentation center integration
- [Cache Optimization](/en/guides/integration/docs-cache-debug) - Documentation cache strategy and optimization
- [iframe Optimization](/en/guides/integration/docs-iframe-cache-optimization) - iframe performance optimization
- [Instant Switch](/en/guides/integration/docs-instant-switch) - Fast switching between applications
- [Search Integration](/en/guides/integration/vitepress-search-integration) - Global search integration
- [Layout Hiding](/en/guides/integration/docs-layout-hide-strategy) - Layout hiding strategy
- [Layout Refactoring](/en/guides/integration/layout-refactor-complete) - Layout system refactoring
- [Documentation Migration](/en/guides/integration/doc-migration-complete) - Documentation system migration
- [Integration Summary](/en/guides/integration/docs-integration-summary) - Complete integration solution summary

---

## Goals

- Achieve seamless integration between documentation center and main application
- Optimize documentation application loading speed and switching experience
- Ensure theme, language, and other configurations are synchronized between main application and documentation application
- Provide clear integration solutions and best practices

---

## Key Technologies

- **iframe Embedding**: Embed VitePress documentation application as iframe into main application
- **PostMessage**: Cross-origin communication between main application and iframe, achieving theme, language, and other state synchronization
- **VitePress Configuration**: Configure VitePress behavior through `config.ts`, such as disabling `appearance`
- **LocalStorage**: Used to persist theme state, ensuring theme consistency after refresh

---

## Quick Start

Please follow these steps for system integration:

1. **Configure VitePress**: Disable `appearance`, inject early scripts
2. **Configure Main Application**: Implement theme synchronization logic in `docs-iframe/index.vue`
3. **Deploy**: Ensure VitePress application is independently deployed and accessible via URL

For detailed steps, please refer to each sub-document.
