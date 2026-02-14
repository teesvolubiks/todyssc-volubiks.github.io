import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAdd, onPreview }) {
  const [zoomed, setZoomed] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSet, setSelectedSet] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const rawImages = (product.images && product.images.length) ? product.images : (product.image ? [product.image] : []);
  const base = import.meta.env.BASE_URL || '/';
  const resolve = (p) => (p && p.startsWith('/') ? base + p.slice(1) : p);
  const images = rawImages.slice(0, 2).map(resolve);

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

  // Get product share URL
  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/product/${product.id}`
    : '';
  const shareText = `Check out ${product.name} - ₦${currentPrice.toFixed(2)}`;
  const fullShareText = `${shareText}\n${productUrl}`;

  // Share to Facebook
  const handleShareFacebook = (e) => {
    e.stopPropagation();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (e) => {
    e.stopPropagation();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Share to WhatsApp Status (download image)
  const handleShareWhatsAppStatus = (e) => {
    e.stopPropagation();
    const imageUrl = images[currentImageIndex] || images[0];
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${product.name.replace(/\s+/g, '_')}_Volubiks.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Share to Instagram (copy link)
  const handleShareInstagram = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(productUrl)
      .then(() => {
        alert('Link copied! Open Instagram and paste in your story.');
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  // Share to TikTok
  const handleShareTikTok = (e) => {
    e.stopPropagation();
    const tiktokUrl = `https://www.tiktok.com/share?url=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(tiktokUrl, '_blank');
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
            <strong className="price">₦{(Number(currentPrice) || 0).toFixed(2)}</strong>
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
            <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
              <button
                className="button add-btn"
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
              >
                Add
              </button>
              <button
                className="button secondary"
                onClick={(e) => { e.stopPropagation(); setZoomed(true); }}
                aria-label="View enlarged"
                title="View enlarged"
              >
                👁️
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  className="button secondary"
                  onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
                  aria-label="Share"
                  title="Share to social media"
                >
                  📤
                </button>
                {showShareMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    minWidth: 150,
                    marginTop: 4
                  }}>
                    <button onClick={handleShareFacebook} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>📘 Facebook</button>
                    <button onClick={handleShareWhatsApp} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>💬 WhatsApp</button>
                    <button onClick={handleShareWhatsAppStatus} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>📲 WhatsApp Status</button>
                    <button onClick={handleShareInstagram} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>📷 Instagram</button>
                    <button onClick={handleShareTikTok} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13 }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>🎵 TikTok</button>
                  </div>
                )}
              </div>
            </div>
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
