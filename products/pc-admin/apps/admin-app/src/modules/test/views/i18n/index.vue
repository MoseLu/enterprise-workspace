<template>
  <div class="i18n-test">
    <el-tabs type="border-card" class="test-tabs">
      <!-- Language Switch Tab -->
      <el-tab-pane label="Language Switch">
        <section class="test-section">
          <h3>Current Language</h3>
          <el-radio-group v-model="currentLocale" @change="handleLocaleChange">
            <el-radio-button label="zh-CN">Chinese (zh-CN)</el-radio-button>
            <el-radio-button label="en-US">English (en-US)</el-radio-button>
          </el-radio-group>
        </section>

        <section class="test-section">
          <h3>Translation Test</h3>
          <el-table :data="translationTestData" border stripe>
            <el-table-column prop="key" label="i18n Key" width="250" />
            <el-table-column prop="value" label="Translated Value">
              <template #default="{ row }">
                <strong>{{ t(row.key) }}</strong>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-tab-pane>

      <!-- Button Translations Tab -->
      <el-tab-pane label="Button Translations">
        <section class="test-section">
          <h3>Common Buttons</h3>
          <div class="button-grid">
            <el-button type="primary">{{ t('common.button.confirm') }}</el-button>
            <el-button>{{ t('common.button.cancel') }}</el-button>
            <el-button type="success">{{ t('common.button.save') }}</el-button>
            <el-button type="danger">{{ t('common.button.delete') }}</el-button>
            <el-button type="info">{{ t('common.button.search') }}</el-button>
            <el-button type="warning">{{ t('common.button.reset') }}</el-button>
            <el-button>{{ t('common.button.add') }}</el-button>
            <el-button>{{ t('common.button.edit') }}</el-button>
            <el-button>{{ t('common.button.refresh') }}</el-button>
            <el-button>{{ t('common.button.export') }}</el-button>
            <el-button>{{ t('common.button.custom') }}</el-button>
            <el-button>{{ t('common.button.close') }}</el-button>
          </div>
        </section>

        <section class="test-section">
          <h3>CRUD Buttons</h3>
          <div class="button-grid">
            <el-button type="primary">{{ t('crud.button.add') }}</el-button>
            <el-button>{{ t('crud.button.refresh') }}</el-button>
            <el-button type="danger">{{ t('crud.button.multi_delete') }}</el-button>
            <el-button type="info">{{ t('crud.button.search') }}</el-button>
            <el-button type="primary">{{ t('crud.button.edit') }}</el-button>
            <el-button type="danger">{{ t('crud.button.delete') }}</el-button>
            <el-button type="success">{{ t('crud.button.info') }}</el-button>
          </div>
        </section>
      </el-tab-pane>

      <!-- Message Translations Tab -->
      <el-tab-pane label="Message Translations">
        <section class="test-section">
          <h3>System Messages</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Success">
              {{ t('sys.message.success') }}
            </el-descriptions-item>
            <el-descriptions-item label="Error">
              {{ t('sys.message.error') }}
            </el-descriptions-item>
            <el-descriptions-item label="Loading">
              {{ t('sys.message.loading') }}
            </el-descriptions-item>
            <el-descriptions-item label="Confirm Delete">
              {{ t('sys.message.confirm_delete') }}
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="test-section">
          <h3>CRUD Messages</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Delete Confirm">
              {{ t('crud.message.delete_confirm') }}
            </el-descriptions-item>
            <el-descriptions-item label="Delete Success">
              {{ t('crud.message.delete_success') }}
            </el-descriptions-item>
            <el-descriptions-item label="Save Success">
              {{ t('crud.message.save_success') }}
            </el-descriptions-item>
            <el-descriptions-item label="Select At Least One">
              {{ t('crud.message.select_at_least_one') }}
            </el-descriptions-item>
            <el-descriptions-item label="No Data to Export">
              {{ t('crud.message.no_data_to_export') }}
            </el-descriptions-item>
            <el-descriptions-item label="Export Success">
              {{ t('crud.message.export_success') }}
            </el-descriptions-item>
          </el-descriptions>
        </section>

        <section class="test-section">
          <h3>Interactive Message Test</h3>
          <div style="display: flex; gap: 10px;">
            <el-button type="success" @click="showSuccessMessage">
              Show Success Message
            </el-button>
            <el-button type="danger" @click="showErrorMessage">
              Show Error Message
            </el-button>
            <el-button type="warning" @click="showConfirmDialog">
              Show Confirm Dialog
            </el-button>
          </div>
        </section>
      </el-tab-pane>

      <!-- All Keys Tab -->
      <el-tab-pane label="All Translation Keys">
        <section class="test-section">
          <h3>All Available Keys ({{ allKeys.length }} keys)</h3>
          <el-input
            v-model="searchKey"
            placeholder="Search keys..."
            clearable
            style="margin-bottom: 1rem;"
          />
          <el-table :data="filteredKeys" border stripe max-height="500">
            <el-table-column prop="key" label="Key" width="300" />
            <el-table-column prop="zhCN" label="Chinese (zh-CN)" />
            <el-table-column prop="enUS" label="English (en-US)" />
          </el-table>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import { useI18n, zhCN, enUS } from '@btc/shared-core';

