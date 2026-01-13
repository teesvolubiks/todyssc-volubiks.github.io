import React, { useState, useEffect } from 'react';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/data/products.json?t=' + Date.now());
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const updatedProducts = products.map(p =>
        p.id === productId ? { ...p, ...updates } : p
      );
      setProducts(updatedProducts);

      // In production, this would save to a database
      // For now, we'll save to localStorage as a demo
      localStorage.setItem('volubiks_inventory_updates', JSON.stringify({
        productId,
        updates,
        timestamp: Date.now()
      }));

      alert('Product updated successfully!');
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toString().includes(searchTerm);

    let matchesFilter = true;
    if (filter === 'low-stock') {
      matchesFilter = (product.inventory || 0) <= 5 && (product.inventory || 0) > 0;
    } else if (filter === 'out-of-stock') {
      matchesFilter = (product.inventory || 0) === 0;
    }

    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (inventory) => {
    if (!inventory || inventory === 0) return { status: 'Out of Stock', class: 'out-of-stock' };
    if (inventory <= 5) return { status: 'Low Stock', class: 'low-stock' };
    return { status: 'In Stock', class: 'in-stock' };
  };

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <div className="inventory-controls">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input search-input"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input">
            <option value="all">All Products</option>
            <option value="low-stock">Low Stock (≤5)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="inventory-table">
        <div className="table-header">
          <div>Product</div>
          <div>Category</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filteredProducts.map(product => {
          const stockStatus = getStockStatus(product.inventory);
          return (
            <div key={product.id} className="table-row">
              <div className="product-info">
                <img src={product.image} alt={product.name} className="product-thumb" />
                <div>
                  <strong>{product.name}</strong>
                  <small>ID: {product.id}</small>
                </div>
              </div>
              <div>{product.category || 'Uncategorized'}</div>
              <div>₦{product.price?.toFixed(2)}</div>
              <div>{product.inventory || 0}</div>
              <div className={`stock-status ${stockStatus.class}`}>
                {stockStatus.status}
              </div>
              <div className="actions">
                <button
                  className="button small"
                  onClick={() => setEditingProduct(product)}
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingProduct && (
        <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
          <div className="modal-card edit-modal" onClick={e => e.stopPropagation()}>
            <h3>Edit Product</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updates = {
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                inventory: parseInt(formData.get('inventory')),
                category: formData.get('category'),
                description: formData.get('description')
              };
              updateProduct(editingProduct.id, updates);
              setEditingProduct(null);
            }}>
              <div className="form-grid">
                <div>
                  <label>Name</label>
                  <input
                    name="name"
                    defaultValue={editingProduct.name}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label>Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct.price}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label>Inventory</label>
                  <input
                    name="inventory"
                    type="number"
                    defaultValue={editingProduct.inventory || 0}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label>Category</label>
                  <select name="category" defaultValue={editingProduct.category || ''} className="input">
                    <option value="">Uncategorized</option>
                    <option value="jewelries">Jewelries</option>
                    <option value="clothings">Clothings</option>
                    <option value="drinks">Drinks</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct.description}
                  className="input"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="button primary">Save Changes</button>
                <button type="button" className="button ghost" onClick={() => setEditingProduct(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}