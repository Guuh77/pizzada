import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Pizza, User, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(nomeCompleto, senha);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent p-4">
      <div className="w-full max-w-md">
        <div className="card text-center mb-8">
          {/* Logo/Avatar do Roger */}
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 bg-dark rounded-full flex items-center justify-center shadow-xl">
              <Pizza size={64} className="text-primary" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-dark mb-2">Pizzada do Roger</h1>
          <p className="text-gray-600">Entre para fazer seu pedido! 🍕</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="label">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Digite seu nome completo"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  className="input pl-10"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-white text-sm">
          <p>🍕 Sistema de Pedidos da Pizzada</p>
          <p className="mt-1 text-xs opacity-75">
            Eventos nos dias especiais: 08/08, 09/09, 10/10, 11/11, 12/12
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
