# IndexedDB 工具使用文档

## 简介

IndexedDB 工具基于 Dexie.js 封装，提供简洁的 CRUD 接口和高效的范围查询能力，适用于**大容量历史数据**的存储、查询、筛选和计算场景。内置 Vue3 响应式查询支持，无需额外依赖。

### 适用场景

- **可视化看板/大屏**：存储和查询几年的历史数据，支持按时间范围、操作人、类型等多维度筛选
- **数据回收站**：系统应用的大容量数据存储和搜索
- **错误数据表**：运维应用的错误日志存储和查询
- **质量检查报表**：IQC、IPQC、测试、OQC 等质量检查数据的存储和查询

### 核心优势

1. **高效的索引与范围查询**：支持时间范围查询、多维度筛选，毫秒级响应
2. **异步非阻塞**：处理大容量数据不会阻塞主线程，避免页面卡顿
3. **Vue3 响应式深度适配**：查询结果自动成为响应式数据，数据更新后自动刷新
4. **简洁的 API**：基础 CRUD 操作简单易用，不会增加使用成本

## 安装

依赖已包含在 `@btc/shared-core` 中，仅需安装 `dexie` 核心包，无需安装 `dexie-vue-addon`（已手动实现响应式功能）。

## 快速开始

### 1. 使用默认数据库（推荐）

```typescript
import { createDashboardDB } from '@btc/shared-core/utils/storage/indexeddb';

// 创建默认数据库实例
const db = createDashboardDB();

// 新增数据
await db.dashboardData.add({
  time: Date.now(),
  operator: '张三',
  type: 'IQC',
  category: '来料检验',
  value: 100,
  data: { /* 其他扩展数据 */ }
});

// 查询数据（时间范围 + 操作人筛选）
const startTime = new Date('2024-01-01').getTime();
const endTime = new Date('2024-12-31').getTime();
const data = await db.dashboardData
  .where('time')
  .between(startTime, endTime)
  .and(item => item.operator === '张三')
  .toArray();
```

### 2. 自定义数据库（特殊场景）

```typescript
import { createIndexedDB } from '@btc/shared-core/utils/storage/indexeddb';

// 创建自定义数据库（如数据回收站）
const recycleBinDB = createIndexedDB('RecycleBinDB', {
  version: 1,
  stores: {
    deletedRecords: 'id, deletedTime, tableName, data',
  }
});

// 使用自定义表
await recycleBinDB.deletedRecords.add({
  id: Date.now(),
  deletedTime: Date.now(),
  tableName: 'products',
  data: { /* 被删除的数据 */ }
});
```

## API 文档

### 数据库创建

#### `createDashboardDB(): DashboardDatabase`

创建默认看板数据库实例（`BTCDashboardDB`）。

**默认表结构：**
- `dashboardData`: `id, time, operator, type, category`

**示例：**
```typescript
import { createDashboardDB } from '@btc/shared-core/utils/storage/indexeddb';

const db = createDashboardDB();
```

#### `createIndexedDB(dbName: string, config: DatabaseConfig): Dexie`

创建自定义数据库实例。

**参数：**
- `dbName`: 数据库名称
- `config`: 数据库配置
  - `version`: 数据库版本
  - `stores`: 表结构定义（键名为表名，值为索引定义）
  - `upgrade`: 版本升级迁移函数（可选）

**示例：**
```typescript
import { createIndexedDB } from '@btc/shared-core/utils/storage/indexeddb';

const customDB = createIndexedDB('QualityDB', {
  version: 1,
  stores: {
    iqc: 'id, time, operator, type, category',
    ipqc: 'id, time, operator, type, category',
    oqc: 'id, time, operator, type, category',
  }
});
```

### CRUD 操作

#### 新增数据

```typescript
// 单条新增
await db.dashboardData.add({
  time: Date.now(),
  operator: '张三',
  type: 'IQC',
  value: 100,
});

// 批量新增
import { batchAdd } from '@btc/shared-core/utils/storage/indexeddb';
await batchAdd(db.dashboardData, [
  { time: Date.now(), operator: '张三', type: 'IQC', value: 100 },
  { time: Date.now(), operator: '李四', type: 'IPQC', value: 200 },
]);
```

#### 查询数据

**基础查询：**
```typescript
// 根据主键查询
const item = await db.dashboardData.get(1);

// 查询所有
const all = await db.dashboardData.toArray();

// 条件查询
const items = await db.dashboardData
  .where('operator')
  .equals('张三')
  .toArray();
```

