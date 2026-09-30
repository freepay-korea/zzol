import React, { useEffect, useRef } from 'react';
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
  const prevGameStateRef = useRef<FingerGameState>(gameState);

  // Trigger celebration explosion on winning
  useEffect(() => {
    if (prevGameStateRef.current !== 'result' && gameState === 'result') {
      const winners = fingers.filter((f) => f.isWinner);
      winners.forEach((winner) => {
        // Spawn 45 neon particles per winner
        for (let i = 0; i < 45; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 3;
          particlesRef.current.push({
            x: winner.x,
            y: winner.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: winner.color,
            size: Math.random() * 5 + 3,
            alpha: 1,
            decay: Math.random() * 0.015 + 0.01,
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

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
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
        const baseRadius = isWinner && gameState === 'result' ? 56 : 42;
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

        // 2. Continuous Expanding Shockwave Wave for Winner
        if (gameState === 'result' && isWinner) {
          const waveRadius = ((elapsed * 50) % 60) + outerRadius;
          const waveAlpha = Math.max(0, 1 - (waveRadius - outerRadius) / 60);
          ctx.beginPath();
          ctx.arc(x, y, waveRadius, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = waveAlpha;
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }

        // 3. Outer Neon Breathing Ring
        ctx.beginPath();
        ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = isWinner && gameState === 'result' ? 5.5 : 3.5;
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.stroke();

        // 4. Inner Center Core
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // 5. Winner Badge Text directly on the finger ring
        if (gameState === 'result' && isWinner) {
          if (finger.teamIndex !== undefined) {
            ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#000000';
            ctx.fillText(`${finger.teamIndex + 1}팀`, x, y - outerRadius - 16);
          } else {
            ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 12;
            ctx.shadowColor = color;
            ctx.fillText('👑 당첨!', x, y - outerRadius - 16);
          }
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

        if (p.alpha <= 0) {
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

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [fingers, gameState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    />
  );
};
