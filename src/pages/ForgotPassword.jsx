import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = { email };
      const response = await authService.forgotPassword(data);
      setSuccess(response.data.message + " Verifique sua caixa de SPAM. Redirecionando...");
      
      setTimeout(() => {
        navigate('/reset-password', { state: { email: email } });
      }, 4000);

    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao solicitar redefinição');
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
            alt="Pizzada do Lelo"
            className="w-24 h-24 rounded-2xl shadow-xl ring-2 ring-primary/30 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Redefinir Senha</h1>
          <p className="text-text-secondary">
            Digite seu e-mail para enviarmos um código de 6 dígitos.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium animate-scaleIn">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium animate-scaleIn">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            {!success && (
              <>
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

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Lembrou a senha?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;