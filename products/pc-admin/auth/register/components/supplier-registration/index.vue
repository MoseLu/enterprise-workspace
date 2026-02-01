<template>
  <div class="supplier-registration">
    <BtcStepsForm
      ref="authStepFormRef"
      :steps="stepList"
      :step-descriptions="stepDescriptions"
      :loading="sFormSubmitting"
      :can-proceed="canProceed"
      @step-change="handleStepChange"
      @next-step="handleNextStep"
      @prev-step="handlePrevStep"
      @finish="handleFinish"
    >
      <!-- 步骤描述插槽 -->

      <!-- 步骤内容插槽 -->
      <template #default="{ currentStep }">
        <!-- 第一步：选择供应商 -->
        <div v-if="currentStep === 0">
          <div class="supplier-selection">
            <!-- 搜索框 -->
            <div class="supplier-search">
              <el-input
                v-model="supplierSearchKeyword"
                placeholder="搜索供应商名称..."
                clearable
                @input="handleSupplierSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>

            <!-- 供应商列表 -->
            <div class="supplier-list">
              <div
                v-for="supplier in filteredSuppliers"
                :key="supplier.id"
                class="supplier-item"
                :class="{ 'is-selected': isSupplierSelected(supplier) }"
                @click="selectSupplier(supplier)"
              >
                <div class="supplier-info">
                  <div class="supplier-name">{{ supplier.name }}</div>
                  <div class="supplier-description">{{ supplier.description }}</div>
                </div>
                <div class="supplier-selector">
                  <el-icon v-if="isSupplierSelected(supplier)">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二步：填写注册信息 -->
        <div v-else-if="currentStep === 1">
          <btc-form
            ref="identityFormRef"
            :model="identityForm"
            :rules="identityRules"
            label-width="120px"
          >
            <btc-form-item label="企业名称" prop="companyName">
              <el-input
                v-model="identityForm.companyName"
                placeholder="请输入企业名称"
                clearable
              />
            </btc-form-item>

            <btc-form-item label="统一社会信用代码" prop="creditCode">
              <el-input
                v-model="identityForm.creditCode"
                placeholder="请输入统一社会信用代码"
                clearable
              />
            </btc-form-item>

            <btc-form-item label="法人代表" prop="legalRepresentative">
              <el-input
                v-model="identityForm.legalRepresentative"
                placeholder="请输入法人代表姓名"
                clearable
              />
            </btc-form-item>

            <btc-form-item label="联系电话" prop="contactPhone">
              <el-input
                v-model="identityForm.contactPhone"
                placeholder="请输入联系电话"
                clearable
              />
            </btc-form-item>

            <btc-form-item label="企业地址" prop="address">
              <el-input
                v-model="identityForm.address"
                type="textarea"
                placeholder="请输入企业地址"
                :rows="3"
              />
            </btc-form-item>
          </btc-form>
        </div>

        <!-- 第三步：设置登录信息 -->
        <div v-else-if="currentStep === 2">
          <btc-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            label-width="120px"
          >
            <btc-form-item label="登录账号" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入登录账号"
                clearable
              />
            </btc-form-item>

            <btc-form-item label="登录密码" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入登录密码"
                show-password
                clearable
              />
            </btc-form-item>

            <btc-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                show-password
                clearable
              />
            </btc-form-item>

            <btc-form-item label="联系人姓名" prop="contactName">
              <el-input
                v-model="registerForm.contactName"
                placeholder="请输入联系人姓名"
                clearable
              />
            </btc-form-item>

            <btc-form-item label="联系人手机" prop="contactMobile">
              <el-input
                v-model="registerForm.contactMobile"
                placeholder="请输入联系人手机号"
                clearable
              />
            </btc-form-item>

            <btc-form-item label="邮箱地址" prop="email">
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱地址"
                clearable
              />
            </btc-form-item>
          </btc-form>
        </div>
      </template>
    </BtcStepsForm>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, Check, Message, OfficeBuilding, User, Phone, Lock } from '@element-plus/icons-vue';
import { BtcMessage } from '@btc/shared-components';
import BtcStepsForm from '/@/modules/base/components/btc/btc-steps-form/index.vue';
import { useInertRegistration } from '../../composables/useInertRegistration';
;


defineOptions({
  name: 'SupplierRegistration'
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
  handleFinish,
  identityRules,
  registerRules
} = useInertRegistration();

// 供应商相关数据
const supplierSearchKeyword = ref('');
const selectedSupplier = ref(null);

// 模拟供应商数据
const suppliers = ref([
  {
    id: 1,
    name: '阿里巴巴集团',
    description: '全球领先的数字经济体'
  },
  {
    id: 2,
    name: '腾讯科技',
    description: '连接一切的互联网服务'
  },
  {
    id: 3,
    name: '百度公司',
    description: '全球领先的人工智能公司'
  },
  {
    id: 4,
    name: '字节跳动',
    description: '全球化的互联网技术公司'
  },
  {
    id: 5,
    name: '美团',
    description: '中国领先的生活服务电子商务平台'
  }
]);

// 过滤后的供应商列表
const filteredSuppliers = computed(() => {
  if (!supplierSearchKeyword.value) {
    return suppliers.value;
  }
  return suppliers.value.filter(supplier =>
    supplier.name.toLowerCase().includes(supplierSearchKeyword.value.toLowerCase()) ||
    supplier.description.toLowerCase().includes(supplierSearchKeyword.value.toLowerCase())
  );
});

// 检查供应商是否被选中
const isSupplierSelected = (supplier: any) => {
  return selectedSupplier.value?.id === supplier.id;
};

// 选择供应商
const selectSupplier = (supplier: any) => {
  selectedSupplier.value = supplier;
  BtcMessage.success(`已选择供应商：${supplier.name}`);
};

// 处理供应商搜索
const handleSupplierSearch = () => {
  // 搜索逻辑已在 computed 中处理
};

// 处理步骤变化
const handleStepChange = (step: number) => {
  console.info('步骤变化:', step);
};

// 处理下一步
const handleNextStep = () => {
  if (currentStep.value === 0) {
    // 第一步：检查是否选择了供应商
    if (!selectedSupplier.value) {
      BtcMessage.warning('请先选择一个供应商');
      return;
    }
  }

  // 验证当前步骤
  if (validateCurrentStep()) {
    nextStep();
  }
};

// 处理上一步
const handlePrevStep = () => {
  prevStep();
};

// 计算属性
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return !!selectedSupplier.value;
  }
  return canProceedToNext.value;
});

const sFormSubmitting = computed(() => {
  return registrationStatus.value === 'submitting';
});
</script>

<style lang="scss" scoped>
.supplier-registration {
  .supplier-selection {
    .supplier-search {
      margin-bottom: 20px;
    }

    .supplier-list {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid var(--el-border-color-light);
      border-radius: 4px;
    }

    .supplier-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &:last-child {
        border-bottom: none;
      }

      &.is-selected {
        background-color: var(--el-color-primary-light-8);
        border-color: var(--el-color-primary);
      }

      .supplier-info {
        flex: 1;

        .supplier-name {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .supplier-description {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
      }

      .supplier-selector {
        color: var(--el-color-primary);
        font-size: 18px;
      }
    }
  }
}
</style>
