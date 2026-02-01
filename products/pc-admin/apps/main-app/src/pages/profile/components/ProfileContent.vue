<template>
  <div class="profile-content">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="姓名" label-class-name="profile-label">
        <span class="profile-value">{{ userInfo.realName || userInfo.name || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="英文名" label-class-name="profile-label">
        <span class="profile-value">{{ userInfo.name || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="工号" label-class-name="profile-label">
        <span class="profile-value">{{ userInfo.employeeId || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="职位" label-class-name="profile-label">
        <span class="profile-value">{{ userInfo.position || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="邮箱" label-class-name="profile-label">
        <span class="profile-value">{{ userInfo.email || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="手机号" label-class-name="profile-label">
        <span class="profile-value">{{ userInfo.phone || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="密码" label-class-name="profile-label">
        <span class="profile-value">{{ userInfo.initPass ? '已设置' : '未设置' }}</span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProfileContent'
});

defineProps<{
  userInfo: any;
}>();
</script>

<style lang="scss" scoped>
.profile-content {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  :deep(.el-descriptions) {
    .el-descriptions__table {
      table-layout: fixed;
      width: 100%;

      .el-descriptions__cell {
        &.profile-label {
          width: 120px;
          min-width: 120px;
          max-width: 120px;
          text-align: right;
          padding-right: 16px;
          font-weight: 500;
        }

        &.el-descriptions__content {
          min-width: 0;
          word-break: break-all;
          overflow-wrap: break-word;
        }
      }
    }
  }

  .profile-value {
    display: inline-block;
    min-width: 0;
    word-break: break-all;
    overflow-wrap: break-word;
  }
}
</style>

