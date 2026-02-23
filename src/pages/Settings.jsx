import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Loading from '../components/Loading';
import {
    Palette, MousePointer2, Check, User, Save, Loader2,
    BarChart3, Trophy, Crown, Globe, Target, Wallet, Zap, Pizza, Award,
    MessageSquare, Send, EyeOff, Baby, Heart, Flame, Map, Star
} from 'lucide-react';
import api, { pedidosService, feedbacksService } from '../services/api';

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
        { id: 'neon', name: 'Neon', description: 'Tema escuro com cores vibrantes e efeitos neon', colors: ['#FF3366', '#00F0FF'] },
        { id: 'classic', name: 'Clássico', description: 'Tema claro com cores tradicionais de pizzaria', colors: ['#DC2626', '#F59E0B'] },
        { id: 'dark', name: 'Dark', description: 'Tema escuro elegante com tons de azul e roxo', colors: ['#3B82F6', '#8B5CF6'] },
        { id: 'christmas', name: 'Neve', description: 'Tema escuro com efeito de neve caindo', colors: ['#D42426', '#165B33'] },
    ];

    const StatCard = ({ label, value, icon: Icon, gradient }) => (
        <div className={`${gradient} rounded-xl p-4 text-white`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs opacity-80 uppercase tracking-wide">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                </div>
                <Icon size={28} className="opacity-60" />
            </div>
        </div>
    );

    if (loadingData) return <Loading />;

    return (
        <div className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
                        <User className="text-primary" size={32} />
                        Meu Perfil
                    </h1>
                    <p className="text-text-secondary">Suas estatísticas, conquistas e configurações</p>
                </div>

                {/* Profile Section */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <User size={24} />
                        Dados Pessoais
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Nome Completo
                            </label>
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
                                    {salvando ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Salvar
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">E-mail</label>
                            <input type="text" value={user?.email || ''} disabled className="input w-full opacity-60 cursor-not-allowed" />
                            <p className="text-xs text-text-secondary mt-1">O e-mail não pode ser alterado</p>
                        </div>

                        {mensagem && (
                            <div className={`text-sm ${mensagem.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                                {mensagem}
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Section */}
                {!loadingData && stats && (
                    <div className="card mb-6 animate-fadeIn">
                        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                            <BarChart3 size={24} className="text-primary" />
                            Minhas Estatísticas
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard
                                label="Pizzadas"
                                value={stats.total_pizzadas}
                                icon={Pizza}
                                gradient="bg-gradient-to-br from-primary to-primary-hover"
                            />
                            <StatCard
                                label="Total Gasto"
                                value={`R$${stats.total_gasto.toFixed(0)}`}
                                icon={Wallet}
                                gradient="bg-gradient-to-br from-green-500 to-green-700"
                            />
                            <StatCard
                                label="Pedaços"
                                value={stats.total_pedacos}
                                icon={Target}
                                gradient="bg-gradient-to-br from-blue-500 to-blue-700"
                            />
                            <StatCard
                                label="Sabores"
                                value={stats.sabores_diferentes}
                                icon={Globe}
                                gradient="bg-gradient-to-br from-amber-500 to-amber-700"
                            />
                        </div>

                        {stats.sabor_favorito && (
                            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                                <span className="text-2xl">⭐</span>
                                <div>
                                    <p className="text-xs text-text-secondary">Sabor Favorito</p>
                                    <p className="font-bold text-text-primary">{stats.sabor_favorito}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Badges Section */}
                {!loadingData && badges && (
                    <div className="card mb-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                            <Award size={24} className="text-yellow-400" />
                            Conquistas
                        </h2>
                        <p className="text-text-secondary text-sm mb-4">
                            {badges.total_desbloqueadas}/{badges.total_badges} desbloqueadas
                        </p>

                        <div className="w-full bg-white/10 rounded-full h-2 mb-6 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-1000"
                                style={{ width: `${(badges.total_desbloqueadas / badges.total_badges) * 100}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {badges.badges.map((badge) => {
                                const IconComponent = BADGE_ICONS[badge.icone] || Award;
                                return (
                                    <div
                                        key={badge.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${badge.desbloqueada
                                            ? 'bg-white/5 border-yellow-500/30 hover:border-yellow-500/60'
                                            : 'bg-white/[0.02] border-white/5 opacity-50'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${badge.desbloqueada
                                            ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                                            : 'bg-gray-700'
                                            }`}>
                                            <IconComponent size={24} className={badge.desbloqueada ? 'text-white' : 'text-gray-500'} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-bold ${badge.desbloqueada ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                {badge.nome}
                                            </p>
                                            <p className="text-xs text-text-secondary">{badge.descricao}</p>
                                            <p className="text-xs text-text-secondary mt-0.5 italic">{badge.condicao}</p>
                                        </div>
                                        {badge.desbloqueada && (
                                            <Check size={20} className="text-yellow-400 flex-shrink-0 ml-auto" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Feedback Section */}
                <div className="card mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                        <MessageSquare size={24} className="text-blue-400" />
                        Enviar Feedback
                    </h2>
                    <p className="text-text-secondary text-sm mb-4">
                        Ajude-nos a melhorar! Seu feedback é muito importante.
                    </p>

                    <div className="space-y-4">
                        {/* Category selector */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Categoria</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {CATEGORIAS.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => setFeedbackCategoria(cat.value)}
                                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${feedbackCategoria === cat.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border-color hover:border-primary/50 text-text-secondary hover:text-text-primary'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Mensagem</label>
                            <textarea
                                value={feedbackMensagem}
                                onChange={(e) => setFeedbackMensagem(e.target.value)}
                                className="input w-full min-h-[100px] resize-y"
                                placeholder="Escreva seu feedback aqui..."
                                maxLength={1000}
                            />
                            <p className="text-xs text-text-secondary mt-1 text-right">
                                {feedbackMensagem.length}/1000
                            </p>
                        </div>

                        {/* Anonymous toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <EyeOff size={18} className="text-text-secondary" />
                                <span className="text-sm text-text-secondary">Enviar como anônimo</span>
                            </div>
                            <button
                                onClick={() => setFeedbackAnonimo(!feedbackAnonimo)}
                                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${feedbackAnonimo ? 'bg-primary' : 'bg-gray-600'
                                    }`}
                            >
                                <div
                                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${feedbackAnonimo ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>

                        {feedbackSucesso && (
                            <div className={`text-sm ${feedbackSucesso.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
                                {feedbackSucesso}
                            </div>
                        )}

                        <button
                            onClick={handleEnviarFeedback}
                            disabled={feedbackEnviando || feedbackMensagem.trim().length < 5}
                            className="btn-primary flex items-center gap-2 disabled:opacity-50"
                        >
                            {feedbackEnviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            Enviar Feedback
                        </button>
                    </div>
                </div>

                {/* Theme Selection */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Palette size={24} />
                        Tema
                    </h2>
                    <p className="text-text-secondary mb-6">Escolha o tema que mais combina com você</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${theme === t.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border-color hover:border-primary/50 hover:bg-white/5'
                                    }`}
                            >
                                {theme === t.id && (
                                    <div className="absolute top-4 right-4">
                                        <Check className="text-primary" size={24} />
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-text-primary mb-2">{t.name}</h3>
                                <p className="text-sm text-text-secondary mb-4">{t.description}</p>
                                <div className="flex gap-2">
                                    {t.colors.map((color, idx) => (
                                        <div key={idx} className="w-12 h-12 rounded-lg shadow-lg" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cursor Trail Toggle */}
                <div className="card">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <MousePointer2 size={24} />
                        Efeito do Cursor
                    </h2>
                    <p className="text-text-secondary mb-6">Ative ou desative o rastro animado do cursor</p>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-text-primary">Rastro do Cursor</p>
                            <p className="text-sm text-text-secondary">Efeito visual que segue o movimento do mouse</p>
                        </div>
                        <button
                            onClick={toggleCursorTrail}
                            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${cursorTrailEnabled ? 'bg-primary' : 'bg-gray-600'
                                }`}
                        >
                            <div
                                className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${cursorTrailEnabled ? 'translate-x-9' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Settings;
