# BTC ShopFlow Monorepo

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat&logo=vue.js" alt="Vue 3.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Micro--Frontend-qiankun-FF6B6B?style=flat" alt="Micro Frontend" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
  <img src="https://img.shields.io/badge/Branch-develop-blue?style=flat&logo=git" alt="Develop Branch" />
</div>

> 🌐 **Multi-language Versions**: [简体中文](./README.md) | [中文简体](./README_ZH.md)

---

An enterprise-grade supply chain management system based on micro-frontend architecture, built with qiankun micro-frontend framework.

## 📋 Project Overview

BTC ShopFlow is a comprehensive supply chain management solution that includes the following core modules:

- **System App** - System management and micro-frontend container
- **Admin App** - Admin management module
- **Logistics App** - Logistics management module
- **Production App** - Production planning and management
- **Quality App** - Quality control and inspection
- **Engineering App** - Engineering design and management
- **Finance App** - Financial management module
- **Mobile App** - Mobile application
- **Docs Site** - Project documentation and component library documentation

## 🏗️ Technical Architecture

### Core Technology Stack

- **Frontend Framework**: Vue 3 + TypeScript
- **Micro Frontend**: qiankun
- **Build Tools**: Vite + Turbo
- **UI Components**: Element Plus + Custom Component Library
- **Styling**: SCSS + UnoCSS
- **Package Manager**: pnpm
- **Code Standards**: ESLint + Prettier + Commitlint
- **Containerization**: Docker + GitHub Container Registry (GHCR)
- **CI/CD**: GitHub Actions

### Project Structure

```
btc-shopflow-monorepo/
├── apps/                          # Applications
│   ├── system-app/                # System App (Micro-frontend Container)
│   ├── admin-app/                 # Admin App
│   ├── logistics-app/             # Logistics App
│   ├── production-app/            # Production App
│   ├── quality-app/               # Quality App
│   ├── engineering-app/           # Engineering App
│   ├── finance-app/               # Finance App
│   ├── monitor-app/               # Monitor App
│   ├── layout-app/                # Layout App
│   ├── mobile-app/                # Mobile App
│   └── docs-app/             # Documentation Site
├── packages/                       # Shared Packages
│   ├── shared-components/         # Shared Component Library
│   ├── shared-core/               # Core Functionality Library
│   ├── shared-utils/              # Utility Functions Library
│   ├── vite-plugin/               # Vite Plugins
│   └── subapp-manifests/          # Sub-application Manifests
├── scripts/                        # Scripts Directory
│   ├── build-and-push-local.sh    # Build and push images locally
│   ├── deploy-app-local.sh        # Local deployment script
│   ├── trigger-deploy.sh          # Trigger deployment script
│   ├── build-deploy-incremental-k8s.sh  # K8s incremental deployment script
│   └── generate-lint-error-reports.mjs  # Generate lint error reports
├── .github/workflows/              # GitHub Actions Workflows
│   ├── deploy-system-app.yml       # System app deployment workflow
│   ├── deploy-only.yml             # Generic deployment workflow
│   ├── deploy-app-reusable.yml    # Reusable deployment workflow
│   └── build-all-apps.yml         # Build all apps workflow
├── configs/                        # Configuration Files
│   ├── app-scanner.ts             # Application Scanner
│   └── unified-env-config.ts     # Unified Environment Configuration
└── implementation-docs/           # Implementation Documentation
```

## ✨ Recent Updates (v1.0.0)

- ✅ **Branch Strategy Optimization**: Migrated from `master` to `develop` as the development branch, established three-branch system: `main` (production), `develop` (development), `release/*` (release)
- ✅ **System Domain Flow Confirmation Feature**: Implemented flow confirmation feature with status tag rendering and operation column confirmation button
- ✅ **Unified `repository_dispatch` Trigger**: Optimized CI/CD workflow
- ✅ **Enhanced GitHub Actions CI/CD Workflows**: Support for independent deployment of multiple applications
- ✅ **Local Build and Auto-trigger Remote Deployment**: Simplified deployment process
- ✅ **EPS System Optimization**: Auto-generate type definitions and service methods
- ✅ **Component Library Enhancement**: Added BtcTableGroup, BtcMasterList and other composite components

## 🚀 Quick Start

### Environment Requirements

- **Node.js**: >= 20.19.0
- **pnpm**: >= 8.0.0
- **Docker**: For building and pushing images (optional)

### Install Dependencies

