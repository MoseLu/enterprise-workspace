<template>
  <div class="uk-head-registration registration-form">
    <BtcStepsForm
      ref="authStepFormRef"
      :steps="stepList"
      :step-descriptions="stepDescriptions"
      :loading="submitting"
      :can-proceed="canProceed"
      @step-change="handleStepChange"
      @next-step="handleNextStep"
      @prev-step="handlePrevStep"
      @finish="handleFinish"
    >
      <!-- 步骤描述插槽 -->

      <!-- 步骤内容插槽 -->
      <template #default="{ currentStep }">
        <!-- 第一步：企业信息验证 -->
        <div v-if="currentStep === 0">
          <btc-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            class="registration-form"
          >
            <btc-form-item prop="email">
              <el-input
                v-model="formData.email"
                clearable
                class="email-input-matched"
                placeholder="请输入企业邮箱"
                type="email"
              >
                <template #prefix>
                  <el-icon>
                    <Message />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>

            <btc-form-item prop="companyName">
              <el-input
                v-model="formData.companyName"
                clearable
                placeholder="请输入企业名称"
              >
                <template #prefix>
                  <el-icon>
                    <OfficeBuilding />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>

            <btc-form-item prop="legalRepresentative">
              <el-input
                v-model="formData.legalRepresentative"
                clearable
                placeholder="请输入法人代表姓名"
              >
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>

            <btc-form-item prop="contactPhone">
              <el-input
                v-model="formData.contactPhone"
                clearable
                placeholder="请输入联系电话"
              >
                <template #prefix>
                  <el-icon>
                    <Phone />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>
          </btc-form>
        </div>

        <!-- 第二步：身份验证 -->
        <div v-else-if="currentStep === 1">
          <btc-form
            ref="adminFormRef"
            :model="adminFormData"
            :rules="adminFormRules"
            class="registration-form"
          >
            <btc-form-item prop="adminUsername">
              <el-input
                v-model="adminFormData.adminUsername"
                clearable
                placeholder="请输入管理员用户名"
              >
                <template #prefix>
                  <el-icon>
                    <User />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>

            <btc-form-item prop="adminPassword">
              <el-input
                v-model="adminFormData.adminPassword"
                type="password"
                show-password
                clearable
                placeholder="请输入管理员密码"
              >
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>

            <btc-form-item prop="confirmPassword">
              <el-input
                v-model="adminFormData.confirmPassword"
                type="password"
                show-password
                clearable
                placeholder="请再次输入密码"
              >
                <template #prefix>
                  <el-icon>
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>

            <btc-form-item prop="adminEmail">
              <el-input
                v-model="adminFormData.adminEmail"
                clearable
                placeholder="请输入管理员邮箱"
                type="email"
              >
                <template #prefix>
                  <el-icon>
                    <Message />
                  </el-icon>
                </template>
              </el-input>
            </btc-form-item>
          </btc-form>
        </div>
      </template>
    </BtcStepsForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Message, OfficeBuilding, Document, User, Phone, Lock } from '@element-plus/icons-vue';
import { BtcMessage } from '@btc/shared-components';
import BtcStepsForm from '/@/modules/base/components/btc/btc-steps-form/index.vue';
import { useInertRegistration } from '../../composables/useInertRegistration';
;


defineOptions({
  name: 'UkHeadRegistration'
});

// 使用组合式函数
const {
  authStepFormRef,
  identityFormRef,
  registerFormRef,
  currentStep,
  identityForm,
  registerForm,
  registrationStatus,
  stepList,
  stepDescriptions,
  canProceedToNext,
  validateCurrentStep,
  nextStep,
  prevStep,
  handleFinish: originalHandleFinish,
  identityRules,
  registerRules
} = useInertRegistration();

// 表单引用
const formRef = ref();
const adminFormRef = ref();

// 表单数据
const formData = ref({
  email: '',
  companyName: '',
  legalRepresentative: '',
  contactPhone: ''
});

const adminFormData = ref({
  adminUsername: '',
  adminPassword: '',
  confirmPassword: '',
  adminEmail: ''
});

// 表单验证规则
const formRules = ref({
  email: [
    { required: true, message: '请输入企业邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  companyName: [
    { required: true, message: '请输入企业名称', trigger: 'blur' },
    { min: 2, max: 50, message: '企业名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  legalRepresentative: [
    { required: true, message: '请输入法人代表姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
});

const adminFormRules = ref({
  adminUsername: [
    { required: true, message: '请输入管理员用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  adminPassword: [
    { required: true, message: '请输入管理员密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== adminFormData.value.adminPassword) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  adminEmail: [
    { required: true, message: '请输入管理员邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
});

// 处理步骤变化
const handleStepChange = (step: number) => {
  console.info('步骤变化:', step);
};

// 处理下一步
const handleNextStep = () => {
  if (currentStep.value === 0) {
    // 验证第一步表单
    formRef.value?.validate((valid: boolean) => {
      if (valid) {
        nextStep();
      }
    });
  } else if (currentStep.value === 1) {
    // 验证第二步表单
    adminFormRef.value?.validate((valid: boolean) => {
      if (valid) {
        nextStep();
      }
    });
  }
};

// 处理上一步
const handlePrevStep = () => {
  prevStep();
};

// 处理完成
const handleFinish = () => {
  // 验证所有表单
  Promise.all([
    formRef.value?.validate(),
    adminFormRef.value?.validate()
  ]).then(() => {
    // 提交注册数据
    const registrationData = {
      company: formData.value,
      admin: adminFormData.value
    };

    console.info('UK Head 注册数据:', registrationData);
    BtcMessage.success('英国总部注册成功！');

    // 调用父组件的完成处理
    originalHandleFinish();
  }).catch(() => {
    BtcMessage.error('请完善表单信息');
  });
};

// 计算属性
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return formData.value.email && formData.value.companyName &&
           formData.value.legalRepresentative && formData.value.contactPhone;
  } else if (currentStep.value === 1) {
    return adminFormData.value.adminUsername && adminFormData.value.adminPassword &&
           adminFormData.value.confirmPassword && adminFormData.value.adminEmail;
  }
  return canProceedToNext.value;
});

const submitting = computed(() => {
  return registrationStatus.value === 'submitting';
});
</script>

<style lang="scss" scoped>
.uk-head-registration {
  .registration-form {
    .el-form-item {
      margin-bottom: 20px;
    }

    .el-input {
      width: 100%;
    }

    .email-input-matched {
      border-color: var(--el-color-success);
    }
  }
}
</style>
