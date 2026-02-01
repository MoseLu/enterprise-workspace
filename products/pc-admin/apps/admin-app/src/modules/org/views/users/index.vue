<template>
  <div class="page">
    <BtcMasterTableGroup
      ref="tableGroupRef"
      :left-service="services.sysdept"
      :right-service="services.sysuser"
      :table-columns="userColumns"
      :form-items="formItems"
      :op="{ buttons: ['edit', 'delete'] }"
      :on-info="handleUserInfo"
      left-title="title.org.dept.list"
      :right-title="t('org.users.title')"
      :show-unassigned="true"
      :enable-key-search="true"
      :left-size="'small'"
      @load="handleLoad"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { BtcMasterTableGroup } from '@btc/shared-components';
import { usePageColumns, usePageForms, getPageConfigFull, usePageService, useI18n, logger } from '@btc/shared-core';

const { t } = useI18n();

const tableGroupRef = ref();
const departmentOptions = ref<any[]>([]);

// 从 config.ts 读取配置
const { columns: baseColumns } = usePageColumns('org.users');
const { formItems: baseFormItems } = usePageForms('org.users');
const pageConfig = getPageConfigFull('org.users');

// 使用 config.ts 中定义的服务
const services = {
  sysdept: pageConfig?.service?.sysdept,
  sysuser: usePageService('org.users', 'sysuser'),
};

// 动态表格列配置（从 config.ts 读取）
const userColumns = baseColumns;

// 动态表单配置 - 扩展以支持动态 departmentOptions
const formItems = computed(() => {
  return baseFormItems.value.map(item => {
    // 如果表单项是 deptId，添加动态 options
    if (item.prop === 'deptId') {
      return {
        ...item,
        component: {
          ...item.component,
          props: {
            ...item.component?.props,
            options: departmentOptions.value,
          },
        },
      };
    }
    return item;
  });
});

// 处理左侧数据加载
function handleLoad(data: any[]) {
  // 左侧数据加载完成，更新部门选项
  departmentOptions.value = data;
}

// 处理用户信息获取（编辑时）
async function handleUserInfo(user: any, { next, done }: any) {
  try {
    // 调用 service.info 获取用户详情
    const userDetail = await next(user);

    // 处理部门数据回填
    if (userDetail.deptId && departmentOptions.value.length > 0) {
      // 查找对应的部门对象
      const findDepartment = (options: any[], id: string): any => {
        for (const option of options) {
          if (option.value === id || option.id === id) {
            return option;
          }
          if (option.children && option.children.length > 0) {
            const found = findDepartment(option.children, id);
            if (found) return found;
          }
        }
        return null;
      };

      const department = findDepartment(departmentOptions.value, userDetail.deptId);
      if (department) {
        userDetail.deptId = department.value || department.id;
      }
    }

    done(userDetail);
  } catch (error) {
    logger.error('Failed to get user details:', error);
    done(user);
  }
}
</script>

<style lang="scss" scoped>

</style>
