/**
 * Curated HTML5 Audio Preview Loops Engine
 * Replaces synthetic Web Audio bleeps with real HTML5 audio playback
 * of proprietary AI-generated instrumental tracks hosted in /public/audio/.
 */

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  file: string;
  durationLabel: string;
  bandcampUrl: string;
  spotifyUrl: string;
}

export const CURATED_TRACKS: AudioTrack[] = [
  {
    id: 'peace-like-a-river',
    title: 'Peace Like a River',
    subtitle: 'Acoustic Guitar & Gentle Strings',
    file: '/audio/peace-like-a-river.mp3',
    durationLabel: 'Preview Loop · 24s',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://spotify.com',
  },
  {
    id: 'morning-light',
    title: 'Morning Light',
    subtitle: 'Warm Hearth Piano & Chords',
    file: '/audio/morning-light.mp3',
    durationLabel: 'Preview Loop · 24s',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://spotify.com',
  },
  {
    id: 'hearthside-fireside',
    title: 'Hearthside Fireside',
    subtitle: 'Cozy Fireside Instrumental',
    file: '/audio/hearthside-fireside.mp3',
    durationLabel: 'Preview Loop · 24s',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://spotify.com',
  },
  {
    id: 'mountain-whispers',
    title: 'Mountain Whispers',
    subtitle: 'Ambient Harp & Cello',
    file: '/audio/mountain-whispers.mp3',
    durationLabel: 'Preview Loop · 24s',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://spotify.com',
  },
];

type StateListener = (state: {
  isPlaying: boolean;
  currentTrack: AudioTrack;
  volume: number;
}) => void;

class CuratedAudioManager {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrackIndex = 0;
  private isPlayingState = false;
  private volumeLevel = 0.65;
  private listeners: Set<StateListener> = new Set();
  private chimeCtx: AudioContext | null = null;

  constructor() {
    // Lazy-init on first user gesture
  }

  private initAudio() {
    if (!this.audioElement && typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.volume = this.volumeLevel;
      this.audioElement.src = CURATED_TRACKS[this.currentTrackIndex].file;

      this.audioElement.addEventListener('play', () => {
        this.isPlayingState = true;
        this.notify();
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlayingState = false;
        this.notify();
      });

      this.audioElement.addEventListener('error', (e) => {
        console.warn('Audio playback notice:', e);
      });
    }
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public getState() {
    return {
      isPlaying: this.isPlayingState,
      currentTrack: CURATED_TRACKS[this.currentTrackIndex],
      volume: this.volumeLevel,
    };
  }

  public async play(trackId?: string) {
    this.initAudio();
    if (!this.audioElement) return;

    if (trackId) {
      const idx = CURATED_TRACKS.findIndex((t) => t.id === trackId);
      if (idx !== -1 && idx !== this.currentTrackIndex) {
        this.currentTrackIndex = idx;
        this.audioElement.src = CURATED_TRACKS[idx].file;
      }
    }

    try {
      await this.audioElement.play();
      this.isPlayingState = true;
      this.notify();
    } catch (err) {
      console.warn('Audio autoplay requires user interaction:', err);
    }
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.isPlayingState = false;
      this.notify();
    }
  }

  public togglePlay() {
    if (this.isPlayingState) {
      this.pause();
    } else {
      this.play();
    }
  }

  public stop() {
    this.pause();
  }

  public nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % CURATED_TRACKS.length;
    this.currentTrackIndex = nextIdx;
    if (this.audioElement) {
      const wasPlaying = this.isPlayingState;
      this.audioElement.src = CURATED_TRACKS[nextIdx].file;
      if (wasPlaying) {
        this.audioElement.play().catch(() => {});
      }
    }
    this.notify();
  }

  public selectTrack(trackId: string) {
    const idx = CURATED_TRACKS.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.currentTrackIndex = idx;
      if (this.audioElement) {
        const wasPlaying = this.isPlayingState;
        this.audioElement.src = CURATED_TRACKS[idx].file;
        if (wasPlaying) {
          this.audioElement.play().catch(() => {});
        }
      }
      this.notify();
    }
  }

  public setVolume(level: number) {
    this.volumeLevel = Math.max(0, Math.min(1, level));
    if (this.audioElement) {
      this.audioElement.volume = this.volumeLevel;
    }
    this.notify();
  }

  // Gentle chime for planner reminders
  public playChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.chimeCtx) {
        this.chimeCtx = new AudioCtx();
      }
      if (this.chimeCtx.state === 'suspended') {
        this.chimeCtx.resume();
      }

      const now = this.chimeCtx.currentTime;
      const osc = this.chimeCtx.createOscillator();
      const gain = this.chimeCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.chimeCtx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {
      // AudioContext unavailable
    }
  }
}

export const ambientSound = new CuratedAudioManager();
