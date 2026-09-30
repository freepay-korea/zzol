import { useSettingsStore } from '../store/useSettingsStore';

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error'
  | 'countdown'
  | 'heartbeat';

export interface HapticService {
  trigger: (type: HapticType) => void;
  stop: () => void;
}

const patternMap: Record<HapticType, number | number[]> = {
  selection: 10,
  light: 15,
  medium: 35,
  heavy: 60,
  countdown: 25,
  heartbeat: [20, 80, 20],
  success: [40, 60, 60],
  warning: [50, 70, 50],
  error: [80, 60, 80, 60, 120],
};

export const haptics: HapticService = {
  trigger: (type: HapticType) => {
    try {
      const enabled = useSettingsStore.getState().hapticEnabled;
      if (!enabled) return;

      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        const pattern = patternMap[type] || 20;
        navigator.vibrate(pattern);
      }
    } catch {
      // Gracefully ignore on unsupported devices or browsers with blocked vibrations
    }
  },
  stop: () => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
        navigator.vibrate(0);
      }
    } catch {
      // Ignore
    }
  },
};
