import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SocialMediaPoster() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [caption, setCaption] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [includePrice, setIncludePrice] = useState(true);
  const [includeBrand, setIncludeBrand] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#111827');
  const [fontStyle, setFontStyle] = useState('serif');
  const posterRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/data/products.json?t=' + Date.now(), { cache: 'no-cache' });
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const defaultCaption = `✨ ${selectedProduct.name} ✨\n\n${selectedProduct.description || ''}\n\n💎 Price: ₦${selectedProduct.price.toFixed(2)}\n\n🛒 Shop now at Volubiks!\n\n#Volubiks #Jewelry #Fashion #Nigeria`;
      setCaption(defaultCaption);
    }
  }, [selectedProduct]);

  const selectedImages = selectedProduct?.images || (selectedProduct?.image ? [selectedProduct.image] : []);
  const currentPrice = selectedProduct?.selectedSet 
    ? selectedProduct.setOptions?.find(opt => opt.id === selectedProduct.selectedSet)?.price || selectedProduct.price
    : selectedProduct?.price || 0;

  const downloadPoster = async () => {
    if (!posterRef.current) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: backgroundColor,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${selectedProduct?.name.replace(/\s+/g, '_')}_poster.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to download poster:', error);
      alert('Failed to download poster. Please try again.');
    }
  };

  const shareToWhatsApp = () => {
    if (!selectedProduct) return;
    const productUrl = `${window.location.origin}/product/${selectedProduct.id}`;
    const text = `${caption}\n\n${productUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToTwitter = () => {
    if (!selectedProduct) return;
    const productUrl = `${window.location.origin}/product/${selectedProduct.id}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(productUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareToFacebook = () => {
    if (!selectedProduct) return;
    const productUrl = `${window.location.origin}/product/${selectedProduct.id}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(caption)}`;
    window.open(fbUrl, '_blank');
  };

  const downloadForWhatsAppStatus = async () => {
    if (!posterRef.current || !selectedProduct) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(posterRef.current, {
        scale: 1,
        backgroundColor: backgroundColor,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1080,
        height: 1920,
      });

      const link = document.createElement('a');
      link.download = `${selectedProduct.name.replace(/\s+/g, '_')}_status.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    } catch (error) {
      console.error('Failed to download for WhatsApp Status:', error);
      alert('Failed to download. Please try again.');
    }
  };

  return (
    <div className="social-poster-page">
      <div className="poster-header">
        <h1>📱 Social Media Poster</h1>
        <p>Create beautiful product posters for social media & WhatsApp Status</p>
      </div>

      <div className="poster-container">
        <div className="poster-controls">
          <div className="control-section">
            <h3>1. Select Product</h3>
            <select 
              className="product-select"
              value={selectedProduct?.id || ''}
              onChange={(e) => {
                const product = products.find(p => p.id === e.target.value);
                setSelectedProduct(product);
                setSelectedImageIndex(0);
              }}
            >
              <option value="">Choose a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ₦{product.price.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {selectedImages.length > 1 && (
            <div className="control-section">
              <h3>2. Select Image</h3>
              <div className="image-thumbnails">
                {selectedImages.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt={`${selectedProduct.name} ${index + 1}`}
                    className={index === selectedImageIndex ? 'selected' : ''}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="control-section">
            <h3>{selectedImages.length > 1 ? '3' : '2'}. Caption</h3>
            <textarea 
              className="caption-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              placeholder="Enter your caption..."
            />
          </div>

          <div className="control-section">
            <h3>{selectedImages.length > 1 ? '4' : '3'}. Style Options</h3>
            <div className="style-options">
              <div className="option-group">
                <label>Background:</label>
                <input 
                  type="color" 
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                />
              </div>
              <div className="option-group">
                <label>Text:</label>
                <input 
                  type="color" 
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
              </div>
              <div className="option-group">
                <label>Font:</label>
                <select value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
                  <option value="serif">Serif</option>
                  <option value="sans">Sans</option>
                </select>
              </div>
              <div className="option-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={includePrice}
                    onChange={(e) => setIncludePrice(e.target.checked)}
                  />
                  Price
                </label>
              </div>
              <div className="option-group checkbox">
                <label>
                  <input 
                    type="checkbox" 
                    checked={includeBrand}
                    onChange={(e) => setIncludeBrand(e.target.checked)}
                  />
                  Brand
                </label>
              </div>
            </div>
          </div>

          {selectedProduct && (
            <div className="control-section">
              <h3>Download & Share</h3>
              <div className="download-buttons">
                <button className="download-btn primary" onClick={downloadPoster}>
                  📥 Poster (Square)
                </button>
                <button className="download-btn secondary" onClick={downloadForWhatsAppStatus}>
                  📱 Status (9:16)
                </button>
                <button className="download-btn whatsapp" onClick={shareToWhatsApp}>
                  💬 WhatsApp
                </button>
                <button className="download-btn twitter" onClick={shareToTwitter}>
                  🐦 X/Twitter
                </button>
                <button className="download-btn facebook" onClick={shareToFacebook}>
                  📘 Facebook
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="poster-preview">
          <h3>Preview</h3>
          <div className="preview-container">
            <div 
              ref={posterRef}
              className="poster-preview-card"
              style={{ 
                backgroundColor: backgroundColor,
                color: textColor,
                fontFamily: fontStyle === 'serif' ? "'Times New Roman', Times, serif" : "system-ui, sans-serif"
              }}
            >
              {selectedProduct && (
                <>
                  <div className="poster-image-container">
                    <img 
                      src={selectedImages[selectedImageIndex]} 
                      alt={selectedProduct.name}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="poster-content">
                    {includeBrand && (
                      <div className="poster-brand">✨ Volubiks Jewelry ✨</div>
                    )}
                    <h2 className="poster-title">{selectedProduct.name}</h2>
                    {includePrice && (
                      <p className="poster-price">💎 ₦{currentPrice.toFixed(2)}</p>
                    )}
                    <p className="poster-description">
                      {selectedProduct.description?.substring(0, 100)}
                      {selectedProduct.description?.length > 100 ? '...' : ''}
                    </p>
                    <div className="poster-footer">
                      <span className="poster-cta">🛒 Shop volubiks.com</span>
                      <div className="poster-hashtags">#Volubiks #Jewelry</div>
                    </div>
                  </div>
                </>
              )}
              {!selectedProduct && (
                <div className="poster-empty">
                  <p>Select a product to create your poster</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .social-poster-page {
          padding: 16px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .poster-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .poster-header h1 {
          font-size: 1.5rem;
          margin-bottom: 8px;
        }

        .poster-header p {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .poster-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 800px) {
          .poster-container {
            grid-template-columns: 1fr;
          }
          
          .poster-preview {
            order: -1;
          }
        }

        .poster-controls {
          background: var(--surface);
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .control-section {
          margin-bottom: 16px;
        }

        .control-section h3 {
          font-size: 0.9rem;
          margin-bottom: 8px;
          color: var(--text);
        }

        .product-select {
          width: 100%;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
        }

        .image-thumbnails {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .image-thumbnails img {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.2s;
        }

        .image-thumbnails img.selected {
          border-color: var(--accent-2);
        }

        .caption-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
        }

        .style-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .option-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .option-group input[type="color"] {
          width: 36px;
          height: 28px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .option-group select {
          padding: 6px 10px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 13px;
        }

        .download-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .download-btn {
          flex: 1;
          min-width: 120px;
          padding: 10px 12px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        @media (max-width: 480px) {
          .download-btn {
            min-width: 100%;
          }
        }

        .download-btn:hover {
          transform: translateY(-2px);
        }

        .download-btn.primary { background: var(--accent); color: white; }
        .download-btn.secondary { background: var(--accent-2); color: white; }
        .download-btn.whatsapp { background: #25D366; color: white; }
        .download-btn.twitter { background: #000000; color: white; }
        .download-btn.facebook { background: #1877F2; color: white; }

        .poster-preview {
          background: var(--surface);
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .poster-preview h3 {
          margin-bottom: 12px;
          font-size: 0.95rem;
        }

        .preview-container {
          display: flex;
          justify-content: center;
          overflow-x: auto;
        }

        .poster-preview-card {
          width: 300px;
          min-height: 420px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        @media (max-width: 360px) {
          .poster-preview-card {
            width: 260px;
            min-height: 380px;
          }
        }

        .poster-image-container {
          width: 100%;
          height: 260px;
          overflow: hidden;
        }

        .poster-image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .poster-content {
          padding: 14px;
          flex: 1;
        }

        .poster-brand {
          font-size: 11px;
          text-align: center;
          margin-bottom: 6px;
          opacity: 0.8;
        }

        .poster-title {
          font-size: 16px;
          margin: 0 0 6px 0;
          text-align: center;
          line-height: 1.2;
        }

        .poster-price {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
          margin: 0 0 8px 0;
          color: var(--accent-2);
        }

        .poster-description {
          font-size: 11px;
          line-height: 1.4;
          margin: 0 0 10px 0;
          opacity: 0.9;
        }

        .poster-footer {
          text-align: center;
          padding-top: 8px;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        .poster-cta {
          display: block;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .poster-hashtags {
          font-size: 10px;
          opacity: 0.7;
        }

        .poster-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          color: var(--muted);
          padding: 20px;
        }

        @media (max-width: 600px) {
          .social-poster-page {
            padding: 12px;
          }
          
          .poster-header h1 {
            font-size: 1.25rem;
          }
          
          .poster-controls {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}

