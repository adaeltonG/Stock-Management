import React from 'react';
import { LogOut, Building2, User, LayoutDashboard, Package, FileText, BarChart3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import styles from './styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, selectedSite, logout, currentTab, setCurrentTab } = useStore();

  const tabs = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: 'Stock Management', icon: Package },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerLogo}>
            <Building2 size={32} color="#2563eb" />
            <div>
              <h1>Sodexo Stock Control</h1>
              <p>{selectedSite?.name} - {selectedSite?.code}</p>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <User size={20} />
            <span>{user?.username}</span>
            <span className={styles.userRole}>{user?.role}</span>
          </div>
          <button className={styles.btnLogout} onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <nav className={styles.tabs}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${currentTab === tab.id ? styles.active : ''}`}
              onClick={() => setCurrentTab(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className={`${styles.mainContent} fade-in`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