**范围查询：**
```typescript
// 时间范围查询
const startTime = new Date('2024-01-01').getTime();
const endTime = new Date('2024-12-31').getTime();
const data = await db.dashboardData
  .where('time')
  .between(startTime, endTime)
  .toArray();
```

#### 更新数据

```typescript
// 单条更新
await db.dashboardData.update(1, { value: 200 });

// 批量更新
import { batchUpdate } from '@btc/shared-core/utils/storage/indexeddb';
await batchUpdate(db.dashboardData, [
  { id: 1, value: 200 },
  { id: 2, value: 300 },
]);
```

#### 删除数据

```typescript
// 单条删除
await db.dashboardData.delete(1);

// 批量删除
import { batchDelete } from '@btc/shared-core/utils/storage/indexeddb';
await batchDelete(db.dashboardData, [1, 2, 3]);

// 清空表
import { clearTable } from '@btc/shared-core/utils/storage/indexeddb';
await clearTable(db.dashboardData);
```

### 便捷查询方法

#### `queryByTimeRange(table, startTime, endTime, options?)`

按时间范围查询。

**示例：**
```typescript
import { queryByTimeRange } from '@btc/shared-core/utils/storage/indexeddb';

const startTime = new Date('2024-01-01').getTime();
const endTime = new Date('2024-12-31').getTime();
const data = await queryByTimeRange(
  db.dashboardData,
  startTime,
  endTime,
  {
    orderBy: 'time',
    orderDirection: 'desc',
    limit: 100, // 限制返回 100 条
  }
);
```

#### `queryByOperator(table, operator, options?)`

按操作人查询。

**示例：**
```typescript
import { queryByOperator } from '@btc/shared-core/utils/storage/indexeddb';

const data = await queryByOperator(
  db.dashboardData,
  '张三',
  {
    orderBy: 'time',
    orderDirection: 'desc',
  }
);
```

#### `queryByType(table, type, options?)`

按操作类型查询。

**示例：**
```typescript
import { queryByType } from '@btc/shared-core/utils/storage/indexeddb';

// 查询所有 IQC 数据
const iqcData = await queryByType(db.dashboardData, 'IQC');
```

#### `queryByCategory(table, category, options?)`

按业务分类查询。

**示例：**
```typescript
import { queryByCategory } from '@btc/shared-core/utils/storage/indexeddb';

const data = await queryByCategory(db.dashboardData, '来料检验');
```

#### `queryWithFilters(table, filters, options?)`

多条件组合查询。

**示例：**
```typescript
import { queryWithFilters } from '@btc/shared-core/utils/storage/indexeddb';

const data = await queryWithFilters(
  db.dashboardData,
  {
    startTime: new Date('2024-01-01').getTime(),
    endTime: new Date('2024-12-31').getTime(),
    operator: '张三',
    type: 'IQC',
    category: '来料检验',
    customFilter: (item) => item.value > 100, // 自定义筛选
  },
  {
    orderBy: 'time',
    orderDirection: 'desc',
    limit: 50,
  }
);
```

### Vue3 响应式支持

使用内置的 `useLiveQuery` Composable 实现响应式查询：

```typescript
import { createDashboardDB, useLiveQuery } from '@btc/shared-core/utils/storage/indexeddb';
import { ref } from 'vue';

const db = createDashboardDB();
const currentYear = ref(2024);

// 响应式查询（依赖变化时自动重新查询）
const dashboardList = useLiveQuery(() => {
  const startTime = new Date(currentYear.value, 0, 1).getTime();
  const endTime = new Date(currentYear.value + 1, 0, 1).getTime();
  return db.dashboardData
    .where('time')
    .between(startTime, endTime)
    .toArray();
}, [currentYear]); // 当 currentYear 变化时自动重新查询

// 在模板中使用
// <div v-for="item in dashboardList" :key="item.id">{{ item }}</div>
```

**带加载状态和错误处理的版本：**

```typescript
import { useLiveQueryWithState } from '@btc/shared-core/utils/storage/indexeddb';

const { result, isLoading, error, refetch } = useLiveQueryWithState(() => {
  return db.dashboardData.toArray();
});

// 手动触发重新查询（数据变更后调用）
await refetch();
```

**重要提示：**

由于没有 `dexie-vue-addon`，数据变更不会自动触发重新查询。建议：

