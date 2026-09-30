import React, { useRef, useEffect } from 'react';
import { FingerPoint, FingerGameState } from './useFingerGame';

interface FingerCanvasProps {
  fingers: FingerPoint[];
  gameState: FingerGameState;
  countdownValue: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

export const FingerCanvas: React.FC<FingerCanvasProps> = ({
  fingers,
  gameState,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const prevGameStateRef = useRef<FingerGameState>(gameState);

  // Trigger explosion particles when transitioning into 'result'
  useEffect(() => {
    if (prevGameStateRef.current !== 'result' && gameState === 'result') {
      const winners = fingers.filter((f) => f.isWinner);
      const targets = winners.length > 0 ? winners : fingers;

      targets.forEach((target) => {
        const count = 45;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
          const speed = Math.random() * 8 + 3;
          particlesRef.current.push({
            x: target.x,
            y: target.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: target.color,
            size: Math.random() * 6 + 3,
            alpha: 1,
            decay: Math.random() * 0.02 + 0.015,
          });
        }
      });
    }
    prevGameStateRef.current = gameState;
  }, [gameState, fingers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    let startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Render Finger Rings & Cores
      fingers.forEach((finger) => {
        const { x, y, color, isWinner } = finger;

        // Skip losers in result state
        if (gameState === 'result' && !isWinner) {
          return;
        }

        // Pulse speed depends on state
        const pulseSpeed = gameState === 'countdown' ? 9 : gameState === 'stabilizing' ? 6 : 3;
        const pulse = Math.sin(elapsed * pulseSpeed) * 6;
        const baseRadius = isWinner && gameState === 'result' ? 58 : 42;
        const outerRadius = Math.max(20, baseRadius + pulse);

        // 1. Ambient Glow Field
        const gradient = ctx.createRadialGradient(x, y, 10, x, y, outerRadius * 1.6);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.4, color + '66');
        gradient.addColorStop(1, 'transparent');

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, outerRadius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // 2. Outer Neon Breathing Ring
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = isWinner && gameState === 'result' ? 5.5 : 3.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.stroke();

        // 3. Inner Center Core
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // 4. Team Badge if in Teams mode
        if (finger.teamIndex !== undefined) {
          ctx.font = 'bold 15px Pretendard, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#000000';
          ctx.fillText(`${finger.teamIndex + 1}팀`, x, y - outerRadius - 14);
        }

        ctx.restore();

        // Ambient sparks while waiting/stabilizing
        if (Math.random() < 0.25 && (gameState === 'waiting' || gameState === 'stabilizing')) {
          const spawnAngle = Math.random() * Math.PI * 2;
          const dist = outerRadius + Math.random() * 15;
          particlesRef.current.push({
            x: x + Math.cos(spawnAngle) * dist,
            y: y + Math.sin(spawnAngle) * dist,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 2 - 0.5,
            color,
            size: Math.random() * 3 + 1.5,
            alpha: 0.9,
            decay: 0.03,
          });
        }
      });

      // Update & Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size = Math.max(0, p.size - 0.04);

        if (p.alpha <= 0 || p.size <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [fingers, gameState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
