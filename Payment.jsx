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
    setProcessing(true);
    setTimeout(() => {
      // Save order data for dashboard
      const cart = loadCart();
      const orderData = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'completed',
        paymentMethod: 'demo',
        paymentStatus: 'paid',
        transactionId: 'DEMO-' + Date.now(),
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
      setPaid(true);
      setProcessing(false);
    }, 1000);
  };

  // Demo helpers to read config saved via AdminPayments
  const getConfig = () => {
    try { return JSON.parse(localStorage.getItem('volubiks_payments_config') || 'null'); } catch { return null; }
  };

  const payWithPaystack = async () => {
    const cfg = getConfig();
    if (!cfg || !cfg.paystackWebhook) {
      alert('Paystack is not configured. See PAYMENT_INTEGRATION.md and add your webhook in the Payment Configuration section on this page.');
      return;
    }
    try {
      const res = await fetch('/api/paystack/initialize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary }) });
      if (!res.ok) throw new Error('no-backend');
      const data = await res.json();
      if (data && data.authorization_url) window.location.href = data.authorization_url;
      else alert('Unexpected response from backend.');
    } catch (e) {
      alert('No server-side Paystack integration detected. See PAYMENT_INTEGRATION.md for setup steps.');
    }
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

  if (paid) {
    return (
      <>
        <Helmet>
          <title>Payment Successful - Volubiks Jewelry</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div style={{ padding: 20 }}>
          <h2>Payment successful</h2>
          <p>Thanks! Your payment of <strong>₦{summary.total.toFixed(2)}</strong> was processed.</p>
          <Link to="/">Return to home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Payment - Volubiks Jewelry</title>
        <meta name="description" content="Complete your secure payment at Volubiks Jewelry. Enter shipping details and pay with Paystack or Moniepoint." />
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
            <h4>Payment method</h4>
            <p className="muted">This demo uses a simulated payment flow. To integrate real providers replace the handlers with server-side integration. Use the configuration panel below to paste Paystack webhook secret and Opay merchant (demo only).</p>

            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="button" onClick={async () => {
                  try {
                    const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary }) });
                    if (!res.ok) throw new Error('no-backend');
                    const data = await res.json();
                    if (data && data.url) window.location.href = data.url;
                    else alert('Unexpected response from backend.');
                  } catch (e) {
                    alert('Stripe integration is not configured in this demo. See PAYMENT_INTEGRATION.md in the repo for setup steps.');
                  }
                }}>Pay with Stripe (test)</button>

                <button className="button primary" onClick={payWithPaystack}>Pay with Paystack</button>
                <button className="button primary" onClick={payWithOpay}>Pay with Opay</button>
              </div>
            </div>
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
