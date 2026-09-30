import confetti from 'canvas-confetti';
import { defaultTheme } from '../themes/default';

export const triggerWinConfetti = () => {
  const colors = defaultTheme.colors.fingerPalette;

  // Center blast
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  // Left & right cannons
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
  }, 200);
};

export const triggerFireworks = () => {
  const colors = defaultTheme.colors.fingerPalette;
  const end = Date.now() + 1200;

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    confetti({
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      origin: {
        x: Math.random(),
        y: Math.random() * 0.5 + 0.2,
      },
      colors,
      disableForReducedMotion: true,
    });
  }, 250);
};
