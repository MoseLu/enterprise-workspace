<template>
  <div class="inert-registration registration-form">
    <BtcStepsForm
      ref="authStepFormRef"
      :steps="viewModel.stepList.value"
      :step-descriptions="viewModel.stepDescriptions.value"
      :loading="viewModel.verifying.value || viewModel.registering.value"
      :can-proceed="viewModel.canProceed.value"
      :registration-status="viewModel.registrationStatus.value"
      @step-change="viewModel.handleStepChange"
      @next-step="viewModel.handleNextStep"
      @prev-step="viewModel.handlePrevStep"
      @finish="viewModel.handleFinish"
    >

      <!-- 步骤内容插槽 -->
      <template #default="{ currentStep }">
        <!-- 第一步：企业身份验证 -->
        <div v-if="currentStep === 0">
          <btc-form
            ref="viewModel.identityFormRef"
            :model="viewModel.identityForm"
            :rules="viewModel.identityRules"
            label-position="left"
            class="identity-form"
          >
            <btc-form-item
              :min-col-width="300"
              :gap="16"
              label-mode="auto"
            >
              <btc-form-item label="员工工号" prop="empId">
                <el-input
                  v-model="viewModel.identityForm.empId"
                  placeholder="请输入员工工号"
                  clearable
                />
              </btc-form-item>

              <btc-form-item label="初始密码" prop="initPassword">
                <el-input
                  v-model="viewModel.identityForm.initPassword"
                  type="password"
                  placeholder="请输入初始密码"
                  show-password
                  clearable
                />
              </btc-form-item>
            </btc-form-item>
          </btc-form>
        </div>

        <!-- 第二步：设置登录信息 -->
        <div v-else-if="currentStep === 1">
          <btc-form
            ref="viewModel.registerFormRef"
            :model="viewModel.registerForm"
            :rules="viewModel.registerRules"
            label-position="left"
            class="register-form"
          >
            <btc-form-item
              :min-col-width="300"
              :gap="16"
              label-mode="auto"
            >
              <btc-form-item label="登录账号" prop="username">
                <el-input
                  v-model="viewModel.registerForm.username"
                  placeholder="请输入登录账号"
                  clearable
                />
              </btc-form-item>

              <btc-form-item label="登录密码" prop="password">
                <el-input
                  v-model="viewModel.registerForm.password"
                  type="password"
                  placeholder="请输入登录密码"
                  show-password
                  clearable
                />
              </btc-form-item>

              <btc-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="viewModel.registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  show-password
                  clearable
                />
              </btc-form-item>

              <btc-form-item label="真实姓名" prop="realName">
                <el-input
                  v-model="viewModel.registerForm.realName"
                  placeholder="请输入真实姓名"
                  clearable
                />
              </btc-form-item>

              <btc-form-item label="手机号码" prop="mobile">
                <el-input
                  v-model="viewModel.registerForm.mobile"
                  placeholder="请输入手机号码"
                  clearable
                />
              </btc-form-item>
            </btc-form-item>
          </btc-form>
        </div>
      </template>
    </BtcStepsForm>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import BtcStepsForm from '/@/modules/base/components/btc/btc-steps-form/index.vue';
import { useInertRegistration } from '../../composables/useInertRegistration';
;


defineOptions({
  name: 'InertRegistration'
});

// 使用组合式函数
const viewModel = useInertRegistration();

// 组件挂载后的初始化
onMounted(() => {
  console.info('INERT 注册组件已挂载');
});
</script>

<style lang="scss" scoped>
.inert-registration {
  .registration-form {
    .identity-form,
    .register-form {
      .btc-form-item {
        margin-bottom: 20px;
      }

      .el-form-item {
        margin-bottom: 16px;
      }

      .el-input {
        width: 100%;
      }
    }
  }
}
</style>
