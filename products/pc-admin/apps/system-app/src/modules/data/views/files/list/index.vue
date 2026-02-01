<template>
  <div class="page">
    <btc-crud ref="crudRef" class="page__body" :service="fileService">
      <btc-crud-row>
        <div class="btc-crud-primary-actions">
          <!-- 刷新按钮 -->
          <btc-refresh-btn />
          <BtcTableButton
            v-if="isMinimal"
            class="btc-crud-action-icon"
            :config="uploadButtonConfig"
          />
          <btc-button
            v-else
            type="primary"
            class="btc-crud-btn"
            :loading="loading"
            @click="handleUpload"
          >
            <BtcSvg class="btc-crud-btn__icon" name="upload" />
            <span class="btc-crud-btn__text">上传文件</span>
          </btc-button>
          <BtcTableButton
            v-if="isMinimal"
            class="btc-crud-action-icon"
            :config="deleteButtonConfig"
          />
          <btc-button
            v-else
            type="danger"
            class="btc-crud-btn"
            :disabled="selectionCount === 0 || loading"
            :loading="loading"
            @click="handleDelete"
          >
            <BtcSvg class="btc-crud-btn__icon" name="delete" />
            <span class="btc-crud-btn__text">删除文件</span>
          </btc-button>
        </div>

        <btc-crud-flex1 />
        <!-- 关键字搜索 -->
        <btc-crud-search-key />
        <btc-crud-actions />
      </btc-crud-row>

      <btc-crud-row>
        <!-- 数据表格 -->
        <btc-table
          ref="tableRef"
          :columns="columns"
          :autoHeight="true"
          border
          rowKey="id"
        />
      </btc-crud-row>

      <btc-crud-row>
        <btc-crud-flex1 />
        <!-- 分页控件 -->
        <btc-pagination />
      </btc-crud-row>
    </btc-crud>

    <!-- 上传文件对话框 -->
    <btc-dialog v-model="uploadVisible" title="上传文件" width="500px">
      <btc-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持单个或批量上传，单个文件不超过50MB
          </div>
        </template>
      </btc-upload>
      <template #footer>
        <span class="dialog-footer">
          <btc-button @click="uploadVisible = false">取消</btc-button>
          <btc-button type="primary" :loading="uploading" @click="handleConfirmUpload">
            确认上传
          </btc-button>
        </span>
      </template>
    </btc-dialog>

    <btc-dialog v-model="detailVisible" title="文件详情" width="420px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文件名">
          {{ detailRow?.originalName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          {{ detailRow?.mime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="大小">
          {{ formatSize(detailRow?.sizeBytes) }}
        </el-descriptions-item>
        <el-descriptions-item label="上传时间">
          {{ detailRow?.createdAt || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="链接">
          <el-link
            v-if="detailRow?.fileUrl"
            :href="detailRow.fileUrl"
            target="_blank"
            type="primary"
          >
            打开文件
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <btc-button @click="detailVisible = false">关闭</btc-button>
      </template>
    </btc-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ElIcon } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { BtcConfirm, BtcMessage, BtcTableButton, BtcSvg, CommonColumns } from '@btc/shared-components';
import type { TableColumn } from '@btc/shared-components';
import { UploadFilled } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { service } from '@/services/eps';
import { type CrudService, logger } from '@btc/shared-core';
import BtcFileThumbnailCell from '@/components/btc-file-thumbnail-cell/BtcFileThumbnailCell.vue';
import { useThemePlugin, usePageColumns, usePageForms, getPageConfigFull } from '@btc/shared-core';
import { DEFAULT_OPERATION_WIDTH } from '@btc/shared-components';

defineOptions({
  name: 'DataFilesList'
});

useI18n();

// 加载状态
const loading = ref(false);
const uploading = ref(false);

// 获取crud实例
const crudRef = ref();
const tableRef = ref();
const uploadRef = ref();
const detailVisible = ref(false);
const detailRow = ref<Record<string, any> | null>(null);

// 上传对话框
const uploadVisible = ref(false);
const fileList = ref<UploadFile[]>([]);

// 从crud中获取选择状态
const tableSelection = computed(() => {
  return crudRef.value?.selection || [];
});

// 表格列配置
const selectionCount = computed(() => tableSelection.value.length);
const theme = useThemePlugin();
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

const uploadButtonConfig = computed(() => ({
  icon: 'upload',
  type: 'primary' as const,
  tooltip: '上传文件',
  ariaLabel: '上传文件',
  disabled: loading.value,
  onClick: () => handleUpload(),
}));

const deleteButtonConfig = computed(() => ({
  icon: 'delete',
  type: 'danger' as const,
  tooltip: '删除文件',
  ariaLabel: '删除文件',
  badge: selectionCount.value || undefined,
  disabled: selectionCount.value === 0 || loading.value,
  onClick: () => handleDelete(),
}));

const OPERATION_WIDTH = DEFAULT_OPERATION_WIDTH + 60; // 三个按钮需要更宽的空间

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('data.files.list');
const { formItems } = usePageForms('data.files.list');
const pageConfig = getPageConfigFull('data.files.list');

// 扩展配置以支持动态组件和 formatter
const columns = computed(() => {
  return baseColumns.value.map(col => {
    // 如果是 fileUrl 列，添加自定义组件
    if (col.prop === 'fileUrl') {
      return {
        ...col,
        component: {
          name: BtcFileThumbnailCell,
          props: (scope: any) => ({
            modelValue: scope.row.fileUrl,
            mime: scope.row.mime,
            originalName: scope.row.originalName,
          }),
        },
      };
    }
    // 如果是 sizeBytes 列，添加 formatter
    if (col.prop === 'sizeBytes') {
      return {
        ...col,
        formatter: (row: any) => formatSize(row.sizeBytes),
      };
    }
    // 如果是操作列，添加按钮
    if (col.type === 'op') {
      return {
        ...col,
        width: OPERATION_WIDTH,
        buttons: [
          {
            label: '分享',
            type: 'success',
            icon: 'share',
            onClick: ({ scope }: { scope: any }) => handleShare(scope.row),
          },
          {
            label: '详情',
            type: 'primary',
            icon: 'info',
            onClick: ({ scope }: { scope: any }) => handleDetail(scope.row),
          },
          {
            label: '删除',
            type: 'danger',
            icon: 'delete',
            onClick: ({ scope }: { scope: any }) => handleDeleteSingle(scope.row),
          },
        ],
      };
    }
    return col;
  });
});

const epsFileService = service.upload?.file?.files;

function normalizePageResponse(response: any, page: number, size: number) {
  if (!response) {
    return {
      list: [],
      total: 0,
      pagination: { page, size, total: 0 }
    };
  }

  if (Array.isArray(response.list) && response.pagination) {
    const { pagination } = response;
    const total = Number(
      pagination.total ?? pagination.count ?? response.total ?? response.pagination?.total ?? 0
    );
    return {
      list: response.list,
      total,
      pagination: {
        page: Number(pagination.page ?? page),
        size: Number(pagination.size ?? size),
        total
      }
    };
  }

  if (Array.isArray(response.records)) {
    const total = Number(response.total ?? response.pagination?.total ?? 0);
    return {
      list: response.records,
      total,
      pagination: {
        page: Number(response.current ?? page),
        size: Number(response.size ?? size),
        total
      }
    };
  }

  if (Array.isArray(response.list) && typeof response.total !== 'undefined') {
    return {
      list: response.list,
      total: Number(response.total ?? 0),
      pagination: {
        page,
        size,
        total: Number(response.total ?? 0)
      }
    };
  }

  if (Array.isArray(response)) {
    return {
      list: response,
      total: response.length,
      pagination: { page, size, total: response.length }
    };
  }

  return {
    list: [],
    total: 0,
    pagination: { page, size, total: 0 }
  };
}

const fileService: CrudService<any> = {
  async page(params: any = {}) {
    const page = Number(params.page ?? 1);
    const size = Number(params.size ?? 20);
    const keyword = params.keyword ? String(params.keyword) : undefined;

    const pageFn = epsFileService?.page;
    if (typeof pageFn !== 'function') {
      throw new Error('未找到文件分页服务，请先同步 EPS 元数据');
    }

    const payload: Record<string, any> = {
      page,
      size
    };

    if (keyword) {
      payload.keyword = keyword;
    }

    const response = await pageFn(payload);
    const normalized = normalizePageResponse(response, page, size);
    return {
      list: normalized.list,
      total: normalized.total,
      pagination: normalized.pagination
    };
  },
  async add() {
    throw new Error('文件列表不支持新增操作');
  },
  async update() {
    throw new Error('文件列表不支持编辑操作');
  },
  async delete(id: string | number) {
    const deleteFn = epsFileService?.delete;
    if (typeof deleteFn !== 'function') {
      throw new Error('未找到文件删除服务，请先同步 EPS 元数据');
    }
    return deleteFn(id);
  },
  async deleteBatch(ids: (string | number)[]) {
    const deleteFn = epsFileService?.delete;
    if (typeof deleteFn !== 'function') {
      throw new Error('未找到文件删除服务，请先同步 EPS 元数据');
    }
    await Promise.all(ids.map((id) => deleteFn(id)));
  }
};

// 上传文件
const handleUpload = () => {
  uploadVisible.value = true;
  fileList.value = [];
};

// 文件选择变化
const handleFileChange = (_file: UploadFile, uploadFiles: UploadFile[]) => {
  fileList.value = [...uploadFiles];
};

const handleFileRemove = (_file: UploadFile, uploadFiles: UploadFile[]) => {
  fileList.value = [...uploadFiles];
};

// 确认上传
const handleConfirmUpload = async () => {
  if (fileList.value.length === 0) {
    BtcMessage.warning('请选择要上传的文件');
    return;
  }

  uploading.value = true;
  try {
    const formData = new FormData();
    fileList.value.forEach((file) => {
      if (file.raw) {
        formData.append('file', file.raw as File);
      }
    });

    const uploadFn = epsFileService?.upload;
    if (typeof uploadFn !== 'function') {
      throw new Error('未找到文件上传服务，请先同步 EPS 元数据');
    }

    await uploadFn(formData);

    BtcMessage.success('上传成功');
    uploadVisible.value = false;
    fileList.value = [];
    crudRef.value?.crud?.refresh();
  } catch (error: any) {
    BtcMessage.error(error?.message || '上传失败');
  } finally {
    uploading.value = false;
  }
};

// 批量删除
const handleDelete = async () => {
  if (tableSelection.value.length === 0) {
    BtcMessage.warning('请选择要删除的文件');
    return;
  }

  await BtcConfirm(`确定要删除选中的 ${tableSelection.value.length} 个文件吗？`, '提示', {
    type: 'warning'
  });

  loading.value = true;
  try {
    const ids = tableSelection.value.map((item: any) => item.id);
    await fileService.deleteBatch(ids);
    BtcMessage.success('删除成功');
    crudRef.value?.crud?.refresh();
  } catch (error: any) {
    BtcMessage.error(error?.message || '删除失败');
  } finally {
    loading.value = false;
  }
};

// 单个删除
const handleDeleteSingle = async (row: any) => {
  await BtcConfirm('确定要删除该文件吗？', '提示', { type: 'warning' });

  loading.value = true;
  try {
    await fileService.delete(row.id);
    BtcMessage.success('删除成功');
    crudRef.value?.crud?.refresh();
  } catch (error: any) {
    BtcMessage.error(error?.message || '删除失败');
  } finally {
    loading.value = false;
  }
};

function formatSize(value?: number) {
  const size = Number(value || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function handleShare(row: any) {
  if (!row?.fileUrl) {
    BtcMessage.warning('当前文件暂无可分享的链接');
    return;
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(row.fileUrl);
    } else {
      const input = document.createElement('input');
      input.value = row.fileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    BtcMessage.success('文件链接已复制');
  } catch (error) {
    logger.error('copy link error', error);
    BtcMessage.error('复制链接失败，请手动复制');
  }
}

function handleDetail(row: any) {
  detailRow.value = row;
  detailVisible.value = true;
}

</script>

<style lang="scss" scoped>
</style>

