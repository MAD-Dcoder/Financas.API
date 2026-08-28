import React, { createContext, useState } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Função que centraliza a verificação da validade do JWT
  const checkInitialAuth = () => {
    const savedData = localStorage.getItem('firmo_user');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const decoded = jwtDecode(parsedData.token);
        const currentTime = Date.now() / 1000;

        // Se o token ainda é válido, loga o usuário
        if (decoded.exp > currentTime) {
          api.defaults.headers.common['Authorization'] = `Bearer ${parsedData.token}`;
          return { isLogged: true, user: parsedData.usuario };
        } else {
          // Token expirou: remove apenas a sessão ativa, mantendo a "Conta Salva" do Login
          localStorage.removeItem('firmo_user');
        }
      } catch (error) {
        localStorage.removeItem('firmo_user');
      }
    }
    return { isLogged: false, user: null };
  };

  const initialState = checkInitialAuth();

  const [usuarioLogado, setUsuarioLogado] = useState(initialState.user);
  const [isLoggedIn, setIsLoggedIn] = useState(initialState.isLogged);

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