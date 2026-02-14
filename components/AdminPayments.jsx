import React, { useEffect, useState } from 'react';

// Demo admin UI to store payment configuration locally.
// WARNING: For real deployments, never store secret keys in client-side storage.
export function AdminPayments() {
  const [cfg, setCfg] = useState({ opayMerchant: '09047363086', whatsapp: '' });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('volubiks_payments_config');
      if (raw) setCfg(JSON.parse(raw));
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem('volubiks_payments_config', JSON.stringify(cfg));
      alert('Payment config saved (demo only).');
    } catch (e) { console.error(e); alert('Failed to save config'); }
  };

  return (
    <div style={{ marginTop: 18, padding: 12, border: '1px dashed #eee', borderRadius: 8, maxWidth: 720 }}>
      <h4>Payment Configuration (demo)</h4>
      <p className="muted">Enter your Opay merchant ID and WhatsApp number. Never store secrets client-side in production.</p>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>Opay Merchant ID / Phone</label>
        <input className="input" value={cfg.opayMerchant} onChange={(e) => setCfg({ ...cfg, opayMerchant: e.target.value })} />

        <label>WhatsApp Number (E.g. +2348012345678)</label>
        <input className="input" value={cfg.whatsapp} onChange={(e) => setCfg({ ...cfg, whatsapp: e.target.value })} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button primary" onClick={save}>Save (demo)</button>
          <button className="button ghost" onClick={() => { localStorage.removeItem('volubiks_payments_config'); setCfg({ opayMerchant: '', whatsapp: '' }); }}>Clear</button>
        </div>
      </div>
    </div>
  );
}
