import React from 'react';
import { Card, Steps, Form, Input, Button, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './index.module.css';

const { Option } = Select;
const { Step } = Steps;

/**
 * 注册页面
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [form] = Form.useForm();

  // 下一步
  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch {
      // 验证失败
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  // 提交注册
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log('注册参数:', values);
      message.success('注册成功，请登录');
      navigate('/login');
    } catch {
      // 验证失败
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.registerCard}>
        <h1 className={styles.title}>用户注册</h1>

        <Steps current={currentStep} size="small" className={styles.steps}>
          <Step title="填写信息" />
          <Step title="验证邮箱" />
          <Step title="完成注册" />
        </Steps>

        <Form
          form={form}
          layout="vertical"
          size="large"
          className={styles.form}
        >
          {currentStep === 0 && (
            <>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 4, max: 20, message: '用户名长度在4-20个字符之间' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入密码"
                />
              </Form.Item>

              <Form.Item
                name="mobile"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input
                  prefix={<MobileOutlined />}
                  placeholder="请输入手机号"
                />
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="请输入邮箱"
                />
              </Form.Item>

              <Form.Item
                name="emailCode"
                label="验证码"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <div className={styles.captchaRow}>
                  <Input placeholder="请输入邮箱验证码" />
                  <Button>获取验证码</Button>
                </div>
              </Form.Item>
            </>
          )}

          {currentStep === 2 && (
            <div className={styles.success}>
              <p>恭喜您，注册成功！</p>
              <p>请前往登录页面登录。</p>
            </div>
          )}

          <Form.Item className={styles.actions}>
            {currentStep > 0 && currentStep < 2 && (
              <Button onClick={handlePrev} style={{ marginRight: 8 }}>
                上一步
              </Button>
            )}
            {currentStep < 2 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type="primary" onClick={handleSubmit}>
                去登录
              </Button>
            )}
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          已有账号？<a href="/login">立即登录</a>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
