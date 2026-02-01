;
import type { Ref } from 'vue';
import { BtcMessage } from '@btc/shared-components';
import { service } from '@services/eps';
import { logger } from '@btc/shared-core';

interface AvatarEditorOptions {
  Form: Ref<any>;
  userInfo: Ref<any>;
  showFullInfo: Ref<boolean>;
  loadUserInfo: (showFull: boolean) => Promise<void>;
}

export function useAvatarEditor({
  Form,
  userInfo,
  showFullInfo,
  loadUserInfo
}: AvatarEditorOptions) {
  const openAvatarEditForm = () => {
    Form.value?.open({
      title: '编辑头像',
      width: '500px',
      form: {
        id: userInfo.value.id || '',
        avatar: userInfo.value.avatar || ''
      },
      items: [
        {
          prop: 'avatar',
          label: '头像',
          span: 24,
          component: {
            name: 'btc-upload',
            props: {
              type: 'image',
              uploadType: 'avatar',
              text: '选择头像',
              size: [100, 100],
              limitSize: 5
            }
          }
        }
      ],
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

            await profileService.update({
              id: userInfo.value.id,
              avatar: data.avatar
            });

            BtcMessage.success('保存成功');
            close();
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

  const handleEditAvatar = async () => {
    openAvatarEditForm();
  };

  return {
    handleEditAvatar
  };
}

