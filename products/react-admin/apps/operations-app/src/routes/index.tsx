import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../modules/operations/views/Home';
import ErrorMonitor from '../modules/operations/views/ErrorMonitor';
import DeploymentTest from '../modules/operations/views/DeploymentTest';
import LogQuery from '../pages/log-query';
import LogReporterTest from '../pages/log-reporter-test';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/ops/error" element={<ErrorMonitor />} />
      <Route path="/ops/deployment-test" element={<DeploymentTest />} />
      <Route path="/ops/log-query" element={<LogQuery />} />
      <Route path="/ops/log-reporter-test" element={<LogReporterTest />} />
    </Routes>
  );
};

export default AppRoutes;
