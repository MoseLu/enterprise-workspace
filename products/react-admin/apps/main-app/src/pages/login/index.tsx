import React, { useState } from 'react';
import { Form, Input, Button, Tabs, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import styles from './index.module.css';

const { TabPane } = Tabs;

/**
 * 登录页面
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 处理账号密码登录
  const handlePasswordLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // TODO: 调用登录 API
      console.log('登录参数:', values);

      // 模拟登录成功
      login('mock-token', {
        id: '1',
        username: values.username,
        name: '测试用户',
        roles: ['admin'],
      });

      message.success('登录成功');
      navigate('/');
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理手机号登录
  const handleMobileLogin = async (values: { mobile: string; captcha: string }) => {
    setLoading(true);
    try {
      console.log('手机号登录参数:', values);
      message.success('登录成功');
      navigate('/');
    } catch (error: unknown) {
      const err = error as Error;
      message.error(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>拜里斯科技</h1>
          <p className={styles.subtitle}>企业工作平台</p>
        </div>

        <Tabs defaultActiveKey="1" centered className={styles.tabs}>
          <TabPane
            tab={
              <span>
                <UserOutlined />
                账号登录
              </span>
            }
            key="1"
          >
            <Form
              form={form}
              name="password-login"
              onFinish={handlePasswordLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined className={styles.inputIcon} />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className={styles.inputIcon} />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane
            tab={
              <span>
                <MobileOutlined />
                手机登录
              </span>
            }
            key="2"
          >
            <Form
              form={form}
              name="mobile-login"
              onFinish={handleMobileLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="mobile"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input
                  prefix={<MobileOutlined className={styles.inputIcon} />}
                  placeholder="手机号"
                />
              </Form.Item>

              <Form.Item
                name="captcha"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <div className={styles.captchaRow}>
                  <Input
                    prefix={<SafetyCertificateOutlined className={styles.inputIcon} />}
                    placeholder="验证码"
                  />
                  <Button>获取验证码</Button>
                </div>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        <Divider plain>其他登录方式</Divider>

        <div className={styles.thirdPartyLogin}>
          <Button shape="circle" size="large">
            微信
          </Button>
          <Button shape="circle" size="large">
            钉钉
          </Button>
          <Button shape="circle" size="large">
            企业微信
          </Button>
        </div>

        <div className={styles.footer}>
          <a href="/register">立即注册</a>
          <span className={styles.divider}>|</span>
          <a href="/forget-password">忘记密码</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
