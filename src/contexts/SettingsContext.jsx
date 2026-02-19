import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('pizzada_theme');
        return savedTheme || 'neon';
    });

    const [cursorTrailEnabled, setCursorTrailEnabled] = useState(() => {
        const savedCursorTrail = localStorage.getItem('pizzada_cursor_trail');
        return savedCursorTrail === null ? true : savedCursorTrail === 'true';
    });

    // Apply theme to document root
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pizzada_theme', theme);
    }, [theme]);

    // Save cursor trail preference
    useEffect(() => {
        localStorage.setItem('pizzada_cursor_trail', cursorTrailEnabled.toString());
    }, [cursorTrailEnabled]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'neon' ? 'classic' : 'neon');
    };

    const toggleCursorTrail = () => {
        setCursorTrailEnabled(prev => !prev);
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        cursorTrailEnabled,
        setCursorTrailEnabled,
        toggleCursorTrail,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export default SettingsContext;
