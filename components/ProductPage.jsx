import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function ProductPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);

  React.useEffect(() => {
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
    const interval = setInterval(fetchProducts, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const product = products.find(p => p.id === id || p.slug === id);
  if (!product) return (
    <div style={{ padding: 20 }}>
      <p>Product not found. <Link to="/shop">Back to shop</Link></p>
    </div>
  );

  const images = (product.images && product.images.length) ? product.images : (product.image ? [product.image] : []);
  const [active, setActive] = useState(0);

  const title = `${product.name} - Volubiks Jewelry`;
  const description = product.description || `Discover ${product.name}, a beautiful piece of jewelry from Volubiks. Price: ₦${product.price.toFixed(2)}.`;
  const keywords = `jewelry, ${product.name}, Volubiks, buy online`;
  const imageUrl = images[0] || '/default-image.jpg'; // Fallback image
  const productUrl = `${window.location.origin}/product/${product.id || product.slug}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": description,
    "image": images,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "NGN",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Volubiks"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div style={{ padding: 20 }} className="product-page">
        <p><Link to="/shop">← Back to shop</Link></p>
        <div className="product-detail">
          <div className="gallery">
            <div className="main-image">
              {images[active] ? <img src={images[active]} alt={product.name} /> : <div className="no-image">No image</div>}
            </div>
            {images.length > 1 && (
              <div className="thumbs">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className={i === active ? 'active' : ''}
                    onClick={() => setActive(i)}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="info">
            <h2>{product.name}</h2>
            <p><strong>₦{product.price.toFixed(2)}</strong></p>
            <p>{product.description}</p>
            <button
              className="button add-btn"
              onClick={() => {
                try {
                  const cart = JSON.parse(localStorage.getItem('rv_cart') || '[]');
                  cart.push(product);
                  localStorage.setItem('rv_cart', JSON.stringify(cart));
                  window.dispatchEvent(new Event('storage'));
                } catch (e) {
                  // ignore
                }
              }}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
