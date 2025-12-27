import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#B8956A',
    colorInfo: '#4A7C9C',
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);