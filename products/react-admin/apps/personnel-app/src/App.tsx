import { Layout, Typography, Card, Row, Col, Statistic, Table, Tag } from 'antd';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          人事应用 - Personnel App
        </Title>
      </Header>
      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        <Title level={2}>欢迎使用人事管理</Title>
        <Paragraph>
          此应用已从 Vue3 + Element Plus 迁移到 React + Ant Design。
        </Paragraph>
        <Paragraph>
          源路径: products/pc-admin/apps/personnel-app
        </Paragraph>
        <Paragraph>
          目标路径: products/react-admin/apps/personnel-app
        </Paragraph>

        {/* 统计数据卡片 */}
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="员工总数"
                value={1128}
                valueStyle={{ color: '#1890ff' }}
                prefix="人"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="在职员工"
                value={1085}
                valueStyle={{ color: '#52c41a' }}
                prefix="人"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="本月入职"
                value={23}
                valueStyle={{ color: '#722ed1' }}
                prefix="人"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="本月离职"
                value={8}
                valueStyle={{ color: '#f5222d' }}
                prefix="人"
              />
            </Card>
          </Col>
        </Row>

        {/* 部门统计 */}
        <Card title="部门分布统计" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Card size="small" title="技术部">
                <Statistic value={156} suffix="人" />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="市场部">
                <Statistic value={89} suffix="人" />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" title="行政部">
                <Statistic value={45} suffix="人" />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 员工列表 */}
        <Card title="最近入职员工" style={{ marginTop: 24 }}>
          <Table
            dataSource={[
              {
                key: '1',
                name: '张三',
                department: '技术部',
                position: '高级工程师',
                entryDate: '2026-02-01',
                status: '在职',
              },
              {
                key: '2',
                name: '李四',
                department: '市场部',
                position: '市场经理',
                entryDate: '2026-01-28',
                status: '在职',
              },
              {
                key: '3',
                name: '王五',
                department: '行政部',
                position: '行政专员',
                entryDate: '2026-01-25',
                status: '在职',
              },
            ]}
            columns={[
              {
                title: '姓名',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: '部门',
                dataIndex: 'department',
                key: 'department',
              },
              {
                title: '职位',
                dataIndex: 'position',
                key: 'position',
              },
              {
                title: '入职日期',
                dataIndex: 'entryDate',
                key: 'entryDate',
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => {
                  const color = status === '在职' ? 'green' : 'red';
                  return <Tag color={color}>{status}</Tag>;
                },
              },
            ]}
            pagination={false}
          />
        </Card>
      </Content>
    </Layout>
  );
}

export default App;
