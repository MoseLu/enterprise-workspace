import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load all page components for better performance
const HomePage = lazy(() => import('./modules/home/views'));
const CustomsPage = lazy(() => import('./modules/customs/views'));
const InventoryPage = lazy(() => import('./modules/inventory/views'));
const ProcurementPage = lazy(() => import('./modules/procurement/views'));
const WarehousePage = lazy(() => import('./modules/warehouse/views'));

// Loading fallback component
const PageLoading: React.FC = () => (
  <div style={{ padding: 24, textAlign: 'center' }}>
    加载中...
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/customs/*" element={<CustomsPage />} />
        <Route path="/inventory/*" element={<InventoryPage />} />
        <Route path="/procurement/*" element={<ProcurementPage />} />
        <Route path="/warehouse/*" element={<WarehousePage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
