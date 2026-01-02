import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// A respectful, rate-limited promo popup that offers a gentle suggestion
// and a WhatsApp quick-contact CTA. It avoids repeated interruptions by
// storing a "seen" timestamp in localStorage.
export default function PromoPopup({ delay = 8000, cooldownHours = 24 }) {
  const [visible, setVisible] = useState(false);
  const [suggest, setSuggest] = useState(null);

  useEffect(() => {
    const seen = Number(localStorage.getItem('volubiks_promo_seen') || '0');
    const ageHours = (Date.now() - seen) / (1000 * 60 * 60);
    if (seen && ageHours < cooldownHours) return; // respect cooldown

    let mounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/data/products.json?t=' + Date.now(), { cache: 'no-cache' });
        const data = await res.json();
        if (!mounted) return;
        const sample = pickRepresentative(data);
        setSuggest(sample);
        setVisible(true);
        localStorage.setItem('volubiks_promo_seen', String(Date.now()));
      } catch (err) {
        console.warn('PromoPopup load failed', err);
      }
    }, delay);

    return () => { mounted = false; clearTimeout(timer); };
  }, [delay, cooldownHours]);

  if (!visible) return null;

  const waMsg = suggest ? `Hi, I'm interested in ${suggest.name}. Can you tell me more?` : 'Hi, I need product suggestions';
  const cfg = (() => { try { return JSON.parse(localStorage.getItem('volubiks_payments_config') || 'null'); } catch { return null; } })();
  const waUrl = cfg && cfg.whatsapp ? `https://wa.me/${cfg.whatsapp.replace(/[^+0-9]/g,'')}?text=${encodeURIComponent(waMsg)}` : `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

  return (
    <div className="promo-popup" role="dialog" aria-label="Promotional suggestion">
      <div className="promo-inner">
        <button className="promo-close" onClick={() => setVisible(false)} aria-label="Close">×</button>
        <div className="promo-media">
          {suggest && <img src={suggest.images ? suggest.images[0] || suggest.image : ''} alt={suggest ? suggest.name : 'Suggestion'} />}
        </div>
        <div className="promo-body">
          <h4>{suggest ? `Recommended: ${suggest.name}` : 'Handpicked for you'}</h4>
          <p className="promo-text">{suggest ? (suggest.shortDescription || suggest.description || '') : 'Explore curated picks across our categories.'}</p>
          <div className="promo-actions">
            <Link to={`/shop?category=${suggest ? encodeURIComponent(suggest.category) : ''}`} className="button primary">View</Link>
            <a href={waUrl} className="button ghost" target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function pickRepresentative(data) {
  if (!Array.isArray(data) || data.length === 0) return null;
  // Prefer featured items, fallback to random
  const featured = data.filter(p => p.featured);
  const pool = featured.length ? featured : data;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}
