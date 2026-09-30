import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  toggleSound: () => void;
  toggleHaptic: () => void;
  setSound: (val: boolean) => void;
  setHaptic: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      hapticEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleHaptic: () => set((state) => ({ hapticEnabled: !state.hapticEnabled })),
      setSound: (val) => set({ soundEnabled: val }),
      setHaptic: (val) => set({ hapticEnabled: val }),
    }),
    {
      name: 'hanpan_settings',
    }
  )
);
