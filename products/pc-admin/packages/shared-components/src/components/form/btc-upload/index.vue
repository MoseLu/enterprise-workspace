<template>
  <div class="btc-upload__wrap" :class="[customClass]">
    <div
      class="btc-upload"
      :class="[
        `btc-upload--${fileType}`,
        {
          'is-disabled': disabled,
          'is-multiple': multiple,
          'is-small': small
        }
      ]"
      :style="uploadStyleVars"
    >
      <template v-if="!drag">
        <div v-if="fileType == 'file'" class="btc-upload__file-btn">
          <el-upload
            :ref="setRefs('upload')"
            :drag="drag"
            action=""
            :accept="accept"
            :show-file-list="false"
            :before-upload="onBeforeUpload"
            :http-request="httpRequest"
            :multiple="multiple"
            :disabled="disabled"
          >
            <slot>
              <el-button type="success">{{ text }}</el-button>
            </slot>
          </el-upload>
        </div>
      </template>

      <!-- 列表 -->
      <div v-if="showList" class="btc-upload__list">
        <!-- 列表项 -->
        <template v-for="(item, index) in list" :key="item.uid">
          <el-upload
            action=""
            :accept="accept"
            :show-file-list="false"
            :http-request="
              (req: any) => {
                return httpRequest(req, item);
              }
            "
            :before-upload="
              (file: File) => {
                onBeforeUpload(file, item);
              }
            "
            :disabled="disabled"
          >
            <slot name="item" :item="item" :index="index">
              <div class="btc-upload__item">
                <btc-upload-item
                  :show-tag="showTag"
                  :item="item"
                  :disabled="disabled"
                  :deletable="deletable"
                  @remove="remove(index)"
                />

                <!-- 小图模式 -->
                <el-icon
                  v-if="small"
                  class="btc-upload__item-remove"
                  @click.stop="remove(index)"
                >
                  <CircleCloseFilled />
                </el-icon>
              </div>
            </slot>
          </el-upload>
        </template>

        <!-- 触发按钮 -->
        <div v-if="(fileType == 'image' || drag) && isAdd" class="btc-upload__footer">
          <el-upload
            :ref="setRefs('upload')"
            action=""
            :drag="drag"
            :accept="accept"
            :show-file-list="false"
            :before-upload="onBeforeUpload"
            :http-request="httpRequest"
            :multiple="multiple"
            :disabled="disabled"
          >
            <slot>
              <!-- 拖拽方式 -->
              <div v-if="drag" class="btc-upload__demo is-dragger">
                <el-icon :size="46">
                  <UploadFilled />
                </el-icon>
                <div>
                  {{ t('点击上传或将文件拖动到此处，文件大小限制{n}M', { n: limitSize }) }}
                </div>
              </div>

              <!-- 点击方式 -->
              <div v-else class="btc-upload__demo">
                <el-icon :size="36">
                  <component :is="icon" v-if="icon" />
                  <PictureFilled v-else />
                </el-icon>
                <span v-if="text" class="text">{{ text }}</span>
              </div>
            </slot>
          </el-upload>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type PropType, nextTick } from 'vue';
import { assign, isArray, isEmpty, isNumber } from 'lodash-es';

import { PictureFilled, UploadFilled, CircleCloseFilled } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
import { inject } from 'vue';
import { useUpload } from './composables/useUpload';
import BtcUploadItem from './components/upload-item.vue';
import type { UploadItem } from './types';
import { BtcMessage } from '@btc/shared-components';
import { detectFileType, detectFileTypeFromFileName } from '@btc/shared-core/utils';

defineOptions({
  name: 'BtcUpload'
});

