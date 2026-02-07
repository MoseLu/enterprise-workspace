import React from 'react';
import { Layout } from 'antd';
import AppRoutes from './routes';

const { Header, Content } = Layout;

const App: React.FC = () => {
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
        <div style={{ fontSize: 18, fontWeight: 600 }}>运维应用</div>
      </Header>
      <Content style={{ padding: 24 }}>
        <AppRoutes />
      </Content>
    </Layout>
  );
};

export default App;
