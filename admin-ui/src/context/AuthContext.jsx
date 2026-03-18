import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

const decodeToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'viewer';
  } catch {
    return 'viewer';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('panToken'));

  useEffect(() => {
    if (token) {
      api.setToken(token);
      const role = decodeToken(token);
      setUser({ email: 'venthan89@gmail.com', role });
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    // NOTE: Do NOT setLoading(true) here — it unmounts Login component
    // and loses error state. Login.jsx manages its own loading spinner.
    try {
      const response = await api.login(email, password);
      const authToken = response.token || response;
      if (!authToken || typeof authToken !== 'string') {
        return { success: false, error: 'Invalid token received from server' };
      }
      api.setToken(authToken);
      setToken(authToken);
      const role = decodeToken(authToken);
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
