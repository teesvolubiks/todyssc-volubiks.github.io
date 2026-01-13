import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardOverview from './DashboardOverview';
import InventoryManagement from './InventoryManagement';
import OrderManagement from './OrderManagement';
import CustomerManagement from './CustomerManagement';
import SalesAnalytics from './SalesAnalytics';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('volubiks_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple password check - in production, use proper authentication
    const adminPassword = localStorage.getItem('volubiks_admin_password') || 'admin123';
    if (password === adminPassword) {
      localStorage.setItem('volubiks_admin_auth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('volubiks_admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Admin Login - Volubiks</title>
        </Helmet>
        <div style={{ padding: 20, maxWidth: 400, margin: '50px auto' }}>
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label>Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            {loginError && <div style={{ color: 'red', marginBottom: 16 }}>{loginError}</div>}
            <button type="submit" className="button primary">Login</button>
          </form>
          <p style={{ marginTop: 16, fontSize: '14px', color: '#666' }}>
            Default password: admin123 (change in settings)
          </p>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', component: DashboardOverview },
    { id: 'inventory', label: 'Inventory', component: InventoryManagement },
    { id: 'orders', label: 'Orders', component: OrderManagement },
    { id: 'customers', label: 'Customers', component: CustomerManagement },
    { id: 'analytics', label: 'Analytics', component: SalesAnalytics },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DashboardOverview;

  return (
    <>
      <Helmet>
        <title>Dashboard - Volubiks Admin</title>
      </Helmet>
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Volubiks Admin Dashboard</h1>
          <button className="button ghost" onClick={handleLogout}>Logout</button>
        </header>

        <nav className="dashboard-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="dashboard-content">
          <ActiveComponent />
        </main>
      </div>
    </>
  );
}