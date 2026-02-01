<template>
  <div class="btc-code-json-test">
    <h2>BtcCodeJson 组件测试</h2>

    <div class="test-section">
      <h3>弹窗模式测试</h3>
      <BtcCodeJson
        :model-value="testData"
        :popover="true"
        :popover-width="500"
        :popover-trigger="'click'"
      />
    </div>

    <div class="test-section">
      <h3>直接显示模式测试</h3>
      <BtcCodeJson
        :model-value="testData"
        :popover="false"
      />
    </div>

    <div class="test-section">
      <h3>表格列配置测试</h3>
      <el-table :data="tableData" border>
        <el-table-column
          label="请求参数"
          prop="params"
          min-width="200"
        >
          <template #default="{ row }">
            <BtcCodeJson
              :model-value="row.params"
              :popover="true"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="test-section">
      <h3>btc-table 整表测试</h3>
      <el-table :data="btcTableData" border>
        <el-table-column
          label="用户ID"
          prop="userId"
          width="100"
        />
        <el-table-column
          label="用户名"
          prop="username"
          width="150"
        />
        <el-table-column
          label="请求参数"
          prop="requestParams"
          min-width="200"
        >
          <template #default="{ row }">
            <BtcCodeJson
              :model-value="row.requestParams"
              :popover="true"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="响应数据"
          prop="responseData"
          min-width="200"
        >
          <template #default="{ row }">
            <BtcCodeJson
              :model-value="row.responseData"
              :popover="true"
            />
          </template>
        </el-table-column>
        <el-table-column
          label="操作时间"
          prop="createTime"
          width="180"
        />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { BtcCodeJson } from '@btc/shared-components';

defineOptions({
  name: 'BtcCodeJsonTest'
});

const testData = ref({
  page: 1,
  size: 10,
  keyword: 'admin',
  filters: {
    status: 'active',
    department: 'IT'
  }
});

const tableData = ref([
  {
    params: JSON.stringify({
      page: 1,
      size: 10,
      keyword: 'test'
    })
  },
  {
    params: JSON.stringify({
      userId: 123,
      action: 'create',
      data: {
        name: 'John Doe',
        email: 'john@example.com'
      }
    })
  }
]);

const btcTableData = ref([
  {
    userId: 1,
    username: 'admin',
    requestParams: {
      page: 1,
      size: 10,
      keyword: 'test'
    },
    responseData: {
      code: 0,
      msg: 'success',
      data: {
        list: [],
        total: 0
      }
    },
    createTime: '2024-01-01 10:00:00'
  },
  {
    userId: 2,
    username: 'user1',
    requestParams: {
      id: 123,
      action: 'getUserInfo',
      params: {
        userId: 123
      }
    },
    responseData: {
      code: 0,
      msg: 'success',
      data: {
        id: 123,
        username: 'user1',
        email: 'user1@example.com'
      }
    },
    createTime: '2024-01-01 11:00:00'
  }
]);
</script>

<style lang="scss" scoped>
.btc-code-json-test {
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;

  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--el-text-color-primary);
  }
}
</style>
