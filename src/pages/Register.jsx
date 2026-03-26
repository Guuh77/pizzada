import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Briefcase, AlertCircle, Clock, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [setor, setSetor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cadastroPendente, setCadastroPendente] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    const dominiosPermitidos = ['@tjsp.jus.br', '@gmail.com', '@outlook.com', '@hotmail.com'];
    const emailLower = email.toLowerCase();
    if (!dominiosPermitidos.some(d => emailLower.endsWith(d))) {
      setError('Use um e-mail @tjsp.jus.br, @gmail.com, @outlook.com ou @hotmail.com');
      return;
    }

    setLoading(true);

    try {
      const result = await register(nomeCompleto, email, senha, setor);

      if (result.success && result.pendente) {
        setCadastroPendente(true);
      } else if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro inesperado ao tentar registrar.');
    }

    setLoading(false);
  };

  if (cadastroPendente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md animate-fadeIn">
          <div className="card text-center border-t-4 border-secondary rounded-xl">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <Clock size={40} className="text-secondary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">Cadastro Enviado!</h1>
            <p className="text-text-secondary mb-6">
              Sua solicitação foi registrada com sucesso.
            </p>
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-2 text-secondary mb-2">
                <AlertCircle size={18} />
                <span className="font-semibold text-sm">Aguardando aprovação</span>
              </div>
              <p className="text-text-primary text-sm">
                Um administrador irá validar seu cadastro antes de liberar o acesso.
              </p>
            </div>
            <Link to="/login" className="btn-secondary inline-block w-full text-center">
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Left — Brand */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 lg:p-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none">
          <h1 className="text-[20vw] font-black tracking-tighter leading-none text-text-primary whitespace-nowrap">REGISTRO</h1>
        </div>
        
        <div className="z-10 relative animate-fadeIn">
          <span className="inline-block px-3 py-1.5 rounded-full border border-secondary/40 text-secondary font-semibold text-xs mb-8 bg-secondary/5">
            🍕 Nova Conta
          </span>
          <h1 className="text-6xl lg:text-8xl font-black text-text-primary tracking-tight leading-[0.9]">
            Criar<br/><span className="text-secondary">Conta</span>
          </h1>
          <p className="mt-8 text-lg text-text-secondary font-medium max-w-lg leading-relaxed">
            Registre-se para participar da Pizzada do Lelo. Após o cadastro, um administrador irá aprovar seu acesso.
          </p>
        </div>
        
        <div className="z-10 flex items-center gap-3 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-soft"></div>
          <span className="text-text-secondary text-sm font-medium">Registro aberto</span>
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="w-full md:w-[440px] lg:w-[480px] flex flex-col justify-center p-8 lg:p-12 h-screen overflow-y-auto bg-card border-l border-border-color relative z-20 animate-fadeIn">
        <div className="md:hidden mb-8">
          <span className="inline-block px-3 py-1.5 rounded-full border border-secondary/40 text-secondary font-semibold text-xs mb-4 bg-secondary/5">
            🍕 Nova Conta
          </span>
          <h2 className="text-3xl font-black text-text-primary tracking-tight leading-[0.9]">Criar<br/><span className="text-secondary">Conta</span></h2>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Registrar</h2>
          <p className="text-text-secondary text-sm">Preencha seus dados para solicitar acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg text-primary px-4 py-3 text-sm font-medium flex items-center gap-3 animate-scaleIn">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="label">Nome Completo</label>
            <div className="relative group">
              <input
                type="text"
                className="input pr-10"
                placeholder="Seu nome"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-secondary transition-colors" size={18} />
            </div>
          </div>

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
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-secondary transition-colors" size={18} />
            </div>
          </div>

          <div>
            <label className="label">Setor</label>
            <div className="relative group">
              <select
                className="input appearance-none cursor-pointer"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                required
              >
                <option value="" disabled className="bg-card text-text-secondary">Selecione o setor</option>
                <option value="STI" className="bg-card">STI</option>
                <option value="SGS" className="bg-card">SGS</option>
              </select>
              <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-secondary transition-colors pointer-events-none" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-secondary transition-colors" size={16} />
              </div>
            </div>
            <div>
              <label className="label">Confirmar Senha</label>
              <div className="relative group">
                <input
                  type="password"
                  className="input pr-10"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-secondary transition-colors" size={16} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn-secondary w-full flex items-center justify-center gap-2 mt-4"
            disabled={loading}
          >
            {loading ? 'Processando...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-color">
          <p className="text-text-secondary text-sm flex items-center gap-2">
            <ArrowLeft size={14} />
            Já tem conta?{' '}
            <Link to="/login" className="text-secondary font-semibold hover:underline transition-colors">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;