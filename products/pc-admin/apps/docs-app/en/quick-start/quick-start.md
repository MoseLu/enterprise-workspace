---
title: Start Project
sidebar_label: Start Project
sidebar_order: 2
---

# Start Project

## Start Development Server

### Start All Applications (Recommended)

```bash
# Execute in project root directory
pnpm dev:all
```

This will automatically:
- Check and clean port occupancy
- Build shared packages (if needed)
- Start development servers for all applications (mobile app excluded)

All applications will start on different ports and can be accessed through the main application.

### Start Single Application

```bash
# Enter application directory
cd apps/main-app

# Start development server
pnpm dev
```

Access: `http://localhost:8080` (according to application configured port)

### Start Documentation Site

```bash
cd apps/docs-app
pnpm dev
```

Access: `http://localhost:8093` (or configured port)

## Build Project

### Build Single Application

```bash
cd apps/main-app
pnpm build
```

### Build All Applications

```bash
# Execute in root directory
pnpm build:all
```

## Run Tests

```bash
# Run all tests
pnpm test

# Run specific application tests
cd apps/main-app
pnpm test
```

## Common Commands

### Root Directory Commands

```bash
# Install dependencies
pnpm install

# Build all packages and applications
pnpm build:all

# Run all tests
pnpm test

# Code check
pnpm lint

# Format code
pnpm format
```

### Application-Level Commands

```bash
# Development mode
pnpm dev

# Build production version
pnpm build

# Preview build results
pnpm preview
```

## Next Steps

- [Project Structure](./project-structure.md) - Understand Monorepo structure
- [Development Guides](/en/guides/) - Start development
- [Architecture Design](/en/docs-sources/global/architecture/overview) - Understand system architecture
