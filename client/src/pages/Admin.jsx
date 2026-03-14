import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import styles from './Admin.module.css';

const CATEGORIES = ['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Beauty', 'Sports'];

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('orders');
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', price: '', compareAtPrice: '', category: 'Electronics',
    brand: '', stock: '', images: '', tags: '', isActive: true, isFeatured: false, sku: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login?redirect=admin');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin' && tab === 'products') loadProducts();
  }, [user, tab]);

  const loadOrders = () => api.get('/orders/admin/all').then(({ data }) => setOrders(data)).catch(() => toast.error('Failed to load orders'));
  const loadProducts = () => api.get('/products/admin/all').then(({ data }) => setProducts(data)).catch(() => toast.error('Failed to load products'));

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(o => o.map(or => or._id === orderId ? { ...or, status } : or));
      toast.success('Order updated');
    } catch { toast.error('Failed to update'); }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      name: '', description: '', price: '', compareAtPrice: '', category: 'Electronics',
      brand: '', stock: '', images: '', tags: '', isActive: true, isFeatured: false, sku: ''
    });
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      name: p.name, description: p.description || '', price: p.price || '',
      compareAtPrice: p.compareAtPrice || '', category: p.category || 'Electronics',
      brand: p.brand || '', stock: p.stock ?? '', images: (p.images || []).join('\n'),
      tags: (p.tags || []).join(', '), isActive: p.isActive ?? true, isFeatured: p.isFeatured ?? false,
      sku: p.sku || ''
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock) || 0,
      images: form.images ? form.images.split('\n').map(s => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : []
    };
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product added');
      }
      resetForm();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
      resetForm();
    } catch { toast.error('Failed to delete'); }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className={styles.page}>
      <h1>Admin Dashboard</h1>
      <div className={styles.tabs}>
        <button className={tab === 'orders' ? styles.active : ''} onClick={() => setTab('orders')}>Orders</button>
        <button className={tab === 'products' ? styles.active : ''} onClick={() => setTab('products')}>Products</button>
      </div>

      {tab === 'orders' && (
        <section>
          <h3>Orders</h3>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td>#{o._id?.slice(-8)}</td>
                    <td>{o.user?.name}</td>
                    <td>${o.total?.toFixed(2)}</td>
                    <td><span className={styles[o.status]}>{o.status}</span></td>
                    <td>
                      <select value={o.status} onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'products' && (
        <section>
          <h3>Products</h3>
          <form onSubmit={handleSaveProduct} className={styles.productForm}>
            <div className={styles.formGrid}>
              <div><label>Name</label><input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              <div><label>Category</label>
                <select value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label>Price</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} required /></div>
              <div><label>Compare At Price (optional)</label><input type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} /></div>
              <div><label>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
              <div><label>Brand</label><input value={form.brand} onChange={(e) => setForm(f => ({ ...f, brand: e.target.value }))} /></div>
              <div><label>SKU</label><input value={form.sku} onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. PRD-001" /></div>
              <div className={styles.checkboxes}>
                <label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} /> Active</label>
                <label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm(f => ({ ...f, isFeatured: e.target.checked }))} /> Featured</label>
              </div>
              <div className={styles.fullWidth}><label>Description</label><textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} required /></div>
              <div className={styles.fullWidth}><label>Image URLs (one per line)</label><textarea value={form.images} onChange={(e) => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://..." rows={2} /></div>
              <div className={styles.fullWidth}><label>Tags (comma-separated)</label><input value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="tag1, tag2" /></div>
            </div>
            <div className={styles.formActions}>
              <button type="submit">{editingProduct ? 'Update' : 'Add'} Product</button>
              {editingProduct && <button type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <div className={styles.productList}>
            {products.map(p => (
              <div key={p._id} className={styles.productRow}>
                <img src={p.images?.[0] || 'https://via.placeholder.com/60'} alt="" />
                <div>
                  <strong>{p.name}</strong>
                  <span>{p.category} · ${p.price?.toFixed(2)}</span>
                </div>
                <div className={styles.productActions}>
                  <button onClick={() => openEdit(p)}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteProduct(p._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
