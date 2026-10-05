import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      if (storedUser.role === 'ADMIN' && (storedUser.fullName === 'Rajesh Sharma' || !storedUser.fullName)) {
        storedUser.fullName = 'Admin';
        localStorage.setItem('employee_tracking_user', JSON.stringify(storedUser));
      }
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    if (data.role === 'ADMIN') {
      data.fullName = 'Admin';
      localStorage.setItem('employee_tracking_user', JSON.stringify(data));
    }
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('employee_tracking_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user, isAdmin: user?.role === 'ADMIN', isEmployee: user?.role === 'EMPLOYEE' }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
