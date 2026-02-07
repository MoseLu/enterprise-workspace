import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>Admin App</Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={2}>欢迎使用 Admin 管理控制台</Title>
        <p>此应用已从 Vue3 + Element Plus 迁移到 React + Ant Design</p>
      </Content>
    </Layout>
  );
}

export default App;