const props = defineProps({
  // 绑定值，单选时字符串，多选时字符串数组
  modelValue: {
    type: [String, Array] as PropType<string | string[]>,
    default: () => []
  },
  // 表单字段名（用于验证）
  prop: String,
  // 是否禁用
  isDisabled: Boolean,
  // 上传类型（使用引号避免与对象内部 type 字段冲突）
  'type': {
    type: String,
    default: 'image'
  },
  // 允许上传的文件类型
  accept: String,
  // 是否多选
  multiple: Boolean,
  // 限制数量
  limit: Number,
  // 限制大小（MB）
  limitSize: {
    type: Number,
    default: 5
  },
  // 是否自动上传
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 元素大小
  size: [String, Number, Array] as PropType<string | number | [number, number]>,
  // 小图模式
  small: Boolean,
  // 显示图标
  icon: null,
  // 显示文案
  text: String,
  // 显示角标
  showTag: {
    type: Boolean,
    default: true
  },
  // 是否显示上传列表
  showFileList: {
    type: Boolean,
    default: true
  },
  // 列表是否可拖拽
  draggable: Boolean,
  // 是否拖拽到特定区域以进行上传
  drag: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: Boolean,
  // 是否可删除
  deletable: Boolean,
  // 自定义样式名
  customClass: String,
  // 上传前钩子
  beforeUpload: Function as PropType<(file: File, item?: UploadItem, options?: any) => any>,
  // 上传服务类型 'avatar' | 'file'
  uploadType: {
    type: String as PropType<'avatar' | 'file'>,
    default: 'file'
  },
  // 上传服务（可选，如果不提供则尝试从全局获取）
  uploadService: Object
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]];
  'change': [value: string | string[]];
  'upload': [item: UploadItem, file: File];
  'success': [item: UploadItem];
  'error': [item: UploadItem];
  'progress': [item: UploadItem];
}>();

const { t } = useI18n();

// 获取 service：优先使用 prop，其次 inject，最后尝试动态导入
// 使用 inject 时提供默认值，避免在没有 provide 时出错
const injectedService = inject('service', null);

// 按优先级获取 service（在 setup 上下文中执行，确保 inject 正常工作）
const getService = () => {
  // 1. 优先使用 prop
  if (props.uploadService) {
    return props.uploadService;
  }

  // 2. 其次使用 inject
  if (injectedService) {
    return injectedService;
  }

  // 3. 最后尝试从全局变量获取（仅在浏览器环境）
  if (typeof window !== 'undefined') {
    return (window as any).__BTC_SERVICE__;
  }

  return null;
};

const service = getService();
const uploadComposable = useUpload(service);
const toUpload = uploadComposable.toUpload;
const refs: Record<string, any> = {};

function setRefs(name: string) {
  return (el: any) => {
    if (el) {
      refs[name] = el;
    }
  };
}

// 元素尺寸
const size = computed(() => {
  const d = props.size || [100, 100];
  const sizeArray = isArray(d) ? d : [d, d];
  return sizeArray.map((e: string | number) => (isNumber(e) ? e + 'px' : e));
});

const uploadStyleVars = computed(() => ({
  '--btc-upload-height': size.value[0],
  '--btc-upload-width': size.value[1]
}));

// 是否禁用
const disabled = computed(() => {
  return props.isDisabled || props.disabled;
});

// 上传类型（处理默认值，避免与 props.uploadType 冲突）
const fileType = computed(() => {
  return props.type || 'image';
});

// 最大上传数量
const limit = computed(() => {
  return props.limit || 9;
});

// 文案
const text = computed(() => {
  if (props.text !== undefined) {
    return props.text;
  } else {
    switch (fileType.value) {
      case 'file':
        return t('选择文件');
      case 'image':
        return t('选择图片');
      default:
        return '';
    }
  }
});

// 列表
const list = ref<UploadItem[]>([]);

// 显示上传列表
const showList = computed(() => {
  if (fileType.value == 'file') {
    return props.showFileList ? !isEmpty(list.value) : false;
  } else {
    return true;
  }
});

// 文件格式
const accept = computed(() => {
  return props.accept || (fileType.value == 'file' ? '' : 'image/*');
});

// 能否添加
const isAdd = computed(() => {
  const len = list.value.length;

  if (props.multiple && !disabled.value) {
    return limit.value - len > 0;
  }

  return len == 0;
});

// 生成唯一 ID
function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// 获取文件类型（从文件名，同步方法，用于 URL 字符串）
function getType(fileName: string): string {
  const result = detectFileTypeFromFileName(fileName);
  return result.category;
}

