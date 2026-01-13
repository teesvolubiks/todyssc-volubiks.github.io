import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductModal({ product, open, onClose, onAdd }) {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const ANIM_MS = 220;

  function closeWithAnim() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setCurrentImageIndex(0);
      setZoomed(false);
      if (onClose) onClose();
    }, ANIM_MS);
  }

  function onSeeMore() {
    // navigate first so the route transition happens, then close the modal with animation
    navigate(`/product/${product.id}`);
    setTimeout(() => closeWithAnim(), 50);
  }

  const toggleZoom = () => {
    setZoomed(!zoomed);
  };

  const images = (product.images && product.images.length) ? product.images : (product.image ? [product.image] : []);

  // Determine grid layout based on number of images
  const numImages = images.length;
  let rows, cols;
  if (numImages === 1) {
    rows = 1;
    cols = 1;
  } else if (numImages === 2) {
    rows = 1;
    cols = 2;
  } else if (numImages === 3) {
    rows = 1;
    cols = 3;
  } else if (numImages === 4) {
    rows = 2;
    cols = 2;
  } else if (numImages <= 6) {
    rows = 2;
    cols = 3;
  } else if (numImages <= 9) {
    rows = 3;
    cols = 3;
  } else {
    // For more than 9, still 3x3 but scroll or something, but unlikely
    rows = 3;
    cols = 3;
  }

  const gridClass = `image-grid grid-${rows}x${cols}`;

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeWithAnim();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`modal-overlay ${closing ? 'closing' : ''}`} role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={closeWithAnim} />
      <div className="modal-card">
        <button className="modal-close" aria-label="Close" onClick={closeWithAnim}>×</button>
        <div className="modal-body">
          <div className="modal-gallery">
            {images.length > 0 ? (
              <div className={gridClass}>
                {images.slice(0, rows * cols).map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    onClick={() => { setCurrentImageIndex(index); setZoomed(true); }}
                  />
                ))}
              </div>
            ) : (
              <div className="no-image">No image</div>
            )}
          </div>
          <div className="modal-info">
            <h3>{product.name}</h3>
            <p className="price">₦{product.price.toFixed(2)}</p>
            <p className="short-desc">{product.description}</p>
            <div className="modal-actions">
              <button className="button add-btn" onClick={() => onAdd(product)}>Add to cart</button>
              <button className="button secondary" onClick={onSeeMore}>See more</button>
            </div>
          </div>
        </div>
      </div>
      {zoomed && (
        <div className="zoom-overlay" onClick={toggleZoom}>
          <img src={images[currentImageIndex]} alt={product.name} className="zoomed-image" />
        </div>
      )}
    </div>
  );
}
