import React from 'react';
import { Card, Avatar, Descriptions, Tabs, Form, Input, Button, message, Upload } from 'antd';
import { UserOutlined, UploadOutlined, LockOutlined, BellOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/auth';
import styles from './index.module.css';

const { TabPane } = Tabs;

/**
 * 个人中心页面
 */
const ProfilePage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [form] = Form.useForm();

  // 保存个人信息
  const handleSaveProfile = async () => {
    try {
      const values = await form.validateFields();
      message.success('保存成功');
    } catch {
      // 验证失败
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.profileCard}>
        <div className={styles.header}>
          <Avatar size={80} icon={<UserOutlined />} />
          <h2 className={styles.name}>{user?.name || '用户'}</h2>
          <p className={styles.username}>@{user?.username}</p>
        </div>

        <Tabs defaultActiveKey="1" className={styles.tabs}>
          <TabPane
            tab={
              <span>
                <UserOutlined />
                基本信息
              </span>
            }
            key="1"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                name: user?.name,
                email: 'user@example.com', // TODO: 从 API 获取
                phone: '13800138000', // TODO: 从 API 获取
              }}
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>

              <Form.Item name="avatar" label="头像">
                <Upload showUploadList={false}>
                  <Button icon={<UploadOutlined />}>上传头像</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" onClick={handleSaveProfile}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <LockOutlined />
                修改密码
              </span>
            }
            key="2"
          >
            <Form layout="vertical" style={{ maxWidth: 400 }}>
              <Form.Item
                name="oldPassword"
                label="原密码"
                rules={[{ required: true, message: '请输入原密码' }]}
              >
                <Input.Password placeholder="请输入原密码" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="请再次输入新密码" />
              </Form.Item>

              <Form.Item>
                <Button type="primary">修改密码</Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <BellOutlined />
                消息通知
              </span>
            }
            key="3"
          >
            <p>消息通知设置</p>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProfilePage;
