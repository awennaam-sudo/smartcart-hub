import API from '../api';
// CheckoutPage
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ street: user?.address?.street || '', city: user?.address?.city || '', country: user?.address?.country || '' });
  const [payment, setPayment] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = total >= 100 ? 0 : 9.99;

  const handleOrder = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await authFetch(`${API}/api/orders`, { method: 'POST', body: JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })), shippingAddress: address, paymentMethod: payment }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      clearCart(); navigate('/orders', { state: { newOrder: data } });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <span className="eyebrow">Almost there</span>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, marginBottom: 36 }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36 }}>
        <form onSubmit={handleOrder}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 20 }}>Shipping Address</h3>
            <div style={{ marginBottom: 14 }}><label>Street</label><input required value={address.street} onChange={e => setAddress(a => ({...a, street: e.target.value}))} placeholder="123 Main Street"/></div>
            <div className="g2">
              <div><label>City</label><input required value={address.city} onChange={e => setAddress(a => ({...a, city: e.target.value}))} placeholder="Accra"/></div>
              <div><label>Country</label><input required value={address.country} onChange={e => setAddress(a => ({...a, country: e.target.value}))} placeholder="Ghana"/></div>
            </div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 20 }}>Payment Method</h3>
            {[{ id: 'card', label: '💳 Credit / Debit Card' }, { id: 'mobile_money', label: '📱 Mobile Money' }, { id: 'cod', label: '💵 Cash on Delivery' }].map(p => (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1px solid ${payment === p.id ? 'var(--gold)' : 'var(--border)'}`, borderRadius: 'var(--radius)', marginBottom: 10, background: payment === p.id ? 'var(--gold-dim)' : 'transparent', cursor: 'pointer', color: 'var(--text)', fontSize: 14 }}>
                <input type="radio" name="payment" value={p.id} checked={payment === p.id} onChange={() => setPayment(p.id)} style={{ width: 'auto', accentColor: 'var(--gold)' }} />
                {p.label}
              </label>
            ))}
          </div>
          {payment === 'mobile_money' && (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 18, marginBottom: 16 }}>Mobile Money Details</h3>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, letterSpacing: 1, color: 'var(--text2)' }}>NETWORK</label>
                <select value={momoProvider} onChange={e => setMomoProvider(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14 }}>
                  <option value="mtn">MTN Mobile Money</option>
                  <option value="vod">Vodafone Cash</option>
                  <option value="tgo">AirtelTigo Money</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, letterSpacing: 1, color: 'var(--text2)' }}>MOBILE MONEY NUMBER</label>
                <input value={momoPhone} onChange={e => setMomoPhone(e.target.value)} placeholder="e.g. 0241234567" style={{ width: '100%', padding: '10px 14px', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 14 }} />
              </div>
            </div>
          )}
          {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 'var(--radius)', padding: '12px 16px', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}
          <button className="btn btn-gold" type="submit" disabled={loading || items.length === 0} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
            {loading ? 'Placing order...' : `Place Order — ₵{(total + shipping).toFixed(2)}`}
          </button>
        </form>

        {/* Summary */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: 24, height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 16 }}>Your items</h3>
          {items.map(i => (
            <div key={i.productId} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <img src={i.image} alt={i.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{i.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Qty: {i.quantity} × ₵{i.price.toFixed(2)}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gold)' }}>₵{(i.price * i.quantity).toFixed(2)}</div>
            </div>
          ))}
          <div className="gold-line" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}><span style={{ color: 'var(--text3)' }}>Subtotal</span><span>₵{total.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 14 }}><span style={{ color: 'var(--text3)' }}>Shipping</span><span style={{ color: 'var(--green)' }}>{shipping === 0 ? 'Free' : `₵${shipping.toFixed(2)}`}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 16 }}>Total</span><span style={{ fontFamily: 'var(--serif)', fontWeight: 700, fontSize: 20, color: 'var(--gold)' }}>₵{(total + shipping).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  );
}

// OrdersPage
export function OrdersPage() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = React.useState([]);
  React.useEffect(() => { authFetch(`${API}/api/orders/mine`).then(r => r.json()).then(d => Array.isArray(d) && setOrders(d)); }, []);
  const statusColor = { pending: 'badge-gold', processing: 'badge-gold', shipped: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red' };

  return (
    <div className="page">
      <span className="eyebrow">Your purchase history</span>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, marginBottom: 36 }}>My Orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>No orders yet</div>
        </div>
      ) : orders.map(o => (
        <div key={o.id} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono, monospace)', fontSize: 13, color: 'var(--gold)', fontWeight: 700, marginBottom: 4 }}>{o.orderNumber}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ₵{statusColor[o.status] || 'badge-gold'}`} style={{ marginBottom: 6, display: 'block' }}>{o.status}</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>₵{o.total.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {o.items.map(item => (
              <div key={item.productId} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>
                <img src={item.image} alt={item.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>Qty: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// LoginPage
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await login(form.email, form.password); navigate('/'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: 'var(--gold)', marginBottom: 6 }}>Welcome back</div>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Sign in to your SmartCart Hub account</p>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-line), transparent)' }} />
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@example.com" required /></div>
            <div style={{ marginBottom: 24 }}><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="••••••••" required /></div>
            {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}
            <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '13px' }}>{loading ? 'Signing in...' : 'Sign in →'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>No account? <a href="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Create one</a></p>
          
        </div>
      </div>
    </div>
  );
}

// RegisterPage
export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await register(form.name, form.email, form.password); navigate('/'); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 700, color: 'var(--gold)', marginBottom: 6 }}>Join SmartCart Hub</div>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Create your account to start shopping</p>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-line), transparent)' }} />
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}><label>Full name</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your name" required /></div>
            <div style={{ marginBottom: 14 }}><label>Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="you@example.com" required /></div>
            <div style={{ marginBottom: 24 }}><label>Password</label><input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} placeholder="Min. 6 characters" minLength={6} required /></div>
            {error && <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}
            <button className="btn btn-gold" type="submit" disabled={loading} style={{ width: '100%', padding: '13px' }}>{loading ? 'Creating account...' : 'Create account →'}</button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text3)' }}>Already have an account? <a href="/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 600 }}>Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

