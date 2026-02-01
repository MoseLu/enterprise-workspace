<template>
  <div class="auth-page">
    <!-- 背景装饰组件 -->
    <div class="bg">
      <btc-svg name="bg"></btc-svg>
    </div>

    <!-- 忘记密码卡片 -->
    <div class="auth-card login-card">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div class="title">
          <div class="logo">
            <img src="/icons/android-chrome-192x192.png" alt="BTC Admin Logo" />
          </div>
          <h1>{{ viewModel.app.info.name }}</h1>
        </div>

        <!-- 右上角登录链接 -->
        <a href="/login" class="login-link">
          {{ viewModel.t('返回登录') }}
          <el-icon class="arrow-right">
            <ArrowRight />
          </el-icon>
        </a>
      </div>

      <!-- 忘记密码主要内容 -->
      <div class="card-content">
        <div class="registration-form">
          <BtcStepsForm
            ref="authStepFormRef"
            :steps="viewModel.stepList"
            :step-descriptions="viewModel.stepDescriptions"
            :loading="viewModel.loading.value"
            :can-proceed="viewModel.canReset.value"
            @step-change="viewModel.handleStepChange"
            @next-step="viewModel.handleNextStep"
            @prev-step="viewModel.handlePrevStep"
            @finish="viewModel.handleFinish"
          >
            <!-- 步骤描述插槽 -->
            <template #step-description="{ currentStep }">
              <p v-if="currentStep === 0" class="el-text el-text--placeholder">请输入手机号并获取验证码进行验证</p>
              <p v-if="currentStep === 1" class="el-text el-text--placeholder">请输入新密码，确保密码安全可靠</p>
            </template>

            <!-- 表单内容插槽 -->
            <template #default="{ currentStep }">
              <!-- 第一步：验证手机号表单（手机号+验证码） -->
              <div v-if="currentStep === 0">
                <btc-form
                  ref="phoneFormRef"
                  :model="viewModel.phoneForm"
                  :rules="viewModel.phoneRules"
                  label-position="left"
                  class="phone-form"
                >
                  <el-form-item prop="phone">
                    <el-input
                      v-model="viewModel.phoneForm.phone"
                      placeholder="请输入手机号"
                      clearable
                      maxlength="11"
                    >
                      <template #prefix>
                        <el-icon><Phone /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item prop="smsCode">
                    <el-input
                      v-model="viewModel.phoneForm.smsCode"
                      placeholder="请输入验证码"
                      maxlength="6"
                      clearable
                    >
                      <template #suffix>
                        <el-button
                          type="primary"
                          size="small"
                          :disabled="viewModel.smsCountdown.value > 0"
                          @click="viewModel.sendSmsCode"
                        >
                          {{ viewModel.smsCountdown.value > 0 ? `${viewModel.smsCountdown.value}s` : '获取验证码' }}
                        </el-button>
                      </template>
                    </el-input>
                  </el-form-item>
                </btc-form>
              </div>

              <!-- 第二步：设置新密码表单 -->
              <div v-else-if="currentStep === 1">
                <btc-form
                  ref="passwordFormRef"
                  :model="viewModel.passwordForm"
                  :rules="viewModel.passwordRules"
                  label-position="left"
                  class="password-form"
                >
                  <el-form-item prop="newPassword">
                    <el-input
                      v-model="viewModel.passwordForm.newPassword"
                      type="password"
                      placeholder="请输入新密码"
                      show-password
                      clearable
                    >
                      <template #prefix>
                        <el-icon><Lock /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item prop="confirmPassword">
                    <el-input
                      v-model="viewModel.passwordForm.confirmPassword"
                      type="password"
                      placeholder="请再次输入新密码"
                      show-password
                      clearable
                    >
                      <template #prefix>
                        <el-icon><Lock /></el-icon>
                      </template>
                    </el-input>
                  </el-form-item>
                </btc-form>
              </div>
            </template>
          </BtcStepsForm>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="card-footer">
        <div class="step-actions">
            <!-- 每个步骤的按钮 -->
          <div class="action-buttons">
            <el-button
              v-if="viewModel.currentStep.value > 0"
              type="default"
              @click="viewModel.handlePrevStep"
            >
              上一步
            </el-button>

            <el-button
              v-if="viewModel.currentStep.value < viewModel.stepList.length - 1"
              type="primary"
              :loading="viewModel.loading.value"
              :disabled="!viewModel.canReset.value"
              @click="viewModel.handleNextStep"
            >
              下一步
            </el-button>

            <el-button
              v-if="viewModel.currentStep.value === viewModel.stepList.length - 1"
              type="primary"
              :loading="viewModel.loading.value"
              :disabled="!viewModel.canReset.value"
              @click="viewModel.handleFinish"
            >
              重置密码
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { ArrowRight, Phone, Lock } from '@element-plus/icons-vue';
import BtcStepsForm from '/@/modules/base/components/btc/btc-steps-form/index.vue';
import { useForgetPassword } from '../composables/useForgetPassword';
;


defineOptions({
  name: 'ForgetPasswordMain'
});

// 使用忘记密码组合式函数
const viewModel = useForgetPassword();

// 组件挂载后的初始化
onMounted(() => {
  console.info('忘记密码组件已挂载');
});
</script>

<style lang="scss" scoped>
@use '/@/modules/base/pages/auth/shared/styles/auth.scss';

.auth-page {
  .auth-card {
    .card-content {
      .registration-form {
        .phone-form,
        .password-form {
          .el-form-item {
            margin-bottom: 20px;
          }

          .el-input {
            width: 100%;
          }
        }
      }
    }

    .card-footer {
      .step-actions {
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 12px;
          padding: 20px;

          .el-button {
            min-width: 100px;
          }
        }
      }
    }
  }
}
</style>
