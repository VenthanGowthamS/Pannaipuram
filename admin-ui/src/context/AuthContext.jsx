import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('panToken'));

  useEffect(() => {
    if (token) {
      api.setToken(token);
      setUser({ email: 'venthan89@gmail.com' });
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      const authToken = response.token || response;
      api.setToken(authToken);
      setToken(authToken);
      setUser({ email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
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
