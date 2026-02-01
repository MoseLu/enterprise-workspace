<template>
  <div class="page">
    <BtcDoubleLayout ref="viewGroupRef" left-width="280px" left-title="title.data.files.preview.categories" right-title="title.data.files.preview.fileList">
      <!-- 左侧标题栏操作 -->
      <template #left-header>
        <span class="label">{{ t('data.file.preview.categories') }}</span>
        <div class="header-actions">
          <div class="icon" @click="handleRefreshCategories">
            <btc-svg name="refresh" />
          </div>
        </div>
      </template>
      
      <!-- 左侧分类列表 -->
      <template #left>
        <div class="file-preview-left">
          <div class="search">
            <BtcInput
              v-model="categoryKeyword"
              :placeholder="t('data.file.preview.search_category')"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </BtcInput>
          </div>
          <el-scrollbar class="category-list">
            <div
              v-for="category in filteredCategories"
              :key="category.id"
              class="category-item"
              :class="{ active: selectedCategoryId === category.id }"
              @click="handleCategorySelect(category)"
            >
              <el-icon class="category-icon">
                <Document />
              </el-icon>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ category.count || 0 }})</span>
            </div>
          </el-scrollbar>
        </div>
      </template>

      <!-- 右侧文件预览区域 -->
      <template #right="{ selected, keyword }">
        <!-- 第一行：操作栏 -->
        <btc-crud-row>
            <el-button @click="refreshFileList">{{ t('common.button.refresh') }}</el-button>
            <el-upload
              ref="uploadRef"
              :action="uploadAction"
              :headers="uploadHeaders"
              multiple
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
            >
              <el-button type="primary">{{ t('data.file.preview.click_to_upload') }}</el-button>
            </el-upload>
            <el-button
              type="danger"
              :disabled="selectedFiles.length === 0"
              @click="handleBatchDelete"
            >
              {{ t('data.file.preview.delete_selected') }}
            </el-button>
          </btc-crud-row>

          <!-- 第二行：文件列表 -->
          <btc-crud-row>
            <template v-if="fileList.length > 0">
              <el-scrollbar v-loading="loading" class="file-list">
                <div class="file-grid">
                <div
                  v-for="file in fileList"
                  :key="file.id"
                  class="file-item"
                  :class="{ active: selectedFiles.includes(file.id) }"
                  @click="handleFileSelect(file)"
                  @dblclick="handleFilePreview(file)"
                >
                  <!-- 图片 -->
                  <template v-if="isImage(file)">
                    <el-image
                      class="file-image"
                      :src="file.url"
                      :preview-src-list="[file.url]"
                      fit="contain"
                      lazy
                    >
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </template>

                  <!-- 视频 -->
                  <template v-else-if="isVideo(file)">
                    <div class="file-video">
                      <video :src="file.url" />
                      <div class="video-overlay">
                        <el-icon class="play-icon"><VideoPlay /></el-icon>
                      </div>
                    </div>
                  </template>

                  <!-- 音频 -->
                  <template v-else-if="isAudio(file)">
                    <div class="file-audio">
                      <el-icon class="audio-icon"><VideoPlay /></el-icon>
                      <audio :src="file.url" controls />
                    </div>
                  </template>

                  <!-- 其他文件 -->
                  <template v-else>
                    <el-icon class="file-icon">
                      <Document />
                    </el-icon>
                  </template>

                  <!-- 文件名 -->
                  <div class="file-name" :title="file.name">
                    {{ file.name }}
                  </div>

                  <!-- 选中标识 -->
                  <div v-if="selectedFiles.includes(file.id)" class="file-selected">
                    <el-icon><Check /></el-icon>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="file-actions">
                    <el-icon class="action-icon" @click.stop="handleFilePreview(file)">
                      <ZoomIn />
                    </el-icon>
                    <el-icon class="action-icon" @click.stop="handleFileDownload(file)">
                      <Download />
                    </el-icon>
                    <el-icon class="action-icon" @click.stop="handleFileDelete(file)">
                      <Delete />
                    </el-icon>
                  </div>
                </div>
                </div>
              </el-scrollbar>
            </template>

            <!-- 空状态 -->
            <BtcEmpty v-else :description="t('data.file.preview.empty_tip')" />
          </btc-crud-row>

          <!-- 第三行：分页（居中显示） -->
          <btc-crud-row justify="center">
            <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :total="pagination.total"
              background
              layout="prev, pager, next, jumper, sizes, total"
              :page-sizes="[20, 40, 60, 80, 100]"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
        </btc-crud-row>
      </template>
    </BtcDoubleLayout>
  </div>
