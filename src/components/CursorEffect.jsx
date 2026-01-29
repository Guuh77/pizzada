import React, { useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const CursorEffect = () => {
    const { theme } = useSettings();
    const cursorRef = useRef(null);
    const trailsRef = useRef([]);

    useEffect(() => {
        const cursor = cursorRef.current;
        const trails = trailsRef.current;

        const onMouseMove = (e) => {
            const { clientX, clientY } = e;

            // Create trail particle
            const particle = document.createElement('div');
            particle.className = 'fixed pointer-events-none rounded-full transform -translate-x-1/2 -translate-y-1/2 z-50';
            particle.style.left = `${clientX}px`;
            particle.style.top = `${clientY}px`;

            if (theme === 'christmas') {
                // Snowflake particle for Christmas theme
                particle.innerHTML = '❄️';
                particle.style.fontSize = `${Math.random() * 10 + 10}px`;
                particle.style.opacity = '0.8';
                particle.style.color = '#fff';
                particle.style.textShadow = '0 0 5px #fff';
            } else {
                // Standard dot for other themes
                const size = Math.random() * 8 + 4;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = theme === 'neon' ? '#FF3366' : '#DC2626';
                particle.style.boxShadow = theme === 'neon' ? '0 0 10px #FF3366' : 'none';
            }

            document.body.appendChild(particle);

            // Animate and remove particle
            const animation = particle.animate([
                { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8 },
                { transform: `translate(-50%, -50%) translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 + 20}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0, .9, .57, 1)',
            });

            animation.onfinish = () => particle.remove();
        };

        window.addEventListener('mousemove', onMouseMove);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [theme]);

    return null; // This component doesn't render anything itself, it just manages the DOM elements
};

export default CursorEffect;
