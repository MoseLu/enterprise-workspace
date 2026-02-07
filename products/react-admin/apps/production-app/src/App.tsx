import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Suspense, lazy } from 'react';

const { Header, Content } = Layout;
const { Title } = Typography;

// 懒加载生产模块页面
const ProductionHome = lazy(() => import('./modules/production/views/Home'));

function Loading() {
  return <div style={{ padding: 24 }}>加载中...</div>;
}

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={4} style={{ margin: 0 }}>生产应用</Title>
      </Header>
      <Content style={{ padding: 0, height: 'calc(100vh - 64px)' }}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<ProductionHome />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Content>
    </Layout>
  );
}

export default App;
