# 测试指南

> react-admin 测试策略和实践

## 测试架构

```
src/
├── __tests__/
│   ├── setup.ts          # 测试配置
│   ├── utils.ts          # 测试工具
│   └── mocks/            # Mock 文件
├── components/
│   └── Button/
│       ├── index.tsx
│       ├── Button.test.tsx
│       └── Button.module.scss
├── pages/
│   └── Home/
│       ├── index.tsx
│       └── Home.test.tsx
└── hooks/
    └── useAuth/
        └── useAuth.test.ts
```

## 测试类型

### 1. 单元测试

测试独立组件和函数：

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. 集成测试

测试组件交互：

```typescript
// Form.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user';

describe('Form Integration', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### 3. 钩子测试

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
});
```

## 运行测试

```bash
# 运行所有测试
pnpm test

# 运行一次测试
pnpm test:run

# 运行并生成覆盖率报告
pnpm test:coverage

# 打开测试 UI
pnpm test:ui

# 监听模式
pnpm test:watch
```

## 覆盖率要求

| 类型 | 最低要求 |
|------|----------|
| 整体覆盖率 | 80% |
| 分支覆盖率 | 70% |
| 函数覆盖率 | 80% |
| 行覆盖率 | 80% |

## 测试工具

| 工具 | 用途 |
|------|------|
| Vitest | 测试运行器 |
| Testing Library | React 测试工具 |
| Happy-dom | DOM 模拟 |
| MSW | API Mock |

## 最佳实践

### 1. 测试用户行为

```typescript
// ✅ 好：测试用户行为
it('submits form when user clicks submit', async () => {
  const user = userEvent.setup();
  render(<Form />);
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

### 2. 避免测试实现细节

```typescript
// ❌ 不好：测试实现细节
it('has internal state', () => {
  const { component } = render(<Counter />);
  expect(component.state.count).toBe(0);
});

// ✅ 好：测试公开行为
it('displays initial count', () => {
  render(<Counter />);
  expect(screen.getByText('0')).toBeInTheDocument();
});
```

### 3. 使用有意义的测试描述

```typescript
// ❌ 不好：模糊的描述
it('works', () => {});

// ✅ 好：明确的描述
it('increments count when increment button is clicked', () => {});
```

## Mock 示例

```typescript
// __mocks__/api.ts
export const fetchUser = vi.fn().mockResolvedValue({
  id: 1,
  name: 'John Doe',
});

// 使用
import { fetchUser } from '@/api';

it('fetches user data', async () => {
  const user = await fetchUser();
  expect(user.name).toBe('John Doe');
});
```

## CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm test:run
      - run: pnpm test:coverage
```

## 相关资源

- [Vitest 文档](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library)
- [Vitest 覆盖率](https://vitest.dev/guide/coverage.html)