```bash
# Install all dependencies (including root and all sub-projects)
pnpm install
```

### Development Mode

```bash
# Start all application development servers
pnpm dev

# Or start all applications (including dependency builds)
pnpm dev:all

# Start specific application
pnpm dev:system      # System App
pnpm dev:admin       # Admin App
pnpm dev:logistics   # Logistics App
pnpm dev:production  # Production App
pnpm dev:quality     # Quality App
pnpm dev:engineering # Engineering App
pnpm dev:finance     # Finance App
pnpm dev:docs        # Documentation Site
```

### Build Project

```bash
# Build all applications
pnpm build:all

# Build specific application
pnpm build:system
pnpm build:admin
pnpm build:logistics
# ... similar for other apps
```

## 🚢 Deployment

### Local Build and Deploy

The project supports building Docker images locally and automatically triggering GitHub Actions for remote deployment:

```bash
# Build and deploy system app
pnpm build-deploy:system

# Build and deploy other apps
pnpm build-deploy:admin
pnpm build-deploy:logistics
pnpm build-deploy:quality
pnpm build-deploy:production
pnpm build-deploy:engineering
pnpm build-deploy:finance
pnpm build-deploy:mobile

# Deploy all applications
pnpm deploy:all

# Kubernetes deployment (incremental deployment)
pnpm build-deploy:k8s              # Auto-detect changed applications
pnpm build-deploy:k8s:all          # Deploy all applications
pnpm build-deploy:k8s:system       # Deploy specific application
```

### Deployment Process

1. **Local Build**: Build Docker image locally
2. **Push Image**: Push image to GitHub Container Registry (GHCR)
3. **Trigger Workflow**: Trigger GitHub Actions workflow via `repository_dispatch` API
4. **Remote Deployment**: GitHub Actions pulls image and deploys on server

### Environment Variables Configuration

Deployment scripts require the following environment variables:

- **GITHUB_TOKEN**: GitHub Personal Access Token
  - Required permissions: `repo` (all), `write:packages`, `actions:write`
  - Setup method (PowerShell):
    ```powershell
    [System.Environment]::SetEnvironmentVariable('GITHUB_TOKEN', 'your_token', 'User')
    ```

### GitHub Actions Secrets

Configure the following Secrets in GitHub repository settings:

- **SERVER_HOST**: Server address
- **SERVER_USER**: Server username (default: root)
- **SERVER_PORT**: SSH port (default: 22)
- **SERVER_KEY**: SSH private key
- **SERVER_PAT**: GitHub Token (for pulling images)

## 📦 Package Description

### Shared Packages

- **@btc/shared-components**: General component library, including tables, forms, CRUD, charts and other components
- **@btc/shared-core**: Core functionality library, including CRUD logic, service management, plugin system, etc.
- **@btc/shared-utils**: Utility functions library, including array, date, formatting, validation and other utility functions
- **@btc/vite-plugin**: Custom Vite plugin, supporting SVG processing, EPS auto-generation, virtual modules, etc.
- **@btc/subapp-manifests**: Sub-application manifest configuration

### Application Packages

- **system-app**: System application, serving as micro-frontend container and system management
- **admin-app**: Admin application, backend management functionality
- **logistics-app**: Logistics management application
- **production-app**: Production management application
- **quality-app**: Quality management application
- **engineering-app**: Engineering management application
- **finance-app**: Financial management application
- **mobile-app**: Mobile application (supports Capacitor)
- **docs-app**: Documentation site, including project documentation and component library documentation

## 🌿 Branch Strategy

### Branch Description

- **`develop`** - **Development Branch**: Default branch, core code source
  - All daily development work is done on this branch
  - Contains the latest development code, frequent commits
  - GitHub Actions workflows run based on this branch
  - Serves as the code source for other branches

- **`main`** - **Production Branch**: Stable code for production environment
  - Only contains tested and verified stable code
  - Merged from `release/*` branches
  - Each version is tagged (e.g., v1.0.0)

- **`release/*`** - **Release Branch**: Version preparation branch
  - Created from `develop` branch (e.g., `release/v1.1.0`)
  - Used for version testing, fixes, and preparation
  - Code closest to production version, but multiple version branches exist
  - After testing passes, merge to `main` and tag

### Workflow

```
develop (development) → release/* (testing) → main (production)
```

