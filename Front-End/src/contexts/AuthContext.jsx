import React, { createContext, useState } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const savedData = localStorage.getItem('firmo_user');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      api.defaults.headers.common['Authorization'] = `Bearer ${parsedData.token}`;
      return parsedData.usuario;
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('firmo_user');
  });

  const handleLoginSuccess = (usuario) => {
    setUsuarioLogado(usuario);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('firmo_user');
    delete api.defaults.headers.common['Authorization'];
    setIsLoggedIn(false);
    setUsuarioLogado(null);
  };

  return (
    <AuthContext.Provider value={{ usuarioLogado, isLoggedIn, handleLoginSuccess, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};