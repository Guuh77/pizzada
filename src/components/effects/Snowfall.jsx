import React, { useEffect, useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const Snowfall = () => {
    const { theme } = useSettings();
    const canvasRef = useRef(null);

    useEffect(() => {
        if (theme !== 'christmas') return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const snowflakes = [];
        const snowflakeCount = 500;

        class Snowflake {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.8 + 0.3;
                this.speedX = Math.random() * 1.2 - 0.6;
                this.speedY = Math.random() * 1.8 + 0.2;
                this.opacity = Math.random() * 0.6 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.y > canvas.height) {
                    this.y = 0;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x > canvas.width) {
                    this.x = 0;
                } else if (this.x < 0) {
                    this.x = canvas.width;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Segunda camada: flocos pequenos e rápidos
        class FastSnowflake {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1 + 0.3;
                // Movimento mais aleatório: alguns retos, outros bem diagonais
                const direction = Math.random();
                if (direction < 0.3) {
                    // Cai quase reto (como chuva)
                    this.speedX = Math.random() * 0.4 - 0.2;
                } else if (direction < 0.6) {
                    // Diagonal para direita
                    this.speedX = Math.random() * 3 + 1;
                } else {
                    // Diagonal para esquerda
                    this.speedX = -(Math.random() * 3 + 1);
                }
                this.speedY = Math.random() * 2 + 2;
                this.opacity = Math.random() * 0.4 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.y > canvas.height) {
                    this.y = 0;
                    this.x = Math.random() * canvas.width;
                }
                if (this.x > canvas.width) {
                    this.x = 0;
                } else if (this.x < 0) {
                    this.x = canvas.width;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < snowflakeCount; i++) {
            snowflakes.push(new Snowflake());
        }

        // Adiciona flocos rápidos
        const fastSnowflakeCount = 500;
        for (let i = 0; i < fastSnowflakeCount; i++) {
            snowflakes.push(new FastSnowflake());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            snowflakes.forEach(snowflake => {
                snowflake.update();
                snowflake.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    if (theme !== 'christmas') return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
        />
    );
};

export default Snowfall;
