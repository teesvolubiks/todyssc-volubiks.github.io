import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import { Helmet } from 'react-helmet-async';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Keep original query for display, sanitize only for search logic
  const qOriginal = (searchParams.get('q') || '').trim();
  const q = qOriginal.toLowerCase();
  const categoryParam = searchParams.get('category') || '';
  // Use lowercase category for comparison but preserve original for display
  const category = categoryParam.toLowerCase();
  
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [preview, setPreview] = React.useState(null);

  // Placeholder image for missing images
  const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjgiIGhlaWdodD0iNjgiIHZpZXdCb3g9IjAgMCA2OCA2OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  // Helper to check if URL exists — resolve with Vite base for GitHub Pages/subpath deploys
  async function urlExists(url) {
    try {
      const base = import.meta.env.BASE_URL || '/';
      const absoluteUrl = new URL(url, window.location.origin + base).toString();
      const res = await fetch(absoluteUrl, { method: 'HEAD' });
      return res && res.ok;
    } catch (e) {
      console.warn('urlExists failed for:', url, e);
      return false;
    }
  }

  // Function to expand image sets (e.g., C1_1, C1_2, C1_3, etc.)
  async function expandImageSets(product) {
    const imgs = Array.isArray(product.images) ? [...product.images] : [];
    const primaryImage = product.image || '';
    
    // If primary image exists and looks like '.../C1_1.jpg' or '.../name_1.jpg'
    const match = primaryImage.match(/(\/data\/images\/)([A-Za-z0-9\-]+?)_(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (match) {
      const prefix = match[1];
      const base = match[2];
      const ext = match[4] || 'jpg';

      // Probe up to 6 variants and collect those that exist
      for (let i = 1; i <= 6; i++) {
        const candidate = `${prefix}${base}_${i}.${ext}`;
        if (!imgs.includes(candidate) && await urlExists(candidate)) {
          imgs.push(candidate);
        }
      }
    }

    // Ensure at least 4 images (fill with placeholder)
    while (imgs.length < 4) imgs.push(placeholder);

    return { ...product, images: imgs };
  }

  // Fetch products on mount
  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching products from data/products.json...');
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}data/products.json?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched products count:', Array.isArray(data) ? data.length : 0);
        
        if (!Array.isArray(data)) {
          console.error('Products data is not an array:', data);
          throw new Error('Products data is not an array');
        }
        
        // Normalize products and expand image sets
        const normalizedBase = data.map(p => ({ 
          ...p, 
          images: p.images || [], 
          image: p.image || '',
          name: p.name || 'Unnamed Product',
          category: p.category || 'uncategorized'
        }));

        console.log('Processing', normalizedBase.length, 'products...');
        const expanded = await Promise.all(normalizedBase.map(expandImageSets));
        console.log('Processed products:', expanded.length);
        setProducts(expanded);
      } catch (error) {
        console.error('Failed to fetch products from JSON:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Improved search: token matching + simple fuzzy (Levenshtein) scoring and ranking
  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  }

  function scoreForProduct(p, query) {
    if (!query) return 0;
    const name = (p.name || '').toLowerCase();
    const id = (p.id || '').toLowerCase();
    let score = 0;

    // Exact contains -> strong score
    if (name.includes(query) || id.includes(query)) score += 100;

    // Token matching: give points for each token found
    const tokens = query.split(/\s+/).filter(Boolean);
    for (const t of tokens) {
      if (name.includes(t)) score += 12;
      if (id.includes(t)) score += 8;
    }

    // Fuzzy similarity between query and name (normalized)
    const dist = levenshtein(query, name);
    const maxLen = Math.max(query.length, name.length, 1);
    const similarity = 1 - dist / maxLen; // 0..1 (may be negative for very different strings)
    if (similarity > 0) score += Math.round(similarity * 50);

    return score;
  }

  let results = products;
  
  // Filter by category (case-insensitive)
  if (category) {
    const categoryLower = category.toLowerCase();
    results = results.filter(p => (p.category || '').toLowerCase() === categoryLower);
    console.log('Filtered by category:', category, '- Found:', results.length);
  }
  
  // Filter by search query
  if (q) {
    const scored = results.map((p) => ({ p, score: scoreForProduct(p, q) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.p);
    // If no scored results, fall back to substring search (so user still sees something)
    results = scored.length ? scored : results.filter(p => 
      (p.name || '').toLowerCase().includes(q) || 
      (p.id || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    console.log('Filtered by search:', q, '- Found:', results.length);
  }

  // Clear all filters
  const clearFilters = () => {
    navigate('/shop');
  };

  const onAdd = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('rv_cart') || '[]');
      cart.push(product);
      localStorage.setItem('rv_cart', JSON.stringify(cart));
      // trigger storage listener (also used by Header) so cart count updates
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      // ignore
    }
  };

  const onPreview = (product) => setPreview(product);
  const closePreview = () => setPreview(null);

  return (
    <>
      <Helmet>
        <title>Shop - Volubiks</title>
        <meta name="description" content="Browse our collection of quality products at Volubiks Stores" />
      </Helmet>
      
      <div style={{ padding: 20 }}>

        {loading ? (
          <div className="loading-skeleton">
            <div className="product-grid dense">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-price"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="error-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#dc2626', marginBottom: '16px' }}>Error loading products: {error}</p>
            <button 
              className="button primary" 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ marginBottom: '16px' }}>No products found.</p>
            {(q || category) && (
              <button 
                className="button primary" 
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="product-grid dense">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} onPreview={onPreview} />
            ))}
          </div>
        )}

        <ProductModal product={preview} open={Boolean(preview)} onClose={closePreview} onAdd={(p) => { onAdd(p); closePreview(); }} />
      </div>
    </>
  );
}