1. **使用依赖数组**：当查询条件变化时，通过依赖数组自动重新查询
2. **手动刷新**：数据变更后，调用 `refetch()` 手动触发重新查询
3. **组合使用**：在数据变更的函数中，先执行变更操作，然后调用 `refetch()`

```typescript
// 示例：新增数据后自动刷新
const { result, refetch } = useLiveQueryWithState(() => {
  return db.dashboardData.toArray();
});

async function addData() {
  await db.dashboardData.add({ /* ... */ });
  // 数据变更后手动刷新
  await refetch();
}
```

## 使用示例

### 场景 1：可视化看板数据存储和查询

```typescript
import { createDashboardDB, queryByTimeRange, queryWithFilters } from '@btc/shared-core/utils/storage/indexeddb';

const db = createDashboardDB();

// 1. 存储看板数据
async function saveDashboardData(data: {
  operator: string;
  type: string;
  category?: string;
  value: number;
  data?: Record<string, any>;
}) {
  await db.dashboardData.add({
    time: Date.now(),
    ...data,
  });
}

// 2. 按年份查询数据
async function queryDataByYear(year: number) {
  const startTime = new Date(year, 0, 1).getTime();
  const endTime = new Date(year + 1, 0, 1).getTime();
  return await queryByTimeRange(db.dashboardData, startTime, endTime);
}

// 3. 多维度筛选查询
async function queryWithMultipleFilters(filters: {
  year?: number;
  operator?: string;
  type?: string;
  category?: string;
}) {
  const startTime = filters.year 
    ? new Date(filters.year, 0, 1).getTime() 
    : undefined;
  const endTime = filters.year 
    ? new Date(filters.year + 1, 0, 1).getTime() 
    : undefined;

  return await queryWithFilters(db.dashboardData, {
    startTime,
    endTime,
    operator: filters.operator,
    type: filters.type,
    category: filters.category,
  });
}

// 4. 数据计算（统计、比较）
async function calculateStatistics(year: number) {
  const data = await queryDataByYear(year);
  
  // 计算总值
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // 按类型分组统计
  const byType = data.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item.value);
    return acc;
  }, {} as Record<string, number[]>);
  
  // 计算每个类型的平均值
  const typeAvg = Object.entries(byType).map(([type, values]) => ({
    type,
    avg: values.reduce((s, v) => s + v, 0) / values.length,
  }));
  
  return { totalValue, typeAvg };
}
```

### 场景 2：数据回收站（系统应用）

```typescript
import { createIndexedDB } from '@btc/shared-core/utils/storage/indexeddb';

// 创建回收站数据库
const recycleBinDB = createIndexedDB('RecycleBinDB', {
  version: 1,
  stores: {
    deletedRecords: 'id, deletedTime, tableName, operator',
  }
});

// 存储删除的记录
async function saveDeletedRecord(tableName: string, record: any, operator: string) {
  await recycleBinDB.deletedRecords.add({
    id: Date.now(),
    deletedTime: Date.now(),
    tableName,
    operator,
    data: record,
  });
}

// 查询回收站数据（支持搜索）
async function searchRecycleBin(keyword: string, tableName?: string) {
  let query = recycleBinDB.deletedRecords.toCollection();
  
  if (tableName) {
    query = recycleBinDB.deletedRecords.where('tableName').equals(tableName);
  }
  
  const all = await query.toArray();
  
  // 在 data 字段中搜索关键词
  return all.filter(item => {
    const dataStr = JSON.stringify(item.data);
    return dataStr.includes(keyword);
  });
}
```

### 场景 3：质量检查报表（多表场景）

```typescript
import { createIndexedDB } from '@btc/shared-core/utils/storage/indexeddb';

// 创建质量检查数据库
const qualityDB = createIndexedDB('QualityDB', {
  version: 1,
  stores: {
    iqc: 'id, time, operator, type, category, value',
    ipqc: 'id, time, operator, type, category, value',
    oqc: 'id, time, operator, type, category, value',
  }
});

// 存储 IQC 数据
async function saveIQCData(data: {
  operator: string;
  category: string;
  value: number;
}) {
  await qualityDB.iqc.add({
    time: Date.now(),
    type: 'IQC',
    ...data,
  });
}

// 查询所有质量检查数据（跨表查询）
async function queryAllQualityData(startTime: number, endTime: number) {
  const [iqc, ipqc, oqc] = await Promise.all([
    qualityDB.iqc.where('time').between(startTime, endTime).toArray(),
    qualityDB.ipqc.where('time').between(startTime, endTime).toArray(),
    qualityDB.oqc.where('time').between(startTime, endTime).toArray(),
  ]);
  
  return { iqc, ipqc, oqc };
}
```

