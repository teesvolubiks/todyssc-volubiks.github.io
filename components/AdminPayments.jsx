import React from 'react';

export function AdminPayments() {
  return (
    <div style={{ marginTop: 18, padding: 12, border: '1px solid #eee', borderRadius: 8, maxWidth: 720 }}>
      <h4>Payment Details</h4>
      <p className="muted">Please transfer the full amount to the account below and confirm payment in the checkout flow.</p>
      <div style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, marginTop: 10 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Official Payment Account:</p>
        <p style={{ margin: '8px 0 0 0', fontSize: 18, fontWeight: 'bold', color: '#333' }}>Opay: 9047393086</p>
      </div>
    </div>
  );
}
