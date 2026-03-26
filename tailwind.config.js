/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'background': 'var(--color-background)',
                'card': 'var(--color-card)',
                'primary': 'var(--color-primary)',
                'primary-hover': 'var(--color-primary-hover)',
                'secondary': 'var(--color-secondary)',
                'secondary-hover': 'var(--color-secondary-hover)',
                'text-primary': 'var(--color-text-primary)',
                'text-secondary': 'var(--color-text-secondary)',
                'border-color': 'var(--color-border)',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'theme': 'var(--radius)',
                'theme-sm': 'var(--radius-sm)',
            },
            boxShadow: {
                'card': 'var(--shadow-card)',
                'card-hover': 'var(--shadow-card-hover)',
                'primary': 'var(--shadow-neon-primary)',
                'secondary': 'var(--shadow-neon-secondary)',
                'lg': '0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
                'xl': '0 20px 40px -5px rgba(0, 0, 0, 0.4)',
                'glow-primary': '0 0 20px rgba(230, 57, 70, 0.3)',
                'glow-secondary': '0 0 20px rgba(244, 162, 97, 0.3)',
                'neon-primary': 'var(--shadow-neon-primary)',
                'neon-secondary': 'var(--shadow-neon-secondary)',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.6' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.4s ease-out',
                fadeInUp: 'fadeInUp 0.5s ease-out',
                slideDown: 'slideDown 0.3s ease-out',
                float: 'float 6s ease-in-out infinite',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                scaleIn: 'scaleIn 0.3s ease-out',
                shimmer: 'shimmer 2s linear infinite',
            },
        },
    },
    plugins: [],
}