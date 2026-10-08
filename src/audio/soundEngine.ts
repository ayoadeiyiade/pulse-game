export type RewardTierType = 'STANDARD' | 'SUPER' | 'JACKPOT' | 'OVERDRIVE';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private hapticsEnabled: boolean = true;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }

  public playHit(tier: RewardTierType, streak: number, isOverdriveActive: boolean = false) {
    this.initContext();
    this.triggerHaptic(tier);

    if (this.isMuted || !this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const baseFreq = 440 + Math.min(streak, 35) * 25;

    switch (tier) {
      case 'STANDARD': {
        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.95, now + 0.18);

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(baseFreq / 2, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2800, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 0.22);
        sub.stop(now + 0.22);
        break;
      }

      case 'SUPER': {
        const frequencies = [baseFreq, baseFreq * 1.2599, baseFreq * 1.5];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.015);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.35);

          const vol = 0.22 / (idx + 1);
          gain.gain.setValueAtTime(vol, now + idx * 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

          if (panner) {
            panner.pan.setValueAtTime(idx === 1 ? -0.3 : idx === 2 ? 0.3 : 0, now);
            osc.connect(gain);
            gain.connect(panner);
            panner.connect(ctx.destination);
          } else {
            osc.connect(gain);
            gain.connect(ctx.destination);
          }

          osc.start(now + idx * 0.015);
          osc.stop(now + 0.4);
        });
        break;
      }

      case 'JACKPOT': {
        const root = baseFreq * 0.75;
        const notes = [root, root * 1.25, root * 1.5, root * 2.0, root * 2.5];

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = i * 0.04;

          osc.type = i === notes.length - 1 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + delay);

          gain.gain.setValueAtTime(0.24, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.5);
        });

        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(110, now);
        sub.frequency.exponentialRampToValueAtTime(45, now + 0.3);
        subGain.gain.setValueAtTime(0.4, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now);
        sub.stop(now + 0.35);
        break;
      }

      case 'OVERDRIVE': {
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sawtooth';
        sub.frequency.setValueAtTime(220, now);
        sub.frequency.exponentialRampToValueAtTime(40, now + 0.6);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.6);

        subGain.gain.setValueAtTime(0.45, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        sub.connect(filter);
        filter.connect(subGain);
        subGain.connect(ctx.destination);

        sub.start(now);
        sub.stop(now + 0.6);

        [1, 1.25, 1.5, 1.875, 2.0, 2.5, 3.0].forEach((ratio, idx) => {
          const chirp = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          const t = now + idx * 0.035;

          chirp.type = 'sine';
          chirp.frequency.setValueAtTime(baseFreq * ratio, t);
          chirpGain.gain.setValueAtTime(0.18, t);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

          chirp.connect(chirpGain);
          chirpGain.connect(ctx.destination);

          chirp.start(t);
          chirp.stop(t + 0.32);
        });
        break;
      }
    }

    if (isOverdriveActive && tier !== 'OVERDRIVE') {
      const goldChirp = ctx.createOscillator();
      const goldGain = ctx.createGain();
      goldChirp.type = 'sine';
      goldChirp.frequency.setValueAtTime(baseFreq * 2, now);
      goldGain.gain.setValueAtTime(0.15, now);
      goldGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      goldChirp.connect(goldGain);
      goldGain.connect(ctx.destination);
      goldChirp.start(now);
      goldChirp.stop(now + 0.16);
    }
  }

  public playMiss() {
    this.initContext();
    this.triggerHaptic('MISS');

    if (this.isMuted || !this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  public playStartTick() {
    this.initContext();
    if (this.isMuted || !this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  private triggerHaptic(tier: RewardTierType | 'MISS') {
    if (!this.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      switch (tier) {
        case 'STANDARD': navigator.vibrate(20); break;
        case 'SUPER': navigator.vibrate(45); break;
        case 'JACKPOT': navigator.vibrate([50, 40, 80]); break;
        case 'OVERDRIVE': navigator.vibrate([60, 30, 60, 30, 100]); break;
        case 'MISS': navigator.vibrate(70); break;
      }
    } catch {
      // Ignore vibration error
    }
  }
}

export const soundEngine = new SoundEngine();
