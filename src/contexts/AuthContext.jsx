import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));

        // Validar token e buscar dados atualizados (incluindo e-mail)
        try {
          const response = await authService.getMe();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error('Erro ao validar token:', error);
          logout();
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, senha) => {
    try {
      // Atualizado para usar 'email'
      const response = await authService.login({
        email: email,
        senha: senha,
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao fazer login',
      };
    }
  };

  const register = async (nomeCompleto, email, senha, setor) => {
    try {
      const res = await authService.register({
        nome_completo: nomeCompleto,
        email: email,
        senha: senha,
        setor: setor,
      });

      // Cadastro pendente - não faz auto-login
      return { success: true, pendente: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Erro ao criar conta',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.is_admin || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};