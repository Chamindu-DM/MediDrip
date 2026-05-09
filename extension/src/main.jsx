import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import './index.css';

const asgardeoConfig = {
  clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID || 'medidrip-dev',
  baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL || 'https://api.asgardeo.io/t/medidrip',
  scope: (import.meta.env.VITE_ASGARDEO_SCOPE || 'openid profile').split(' '),
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider config={asgardeoConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
