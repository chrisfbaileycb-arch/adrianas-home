export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  bandcampUrl: string;
  spotifyUrl: string;
  previewAudioUrl: string;
}

export const CURATED_TRACKS: AudioTrack[] = [
  {
    id: 'track-1',
    title: 'Hearthside Ember Warmth',
    subtitle: 'Acoustic fingerstyle & crackling fire',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://open.spotify.com',
    previewAudioUrl: 'https://actions.google.com/sounds/v1/ambiences/fireplace.ogg',
  },
  {
    id: 'track-2',
    title: 'Peace Like a River',
    subtitle: 'Gentle piano & morning rain',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://open.spotify.com',
    previewAudioUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
  },
  {
    id: 'track-3',
    title: 'Morning Light on the Porch',
    subtitle: 'Nylon guitar & birdsong meadow',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://open.spotify.com',
    previewAudioUrl: 'https://actions.google.com/sounds/v1/ambiences/forest_birds.ogg',
  },
  {
    id: 'track-4',
    title: 'Still Waters (Lo-Fi Devotion)',
    subtitle: 'Warm vinyl crackle & muted keys',
    bandcampUrl: 'https://bandcamp.com',
    spotifyUrl: 'https://open.spotify.com',
    previewAudioUrl: 'https://actions.google.com/sounds/v1/water/lake_waves_shore.ogg',
  },
];

type AudioListener = (state: {
  isPlaying: boolean;
  currentTrack: AudioTrack;
  volume: number;
}) => void;

class AmbientSoundController {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentTrackIndex = 0;
  private volume = 0.65;
  private listeners: Set<AudioListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    const track = CURATED_TRACKS[this.currentTrackIndex];
    this.audio = new Audio(track.previewAudioUrl);
    this.audio.loop = true;
    this.audio.volume = this.volume;
  }

  private notify() {
    const state = {
      isPlaying: this.isPlaying,
      currentTrack: CURATED_TRACKS[this.currentTrackIndex],
      volume: this.volume,
    };
    this.listeners.forEach((l) => l(state));
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener({
      isPlaying: this.isPlaying,
      currentTrack: CURATED_TRACKS[this.currentTrackIndex],
      volume: this.volume,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public togglePlay() {
    if (!this.audio) this.initAudio();
    if (this.isPlaying) {
      this.audio?.pause();
      this.isPlaying = false;
    } else {
      this.audio?.play().catch(() => {});
      this.isPlaying = true;
    }
    this.notify();
  }

  public play() {
    if (!this.audio) this.initAudio();
    this.audio?.play().catch(() => {});
    this.isPlaying = true;
    this.notify();
  }

  public pause() {
    this.audio?.pause();
    this.isPlaying = false;
    this.notify();
  }

  public nextTrack() {
    this.selectTrackIndex((this.currentTrackIndex + 1) % CURATED_TRACKS.length);
  }

  public selectTrack(trackId: string) {
    const idx = CURATED_TRACKS.findIndex((t) => t.id === trackId);
    if (idx !== -1) {
      this.selectTrackIndex(idx);
    }
  }

  private selectTrackIndex(index: number) {
    const wasPlaying = this.isPlaying;
    if (this.audio) {
      this.audio.pause();
    }
    this.currentTrackIndex = index;
    const track = CURATED_TRACKS[this.currentTrackIndex];
    this.audio = new Audio(track.previewAudioUrl);
    this.audio.loop = true;
    this.audio.volume = this.volume;
    if (wasPlaying) {
      this.audio.play().catch(() => {});
      this.isPlaying = true;
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.notify();
  }
}

export const ambientSound = new AmbientSoundController();