const { t, locale } = useI18n();

// Current locale
const currentLocale = ref(locale.value);

// Search key
const searchKey = ref('');

// Handle locale change
const handleLocaleChange = (newLocale: string) => {
  locale.value = newLocale;
  BtcMessage.success(`Language switched to ${newLocale}`);
};

// Translation test data
const translationTestData = [
  { key: 'common.button.confirm' },
  { key: 'common.button.cancel' },
  { key: 'crud.button.add' },
  { key: 'crud.table.operation' },
  { key: 'user.field.username' },
  { key: 'user.status.active' },
  { key: 'menu.vite_plugins' },
  { key: 'menu.business_components.crud' },
];

// All translation keys - dynamically get from i18n
const allKeys = computed(() => {
  const keyList = [
    // Common buttons
    'common.button.confirm',
    'common.button.cancel',
    'common.button.save',
    'common.button.delete',
    'common.button.search',
    'common.button.reset',
    'common.button.add',
    'common.button.edit',
    'common.button.refresh',
    'common.button.export',
    'common.button.custom',
    'common.button.close',

    // CRUD buttons
    'crud.button.add',
    'crud.button.refresh',
    'crud.button.multi_delete',
    'crud.button.search',
    'crud.button.edit',
    'crud.button.delete',
    'crud.button.info',

    // CRUD table
    'crud.table.operation',
    'crud.table.no_data',
    'crud.table.index',

    // Menu
    'menu.vite_plugins',
    'menu.vite_plugins.test',
    'menu.business_components',
    'menu.business_components.crud',
    'menu.i18n',
    'menu.i18n.test',

    // User fields
    'user.field.username',
    'user.field.name',
    'user.field.email',
    'user.field.status',
    'user.status.active',
    'user.status.inactive',
  ];

  // Get translations from locale files
  return keyList.map(key => {
    return {
      key,
      zhCN: zhCN[key] || key,
      enUS: enUS[key] || key,
    };
  });
});

// Filtered keys
const filteredKeys = computed(() => {
  if (!searchKey.value) return allKeys.value;
  const keyword = searchKey.value.toLowerCase();
  return allKeys.value.filter(
    item =>
      item.key.toLowerCase().includes(keyword) ||
      item.zhCN.includes(keyword) ||
      item.enUS.toLowerCase().includes(keyword)
  );
});

// Show success message
const showSuccessMessage = () => {
  BtcMessage.success(t('sys.message.success'));
};

// Show error message
const showErrorMessage = () => {
  BtcMessage.error(t('sys.message.error'));
};

// Show confirm dialog
const showConfirmDialog = () => {
  BtcConfirm(
    t('crud.message.delete_confirm'),
    t('common.button.confirm'),
    { type: 'warning' }
  ).then(() => {
    BtcMessage.success('操作成功');
  }).catch(() => {
    BtcMessage.info(t('common.button.cancel'));
  });
};
</script>

<style lang="scss" scoped>
// 页面内容样式（不包含布局相关的 padding、margin、background）
.i18n-test {
  .test-tabs {
    :deep(.el-tabs__content) {
      overflow: auto;
      padding: 0;
    }

    :deep(.el-tab-pane) {
      padding: 20px;
    }
  }

  h3 {
    color: #333;
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
  }
}

.test-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px solid var(--el-border-color);

  &:last-child {
    margin-bottom: 0;
  }
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
</style>

