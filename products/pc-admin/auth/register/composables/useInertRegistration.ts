;
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BtcMessage } from '@btc/shared-components';
import { useBase } from '/$/base';
import { request } from '/@/btc/service/request';
import {
  createIdentityForm,
  createIdentityRules,
  createIdentityVerifier,
  createRegisterForm,
  createRegisterRules,
  createRegisterSmsSender,
  createFieldDisabled,
  createRegisterHandler,
  createRegistrationSteps,
  createStepDescriptions,
  createRegistrationStepState,
  fillEmployeeInfo,
  createInertRegistrationStepValidator,
  useStepValidation,
  type EmployeeInfo
} from './utils';
import { createITLRegistrationSteps, createITLStepDescriptions } from './utils/steps';

export function useInertRegistration() {
  const { app } = useBase();
  const { t } = useI18n();

  // 步骤配置 - ITL简化为两步
  const stepList = ref(createITLRegistrationSteps());
  const stepDescriptions = ref(createITLStepDescriptions());

  // 步骤状态管理 - ITL简化为两步
  const {
    currentStep,
    nextStep,
    prevStep,
    setStep,
    resetStep,
    registrationStatus,
    setRegistrationStatus,
  } = createRegistrationStepState(2);

  // 步骤验证器
  const stepValidator = createInertRegistrationStepValidator();
  const { validateCurrentStep, canProceed: canProceedToNext } = useStepValidation(stepValidator);

  // 身份验证
  const { form: identityForm } = createIdentityForm();
  const identityRules = createIdentityRules();

  // 注册表单
  const { form: registerForm } = createRegisterForm();

  // 注册状态管理
  const registrationError = ref('');
  const registrationProgress = ref(0);
  const sessionId = ref('');

  const { verifying, verifyError, employeeInfo, verifyIdentity } = createIdentityVerifier(
    identityForm,
    (info: EmployeeInfo) => {
      // 身份验证成功后的回调
      sessionId.value = info.sessionId; // 保存会话ID
      fillEmployeeInfo(registerForm, info);
      authStepFormRef.value?.nextStep();
    }
  );
  const registerRules = createRegisterRules(registerForm);
  const fieldDisabled = createFieldDisabled(registerForm);

  // 内网员工不需要短信发送逻辑，仅保留引用以避免模板错误
  const smsCountdown = ref(0);
  const sendingSms = ref(false);
  const canSendSms = ref(false);

  const sendSmsCode = async () => {
    // 内网员工注册不使用短信验证
    BtcMessage.warning('内网员工注册不需要验证码');
  };

  // 注册处理
  const { registering, handleRegister } = createRegisterHandler(
    registerForm,
    () => sessionId.value, // 动态获取会话ID
    () => {
      // 注册成功后的回调
      setRegistrationStatus('success');
      authStepFormRef.value?.nextStep();
    },
    (error: any) => {
      // 注册失败后的回调
      console.error('注册失败:', error);
      registrationError.value = error.msg || error.message || '注册过程中发生错误';
      setRegistrationStatus('failed');
    }
  );

  // 表单引用
  const authStepFormRef = ref();
  const identityFormRef = ref();
  const registerFormRef = ref();

  // 重试注册
  const retryRegistration = async () => {
    setRegistrationStatus('pending');
    registrationError.value = '';
    registrationProgress.value = 0;
    await handleRegister();
  };

  // 取消注册
  const cancelRegistration = () => {
    setRegistrationStatus('pending');
    registrationProgress.value = 0;
    // 返回上一步
    authStepFormRef.value?.prevStep();
  };

  // 内网员工注册的步骤处理逻辑
  const canProceed = computed(() => {
    if (currentStep.value === 0) {
      // 第一步：验证员工工号和初始密码
      return !!(identityForm.empId && identityForm.initPassword);
    }
    return true; // 第二步直接通过
  });

  // 步骤处理函数
  const handleStepChange = (step: number) => {
    setStep(step);
  };

  const handleNextStep = async () => {
    if (currentStep.value === 0) {
      // 第一步：验证员工工号和初始密码
      if (!identityForm.empId || !identityForm.initPassword) {
        BtcMessage.error('请填写完整信息');
        return;
      }

      verifying.value = true;
      try {
        // 验证员工信息
        const response = await request({
          url: '/base/open/verifyEmployee',
          method: 'POST',
          data: {
            empId: identityForm.empId,
            initPassword: identityForm.initPassword
          }
        });

        if (response.code === 2000) {
          BtcMessage.success('员工信息验证成功');
          // 保存会话ID和员工信息
          if (response.data) {
            sessionId.value = response.data.sessionId || '';
            if (response.data.employeeInfo) {
              fillEmployeeInfo(registerForm, response.data.employeeInfo);
            }
          }
          nextStep(); // 进入第二步
        } else {
          BtcMessage.error(response.msg || '员工信息验证失败');
        }
      } catch (error: any) {
        BtcMessage.error(error.message || '员工信息验证失败');
      } finally {
        verifying.value = false;
      }
    } else if (currentStep.value === 1) {
      // 第二步：提交注册申请
      try {
        await request({
          url: '/base/open/submitRegistration',
          method: 'POST',
          data: {
            empId: identityForm.empId,
            sessionId: sessionId.value,
            type: 'inert',
            ...registerForm
          }
        });

        BtcMessage.success('注册申请已提交，请等待管理员审核');
        nextStep();
      } catch (error: any) {
        BtcMessage.error(error.message || '提交失败');
      }
    }
  };

  const handlePrevStep = () => {
    authStepFormRef.value?.prevStep();
  };

  const handleFinish = () => {
    // 完成注册后的处理
    console.info('注册完成');
  };

  return {
    // 步骤配置
    stepList,
    stepDescriptions,

    // 步骤状态
    currentStep,
    nextStep,
    prevStep,
    setStep,
    resetStep,

    // 注册状态
    registrationStatus,
    registrationError,
    registrationProgress,

    // 身份验证
    identityForm,
    identityRules,
    verifying,
    verifyError,
    employeeInfo,
    verifyIdentity,

    // 注册表单
    registerForm,
    registerRules,
    fieldDisabled,

    // 短信
    smsCountdown,
    sendingSms,
    canSendSms,
    sendSmsCode,

    // 注册处理
    registering,

    // 计算属性
    canProceed,

    // 步骤处理
    handleStepChange,
    handleNextStep,
    handlePrevStep,
    handleFinish,

    // 重试和取消
    retryRegistration,
    cancelRegistration,

    // 表单引用
    authStepFormRef,
    identityFormRef,
    registerFormRef,

    // 国际化
    t,

    // 应用信息
    app
  };
}
