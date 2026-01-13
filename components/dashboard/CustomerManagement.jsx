import React, { useState, useEffect } from 'react';

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    // Extract customers from orders
    const orders = JSON.parse(localStorage.getItem('volubiks_orders') || '[]');
    const customerMap = {};

    orders.forEach(order => {
      if (order.shipping?.email) {
        const email = order.shipping.email;
        if (!customerMap[email]) {
          customerMap[email] = {
            email,
            name: order.shipping.fullName,
            phone: order.shipping.phone || '',
            address: order.shipping.address,
            city: order.shipping.city,
            country: order.shipping.country,
            orders: [],
            totalSpent: 0,
            lastOrder: null,
            firstOrder: null
          };
        }

        customerMap[email].orders.push(order);
        customerMap[email].totalSpent += order.total || 0;

        const orderDate = new Date(order.date || order.createdAt);
        if (!customerMap[email].lastOrder || orderDate > new Date(customerMap[email].lastOrder)) {
          customerMap[email].lastOrder = orderDate.toISOString();
        }
        if (!customerMap[email].firstOrder || orderDate < new Date(customerMap[email].firstOrder)) {
          customerMap[email].firstOrder = orderDate.toISOString();
        }
      }
    });

    const customerList = Object.values(customerMap);
    setCustomers(customerList);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customer-management">
      <div className="customer-header">
        <h2>Customer Management</h2>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input search-input"
        />
      </div>

      <div className="customers-grid">
        <div className="customers-list">
          <div className="customer-stats">
            <div className="stat">Total Customers: {customers.length}</div>
            <div className="stat">
              Total Revenue: ₦{customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <p>No customers found</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div
                key={customer.email}
                className={`customer-card ${selectedCustomer?.email === customer.email ? 'selected' : ''}`}
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="customer-info">
                  <strong>{customer.name}</strong>
                  <div className="customer-email">{customer.email}</div>
                  <div className="customer-location">
                    {customer.city}, {customer.country}
                  </div>
                </div>
                <div className="customer-metrics">
                  <div>Orders: {customer.orders.length}</div>
                  <div>Total: ₦{customer.totalSpent.toFixed(2)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="customer-details">
          {selectedCustomer ? (
            <div className="customer-detail-view">
              <h3>{selectedCustomer.name}</h3>
              <p className="customer-email-large">{selectedCustomer.email}</p>

              <div className="detail-section">
                <h4>Contact Information</h4>
                <div className="info-grid">
                  <div><strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}</div>
                  <div><strong>Address:</strong> {selectedCustomer.address}</div>
                  <div><strong>City:</strong> {selectedCustomer.city}</div>
                  <div><strong>Country:</strong> {selectedCustomer.country}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Customer Summary</h4>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-value">{selectedCustomer.orders.length}</div>
                    <div className="summary-label">Total Orders</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">₦{selectedCustomer.totalSpent.toFixed(2)}</div>
                    <div className="summary-label">Total Spent</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-value">
                      ₦{(selectedCustomer.totalSpent / selectedCustomer.orders.length).toFixed(2)}
                    </div>
                    <div className="summary-label">Average Order</div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Order History</h4>
                <div className="order-history">
                  {selectedCustomer.orders
                    .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                    .map((order, index) => (
                    <div key={index} className="history-item">
                      <div className="history-order">
                        <strong>Order #{order.id}</strong>
                        <span>{new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="history-amount">₦{order.total?.toFixed(2)}</div>
                      <div className={`history-status status-${order.status || 'pending'}`}>
                        {order.status || 'pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Customer Timeline</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <strong>First Order</strong>
                      <div>{new Date(selectedCustomer.firstOrder).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <strong>Last Order</strong>
                      <div>{new Date(selectedCustomer.lastOrder).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}