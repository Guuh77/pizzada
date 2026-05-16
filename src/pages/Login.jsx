import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, senha);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'E-mail ou senha incorretos');
      }
    } catch {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left — Brand Statement */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 lg:p-20 relative overflow-hidden">
        {/* Giant background text */}
        <div className="absolute inset-0 z-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none">
          <h1 className="text-[20vw] font-black tracking-tighter leading-none text-text-primary whitespace-nowrap">PIZZADA</h1>
        </div>
        
        <div className="z-10 relative animate-fadeIn">
          <span className="inline-block px-3 py-1.5 rounded-full border border-primary/40 text-primary font-semibold text-xs mb-8 bg-primary/5">
            🍕 Plataforma de Pedidos
          </span>
          <h1 className="text-6xl lg:text-8xl font-black text-text-primary tracking-tight leading-[0.9]">
            Pizzada<br/><span className="text-primary">do Lelo</span>
          </h1>
          <p className="mt-8 text-lg text-text-secondary font-medium max-w-lg leading-relaxed">
            A plataforma onde a galera organiza os pedidos de pizza. Faça login para ver os eventos, fazer seu pedido e acompanhar tudo em tempo real.
          </p>
        </div>
        
        <div className="z-10 flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-soft"></div>
          <span className="text-text-secondary text-sm font-medium">Sistema ativo</span>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="w-full md:w-[440px] lg:w-[480px] flex flex-col justify-center p-8 lg:p-14 bg-card border-l border-border-color relative z-20 min-h-screen animate-fadeIn">
        {/* Mobile brand */}
        <div className="md:hidden mb-10">
          <span className="inline-block px-3 py-1.5 rounded-full border border-primary/40 text-primary font-semibold text-xs mb-4 bg-primary/5">
            🍕 Plataforma de Pedidos
          </span>
          <h2 className="text-4xl font-black text-text-primary tracking-tight leading-[0.9]">Pizzada<br/><span className="text-primary">do Lelo</span></h2>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Entrar</h2>
          <p className="text-text-secondary text-sm">Acesse sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-3 animate-scaleIn">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded font-mono">401</span>
              <span className="text-red-400 text-sm font-medium">E-mail ou senha incorretos</span>
            </div>
          )}

          <div>
            <label className="label">E-mail</label>
            <div className="relative group">
              <input
                type="email"
                className="input pr-10"
                placeholder="seuemail@tjsp.jus.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
            </div>
          </div>

          <div>
            <label className="label">Senha</label>
            <div className="relative group">
              <input
                type="password"
                className="input pr-10"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-primary text-sm font-medium hover:underline transition-colors">
              Esqueceu a senha?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-border-color">
          <p className="text-text-secondary text-sm">
            Ainda não tem conta?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline transition-colors">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;