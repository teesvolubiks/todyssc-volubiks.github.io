import React, { useEffect, useState } from 'react';

// Lightweight on-site chat widget that suggests a few products and offers
// a WhatsApp handoff for further conversation. This is client-side only.
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const getUserPrefs = () => {
    try {
      const lastView = JSON.parse(localStorage.getItem('rv_last_view') || 'null');
      const cart = JSON.parse(localStorage.getItem('rv_cart') || '[]');
      const prefs = { byCategory: {} };
      if (lastView && lastView.category) prefs.byCategory[lastView.category] = (prefs.byCategory[lastView.category] || 0) + 3;
      for (const it of cart) {
        if (it && it.category) prefs.byCategory[it.category] = (prefs.byCategory[it.category] || 0) + 1;
      }
      return prefs;
    } catch (e) { return { byCategory: {} }; }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/data/products.json?t=' + Date.now(), { cache: 'no-cache' });
        const data = await res.json();
        if (!mounted) return;
        const prefs = getUserPrefs();
        setItems(sampleSuggestions(data, prefs));
      } catch (err) {
        console.warn('ChatBot failed to load products', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const openWhatsApp = (item) => {
    const msg = `Hello, I'd like to know more about ${item.name} (${item.id || ''}).`;
    const cfg = (() => { try { return JSON.parse(localStorage.getItem('volubiks_payments_config') || 'null'); } catch { return null; } })();
    const url = cfg && cfg.whatsapp ? `https://wa.me/${cfg.whatsapp.replace(/[^+0-9]/g,'')}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  };

  useEffect(() => {
    const onStorage = () => {
      (async () => {
        try {
          const res = await fetch('/data/products.json?t=' + Date.now(), { cache: 'no-cache' });
          const data = await res.json();
          setItems(sampleSuggestions(data, getUserPrefs()));
        } catch (e) {}
      })();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className={`chatbot-root ${open ? 'open' : ''}`}> 
      <button className="chatbot-toggle" aria-label="Open chat" onClick={() => setOpen(v => !v)}>
        💬
      </button>
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Product suggestions">
          <h4>Hi — suggestions for you</h4>
            <div className="chatbot-list">
            {items.map(it => (
              <div key={it.id || it.name} className="chatbot-item">
                <img src={it.images ? it.images[0] || it.image : ''} alt={it.name} />
                <div className="chatbot-meta">
                  <div className="chatbot-name">{it.name}</div>
                  <div className="chatbot-price">{it.price ? formatPrice(it.price) : ''}</div>
                </div>
                <div className="chatbot-actions">
                  <button className="button primary" onClick={() => {
                    try { localStorage.setItem('rv_last_view', JSON.stringify({ id: it.id, category: it.category, name: it.name })); } catch {}
                    window.location.href = `/product/${it.id}`;
                  }}>Open</button>
                  <button className="button ghost" onClick={() => openWhatsApp(it)}>WhatsApp</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function sampleSuggestions(data, prefs = { byCategory: {} }) {
  if (!Array.isArray(data) || data.length === 0) return [];
  const scores = {};
  for (const p of data) {
    const cat = p.category || 'other';
    const base = p.featured ? 2 : 1;
    const pref = prefs.byCategory && prefs.byCategory[cat] ? prefs.byCategory[cat] : 0;
    scores[p.id || p.name] = base + pref;
  }

  // pick top-scoring items, with fallback to random
  const sorted = data.slice().sort((a, b) => (scores[b.id || b.name] || 0) - (scores[a.id || a.name] || 0));
  const out = [];
  for (const s of sorted) {
    if (out.length >= 3) break;
    out.push(s);
  }

  // if not enough, fill with random unique items
  let attempts = 0;
  while (out.length < 3 && attempts < 20) {
    const cand = data[Math.floor(Math.random() * data.length)];
    if (!out.includes(cand)) out.push(cand);
    attempts++;
  }
  return out;
}

function formatPrice(v) {
  if (typeof v !== 'number') return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  } catch (e) {
    return `$${Math.round(v)}`;
  }
}
