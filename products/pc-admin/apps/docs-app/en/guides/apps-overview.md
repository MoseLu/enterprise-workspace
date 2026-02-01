---
title: Application Directory Overview
type: guide
project: btc-shopflow
owner: dev-team
created: '2025-10-14'
updated: '2025-01-27'
publish: true
tags:
- overview
- apps
- micro-frontend
sidebar_label: Application Overview
sidebar_order: 3
sidebar_group: guides
---

# Application Overview

This directory contains all micro-frontend applications, built using the qiankun micro-frontend framework.

## Application List

### 1. system-app (System Application)
- **Development Port**: 8080
- **Preview Port**: 4180
- **Production Domain**: bellis.com.cn
- **Function**: Micro-frontend container and system management
- **Features**: Serves as main application (base application), responsible for route management and sub-application loading
- **Start Command**: `pnpm dev:system`

### 2. admin-app (Admin Application)
- **Development Port**: 8081
- **Preview Port**: 4181
- **Production Domain**: admin.bellis.com.cn
- **Function**: Backend management module, includes system management, permission configuration, etc.
- **Features**: Includes global layout, hamburger menu, application switcher
- **Start Command**: `pnpm dev:admin`
- **Detailed Documentation**: [Main Application Guide](../main-app-readme)

### 3. logistics-app (Logistics Application)
- **Development Port**: 8082
- **Preview Port**: 4182
- **Production Domain**: logistics.bellis.com.cn
- **Function**: Logistics management related functions
- **Features**: Independent business module application
- **Start Command**: `pnpm dev:logistics`

### 4. quality-app (Quality Application)
- **Development Port**: 8083
- **Preview Port**: 4183
- **Production Domain**: quality.bellis.com.cn
- **Function**: Quality control and inspection
- **Features**: Independent business module application
- **Start Command**: `pnpm dev:quality`

### 5. production-app (Production Application)
- **Development Port**: 8084
- **Preview Port**: 4184
- **Production Domain**: production.bellis.com.cn
- **Function**: Production planning and management
- **Features**: Independent business module application
- **Start Command**: `pnpm dev:production`

### 6. engineering-app (Engineering Application)
- **Development Port**: 8085
- **Preview Port**: 4185
- **Production Domain**: engineering.bellis.com.cn
- **Function**: Engineering design and management
- **Features**: Independent business module application
- **Start Command**: `pnpm dev:engineering`

### 7. finance-app (Finance Application)
- **Development Port**: 8086
- **Preview Port**: 4186
- **Production Domain**: finance.bellis.com.cn
- **Function**: Finance management module
- **Features**: Independent business module application
- **Start Command**: `pnpm dev:finance`

### 8. mobile-app (Mobile Application)
- **Development Port**: 8091
- **Preview Port**: 4191
- **Production Domain**: mobile.bellis.com.cn
- **Function**: Mobile application, initially focused on inventory functionality
- **Features**: Supports PWA, offline-first, supports Capacitor for native app builds
- **Technology Stack**: Vue 3 + Vant Mobile + Capacitor
- **Start Command**: `pnpm dev:mobile`
- **Detailed Documentation**: See [mobile-app README](../../../apps/mobile-app/README.md)

### 9. docs-site-app (Documentation Site)
- **Development Port**: 4172
- **Preview Port**: 4173
- **Production Domain**: docs.bellis.com.cn
- **Function**: Project documentation and technical documentation
- **Features**: VitePress-based documentation system
- **Start Command**: `pnpm dev:docs`

### 10. monitor-app (Monitor Application)
- **Development Port**: 8089
- **Preview Port**: 4189
- **Production Domain**: monitor.bellis.com.cn
- **Function**: Global error monitoring and display
- **Features**: Real-time receive and display errors and warnings from main application and all sub-applications
- **Start Command**: `pnpm dev:monitor`
- **Detailed Documentation**: See [monitor-app README](../../../apps/monitor-app/README.md)

### 11. layout-app (Layout Application)
- **Development Port**: 8088
- **Preview Port**: 4192
- **Production Domain**: layout.bellis.com.cn
- **Function**: Layout components and shared layout functionality
- **Features**: Provides unified layout components
- **Start Command**: `pnpm dev:layout`

## Micro-Frontend Architecture

### qiankun Framework
- **Main Application**: main-app serves as container application, responsible for route management and sub-application loading
- **Sub-Applications**: Each business application as independent application (admin-app, logistics-app, etc.)
- **Communication**: Inter-application communication via qiankun's props and global state management

### Independent Development
- **Technology Stack**: Each application is an independent Vue 3 project
- **Deployment**: Supports independent build and deployment
- **Team**: Supports multi-team parallel development

## Development Guide

### Start All Applications
```bash
# Start all applications (including dependency build)
pnpm dev:all

# Or start all application development servers (without building dependencies)
pnpm dev
```

### Start Single Application
```bash
pnpm dev:system      # System application
pnpm dev:admin       # Admin application
pnpm dev:logistics   # Logistics application
pnpm dev:quality     # Quality application
pnpm dev:production  # Production application
pnpm dev:engineering # Engineering application
pnpm dev:finance     # Finance application
pnpm dev:mobile      # Mobile application
pnpm dev:docs        # Documentation site
pnpm dev:monitor     # Monitor application
```

### Build Applications
```bash
# Build all applications
pnpm build:all

# Build specific application
pnpm build:system
pnpm build:admin
pnpm build:logistics
# ... other applications similar
```

### Deploy Applications
```bash
# Build and deploy specific application
pnpm build-deploy:system
pnpm build-deploy:admin
pnpm build-deploy:logistics
# ... other applications similar

# Deploy all applications
pnpm deploy:all
```

---

**Architecture Type**: Micro-Frontend  
**Framework**: qiankun  
**Maintenance Team**: Frontend Team
