;
import type { Ref } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { service } from '@services/eps';
import { appStorage } from '@/utils/app-storage';
import { logger } from '@btc/shared-core';

interface FormEditorOptions {
  Form: Ref<any>;
  formItems: Ref<any[]>;
  userInfo: Ref<any>;
  showFullInfo: Ref<boolean>;
  loadUserInfo: (showFull: boolean) => Promise<void>;
  resetEmailUpdateCountdown: () => void;
}

export function useFormEditor({
  Form,
  formItems,
  userInfo,
  showFullInfo,
  loadUserInfo,
  resetEmailUpdateCountdown
}: FormEditorOptions) {
  const openEditForm = () => {
    resetEmailUpdateCountdown();
    Form.value?.open({
      title: '编辑个人信息',
      width: '800px',
      form: {
        id: userInfo.value.id || '',
        realName: userInfo.value.realName || '',
        name: userInfo.value.name || '',
        employeeId: userInfo.value.employeeId || '',
        position: userInfo.value.position || '',
        email: userInfo.value.email || '',
        phone: userInfo.value.phone || '',
        avatar: userInfo.value.avatar || '',
        initPass: ''
      },
      items: formItems.value,
      props: {
        labelWidth: '100px',
        labelPosition: 'top'
      },
      op: {
        buttons: ['save', 'close']
      },
      on: {
        submit: async (data: any, { close, done }: { close: () => void; done: () => void }) => {
          try {
            const profileService = service.admin?.base?.profile;
            if (!profileService) {
              BtcMessage.warning('用户信息服务不可用');
              done();
              return;
            }

            const updateData: any = { ...data };

            if (updateData.phone !== undefined) {
              const originalPhone = userInfo.value.phone;
              const hasOriginalPhone = originalPhone && originalPhone !== '-' && originalPhone.trim() !== '';
              const newPhone = updateData.phone || '';

              if (hasOriginalPhone && newPhone.trim() === '') {
                BtcMessage.warning('手机号不能为空，只能换绑，不能删除');
                done();
                return;
              }

              if (newPhone !== originalPhone && newPhone.trim() !== '') {
                const phoneService = service.admin?.base?.phone;
                if (!phoneService?.update) {
                  BtcMessage.warning('手机号服务不可用');
                  done();
                  return;
                }
                await phoneService.update({
                  phone: newPhone,
                  ...(updateData.smsCode ? { smsCode: updateData.smsCode } : {}),
                  smsType: 'bind'
                });
              }
              delete updateData.phone;
              if (updateData.smsCode) {
                delete updateData.smsCode;
              }
            }

            if (updateData.email !== undefined) {
              const originalEmail = userInfo.value.email;
              const hasOriginalEmail = originalEmail && originalEmail !== '-' && originalEmail.trim() !== '';
              const newEmail = updateData.email || '';

              if (hasOriginalEmail && newEmail.trim() === '') {
                BtcMessage.warning('邮箱不能为空，只能换绑，不能删除');
                done();
                return;
              }

              if (newEmail !== originalEmail && newEmail.trim() !== '') {
                const emailService = service.admin?.base?.email;
                if (!emailService?.update) {
                  BtcMessage.warning('邮箱服务不可用');
                  done();
                  return;
                }
                await emailService.update({
                  email: newEmail,
                  ...(updateData.emailCode ? { code: updateData.emailCode } : {}),
                  scene: 'bind',
                  type: 'bind'
                });
              }
              delete updateData.email;
              if (updateData.emailCode) {
                delete updateData.emailCode;
              }
            }

            if (updateData.initPass && updateData.initPass.trim() !== '') {
              await profileService.password({
                initPass: updateData.initPass
              });
              delete updateData.initPass;
              if (updateData.confirmPassword) {
                delete updateData.confirmPassword;
              }
            }

            if (Object.keys(updateData).length > 1 || (Object.keys(updateData).length === 1 && !updateData.id)) {
              await profileService.update(updateData);
            }

            if (data.avatar) {
              appStorage.user.setAvatar(data.avatar);
            }
            if (data.name) {
              appStorage.user.setName(data.name);
            }

            const { useUser } = await import('@/composables/useUser');
            const { getUserInfo, setUserInfo } = useUser();
            const currentUser = getUserInfo();
            if (currentUser) {
              setUserInfo({
                ...currentUser,
                ...(data.avatar && { avatar: data.avatar }),
                ...(data.name && { name: data.name }),
                ...(data.position && { position: data.position })
              });
            }

            window.dispatchEvent(new CustomEvent('userInfoUpdated', {
              detail: {
                avatar: data.avatar || userInfo.value.avatar,
                name: data.name || userInfo.value.name
              }
            }));

            BtcMessage.success('保存成功');
            close();
            resetEmailUpdateCountdown();
            await loadUserInfo(showFullInfo.value);
          } catch (error: any) {
            logger.error('保存用户信息失败:', error);
            BtcMessage.error(error?.message || '保存失败');
            done();
          }
        }
      }
    });
  };

  const handleEdit = async () => {
    openEditForm();
  };

  return {
    handleEdit
  };
}

