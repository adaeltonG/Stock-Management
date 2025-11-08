import React from 'react';
import { useStore } from './store/useStore';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import Reports from './components/Reports';
import Analytics from './components/Analytics';

function App() {
  const { isAuthenticated, currentTab } = useStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockManagement />;
      case 'reports':
        return <Reports />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

export default App;

