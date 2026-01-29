import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import Header from '../components/Header';
import { Palette, MousePointer2, Check } from 'lucide-react';

const Settings = () => {
    const { theme, setTheme, cursorTrailEnabled, toggleCursorTrail } = useSettings();

    const themes = [
        {
            id: 'neon',
            name: 'Neon',
            description: 'Tema escuro com cores vibrantes e efeitos neon',
            colors: ['#FF3366', '#00F0FF'],
        },
        {
            id: 'classic',
            name: 'Clássico',
            description: 'Tema claro com cores tradicionais de pizzaria',
            colors: ['#DC2626', '#F59E0B'],
        },
        {
            id: 'dark',
            name: 'Dark',
            description: 'Tema escuro elegante com tons de azul e roxo',
            colors: ['#3B82F6', '#8B5CF6'],
        },
        {
            id: 'christmas',
            name: 'Neve',
            description: 'Tema escuro com efeito de neve caindo',
            colors: ['#D42426', '#165B33'],
        },
    ];

    return (
        <div className="min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
                        <Palette className="text-primary" size={32} />
                        Ajustes
                    </h1>
                    <p className="text-text-secondary">Personalize a aparência e funcionalidades do sistema</p>
                </div>

                {/* Theme Selection */}
                <div className="card mb-6">
                    <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Palette size={24} />
                        Tema
                    </h2>
                    <p className="text-text-secondary mb-6">Escolha o tema que mais combina com você</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        <div
                                            key={idx}
                                            className="w-12 h-12 rounded-lg shadow-lg"
                                            style={{ backgroundColor: color }}
                                        />
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
        </div>
    );
};

export default Settings;
