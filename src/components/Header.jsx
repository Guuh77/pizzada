import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { LogOut, LayoutDashboard, User, Shield, DollarSign, Trophy, Menu, X } from 'lucide-react';
import PremiumName from './PremiumName';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, icon: Icon, text }) => {
    const isActive = location.pathname.startsWith(to) && (to !== '/' || location.pathname === '/');
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium
          ${isActive 
            ? 'bg-primary text-white shadow-primary' 
            : 'text-text-secondary hover:text-text-primary hover:bg-card'}`}
      >
        <Icon size={16} />
        <span>{text}</span>
      </Link>
    );
  };

  return (
    <header className="bg-background/80 backdrop-blur-md text-text-primary sticky top-0 z-50 border-b border-border-color">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-primary/30 group-hover:ring-primary transition-all duration-200">
                <img src="/roger-avatar.jpg" className="w-full h-full object-cover" alt="Avatar" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-text-primary leading-tight group-hover:text-primary transition-colors">Pizzada do Lelo</h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          {user && (
            <div className="hidden xl:flex items-center gap-2">
              <nav className="flex items-center gap-1">
                <NavLink to="/dashboard" icon={LayoutDashboard} text="Dashboard" />
                <NavLink to="/ranking" icon={Trophy} text="Ranking" />
                <NavLink to="/pagamentos" icon={DollarSign} text="Caixa" />
                {isAdmin() && <NavLink to="/admin" icon={Shield} text="Admin" />}
                <NavLink to="/settings" icon={User} text="Perfil" />
              </nav>

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border-color">
                <div className="text-right">
                  <p className="text-sm font-semibold max-w-[150px] truncate">
                    <PremiumName name={user.nome_completo} isPremium={user.is_premium} />
                  </p>
                  <p className="text-xs text-text-secondary">{user.setor}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-card border border-border-color hover:bg-primary hover:border-primary hover:text-white text-text-secondary transition-all duration-200"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Nav Toggle */}
          {user && (
            <button 
              className="xl:hidden p-2 rounded-lg bg-card border border-border-color text-text-primary hover:bg-primary hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>

        {/* Mobile Nav Dropdown */}
        {user && mobileMenuOpen && (
          <div className="xl:hidden mt-4 flex flex-col gap-1 border-t border-border-color pt-4 pb-2 animate-slideDown">
            <NavLink to="/dashboard" icon={LayoutDashboard} text="Dashboard" />
            <NavLink to="/ranking" icon={Trophy} text="Ranking" />
            <NavLink to="/pagamentos" icon={DollarSign} text="Caixa" />
            {isAdmin() && <NavLink to="/admin" icon={Shield} text="Admin" />}
            <NavLink to="/settings" icon={User} text="Perfil" />
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white font-semibold text-sm mt-4 transition-all hover:bg-primary-hover active:scale-[0.97]"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;