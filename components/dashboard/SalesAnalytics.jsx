import React, { useState, useEffect } from 'react';

export default function SalesAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByCategory: {},
    monthlyRevenue: [],
    recentTrends: []
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const orders = JSON.parse(localStorage.getItem('volubiks_orders') || '[]');

    if (orders.length === 0) return;

    // Basic metrics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalRevenue / totalOrders;

    // Top products
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
      });
    });

    // Get product details
    const products = JSON.parse(localStorage.getItem('volubiks_products_cache') || '[]');
    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([id, quantity]) => {
        const product = products.find(p => p.id === id);
        return product ? { ...product, sold: quantity, revenue: quantity * product.price } : null;
      })
      .filter(Boolean);

    // Sales by category
    const salesByCategory = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product?.category) {
          salesByCategory[product.category] = (salesByCategory[product.category] || 0) + (item.quantity * item.price);
        }
      });
    });

    // Monthly revenue (last 12 months)
    const monthlyRevenue = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.date || order.createdAt);
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      });
      const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      monthlyRevenue.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue
      });
    }

    // Recent trends (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentOrders = orders.filter(order =>
      new Date(order.date || order.createdAt) >= thirtyDaysAgo
    );
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.date || order.createdAt);
      return orderDate >= sixtyDaysAgo && orderDate < thirtyDaysAgo;
    });

    const recentRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueChange = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    setAnalytics({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      salesByCategory,
      monthlyRevenue,
      recentTrends: {
        recentRevenue,
        previousRevenue,
        revenueChange,
        recentOrders: recentOrders.length,
        previousOrders: previousOrders.length
      }
    });
  };

  return (
    <div className="sales-analytics">
      <h2>Sales Analytics</h2>

      <div className="analytics-grid">
        <div className="metric-card">
          <h3>Total Revenue</h3>
          <div className="metric-value">₦{analytics.totalRevenue.toFixed(2)}</div>
        </div>

        <div className="metric-card">
          <h3>Total Orders</h3>
          <div className="metric-value">{analytics.totalOrders}</div>
        </div>

        <div className="metric-card">
          <h3>Average Order Value</h3>
          <div className="metric-value">₦{analytics.averageOrderValue.toFixed(2)}</div>
        </div>

        <div className="metric-card">
          <h3>Revenue Trend</h3>
          <div className={`metric-value ${analytics.recentTrends.revenueChange >= 0 ? 'positive' : 'negative'}`}>
            {analytics.recentTrends.revenueChange >= 0 ? '+' : ''}{analytics.recentTrends.revenueChange.toFixed(1)}%
          </div>
          <div className="metric-subtitle">vs last month</div>
        </div>
      </div>

      <div className="analytics-sections">
        <div className="analytics-section">
          <h3>Revenue Over Time</h3>
          <div className="chart-placeholder">
            <div className="monthly-bars">
              {analytics.monthlyRevenue.map((month, index) => (
                <div key={index} className="bar-container">
                  <div
                    className="bar"
                    style={{
                      height: `${Math.max((month.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 100, 10)}%`
                    }}
                  >
                    <span className="bar-value">₦{month.revenue.toFixed(0)}</span>
                  </div>
                  <div className="bar-label">{month.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Top Products</h3>
          <div className="top-products-list">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="product-rank">
                <div className="rank-number">#{index + 1}</div>
                <img src={product.image} alt={product.name} className="product-thumb" />
                <div className="product-details">
                  <strong>{product.name}</strong>
                  <div>{product.sold} units sold</div>
                  <div>₦{product.revenue.toFixed(2)} revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Sales by Category</h3>
          <div className="category-breakdown">
            {Object.entries(analytics.salesByCategory).map(([category, revenue]) => (
              <div key={category} className="category-item">
                <div className="category-name">{category}</div>
                <div className="category-revenue">₦{revenue.toFixed(2)}</div>
                <div className="category-percentage">
                  {((revenue / analytics.totalRevenue) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h3>Recent Performance</h3>
          <div className="performance-metrics">
            <div className="performance-item">
              <span>Last 30 days:</span>
              <strong>₦{analytics.recentTrends.recentRevenue.toFixed(2)} ({analytics.recentTrends.recentOrders} orders)</strong>
            </div>
            <div className="performance-item">
              <span>Previous 30 days:</span>
              <strong>₦{analytics.recentTrends.previousRevenue.toFixed(2)} ({analytics.recentTrends.previousOrders} orders)</strong>
            </div>
            <div className="performance-item">
              <span>Growth:</span>
              <strong className={analytics.recentTrends.revenueChange >= 0 ? 'positive' : 'negative'}>
                {analytics.recentTrends.revenueChange >= 0 ? '+' : ''}{analytics.recentTrends.revenueChange.toFixed(1)}%
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}