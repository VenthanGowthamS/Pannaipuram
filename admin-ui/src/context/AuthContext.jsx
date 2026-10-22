import React, { createContext, useState, useEffect } from 'react';
import api, { SESSION_EXPIRED_EVENT } from '../api';

export const AuthContext = createContext();

// JWT payloads are base64URL ('-' / '_', no padding) and UTF-8; plain atob() throws
// on those characters and would silently demote a super_admin to 'viewer'.
export const decodeToken = (token) => {
  try {
    let b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    b64 += '='.repeat((4 - (b64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    return { role: payload.role || 'viewer', email: payload.email || '', exp: payload.exp || null };
  } catch {
    return { role: 'viewer', email: '', exp: null };
  }
};

export const isExpired = (exp) => !!exp && exp * 1000 <= Date.now();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('panToken'));

  useEffect(() => {
    if (token) {
      const { role, email, exp } = decodeToken(token);
      if (isExpired(exp)) {
        // The 7-day token ran out while the tab sat in localStorage — show the
        // login screen instead of a panel where every call fails.
        api.clearToken();
        setToken(null);
        setUser(null);
      } else {
        api.setToken(token);
        setUser({ email: email || 'admin', role });
      }
    }
    setLoading(false);
  }, [token]);

  // api.js fires this when the server answers 401 (expired / deactivated / deleted)
  useEffect(() => {
    const onExpired = () => { setToken(null); setUser(null); };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = async (email, password) => {
    // NOTE: Do NOT setLoading(true) here — it unmounts Login component
    // and loses error state. Login.jsx manages its own loading spinner.
    try {
      const response = await api.login(email, password);
      // Server returns { success, token, role } — api.request unwraps to { token, role, success }
      const authToken = response.token || response;
      if (!authToken || typeof authToken !== 'string') {
        return { success: false, error: 'Invalid token received from server' };
      }
      api.setToken(authToken);
      setToken(authToken);
      // Use role from server response first, then fall back to JWT decode
      const decoded = decodeToken(authToken);
      const role = response.role || decoded.role;
      setUser({ email, role });
      return { success: true };
    } catch (error) {
      const msg = error.message || 'Login failed';
      // Provide user-friendly error messages
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
        return { success: false, error: 'Server unreachable — சர்வர் இணைப்பு இல்லை. Please try again later.' };
      }
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    api.clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
