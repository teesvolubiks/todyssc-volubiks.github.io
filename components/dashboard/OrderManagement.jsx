import React, { useState, useEffect } from 'react';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    // In production, this would fetch from a database
    // For now, we'll simulate with localStorage
    const storedOrders = JSON.parse(localStorage.getItem('volubiks_orders') || '[]');
    setOrders(storedOrders);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('volubiks_orders', JSON.stringify(updatedOrders));
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="order-management">
      <div className="order-header">
        <h2>Order Management</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input">
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-grid">
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className={`order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-summary">
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-customer">{order.shipping?.fullName || 'Customer'}</div>
                  <div className="order-amount">₦{order.total?.toFixed(2)}</div>
                  <div className={`order-status ${getStatusColor(order.status || 'pending')}`}>
                    {order.status || 'pending'}
                  </div>
                </div>
                <div className="order-date">
                  {new Date(order.date || order.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-details">
          {selectedOrder ? (
            <div className="order-detail-view">
              <h3>Order #{selectedOrder.id}</h3>

              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="info-grid">
                  <div><strong>Name:</strong> {selectedOrder.shipping?.fullName}</div>
                  <div><strong>Email:</strong> {selectedOrder.shipping?.email}</div>
                  <div><strong>Phone:</strong> {selectedOrder.shipping?.phone || 'N/A'}</div>
                  <div><strong>Address:</strong> {selectedOrder.shipping?.address}</div>
                  <div><strong>City:</strong> {selectedOrder.shipping?.city}</div>
                  <div><strong>Country:</strong> {selectedOrder.shipping?.country}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Order Items</h4>
                <div className="order-items">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <img src={item.image} alt={item.name} className="item-thumb" />
                      <div className="item-details">
                        <strong>{item.name}</strong>
                        <div>Quantity: {item.quantity}</div>
                        <div>Price: ₦{item.price?.toFixed(2)}</div>
                        <div>Subtotal: ₦{(item.price * item.quantity)?.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Order Summary</h4>
                <div className="order-summary-details">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>₦{selectedOrder.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>VAT (10%):</span>
                    <span>₦{selectedOrder.vat?.toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>₦{selectedOrder.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Order Status</h4>
                <select
                  value={selectedOrder.status || 'pending'}
                  onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="detail-section">
                <h4>Payment Information</h4>
                <div className="payment-info">
                  <div><strong>Method:</strong> {selectedOrder.paymentMethod || 'N/A'}</div>
                  <div><strong>Status:</strong> {selectedOrder.paymentStatus || 'Paid'}</div>
                  <div><strong>Transaction ID:</strong> {selectedOrder.transactionId || 'N/A'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}