## 最佳实践

### 1. 按需使用

- **小数据量**（< 1MB）：使用 `localStorage` 或 `sessionStorage`
- **大数据量**（> 1MB）或需要**复杂查询**：使用 IndexedDB

### 2. 合理使用索引

- 为常用查询字段创建索引（如 `time`、`operator`、`type`）
- 避免为不常用的字段创建索引（会增加存储空间）

### 3. 批量操作

- 使用 `batchAdd`、`batchUpdate`、`batchDelete` 进行批量操作，性能更好
- 避免在循环中执行单条操作

### 4. 分页查询

- 对于大量数据，使用 `limit` 和 `offset` 进行分页
- 避免一次性加载所有数据

### 5. 错误处理

```typescript
import { isIndexedDBSupported } from '@btc/shared-core/utils/storage/indexeddb';

// 检查浏览器支持
if (!isIndexedDBSupported()) {
  console.warn('浏览器不支持 IndexedDB，使用 localStorage 降级');
  // 降级处理
  return;
}

try {
  const db = createDashboardDB();
  // 使用数据库
} catch (error) {
  console.error('IndexedDB 操作失败:', error);
  // 错误处理
}
```

### 6. 数据迁移

当需要修改表结构时，使用版本升级：

```typescript
const db = createIndexedDB('MyDB', {
  version: 2, // 升级版本
  stores: {
    myTable: 'id, time, operator, type, category, newField', // 新增字段
  },
  upgrade: (db, oldVersion, newVersion) => {
    if (oldVersion < 2) {
      // 版本 1 到 2 的迁移逻辑
      // 例如：为现有数据添加默认值
    }
  },
});
```

## 性能优化建议

1. **使用索引**：为查询字段创建索引，避免全表扫描
2. **批量操作**：使用批量 API 而非循环单条操作
3. **分页加载**：大数据量使用分页，避免一次性加载
4. **异步处理**：所有操作都是异步的，不会阻塞主线程
5. **合理设计表结构**：根据查询需求设计索引，避免过度索引

## 注意事项

1. **浏览器兼容性**：确保目标浏览器支持 IndexedDB（现代浏览器均支持）
2. **存储限制**：IndexedDB 存储限制通常为可用磁盘空间的 50%，但不同浏览器可能不同
3. **数据持久性**：IndexedDB 数据会持久保存，除非用户清除浏览器数据
4. **跨域限制**：IndexedDB 遵循同源策略，不同域名无法共享数据
5. **事务处理**：Dexie 自动处理事务，无需手动管理

## 与 localStorage/sessionStorage 的区别

| 特性 | IndexedDB | LocalStorage | SessionStorage |
|------|-----------|--------------|----------------|
| 存储大小 | 通常几 GB | 通常 5-10MB | 通常 5-10MB |
| 查询能力 | 强大的索引和范围查询 | 无查询能力 | 无查询能力 |
| 适用场景 | 大容量数据、复杂查询 | 小数据、简单存储 | 临时数据 |
| 性能 | 异步、高效 | 同步、简单 | 同步、简单 |
| 数据结构 | 支持复杂对象 | 仅字符串 | 仅字符串 |

## 常见问题

### Q: 什么时候使用 IndexedDB？

A: 当需要存储大量数据（几年历史数据）并进行复杂查询（时间范围、多维度筛选）时使用 IndexedDB。小数据量或简单存储仍使用 localStorage/sessionStorage。

### Q: 如何迁移现有数据？

A: 使用数据库版本升级功能，在 `upgrade` 回调中处理数据迁移逻辑。

### Q: 数据会丢失吗？

A: IndexedDB 数据会持久保存，除非用户主动清除浏览器数据。但建议重要数据仍需要后端备份。

### Q: 支持事务吗？

A: Dexie 自动处理事务，所有操作都在事务中执行，确保数据一致性。

### Q: 为什么没有使用 dexie-vue-addon？

A: `dexie-vue-addon` 未正式发布到 npm，无法安装。我们手动实现了响应式查询功能，通过 `useLiveQuery` 和 `useLiveQueryWithState` 提供相同的功能。使用依赖数组或手动调用 `refetch()` 即可实现数据自动更新。
