import React, { useState, useEffect } from 'react';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    recentOrders: [],
    topProducts: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load products
      const productsRes = await fetch('/data/products.json?t=' + Date.now());
      const products = await productsRes.json();

      // Load orders from localStorage (in production, this would be from a database)
      const orders = JSON.parse(localStorage.getItem('volubiks_orders') || '[]');

      // Calculate stats
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const lowStockItems = products.filter(p => (p.inventory || 0) <= 5).length;

      // Recent orders (last 5)
      const recentOrders = orders.slice(-5).reverse();

      // Top products by sales
      const productSales = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
        });
      });
      const topProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([id, sales]) => {
          const product = products.find(p => p.id === id);
          return product ? { ...product, sales } : null;
        })
        .filter(Boolean);

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockItems,
        recentOrders,
        topProducts
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">₦{stats.totalRevenue.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <div className="stat-value warning">{stats.lowStockItems}</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <h3>Recent Orders</h3>
          <div className="recent-orders">
            {stats.recentOrders.length === 0 ? (
              <p>No orders yet</p>
            ) : (
              stats.recentOrders.map((order, index) => (
                <div key={index} className="order-item">
                  <div className="order-info">
                    <strong>Order #{order.id || index + 1}</strong>
                    <span>{order.customerName || 'Customer'}</span>
                  </div>
                  <div className="order-amount">₦{order.total?.toFixed(2)}</div>
                  <div className="order-date">{new Date(order.date || Date.now()).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section">
          <h3>Top Selling Products</h3>
          <div className="top-products">
            {stats.topProducts.length === 0 ? (
              <p>No sales data yet</p>
            ) : (
              stats.topProducts.map((product, index) => (
                <div key={product.id} className="product-item">
                  <div className="product-rank">#{index + 1}</div>
                  <img src={product.image} alt={product.name} className="product-thumb" />
                  <div className="product-info">
                    <strong>{product.name}</strong>
                    <span>{product.sales} sold</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}