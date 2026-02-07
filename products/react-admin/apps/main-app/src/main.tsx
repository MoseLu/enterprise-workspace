import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@enterprise-workspace/frontend/shared';
import App from './App';
import './assets/styles/global.css';

// 隐藏 loading
const hideLoading = () => {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.classList.add('hidden');
  }
};

// 渲染应用
const renderApp = () => {
  hideLoading();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </React.StrictMode>
  );
};

// 初始化
renderApp();
