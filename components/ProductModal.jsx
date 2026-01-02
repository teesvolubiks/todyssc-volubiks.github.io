import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductModal({ product, open, onClose, onAdd }) {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const ANIM_MS = 220;

  function closeWithAnim() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setCurrentImageIndex(0);
      if (onClose) onClose();
    }, ANIM_MS);
  }

  function onSeeMore() {
    // navigate first so the route transition happens, then close the modal with animation
    navigate(`/product/${product.id}`);
    setTimeout(() => closeWithAnim(), 50);
  }

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (!product || !open) return null;

  const images = (product.images && product.images.length) ? product.images : (product.image ? [product.image] : []);

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
              <>
                <img src={images[currentImageIndex]} alt={product.name} />
                {images.length > 1 && (
                  <>
                    <button className="image-nav prev" onClick={prevImage}>&lt;</button>
                    <button className="image-nav next" onClick={nextImage}>&gt;</button>
                    <div className="image-indicators">
                      {images.map((_, index) => (
                        <span
                          key={index}
                          className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
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
    </div>
  );
}
