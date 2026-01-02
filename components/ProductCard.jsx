import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAdd, onPreview }) {
  const images = (product.images && product.images.length) ? product.images : [product.image];
  return (
    <div className="card product-card">
      <div className="image-wrap" role="button" tabIndex={0} onClick={() => onPreview && onPreview(product)} onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' ') onPreview && onPreview(product); }}>
        <div className="image-scroll">
          {images.map((img, index) => (
            <img key={index} src={img} alt={product.name} />
          ))}
        </div>
      </div>
      <div className="card-body">
        <h4 className="product-name">{product.name}</h4>
        {product.description && (
          <p className="product-desc">{product.description}</p>
        )}
        <div className="product-meta">
          <strong className="price">₦{product.price.toFixed(2)}</strong>
          <button
            className="button add-btn"
            onClick={() => onAdd(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
