import React, { useEffect, useState } from 'react';

// Simple promo engine: rotates short, non-deceptive promotional summaries based
// on available products and emits the current message via onMessage callback.
export default function PromoEngine({ interval = 8000, onMessage }) {
  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/data/products.json?t=' + Date.now(), { cache: 'no-cache' });
        const data = await res.json();
        if (!mounted) return;
        const categories = ['jewelries', 'clothings', 'drinks'];
        const msgs = categories.map(cat => {
          const p = (data || []).find(x => x.category === cat) || {};
          const name = p.name || cat.charAt(0).toUpperCase() + cat.slice(1);
          const price = p.price ? ` — ${formatPrice(p.price)}` : '';
          return `${name}${price}`;
        });
        setMessages(msgs);
      } catch (err) {
        console.warn('PromoEngine: failed to load products', err);
        if (mounted) setMessages(['Jewelries','Clothings','Drinks']);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!messages.length) return;
    onMessage && onMessage(messages[index]);
    const t = setInterval(() => {
      setIndex(i => (i + 1) % messages.length);
    }, interval);
    return () => clearInterval(t);
  }, [messages, index, interval, onMessage]);

  return null; // headless component
}

function formatPrice(v) {
  if (typeof v !== 'number') return '';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  } catch (e) {
    return `$${Math.round(v)}`;
  }
}
