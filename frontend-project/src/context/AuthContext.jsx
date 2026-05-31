import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import {
  getToken,
  getUsername,
  saveSession,
  clearAuthSession,
} from '../utils/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const username = getUsername();
    if (token && username) setUser({ username });
    setLoading(false);
  }, []);

  const login = async (username, password, rememberMe = false) => {
    const { data } = await api.post('/auth/login', { username, password });
    saveSession({ token: data.token, username: data.username }, rememberMe);
    setUser({ username: data.username });
    return data;
  };

  const register = async (username, password) => {
    await api.post('/auth/register', { username, password });
  };

  const forgotPassword = async (username, newPassword) => {
    await api.post('/auth/forgot-password', { username, newPassword });
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, forgotPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
