import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || 'All';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => { fetch('/api/products/categories').then(r => r.json()).then(setCategories); }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    fetch(`/api/products?${params}`).then(r => r.json()).then(d => { setProducts(d); setLoading(false); });
  }, [category, sort, search]);

  const set = (key, val) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (val) p.set(key, val); else p.delete(key); return p; });

  return (
    <div className="page">
      <div style={{ marginBottom: 36 }}>
        <span className="eyebrow">Our Collection</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 38 }}>Shop All</h1>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input placeholder="Search products..." value={search} onChange={e => set('search', e.target.value)} style={{ width: 220, padding: '10px 14px' }} />
            <select value={sort} onChange={e => set('sort', e.target.value)} style={{ width: 180 }}>
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => set('category', cat === 'All' ? '' : cat)} style={{
            padding: '8px 20px', borderRadius: 40, border: `1px solid ${category === cat ? 'var(--gold)' : 'var(--border)'}`,
            background: category === cat ? 'var(--gold-dim)' : 'transparent',
            color: category === cat ? 'var(--gold)' : 'var(--text2)',
            fontFamily: 'var(--font)', fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Loading collection...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>No products found</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>{products.length} product{products.length !== 1 ? 's' : ''} found</div>
          <div className="g4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
        </>
      )}
    </div>
  );
}
