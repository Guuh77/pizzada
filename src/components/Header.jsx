import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Pizza, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-dark text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Nome */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Pizza size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Pizzada do Roger</h1>
              <p className="text-xs text-gray-300">Sistema de Pedidos</p>
            </div>
          </Link>

          {/* Navegação */}
          {user && (
            <nav className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 hover:text-secondary transition-colors"
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>

              {isAdmin() && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 hover:text-secondary transition-colors"
                >
                  <Settings size={20} />
                  <span>Admin</span>
                </Link>
              )}

              {/* Informações do usuário */}
              <div className="flex items-center space-x-4 border-l border-gray-600 pl-6">
                <div className="text-right">
                  <p className="text-sm font-semibold">{user.nome_completo}</p>
                  <p className="text-xs text-gray-400">{user.setor}</p>
                  {isAdmin() && (
                    <span className="text-xs bg-secondary text-dark px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
