import React, { useState } from 'react';
import { Card, Typography, Form, Input, Select, DatePicker, Button, Table, Space, Row, Col } from 'antd';
import { Search, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LogQueryParams {
  appId?: string;
  messageKeyword?: string;
  timeRange?: [dayjs.Dayjs, dayjs.Dayjs];
  logLevel?: string;
}

const LogQuery: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleReset = () => {
    form.resetFields();
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },
    {
      title: '应用名称',
      dataIndex: 'appName',
      key: 'appName',
      width: 120,
    },
    {
      title: '日志级别',
      dataIndex: 'logLevel',
      key: 'logLevel',
      width: 100,
    },
    {
      title: '日志名称',
      dataIndex: 'loggerName',
      key: 'loggerName',
      width: 150,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      minWidth: 200,
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
  ];

  const data: any[] = [];

  return (
    <div className="page">
      <Card title="日志查询">
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="应用名称" name="appId">
                <Select placeholder="请选择应用名称" allowClear>
                  <Select.Option value="system-app">系统应用</Select.Option>
                  <Select.Option value="admin-app">管理应用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="消息关键词" name="messageKeyword">
                <Input placeholder="请输入消息关键词" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="时间范围" name="timeRange">
                <RangePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="日志级别" name="logLevel">
                <Select placeholder="请选择日志级别" allowClear>
                  <Select.Option value="error">错误</Select.Option>
                  <Select.Option value="warn">警告</Select.Option>
                  <Select.Option value="info">信息</Select.Option>
                  <Select.Option value="debug">调试</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button type="primary" icon={<Search />} onClick={handleSearch}>
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Row>
        </Form>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="key"
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>
    </div>
  );
};

export default LogQuery;
