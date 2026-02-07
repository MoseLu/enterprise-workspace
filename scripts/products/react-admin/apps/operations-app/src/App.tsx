import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>operations-app</Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={2}>迁移自 Vue 的 React 应用</Title>
        <p>此应用从 products/pc-admin/apps/operations-app 迁移而来。</p>
      </Content>
    </Layout>
  );
}

export default App;