// AdminPage
export function AdminPage() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('overview');

  React.useEffect(() => {
    fetch(`${API}/api/stats`).then(r => r.json()).then(setStats);
    authFetch(`${API}/api/orders`).then(r => r.json()).then(d => Array.isArray(d) && setOrders(d));
    fetch(`${API}/api/products`).then(r => r.json()).then(setProducts);
  }, []);

  const updateStatus = async (id, status) => {
    await authFetch(`/api/orders/₵{id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const statItems = [
    { label: 'Total Revenue', value: `₵${parseFloat(stats?.revenue || 0).toFixed(2)}`, color: 'var(--gold)' },
    { label: 'Total Orders', value: stats?.orders ?? '—', color: 'var(--green)' },
    { label: 'Customers', value: stats?.customers ?? '—', color: 'var(--gold2)' },
    { label: 'Products', value: stats?.products ?? '—', color: 'var(--text2)' },
  ];

  return (
    <div className="page">
      <span className="eyebrow">Admin Panel</span>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, marginBottom: 32 }}>Dashboard</h1>

      {/* Stats */}
      <div className="g4" style={{ marginBottom: 32 }}>
        {statItems.map(s => (
          <div key={s.label} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ₵{s.color}50, transparent)` }} />
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['overview', 'orders', 'products'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 40, border: `1px solid ₵{tab === t ? 'var(--gold)' : 'var(--border)'}`, background: tab === t ? 'var(--gold-dim)' : 'transparent', color: tab === t ? 'var(--gold)' : 'var(--text2)', fontFamily: 'var(--font)', fontWeight: 500, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div>
          {orders.map(o => (
            <div key={o.id} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)' }}>{o.orderNumber}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(o.createdAt).toLocaleDateString()} · ₵{o.total.toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} style={{ width: 'auto', padding: '7px 12px', fontSize: 13 }}>
                  {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'products' && (
        <div className="g4">
          {products.map(p => (
            <div key={p.id} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₵{p.price}</span>
                  <span style={{ color: p.stock < 5 ? 'var(--red)' : 'var(--text3)' }}>Stock: {p.stock}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'overview' && (
        <div style={{ color: 'var(--text3)', textAlign: 'center', padding: '40px 0', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
          Select Orders or Products tab to manage your store.
        </div>
      )}
    </div>
  );
}
