import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Pizza, LogOut, LayoutDashboard, Settings as SettingsIcon, Shield, Snowflake, DollarSign } from 'lucide-react';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme } = useSettings();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-card text-text-primary shadow-lg sticky top-0 z-50 border-b border-border-color">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <img src="/roger-avatar.jpg" className="w-full h-full rounded-full" />
              </div>
              {theme === 'christmas' && (
                <div className="absolute -top-3 -right-2 transform rotate-12 animate-bounce">
                  <Snowflake size={24} className="text-white drop-shadow-lg" fill="#fff" />
                </div>
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold text-text-primary">PIZZADA DO LELO</h1>
              <p className="text-xs text-text-secondary">Sistema de Pedidos</p>
            </div>
          </Link>

          {user && (
            <nav className="flex items-center space-x-2 sm:space-x-6">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 hover:text-primary transition-colors p-2 rounded-lg"
              >
                <LayoutDashboard size={20} />
                <span className="hidden md:inline">Dashboard</span>
              </Link>

              <Link
                to="/settings"
                className="flex items-center space-x-2 hover:text-primary transition-colors p-2 rounded-lg"
              >
                <SettingsIcon size={20} />
                <span className="hidden md:inline">Ajustes</span>
              </Link>

              <Link
                to="/pagamentos"
                className="flex items-center space-x-2 hover:text-primary transition-colors p-2 rounded-lg"
              >
                <DollarSign size={20} />
                <span className="hidden md:inline">Pagamentos</span>
              </Link>

              {isAdmin() && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 hover:text-primary transition-colors p-2 rounded-lg"
                >
                  <Shield size={20} />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}

              <div className="flex items-center space-x-2 sm:space-x-4 border-l border-border-color pl-2 sm:pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold truncate max-w-[150px]">{user.nome_completo}</p>
                  <p className="text-xs text-text-secondary">{user.setor}</p>
                  {isAdmin() && (
                    <span className="text-xs bg-secondary text-text-primary px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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