1. **Daily Development**: All development work is done on `develop` branch with frequent commits
2. **Release Preparation**: Create `release/v1.x.x` branch from `develop` for testing and fixes
3. **Production Deployment**: After testing passes, merge to `main` branch and tag version (e.g., v1.0.0)
4. **Auto Deployment**: Automatically trigger deployment via `pnpm build-deploy:*` commands

## 🔧 Development Guide

### Code Standards

The project uses ESLint + Prettier for code formatting and Commitlint for commit message standardization.

```bash
# Code linting
pnpm lint

# Code formatting
pnpm format

# Type checking
pnpm type-check

# Check circular dependencies
pnpm check:circular
```

### Commit Standards

Using Conventional Commits standard:

```bash
feat: new feature
fix: bug fix
docs: documentation update
style: code formatting
refactor: refactoring
test: test related
chore: build process or auxiliary tool changes
```

### Component Development

All custom components use the `btc-` prefix and follow these standards:

- Component file naming: `btc-component-name.vue`
- Component registration name: `BtcComponentName`
- Each component needs to provide corresponding README documentation

## 🧪 Automated Testing

The project provides three layers of testing, all runnable via pnpm commands:

```bash
# Unit and component tests (Vitest + Testing Library)
pnpm test:unit

# Business contract integration tests (Vitest + MSW)
pnpm test:integration

# End-to-end tests (Playwright)
pnpm test:e2e

# CI runs all tests at once
pnpm test:ci
```

> Before running end-to-end tests for the first time, run `pnpm exec playwright install --with-deps` to install browser dependencies.

## 🌐 Micro-Frontend Architecture

### qiankun Configuration

The project uses qiankun to implement micro-frontend architecture:

- **Main App (system-app)**: Responsible for route management and sub-application loading
- **Sub Apps**: Independent business modules for development and deployment (admin-app, logistics-app, etc.)
- **Communication**: Inter-application communication through props and global state management

### Sub-Application Development

Each sub-application is an independent Vue 3 project that supports:

- Independent development and debugging
- Independent build and deployment
- Data communication with the main application
- Shared components and utility libraries

## 🔄 CI/CD Workflow

### GitHub Actions Workflows

The project uses GitHub Actions for automated CI/CD:

- **deploy-system-app.yml**: System app specific deployment workflow
- **deploy-only.yml**: Generic deployment workflow (supports batch deployment of multiple apps)
- **deploy-app-reusable.yml**: Reusable deployment workflow
- **repository-dispatch-handler.yml**: Unified handling of `repository_dispatch` events

### Workflow Trigger Methods

1. **repository_dispatch**: Triggered via API (recommended, automatically triggered by local scripts)
2. **workflow_dispatch**: Manual trigger (GitHub web interface)
3. **push**: Push to specific paths on `develop` branch triggers (e.g., `.deploy/system-app/**`)

### Deployment Process

1. Run `pnpm build-deploy:*` command locally
2. Script builds Docker image and pushes to GHCR
3. Script triggers GitHub Actions via `repository_dispatch` API
4. GitHub Actions pulls image and deploys on server

## 📚 Documentation

- [Architecture Design Documentation](./implementation-docs/)
- [Component Documentation](./apps/docs-app/)
- [Deployment Documentation](./apps/docs-app/guides/deployment/)
  - [K8s Incremental Deployment](./docs/K8S_INCREMENTAL_DEPLOYMENT.md)
  - [GitHub Actions K8s Setup](./docs/GITHUB_ACTIONS_K8S_SETUP.md)
  - [Static Deployment](./apps/docs-app/guides/deployment/static-deployment.md)
  - [Subdomain Proxy Configuration](./apps/docs-app/guides/deployment/nginx-subdomain-proxy.md)

## 🤝 Contributing Guide

1. Fork the project
2. Create a feature branch from `develop` (`git checkout -b feature/AmazingFeature develop`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request to `develop` branch

### Version Release Process

1. **Create Release Branch**: Create `release/v1.x.x` branch from `develop`
2. **Testing and Fixes**: Test and fix bugs on release branch
3. **Merge to main**: After testing passes, merge to `main` branch
4. **Tag Version**: Tag version on `main` branch (e.g., `v1.0.0`)
5. **Push Tags**: Push tags to remote repository

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- Project Maintainer: BTC IT Team
- OutLook Email: mlu@bellis-technology.cn
- Project Repository: https://github.com/BellisGit/btc-shopflow-monorepo

---

**Note**: This is an enterprise-level project. Please make sure to read the relevant architecture documentation and development guides before development.
