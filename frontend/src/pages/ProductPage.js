import API from '../api';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => { fetch(`${API}/api/products/${id}`).then(r => r.json()).then(d => { if (d.message) navigate('/shop'); else setProduct(d); }); }, [id]);

  if (!product) return <div style={{ textAlign: 'center', padding: 120, color: 'var(--text3)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Loading...</div>;

  const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAdd = () => { addItem(product, qty); toast(`${product.name} added to cart ✓`); };

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 28 }} onClick={() => navigate(-1)}>← Back</button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        {/* Image */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={product.image} alt={product.name} style={{ width: '100%', height: 520, objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {product.tags?.map(tag => <span key={tag} className="badge badge-gold">{tag}</span>)}
          </div>
        </div>

        {/* Details */}
        <div className="fade-in">
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{product.category}</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 34, fontWeight: 700, lineHeight: 1.2, marginBottom: 16 }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span className="stars">{'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--gold)', fontWeight: 600 }}>{product.rating}</span>
            <span style={{ color: 'var(--text3)', fontSize: 13 }}>({product.reviews} reviews)</span>
          </div>

          <div className="gold-line" />

          <div style={{ marginBottom: 28 }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 700, color: 'var(--gold)' }}>${product.price.toFixed(2)}</span>
            {discount > 0 && (
              <span style={{ marginLeft: 14, fontSize: 20, color: 'var(--text3)', textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>
            )}
            {discount > 0 && <span className="badge badge-red" style={{ marginLeft: 12 }}>Save {discount}%</span>}
          </div>

          <p style={{ color: 'var(--text2)', lineHeight: 1.8, marginBottom: 32, fontSize: 15 }}>{product.description}</p>

          {/* Stock */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: product.stock > 10 ? 'var(--green)' : product.stock > 0 ? 'var(--gold)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
              {product.stock > 10 ? `${product.stock} in stock` : product.stock > 0 ? `Only ${product.stock} left!` : 'Out of stock'}
            </div>
          </div>

          {/* Qty + Add */}
          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28 }}>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-num">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
              </div>
              <button className="btn btn-gold" style={{ flex: 1, padding: '13px' }} onClick={handleAdd}>
                Add to cart — ${(product.price * qty).toFixed(2)}
              </button>
            </div>
          )}

          {/* Info pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Free shipping over $100', '30-day returns', 'Authentic guarantee'].map(f => (
              <span key={f} style={{ fontSize: 12, color: 'var(--text3)', padding: '6px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20 }}>✦ {f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
