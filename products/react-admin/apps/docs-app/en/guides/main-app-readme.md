---
title: Main Application (Main App)
type: guide
project: admin-app
owner: dev-team
created: '2025-10-14'
updated: '2025-10-14'
publish: true
tags:
- overview
- admin-app
- micro-frontend
sidebar_label: Main Application Guide
sidebar_order: 4
sidebar_group: guides
---

# Main Application (Main App)

**Role**: Micro-frontend architecture main application (base application) + system management functionality

## Core Functions

### 1. Micro-Frontend Container
- **qiankun Base**: Provides sub-application loading and management capabilities
- **Application Switching**: Supports seamless switching between multiple sub-applications
- **Global State**: Manages shared state across applications
- **Communication Mechanism**: Provides inter-application communication capabilities

### 2. System Management
- **User Management**: User accounts, roles, permission management
- **Organization Structure**: Department, role, user relationship management
- **System Configuration**: System parameters and configuration management
- **Platform Governance**: Domain, module, plugin management

### 3. Global Layout
- **Top Navigation**: Application switcher and user information
- **Sidebar Menu**: Dynamic menu and navigation
- **Theme Switching**: Light/dark theme support
- **Internationalization**: Multi-language support

## Technical Architecture

### Frontend Technology Stack
- **Framework**: Vue 3 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Element Plus
- **State Management**: Pinia
- **Routing**: Vue Router
- **Micro-Frontend**: qiankun

### Core Components
- **Application Container**: Sub-application loading and management
- **Layout Components**: Global layout and navigation
- **Permission Components**: Permission control and route guards
- **Communication Components**: Cross-application communication mechanism

## Directory Structure

```
admin-app/
├── src/
│   ├── components/     # Global components
│   ├── layout/         # Layout components
│   ├── pages/          # Page components
│   ├── plugins/        # Plugin configuration
│   ├── router/         # Route configuration
│   ├── stores/         # State management
│   └── utils/          # Utility functions
├── public/             # Static resources
└── package.json        # Project configuration
```

## Development Guide

### Start Development Server
```bash
pnpm dev:main
# Or
cd apps/admin-app && pnpm dev
```

### Access Address
- **Local Access**: http://localhost:8080
- **Network Access**: http://[your-IP]:8080

### Environment Configuration
- **Development Environment**: Automatically loads sub-applications
- **Production Environment**: Supports independent deployment

## Deployment Instructions

### Build Command
```bash
pnpm build:main
```

### Deployment Requirements
- **Node.js**: >= 18.0.0
- **Static Server**: Nginx or Apache
- **HTTPS**: Production environment recommended to use HTTPS

### Configuration Points
- **Sub-Application Configuration**: Ensure sub-application addresses are correct
- **Cross-Origin Settings**: Configure CORS to allow sub-application access
- **Cache Strategy**: Set appropriate cache strategy

---

**Application Type**: Micro-Frontend Main Application
**Port**: 8080
**Maintenance Team**: Frontend Team
