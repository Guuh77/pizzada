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
            alt="PIZZADA DO LELO"
            className="w-32 h-32 rounded-full shadow-xl border-4 border-white mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-text-primary mb-2">Redefinir Senha</h1>
          <p className="text-text-secondary">
            Digite seu e-mail para enviarmos um código de 6 dígitos.
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