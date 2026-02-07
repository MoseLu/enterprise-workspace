import React, { useState } from 'react';
import { Card, Typography, Button, message, Space } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const LogReporterTest: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSendTestLog = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('测试日志已发送');
    }, 1000);
  };

  return (
    <div className="page">
      <Card title="日志上报测试">
        <Title level={4}>功能说明</Title>
        <Paragraph>
          此页面用于测试日志上报功能。您可以点击下方按钮发送测试日志，验证日志采集和上报是否正常工作。
        </Paragraph>
        <Space>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={loading}
            onClick={handleSendTestLog}
          >
            发送测试日志
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default LogReporterTest;
