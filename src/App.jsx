import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import CursorEffect from './components/CursorEffect';
import Snowfall from './components/effects/Snowfall';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FazerPedido from './pages/FazerPedido';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Settings from './pages/Settings';
import Pagamentos from './pages/Pagamentos';

const AppContent = () => {
    const { cursorTrailEnabled } = useSettings();

    return (
        <Router>
            <Snowfall />
            {cursorTrailEnabled && <CursorEffect />}
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Rotas Protegidas */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/fazer-pedido"
                    element={
                        <ProtectedRoute>
                            <FazerPedido />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/pagamentos"
                    element={
                        <ProtectedRoute>
                            <Pagamentos />
                        </ProtectedRoute>
                    }
                />

                {/* Rotas Admin */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <Admin />
                        </ProtectedRoute>
                    }
                />

                {/* Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

function App() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <AppContent />
            </SettingsProvider>
        </AuthProvider>
    );
}

export default App;