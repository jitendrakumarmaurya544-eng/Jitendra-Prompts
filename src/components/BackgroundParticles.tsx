import React, { useEffect, useRef } from 'react';

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(Math.floor(width / 30), 45);
    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      speedY: number;
      speedX: number;
      alpha: number;
      pulseSpeed: number;
    }> = [];

    const goldColors = [
      'rgba(245, 215, 122, ',
      'rgba(212, 175, 55, ',
      'rgba(255, 241, 197, ',
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.6,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.5 + 0.15,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Subtle ambient gold radial lighting
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.2,
        100,
        width * 0.5,
        height * 0.2,
        width * 0.8
      );
      grad.addColorStop(0, 'rgba(212, 175, 55, 0.035)');
      grad.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render floating specks
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const currentAlpha = p.alpha + Math.sin(tick * p.pulseSpeed) * 0.12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.05, currentAlpha)})`;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
