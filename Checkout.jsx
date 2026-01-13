import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('rv_cart') || '[]');
  } catch {
    return [];
  }
}

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch latest products from JSON
    const fetchProducts = async () => {
      try {
        const response = await fetch('/data/products.json?t=' + Date.now());
        const data = await response.json();
        
        const normalized = data.map(product => ({
          ...product,
          images: product.images || [],
          image: product.image || ''
        }));
        
        setProducts(normalized);
      } catch (error) {
        console.error('Failed to fetch products from JSON:', error);
      }
    };
    fetchProducts();
    const interval = setInterval(fetchProducts, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function refresh() {
      const c = loadCart();
      // aggregate by id to compute quantities
      const map = {};
      for (const p of c) {
        if (!map[p.id]) map[p.id] = { product: p, qty: 0 };
        map[p.id].qty++;
      }
      let aggregated = Object.values(map);
      // Update prices with latest data if available
      if (products.length > 0) {
        aggregated = aggregated.map(item => {
          const latest = products.find(prod => prod.id === item.product.id);
          if (latest) {
            return { ...item, product: { ...item.product, price: latest.price } };
          }
          return item;
        });
      }
      setItems(aggregated);
    }
    refresh();
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [products]);

  const subtotal = items.reduce((s, it) => s + it.product.price * it.qty, 0);
  const VAT_RATE = 0.10; // 10%
  const vat = +(subtotal * VAT_RATE).toFixed(2);
  const total = +(subtotal + vat).toFixed(2);

  // update cart helper: change is +1 or -1
  const changeQty = (productId, change) => {
    const cart = loadCart();
    if (change > 0) {
      // add one instance of the product; try to reuse product data found in cart or items
      let prod = cart.find(p => p.id === productId);
      if (!prod) {
        const found = items.find(it => it.product.id === productId);
        if (found) prod = found.product;
      }
      if (prod) cart.push(prod);
    } else if (change < 0) {
      // remove one instance of the product
      const idx = cart.findIndex(p => p.id === productId);
      if (idx !== -1) cart.splice(idx, 1);
    }
    localStorage.setItem('rv_cart', JSON.stringify(cart));
    // trigger storage listeners (header) and refresh UI
    window.dispatchEvent(new Event('storage'));

    // recompute aggregated items
    const map = {};
    for (const p of cart) {
      if (!map[p.id]) map[p.id] = { product: p, qty: 0 };
      map[p.id].qty++;
    }
    setItems(Object.values(map));
  };

  return (
    <>
      <Helmet>
        <title>Checkout - aRoyal Volubiks Stores</title>
        <meta name="description" content="Complete your purchase securely at aRoyal Volubiks Stores. Review your cart and proceed to payment." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{ padding: 20 }} className="checkout">
        <h2>Checkout</h2>
        {items.length === 0 ? (
          <div>
            <p>Your cart is empty.</p>
            <Link to="/shop" className="button primary">Go to shop</Link>
          </div>
        ) : (
          <div className="checkout-grid">
            <div className="cart-list">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="cart-item">
                  <div className="cart-image"><img src={product.image} alt={product.name} /></div>
                  <div className="cart-body">
                  <div className="cart-name">{product.name}</div>
                  <div className="cart-meta">
                    <div className="qty-controls">
                      <button className="qty-btn" aria-label={`Decrease ${product.name}`} onClick={() => changeQty(product.id, -1)}>-</button>
                      <span className="qty">{qty}</span>
                      <button className="qty-btn" aria-label={`Increase ${product.name}`} onClick={() => changeQty(product.id, 1)}>+</button>
                    </div>
                      <div className="cart-price">₦{product.price.toFixed(2)} each</div>
                  </div>
                </div>
                <div className="cart-line">₦{(product.price * qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <aside className="checkout-summary">
            <h3>Summary</h3>
            <div className="summary-row"><span>Subtotal</span><strong>₦{subtotal.toFixed(2)}</strong></div>
            <div className="summary-row"><span>VAT (10%)</span><strong>₦{vat.toFixed(2)}</strong></div>
            <div className="summary-total"><span>Total</span><strong>₦{total.toFixed(2)}</strong></div> 

            <Link to="/payment" state={{ subtotal, vat, total }} className="button primary" style={{ display: 'block', marginTop: 12 }}>Proceed to Payment</Link>
            <Link to="/shop" className="button ghost" style={{ display: 'block', marginTop: 8 }}>Continue shopping</Link>
          </aside>
        </div>
      )}
    </div>
    </>
  );
}
