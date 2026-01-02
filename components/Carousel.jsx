import React, { useEffect, useRef, useState } from 'react';
import ProductCard from './ProductCard';

export default function Carousel({ products = [], perPage = 6, autoPlay = true, interval = 3000, onAdd }) {
  const [page, setPage] = useState(0);
  const [perPageState, setPerPageState] = useState(perPage);
  const timerRef = useRef(null);

  useEffect(() => {
    function updatePerPage() {
      const w = window.innerWidth;
      if (w < 600) setPerPageState(1);
      else if (w < 900) setPerPageState(2);
      else setPerPageState(perPage);
    }
    updatePerPage();
    window.addEventListener('resize', updatePerPage);
    return () => window.removeEventListener('resize', updatePerPage);
  }, [perPage]);

  const pageCount = Math.max(1, Math.ceil(products.length / perPageState));

  useEffect(() => {
    if (!autoPlay) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPage((p) => (p + 1) % pageCount);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [autoPlay, interval, pageCount]);

  const goTo = (i) => {
    setPage((i + pageCount) % pageCount);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setPage((p) => (p + 1) % pageCount), interval);
    }
  };

  // Build pages
  const pages = [];
  for (let i = 0; i < pageCount; i++) {
    const start = i * perPageState;
    const slice = products.slice(start, start + perPageState);
    pages.push(slice);
  }

  return (
    <div className="carousel" aria-roledescription="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${page * 100}%)` }}>
        {pages.map((items, idx) => (
          <div className="carousel-page" key={idx} style={{ ['--perPage'] /* eslint-disable-line */: perPageState }}>
            {items.map(p => (
              <div className="carousel-item" key={p.id}>
                <ProductCard product={p} onAdd={onAdd} />
              </div>
            ))}
          </div>
        ))}
      </div>

      <button className="carousel-prev" aria-label="Previous" onClick={() => goTo(page - 1)}>◀</button>
      <button className="carousel-next" aria-label="Next" onClick={() => goTo(page + 1)}>▶</button>

      <div className="carousel-dots">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button key={i} className={`dot ${i === page ? 'active' : ''}`} onClick={() => goTo(i)} aria-label={`Go to slide ${i + 1}`}></button>
        ))}
      </div>
    </div>
  );
}
