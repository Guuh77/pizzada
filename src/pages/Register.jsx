import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Briefcase, AlertCircle } from 'lucide-react';

const Register = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [setor, setSetor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register: handleSubmit started');
    setError('');

    if (senha !== confirmarSenha) {
      console.log('Register: Passwords do not match');
      setError('As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      console.log('Register: Password too short');
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    console.log('Register: Setting loading to true');
    setLoading(true);

    console.log('Register: Calling register function', { nomeCompleto, email, setor });
    try {
      const result = await register(nomeCompleto, email, senha, setor);
      console.log('Register: register function returned', result);

      if (result.success) {
        console.log('Register: Success, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('Register: Failure', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('Register: Unexpected error in handleSubmit', err);
      setError('Erro inesperado ao tentar registrar.');
    }

    console.log('Register: Setting loading to false');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fadeIn">
        <div className="card text-center mb-6">
          <img
            src="/roger-avatar.jpg"
            alt="PIZZADA DO LELO"
            className="w-32 h-32 rounded-full shadow-xl border-4 border-white mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Criar Conta</h1>
          <p className="text-text-secondary">Junte-se à PIZZADA DO LELO! 🍕</p>
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
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Seu nome completo"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Setor</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  className="input pl-10 appearance-none"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  required
                >
                  <option value="" disabled className="bg-slate-900 text-text-secondary">Selecione o setor</option>
                  <option value="STI" className="bg-slate-900 text-white">STI</option>
                  <option value="SGS" className="bg-slate-900 text-white">SGS</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    className="input pl-10"
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    className="input pl-10"
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;