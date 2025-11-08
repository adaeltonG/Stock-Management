import React, { useState } from 'react';
import { LogIn, Building2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import styles from './styles/Login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('1'); // Default to London (Main Warehouse)
  const { sites, login, isLoading } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password && selectedSiteId) {
      await login(username, password, selectedSiteId);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={`${styles.card} fade-in`}>
          <div className={styles.header}>
            <div className={styles.logoContainer}>
              <Building2 size={48} color="#2563eb" />
            </div>
            <h1>Sodexo Stock Control</h1>
            <p>Manage your inventory efficiently</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="site" className="form-label">Select Site</label>
              <select
                id="site"
                className="form-select"
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                required
              >
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} - {site.location} ({site.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !username || !password || !selectedSiteId}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>© 2024 Sodexo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
