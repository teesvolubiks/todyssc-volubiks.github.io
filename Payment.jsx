import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AdminPayments } from './components/AdminPayments';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('rv_cart') || '[]');
  } catch {
    return [];
  }
}

export default function Payment() {
  const { state } = useLocation();
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  // Fallback: if state not provided, compute totals from current cart
  const [summary, setSummary] = useState(() => state || { subtotal: 0, vat: 0, total: 0 });

  const [shipping, setShipping] = useState({ fullName: '', address: '', city: '', postal: '', country: '', email: '' });
  const [saveShipping, setSaveShipping] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // load saved shipping if any
    try {
      const s = JSON.parse(localStorage.getItem('rv_shipping') || 'null');
      if (s) setShipping(s);
    } catch {}

    if (!state) {
      const cart = loadCart();
      const map = {};
      for (const p of cart) {
        if (!map[p.id]) map[p.id] = { product: p, qty: 0 };
        map[p.id].qty++;
      }
      const items = Object.values(map);
      const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
      const vat = +(subtotal * 0.10).toFixed(2);
      const total = +(subtotal + vat).toFixed(2);
      setSummary({ subtotal, vat, total });
    }
  }, [state]);

  const validateShipping = () => {
    const e = {};
    if (!shipping.fullName.trim()) e.fullName = 'Full name is required';
    if (!shipping.address.trim()) e.address = 'Address is required';
    if (!shipping.city.trim()) e.city = 'City is required';
    if (!shipping.postal.trim()) e.postal = 'Postal code is required';
    if (!shipping.country.trim()) e.country = 'Country is required';
    if (!shipping.email.trim() || !shipping.email.includes('@')) e.email = 'Valid email required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onPay = () => {
    if (!validateShipping()) return;
    if (saveShipping) {
      try { localStorage.setItem('rv_shipping', JSON.stringify(shipping)); } catch {}
    }
    setConfirmationPending(true);
  };

  const onConfirmPaymentSent = () => {
    setProcessing(true);
    setTimeout(() => {
      // Save order data for dashboard after confirmation
      const cart = loadCart();
      const orderData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'completed',
        paymentMethod: 'opay',
        paymentStatus: 'paid',
        transactionId: 'OPAY-' + Date.now(),
        shipping,
        items: cart,
        subtotal: summary.subtotal,
        vat: summary.vat,
        total: summary.total
      };

      const existingOrders = JSON.parse(localStorage.getItem('volubiks_orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('volubiks_orders', JSON.stringify(existingOrders));

      // Clear cart and show success
      localStorage.removeItem('rv_cart');
      window.dispatchEvent(new Event('storage'));
      setConfirmationPending(false);
      setPaid(true);
      setProcessing(false);
    }, 1000);
  };

  // Demo helpers to read config saved via AdminPayments
  const getConfig = () => {
    try { return JSON.parse(localStorage.getItem('volubiks_payments_config') || 'null'); } catch { return null; }
  };

  const payWithOpay = async () => {
    const cfg = getConfig();
    if (!cfg || !cfg.opayMerchant) {
      alert('Opay is not configured. Enter your Opay merchant ID/phone in the Payment Configuration section on this page.');
      return;
    }
    try {
      const res = await fetch('/api/opay/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary, merchant: cfg.opayMerchant }) });
      if (!res.ok) throw new Error('no-backend');
      const data = await res.json();
      if (data && data.redirect) window.location.href = data.redirect;
      else alert('Unexpected response from backend.');
    } catch (e) {
      alert('No server-side Opay integration detected. See PAYMENT_INTEGRATION.md for setup steps.');
    }
  };

  if (confirmationPending) {
    return (
      <>
        <Helmet>
          <title>Confirm Payment - Volubiks Jewelry</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ backgroundColor: '#f9f9f9', padding: 30, borderRadius: 8, textAlign: 'center' }}>
            <h2>Confirm Payment Sent</h2>
            <div style={{ backgroundColor: '#fff3cd', padding: 15, borderRadius: 6, margin: '20px 0', borderLeft: '4px solid #ffc107' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Please transfer ₦{summary.total.toFixed(2)} to:</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#333' }}>Opay: 9047393086</p>
            </div>
            <p style={{ marginBottom: 20, color: '#666' }}>Have you sent the funds to the account above?</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="button primary" onClick={onConfirmPaymentSent} disabled={processing}>
                {processing ? 'Processing…' : 'Yes, I sent the funds'}
              </button>
              <button className="button ghost" onClick={() => setConfirmationPending(false)} disabled={processing}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (paid) {
    return (
      <>
        <Helmet>
          <title>Thank You - Volubiks Jewelry</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ backgroundColor: '#f0f8f0', padding: 30, borderRadius: 8, textAlign: 'center' }}>
            <h2 style={{ color: '#2d5016', marginTop: 0 }}>✓ Thank You!</h2>
            <p style={{ fontSize: 16, marginBottom: 10 }}>Your order has been received.</p>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>We will process your order once payment is confirmed.</p>
            <div style={{ backgroundColor: '#fff', padding: 15, borderRadius: 6, margin: '20px 0', border: '1px solid #e0e0e0' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#999' }}>Order Total</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#333' }}>₦{summary.total.toFixed(2)}</p>
            </div>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 20 }}>A confirmation email has been sent to {shipping.email}</p>
            <Link to="/" className="button primary" style={{ textDecoration: 'none', display: 'inline-block', padding: '10px 20px' }}>Return to Home</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment - Volubiks Jewelry</title>
        <meta name="description" content="Complete your secure payment at Volubiks Jewelry. Enter your shipping details and make payment via Opay." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{ padding: 20 }}>
        <h2>Payment</h2>
        <p>Please enter your shipping details. Amounts below are based on your cart.</p>

        <div style={{ maxWidth: 720, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div>
          <form className="shipping-form" onSubmit={(e) => { e.preventDefault(); onPay(); }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label>Full name</label>
                <input className="input" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} />
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>
              <div>
                <label> Email</label>
                <input className="input" value={shipping.email} onChange={(e) => setShipping({ ...shipping, email: e.target.value })} />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Address</label>
              <input className="input" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
              {errors.address && <div className="form-error">{errors.address}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              <div>
                <label>City</label>
                <input className="input" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                {errors.city && <div className="form-error">{errors.city}</div>}
              </div>
              <div>
                <label>Postal code</label>
                <input className="input" value={shipping.postal} onChange={(e) => setShipping({ ...shipping, postal: e.target.value })} />
                {errors.postal && <div className="form-error">{errors.postal}</div>}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label>Country</label>
              <input className="input" value={shipping.country} onChange={(e) => setShipping({ ...shipping, country: e.target.value })} />
              {errors.country && <div className="form-error">{errors.country}</div>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={saveShipping} onChange={(e) => setSaveShipping(e.target.checked)} /> Save shipping info
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="button primary" type="submit" disabled={processing}>{processing ? 'Processing…' : `Pay ₦${summary.total.toFixed(2)}`}</button>
              <Link to="/checkout" className="button ghost" style={{ marginLeft: 8 }}>Back to checkout</Link>
            </div>
          </form>

          <div style={{ marginTop: 18 }}>
            <h4>Account Details</h4>
            <div style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, marginTop: 10 }}>
              <p style={{ margin: 0, fontSize: 14, color: '#666' }}>Official Payment Account:</p>
              <p style={{ margin: '8px 0 0 0', fontSize: 18, fontWeight: 'bold', color: '#333' }}>Opay: 9047393086</p>
            </div>
            <p style={{ marginTop: 10, fontSize: 13, color: '#999' }}>Please transfer the payment amount to the account above and complete your shipping details to finalize your order.</p>
          </div>
        </div>

        <div>
          <div className="checkout-summary" style={{ maxWidth: 340 }}>
            <div className="summary-row"><span>Subtotal</span><strong>₦{summary.subtotal.toFixed(2)}</strong></div>
            <div className="summary-row"><span>VAT (10%)</span><strong>₦{summary.vat.toFixed(2)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>₦{summary.total.toFixed(2)}</strong></div>
          </div>

          <div style={{ marginTop: 18 }}>
            <AdminPayments />
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
