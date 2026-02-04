import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAdd, onPreview }) {
  const [zoomed, setZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSet, setSelectedSet] = useState(null);
  const images = (product.images && product.images.length) ? product.images : [product.image];

  // Get current price based on selected set
  const currentPrice = selectedSet !== null && product.setOptions
    ? product.setOptions.find(opt => opt.id === selectedSet)?.price || product.price
    : product.price;

  const handleImageClick = (index, e) => {
    e.stopPropagation(); // Prevent triggering the modal
    setCurrentImageIndex(index);
    setZoomed(true);
  };

  const closeZoom = () => {
    setZoomed(false);
  };

  const handleAddToCart = () => {
    const productToAdd = selectedSet && product.setOptions
      ? { ...product, price: currentPrice, selectedSet }
      : { ...product, selectedSet };
    onAdd(productToAdd);
    setSelectedSet(null); // Reset selection after adding
  };

  return (
    <>
      <div className="card product-card">
        <div className="image-wrap" role="button" tabIndex={0} onClick={() => onPreview && onPreview(product)} onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' ') onPreview && onPreview(product); }}>
          <div className="image-scroll">
            {images.map((img, index) => (
              <img key={index} src={img} alt={product.name} onClick={(e) => handleImageClick(index, e)} style={{ cursor: 'zoom-in' }} />
            ))}
          </div>
        </div>
        <div className="card-body">
          <h4 className="product-name">{product.name}</h4>
          {product.description && (
            <p className="product-desc">{product.description}</p>
          )}
          <div className="product-meta">
            <strong className="price">₦{currentPrice.toFixed(2)}</strong>
            {product.setOptions && (
              <div className="set-selector">
                <select
                  value={selectedSet || ''}
                  onChange={(e) => setSelectedSet(e.target.value || null)}
                  className="set-select"
                >
                  <option value="">Select Set</option>
                  {product.setOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} - ₦{opt.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              className="button add-btn"
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              Add
            </button>
          </div>
        </div>
      </div>
      {zoomed && (
        <div className="zoom-overlay" onClick={closeZoom}>
          <img src={images[currentImageIndex]} alt={product.name} className="zoomed-image" />
        </div>
      )}
    </>
  );
}
