import React, { useEffect, useState } from 'react';

export default function ProductModal({ product, open, onClose, onAdd }) {
  const [closing, setClosing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState('');
  const ANIM_MS = 220;

  // Do not render if modal is closed or product is not provided
  if (!open || !product) return null;

  // Get images first before any function uses them; resolve base for assets
  const base = import.meta.env.BASE_URL || '/';
  const imagesRaw = (product.images && product.images.length) ? product.images.filter(img => !img.startsWith('data:image')) : (product.image ? [product.image] : []);
  const images = imagesRaw.map(img => (img && img.startsWith('/') ? base + img.slice(1) : img));

  function closeWithAnim() {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setCurrentImageIndex(0);
      setZoomed(false);
      if (onClose) onClose();
    }, ANIM_MS);
  }

  // Get current price based on selected set
  const currentPrice = selectedSet !== null && product.setOptions
    ? product.setOptions.find(opt => opt.id === selectedSet)?.price || product.price
    : product.price;

  // Get product URL
  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/product/${product.id}`
    : '';
  const shareText = `Check out ${product.name} - ₦${currentPrice.toFixed(2)}`;
  const fullShareText = `${shareText}\n${productUrl}`;

  // Share to WhatsApp
  function onShareWhatsApp() {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullShareText)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Share to WhatsApp Status (downloads image for manual sharing)
  function onShareWhatsAppStatus() {
    const imageUrl = images[currentImageIndex] || images[0];
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${product.name.replace(/\s+/g, '_')}_Volubiks.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setCopyFeedback('Image downloading! Share to WhatsApp Status from your gallery.');
      setTimeout(() => setCopyFeedback(''), 4000);
    }
  }

  // Share to Facebook
  function onShareFacebook() {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank');
  }

  // Share to Twitter/X
  function onShareTwitter() {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`;
    window.open(twitterUrl, '_blank');
  }

  // Share to Instagram (copy link for story)
  function onShareInstagram() {
    navigator.clipboard.writeText(productUrl)
      .then(() => {
        setCopyFeedback('Link copied! Open Instagram and paste in your story.');
        setTimeout(() => setCopyFeedback(''), 3000);
      })
      .catch(err => console.error('Failed to copy:', err));
  }

  // Copy link to clipboard
  function onCopyLink() {
    navigator.clipboard.writeText(fullShareText)
      .then(() => {
        setCopyFeedback('Link copied to clipboard!');
        setTimeout(() => setCopyFeedback(''), 3000);
      })
      .catch(err => console.error('Failed to copy:', err));
  }

  const toggleZoom = () => {
    setZoomed(!zoomed);
  };

  const handleAddToCart = () => {
    const productToAdd = selectedSet && product.setOptions
      ? { ...product, price: currentPrice, selectedSet }
      : { ...product, selectedSet };
    onAdd(productToAdd);
    closeWithAnim();
  };

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
            <p className="price">₦{currentPrice.toFixed(2)}</p>
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
            <p className="short-desc">{product.description}</p>
            
            {/* Social Media Share Buttons */}
            <div className="social-share-buttons">
              <button 
                className="social-share-btn whatsapp" 
                onClick={onShareWhatsApp}
                title="Share on WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
              
              <button 
                className="social-share-btn whatsapp-status" 
                onClick={onShareWhatsAppStatus}
                title="Download for WhatsApp Status"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 2a10 10 0 0 0-7.05 16.95l.7-.7a8 8 0 0 1 12.7-12.7l-.35.35z"/>
                </svg>
              </button>
              
              <button 
                className="social-share-btn facebook" 
                onClick={onShareFacebook}
                title="Share on Facebook"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              
              <button 
                className="social-share-btn twitter" 
                onClick={onShareTwitter}
                title="Share on X/Twitter"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              
              <button 
                className="social-share-btn instagram" 
                onClick={onShareInstagram}
                title="Share on Instagram"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
              
              <button 
                className="social-share-btn copy-link" 
                onClick={onCopyLink}
                title="Copy Link"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              </button>
            </div>
            
            {copyFeedback && (
              <div className="share-feedback">{copyFeedback}</div>
            )}
            
            <div className="modal-actions">
              <button className="button add-btn" onClick={handleAddToCart}>Add to cart</button>
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

