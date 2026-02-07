<template>
  <div class="page">
    <BtcDoubleLayout ref="viewGroupRef" left-width="280px" left-title="title.data.files.template.categories" right-title="title.data.files.template.templateList">
      <!-- 左侧标题栏操作 -->
      <template #left-header>
        <span class="label">{{ t('data.file.template.categories') }}</span>
        <div class="header-actions">
          <div class="icon" @click="handleRefreshCategories">
            <btc-svg name="refresh" />
          </div>
        </div>
      </template>
      
      <!-- 左侧分类列表 -->
      <template #left>
        <div class="file-template-left">
          <div class="search">
            <BtcInput
              v-model="categoryKeyword"
              :placeholder="t('data.file.template.search_category')"
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

      <!-- 右侧模板列表区域 -->
      <template #right="{ selected, keyword }">
        <div class="file-template-right">
          <!-- 操作栏 -->
          <div class="header">
            <el-button @click="refreshTemplateList">{{ t('common.button.refresh') }}</el-button>
            <el-upload
              ref="uploadRef"
              :action="uploadAction"
              :headers="uploadHeaders"
              multiple
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              style="margin: 0 10px;"
            >
              <el-button type="primary">{{ t('data.file.template.click_to_upload') }}</el-button>
            </el-upload>
            <el-button
              type="danger"
              :disabled="selectedTemplates.length === 0"
              @click="handleBatchDelete"
            >
              {{ t('data.file.template.delete_selected') }}
            </el-button>
          </div>

          <!-- 模板列表 -->
          <el-scrollbar v-loading="loading" class="template-list">
            <template v-if="templateList.length > 0">
              <div class="template-grid">
                <div
                  v-for="template in templateList"
                  :key="template.id"
                  class="template-item"
                  :class="{ active: selectedTemplates.includes(template.id) }"
                  @click="handleTemplateSelect(template)"
                  @dblclick="handleTemplatePreview(template)"
                >
                  <!-- 图片 -->
                  <template v-if="isImage(template)">
                    <el-image
                      class="template-image"
                      :src="template.url"
                      :preview-src-list="[template.url]"
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
                  <template v-else-if="isVideo(template)">
                    <div class="template-video">
                      <video :src="template.url" />
                      <div class="video-overlay">
                        <el-icon class="play-icon"><VideoPlay /></el-icon>
                      </div>
                    </div>
                  </template>

                  <!-- 音频 -->
                  <template v-else-if="isAudio(template)">
                    <div class="template-audio">
                      <el-icon class="audio-icon"><VideoPlay /></el-icon>
                      <audio :src="template.url" controls />
                    </div>
                  </template>

                  <!-- 其他文件 -->
                  <template v-else>
                    <el-icon class="template-icon">
                      <Document />
                    </el-icon>
                  </template>

                  <!-- 模板名 -->
                  <div class="template-name" :title="template.name">
                    {{ template.name }}
                  </div>

                  <!-- 选中标识 -->
                  <div v-if="selectedTemplates.includes(template.id)" class="template-selected">
                    <el-icon><Check /></el-icon>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="template-actions">
                    <el-icon class="action-icon" @click.stop="handleTemplatePreview(template)">
                      <ZoomIn />
                    </el-icon>
                    <el-icon class="action-icon" @click.stop="handleTemplateDownload(template)">
                      <Download />
                    </el-icon>
                    <el-icon class="action-icon" @click.stop="handleTemplateDelete(template)">
                      <Delete />
                    </el-icon>
                  </div>
                </div>
              </div>
            </template>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <el-icon class="empty-icon"><Document /></el-icon>
              <p>{{ t('data.file.template.empty_tip') }}</p>
            </div>
          </el-scrollbar>

          <!-- 分页 -->
          <div class="pagination">
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
          </div>
        </div>
      </template>
    </BtcDoubleLayout>
  </div>
</template>

<script setup lang="ts">
import { BtcConfirm, BtcMessage, BtcInput } from '@btc/shared-components';
import { useI18n, logger } from '@btc/shared-core';
import { BtcDoubleLayout } from '@btc/shared-components';
import { Document, Picture, VideoPlay, Check, ZoomIn, Download, Delete, Search } from '@element-plus/icons-vue';
import { service } from '@services/eps';

defineOptions({
  name: 'DataFilesTemplate'
});

const { t } = useI18n();

// 组件引用
const viewGroupRef = ref();
const uploadRef = ref();

// 状态
const loading = ref(false);
const selectedTemplates = ref<string[]>([]);
const selectedCategoryId = ref<string | null>(null);
const categoryKeyword = ref('');

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
});

