# 循环引用检测和避免指南

## 概述

循环引用（Circular Dependency）是指在模块或组件之间形成相互依赖的闭环，这会导致以下问题：

1. **编译错误**：Vite 在深度比较时可能出现 "Maximum call stack size exceeded" 错误
2. **运行时错误**：可能导致组件无法正确加载或状态异常
3. **性能问题**：增加构建时间和运行时开销
4. **维护困难**：代码耦合度高，难以理解和修改

## 常见循环引用模式

### 1. 组件循环引用

```typescript
// ❌ 错误示例：组件 A 导入组件 B，组件 B 导入组件 A
// A.vue
import B from './B.vue'

// B.vue
import A from './A.vue'  // 形成循环引用
```

### 2. 响应式数据循环引用

```typescript
// ❌ 错误示例：自引用
const obj = reactive({
  name: 'test',
  self: obj  // 直接引用自身
})

// ❌ 错误示例：互引用
const a = reactive({ b: null })
const b = reactive({ a: a })
a.b = b  // 形成循环引用
```

### 3. Computed 和 Watch 的循环依赖

```typescript
// ❌ 错误示例：computed 依赖 watch，watch 又触发 computed
const data = computed(() => {
  return someValue.value
})

watch(() => data.value, () => {
  // 修改触发 data 变化的值
  someValue.value = newValue  // 可能导致循环
})
```

## 如何检测循环引用

### 1. 使用 ESLint 规则

项目已配置 `import/no-cycle` 规则，会自动检测循环引用：

```bash
# 运行 lint 检查
pnpm lint

# 如果发现循环引用，会显示类似错误：
# error: Dependency cycle detected (import/no-cycle)
```

### 2. 使用脚本检查

项目提供了 `scripts/check-circular-deps.mjs` 脚本：

```bash
node scripts/check-circular-deps.mjs
```

### 3. 运行时检测

如果遇到以下错误，可能是循环引用导致的：

- `Maximum call stack size exceeded`
- `Cannot access before initialization`
- 组件无法正确加载

## 如何避免循环引用

### 1. 组件循环引用解决方案

#### 方案 A：使用异步组件

```typescript
// ✅ 正确示例：使用异步组件打破循环
import { defineAsyncComponent } from 'vue'

const B = defineAsyncComponent(() => import('./B.vue'))
```

#### 方案 B：提取公共逻辑

```typescript
// ✅ 正确示例：提取公共逻辑到独立文件
// common.ts
export function sharedLogic() { }

// A.vue
import { sharedLogic } from './common'

// B.vue
import { sharedLogic } from './common'
```

#### 方案 C：重新设计组件结构

```typescript
// ✅ 正确示例：使用依赖注入或事件通信
// A.vue - 父组件
<B @event="handleEvent" />

// B.vue - 子组件
emit('event', data)  // 通过事件通信，而不是直接导入 A
```

### 2. 响应式数据循环引用解决方案

#### 方案 A：使用 ID 引用

```typescript
// ✅ 正确示例：使用 ID 而不是对象引用
const users = ref([
  { id: 1, name: 'Alice', parentId: null },
  { id: 2, name: 'Bob', parentId: 1 }
])

// 通过 ID 查找，而不是直接引用
const getUser = (id: number) => users.value.find(u => u.id === id)
```

#### 方案 B：使用 WeakMap 存储关联

```typescript
// ✅ 正确示例：使用 WeakMap 存储对象关联
const parentMap = new WeakMap()

const a = reactive({ name: 'A' })
const b = reactive({ name: 'B' })

parentMap.set(b, a)  // 使用 WeakMap，不形成循环引用
```

### 3. Computed 和 Watch 循环依赖解决方案

#### 方案 A：精确监听单个属性

```typescript
// ❌ 错误示例：深度监听可能导致循环
watch(() => data.value, () => { }, { deep: true })

// ✅ 正确示例：精确监听单个属性
watch(() => data.value.name, () => { })
```

#### 方案 B：使用 watchEffect 但避免访问 computed

```typescript
// ✅ 正确示例：使用 watchEffect 但避免访问 computed
watchEffect(() => {
  // 只访问原始响应式数据，不访问 computed
  const value = someValue.value
  // ...
})
```

#### 方案 C：手动触发计算

```typescript
// ✅ 正确示例：在特定时机手动触发计算，而不是使用 watch
const calculateValue = () => {
  // 计算逻辑
}

// 在需要时手动调用
handleChange(() => {
  calculateValue()
})
```

## Vue 组件最佳实践

### 1. 避免在计算函数中访问 computed

```typescript
// ❌ 错误示例
const categoryTagRows = computed(() => { })

const calculateRow = () => {
  categoryTagRows.value.forEach(row => {  // 可能形成循环
    // ...
  })
}

// ✅ 正确示例
const calculateRow = () => {
  // 直接遍历数据源，而不是 computed
  rowRefs.value.forEach((element, id) => {
    // ...
  })
}
```

### 2. 使用 ref 存储 DOM 引用而不是计算属性

```typescript
// ✅ 正确示例：使用 ref 存储 DOM 引用
const rowRefs = ref<Map<string, HTMLElement>>(new Map())

const setRowRef = (id: string, el: HTMLElement | null) => {
  if (el) {
    rowRefs.value.set(id, el)
  }
}
```

### 3. 使用防抖避免频繁触发

```typescript
// ✅ 正确示例：使用防抖避免频繁触发计算
let timer: ReturnType<typeof setTimeout> | null = null

const triggerCalculate = () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    nextTick(() => {
      requestAnimationFrame(() => {
        calculate()
      })
    })
  }, 150)
}
```

## 开发规范

### 1. 组件导入规范

- ✅ 优先使用相对路径导入同级组件
- ✅ 跨目录组件使用别名导入（如 `@btc-components/...`）
- ✅ 避免组件之间相互导入
- ❌ 禁止 A 组件导入 B 组件，B 组件又导入 A 组件

### 2. 响应式数据规范

- ✅ 使用扁平化的数据结构
- ✅ 使用 ID 引用替代对象引用
- ✅ 避免在响应式对象中存储自身引用
- ❌ 禁止创建响应式数据的循环引用

### 3. Watch 和 Computed 规范

- ✅ 精确监听单个属性，而不是深度监听整个对象
- ✅ 避免在 watch 回调中访问 computed 值
- ✅ 使用手动触发替代自动监听
- ❌ 禁止 watch 和 computed 之间形成循环依赖

## 调试技巧

### 1. 定位循环引用

如果遇到循环引用错误，按以下步骤定位：

1. 查看错误堆栈，找到第一个出现问题的文件
2. 检查该文件的 import 语句
3. 追踪导入链，找到循环的起点
4. 使用 ESLint 规则或脚本验证

### 2. 临时解决方案

如果暂时无法完全解决循环引用，可以使用：

- 异步组件（`defineAsyncComponent`）
- 延迟导入（`() => import(...)`）
- 提取公共逻辑到独立文件

### 3. 验证修复

修复后验证：

1. 清除缓存：删除 `.vite` 目录
2. 重新启动开发服务器
3. 运行 lint 检查：`pnpm lint`
4. 运行循环引用检查脚本
5. 测试相关功能是否正常工作

## 相关资源

- [Vue 官方文档 - 组件注册](https://cn.vuejs.org/guide/components/registration.html)
- [ESLint import/no-cycle 规则](https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-cycle.md)
- [Vite 官方文档 - 依赖预构建](https://cn.vitejs.dev/guide/dep-pre-bundling.html)
