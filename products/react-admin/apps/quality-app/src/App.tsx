import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>Quality App</Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={2}>欢迎使用 Quality 品质应用</Title>
        <Paragraph>
          此应用已从 Vue3 + Element Plus 迁移到 React + Ant Design。
        </Paragraph>
        <Paragraph>
          源路径: products/pc-admin/apps/quality-app
        </Paragraph>
        <Paragraph>
          目标路径: products/react-admin/apps/quality-app
        </Paragraph>
      </Content>
    </Layout>
  );
}

export default App;
