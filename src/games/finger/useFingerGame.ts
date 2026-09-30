import { useState, useRef, useEffect, useCallback } from 'react';
import { defaultTheme } from '../../themes/default';
import { sounds } from '../../effects/sound';
import { haptics } from '../../effects/haptics';
import { triggerWinConfetti } from '../../effects/confetti';

export type FingerGameMode = 'single' | 'multiple' | 'teams';
export type FingerGameState = 'waiting' | 'stabilizing' | 'countdown' | 'result';

export interface FingerPoint {
  id: number | string;
  x: number;
  y: number;
  color: string;
  isWinner?: boolean;
  teamIndex?: number;
  scale?: number;
}

export function useFingerGame() {
  const [mode, setMode] = useState<FingerGameMode>('single');
  const [winnerCount, setWinnerCount] = useState<number>(2);
  const [teamCount, setTeamCount] = useState<number>(2);
  const [gameState, setGameState] = useState<FingerGameState>('waiting');
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [fingers, setFingers] = useState<FingerPoint[]>([]);

  // Refs for tracking mutable touch state without re-render lag
  const touchesRef = useRef<Map<number | string, FingerPoint>>(new Map());
  const stabilizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameStateRef = useRef<FingerGameState>('waiting');
  const colorIndexRef = useRef<number>(0);

  // Synchronize ref
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Reset timers safely
  const clearAllTimers = useCallback(() => {
    if (stabilizeTimerRef.current) {
      clearTimeout(stabilizeTimerRef.current);
      stabilizeTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Unbiased crypto random integer in range [0, max)
  const getCryptoRandom = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  // Cryptographic Fisher-Yates shuffle
  const cryptoShuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = getCryptoRandom(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Complete game and compute results
  const finalizeGame = useCallback(() => {
    clearAllTimers();
    setGameState('result');
    gameStateRef.current = 'result';

    const currentFingers = Array.from(touchesRef.current.values());
    if (currentFingers.length === 0) return;

    sounds.playExplosion();
    haptics.trigger('success');
    triggerWinConfetti();

    if (mode === 'single') {
      const winnerIdx = getCryptoRandom(currentFingers.length);
      const updated = currentFingers.map((f, idx) => ({
        ...f,
        isWinner: idx === winnerIdx,
      }));
      setFingers([...updated]);
    } else if (mode === 'multiple') {
      const count = Math.min(Math.max(1, winnerCount), currentFingers.length - 1);
      const shuffledIndices = cryptoShuffle(currentFingers.map((_, i) => i));
      const winnerIndices = new Set(shuffledIndices.slice(0, count));

      const updated = currentFingers.map((f, idx) => ({
        ...f,
        isWinner: winnerIndices.has(idx),
      }));
      setFingers([...updated]);
    } else if (mode === 'teams') {
      const teamColors = [
        defaultTheme.colors.teamPalette.team1,
        defaultTheme.colors.teamPalette.team2,
        defaultTheme.colors.teamPalette.team3,
        defaultTheme.colors.teamPalette.team4,
      ];

      const shuffled = cryptoShuffle(currentFingers);
      const updated = shuffled.map((f, idx) => {
        const tIndex = idx % teamCount;
        return {
          ...f,
          teamIndex: tIndex,
          color: teamColors[tIndex],
          isWinner: true,
        };
      });
      setFingers([...updated]);
    }
  }, [clearAllTimers, mode, winnerCount, teamCount]);

  // Start 3-second countdown
  const startCountdown = useCallback(() => {
    setGameState('countdown');
    gameStateRef.current = 'countdown';
    setCountdownValue(3);
    sounds.playCountdown(3);
    haptics.trigger('countdown');

    let currentCount = 3;
    countdownIntervalRef.current = setInterval(() => {
      currentCount -= 1;
      if (currentCount > 0) {
        setCountdownValue(currentCount);
        sounds.playCountdown(currentCount);
        haptics.trigger('countdown');
      } else {
        clearInterval(countdownIntervalRef.current!);
        countdownIntervalRef.current = null;
        finalizeGame();
      }
    }, 1000);
  }, [finalizeGame]);

  // Restart stabilization check (2 seconds with constant finger count >= 2)
  const scheduleStabilization = useCallback(() => {
    clearAllTimers();

    const count = touchesRef.current.size;
    if (count < 2) {
      setGameState('waiting');
      gameStateRef.current = 'waiting';
      return;
    }

    setGameState('stabilizing');
    gameStateRef.current = 'stabilizing';
    sounds.playHeartbeat(1);
    haptics.trigger('light');

    stabilizeTimerRef.current = setTimeout(() => {
      if (touchesRef.current.size >= 2) {
        startCountdown();
      }
    }, 2000);
  }, [clearAllTimers, startCountdown]);

  // Touch / Pointer Event Handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // Check if touching interactive element (buttons, header, modal)
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, [role="button"], input, a, header, .interactive-zone')) {
        return; // Don't prevent default, allow clicks on UI elements!
      }

      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const palette = defaultTheme.colors.fingerPalette;

      // If user was on result screen and touches background with fingers, start a fresh round
      if (gameStateRef.current === 'result') {
        clearAllTimers();
        touchesRef.current.clear();
        setFingers([]);
        setGameState('waiting');
        gameStateRef.current = 'waiting';
      }

      let hasNewTouch = false;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (!touchesRef.current.has(touch.identifier)) {
          if (touchesRef.current.size >= 10) break; // Max 10 fingers

          const color = palette[colorIndexRef.current % palette.length];
          colorIndexRef.current += 1;

          touchesRef.current.set(touch.identifier, {
            id: touch.identifier,
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
            color,
            isWinner: false,
          });
          hasNewTouch = true;
          haptics.trigger('selection');
        }
      }

      if (hasNewTouch) {
        setFingers(Array.from(touchesRef.current.values()));
        scheduleStabilization();
      }
    },
    [clearAllTimers, scheduleStabilization]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button, [role="button"], input, a, header, .interactive-zone')) {
      return;
    }

    e.preventDefault();
    if (gameStateRef.current === 'result') return;

    const rect = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const existing = touchesRef.current.get(touch.identifier);
      if (existing) {
        existing.x = touch.clientX - rect.left;
        existing.y = touch.clientY - rect.top;
      }
    }
    setFingers(Array.from(touchesRef.current.values()));
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, [role="button"], input, a, header, .interactive-zone')) {
        return;
      }

      e.preventDefault();

      let changed = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touchesRef.current.has(touch.identifier)) {
          touchesRef.current.delete(touch.identifier);
          changed = true;
        }
      }

      // If during active game someone lifts finger, reset
      if (gameStateRef.current !== 'result') {
        if (changed) {
          setFingers(Array.from(touchesRef.current.values()));
          haptics.trigger('light');
          scheduleStabilization();
        }
      }
    },
    [scheduleStabilization]
  );

  const handleTouchCancel = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      handleTouchEnd(e);
    },
    [handleTouchEnd]
  );

  // Mouse fallback for testing on desktop browser
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, [role="button"], input, a, header, .interactive-zone')) {
        return;
      }

      // If it's a mouse event (pointerType === 'mouse'), allow clicking to simulate touches
      if (e.pointerType === 'mouse') {
        const rect = e.currentTarget.getBoundingClientRect();
        
        if (gameStateRef.current === 'result') {
          clearAllTimers();
          touchesRef.current.clear();
          setFingers([]);
          setGameState('waiting');
          gameStateRef.current = 'waiting';
        }

        const id = `sim-${Date.now()}-${Math.random()}`;
        const palette = defaultTheme.colors.fingerPalette;
        const color = palette[colorIndexRef.current % palette.length];
        colorIndexRef.current += 1;

        touchesRef.current.set(id, {
          id,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          color,
          isWinner: false,
        });

        haptics.trigger('selection');
        setFingers(Array.from(touchesRef.current.values()));
        scheduleStabilization();
      }
    },
    [clearAllTimers, scheduleStabilization]
  );

  const resetGame = useCallback(() => {
    clearAllTimers();
    touchesRef.current.clear();
    setFingers([]);
    setGameState('waiting');
    gameStateRef.current = 'waiting';
    haptics.trigger('light');
  }, [clearAllTimers]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    mode,
    setMode,
    winnerCount,
    setWinnerCount,
    teamCount,
    setTeamCount,
    gameState,
    countdownValue,
    fingers,
    resetGame,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handlePointerDown,
  };
}