</template>

<script setup lang="ts">
import { BtcConfirm, BtcMessage, BtcCrudRow, BtcCrudFlex1, BtcEmpty, BtcInput } from '@btc/shared-components';
import { useI18n, logger } from '@btc/shared-core';
import { BtcDoubleLayout } from '@btc/shared-components';
import { Document, Picture, VideoPlay, Check, ZoomIn, Download, Delete, Search } from '@element-plus/icons-vue';
import { service } from '@services/eps';

defineOptions({
  name: 'DataFilesPreview'
});

const { t } = useI18n();

// 组件引用
const viewGroupRef = ref();
const uploadRef = ref();

// 状态
const loading = ref(false);
const selectedFiles = ref<string[]>([]);
const selectedCategoryId = ref<string | null>(null);
const categoryKeyword = ref('');

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
});

// 分类列表
const categories = ref([
  { id: 'all', name: '全部文件', count: 0 },
  { id: 'image', name: '图片', count: 0 },
  { id: 'video', name: '视频', count: 0 },
  { id: 'audio', name: '音频', count: 0 },
  { id: 'document', name: '文档', count: 0 },
  { id: 'other', name: '其他', count: 0 }
]);

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!categoryKeyword.value) return categories.value;
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(categoryKeyword.value.toLowerCase())
  );
});

// 当前选中的分类
const selectedCategory = computed(() => {
  return categories.value.find(cat => cat.id === selectedCategoryId.value);
});

// 文件列表
const fileList = ref<any[]>([]);

// 上传配置
const uploadAction = computed(() => {
  // TODO: 替换为实际的上传接口
  return '/api/base/open/upload';
});

const uploadHeaders = computed(() => {
  // TODO: 添加认证头
  return {};
});

// 分类选择
const handleCategorySelect = (category: any) => {
  selectedCategoryId.value = category.id;
  pagination.page = 1;
  
  // BtcDoubleLayout 只是一个布局组件，不需要 select 方法
  // 直接刷新文件列表即可
  
  refreshFileList();
};

// 刷新分类列表
const handleRefreshCategories = () => {
  BtcMessage.info('刷新分类功能待实现');
};

// 添加分类
// 文件类型判断
const isImage = (file: any) => {
  return file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
};

const isVideo = (file: any) => {
  return file.type?.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(file.name);
};

const isAudio = (file: any) => {
  return file.type?.startsWith('audio/') || /\.(mp3|wav|flac|aac|ogg)$/i.test(file.name);
};

// 文件选择
const handleFileSelect = (file: any) => {
  const index = selectedFiles.value.indexOf(file.id);
  if (index >= 0) {
    selectedFiles.value.splice(index, 1);
  } else {
    selectedFiles.value.push(file.id);
  }
};

// 文件预览
const handleFilePreview = (file: any) => {
  if (isImage(file)) {
    // 图片预览由 el-image 自动处理
    return;
  }
  
  // 打开新窗口预览其他类型文件
  window.open(file.url, '_blank');
};

// 文件下载
const handleFileDownload = (file: any) => {
  const link = document.createElement('a');
  link.href = file.url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 文件删除
const handleFileDelete = async (file: any) => {
  try {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // TODO: 调用删除接口
    // await service.system?.iam?.file?.delete(file.id);
    
    BtcMessage.success(t('crud.message.delete_success'));
    refreshFileList();
  } catch (error) {
    // 用户取消删除
  }
};

// 批量删除
const handleBatchDelete = async () => {
  try {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // TODO: 调用批量删除接口
    // await service.system?.iam?.file?.deleteBatch(selectedFiles.value);
    
    BtcMessage.success(t('crud.message.delete_success'));
    selectedFiles.value = [];
    refreshFileList();
  } catch (error) {
    // 用户取消删除
  }
};

// 上传前检查
const beforeUpload = (file: File) => {
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    BtcMessage.error('文件大小不能超过 100MB!');
    return false;
  }
  return true;
};

