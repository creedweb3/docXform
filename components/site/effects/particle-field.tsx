'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type ParticleFieldProps = {
  className?: string;
  density?: 'ambient' | 'hero';
};

const BASE_COUNT = { ambient: 48, hero: 82 } as const;

export function ParticleField({ className, density = 'ambient' }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;

    const onMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    const linkDistance = density === 'hero' ? 120 : 92;
    const mouseRadius = 150;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width, height };
    };

    const seedParticles = (width: number, height: number) => {
      const area = width * height;
      const scale = Math.min(1.35, Math.max(0.65, area / (1280 * 720)));
      const target = Math.floor(BASE_COUNT[density] * scale);
      const count = reducedMotion ? Math.min(24, target) : target;

      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (reducedMotion ? 0 : 0.26),
        vy: (Math.random() - 0.5) * (reducedMotion ? 0 : 0.26),
        r: Math.random() * 1 + 0.35,
      }));
    };

    let size = resize();
    seedParticles(size.width, size.height);

    const onResize = () => {
      size = resize();
      seedParticles(size.width, size.height);
    };
    window.addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    let visible = true;
    const onVisibility = () => {
      visible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = () => {
      frameRef.current = requestAnimationFrame(tick);
      if (!visible) return;

      const { width, height } = canvas.getBoundingClientRect();
      if (width < 1 || height < 1) return;

      ctx.clearRect(0, 0, width, height);
      const particles = particlesRef.current;
      const { x: mx, y: my, active } = mouseRef.current;

      if (!reducedMotion) {
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x <= 0 || p.x >= width) p.vx *= -1;
          if (p.y <= 0 || p.y >= height) p.vy *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));

          if (active) {
            const dx = p.x - mx;
            const dy = p.y - my;
            const dist = Math.hypot(dx, dy);
            if (dist < mouseRadius && dist > 0.5) {
              const push = ((mouseRadius - dist) / mouseRadius) * 0.026;
              p.vx += (dx / dist) * push;
              p.vy += (dy / dist) * push;
            }
          }
          p.vx *= 0.994;
          p.vy *= 0.994;
        }
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.hypot(dx, dy);
          if (d < linkDistance) {
            const alpha = (1 - d / linkDistance) * (density === 'hero' ? 0.12 : 0.08);
            ctx.strokeStyle = `hsla(26, 55%, 58%, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.fillStyle = `hsla(38, 35%, 78%, ${density === 'hero' ? 0.4 : 0.28})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      motionQuery.removeEventListener('change', onMotionChange);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [density]);

  return <canvas ref={canvasRef} className={cn('h-full w-full', className)} aria-hidden />;
}
