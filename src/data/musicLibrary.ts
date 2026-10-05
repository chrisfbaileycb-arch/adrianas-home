export interface LibraryTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  previewUrl: string;
}

export const MUSIC_LIBRARY: LibraryTrack[] = [
  {
    id: 'lib-1',
    title: 'Hearthside Ember Warmth',
    artist: 'Adriana & Family',
    genre: 'Acoustic Folk',
    previewUrl: 'https://actions.google.com/sounds/v1/ambiences/fireplace.ogg',
  },
  {
    id: 'lib-2',
    title: 'Morning Linen',
    artist: 'The Mountain Haven',
    genre: 'Calm Piano',
    previewUrl: 'https://actions.google.com/sounds/v1/ambiences/forest_birds.ogg',
  },
  {
    id: 'lib-3',
    title: 'Peace Like a River',
    artist: 'Hearth Devotionals',
    genre: 'Spiritual Instrumental',
    previewUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
  },
  {
    id: 'lib-4',
    title: 'Wildflower Porch Breeze',
    artist: 'Cedar & Stone',
    genre: 'Nylon Guitar',
    previewUrl: 'https://actions.google.com/sounds/v1/water/lake_waves_shore.ogg',
  },
  {
    id: 'lib-5',
    title: 'Still Waters (Lo-Fi Devotion)',
    artist: 'Sanctuary Beats',
    genre: 'Lo-Fi Chill',
    previewUrl: 'https://actions.google.com/sounds/v1/ambiences/fireplace.ogg',
  },
  {
    id: 'lib-6',
    title: 'Golden Hour Reflections',
    artist: 'Amber Glow Trio',
    genre: 'Warm Strings',
    previewUrl: 'https://actions.google.com/sounds/v1/ambiences/forest_birds.ogg',
  },
  {
    id: 'lib-7',
    title: 'Resting Place',
    artist: 'Sovereign Haven',
    genre: 'Ambient Gentle',
    previewUrl: 'https://actions.google.com/sounds/v1/weather/rain_heavy.ogg',
  },
  {
    id: 'lib-8',
    title: 'Sunday Morning Hymn',
    artist: 'Grace & Truth Collective',
    genre: 'Church Organ & Strings',
    previewUrl: 'https://actions.google.com/sounds/v1/water/lake_waves_shore.ogg',
  },
];