// 上传成功
const handleUploadSuccess = (response: any, file: any) => {
  BtcMessage.success('上传成功');
  refreshFileList();
};

// 上传失败
const handleUploadError = (error: any) => {
  BtcMessage.error('上传失败');
};

// 刷新文件列表
const refreshFileList = async () => {
  loading.value = true;
  try {
    // TODO: 调用文件列表接口
    // const params: any = {
    //   page: pagination.page,
    //   size: pagination.size
    // };
    // const res = await service.system?.iam?.file?.page(params);
    // fileList.value = res.list || [];
    // pagination.total = res.total || 0;

    // 模拟数据用于测试页面
    setTimeout(() => {
      fileList.value = [];
      pagination.total = 0;
      loading.value = false;
    }, 500);
  } catch (error) {
    logger.error('加载文件列表失败:', error);
    loading.value = false;
  }
};

// 分页改变
const handlePageChange = () => {
  refreshFileList();
};

const handleSizeChange = () => {
  pagination.page = 1;
  refreshFileList();
};

onMounted(() => {
  nextTick(() => {
    handleCategorySelect(categories.value[0]);
  });
});
</script>

<style lang="scss" scoped>
// 左侧标题栏的操作按钮样式（在 BtcDoubleLayout 的 left-header 插槽中）
:deep(.btc-double-layout__left-header) {
  .header-actions {
    display: flex;
    align-items: center;

    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 5px;
      cursor: pointer;
      border-radius: 6px;
      font-size: 16px;
      height: 26px;
      width: 26px;
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }
  }
}

.file-preview-left {
  .search {
    padding: 10px 10px 0 10px;

    :deep(.el-input) {
      .el-input__wrapper {
        border-radius: 6px;
      }
    }
  }

  .category-list {
    flex: 1;
    padding: 8px;
    margin-top: 10px;
    box-sizing: border-box;

    .category-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 4px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);

        .category-icon {
          color: var(--el-color-primary);
        }
      }

      .category-icon {
        margin-right: 8px;
        font-size: 18px;
      }

      .category-name {
        flex: 1;
        font-size: 14px;
      }

      .category-count {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

// 第一个 btc-crud-row：操作栏（顶部 padding）
.btc-crud-row:nth-child(1) {
  padding: 10px;
}

// 第二个 btc-crud-row：文件列表（占据剩余空间）
.btc-crud-row:nth-child(2) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch; // 确保子元素占据全部宽度
  
  // 有数据时：文件列表滚动区域
  .file-list {
    flex: 1;
    min-height: 0;
    padding: 10px;
    position: relative;

    .file-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 16px;

      .file-item {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
          background-color: var(--el-fill-color-light);
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: var(--el-color-primary);
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            .file-actions {
              opacity: 1;
            }
          }

          &.active {
            border-color: var(--el-color-primary);

            .file-selected {
              display: flex;
            }
          }

          .file-image {
            width: 100%;
            height: 100%;
          }

          .image-error {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            font-size: 48px;
            color: var(--el-text-color-placeholder);
          }

          .file-video {
            position: relative;
            width: 100%;
            height: 100%;

            video {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .video-overlay {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: rgba(0, 0, 0, 0.3);

              .play-icon {
                font-size: 48px;
                color: white;
              }
            }
          }

          .file-audio {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 16px;

            .audio-icon {
              font-size: 48px;
              color: var(--el-color-primary);
              margin-bottom: 8px;
            }

            audio {
              width: 100%;
            }
          }

          .file-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 64px;
            color: var(--el-text-color-placeholder);
          }

          .file-name {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 8px;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
            color: white;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .file-selected {
            position: absolute;
            top: 4px;
            left: 4px;
            width: 24px;
            height: 24px;
            background-color: var(--el-color-primary);
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1;

            .el-icon {
              color: white;
              font-size: 14px;
            }
          }

          .file-actions {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.5);
            opacity: 0;
            transition: opacity 0.3s;

            .action-icon {
              font-size: 24px;
              color: white;
              margin: 0 8px;
              cursor: pointer;
              transition: transform 0.2s;

              &:hover {
                transform: scale(1.2);
              }
            }
          }
        }
      }
    }
}

// 第三个 btc-crud-row：分页（底部 padding）
.btc-crud-row:nth-child(3) {
  padding: 0 10px 10px 10px;
}
</style>
