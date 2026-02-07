import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

// 页面组件
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import ForgetPasswordPage from './pages/forget-password';
import ProfilePage from './pages/profile';

// 主布局组件
import MainLayout from './components/Layout';

// 路由守卫组件
import ProtectedRoute from './router/ProtectedRoute';

const { Content } = Layout;

/**
 * 主应用组件
 */
const App: React.FC = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forget-password" element={<ForgetPasswordPage />} />

      {/* 受保护路由 */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Content>
                <Routes>
                  <Route path="/" element={<Navigate to="/overview" replace />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  {/* 子应用容器 */}
                  <Route path="/system/*" element={<div className="subapp-container">系统应用</div>} />
                  <Route path="/admin/*" element={<div className="subapp-container">管理应用</div>} />
                  <Route path="/logistics/*" element={<div className="subapp-container">物流应用</div>} />
                  <Route path="/engineering/*" element={<div className="subapp-container">工程应用</div>} />
                  <Route path="/quality/*" element={<div className="subapp-container">品质应用</div>} />
                  <Route path="/production/*" element={<div className="subapp-container">生产应用</div>} />
                  <Route path="/finance/*" element={<div className="subapp-container">财务应用</div>} />
                  <Route path="/operations/*" element={<div className="subapp-container">运维应用</div>} />
                  <Route path="/docs/*" element={<div className="subapp-container">文档应用</div>} />
                  <Route path="/dashboard/*" element={<div className="subapp-container">图表应用</div>} />
                  <Route path="/personnel/*" element={<div className="subapp-container">人事应用</div>} />
                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Content>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
