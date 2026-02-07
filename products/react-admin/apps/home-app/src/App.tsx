import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Layout, Typography, Space, Button } from 'antd';
import { AboutPage, HelpPage, TermsPage } from './modules';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 24px' }}>
        <Title level={4} style={{ margin: 0 }}>Home App</Title>
        <Space>
          <Link to="/about"><Button type="link">关于我们</Button></Link>
          <Link to="/help"><Button type="link">帮助中心</Button></Link>
          <Link to="/terms"><Button type="link">服务条款</Button></Link>
        </Space>
      </Header>
      <Content style={{ padding: 24 }}>
        <Title level={2}>欢迎使用 Home 首页</Title>
        <Paragraph>
          此应用已从 Vue3 + Element Plus 迁移到 React + Ant Design。
        </Paragraph>
        <Paragraph>
          源路径: products/pc-admin/apps/home-app
        </Paragraph>
        <Paragraph>
          目标路径: products/react-admin/apps/home-app
        </Paragraph>
        <Space direction="vertical" size="middle" style={{ marginTop: 24 }}>
          <Link to="/about">
            <Button type="primary" size="large">关于我们</Button>
          </Link>
          <Link to="/help">
            <Button size="large">帮助中心</Button>
          </Link>
          <Link to="/terms">
            <Button size="large">服务条款</Button>
          </Link>
        </Space>
      </Content>
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