// 获取 URL 数组
function getUrls(list: UploadItem[]): string[] {
  return list.map(e => e.url || '').filter(Boolean);
}

// 上传前
async function onBeforeUpload(file: File, item?: UploadItem) {
  async function next() {
    // File 对象没有 uid 属性，使用 uuid() 生成
    const fileUid = (file as any).uid || uuid();
    
    // 使用增强的文件类型检测
    const fileTypeResult = await detectFileType(file);
    
    const d: UploadItem = {
      uid: fileUid,
      size: file.size,
      name: file.name,
      type: fileTypeResult.category,
      progress: props.autoUpload ? 0 : 100,
      url: '',
      preload: '',
      error: ''
    };

    // 图片预览地址
    if (d.type == 'image') {
      if (file instanceof File) {
        d.preload = window.URL.createObjectURL(file);
      }
    }

    // 上传事件
    emit('upload', d, file);

    // 赋值
    if (item) {
      assign(item, d);
    } else {
      if (props.multiple) {
        if (!isAdd.value) {
          BtcMessage.warning(t('最多只能上传{n}个文件', { n: limit.value }));
          return false;
        } else {
          list.value.push(d);
        }
      } else {
        list.value = [d];
      }
    }

    return true;
  }

  // 文件格式验证
  if (accept.value && accept.value !== '*') {
    const fileName = file.name.toLowerCase();
    const fileExt = '.' + fileName.split('.').pop();
    const acceptList = accept.value.split(',').map((item: string) => item.trim().toLowerCase());

    const isValidFormat = acceptList.some((acceptItem: string) => {
      if (acceptItem === 'image/*') {
        return file.type.startsWith('image/');
      }
      if (acceptItem === 'video/*') {
        return file.type.startsWith('video/');
      }
      if (acceptItem === 'audio/*') {
        return file.type.startsWith('audio/');
      }
      return acceptItem === fileExt || acceptItem === file.type;
    });

    if (!isValidFormat) {
      BtcMessage.error(
        t('不支持的文件格式，请上传 {formats} 格式的文件', {
          formats: accept.value
        })
      );
      return false;
    }
  }

  // 文件大小限制
  if (file.size / 1024 / 1024 >= props.limitSize) {
    BtcMessage.error(t('上传文件大小不能超过 {n}MB!', { n: props.limitSize }));
    return false;
  }

  // 自定义上传事件
  if (props.beforeUpload) {
    const r = props.beforeUpload(file, item, { next });

    if (r instanceof Promise) {
      r.then(() => next()).catch(() => null);
    } else {
      if (r) {
        return await next();
      }
    }

    return r;
  } else {
    return await next();
  }
}

// 移除
function remove(index: number) {
  list.value.splice(index, 1);
  update();
}

// 清空
function clear() {
  list.value = [];
}

// 文件上传请求
async function httpRequest(req: any, item?: UploadItem) {
  if (!item) {
    // File 对象可能没有 uid 属性，需要通过其他方式匹配
    const fileUid = (req.file as any).uid;
    item = fileUid ? list.value.find((e: UploadItem) => e.uid == fileUid) : undefined;
  }

  if (!item) {
    return false;
  }

  // 保存 item 引用，避免在异步操作中丢失
  const currentItem = item;

  if (!currentItem) {
    return false;
  }

  // 上传请求
  toUpload(req.file, {
    uploadType: props.uploadType,
    onProgress(progress: number) {
      if (currentItem) {
        currentItem.progress = progress;
        emit('progress', currentItem);
      }
    }
  })
    .then((res: any) => {
      if (!currentItem) {
        return;
      }

      // toUpload 已经返回 { url, fileId } 格式
      // 验证响应是否有效（必须包含 url 字段）
      if (!res || typeof res !== 'object' || !res.url) {
        throw new Error('上传响应格式错误：未找到 url 字段');
      }

      // 将响应数据赋值给 item，url 已经在 useUpload 中提取好了
      assign(currentItem, res);
      emit('success', currentItem);
      update();
    })
    .catch((err: any) => {
      if (currentItem) {
        currentItem.error = err.message || '上传失败';
        emit('error', currentItem);
      }
      // 不调用 update()，避免将错误对象传递到 modelValue
    });
}

