import API from '../api';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Clothing', 'Bags', 'Accessories', 'Jewellery', 'Footwear', 'Other'];
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_COLOR = {
  pending:    { bg: 'rgba(201,168,76,0.12)',  color: '#c9a84c', border: 'rgba(201,168,76,0.3)'  },
  processing: { bg: 'rgba(100,149,237,0.12)', color: '#6495ed', border: 'rgba(100,149,237,0.3)' },
  shipped:    { bg: 'rgba(92,186,138,0.12)',  color: '#5cba8a', border: 'rgba(92,186,138,0.3)'  },
  delivered:  { bg: 'rgba(92,186,138,0.18)',  color: '#4ade80', border: 'rgba(92,186,138,0.4)'  },
  cancelled:  { bg: 'rgba(224,92,92,0.12)',   color: '#e05c5c', border: 'rgba(224,92,92,0.3)'   },
};

const EMPTY_PRODUCT = { name: '', category: 'Clothing', price: '', originalPrice: '', stock: '', description: '', image: '', tags: [], featured: false };

export default function AdminDashboard() {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editProduct, setEditProduct] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);

  // Search/filter
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    setLoading(true);
    const [s, p, o] = await Promise.all([
      fetch(`${API}/api/stats`).then(r => r.json()),
      fetch(`${API}/api/products`).then(r => r.json()),
      authFetch(`${API}/api/orders`).then(r => r.json()),
    ]);
    setStats(s);
    setProducts(Array.isArray(p) ? p : []);
    setOrders(Array.isArray(o) ? o : []);
    setLoading(false);
  };

  // ── Product actions ──
  const openAdd = () => { setEditProduct(EMPTY_PRODUCT); setFormError(''); setModal('add'); };
  const openEdit = (p) => { setEditProduct({ ...p, price: p.price.toString(), originalPrice: p.originalPrice.toString(), stock: p.stock.toString() }); setFormError(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditProduct(EMPTY_PRODUCT); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setFormError('');
    try {
      const payload = {
        ...editProduct,
        price: parseFloat(editProduct.price),
        originalPrice: parseFloat(editProduct.originalPrice || editProduct.price),
        stock: parseInt(editProduct.stock),
      };
      if (!payload.name || isNaN(payload.price)) { setFormError('Name and valid price are required.'); return; }
      let res, data;
      if (modal === 'add') {
        res = await authFetch(`${API}/api/products`, { method: 'POST', body: JSON.stringify(payload) });
        data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProducts(prev => [...prev, data]);
      } else {
        res = await authFetch(`${API}/api/products/${editProduct.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProducts(prev => prev.map(p => p.id === editProduct.id ? data : p));
      }
      closeModal();
      loadStats();
    } catch (err) { setFormError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    await authFetch(`${API}/api/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteId(null);
    loadStats();
  };

  const handleStatusChange = async (orderId, status) => {
    await authFetch(`${API}/api/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const loadStats = () => fetch(`${API}/api/stats`).then(r => r.json()).then(setStats);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );
  const filteredOrders = orders.filter(o =>
    o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.status?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const totalRevenue = parseFloat(stats?.revenue || 0);
  const lowStock = products.filter(p => p.stock <= 5).length;

  // ── Styles ──
  const S = {
    page: { maxWidth: 1200, margin: '0 auto', padding: '36px 32px' },
    tab: (active) => ({
      padding: '9px 22px', borderRadius: 40, border: `1px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
      background: active ? 'var(--gold-dim)' : 'transparent',
      color: active ? 'var(--gold)' : 'var(--text2)',
      fontFamily: 'var(--font)', fontWeight: 500, fontSize: 13,
      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
    }),
    statCard: (color) => ({
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '22px 24px', position: 'relative', overflow: 'hidden',
    }),
    th: { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
    td: { padding: '14px 16px', borderBottom: '1px solid var(--border)', fontSize: 14, verticalAlign: 'middle' },
    input: { background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 14, padding: '10px 14px', width: '100%', outline: 'none' },
    label: { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 32 }}>⚙️</div>
      <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text3)' }}>Loading admin dashboard...</div>
    </div>
  );

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span className="eyebrow">SmartCart Hub</span>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36 }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>Welcome back, {user?.name} · Full store control</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd} style={{ gap: 8 }}>
          + Add New Product
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, color: 'var(--gold)',  sub: `${orders.length} orders total`, icon: '💰' },
          { label: 'Products',      value: products.length,               color: 'var(--gold2)', sub: `${lowStock} low stock items`,  icon: '📦' },
          { label: 'Orders',        value: orders.length,                 color: 'var(--green)', sub: `${orders.filter(o=>o.status==='pending').length} pending`,      icon: '🛒' },
          { label: 'Customers',     value: stats?.customers ?? 0,         color: 'var(--text2)', sub: 'registered accounts',          icon: '👤' },
        ].map((s, i) => (
          <div key={i} style={S.statCard(s.color)}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'products', label: `📦 Products (${products.length})` },
          { id: 'orders',   label: `🛒 Orders (${orders.length})` },
        ].map(t => (
          <button key={t.id} style={S.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent orders */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>Recent Orders</h3>
              <button style={{ ...S.tab(false), padding: '5px 14px', fontSize: 12 }} onClick={() => setTab('orders')}>View all</button>
            </div>
            {orders.slice(0, 5).map(o => {
              const sc = STATUS_COLOR[o.status] || STATUS_COLOR.pending;
              return (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gold)' }}>{o.orderNumber}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--serif)' }}>₵{o.total.toFixed(2)}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.8, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{o.status}</span>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic' }}>No orders yet</div>}
          </div>

          {/* Low stock alert */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>⚠ Low Stock Alert</h3>
              <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>{lowStock} item{lowStock !== 1 ? 's' : ''}</span>
            </div>
            {products.filter(p => p.stock <= 5).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                <img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: p.stock === 0 ? 'var(--red)' : 'var(--amber)', marginTop: 2 }}>{p.stock === 0 ? 'Out of stock' : `Only ${p.stock} left`}</div>
                </div>
                <button className="btn btn-outline" style={{ fontSize: 11, padding: '5px 12px', flexShrink: 0 }} onClick={() => openEdit(p)}>Edit</button>
              </div>
            ))}
            {lowStock === 0 && <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--green)', fontStyle: 'italic', fontSize: 14 }}>✓ All products well stocked</div>}
          </div>

          {/* Category breakdown */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, marginBottom: 20 }}>Products by Category</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12 }}>
              {[...new Set(products.map(p => p.category))].map(cat => {
                const count = products.filter(p => p.category === cat).length;
                const pct = Math.round((count / products.length) * 100);
                return (
                  <div key={cat} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px', cursor: 'pointer' }} onClick={() => { setTab('products'); setProductSearch(cat); }}>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, letterSpacing: 0.5 }}>{cat}</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: 8 }}>{count}</div>
                    <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold), var(--gold2))', borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ PRODUCTS TAB ══ */}
      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 14, flexWrap: 'wrap' }}>
            <input placeholder="Search products by name or category..." value={productSearch} onChange={e => setProductSearch(e.target.value)} style={{ ...S.input, maxWidth: 340 }} />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</div>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)' }}>
                  <th style={S.th}>Product</th>
                  <th style={S.th}>Category</th>
                  <th style={S.th}>Price</th>
                  <th style={S.th}>Original</th>
                  <th style={S.th}>Stock</th>
                  <th style={S.th}>Rating</th>
                  <th style={S.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} style={{ transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.image} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{p.tags?.join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}><span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--border2)', fontWeight: 600 }}>{p.category}</span></td>
                    <td style={{ ...S.td, fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>₵{p.price.toFixed(2)}</td>
                    <td style={{ ...S.td, color: 'var(--text3)', textDecoration: p.originalPrice > p.price ? 'line-through' : 'none', fontSize: 13 }}>₵{p.originalPrice.toFixed(2)}</td>
                    <td style={S.td}>
                      <span style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--red)' : p.stock <= 5 ? 'var(--amber)' : 'var(--green)', fontSize: 14 }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={S.td}>
                      <span style={{ color: 'var(--gold)', fontSize: 12 }}>★ {p.rating} <span style={{ color: 'var(--text3)' }}>({p.reviews})</span></span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => openEdit(p)}>✎ Edit</button>
                        <button onClick={() => setDeleteId(p.id)} style={{ padding: '6px 14px', borderRadius: 'var(--radius)', border: '1px solid rgba(224,92,92,0.3)', background: 'rgba(224,92,92,0.08)', color: 'var(--red)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}>✕ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic' }}>No products found.</div>
            )}
          </div>
        </div>
      )}

      {/* ══ ORDERS TAB ══ */}
      {tab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 14, flexWrap: 'wrap' }}>
            <input placeholder="Search by order number or status..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)} style={{ ...S.input, maxWidth: 340 }} />
            <div style={{ fontSize: 13, color: 'var(--text3)' }}>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</div>
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)' }}>
                  <th style={S.th}>Order</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Items</th>
                  <th style={S.th}>Total</th>
                  <th style={S.th}>Payment</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Update</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const sc = STATUS_COLOR[o.status] || STATUS_COLOR.pending;
                  return (
                    <tr key={o.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={S.td}>
                        <div style={{ fontWeight: 700, color: 'var(--gold)', fontFamily: 'var(--serif)', fontSize: 14 }}>{o.orderNumber}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.delivery feeAddress?.city}, {o.delivery feeAddress?.country}</div>
                      </td>
                      <td style={{ ...S.td, fontSize: 13, color: 'var(--text2)' }}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {o.items.slice(0, 3).map(item => (
                            <img key={item.productId} src={item.image} alt={item.name} title={`${item.name} ×${item.quantity}`} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid var(--border)' }} />
                          ))}
                          {o.items.length > 3 && <span style={{ width: 32, height: 32, borderRadius: 4, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--text3)' }}>+{o.items.length - 3}</span>}
                        </div>
                      </td>
                      <td style={{ ...S.td, fontFamily: 'var(--serif)', fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>₵{o.total.toFixed(2)}</td>
                      <td style={{ ...S.td, fontSize: 12, color: 'var(--text3)', textTransform: 'capitalize' }}>{o.paymentMethod?.replace('_', ' ')}</td>
                      <td style={S.td}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 0.8, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap' }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={S.td}>
                        <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                          style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, padding: '6px 10px', outline: 'none', cursor: 'pointer', width: 'auto' }}>
                          {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text3)', fontStyle: 'italic' }}>No orders found.</div>
            )}
          </div>
        </div>
      )}

      {/* ══ ADD / EDIT PRODUCT MODAL ══ */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, padding: 24, backdropFilter: 'blur(6px)' }}>
          <div className="fade-in" style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
            {/* Top gold line */}
            <div style={{ position: 'sticky', top: 0, background: 'var(--panel)', borderBottom: '1px solid var(--border)', padding: '20px 28px', zIndex: 1 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{modal === 'add' ? '+ Add New Product' : '✎ Edit Product'}</h2>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
              </div>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={S.label}>Product name *</label>
                  <input style={S.input} value={editProduct.name} onChange={e => setEditProduct(p => ({...p, name: e.target.value}))} placeholder="e.g. Premium Leather Tote Bag" required />
                </div>
                <div>
                  <label style={S.label}>Category</label>
                  <select style={S.input} value={editProduct.category} onChange={e => setEditProduct(p => ({...p, category: e.target.value}))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Stock quantity</label>
                  <input style={S.input} type="number" min="0" value={editProduct.stock} onChange={e => setEditProduct(p => ({...p, stock: e.target.value}))} placeholder="0" />
                </div>
                <div>
                  <label style={S.label}>Selling price ($) *</label>
                  <input style={{ ...S.input, color: 'var(--gold)', fontWeight: 700 }} type="number" step="0.01" min="0" value={editProduct.price} onChange={e => setEditProduct(p => ({...p, price: e.target.value}))} placeholder="99.99" required />
                </div>
                <div>
                  <label style={S.label}>Original price ($) <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none', fontSize: 10 }}>for discount display</span></label>
                  <input style={S.input} type="number" step="0.01" min="0" value={editProduct.originalPrice} onChange={e => setEditProduct(p => ({...p, originalPrice: e.target.value}))} placeholder="Same as price if no discount" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={S.label}>Description</label>
                  <textarea style={{ ...S.input, resize: 'vertical', minHeight: 80 }} value={editProduct.description} onChange={e => setEditProduct(p => ({...p, description: e.target.value}))} placeholder="Describe the product..." rows={3} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={S.label}>Image URL</label>
                  <input style={S.input} value={editProduct.image} onChange={e => setEditProduct(p => ({...p, image: e.target.value}))} placeholder="https://images.unsplash.com/..." />
                </div>
                {editProduct.image && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <img src={editProduct.image} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={S.label}>Tags</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['bestseller', 'new', 'sale'].map(tag => (
                      <label key={tag} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 20, border: `1px solid ${editProduct.tags?.includes(tag) ? 'var(--gold)' : 'var(--border)'}`, background: editProduct.tags?.includes(tag) ? 'var(--gold-dim)' : 'transparent', cursor: 'pointer', fontSize: 13, color: editProduct.tags?.includes(tag) ? 'var(--gold)' : 'var(--text2)', transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={editProduct.tags?.includes(tag)} onChange={e => setEditProduct(p => ({ ...p, tags: e.target.checked ? [...(p.tags||[]), tag] : (p.tags||[]).filter(t => t !== tag) }))} style={{ display: 'none' }} />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ ...S.label, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textTransform: 'none', fontSize: 13 }}>
                    <input type="checkbox" checked={editProduct.featured} onChange={e => setEditProduct(p => ({...p, featured: e.target.checked}))} style={{ width: 'auto', accentColor: 'var(--gold)' }} />
                    Feature this product on homepage
                  </label>
                </div>
              </div>

              {formError && (
                <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>
                  ⚠ {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={saving} style={{ minWidth: 140 }}>
                  {saving ? 'Saving...' : modal === 'add' ? '+ Add Product' : '✓ Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,8,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 600, backdropFilter: 'blur(6px)' }}>
          <div className="fade-in" style={{ background: 'var(--panel)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: 380, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗑</div>
            <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 10 }}>Delete product?</h3>
            <p style={{ color: 'var(--text3)', fontSize: 14, marginBottom: 28 }}>This action cannot be undone. The product will be permanently removed.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn" style={{ background: 'var(--red)', color: '#fff', padding: '10px 24px' }} onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
