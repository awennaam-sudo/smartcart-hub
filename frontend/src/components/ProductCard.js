import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from './Toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const toast = useToast();
  const discount = product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product, 1);
    toast(`₵{product.name} added to cart ✓`);
  };

  return (
    <div className="product-card fade-in" onClick={() => navigate(`/product/₵{product.id}`)}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={product.image} alt={product.name} loading="lazy" style={{ height: 260, objectFit: 'cover', width: '100%' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
          {product.tags?.includes('new') && <span className="badge badge-gold">New</span>}
          {product.tags?.includes('bestseller') && <span className="badge badge-gold" style={{ background: 'rgba(201,168,76,0.9)', color: '#0a0800' }}>Bestseller</span>}
          {discount > 0 && <span className="badge badge-red">-{discount}%</span>}
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
            <span className="badge badge-red">Only {product.stock} left</span>
          </div>
        )}
      </div>
      <div className="product-card-body">
        <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{product.category}</div>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text)', lineHeight: 1.35 }}>{product.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
          <span className="stars">{'★'.repeat(Math.round(product.rating))}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>({product.reviews})</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>₵{product.price.toFixed(2)}</span>
            {discount > 0 && <span style={{ fontSize: 13, color: 'var(--text3)', textDecoration: 'line-through', marginLeft: 8 }}>₵{product.originalPrice.toFixed(2)}</span>}
          </div>
          <button className="btn btn-gold btn-sm" onClick={handleAdd} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Sold out' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
