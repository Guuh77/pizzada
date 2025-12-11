import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock, AlertCircle, CheckCircle, Hash } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }
    if (novaSenha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (codigo.length !== 6) {
      setError('O código deve ter 6 dígitos');
      return;
    }

    setLoading(true);

    try {
      const data = { email, codigo, nova_senha: novaSenha };
      const response = await authService.resetPassword(data);
      setSuccess(response.data.message);
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err)
 {
      setError(err.response?.data?.detail || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Crie sua Nova Senha</h1>
          <p className="text-text-secondary">
            Digite o código de 6 dígitos que enviamos para seu e-mail.
            <br/>
            <strong className="text-primary">(Verifique sua caixa de SPAM!)</strong>
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                <CheckCircle size={20} />
                <span>{success} Redirecionando para o login...</span>
              </div>
            )}

            {!success && (
              <>
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input pl-4 bg-gray-100"
                      placeholder="Seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly={!!location.state?.email}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Código de 6 dígitos</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="123456"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      className="input pl-10"
                      placeholder="Mínimo 6 caracteres"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Confirmar Nova Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      className="input pl-10"
                      placeholder="Repita a nova senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;