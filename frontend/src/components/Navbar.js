import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="4" stroke="url(#g1)" strokeWidth="1.5"/>
              <path d="M8 14h12M14 8v12" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="3" fill="none" stroke="url(#g1)" strokeWidth="1.2"/>
              <defs>
                <linearGradient id="g1" x1="2" y1="2" x2="26" y2="26">
                  <stop stopColor="#c9a84c"/><stop offset="1" stopColor="#e8c97a"/>
                </linearGradient>
              </defs>
            </svg>
            <div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}>SmartCart</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 2.5, lineHeight: 1, marginTop: 1 }}>HUB</div>
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[{ to: '/', label: 'Home' }, { to: '/shop', label: 'Shop' }].map(n => (
            <Link key={n.to} to={n.to} style={{ textDecoration: 'none', fontSize: 14, fontWeight: 500, color: isActive(n.to) ? 'var(--gold)' : 'var(--text2)', borderBottom: isActive(n.to) ? '1px solid var(--gold)' : '1px solid transparent', paddingBottom: 2, transition: 'all 0.15s' }}
              onMouseEnter={e => { if (!isActive(n.to)) e.target.style.color = 'var(--text)'; }}
              onMouseLeave={e => { if (!isActive(n.to)) e.target.style.color = 'var(--text2)'; }}>
              {n.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link to="/admin" style={{ textDecoration: 'none', fontSize: 14, fontWeight: 500, color: isActive('/admin') ? 'var(--gold)' : 'var(--text2)', transition: 'color 0.15s' }}>Admin</Link>
          )}
        </div>

        {/* Right icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Cart */}
          <Link to="/cart" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text2)', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text2)'}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="cart-badge">{count > 9 ? '9+' : count}</span>}
          </Link>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Link to="/orders" style={{ textDecoration: 'none', fontSize: 13, color: 'var(--text2)', fontWeight: 500, transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                onMouseLeave={e => e.target.style.color = 'var(--text2)'}>
                Orders
              </Link>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }} onClick={() => { logout(); navigate('/'); }}>
                {user.name[0].toUpperCase()}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login"><button className="btn btn-ghost btn-sm">Sign in</button></Link>
              <Link to="/register"><button className="btn btn-gold btn-sm">Join</button></Link>
            </div>
          )}
        </div>
      </div>

      {/* Gold accent line */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-line), transparent)' }} />
    </nav>
  );
}
