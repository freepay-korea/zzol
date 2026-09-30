import { useSettingsStore } from '../store/useSettingsStore';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().then(() => {
            this.isUnlocked = true;
          });
        } else {
          this.isUnlocked = true;
        }
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };

      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  private isEnabled(): boolean {
    return useSettingsStore.getState().soundEnabled;
  }

  // Button tap blip
  playButton() {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  // Heartbeat pulse (waiting/countdown rhythm)
  playHeartbeat(intensity: number = 1) {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(75 * intensity, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.18);

      gain.gain.setValueAtTime(0.3 * Math.min(intensity, 1.5), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  // Countdown tick (3, 2, 1)
  playCountdown(count: number) {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch goes up as countdown nears 0 (3: 587Hz D5, 2: 740Hz F#5, 1: 880Hz A5)
      const freq = count === 1 ? 880 : count === 2 ? 740 : 587;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }

  // Drumroll / tension riser
  playDrumroll() {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(350, now + 0.6);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // Ignore
    }
  }

  // Explosion / Winner fanfare
  playExplosion() {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Bass boom
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);
      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);

      // Major chord victory arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const noteOsc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        const start = now + idx * 0.08;

        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(freq, start);

        noteGain.gain.setValueAtTime(0.25, start);
        noteGain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

        noteOsc.connect(noteGain);
        noteGain.connect(this.ctx!.destination);

        noteOsc.start(start);
        noteOsc.stop(start + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  // Fail buzzer / 꽝
  playFail() {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.linearRampToValueAtTime(80, now + 0.5);

      osc2.frequency.setValueAtTime(175, now);
      osc2.frequency.linearRampToValueAtTime(75, now + 0.5);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);
    } catch {
      // Ignore
    }
  }

  // Card Flip / Swoosh
  playCardFlip() {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  // Pass (Safe card)
  playPass() {
    if (!this.isEnabled()) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [659.25, 880]; // E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundManager();
