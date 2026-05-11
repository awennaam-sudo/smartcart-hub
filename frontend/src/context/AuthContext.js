import API from '../api';
import React, { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sch_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => { if (d.id) setUser(d); else { setToken(null); localStorage.removeItem('sch_token'); } })
        .catch(() => { setToken(null); localStorage.removeItem('sch_token'); })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('sch_token', data.token); setToken(data.token); setUser(data.user); return data.user;
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('sch_token', data.token); setToken(data.token); setUser(data.user); return data.user;
  };

  const logout = () => { localStorage.removeItem('sch_token'); setToken(null); setUser(null); };

  const authFetch = (url, opts = {}) => fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) } });

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
