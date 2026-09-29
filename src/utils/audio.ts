/**
 * Procedural Web Audio Ambient Sound Generator
 * Generates cozy fireplace crackle and gentle rain purely in browser with Web Audio API.
 * No external audio files or network requests required.
 */

class AmbientSoundManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentSound: 'hearth' | 'rain' | 'off' = 'off';
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private nodes: AudioNode[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(type: 'hearth' | 'rain') {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentSound = type;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 1.2);
    this.masterGain.connect(this.ctx.destination);

    if (type === 'hearth') {
      this.startHearth();
    } else {
      this.startRain();
    }
  }

  public stop() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          this.cleanupNodes();
        }, 500);
      } catch {
        this.cleanupNodes();
      }
    } else {
      this.cleanupNodes();
    }

    this.isPlaying = false;
    this.currentSound = 'off';
  }

  private cleanupNodes() {
    this.nodes.forEach(node => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // ignore
      }
    });
    this.nodes = [];
  }

  private createNoiseBuffer(duration = 2): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise approximation
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  private startHearth() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Low warm roar (filtered rumble of the flames)
    const noiseBuffer = this.createNoiseBuffer(3);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(260, this.ctx.currentTime);
    lowpass.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const roarGain = this.ctx.createGain();
    roarGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(roarGain);
    roarGain.connect(this.masterGain);

    noiseSource.start();
    this.nodes.push(noiseSource, lowpass, roarGain);

    // 2. Fireplace crackles & pops
    const triggerCrackle = () => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;

      const osc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200 + Math.random() * 1800, this.ctx.currentTime);
      filter.Q.setValueAtTime(4, this.ctx.currentTime);

      const popTime = this.ctx.currentTime;
      const duration = 0.02 + Math.random() * 0.04;
      const volume = 0.05 + Math.random() * 0.25;

      popGain.gain.setValueAtTime(0.001, popTime);
      popGain.gain.linearRampToValueAtTime(volume, popTime + 0.005);
      popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + duration);

      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(80 + Math.random() * 200, popTime);

      osc.connect(filter);
      filter.connect(popGain);
      popGain.connect(this.masterGain);

      osc.start(popTime);
      osc.stop(popTime + duration);
    };

    this.timerId = window.setInterval(() => {
      if (Math.random() > 0.3) {
        triggerCrackle();
      }
      if (Math.random() > 0.7) {
        setTimeout(triggerCrackle, 80 + Math.random() * 120);
      }
    }, 180);
  }

  private startRain() {
    if (!this.ctx || !this.masterGain) return;

    const noiseBuffer = this.createNoiseBuffer(3);
    if (!noiseBuffer) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(850, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noiseSource.connect(bandpass);
    bandpass.connect(rainGain);
    rainGain.connect(this.masterGain);

    noiseSource.start();
    this.nodes.push(noiseSource, bandpass, rainGain);
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentSound: this.currentSound,
    };
  }

  public playChime() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  }
}

export const ambientSound = new AmbientSoundManager();