// 分类列表
const categories = computed(() => [
  { id: 'all', name: t('data.file.template.category.all'), count: 0 },
  { id: 'image', name: t('data.file.template.category.image'), count: 0 },
  { id: 'video', name: t('data.file.template.category.video'), count: 0 },
  { id: 'audio', name: t('data.file.template.category.audio'), count: 0 },
  { id: 'document', name: t('data.file.template.category.document'), count: 0 },
  { id: 'other', name: t('data.file.template.category.other'), count: 0 }
]);

// 过滤后的分类列表
const filteredCategories = computed(() => {
  if (!categoryKeyword.value) return categories.value;
  const keyword = categoryKeyword.value.toLowerCase();
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(keyword)
  );
});

// 当前选中的分类
const selectedCategory = computed(() => {
  return categories.value.find(cat => cat.id === selectedCategoryId.value);
});

// 模板列表
const templateList = ref<any[]>([]);

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
  // 直接刷新模板列表即可
  
  refreshTemplateList();
};

// 刷新分类列表
const handleRefreshCategories = () => {
  BtcMessage.info(t('data.file.template.refresh_categories'));
};

// 文件类型判断
const isImage = (template: any) => {
  return template.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(template.name);
};

const isVideo = (template: any) => {
  return template.type?.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(template.name);
};

const isAudio = (template: any) => {
  return template.type?.startsWith('audio/') || /\.(mp3|wav|flac|aac|ogg)$/i.test(template.name);
};

// 模板选择
const handleTemplateSelect = (template: any) => {
  const index = selectedTemplates.value.indexOf(template.id);
  if (index >= 0) {
    selectedTemplates.value.splice(index, 1);
  } else {
    selectedTemplates.value.push(template.id);
  }
};

// 模板预览
const handleTemplatePreview = (template: any) => {
  if (isImage(template)) {
    // 图片预览由 el-image 自动处理
    return;
  }
  
  // 打开新窗口预览其他类型模板
  window.open(template.url, '_blank');
};

// 模板下载
const handleTemplateDownload = (template: any) => {
  const link = document.createElement('a');
  link.href = template.url;
  link.download = template.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 模板删除
const handleTemplateDelete = async (template: any) => {
  try {
    await BtcConfirm(
      t('crud.message.delete_confirm'),
      t('common.button.confirm'),
      { type: 'warning' }
    );

    // TODO: 调用删除接口
    // await service.system?.iam?.template?.delete(template.id);
    
    BtcMessage.success(t('crud.message.delete_success'));
    refreshTemplateList();
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
    // await service.system?.iam?.template?.deleteBatch(selectedTemplates.value);
    
    BtcMessage.success(t('crud.message.delete_success'));
    selectedTemplates.value = [];
    refreshTemplateList();
  } catch (error) {
    // 用户取消删除
  }
};

// 上传前检查
const beforeUpload = (file: File) => {
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isLt100M) {
    BtcMessage.error(t('data.file.template.upload.size_limit'));
    return false;
  }
  return true;
};

// 上传成功
const handleUploadSuccess = (response: any, file: any) => {
  BtcMessage.success(t('data.file.template.upload.success'));
  refreshTemplateList();
};

// 上传失败
const handleUploadError = (error: any) => {
  BtcMessage.error(t('data.file.template.upload.failed'));
};

// 刷新模板列表
const refreshTemplateList = async () => {
  loading.value = true;
  try {
    // TODO: 调用模板列表接口
    // const params: any = {
    //   page: pagination.page,
    //   size: pagination.size
    // };
    // const res = await service.system?.iam?.template?.page(params);
    // templateList.value = res.list || [];
    // pagination.total = res.total || 0;

    // 模拟数据用于测试页面
    setTimeout(() => {
      templateList.value = [];
      pagination.total = 0;
      loading.value = false;
    }, 500);
  } catch (error) {
    logger.error('加载模板列表失败:', error);
    loading.value = false;
  }
};

// 分页改变
const handlePageChange = () => {
  refreshTemplateList();
};

const handleSizeChange = () => {
  pagination.page = 1;
  refreshTemplateList();
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

.file-template-left {
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

.file-template-right {
    height: 100%;
    display: flex;
    flex-direction: column;

    .header {
      display: flex;
      align-items: center;
      height: 50px;
      padding: 0 10px;
    }

    .template-list {
      height: calc(100% - 110px);
      padding: 10px;
      position: relative;

      .template-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;

        .template-item {
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

            .template-actions {
              opacity: 1;
            }
          }

          &.active {
            border-color: var(--el-color-primary);

            .template-selected {
              display: flex;
            }
          }

          .template-image {
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

          .template-video {
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

          .template-audio {
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

          .template-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 64px;
            color: var(--el-text-color-placeholder);
          }

          .template-name {
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

          .template-selected {
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

          .template-actions {
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

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        color: var(--el-text-color-placeholder);

        .empty-icon {
          font-size: 96px;
          margin-bottom: 16px;
        }

        p {
          font-size: 16px;
        }
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      padding: 10px;
    }
  }
</style>

