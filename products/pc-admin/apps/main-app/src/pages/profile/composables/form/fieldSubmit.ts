import type { Ref } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { service } from '@services/eps';
import { appStorage } from '@/utils/app-storage';

interface FieldSubmitContext {
  userInfo: Ref<any>;
}

interface SubmitResult {
  success: boolean;
  message?: string;
}

function getProfileService() {
  return service.admin?.base?.profile;
}

async function submitPhone(data: any, context: FieldSubmitContext): Promise<SubmitResult> {
  const originalPhone = context.userInfo.value.phone;
  const hasOriginalPhone = originalPhone && originalPhone !== '-' && originalPhone.trim() !== '';
  const newPhone = data.phone || '';

  if (!newPhone || newPhone.trim() === '') {
    BtcMessage.warning('手机号不能为空');
    return { success: false };
  }

  if (hasOriginalPhone && newPhone.trim() === '') {
    BtcMessage.warning('手机号不能为空，只能换绑，不能删除');
    return { success: false };
  }

  if (!data.smsCode || data.smsCode.length !== 6) {
    BtcMessage.warning('请输入6位验证码');
    return { success: false };
  }

  const phoneService = service.admin?.base?.phone;
  if (!phoneService?.update) {
    BtcMessage.warning('手机号服务不可用');
    return { success: false };
  }

  await phoneService.update({
    phone: data.phone,
    smsCode: data.smsCode,
    smsType: 'bind'
  });

  return { success: true, message: '保存成功' };
}

async function submitEmail(data: any, context: FieldSubmitContext): Promise<SubmitResult> {
  const originalEmail = context.userInfo.value.email;
  const hasOriginalEmail = originalEmail && originalEmail !== '-' && originalEmail.trim() !== '';
  const newEmail = data.email || '';

  if (!newEmail || newEmail.trim() === '') {
    BtcMessage.warning('邮箱不能为空');
    return { success: false };
  }

  if (hasOriginalEmail && newEmail.trim() === '') {
    BtcMessage.warning('邮箱不能为空，只能换绑，不能删除');
    return { success: false };
  }

  if (!data.emailCode || data.emailCode.length !== 6) {
    BtcMessage.warning('请输入6位验证码');
    return { success: false };
  }

  const emailService = service.admin?.base?.email;
  if (!emailService?.update) {
    BtcMessage.warning('邮箱服务不可用');
    return { success: false };
  }

  await emailService.update({
    email: data.email,
    code: data.emailCode,
    scene: 'bind',
    type: 'bind'
  });

  return { success: true, message: '保存成功' };
}

async function submitPassword(data: any): Promise<SubmitResult> {
  if (!data.initPass || data.initPass.trim() === '') {
    BtcMessage.warning('密码不能为空');
    return { success: false };
  }

  if (data.initPass !== data.confirmPassword) {
    BtcMessage.warning('两次输入的密码不一致');
    return { success: false };
  }

  const profileService = getProfileService();
  if (!profileService?.password) {
    BtcMessage.warning('用户信息服务不可用');
    return { success: false };
  }

  const response = await profileService.password({
    initPass: data.initPass
  });

  const message = (response as any)?.msg || '密码已更新，请重新登录';
  return { success: true, message };
}

async function submitGeneric(field: string, data: any, context: FieldSubmitContext): Promise<SubmitResult> {
  const profileService = getProfileService();
  if (!profileService?.update) {
    BtcMessage.warning('用户信息服务不可用');
    return { success: false };
  }

  const updatePayload: any = {
    id: context.userInfo.value.id
  };
  updatePayload[field] = data[field];

  await profileService.update(updatePayload);

  if (field === 'name' && data.name) {
    appStorage.user.setName(data.name);
    const { useUser } = await import('@/composables/useUser');
    const { getUserInfo, setUserInfo } = useUser();
    const currentUser = getUserInfo();
    if (currentUser) {
      setUserInfo({
        ...currentUser,
        name: data.name
      });
    }

    window.dispatchEvent(new CustomEvent('userInfoUpdated', {
      detail: {
        name: data.name,
        avatar: context.userInfo.value.avatar
      }
    }));
  }

  return { success: true, message: '保存成功' };
}

export async function submitFieldUpdate(
  field: string,
  data: any,
  context: FieldSubmitContext
): Promise<SubmitResult> {
  const profileService = getProfileService();
  if (!profileService) {
    BtcMessage.warning('用户信息服务不可用');
    return { success: false };
  }

  if (field === 'phone') {
    return submitPhone(data, context);
  }

  if (field === 'email') {
    return submitEmail(data, context);
  }

  if (field === 'initPass') {
    return submitPassword(data);
  }

  return submitGeneric(field, data, context);
}

