import API from '../api';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => { fetch(`${API}/api/products?featured=true`).then(r => r.json()).then(setFeatured); }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: 600, display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #0a0800 0%, #1a1407 50%, #0d0b02 100%)' }}>
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(201,168,76,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 40%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        <div className="page" style={{ position: 'relative', zIndex: 1, paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ maxWidth: 620 }}>
            <span className="eyebrow fade-in">New Collection 2025</span>
            <h1 className="fade-in-1" style={{ fontFamily: 'var(--serif)', fontSize: 58, fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
              Elevate Your
              <span style={{ display: 'block', background: 'linear-gradient(135deg, var(--gold), var(--gold3))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Style.</span>
            </h1>
            <p className="fade-in-2" style={{ fontSize: 17, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
              Discover curated fashion and accessories crafted with the finest materials. From everyday essentials to statement pieces.
            </p>
            <div className="fade-in-3" style={{ display: 'flex', gap: 14 }}>
              <Link to="/shop"><button className="btn btn-gold" style={{ padding: '14px 36px', fontSize: 15 }}>Shop Now</button></Link>
              <Link to="/shop?featured=true"><button className="btn btn-outline" style={{ padding: '14px 36px', fontSize: 15 }}>View Featured</button></Link>
            </div>
          </div>
        </div>

        {/* Hero image accent */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '42%', background: 'linear-gradient(135deg, transparent, rgba(201,168,76,0.04))', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.3 }}>
          ✦
        </div>
      </section>

      {/* ── Categories strip ── */}
      <section style={{ borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', background: 'var(--bg2)' }}>
        <div className="page" style={{ padding: '20px 32px' }}>
          <div style={{ display: 'flex', gap: 32, overflowX: 'auto', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--text3)', whiteSpace: 'nowrap', fontStyle: 'italic' }}>Explore:</span>
            {['Clothing', 'Bags', 'Accessories', 'Jewellery', 'Footwear'].map(cat => (
              <Link key={cat} to={`/shop?category=${cat}`} style={{ textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text2)', whiteSpace: 'nowrap', letterSpacing: 0.5, transition: 'color 0.15s', padding: '4px 0', borderBottom: '1px solid transparent' }}
                onMouseEnter={e => { e.target.style.color = 'var(--gold)'; e.target.style.borderBottomColor = 'var(--gold)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--text2)'; e.target.style.borderBottomColor = 'transparent'; }}>
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ── */}
      <section className="page" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <span className="eyebrow">Handpicked for you</span>
            <h2 style={{ fontFamily: 'var(--serif)' }}>Featured Collection</h2>
          </div>
          <Link to="/shop" style={{ textDecoration: 'none' }}>
            <button className="btn btn-outline btn-sm">View all →</button>
          </Link>
        </div>
        <div className="g4">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ── Value props ── */}
      <section style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
        <div className="page">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)' }}>
            {[
              { icon: '🚚', title: 'Free Delivery Fee', desc: 'On orders over $100' },
              { icon: '↩', title: 'Easy Returns', desc: '30-day return policy' },
              { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
              { icon: '✦', title: 'Premium Quality', desc: 'Curated luxury pieces' },
            ].map((v, i) => (
              <div key={i} style={{ background: 'var(--bg2)', padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{v.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--gold)', marginBottom: 8 }}>SmartCart Hub</div>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>© 2025 SmartCart Hub. All rights reserved.</div>
      </footer>
    </div>
  );
}
