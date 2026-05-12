import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { items, removeItem, updateQty, total, count, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 100, paddingBottom: 100 }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
      <h2 style={{ fontFamily: 'var(--serif)', marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: 'var(--text3)', marginBottom: 32 }}>Discover our curated collection of luxury pieces.</p>
      <Link to="/shop"><button className="btn btn-gold">Browse Collection</button></Link>
    </div>
  );

  return (
    <div className="page">
      <span className="eyebrow">Review your selection</span>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36 }}>Shopping Cart</h1>
        <span style={{ color: 'var(--text3)', fontSize: 14 }}>{count} item{count !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36, alignItems: 'flex-start' }}>
        {/* Items */}
        <div>
          {items.map((item, i) => (
            <div key={item.productId} style={{ display: 'flex', gap: 20, padding: '20px 0', borderBottom: '1px solid var(--border)', animation: `fadeUp 0.3s ₵{i * 0.05}s ease both` }}>
              <img src={item.image} alt={item.name} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{item.name}</h3>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--gold)', fontWeight: 700, marginBottom: 12 }}>₵{item.price.toFixed(2)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="qty-ctrl">
                    <button className="qty-btn" style={{ width: 30, height: 30 }} onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                    <span className="qty-num" style={{ padding: '0 12px' }}>{item.quantity}</span>
                    <button className="qty-btn" style={{ width: 30, height: 30 }} onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font)' }}>Remove</button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, color: 'var(--text)', textAlign: 'right', minWidth: 80 }}>
                ₵{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <button onClick={clearCart} style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--font)' }}>
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: 28, position: 'sticky', top: 100 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-line), transparent)', borderRadius: '12px 12px 0 0' }} />
          <h3 style={{ fontFamily: 'var(--serif)', marginBottom: 20 }}>Order Summary</h3>

          {items.map(item => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--text2)' }}>{item.name} × {item.quantity}</span>
              <span>₵{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="gold-line" />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
            <span style={{ color: 'var(--text2)' }}>Subtotal</span>
            <span>₵{total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
            <span style={{ color: 'var(--text2)' }}>Shipping</span>
            <span style={{ color: 'var(--green)' }}>{total >= 100 ? 'Free' : '₵9.99'}</span>
          </div>
          <div className="gold-line" />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700 }}>Total</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>₵{(total < 100 ? total + 9.99 : total).toFixed(2)}</span>
          </div>

          <button className="btn btn-gold" style={{ width: '100%', padding: '14px', fontSize: 15 }}
            onClick={() => user ? navigate('/checkout') : navigate('/login')}>
            {user ? 'Proceed to Checkout →' : 'Sign in to Checkout →'}
          </button>

          <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--text3)', textDecoration: 'none' }}>
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
