# Contributing to BTC ShopFlow

Thank you for your interest in contributing to BTC ShopFlow! We welcome contributions from the community.

## How to Contribute

### 1. Fork the Repository

First, fork the repository to your own GitHub account.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/btc-shopflow-monorepo.git
cd btc-shopflow-monorepo
```

### 3. Create a Branch

Create a new branch for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

### 5. Commit Your Changes

Use conventional commit messages:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug in component"
git commit -m "docs: update documentation"
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

Open a pull request from your branch to the main branch.

## Code Style Guidelines

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## Testing

Before submitting your pull request, make sure to:

- Run the test suite: `pnpm test`
- Run linting: `pnpm lint`
- Run type checking: `pnpm type-check`
- Test your changes manually

## Documentation

### 文档更新要求

**重要**: 代码变更涉及功能、API 或架构调整时，必须同步更新相关文档。

#### 何时更新文档

- ✅ 添加新功能 → 更新使用指南
- ✅ 修改 API → 更新 API 文档
- ✅ 架构变更 → 更新架构文档
- ✅ 添加新应用/包 → 更新 README
- ✅ 修改配置 → 更新配置说明

#### 文档位置

- **全局文档**: `docs/` 目录
- **应用文档**: `apps/{app-name}/docs/` 或 `apps/{app-name}/README.md`
- **包文档**: `packages/{package-name}/docs/` 或 `packages/{package-name}/README.md`
- **组件文档**: `packages/shared-components/src/components/{component}/README.md`

#### 文档规范

- 使用 Markdown 格式
- 遵循命名规范（kebab-case）
- 添加清晰的标题和章节
- 包含代码示例
- 更新内部链接

#### PR 评审

- PR 评审必须包含文档评审
- 文档变更应与代码变更一起提交
- 使用 `docs:` 前缀的提交信息

#### 文档验证

运行文档验证脚本（可选）：
```bash
node scripts/validate-docs.mjs
```

### 文档维护

- Update README files when adding new features
- Add inline documentation for complex code
- Update API documentation if applicable
- Follow the [文档架构规范](docs/documentation-audit-and-restructure.md)

## Issues and Bug Reports

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)

## Questions?

If you have any questions about contributing, please:

- Open an issue for discussion
- Join our community discussions
- Contact the maintainers

Thank you for contributing to BTC ShopFlow!
