import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FinanceHome from './modules/home/views';
import FinanceInventoryResult from './modules/inventory/views/result';

const App: React.FC = () => {
  return (
    <div className="finance-app">
      <Routes>
        <Route path="/" element={<FinanceHome />} />
        <Route path="/inventory" element={<FinanceInventoryResult />} />
        <Route path="/inventory/result" element={<FinanceInventoryResult />} />
      </Routes>
    </div>
  );
};

export default App;
