<template>
  <el-button type="info" @click="open">
    <el-icon><Download /></el-icon>
    {{ t('ui.export') }}
  </el-button>

  <BtcDialog ref="dialogRef" :title="t('ui.export')" width="600px">
    <BtcForm ref="formRef" :items="formItems" @submit="handleSubmit" />
  </BtcDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Download } from '@element-plus/icons-vue';

import { useI18n, logger } from '@btc/shared-core';
import type { BtcFormItem } from '../../components/form/btc-form/types';
import { BtcMessage } from '@btc/shared-components';

interface MenuItem {
  id: string | number;
  name: string;
  _children?: MenuItem[];
  [key: string]: any;
}

interface Props {
  /** 菜单数据 */
  data?: MenuItem[];
  /** 导出服务方法 */
  exportService?: (params: { ids: (string | number)[] }) => Promise<any>;
  /** 文件名前缀 */
  filename?: string;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  filename: '菜单数据',
});

const { t } = useI18n();
const loading = ref(false);
const dialogRef = ref();
const formRef = ref();
const treeRef = ref();

// 表单配置
const formItems = computed<BtcFormItem[]>(() => [
  {
    label: t('选择菜单'),
    prop: 'ids',
    component: {
      name: 'el-tree-select',
      ref: treeRef,
      props: {
        data: props.data,
        nodeKey: 'id',
        multiple: true,
        showCheckbox: true,
        collapseTags: true,
        collapseTagsTooltip: true,
        props: {
          label: 'name',
          children: '_children',
        },
      },
    },
  },
]);

const open = () => {
  if (!props.data || props.data.length === 0) {
    BtcMessage.warning('没有菜单数据可导出');
    return;
  }

  dialogRef.value?.open();
  formRef.value?.setForm({ ids: [] });
};

const handleSubmit = async (_data: any, { done, close }: any) => {
  // 获取所有选中的ID（包括半选中的）
  const checkedKeys = treeRef.value?.getCheckedKeys() || [];
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || [];
  const ids = [...checkedKeys, ...halfCheckedKeys];

  if (ids.length === 0) {
    BtcMessage.warning(t('请先选择要导出的菜单'));
    done();
    return;
  }

  loading.value = true;

  try {
    if (props.exportService) {
      // 使用提供的导出服务
      const result = await props.exportService({ ids });

      // 创建 Blob 对象
      const blob = new Blob([JSON.stringify(result)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);

      // 创建一个 <a> 元素
      const a = document.createElement('a');
      a.href = url;
      a.download = `${props.filename} ${new Date().toLocaleString('zh-CN').replace(/[/\s:]/g, '_')}.json`;

      // 模拟点击 <a> 元素以触发下载
      a.click();

      // 清理 URL 对象
      URL.revokeObjectURL(url);

      BtcMessage.success(t('导出成功'));
      close();
    } else {
      BtcMessage.error('导出服务未配置');
    }
  } catch (error) {
    logger.error('导出失败:', error);
    BtcMessage.error(t('导出失败'));
  } finally {
    loading.value = false;
    done();
  }
};
</script>