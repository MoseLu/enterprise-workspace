import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './styles/global.css';
import DashboardHome from './modules/dashboard/views/Home';

const App: React.FC = () => {
  return (
    <div className="dashboard-app">
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
