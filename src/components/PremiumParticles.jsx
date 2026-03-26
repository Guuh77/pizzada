import React, { useEffect, useRef } from 'react';

const PremiumParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particles = [];
        const baseParticleCount = 400;
        const fastParticleCount = 400;
        const shapes = ['circle', 'triangle', 'star', 'x'];

        // Base layer: Regular glowing particles, multi-directional
        class PremiumParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.3; // Very small to medium
                this.shape = shapes[Math.floor(Math.random() * shapes.length)];
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.05;
                
                // 360 degrees fully random direction
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 0.6 + 0.1;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                
                this.opacity = Math.random() * 0.6 + 0.1;
                this.hue = 40 + Math.random() * 20; // 40-60 (gold/yellow range)
                this.glow = Math.random() > 0.5;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;

                // Screen wrapping
                if (this.x > canvas.width + 10) this.x = -10;
                else if (this.x < -10) this.x = canvas.width + 10;
                
                if (this.y > canvas.height + 10) this.y = -10;
                else if (this.y < -10) this.y = canvas.height + 10;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.beginPath();
                
                const s = this.size;
                
                if (this.shape === 'circle') {
                    ctx.arc(0, 0, s, 0, Math.PI * 2);
                } else if (this.shape === 'triangle') {
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s, s);
                    ctx.lineTo(-s, s);
                    ctx.closePath();
                } else if (this.shape === 'star') {
                    for (let i = 0; i < 5; i++) {
                        ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * s,
                                   -Math.sin((18 + i * 72) / 180 * Math.PI) * s);
                        ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (s / 2),
                                   -Math.sin((54 + i * 72) / 180 * Math.PI) * (s / 2));
                    }
                    ctx.closePath();
                } else if (this.shape === 'x') {
                    ctx.moveTo(-s, -s);
                    ctx.lineTo(s, s);
                    ctx.moveTo(s, -s);
                    ctx.lineTo(-s, s);
                }
                
                if (this.glow) {
                    ctx.shadowBlur = s * 3;
                    ctx.shadowColor = `rgba(255, 215, 0, ${this.opacity})`;
                }
                
                const color = `hsla(${this.hue}, 100%, 50%, ${this.opacity})`;
                ctx.fillStyle = color;
                
                if (this.shape === 'x') {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.max(0.5, s / 2);
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }

        // Second layer: Shiny, super fast, wildly sporadic directions
        class FastPremiumParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1; // Slightly larger on average
                this.shape = shapes[Math.floor(Math.random() * shapes.length)];
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.1;
                
                // Faster, erratic 360 directions
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2.5 + 0.5;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
                
                this.opacity = Math.random() * 0.4 + 0.1;
                this.hue = 45 + Math.random() * 10; // Pure gold
                this.wobble = Math.random() * Math.PI * 2; // Unique erratic movement
                this.wobbleSpeed = Math.random() * 0.05;
            }

            update() {
                // Erratic wobbling to direction
                this.wobble += this.wobbleSpeed;
                this.x += this.speedX + Math.cos(this.wobble) * 0.5;
                this.y += this.speedY + Math.sin(this.wobble) * 0.5;
                this.rotation += this.rotationSpeed;

                // Screen wrapping
                if (this.x > canvas.width + 10) this.x = -10;
                else if (this.x < -10) this.x = canvas.width + 10;
                
                if (this.y > canvas.height + 10) this.y = -10;
                else if (this.y < -10) this.y = canvas.height + 10;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.beginPath();
                
                const s = this.size;
                
                if (this.shape === 'circle') {
                    ctx.arc(0, 0, s, 0, Math.PI * 2);
                } else if (this.shape === 'triangle') {
                    ctx.moveTo(0, -s);
                    ctx.lineTo(s, s);
                    ctx.lineTo(-s, s);
                    ctx.closePath();
                } else if (this.shape === 'star') {
                    for (let i = 0; i < 5; i++) {
                        ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * s,
                                   -Math.sin((18 + i * 72) / 180 * Math.PI) * s);
                        ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (s / 2),
                                   -Math.sin((54 + i * 72) / 180 * Math.PI) * (s / 2));
                    }
                    ctx.closePath();
                } else if (this.shape === 'x') {
                    ctx.moveTo(-s, -s);
                    ctx.lineTo(s, s);
                    ctx.moveTo(s, -s);
                    ctx.lineTo(-s, s);
                }
                
                ctx.shadowBlur = s * 5;
                ctx.shadowColor = `rgba(255, 215, 0, ${this.opacity + 0.2})`;
                
                const color = `hsla(${this.hue}, 100%, 65%, ${this.opacity})`;
                ctx.fillStyle = color;
                
                if (this.shape === 'x') {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = Math.max(0.5, s / 2);
                    ctx.stroke();
                } else {
                    ctx.fill();
                }
                
                ctx.restore();
            }
        }

        for (let i = 0; i < baseParticleCount; i++) {
            particles.push(new PremiumParticle());
        }

        for (let i = 0; i < fastParticleCount; i++) {
            particles.push(new FastPremiumParticle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
        />
    );
};

export default PremiumParticles;
