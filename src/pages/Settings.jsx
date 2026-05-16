import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Loading from '../components/Loading';
import {
    Palette, MousePointer2, Check, User, Save, Loader2,
    BarChart3, Trophy, Crown, Globe, Target, Wallet, Zap, Pizza, Award,
    MessageSquare, Send, EyeOff, Baby, Heart, Flame, Map, Star, Lock
} from 'lucide-react';
import api, { pedidosService, feedbacksService } from '../services/api';
import PremiumName from '../components/PremiumName';

const BADGE_ICONS = {
    pizza: Pizza,
    trophy: Trophy,
    crown: Crown,
    globe: Globe,
    target: Target,
    wallet: Wallet,
    zap: Zap,
    baby: Baby,
    heart: Heart,
    flame: Flame,
    map: Map,
    star: Star,
};

const CATEGORIAS = [
    { value: 'ELOGIO', label: '😊 Elogio', color: 'text-green-400' },
    { value: 'SUGESTAO', label: '💡 Sugestão', color: 'text-blue-400' },
    { value: 'PROBLEMA', label: '⚠️ Problema', color: 'text-red-400' },
    { value: 'OUTRO', label: '💬 Outro', color: 'text-text-secondary' },
];

const Settings = () => {
    const { theme, setTheme, cursorTrailEnabled, toggleCursorTrail } = useSettings();
    const { user, setUser } = useAuth();

    const [nome, setNome] = useState(user?.nome_completo || '');
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState('');

    // Stats & Badges
    const [stats, setStats] = useState(null);
    const [badges, setBadges] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // Feedback
    const [feedbackCategoria, setFeedbackCategoria] = useState('SUGESTAO');
    const [feedbackMensagem, setFeedbackMensagem] = useState('');
    const [feedbackAnonimo, setFeedbackAnonimo] = useState(false);
    const [feedbackEnviando, setFeedbackEnviando] = useState(false);
    const [feedbackSucesso, setFeedbackSucesso] = useState('');

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const [statsRes, badgesRes] = await Promise.all([
                pedidosService.getMinhasEstatisticas().catch(() => ({ data: null })),
                pedidosService.getMinhasConquistas().catch(() => ({ data: null })),
            ]);
            setStats(statsRes.data);
            setBadges(badgesRes.data);
        } catch (err) {
            console.error('Erro ao carregar dados do perfil:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const handleSalvarNome = async () => {
        if (nome.trim().length < 3) {
            setMensagem('Nome deve ter pelo menos 3 caracteres');
            return;
        }

        setSalvando(true);
        setMensagem('');

        try {
            const response = await api.put('/auth/me', { nome_completo: nome.trim() });
            const updatedUser = response.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setMensagem('Nome atualizado com sucesso!');
            setTimeout(() => setMensagem(''), 3000);
        } catch (err) {
            setMensagem(err.response?.data?.detail || 'Erro ao atualizar nome');
        } finally {
            setSalvando(false);
        }
    };

    const handleEnviarFeedback = async () => {
        if (feedbackMensagem.trim().length < 5) {
            setFeedbackSucesso('Mensagem muito curta (mín. 5 caracteres)');
            return;
        }

        setFeedbackEnviando(true);
        setFeedbackSucesso('');

        try {
            await feedbacksService.enviar({
                categoria: feedbackCategoria,
                mensagem: feedbackMensagem.trim(),
                anonimo: feedbackAnonimo,
            });
            setFeedbackSucesso('Feedback enviado com sucesso! Obrigado 🍕');
            setFeedbackMensagem('');
            setFeedbackAnonimo(false);
            setTimeout(() => setFeedbackSucesso(''), 4000);
        } catch (err) {
            setFeedbackSucesso(err.response?.data?.detail || 'Erro ao enviar feedback');
        } finally {
            setFeedbackEnviando(false);
        }
    };

    const themes = [
        { id: 'neon', name: 'Principal', description: 'Tema escuro com vermelho vibrante e tons quentes', colors: ['#E63946', '#F4A261'], locked: false },
        { id: 'christmas', name: 'Neve ❄️', description: 'Tema festivo com flocos de neve animados', colors: ['#DC2626', '#15803D'], locked: false },
        { id: 'premium', name: 'Premium 👑', description: 'Exclusivo para Veteranos VIP', colors: ['#D4A017', '#0A0A0A'], locked: !user?.is_premium },
    ];

    if (loadingData) return <Loading />;

    const initials = (user?.nome_completo || 'U')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-8 py-6 lg:py-10 space-y-6">

                {/* Hero Profile Card */}
                <div className="card overflow-hidden animate-fadeIn">
                    <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent -mx-6 -mt-6 mb-0" />
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 relative z-10 px-2">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white text-2xl font-black shadow-lg ring-4 ring-card shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1 text-center sm:text-left pb-1">
                            <h1 className="text-2xl font-bold text-text-primary">
                                <PremiumName name={user?.nome_completo} isPremium={user?.is_premium} />
                            </h1>
                            <p className="text-sm font-medium text-text-secondary mt-1 max-w-[500px] leading-relaxed">{user?.email}</p>
                        </div>
                        {user?.setor && (
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                                {user.setor}
                            </span>
                        )}
                    </div>

                    {/* Edit name */}
                    <div className="mt-6 pt-5 border-t border-border-color">
                        <label className="block text-xs font-medium text-text-secondary mb-2">Nome Completo</label>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className="input flex-1"
                                placeholder="Seu nome"
                            />
                            <button
                                onClick={handleSalvarNome}
                                disabled={salvando || nome === user?.nome_completo}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                Salvar
                            </button>
                        </div>
                        {mensagem && (
                            <p className={`text-sm mt-2 ${mensagem.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                                {mensagem}
                            </p>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="animate-fadeIn" style={{ animationDelay: '0.05s' }}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <Pizza size={20} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Pizzadas</p>
                                    <p className="text-xl font-bold text-text-primary">{stats.total_pizzadas}</p>
                                </div>
                            </div>
                            <div className="card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                    <Wallet size={20} className="text-green-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Total Gasto</p>
                                    <p className="text-xl font-bold text-text-primary">R${stats.total_gasto.toFixed(0)}</p>
                                </div>
                            </div>
                            <div className="card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Target size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Pedaços</p>
                                    <p className="text-xl font-bold text-text-primary">{stats.total_pedacos}</p>
                                </div>
                            </div>
                            <div className="card flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Globe size={20} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary">Sabores</p>
                                    <p className="text-xl font-bold text-text-primary">{stats.sabores_diferentes}</p>
                                </div>
                            </div>
                        </div>

                        {stats.sabor_favorito && (
                            <div className="card mt-3 flex items-center gap-4">
                                <span className="text-3xl">⭐</span>
                                <div>
                                    <p className="text-xs text-text-secondary">Sabor Favorito</p>
                                    <p className="text-lg font-bold text-text-primary">{stats.sabor_favorito}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Badges */}
                {badges && (
                    <div className="card animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                <Award size={22} className="text-yellow-400" />
                                Conquistas
                            </h2>
                            <span className="text-xs text-text-secondary font-semibold bg-white/5 px-2.5 py-1 rounded-full">
                                {badges.total_desbloqueadas}/{badges.total_badges}
                            </span>
                        </div>

                        <div className="w-full bg-white/10 rounded-full h-1.5 mb-5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-1000"
                                style={{ width: `${(badges.total_desbloqueadas / badges.total_badges) * 100}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {badges.badges.map((badge) => {
                                const IconComponent = BADGE_ICONS[badge.icone] || Award;
                                return (
                                    <div
                                        key={badge.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${badge.desbloqueada
                                            ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
                                            : 'bg-white/[0.01] border-border-color opacity-40'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${badge.desbloqueada
                                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                                            : 'bg-white/5'
                                            }`}>
                                            <IconComponent size={20} className={badge.desbloqueada ? 'text-white' : 'text-text-secondary'} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`font-semibold text-sm ${badge.desbloqueada ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                {badge.nome}
                                            </p>
                                            <p className="text-xs text-text-secondary truncate">{badge.descricao}</p>
                                        </div>
                                        {badge.desbloqueada && (
                                            <Check size={18} className="text-yellow-400 shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Feedback */}
                <div className="card animate-fadeIn" style={{ animationDelay: '0.15s' }}>
                    <h2 className="text-lg font-bold text-text-primary mb-1 flex items-center gap-2">
                        <MessageSquare size={22} className="text-blue-400" />
                        Enviar Feedback
                    </h2>
                    <p className="text-text-secondary text-xs mb-4">Ajude-nos a melhorar! Seu feedback é muito importante.</p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {CATEGORIAS.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setFeedbackCategoria(cat.value)}
                                    className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${feedbackCategoria === cat.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border-color hover:border-primary/50 text-text-secondary'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div>
                            <textarea
                                value={feedbackMensagem}
                                onChange={(e) => setFeedbackMensagem(e.target.value)}
                                className="input w-full min-h-[90px] resize-y"
                                placeholder="Escreva seu feedback aqui..."
                                maxLength={1000}
                            />
                            <p className="text-xs text-text-secondary mt-1 text-right tabular-nums">{feedbackMensagem.length}/1000</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <EyeOff size={16} className="text-text-secondary" />
                                <span className="text-sm text-text-secondary">Enviar como anônimo</span>
                            </div>
                            <button
                                onClick={() => setFeedbackAnonimo(!feedbackAnonimo)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${feedbackAnonimo ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow ${feedbackAnonimo ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {feedbackSucesso && (
                            <p className={`text-sm ${feedbackSucesso.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                                {feedbackSucesso}
                            </p>
                        )}

                        <button
                            onClick={handleEnviarFeedback}
                            disabled={feedbackEnviando || feedbackMensagem.trim().length < 5}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            {feedbackEnviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Enviar Feedback
                        </button>
                    </div>
                </div>

                {/* Settings: Theme + Cursor side by side */}
                <div className="grid md:grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    {/* Theme */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <Palette size={22} />
                            Tema
                        </h2>
                        <div className="space-y-2.5">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => !t.locked && setTheme(t.id, user?.is_premium)}
                                    disabled={t.locked}
                                    title={t.locked ? "Desbloqueie com a badge User Premium" : ""}
                                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all text-left ${
                                        t.locked 
                                        ? 'border-border-color bg-background/50 opacity-60 cursor-not-allowed'
                                        : theme === t.id
                                            ? 'border-primary bg-primary/5 cursor-pointer'
                                            : 'border-border-color hover:border-primary/30 cursor-pointer'
                                        }`}
                                >
                                    <div className={`flex gap-1.5 shrink-0 ${t.locked ? 'grayscale' : ''}`}>
                                        {t.colors.map((color, idx) => (
                                            <div key={idx} className="w-6 h-6 rounded-lg shadow" style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-text-primary flex items-center gap-2">
                                            {t.name}
                                        </p>
                                        <p className="text-xs text-text-secondary truncate">{t.description}</p>
                                    </div>
                                    {t.locked ? (
                                        <Lock size={16} className="text-text-secondary shrink-0" />
                                    ) : theme === t.id && (
                                        <Check size={18} className="text-primary shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cursor Trail */}
                    <div className="card flex flex-col">
                        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <MousePointer2 size={22} />
                            Efeito do Cursor
                        </h2>
                        <div className="flex items-center justify-between mt-auto p-4 rounded-xl bg-white/5 border border-border-color">
                            <div>
                                <p className="font-semibold text-sm text-text-primary">Rastro do Cursor</p>
                                <p className="text-xs text-text-secondary">Efeito visual que segue o mouse</p>
                            </div>
                            <button
                                onClick={toggleCursorTrail}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${cursorTrailEnabled ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow ${cursorTrailEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