// 检测是否还有未上传的文件
function check() {
  return list.value.find(e => !e.url);
}

// 更新
function update() {
  if (!check()) {
    const urls = getUrls(list.value);
    const val = props.multiple ? urls : urls[0] || '';

    // 更新绑定值
    emit('update:modelValue', val);
    emit('change', val);

    nextTick(() => {
      // 清空
      refs.upload?.clearFiles();
    });
  }
}

// 监听绑定值
watch(
  () => props.modelValue,
  (val: any[] | string) => {
    if (check()) {
      return;
    }

    // 如果 val 是对象类型（可能是错误对象），忽略它
    if (val && typeof val === 'object' && !isArray(val)) {
      console.warn('[Upload Warn] modelValue 是对象类型，可能是错误对象，已忽略', val);
      return;
    }

    // 确保 val 是数组或字符串，并转换为字符串数组
    const urlArray = (isArray(val) ? val : [val]).filter(Boolean);

    // 过滤出字符串类型的 URL
    const urls = urlArray.filter((url: any): url is string => typeof url === 'string');

    list.value = urls
      .map((url: string, index: number) => {
        const old: Partial<UploadItem> = list.value[index] || {};

        return assign(
          {
            progress: 100,
            uid: uuid(),
            size: old.size || 0,
            name: old.name || (url ? url.split('/').pop() || '' : ''),
            error: old.error || ''
          },
          old,
          {
            type: getType(url),
            url,
            preload: old.url == url ? (old.preload || '') : url
          }
        ) as UploadItem;
      })
      .filter((_: any, i: number) => {
        return props.multiple ? true : i == 0;
      });
  },
  {
    immediate: true
  }
);

// 导出
defineExpose({
  isAdd,
  list,
  check,
  clear,
  remove
});
</script>

<style lang="scss" scoped>
.btc-upload {
  line-height: normal;

  &__file {
    width: 100%;

    &-btn {
      width: fit-content;
    }
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
  }

  &__item,
  &__demo {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: var(--btc-upload-height, 100px);
    width: var(--btc-upload-width, 100px);
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    border-radius: 8px;
    cursor: pointer;
    box-sizing: border-box;
    position: relative;
    user-select: none;
  }

  &__demo {
    font-size: 13px;

    .el-icon {
      font-size: 46px;
    }

    .text {
      margin-top: 5px;
    }

    &.is-dragger {
      padding: 20px;
    }
  }

  &__file-btn {
    & + .btc-upload__list {
      margin-top: 10px;
    }
  }

  :deep(.el-upload) {
    display: block;

    .el-upload-dragger {
      padding: 0;
      border: 0;
      background-color: transparent !important;
      position: relative;

      &.is-dragover {
        &::after {
          display: block;
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 100%;
          pointer-events: none;
          border-radius: 8px;
          box-sizing: border-box;
          border: 1px dashed var(--el-color-primary);
        }
      }
    }
  }

  &.is-disabled {
    .btc-upload__demo {
      color: var(--el-text-color-placeholder);
    }

    :deep(.btc-upload__item) {
      cursor: not-allowed;
      background-color: var(--el-disabled-bg-color);
    }
  }

  &.is-multiple {
    .btc-upload__list {
      margin-bottom: -5px;
    }

    .btc-upload__item {
      margin: 0 5px 5px 0;
    }

    .btc-upload__footer {
      margin-bottom: 5px;
    }
  }

  &.is-small {
    .btc-upload__demo {
      .el-icon {
        font-size: 20px !important;
      }

      .text {
        display: none;
      }
    }

    .btc-upload__item-remove {
      position: absolute;
      right: 0px;
      top: 0px;
      color: var(--el-color-danger);
      background-color: #fff;
      border-radius: 100%;
    }
  }

  &:not(.is-disabled) {
    .btc-upload__demo {
      &:hover {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
