export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    background: string;
    surface: string;
    surfaceHighlight: string;
    border: string;
    primaryNeon: string;
    secondaryNeon: string;
    fingerPalette: string[];
    teamPalette: {
      team1: string;
      team2: string;
      team3: string;
      team4: string;
    };
    winFlash: string;
    failFlash: string;
  };
  particles: {
    shape: 'circle' | 'ring' | 'star';
    defaultCount: number;
    explosionCount: number;
    sparkleCount: number;
  };
  sounds: {
    heartbeat: string;
    drumroll: string;
    explosion: string;
    fail: string;
    button: string;
  };
}

export const defaultTheme: ThemeConfig = {
  id: 'cyber-neon',
  name: '사이버 네온',
  colors: {
    background: '#090a10',
    surface: '#12141f',
    surfaceHighlight: '#1b1e2e',
    border: 'rgba(255, 255, 255, 0.08)',
    primaryNeon: '#06b6d4', // Cyan
    secondaryNeon: '#f59e0b', // Amber
    // 10 distinct high-visibility neon colors for up to 10 simultaneous touches
    fingerPalette: [
      '#06b6d4', // Cyan
      '#f43f5e', // Rose
      '#10b981', // Emerald
      '#a855f7', // Purple
      '#f59e0b', // Amber
      '#3b82f6', // Blue
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#84cc16', // Lime
      '#eab308', // Yellow
    ],
    teamPalette: {
      team1: '#06b6d4', // Cyan Team
      team2: '#f43f5e', // Rose Team
      team3: '#10b981', // Emerald Team
      team4: '#f59e0b', // Amber Team
    },
    winFlash: 'rgba(6, 182, 212, 0.35)',
    failFlash: 'rgba(244, 63, 94, 0.4)',
  },
  particles: {
    shape: 'circle',
    defaultCount: 16,
    explosionCount: 80,
    sparkleCount: 30,
  },
  sounds: {
    heartbeat: '/sounds/heartbeat.mp3',
    drumroll: '/sounds/drumroll.mp3',
    explosion: '/sounds/explosion.mp3',
    fail: '/sounds/fail.mp3',
    button: '/sounds/button.mp3',
  },
};
