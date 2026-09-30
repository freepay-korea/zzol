class WakeLockManager {
  private sentinel: WakeLockSentinel | null = null;
  private isRequested: boolean = false;

  constructor() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isRequested) {
          this.request();
        }
      });
    }
  }

  async request(): Promise<boolean> {
    this.isRequested = true;
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      try {
        if (this.sentinel && !this.sentinel.released) {
          return true;
        }
        this.sentinel = await navigator.wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null;
        });
        return true;
      } catch {
        // Battery saving mode or browser permission might reject silently
        return false;
      }
    }
    return false;
  }

  async release(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch {
        // Ignore
      }
      this.sentinel = null;
    }
  }
}

export const wakeLock = new WakeLockManager();
